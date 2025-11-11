import { z } from 'zod';

// Create pet schema
export const createPetSchema = z.object({
  name: z
    .string()
    .min(2, 'Pet name must be at least 2 characters long')
    .max(100, 'Pet name cannot exceed 100 characters'),
    
  species: z
    .enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other'], {
      errorMap: () => ({ message: 'Please select a valid species' })
    }),
    
  breed: z
    .string()
    .max(100, 'Breed name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  mixedBreed: z
    .boolean()
    .optional()
    .default(false),
    
  age: z
    .number()
    .int()
    .min(0, 'Age cannot be negative')
    .max(300, 'Please provide a valid age')
    .optional(),
    
  ageUnit: z
    .enum(['months', 'years'])
    .default('months'),
    
  ageEstimated: z
    .boolean()
    .optional()
    .default(false),
    
  gender: z
    .enum(['male', 'female'], {
      errorMap: () => ({ message: 'Please select a gender' })
    }),
    
  size: z
    .enum(['small', 'medium', 'large', 'extra_large'])
    .optional(),
    
  weight: z
    .number()
    .min(0, 'Weight cannot be negative')
    .max(200, 'Please provide a valid weight')
    .optional(),
    
  color: z
    .string()
    .max(100, 'Color description cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  markings: z
    .string()
    .max(500, 'Markings description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
    
  // Health
  isVaccinated: z
    .boolean()
    .optional()
    .default(false),
    
  isNeutered: z
    .boolean()
    .optional()
    .default(false),
    
  isSpayed: z
    .boolean()
    .optional()
    .default(false),
    
  healthStatus: z
    .enum(['healthy', 'recovering', 'special_needs', 'unknown'])
    .optional()
    .default('healthy'),
    
  medicalHistory: z
    .string()
    .max(2000, 'Medical history cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
    
  specialNeeds: z
    .string()
    .max(1000, 'Special needs description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
    
  // Behavior
  goodWithKids: z
    .boolean()
    .optional(),
    
  goodWithPets: z
    .boolean()
    .optional(),
    
  goodWithCats: z
    .boolean()
    .optional(),
    
  goodWithDogs: z
    .boolean()
    .optional(),
    
  energyLevel: z
    .enum(['low', 'medium', 'high'])
    .optional(),
    
  trainedLevel: z
    .enum(['not_trained', 'basic', 'advanced'])
    .optional(),
    
  houseTrained: z
    .boolean()
    .optional()
    .default(false),
    
  // Adoption
  adoptionFee: z
    .number()
    .min(0, 'Adoption fee cannot be negative')
    .max(100000, 'Please provide a valid adoption fee')
    .optional()
    .default(0),
    
  isUrgent: z
    .boolean()
    .optional()
    .default(false),
    
  urgentReason: z
    .string()
    .max(500, 'Urgent reason cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
    
  // Location
  city: z
    .string()
    .max(100, 'City name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  state: z
    .string()
    .max(100, 'State name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  // Content
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
    
  story: z
    .string()
    .max(3000, 'Story cannot exceed 3000 characters')
    .optional()
    .or(z.literal('')),
});

// Update pet schema (all fields optional)
export const updatePetSchema = createPetSchema.partial();

// Pet filter schema
export const petFilterSchema = z.object({
  search: z.string().optional(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']).optional(),
  gender: z.enum(['male', 'female']).optional(),
  size: z.enum(['small', 'medium', 'large', 'extra_large']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  goodWithKids: z.boolean().optional(),
  goodWithPets: z.boolean().optional(),
  isVaccinated: z.boolean().optional(),
  isNeutered: z.boolean().optional(),
  energyLevel: z.enum(['low', 'medium', 'high']).optional(),
});
