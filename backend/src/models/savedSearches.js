const { pgTable, varchar, timestamp, boolean, integer, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');

const savedSearches = pgTable('saved_searches', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),

  // Filter criteria
  species: varchar('species', { length: 50 }),
  breed: varchar('breed', { length: 100 }),
  gender: varchar('gender', { length: 20 }),
  size: varchar('size', { length: 30 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  minAge: integer('min_age'),
  maxAge: integer('max_age'),

  isActive: boolean('is_active').default(true),
  lastNotifiedAt: timestamp('last_notified_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index('saved_searches_user_idx').on(table.userId),
  isActiveIdx: index('saved_searches_active_idx').on(table.isActive),
}));

module.exports = { savedSearches };
