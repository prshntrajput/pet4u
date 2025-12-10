import apiWrapper from './axios';

export const paymentAPI = {
  // Create payment order
  createPaymentOrder: async (orderData) => {
    try {
      const response = await apiWrapper.post('/payments/create-order', orderData);
      return response;
    } catch (error) {
      console.error('Create payment order API error:', error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiWrapper.post('/payments/verify', paymentData);
      return response;
    } catch (error) {
      console.error('Verify payment API error:', error);
      throw error;
    }
  },

  // Get user payments
  getUserPayments: async () => {
    try {
      const response = await apiWrapper.get('/payments/my-payments');
      return response;
    } catch (error) {
      console.error('Get user payments API error:', error);
      throw error;
    }
  },

  // Get shelter payments
  getShelterPayments: async () => {
    try {
      const response = await apiWrapper.get('/payments/shelter-payments');
      return response;
    } catch (error) {
      console.error('Get shelter payments API error:', error);
      throw error;
    }
  },
};
