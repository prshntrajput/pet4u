const { pgTable, varchar, timestamp, boolean, text, integer, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');
const { pets } = require('./pets');
const { adoptionRequests } = require('./adoptionRequests');

// Shelter-defined recurring availability slots (e.g., "Mon 10am–12pm")
const availabilitySlots = pgTable('availability_slots', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  shelterId: varchar('shelter_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),

  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun … 6=Sat
  startTime: varchar('start_time', { length: 5 }).notNull(), // "HH:MM" 24h
  endTime: varchar('end_time', { length: 5 }).notNull(),
  maxBookings: integer('max_bookings').default(3),
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  shelterIdx: index('avail_shelter_idx').on(table.shelterId),
  dayIdx: index('avail_day_idx').on(table.dayOfWeek)
}));

// Individual booked appointment
const appointments = pgTable('appointments', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  shelterId: varchar('shelter_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  adopterId: varchar('adopter_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, { onDelete: 'cascade' }).notNull(),
  adoptionRequestId: varchar('adoption_request_id', { length: 128 }).references(() => adoptionRequests.id, { onDelete: 'set null' }),

  // Scheduled time
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(), // "HH:MM"
  endTime: varchar('end_time', { length: 5 }).notNull(),

  // Location
  location: text('location'),
  isVirtual: boolean('is_virtual').default(false),
  meetingLink: text('meeting_link'),

  // Status
  // 'pending' = awaiting shelter confirmation
  // 'confirmed' = shelter confirmed
  // 'cancelled_by_adopter' | 'cancelled_by_shelter'
  // 'completed' | 'no_show'
  status: varchar('status', { length: 30 }).default('pending').notNull(),

  // Notes
  adopterNotes: text('adopter_notes'),
  shelterNotes: text('shelter_notes'),
  cancellationReason: text('cancellation_reason'),

  // Timestamps
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  shelterIdx: index('appt_shelter_idx').on(table.shelterId),
  adopterIdx: index('appt_adopter_idx').on(table.adopterId),
  petIdx: index('appt_pet_idx').on(table.petId),
  statusIdx: index('appt_status_idx').on(table.status),
  dateIdx: index('appt_date_idx').on(table.scheduledDate)
}));

module.exports = { availabilitySlots, appointments };
