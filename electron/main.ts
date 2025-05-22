import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null

// Register IPC handlers immediately
const registerIpcHandlers = () => {
  console.log('🔧 Registering IPC handlers...')
  
  // Mock handlers for now - we'll add real database later
  ipcMain.handle('profiles:getAll', async () => {
    console.log('📞 IPC: profiles:getAll called')
    try {
      // Return empty array for now
      return { success: true, data: [] }
    } catch (error) {
      console.error('❌ Failed to get profiles:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:create', async (_event, name: string) => {
    console.log(`📞 IPC: profiles:create called with name: ${name}`)
    try {
      // Create a mock profile
      const mockProfile = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      console.log('✅ Created profile:', mockProfile)
      return { success: true, data: mockProfile }
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:update', async (_event, id: number, name: string) => {
    console.log(`📞 IPC: profiles:update called with id: ${id}, name: ${name}`)
    try {
      const mockProfile = {
        id: id,
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return { success: true, data: mockProfile }
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('profiles:delete', async (_event, id: number) => {
    console.log(`📞 IPC: profiles:delete called with id: ${id}`)
    try {
      return { success: true, data: { id } }
    } catch (error) {
      console.error('❌ Failed to delete profile:', error)
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready!')
  
  // Register IPC handlers FIRST
  registerIpcHandlers()
  
  // Then create window
  await createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})