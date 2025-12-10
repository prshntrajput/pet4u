const express = require('express');
const router = express.Router();

const searchController = require('../controllers/searchController');
const { sanitizeRequest } = require('../middleware/validation');

// Apply sanitization
router.use(sanitizeRequest);

// Advanced search
router.get('/', searchController.advancedSearch);

// Search suggestions
router.get('/suggestions', searchController.getSuggestions);

// Popular searches
router.get('/popular', searchController.getPopularSearches);

module.exports = router;
