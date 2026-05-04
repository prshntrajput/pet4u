const messageService = require('../services/messageService');
const { logger } = require('../config/logger');

const messageController = {
  sendMessage: async (req, res) => {
    const requestId = req.requestId;
    const senderId = req.user.userId;
    try {
      const message = await messageService.sendMessage(senderId, req.body);
      logger.info('Message sent successfully', { senderId, receiverId: req.body.receiverId, messageId: message.id, requestId });
      res.status(201).json({ success: true, message: 'Message sent successfully', data: { message }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Send message error', { err: error, senderId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to send message', requestId });
    }
  },

  getConversation: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { otherUserId } = req.params;
    try {
      const result = await messageService.getConversation(userId, otherUserId, req.query);
      res.status(200).json({ success: true, message: 'Conversation fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get conversation error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch conversation', requestId });
    }
  },

  getConversations: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const result = await messageService.getConversations(userId, req.query);
      res.status(200).json({ success: true, message: 'Conversations fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get conversations error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch conversations', requestId });
    }
  },

  markAsRead: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { otherUserId } = req.params;
    try {
      await messageService.markAsRead(userId, otherUserId);
      res.status(200).json({ success: true, message: 'Messages marked as read', requestId });
    } catch (error) {
      logger.error('Mark as read error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to mark messages as read', requestId });
    }
  },

  deleteMessage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { messageId } = req.params;
    try {
      await messageService.deleteMessage(userId, messageId);
      logger.info('Message deleted', { userId, messageId, requestId });
      res.status(200).json({ success: true, message: 'Message deleted successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Delete message error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to delete message', requestId });
    }
  },

  canMessage: async (req, res) => {
    const requestId = req.requestId;
    const senderId = req.user.userId;
    const { otherUserId } = req.params;
    try {
      const permission = await messageService.canMessage(senderId, otherUserId);
      res.status(200).json({ success: true, data: { canMessage: permission.allowed, reason: permission.reason || null }, requestId });
    } catch (error) {
      logger.error('Can message check error', { err: error, senderId, requestId });
      res.status(500).json({ success: false, message: 'Failed to check messaging permission', requestId });
    }
  },

  getUnreadCount: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const unreadCount = await messageService.getUnreadCount(userId);
      res.status(200).json({ success: true, message: 'Unread count fetched successfully', data: { unreadCount }, requestId });
    } catch (error) {
      logger.error('Get unread count error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch unread count', requestId });
    }
  },
};

module.exports = messageController;
