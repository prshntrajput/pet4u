import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { petAPI } from '../../api/pets';

// Async thunks
export const fetchPets = createAsyncThunk(
  'pets/fetchPets',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await petAPI.getAllPets(filters);
      if (response.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPetById = createAsyncThunk(
  'pets/fetchPetById',
  async (petId, { rejectWithValue }) => {
    try {
      const response = await petAPI.getPetById(petId);
      if (response.success) {
        return response.data.data.pet;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPet = createAsyncThunk(
  'pets/createPet',
  async (petData, { rejectWithValue }) => {
    try {
      const response = await petAPI.createPet(petData);
      if (response.success) {
        return response.data.data.pet;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePet = createAsyncThunk(
  'pets/updatePet',
  async ({ petId, petData }, { rejectWithValue }) => {
    try {
      const response = await petAPI.updatePet(petId, petData);
      if (response.success) {
        return response.data.data.pet;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePet = createAsyncThunk(
  'pets/deletePet',
  async (petId, { rejectWithValue }) => {
    try {
      const response = await petAPI.deletePet(petId);
      if (response.success) {
        return petId;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  pets: [],
  currentPet: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: '',
    species: '',
    gender: '',
    size: '',
    city: '',
    state: '',
    sortBy: 'createdAt',
    order: 'desc',
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Pet slice
const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearPetError: (state) => {
      state.error = null;
    },
    
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    clearCurrentPet: (state) => {
      state.currentPet = null;
    },
    
    resetPetState: (state) => {
      return initialState;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch pets
      .addCase(fetchPets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = action.payload.pets;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch pet by ID
      .addCase(fetchPetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPet = action.payload;
        state.error = null;
      })
      .addCase(fetchPetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create pet
      .addCase(createPet.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.isCreating = false;
        state.pets.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPet.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update pet
      .addCase(updatePet.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.pets.findIndex(pet => pet.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.currentPet?.id === action.payload.id) {
          state.currentPet = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete pet
      .addCase(deletePet.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.pets = state.pets.filter(pet => pet.id !== action.payload);
        if (state.currentPet?.id === action.payload) {
          state.currentPet = null;
        }
        state.error = null;
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPetError,
  setFilters,
  clearFilters,
  clearCurrentPet,
  resetPetState,
} = petSlice.actions;

export default petSlice.reducer;
