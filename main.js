const { app, BrowserWindow } = require('electron');
const path = require('path');
const { createWindow } = require('./electron/window');
const { setupIpcHandlers } = require('./electron/ipc-handlers');

let mainWindow;

const isDev = !app.isPackaged;

app.whenReady().then(() => {
  mainWindow = createWindow(isDev);
  setupIpcHandlers(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow(isDev);
    setupIpcHandlers(mainWindow);
  }
});