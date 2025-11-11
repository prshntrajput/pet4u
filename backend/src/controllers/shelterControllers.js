const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, shelters } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, sql } = require('drizzle-orm');

const shelterController = {
  // Create shelter profile
  createShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      // Check if user role is shelter
      const userResult = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      if (userResult[0].role !== 'shelter') {
        return res.status(403).json({
          success: false,
          message: 'Only shelter accounts can create shelter profiles',
          requestId
        });
      }

      // Check if shelter profile already exists
      const existingShelter = await db
        .select()
        .from(shelters)
        .where(eq(shelters.userId, userId))
        .limit(1);

      if (existingShelter.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Shelter profile already exists',
          requestId
        });
      }

      const {
        organizationName,
        registrationNumber,
        licenseNumber,
        website,
        description,
        establishedYear,
        capacity
      } = req.body;

      // Create shelter profile
      const shelterId = createId();
      const newShelter = await db
        .insert(shelters)
        .values({
          id: shelterId,
          userId,
          organizationName: organizationName.trim(),
          registrationNumber: registrationNumber || null,
          licenseNumber: licenseNumber || null,
          website: website || null,
          description: description || null,
          establishedYear: establishedYear || null,
          capacity: capacity || null,
          currentPetCount: 0,
          documentsVerified: false,
          verificationStatus: 'pending',
          averageRating: '0.00',
          totalReviews: 0
        })
        .returning();

      logger.info('Shelter profile created successfully', {
        userId,
        shelterId,
        requestId
      });

      res.status(201).json({
        success: true,
        message: 'Shelter profile created successfully',
        data: {
          shelter: newShelter[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Create shelter profile error:', {
        error: error.message,
        userId,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to create shelter profile',
        requestId
      });
    }
  },

  // Get shelter profile
  getShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const shelterResult = await db
        .select()
        .from(shelters)
        .where(eq(shelters.userId, userId))
        .limit(1);

      if (shelterResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shelter profile not found',
          requestId
        });
      }

      logger.info('Shelter profile fetched successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Shelter profile fetched successfully',
        data: {
          shelter: shelterResult[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Get shelter profile error:', {
        error: error.message,
        userId,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shelter profile',
        requestId
      });
    }
  },

  // Update shelter profile
  updateShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      // Check if shelter profile exists
      const existingShelter = await db
        .select()
        .from(shelters)
        .where(eq(shelters.userId, userId))
        .limit(1);

      if (existingShelter.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shelter profile not found',
          requestId
        });
      }

      const {
        organizationName,
        registrationNumber,
        licenseNumber,
        website,
        description,
        establishedYear,
        capacity,
        currentPetCount
      } = req.body;

      // Build update object
      const updateData = {
        updatedAt: new Date()
      };

      if (organizationName !== undefined) updateData.organizationName = organizationName.trim();
      if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber || null;
      if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber || null;
      if (website !== undefined) updateData.website = website || null;
      if (description !== undefined) updateData.description = description || null;
      if (establishedYear !== undefined) updateData.establishedYear = establishedYear || null;
      if (capacity !== undefined) updateData.capacity = capacity || null;
      if (currentPetCount !== undefined) updateData.currentPetCount = currentPetCount;

      // Update shelter profile
      const updatedShelter = await db
        .update(shelters)
        .set(updateData)
        .where(eq(shelters.userId, userId))
        .returning();

      logger.info('Shelter profile updated successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Shelter profile updated successfully',
        data: {
          shelter: updatedShelter[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Update shelter profile error:', {
        error: error.message,
        userId,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to update shelter profile',
        requestId
      });
    }
  },

  // Get shelter by ID (public)
  getShelterById: async (req, res) => {
    const requestId = req.requestId;
    const { shelterId } = req.params;

    try {
      // Get shelter with user information
      const shelterResult = await db
        .select({
          shelter: shelters,
          user: {
            name: users.name,
            email: users.email,
            profileImage: users.profileImage,
            city: users.city,
            state: users.state,
            country: users.country,
            createdAt: users.createdAt
          }
        })
        .from(shelters)
        .innerJoin(users, eq(shelters.userId, users.id))
        .where(eq(shelters.id, shelterId))
        .limit(1);

      if (shelterResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shelter not found',
          requestId
        });
      }

      const result = shelterResult[0];

      res.status(200).json({
        success: true,
        message: 'Shelter fetched successfully',
        data: {
          id: result.shelter.id,
          organizationName: result.shelter.organizationName,
          description: result.shelter.description,
          website: result.shelter.website,
          establishedYear: result.shelter.establishedYear,
          capacity: result.shelter.capacity,
          currentPetCount: result.shelter.currentPetCount,
          averageRating: result.shelter.averageRating,
          totalReviews: result.shelter.totalReviews,
          verificationStatus: result.shelter.verificationStatus,
          createdAt: result.shelter.createdAt,
          user: result.user
        },
        requestId
      });

    } catch (error) {
      logger.error('Get shelter by ID error:', {
        error: error.message,
        shelterId,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shelter',
        requestId
      });
    }
  },

  // Get all shelters (public with pagination)
  getAllShelters: async (req, res) => {
    const requestId = req.requestId;

    try {
      const {
        page = 1,
        limit = 10,
        city,
        state,
        verified,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where conditions
      let whereConditions = eq(users.isActive, true);
      
      if (city) {
        whereConditions = and(whereConditions, eq(users.city, city));
      }
      
      if (state) {
        whereConditions = and(whereConditions, eq(users.state, state));
      }
      
      if (verified === 'true') {
        whereConditions = and(whereConditions, eq(shelters.verificationStatus, 'approved'));
      }

      // Get shelters with pagination
      const sheltersResult = await db
        .select({
          shelter: shelters,
          user: {
            name: users.name,
            profileImage: users.profileImage,
            city: users.city,
            state: users.state,
            country: users.country
          }
        })
        .from(shelters)
        .innerJoin(users, eq(shelters.userId, users.id))
        .where(whereConditions)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(
          order === 'desc' 
            ? sql`${shelters[sortBy]} DESC` 
            : sql`${shelters[sortBy]} ASC`
        );

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(shelters)
        .innerJoin(users, eq(shelters.userId, users.id))
        .where(whereConditions);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Shelters fetched successfully',
        data: {
          shelters: sheltersResult.map(item => ({
            id: item.shelter.id,
            organizationName: item.shelter.organizationName,
            description: item.shelter.description?.substring(0, 200),
            city: item.user.city,
            state: item.user.state,
            averageRating: item.shelter.averageRating,
            totalReviews: item.shelter.totalReviews,
            verificationStatus: item.shelter.verificationStatus,
            profileImage: item.user.profileImage
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get all shelters error:', {
        error: error.message,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shelters',
        requestId
      });
    }
  },

  // Delete shelter profile
  deleteShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      // Check if shelter has any pets
      // TODO: Add check for active pets when pet module is implemented

      // Delete shelter profile
      const deletedShelter = await db
        .delete(shelters)
        .where(eq(shelters.userId, userId))
        .returning();

      if (deletedShelter.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shelter profile not found',
          requestId
        });
      }

      logger.info('Shelter profile deleted successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Shelter profile deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete shelter profile error:', {
        error: error.message,
        userId,
        requestId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to delete shelter profile',
        requestId
      });
    }
  }
};

module.exports = shelterController;
