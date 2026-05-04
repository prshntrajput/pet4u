const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { users, shelters } = require('../models');
const { logger } = require('../config/logger');
const { eq } = require('drizzle-orm');
const { cloudinaryUtils } = require('../config/cloudinary');
const jwtUtils = require('../utils/jwt');

const PROFILE_FIELDS = {
  id: users.id, email: users.email, name: users.name, role: users.role,
  phone: users.phone, profileImage: users.profileImage, address: users.address,
  city: users.city, state: users.state, country: users.country, zipCode: users.zipCode,
  latitude: users.latitude, longitude: users.longitude, isVerified: users.isVerified,
  isActive: users.isActive, profileComplete: users.profileComplete,
  createdAt: users.createdAt, lastLoginAt: users.lastLoginAt,
};

function extractCloudinaryPublicId(url) {
  const parts = url.split('/');
  const uploadIdx = parts.indexOf('upload');
  if (uploadIdx === -1 || uploadIdx >= parts.length - 1) return null;
  return parts.slice(uploadIdx + 2).join('/').replace(/\.[^/.]+$/, '');
}

const userService = {
  getProfile: async (userId) => {
    const result = await db.select(PROFILE_FIELDS).from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const userData = result[0];
    let shelterData = null;
    if (userData.role === 'shelter') {
      const shelterResult = await db.select().from(shelters).where(eq(shelters.userId, userId)).limit(1);
      shelterData = shelterResult[0] || null;
    }
    return { user: userData, shelter: shelterData };
  },

  updateProfile: async (userId, body) => {
    const { name, phone, address, city, state, zipCode } = body;
    const updateData = { updatedAt: new Date() };

    if (name      !== undefined) updateData.name     = name.trim();
    if (phone     !== undefined) updateData.phone    = phone || null;
    if (address   !== undefined) updateData.address  = address || null;
    if (city      !== undefined) updateData.city     = city || null;
    if (state     !== undefined) updateData.state    = state || null;
    if (zipCode   !== undefined) updateData.zipCode  = zipCode || null;
    if (name && city && state)   updateData.profileComplete = true;

    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning({
      id: users.id, email: users.email, name: users.name, role: users.role,
      phone: users.phone, profileImage: users.profileImage, address: users.address,
      city: users.city, state: users.state, country: users.country,
      zipCode: users.zipCode, profileComplete: users.profileComplete, updatedAt: users.updatedAt,
    });
    return updated;
  },

  uploadProfileImage: async (userId, cloudinaryResult) => {
    const [current] = await db.select({ profileImage: users.profileImage }).from(users).where(eq(users.id, userId)).limit(1);

    const [updated] = await db.update(users)
      .set({ profileImage: cloudinaryResult.secure_url, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id, profileImage: users.profileImage });

    if (current?.profileImage) {
      const oldPublicId = extractCloudinaryPublicId(current.profileImage);
      if (oldPublicId) {
        await cloudinaryUtils.deleteImage(oldPublicId).catch(err =>
          logger.warn('Failed to delete old profile image', { err: err.message })
        );
      }
    }

    return { imageUrl: updated.profileImage, publicId: cloudinaryResult.public_id };
  },

  deleteProfileImage: async (userId) => {
    const [current] = await db.select({ profileImage: users.profileImage }).from(users).where(eq(users.id, userId)).limit(1);
    if (!current?.profileImage) throw Object.assign(new Error('No profile image to delete'), { statusCode: 400 });

    const publicId = extractCloudinaryPublicId(current.profileImage);
    if (publicId) {
      await cloudinaryUtils.deleteImage(publicId).catch(err =>
        logger.warn('Failed to delete image from Cloudinary', { err: err.message })
      );
    }

    await db.update(users).set({ profileImage: null, updatedAt: new Date() }).where(eq(users.id, userId));
  },

  updateLocation: async (userId, body) => {
    const { address, city, state, country, zipCode, latitude, longitude } = body;
    const [updated] = await db.update(users).set({
      address: address || null, city, state, country: country || 'India',
      zipCode: zipCode || null,
      latitude:  latitude  ? String(latitude)  : null,
      longitude: longitude ? String(longitude) : null,
      updatedAt: new Date(),
    }).where(eq(users.id, userId)).returning({
      id: users.id, address: users.address, city: users.city, state: users.state,
      country: users.country, zipCode: users.zipCode, latitude: users.latitude, longitude: users.longitude,
    });
    return updated;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const result = await db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const valid = await bcrypt.compare(currentPassword, result[0].password);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, userId));
  },

  deleteAccount: async (userId, password, accessToken) => {
    const result = await db.select({ password: users.password, profileImage: users.profileImage })
      .from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    const valid = await bcrypt.compare(password, result[0].password);
    if (!valid) throw Object.assign(new Error('Password is incorrect'), { statusCode: 400 });

    if (result[0].profileImage) {
      const publicId = extractCloudinaryPublicId(result[0].profileImage);
      if (publicId) {
        await cloudinaryUtils.deleteImage(publicId).catch(err =>
          logger.warn('Failed to delete profile image during account deletion', { err: err.message })
        );
      }
    }

    await db.delete(users).where(eq(users.id, userId));
    await jwtUtils.removeAllRefreshTokens(userId);
    if (accessToken) await jwtUtils.blacklistAccessToken(accessToken, 900);
  },
};

module.exports = userService;
