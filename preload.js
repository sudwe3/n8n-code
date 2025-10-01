const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content, path) => ipcRenderer.invoke('save-file', content, path),
  setUnsavedChanges: (hasChanges) => ipcRenderer.send('set-unsaved-changes', hasChanges),
  readDroppedFile: (filePath) => ipcRenderer.invoke('read-dropped-file', filePath),
  onFileDropped: (callback) => ipcRenderer.on('file-dropped', (event, data) => callback(data))
});