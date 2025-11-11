const Joi = require('joi');

// Update user profile validation
const updateProfileValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters and spaces',
    }),
    
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
    }),
    
  address: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    
  city: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'City name cannot exceed 100 characters'
    }),
    
  state: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'State name cannot exceed 100 characters'
    }),
    
  zipCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid 6-digit PIN code'
    }),
});

// Update location validation
const updateLocationValidation = Joi.object({
  address: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
    
  city: Joi.string()
    .required()
    .max(100)
    .messages({
      'any.required': 'City is required',
      'string.max': 'City name cannot exceed 100 characters'
    }),
    
  state: Joi.string()
    .required()
    .max(100)
    .messages({
      'any.required': 'State is required',
      'string.max': 'State name cannot exceed 100 characters'
    }),
    
  country: Joi.string()
    .max(100)
    .default('India')
    .messages({
      'string.max': 'Country name cannot exceed 100 characters'
    }),
    
  zipCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid 6-digit PIN code'
    }),
    
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
    
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
});

// Change password validation
const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
    
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your new password'
    })
});

// Delete account validation
const deleteAccountValidation = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required to delete account'
    }),
    
  confirmation: Joi.string()
    .valid('DELETE MY ACCOUNT')
    .required()
    .messages({
      'any.only': 'Please type "DELETE MY ACCOUNT" to confirm',
      'any.required': 'Confirmation text is required'
    })
});

// Shelter profile validation
const createShelterProfileValidation = Joi.object({
  organizationName: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Organization name must be at least 3 characters long',
      'string.max': 'Organization name cannot exceed 200 characters',
      'any.required': 'Organization name is required'
    }),
    
  registrationNumber: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Registration number cannot exceed 100 characters'
    }),
    
  licenseNumber: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'License number cannot exceed 100 characters'
    }),
    
  website: Joi.string()
    .uri()
    .optional()
    .allow('', null)
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    
  establishedYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.min': 'Established year must be after 1900',
      'number.max': 'Established year cannot be in the future'
    }),
    
  capacity: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Capacity must be at least 1'
    }),
});

// Update shelter profile validation
const updateShelterProfileValidation = Joi.object({
  organizationName: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Organization name must be at least 3 characters long',
      'string.max': 'Organization name cannot exceed 200 characters'
    }),
    
  registrationNumber: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Registration number cannot exceed 100 characters'
    }),
    
  licenseNumber: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'License number cannot exceed 100 characters'
    }),
    
  website: Joi.string()
    .uri()
    .optional()
    .allow('', null)
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
    
  establishedYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.min': 'Established year must be after 1900',
      'number.max': 'Established year cannot be in the future'
    }),
    
  capacity: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Capacity must be at least 1'
    }),
    
  currentPetCount: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Current pet count cannot be negative'
    }),
});

module.exports = {
  updateProfileValidation,
  updateLocationValidation,
  changePasswordValidation,
  deleteAccountValidation,
  createShelterProfileValidation,
  updateShelterProfileValidation,
};
