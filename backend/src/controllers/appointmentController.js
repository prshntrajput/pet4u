const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { appointments, availabilitySlots, users, pets } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, gte, lte, desc, asc } = require('drizzle-orm');
const emailService = require('../services/emailServices');

const appointmentController = {
  // Shelter: set weekly availability slot
  setAvailability: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;
    try {
      if (req.user.role !== 'shelter' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only shelters can set availability', requestId });
      }

      const { dayOfWeek, startTime, endTime, maxBookings } = req.body;

      const slot = await db
        .insert(availabilitySlots)
        .values({
          id: createId(),
          shelterId,
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
          maxBookings: parseInt(maxBookings) || 3,
          isActive: true
        })
        .returning();

      res.status(201).json({ success: true, message: 'Availability slot added.', data: { slot: slot[0] }, requestId });
    } catch (error) {
      logger.error('Set availability error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to save availability.', requestId });
    }
  },

  // Get a shelter's availability
  getShelterAvailability: async (req, res) => {
    const requestId = req.requestId;
    try {
      const { shelterId } = req.params;
      const slots = await db
        .select()
        .from(availabilitySlots)
        .where(and(eq(availabilitySlots.shelterId, shelterId), eq(availabilitySlots.isActive, true)))
        .orderBy(asc(availabilitySlots.dayOfWeek), asc(availabilitySlots.startTime));

      res.status(200).json({ success: true, data: { slots }, requestId });
    } catch (error) {
      logger.error('Get availability error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch availability.', requestId });
    }
  },

  // Adopter: book an appointment
  bookAppointment: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    try {
      const {
        shelterId, petId, adoptionRequestId,
        scheduledDate, startTime, endTime,
        location, isVirtual, meetingLink, adopterNotes
      } = req.body;

      // Prevent double booking same slot
      const conflict = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(and(
          eq(appointments.shelterId, shelterId),
          eq(appointments.adopterId, adopterId),
          eq(appointments.scheduledDate, new Date(scheduledDate)),
          eq(appointments.startTime, startTime)
        ))
        .limit(1);

      if (conflict.length > 0) {
        return res.status(409).json({ success: false, message: 'You already have an appointment at this time.', requestId });
      }

      const apptId = createId();
      const newAppt = await db
        .insert(appointments)
        .values({
          id: apptId,
          shelterId,
          adopterId,
          petId,
          adoptionRequestId: adoptionRequestId || null,
          scheduledDate: new Date(scheduledDate),
          startTime,
          endTime,
          location: location || null,
          isVirtual: isVirtual || false,
          meetingLink: meetingLink || null,
          adopterNotes: adopterNotes || null,
          status: 'pending'
        })
        .returning();

      // Notify shelter via email (non-blocking)
      Promise.all([
        db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, shelterId)).limit(1),
        db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, adopterId)).limit(1),
        db.select({ name: pets.name }).from(pets).where(eq(pets.id, petId)).limit(1)
      ]).then(([shelterRes, adopterRes, petRes]) => {
        if (shelterRes[0] && adopterRes[0] && petRes[0]) {
          emailService.sendAppointmentRequestEmail(shelterRes[0], adopterRes[0], petRes[0], newAppt[0]).catch(() => {});
        }
      });

      logger.info('Appointment booked', { apptId, adopterId, shelterId, requestId });

      res.status(201).json({
        success: true,
        message: 'Appointment request submitted. Awaiting shelter confirmation.',
        data: { appointment: newAppt[0] },
        requestId
      });
    } catch (error) {
      logger.error('Book appointment error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to book appointment.', requestId });
    }
  },

  // Shelter: confirm or cancel an appointment
  updateAppointmentStatus: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const { appointmentId } = req.params;
      const { status, shelterNotes, cancellationReason } = req.body;

      const allowed = ['confirmed', 'cancelled_by_shelter', 'completed', 'no_show'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.', requestId });
      }

      const existing = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found.', requestId });
      }

      const appt = existing[0];

      if (appt.shelterId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized.', requestId });
      }

      const updates = {
        status,
        shelterNotes: shelterNotes || appt.shelterNotes,
        cancellationReason: cancellationReason || null,
        updatedAt: new Date()
      };

      if (status === 'confirmed') updates.confirmedAt = new Date();
      if (status === 'completed') updates.completedAt = new Date();

      await db.update(appointments).set(updates).where(eq(appointments.id, appointmentId));

      logger.info('Appointment status updated', { appointmentId, status, userId, requestId });

      res.status(200).json({ success: true, message: `Appointment ${status.replace('_', ' ')}.`, requestId });
    } catch (error) {
      logger.error('Update appointment status error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to update appointment.', requestId });
    }
  },

  // Adopter: cancel their appointment
  cancelAppointment: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    try {
      const { appointmentId } = req.params;
      const { cancellationReason } = req.body;

      const existing = await db
        .select({ id: appointments.id, adopterId: appointments.adopterId, status: appointments.status })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Appointment not found.', requestId });
      }

      if (existing[0].adopterId !== adopterId) {
        return res.status(403).json({ success: false, message: 'Not authorized.', requestId });
      }

      if (['completed', 'cancelled_by_adopter', 'cancelled_by_shelter'].includes(existing[0].status)) {
        return res.status(400).json({ success: false, message: 'Cannot cancel this appointment.', requestId });
      }

      await db.update(appointments).set({
        status: 'cancelled_by_adopter',
        cancellationReason: cancellationReason || null,
        updatedAt: new Date()
      }).where(eq(appointments.id, appointmentId));

      res.status(200).json({ success: true, message: 'Appointment cancelled.', requestId });
    } catch (error) {
      logger.error('Cancel appointment error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to cancel appointment.', requestId });
    }
  },

  // Get user's appointments (adopter or shelter)
  getMyAppointments: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    const role = req.user.role;
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const conditions = [];
      if (role === 'shelter') {
        conditions.push(eq(appointments.shelterId, userId));
      } else {
        conditions.push(eq(appointments.adopterId, userId));
      }
      if (status) conditions.push(eq(appointments.status, status));

      const results = await db
        .select({
          appointment: appointments,
          petName: pets.name,
          petImage: pets.primaryImage,
          adopterName: users.name
        })
        .from(appointments)
        .leftJoin(pets, eq(appointments.petId, pets.id))
        .leftJoin(users, eq(appointments.adopterId, users.id))
        .where(and(...conditions))
        .orderBy(desc(appointments.scheduledDate))
        .limit(parseInt(limit))
        .offset(offset);

      res.status(200).json({
        success: true,
        data: {
          appointments: results.map(r => ({
            ...r.appointment,
            petName: r.petName,
            petImage: r.petImage,
            adopterName: r.adopterName
          })),
          pagination: { page: parseInt(page), limit: parseInt(limit), hasMore: results.length === parseInt(limit) }
        },
        requestId
      });
    } catch (error) {
      logger.error('Get appointments error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch appointments.', requestId });
    }
  }
};

module.exports = appointmentController;
