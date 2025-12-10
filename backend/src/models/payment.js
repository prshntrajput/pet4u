const { pgTable, varchar, timestamp, decimal, text, boolean, index } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');
const { pets } = require('./pets')
// Payments/Donations table
const payments = pgTable('payments', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Relationships
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'set null'
  }),
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, {
    onDelete: 'set null'
  }),
  shelterId: varchar('shelter_id', { length: 128 }).references(() => users.id, {
    onDelete: 'set null'
  }),
  
  // Payment details
  paymentType: varchar('payment_type', { length: 50 }).notNull(), // 'adoption_fee', 'donation'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR'),
  
  // Razorpay details
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  razorpaySignature: varchar('razorpay_signature', { length: 500 }),
  
  // Payment status
  status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending', 'success', 'failed', 'refunded'
  
  // Additional info
  description: text('description'),
  metadata: text('metadata'), // JSON for additional data
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => ({
  userIdx: index('payments_user_idx').on(table.userId),
  petIdx: index('payments_pet_idx').on(table.petId),
  shelterIdx: index('payments_shelter_idx').on(table.shelterId),
  statusIdx: index('payments_status_idx').on(table.status),
  createdIdx: index('payments_created_idx').on(table.createdAt),
}));

// Refunds table
const refunds = pgTable('refunds', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  paymentId: varchar('payment_id', { length: 128 }).references(() => payments.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  
  razorpayRefundId: varchar('razorpay_refund_id', { length: 255 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (table) => ({
  paymentIdx: index('refunds_payment_idx').on(table.paymentId),
}));

module.exports = {
  payments,
  refunds,
};
