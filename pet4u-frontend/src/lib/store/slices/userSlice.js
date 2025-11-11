import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiWrapper } from '../../api/axios';

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.get('/users/profile');
      
      if (response.success) {
        return response.data.data.user;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.put('/users/profile', userData);
      
      if (response.success) {
        return response.data.data.user;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiWrapper.post('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.success) {
        return response.data.data.imageUrl;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'user/updateLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.put('/users/location', locationData);
      
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

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (password, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.delete('/users/account', {
        data: { password }
      });
      
      if (response.success) {
        return response.data;
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
  profile: null,
  preferences: {
    notifications: true,
    emailUpdates: true,
    darkMode: false,
  },
  location: {
    city: null,
    state: null,
    country: 'India',
    latitude: null,
    longitude: null,
  },
  stats: {
    favoritesCount: 0,
    adoptionRequestsCount: 0,
    adoptionstCount: 0,
  },
  isLoading: false,
  isUpdating: false,
  isUploading: false,
  error: null,
  lastUpdated: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
      state.lastUpdated = Date.now();
    },
    
    setLocation: (state, action) => {
      state.location = {
        ...state.location,
        ...action.payload
      };
    },
    
    updateStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...action.payload
      };
    },
    
    incrementFavorites: (state) => {
      state.stats.favoritesCount += 1;
    },
    
    decrementFavorites: (state) => {
      state.stats.favoritesCount -= 1;
    },
    
    incrementAdoptionRequests: (state) => {
      state.stats.adoptionRequestsCount += 1;
    },
    
    resetUserState: (state) => {
      return initialState;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch user profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = {
          ...state.profile,
          ...action.payload
        };
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Upload profile image cases
      .addCase(uploadProfileImage.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isUploading = false;
        if (state.profile) {
          state.profile.profileImage = action.payload;
        }
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Update location cases
      .addCase(updateLocation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.location = {
          ...state.location,
          ...action.payload
        };
        if (state.profile) {
          state.profile.city = action.payload.city;
          state.profile.state = action.payload.state;
        }
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete account cases
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        return initialState;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearUserError,
  updatePreferences,
  setLocation,
  updateStats,
  incrementFavorites,
  decrementFavorites,
  incrementAdoptionRequests,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
