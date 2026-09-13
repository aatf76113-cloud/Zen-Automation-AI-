import {
  Workflow,
  ExecutionLog,
  Organization,
  TenantUsage,
  AuthUser,
  AuditLogEntry,
  SuperAdminMetrics,
  IntegrationService,
  InboundWebhookEvent
} from '../types/index';

class ApiClient {
  private currentOrgId: string = typeof window !== 'undefined' ? (localStorage.getItem('zain_current_org_id') || 'org_zain_hq') : 'org_zain_hq';

  public setOrgId(orgId: string) {
    this.currentOrgId = orgId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zain_current_org_id', orgId);
    }
  }

  public getOrgId(): string {
    return this.currentOrgId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('x-organization-id', this.currentOrgId);

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth & Multi-Tenancy
  async getAuthMe(): Promise<{ user: AuthUser; currentOrganization: Organization }> {
    return this.request('/api/auth/me');
  }

  async login(email: string, password?: string): Promise<{ success: boolean; user: AuthUser; organization: Organization; usage: TenantUsage }> {
    const res = await this.request<{ success: boolean; user: AuthUser; organization: Organization; usage: TenantUsage }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.user && res.user.organizationId) {
      this.setOrgId(res.user.organizationId);
    }
    return res;
  }

  async register(name: string, email: string, password?: string, orgName?: string, planId?: string): Promise<{ success: boolean; user: AuthUser; organization: Organization; usage: TenantUsage }> {
    const res = await this.request<{ success: boolean; user: AuthUser; organization: Organization; usage: TenantUsage }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, orgName, planId })
    });
    if (res.user && res.user.organizationId) {
      this.setOrgId(res.user.organizationId);
    }
    return res;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async switchOrganization(organizationId: string): Promise<{ success: boolean; organization: Organization; usage: TenantUsage }> {
    this.setOrgId(organizationId);
    return this.request('/api/auth/switch-org', {
      method: 'POST',
      body: JSON.stringify({ organizationId })
    });
  }

  async getOrganizations(): Promise<{ organizations: Organization[] }> {
    return this.request('/api/organizations');
  }

  async createOrganization(name: string, planId: string = 'starter'): Promise<{ success: boolean; organization: Organization }> {
    const res = await this.request<{ success: boolean; organization: Organization }>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, planId })
    });
    if (res.organization) {
      this.setOrgId(res.organization.id);
    }
    return res;
  }

  async getUsage(): Promise<{ usage: TenantUsage; organization: Organization }> {
    return this.request('/api/usage');
  }

  async changePlan(planId: string): Promise<{ success: boolean; organization: Organization; usage: TenantUsage }> {
    return this.request('/api/billing/change-plan', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  // CRM Leads
  async getLeads(): Promise<{ leads: any[] }> {
    return this.request('/api/crm/leads');
  }

  async createLead(lead: any): Promise<{ success: boolean; lead: any }> {
    return this.request('/api/crm/leads', {
      method: 'POST',
      body: JSON.stringify(lead)
    });
  }

  async updateLead(id: string, updates: any): Promise<{ success: boolean; lead: any }> {
    return this.request(`/api/crm/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLead(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/crm/leads/${id}`, { method: 'DELETE' });
  }

  // Team RBAC
  async getTeamMembers(): Promise<{ members: any[] }> {
    return this.request('/api/team/members');
  }

  async inviteMember(memberData: { name: string; email: string; role: string; department?: string }): Promise<{ success: boolean; member: any }> {
    return this.request('/api/team/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  }

  async updateMemberRole(id: string, role: string): Promise<{ success: boolean }> {
    return this.request(`/api/team/members/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async removeMember(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/team/members/${id}`, { method: 'DELETE' });
  }

  // AI Agents & Chat
  async getAgents(): Promise<{ agents: any[] }> {
    return this.request('/api/agents');
  }

  async saveAgent(agent: any): Promise<{ success: boolean; agent: any }> {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agent)
    });
  }

  async chatWithAgent(agentId: string, message: string, history?: any[]): Promise<{ success: boolean; reply: string; tokensUsed?: number }> {
    return this.request(`/api/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
  }

  // Knowledge Base
  async getKnowledgeDocs(): Promise<{ documents: any[] }> {
    return this.request('/api/knowledge');
  }

  async addKnowledgeDoc(doc: any): Promise<{ success: boolean; document: any }> {
    return this.request('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(doc)
    });
  }

  async deleteKnowledgeDoc(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/knowledge/${id}`, { method: 'DELETE' });
  }

  async queryKnowledge(query: string): Promise<{ success: boolean; results: any[] }> {
    return this.request('/api/knowledge/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // API Keys
  async getApiKeys(): Promise<{ apiKeys: any[] }> {
    return this.request('/api/api-keys');
  }

  async createApiKey(name: string): Promise<{ success: boolean; apiKey: any }> {
    return this.request('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  async deleteApiKey(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/api-keys/${id}`, { method: 'DELETE' });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: any[] }> {
    return this.request('/api/notifications');
  }

  async markNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/api/notifications/mark-read', { method: 'POST' });
  }

  async clearNotifications(): Promise<{ success: boolean }> {
    return this.request('/api/notifications/clear', { method: 'POST' });
  }

  // Workflows
  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    return this.request('/api/workflows');
  }

  async getWorkflow(id: string): Promise<{ workflow: Workflow }> {
    return this.request(`/api/workflows/${id}`);
  }

  async saveWorkflow(
    workflow: Workflow,
    bumpVersion: boolean = false,
    changelog?: string
  ): Promise<{ success: boolean; workflow: Workflow }> {
    return this.request(`/api/workflows/${workflow.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...workflow,
        bumpVersion,
        changelog
      })
    });
  }

  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/workflows/${id}`, { method: 'DELETE' });
  }

  async executeWorkflow(
    workflowId: string,
    payload?: Record<string, any>,
    mode: 'test' | 'production' = 'test'
  ): Promise<{ success: boolean; status?: string; execution: ExecutionLog; error?: string }> {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': this.currentOrgId
        },
        body: JSON.stringify({ payload, mode })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return this.request(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify({ payload, mode })
      });
    }
  }

  async testWorkflowNode(
    workflowId: string,
    node: any,
    input?: any
  ): Promise<{ status: 'success' | 'failed'; output: Record<string, any>; durationMs: number; error?: string }> {
    return this.request(`/api/workflows/${workflowId}/test-node`, {
      method: 'POST',
      body: JSON.stringify({ node, input })
    });
  }

  async rollbackWorkflow(
    workflowId: string,
    version: number
  ): Promise<{ success: boolean; workflow: Workflow }> {
    return this.request(`/api/workflows/${workflowId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  }

  // Webhooks
  async getWebhookSample(workflowId: string): Promise<{
    url: string;
    method: string;
    sampleBody: Record<string, any>;
    curlExample: string;
  }> {
    return this.request(`/api/webhooks/${workflowId}/sample`);
  }

  async triggerWebhookPublic(workflowId: string, payload: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`/api/webhooks/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': this.currentOrgId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else {
        const text = await response.text().catch(() => '');
        data = { error: text || `HTTP Error ${response.status}: ${response.statusText}` };
      }

      if (!response.ok) {
        return {
          ...data,
          success: false,
          httpStatus: response.status,
          status: response.status === 404 ? 'not_found' : response.status === 422 ? 'unprocessable_entity' : 'failed',
          error: data.error || (response.status === 404
            ? `لم يتم العثور على نقطة نهاية Webhook على هذا الخادم (/api/webhooks/${workflowId}) - رمز الاستجابة 404 Not Found. إذا كان هذا على Vercel، تأكد من توفر مسارات Serverless Functions في api/index.ts وعمل Redeploy.`
            : `تعذر معالجة الطلب برمز HTTP ${response.status}`),
          ok: false
        };
      }

      return {
        ...data,
        httpStatus: response.status,
        ok: true
      };
    } catch (netErr: any) {
      return {
        success: false,
        httpStatus: 0,
        status: 'network_error',
        error: `تعذر الاتصال بخادم Webhook: ${netErr.message || 'Network connection failed'}`,
        ok: false
      };
    }
  }

  // Executions
  async getExecutions(workflowId?: string, status?: string): Promise<{ executions: ExecutionLog[] }> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/executions${qs}`);
  }

  // Templates
  async installTemplate(templateId: string): Promise<{ success: boolean; message: string; workflow: Workflow }> {
    return this.request('/api/templates/install', {
      method: 'POST',
      body: JSON.stringify({ templateId })
    });
  }

  // Integrations & Credentials
  async getIntegrations(): Promise<{ integrations: IntegrationService[] }> {
    return this.request('/api/integrations');
  }

  async saveIntegrationCredentials(
    id: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; message: string; integration: IntegrationService }> {
    return this.request(`/api/integrations/${id}/credentials`, {
      method: 'POST',
      body: JSON.stringify({ credentials })
    });
  }

  async disconnectIntegration(
    id: string
  ): Promise<{ success: boolean; message: string; integration: IntegrationService }> {
    return this.request(`/api/integrations/${id}/disconnect`, {
      method: 'POST'
    });
  }

  async testIntegrationConnection(
    id: string,
    credentials?: Record<string, any>
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return this.request(`/api/integrations/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ credentials })
    });
  }

  async toggleIntegration(id: string): Promise<{ success: boolean; integration: IntegrationService }> {
    return this.request(`/api/integrations/${id}/toggle`, {
      method: 'POST'
    });
  }

  async getInboundWebhookEvents(workflowId: string): Promise<{ events: InboundWebhookEvent[] }> {
    return this.request(`/api/webhooks/${workflowId}/inbound-events`);
  }

  // AI Workflow Generation
  async generateWorkflowAI(prompt: string): Promise<{ success: boolean; workflow: any }> {
    return this.request('/api/ai/generate-workflow', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }

  // Super Admin
  async getSuperAdminMetrics(): Promise<{ metrics: SuperAdminMetrics }> {
    return this.request('/api/admin/metrics');
  }

  async getSuperAdminOrganizations(): Promise<{ organizations: any[] }> {
    return this.request('/api/admin/organizations');
  }

  async getSuperAdminAuditLogs(): Promise<{ auditLogs: AuditLogEntry[] }> {
    return this.request('/api/admin/audit-logs');
  }
}

export const api = new ApiClient();
