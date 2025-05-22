import { Profile, ApiResponse } from './profile';

declare global {
  interface Window {
    electronAPI: {
      appName: string;
      appVersion: string;
      
      profiles: {
        getAll: () => Promise<ApiResponse<Profile[]>>;
        getById: (id: number) => Promise<ApiResponse<Profile | null>>;
        create: (name: string) => Promise<ApiResponse<Profile>>;
        update: (id: number, name: string) => Promise<ApiResponse<Profile>>;
        delete: (id: number) => Promise<ApiResponse<Profile>>;
      };
    };
  }
}

export {};