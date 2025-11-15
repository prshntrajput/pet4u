const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

// Apply authentication and admin role to all routes
router.use(authenticateToken);
router.use(requireRole('admin'));
router.use(sanitizeRequest);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Pet management
router.get('/pets', adminController.getAllPets);
router.delete('/pets/:petId', adminController.deletePet);

// Admin logs
router.get('/logs', adminController.getAdminLogs);

module.exports = router;
