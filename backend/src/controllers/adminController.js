const { createId } = require('@paralleldrive/cuid2');
const { db } = require('../config/database');
const { users, shelters, pets, adoptionRequests, adminLogs, statistics } = require('../models');
const { logger } = require('../config/logger');
const { eq, and, or, desc, sql, gte, lte, count } = require('drizzle-orm');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    const requestId = req.requestId;

    try {
      // Get total counts
      const [
        totalUsersResult,
        totalSheltersResult,
        totalPetsResult,
        totalRequestsResult,
        pendingRequestsResult,
        approvedRequestsResult,
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(users),
        db.select({ count: sql`count(*)` }).from(shelters),
        db.select({ count: sql`count(*)` }).from(pets),
        db.select({ count: sql`count(*)` }).from(adoptionRequests),
        db.select({ count: sql`count(*)` }).from(adoptionRequests).where(eq(adoptionRequests.status, 'pending')),
        db.select({ count: sql`count(*)` }).from(adoptionRequests).where(eq(adoptionRequests.status, 'approved')),
      ]);

      // Get users by role
      const usersByRole = await db
        .select({
          role: users.role,
          count: sql`count(*)`
        })
        .from(users)
        .groupBy(users.role);

      // Get pets by status
      const petsByStatus = await db
        .select({
          status: pets.adoptionStatus,
          count: sql`count(*)`
        })
        .from(pets)
        .groupBy(pets.adoptionStatus);

      // Recent activities (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo));

      const recentPets = await db
        .select({ count: sql`count(*)` })
        .from(pets)
        .where(gte(pets.createdAt, sevenDaysAgo));

      res.status(200).json({
        success: true,
        message: 'Dashboard stats fetched successfully',
        data: {
          totals: {
            users: parseInt(totalUsersResult[0].count),
            shelters: parseInt(totalSheltersResult[0].count),
            pets: parseInt(totalPetsResult[0].count),
            requests: parseInt(totalRequestsResult[0].count),
            pendingRequests: parseInt(pendingRequestsResult[0].count),
            approvedRequests: parseInt(approvedRequestsResult[0].count),
          },
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = parseInt(item.count);
            return acc;
          }, {}),
          petsByStatus: petsByStatus.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
          }, {}),
          recent: {
            users: parseInt(recentUsers[0].count),
            pets: parseInt(recentPets[0].count),
          }
        },
        requestId
      });

    } catch (error) {
      logger.error('Get dashboard stats error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        requestId
      });
    }
  },

  // Get all users with filters
  getAllUsers: async (req, res) => {
    const requestId = req.requestId;

    try {
      const { page = 1, limit = 20, role, isActive, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [];

      if (role) {
        conditions.push(eq(users.role, role));
      }

      if (isActive !== undefined) {
        conditions.push(eq(users.isActive, isActive === 'true'));
      }

      if (search) {
        conditions.push(
          or(
            sql`${users.name} ILIKE ${`%${search}%`}`,
            sql`${users.email} ILIKE ${`%${search}%`}`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const usersList = await db
        .select()
        .from(users)
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(users.createdAt));

      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: {
          users: usersList.map(user => ({
            ...user,
            password: undefined, // Don't send password
          })),
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
      logger.error('Get all users error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        requestId
      });
    }
  },

  // Suspend/Activate user
  toggleUserStatus: async (req, res) => {
    const requestId = req.requestId;
    const adminId = req.user.userId;
    const { userId } = req.params;

    try {
      const userToUpdate = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userToUpdate.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      // Can't suspend admin users
      if (userToUpdate[0].role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot suspend admin users',
          requestId
        });
      }

      const newStatus = !userToUpdate[0].isActive;

      await db
        .update(users)
        .set({
          isActive: newStatus,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Log admin action
      await db.insert(adminLogs).values({
        id: createId(),
        adminId,
        action: newStatus ? 'user_activated' : 'user_suspended',
        entityType: 'user',
        entityId: userId,
        description: `User ${newStatus ? 'activated' : 'suspended'} by admin`,
        ipAddress: req.ip,
      });

      logger.info('User status toggled', { adminId, userId, newStatus, requestId });

      res.status(200).json({
        success: true,
        message: `User ${newStatus ? 'activated' : 'suspended'} successfully`,
        requestId
      });

    } catch (error) {
      logger.error('Toggle user status error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        requestId
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    const requestId = req.requestId;
    const adminId = req.user.userId;
    const { userId } = req.params;

    try {
      const userToDelete = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          requestId
        });
      }

      // Can't delete admin users
      if (userToDelete[0].role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete admin users',
          requestId
        });
      }

      await db
        .delete(users)
        .where(eq(users.id, userId));

      // Log admin action
      await db.insert(adminLogs).values({
        id: createId(),
        adminId,
        action: 'user_deleted',
        entityType: 'user',
        entityId: userId,
        description: `User deleted by admin`,
        metadata: JSON.stringify({ email: userToDelete[0].email, role: userToDelete[0].role }),
        ipAddress: req.ip,
      });

      logger.info('User deleted by admin', { adminId, userId, requestId });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete user error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        requestId
      });
    }
  },

  // Get all pets (admin)
  getAllPets: async (req, res) => {
    const requestId = req.requestId;

    try {
      const { page = 1, limit = 20, status, moderationStatus, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let conditions = [];

      if (status) {
        conditions.push(eq(pets.adoptionStatus, status));
      }

      if (moderationStatus) {
        conditions.push(eq(pets.moderationStatus, moderationStatus));
      }

      if (search) {
        conditions.push(
          or(
            sql`${pets.name} ILIKE ${`%${search}%`}`,
            sql`${pets.breed} ILIKE ${`%${search}%`}`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const petsList = await db
        .select({
          pet: pets,
          owner: {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          }
        })
        .from(pets)
        .innerJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause)
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(pets.createdAt));

      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(pets)
        .where(whereClause);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Pets fetched successfully',
        data: {
          pets: petsList.map(item => ({
            ...item.pet,
            owner: item.owner
          })),
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
      logger.error('Get all pets (admin) error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pets',
        requestId
      });
    }
  },

  // Delete pet (admin)
  deletePet: async (req, res) => {
    const requestId = req.requestId;
    const adminId = req.user.userId;
    const { petId } = req.params;

    try {
      const petToDelete = await db
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (petToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found',
          requestId
        });
      }

      await db
        .delete(pets)
        .where(eq(pets.id, petId));

      // Log admin action
      await db.insert(adminLogs).values({
        id: createId(),
        adminId,
        action: 'pet_deleted',
        entityType: 'pet',
        entityId: petId,
        description: `Pet deleted by admin`,
        metadata: JSON.stringify({ name: petToDelete[0].name, ownerId: petToDelete[0].ownerId }),
        ipAddress: req.ip,
      });

      logger.info('Pet deleted by admin', { adminId, petId, requestId });

      res.status(200).json({
        success: true,
        message: 'Pet deleted successfully',
        requestId
      });

    } catch (error) {
      logger.error('Delete pet (admin) error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to delete pet',
        requestId
      });
    }
  },

  // Get admin logs
  getAdminLogs: async (req, res) => {
    const requestId = req.requestId;

    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const logs = await db
        .select({
          log: adminLogs,
          admin: {
            id: users.id,
            name: users.name,
            email: users.email,
          }
        })
        .from(adminLogs)
        .leftJoin(users, eq(adminLogs.adminId, users.id))
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(adminLogs.createdAt));

      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(adminLogs);

      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Admin logs fetched successfully',
        data: {
          logs: logs.map(item => ({
            ...item.log,
            admin: item.admin
          })),
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
      logger.error('Get admin logs error:', { error: error.message, requestId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin logs',
        requestId
      });
    }
  },
};

module.exports = adminController;
