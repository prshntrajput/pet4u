import apiWrapper from './axios';

// Favorites API functions
export const favoriteAPI = {
  // Get user's favorites
  getFavorites: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/favorites?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get favorites API error:', error);
      throw error;
    }
  },

  // ✅ Add alias for getMyFavorites (same as getFavorites)
  getMyFavorites: async (params = {}) => {
    return favoriteAPI.getFavorites(params);
  },

  // Add pet to favorites
  addFavorite: async (petId) => {
    try {
      const response = await apiWrapper.post('/favorites', { petId });
      return response;
    } catch (error) {
      console.error('Add favorite API error:', error);
      throw error;
    }
  },

  // Remove pet from favorites
  removeFavorite: async (petId) => {
    try {
      const response = await apiWrapper.delete(`/favorites/${petId}`);
      return response;
    } catch (error) {
      console.error('Remove favorite API error:', error);
      throw error;
    }
  },

  // Check if pet is favorited
  checkFavorite: async (petId) => {
    try {
      const response = await apiWrapper.get(`/favorites/check/${petId}`);
      return response;
    } catch (error) {
      console.error('Check favorite API error:', error);
      throw error;
    }
  },

  // ✅ Get favorited pet IDs only (for quick checks)
  getFavoritedPetIds: async () => {
    try {
      const response = await apiWrapper.get('/favorites/ids');
      return response;
    } catch (error) {
      console.error('Get favorited pet IDs error:', error);
      throw error;
    }
  },
};
