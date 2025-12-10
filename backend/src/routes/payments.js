const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');
const { paymentLimiter } = require('../middleware/security');
const paymentService = require('../services/paymentService'); // ✅ Import service

// ✅ Middleware to check if payment service is available
const checkPaymentAvailability = (req, res, next) => {
  if (!paymentService.isAvailable()) {
    return res.status(503).json({
      success: false,
      message: 'Payment service is currently unavailable. Please contact support.',
      requestId: req.requestId || 'N/A'
    });
  }
  next();
};

// Apply authentication and sanitization
router.use(authenticateToken);
router.use(sanitizeRequest);

// ✅ Check payment availability before applying rate limiter
router.use(checkPaymentAvailability);
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
