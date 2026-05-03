const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { lostFoundReports, users } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, like, desc, ilike } = require('drizzle-orm');

const lostFoundController = {
  // Create a new lost or found report
  createReport: async (req, res) => {
    const requestId = req.requestId;
    const reporterId = req.user.userId;

    try {
      const {
        type, petName, species, breed, color, gender, age, description,
        microchipId, lastSeenAddress, city, state, zipCode, latitude, longitude,
        incidentDate, images, primaryImage,
        contactName, contactPhone, contactEmail, reward, rewardNotes
      } = req.body;

      if (!['lost', 'found'].includes(type)) {
        return res.status(400).json({ success: false, message: "Type must be 'lost' or 'found'", requestId });
      }

      const reportId = createId();
      const newReport = await db
        .insert(lostFoundReports)
        .values({
          id: reportId,
          reporterId,
          type,
          petName: petName?.trim() || null,
          species,
          breed: breed || null,
          color: color || null,
          gender: gender || null,
          age: age || null,
          description: description.trim(),
          microchipId: microchipId || null,
          lastSeenAddress: lastSeenAddress || null,
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode || null,
          latitude: latitude ? String(latitude) : null,
          longitude: longitude ? String(longitude) : null,
          incidentDate: new Date(incidentDate),
          images: images ? JSON.stringify(images) : null,
          primaryImage: primaryImage || null,
          contactName: contactName || null,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
          reward: reward ? String(reward) : null,
          rewardNotes: rewardNotes || null,
          status: 'active'
        })
        .returning();

      logger.info('Lost/Found report created', { reportId, type, reporterId, requestId });

      res.status(201).json({
        success: true,
        message: `${type === 'lost' ? 'Lost pet' : 'Found pet'} report submitted successfully.`,
        data: { report: newReport[0] },
        requestId
      });
    } catch (error) {
      logger.error('Create lost/found report error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to submit report. Please try again.', requestId });
    }
  },

  // Get all reports with filters
  getReports: async (req, res) => {
    const requestId = req.requestId;
    try {
      const {
        type, species, city, state, status = 'active',
        page = 1, limit = 12
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const conditions = [];
      if (status) conditions.push(eq(lostFoundReports.status, status));
      if (type && ['lost', 'found'].includes(type)) conditions.push(eq(lostFoundReports.type, type));
      if (species) conditions.push(ilike(lostFoundReports.species, `%${species}%`));
      if (city) conditions.push(ilike(lostFoundReports.city, `%${city}%`));
      if (state) conditions.push(ilike(lostFoundReports.state, `%${state}%`));

      const query = db
        .select({
          id: lostFoundReports.id,
          type: lostFoundReports.type,
          petName: lostFoundReports.petName,
          species: lostFoundReports.species,
          breed: lostFoundReports.breed,
          color: lostFoundReports.color,
          gender: lostFoundReports.gender,
          description: lostFoundReports.description,
          city: lostFoundReports.city,
          state: lostFoundReports.state,
          lastSeenAddress: lostFoundReports.lastSeenAddress,
          incidentDate: lostFoundReports.incidentDate,
          primaryImage: lostFoundReports.primaryImage,
          images: lostFoundReports.images,
          contactName: lostFoundReports.contactName,
          contactPhone: lostFoundReports.contactPhone,
          reward: lostFoundReports.reward,
          status: lostFoundReports.status,
          createdAt: lostFoundReports.createdAt,
          reporterName: users.name,
          reporterImage: users.profileImage
        })
        .from(lostFoundReports)
        .leftJoin(users, eq(lostFoundReports.reporterId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(lostFoundReports.createdAt))
        .limit(parseInt(limit))
        .offset(offset);

      const reports = await query;

      res.status(200).json({
        success: true,
        data: {
          reports: reports.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] })),
          pagination: { page: parseInt(page), limit: parseInt(limit), hasMore: reports.length === parseInt(limit) }
        },
        requestId
      });
    } catch (error) {
      logger.error('Get lost/found reports error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch reports.', requestId });
    }
  },

  // Get single report by ID
  getReportById: async (req, res) => {
    const requestId = req.requestId;
    try {
      const { reportId } = req.params;

      const result = await db
        .select({
          report: lostFoundReports,
          reporterName: users.name,
          reporterImage: users.profileImage,
          reporterEmail: users.email
        })
        .from(lostFoundReports)
        .leftJoin(users, eq(lostFoundReports.reporterId, users.id))
        .where(eq(lostFoundReports.id, reportId))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found', requestId });
      }

      const { report, reporterName, reporterImage, reporterEmail } = result[0];

      res.status(200).json({
        success: true,
        data: {
          report: {
            ...report,
            images: report.images ? JSON.parse(report.images) : [],
            reporter: { name: reporterName, image: reporterImage, email: reporterEmail }
          }
        },
        requestId
      });
    } catch (error) {
      logger.error('Get report by ID error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch report.', requestId });
    }
  },

  // Get current user's reports
  getMyReports: async (req, res) => {
    const requestId = req.requestId;
    const reporterId = req.user.userId;
    try {
      const reports = await db
        .select()
        .from(lostFoundReports)
        .where(eq(lostFoundReports.reporterId, reporterId))
        .orderBy(desc(lostFoundReports.createdAt));

      res.status(200).json({
        success: true,
        data: { reports: reports.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] })) },
        requestId
      });
    } catch (error) {
      logger.error('Get my reports error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to fetch reports.', requestId });
    }
  },

  // Mark report as resolved
  resolveReport: async (req, res) => {
    const requestId = req.requestId;
    const reporterId = req.user.userId;
    try {
      const { reportId } = req.params;
      const { resolvedNote } = req.body;

      const existing = await db
        .select({ id: lostFoundReports.id, reporterId: lostFoundReports.reporterId })
        .from(lostFoundReports)
        .where(eq(lostFoundReports.id, reportId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found', requestId });
      }

      const isOwner = existing[0].reporterId === reporterId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this report', requestId });
      }

      await db
        .update(lostFoundReports)
        .set({ status: 'resolved', resolvedAt: new Date(), resolvedNote: resolvedNote || null, updatedAt: new Date() })
        .where(eq(lostFoundReports.id, reportId));

      logger.info('Report marked as resolved', { reportId, reporterId, requestId });

      res.status(200).json({ success: true, message: 'Report marked as resolved. Happy reunion!', requestId });
    } catch (error) {
      logger.error('Resolve report error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to update report.', requestId });
    }
  },

  // Delete a report
  deleteReport: async (req, res) => {
    const requestId = req.requestId;
    const userId = req.user.userId;
    try {
      const { reportId } = req.params;

      const existing = await db
        .select({ id: lostFoundReports.id, reporterId: lostFoundReports.reporterId })
        .from(lostFoundReports)
        .where(eq(lostFoundReports.id, reportId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found', requestId });
      }

      const isOwner = existing[0].reporterId === userId;
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this report', requestId });
      }

      await db.delete(lostFoundReports).where(eq(lostFoundReports.id, reportId));

      logger.info('Report deleted', { reportId, userId, requestId });

      res.status(200).json({ success: true, message: 'Report deleted successfully.', requestId });
    } catch (error) {
      logger.error('Delete report error:', { error: error.message, requestId });
      res.status(500).json({ success: false, message: 'Failed to delete report.', requestId });
    }
  }
};

module.exports = lostFoundController;
