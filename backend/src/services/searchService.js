const { db } = require('../config/database');
const { pets, users, shelters } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, sql, gte, lte, like, ilike, desc } = require('drizzle-orm');

const searchService = {
  // Advanced pet search with full-text and filters
  advancedPetSearch: async (filters) => {
    try {
      const {
        search = '',
        species,
        gender,
        size,
        city,
        state,
        minAge,
        maxAge,
        ageUnit = 'months',
        adoptionStatus = 'available',
        isVaccinated,
        isNeutered,
        goodWithKids,
        goodWithPets,
        goodWithCats,
        goodWithDogs,
        energyLevel,
        minFee,
        maxFee,
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 12,
      } = filters;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      let conditions = [];

      // Adoption status filter
      if (adoptionStatus) {
        conditions.push(eq(pets.adoptionStatus, adoptionStatus));
      }

      // Active pets only
      conditions.push(eq(pets.isActive, true));

      // Full-text search (name, breed, description)
      if (search) {
        conditions.push(
          or(
            ilike(pets.name, `%${search}%`),
            ilike(pets.breed, `%${search}%`),
            ilike(pets.description, `%${search}%`)
          )
        );
      }

      // Species filter
      if (species) {
        conditions.push(eq(pets.species, species));
      }

      // Gender filter
      if (gender) {
        conditions.push(eq(pets.gender, gender));
      }

      // Size filter
      if (size) {
        conditions.push(eq(pets.size, size));
      }

      // Location filters
      if (city) {
        conditions.push(ilike(pets.city, `%${city}%`));
      }

      if (state) {
        conditions.push(ilike(pets.state, `%${state}%`));
      }

      // Age range filter
      if (minAge !== undefined) {
        conditions.push(gte(pets.age, parseInt(minAge)));
      }

      if (maxAge !== undefined) {
        conditions.push(lte(pets.age, parseInt(maxAge)));
      }

      // Health filters
      if (isVaccinated !== undefined) {
        conditions.push(eq(pets.isVaccinated, isVaccinated === 'true'));
      }

      if (isNeutered !== undefined) {
        conditions.push(eq(pets.isNeutered, isNeutered === 'true'));
      }

      // Behavioral filters
      if (goodWithKids !== undefined) {
        conditions.push(eq(pets.goodWithKids, goodWithKids === 'true'));
      }

      if (goodWithPets !== undefined) {
        conditions.push(eq(pets.goodWithPets, goodWithPets === 'true'));
      }

      if (goodWithCats !== undefined) {
        conditions.push(eq(pets.goodWithCats, goodWithCats === 'true'));
      }

      if (goodWithDogs !== undefined) {
        conditions.push(eq(pets.goodWithDogs, goodWithDogs === 'true'));
      }

      // Energy level filter
      if (energyLevel) {
        conditions.push(eq(pets.energyLevel, energyLevel));
      }

      // Adoption fee range
      if (minFee !== undefined) {
        conditions.push(gte(pets.adoptionFee, minFee));
      }

      if (maxFee !== undefined) {
        conditions.push(lte(pets.adoptionFee, maxFee));
      }

      const whereClause = and(...conditions);

      // Determine sort column
      let orderColumn;
      switch (sortBy) {
        case 'name':
          orderColumn = pets.name;
          break;
        case 'age':
          orderColumn = pets.age;
          break;
        case 'adoptionFee':
          orderColumn = pets.adoptionFee;
          break;
        case 'viewCount':
          orderColumn = pets.viewCount;
          break;
        case 'favoriteCount':
          orderColumn = pets.favoriteCount;
          break;
        default:
          orderColumn = pets.createdAt;
      }

      // Execute query
      const results = await db
        .select({
          pet: pets,
          owner: {
            id: users.id,
            name: users.name,
            role: users.role,
            profileImage: users.profileImage,
          }
        })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(order === 'asc' ? orderColumn : desc(orderColumn));

      // Get total count
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(pets)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      return {
        pets: results.map(r => ({ ...r.pet, owner: r.owner })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        }
      };

    } catch (error) {
      logger.error('Advanced search error:', error);
      throw error;
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    try {
      const suggestions = await db
        .select({
          name: pets.name,
          breed: pets.breed,
          species: pets.species,
        })
        .from(pets)
        .where(
          and(
            or(
              ilike(pets.name, `%${query}%`),
              ilike(pets.breed, `%${query}%`)
            ),
            eq(pets.isActive, true),
            eq(pets.adoptionStatus, 'available')
          )
        )
        .limit(10);

      return suggestions;
    } catch (error) {
      logger.error('Get search suggestions error:', error);
      throw error;
    }
  },

  // Get popular searches
  getPopularSearches: async () => {
    try {
      // Get most common species
      const popularSpecies = await db
        .select({
          species: pets.species,
          count: sql`count(*)`,
        })
        .from(pets)
        .where(and(
          eq(pets.isActive, true),
          eq(pets.adoptionStatus, 'available')
        ))
        .groupBy(pets.species)
        .orderBy(desc(sql`count(*)`))
        .limit(5);

      return popularSpecies;
    } catch (error) {
      logger.error('Get popular searches error:', error);
      throw error;
    }
  },
};

module.exports = searchService;
