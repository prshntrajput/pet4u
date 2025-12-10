const Razorpay = require('razorpay');
const crypto = require('crypto');
const { logger } = require('../config/logger');

// ✅ Only initialize if credentials exist
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info('✅ Razorpay initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Razorpay:', error);
  }
} else {
  logger.warn('⚠️  Razorpay credentials not configured - payment features disabled');
}

const paymentService = {
  // ✅ Check if Razorpay is available
  isAvailable: () => razorpay !== null,

  // Create Razorpay order
  createOrder: async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      logger.error('Razorpay not configured');
      return {
        success: false,
        error: 'Payment service is not configured. Please contact support.',
      };
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
      };

      const order = await razorpay.orders.create(options);
      logger.info('Razorpay order created', { orderId: order.id, amount });
      
      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('Create Razorpay order error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Verify payment signature
  verifyPaymentSignature: ({ orderId, paymentId, signature }) => {
    // ✅ Check if Razorpay is initialized
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      logger.error('Razorpay not configured for signature verification');
      return false;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;
      
      if (isValid) {
        logger.info('Payment signature verified', { orderId, paymentId });
      } else {
        logger.warn('Invalid payment signature', { orderId, paymentId });
      }

      return isValid;
    } catch (error) {
      logger.error('Verify payment signature error:', error);
      return false;
    }
  },

  // Fetch payment details
  fetchPayment: async (paymentId) => {
    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment service is not configured',
      };
    }

    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      logger.error('Fetch payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Create refund
  createRefund: async (paymentId, amount) => {
    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment service is not configured',
      };
    }

    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // Convert to paise
      });

      logger.info('Refund created', { paymentId, amount, refundId: refund.id });
      
      return {
        success: true,
        refund,
      };
    } catch (error) {
      logger.error('Create refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Fetch refund details
  fetchRefund: async (refundId) => {
    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment service is not configured',
      };
    }

    try {
      const refund = await razorpay.refunds.fetch(refundId);
      return {
        success: true,
        refund,
      };
    } catch (error) {
      logger.error('Fetch refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = paymentService;
