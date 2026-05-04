const adoptionService = require('../services/adoptionService');
const { logger } = require('../config/logger');

const adoptionController = {
  createAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    try {
      const { petId, message } = req.body;
      const request = await adoptionService.createAdoptionRequest(adopterId, petId, message);
      logger.info('Adoption request created successfully', { adopterId, petId, adoptionRequestId: request.id, requestId });
      res.status(201).json({ success: true, message: 'Adoption request sent successfully', data: { request }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Create adoption request error', { err: error, adopterId, requestId });
      res.status(status).json({ success: false, message: error.message, requestId });
    }
  },

  getMyAdoptionRequests: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    try {
      const result = await adoptionService.getMyAdoptionRequests(adopterId, req.query);
      logger.info('My adoption requests fetched', { adopterId, count: result.requests.length, requestId });
      res.status(200).json({ success: true, message: 'Adoption requests fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get my adoption requests error', { err: error, adopterId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch adoption requests', requestId });
    }
  },

  getReceivedAdoptionRequests: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;
    try {
      const result = await adoptionService.getReceivedAdoptionRequests(shelterId, req.query);
      logger.info('Received adoption requests fetched', { shelterId, count: result.requests.length, requestId });
      res.status(200).json({ success: true, message: 'Received adoption requests fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get received adoption requests error', { err: error, shelterId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch adoption requests', requestId });
    }
  },

  respondToAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;
    const { requestIdParam } = req.params;
    try {
      const request = await adoptionService.respondToAdoptionRequest(requestIdParam, shelterId, req.body);
      logger.info('Adoption request responded', { shelterId, adoptionRequestId: requestIdParam, status: req.body.status, requestId });
      res.status(200).json({ success: true, message: `Adoption request ${req.body.status} successfully`, data: { request }, requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Respond to adoption request error', { err: error, shelterId, requestId });
      res.status(status).json({ success: false, message: error.message, requestId });
    }
  },

  withdrawAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    const { requestIdParam } = req.params;
    try {
      await adoptionService.withdrawAdoptionRequest(requestIdParam, adopterId);
      logger.info('Adoption request withdrawn', { adopterId, adoptionRequestId: requestIdParam, requestId });
      res.status(200).json({ success: true, message: 'Adoption request withdrawn successfully', requestId });
    } catch (error) {
      const status = error.statusCode || 500;
      logger.error('Withdraw adoption request error', { err: error, adopterId, requestId });
      res.status(status).json({ success: false, message: error.message, requestId });
    }
  },
};

module.exports = adoptionController;
