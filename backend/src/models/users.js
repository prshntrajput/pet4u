const { pgTable, varchar, timestamp, boolean, text, integer, decimal } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');

// Users table schema - Optimized for Neon serverless
const users = pgTable('users', {
  // Primary key with CUID2 for better performance and security
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Authentication fields
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  
  // Profile information
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  profileImage: text('profile_image'),
  
  // Role-based access control
  role: varchar('role', { length: 20 }).notNull().default('adopter'), // 'adopter', 'shelter', 'admin'
  
  // Location information for pet matching
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('India'),
  zipCode: varchar('zip_code', { length: 20 }),
  
  // Location coordinates for distance-based searches (stored as strings for Neon compatibility)
  latitude: decimal('latitude', { precision: 10, scale: 8 }), // More precise for location
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Account status and verification
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  emailVerifiedAt: timestamp('email_verified_at'),
  
  // Profile completion for better matching
  profileComplete: boolean('profile_complete').default(false),
  
  // Timestamps with timezone support (important for Neon)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

// Shelter-specific information (extends users table)
const shelters = pgTable('shelters', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, { 
    onDelete: 'cascade' // Important for data integrity
  }).notNull(),
  
  // Shelter details
  organizationName: varchar('organization_name', { length: 200 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }).unique(),
  licenseNumber: varchar('license_number', { length: 100 }),
  
  // Contact information
  website: varchar('website', { length: 255 }),
  description: text('description'),
  
  // Operational details
  establishedYear: integer('established_year'),
  capacity: integer('capacity'),
  currentPetCount: integer('current_pet_count').default(0),
  
  // Documents and verification
  documentsVerified: boolean('documents_verified').default(false),
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'), // 'pending', 'approved', 'rejected'
  verificationDate: timestamp('verification_date', { withTimezone: true }),
  
  // Rating system
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  
  // Operating hours (JSON stored as text for flexibility)
  operatingHours: text('operating_hours'), // Will store JSON string
  
  // Social media links
  socialLinks: text('social_links'), // Will store JSON string
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// User sessions for JWT management - Optimized for Neon
const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Session management
  refreshToken: text('refresh_token').notNull(),
  deviceInfo: text('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // Session status
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).defaultNow(),
  
  // Security
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Email verification tokens
const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Password reset tokens
const passwordResetTokens = pgTable('password_reset_tokens', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

module.exports = {
  users,
  shelters,
  userSessions,
  emailVerificationTokens,
  passwordResetTokens
};
