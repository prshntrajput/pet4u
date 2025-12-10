const analyticsService = require('../services/analyticsService');
const { logger } = require('../config/logger');
const { getRedisClient } = require('../config/redis');

const analyticsController = {
  // Get shelter analytics
  getShelterAnalytics: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;

    try {
      const { dateRange = 30 } = req.query;

      // Check cache
      const redis = getRedisClient();
      const cacheKey = `analytics:shelter:${shelterId}:${dateRange}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          requestId,
          cached: true,
        });
      }

      const analytics = await analyticsService.getShelterAnalytics(shelterId, parseInt(dateRange));

      // Cache for 10 minutes
      await redis.setex(cacheKey, 600, JSON.stringify(analytics));

      res.status(200).json({
        success: true,
        message: 'Analytics fetched successfully',
        data: analytics,
        requestId,
        cached: false,
      });

    } catch (error) {
      logger.error('Get shelter analytics error:', { error: error.message, shelterId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        requestId
      });
    }
  },

  // Get pet metrics
  getPetMetrics: async (req, res) => {
    const requestId = req.requestId;
    const { petId } = req.params;
    const userId = req.user.userId;

    try {
      // Check cache
      const redis = getRedisClient();
      const cacheKey = `analytics:pet:${petId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cached),
          requestId,
          cached: true,
        });
      }

      const metrics = await analyticsService.getPetMetrics(petId);

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(metrics));

      res.status(200).json({
        success: true,
        message: 'Pet metrics fetched successfully',
        data: metrics,
        requestId,
        cached: false,
      });

    } catch (error) {
      logger.error('Get pet metrics error:', { error: error.message, petId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pet metrics',
        requestId
      });
    }
  },
};

module.exports = analyticsController;
