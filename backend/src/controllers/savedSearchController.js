const savedSearchService = require('../services/savedSearchService');
const { logger } = require('../config/logger');

const savedSearchController = {
  getMyAlerts: async (req, res) => {
    try {
      const alerts = await savedSearchService.getByUser(req.user.id);
      res.json({ success: true, data: alerts });
    } catch (err) {
      logger.error('getMyAlerts error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
  },

  createAlert: async (req, res) => {
    try {
      const { name, species, breed, gender, size, city, state, minAge, maxAge } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Alert name is required' });
      }
      const alert = await savedSearchService.create(req.user.id, {
        name: name.trim(), species, breed, gender, size, city, state, minAge, maxAge,
      });
      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      logger.error('createAlert error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to create alert' });
    }
  },

  toggleAlert: async (req, res) => {
    try {
      const alert = await savedSearchService.toggle(req.params.id, req.user.id);
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
      res.json({ success: true, data: alert });
    } catch (err) {
      logger.error('toggleAlert error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to update alert' });
    }
  },

  deleteAlert: async (req, res) => {
    try {
      const deleted = await savedSearchService.delete(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Alert not found' });
      res.json({ success: true, message: 'Alert deleted' });
    } catch (err) {
      logger.error('deleteAlert error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to delete alert' });
    }
  },
};

module.exports = savedSearchController;
