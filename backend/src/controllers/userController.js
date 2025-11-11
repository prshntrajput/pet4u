const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { users, shelters } = require('../models');
const { logger } = require('../config/logger');
const { eq, and } = require('drizzle-orm');
const { cloudinaryUtils } = require('../config/cloudinary');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      // Get user data
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          phone: users.phone,
          profileImage: users.profileImage,
          address: users.address,
          city: users.city,
          state: users.state,
          country: users.country,
          zipCode: users.zipCode,
          latitude: users.latitude,
          longitude: users.longitude,
          isVerified: users.isVerified,
          isActive: users.isActive,
          profileComplete: users.profileComplete,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      const userData = userResult[0];

      // If user is a shelter, get shelter information
      let shelterData = null;
      if (userData.role === 'shelter') {
        const shelterResult = await db
          .select()
          .from(shelters)
          .where(eq(shelters.userId, userId))
          .limit(1);

        if (shelterResult.length > 0) {
          shelterData = shelterResult[0];
        }
      }

      res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: {
          user: userData,
          shelter: shelterData
        },
        requestId
      });

    } catch (error) {
      logger.error('Get profile error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        requestId
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { name, phone, address, city, state, zipCode } = req.body;

      // Build update object with only provided fields
      const updateData = {
        updatedAt: new Date()
      };

      if (name !== undefined) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone || null;
      if (address !== undefined) updateData.address = address || null;
      if (city !== undefined) updateData.city = city || null;
      if (state !== undefined) updateData.state = state || null;
      if (zipCode !== undefined) updateData.zipCode = zipCode || null;

      // Check if profile is complete
      const hasRequiredFields = name && city && state;
      if (hasRequiredFields) {
        updateData.profileComplete = true;
      }

      // Update user
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          phone: users.phone,
          profileImage: users.profileImage,
          address: users.address,
          city: users.city,
          state: users.state,
          country: users.country,
          zipCode: users.zipCode,
          profileComplete: users.profileComplete,
          updatedAt: users.updatedAt
        });

      logger.info('Profile updated successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Update profile error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        requestId
      });
    }
  },

  // Upload profile image
  uploadProfileImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
          requestId
        });
      }

      // Check if cloudinary upload was successful
      if (!req.cloudinaryResult) {
        return res.status(500).json({
          success: false,
          message: 'Image upload to Cloudinary failed',
          requestId
        });
      }

      const imageUrl = req.cloudinaryResult.secure_url;
      const publicId = req.cloudinaryResult.public_id;

      // Get current profile image to delete old one
      const currentUser = await db
        .select({ profileImage: users.profileImage })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // Update user profile image
      const updatedUser = await db
        .update(users)
        .set({
          profileImage: imageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          profileImage: users.profileImage
        });

      // Delete old image from Cloudinary if exists
      if (currentUser[0]?.profileImage) {
        try {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.ext
          const urlParts = currentUser[0].profileImage.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Get everything after 'upload/' and remove file extension
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            const oldPublicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            await cloudinaryUtils.deleteImage(oldPublicId);
          }
        } catch (deleteError) {
          logger.warn('Failed to delete old profile image:', deleteError.message);
        }
      }

      logger.info('Profile image uploaded successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          imageUrl: updatedUser[0].profileImage,
          publicId
        },
        requestId
      });

    } catch (error) {
      logger.error('Upload profile image error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        requestId
      });
    }
  },

  // Delete profile image
  deleteProfileImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      // Get current profile image
      const currentUser = await db
        .select({ profileImage: users.profileImage })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!currentUser[0]?.profileImage) {
        return res.status(400).json({
          success: false,
          message: 'No profile image to delete',
          requestId
        });
      }

      // Delete from Cloudinary
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = currentUser[0].profileImage.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
          await cloudinaryUtils.deleteImage(publicId);
        }
      } catch (deleteError) {
        logger.warn('Failed to delete image from Cloudinary:', deleteError.message);
      }

      // Remove image URL from database
      await db
        .update(users)
        .set({
          profileImage: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      logger.info('Profile image deleted successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Profile image deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete profile image error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile image',
        requestId
      });
    }
  },

  // Update location
  updateLocation: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { address, city, state, country, zipCode, latitude, longitude } = req.body;

      // Update user location
      const updatedUser = await db
        .update(users)
        .set({
          address: address || null,
          city,
          state,
          country: country || 'India',
          zipCode: zipCode || null,
          latitude: latitude ? String(latitude) : null,
          longitude: longitude ? String(longitude) : null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          address: users.address,
          city: users.city,
          state: users.state,
          country: users.country,
          zipCode: users.zipCode,
          latitude: users.latitude,
          longitude: users.longitude
        });

      logger.info('Location updated successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        data: updatedUser[0],
        requestId
      });

    } catch (error) {
      logger.error('Update location error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to update location',
        requestId
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { currentPassword, newPassword } = req.body;

      // Get current user password
      const userResult = await db
        .select({ password: users.password })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, userResult[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          requestId
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      logger.info('Password changed successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        requestId
      });

    } catch (error) {
      logger.error('Change password error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        requestId
      });
    }
  },

  // Delete account
  deleteAccount: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;

    try {
      const { password } = req.body;

      // Get current user
      const userResult = await db
        .select({ password: users.password, profileImage: users.profileImage })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userResult[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password is incorrect',
          requestId
        });
      }

      // Delete profile image from Cloudinary if exists
      if (userResult[0].profileImage) {
        try {
          const urlParts = userResult[0].profileImage.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
            const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            await cloudinaryUtils.deleteImage(publicId);
          }
        } catch (deleteError) {
          logger.warn('Failed to delete profile image during account deletion:', deleteError.message);
        }
      }

      // Delete user (cascade will delete related records)
      await db
        .delete(users)
        .where(eq(users.id, userId));

      // TODO: Invalidate all user sessions/tokens

      logger.info('Account deleted successfully', { userId, requestId });

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete account error:', { error: error.message, userId, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete account',
        requestId
      });
    }
  },
};

module.exports = userController;
