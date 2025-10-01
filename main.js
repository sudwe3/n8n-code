const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let hasUnsavedChanges = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    backgroundColor: '#1e1e1e'
  });

  mainWindow.loadFile('src/index.html');

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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('open-file', async (event, filePath) => {
  event.preventDefault();
  if (mainWindow && filePath.endsWith('.json')) {
    const content = await fs.readFile(filePath, 'utf-8');
    mainWindow.webContents.send('file-dropped', { content, path: filePath });
    hasUnsavedChanges = false;
  }
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const content = await fs.readFile(result.filePaths[0], 'utf-8');
    hasUnsavedChanges = false;
    return { content, path: result.filePaths[0] };
  }
  return null;
});

ipcMain.handle('save-file', async (event, content, filePath) => {
  if (filePath) {
    await fs.writeFile(filePath, content, 'utf-8');
    hasUnsavedChanges = false;
    return filePath;
  } else {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: 'workflow.json'
    });
    
    if (!result.canceled && result.filePath) {
      await fs.writeFile(result.filePath, content, 'utf-8');
      hasUnsavedChanges = false;
      return result.filePath;
    }
  }
  return null;
});

ipcMain.handle('read-dropped-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    hasUnsavedChanges = false;
    return { content, path: filePath };
  } catch (err) {
    return null;
  }
});

ipcMain.on('set-unsaved-changes', (event, hasChanges) => {
  hasUnsavedChanges = hasChanges;
});