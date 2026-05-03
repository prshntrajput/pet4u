const { pgTable, varchar, timestamp, boolean, text, decimal, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');

const lostFoundReports = pgTable('lost_found_reports', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  reporterId: varchar('reporter_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // 'lost' = owner lost their pet, 'found' = someone found a stray
  type: varchar('type', { length: 10 }).notNull(),

  // Pet details
  petName: varchar('pet_name', { length: 100 }),
  species: varchar('species', { length: 50 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  color: varchar('color', { length: 100 }),
  gender: varchar('gender', { length: 10 }),
  age: varchar('age', { length: 50 }),
  description: text('description').notNull(),
  microchipId: varchar('microchip_id', { length: 100 }),

  // Location details
  lastSeenAddress: text('last_seen_address'),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).default('India'),
  zipCode: varchar('zip_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),

  // When it happened
  incidentDate: timestamp('incident_date', { withTimezone: true }).notNull(),

  // Media
  images: text('images'), // JSON array of Cloudinary URLs
  primaryImage: text('primary_image'),

  // Contact
  contactName: varchar('contact_name', { length: 100 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  reward: decimal('reward', { precision: 10, scale: 2 }),
  rewardNotes: text('reward_notes'),

  // Resolution
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'resolved', 'expired'
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedNote: text('resolved_note'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  reporterIdx: index('lf_reporter_idx').on(table.reporterId),
  typeIdx: index('lf_type_idx').on(table.type),
  statusIdx: index('lf_status_idx').on(table.status),
  locationIdx: index('lf_location_idx').on(table.city, table.state),
  speciesIdx: index('lf_species_idx').on(table.species),
  createdIdx: index('lf_created_idx').on(table.createdAt)
}));

module.exports = { lostFoundReports };
