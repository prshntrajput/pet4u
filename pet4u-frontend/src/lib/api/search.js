import apiWrapper from './axios';

export const searchAPI = {
  // Advanced search
  advancedSearch: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/search?${queryString}`);
      return response;
    } catch (error) {
      console.error('Advanced search API error:', error);
      throw error;
    }
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    try {
      const response = await apiWrapper.get(`/search/suggestions?q=${query}`);
      return response;
    } catch (error) {
      console.error('Get suggestions API error:', error);
      throw error;
    }
  },

  // Get popular searches
  getPopularSearches: async () => {
    try {
      const response = await apiWrapper.get('/search/popular');
      return response;
    } catch (error) {
      console.error('Get popular searches API error:', error);
      throw error;
    }
  },
};
