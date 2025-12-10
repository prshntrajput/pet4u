const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');

// Check if in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message, devMax = null) => {
  return rateLimit({
    windowMs,
    max: isDevelopment && devMax ? devMax : max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for localhost in development
    skip: (req) => {
      if (isDevelopment) {
        const ip = req.ip || req.connection.remoteAddress;
        return ip === '::1' || 
               ip === '127.0.0.1' || 
               ip === 'localhost' ||
               ip === '::ffff:127.0.0.1';
      }
      return false;
    },
  });
};

// ✅ General rate limiter (INCREASED for production)
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  500, // ✅ 500 requests in production (was 100)
  'Too many requests from this IP, please try again later',
  2000 // 2000 requests in development
);

// ✅ Auth rate limiter (More reasonable)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // ✅ 20 attempts in production (was 5) - allows for typos
  'Too many login attempts, please try again after 15 minutes',
  100 // 100 attempts in development
);

// ✅ Payment rate limiter (Increased but still secure)
const paymentLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50, // ✅ 50 requests in production (was 10)
  'Too many payment requests, please try again later',
  200 // 200 requests in development
);

// ✅ API rate limiter (More practical)
const apiLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  100, // ✅ 100 requests per minute in production (was 30)
  'API rate limit exceeded',
  500 // 500 requests per minute in development
);

// ✅ Upload rate limiter (NEW - for file uploads)
const uploadLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 uploads in production
  'Too many upload requests, please try again later',
  200 // 200 uploads in development
);

// ✅ Search rate limiter (NEW - for search endpoints)
const searchLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  60, // 60 searches per minute in production
  'Too many search requests, please slow down',
  300 // 300 searches per minute in development
);

// Helmet configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// CUSTOM MONGO SANITIZER (Prevents NoSQL Injection)
const customMongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Remove keys that start with $ or contain .
          if (key.startsWith('$') || key.includes('.')) {
            if (isDevelopment) {
              console.warn(`⚠️  Blocked NoSQL injection attempt: ${key}`);
            }
            continue;
          }
          
          sanitized[key] = sanitize(obj[key]);
        }
      }
      
      return sanitized;
    }
    
    return obj;
  };
  
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitize(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = sanitize(req.query);
    }
    
    if (req.params && typeof req.params === 'object') {
      req.params = sanitize(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next();
  }
};

// CUSTOM XSS SANITIZER (Prevents Cross-Site Scripting)
const customXssClean = (req, res, next) => {
  const cleanXss = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<img[^>]+src[\s]*=[\s]*["']?javascript:/gi, '')
        .replace(/eval\(/gi, '')
        .replace(/expression\(/gi, '');
    }
    
    if (Array.isArray(value)) {
      return value.map(item => cleanXss(item));
    }
    
    if (typeof value === 'object' && value !== null) {
      const cleaned = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          cleaned[key] = cleanXss(value[key]);
        }
      }
      return cleaned;
    }
    
    return value;
  };
  
  try {
    if (req.body) {
      req.body = cleanXss(req.body);
    }
    
    if (req.query) {
      req.query = cleanXss(req.query);
    }
    
    if (req.params) {
      req.params = cleanXss(req.params);
    }
    
    next();
  } catch (error) {
    console.error('XSS cleaning error:', error);
    next();
  }
};

// Log rate limit status on startup
if (isDevelopment) {
  console.log('🔓 Development Mode: Rate limiting is relaxed');
  console.log('   - General: 2000 requests per 15 minutes');
  console.log('   - Auth: 100 attempts per 15 minutes');
  console.log('   - Payment: 200 requests per hour');
  console.log('   - API: 500 requests per minute');
  console.log('   - Upload: 200 uploads per 15 minutes');
  console.log('   - Search: 300 searches per minute');
} else {
  console.log('🔒 Production Mode: Rate limiting is active');
  console.log('   - General: 500 requests per 15 minutes');
  console.log('   - Auth: 20 attempts per 15 minutes');
  console.log('   - Payment: 50 requests per hour');
  console.log('   - API: 100 requests per minute');
  console.log('   - Upload: 50 uploads per 15 minutes');
  console.log('   - Search: 60 searches per minute');
}

// Security middleware
const securityMiddleware = {
  helmetConfig,
  
  // Custom sanitizers
  sanitize: customMongoSanitize,
  xssClean: customXssClean,
  
  // HPP protection
  preventPollution: hpp(),
  
  // Rate limiters
  generalLimiter,
  authLimiter,
  paymentLimiter,
  apiLimiter,
  uploadLimiter, // ✅ NEW
  searchLimiter, // ✅ NEW
};

module.exports = securityMiddleware;
