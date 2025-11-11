import apiWrapper from './axios';

// Adoption Request API functions
export const adoptionRequestAPI = {
  // Create adoption request
  createAdoptionRequest: async (requestData) => {
    try {
      const response = await apiWrapper.post('/adoption-requests', requestData);
      return response;
    } catch (error) {
      console.error('Create adoption request API error:', error);
      throw error;
    }
  },

  // Get my adoption requests (as adopter)
  getMyRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/adoption-requests/my-requests?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get my requests API error:', error);
      throw error;
    }
  },

  // Get received adoption requests (as shelter)
  getReceivedRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/adoption-requests/received?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get received requests API error:', error);
      throw error;
    }
  },

  // Respond to adoption request (shelter)
  respondToRequest: async (requestId, responseData) => {
    try {
      const response = await apiWrapper.put(`/adoption-requests/${requestId}/respond`, responseData);
      return response;
    } catch (error) {
      console.error('Respond to request API error:', error);
      throw error;
    }
  },

  // Withdraw adoption request (adopter)
  withdrawRequest: async (requestId) => {
    try {
      const response = await apiWrapper.put(`/adoption-requests/${requestId}/withdraw`);
      return response;
    } catch (error) {
      console.error('Withdraw request API error:', error);
      throw error;
    }
  },
};
