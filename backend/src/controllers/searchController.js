const searchService = require('../services/searchService');
const { logger } = require('../config/logger');
const { getRedisClient } = require('../config/redis');

const searchController = {
  // Advanced search
  advancedSearch: async (req, res) => {
    const requestId = req.requestId;

    try {
      const filters = req.query;

      // Create cache key
      const cacheKey = `search:${JSON.stringify(filters)}`;
      const redis = getRedisClient();

      // Check cache
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Returning cached search results', { requestId });
        return res.status(200).json({
          success: true,
          message: 'Search results fetched from cache',
          data: JSON.parse(cachedResult),
          requestId,
          cached: true,
        });
      }

      // Perform search
      const results = await searchService.advancedPetSearch(filters);

      // Cache results for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(results));

      logger.info('Advanced search completed', { 
        totalResults: results.pagination.totalCount, 
        requestId 
      });

      res.status(200).json({
        success: true,
        message: 'Search results fetched successfully',
        data: results,
        requestId,
        cached: false,
      });

    } catch (error) {
      logger.error('Advanced search error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to perform search',
        requestId
      });
    }
  },

  // Get search suggestions
  getSuggestions: async (req, res) => {
    const requestId = req.requestId;
    const { q } = req.query;

    try {
      if (!q || q.length < 2) {
        return res.status(200).json({
          success: true,
          data: { suggestions: [] },
          requestId
        });
      }

      const suggestions = await searchService.getSearchSuggestions(q);

      res.status(200).json({
        success: true,
        data: { suggestions },
        requestId
      });

    } catch (error) {
      logger.error('Get suggestions error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to get suggestions',
        requestId
      });
    }
  },

  // Get popular searches
  getPopularSearches: async (req, res) => {
    const requestId = req.requestId;

    try {
      const redis = getRedisClient();
      const cacheKey = 'popular_searches';

      // Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          data: { searches: JSON.parse(cached) },
          requestId,
          cached: true,
        });
      }

      const searches = await searchService.getPopularSearches();

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(searches));

      res.status(200).json({
        success: true,
        data: { searches },
        requestId,
        cached: false,
      });

    } catch (error) {
      logger.error('Get popular searches error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to get popular searches',
        requestId
      });
    }
  },
};

module.exports = searchController;
