import apiWrapper from './axios';

export const reviewAPI = {
  // Create pet review
  createPetReview: async (reviewData) => {
    try {
      const response = await apiWrapper.post('/reviews/pets', reviewData);
      return response;
    } catch (error) {
      console.error('Create pet review API error:', error);
      throw error;
    }
  },

  // Get pet reviews
  getPetReviews: async (petId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/reviews/pets/${petId}?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get pet reviews API error:', error);
      throw error;
    }
  },

  // Create shelter review
  createShelterReview: async (reviewData) => {
    try {
      const response = await apiWrapper.post('/reviews/shelters', reviewData);
      return response;
    } catch (error) {
      console.error('Create shelter review API error:', error);
      throw error;
    }
  },

  // Get shelter reviews
  getShelterReviews: async (shelterId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/reviews/shelters/${shelterId}?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get shelter reviews API error:', error);
      throw error;
    }
  },

  // Delete review
  deleteReview: async (type, reviewId) => {
    try {
      const response = await apiWrapper.delete(`/reviews/${type}/${reviewId}`);
      return response;
    } catch (error) {
      console.error('Delete review API error:', error);
      throw error;
    }
  },
};
