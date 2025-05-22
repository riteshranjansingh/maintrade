import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Determine development mode
const isDevelopment = true; // Force development mode for now

let mainWindow: BrowserWindow | null = null;

// Register IPC handlers directly in main.ts to avoid import issues
const registerIpcHandlers = () => {
  console.log('=== REGISTERING IPC HANDLERS ===');
  
  // Simple test handler
  ipcMain.handle('profiles:getAll', async () => {
    console.log('IPC: profiles:getAll called');
    try {
      // For now, return empty array
      return { success: true, data: [] };
    } catch (error) {
      console.error('Failed to get profiles:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('profiles:create', async (_event, name: string) => {
    console.log(`IPC: profiles:create called with name: ${name}`);
    try {
      // For now, return a mock profile
      const mockProfile = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { success: true, data: mockProfile };
    } catch (error) {
      console.error('Failed to create profile:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  console.log('=== IPC HANDLERS REGISTERED ===');
};

const createWindow = async (): Promise<void> => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Log for debugging
  console.log('Electron window created');
  console.log('Preload path:', path.join(__dirname, 'preload.js'));

  // Load the app
  if (isDevelopment) {
    // In development, load from the Vite dev server
    const loadURL = 'http://localhost:5173';
    console.log(`Loading URL: ${loadURL}`);
    
    try {
      await mainWindow.loadURL(loadURL);
      console.log('URL loaded successfully');
    } catch (error) {
      console.error('Failed to load URL:', error);
    }
    
    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    mainWindow.loadFile(path.join(__dirname, '../../index.html'));
  }

  // Log when content is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content finished loading');
  });

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
};

// Create window when Electron is ready
app.whenReady().then(async () => {
  console.log('=== ELECTRON APP IS READY ===');
  
  // Register IPC handlers first
  registerIpcHandlers();
  
  // Small delay to ensure everything is ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Create the main window
  await createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});