// src/config/redis.js
const { createClient } = require('redis');
const { logger } = require('./logger');

let redisClient = null;

// Create Redis client with your cloud configuration
const createRedisClient = async () => {
  const client = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || 'BzQIGhWK3WJZaQ2BtWgiMfOe9PzZQOrV',
    socket: {
      host: process.env.REDIS_HOST || 'redis-17810.c98.us-east-1-4.ec2.redns.redis-cloud.com',
      port: parseInt(process.env.REDIS_PORT) || 17810,
      family: 4,
      
      // Connection retry configuration
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection attempts exceeded, giving up');
          return false;
        }
        const delay = Math.min(retries * 50, 2000);
        logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      },
      
      // Connection timeout
      connectTimeout: 10000,
    },
    
    // Retry configuration
    commandsQueueMaxLength: 1000,
    disableOfflineQueue: false,
  });
  
  // Event handlers
  client.on('error', (err) => {
    logger.error('❌ Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    logger.info('🔄 Redis client connecting...');
  });
  
  client.on('ready', () => {
    logger.info('✅ Redis client connected and ready');
  });
  
  client.on('disconnect', () => {
    logger.warn('⚠️ Redis client disconnected');
  });
  
  client.on('reconnecting', () => {
    logger.info('🔄 Redis client reconnecting...');
  });
  
  client.on('end', () => {
    logger.info('🔚 Redis connection ended');
  });
  
  try {
    await client.connect();
    
    // Test Redis connection
    await client.set('connection_test', 'success', { EX: 10 });
    const testResult = await client.get('connection_test');
    
    if (testResult === 'success') {
      logger.info('✅ Redis connectivity test passed');
      await client.del('connection_test');
    } else {
      throw new Error('Redis connectivity test failed');
    }
    
    return client;
    
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Initialize Redis client
const initializeRedis = async () => {
  try {
    redisClient = await createRedisClient();
    logger.info('Redis initialization completed successfully');
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // Don't exit process in production - let app run without cache
    if (process.env.NODE_ENV === 'production') {
      logger.warn('⚠️ Running without Redis cache');
      return null;
    }
    throw error;
  }
};

// Get current Redis client instance
const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return null;
  }
  return redisClient;
};

// Enhanced Redis utility functions
const redisUtils = {
  // Set value with optional expiration (in seconds)
  set: async (key, value, expireInSeconds = null) => {
    if (!redisClient) {
      logger.warn('Redis not available, skipping SET operation');
      return false;
    }
    
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      if (expireInSeconds) {
        await redisClient.setEx(key, expireInSeconds, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
      
      logger.debug(`Redis SET: ${key} (expires: ${expireInSeconds || 'never'})`);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },
  
  // Get value and parse JSON if applicable
  get: async (key) => {
    if (!redisClient) {
      logger.warn('Redis not available, skipping GET operation');
      return null;
    }
    
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
      return null;
    }
  },
  
  // Delete key(s)
  del: async (...keys) => {
    if (!redisClient) {
      logger.warn('Redis not available, skipping DEL operation');
      return 0;
    }
    
    try {
      const result = await redisClient.del(keys);
      logger.debug(`Redis DEL: ${keys.join(', ')} (${result} keys deleted)`);
      return result;
    } catch (error) {
      logger.error(`Redis DEL error for keys ${keys.join(', ')}:`, error);
      return 0;
    }
  },
  
  // Delete keys by pattern
  deletePattern: async (pattern) => {
    if (!redisClient) {
      logger.warn('Redis not available, skipping pattern delete');
      return 0;
    }
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        const result = await redisClient.del(keys);
        logger.debug(`Redis DEL pattern: ${pattern} (${result} keys deleted)`);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error(`Redis pattern delete error for ${pattern}:`, error);
      return 0;
    }
  },
  
  // Check if key exists
  exists: async (key) => {
    if (!redisClient) return false;
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  },
  
  // Set expiration for existing key
  expire: async (key, seconds) => {
    if (!redisClient) return false;
    
    try {
      const result = await redisClient.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  },
  
  // Increment counter with optional expiry
  increment: async (key, expireInSeconds = 86400) => {
    if (!redisClient) return 0;
    
    try {
      const count = await redisClient.incr(key);
      
      // Set expiration only on first increment
      if (count === 1 && expireInSeconds) {
        await redisClient.expire(key, expireInSeconds);
      }
      
      return count;
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return 0;
    }
  },
  
  // Decrement counter
  decrement: async (key) => {
    if (!redisClient) return 0;
    
    try {
      return await redisClient.decr(key);
    } catch (error) {
      logger.error(`Redis DECR error for key ${key}:`, error);
      return 0;
    }
  },
  
  // Get multiple keys at once
  mGet: async (...keys) => {
    if (!redisClient) return [];
    
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      logger.error(`Redis MGET error for keys ${keys.join(', ')}:`, error);
      return [];
    }
  },
  
  // Set multiple keys at once
  mSet: async (keyValuePairs) => {
    if (!redisClient) return false;
    
    try {
      const pairs = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pairs.push(key);
        pairs.push(typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
      await redisClient.mSet(pairs);
      logger.debug(`Redis MSET: ${Object.keys(keyValuePairs).join(', ')}`);
      return true;
    } catch (error) {
      logger.error('Redis MSET error:', error);
      return false;
    }
  },
};

// Cache-specific helper functions
const cacheHelpers = {
  // Set cache with default 5-minute expiration
  setCache: async (key, value, expirySeconds = 300) => {
    return await redisUtils.set(key, value, expirySeconds);
  },

  // Get cached value
  getCache: async (key) => {
    return await redisUtils.get(key);
  },

  // Delete cache
  deleteCache: async (key) => {
    return await redisUtils.del(key);
  },

  // Delete cache by pattern (e.g., 'user:*')
  deleteCachePattern: async (pattern) => {
    return await redisUtils.deletePattern(pattern);
  },

  // Increment counter with default 24-hour expiration
  incrementCounter: async (key, expirySeconds = 86400) => {
    return await redisUtils.increment(key, expirySeconds);
  },

  // Cache-aside pattern helper
  getOrSet: async (key, fetchFunction, expirySeconds = 300) => {
    // Try to get from cache first
    const cached = await redisUtils.get(key);
    if (cached !== null) {
      logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss - fetch from source
    logger.debug(`Cache MISS: ${key}`);
    const value = await fetchFunction();
    
    // Store in cache for next time
    if (value !== null && value !== undefined) {
      await redisUtils.set(key, value, expirySeconds);
    }
    
    return value;
  },
};

// Graceful shutdown
const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('✅ Redis connection closed gracefully');
    } catch (error) {
      logger.error('❌ Error closing Redis connection:', error);
      // Force close if graceful shutdown fails
      try {
        await redisClient.disconnect();
        redisClient = null;
      } catch (forceError) {
        logger.error('Failed to force close Redis:', forceError);
      }
    }
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  redisUtils,
  closeRedisConnection,
  
  // Export cache helpers for convenience
  ...cacheHelpers,
};
