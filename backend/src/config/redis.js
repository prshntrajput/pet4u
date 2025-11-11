const { createClient } = require('redis');
const { logger } = require('./logger');

// Create Redis client with your provided configuration
const createRedisClient = async () => {
  const client = createClient({
    username: 'default',
    password: 'BzQIGhWK3WJZaQ2BtWgiMfOe9PzZQOrV',
    socket: {
        host: 'redis-17810.c98.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 17810,
        family:4,
      
      // Connection retry configuration
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection attempts exceeded, giving up');
          return false;
        }
        const delay = Math.min(retries * 50, 1000);
        logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      }
    }
  });
  
  // Error handling
  client.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    logger.info('Redis client connected successfully');
  });
  
  client.on('disconnect', () => {
    logger.warn('Redis client disconnected');
  });
  
  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });
  
  try {
    await client.connect();
    
    // Test Redis connection
    await client.set('connection_test', 'success');
    const testResult = await client.get('connection_test');
    
    if (testResult === 'success') {
      logger.info('Redis connectivity test passed');
      await client.del('connection_test');
    }
    
    return client;
    
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Initialize Redis client
let redisClient;

const initializeRedis = async () => {
  redisClient = await createRedisClient();
  return redisClient;
};

// Redis utility functions for common operations
const redisUtils = {
  // Set value with optional expiration
  set: async (key, value, expireInSeconds = null) => {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      if (expireInSeconds) {
        await redisClient.setEx(key, expireInSeconds, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
      
      logger.debug(`Redis SET: ${key}`);
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  },
  
  // Get value and parse JSON if applicable
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      
      if (!value) return null;
      
      // Try to parse as JSON, return as string if fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  },
  
  // Delete key
  del: async (key) => {
    try {
      const result = await redisClient.del(key);
      logger.debug(`Redis DEL: ${key} (${result} keys deleted)`);
      return result;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  },
  
  // Check if key exists
  exists: async (key) => {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  },
  
  // Set expiration for existing key
  expire: async (key, seconds) => {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }
};

module.exports = {
  initializeRedis,
  redisUtils,
  
  // Get current client instance
  getRedisClient: () => redisClient,
  
  // Graceful shutdown
  closeRedisConnection: async () => {
    if (redisClient) {
      try {
        await redisClient.quit();
        logger.info('Redis connection closed gracefully');
      } catch (error) {
        logger.error('Error closing Redis connection:', error);
      }
    }
  }
};
