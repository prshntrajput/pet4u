const shelterService = require('../services/shelterService');
const { logger } = require('../config/logger');

const shelterController = {
  createShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const shelter = await shelterService.createShelterProfile(userId, req.body);
      logger.info('Shelter profile created successfully', { userId, shelterId: shelter.id, requestId });
      res.status(201).json({ success: true, message: 'Shelter profile created successfully', data: { shelter }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Create shelter profile error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to create shelter profile', requestId });
    }
  },

  getShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const shelter = await shelterService.getShelterProfile(userId);
      logger.info('Shelter profile fetched successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Shelter profile fetched successfully', data: { shelter }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Get shelter profile error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to fetch shelter profile', requestId });
    }
  },

  updateShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const shelter = await shelterService.updateShelterProfile(userId, req.body);
      logger.info('Shelter profile updated successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Shelter profile updated successfully', data: { shelter }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Update shelter profile error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to update shelter profile', requestId });
    }
  },

  getShelterById: async (req, res) => {
    const requestId = req.requestId;
    const { shelterId } = req.params;
    try {
      const data = await shelterService.getShelterById(shelterId);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Shelter not found', requestId });
      }
      res.status(200).json({ success: true, message: 'Shelter fetched successfully', data, requestId });
    } catch (error) {
      logger.error('Get shelter by ID error', { err: error, shelterId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch shelter', requestId });
    }
  },

  getAllShelters: async (req, res) => {
    const requestId = req.requestId;
    try {
      const data = await shelterService.getAllShelters(req.query);
      res.status(200).json({ success: true, message: 'Shelters fetched successfully', data, requestId });
    } catch (error) {
      logger.error('Get all shelters error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch shelters', requestId });
    }
  },

  deleteShelterProfile: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      await shelterService.deleteShelterProfile(userId);
      logger.info('Shelter profile deleted successfully', { userId, requestId });
      res.status(200).json({ success: true, message: 'Shelter profile deleted successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Delete shelter profile error', { err: error, userId, requestId });
      res.status(status).json({ success: false, message: error.statusCode ? error.message : 'Failed to delete shelter profile', requestId });
    }
  },
};

module.exports = shelterController;
