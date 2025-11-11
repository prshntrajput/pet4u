const pino = require('pino');

// Create logger configuration based on environment
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const config = {
    level: isDevelopment ? 'debug' : 'info',
    
    // Pretty print in development for better readability
    ...(isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    }),
    
    // Production logging configuration
    ...(!isDevelopment && {
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    }),
    
    // Base logging fields
    base: {
      pid: process.pid,
      hostname: require('os').hostname(),
      service: 'pet4u-backend'
    }
  };
  
  return pino(config);
};

const logger = createLogger();

// Export logger with additional methods for different log levels
module.exports = {
  logger,
  
  // Convenience methods for different log levels
  info: (message, data = {}) => logger.info(data, message),
  error: (message, error = {}) => logger.error({ err: error }, message),
  warn: (message, data = {}) => logger.warn(data, message),
  debug: (message, data = {}) => logger.debug(data, message),
  
  // Request logging middleware
  requestLogger: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };
      
      if (res.statusCode >= 400) {
        logger.warn(logData, `${req.method} ${req.url} - ${res.statusCode}`);
      } else {
        logger.info(logData, `${req.method} ${req.url} - ${res.statusCode}`);
      }
    });
    
    next();
  }
};
