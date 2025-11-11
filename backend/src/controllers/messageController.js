const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { messages, conversations, users, notifications } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, desc, sql, ne } = require('drizzle-orm');
const { emitToUser, emitToConversation } = require('../config/socket');

const messageController = {
  // Send message
  sendMessage: async (req, res) => {
    const requestId = req.requestId;
    const senderId = req.user.userId;

    try {
      const { receiverId, content, messageType = 'text', adoptionRequestId = null } = req.body;

      // Validate receiver exists
      const receiverExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(
          eq(users.id, receiverId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (receiverExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Receiver not found',
          requestId
        });
      }

      // Can't send message to yourself
      if (senderId === receiverId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot send a message to yourself',
          requestId
        });
      }

      // Create message
      const messageId = createId();
      const newMessage = await db
        .insert(messages)
        .values({
          id: messageId,
          senderId,
          receiverId,
          content: content.trim(),
          messageType,
          adoptionRequestId,
          isRead: false,
        })
        .returning();

      // Update or create conversation
      await updateConversation(senderId, receiverId, messageId, content);

      // Create notification for receiver
      const senderInfo = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, senderId))
        .limit(1);

      await db.insert(notifications).values({
        id: createId(),
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        message: `${senderInfo[0].name} sent you a message`,
        relatedId: messageId,
        relatedType: 'message',
        actionUrl: `/messages/${senderId}`,
      });

      // ✅ Emit real-time events ONLY to receiver, not to sender
      try {
        // Send new message event to receiver only
        emitToUser(receiverId, 'message:new', {
          message: newMessage[0],
          sender: {
            id: senderId,
            name: senderInfo[0].name
          }
        });
        
        // Send notification to receiver only
        emitToUser(receiverId, 'message:notification', {
          senderId,
          senderName: senderInfo[0].name,
          messagePreview: content.substring(0, 50)
        });

        logger.debug('Socket events emitted to receiver', { 
          receiverId, 
          senderId,
          messageId 
        });
      } catch (socketError) {
        logger.warn('Failed to emit socket event:', socketError);
      }

      logger.info('Message sent successfully', {
        senderId,
        receiverId,
        messageId,
        requestId
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          message: newMessage[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Send message error:', { error: error.message, senderId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        requestId
      });
    }
  },

  // Get conversation with a user
  getConversation: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get messages between two users
      const conversationMessages = await db
        .select({
          message: messages,
          sender: {
            id: users.id,
            name: users.name,
            profileImage: users.profileImage,
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(
          or(
            and(
              eq(messages.senderId, userId),
              eq(messages.receiverId, otherUserId)
            ),
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId)
            )
          )
        )
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(messages.createdAt));

      // Mark messages as read
      await db
        .update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, otherUserId),
          eq(messages.isRead, false)
        ));

      // Update conversation unread count
      await updateConversationReadStatus(userId, otherUserId);

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, userId),
              eq(messages.receiverId, otherUserId)
            ),
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId)
            )
          )
        );

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Conversation fetched successfully',
        data: {
          messages: conversationMessages.map(m => ({
            ...m.message,
            sender: m.sender
          })).reverse(), // Reverse to show oldest first
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get conversation error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation',
        requestId
      });
    }
  },

  // Get all conversations (inbox)
  getConversations: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get conversations
      const userConversations = await db
        .select()
        .from(conversations)
        .where(
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(conversations.lastMessageAt));

      // Get other user details for each conversation
      const conversationsWithDetails = await Promise.all(
        userConversations.map(async (conv) => {
          const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
          const unreadCount = conv.user1Id === userId ? conv.user1UnreadCount : conv.user2UnreadCount;

          const otherUserInfo = await db
            .select({
              id: users.id,
              name: users.name,
              profileImage: users.profileImage,
              role: users.role,
            })
            .from(users)
            .where(eq(users.id, otherUserId))
            .limit(1);

          return {
            ...conv,
            otherUser: otherUserInfo[0],
            unreadCount,
          };
        })
      );

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(conversations)
        .where(
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        );

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Conversations fetched successfully',
        data: {
          conversations: conversationsWithDetails,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get conversations error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        requestId
      });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    try {
      // Mark all messages from otherUser as read
      await db
        .update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, otherUserId),
          eq(messages.isRead, false)
        ));

      // Update conversation unread count
      await updateConversationReadStatus(userId, otherUserId);

      res.status(200).json({
        success: true,
        message: 'Messages marked as read',
        requestId
      });

    } catch (error) {
      logger.error('Mark as read error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read',
        requestId
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { messageId } = req.params;

    try {
      // Check if message belongs to user
      const messageToDelete = await db
        .select()
        .from(messages)
        .where(and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId)
        ))
        .limit(1);

      if (messageToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Message not found or you do not have permission to delete it',
          requestId
        });
      }

      // Delete message
      await db
        .delete(messages)
        .where(eq(messages.id, messageId));

      logger.info('Message deleted', { userId, messageId, requestId });

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete message error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        requestId
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(messages)
        .where(and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        ));

      const unreadCount = parseInt(countResult[0].count);

      res.status(200).json({
        success: true,
        message: 'Unread count fetched successfully',
        data: {
          unreadCount
        },
        requestId
      });

    } catch (error) {
      logger.error('Get unread count error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        requestId
      });
    }
  },
};

// Helper function to update or create conversation
async function updateConversation(senderId, receiverId, messageId, messageContent) {
  try {
    // Find existing conversation
    const existingConv = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.user1Id, senderId),
            eq(conversations.user2Id, receiverId)
          ),
          and(
            eq(conversations.user1Id, receiverId),
            eq(conversations.user2Id, senderId)
          )
        )
      )
      .limit(1);

    if (existingConv.length > 0) {
      // Update existing conversation
      const conv = existingConv[0];
      const updateData = {
        lastMessageId: messageId,
        lastMessageContent: messageContent.substring(0, 100),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      };

      // Increment unread count for receiver
      if (conv.user1Id === receiverId) {
        updateData.user1UnreadCount = sql`${conversations.user1UnreadCount} + 1`;
      } else {
        updateData.user2UnreadCount = sql`${conversations.user2UnreadCount} + 1`;
      }

      await db
        .update(conversations)
        .set(updateData)
        .where(eq(conversations.id, conv.id));
    } else {
      // Create new conversation
      await db.insert(conversations).values({
        id: createId(),
        user1Id: senderId,
        user2Id: receiverId,
        lastMessageId: messageId,
        lastMessageContent: messageContent.substring(0, 100),
        lastMessageAt: new Date(),
        user1UnreadCount: 0,
        user2UnreadCount: 1,
      });
    }
  } catch (error) {
    logger.error('Update conversation error:', error);
  }
}

// Helper function to update conversation read status
async function updateConversationReadStatus(userId, otherUserId) {
  try {
    const conv = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, otherUserId)
          ),
          and(
            eq(conversations.user1Id, otherUserId),
            eq(conversations.user2Id, userId)
          )
        )
      )
      .limit(1);

    if (conv.length > 0) {
      const conversation = conv[0];
      const updateData = {};

      if (conversation.user1Id === userId) {
        updateData.user1UnreadCount = 0;
      } else {
        updateData.user2UnreadCount = 0;
      }

      await db
        .update(conversations)
        .set(updateData)
        .where(eq(conversations.id, conversation.id));
    }
  } catch (error) {
    logger.error('Update conversation read status error:', error);
  }
}

module.exports = messageController;
