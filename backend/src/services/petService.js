const { createId } = require('@paralleldrive/cuid2');
const slugify = require('slugify');
const { db } = require('../config/database');
const { pets, petImages, users } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, sql, like, gte, lte, desc, asc } = require('drizzle-orm');
const { cloudinaryUtils } = require('../config/cloudinary');
const savedSearchService = require('./savedSearchService');

async function verifyPetOwnership(petId, userId) {
  const result = await db
    .select()
    .from(pets)
    .where(and(eq(pets.id, petId), eq(pets.ownerId, userId)))
    .limit(1);
  return result[0] || null;
}

const petService = {
  createPet: async (userId, petData) => {
    let petCity = petData.city;
    let petState = petData.state;

    if (!petCity || !petState) {
      const userResult = await db
        .select({ city: users.city, state: users.state })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length > 0) {
        petCity = petCity || userResult[0].city;
        petState = petState || userResult[0].state;
      }
    }

    const uniqueSlug = `${slugify(petData.name, { lower: true, strict: true })}-${createId().slice(-6)}`;
    const petId = createId();

    const newPet = await db
      .insert(pets)
      .values({
        id: petId,
        ownerId: userId,
        name: petData.name.trim(),
        species: petData.species,
        breed: petData.breed || null,
        mixedBreed: petData.mixedBreed || false,
        age: petData.age || null,
        ageUnit: petData.ageUnit || 'months',
        ageEstimated: petData.ageEstimated || false,
        gender: petData.gender,
        size: petData.size || null,
        weight: petData.weight ? String(petData.weight) : null,
        color: petData.color || null,
        markings: petData.markings || null,
        isVaccinated: petData.isVaccinated || false,
        isNeutered: petData.isNeutered || false,
        isSpayed: petData.isSpayed || false,
        healthStatus: petData.healthStatus || 'healthy',
        medicalHistory: petData.medicalHistory || null,
        specialNeeds: petData.specialNeeds || null,
        goodWithKids: petData.goodWithKids,
        goodWithPets: petData.goodWithPets,
        goodWithCats: petData.goodWithCats,
        goodWithDogs: petData.goodWithDogs,
        energyLevel: petData.energyLevel || null,
        trainedLevel: petData.trainedLevel || null,
        houseTrained: petData.houseTrained || false,
        adoptionStatus: 'available',
        listingType: petData.listingType || 'adopt',
        adoptionFee: petData.adoptionFee ? String(petData.adoptionFee) : '0',
        isUrgent: petData.isUrgent || false,
        urgentReason: petData.urgentReason || null,
        city: petCity,
        state: petState,
        country: 'India',
        description: petData.description,
        story: petData.story || null,
        slug: uniqueSlug,
        isActive: true,
        isFeatured: false,
        moderationStatus: 'approved',
        viewCount: 0,
        favoriteCount: 0,
        inquiryCount: 0,
        publishedAt: new Date(),
      })
      .returning();

    // Fire-and-forget alert notifications for matching saved searches
    savedSearchService.notifyMatchingUsers(newPet[0]);

    return newPet[0];
  },

  getPets: async (filters) => {
    const {
      page = 1, limit = 12, search, species, gender, size, city, state,
      minAge, maxAge, goodWithKids, goodWithPets, isVaccinated, isNeutered,
      energyLevel, adoptionStatus = 'available', ownerId, listingType,
      sortBy = 'createdAt', order = 'desc'
    } = filters;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [
      eq(pets.isActive, true),
      eq(pets.moderationStatus, 'approved'),
    ];

    if (adoptionStatus)       conditions.push(eq(pets.adoptionStatus, adoptionStatus));
    if (ownerId)              conditions.push(eq(pets.ownerId, ownerId));
    if (listingType)          conditions.push(eq(pets.listingType, listingType));
    if (species)              conditions.push(eq(pets.species, species));
    if (gender)               conditions.push(eq(pets.gender, gender));
    if (size)                 conditions.push(eq(pets.size, size));
    if (city)                 conditions.push(eq(pets.city, city));
    if (state)                conditions.push(eq(pets.state, state));
    if (energyLevel)          conditions.push(eq(pets.energyLevel, energyLevel));
    if (goodWithKids === 'true')  conditions.push(eq(pets.goodWithKids, true));
    if (goodWithPets === 'true')  conditions.push(eq(pets.goodWithPets, true));
    if (isVaccinated === 'true')  conditions.push(eq(pets.isVaccinated, true));
    if (isNeutered === 'true')    conditions.push(eq(pets.isNeutered, true));
    if (minAge)               conditions.push(gte(pets.age, parseInt(minAge)));
    if (maxAge)               conditions.push(lte(pets.age, parseInt(maxAge)));
    if (search) {
      conditions.push(or(
        like(pets.name, `%${search}%`),
        like(pets.breed, `%${search}%`),
        like(pets.description, `%${search}%`)
      ));
    }

    const whereClause = and(...conditions);
    const orderFn = order === 'desc' ? desc(pets[sortBy]) : asc(pets[sortBy]);

    const [petsResult, countResult] = await Promise.all([
      db.select({
        id: pets.id, name: pets.name, species: pets.species, breed: pets.breed,
        age: pets.age, ageUnit: pets.ageUnit, gender: pets.gender, size: pets.size,
        city: pets.city, state: pets.state, primaryImage: pets.primaryImage,
        adoptionStatus: pets.adoptionStatus, listingType: pets.listingType,
        adoptionFee: pets.adoptionFee,
        isUrgent: pets.isUrgent, description: pets.description, slug: pets.slug,
        viewCount: pets.viewCount, favoriteCount: pets.favoriteCount,
        createdAt: pets.createdAt, ownerId: pets.ownerId,
        ownerName: users.name, ownerRole: users.role,
      })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(orderFn),

      db.select({ count: sql`count(*)` })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause),
    ]);

    const totalCount = parseInt(countResult[0].count);
    return {
      pets: petsResult,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    };
  },

  getPetByIdOrSlug: async (identifier, viewerId) => {
    let petResult = await db.select().from(pets).where(eq(pets.id, identifier)).limit(1);
    if (petResult.length === 0) {
      petResult = await db.select().from(pets).where(eq(pets.slug, identifier)).limit(1);
    }
    if (petResult.length === 0) return null;

    const pet = petResult[0];

    const [ownerResult, images] = await Promise.all([
      db.select({
        id: users.id, name: users.name, email: users.email, role: users.role,
        profileImage: users.profileImage, city: users.city, state: users.state,
      })
        .from(users)
        .where(eq(users.id, pet.ownerId))
        .limit(1),

      db.select().from(petImages).where(eq(petImages.petId, pet.id)).orderBy(asc(petImages.sortOrder)),
    ]);

    if (!viewerId || viewerId !== pet.ownerId) {
      await db
        .update(pets)
        .set({ viewCount: sql`${pets.viewCount} + 1`, updatedAt: new Date() })
        .where(eq(pets.id, pet.id));
    }

    return { ...pet, owner: ownerResult[0], images };
  },

  getMyPets: async (userId, filters) => {
    const { page = 1, limit = 12, status } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(pets.ownerId, userId)];
    if (status) conditions.push(eq(pets.adoptionStatus, status));

    const whereClause = and(...conditions);

    const [myPets, countResult] = await Promise.all([
      db.select().from(pets).where(whereClause)
        .limit(parseInt(limit)).offset(offset).orderBy(desc(pets.createdAt)),
      db.select({ count: sql`count(*)` }).from(pets).where(whereClause),
    ]);

    const totalCount = parseInt(countResult[0].count);
    return {
      pets: myPets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    };
  },

  updatePet: async (petId, userId, updateData) => {
    const existing = await verifyPetOwnership(petId, userId);
    if (!existing) return null;

    const data = { ...updateData, updatedAt: new Date() };
    if (data.weight)      data.weight = String(data.weight);
    if (data.adoptionFee) data.adoptionFee = String(data.adoptionFee);

    const updated = await db.update(pets).set(data).where(eq(pets.id, petId)).returning();
    return updated[0];
  },

  deletePet: async (petId, userId) => {
    const existing = await verifyPetOwnership(petId, userId);
    if (!existing) return false;

    const images = await db.select().from(petImages).where(eq(petImages.petId, petId));
    for (const image of images) {
      if (image.cloudinaryPublicId) {
        await cloudinaryUtils.deleteImage(image.cloudinaryPublicId).catch(err =>
          logger.warn('Failed to delete image from Cloudinary', { err: err.message })
        );
      }
    }

    await db.delete(pets).where(eq(pets.id, petId));
    return true;
  },

  uploadPetImages: async (petId, userId, cloudinaryResults) => {
    const existing = await verifyPetOwnership(petId, userId);
    if (!existing) {
      if (cloudinaryResults.length > 0) {
        await cloudinaryUtils.deleteMultipleImages(cloudinaryResults.map(r => r.public_id))
          .catch(err => logger.warn('Failed to cleanup images', { err: err.message }));
      }
      return null;
    }

    const countResult = await db.select({ count: sql`count(*)` }).from(petImages).where(eq(petImages.petId, petId));
    const currentCount = parseInt(countResult[0].count);

    if (currentCount + cloudinaryResults.length > 10) {
      await cloudinaryUtils.deleteMultipleImages(cloudinaryResults.map(r => r.public_id))
        .catch(err => logger.warn('Failed to cleanup images', { err: err.message }));
      throw Object.assign(new Error(`Maximum 10 images allowed. You already have ${currentCount} images.`), { statusCode: 400 });
    }

    const newImages = [];
    for (let i = 0; i < cloudinaryResults.length; i++) {
      const result = cloudinaryResults[i];
      const inserted = await db.insert(petImages).values({
        id: createId(),
        petId,
        imageUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        thumbnailUrl: result.eager?.[0]?.secure_url || null,
        isPrimary: currentCount === 0 && i === 0,
        sortOrder: currentCount + i,
        width: result.width,
        height: result.height,
        fileSize: result.bytes,
        caption: null,
        altText: `${existing.name} - Image ${currentCount + i + 1}`,
      }).returning();
      newImages.push(inserted[0]);

      if (currentCount === 0 && i === 0) {
        await db.update(pets)
          .set({ primaryImage: result.secure_url, updatedAt: new Date() })
          .where(eq(pets.id, petId));
      }
    }

    return newImages;
  },

  deletePetImage: async (petId, userId, imageId) => {
    const existing = await verifyPetOwnership(petId, userId);
    if (!existing) return null;

    const imageResult = await db.select().from(petImages)
      .where(and(eq(petImages.id, imageId), eq(petImages.petId, petId)))
      .limit(1);

    if (imageResult.length === 0) return 'not_found';

    const image = imageResult[0];

    if (image.cloudinaryPublicId) {
      await cloudinaryUtils.deleteImage(image.cloudinaryPublicId).catch(err =>
        logger.warn('Failed to delete image from Cloudinary', { err: err.message })
      );
    }

    await db.delete(petImages).where(eq(petImages.id, imageId));

    if (image.isPrimary) {
      const next = await db.select().from(petImages)
        .where(eq(petImages.petId, petId)).orderBy(asc(petImages.sortOrder)).limit(1);

      if (next.length > 0) {
        await db.update(petImages).set({ isPrimary: true }).where(eq(petImages.id, next[0].id));
        await db.update(pets).set({ primaryImage: next[0].imageUrl, updatedAt: new Date() }).where(eq(pets.id, petId));
      } else {
        await db.update(pets).set({ primaryImage: null, updatedAt: new Date() }).where(eq(pets.id, petId));
      }
    }

    return 'deleted';
  },

  matchPets: async (criteria) => {
    const {
      livingSpace, activityLevel, hasChildren, hasOtherPets,
      hasOtherDogs, hasOtherCats, experienceLevel,
      preferredSpecies, preferredSize, preferredAge, city, state
    } = criteria;

    const conditions = [
      eq(pets.adoptionStatus, 'available'),
      eq(pets.isActive, true),
      eq(pets.moderationStatus, 'approved'),
    ];
    if (preferredSpecies && preferredSpecies !== 'any') conditions.push(eq(pets.species, preferredSpecies));
    if (city)  conditions.push(eq(pets.city, city));
    if (state) conditions.push(eq(pets.state, state));

    const allPets = await db.select({
      id: pets.id, name: pets.name, species: pets.species, breed: pets.breed,
      size: pets.size, age: pets.age, ageUnit: pets.ageUnit, gender: pets.gender,
      energyLevel: pets.energyLevel, goodWithKids: pets.goodWithKids,
      goodWithPets: pets.goodWithPets, goodWithDogs: pets.goodWithDogs,
      goodWithCats: pets.goodWithCats, houseTrained: pets.houseTrained,
      trainedLevel: pets.trainedLevel, specialNeeds: pets.specialNeeds,
      adoptionFee: pets.adoptionFee, primaryImage: pets.primaryImage,
      description: pets.description, city: pets.city, state: pets.state,
      isVaccinated: pets.isVaccinated, isNeutered: pets.isNeutered,
      isSpayed: pets.isSpayed, isUrgent: pets.isUrgent, slug: pets.slug,
      createdAt: pets.createdAt,
    })
      .from(pets)
      .where(and(...conditions))
      .orderBy(desc(pets.isUrgent), desc(pets.createdAt))
      .limit(100);

    const energyMap  = { low: ['low'], moderate: ['low', 'medium'], high: ['medium', 'high'] };
    const sizeMap    = {
      apartment: ['small', 'medium'],
      house_small_yard: ['small', 'medium', 'large'],
      house_large_yard: ['small', 'medium', 'large', 'extra_large'],
    };
    const expMap = {
      first_time: ['not_trained', 'basic'],
      some_experience: ['basic', 'advanced'],
      experienced: ['not_trained', 'basic', 'advanced'],
    };

    const scorePet = (pet) => {
      let score = 0;

      if (activityLevel && pet.energyLevel && energyMap[activityLevel]?.includes(pet.energyLevel)) score += 25;
      if (livingSpace && pet.size && sizeMap[livingSpace]?.includes(pet.size)) score += 20;
      if (preferredSize && preferredSize !== 'any' && pet.size === preferredSize) score += 10;

      if (hasChildren && pet.goodWithKids === true) score += 15;
      if (!hasChildren) score += 5;

      if (hasOtherPets) {
        if (pet.goodWithPets === true)               score += 8;
        if (hasOtherDogs && pet.goodWithDogs === true) score += 4;
        if (hasOtherCats && pet.goodWithCats === true) score += 3;
      } else {
        score += 10;
      }

      if (experienceLevel && pet.trainedLevel && expMap[experienceLevel]?.includes(pet.trainedLevel)) score += 10;

      if (preferredAge && preferredAge !== 'any' && pet.age !== null) {
        const ageInMonths = pet.ageUnit === 'years' ? pet.age * 12 : pet.age;
        const category = ageInMonths <= 12 ? 'young' : ageInMonths <= 84 ? 'adult' : 'senior';
        if (category === preferredAge) score += 5;
      }

      if (pet.houseTrained) score += 5;
      if (pet.isUrgent)     score += 3;

      return score;
    };

    return allPets
      .map(pet => ({ ...pet, matchScore: scorePet(pet) }))
      .filter(p => p.matchScore > 10)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  },
};

module.exports = petService;
