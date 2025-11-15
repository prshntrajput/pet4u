const { pgTable, varchar, timestamp, integer, text, decimal, index, boolean } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users , shelters} = require('./users');
const { pets } = require('./pets');

// Pet reviews table
const petReviews = pgTable('pet_reviews', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Relationships
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, {
    onDelete: 'cascade'
  }).notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  adoptionRequestId: varchar('adoption_request_id', { length: 128 }),
  
  // Review content
  rating: integer('rating').notNull(), // 1-5
  title: varchar('title', { length: 200 }),
  comment: text('comment').notNull(),
  
  // Media
  images: text('images'), // JSON array of image URLs
  
  // Moderation
  isApproved: boolean('is_approved').default(true),
  moderationNotes: text('moderation_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  petIdx: index('pet_reviews_pet_idx').on(table.petId),
  userIdx: index('pet_reviews_user_idx').on(table.userId),
  ratingIdx: index('pet_reviews_rating_idx').on(table.rating),
  createdIdx: index('pet_reviews_created_idx').on(table.createdAt),
}));

// Shelter reviews table
const shelterReviews = pgTable('shelter_reviews', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Relationships
  shelterId: varchar('shelter_id', { length: 128 }).references(() => shelters.id, {
    onDelete: 'cascade'
  }).notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Review content
  rating: integer('rating').notNull(), // 1-5
  title: varchar('title', { length: 200 }),
  comment: text('comment').notNull(),
  
  // Review categories
  communicationRating: integer('communication_rating'),
  facilityRating: integer('facility_rating'),
  processRating: integer('process_rating'),
  
  // Media
  images: text('images'), // JSON array of image URLs
  
  // Moderation
  isApproved: boolean('is_approved').default(true),
  moderationNotes: text('moderation_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  shelterIdx: index('shelter_reviews_shelter_idx').on(table.shelterId),
  userIdx: index('shelter_reviews_user_idx').on(table.userId),
  ratingIdx: index('shelter_reviews_rating_idx').on(table.rating),
  createdIdx: index('shelter_reviews_created_idx').on(table.createdAt),
}));

// Admin activity logs
const adminLogs = pgTable('admin_logs', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  adminId: varchar('admin_id', { length: 128 }).references(() => users.id, {
    onDelete: 'set null'
  }),
  
  // Action details
  action: varchar('action', { length: 100 }).notNull(), // 'user_suspended', 'pet_deleted', etc.
  entityType: varchar('entity_type', { length: 50 }), // 'user', 'pet', 'shelter', etc.
  entityId: varchar('entity_id', { length: 128 }),
  
  // Details
  description: text('description'),
  metadata: text('metadata'), // JSON for additional data
  ipAddress: varchar('ip_address', { length: 45 }),
  
  // Timestamp
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  adminIdx: index('admin_logs_admin_idx').on(table.adminId),
  actionIdx: index('admin_logs_action_idx').on(table.action),
  entityIdx: index('admin_logs_entity_idx').on(table.entityType, table.entityId),
  createdIdx: index('admin_logs_created_idx').on(table.createdAt),
}));

// Analytics/Statistics table
const statistics = pgTable('statistics', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Metrics
  date: timestamp('date', { withTimezone: true }).notNull(),
  totalUsers: integer('total_users').default(0),
  totalShelters: integer('total_shelters').default(0),
  totalPets: integer('total_pets').default(0),
  totalAdoptions: integer('total_adoptions').default(0),
  totalRequests: integer('total_requests').default(0),
  activeUsers: integer('active_users').default(0),
  
  // Daily metrics
  newUsers: integer('new_users').default(0),
  newPets: integer('new_pets').default(0),
  newRequests: integer('new_requests').default(0),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  dateIdx: index('statistics_date_idx').on(table.date),
}));

module.exports = {
  petReviews,
  shelterReviews,
  adminLogs,
  statistics,
};
