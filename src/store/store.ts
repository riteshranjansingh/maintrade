import { configureStore } from '@reduxjs/toolkit';
import profilesReducer from './slices/profilesSlice';
import mlReducer from './slices/mlSlice';

export const store = configureStore({
  reducer: {
    profiles: profilesReducer,
    ml: mlReducer,
    // Add more reducers as we develop them
  },
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;