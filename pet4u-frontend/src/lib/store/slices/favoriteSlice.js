import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteAPI } from '../../api/favorites';

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await favoriteAPI.getFavorites(params);
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

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (petId, { rejectWithValue }) => {
    try {
      const response = await favoriteAPI.addFavorite(petId);
      if (response.success) {
        return { petId, favorite: response.data.data.favorite };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (petId, { rejectWithValue }) => {
    try {
      const response = await favoriteAPI.removeFavorite(petId);
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

export const checkFavorite = createAsyncThunk(
  'favorites/checkFavorite',
  async (petId, { rejectWithValue }) => {
    try {
      const response = await favoriteAPI.checkFavorite(petId);
      if (response.success) {
        return { petId, isFavorited: response.data.data.isFavorited };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state - ✅ USE ARRAY
const initialState = {
  favorites: [],
  favoritedPetIds: [], // ✅ Changed from new Set() to []
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  isAdding: false,
  isRemoving: false,
  error: null,
};

// Favorites slice
const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavoriteError: (state) => {
      state.error = null;
    },
    resetFavoriteState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload.favorites;
        state.pagination = action.payload.pagination;
        // ✅ Convert to array instead of Set
        state.favoritedPetIds = action.payload.favorites.map(f => f.petId || f.id);
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add favorite
      .addCase(addFavorite.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.isAdding = false;
        // ✅ Use array push instead of Set.add()
        if (!state.favoritedPetIds.includes(action.payload.petId)) {
          state.favoritedPetIds.push(action.payload.petId);
        }
        state.error = null;
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload;
      })
      
      // Remove favorite
      .addCase(removeFavorite.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.isRemoving = false;
        // ✅ Filter both arrays
        state.favorites = state.favorites.filter(f => f.id !== action.payload);
        state.favoritedPetIds = state.favoritedPetIds.filter(id => id !== action.payload);
        state.error = null;
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload;
      })
      
      // Check favorite
      .addCase(checkFavorite.fulfilled, (state, action) => {
        if (action.payload.isFavorited) {
          // ✅ Add to array if not already present
          if (!state.favoritedPetIds.includes(action.payload.petId)) {
            state.favoritedPetIds.push(action.payload.petId);
          }
        } else {
          // ✅ Remove from array
          state.favoritedPetIds = state.favoritedPetIds.filter(
            id => id !== action.payload.petId
          );
        }
      });
  },
});

export const { clearFavoriteError, resetFavoriteState } = favoriteSlice.actions;
export default favoriteSlice.reducer;
