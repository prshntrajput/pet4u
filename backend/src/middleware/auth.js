const jwtUtils = require('../utils/jwt');
const { logger } = require('../config/logger');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const requestId = req.requestId;
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        requestId
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await jwtUtils.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated',
        requestId
      });
    }

    // Verify token
    const decoded = jwtUtils.verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        requestId
      });
    }

    // Attach user info to request
    req.user = decoded;
    
    logger.debug('User authenticated', {
      userId: decoded.userId,
      role: decoded.role,
      requestId
    });
    
    next();

  } catch (error) {
    logger.error('Authentication middleware error:', { error: error.message, requestId });
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      requestId
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const requestId = req.requestId;
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const isBlacklisted = await jwtUtils.isTokenBlacklisted(token);
      if (!isBlacklisted) {
        const decoded = jwtUtils.verifyAccessToken(token);
        if (decoded) {
          req.user = decoded;
        }
      }
    }
    
    next();

  } catch (error) {
    // Continue without authentication
    logger.debug('Optional auth failed, continuing without auth:', { error: error.message, requestId });
    next();
  }
};

// Role-based authorization
const requireRole = (...roles) => {
  return (req, res, next) => {
    const requestId = req.requestId;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        requestId
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requestId
      });
    }

    next();
  };
};

// Email verification requirement
const requireEmailVerification = (req, res, next) => {
  const requestId = req.requestId;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      requestId
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      requestId
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireEmailVerification
};
