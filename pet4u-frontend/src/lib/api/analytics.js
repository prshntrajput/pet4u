import apiWrapper from './axios';

export const analyticsAPI = {
  // Get shelter analytics
  getShelterAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/analytics/shelter?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get shelter analytics API error:', error);
      throw error;
    }
  },

  // Get pet metrics
  getPetMetrics: async (petId) => {
    try {
      const response = await apiWrapper.get(`/analytics/pet/${petId}`);
      return response;
    } catch (error) {
      console.error('Get pet metrics API error:', error);
      throw error;
    }
  },
};
