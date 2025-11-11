const jwt = require('jsonwebtoken');
const { redisUtils } = require('../config/redis');
const { logger } = require('../config/logger');

// JWT utility functions with Redis integration
const jwtUtils = {
  // Generate access token (short-lived)
  generateAccessToken: (payload) => {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: '15m', // 15 minutes for security
        issuer: 'pet4u-api',
        audience: 'pet4u-client'
      }
    );
  },

  // Generate refresh token (long-lived)
  generateRefreshToken: (payload) => {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: '30d', // 30 days
        issuer: 'pet4u-api',
        audience: 'pet4u-client'
      }
    );
  },

  // Verify access token
  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'pet4u-api',
        audience: 'pet4u-client'
      });
    } catch (error) {
      logger.debug('Access token verification failed:', error.message);
      return null;
    }
  },

  // Verify refresh token
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'pet4u-api',
        audience: 'pet4u-client'
      });
    } catch (error) {
      logger.debug('Refresh token verification failed:', error.message);
      return null;
    }
  },

  // Store refresh token in Redis
  storeRefreshToken: async (userId, token, deviceInfo = {}) => {
    try {
      const tokenData = {
        userId,
        token,
        deviceInfo,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      // Store with 30-day expiration
      const key = `refresh_token:${userId}:${token.slice(-10)}`;
      await redisUtils.set(key, tokenData, 30 * 24 * 60 * 60); // 30 days in seconds
      
      // Also maintain a list of active tokens for this user
      const userTokensKey = `user_tokens:${userId}`;
      const existingTokens = await redisUtils.get(userTokensKey) || [];
      existingTokens.push(token.slice(-10));
      
      // Keep only last 5 tokens per user
      if (existingTokens.length > 5) {
        const removedToken = existingTokens.shift();
        await redisUtils.del(`refresh_token:${userId}:${removedToken}`);
      }
      
      await redisUtils.set(userTokensKey, existingTokens, 30 * 24 * 60 * 60);
      
      logger.debug(`Refresh token stored for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error storing refresh token:', error);
      return false;
    }
  },

  // Get refresh token from Redis
  getRefreshToken: async (userId, tokenSuffix) => {
    try {
      const key = `refresh_token:${userId}:${tokenSuffix}`;
      const tokenData = await redisUtils.get(key);
      
      if (tokenData) {
        // Update last used time
        tokenData.lastUsed = new Date().toISOString();
        await redisUtils.set(key, tokenData, 30 * 24 * 60 * 60);
      }
      
      return tokenData;
    } catch (error) {
      logger.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Remove refresh token from Redis
  removeRefreshToken: async (userId, token) => {
    try {
      const tokenSuffix = token.slice(-10);
      const key = `refresh_token:${userId}:${tokenSuffix}`;
      
      await redisUtils.del(key);
      
      // Also remove from user's token list
      const userTokensKey = `user_tokens:${userId}`;
      const existingTokens = await redisUtils.get(userTokensKey) || [];
      const updatedTokens = existingTokens.filter(t => t !== tokenSuffix);
      
      if (updatedTokens.length > 0) {
        await redisUtils.set(userTokensKey, updatedTokens, 30 * 24 * 60 * 60);
      } else {
        await redisUtils.del(userTokensKey);
      }
      
      logger.debug(`Refresh token removed for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error removing refresh token:', error);
      return false;
    }
  },

  // Remove all refresh tokens for a user (logout from all devices)
  removeAllRefreshTokens: async (userId) => {
    try {
      const userTokensKey = `user_tokens:${userId}`;
      const existingTokens = await redisUtils.get(userTokensKey) || [];
      
      // Remove all individual token entries
      for (const tokenSuffix of existingTokens) {
        await redisUtils.del(`refresh_token:${userId}:${tokenSuffix}`);
      }
      
      // Remove the user's token list
      await redisUtils.del(userTokensKey);
      
      logger.info(`All refresh tokens removed for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error removing all refresh tokens:', error);
      return false;
    }
  },

  // Store access token blacklist (for immediate logout)
  blacklistAccessToken: async (token, expiresIn = 900) => { // 15 minutes default
    try {
      const key = `blacklisted_token:${token.slice(-10)}`;
      await redisUtils.set(key, { blacklisted: true }, expiresIn);
      return true;
    } catch (error) {
      logger.error('Error blacklisting access token:', error);
      return false;
    }
  },

  // Check if access token is blacklisted
  isTokenBlacklisted: async (token) => {
    try {
      const key = `blacklisted_token:${token.slice(-10)}`;
      const result = await redisUtils.get(key);
      return !!result;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      return false;
    }
  }
};

module.exports = jwtUtils;
