import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiWrapper, tokenManager } from '../../api/axios';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.post('/auth/login', credentials);
      
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Store tokens using tokenManager
        tokenManager.setTokens(accessToken, refreshToken);
        
        return {
          user,
          accessToken,
          isAuthenticated: true
        };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.post('/auth/register', userData);
      
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

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiWrapper.post('/auth/logout');
      
      // Clear tokens regardless of API response
      tokenManager.clearTokens();
      
      return { success: true };
    } catch (error) {
      // Clear tokens even if API call fails
      tokenManager.clearTokens();
      return { success: true };
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenManager.getAccessToken();
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await apiWrapper.get('/auth/verify');
      
      if (response.success) {
        return {
          user: response.data.data.user,
          isAuthenticated: true
        };
      } else {
        tokenManager.clearTokens();
        return rejectWithValue(response.error);
      }
    } catch (error) {
      tokenManager.clearTokens();
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationSuccess: false,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    resetAuthState: (state) => {
      return initialState;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        return initialState;
      })
      
      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearRegistrationSuccess,
  resetAuthState,
  incrementLoginAttempts,
  resetLoginAttempts,
} = authSlice.actions;

export default authSlice.reducer;
