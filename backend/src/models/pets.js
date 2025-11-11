const { pgTable, varchar, timestamp, boolean, text, integer, decimal, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');

// Main pets table - Optimized for search and filtering
const pets = pgTable('pets', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Owner/Shelter information
  ownerId: varchar('owner_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Basic pet information
  name: varchar('name', { length: 100 }).notNull(),
  species: varchar('species', { length: 50 }).notNull(), // 'dog', 'cat', 'bird', 'rabbit', 'other'
  breed: varchar('breed', { length: 100 }),
  mixedBreed: boolean('mixed_breed').default(false),
  
  // Age information (more flexible)
  age: integer('age'), // in months for consistency
  ageUnit: varchar('age_unit', { length: 10 }).default('months'), // 'months', 'years'
  birthDate: timestamp('birth_date', { withTimezone: true }),
  ageEstimated: boolean('age_estimated').default(false),
  
  // Physical characteristics
  gender: varchar('gender', { length: 10 }).notNull(), // 'male', 'female'
  size: varchar('size', { length: 20 }), // 'small', 'medium', 'large', 'extra_large'
  weight: decimal('weight', { precision: 5, scale: 2 }), // in kg
  color: varchar('color', { length: 100 }),
  markings: text('markings'), // Special markings or features
  
  // Health information
  isVaccinated: boolean('is_vaccinated').default(false),
  isNeutered: boolean('is_neutered').default(false),
  isSpayed: boolean('is_spayed').default(false),
  healthStatus: varchar('health_status', { length: 50 }).default('healthy'),
  medicalHistory: text('medical_history'),
  specialNeeds: text('special_needs'),
  vetRecords: text('vet_records'), // JSON string for vet records
  
  // Behavioral traits
  goodWithKids: boolean('good_with_kids'),
  goodWithPets: boolean('good_with_pets'),
  goodWithCats: boolean('good_with_cats'),
  goodWithDogs: boolean('good_with_dogs'),
  energyLevel: varchar('energy_level', { length: 20 }), // 'low', 'medium', 'high'
  trainedLevel: varchar('trained_level', { length: 20 }), // 'not_trained', 'basic', 'advanced'
  houseTrained: boolean('house_trained').default(false),
  
  // Adoption information
  adoptionStatus: varchar('adoption_status', { length: 20 }).default('available'), // 'available', 'pending', 'adopted'
  adoptionFee: decimal('adoption_fee', { precision: 10, scale: 2 }).default('0'),
  isUrgent: boolean('is_urgent').default(false),
  urgentReason: text('urgent_reason'),
  
  // Location (can be different from owner's location)
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('India'),
  zipCode: varchar('zip_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  
  // Content and media
  description: text('description'),
  story: text('story'), // Pet's background story
  personalityTraits: text('personality_traits'), // JSON string
  primaryImage: text('primary_image'),
  
  // SEO and search optimization
  searchKeywords: text('search_keywords'), // For better search results
  slug: varchar('slug', { length: 200 }).unique(), // URL-friendly identifier
  
  // Engagement metrics
  viewCount: integer('view_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  inquiryCount: integer('inquiry_count').default(0),
  shareCount: integer('share_count').default(0),
  
  // Visibility and status
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  featuredUntil: timestamp('featured_until', { withTimezone: true }),
  
  // Admin fields
  moderationStatus: varchar('moderation_status', { length: 20 }).default('approved'), // 'pending', 'approved', 'rejected'
  moderationNotes: text('moderation_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  adoptedAt: timestamp('adopted_at', { withTimezone: true }),
  adoptedBy: varchar('adopted_by', { length: 128 }).references(() => users.id)
}, (table) => ({
  // Indexes for performance optimization
  ownerIdx: index('pets_owner_idx').on(table.ownerId),
  statusIdx: index('pets_status_idx').on(table.adoptionStatus),
  locationIdx: index('pets_location_idx').on(table.city, table.state),
  speciesIdx: index('pets_species_idx').on(table.species),
  featuredIdx: index('pets_featured_idx').on(table.isFeatured),
  activeIdx: index('pets_active_idx').on(table.isActive),
  createdIdx: index('pets_created_idx').on(table.createdAt)
}));

// Pet images table for multiple images per pet
const petImages = pgTable('pet_images', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Image information
  imageUrl: text('image_url').notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 255 }),
  thumbnailUrl: text('thumbnail_url'),
  caption: varchar('caption', { length: 255 }),
  altText: varchar('alt_text', { length: 255 }), // For accessibility
  
  // Image metadata
  isPrimary: boolean('is_primary').default(false),
  sortOrder: integer('sort_order').default(0),
  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size'), // in bytes
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  petIdx: index('pet_images_pet_idx').on(table.petId),
  primaryIdx: index('pet_images_primary_idx').on(table.isPrimary)
}));

// Pet categories for better organization
const petCategories = pgTable('pet_categories', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  color: varchar('color', { length: 7 }), // Hex color code
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Pet favorites (user's favorite pets)
const petFavorites = pgTable('pet_favorites', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  userIdx: index('pet_favorites_user_idx').on(table.userId),
  petIdx: index('pet_favorites_pet_idx').on(table.petId),
  uniqueFavorite: index('pet_favorites_unique_idx').on(table.userId, table.petId)
}));

module.exports = {
  pets,
  petImages,
  petCategories,
  petFavorites
};
