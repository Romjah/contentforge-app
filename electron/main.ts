import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import Store from 'electron-store';

// Désactiver l'isolation GPU sur Windows 10 avec Intel GPU
if (release().startsWith('10')) {
  app.disableHardwareAcceleration();
}

// Application ne supporte pas Windows 7
if (process.platform === 'win32' && release().startsWith('6.1')) {
  app.quit();
}

// Disable Security Warning on development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Définir le schéma pour les données utilisateur persistantes
const schema = {
  firstRun: {
    type: 'boolean',
    default: true,
  },
  user: {
    type: 'object',
    properties: {
      name: { type: 'string', default: '' },
      email: { type: 'string', default: '' },
    },
    default: {},
  },
  subscription: {
    type: 'object',
    properties: {
      level: { type: 'string', enum: ['free', 'pro', 'enterprise'], default: 'free' },
      expiresAt: { type: 'string', default: '' },
    },
    default: {
      level: 'free',
      expiresAt: '',
    },
  },
  recentProjects: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        name: { type: 'string' },
        lastOpened: { type: 'string' },
      },
    },
    default: [],
  },
  settings: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: 'string', default: 'fr' },
      autoSave: { type: 'boolean', default: true },
      telemetry: { type: 'boolean', default: true },
    },
    default: {
      theme: 'system',
      language: 'fr',
      autoSave: true,
      telemetry: true,
    },
  },
};

// Initialize store
const store = new Store({ schema });

let mainWindow: BrowserWindow | null = null;

// Chemin racine
const ROOT_PATH = {
  dist: join(__dirname, '../..'),
  public: join(__dirname, app.isPackaged ? '../..' : '../../public'),
};

// Détecter si c'est un environnement de développement
const isDev = !app.isPackaged;

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'ContentForge',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    autoHideMenuBar: true,
  });

  // Chargement de l'application
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(ROOT_PATH.dist, 'index.html'));
  }

  // Testez si c'est la première exécution
  const isFirstRun = store.get('firstRun');
  
  // Ouvrir les liens externes dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Montrer la fenêtre une fois chargée
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    
    // Envoyez les infos sur la première exécution à la fenêtre
    mainWindow?.webContents.send('app:first-run', isFirstRun);
    if (isFirstRun) {
      // Mettre à jour le flag pour les prochaines exécutions
      store.set('firstRun', false);
    }
  });
}

// Créer la fenêtre au démarrage
app.whenReady().then(createWindow);

// Quitter l'application quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Recréer la fenêtre sur macOS quand l'icône du dock est cliquée
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers entre le processus principal et le renderer
ipcMain.handle('get-store-value', (_, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (_, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-user-subscription', () => {
  return store.get('subscription');
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Exporter automatiquement les fonctions pour Vite
export {}; 