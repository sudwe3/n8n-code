const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content, path) => ipcRenderer.invoke('save-file', content, path),
  setUnsavedChanges: (hasChanges) => ipcRenderer.send('set-unsaved-changes', hasChanges),
  readDroppedFile: (filePath) => ipcRenderer.invoke('read-dropped-file', filePath),
  
  onFileDropped: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('file-dropped', handler);
    return () => ipcRenderer.removeListener('file-dropped', handler);
  },
  
  // N8N config
  saveN8nConfig: (config) => ipcRenderer.invoke('save-n8n-config', config),
  loadN8nConfig: () => ipcRenderer.invoke('load-n8n-config'),
  deleteN8nConfig: () => ipcRenderer.invoke('delete-n8n-config'),
  
  // N8N API proxy
  n8nApiRequest: (options) => ipcRenderer.invoke('n8n-api-request', options)
});