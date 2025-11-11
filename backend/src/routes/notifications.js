const express = require('express');
const router = express.Router();

// Import controllers and middleware
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

// Apply authentication and sanitization to all routes
router.use(authenticateToken);
router.use(sanitizeRequest);

// Get all notifications
router.get('/',
  notificationController.getNotifications
);

// Get unread count
router.get('/unread/count',
  notificationController.getUnreadCount
);

// Mark notification as read
router.put('/:notificationId/read',
  notificationController.markAsRead
);

// Mark all notifications as read
router.put('/read-all',
  notificationController.markAllAsRead
);

// Delete notification
router.delete('/:notificationId',
  notificationController.deleteNotification
);

module.exports = router;
