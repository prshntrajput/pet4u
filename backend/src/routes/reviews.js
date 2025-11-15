const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const {
  createPetReviewValidation,
  createShelterReviewValidation
} = require('../validations/reviewValidation');

// Apply sanitization
router.use(sanitizeRequest);

// Public routes
router.get('/pets/:petId', reviewController.getPetReviews);
router.get('/shelters/:shelterId', reviewController.getShelterReviews);

// Protected routes
router.use(authenticateToken);

// Create reviews
router.post('/pets',
  validate(createPetReviewValidation),
  reviewController.createPetReview
);

router.post('/shelters',
  validate(createShelterReviewValidation),
  reviewController.createShelterReview
);

// Delete own review
router.delete('/:type/:reviewId',
  reviewController.deleteReview
);

module.exports = router;
