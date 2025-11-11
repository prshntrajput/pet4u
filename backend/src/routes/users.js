const express = require('express');
const router = express.Router();

// Import controllers and middleware
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const { uploadProfileImage , handleProfileImageUpload  } = require('../config/cloudinary');
const {
  updateProfileValidation,
  updateLocationValidation,
  changePasswordValidation,
  deleteAccountValidation
} = require('../validations/userValidation');

// Apply authentication to all user routes
router.use(authenticateToken);

// Apply sanitization to all routes
router.use(sanitizeRequest);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile',
  validate(updateProfileValidation),
  userController.updateProfile
);

// Upload profile image
router.post('/profile/image',
  uploadProfileImage.single('image'),
  handleProfileImageUpload, 
  userController.uploadProfileImage
);

// Delete profile image
router.delete('/profile/image',
  userController.deleteProfileImage
);

// Update location
router.put('/location',
  validate(updateLocationValidation),
  userController.updateLocation
);

// Change password
router.put('/password',
  validate(changePasswordValidation),
  userController.changePassword
);

// Delete account
router.delete('/account',
  validate(deleteAccountValidation),
  userController.deleteAccount
);

module.exports = router;
