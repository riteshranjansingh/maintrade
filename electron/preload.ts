import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  appName: 'MainTrade',
  appVersion: process.env.npm_package_version || '0.1.0',
});

// Preload scripts run in an isolated context
console.log('Preload script running...');