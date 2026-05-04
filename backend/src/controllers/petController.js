const petService = require('../services/petService');
const { logger } = require('../config/logger');

const petController = {
  createPet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const pet = await petService.createPet(userId, req.body);
      logger.info('Pet created successfully', { userId, petId: pet.id, petName: pet.name, requestId });
      res.status(201).json({ success: true, message: 'Pet listing created successfully', data: { pet }, requestId });
    } catch (error) {
      logger.error('Create pet error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to create pet listing', requestId });
    }
  },

  getAllPets: async (req, res) => {
    const requestId = req.requestId;
    try {
      const result = await petService.getPets(req.query);
      logger.info('Pets fetched successfully', { count: result.pets.length, total: result.pagination.totalCount, requestId });
      res.status(200).json({ success: true, message: 'Pets fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get all pets error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch pets', requestId });
    }
  },

  getPetById: async (req, res) => {
    const requestId = req.requestId;
    const { petId } = req.params;
    const userId = req.user?.userId;
    try {
      const pet = await petService.getPetByIdOrSlug(petId, userId);
      if (!pet) {
        return res.status(404).json({ success: false, message: 'Pet not found', requestId });
      }
      logger.info('Pet fetched successfully', { petId: pet.id, requestId });
      res.status(200).json({ success: true, message: 'Pet fetched successfully', data: { pet }, requestId });
    } catch (error) {
      logger.error('Get pet by ID error', { err: error, petId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch pet', requestId });
    }
  },

  getMyPets: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const result = await petService.getMyPets(userId, req.query);
      res.status(200).json({ success: true, message: 'My pets fetched successfully', data: result, requestId });
    } catch (error) {
      logger.error('Get my pets error', { err: error, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch your pets', requestId });
    }
  },

  updatePet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;
    try {
      const pet = await petService.updatePet(petId, userId, req.body);
      if (!pet) {
        return res.status(404).json({ success: false, message: 'Pet not found or you do not have permission to edit it', requestId });
      }
      logger.info('Pet updated successfully', { petId, userId, requestId });
      res.status(200).json({ success: true, message: 'Pet updated successfully', data: { pet }, requestId });
    } catch (error) {
      logger.error('Update pet error', { err: error, petId, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to update pet', requestId });
    }
  },

  deletePet: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;
    try {
      const deleted = await petService.deletePet(petId, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Pet not found or you do not have permission to delete it', requestId });
      }
      logger.info('Pet deleted successfully', { petId, userId, requestId });
      res.status(200).json({ success: true, message: 'Pet deleted successfully', requestId });
    } catch (error) {
      logger.error('Delete pet error', { err: error, petId, userId, requestId });
      res.status(500).json({ success: false, message: 'Failed to delete pet', requestId });
    }
  },

  uploadPetImages: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId } = req.params;
    try {
      logger.info('Upload pet images started', { petId, userId, filesCount: req.files?.length, requestId });

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No image files provided', requestId });
      }
      if (!req.cloudinaryResults || req.cloudinaryResults.length === 0) {
        return res.status(500).json({ success: false, message: 'Image upload to Cloudinary failed', requestId });
      }

      const images = await petService.uploadPetImages(petId, userId, req.cloudinaryResults);

      if (!images) {
        return res.status(404).json({ success: false, message: 'Pet not found or you do not have permission to upload images', requestId });
      }

      logger.info('Pet images uploaded successfully', { petId, userId, imageCount: images.length, requestId });
      res.status(200).json({ success: true, message: `${images.length} image(s) uploaded successfully`, data: { images }, requestId });
    } catch (error) {
      logger.error('Upload pet images error', { err: error, petId, userId, requestId });
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.statusCode ? error.message : 'Failed to upload images',
        requestId,
      });
    }
  },

  deletePetImage: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const { petId, imageId } = req.params;
    try {
      const result = await petService.deletePetImage(petId, userId, imageId);
      if (result === null) {
        return res.status(404).json({ success: false, message: 'Pet not found or you do not have permission', requestId });
      }
      if (result === 'not_found') {
        return res.status(404).json({ success: false, message: 'Image not found', requestId });
      }
      logger.info('Pet image deleted successfully', { petId, imageId, userId, requestId });
      res.status(200).json({ success: true, message: 'Image deleted successfully', requestId });
    } catch (error) {
      logger.error('Delete pet image error', { err: error, petId, imageId, requestId });
      res.status(500).json({ success: false, message: 'Failed to delete image', requestId });
    }
  },

  matchPets: async (req, res) => {
    const requestId = req.requestId;
    try {
      const matches = await petService.matchPets(req.body);
      res.status(200).json({
        success: true,
        data: {
          matches,
          totalMatches: matches.length,
          criteria: {
            livingSpace: req.body.livingSpace,
            activityLevel: req.body.activityLevel,
            preferredSpecies: req.body.preferredSpecies,
            preferredSize: req.body.preferredSize,
          },
        },
        requestId,
      });
    } catch (error) {
      logger.error('Pet matching error', { err: error, requestId });
      res.status(500).json({ success: false, message: 'Matching failed. Please try again.', requestId });
    }
  },
};

module.exports = petController;
