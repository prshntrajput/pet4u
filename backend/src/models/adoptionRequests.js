const { pgTable, varchar, timestamp, boolean, text, index, integer } = require('drizzle-orm/pg-core');
const { createId } = require('@paralleldrive/cuid2');
const { users } = require('./users');
const { pets } = require('./pets');

// Adoption requests table
const adoptionRequests = pgTable('adoption_requests', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Relationships
  petId: varchar('pet_id', { length: 128 }).references(() => pets.id, {
    onDelete: 'cascade'
  }).notNull(),
  adopterId: varchar('adopter_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  shelterId: varchar('shelter_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Request details
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'approved', 'rejected', 'withdrawn'
  
  // Response from shelter
  responseMessage: text('response_message'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  
  // Meeting details (if approved)
  meetingScheduled: boolean('meeting_scheduled').default(false),
  meetingDate: timestamp('meeting_date', { withTimezone: true }),
  meetingLocation: text('meeting_location'),
  meetingNotes: text('meeting_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  petIdx: index('adoption_requests_pet_idx').on(table.petId),
  adopterIdx: index('adoption_requests_adopter_idx').on(table.adopterId),
  shelterIdx: index('adoption_requests_shelter_idx').on(table.shelterId),
  statusIdx: index('adoption_requests_status_idx').on(table.status),
  createdIdx: index('adoption_requests_created_idx').on(table.createdAt),
}));

// Messages table for chat
const messages = pgTable('messages', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Relationships
  senderId: varchar('sender_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  receiverId: varchar('receiver_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Optional: Link to adoption request
  adoptionRequestId: varchar('adoption_request_id', { length: 128 }).references(() => adoptionRequests.id, {
    onDelete: 'set null'
  }),
  
  // Message content
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 20 }).default('text').notNull(), // 'text', 'image', 'file'
  
  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  senderIdx: index('messages_sender_idx').on(table.senderId),
  receiverIdx: index('messages_receiver_idx').on(table.receiverId),
  requestIdx: index('messages_request_idx').on(table.adoptionRequestId),
  createdIdx: index('messages_created_idx').on(table.createdAt),
}));

// Conversations table (for easier querying)
const conversations = pgTable('conversations', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Participants
  user1Id: varchar('user1_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  user2Id: varchar('user2_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Last message info
  lastMessageId: varchar('last_message_id', { length: 128 }),
  lastMessageContent: text('last_message_content'),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  
  // Unread counts
  user1UnreadCount: integer('user1_unread_count').default(0),
  user2UnreadCount: integer('user2_unread_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  user1Idx: index('conversations_user1_idx').on(table.user1Id),
  user2Idx: index('conversations_user2_idx').on(table.user2Id),
  updatedIdx: index('conversations_updated_idx').on(table.updatedAt),
}));

// Notifications table
const notifications = pgTable('notifications', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  
  // Recipient
  userId: varchar('user_id', { length: 128 }).references(() => users.id, {
    onDelete: 'cascade'
  }).notNull(),
  
  // Notification details
  type: varchar('type', { length: 50 }).notNull(), // 'adoption_request', 'message', 'request_approved', 'request_rejected'
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  
  // Related entities
  relatedId: varchar('related_id', { length: 128 }), // ID of related entity (request, message, etc.)
  relatedType: varchar('related_type', { length: 50 }), // Type of related entity
  
  // Action URL
  actionUrl: varchar('action_url', { length: 500 }),
  
  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  typeIdx: index('notifications_type_idx').on(table.type),
  isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  createdIdx: index('notifications_created_idx').on(table.createdAt),
}));

module.exports = {
  adoptionRequests,
  messages,
  conversations,
  notifications,
};
