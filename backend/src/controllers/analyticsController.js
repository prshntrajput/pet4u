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

      const redis = getRedisClient();
      const cacheKey = `analytics:shelter:${shelterId}:${dateRange}`;

      if (redis) {
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return res.status(200).json({ success: true, data: JSON.parse(cached), requestId, cached: true });
          }
        } catch (cacheErr) {
          logger.warn('Analytics cache read failed, proceeding without cache', { err: cacheErr.message });
        }
      }

      const analytics = await analyticsService.getShelterAnalytics(shelterId, parseInt(dateRange));

      if (redis) {
        try {
          await redis.setEx(cacheKey, 600, JSON.stringify(analytics));
        } catch (cacheErr) {
          logger.warn('Analytics cache write failed', { err: cacheErr.message });
        }
      }

      res.status(200).json({ success: true, message: 'Analytics fetched successfully', data: analytics, requestId, cached: false });

    } catch (error) {
      logger.error('Get shelter analytics error:', { err: error, shelterId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch analytics', requestId });
    }
  },

  // Get pet metrics
  getPetMetrics: async (req, res) => {
    const requestId = req.requestId;
    const { petId } = req.params;
    const userId = req.user.userId;

    try {
      const redis = getRedisClient();
      const cacheKey = `analytics:pet:${petId}`;

      if (redis) {
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return res.status(200).json({ success: true, data: JSON.parse(cached), requestId, cached: true });
          }
        } catch (cacheErr) {
          logger.warn('Pet metrics cache read failed, proceeding without cache', { err: cacheErr.message });
        }
      }

      const metrics = await analyticsService.getPetMetrics(petId);

      if (redis) {
        try {
          await redis.setEx(cacheKey, 300, JSON.stringify(metrics));
        } catch (cacheErr) {
          logger.warn('Pet metrics cache write failed', { err: cacheErr.message });
        }
      }

      res.status(200).json({ success: true, message: 'Pet metrics fetched successfully', data: metrics, requestId, cached: false });

    } catch (error) {
      logger.error('Get pet metrics error:', { err: error, petId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch pet metrics', requestId });
    }
  },
};

module.exports = analyticsController;
