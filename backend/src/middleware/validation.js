const Joi = require('joi');
const { logger } = require('../config/logger');

// Create validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const requestId = req.requestId;
    
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Show all validation errors
        stripUnknown: true, // Remove unknown properties
        convert: true // Convert types when possible
      });

      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.debug('Validation error:', { errorDetails, requestId });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorDetails,
          requestId
        });
      }

      // Replace request data with validated and sanitized data
      req[property] = value;
      next();

    } catch (validationError) {
      logger.error('Validation middleware error:', { 
        error: validationError.message, 
        requestId 
      });
      
      res.status(500).json({
        success: false,
        message: 'Validation error occurred',
        requestId
      });
    }
  };
};

// Sanitize and validate common request properties
const sanitizeRequest = (req, res, next) => {
  // Trim strings in body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    }
  }

  next();
};

module.exports = {
  validate,
  sanitizeRequest
};
