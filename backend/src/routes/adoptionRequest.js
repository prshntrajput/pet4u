const express = require('express');
const router = express.Router();

// Import controllers and middleware
const adoptionController = require('../controllers/adoptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, sanitizeRequest } = require('../middleware/validation');
const {
  createAdoptionRequestValidation,
  respondToRequestValidation
} = require('../validations/adoptionValidation');

// Apply authentication and sanitization to all routes
router.use(authenticateToken);
router.use(sanitizeRequest);

// Create adoption request (adopters only)
router.post('/',
  requireRole('adopter'),
  validate(createAdoptionRequestValidation),
  adoptionController.createAdoptionRequest
);

// Get my adoption requests (as adopter)
router.get('/my-requests',
  requireRole('adopter'),
  adoptionController.getMyAdoptionRequests
);

// Get received adoption requests (as shelter)
router.get('/received',
  requireRole('shelter'),
  adoptionController.getReceivedAdoptionRequests
);

// Respond to adoption request (shelter only)
router.put('/:requestIdParam/respond',
  requireRole('shelter'),
  validate(respondToRequestValidation),
  adoptionController.respondToAdoptionRequest
);

// Withdraw adoption request (adopter only)
router.put('/:requestIdParam/withdraw',
  requireRole('adopter'),
  adoptionController.withdrawAdoptionRequest
);

module.exports = router;
