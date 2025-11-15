const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { petReviews, shelterReviews, pets, shelters, users } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, desc, sql, avg } = require('drizzle-orm');

const reviewController = {
  // Create pet review
  createPetReview: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { petId, rating, title, comment } = req.body;

      // Check if pet exists
      const petExists = await db
        .select({ id: pets.id })
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (petExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          requestId
        });
      }

      // Check if user already reviewed this pet
      const existingReview = await db
        .select()
        .from(petReviews)
        .where(and(
          eq(petReviews.petId, petId),
          eq(petReviews.userId, userId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this pet',
          requestId
        });
      }

      // Create review
      const reviewId = createId();
      const newReview = await db
        .insert(petReviews)
        .values({
          id: reviewId,
          petId,
          userId,
          rating,
          title: title || null,
          comment: comment.trim(),
          isApproved: true,
        })
        .returning();

      logger.info('Pet review created', { userId, petId, reviewId, requestId });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: {
          review: newReview[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Create pet review error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to submit review',
        requestId
      });
    }
  },

  // Get pet reviews
  getPetReviews: async (req, res) => {
    const requestId = req.requestId;
    const { petId } = req.params;

    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get reviews with user info
      const reviews = await db
        .select({
          review: petReviews,
          user: {
            id: users.id,
            name: users.name,
            profileImage: users.profileImage,
          }
        })
        .from(petReviews)
        .innerJoin(users, eq(petReviews.userId, users.id))
        .where(and(
          eq(petReviews.petId, petId),
          eq(petReviews.isApproved, true)
        ))
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(petReviews.createdAt));

      // Get total count and average rating
      const statsResult = await db
        .select({
          count: sql`count(*)`,
          avgRating: avg(petReviews.rating)
        })
        .from(petReviews)
        .where(and(
          eq(petReviews.petId, petId),
          eq(petReviews.isApproved, true)
        ));

      const totalCount = parseInt(statsResult[0].count);
      const averageRating = parseFloat(statsResult[0].avgRating || 0).toFixed(1);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: {
          reviews: reviews.map(r => ({
            ...r.review,
            user: r.user
          })),
          stats: {
            totalReviews: totalCount,
            averageRating: parseFloat(averageRating),
          },
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
      logger.error('Get pet reviews error:', { error: error.message, petId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        requestId
      });
    }
  },

  // Create shelter review
  createShelterReview: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { shelterId, rating, title, comment, communicationRating, facilityRating, processRating } = req.body;

      // Check if shelter exists
      const shelterExists = await db
        .select({ id: shelters.id })
        .from(shelters)
        .where(eq(shelters.id, shelterId))
        .limit(1);

      if (shelterExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Shelter not found',
          requestId
        });
      }

      // Check if user already reviewed this shelter
      const existingReview = await db
        .select()
        .from(shelterReviews)
        .where(and(
          eq(shelterReviews.shelterId, shelterId),
          eq(shelterReviews.userId, userId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this shelter',
          requestId
        });
      }

      // Create review
      const reviewId = createId();
      const newReview = await db
        .insert(shelterReviews)
        .values({
          id: reviewId,
          shelterId,
          userId,
          rating,
          title: title || null,
          comment: comment.trim(),
          communicationRating: communicationRating || null,
          facilityRating: facilityRating || null,
          processRating: processRating || null,
          isApproved: true,
        })
        .returning();

      // Update shelter average rating
      const avgResult = await db
        .select({
          avgRating: avg(shelterReviews.rating),
          count: sql`count(*)`
        })
        .from(shelterReviews)
        .where(and(
          eq(shelterReviews.shelterId, shelterId),
          eq(shelterReviews.isApproved, true)
        ));

      await db
        .update(shelters)
        .set({
          averageRating: String(parseFloat(avgResult[0].avgRating || 0).toFixed(2)),
          totalReviews: parseInt(avgResult[0].count),
          updatedAt: new Date()
        })
        .where(eq(shelters.id, shelterId));

      logger.info('Shelter review created', { userId, shelterId, reviewId, requestId });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: {
          review: newReview[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Create shelter review error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to submit review',
        requestId
      });
    }
  },

  // Get shelter reviews
  getShelterReviews: async (req, res) => {
    const requestId = req.requestId;
    const { shelterId } = req.params;

    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get reviews with user info
      const reviews = await db
        .select({
          review: shelterReviews,
          user: {
            id: users.id,
            name: users.name,
            profileImage: users.profileImage,
          }
        })
        .from(shelterReviews)
        .innerJoin(users, eq(shelterReviews.userId, users.id))
        .where(and(
          eq(shelterReviews.shelterId, shelterId),
          eq(shelterReviews.isApproved, true)
        ))
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(shelterReviews.createdAt));

      // Get stats
      const statsResult = await db
        .select({
          count: sql`count(*)`,
          avgRating: avg(shelterReviews.rating),
          avgComm: avg(shelterReviews.communicationRating),
          avgFacility: avg(shelterReviews.facilityRating),
          avgProcess: avg(shelterReviews.processRating),
        })
        .from(shelterReviews)
        .where(and(
          eq(shelterReviews.shelterId, shelterId),
          eq(shelterReviews.isApproved, true)
        ));

      const totalCount = parseInt(statsResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: {
          reviews: reviews.map(r => ({
            ...r.review,
            user: r.user
          })),
          stats: {
            totalReviews: totalCount,
            averageRating: parseFloat(statsResult[0].avgRating || 0).toFixed(1),
            communicationRating: parseFloat(statsResult[0].avgComm || 0).toFixed(1),
            facilityRating: parseFloat(statsResult[0].avgFacility || 0).toFixed(1),
            processRating: parseFloat(statsResult[0].avgProcess || 0).toFixed(1),
          },
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
      logger.error('Get shelter reviews error:', { error: error.message, shelterId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        requestId
      });
    }
  },

  // Delete own review
  deleteReview: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { reviewId, type } = req.params; // type: 'pet' or 'shelter'

    try {
      const table = type === 'pet' ? petReviews : shelterReviews;
      
      const deleted = await db
        .delete(table)
        .where(and(
          eq(table.id, reviewId),
          eq(table.userId, userId)
        ))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to delete it',
          requestId
        });
      }

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete review error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        requestId
      });
    }
  },
};

module.exports = reviewController;
