const Joi = require('joi');

// Create pet validation
const createPetValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Pet name must be at least 2 characters long',
      'string.max': 'Pet name cannot exceed 100 characters',
      'any.required': 'Pet name is required'
    }),
    
  species: Joi.string()
    .valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'other')
    .required()
    .messages({
      'any.only': 'Please select a valid species',
      'any.required': 'Species is required'
    }),
    
  breed: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Breed name cannot exceed 100 characters'
    }),
    
  mixedBreed: Joi.boolean()
    .optional()
    .default(false),
    
  age: Joi.number()
    .integer()
    .min(0)
    .max(300)
    .optional()
    .allow('', null)
    .messages({
      'number.min': 'Age cannot be negative',
      'number.max': 'Please provide a valid age'
    }),
    
  ageUnit: Joi.string()
    .valid('months', 'years')
    .default('months')
    .messages({
      'any.only': 'Age unit must be either months or years'
    }),
    
  ageEstimated: Joi.boolean()
    .optional()
    .default(false),
    
  gender: Joi.string()
    .valid('male', 'female')
    .required()
    .messages({
      'any.only': 'Gender must be either male or female',
      'any.required': 'Gender is required'
    }),
    
  size: Joi.string()
    .valid('small', 'medium', 'large', 'extra_large')
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Please select a valid size'
    }),
    
  weight: Joi.number()
    .min(0)
    .max(200)
    .optional()
    .allow('', null)
    .messages({
      'number.min': 'Weight cannot be negative',
      'number.max': 'Please provide a valid weight'
    }),
    
  color: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Color description cannot exceed 100 characters'
    }),
    
  markings: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Markings description cannot exceed 500 characters'
    }),
    
  // Health information
  isVaccinated: Joi.boolean()
    .optional()
    .default(false),
    
  isNeutered: Joi.boolean()
    .optional()
    .default(false),
    
  isSpayed: Joi.boolean()
    .optional()
    .default(false),
    
  healthStatus: Joi.string()
    .valid('healthy', 'recovering', 'special_needs', 'unknown')
    .default('healthy')
    .messages({
      'any.only': 'Please select a valid health status'
    }),
    
  medicalHistory: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Medical history cannot exceed 2000 characters'
    }),
    
  specialNeeds: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Special needs description cannot exceed 1000 characters'
    }),
    
  // Behavioral traits
  goodWithKids: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithPets: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithCats: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithDogs: Joi.boolean()
    .optional()
    .allow(null),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Please select a valid energy level'
    }),
    
  trainedLevel: Joi.string()
    .valid('not_trained', 'basic', 'advanced')
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Please select a valid training level'
    }),
    
  houseTrained: Joi.boolean()
    .optional()
    .default(false),
    
  // Adoption information
  adoptionFee: Joi.number()
    .min(0)
    .max(100000)
    .optional()
    .default(0)
    .allow('', null)
    .messages({
      'number.min': 'Adoption fee cannot be negative',
      'number.max': 'Please provide a valid adoption fee'
    }),
    
  isUrgent: Joi.boolean()
    .optional()
    .default(false),
    
  urgentReason: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .when('isUrgent', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.max': 'Urgent reason cannot exceed 500 characters',
      'any.required': 'Please provide a reason for urgent adoption'
    }),
    
  // Location (optional, defaults to user's location)
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
    
  // Content
  description: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
    
  story: Joi.string()
    .max(3000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Story cannot exceed 3000 characters'
    }),
});

// Update pet validation
const updatePetValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Pet name must be at least 2 characters long',
      'string.max': 'Pet name cannot exceed 100 characters'
    }),
    
  breed: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Breed name cannot exceed 100 characters'
    }),
    
  mixedBreed: Joi.boolean()
    .optional(),
    
  age: Joi.number()
    .integer()
    .min(0)
    .max(300)
    .optional()
    .allow('', null)
    .messages({
      'number.min': 'Age cannot be negative',
      'number.max': 'Please provide a valid age'
    }),
    
  ageUnit: Joi.string()
    .valid('months', 'years')
    .optional()
    .messages({
      'any.only': 'Age unit must be either months or years'
    }),
    
  size: Joi.string()
    .valid('small', 'medium', 'large', 'extra_large')
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Please select a valid size'
    }),
    
  weight: Joi.number()
    .min(0)
    .max(200)
    .optional()
    .allow('', null)
    .messages({
      'number.min': 'Weight cannot be negative',
      'number.max': 'Please provide a valid weight'
    }),
    
  color: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Color description cannot exceed 100 characters'
    }),
    
  markings: Joi.string()
    .max(500)
    .optional()
    .allow('', null),
    
  isVaccinated: Joi.boolean()
    .optional(),
    
  isNeutered: Joi.boolean()
    .optional(),
    
  isSpayed: Joi.boolean()
    .optional(),
    
  healthStatus: Joi.string()
    .valid('healthy', 'recovering', 'special_needs', 'unknown')
    .optional(),
    
  medicalHistory: Joi.string()
    .max(2000)
    .optional()
    .allow('', null),
    
  specialNeeds: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
    
  goodWithKids: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithPets: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithCats: Joi.boolean()
    .optional()
    .allow(null),
    
  goodWithDogs: Joi.boolean()
    .optional()
    .allow(null),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .allow('', null),
    
  trainedLevel: Joi.string()
    .valid('not_trained', 'basic', 'advanced')
    .optional()
    .allow('', null),
    
  houseTrained: Joi.boolean()
    .optional(),
    
  adoptionFee: Joi.number()
    .min(0)
    .max(100000)
    .optional()
    .allow('', null),
    
  isUrgent: Joi.boolean()
    .optional(),
    
  urgentReason: Joi.string()
    .max(500)
    .optional()
    .allow('', null),
    
  adoptionStatus: Joi.string()
    .valid('available', 'pending', 'adopted')
    .optional(),
    
  city: Joi.string()
    .max(100)
    .optional()
    .allow('', null),
    
  state: Joi.string()
    .max(100)
    .optional()
    .allow('', null),
    
  description: Joi.string()
    .min(20)
    .max(2000)
    .optional(),
    
  story: Joi.string()
    .max(3000)
    .optional()
    .allow('', null),
}).min(1); // ✅ At least one field must be provided for update

// Search/Filter validation - FIXED FOR EMPTY STRINGS
const searchPetsValidation = Joi.object({
  page: Joi.alternatives()
    .try(
      Joi.number().integer().min(1),
      Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value))
    )
    .default(1),
    
  limit: Joi.alternatives()
    .try(
      Joi.number().integer().min(1).max(50),
      Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value))
    )
    .default(12),
    
  search: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .default(''),
    
  species: Joi.string()
    .valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'other', '')
    .optional()
    .allow('', null)
    .default(''),
    
  gender: Joi.string()
    .valid('male', 'female', '')
    .optional()
    .allow('', null)
    .default(''),
    
  size: Joi.string()
    .valid('small', 'medium', 'large', 'extra_large', '')
    .optional()
    .allow('', null)
    .default(''),
    
  city: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .default(''),
    
  state: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .default(''),
    
  minAge: Joi.alternatives()
    .try(
      Joi.number().integer().min(0),
      Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value)),
      Joi.string().allow('')
    )
    .optional()
    .allow('', null),
    
  maxAge: Joi.alternatives()
    .try(
      Joi.number().integer().min(0),
      Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value)),
      Joi.string().allow('')
    )
    .optional()
    .allow('', null),
    
  ageUnit: Joi.string()
    .valid('months', 'years', '')
    .default('months')
    .optional()
    .allow('', null),
    
  goodWithKids: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('true', 'false', '').custom((value) => {
        if (value === '') return undefined;
        return value === 'true';
      })
    )
    .optional()
    .allow('', null),
    
  goodWithPets: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('true', 'false', '').custom((value) => {
        if (value === '') return undefined;
        return value === 'true';
      })
    )
    .optional()
    .allow('', null),
    
  isVaccinated: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('true', 'false', '').custom((value) => {
        if (value === '') return undefined;
        return value === 'true';
      })
    )
    .optional()
    .allow('', null),
    
  isNeutered: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('true', 'false', '').custom((value) => {
        if (value === '') return undefined;
        return value === 'true';
      })
    )
    .optional()
    .allow('', null),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high', '')
    .optional()
    .allow('', null)
    .default(''),
    
  adoptionStatus: Joi.string()
    .valid('available', 'pending', 'adopted', '')
    .default('available')
    .optional()
    .allow('', null),
    
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'age', 'adoptionFee', 'viewCount')
    .default('createdAt')
    .optional(),
    
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional(),
}).options({ 
  stripUnknown: true, 
  allowUnknown: false 
});

module.exports = {
  createPetValidation,
  updatePetValidation,
  searchPetsValidation,
};
