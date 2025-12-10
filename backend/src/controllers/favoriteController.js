const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { petFavorites, pets, users } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, desc, sql } = require('drizzle-orm');

const favoriteController = {
  // Add pet to favorites
  addFavorite: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { petId } = req.body;

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

      // Check if already favorited
      const existingFavorite = await db
        .select()
        .from(petFavorites)
        .where(and(
          eq(petFavorites.userId, userId),
          eq(petFavorites.petId, petId)
        ))
        .limit(1);

      if (existingFavorite.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Pet is already in your favorites',
          requestId
        });
      }

      // Add to favorites
      const favoriteId = createId();
      const newFavorite = await db
        .insert(petFavorites)
        .values({
          id: favoriteId,
          userId,
          petId,
        })
        .returning();

      // Update pet favorite count
      await db
        .update(pets)
        .set({
          favoriteCount: sql`${pets.favoriteCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(pets.id, petId));

      logger.info('Pet added to favorites', { userId, petId, requestId });

      res.status(201).json({
        success: true,
        message: 'Pet added to favorites',
        data: {
          favorite: newFavorite[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Add favorite error:', { 
        error: error.message, 
        stack: error.stack,
        userId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to add pet to favorites',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // Remove pet from favorites
  removeFavorite: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;

    try {
      // Remove from favorites
      const deleted = await db
        .delete(petFavorites)
        .where(and(
          eq(petFavorites.userId, userId),
          eq(petFavorites.petId, petId)
        ))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found',
          requestId
        });
      }

      // Update pet favorite count
      await db
        .update(pets)
        .set({
          favoriteCount: sql`${pets.favoriteCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(pets.id, petId));

      logger.info('Pet removed from favorites', { userId, petId, requestId });

      res.status(200).json({
        success: true,
        message: 'Pet removed from favorites',
        requestId
      });

    } catch (error) {
      logger.error('Remove favorite error:', { 
        error: error.message,
        stack: error.stack,
        userId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to remove pet from favorites',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // Get user's favorites
  getFavorites: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { page = 1, limit = 12 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get favorites with pet details
      const favorites = await db
        .select({
          favorite: petFavorites,
          pet: pets,
          owner: {
            id: users.id,
            name: users.name,
            role: users.role,
            profileImage: users.profileImage,
          }
        })
        .from(petFavorites)
        .innerJoin(pets, eq(petFavorites.petId, pets.id))
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(eq(petFavorites.userId, userId))
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(petFavorites.createdAt));

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(petFavorites)
        .where(eq(petFavorites.userId, userId));

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Favorites fetched successfully',
        data: {
          favorites: favorites.map(f => ({
            ...f.pet,
            owner: f.owner,
            favoritedAt: f.favorite.createdAt,
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
      logger.error('Get favorites error:', { 
        error: error.message,
        stack: error.stack,
        userId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorites',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // ✅ Get favorited pet IDs only (lightweight for checks)
  getFavoritedPetIds: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const favoritedPets = await db
        .select({ petId: petFavorites.petId })
        .from(petFavorites)
        .where(eq(petFavorites.userId, userId));

      const petIds = favoritedPets.map(f => f.petId);

      res.status(200).json({
        success: true,
        message: 'Favorited pet IDs fetched successfully',
        data: {
          petIds,
          count: petIds.length
        },
        requestId
      });

    } catch (error) {
      logger.error('Get favorited pet IDs error:', { 
        error: error.message,
        stack: error.stack,
        userId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorited pet IDs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // Check if pet is favorited
  checkFavorite: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;

    try {
      const favorite = await db
        .select()
        .from(petFavorites)
        .where(and(
          eq(petFavorites.userId, userId),
          eq(petFavorites.petId, petId)
        ))
        .limit(1);

      res.status(200).json({
        success: true,
        message: 'Favorite status checked',
        data: {
          isFavorited: favorite.length > 0
        },
        requestId
      });

    } catch (error) {
      logger.error('Check favorite error:', { 
        error: error.message,
        stack: error.stack,
        userId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to check favorite status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },
};

module.exports = favoriteController;
