// index.js (or server.js)
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const http = require('http');
const morgan = require('morgan');
require('dotenv').config();

// Import configurations
const { logger, requestLogger } = require('./src/config/logger');
const { initializeRedis, closeRedisConnection } = require('./src/config/redis');
const { closeConnection } = require('./src/config/database.js');
const { initializeSocket } = require('./src/config/socket');

// Import security middleware
const securityMiddleware = require('./src/middleware/security');

// Create Express application
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy (important for rate limiting behind proxies like Nginx, Railway, Render)
app.set('trust proxy', 1);

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://pet4u-zeta.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001', // ✅ Added alternate port
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ========================================
// SECURITY MIDDLEWARE - PART 1 (BEFORE BODY PARSER)
// ========================================

app.use(securityMiddleware.helmetConfig);
app.use(securityMiddleware.generalLimiter);

// ========================================
// MIDDLEWARE SETUP (BODY PARSERS)
// ========================================

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf; // Store raw body for webhook verification
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// SECURITY MIDDLEWARE - PART 2 (AFTER BODY PARSER)
// ========================================

// ✅ These MUST come AFTER body parsers
app.use(securityMiddleware.sanitize);
app.use(securityMiddleware.preventPollution);
app.use(securityMiddleware.xssClean);

// ========================================
// OTHER MIDDLEWARE
// ========================================

app.use(compression());
app.use(requestLogger);

// Morgan HTTP logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // ✅ Changed to 'dev' for better readability
}

// Request ID for tracing
app.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

logger.info('✅ Middleware setup completed');

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================

app.get('/health', async (req, res) => {
  try {
    const { sql } = require('./src/config/database');
    await sql`SELECT 1 as health_check`;
    
    const { redisUtils } = require('./src/config/redis');
    await redisUtils.set('health_check', 'ok', 10);
    const redisCheck = await redisUtils.get('health_check');
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'pet4u-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: 'neon-connected',
      redis: redisCheck === 'ok' ? 'connected' : 'disconnected',
      uptime: Math.floor(process.uptime()), // ✅ Round to seconds
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB' // ✅ Added RSS
      },
      pid: process.pid // ✅ Added process ID
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ // ✅ Changed to 503 Service Unavailable
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'production' ? 'Service Unavailable' : error.message
    });
  }
});

// ========================================
// API ROUTES SETUP
// ========================================

const setupRoutes = () => {
  const apiV1 = `/api/${process.env.API_VERSION || 'v1'}`;
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to PET4U API',
      version: process.env.API_VERSION || 'v1',
      environment: process.env.NODE_ENV,
      documentation: `${req.protocol}://${req.get('host')}${apiV1}/docs`,
      endpoints: {
        health: '/health',
        api: apiV1
      }
    });
  });
  
  // Import route modules
  const authRoutes = require('./src/routes/auth');
  const userRoutes = require('./src/routes/users');
  const shelterRoutes = require('./src/routes/shelters');
  const petRoutes = require('./src/routes/pets');
  const adoptionRequestRoutes = require('./src/routes/adoptionRequest');
  const messageRoutes = require('./src/routes/messages');
  const notificationRoutes = require('./src/routes/notifications');
  const favoriteRoutes = require('./src/routes/favorites');
  const reviewRoutes = require('./src/routes/reviews');
  const adminRoutes = require('./src/routes/admin');
  const searchRoutes = require('./src/routes/search');
  const analyticsRoutes = require('./src/routes/analytics');
  const paymentRoutes = require('./src/routes/payments');
  
  // Apply strict rate limiting to auth routes
  app.use(`${apiV1}/auth/login`, securityMiddleware.authLimiter);
  app.use(`${apiV1}/auth/register`, securityMiddleware.authLimiter);
  
  // Apply API rate limiter to all API routes
  app.use(apiV1, securityMiddleware.apiLimiter);
  
  // Register routes
  app.use(`${apiV1}/auth`, authRoutes);
  app.use(`${apiV1}/users`, userRoutes);
  app.use(`${apiV1}/shelters`, shelterRoutes);
  app.use(`${apiV1}/pets`, petRoutes);
  app.use(`${apiV1}/adoption-requests`, adoptionRequestRoutes);
  app.use(`${apiV1}/messages`, messageRoutes);
  app.use(`${apiV1}/notifications`, notificationRoutes);
  app.use(`${apiV1}/favorites`, favoriteRoutes);
  app.use(`${apiV1}/reviews`, reviewRoutes);
  app.use(`${apiV1}/admin`, adminRoutes);
  app.use(`${apiV1}/search`, searchRoutes);
  app.use(`${apiV1}/analytics`, analyticsRoutes);
  app.use(`${apiV1}/payments`, paymentRoutes);
  
  logger.info('✅ API routes configured');
};

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

const setupErrorHandling = () => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      requestId: req.requestId,
      body: req.body,
      query: req.query
    });
    
    // Don't leak sensitive error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
    
    const statusCode = err.status || err.statusCode || 500;
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      })
    });
  });
  
  logger.info('✅ Error handling middleware configured');
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const setupGracefulShutdown = (server) => {
  const gracefulShutdown = async (signal) => {
    logger.info(`⚠️  Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
      logger.info('✅ HTTP server closed');
      
      try {
        // Close database connections
        await closeConnection();
        logger.info('✅ Database connection closed');
        
        // Close Redis connection
        await closeRedisConnection();
        logger.info('✅ Redis connection closed');
        
        logger.info('✅ All connections closed. Exiting gracefully...');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
};

// ========================================
// INITIALIZE APPLICATION
// ========================================

const initializeApp = async () => {
  try {
    logger.info('🚀 Starting PET4U Backend Server...');
    
    // Initialize Redis
    await initializeRedis();
    logger.info('✅ Redis initialized');
    
    // Initialize Socket.IO
    initializeSocket(server);
    logger.info('✅ Socket.IO initialized');
    
    // Setup routes
    setupRoutes();
    
    // Setup error handling (MUST BE LAST)
    setupErrorHandling();
    
    logger.info('✅ Application initialization completed successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize application:', error);
    logger.error(error.stack);
    process.exit(1);
  }
};

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  await initializeApp();
  
  server.listen(PORT, () => {
    logger.info('='.repeat(60));
    logger.info(`🚀 PET4U Backend Server running on port ${PORT}`);
    logger.info(`🔌 Socket.IO ready for WebSocket connections`);
    logger.info(`📖 API: http://localhost:${PORT}/api/v1`);
    logger.info(`🏥 Health: http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔒 Security: Enabled (Helmet, Rate Limiting, XSS, HPP)`);
    logger.info(`⚡ Rate Limiting: Active`);
    logger.info(`🗄️  Database: Neon PostgreSQL (Serverless)`);
    logger.info(`💾 Cache: Redis Cloud`);
    logger.info('='.repeat(60));
  });

  setupGracefulShutdown(server);
  
  return server;
};

// Export for testing
module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
