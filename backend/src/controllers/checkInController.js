const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { adoptionRequests, pets } = require('../models');
const { eq, and } = require('drizzle-orm');
const checkInService = require('../services/checkInService');
const { logger } = require('../config/logger');

const checkInController = {
  // Shelter: mark adoption as complete and trigger check-in schedule
  markAdoptionComplete: async (req, res) => {
    try {
      const { requestId } = req.params;
      const shelterId = req.user.id;

      const existing = await db.select().from(adoptionRequests)
        .where(and(eq(adoptionRequests.id, requestId), eq(adoptionRequests.shelterId, shelterId)))
        .limit(1);

      if (!existing[0]) return res.status(404).json({ success: false, message: 'Request not found' });
      if (existing[0].status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Only approved requests can be marked complete' });
      }

      // Mark pet as adopted
      await db.update(pets).set({
        adoptionStatus: 'adopted',
        adoptedAt: new Date(),
        adoptedBy: existing[0].adopterId,
        updatedAt: new Date(),
      }).where(eq(pets.id, existing[0].petId));

      // Mark request as completed
      await db.update(adoptionRequests)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(adoptionRequests.id, requestId));

      // Create the check-in schedule
      const checkIns = await checkInService.createCheckInsForAdoption(
        requestId,
        existing[0].adopterId,
        shelterId,
        existing[0].petId,
        new Date(),
      );

      res.json({ success: true, message: 'Adoption marked complete. Check-in schedule created.', data: { checkIns } });
    } catch (err) {
      logger.error('markAdoptionComplete error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to mark adoption complete' });
    }
  },

  getAdopterCheckIns: async (req, res) => {
    try {
      const rows = await checkInService.getAdopterCheckIns(req.user.id);
      res.json({ success: true, data: rows });
    } catch (err) {
      logger.error('getAdopterCheckIns error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to fetch check-ins' });
    }
  },

  getShelterCheckIns: async (req, res) => {
    try {
      const rows = await checkInService.getShelterCheckIns(req.user.id);
      res.json({ success: true, data: rows });
    } catch (err) {
      logger.error('getShelterCheckIns error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to fetch check-ins' });
    }
  },

  submitCheckIn: async (req, res) => {
    try {
      const result = await checkInService.submitCheckIn(req.params.checkInId, req.user.id, req.body);
      if (!result) return res.status(404).json({ success: false, message: 'Check-in not found' });
      if (result === 'already_submitted') return res.status(400).json({ success: false, message: 'Already submitted' });
      res.json({ success: true, data: result });
    } catch (err) {
      logger.error('submitCheckIn error', { err: err.message });
      res.status(500).json({ success: false, message: 'Failed to submit check-in' });
    }
  },
};

module.exports = checkInController;
