const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

// Apply authentication and sanitization
router.use(authenticateToken);
router.use(sanitizeRequest);

// Shelter analytics
router.get('/shelter',
  requireRole('shelter'),
  analyticsController.getShelterAnalytics
);

// Pet metrics
router.get('/pet/:petId',
  analyticsController.getPetMetrics
);

module.exports = router;
