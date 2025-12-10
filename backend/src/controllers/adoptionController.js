const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { adoptionRequests, pets, users, notifications } = require('../models');
const { logger } = require('../config/logger');
const emailService = require('../services/emailServices');
const { eq, and, or, desc, sql } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

const adoptionController = {
  // Create adoption request
  createAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;

    try {
      const { petId, message } = req.body;

      // Check if pet exists and is available
      const petResult = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (petResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          requestId
        });
      }

      const pet = petResult[0];

      if (pet.adoptionStatus !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'This pet is no longer available for adoption',
          requestId
        });
      }

      // Can't adopt your own pet
      if (pet.ownerId === adopterId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot adopt your own pet',
          requestId
        });
      }

      // Check if request already exists
      const existingRequest = await db
        .select()
        .from(adoptionRequests)
        .where(and(
          eq(adoptionRequests.petId, petId),
          eq(adoptionRequests.adopterId, adopterId),
          eq(adoptionRequests.status, 'pending')
        ))
        .limit(1);

      if (existingRequest.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending adoption request for this pet',
          requestId
        });
      }

      // Create adoption request
      const requestIdGenerated = createId();
      const newRequest = await db
        .insert(adoptionRequests)
        .values({
          id: requestIdGenerated,
          petId,
          adopterId,
          shelterId: pet.ownerId,
          message,
          status: 'pending',
        })
        .returning();

      // Update pet inquiry count
      await db
        .update(pets)
        .set({
          inquiryCount: sql`${pets.inquiryCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(pets.id, petId));

      // Create notification for shelter
      const notificationId = createId();
      const newNotification = await db.insert(notifications).values({
        id: notificationId,
        userId: pet.ownerId,
        type: 'adoption_request',
        title: 'New Adoption Request',
        message: `Someone is interested in adopting ${pet.name}`,
        relatedId: requestIdGenerated,
        relatedType: 'adoption_request',
        actionUrl: `/adoption-requests/${requestIdGenerated}`,
      }).returning();

      // Emit real-time notification via Socket.IO
      try {
        emitToUser(pet.ownerId, 'notification:new', {
          notification: newNotification[0]
        });
      } catch (socketError) {
        logger.warn('Failed to emit notification socket event:', socketError);
      }

      // Send email notification to shelter
      try {
        const shelterInfo = await db
          .select()
          .from(users)
          .where(eq(users.id, pet.ownerId))
          .limit(1);

        const adopterInfo = await db
          .select()
          .from(users)
          .where(eq(users.id, adopterId))
          .limit(1);

        if (shelterInfo.length > 0 && adopterInfo.length > 0) {
          await emailService.sendAdoptionRequestEmail(
            shelterInfo[0],
            adopterInfo[0],
            pet
          );
          logger.info('Adoption request email sent successfully', {
            shelterEmail: shelterInfo[0].email,
            petName: pet.name,
          });
        }
      } catch (emailError) {
        logger.warn('Failed to send adoption request email:', emailError);
      }

      logger.info('Adoption request created successfully', {
        adopterId,
        petId,
        requestId: requestIdGenerated,
        requestIdLog: requestId
      });

      res.status(201).json({
        success: true,
        message: 'Adoption request sent successfully',
        data: {
          request: newRequest[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Create adoption request error:', { 
        error: error.message, 
        stack: error.stack,
        adopterId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to create adoption request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // ✅ FIXED: Get my adoption requests (as adopter)
  getMyAdoptionRequests: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;

    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [eq(adoptionRequests.adopterId, adopterId)];

      if (status) {
        conditions.push(eq(adoptionRequests.status, status));
      }

      const whereClause = and(...conditions);

      // ✅ Get requests with complete pet and shelter details
      const requests = await db
        .select({
          // Request fields
          id: adoptionRequests.id,
          petId: adoptionRequests.petId,
          adopterId: adoptionRequests.adopterId,
          shelterId: adoptionRequests.shelterId,
          status: adoptionRequests.status,
          message: adoptionRequests.message,
          responseMessage: adoptionRequests.responseMessage,
          meetingScheduled: adoptionRequests.meetingScheduled,
          meetingDate: adoptionRequests.meetingDate,
          meetingLocation: adoptionRequests.meetingLocation,
          meetingNotes: adoptionRequests.meetingNotes,
          createdAt: adoptionRequests.createdAt,
          updatedAt: adoptionRequests.updatedAt,
          respondedAt: adoptionRequests.respondedAt,
          // Pet fields
          petName: pets.name,
          petSpecies: pets.species,
          petBreed: pets.breed,
          petAge: pets.age,
          petAgeUnit: pets.ageUnit,
          petGender: pets.gender,
          petSize: pets.size,
          petPrimaryImage: pets.primaryImage,
          petCity: pets.city,
          petState: pets.state,
          petAdoptionFee: pets.adoptionFee,
          petAdoptionStatus: pets.adoptionStatus,
          petDescription: pets.description,
          // Shelter fields
          shelterId: users.id,
          shelterName: users.name,
          shelterEmail: users.email,
          shelterRole: users.role,
          shelterProfileImage: users.profileImage,
          shelterCity: users.city,
          shelterState: users.state,
          shelterPhone: users.phone,
        })
        .from(adoptionRequests)
        .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
        .innerJoin(users, eq(adoptionRequests.shelterId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(adoptionRequests.createdAt));

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(adoptionRequests)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      // ✅ Transform data to match frontend structure
      const formattedRequests = requests.map(req => ({
        id: req.id,
        petId: req.petId,
        adopterId: req.adopterId,
        shelterId: req.shelterId,
        status: req.status,
        message: req.message,
        responseMessage: req.responseMessage,
        meetingScheduled: req.meetingScheduled,
        meetingDate: req.meetingDate,
        meetingLocation: req.meetingLocation,
        meetingNotes: req.meetingNotes,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        respondedAt: req.respondedAt,
        pet: {
          id: req.petId,
          name: req.petName,
          species: req.petSpecies,
          breed: req.petBreed,
          age: req.petAge,
          ageUnit: req.petAgeUnit,
          gender: req.petGender,
          size: req.petSize,
          primaryImage: req.petPrimaryImage,
          city: req.petCity,
          state: req.petState,
          adoptionFee: req.petAdoptionFee,
          adoptionStatus: req.petAdoptionStatus,
          description: req.petDescription,
        },
        shelter: {
          id: req.shelterId,
          name: req.shelterName,
          email: req.shelterEmail,
          role: req.shelterRole,
          profileImage: req.shelterProfileImage,
          city: req.shelterCity,
          state: req.shelterState,
          phone: req.shelterPhone,
        }
      }));

      logger.info('My adoption requests fetched successfully', {
        adopterId,
        count: requests.length,
        totalCount,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Adoption requests fetched successfully',
        data: {
          requests: formattedRequests,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get my adoption requests error:', { 
        error: error.message,
        stack: error.stack,
        adopterId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch adoption requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // ✅ FIXED: Get received adoption requests (as shelter)
  getReceivedAdoptionRequests: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;

    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [eq(adoptionRequests.shelterId, shelterId)];

      if (status) {
        conditions.push(eq(adoptionRequests.status, status));
      }

      const whereClause = and(...conditions);

      // ✅ Get requests with complete pet and adopter details
      const requests = await db
        .select({
          // Request fields
          id: adoptionRequests.id,
          petId: adoptionRequests.petId,
          adopterId: adoptionRequests.adopterId,
          shelterId: adoptionRequests.shelterId,
          status: adoptionRequests.status,
          message: adoptionRequests.message,
          responseMessage: adoptionRequests.responseMessage,
          meetingScheduled: adoptionRequests.meetingScheduled,
          meetingDate: adoptionRequests.meetingDate,
          meetingLocation: adoptionRequests.meetingLocation,
          meetingNotes: adoptionRequests.meetingNotes,
          createdAt: adoptionRequests.createdAt,
          updatedAt: adoptionRequests.updatedAt,
          respondedAt: adoptionRequests.respondedAt,
          // Pet fields
          petName: pets.name,
          petSpecies: pets.species,
          petBreed: pets.breed,
          petAge: pets.age,
          petAgeUnit: pets.ageUnit,
          petGender: pets.gender,
          petSize: pets.size,
          petPrimaryImage: pets.primaryImage,
          petCity: pets.city,
          petState: pets.state,
          petAdoptionFee: pets.adoptionFee,
          petAdoptionStatus: pets.adoptionStatus,
          petDescription: pets.description,
          // Adopter fields
          adopterName: users.name,
          adopterEmail: users.email,
          adopterPhone: users.phone,
          adopterCity: users.city,
          adopterState: users.state,
          adopterProfileImage: users.profileImage,
        })
        .from(adoptionRequests)
        .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
        .innerJoin(users, eq(adoptionRequests.adopterId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(adoptionRequests.createdAt));

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(adoptionRequests)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      // ✅ Transform data
      const formattedRequests = requests.map(req => ({
        id: req.id,
        petId: req.petId,
        adopterId: req.adopterId,
        shelterId: req.shelterId,
        status: req.status,
        message: req.message,
        responseMessage: req.responseMessage,
        meetingScheduled: req.meetingScheduled,
        meetingDate: req.meetingDate,
        meetingLocation: req.meetingLocation,
        meetingNotes: req.meetingNotes,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        respondedAt: req.respondedAt,
        pet: {
          id: req.petId,
          name: req.petName,
          species: req.petSpecies,
          breed: req.petBreed,
          age: req.petAge,
          ageUnit: req.petAgeUnit,
          gender: req.petGender,
          size: req.petSize,
          primaryImage: req.petPrimaryImage,
          city: req.petCity,
          state: req.petState,
          adoptionFee: req.petAdoptionFee,
          adoptionStatus: req.petAdoptionStatus,
          description: req.petDescription,
        },
        adopter: {
          id: req.adopterId,
          name: req.adopterName,
          email: req.adopterEmail,
          phone: req.adopterPhone,
          city: req.adopterCity,
          state: req.adopterState,
          profileImage: req.adopterProfileImage,
        }
      }));

      logger.info('Received adoption requests fetched successfully', {
        shelterId,
        count: requests.length,
        totalCount,
        requestId
      });

      res.status(200).json({
        success: true,
        message: 'Received adoption requests fetched successfully',
        data: {
          requests: formattedRequests,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get received adoption requests error:', { 
        error: error.message,
        stack: error.stack,
        shelterId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch adoption requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // Respond to adoption request (approve/reject)
  respondToAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const shelterId = req.user.userId;
    const { requestIdParam } = req.params;

    try {
      const { status, responseMessage, meetingDate, meetingLocation, meetingNotes } = req.body;

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either approved or rejected',
          requestId
        });
      }

      // Get request
      const existingRequest = await db
        .select()
        .from(adoptionRequests)
        .where(and(
          eq(adoptionRequests.id, requestIdParam),
          eq(adoptionRequests.shelterId, shelterId)
        ))
        .limit(1);

      if (existingRequest.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Adoption request not found or you do not have permission',
          requestId
        });
      }

      const request = existingRequest[0];

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'This request has already been responded to',
          requestId
        });
      }

      // Update request
      const updateData = {
        status,
        responseMessage,
        respondedAt: new Date(),
        updatedAt: new Date(),
      };

      if (status === 'approved' && meetingDate) {
        updateData.meetingScheduled = true;
        updateData.meetingDate = new Date(meetingDate);
        updateData.meetingLocation = meetingLocation || null;
        updateData.meetingNotes = meetingNotes || null;
      }

      const updatedRequest = await db
        .update(adoptionRequests)
        .set(updateData)
        .where(eq(adoptionRequests.id, requestIdParam))
        .returning();

      // Update pet status if approved
      if (status === 'approved') {
        await db
          .update(pets)
          .set({
            adoptionStatus: 'pending',
            updatedAt: new Date()
          })
          .where(eq(pets.id, request.petId));
      }

      // Create notification for adopter
      const notificationId = createId();
      const newNotification = await db.insert(notifications).values({
        id: notificationId,
        userId: request.adopterId,
        type: status === 'approved' ? 'request_approved' : 'request_rejected',
        title: status === 'approved' ? 'Adoption Request Approved!' : 'Adoption Request Update',
        message: status === 'approved' 
          ? 'Your adoption request has been approved! Check the details for next steps.'
          : 'Your adoption request has been reviewed.',
        relatedId: requestIdParam,
        relatedType: 'adoption_request',
        actionUrl: `/my-requests/${requestIdParam}`,
      }).returning();

      // Emit real-time notification via Socket.IO
      try {
        emitToUser(request.adopterId, 'notification:new', {
          notification: newNotification[0]
        });
      } catch (socketError) {
        logger.warn('Failed to emit notification socket event:', socketError);
      }

      // Send email notification if approved
      if (status === 'approved') {
        try {
          const adopterInfo = await db
            .select()
            .from(users)
            .where(eq(users.id, request.adopterId))
            .limit(1);

          const shelterInfo = await db
            .select()
            .from(users)
            .where(eq(users.id, shelterId))
            .limit(1);

          const petInfo = await db
            .select()
            .from(pets)
            .where(eq(pets.id, request.petId))
            .limit(1);

          if (adopterInfo.length > 0 && shelterInfo.length > 0 && petInfo.length > 0) {
            await emailService.sendRequestApprovedEmail(
              adopterInfo[0],
              petInfo[0],
              shelterInfo[0],
              { meetingDate, meetingLocation, meetingNotes }
            );
            logger.info('Approval email sent successfully', {
              adopterEmail: adopterInfo[0].email,
              petName: petInfo[0].name,
            });
          }
        } catch (emailError) {
          logger.warn('Failed to send approval email:', emailError);
        }
      }

      logger.info('Adoption request responded', {
        shelterId,
        requestId: requestIdParam,
        status,
        requestIdLog: requestId
      });

      res.status(200).json({
        success: true,
        message: `Adoption request ${status} successfully`,
        data: {
          request: updatedRequest[0]
        },
        requestId
      });

    } catch (error) {
      logger.error('Respond to adoption request error:', { 
        error: error.message,
        stack: error.stack,
        shelterId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to respond to adoption request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },

  // Withdraw adoption request
  withdrawAdoptionRequest: async (req, res) => {
    const requestId = req.requestId;
    const adopterId = req.user.userId;
    const { requestIdParam } = req.params;

    try {
      // Get request
      const existingRequest = await db
        .select()
        .from(adoptionRequests)
        .where(and(
          eq(adoptionRequests.id, requestIdParam),
          eq(adoptionRequests.adopterId, adopterId)
        ))
        .limit(1);

      if (existingRequest.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Adoption request not found',
          requestId
        });
      }

      const request = existingRequest[0];

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending requests can be withdrawn',
          requestId
        });
      }

      // Update request
      await db
        .update(adoptionRequests)
        .set({
          status: 'withdrawn',
          updatedAt: new Date()
        })
        .where(eq(adoptionRequests.id, requestIdParam));

      logger.info('Adoption request withdrawn', {
        adopterId,
        requestId: requestIdParam,
        requestIdLog: requestId
      });

      res.status(200).json({
        success: true,
        message: 'Adoption request withdrawn successfully',
        requestId
      });

    } catch (error) {
      logger.error('Withdraw adoption request error:', { 
        error: error.message,
        stack: error.stack,
        adopterId, 
        requestId 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to withdraw adoption request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId
      });
    }
  },
};

module.exports = adoptionController;
