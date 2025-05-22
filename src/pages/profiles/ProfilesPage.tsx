import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  setSelectedProfile,
} from '../../store/slices/profilesSlice';
import ProfileList from '../../components/profiles/ProfileList';
import ProfileForm from '../../components/profiles/ProfileForm';
import { Profile } from '../../types/profile';

const ProfilesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, selectedProfileId, loading, error } = useSelector(
    (state: RootState) => state.profiles
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(undefined);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Debug function to check Electron API availability
  useEffect(() => {
    console.log('Checking Electron API availability...');
    console.log('window:', window);
    console.log('window.electronAPI:', window.electronAPI);
    
    if (typeof window !== 'undefined') {
      if (window.electronAPI) {
        setDebugInfo('Electron API is available');
        console.log('Electron API profiles:', window.electronAPI.profiles);
        
        // Try to fetch profiles manually for debugging
        if (window.electronAPI.profiles && window.electronAPI.profiles.getAll) {
          window.electronAPI.profiles.getAll()
            .then(result => {
              console.log('Manual fetch result:', result);
              setDebugInfo(prev => prev + ' | Manual fetch successful');
            })
            .catch(err => {
              console.error('Manual fetch error:', err);
              setDebugInfo(prev => prev + ' | Manual fetch failed: ' + err.message);
            });
        } else {
          setDebugInfo('Electron API exists but profiles.getAll is not available');
        }
      } else {
        setDebugInfo('Electron API is not available');
      }
    } else {
      setDebugInfo('Window is not defined');
    }
  }, []);

  // Fetch profiles on component mount
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.profiles) {
      dispatch(fetchProfiles());
    }
  }, [dispatch]);

  const handleCreateProfile = () => {
    setEditingProfile(undefined);
    setIsFormOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsFormOpen(true);
  };

  const handleDeleteProfile = (id: number) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      dispatch(deleteProfile(id));
    }
  };

  const handleSelectProfile = (id: number) => {
    dispatch(setSelectedProfile(id));
  };

  const handleFormSubmit = (name: string) => {
    if (editingProfile) {
      dispatch(updateProfile({ id: editingProfile.id, name }));
    } else {
      dispatch(createProfile(name));
    }
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profiles</h1>
        <button
          onClick={handleCreateProfile}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Profile
        </button>
      </div>

      {/* Debug information */}
      <div className="mb-4 p-4 bg-yellow-100 rounded-md">
        <h3 className="font-semibold">Debug Info:</h3>
        <p>{debugInfo}</p>
      </div>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading profiles...</div>
      ) : (
        <>
          {isFormOpen ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-medium mb-4">
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </h2>
              <ProfileForm
                profile={editingProfile}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          ) : null}

          <div className="bg-white shadow rounded-md overflow-hidden">
            <ProfileList
              profiles={profiles}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              onSelect={handleSelectProfile}
              selectedProfileId={selectedProfileId}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilesPage;