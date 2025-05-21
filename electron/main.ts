import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Determine development mode
const isDevelopment = true; // Force development mode for now

let mainWindow: BrowserWindow | null = null;

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
app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();

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