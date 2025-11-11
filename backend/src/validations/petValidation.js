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
    .messages({
      'any.only': 'Please select a valid size'
    }),
    
  weight: Joi.number()
    .min(0)
    .max(200)
    .optional()
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
    .optional(),
    
  goodWithPets: Joi.boolean()
    .optional(),
    
  goodWithCats: Joi.boolean()
    .optional(),
    
  goodWithDogs: Joi.boolean()
    .optional(),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Please select a valid energy level'
    }),
    
  trainedLevel: Joi.string()
    .valid('not_trained', 'basic', 'advanced')
    .optional()
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
    .messages({
      'any.only': 'Please select a valid size'
    }),
    
  weight: Joi.number()
    .min(0)
    .max(200)
    .optional()
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
    .optional(),
    
  goodWithPets: Joi.boolean()
    .optional(),
    
  goodWithCats: Joi.boolean()
    .optional(),
    
  goodWithDogs: Joi.boolean()
    .optional(),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high')
    .optional(),
    
  trainedLevel: Joi.string()
    .valid('not_trained', 'basic', 'advanced')
    .optional(),
    
  houseTrained: Joi.boolean()
    .optional(),
    
  adoptionFee: Joi.number()
    .min(0)
    .max(100000)
    .optional(),
    
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
});

// Search/Filter validation
const searchPetsValidation = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(12),
    
  search: Joi.string()
    .max(100)
    .optional()
    .allow(''),
    
  species: Joi.string()
    .valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'other')
    .optional(),
    
  gender: Joi.string()
    .valid('male', 'female')
    .optional(),
    
  size: Joi.string()
    .valid('small', 'medium', 'large', 'extra_large')
    .optional(),
    
  city: Joi.string()
    .max(100)
    .optional()
    .allow(''),
    
  state: Joi.string()
    .max(100)
    .optional()
    .allow(''),
    
  minAge: Joi.number()
    .integer()
    .min(0)
    .optional(),
    
  maxAge: Joi.number()
    .integer()
    .min(0)
    .optional(),
    
  ageUnit: Joi.string()
    .valid('months', 'years')
    .default('months'),
    
  goodWithKids: Joi.boolean()
    .optional(),
    
  goodWithPets: Joi.boolean()
    .optional(),
    
  isVaccinated: Joi.boolean()
    .optional(),
    
  isNeutered: Joi.boolean()
    .optional(),
    
  energyLevel: Joi.string()
    .valid('low', 'medium', 'high')
    .optional(),
    
  adoptionStatus: Joi.string()
    .valid('available', 'pending', 'adopted')
    .default('available'),
    
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'age', 'adoptionFee')
    .default('createdAt'),
    
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

module.exports = {
  createPetValidation,
  updatePetValidation,
  searchPetsValidation,
};
