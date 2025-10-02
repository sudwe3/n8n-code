import { useState, useEffect } from 'react';
import { N8nApi } from '../utils/n8nApi.js';

export const useN8nConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [n8nApi, setN8nApi] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = async () => {
    const result = await window.electronAPI.loadN8nConfig();
    if (result.success && result.data) {
      const { baseUrl, apiKey } = result.data;
      const api = new N8nApi(baseUrl, apiKey);
      setN8nApi(api);
      await testConnection(api);
    }
  };

  const testConnection = async (api) => {
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
    await window.electronAPI.deleteN8nConfig();
    setIsConnected(false);
    setN8nApi(null);
    setWorkflows([]);
    setError(null);
  };

  const loadWorkflows = async (api = n8nApi) => {
    if (!api) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWorkflows();
      setWorkflows(data.data || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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