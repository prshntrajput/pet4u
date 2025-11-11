const { db } = require('../config/database');
const { notifications } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, desc, sql } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

const notificationController = {
  // Get user notifications
  getNotifications: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [eq(notifications.userId, userId)];

      if (unreadOnly === 'true') {
        conditions.push(eq(notifications.isRead, false));
      }

      const whereClause = and(...conditions);

      // Get notifications
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(notifications.createdAt));

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(notifications)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      // Get unread count
      const unreadCountResult = await db
        .select({ count: sql`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      const unreadCount = parseInt(unreadCountResult[0].count);

      res.status(200).json({
        success: true,
        message: 'Notifications fetched successfully',
        data: {
          notifications: userNotifications,
          unreadCount,
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
      logger.error('Get notifications error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        requestId
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { notificationId } = req.params;

    try {
      // Update notification
      const updated = await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          requestId
        });
      }

      // Emit real-time notification update via Socket.IO
      try {
        emitToUser(userId, 'notification:read', {
          notificationId: notificationId
        });
      } catch (socketError) {
        logger.warn('Failed to emit notification read socket event:', socketError);
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: {
          notification: updated[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Mark notification as read error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        requestId
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      // Emit real-time notification update via Socket.IO
      try {
        emitToUser(userId, 'notification:all_read', {
          userId: userId
        });
      } catch (socketError) {
        logger.warn('Failed to emit all notifications read socket event:', socketError);
      }

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        requestId
      });

    } catch (error) {
      logger.error('Mark all as read error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        requestId
      });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { notificationId } = req.params;

    try {
      const deleted = await db
        .delete(notifications)
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          requestId
        });
      }

      // Emit real-time notification delete via Socket.IO
      try {
        emitToUser(userId, 'notification:deleted', {
          notificationId: notificationId
        });
      } catch (socketError) {
        logger.warn('Failed to emit notification delete socket event:', socketError);
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete notification error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        requestId
      });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
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

module.exports = notificationController;
