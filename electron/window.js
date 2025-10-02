const { BrowserWindow, dialog } = require('electron');
const path = require('path');

let hasUnsavedChanges = false;

function createWindow(isDev) {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    titleBarStyle: 'default',
    backgroundColor: '#1e1e1e'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-vite/index.html'));
  }

  mainWindow.on('close', (e) => {
    if (hasUnsavedChanges) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Cancel', 'Close Without Saving'],
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        defaultId: 0,
        cancelId: 0
      });

      if (choice === 0) {
        e.preventDefault();
      }
    }
  });

  return mainWindow;
}

function setUnsavedChanges(value) {
  hasUnsavedChanges = value;
}

function getUnsavedChanges() {
  return hasUnsavedChanges;
}

module.exports = { createWindow, setUnsavedChanges, getUnsavedChanges };