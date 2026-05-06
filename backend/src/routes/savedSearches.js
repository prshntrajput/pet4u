const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearchController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', savedSearchController.getMyAlerts);
router.post('/', savedSearchController.createAlert);
router.patch('/:id/toggle', savedSearchController.toggleAlert);
router.delete('/:id', savedSearchController.deleteAlert);

module.exports = router;
