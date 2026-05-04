const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, shelters, pets } = require('../models');
const { eq, and, sql } = require('drizzle-orm');

const SHELTER_WITH_USER = {
  shelter: shelters,
  user: {
    id: users.id, name: users.name, email: users.email,
    profileImage: users.profileImage, city: users.city,
    state: users.state, country: users.country, createdAt: users.createdAt,
  },
};

function formatShelterResponse(row) {
  return {
    id: row.shelter.id,
    userId: row.shelter.userId,
    organizationName: row.shelter.organizationName,
    description: row.shelter.description,
    website: row.shelter.website,
    establishedYear: row.shelter.establishedYear,
    capacity: row.shelter.capacity,
    currentPetCount: row.shelter.currentPetCount,
    averageRating: row.shelter.averageRating,
    totalReviews: row.shelter.totalReviews,
    verificationStatus: row.shelter.verificationStatus,
    createdAt: row.shelter.createdAt,
    user: row.user,
  };
}

async function fetchShelterWithUser(userId) {
  const result = await db.select(SHELTER_WITH_USER)
    .from(shelters).innerJoin(users, eq(shelters.userId, users.id))
    .where(eq(shelters.userId, userId)).limit(1);
  return result[0] || null;
}

async function ensureShelterExists(userId) {
  let row = await fetchShelterWithUser(userId);
  if (row) return row;

  const userRow = await db.select({ id: users.id, name: users.name, role: users.role })
    .from(users).where(eq(users.id, userId)).limit(1);
  if (!userRow.length || userRow[0].role !== 'shelter') return null;

  await db.insert(shelters).values({
    id: createId(), userId, organizationName: userRow[0].name,
    currentPetCount: 0, documentsVerified: false, verificationStatus: 'pending',
    averageRating: '0.00', totalReviews: 0,
  });

  return fetchShelterWithUser(userId);
}

const shelterService = {
  createShelterProfile: async (userId, body) => {
    const userResult = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (userResult.length === 0) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (userResult[0].role !== 'shelter') throw Object.assign(new Error('Only shelter accounts can create shelter profiles'), { statusCode: 403 });

    const existing = await db.select().from(shelters).where(eq(shelters.userId, userId)).limit(1);
    if (existing.length > 0) throw Object.assign(new Error('Shelter profile already exists'), { statusCode: 400 });

    const { organizationName, registrationNumber, licenseNumber, website, description, establishedYear, capacity } = body;

    const [shelter] = await db.insert(shelters).values({
      id: createId(), userId,
      organizationName: organizationName.trim(),
      registrationNumber: registrationNumber || null,
      licenseNumber: licenseNumber || null,
      website: website || null,
      description: description || null,
      establishedYear: establishedYear || null,
      capacity: capacity || null,
      currentPetCount: 0, documentsVerified: false,
      verificationStatus: 'pending', averageRating: '0.00', totalReviews: 0,
    }).returning();

    return shelter;
  },

  getShelterProfile: async (userId) => {
    const result = await db.select().from(shelters).where(eq(shelters.userId, userId)).limit(1);
    if (result.length === 0) throw Object.assign(new Error('Shelter profile not found'), { statusCode: 404 });
    return result[0];
  },

  updateShelterProfile: async (userId, body) => {
    const existing = await db.select().from(shelters).where(eq(shelters.userId, userId)).limit(1);
    if (existing.length === 0) throw Object.assign(new Error('Shelter profile not found'), { statusCode: 404 });

    const { organizationName, registrationNumber, licenseNumber, website, description, establishedYear, capacity, currentPetCount } = body;
    const updateData = { updatedAt: new Date() };

    if (organizationName    !== undefined) updateData.organizationName    = organizationName.trim();
    if (registrationNumber  !== undefined) updateData.registrationNumber  = registrationNumber || null;
    if (licenseNumber       !== undefined) updateData.licenseNumber       = licenseNumber || null;
    if (website             !== undefined) updateData.website             = website || null;
    if (description         !== undefined) updateData.description         = description || null;
    if (establishedYear     !== undefined) updateData.establishedYear     = establishedYear || null;
    if (capacity            !== undefined) updateData.capacity            = capacity || null;
    if (currentPetCount     !== undefined) updateData.currentPetCount     = currentPetCount;

    const [updated] = await db.update(shelters).set(updateData).where(eq(shelters.userId, userId)).returning();
    return updated;
  },

  getShelterById: async (shelterId) => {
    const row = await ensureShelterExists(shelterId);
    if (!row) return null;
    return formatShelterResponse(row);
  },

  getAllShelters: async (filters) => {
    const { page = 1, limit = 10, city, state, verified, sortBy = 'createdAt', order = 'desc' } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = eq(users.isActive, true);
    if (city)              where = and(where, eq(users.city, city));
    if (state)             where = and(where, eq(users.state, state));
    if (verified === 'true') where = and(where, eq(shelters.verificationStatus, 'approved'));

    const orderExpr = order === 'desc' ? sql`${shelters[sortBy]} DESC` : sql`${shelters[sortBy]} ASC`;

    const [rows, countResult] = await Promise.all([
      db.select({
        shelter: shelters,
        user: { name: users.name, profileImage: users.profileImage, city: users.city, state: users.state, country: users.country },
      })
        .from(shelters).innerJoin(users, eq(shelters.userId, users.id))
        .where(where).limit(parseInt(limit)).offset(offset).orderBy(orderExpr),
      db.select({ count: sql`count(*)` }).from(shelters).innerJoin(users, eq(shelters.userId, users.id)).where(where),
    ]);

    const totalCount = parseInt(countResult[0].count);
    return {
      shelters: rows.map(item => ({
        id: item.shelter.id,
        organizationName: item.shelter.organizationName,
        description: item.shelter.description?.substring(0, 200),
        city: item.user.city, state: item.user.state,
        averageRating: item.shelter.averageRating,
        totalReviews: item.shelter.totalReviews,
        verificationStatus: item.shelter.verificationStatus,
        profileImage: item.user.profileImage,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount, limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    };
  },

  deleteShelterProfile: async (userId) => {
    const activePets = await db.select({ count: sql`count(*)` })
      .from(pets).where(and(eq(pets.ownerId, userId), eq(pets.adoptionStatus, 'available')));
    const count = parseInt(activePets[0].count);
    if (count > 0) {
      throw Object.assign(
        new Error(`Cannot delete shelter profile with ${count} active pet listing(s). Please update or remove them first.`),
        { statusCode: 400 }
      );
    }

    const deleted = await db.delete(shelters).where(eq(shelters.userId, userId)).returning();
    if (deleted.length === 0) throw Object.assign(new Error('Shelter profile not found'), { statusCode: 404 });
  },
};

module.exports = shelterService;
