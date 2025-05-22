import React from 'react';
import { Profile } from '../../types/profile';

interface ProfileListProps {
  profiles: Profile[];
  onEdit: (profile: Profile) => void;
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  selectedProfileId: number | null;
}

const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  onEdit,
  onDelete,
  onSelect,
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
          className={`py-4 px-4 flex items-center justify-between hover:bg-gray-50 ${
            selectedProfileId === profile.id ? 'bg-blue-50' : ''
          }`}
          onClick={() => onSelect(profile.id)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
            <p className="text-xs text-gray-500">
              Created: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex ml-4 space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(profile);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(profile.id);
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProfileList;