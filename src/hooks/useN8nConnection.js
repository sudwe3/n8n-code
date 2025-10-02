import { useState, useEffect, useCallback } from 'react';
import { N8nApi } from '../utils/n8nApi.js';

export const useN8nConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [n8nApi, setN8nApi] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = async () => {
    try {
      const result = await window.electronAPI.loadN8nConfig();
      if (result.success && result.data) {
        const { baseUrl, apiKey } = result.data;
        const api = new N8nApi(baseUrl, apiKey);
        setN8nApi(api);
        await testConnection(api);
      }
    } catch (err) {
      console.error('Error loading saved config:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const testConnection = async (api) => {
    if (!api) return false;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.testConnection();
      if (result.success) {
        setIsConnected(true);
        await loadWorkflows(api);
        return true;
      } else {
        setIsConnected(false);
        setError(result.error);
        return false;
      }
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const connect = async (baseUrl, apiKey) => {
    if (!baseUrl || !apiKey) {
      return { success: false, error: 'Base URL and API Key are required' };
    }

    const api = new N8nApi(baseUrl, apiKey);
    setN8nApi(api);
    
    const success = await testConnection(api);
    
    if (success) {
      await window.electronAPI.saveN8nConfig({ baseUrl, apiKey });
      return { success: true };
    }
    
    return { success: false, error };
  };

  const disconnect = async () => {
    try {
      await window.electronAPI.deleteN8nConfig();
      setIsConnected(false);
      setN8nApi(null);
      setWorkflows([]);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  const loadWorkflows = useCallback(async (api = n8nApi) => {
    if (!api) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWorkflows();
      setWorkflows(data.data || data || []);
    } catch (err) {
      setError(err.message);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [n8nApi]);

  const getWorkflow = async (id) => {
    if (!n8nApi) throw new Error('Not connected to n8n');
    return n8nApi.getWorkflow(id);
  };

  const updateWorkflow = async (id, workflow) => {
    if (!n8nApi) throw new Error('Not connected to n8n');
    const result = await n8nApi.updateWorkflow(id, workflow);
    await loadWorkflows();
    return result;
  };

  const createWorkflow = async (workflow) => {
    if (!n8nApi) throw new Error('Not connected to n8n');
    const result = await n8nApi.createWorkflow(workflow);
    await loadWorkflows();
    return result;
  };

  const deleteWorkflow = async (id) => {
    if (!n8nApi) throw new Error('Not connected to n8n');
    await n8nApi.deleteWorkflow(id);
    await loadWorkflows();
  };

  return {
    isConnected,
    workflows,
    loading,
    error,
    connect,
    disconnect,
    loadWorkflows,
    getWorkflow,
    updateWorkflow,
    createWorkflow,
    deleteWorkflow,
  };
};