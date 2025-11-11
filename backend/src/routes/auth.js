const express = require('express');
const router = express.Router();

// Import controllers and middleware
const authController = require('../controllers/authController');
const { validate, sanitizeRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} = require('../validations/authValidation');

// Apply sanitization to all routes
router.use(sanitizeRequest);

// Register route
router.post('/register', 
  validate(registerValidation),
  authController.register
);

// Login route
router.post('/login', 
  validate(loginValidation),
  authController.login
);

// Token refresh route
router.post('/refresh', 
  authController.refresh
);

// Logout route
router.post('/logout', 
  authenticateToken,
  authController.logout
);

// Token verification route
router.get('/verify', 
  authenticateToken,
  authController.verify
);

// Forgot password route (will implement in next phase)
router.post('/forgot-password', 
  validate(forgotPasswordValidation),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Forgot password feature coming soon',
      requestId: req.requestId
    });
  }
);

// Reset password route (will implement in next phase)
router.post('/reset-password', 
  validate(resetPasswordValidation),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Reset password feature coming soon',
      requestId: req.requestId
    });
  }
);

module.exports = router;
