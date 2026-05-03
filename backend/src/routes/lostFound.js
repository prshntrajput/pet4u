const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { sanitizeRequest } = require('../middleware/validation');

router.use(sanitizeRequest);

// Public: browse all reports (optional auth for personalization)
router.get('/', optionalAuth, lostFoundController.getReports);

// Public: view a single report
router.get('/:reportId', optionalAuth, lostFoundController.getReportById);

// Protected: create a report
router.post('/', authenticateToken, lostFoundController.createReport);

// Protected: my reports
router.get('/user/my-reports', authenticateToken, lostFoundController.getMyReports);

// Protected: mark resolved
router.patch('/:reportId/resolve', authenticateToken, lostFoundController.resolveReport);

// Protected: delete
router.delete('/:reportId', authenticateToken, lostFoundController.deleteReport);

module.exports = router;
