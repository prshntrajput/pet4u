import apiWrapper from './axios';

// User API functions
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiWrapper.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiWrapper.put('/users/profile', profileData);
      return response;
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiWrapper.post('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Upload profile image API error:', error);
      throw error;
    }
  },

  // Delete profile image
  deleteProfileImage: async () => {
    try {
      const response = await apiWrapper.delete('/users/profile/image');
      return response;
    } catch (error) {
      console.error('Delete profile image API error:', error);
      throw error;
    }
  },

  // Update location
  updateLocation: async (locationData) => {
    try {
      const response = await apiWrapper.put('/users/location', locationData);
      return response;
    } catch (error) {
      console.error('Update location API error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiWrapper.put('/users/password', passwordData);
      return response;
    } catch (error) {
      console.error('Change password API error:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (confirmationData) => {
    try {
      const response = await apiWrapper.delete('/users/account', {
        data: confirmationData
      });
      return response;
    } catch (error) {
      console.error('Delete account API error:', error);
      throw error;
    }
  },
};

// Shelter API functions
export const shelterAPI = {
  // Get all shelters
  getAllShelters: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/shelters?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get all shelters API error:', error);
      throw error;
    }
  },

  // Get shelter by ID
  getShelterById: async (shelterId) => {
    try {
      const response = await apiWrapper.get(`/shelters/${shelterId}`);
      return response;
    } catch (error) {
      console.error('Get shelter by ID API error:', error);
      throw error;
    }
  },

  // Create shelter profile
  createShelterProfile: async (shelterData) => {
    try {
      const response = await apiWrapper.post('/shelters', shelterData);
      return response;
    } catch (error) {
      console.error('Create shelter profile API error:', error);
      throw error;
    }
  },

  // Get own shelter profile
  getOwnShelterProfile: async () => {
    try {
      const response = await apiWrapper.get('/shelters/profile/me');
      return response;
    } catch (error) {
      console.error('Get own shelter profile API error:', error);
      throw error;
    }
  },

  // Update shelter profile
  updateShelterProfile: async (shelterData) => {
    try {
      const response = await apiWrapper.put('/shelters/profile', shelterData);
      return response;
    } catch (error) {
      console.error('Update shelter profile API error:', error);
      throw error;
    }
  },

  // Delete shelter profile
  deleteShelterProfile: async () => {
    try {
      const response = await apiWrapper.delete('/shelters/profile');
      return response;
    } catch (error) {
      console.error('Delete shelter profile API error:', error);
      throw error;
    }
  },
};
