import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Profile, ApiResponse } from '../../types/profile';

// Define the initial state
interface ProfilesState {
  profiles: Profile[];
  selectedProfileId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfilesState = {
  profiles: [],
  selectedProfileId: null,
  loading: false,
  error: null,
};

// Helper function to check if electronAPI is available
const getElectronAPI = () => {
  if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.profiles) {
    return window.electronAPI.profiles;
  }
  return null;
};

// Async thunks for API calls
export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const api = getElectronAPI();
      if (!api) {
        return rejectWithValue('Electron API not available');
      }
      
      const response: ApiResponse<Profile[]> = await api.getAll();
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch profiles');
      }
      return response.data || [];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createProfile = createAsyncThunk(
  'profiles/createProfile',
  async (name: string, { rejectWithValue }) => {
    try {
      const api = getElectronAPI();
      if (!api) {
        return rejectWithValue('Electron API not available');
      }
      
      const response: ApiResponse<Profile> = await api.create(name);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create profile');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profiles/updateProfile',
  async ({ id, name }: { id: number; name: string }, { rejectWithValue }) => {
    try {
      const api = getElectronAPI();
      if (!api) {
        return rejectWithValue('Electron API not available');
      }
      
      const response: ApiResponse<Profile> = await api.update(id, name);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update profile');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'profiles/deleteProfile',
  async (id: number, { rejectWithValue }) => {
    try {
      const api = getElectronAPI();
      if (!api) {
        return rejectWithValue('Electron API not available');
      }
      
      const response: ApiResponse<Profile> = await api.delete(id);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete profile');
      }
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Create the profiles slice
const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setSelectedProfile: (state, action: PayloadAction<number | null>) => {
      state.selectedProfileId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch profiles
    builder.addCase(fetchProfiles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfiles.fulfilled, (state, action) => {
      state.loading = false;
      state.profiles = action.payload;
    });
    builder.addCase(fetchProfiles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create profile
    builder.addCase(createProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.profiles.push(action.payload as Profile);
      }
    });
    builder.addCase(createProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      const updatedProfile = action.payload as Profile;
      if (updatedProfile) {
        const index = state.profiles.findIndex((profile) => profile.id === updatedProfile.id);
        if (index !== -1) {
          state.profiles[index] = updatedProfile;
        }
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete profile
    builder.addCase(deleteProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profiles = state.profiles.filter((profile) => profile.id !== (action.payload as number));
      if (state.selectedProfileId === action.payload) {
        state.selectedProfileId = null;
      }
    });
    builder.addCase(deleteProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedProfile, clearError } = profilesSlice.actions;
export default profilesSlice.reducer;