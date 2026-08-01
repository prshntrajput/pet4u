const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, userSessions, emailVerificationTokens, passwordResetTokens, shelters } = require('../models');
const jwtUtils = require('../utils/jwt');
const { logger } = require('../config/logger');
const { eq, and } = require('drizzle-orm');
const emailService = require('./emailServices');

const USER_PUBLIC_FIELDS = {
  id: users.id, email: users.email, name: users.name, role: users.role,
  phone: users.phone, profileImage: users.profileImage, city: users.city,
  state: users.state, isVerified: users.isVerified, isActive: users.isActive,
  profileComplete: users.profileComplete, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt,
};

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@pet4u.local',
  name: 'Demo User',
  role: 'demo',
  isVerified: true,
  isActive: true,
  isDemo: true,
};

async function findActiveUserByEmail(email) {
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0] || null;
}

async function findActiveUserById(userId) {
  const result = await db.select(USER_PUBLIC_FIELDS).from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];
  return user?.isActive ? user : null;
}

const authService = {
  createDemoSession: () => {
    const tokenPayload = {
      userId: DEMO_USER.id,
      email: DEMO_USER.email,
      role: DEMO_USER.role,
      isVerified: true,
      isDemo: true,
    };

    return {
      user: DEMO_USER,
      accessToken: jwtUtils.generateAccessToken(tokenPayload),
      refreshToken: jwtUtils.generateRefreshToken(tokenPayload),
    };
  },

  register: async ({ email, password, name, role, phone }) => {
    const existing = await findActiveUserByEmail(email);
    if (existing) throw Object.assign(new Error('User already exists with this email address'), { statusCode: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = createId();

    const [userData] = await db.insert(users).values({
      id: userId, email: email.toLowerCase(), password: hashedPassword,
      name: name.trim(), role: role || 'adopter', phone: phone || null,
      isVerified: false, isActive: true, profileComplete: false,
    }).returning({
      id: users.id, email: users.email, name: users.name,
      role: users.role, phone: users.phone, isVerified: users.isVerified, createdAt: users.createdAt,
    });

    if (userData.role === 'shelter') {
      await db.insert(shelters).values({
        id: createId(), userId: userData.id, organizationName: userData.name,
        currentPetCount: 0, documentsVerified: false, verificationStatus: 'pending',
        averageRating: '0.00', totalReviews: 0,
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db.insert(emailVerificationTokens).values({
      id: createId(), userId: userData.id, token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), isUsed: false,
    });

    emailService.sendWelcomeEmail(userData).catch(err => logger.error('Failed to send welcome email', { err: err.message, userId: userData.id }));
    emailService.sendVerificationEmail(userData, verificationToken).catch(err => logger.error('Failed to send verification email', { err: err.message, userId: userData.id }));

    return userData;
  },

  login: async ({ email, password, userAgent, ipAddress }) => {
    const user = await findActiveUserByEmail(email);
    if (!user)          throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account is deactivated. Please contact support.'), { statusCode: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, isVerified: user.isVerified };
    const accessToken  = jwtUtils.generateAccessToken(tokenPayload);
    const refreshToken = jwtUtils.generateRefreshToken(tokenPayload);

    const deviceInfo = { userAgent, ipAddress, loginTime: new Date().toISOString() };
    await jwtUtils.storeRefreshToken(user.id, refreshToken, deviceInfo);

    const sessionId = createId();
    await db.insert(userSessions).values({
      id: sessionId, userId: user.id, refreshToken: refreshToken.slice(-10),
      deviceInfo: JSON.stringify(deviceInfo), ipAddress, userAgent, isActive: true,
      lastUsedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    const { password: _pw, ...userResponse } = user;
    return { user: userResponse, accessToken, refreshToken };
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) throw Object.assign(new Error('Refresh token is required'), { statusCode: 401 });

    const decoded = jwtUtils.verifyRefreshToken(refreshToken);
    if (!decoded) throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });

    if (decoded.isDemo) {
      return authService.createDemoSession();
    }

    const tokenSuffix  = refreshToken.slice(-10);
    const storedToken  = await jwtUtils.getRefreshToken(decoded.userId, tokenSuffix);
    if (!storedToken) throw Object.assign(new Error('Refresh token not found or expired'), { statusCode: 401 });

    const user = await findActiveUserById(decoded.userId);
    if (!user) throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });

    const tokenPayload  = { userId: user.id, email: user.email, role: user.role, isVerified: user.isVerified };
    const newAccess     = jwtUtils.generateAccessToken(tokenPayload);
    const newRefresh    = jwtUtils.generateRefreshToken(tokenPayload);

    await jwtUtils.removeRefreshToken(user.id, refreshToken);
    await jwtUtils.storeRefreshToken(user.id, newRefresh, storedToken.deviceInfo);

    await db.update(userSessions)
      .set({ refreshToken: newRefresh.slice(-10), lastUsedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(userSessions.userId, user.id), eq(userSessions.refreshToken, tokenSuffix)));

    return { accessToken: newAccess, refreshToken: newRefresh };
  },

  logout: async ({ userId, refreshToken, logoutFromAll, accessToken }) => {
    if (userId) {
      if (logoutFromAll) {
        await jwtUtils.removeAllRefreshTokens(userId);
        await db.update(userSessions).set({ isActive: false, updatedAt: new Date() }).where(eq(userSessions.userId, userId));
      } else if (refreshToken) {
        await jwtUtils.removeRefreshToken(userId, refreshToken);
        const tokenSuffix = refreshToken.slice(-10);
        await db.update(userSessions)
          .set({ isActive: false, updatedAt: new Date() })
          .where(and(eq(userSessions.userId, userId), eq(userSessions.refreshToken, tokenSuffix)));
      }
    }
    if (accessToken) await jwtUtils.blacklistAccessToken(accessToken);
  },

  verifyEmail: async (token) => {
    if (!token) throw Object.assign(new Error('Verification token is required'), { statusCode: 400 });

    const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('Invalid verification token'), { statusCode: 400 });

    const record = result[0];
    if (record.isUsed)                          throw Object.assign(new Error('Token has already been used'), { statusCode: 400 });
    if (new Date(record.expiresAt) < new Date()) throw Object.assign(new Error('Verification token has expired'), { statusCode: 400 });

    await db.update(users).set({ isVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, record.userId));
    await db.update(emailVerificationTokens).set({ isUsed: true }).where(eq(emailVerificationTokens.id, record.id));
  },

  forgotPassword: async (email) => {
    const result = await db.select({ id: users.id, email: users.email, name: users.name, isActive: users.isActive })
      .from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!result.length || !result[0].isActive) return;

    const user = result[0];
    const resetToken = crypto.randomBytes(32).toString('hex');

    await db.insert(passwordResetTokens).values({
      id: createId(), userId: user.id, token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), isUsed: false,
    });

    emailService.sendPasswordResetEmail(user, resetToken)
      .catch(err => logger.error('Failed to send password reset email', { err: err.message, userId: user.id }));
  },

  resetPassword: async (token, newPassword) => {
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('Invalid reset token'), { statusCode: 400 });

    const record = result[0];
    if (record.isUsed)                          throw Object.assign(new Error('Token has already been used'), { statusCode: 400 });
    if (new Date(record.expiresAt) < new Date()) throw Object.assign(new Error('Reset token has expired'), { statusCode: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, record.userId));
    await db.update(passwordResetTokens).set({ isUsed: true }).where(eq(passwordResetTokens.id, record.id));
    await jwtUtils.removeAllRefreshTokens(record.userId);
  },

  getUserById: (userId) => userId === DEMO_USER.id ? DEMO_USER : findActiveUserById(userId),
};

module.exports = authService;
