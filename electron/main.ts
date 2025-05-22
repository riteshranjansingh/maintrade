import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as dotenv from 'dotenv'
import DatabaseService from './database/profileService'
import { BrokerAccountService } from './database/brokerAccountService'
import { EncryptionService } from './utils/encryption'
import { BrokerType } from './types/broker'

// Load environment variables
dotenv.config()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null
let dbService: DatabaseService
let brokerService: BrokerAccountService
let encryptionService: EncryptionService

// Initialize database services
const initializeDatabase = async () => {
  console.log('🗄️ Initializing database services...')
  try {
    // Check if ENCRYPTION_KEY is set
    if (!process.env.ENCRYPTION_KEY) {
      console.error('❌ ENCRYPTION_KEY environment variable not set')
      console.log('💡 Please create a .env file with ENCRYPTION_KEY. Run: npm run setup:env')
      throw new Error('ENCRYPTION_KEY environment variable is required')
    }

    // Initialize encryption service first
    encryptionService = new EncryptionService()
    
    // Test encryption
    const encryptionTest = encryptionService.test()
    console.log('🔐 Encryption test:', encryptionTest ? '✅ Passed' : '❌ Failed')
    
    if (!encryptionTest) {
      throw new Error('Encryption service failed initialization test')
    }

    // Initialize database service
    dbService = DatabaseService.getInstance()
    
    // Initialize broker service with encryption
    brokerService = BrokerAccountService.getInstance(
      (dbService as any).prisma, // Access prisma instance
      encryptionService
    )
    
    console.log('✅ Database services initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    
    // Show user-friendly error dialog
    if (mainWindow) {
      const { dialog } = require('electron')
      await dialog.showErrorBox(
        'Database Initialization Error',
        `Failed to initialize database: ${(error as Error).message}\n\nPlease check your .env file and run: npm run setup`
      )
    }
    
    throw error
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
      preload: isDevelopment 
        ? path.join(__dirname, 'preload.js')  // Development path
        : path.join(__dirname, 'preload.js'), // Production path
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // Don't show until ready
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('✅ Main window is ready and visible!')
  })

  // Load the app.
  if (isDevelopment) {
    const loadURL = 'http://localhost:5173'
    console.log(`🌐 Loading development URL: ${loadURL}`)
    
    try {
      await mainWindow.loadURL(loadURL)
      
      // Open the DevTools.
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('❌ Failed to load development URL. Make sure Vite dev server is running:', error)
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'))
  }

  console.log('✅ Main window created successfully!')
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready!')
  
  try {
    // Create window first (without showing)
    await createWindow()
    
    // Initialize database
    await initializeDatabase()
    
    // Register IPC handlers
    registerIpcHandlers()
    
    console.log('🎉 MainTrade application started successfully!')
  } catch (error) {
    console.error('❌ Failed to start application:', error)
    app.quit()
  }

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