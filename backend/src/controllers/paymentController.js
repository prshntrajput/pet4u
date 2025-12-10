const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { payments, refunds, pets, users } = require('../models');
const paymentService = require('../services/paymentService');
const { logger } = require('../config/logger');
const { eq, and, desc } = require('drizzle-orm');

const paymentController = {
  // Create payment order
  createPaymentOrder: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { petId, amount, paymentType = 'adoption_fee', description } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount',
          requestId
        });
      }

      // If pet adoption fee, verify pet exists
      let pet = null;
      if (paymentType === 'adoption_fee' && petId) {
        const petResult = await db
          .select()
          .from(pets)
          .where(eq(pets.id, petId))
          .limit(1);

        if (petResult.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Pet not found',
            requestId
          });
        }

        pet = petResult[0];
      }

      // Create payment record
      const paymentId = createId();
      
      // Create Razorpay order
      const orderResult = await paymentService.createOrder({
        amount,
        currency: 'INR',
        receipt: paymentId,
        notes: {
          userId,
          petId: petId || '',
          paymentType,
        }
      });

      if (!orderResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order',
          requestId
        });
      }

      // Save to database
      await db.insert(payments).values({
        id: paymentId,
        userId,
        petId: petId || null,
        shelterId: pet?.ownerId || null,
        paymentType,
        amount: String(amount),
        currency: 'INR',
        razorpayOrderId: orderResult.order.id,
        status: 'pending',
        description: description || null,
      });

      logger.info('Payment order created', { paymentId, userId, amount, requestId });

      res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          paymentId,
          orderId: orderResult.order.id,
          amount: orderResult.order.amount,
          currency: orderResult.order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        requestId
      });

    } catch (error) {
      logger.error('Create payment order error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        requestId
      });
    }
  },

  // Verify payment
  verifyPayment: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { paymentId, orderId, signature } = req.body;

      // Verify signature
      const isValid = paymentService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
          requestId
        });
      }

      // Update payment record
      const updated = await db
        .update(payments)
        .set({
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          status: 'success',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(payments.razorpayOrderId, orderId),
          eq(payments.userId, userId)
        ))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found',
          requestId
        });
      }

      logger.info('Payment verified successfully', { paymentId, orderId, userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: updated[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Verify payment error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        requestId
      });
    }
  },

  // Get user payments
  getUserPayments: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const userPayments = await db
        .select({
          payment: payments,
          pet: pets,
        })
        .from(payments)
        .leftJoin(pets, eq(payments.petId, pets.id))
        .where(eq(payments.userId, userId))
        .orderBy(desc(payments.createdAt));

      res.status(200).json({
        success: true,
        message: 'Payments fetched successfully',
        data: {
          payments: userPayments.map(p => ({
            ...p.payment,
            pet: p.pet,
          }))
        },
        requestId
      });

    } catch (error) {
      logger.error('Get user payments error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        requestId
      });
    }
  },

  // Get shelter payments
  getShelterPayments: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;

    try {
      const shelterPayments = await db
        .select({
          payment: payments,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          pet: pets,
        })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .leftJoin(pets, eq(payments.petId, pets.id))
        .where(eq(payments.shelterId, shelterId))
        .orderBy(desc(payments.createdAt));

      res.status(200).json({
        success: true,
        message: 'Payments fetched successfully',
        data: {
          payments: shelterPayments.map(p => ({
            ...p.payment,
            user: p.user,
            pet: p.pet,
          }))
        },
        requestId
      });

    } catch (error) {
      logger.error('Get shelter payments error:', { error: error.message, shelterId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        requestId
      });
    }
  },
};

module.exports = paymentController;
