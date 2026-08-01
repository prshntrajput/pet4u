const authService = require('../services/authService');
const { logger } = require('../config/logger');

const authController = {
  register: async (req, res) => {
    const requestId = req.requestId;
    logger.info('User registration attempt', { requestId });
    try {
      const user = await authService.register(req.body);
      logger.info('User registered successfully', { userId: user.id, email: user.email, role: user.role, requestId });
      res.status(201).json({ success: true, message: 'Registration successful! Please check your email to verify your account.', data: { user }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Registration error', { err: error, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Registration failed. Please try again.', requestId });
    }
  },

  login: async (req, res) => {
    const requestId = req.requestId;
    logger.info('User login attempt', { requestId });
    try {
      const result = await authService.login({
        email: req.body.email,
        password: req.body.password,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      logger.info('User logged in successfully', { userId: result.user.id, email: result.user.email, requestId });
      res.status(200).json({ success: true, message: 'Login successful', data: { ...result, expiresIn: 15 * 60 }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Login error', { err: error, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Login failed. Please try again.', requestId });
    }
  },

  demo: async (req, res) => {
    const requestId = req.requestId;
    try {
      const result = authService.createDemoSession();
      logger.info('Demo session started', { requestId });
      res.status(200).json({
        success: true,
        message: 'Demo session started',
        data: { ...result, expiresIn: 15 * 60 },
        requestId,
      });
    } catch (error) {
      logger.error('Demo session error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Unable to start demo mode', requestId });
    }
  },

  refresh: async (req, res) => {
    const requestId = req.requestId;
    logger.info('Token refresh attempt', { requestId });
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      logger.info('Token refreshed successfully', { requestId });
      res.status(200).json({ success: true, message: 'Token refreshed successfully', data: { ...tokens, expiresIn: 15 * 60 }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Token refresh error', { err: error, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Token refresh failed', requestId });
    }
  },

  logout: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user?.userId;
    logger.info('User logout attempt', { userId, requestId });
    try {
      await authService.logout({
        userId,
        refreshToken: req.body.refreshToken,
        logoutFromAll: req.body.logoutFromAll || false,
        accessToken: req.headers.authorization?.split(' ')[1],
      });
      logger.info('User logged out', { userId, requestId });
      res.status(200).json({ success: true, message: 'Logout successful', requestId });
    } catch (error) {
      logger.error('Logout error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Logout failed', requestId });
    }
  },

  verifyEmail: async (req, res) => {
    const requestId = req.requestId;
    try {
      await authService.verifyEmail(req.query.token);
      logger.info('Email verified successfully', { requestId });
      res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Email verification error', { err: error, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Email verification failed', requestId });
    }
  },

  forgotPassword: async (req, res) => {
    const requestId = req.requestId;
    try {
      await authService.forgotPassword(req.body.email);
      logger.info('Password reset requested', { requestId });
      res.status(200).json({ success: true, message: 'If this email is registered, you will receive a password reset link.', requestId });
    } catch (error) {
      logger.error('Forgot password error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Request failed. Please try again.', requestId });
    }
  },

  resetPassword: async (req, res) => {
    const requestId = req.requestId;
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      logger.info('Password reset successfully', { requestId });
      res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Reset password error', { err: error, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Password reset failed. Please try again.', requestId });
    }
  },

  verify: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user?.userId;
    try {
      if (!userId) return res.status(401).json({ success: false, message: 'Invalid token', requestId });
      const user = await authService.getUserById(userId);
      if (!user) return res.status(401).json({ success: false, message: 'User not found or inactive', requestId });
      res.status(200).json({ success: true, message: 'Token is valid', data: { user }, requestId });
    } catch (error) {
      logger.error('Token verification error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Token verification failed', requestId });
    }
  },
};

module.exports = authController;
