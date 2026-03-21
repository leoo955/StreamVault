const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

const SERVER_URL = process.env.VITE_URL || 'https://stream-vault-ten.vercel.app';

if (process.platform === 'win32') {
    app.setAppUserModelId('StreamVault');
}

function createWindow() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'public/icon-192.png'));

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false, 
    autoHideMenuBar: true, 
    icon: icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
