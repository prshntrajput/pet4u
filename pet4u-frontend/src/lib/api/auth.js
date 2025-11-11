import apiWrapper from './axios';

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiWrapper.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiWrapper.post('/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (logoutData) => {
    try {
      const response = await apiWrapper.post('/auth/logout', logoutData);
      return response;
    } catch (error) {
      console.error('Logout API error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiWrapper.post('/auth/refresh', { refreshToken });
      return response;
    } catch (error) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiWrapper.get('/auth/verify');
      return response;
    } catch (error) {
      console.error('Verify token API error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiWrapper.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password API error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await apiWrapper.post('/auth/reset-password', resetData);
      return response;
    } catch (error) {
      console.error('Reset password API error:', error);
      throw error;
    }
  },
};
