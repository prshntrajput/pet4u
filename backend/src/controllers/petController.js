const { createId } = require('@paralleldrive/cuid2');
const slugify = require('slugify');
const { db } = require('../config/database');
const { pets, petImages, users } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, sql, like, gte, lte, desc, asc } = require('drizzle-orm');
const { cloudinaryUtils } = require('../config/cloudinary');

const petController = {
  // Create new pet listing
  createPet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const petData = req.body;

      // Get user's location if pet location not provided
      let petCity = petData.city;
      let petState = petData.state;

      if (!petCity || !petState) {
        const userResult = await db
          .select({ city: users.city, state: users.state })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (userResult.length > 0) {
          petCity = petCity || userResult[0].city;
          petState = petState || userResult[0].state;
        }
      }

      // Generate slug
      const baseSlug = slugify(petData.name, { lower: true, strict: true });
      const uniqueSlug = `${baseSlug}-${createId().slice(-6)}`;

      // Create pet
      const petId = createId();
      const newPet = await db
        .insert(pets)
        .values({
          id: petId,
          ownerId: userId,
          name: petData.name.trim(),
          species: petData.species,
          breed: petData.breed || null,
          mixedBreed: petData.mixedBreed || false,
          age: petData.age || null,
          ageUnit: petData.ageUnit || 'months',
          ageEstimated: petData.ageEstimated || false,
          gender: petData.gender,
          size: petData.size || null,
          weight: petData.weight ? String(petData.weight) : null,
          color: petData.color || null,
          markings: petData.markings || null,
          isVaccinated: petData.isVaccinated || false,
          isNeutered: petData.isNeutered || false,
          isSpayed: petData.isSpayed || false,
          healthStatus: petData.healthStatus || 'healthy',
          medicalHistory: petData.medicalHistory || null,
          specialNeeds: petData.specialNeeds || null,
          goodWithKids: petData.goodWithKids,
          goodWithPets: petData.goodWithPets,
          goodWithCats: petData.goodWithCats,
          goodWithDogs: petData.goodWithDogs,
          energyLevel: petData.energyLevel || null,
          trainedLevel: petData.trainedLevel || null,
          houseTrained: petData.houseTrained || false,
          adoptionStatus: 'available',
          adoptionFee: petData.adoptionFee ? String(petData.adoptionFee) : '0',
          isUrgent: petData.isUrgent || false,
          urgentReason: petData.urgentReason || null,
          city: petCity,
          state: petState,
          country: 'India',
          description: petData.description,
          story: petData.story || null,
          slug: uniqueSlug,
          isActive: true,
          isFeatured: false,
          moderationStatus: 'approved',
          viewCount: 0,
          favoriteCount: 0,
          inquiryCount: 0,
          publishedAt: new Date(),
        })
        .returning();

      logger.info('Pet created successfully', {
        userId,
        petId,
        petName: petData.name,
        requestId
      });

      res.status(201).json({
        success: true,
        message: 'Pet listing created successfully',
        data: {
          pet: newPet[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Create pet error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to create pet listing',
        requestId
      });
    }
  },

  // Get all pets with filters
  getAllPets: async (req, res) => {
    const requestId = req.requestId;

    try {
      const {
        page = 1,
        limit = 12,
        search,
        species,
        gender,
        size,
        city,
        state,
        minAge,
        maxAge,
        ageUnit = 'months',
        goodWithKids,
        goodWithPets,
        isVaccinated,
        isNeutered,
        energyLevel,
        adoptionStatus = 'available',
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where conditions
      let conditions = [
        eq(pets.isActive, true),
        eq(pets.moderationStatus, 'approved')
      ];

      if (adoptionStatus) {
        conditions.push(eq(pets.adoptionStatus, adoptionStatus));
      }

      if (species) {
        conditions.push(eq(pets.species, species));
      }

      if (gender) {
        conditions.push(eq(pets.gender, gender));
      }

      if (size) {
        conditions.push(eq(pets.size, size));
      }

      if (city) {
        conditions.push(eq(pets.city, city));
      }

      if (state) {
        conditions.push(eq(pets.state, state));
      }

      if (energyLevel) {
        conditions.push(eq(pets.energyLevel, energyLevel));
      }

      if (goodWithKids === 'true') {
        conditions.push(eq(pets.goodWithKids, true));
      }

      if (goodWithPets === 'true') {
        conditions.push(eq(pets.goodWithPets, true));
      }

      if (isVaccinated === 'true') {
        conditions.push(eq(pets.isVaccinated, true));
      }

      if (isNeutered === 'true') {
        conditions.push(eq(pets.isNeutered, true));
      }

      // Age filtering
      if (minAge) {
        conditions.push(gte(pets.age, parseInt(minAge)));
      }

      if (maxAge) {
        conditions.push(lte(pets.age, parseInt(maxAge)));
      }

      // Search functionality
      if (search) {
        conditions.push(
          or(
            like(pets.name, `%${search}%`),
            like(pets.breed, `%${search}%`),
            like(pets.description, `%${search}%`)
          )
        );
      }

      const whereClause = and(...conditions);

      // Get pets with pagination
      const petsResult = await db
        .select({
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          age: pets.age,
          ageUnit: pets.ageUnit,
          gender: pets.gender,
          size: pets.size,
          city: pets.city,
          state: pets.state,
          primaryImage: pets.primaryImage,
          adoptionStatus: pets.adoptionStatus,
          adoptionFee: pets.adoptionFee,
          isUrgent: pets.isUrgent,
          description: pets.description,
          slug: pets.slug,
          viewCount: pets.viewCount,
          favoriteCount: pets.favoriteCount,
          createdAt: pets.createdAt,
          ownerId: pets.ownerId,
          ownerName: users.name,
          ownerRole: users.role,
        })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(
          order === 'desc' 
            ? desc(pets[sortBy])
            : asc(pets[sortBy])
        );

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      logger.info('Pets fetched successfully', {
        count: petsResult.length,
        totalCount,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Pets fetched successfully',
        data: {
          pets: petsResult,
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
      logger.error('Get all pets error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pets',
        requestId
      });
    }
  },

  // Get single pet by ID or slug
  getPetById: async (req, res) => {
    const requestId = req.requestId;
    const { petId } = req.params;
    const userId = req.user?.userId; // Optional auth

    try {
      // Try to find by ID first, then by slug
      let petResult = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (petResult.length === 0) {
        petResult = await db
          .select()
          .from(pets)
          .where(eq(pets.slug, petId))
          .limit(1);
      }

      if (petResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          requestId
        });
      }

      const pet = petResult[0];

      // Get owner information
      const ownerResult = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profileImage: users.profileImage,
          city: users.city,
          state: users.state,
        })
        .from(users)
        .where(eq(users.id, pet.ownerId))
        .limit(1);

      // Get pet images
      const images = await db
        .select()
        .from(petImages)
        .where(eq(petImages.petId, pet.id))
        .orderBy(asc(petImages.sortOrder));

      // Increment view count (only if not owner)
      if (!userId || userId !== pet.ownerId) {
        await db
          .update(pets)
          .set({ 
            viewCount: sql`${pets.viewCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(pets.id, pet.id));
      }

      logger.info('Pet fetched successfully', { petId: pet.id, requestId });

      res.status(200).json({
        success: true,
        message: 'Pet fetched successfully',
        data: {
          pet: {
            ...pet,
            owner: ownerResult[0],
            images: images
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get pet by ID error:', { error: error.message, petId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pet',
        requestId
      });
    }
  },

  // Get user's own pets
  getMyPets: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { page = 1, limit = 12, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [eq(pets.ownerId, userId)];

      if (status) {
        conditions.push(eq(pets.adoptionStatus, status));
      }

      const whereClause = and(...conditions);

      const myPets = await db
        .select()
        .from(pets)
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(pets.createdAt));

      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(pets)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'My pets fetched successfully',
        data: {
          pets: myPets,
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
      logger.error('Get my pets error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your pets',
        requestId
      });
    }
  },

  // Update pet
  updatePet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;

    try {
      // Check if pet exists and belongs to user
      const existingPet = await db
        .select()
        .from(pets)
        .where(and(
          eq(pets.id, petId),
          eq(pets.ownerId, userId)
        ))
        .limit(1);

      if (existingPet.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found or you do not have permission to edit it',
          requestId
        });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      // Convert numbers to strings for decimal fields
      if (updateData.weight) updateData.weight = String(updateData.weight);
      if (updateData.adoptionFee) updateData.adoptionFee = String(updateData.adoptionFee);

      const updatedPet = await db
        .update(pets)
        .set(updateData)
        .where(eq(pets.id, petId))
        .returning();

      logger.info('Pet updated successfully', { petId, userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Pet updated successfully',
        data: {
          pet: updatedPet[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Update pet error:', { error: error.message, petId, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to update pet',
        requestId
      });
    }
  },

  // Delete pet
  deletePet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;

    try {
      // Check if pet exists and belongs to user
      const existingPet = await db
        .select()
        .from(pets)
        .where(and(
          eq(pets.id, petId),
          eq(pets.ownerId, userId)
        ))
        .limit(1);

      if (existingPet.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found or you do not have permission to delete it',
          requestId
        });
      }

      // Get all pet images to delete from Cloudinary
      const images = await db
        .select()
        .from(petImages)
        .where(eq(petImages.petId, petId));

      // Delete images from Cloudinary
      for (const image of images) {
        try {
          if (image.cloudinaryPublicId) {
            await cloudinaryUtils.deleteImage(image.cloudinaryPublicId);
          }
        } catch (deleteError) {
          logger.warn('Failed to delete image from Cloudinary:', deleteError.message);
        }
      }

      // Delete pet (cascade will delete images from DB)
      await db
        .delete(pets)
        .where(eq(pets.id, petId));

      logger.info('Pet deleted successfully', { petId, userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Pet deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete pet error:', { error: error.message, petId, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete pet',
        requestId
      });
    }
  },

  // Upload pet images
  uploadPetImages: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;

    try {
      // Check if pet exists and belongs to user
      const existingPet = await db
        .select()
        .from(pets)
        .where(and(
          eq(pets.id, petId),
          eq(pets.ownerId, userId)
        ))
        .limit(1);

      if (existingPet.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found or you do not have permission to upload images',
          requestId
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided',
          requestId
        });
      }

      // Get current image count
      const currentImages = await db
        .select({ count: sql`count(*)` })
        .from(petImages)
        .where(eq(petImages.petId, petId));

      const currentCount = parseInt(currentImages[0].count);
      const newImages = [];

      // Insert new images
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = createId();
        
        const newImage = await db
          .insert(petImages)
          .values({
            id: imageId,
            petId: petId,
            imageUrl: file.path,
            cloudinaryPublicId: file.filename,
            isPrimary: currentCount === 0 && i === 0, // First image is primary if no images exist
            sortOrder: currentCount + i,
          })
          .returning();

        newImages.push(newImage[0]);

        // Set first image as primary image for pet if no primary image exists
        if (currentCount === 0 && i === 0) {
          await db
            .update(pets)
            .set({ 
              primaryImage: file.path,
              updatedAt: new Date()
            })
            .where(eq(pets.id, petId));
        }
      }

      logger.info('Pet images uploaded successfully', {
        petId,
        userId,
        imageCount: req.files.length,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: newImages
        },
        requestId
      });

    } catch (error) {
      logger.error('Upload pet images error:', { error: error.message, petId, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        requestId
      });
    }
  },

  // Delete pet image
  deletePetImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId, imageId } = req.params;

    try {
      // Check if pet belongs to user
      const existingPet = await db
        .select()
        .from(pets)
        .where(and(
          eq(pets.id, petId),
          eq(pets.ownerId, userId)
        ))
        .limit(1);

      if (existingPet.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found or you do not have permission',
          requestId
        });
      }

      // Get image
      const imageResult = await db
        .select()
        .from(petImages)
        .where(and(
          eq(petImages.id, imageId),
          eq(petImages.petId, petId)
        ))
        .limit(1);

      if (imageResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
          requestId
        });
      }

      const image = imageResult[0];

      // Delete from Cloudinary
      try {
        if (image.cloudinaryPublicId) {
          await cloudinaryUtils.deleteImage(image.cloudinaryPublicId);
        }
      } catch (deleteError) {
        logger.warn('Failed to delete image from Cloudinary:', deleteError.message);
      }

      // Delete from database
      await db
        .delete(petImages)
        .where(eq(petImages.id, imageId));

      // If deleted image was primary, set first remaining image as primary
      if (image.isPrimary) {
        const remainingImages = await db
          .select()
          .from(petImages)
          .where(eq(petImages.petId, petId))
          .orderBy(asc(petImages.sortOrder))
          .limit(1);

        if (remainingImages.length > 0) {
          await db
            .update(petImages)
            .set({ isPrimary: true })
            .where(eq(petImages.id, remainingImages[0].id));

          await db
            .update(pets)
            .set({ 
              primaryImage: remainingImages[0].imageUrl,
              updatedAt: new Date()
            })
            .where(eq(pets.id, petId));
        } else {
          // No images left, remove primary image
          await db
            .update(pets)
            .set({ 
              primaryImage: null,
              updatedAt: new Date()
            })
            .where(eq(pets.id, petId));
        }
      }

      logger.info('Pet image deleted successfully', { petId, imageId, userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete pet image error:', { error: error.message, petId, imageId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        requestId
      });
    }
  },
};

module.exports = petController;
