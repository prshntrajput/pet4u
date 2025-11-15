const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const morgan = require('morgan');
require('dotenv').config();

// Import configurations
const { logger, requestLogger } = require('./src/config/logger');
const { initializeRedis, closeRedisConnection } = require('./src/config/redis');
const { closeConnection } = require('./src/config/database.js');
const { initializeSocket } = require('./src/config/socket');

// Create Express application
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration for frontend integration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pet4u-zeta.vercel.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 24 hours
}));

// Middleware setup for production optimization
const setupMiddleware = () => {
  // Security middleware - Helmet helps secure Express apps
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  }));
  
  // Body parsing middleware
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Request logging
  app.use(requestLogger);
  
  // Morgan for additional HTTP logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
  }
  
  // Request ID for tracing
  app.use((req, res, next) => {
    req.requestId = require('crypto').randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
  });
  
  logger.info('Middleware setup completed');
};

// Health check endpoint
const setupHealthCheck = () => {
  app.get('/health', async (req, res) => {
    try {
      // Check Neon database connectivity
      const { sql } = require('./src/config/database');
      await sql`SELECT 1 as health_check`;
      
      // Check Redis connectivity
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
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        }
      };
      
      res.status(200).json(healthStatus);
      
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
  
  logger.info('Health check endpoint configured for Neon serverless');
};

// API routes setup
const setupRoutes = () => {
  // API versioning
  const apiV1 = `/api/${process.env.API_VERSION || 'v1'}`;
  
  // Welcome endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to PET4U API',
      version: process.env.API_VERSION || 'v1',
      environment: process.env.NODE_ENV,
      documentation: `${req.protocol}://${req.get('host')}${apiV1}/docs`
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
  
  logger.info('API routes configured');
};

// Error handling middleware
const setupErrorHandling = () => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    });
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      requestId: req.requestId
    });
    
    // Don't leak error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
    
    res.status(err.status || 500).json({
      success: false,
      message: errorMessage,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  });
  
  logger.info('Error handling middleware configured');
};

// Graceful shutdown handler
const setupGracefulShutdown = (server) => {
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await closeConnection();
        await closeRedisConnection();
        logger.info('All connections closed. Process exiting...');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
};

// Initialize application
const initializeApp = async () => {
  try {
    logger.info('Starting PET4U Backend Server...');
    
    // Initialize Redis connection
    await initializeRedis();
    
    // Initialize Socket.IO - THIS IS THE MISSING PIECE!
    initializeSocket(server);
    logger.info('Socket.IO initialized successfully');
    
    // Setup middleware
    setupMiddleware();
    
    // Setup health check
    setupHealthCheck();
    
    // Setup routes
    setupRoutes();
    
    // Setup error handling
    setupErrorHandling();
    
    logger.info('Application initialization completed successfully');
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    logger.error(error.stack);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeApp();
  
  server.listen(PORT, () => {
    logger.info(`🚀 PET4U Backend Server running on port ${PORT}`);
    logger.info(`🔌 Socket.IO ready for WebSocket connections`);
    logger.info(`📖 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  });

  setupGracefulShutdown(server);
  
  return server;
};

// Export for testing
module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
