const Joi = require('joi');

// Create adoption request validation
const createAdoptionRequestValidation = Joi.object({
  petId: Joi.string()
    .required()
    .messages({
      'any.required': 'Pet ID is required'
    }),
    
  message: Joi.string()
    .min(20)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message must be at least 20 characters long',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Please provide a message explaining why you want to adopt this pet'
    }),
});

// Respond to adoption request validation
const respondToRequestValidation = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected')
    .required()
    .messages({
      'any.only': 'Status must be either approved or rejected',
      'any.required': 'Status is required'
    }),
    
  responseMessage: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Response message must be at least 10 characters long',
      'string.max': 'Response message cannot exceed 1000 characters',
      'any.required': 'Please provide a response message'
    }),
    
  meetingDate: Joi.date()
    .optional()
    .when('status', {
      is: 'approved',
      then: Joi.date().min('now'),
    }),
    
  meetingLocation: Joi.string()
    .max(500)
    .optional(),
    
  meetingNotes: Joi.string()
    .max(1000)
    .optional(),
});

// Send message validation
const sendMessageValidation = Joi.object({
  receiverId: Joi.string()
    .required()
    .messages({
      'any.required': 'Receiver ID is required'
    }),
    
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 5000 characters',
      'any.required': 'Message content is required'
    }),
    
  messageType: Joi.string()
    .valid('text', 'image', 'file')
    .default('text'),
    
  adoptionRequestId: Joi.string()
    .optional()
    .allow(null),
});

module.exports = {
  createAdoptionRequestValidation,
  respondToRequestValidation,
  sendMessageValidation,
};
