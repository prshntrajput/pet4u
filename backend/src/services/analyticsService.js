const { db } = require('../config/database');
const { pets, adoptionRequests, petFavorites } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, sql, gte, desc } = require('drizzle-orm');

async function safeQuery(label, fn) {
  try {
    return await fn();
  } catch (err) {
    logger.error(`Analytics query failed [${label}]: ${err.message}`, err);
    return null;
  }
}

const analyticsService = {
  getShelterAnalytics: async (shelterId, dateRange = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const [
      petsByStatusRaw,
      requestsByStatusRaw,
      totalViewsRaw,
      totalFavoritesRaw,
      mostViewedPetsRaw,
      recentRequestsRaw,
    ] = await Promise.all([
      safeQuery('petsByStatus', () =>
        db.select({ status: pets.adoptionStatus, count: sql`count(*)` })
          .from(pets)
          .where(eq(pets.ownerId, shelterId))
          .groupBy(pets.adoptionStatus)
      ),

      safeQuery('requestsByStatus', () =>
        db.select({ status: adoptionRequests.status, count: sql`count(*)` })
          .from(adoptionRequests)
          .where(eq(adoptionRequests.shelterId, shelterId))
          .groupBy(adoptionRequests.status)
      ),

      safeQuery('totalViews', () =>
        db.select({ totalViews: sql`coalesce(sum(${pets.viewCount}), 0)` })
          .from(pets)
          .where(eq(pets.ownerId, shelterId))
      ),

      safeQuery('totalFavorites', () =>
        db.select({ count: sql`count(*)` })
          .from(petFavorites)
          .innerJoin(pets, eq(petFavorites.petId, pets.id))
          .where(eq(pets.ownerId, shelterId))
      ),

      safeQuery('mostViewedPets', () =>
        db.select({
          id: pets.id,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          adoptionStatus: pets.adoptionStatus,
          viewCount: pets.viewCount,
          primaryImage: pets.primaryImage,
        })
          .from(pets)
          .where(eq(pets.ownerId, shelterId))
          .orderBy(desc(pets.viewCount))
          .limit(5)
      ),

      safeQuery('recentRequests', () =>
        db.select({ count: sql`count(*)` })
          .from(adoptionRequests)
          .where(and(
            eq(adoptionRequests.shelterId, shelterId),
            gte(adoptionRequests.createdAt, startDate)
          ))
      ),
    ]);

    const petsByStatus    = petsByStatusRaw    || [];
    const requestsByStatus= requestsByStatusRaw|| [];
    const mostViewedPets  = mostViewedPetsRaw  || [];

    const totalViews     = parseInt(totalViewsRaw?.[0]?.totalViews     || 0);
    const totalFavorites = parseInt(totalFavoritesRaw?.[0]?.count       || 0);
    const recentRequests = parseInt(recentRequestsRaw?.[0]?.count       || 0);

    return {
      overview: {
        totalPets:      petsByStatus.reduce((sum, r) => sum + parseInt(r.count), 0),
        totalRequests:  requestsByStatus.reduce((sum, r) => sum + parseInt(r.count), 0),
        totalViews,
        totalFavorites,
      },
      petsByStatus: petsByStatus.reduce((acc, r) => { acc[r.status] = parseInt(r.count); return acc; }, {}),
      requestsByStatus: requestsByStatus.reduce((acc, r) => { acc[r.status] = parseInt(r.count); return acc; }, {}),
      mostViewedPets,
      recentActivity: { requests: recentRequests },
    };
  },

  getPetMetrics: async (petId) => {
    const [petRow, requestCountRaw, favoriteCountRaw] = await Promise.all([
      safeQuery('petById', () =>
        db.select().from(pets).where(eq(pets.id, petId)).limit(1)
      ),
      safeQuery('requestCount', () =>
        db.select({ count: sql`count(*)` }).from(adoptionRequests).where(eq(adoptionRequests.petId, petId))
      ),
      safeQuery('favoriteCount', () =>
        db.select({ count: sql`count(*)` }).from(petFavorites).where(eq(petFavorites.petId, petId))
      ),
    ]);

    if (!petRow || petRow.length === 0) throw new Error('Pet not found');

    return {
      petId,
      viewCount:     petRow[0].viewCount,
      favoriteCount: parseInt(favoriteCountRaw?.[0]?.count || 0),
      requestCount:  parseInt(requestCountRaw?.[0]?.count  || 0),
      daysSinceListed: Math.floor((new Date() - new Date(petRow[0].createdAt)) / (1000 * 60 * 60 * 24)),
    };
  },
};

module.exports = analyticsService;
