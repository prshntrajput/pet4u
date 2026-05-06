const { pgTable, varchar, timestamp, boolean, text, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');
const { pets } = require('./pets');
const { adoptionRequests } = require('./adoptionRequests');

const adoptionCheckIns = pgTable('adoption_check_ins', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),

  adoptionRequestId: varchar('adoption_request_id', { length: 128 })
    .references(() => adoptionRequests.id, { onDelete: 'cascade' }).notNull(),
  petId: varchar('pet_id', { length: 128 })
    .references(() => pets.id, { onDelete: 'cascade' }).notNull(),
  adopterId: varchar('adopter_id', { length: 128 })
    .references(() => users.id, { onDelete: 'cascade' }).notNull(),
  shelterId: varchar('shelter_id', { length: 128 })
    .references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Scheduling
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),

  // Status: 'pending' | 'submitted' | 'overdue'
  status: varchar('status', { length: 20 }).default('pending').notNull(),

  // '30_day' | '90_day' | '6_month'
  checkInType: varchar('check_in_type', { length: 20 }).notNull(),

  // Adopter responses
  overallWellbeing: varchar('overall_wellbeing', { length: 20 }), // 'excellent' | 'good' | 'fair' | 'poor'
  weight: varchar('weight', { length: 50 }),
  isEatingWell: boolean('is_eating_well'),
  isActive: boolean('is_active'),
  vetVisited: boolean('vet_visited').default(false),
  concerns: text('concerns'),
  happyMoments: text('happy_moments'),
  photoUrl: varchar('photo_url', { length: 500 }),

  // Shelter notes after reviewing
  shelterNotes: text('shelter_notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  requestIdx: index('checkins_request_idx').on(table.adoptionRequestId),
  adopterIdx: index('checkins_adopter_idx').on(table.adopterId),
  shelterIdx: index('checkins_shelter_idx').on(table.shelterId),
  statusIdx: index('checkins_status_idx').on(table.status),
}));

module.exports = { adoptionCheckIns };
