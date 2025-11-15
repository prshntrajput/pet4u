const Joi = require('joi');

// Create pet review validation
const createPetReviewValidation = Joi.object({
  petId: Joi.string()
    .required()
    .messages({
      'any.required': 'Pet ID is required'
    }),
    
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
    
  title: Joi.string()
    .max(200)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
    
  comment: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comment must be at least 10 characters long',
      'string.max': 'Comment cannot exceed 2000 characters',
      'any.required': 'Comment is required'
    }),
});

// Create shelter review validation
const createShelterReviewValidation = Joi.object({
  shelterId: Joi.string()
    .required()
    .messages({
      'any.required': 'Shelter ID is required'
    }),
    
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
    
  title: Joi.string()
    .max(200)
    .optional()
    .allow('', null),
    
  comment: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comment must be at least 10 characters long',
      'string.max': 'Comment cannot exceed 2000 characters',
      'any.required': 'Comment is required'
    }),
    
  communicationRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
    
  facilityRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
    
  processRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
});

module.exports = {
  createPetReviewValidation,
  createShelterReviewValidation,
};
