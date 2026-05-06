const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { savedSearches, notifications } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, isNull } = require('drizzle-orm');
const { emitToUser } = require('../config/socket');

const savedSearchService = {
  getByUser: async (userId) => {
    return db.select().from(savedSearches).where(eq(savedSearches.userId, userId));
  },

  create: async (userId, data) => {
    const [row] = await db.insert(savedSearches).values({
      id: createId(),
      userId,
      name: data.name,
      species: data.species || null,
      breed: data.breed || null,
      gender: data.gender || null,
      size: data.size || null,
      city: data.city || null,
      state: data.state || null,
      minAge: data.minAge ? parseInt(data.minAge) : null,
      maxAge: data.maxAge ? parseInt(data.maxAge) : null,
      isActive: true,
    }).returning();
    return row;
  },

  toggle: async (id, userId) => {
    const existing = await db.select().from(savedSearches)
      .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)))
      .limit(1);
    if (!existing[0]) return null;

    const [updated] = await db.update(savedSearches)
      .set({ isActive: !existing[0].isActive, updatedAt: new Date() })
      .where(eq(savedSearches.id, id))
      .returning();
    return updated;
  },

  delete: async (id, userId) => {
    const result = await db.delete(savedSearches)
      .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)))
      .returning();
    return result.length > 0;
  },

  // Called from petService.createPet to notify users whose saved searches match
  notifyMatchingUsers: async (pet) => {
    try {
      const conditions = [eq(savedSearches.isActive, true)];

      const allActive = await db.select().from(savedSearches).where(and(...conditions));

      const matched = allActive.filter(search => {
        if (search.species && search.species !== pet.species) return false;
        if (search.gender && search.gender !== pet.gender) return false;
        if (search.size && search.size !== pet.size) return false;
        if (search.city && search.city?.toLowerCase() !== pet.city?.toLowerCase()) return false;
        if (search.state && search.state?.toLowerCase() !== pet.state?.toLowerCase()) return false;
        if (search.breed && pet.breed && !pet.breed.toLowerCase().includes(search.breed.toLowerCase())) return false;
        if (search.minAge !== null && search.minAge !== undefined && pet.age !== null) {
          const ageMonths = pet.ageUnit === 'years' ? pet.age * 12 : pet.age;
          const minMonths = search.minAge;
          if (ageMonths < minMonths) return false;
        }
        if (search.maxAge !== null && search.maxAge !== undefined && pet.age !== null) {
          const ageMonths = pet.ageUnit === 'years' ? pet.age * 12 : pet.age;
          const maxMonths = search.maxAge;
          if (ageMonths > maxMonths) return false;
        }
        // Don't notify the pet's own owner
        if (search.userId === pet.ownerId) return false;
        return true;
      });

      for (const search of matched) {
        try {
          const [notification] = await db.insert(notifications).values({
            id: createId(),
            userId: search.userId,
            type: 'pet_alert',
            title: `New pet matches your alert "${search.name}"`,
            message: `${pet.name} (${pet.species}${pet.breed ? `, ${pet.breed}` : ''}) is now available for adoption in ${pet.city || pet.state || 'your area'}.`,
            relatedId: pet.id,
            relatedType: 'pet',
            actionUrl: `/pets/${pet.id}`,
            isRead: false,
          }).returning();

          emitToUser(search.userId, 'notification:new', { notification });

          await db.update(savedSearches)
            .set({ lastNotifiedAt: new Date(), updatedAt: new Date() })
            .where(eq(savedSearches.id, search.id));
        } catch (err) {
          logger.warn('Failed to send pet alert notification', { searchId: search.id, err: err.message });
        }
      }

      if (matched.length > 0) {
        logger.info(`Pet alert: notified ${matched.length} user(s) for pet ${pet.id}`);
      }
    } catch (err) {
      logger.warn('savedSearchService.notifyMatchingUsers failed', { err: err.message });
    }
  },
};

module.exports = savedSearchService;
