import { useEffect } from 'react';

export const useFileOperations = (loadWorkflow) => {
  useEffect(() => {
    const handleFileDrop = async (data) => {
      try {
        const json = JSON.parse(data.content);
        const success = loadWorkflow(json, data.path);
        if (!success) {
          alert('Invalid JSON file');
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].path.endsWith('.json')) {
        const result = await window.electronAPI.readDroppedFile(files[0].path);
        if (result && !result.error) {
          try {
            const json = JSON.parse(result.content);
            const success = loadWorkflow(json, result.path);
            if (!success) {
              alert('Invalid JSON file');
            }
          } catch (err) {
            alert('Invalid JSON file');
          }
        } else if (result && result.error) {
          alert('Error reading file: ' + result.error);
        }
      }
    };

    const removeFileDropListener = window.electronAPI.onFileDropped(handleFileDrop);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      removeFileDropListener();
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [loadWorkflow]);

  const handleOpenFile = async () => {
    const result = await window.electronAPI.openFile();
    if (result && !result.error) {
      try {
        const json = JSON.parse(result.content);
        const success = loadWorkflow(json, result.path);
        if (!success) {
          alert('Invalid JSON file');
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    } else if (result && result.error) {
      alert('Error opening file: ' + result.error);
    }
  };

  const handleSaveFile = async (content, filePath) => {
    const result = await window.electronAPI.saveFile(content, filePath);
    if (result && result.success) {
      return result.path;
    } else if (result && result.error) {
      throw new Error(result.error);
    }
    return null;
  };

  const handleExportFile = async (content) => {
    const result = await window.electronAPI.saveFile(content, null);
    if (result && result.success) {
      alert('Exported successfully');
      return result.path;
    } else if (result && result.error) {
      alert('Error exporting: ' + result.error);
    }
    return null;
  };

  return {
    handleOpenFile,
    handleSaveFile,
    handleExportFile
  };
};