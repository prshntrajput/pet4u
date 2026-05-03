const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, userSessions, emailVerificationTokens, passwordResetTokens } = require('../models');
const jwtUtils = require('../utils/jwt');
const { logger } = require('../config/logger');
const { eq, and } = require('drizzle-orm');
const emailService = require('../services/emailServices');

const authController = {
  // User registration
  register: async (req, res) => {
    const requestId = req.requestId;
    logger.info('User registration attempt', { requestId });

    try {
      const { email, password, name, role, phone } = req.body;

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address',
          requestId
        });
      }

      // Hash password
      const saltRounds = 12; // High security for production
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = createId();
      const newUser = await db
        .insert(users)
        .values({
          id: userId,
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          role: role || 'adopter',
          phone: phone || null,
          isVerified: false,
          isActive: true,
          profileComplete: false
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          phone: users.phone,
          isVerified: users.isVerified,
          createdAt: users.createdAt
        });

      const userData = newUser[0];

      logger.info('User registered successfully', {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        requestId
      });

      // Create and store email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await db.insert(emailVerificationTokens).values({
        id: createId(),
        userId: userData.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isUsed: false
      });

      // Send welcome + verification email (non-blocking)
      emailService.sendWelcomeEmail(userData).catch((err) =>
        logger.error('Failed to send welcome email', { error: err.message, userId: userData.id })
      );
      emailService.sendVerificationEmail(userData, verificationToken).catch((err) =>
        logger.error('Failed to send verification email', { error: err.message, userId: userData.id })
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: userData
        },
        requestId
      });

    } catch (error) {
      logger.error('Registration error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        requestId
      });
    }
  },

  // User login
  login: async (req, res) => {
    const requestId = req.requestId;
    logger.info('User login attempt', { requestId });

    try {
      const { email, password } = req.body;
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;

      // Find user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          requestId
        });
      }

      const user = userResult[0];

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
          requestId
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          requestId
        });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      };

      const accessToken = jwtUtils.generateAccessToken(tokenPayload);
      const refreshToken = jwtUtils.generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      const deviceInfo = {
        userAgent,
        ipAddress,
        loginTime: new Date().toISOString()
      };

      await jwtUtils.storeRefreshToken(user.id, refreshToken, deviceInfo);

      // Store session in database for audit trail
      const sessionId = createId();
      await db.insert(userSessions).values({
        id: sessionId,
        userId: user.id,
        refreshToken: refreshToken.slice(-10), // Store only suffix for security
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress,
        userAgent,
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Update last login
      await db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // Remove password from response
      const { password: _, ...userResponse } = user;

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        sessionId,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
        requestId
      });

    } catch (error) {
      logger.error('Login error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
        requestId
      });
    }
  },

  // Token refresh
  refresh: async (req, res) => {
    const requestId = req.requestId;
    logger.info('Token refresh attempt', { requestId });

    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required',
          requestId
        });
      }

      // Verify refresh token
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          requestId
        });
      }

      // Check if token exists in Redis
      const tokenSuffix = refreshToken.slice(-10);
      const storedToken = await jwtUtils.getRefreshToken(decoded.userId, tokenSuffix);
      
      if (!storedToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found or expired',
          requestId
        });
      }

      // Get user data
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (userResult.length === 0 || !userResult[0].isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          requestId
        });
      }

      const user = userResult[0];

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      };

      const newAccessToken = jwtUtils.generateAccessToken(tokenPayload);
      const newRefreshToken = jwtUtils.generateRefreshToken(tokenPayload);

      // Store new refresh token and remove old one
      await jwtUtils.removeRefreshToken(user.id, refreshToken);
      await jwtUtils.storeRefreshToken(user.id, newRefreshToken, storedToken.deviceInfo);

      // Update session in database
      await db
        .update(userSessions)
        .set({ 
          refreshToken: newRefreshToken.slice(-10),
          lastUsedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(userSessions.userId, user.id),
          eq(userSessions.refreshToken, tokenSuffix)
        ));

      logger.info('Token refreshed successfully', {
        userId: user.id,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
        requestId
      });

    } catch (error) {
      logger.error('Token refresh error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        requestId
      });
    }
  },

  // User logout
  logout: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user?.userId;
    
    logger.info('User logout attempt', { userId, requestId });

    try {
      const { refreshToken, logoutFromAll = false } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];

      if (userId) {
        if (logoutFromAll) {
          // Logout from all devices
          await jwtUtils.removeAllRefreshTokens(userId);
          
          // Deactivate all sessions
          await db
            .update(userSessions)
            .set({ 
              isActive: false,
              updatedAt: new Date()
            })
            .where(eq(userSessions.userId, userId));
            
          logger.info('User logged out from all devices', { userId, requestId });
        } else if (refreshToken) {
          // Logout from current device only
          await jwtUtils.removeRefreshToken(userId, refreshToken);
          
          // Deactivate current session
          const tokenSuffix = refreshToken.slice(-10);
          await db
            .update(userSessions)
            .set({ 
              isActive: false,
              updatedAt: new Date()
            })
            .where(and(
              eq(userSessions.userId, userId),
              eq(userSessions.refreshToken, tokenSuffix)
            ));
            
          logger.info('User logged out from current device', { userId, requestId });
        }
      }

      // Blacklist current access token
      if (accessToken) {
        await jwtUtils.blacklistAccessToken(accessToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        requestId
      });

    } catch (error) {
      logger.error('Logout error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        requestId
      });
    }
  },

  // Verify email address via token link
  verifyEmail: async (req, res) => {
    const requestId = req.requestId;
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is required', requestId });
      }

      const tokenResult = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.token, token))
        .limit(1);

      if (tokenResult.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid verification token', requestId });
      }

      const tokenRecord = tokenResult[0];

      if (tokenRecord.isUsed) {
        return res.status(400).json({ success: false, message: 'Token has already been used', requestId });
      }

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Verification token has expired', requestId });
      }

      // Mark user as verified and token as used
      await db.update(users)
        .set({ isVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, tokenRecord.userId));

      await db.update(emailVerificationTokens)
        .set({ isUsed: true })
        .where(eq(emailVerificationTokens.id, tokenRecord.id));

      logger.info('Email verified successfully', { userId: tokenRecord.userId, requestId });

      res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.', requestId });
    } catch (error) {
      logger.error('Email verification error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Email verification failed', requestId });
    }
  },

  // Send password reset email
  forgotPassword: async (req, res) => {
    const requestId = req.requestId;
    try {
      const { email } = req.body;

      const userResult = await db
        .select({ id: users.id, email: users.email, name: users.name, isActive: users.isActive })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      // Always return success to prevent email enumeration
      if (userResult.length === 0 || !userResult[0].isActive) {
        return res.status(200).json({
          success: true,
          message: 'If this email is registered, you will receive a password reset link.',
          requestId
        });
      }

      const user = userResult[0];
      const resetToken = crypto.randomBytes(32).toString('hex');

      await db.insert(passwordResetTokens).values({
        id: createId(),
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        isUsed: false
      });

      emailService.sendPasswordResetEmail(user, resetToken).catch((err) =>
        logger.error('Failed to send password reset email', { error: err.message, userId: user.id })
      );

      logger.info('Password reset token created', { userId: user.id, requestId });

      res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive a password reset link.',
        requestId
      });
    } catch (error) {
      logger.error('Forgot password error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Request failed. Please try again.', requestId });
    }
  },

  // Reset password with token
  resetPassword: async (req, res) => {
    const requestId = req.requestId;
    try {
      const { token, newPassword } = req.body;

      const tokenResult = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);

      if (tokenResult.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid reset token', requestId });
      }

      const tokenRecord = tokenResult[0];

      if (tokenRecord.isUsed) {
        return res.status(400).json({ success: false, message: 'Token has already been used', requestId });
      }

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Reset token has expired', requestId });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, tokenRecord.userId));

      await db.update(passwordResetTokens)
        .set({ isUsed: true })
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      // Invalidate all existing sessions for security
      await jwtUtils.removeAllRefreshTokens(tokenRecord.userId);

      logger.info('Password reset successfully', { userId: tokenRecord.userId, requestId });

      res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.', requestId });
    } catch (error) {
      logger.error('Reset password error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Password reset failed. Please try again.', requestId });
    }
  },

  // Verify token and get user info
  verify: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user?.userId;

    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          requestId
        });
      }

      // Get user data
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          phone: users.phone,
          profileImage: users.profileImage,
          city: users.city,
          state: users.state,
          isVerified: users.isVerified,
          isActive: users.isActive,
          profileComplete: users.profileComplete,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0 || !userResult[0].isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive',
          requestId
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: userResult[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Token verification error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Token verification failed',
        requestId
      });
    }
  }
};

module.exports = authController;
