export class N8nApi {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
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
  }

  cleanWorkflowForUpdate(workflow) {
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
      name: workflow.name,
      nodes: cleanedNodes,
      connections: workflow.connections || {},
      settings: {}
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
    return this.request(`/workflows/${id}`);
  }

  async updateWorkflow(id, workflow) {
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
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async activateWorkflow(id) {
    return this.request(`/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(id) {
    return this.request(`/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }
}