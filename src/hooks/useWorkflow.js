import { useState, useEffect } from 'react';
import { parseWorkflow } from '../utils/workflowParser.js';

export const useWorkflow = () => {
  const [workflow, setWorkflow] = useState(null);
  const [tree, setTree] = useState({});
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    window.electronAPI.setUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges]);

  const loadWorkflow = (json, path) => {
    try {
      setWorkflow(json);
      setTree(parseWorkflow(json));
      setCurrentFilePath(path);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      return false;
    }
  };

  const updateWorkflow = (newWorkflow) => {
    setWorkflow(newWorkflow);
    setTree(parseWorkflow(newWorkflow));
    setHasUnsavedChanges(true);
  };

  return {
    workflow,
    tree,
    currentFilePath,
    hasUnsavedChanges,
    loadWorkflow,
    updateWorkflow,
    setCurrentFilePath,
    setHasUnsavedChanges
  };
};