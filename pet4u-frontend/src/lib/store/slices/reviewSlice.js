import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../../api/reviews';

// Async thunks
export const createPetReview = createAsyncThunk(
  'reviews/createPetReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.createPetReview(reviewData);
      if (response.success) {
        return response.data.data.review;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPetReviews = createAsyncThunk(
  'reviews/fetchPetReviews',
  async ({ petId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getPetReviews(petId, params);
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

export const createShelterReview = createAsyncThunk(
  'reviews/createShelterReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.createShelterReview(reviewData);
      if (response.success) {
        return response.data.data.review;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchShelterReviews = createAsyncThunk(
  'reviews/fetchShelterReviews',
  async ({ shelterId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getShelterReviews(shelterId, params);
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

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ type, reviewId }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.deleteReview(type, reviewId);
      if (response.success) {
        return { type, reviewId };
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
  petReviews: [],
  shelterReviews: [],
  petReviewStats: {
    totalReviews: 0,
    averageRating: 0,
  },
  shelterReviewStats: {
    totalReviews: 0,
    averageRating: 0,
    communicationRating: 0,
    facilityRating: 0,
    processRating: 0,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    clearPetReviews: (state) => {
      state.petReviews = [];
      state.petReviewStats = initialState.petReviewStats;
    },
    clearShelterReviews: (state) => {
      state.shelterReviews = [];
      state.shelterReviewStats = initialState.shelterReviewStats;
    },
    resetReviewState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create pet review
      .addCase(createPetReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createPetReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.petReviews.unshift(action.payload);
        state.petReviewStats.totalReviews += 1;
        state.error = null;
      })
      .addCase(createPetReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      
      // Fetch pet reviews
      .addCase(fetchPetReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPetReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.petReviews = action.payload.reviews;
        state.petReviewStats = action.payload.stats;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPetReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create shelter review
      .addCase(createShelterReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createShelterReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.shelterReviews.unshift(action.payload);
        state.shelterReviewStats.totalReviews += 1;
        state.error = null;
      })
      .addCase(createShelterReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      
      // Fetch shelter reviews
      .addCase(fetchShelterReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShelterReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shelterReviews = action.payload.reviews;
        state.shelterReviewStats = action.payload.stats;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchShelterReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        if (action.payload.type === 'pet') {
          state.petReviews = state.petReviews.filter(r => r.id !== action.payload.reviewId);
          state.petReviewStats.totalReviews = Math.max(0, state.petReviewStats.totalReviews - 1);
        } else {
          state.shelterReviews = state.shelterReviews.filter(r => r.id !== action.payload.reviewId);
          state.shelterReviewStats.totalReviews = Math.max(0, state.shelterReviewStats.totalReviews - 1);
        }
      });
  },
});

export const {
  clearReviewError,
  clearPetReviews,
  clearShelterReviews,
  resetReviewState,
} = reviewSlice.actions;

export default reviewSlice.reducer;
