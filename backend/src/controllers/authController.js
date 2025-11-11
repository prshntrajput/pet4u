const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, userSessions } = require('../models');
const jwtUtils = require('../utils/jwt');
const { logger } = require('../config/logger');
const { eq, and } = require('drizzle-orm');

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

      // TODO: Send email verification (implement in next phase)
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please verify your email.',
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
