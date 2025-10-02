const { ipcMain, dialog, app } = require('electron');
const fs = require('fs').promises;
const { setUnsavedChanges } = require('./window');

function setupIpcHandlers(mainWindow) {
  app.on('open-file', async (event, filePath) => {
    event.preventDefault();
    if (mainWindow && filePath.endsWith('.json')) {
      const content = await fs.readFile(filePath, 'utf-8');
      mainWindow.webContents.send('file-dropped', { content, path: filePath });
      setUnsavedChanges(false);
    }
  });

  ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      try {
        const content = await fs.readFile(result.filePaths[0], 'utf-8');
        setUnsavedChanges(false);
        return { content, path: result.filePaths[0] };
      } catch (err) {
        return { error: err.message };
      }
    }
    return null;
  });

  ipcMain.handle('save-file', async (event, content, filePath) => {
    try {
      if (filePath) {
        await fs.writeFile(filePath, content, 'utf-8');
        setUnsavedChanges(false);
        return { success: true, path: filePath };
      } else {
        const result = await dialog.showSaveDialog(mainWindow, {
          filters: [{ name: 'JSON', extensions: ['json'] }],
          defaultPath: 'workflow.json'
        });
        
        if (!result.canceled && result.filePath) {
          await fs.writeFile(result.filePath, content, 'utf-8');
          setUnsavedChanges(false);
          return { success: true, path: result.filePath };
        }
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('read-dropped-file', async (event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      setUnsavedChanges(false);
      return { content, path: filePath };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.on('set-unsaved-changes', (event, hasChanges) => {
    setUnsavedChanges(hasChanges);
  });
}

module.exports = { setupIpcHandlers };