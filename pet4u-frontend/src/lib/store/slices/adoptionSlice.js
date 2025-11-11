import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adoptionRequestAPI } from '../../api/adoptionRequests';

// Async thunks
export const createAdoptionRequest = createAsyncThunk(
  'adoption/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await adoptionRequestAPI.createAdoptionRequest(requestData);
      if (response.success) {
        return response.data.data.request;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'adoption/fetchMyRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adoptionRequestAPI.getMyRequests(params);
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

export const fetchReceivedRequests = createAsyncThunk(
  'adoption/fetchReceivedRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adoptionRequestAPI.getReceivedRequests(params);
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

export const respondToRequest = createAsyncThunk(
  'adoption/respondToRequest',
  async ({ requestId, responseData }, { rejectWithValue }) => {
    try {
      const response = await adoptionRequestAPI.respondToRequest(requestId, responseData);
      if (response.success) {
        return response.data.data.request;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawRequest = createAsyncThunk(
  'adoption/withdrawRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await adoptionRequestAPI.withdrawRequest(requestId);
      if (response.success) {
        return requestId;
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
  myRequests: [],
  receivedRequests: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isCreating: false,
  isResponding: false,
  error: null,
};

// Adoption slice
const adoptionSlice = createSlice({
  name: 'adoption',
  initialState,
  reducers: {
    clearAdoptionError: (state) => {
      state.error = null;
    },
    resetAdoptionState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create request
      .addCase(createAdoptionRequest.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAdoptionRequest.fulfilled, (state, action) => {
        state.isCreating = false;
        state.myRequests.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAdoptionRequest.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Fetch my requests
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests = action.payload.requests;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch received requests
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receivedRequests = action.payload.requests;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Respond to request
      .addCase(respondToRequest.pending, (state) => {
        state.isResponding = true;
        state.error = null;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.isResponding = false;
        const index = state.receivedRequests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.receivedRequests[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.isResponding = false;
        state.error = action.payload;
      })
      
      // Withdraw request
      .addCase(withdrawRequest.fulfilled, (state, action) => {
        state.myRequests = state.myRequests.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearAdoptionError, resetAdoptionState } = adoptionSlice.actions;
export default adoptionSlice.reducer;
