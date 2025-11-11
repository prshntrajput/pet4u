import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
    
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
    
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
    
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
    
  zipCode: z
    .string()
    .regex(/^\d{6}$/, 'Please provide a valid 6-digit PIN code')
    .optional()
    .or(z.literal('')),
});

// Update location schema
export const updateLocationSchema = z.object({
  address: z
    .string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
    
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name cannot exceed 100 characters'),
    
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State name cannot exceed 100 characters'),
    
  country: z
    .string()
    .max(100, 'Country name cannot exceed 100 characters')
    .default('India'),
    
  zipCode: z
    .string()
    .regex(/^\d{6}$/, 'Please provide a valid 6-digit PIN code')
    .optional()
    .or(z.literal('')),
    
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
    
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
    
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password cannot exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
    
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Delete account schema
export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required'),
    
  confirmation: z
    .string()
    .refine((val) => val === 'DELETE MY ACCOUNT', {
      message: 'Please type "DELETE MY ACCOUNT" to confirm',
    }),
});

// Shelter profile schema
export const createShelterProfileSchema = z.object({
  organizationName: z
    .string()
    .min(3, 'Organization name must be at least 3 characters long')
    .max(200, 'Organization name cannot exceed 200 characters'),
    
  registrationNumber: z
    .string()
    .max(100, 'Registration number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  licenseNumber: z
    .string()
    .max(100, 'License number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  website: z
    .string()
    .url('Please provide a valid website URL')
    .optional()
    .or(z.literal('')),
    
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
    
  establishedYear: z
    .number()
    .int()
    .min(1900, 'Established year must be after 1900')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
    
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .optional(),
});

// Update shelter profile schema
export const updateShelterProfileSchema = z.object({
  organizationName: z
    .string()
    .min(3, 'Organization name must be at least 3 characters long')
    .max(200, 'Organization name cannot exceed 200 characters')
    .optional(),
    
  registrationNumber: z
    .string()
    .max(100, 'Registration number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  licenseNumber: z
    .string()
    .max(100, 'License number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
    
  website: z
    .string()
    .url('Please provide a valid website URL')
    .optional()
    .or(z.literal('')),
    
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
    
  establishedYear: z
    .number()
    .int()
    .min(1900, 'Established year must be after 1900')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
    
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .optional(),
    
  currentPetCount: z
    .number()
    .int()
    .min(0, 'Current pet count cannot be negative')
    .optional(),
});
