import { contextBridge, ipcRenderer } from 'electron';

console.log('=== PRELOAD SCRIPT VERSION 2.0 STARTING ===');

try {
  // Test if ipcRenderer is available
  console.log('ipcRenderer available:', !!ipcRenderer);

  // Create the profiles object
  const profilesAPI = {
    getAll: () => {
      console.log('Calling profiles:getAll');
      return ipcRenderer.invoke('profiles:getAll');
    },
    getById: (id: number) => {
      console.log('Calling profiles:getById with id:', id);
      return ipcRenderer.invoke('profiles:getById', id);
    },
    create: (name: string) => {
      console.log('Calling profiles:create with name:', name);
      return ipcRenderer.invoke('profiles:create', name);
    },
    update: (id: number, name: string) => {
      console.log('Calling profiles:update with id:', id, 'name:', name);
      return ipcRenderer.invoke('profiles:update', id, name);
    },
    delete: (id: number) => {
      console.log('Calling profiles:delete with id:', id);
      return ipcRenderer.invoke('profiles:delete', id);
    },
  };

  console.log('Created profilesAPI:', profilesAPI);

  // Create the full API object
  const electronAPI = {
    // App info
    appName: 'MainTrade',
    appVersion: process.env.npm_package_version || '0.1.0',
    
    // Profile management
    profiles: profilesAPI
  };

  console.log('Created full electronAPI:', electronAPI);
  console.log('electronAPI.profiles:', electronAPI.profiles);

  // Expose the API
  console.log('Exposing electronAPI to main world...');
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('=== electronAPI exposed successfully ===');

} catch (error) {
  console.error('=== ERROR in preload script ===', error);
}

console.log('=== PRELOAD SCRIPT VERSION 2.0 COMPLETED ===');