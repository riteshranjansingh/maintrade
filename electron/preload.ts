import { contextBridge, ipcRenderer } from 'electron'

console.log('🔧 Preload script starting...')

// Define the API that will be exposed to the renderer process
const electronAPI = {
  // App information
  appName: 'MainTrade',
  appVersion: '0.1.0',
  
  // Profile management methods
  profiles: {
    getAll: () => {
      console.log('🔍 Calling profiles:getAll')
      return ipcRenderer.invoke('profiles:getAll')
    },
    
    getById: (id: number) => {
      console.log('🔍 Calling profiles:getById with id:', id)
      return ipcRenderer.invoke('profiles:getById', id)
    },
    
    create: (name: string) => {
      console.log('🔍 Calling profiles:create with name:', name)
      return ipcRenderer.invoke('profiles:create', name)
    },
    
    update: (id: number, name: string) => {
      console.log('🔍 Calling profiles:update with id:', id, 'name:', name)
      return ipcRenderer.invoke('profiles:update', id, name)
    },
    
    delete: (id: number) => {
      console.log('🔍 Calling profiles:delete with id:', id)
      return ipcRenderer.invoke('profiles:delete', id)
    }
  }
}

// Expose the API to the main world
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  console.log('✅ electronAPI exposed successfully!')
  console.log('📋 Available methods:', Object.keys(electronAPI))
  console.log('📋 Profile methods:', Object.keys(electronAPI.profiles))
} catch (error) {
  console.error('❌ Failed to expose electronAPI:', error)
}

console.log('✅ Preload script completed!')