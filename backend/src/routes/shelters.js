const express = require('express');
const router = express.Router();

// Import controllers and middleware
const shelterController = require('../controllers/shelterControllers');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const {
  createShelterProfileValidation,
  updateShelterProfileValidation
} = require('../validations/userValidation');

// Apply sanitization to all routes
router.use(sanitizeRequest);

// Public routes (no authentication required)
router.get('/', optionalAuth, shelterController.getAllShelters);
router.get('/:shelterId', optionalAuth, shelterController.getShelterById);

// Protected routes (authentication required)
router.use(authenticateToken);

// Create shelter profile (shelter role only)
router.post('/',
  requireRole('shelter'),
  validate(createShelterProfileValidation),
  shelterController.createShelterProfile
);

// Get own shelter profile
router.get('/profile/me',
  requireRole('shelter'),
  shelterController.getShelterProfile
);

// Update shelter profile
router.put('/profile',
  requireRole('shelter'),
  validate(updateShelterProfileValidation),
  shelterController.updateShelterProfile
);

// Delete shelter profile
router.delete('/profile',
  requireRole('shelter'),
  shelterController.deleteShelterProfile
);

module.exports = router;
