import { configureStore } from '@reduxjs/toolkit';
// We'll add slices as we develop them
// import profilesReducer from './slices/profilesSlice';
// import alertsReducer from './slices/alertsSlice';
// etc.

export const store = configureStore({
  reducer: {
    // Add reducers as we develop them
    // profiles: profilesReducer,
    // alerts: alertsReducer,
    // etc.
  },
  // Optional: Add middleware for things like logging, etc.
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;