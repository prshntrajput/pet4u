import apiWrapper from './axios';

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await apiWrapper.get('/admin/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Get dashboard stats API error:', error);
      throw error;
    }
  },

  // User management
  getAllUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/admin/users?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get all users API error:', error);
      throw error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await apiWrapper.put(`/admin/users/${userId}/toggle-status`);
      return response;
    } catch (error) {
      console.error('Toggle user status API error:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiWrapper.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Delete user API error:', error);
      throw error;
    }
  },

  // Pet management
  getAllPets: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/admin/pets?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get all pets API error:', error);
      throw error;
    }
  },

  deletePet: async (petId) => {
    try {
      const response = await apiWrapper.delete(`/admin/pets/${petId}`);
      return response;
    } catch (error) {
      console.error('Delete pet API error:', error);
      throw error;
    }
  },

  // Admin logs
  getAdminLogs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/admin/logs?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get admin logs API error:', error);
      throw error;
    }
  },
};
