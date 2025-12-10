const Joi = require('joi');
const { logger } = require('../config/logger');

// Create validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const requestId = req.requestId;
    
    try {
      // Get data to validate
      let dataToValidate = req[property];
      
      // For query params, convert empty strings to appropriate types
      if (property === 'query') {
        dataToValidate = cleanQueryParams(dataToValidate);
      }
      
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Show all validation errors
        stripUnknown: true, // Remove unknown properties
        convert: true, // Convert types when possible
        presence: 'optional', // Make fields optional by default unless specified
      });

      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        logger.debug('Validation error:', { 
          errorDetails, 
          requestId,
          property,
          originalData: req[property]
        });

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
        stack: validationError.stack,
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

// Helper function to clean query parameters
const cleanQueryParams = (params) => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const cleaned = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Skip empty strings for optional fields
    if (value === '' || value === 'undefined' || value === 'null') {
      continue;
    }
    
    // Convert string booleans to actual booleans
    if (value === 'true') {
      cleaned[key] = true;
    } else if (value === 'false') {
      cleaned[key] = false;
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

// Sanitize and validate common request properties
const sanitizeRequest = (req, res, next) => {
  try {
    // Trim strings in body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Trim strings in query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', {
      error: error.message,
      requestId: req.requestId
    });
    next();
  }
};

// Helper function to sanitize objects recursively
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Trim strings and remove null bytes
      sanitized[key] = value.trim().replace(/\0/g, '');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Validate MongoDB/Postgres ID format
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const requestId = req.requestId;
    
    // CUID2 format validation (alphanumeric, lowercase, specific length)
    const cuidRegex = /^[a-z0-9]{24,32}$/;
    
    if (!cuidRegex.test(id)) {
      logger.debug('Invalid ID format:', { id, paramName, requestId });
      
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
        requestId
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  sanitizeRequest,
  validateId,
  cleanQueryParams, // Export for use in other places
};
