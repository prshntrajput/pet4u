const express = require('express');
const router = express.Router();

// Import controllers and middleware
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const { sendMessageValidation } = require('../validations/adoptionValidation');

// Apply authentication and sanitization to all routes
router.use(authenticateToken);
router.use(sanitizeRequest);

// Send message
router.post('/',
  validate(sendMessageValidation),
  messageController.sendMessage
);

// Get all conversations (inbox)
router.get('/conversations',
  messageController.getConversations
);

// Get conversation with specific user
router.get('/conversations/:otherUserId',
  messageController.getConversation
);

// Mark messages as read
router.put('/conversations/:otherUserId/read',
  messageController.markAsRead
);

// Delete message
router.delete('/:messageId',
  messageController.deleteMessage
);

// Get unread message count
router.get('/unread/count',
  messageController.getUnreadCount
);

module.exports = router;
