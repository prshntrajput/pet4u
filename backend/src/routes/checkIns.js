const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Shelter: mark an adoption as complete
router.post('/complete/:requestId', requireRole('shelter'), checkInController.markAdoptionComplete);

// Shelter: view all check-ins for their pets
router.get('/shelter', requireRole('shelter'), checkInController.getShelterCheckIns);

// Adopter: view their check-ins
router.get('/my', checkInController.getAdopterCheckIns);

// Adopter: submit a check-in
router.post('/:checkInId/submit', checkInController.submitCheckIn);

module.exports = router;
