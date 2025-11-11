import apiWrapper from './axios';

// Pet API functions
export const petAPI = {
  // Get all pets with filters
  getAllPets: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/pets?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get all pets API error:', error);
      throw error;
    }
  },

  // Get single pet by ID or slug
  getPetById: async (petId) => {
    try {
      const response = await apiWrapper.get(`/pets/${petId}`);
      return response;
    } catch (error) {
      console.error('Get pet by ID API error:', error);
      throw error;
    }
  },

  // Get user's own pets
  getMyPets: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/pets/my/listings?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get my pets API error:', error);
      throw error;
    }
  },

  // Create new pet
  createPet: async (petData) => {
    try {
      const response = await apiWrapper.post('/pets', petData);
      return response;
    } catch (error) {
      console.error('Create pet API error:', error);
      throw error;
    }
  },

  // Update pet
  updatePet: async (petId, petData) => {
    try {
      const response = await apiWrapper.put(`/pets/${petId}`, petData);
      return response;
    } catch (error) {
      console.error('Update pet API error:', error);
      throw error;
    }
  },

  // Delete pet
  deletePet: async (petId) => {
    try {
      const response = await apiWrapper.delete(`/pets/${petId}`);
      return response;
    } catch (error) {
      console.error('Delete pet API error:', error);
      throw error;
    }
  },

  // Upload pet images
  uploadPetImages: async (petId, imageFiles) => {
    try {
      const formData = new FormData();
      
      // Append multiple images
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }

      const response = await apiWrapper.post(`/pets/${petId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Upload pet images API error:', error);
      throw error;
    }
  },

  // Delete pet image
  deletePetImage: async (petId, imageId) => {
    try {
      const response = await apiWrapper.delete(`/pets/${petId}/images/${imageId}`);
      return response;
    } catch (error) {
      console.error('Delete pet image API error:', error);
      throw error;
    }
  },
};
