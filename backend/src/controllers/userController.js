const userService = require('../services/userService');
const { logger } = require('../config/logger');

const userController = {
  getProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const data = await userService.getProfile(userId);
      res.status(200).json({ success: true, message: 'Profile fetched successfully', data, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Get profile error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to fetch profile', requestId });
    }
  },

  updateProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const user = await userService.updateProfile(userId, req.body);
      logger.info('Profile updated successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user }, requestId });
    } catch (error) {
      logger.error('Update profile error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to update profile', requestId });
    }
  },

  uploadProfileImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided', requestId });
      }
      if (!req.cloudinaryResult) {
        return res.status(500).json({ success: false, message: 'Image upload to Cloudinary failed', requestId });
      }
      const result = await userService.uploadProfileImage(userId, req.cloudinaryResult);
      logger.info('Profile image uploaded successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Profile image uploaded successfully', data: result, requestId });
    } catch (error) {
      logger.error('Upload profile image error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to upload profile image', requestId });
    }
  },

  deleteProfileImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      await userService.deleteProfileImage(userId);
      logger.info('Profile image deleted successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Profile image deleted successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Delete profile image error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to delete profile image', requestId });
    }
  },

  updateLocation: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const data = await userService.updateLocation(userId, req.body);
      logger.info('Location updated successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Location updated successfully', data, requestId });
    } catch (error) {
      logger.error('Update location error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to update location', requestId });
    }
  },

  changePassword: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      await userService.changePassword(userId, req.body.currentPassword, req.body.newPassword);
      logger.info('Password changed successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Password changed successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Change password error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to change password', requestId });
    }
  },

  deleteAccount: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      await userService.deleteAccount(userId, req.body.password, accessToken);
      logger.info('Account deleted successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Account deleted successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Delete account error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to delete account', requestId });
    }
  },
};

module.exports = userController;
