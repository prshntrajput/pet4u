const { db } = require('../config/database');
const { pets, adoptionRequests, petFavorites, messages } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, sql, gte, lte, count } = require('drizzle-orm');

const analyticsService = {
  // Get shelter analytics
  getShelterAnalytics: async (shelterId, dateRange = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Total pets by status
      const petsByStatus = await db
        .select({
          status: pets.adoptionStatus,
          count: sql`count(*)`,
        })
        .from(pets)
        .where(eq(pets.ownerId, shelterId))
        .groupBy(pets.adoptionStatus);

      // Total requests by status
      const requestsByStatus = await db
        .select({
          status: adoptionRequests.status,
          count: sql`count(*)`,
        })
        .from(adoptionRequests)
        .where(eq(adoptionRequests.shelterId, shelterId))
        .groupBy(adoptionRequests.status);

      // Total views
      const totalViewsResult = await db
        .select({
          totalViews: sql`sum(${pets.viewCount})`,
        })
        .from(pets)
        .where(eq(pets.ownerId, shelterId));

      // Total favorites
      const totalFavoritesResult = await db
        .select({
          count: sql`count(*)`,
        })
        .from(petFavorites)
        .innerJoin(pets, eq(petFavorites.petId, pets.id))
        .where(eq(pets.ownerId, shelterId));

      // Most viewed pets
      const mostViewedPets = await db
        .select()
        .from(pets)
        .where(eq(pets.ownerId, shelterId))
        .orderBy(sql`${pets.viewCount} DESC`)
        .limit(5);

      // Recent activity (last 30 days)
      const recentRequests = await db
        .select({ count: sql`count(*)` })
        .from(adoptionRequests)
        .where(and(
          eq(adoptionRequests.shelterId, shelterId),
          gte(adoptionRequests.createdAt, startDate)
        ));

      return {
        overview: {
          totalPets: petsByStatus.reduce((sum, item) => sum + parseInt(item.count), 0),
          totalRequests: requestsByStatus.reduce((sum, item) => sum + parseInt(item.count), 0),
          totalViews: parseInt(totalViewsResult[0]?.totalViews || 0),
          totalFavorites: parseInt(totalFavoritesResult[0]?.count || 0),
        },
        petsByStatus: petsByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        requestsByStatus: requestsByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        mostViewedPets,
        recentActivity: {
          requests: parseInt(recentRequests[0]?.count || 0),
        }
      };

    } catch (error) {
      logger.error('Get shelter analytics error:', error);
      throw error;
    }
  },

  // Get pet performance metrics
  getPetMetrics: async (petId) => {
    try {
      const pet = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (pet.length === 0) {
        throw new Error('Pet not found');
      }

      const requestCount = await db
        .select({ count: sql`count(*)` })
        .from(adoptionRequests)
        .where(eq(adoptionRequests.petId, petId));

      const favoriteCount = await db
        .select({ count: sql`count(*)` })
        .from(petFavorites)
        .where(eq(petFavorites.petId, petId));

      return {
        petId,
        viewCount: pet[0].viewCount,
        favoriteCount: parseInt(favoriteCount[0].count),
        requestCount: parseInt(requestCount[0].count),
        daysSinceListed: Math.floor((new Date() - new Date(pet[0].createdAt)) / (1000 * 60 * 60 * 24)),
      };

    } catch (error) {
      logger.error('Get pet metrics error:', error);
      throw error;
    }
  },
};

module.exports = analyticsService;
