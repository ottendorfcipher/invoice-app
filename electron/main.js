const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let server;

function startServer() {
  return new Promise((resolve, reject) => {
    if (!isDev) {
      // In production, start Next.js server directly
      const next = require('next');
      const http = require('http');
      
      const nextApp = next({ 
        dev: false, 
        dir: path.join(__dirname, '..'),
      });
      
      const handle = nextApp.getRequestHandler();
      
      nextApp.prepare().then(() => {
        // Create HTTP server with Next.js handler
        server = http.createServer((req, res) => {
          // Add error handling for requests
          try {
            handle(req, res);
          } catch (error) {
            console.error('Error handling request:', error);
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        });
        
        server.listen(3000, (err) => {
          if (err) {
            console.error('Error starting server:', err);
            reject(err);
            return;
          }
          console.log('> Next.js server ready on http://localhost:3000');
          resolve();
        });
      }).catch((ex) => {
        console.error('Error preparing Next.js:', ex);
        reject(ex);
      });
    } else {
      resolve(); // In development, resolve immediately
    }
  });
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
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : process.platform === 'darwin' ? 'icon.icns' : 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#ffffff', // Set a background color to avoid flashing
  });

  const startUrl = 'http://localhost:3000';
  
  // Load URL immediately in development, wait for server in production
  if (isDev) {
    mainWindow.loadURL(startUrl);
  } else {
    // Wait for server to be ready, then load
    startServer().then(() => {
      mainWindow.loadURL(startUrl);
    }).catch((err) => {
      dialog.showErrorBox('Server Error', `Failed to start server: ${err.message}`);
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
    mainWindow.focus();
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
  if (server) {
    server.close();
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
