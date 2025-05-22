import { contextBridge, ipcRenderer } from 'electron'
import { BrokerType } from '../src/types/broker'

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
  },

  // Broker account management methods
  brokerAccounts: {
    getByProfile: (profileId: number) => {
      console.log('🔍 Calling brokerAccounts:getByProfile with profileId:', profileId)
      return ipcRenderer.invoke('brokerAccounts:getByProfile', profileId)
    },

    create: (data: {
      profileId: number
      brokerName: BrokerType
      displayName: string
      accountId: string
      apiKey: string
      apiSecret: string
    }) => {
      console.log('🔍 Calling brokerAccounts:create for broker:', data.brokerName)
      return ipcRenderer.invoke('brokerAccounts:create', data)
    },

    update: (id: number, updates: {
      displayName?: string
      accountId?: string
      apiKey?: string
      apiSecret?: string
      isActive?: boolean
    }) => {
      console.log('🔍 Calling brokerAccounts:update for account:', id)
      return ipcRenderer.invoke('brokerAccounts:update', id, updates)
    },

    delete: (id: number) => {
      console.log('🔍 Calling brokerAccounts:delete for account:', id)
      return ipcRenderer.invoke('brokerAccounts:delete', id)
    },

    setDataSource: (profileId: number, brokerAccountId: number) => {
      console.log('🔍 Calling brokerAccounts:setDataSource for profile:', profileId, 'account:', brokerAccountId)
      return ipcRenderer.invoke('brokerAccounts:setDataSource', profileId, brokerAccountId)
    },

    getCurrentDataSource: (profileId: number) => {
      console.log('🔍 Calling brokerAccounts:getCurrentDataSource for profile:', profileId)
      return ipcRenderer.invoke('brokerAccounts:getCurrentDataSource', profileId)
    }
  }
}

// Expose the API to the main world
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  console.log('✅ electronAPI exposed successfully!')
  console.log('📋 Available methods:', Object.keys(electronAPI))
  console.log('📋 Profile methods:', Object.keys(electronAPI.profiles))
  console.log('📋 Broker account methods:', Object.keys(electronAPI.brokerAccounts))
} catch (error) {
  console.error('❌ Failed to expose electronAPI:', error)
}

console.log('✅ Preload script completed!')