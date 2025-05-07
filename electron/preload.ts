import { contextBridge, ipcRenderer } from 'electron';

// Improved environment detection
const isElectron = () => {
  // Check if running in Electron renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  // Check if electron module is available
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  return false;
};

// Variables to hold Node modules
let spawn: any = null;
let homedir: any = null;
let join: any = null;

// Safely attempt to import Node.js modules only in Electron environment
if (isElectron()) {
  try {
    // Use dynamic imports with a try-catch to handle potential failures
    const childProcess = require('child_process');
    spawn = childProcess.spawn;
    
    const os = require('os');
    homedir = os.homedir;
    
    const path = require('path');
    join = path.join;
  } catch (error) {
    console.error('Failed to load Node.js modules:', error);
  }
}

// API mock for browser environment (development/testing)
const browserMockAPI = {
  getStoreValue: async (key: string) => {
    const mockData: any = {
      firstRun: false,
      user: { name: 'User Test', email: 'test@example.com' },
      subscription: { level: 'free', expiresAt: '' },
      recentProjects: [],
      settings: {
        theme: 'system',
        language: 'fr',
        autoSave: true,
        telemetry: true,
      },
    };
    return mockData[key] || null;
  },
  setStoreValue: async () => true,
  getUserSubscription: async () => ({ level: 'free', expiresAt: '' }),
  getAppPath: async () => '/mock/path',
  onFirstRun: (callback: (isFirstRun: boolean) => void) => {
    // Simulate immediate response
    setTimeout(() => callback(false), 100);
    return () => {};
  },
  runCliCommand: async () => ({ success: true, data: 'Mock command executed' }),
};

// Select appropriate API based on environment
const api = isElectron() ? {
  // Preferences management
  getStoreValue: (key: string) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key: string, value: any) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Subscription management
  getUserSubscription: () => ipcRenderer.invoke('get-user-subscription'),
  
  // Paths
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Events
  onFirstRun: (callback: (isFirstRun: boolean) => void) => {
    ipcRenderer.on('app:first-run', (_event, isFirstRun) => callback(isFirstRun));
    return () => {
      ipcRenderer.removeAllListeners('app:first-run');
    };
  },
  
  // ContentForge CLI integration
  runCliCommand: async (command: string, args: string[]) => {
    if (!spawn || !homedir || !join) {
      return Promise.reject({ success: false, error: 'Node.js modules not available' });
    }

    return new Promise((resolve, reject) => {
      // Path to contentforge-cli
      const cliPath = join(homedir(), '.npm', 'contentforge');
      
      try {
        // Execute CLI command
        const child = spawn(cliPath, [command, ...args]);
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, data: stdout });
          } else {
            resolve({ success: false, error: stderr });
          }
        });
        
        child.on('error', (err) => {
          reject({ success: false, error: err.message });
        });
      } catch (error) {
        reject({ success: false, error: 'Failed to execute CLI command' });
      }
    });
  }
} : browserMockAPI;

// Expose secure APIs to browser window
if (isElectron()) {
  contextBridge.exposeInMainWorld('electronAPI', api);
} else {
  // In browser mode, manually expose the API
  (window as any).electronAPI = api;
} 