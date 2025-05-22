import React from 'react';
import { Profile } from '../../types/profile';

interface ProfileListProps {
  profiles: Profile[];
  onEdit: (profile: Profile) => void;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  onManageBrokers: (profile: Profile) => void; // New prop for broker management
  selectedProfileId: number | null;
}

const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  onEdit,
  onDelete,
  onSelect,
  onManageBrokers,
  selectedProfileId,
}) => {
  if (profiles.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No profiles found. Add your first profile to get started.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {profiles.map((profile) => (
        <li
          key={profile.id}
          className={`py-4 px-4 hover:bg-gray-50 ${
            selectedProfileId === profile.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Profile Info - Clickable */}
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelect(profile.id)}
            >
              <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500">
                Created: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex ml-4 space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageBrokers(profile);
                }}
                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
              >
                Manage Brokers
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(profile);
                }}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(profile.id);
                }}
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProfileList;