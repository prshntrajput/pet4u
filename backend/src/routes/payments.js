const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');
const { paymentLimiter } = require('../middleware/security');

// Apply authentication and sanitization
router.use(authenticateToken);
router.use(sanitizeRequest);
router.use(paymentLimiter); // Apply payment rate limiting

// Create payment order
router.post('/create-order', paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get user payments
router.get('/my-payments', paymentController.getUserPayments);

// Get shelter payments (shelters only)
router.get('/shelter-payments',
  requireRole('shelter'),
  paymentController.getShelterPayments
);

module.exports = router;
