const express = require('express');
const router = express.Router();

// Import controllers and middleware
const petController = require('../controllers/petController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const { uploadMultiplePetImages, handleMultiplePetImagesUpload } = require('../config/cloudinary');
const {
  createPetValidation,
  updatePetValidation,
  searchPetsValidation
} = require('../validations/petValidation');

// Apply sanitization to all routes
router.use(sanitizeRequest);

// Public routes (no authentication required)
router.get('/',
  optionalAuth,
  validate(searchPetsValidation, 'query'),
  petController.getAllPets
);

router.get('/:petId',
  optionalAuth,
  petController.getPetById
);

// Protected routes (authentication required)
router.use(authenticateToken);

// Get user's own pets
router.get('/my/listings',
  petController.getMyPets
);

// Create new pet (shelter role only)
router.post('/',
  requireRole('shelter'),
  validate(createPetValidation),
  petController.createPet
);

// Update pet
router.put('/:petId',
  requireRole('shelter'),
  validate(updatePetValidation),
  petController.updatePet
);

// Delete pet
router.delete('/:petId',
  requireRole('shelter'),
  petController.deletePet
);

// Upload pet images (max 10 images)
router.post('/:petId/images',
  requireRole('shelter'),
  uploadMultiplePetImages.array('images', 10),
  handleMultiplePetImagesUpload,
  petController.uploadPetImages
);

// Delete pet image
router.delete('/:petId/images/:imageId',
  requireRole('shelter'),
  petController.deletePetImage
);

module.exports = router;
