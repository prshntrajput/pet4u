import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import petSlice from './slices/petSlice';
import favoriteSlice from './slices/favoriteSlice';
import messagesSlice from './slices/messagesSlice';
import adoptionSlice from './slices/adoptionSlice';
import notificationSlice from './slices/notificationSlice';
import reviewSlice from "./slices/reviewSlice"

// Persist configuration
const persistConfig = {
  key: 'pet4u-root',
  version: 1,
  storage,
  whitelist: ['auth', 'user'], // Only persist auth and user
  blacklist: ['pets', 'messages', 'notifications', 'reviews'], // ✅ Don't persist real-time data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  pets: petSlice,
  favorites: favoriteSlice,
  adoption: adoptionSlice,
  messages: messagesSlice,
  notifications: notificationSlice,
  reviews: reviewSlice
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
