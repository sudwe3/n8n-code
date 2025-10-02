const { ipcMain, dialog, app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { setUnsavedChanges } = require('./window');

const CONFIG_FILE = path.join(app.getPath('userData'), 'n8n-config.json');

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

  // N8N Config handlers
  ipcMain.handle('save-n8n-config', async (event, config) => {
    try {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config), 'utf-8');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('load-n8n-config', async () => {
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf-8');
      return { success: true, data: JSON.parse(content) };
    } catch (err) {
      return { success: false };
    }
  });

  ipcMain.handle('delete-n8n-config', async () => {
    try {
      await fs.unlink(CONFIG_FILE);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // N8N API proxy
  ipcMain.handle('n8n-api-request', async (event, { url, method, body, apiKey }) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method || 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        }
      };

      if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const req = lib.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve({ success: true, data: JSON.parse(data) });
            } catch (err) {
              resolve({ success: true, data: data });
            }
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
      
      if (body) {
        req.write(body);
      }

      req.end();
    });
  });
}

module.exports = { setupIpcHandlers };