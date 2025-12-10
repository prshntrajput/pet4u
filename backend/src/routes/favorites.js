const express = require('express');
const router = express.Router();

// Import controllers and middleware
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

// Apply authentication and sanitization to all routes
router.use(authenticateToken);
router.use(sanitizeRequest);

// Get user's favorites (with full pet details)
router.get('/',
  favoriteController.getFavorites
);

// ✅ Get favorited pet IDs only (lightweight - place BEFORE /check/:petId)
router.get('/ids',
  favoriteController.getFavoritedPetIds
);

// Check if pet is favorited
router.get('/check/:petId',
  favoriteController.checkFavorite
);

// Add pet to favorites
router.post('/',
  favoriteController.addFavorite
);

// Remove pet from favorites
router.delete('/:petId',
  favoriteController.removeFavorite
);

module.exports = router;
