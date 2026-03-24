const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "BaixaBaixa - Central de Downloads",
    autoHideMenuBar: true
  });

  // Start the Local Agent Worker
  serverProcess = spawn('node', [path.join(__dirname, 'server', 'agent-worker.cjs')], {
    stdio: 'inherit'
  });

  // Load the dashboard (can be local or web)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Points directly to the live Vercel frontend
    mainWindow.loadURL('https://baixa-baixa.vercel.app/');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) serverProcess.kill();
  });
}

app.on('ready', () => {
  try {
    const { autoUpdater } = require('electron-updater');

    // Auto-Updater Logging/Events
    autoUpdater.on('update-available', () => {
        console.log('[AutoUpdater] Update found. Downloading...');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('[AutoUpdater] Update downloaded. Restarting to install...');
        autoUpdater.quitAndInstall();
    });

    // Check for updates as soon as the app opens
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.error('Failed to initialize auto-updater:', err);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
