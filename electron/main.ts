import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import DatabaseService from './database/profileService'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null
let dbService: DatabaseService

// Initialize database service
const initializeDatabase = async () => {
  console.log('🗄️ Initializing database service...')
  try {
    dbService = DatabaseService.getInstance()
    console.log('✅ Database service initialized successfully!')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
  }
}

// Register IPC handlers with real database operations
const registerIpcHandlers = () => {
  console.log('🔧 Registering IPC handlers with database operations...')
  
  // Get all profiles
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

  // Create new profile
  ipcMain.handle('profiles:create', async (_event, name: string) => {
    console.log(`📞 IPC: profiles:create called with name: ${name}`)
    try {
      const profile = await dbService.createProfile(name)
      console.log('✅ Profile created successfully:', profile)
      return { success: true, data: profile }
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  // Update profile
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

  // Delete profile
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

  // Get profile by ID
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

  console.log('✅ All IPC handlers registered with database operations!')
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready!')
  
  // Initialize database first
  await initializeDatabase()
  
  // Register IPC handlers
  registerIpcHandlers()
  
  // Then create window
  await createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
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