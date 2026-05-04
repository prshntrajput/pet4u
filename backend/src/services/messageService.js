const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { messages, conversations, users, notifications, adoptionRequests } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, desc, sql } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

async function checkMessagePermission(senderId, receiverId) {
  const [senderRows, receiverRows] = await Promise.all([
    db.select({ role: users.role }).from(users).where(eq(users.id, senderId)).limit(1),
    db.select({ role: users.role }).from(users).where(eq(users.id, receiverId)).limit(1),
  ]);

  if (!senderRows.length || !receiverRows.length) return { allowed: false, reason: 'User not found' };

  const senderRole   = senderRows[0].role;
  const receiverRole = receiverRows[0].role;
  const isAdopterShelterPair =
    (senderRole === 'adopter' && receiverRole === 'shelter') ||
    (senderRole === 'shelter' && receiverRole === 'adopter');

  if (!isAdopterShelterPair) return { allowed: true };

  const adopterId = senderRole === 'adopter' ? senderId : receiverId;
  const shelterId = senderRole === 'shelter' ? senderId : receiverId;

  const approved = await db.select({ id: adoptionRequests.id })
    .from(adoptionRequests)
    .where(and(eq(adoptionRequests.adopterId, adopterId), eq(adoptionRequests.shelterId, shelterId), eq(adoptionRequests.status, 'approved')))
    .limit(1);

  if (approved.length === 0) return { allowed: false, reason: 'Messaging is only available after an adoption request has been approved' };
  return { allowed: true };
}

async function upsertConversation(senderId, receiverId, messageId, messageContent) {
  const existing = await db.select().from(conversations)
    .where(or(
      and(eq(conversations.user1Id, senderId), eq(conversations.user2Id, receiverId)),
      and(eq(conversations.user1Id, receiverId), eq(conversations.user2Id, senderId)),
    )).limit(1);

  if (existing.length > 0) {
    const conv = existing[0];
    const update = {
      lastMessageId: messageId,
      lastMessageContent: messageContent.substring(0, 100),
      lastMessageAt: new Date(), updatedAt: new Date(),
    };
    if (conv.user1Id === receiverId) {
      update.user1UnreadCount = sql`${conversations.user1UnreadCount} + 1`;
    } else {
      update.user2UnreadCount = sql`${conversations.user2UnreadCount} + 1`;
    }
    await db.update(conversations).set(update).where(eq(conversations.id, conv.id));
  } else {
    await db.insert(conversations).values({
      id: createId(), user1Id: senderId, user2Id: receiverId,
      lastMessageId: messageId, lastMessageContent: messageContent.substring(0, 100),
      lastMessageAt: new Date(), user1UnreadCount: 0, user2UnreadCount: 1,
    });
  }
}

async function resetUnreadCount(userId, otherUserId) {
  const conv = await db.select().from(conversations)
    .where(or(
      and(eq(conversations.user1Id, userId), eq(conversations.user2Id, otherUserId)),
      and(eq(conversations.user1Id, otherUserId), eq(conversations.user2Id, userId)),
    )).limit(1);

  if (conv.length > 0) {
    const c = conv[0];
    const field = c.user1Id === userId ? { user1UnreadCount: 0 } : { user2UnreadCount: 0 };
    await db.update(conversations).set(field).where(eq(conversations.id, c.id));
  }
}

const messageService = {
  canMessage: (senderId, receiverId) => checkMessagePermission(senderId, receiverId),

  sendMessage: async (senderId, { receiverId, content, messageType = 'text', adoptionRequestId = null }) => {
    const receiver = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.id, receiverId), eq(users.isActive, true))).limit(1);
    if (receiver.length === 0) throw Object.assign(new Error('Receiver not found'), { statusCode: 404 });
    if (senderId === receiverId)   throw Object.assign(new Error('You cannot send a message to yourself'), { statusCode: 400 });

    const permission = await checkMessagePermission(senderId, receiverId);
    if (!permission.allowed) throw Object.assign(new Error(permission.reason), { statusCode: 403 });

    const messageId = createId();
    const [newMessage] = await db.insert(messages).values({
      id: messageId, senderId, receiverId, content: content.trim(),
      messageType, adoptionRequestId, isRead: false,
    }).returning();

    await upsertConversation(senderId, receiverId, messageId, content);

    const [senderInfo] = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId)).limit(1);
    await db.insert(notifications).values({
      id: createId(), userId: receiverId, type: 'message', title: 'New Message',
      message: `${senderInfo.name} sent you a message`,
      relatedId: messageId, relatedType: 'message', actionUrl: `/messages/${senderId}`,
    });

    try {
      emitToUser(receiverId, 'message:new', { message: newMessage, sender: { id: senderId, name: senderInfo.name } });
      emitToUser(receiverId, 'message:notification', { senderId, senderName: senderInfo.name, messagePreview: content.substring(0, 50) });
    } catch (err) { logger.warn('Failed to emit socket event', { err: err.message }); }

    return newMessage;
  },

  getConversation: async (userId, otherUserId, { page = 1, limit = 50 }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pairCondition = or(
      and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
      and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId)),
    );

    const [rows, countResult] = await Promise.all([
      db.select({ message: messages, sender: { id: users.id, name: users.name, profileImage: users.profileImage } })
        .from(messages).innerJoin(users, eq(messages.senderId, users.id))
        .where(pairCondition).limit(parseInt(limit)).offset(offset).orderBy(desc(messages.createdAt)),
      db.select({ count: sql`count(*)` }).from(messages).where(pairCondition),
    ]);

    await db.update(messages)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(and(eq(messages.receiverId, userId), eq(messages.senderId, otherUserId), eq(messages.isRead, false)));
    await resetUnreadCount(userId, otherUserId);

    const totalCount = parseInt(countResult[0].count);
    return {
      messages: rows.map(m => ({ ...m.message, sender: m.sender })).reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount, limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    };
  },

  getConversations: async (userId, { page = 1, limit = 20 }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userFilter = or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId));

    const [rows, countResult] = await Promise.all([
      db.select().from(conversations).where(userFilter)
        .limit(parseInt(limit)).offset(offset).orderBy(desc(conversations.lastMessageAt)),
      db.select({ count: sql`count(*)` }).from(conversations).where(userFilter),
    ]);

    const withDetails = await Promise.all(rows.map(async (conv) => {
      const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
      const unreadCount = conv.user1Id === userId ? conv.user1UnreadCount : conv.user2UnreadCount;
      const [otherUser] = await db.select({ id: users.id, name: users.name, profileImage: users.profileImage, role: users.role })
        .from(users).where(eq(users.id, otherUserId)).limit(1);
      return { ...conv, otherUser, unreadCount };
    }));

    const totalCount = parseInt(countResult[0].count);
    return {
      conversations: withDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount, limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    };
  },

  markAsRead: async (userId, otherUserId) => {
    await db.update(messages)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(and(eq(messages.receiverId, userId), eq(messages.senderId, otherUserId), eq(messages.isRead, false)));
    await resetUnreadCount(userId, otherUserId);
  },

  deleteMessage: async (userId, messageId) => {
    const result = await db.select().from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId))).limit(1);
    if (result.length === 0) throw Object.assign(new Error('Message not found or you do not have permission to delete it'), { statusCode: 404 });
    await db.delete(messages).where(eq(messages.id, messageId));
  },

  getUnreadCount: async (userId) => {
    const result = await db.select({ count: sql`count(*)` }).from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return parseInt(result[0].count);
  },
};

module.exports = messageService;
