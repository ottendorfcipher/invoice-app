const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let nextServer;

function startNextServer() {
  if (!isDev) {
    const nextServerPath = path.join(__dirname, '../node_modules/.bin/next');
    nextServer = spawn('node', [nextServerPath, 'start'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000' }
    });
    
    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
    });
    
    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false,
  });

  const startUrl = 'http://localhost:3000';
  
  // Wait a bit for the server to start in production
  const delay = isDev ? 0 : 3000;
  setTimeout(() => {
    mainWindow.loadURL(startUrl);
  }, delay);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Development only: Open DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// App event handlers
app.whenReady().then(() => {
  startNextServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer && !nextServer.killed) {
    nextServer.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});
