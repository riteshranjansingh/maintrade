import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import DatabaseService from './database/profileService'
import BrokerAccountService from './database/brokerAccountService'
import { BrokerType } from '../src/types/broker'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null
let dbService: DatabaseService
let brokerService: BrokerAccountService

// Initialize database services
const initializeDatabase = async () => {
  console.log('🗄️ Initializing database services...')
  try {
    dbService = DatabaseService.getInstance()
    brokerService = BrokerAccountService.getInstance(dbService['prisma']) // Access prisma instance
    console.log('✅ Database services initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
  }
}

// Register IPC handlers for profiles and broker accounts
const registerIpcHandlers = () => {
  console.log('🔧 Registering IPC handlers...')
  
  // ===== PROFILE HANDLERS =====
  ipcMain.handle('profiles:getAll', async () => {
    console.log('📞 IPC: profiles:getAll called')
    try {
      const profiles = await dbService.getAllProfiles()
      return { success: true, data: profiles }
    } catch (error) {
      console.error('❌ Failed to get profiles:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:create', async (_event, name: string) => {
    console.log(`📞 IPC: profiles:create called with name: ${name}`)
    try {
      const profile = await dbService.createProfile(name)
      return { success: true, data: profile }
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:update', async (_event, id: number, name: string) => {
    console.log(`📞 IPC: profiles:update called with id: ${id}, name: ${name}`)
    try {
      const profile = await dbService.updateProfile(id, name)
      return { success: true, data: profile }
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:delete', async (_event, id: number) => {
    console.log(`📞 IPC: profiles:delete called with id: ${id}`)
    try {
      const profile = await dbService.deleteProfile(id)
      return { success: true, data: profile }
    } catch (error) {
      console.error('❌ Failed to delete profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:getById', async (_event, id: number) => {
    console.log(`📞 IPC: profiles:getById called with id: ${id}`)
    try {
      const profile = await dbService.getProfileById(id)
      return { success: true, data: profile }
    } catch (error) {
      console.error('❌ Failed to get profile by ID:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // ===== BROKER ACCOUNT HANDLERS =====
  ipcMain.handle('brokerAccounts:getByProfile', async (_event, profileId: number) => {
    console.log(`📞 IPC: brokerAccounts:getByProfile called with profileId: ${profileId}`)
    try {
      const accounts = await brokerService.getBrokerAccountsByProfile(profileId)
      return { success: true, data: accounts }
    } catch (error) {
      console.error('❌ Failed to get broker accounts:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('brokerAccounts:create', async (_event, data: {
    profileId: number
    brokerName: BrokerType
    displayName: string
    accountId: string
    apiKey: string
    apiSecret: string
  }) => {
    console.log(`📞 IPC: brokerAccounts:create called for ${data.brokerName}`)
    try {
      const account = await brokerService.createBrokerAccount(data)
      return { success: true, data: account }
    } catch (error) {
      console.error('❌ Failed to create broker account:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('brokerAccounts:update', async (_event, id: number, updates: {
    displayName?: string
    accountId?: string
    apiKey?: string
    apiSecret?: string
    isActive?: boolean
  }) => {
    console.log(`📞 IPC: brokerAccounts:update called for account ${id}`)
    try {
      const account = await brokerService.updateBrokerAccount(id, updates)
      return { success: true, data: account }
    } catch (error) {
      console.error('❌ Failed to update broker account:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('brokerAccounts:delete', async (_event, id: number) => {
    console.log(`📞 IPC: brokerAccounts:delete called for account ${id}`)
    try {
      const account = await brokerService.deleteBrokerAccount(id)
      return { success: true, data: account }
    } catch (error) {
      console.error('❌ Failed to delete broker account:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('brokerAccounts:setDataSource', async (_event, profileId: number, brokerAccountId: number) => {
    console.log(`📞 IPC: brokerAccounts:setDataSource called for profile ${profileId}, account ${brokerAccountId}`)
    try {
      const account = await brokerService.setDataSource(profileId, brokerAccountId)
      return { success: true, data: account }
    } catch (error) {
      console.error('❌ Failed to set data source:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('brokerAccounts:getCurrentDataSource', async (_event, profileId: number) => {
    console.log(`📞 IPC: brokerAccounts:getCurrentDataSource called for profile ${profileId}`)
    try {
      const account = await brokerService.getCurrentDataSource(profileId)
      return { success: true, data: account }
    } catch (error) {
      console.error('❌ Failed to get current data source:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  console.log('✅ All IPC handlers registered successfully!')
}

const createWindow = async (): Promise<void> => {
  console.log('🪟 Creating main window...')
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Load the app.
  if (isDevelopment) {
    const loadURL = 'http://localhost:5173'
    console.log(`🌐 Loading development URL: ${loadURL}`)
    
    await mainWindow.loadURL(loadURL)
    
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'))
  }

  console.log('✅ Main window created successfully!')
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready!')
  
  // Initialize database first
  await initializeDatabase()
  
  // Register IPC handlers
  registerIpcHandlers()
  
  // Then create window
  await createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', async () => {
  // Clean up database connection
  if (dbService) {
    await dbService.disconnect()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app termination
app.on('before-quit', async () => {
  console.log('🛑 App is quitting, cleaning up database connection...')
  if (dbService) {
    await dbService.disconnect()
  }
})