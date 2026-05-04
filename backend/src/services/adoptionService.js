const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { adoptionRequests, pets, users, notifications } = require('../models');
const { logger } = require('../config/logger');
const emailService = require('./emailServices');
const { eq, and, desc, sql } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

function buildPagination(page, limit, totalCount) {
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  return {
    currentPage: parseInt(page),
    totalPages,
    totalCount,
    limit: parseInt(limit),
    hasNext: parseInt(page) < totalPages,
    hasPrev: parseInt(page) > 1,
  };
}

const REQUEST_FIELDS = {
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
};

const PET_FIELDS = {
  petName: pets.name, petSlug: pets.slug, petSpecies: pets.species,
  petBreed: pets.breed, petAge: pets.age, petAgeUnit: pets.ageUnit,
  petGender: pets.gender, petSize: pets.size, petPrimaryImage: pets.primaryImage,
  petCity: pets.city, petState: pets.state, petAdoptionStatus: pets.adoptionStatus,
  petDescription: pets.description,
};

function extractPet(row) {
  return {
    id: row.petId, slug: row.petSlug, name: row.petName, species: row.petSpecies,
    breed: row.petBreed, age: row.petAge, ageUnit: row.petAgeUnit,
    gender: row.petGender, size: row.petSize, primaryImage: row.petPrimaryImage,
    city: row.petCity, state: row.petState, adoptionStatus: row.petAdoptionStatus,
    description: row.petDescription,
  };
}

function extractBase(row) {
  return {
    id: row.id, petId: row.petId, adopterId: row.adopterId, shelterId: row.shelterId,
    status: row.status, message: row.message, responseMessage: row.responseMessage,
    meetingScheduled: row.meetingScheduled, meetingDate: row.meetingDate,
    meetingLocation: row.meetingLocation, meetingNotes: row.meetingNotes,
    createdAt: row.createdAt, updatedAt: row.updatedAt, respondedAt: row.respondedAt,
    pet: extractPet(row),
  };
}

const adoptionService = {
  createAdoptionRequest: async (adopterId, petId, message) => {
    const petResult = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
    if (petResult.length === 0) throw Object.assign(new Error('Pet not found'), { statusCode: 404 });

    const pet = petResult[0];
    if (pet.adoptionStatus !== 'available') throw Object.assign(new Error('This pet is no longer available for adoption'), { statusCode: 400 });
    if (pet.ownerId === adopterId)          throw Object.assign(new Error('You cannot adopt your own pet'), { statusCode: 400 });

    const existing = await db.select().from(adoptionRequests)
      .where(and(eq(adoptionRequests.petId, petId), eq(adoptionRequests.adopterId, adopterId), eq(adoptionRequests.status, 'pending')))
      .limit(1);
    if (existing.length > 0) throw Object.assign(new Error('You already have a pending adoption request for this pet'), { statusCode: 400 });

    const newId = createId();
    const [newRequest] = await db.insert(adoptionRequests).values({
      id: newId, petId, adopterId, shelterId: pet.ownerId, message, status: 'pending',
    }).returning();

    await db.update(pets).set({ inquiryCount: sql`${pets.inquiryCount} + 1`, updatedAt: new Date() }).where(eq(pets.id, petId));

    const [notification] = await db.insert(notifications).values({
      id: createId(), userId: pet.ownerId, type: 'adoption_request',
      title: 'New Adoption Request', message: `Someone is interested in adopting ${pet.name}`,
      relatedId: newId, relatedType: 'adoption_request', actionUrl: '/adoption-requests',
    }).returning();

    try { emitToUser(pet.ownerId, 'notification:new', { notification }); }
    catch (err) { logger.warn('Failed to emit socket notification', { err: err.message }); }

    Promise.all([
      db.select().from(users).where(eq(users.id, pet.ownerId)).limit(1),
      db.select().from(users).where(eq(users.id, adopterId)).limit(1),
    ]).then(([shelterRows, adopterRows]) => {
      if (shelterRows.length && adopterRows.length) {
        emailService.sendAdoptionRequestEmail(shelterRows[0], adopterRows[0], pet)
          .catch(err => logger.warn('Failed to send adoption request email', { err: err.message }));
      }
    }).catch(err => logger.warn('Email lookup failed', { err: err.message }));

    return newRequest;
  },

  getMyAdoptionRequests: async (adopterId, filters) => {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(adoptionRequests.adopterId, adopterId)];
    if (status) conditions.push(eq(adoptionRequests.status, status));
    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db.select({
        ...REQUEST_FIELDS, ...PET_FIELDS,
        shelterName: users.name, shelterEmail: users.email, shelterRole: users.role,
        shelterProfileImage: users.profileImage, shelterCity: users.city,
        shelterState: users.state, shelterPhone: users.phone,
      })
        .from(adoptionRequests)
        .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
        .innerJoin(users, eq(adoptionRequests.shelterId, users.id))
        .where(whereClause).limit(parseInt(limit)).offset(offset).orderBy(desc(adoptionRequests.createdAt)),

      db.select({ count: sql`count(*)` }).from(adoptionRequests).where(whereClause),
    ]);

    const requests = rows.map(row => ({
      ...extractBase(row),
      shelter: {
        id: row.shelterId, name: row.shelterName, email: row.shelterEmail,
        role: row.shelterRole, profileImage: row.shelterProfileImage,
        city: row.shelterCity, state: row.shelterState, phone: row.shelterPhone,
      },
    }));

    return { requests, pagination: buildPagination(page, limit, parseInt(countResult[0].count)) };
  },

  getReceivedAdoptionRequests: async (shelterId, filters) => {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(adoptionRequests.shelterId, shelterId)];
    if (status) conditions.push(eq(adoptionRequests.status, status));
    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db.select({
        ...REQUEST_FIELDS, ...PET_FIELDS,
        adopterName: users.name, adopterEmail: users.email, adopterPhone: users.phone,
        adopterCity: users.city, adopterState: users.state, adopterProfileImage: users.profileImage,
      })
        .from(adoptionRequests)
        .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
        .innerJoin(users, eq(adoptionRequests.adopterId, users.id))
        .where(whereClause).limit(parseInt(limit)).offset(offset).orderBy(desc(adoptionRequests.createdAt)),

      db.select({ count: sql`count(*)` }).from(adoptionRequests).where(whereClause),
    ]);

    const requests = rows.map(row => ({
      ...extractBase(row),
      adopter: {
        id: row.adopterId, name: row.adopterName, email: row.adopterEmail,
        phone: row.adopterPhone, city: row.adopterCity, state: row.adopterState,
        profileImage: row.adopterProfileImage,
      },
    }));

    return { requests, pagination: buildPagination(page, limit, parseInt(countResult[0].count)) };
  },

  respondToAdoptionRequest: async (requestIdParam, shelterId, body) => {
    const { status, responseMessage, meetingDate, meetingLocation, meetingNotes } = body;

    if (!['approved', 'rejected'].includes(status)) {
      throw Object.assign(new Error('Status must be either approved or rejected'), { statusCode: 400 });
    }

    const existing = await db.select().from(adoptionRequests)
      .where(and(eq(adoptionRequests.id, requestIdParam), eq(adoptionRequests.shelterId, shelterId)))
      .limit(1);
    if (existing.length === 0) throw Object.assign(new Error('Adoption request not found or you do not have permission'), { statusCode: 404 });

    const request = existing[0];
    if (request.status !== 'pending') throw Object.assign(new Error('This request has already been responded to'), { statusCode: 400 });

    const updateData = { status, responseMessage, respondedAt: new Date(), updatedAt: new Date() };
    if (status === 'approved' && meetingDate) {
      Object.assign(updateData, {
        meetingScheduled: true, meetingDate: new Date(meetingDate),
        meetingLocation: meetingLocation || null, meetingNotes: meetingNotes || null,
      });
    }

    const [updated] = await db.update(adoptionRequests).set(updateData).where(eq(adoptionRequests.id, requestIdParam)).returning();

    if (status === 'approved') {
      await db.update(pets).set({ adoptionStatus: 'pending', updatedAt: new Date() }).where(eq(pets.id, request.petId));
    }

    const [notification] = await db.insert(notifications).values({
      id: createId(), userId: request.adopterId,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Adoption Request Approved!' : 'Adoption Request Update',
      message: status === 'approved'
        ? 'Your adoption request has been approved! Check the details for next steps.'
        : 'Your adoption request has been reviewed.',
      relatedId: requestIdParam, relatedType: 'adoption_request', actionUrl: '/my-requests',
    }).returning();

    try { emitToUser(request.adopterId, 'notification:new', { notification }); }
    catch (err) { logger.warn('Failed to emit socket notification', { err: err.message }); }

    if (status === 'approved') {
      Promise.all([
        db.select().from(users).where(eq(users.id, request.adopterId)).limit(1),
        db.select().from(users).where(eq(users.id, shelterId)).limit(1),
        db.select().from(pets).where(eq(pets.id, request.petId)).limit(1),
      ]).then(([adopterRows, shelterRows, petRows]) => {
        if (adopterRows.length && shelterRows.length && petRows.length) {
          emailService.sendRequestApprovedEmail(
            adopterRows[0], petRows[0], shelterRows[0],
            { meetingDate, meetingLocation, meetingNotes }
          ).catch(err => logger.warn('Failed to send approval email', { err: err.message }));
        }
      }).catch(err => logger.warn('Email lookup failed', { err: err.message }));
    }

    return updated;
  },

  withdrawAdoptionRequest: async (requestIdParam, adopterId) => {
    const existing = await db.select().from(adoptionRequests)
      .where(and(eq(adoptionRequests.id, requestIdParam), eq(adoptionRequests.adopterId, adopterId)))
      .limit(1);
    if (existing.length === 0) throw Object.assign(new Error('Adoption request not found'), { statusCode: 404 });

    const request = existing[0];
    if (request.status !== 'pending') throw Object.assign(new Error('Only pending requests can be withdrawn'), { statusCode: 400 });

    await db.update(adoptionRequests)
      .set({ status: 'withdrawn', updatedAt: new Date() })
      .where(eq(adoptionRequests.id, requestIdParam));
  },
};

module.exports = adoptionService;
