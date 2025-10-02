export class N8nApi {
  constructor(baseUrl, apiKey) {
    if (!baseUrl || !apiKey) {
      throw new Error('Base URL and API Key are required');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    try {
      const result = await window.electronAPI.n8nApiRequest({
        url,
        method: options.method || 'GET',
        body: options.body || null,
        apiKey: this.apiKey
      });

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;
    } catch (error) {
      throw new Error(`N8N API Error: ${error.message}`);
    }
  }

  cleanWorkflowForUpdate(workflow) {
    if (!workflow || !workflow.nodes) {
      throw new Error('Invalid workflow structure');
    }

    const cleanedNodes = workflow.nodes.map(node => {
      const cleanNode = {
        parameters: node.parameters || {},
        type: node.type,
        typeVersion: node.typeVersion || 1,
        position: node.position || [0, 0],
        id: node.id,
        name: node.name
      };

      if (node.webhookId) cleanNode.webhookId = node.webhookId;
      if (node.credentials) cleanNode.credentials = node.credentials;

      return cleanNode;
    });

    return {
      name: workflow.name || 'Untitled Workflow',
      nodes: cleanedNodes,
      connections: workflow.connections || {},
      settings: workflow.settings || {}
    };
  }

  async testConnection() {
    try {
      await this.getWorkflows();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getWorkflows() {
    return this.request('/workflows');
  }

  async getWorkflow(id) {
    if (!id) throw new Error('Workflow ID is required');
    return this.request(`/workflows/${id}`);
  }

  async updateWorkflow(id, workflow) {
    if (!id) throw new Error('Workflow ID is required');
    const cleanedWorkflow = this.cleanWorkflowForUpdate(workflow);
    return this.request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedWorkflow),
    });
  }

  async createWorkflow(workflow) {
    const cleanedWorkflow = this.cleanWorkflowForUpdate(workflow);
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(cleanedWorkflow),
    });
  }

  async deleteWorkflow(id) {
    if (!id) throw new Error('Workflow ID is required');
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async activateWorkflow(id) {
    if (!id) throw new Error('Workflow ID is required');
    return this.request(`/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(id) {
    if (!id) throw new Error('Workflow ID is required');
    return this.request(`/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }
}