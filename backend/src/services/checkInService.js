const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { adoptionCheckIns, adoptionRequests, pets, users, notifications } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, desc } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

const CHECK_IN_SCHEDULE = [
  { type: '30_day', daysAfter: 30 },
  { type: '90_day', daysAfter: 90 },
  { type: '6_month', daysAfter: 180 },
];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const checkInService = {
  // Called when shelter marks an adoption as complete
  createCheckInsForAdoption: async (adoptionRequestId, adopterId, shelterId, petId, adoptionDate = new Date()) => {
    const rows = CHECK_IN_SCHEDULE.map(({ type, daysAfter }) => ({
      id: createId(),
      adoptionRequestId,
      petId,
      adopterId,
      shelterId,
      dueDate: addDays(adoptionDate, daysAfter),
      status: 'pending',
      checkInType: type,
    }));

    await db.insert(adoptionCheckIns).values(rows);

    // Notify adopter
    try {
      const [notification] = await db.insert(notifications).values({
        id: createId(),
        userId: adopterId,
        type: 'adoption_complete',
        title: 'Adoption completed!',
        message: 'Congratulations! Your adoption is complete. We\'ll send you check-in reminders to see how your new pet is settling in.',
        relatedId: adoptionRequestId,
        relatedType: 'adoption_request',
        actionUrl: '/my-requests',
        isRead: false,
      }).returning();
      emitToUser(adopterId, 'notification:new', { notification });
    } catch (err) {
      logger.warn('Failed to send adoption completion notification', { err: err.message });
    }

    return rows;
  },

  // Adopter: get their pending check-ins with pet info
  getAdopterCheckIns: async (adopterId) => {
    const rows = await db
      .select({
        id: adoptionCheckIns.id,
        checkInType: adoptionCheckIns.checkInType,
        dueDate: adoptionCheckIns.dueDate,
        submittedAt: adoptionCheckIns.submittedAt,
        status: adoptionCheckIns.status,
        overallWellbeing: adoptionCheckIns.overallWellbeing,
        concerns: adoptionCheckIns.concerns,
        happyMoments: adoptionCheckIns.happyMoments,
        adoptionRequestId: adoptionCheckIns.adoptionRequestId,
        petId: adoptionCheckIns.petId,
        petName: pets.name,
        petPrimaryImage: pets.primaryImage,
        petSpecies: pets.species,
      })
      .from(adoptionCheckIns)
      .innerJoin(pets, eq(adoptionCheckIns.petId, pets.id))
      .where(eq(adoptionCheckIns.adopterId, adopterId))
      .orderBy(desc(adoptionCheckIns.dueDate));

    return rows;
  },

  // Shelter: get check-ins for their pets
  getShelterCheckIns: async (shelterId) => {
    const rows = await db
      .select({
        id: adoptionCheckIns.id,
        checkInType: adoptionCheckIns.checkInType,
        dueDate: adoptionCheckIns.dueDate,
        submittedAt: adoptionCheckIns.submittedAt,
        status: adoptionCheckIns.status,
        overallWellbeing: adoptionCheckIns.overallWellbeing,
        isEatingWell: adoptionCheckIns.isEatingWell,
        isActive: adoptionCheckIns.isActive,
        vetVisited: adoptionCheckIns.vetVisited,
        concerns: adoptionCheckIns.concerns,
        happyMoments: adoptionCheckIns.happyMoments,
        photoUrl: adoptionCheckIns.photoUrl,
        shelterNotes: adoptionCheckIns.shelterNotes,
        petId: adoptionCheckIns.petId,
        petName: pets.name,
        petPrimaryImage: pets.primaryImage,
        adopterId: adoptionCheckIns.adopterId,
        adopterName: users.name,
      })
      .from(adoptionCheckIns)
      .innerJoin(pets, eq(adoptionCheckIns.petId, pets.id))
      .innerJoin(users, eq(adoptionCheckIns.adopterId, users.id))
      .where(eq(adoptionCheckIns.shelterId, shelterId))
      .orderBy(desc(adoptionCheckIns.dueDate));

    return rows;
  },

  // Adopter submits a check-in
  submitCheckIn: async (checkInId, adopterId, data) => {
    const existing = await db.select().from(adoptionCheckIns)
      .where(and(eq(adoptionCheckIns.id, checkInId), eq(adoptionCheckIns.adopterId, adopterId)))
      .limit(1);

    if (!existing[0]) return null;
    if (existing[0].status === 'submitted') return 'already_submitted';

    const [updated] = await db.update(adoptionCheckIns)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        overallWellbeing: data.overallWellbeing || null,
        weight: data.weight || null,
        isEatingWell: data.isEatingWell ?? null,
        isActive: data.isActive ?? null,
        vetVisited: data.vetVisited ?? false,
        concerns: data.concerns || null,
        happyMoments: data.happyMoments || null,
        photoUrl: data.photoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(adoptionCheckIns.id, checkInId))
      .returning();

    // Notify shelter
    try {
      const [notification] = await db.insert(notifications).values({
        id: createId(),
        userId: existing[0].shelterId,
        type: 'checkin_submitted',
        title: 'New check-in submitted',
        message: `An adopter has submitted their check-in report. See how ${updated.overallWellbeing ? `the pet is doing (${updated.overallWellbeing})` : 'the pet is settling in'}.`,
        relatedId: checkInId,
        relatedType: 'check_in',
        actionUrl: '/adoption-requests',
        isRead: false,
      }).returning();
      emitToUser(existing[0].shelterId, 'notification:new', { notification });
    } catch (err) {
      logger.warn('Failed to notify shelter of check-in', { err: err.message });
    }

    return updated;
  },
};

module.exports = checkInService;
