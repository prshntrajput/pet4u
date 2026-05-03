const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

router.use(sanitizeRequest);
router.use(authenticateToken);

// Shelter availability
router.post('/availability', appointmentController.setAvailability);
router.get('/availability/:shelterId', appointmentController.getShelterAvailability);

// My appointments (adopter or shelter view)
router.get('/my', appointmentController.getMyAppointments);

// Book an appointment (adopter)
router.post('/', appointmentController.bookAppointment);

// Shelter: update appointment status
router.patch('/:appointmentId/status', appointmentController.updateAppointmentStatus);

// Adopter: cancel appointment
router.patch('/:appointmentId/cancel', appointmentController.cancelAppointment);

module.exports = router;
