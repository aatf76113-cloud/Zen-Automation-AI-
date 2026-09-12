import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  AIAgent,
  CustomerLead,
  SmartForm,
  IntegrationService,
  KnowledgeDoc,
  TeamMember,
  Workspace,
  AppNotification,
  ExecutionLog,
  AnalyticsSummary,
  Organization,
  TenantUsage,
  AuthUser,
  CurrentView
} from '../types';
export type { CurrentView };
import { api } from '../services/api';
import {
  INITIAL_WORKFLOWS,
  INITIAL_AGENTS,
  INITIAL_LEADS,
  INITIAL_SMART_FORMS,
  INITIAL_INTEGRATIONS,
  INITIAL_EXECUTIONS,
  INITIAL_KNOWLEDGE,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANALYTICS,
  INITIAL_TEAM,
  WORKSPACES_LIST
} from '../data/mockData';

interface AppContextType {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  setCurrentWorkspace: (ws: Workspace) => void;
  
  // Workflows
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  setSelectedWorkflow: (wf: Workflow | null) => void;
  saveWorkflow: (wf: Workflow) => void;
  toggleWorkflowStatus: (id: string) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  loadWorkflowToBuilder: (wf: Workflow) => void;
  createNewWorkflow: (name?: string, nameAr?: string) => void;
  
  // Builder Active State
  builderNodes: WorkflowNode[];
  builderEdges: WorkflowEdge[];
  setBuilderNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setBuilderEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // Agents
  agents: AIAgent[];
  saveAgent: (agent: AIAgent) => void;
  
  // CRM Leads
  leads: CustomerLead[];
  addLead: (lead: Omit<CustomerLead, 'id' | 'createdAt'> | any) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<CustomerLead> | any) => Promise<void>;
  updateLeadStage: (leadId: string, newStage: CustomerLead['stage']) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  
  // Forms
  forms: SmartForm[];
  submitForm: (formId: string, data: Record<string, any>) => void;
  
  // Integrations & Credentials
  integrations: IntegrationService[];
  toggleIntegration: (id: string) => void;
  saveIntegrationCredentials: (id: string, credentials: Record<string, any>) => Promise<boolean>;
  disconnectIntegration: (id: string) => Promise<boolean>;
  testIntegrationConnection: (id: string, credentials?: Record<string, any>) => Promise<{ success: boolean; message: string; latencyMs: number }>;
  refreshIntegrations: () => Promise<void>;
  
  // Executions
  executions: ExecutionLog[];
  runWorkflowSimulation: (workflowId: string, customPayload?: Record<string, any>, mode?: 'test' | 'production') => Promise<ExecutionLog>;
  triggerInboundWebhook: (workflowId: string, payload: Record<string, any>) => Promise<any>;
  
  // SaaS Multi-Tenancy & Subscriptions
  currentUser: AuthUser | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  tenantUsage: TenantUsage | null;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string, planId?: string) => Promise<Organization | null>;
  installTemplate: (templateId: string) => Promise<Workflow | null>;
  testNodeExecution: (node: WorkflowNode, input?: any) => Promise<{ status: 'success' | 'failed'; output: any; durationMs: number; error?: string }>;
  rollbackWorkflowVersion: (version: number) => Promise<void>;
  refreshTenantData: () => Promise<void>;

  // Knowledge
  knowledgeDocs: KnowledgeDoc[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDoc, 'id' | 'lastUpdated'>) => void;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Analytics
  analytics: AnalyticsSummary;
  
  // Team
  team: TeamMember[];
  
  // Quick AI Assistant
  isAiCopilotOpen: boolean;
  setIsAiCopilotOpen: (open: boolean) => void;

  // Mobile Navigation
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Helpers
  t: (arText: string, enText: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('zain_lang') as 'ar' | 'en') || 'ar';
  });
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('zain_theme') as 'dark' | 'light') || 'dark';
  });

  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES_LIST);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(WORKSPACES_LIST[0]);

  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    try {
      const saved = localStorage.getItem('zain_workflows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse zain_workflows from localStorage:', e);
    }
    return INITIAL_WORKFLOWS;
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(() => INITIAL_WORKFLOWS[0]);
  const [builderNodes, setBuilderNodes] = useState<WorkflowNode[]>(() => INITIAL_WORKFLOWS[0]?.nodes || []);
  const [builderEdges, setBuilderEdges] = useState<WorkflowEdge[]>(() => INITIAL_WORKFLOWS[0]?.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [agents, setAgents] = useState<AIAgent[]>(() => {
    try {
      const saved = localStorage.getItem('zain_agents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse zain_agents from localStorage:', e);
    }
    return INITIAL_AGENTS;
  });

  const [leads, setLeads] = useState<CustomerLead[]>(() => {
    try {
      const saved = localStorage.getItem('zain_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse zain_leads from localStorage:', e);
    }
    return INITIAL_LEADS;
  });

  const [forms, setForms] = useState<SmartForm[]>(() => {
    try {
      const saved = localStorage.getItem('zain_forms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse zain_forms from localStorage:', e);
    }
    return INITIAL_SMART_FORMS;
  });

  const [integrations, setIntegrations] = useState<IntegrationService[]>(INITIAL_INTEGRATIONS);
  const [executions, setExecutions] = useState<ExecutionLog[]>(() => {
    try {
      const saved = localStorage.getItem('zain_executions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse zain_executions from localStorage:', e);
    }
    return INITIAL_EXECUTIONS;
  });

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(INITIAL_KNOWLEDGE);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);
  const [team] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  // Multi-Tenant SaaS State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tenantUsage, setTenantUsage] = useState<TenantUsage | null>(null);

  // Sync HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('zain_lang', language);
  }, [language]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zain_theme', theme);
  }, [theme]);

  // Initial Multi-Tenant Data Fetch from Backend
  const refreshTenantData = async () => {
    try {
      const auth = await api.getAuthMe();
      if (auth.user) setCurrentUser(auth.user);
      if (auth.currentOrganization) setCurrentOrganization(auth.currentOrganization);

      const [orgsRes, usageRes, wfsRes, execsRes, leadsRes, agentsRes, notifsRes] = await Promise.all([
        api.getOrganizations(),
        api.getUsage(),
        api.getWorkflows(),
        api.getExecutions(),
        api.getLeads(),
        api.getAgents(),
        api.getNotifications()
      ]);

      if (orgsRes.organizations) setOrganizations(orgsRes.organizations);
      if (usageRes.usage) setTenantUsage(usageRes.usage);
      if (wfsRes.workflows && wfsRes.workflows.length > 0) {
        setWorkflows(wfsRes.workflows);
        localStorage.setItem('zain_workflows', JSON.stringify(wfsRes.workflows));
        if (!selectedWorkflow || !wfsRes.workflows.some((w) => w.id === selectedWorkflow.id)) {
          setSelectedWorkflow(wfsRes.workflows[0]);
          setBuilderNodes(wfsRes.workflows[0].nodes);
          setBuilderEdges(wfsRes.workflows[0].edges);
        }
      }
      if (execsRes.executions) {
        setExecutions(execsRes.executions);
        localStorage.setItem('zain_executions', JSON.stringify(execsRes.executions));
      }
      if (leadsRes.leads) {
        setLeads(leadsRes.leads);
        localStorage.setItem('zain_leads', JSON.stringify(leadsRes.leads));
      }
      if (agentsRes.agents) {
        setAgents(agentsRes.agents);
        localStorage.setItem('zain_agents', JSON.stringify(agentsRes.agents));
      }
      if (notifsRes.notifications) {
        setNotifications(notifsRes.notifications);
      }
    } catch (e) {
      console.warn('Backend sync info (using local cache if starting):', e);
    }
  };

  useEffect(() => {
    refreshTenantData();
  }, []);

  const switchOrganization = async (orgId: string) => {
    try {
      const res = await api.switchOrganization(orgId);
      if (res.success) {
        setCurrentOrganization(res.organization);
        setTenantUsage(res.usage);
        const [wfs, execs, leadsRes, agentsRes, notifsRes] = await Promise.all([
          api.getWorkflows(),
          api.getExecutions(),
          api.getLeads(),
          api.getAgents(),
          api.getNotifications()
        ]);
        if (wfs.workflows) {
          setWorkflows(wfs.workflows);
          localStorage.setItem('zain_workflows', JSON.stringify(wfs.workflows));
          if (wfs.workflows.length > 0) {
            loadWorkflowToBuilder(wfs.workflows[0]);
          }
        }
        if (execs.executions) {
          setExecutions(execs.executions);
          localStorage.setItem('zain_executions', JSON.stringify(execs.executions));
        }
        if (leadsRes.leads) {
          setLeads(leadsRes.leads);
          localStorage.setItem('zain_leads', JSON.stringify(leadsRes.leads));
        }
        if (agentsRes.agents) {
          setAgents(agentsRes.agents);
          localStorage.setItem('zain_agents', JSON.stringify(agentsRes.agents));
        }
        if (notifsRes.notifications) {
          setNotifications(notifsRes.notifications);
        }

        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: 'تم تبديل المؤسسة',
          titleAr: 'تم تبديل المؤسسة',
          message: `أنت الآن في مساحة عمل: ${res.organization.name}`,
          messageAr: `أنت الآن في مساحة عمل: ${res.organization.nameAr || res.organization.name}`,
          type: 'info',
          timestamp: 'الآن',
          read: false
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } catch (err: any) {
      console.error('Failed to switch org:', err);
    }
  };

  const createOrganization = async (name: string, planId: string = 'starter') => {
    try {
      const res = await api.createOrganization(name, planId);
      if (res.organization) {
        setOrganizations((prev) => [...prev, res.organization]);
        await switchOrganization(res.organization.id);
        return res.organization;
      }
      return null;
    } catch (err) {
      console.error('Failed to create org:', err);
      return null;
    }
  };

  const installTemplate = async (templateId: string): Promise<Workflow | null> => {
    try {
      const res = await api.installTemplate(templateId);
      if (res.success && res.workflow) {
        setWorkflows((prev) => [res.workflow, ...prev]);
        loadWorkflowToBuilder(res.workflow);
        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: 'تم تثبيت القالب',
          titleAr: 'تم تثبيت القالب',
          message: res.message,
          messageAr: res.message,
          type: 'success',
          timestamp: 'الآن',
          read: false
        };
        setNotifications((prev) => [newNotif, ...prev]);
        return res.workflow;
      }
    } catch (err) {
      console.error('Failed to install template:', err);
    }
    return null;
  };

  const testNodeExecution = async (node: WorkflowNode, input?: any) => {
    const wfId = selectedWorkflow?.id || 'wf_current';
    return api.testWorkflowNode(wfId, node, input);
  };

  const rollbackWorkflowVersion = async (version: number) => {
    if (!selectedWorkflow) return;
    try {
      const res = await api.rollbackWorkflow(selectedWorkflow.id, version);
      if (res.workflow) {
        saveWorkflow(res.workflow);
        loadWorkflowToBuilder(res.workflow);
      }
    } catch (err) {
      console.error('Failed to rollback:', err);
    }
  };

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = (arText: string, enText: string) => {
    return language === 'ar' ? arText : enText;
  };

  const saveWorkflow = async (wf: Workflow) => {
    setWorkflows((prev) => {
      const idx = prev.findIndex((item) => item.id === wf.id);
      let updated: Workflow[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...wf, updatedAt: new Date().toISOString().split('T')[0] };
      } else {
        updated = [wf, ...prev];
      }
      localStorage.setItem('zain_workflows', JSON.stringify(updated));
      return updated;
    });
    setSelectedWorkflow(wf);

    try {
      const res = await api.saveWorkflow(wf);
      if (res.success && res.workflow) {
        setWorkflows((prev) => {
          const updated = prev.map((w) => (w.id === wf.id ? res.workflow : w));
          localStorage.setItem('zain_workflows', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend saveWorkflow error:', err);
    }
  };

  const toggleWorkflowStatus = async (id: string) => {
    const wf = workflows.find((w) => w.id === id);
    if (!wf) return;
    const nextActive = !wf.isActive;
    setWorkflows((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, isActive: nextActive } : w));
      localStorage.setItem('zain_workflows', JSON.stringify(updated));
      return updated;
    });
    try {
      await api.saveWorkflow({ ...wf, isActive: nextActive });
      api.getUsage().then((u) => { if (u.usage) setTenantUsage(u.usage); }).catch(() => {});
    } catch (err) {
      console.warn('Backend toggleWorkflowStatus error:', err);
    }
  };

  const deleteWorkflow = async (id: string) => {
    setWorkflows((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      localStorage.setItem('zain_workflows', JSON.stringify(updated));
      return updated;
    });
    if (selectedWorkflow?.id === id) {
      const remaining = workflows.filter((w) => w.id !== id);
      if (remaining.length > 0) {
        loadWorkflowToBuilder(remaining[0]);
      }
    }
    try {
      await api.deleteWorkflow(id);
      api.getUsage().then((u) => { if (u.usage) setTenantUsage(u.usage); }).catch(() => {});
    } catch (err) {
      console.warn('Backend deleteWorkflow error:', err);
    }
  };

  const duplicateWorkflow = (id: string) => {
    const existing = workflows.find((w) => w.id === id);
    if (!existing) return;
    const newWf: Workflow = {
      ...existing,
      id: `wf_${Date.now()}`,
      name: `${existing.name} (Copy)`,
      nameAr: `${existing.nameAr} (نسخة)`,
      createdAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      nodes: existing.nodes.map((n) => ({ ...n, id: `${n.id}_copy` })),
      edges: existing.edges.map((e) => ({
        ...e,
        id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        source: `${e.source}_copy`,
        target: `${e.target}_copy`
      }))
    };
    saveWorkflow(newWf);
  };

  const loadWorkflowToBuilder = (wf?: Workflow | null) => {
    let targetWf = wf;
    if (!targetWf) {
      targetWf = (workflows && workflows.length > 0) ? workflows[0] : null;
    }
    if (targetWf) {
      setSelectedWorkflow(targetWf);
      setBuilderNodes(targetWf.nodes || []);
      setBuilderEdges(targetWf.edges || []);
    }
    setSelectedNodeId(null);
    setCurrentView('builder');
  };

  const createNewWorkflow = (name = 'New Automation Flow', nameAr = 'مسار أتمتة متكامل جديد') => {
    const wfId = `wf_${Date.now()}`;
    const newWf: Workflow = {
      id: wfId,
      name,
      nameAr,
      description: 'Production-ready 7-node pipeline: Webhook -> AI -> Condition -> CRM -> WhatsApp -> Notification -> Email.',
      descriptionAr: 'مسار عمل إنتاجي متكامل من 7 عقد: ويب هوك -> ذكاء اصطناعي -> شرط -> إدارة العملاء CRM -> واتساب -> إشعار فوري -> بريد إلكتروني.',
      isActive: true,
      category: 'Sales',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      successRate: 100,
      tags: ['Production', 'Webhook', 'AI', 'CRM', 'WhatsApp', 'Email'],
      nodes: [
        {
          id: 'node_1',
          type: 'trigger',
          subType: 'webhook',
          name: 'Webhook Inbound Receiver',
          nameAr: 'مستقبل Webhook للعملاء',
          description: 'Receive real HTTP webhook POST payload',
          descriptionAr: 'استقبال الـ Payload الحقيقي عبر رابط Webhook',
          position: { x: 50, y: 150 },
          config: { path: `/api/webhooks/${wfId}`, method: 'POST' },
          icon: 'Webhook'
        },
        {
          id: 'node_2',
          type: 'ai',
          subType: 'ai_agent',
          name: 'AI Sales Qualification Agent',
          nameAr: 'وكيل المبيعات والتأهيل الذكي',
          description: 'Analyze inbound inquiry and qualify buyer intent',
          descriptionAr: 'تحليل الرسالة الواردة وتأهيل العميل بالذكاء الاصطناعي',
          position: { x: 320, y: 150 },
          config: {
            agentName: 'سارة - وكيل المبيعات الذكي',
            model: 'moonshotai/kimi-k3',
            provider: 'nvidia'
          },
          icon: 'Bot'
        },
        {
          id: 'node_3',
          type: 'logic',
          subType: 'condition',
          name: 'High Intent Lead Router',
          nameAr: 'موجّه تقييم العميل (شرط)',
          description: 'Route based on AI lead qualification score >= 70',
          descriptionAr: 'توجيه المسار إذا كانت نقاط العميل >= 70',
          position: { x: 600, y: 150 },
          config: {
            field: 'leadScore',
            operator: '>=',
            value: 70
          },
          icon: 'GitBranch'
        },
        {
          id: 'node_4',
          type: 'action',
          subType: 'crm_create_lead',
          name: 'CRM Create / Update Lead',
          nameAr: 'إنشاء وحفظ العميل في CRM',
          description: 'Persist qualified customer lead into tenant CRM database',
          descriptionAr: 'حفظ جهة الاتصال والبيانات فعلياً في قاعدة الـ CRM',
          position: { x: 880, y: 150 },
          config: { stage: 'qualified' },
          icon: 'UserPlus'
        },
        {
          id: 'node_5',
          type: 'action',
          subType: 'send_whatsapp',
          name: 'WhatsApp Cloud Follow-up',
          nameAr: 'إرسال رد عبر واتساب للأعمال',
          description: 'Send personalized WhatsApp message via Cloud API',
          descriptionAr: 'إرسال رد فوري عبر WhatsApp Cloud API',
          position: { x: 1160, y: 150 },
          config: { provider: 'whatsapp' },
          icon: 'MessageSquare'
        },
        {
          id: 'node_6',
          type: 'action',
          subType: 'send_notification',
          name: 'In-App System Notification',
          nameAr: 'إشعار فوري في النظام',
          description: 'Dispatch real-time in-app notification to staff',
          descriptionAr: 'إرسال إشعار لحظي في لوحة التحكم وتنبيه الفريق',
          position: { x: 1440, y: 150 },
          config: { title: 'عميل جديد مؤهل عبر Webhook' },
          icon: 'Bell'
        },
        {
          id: 'node_7',
          type: 'action',
          subType: 'send_email',
          name: 'Confirmation Email Dispatcher',
          nameAr: 'إرسال بريد التأكيد الإلكتروني',
          description: 'Send official confirmation email via SMTP/Resend',
          descriptionAr: 'إرسال بريد إلكتروني تأكيدي رسمي',
          position: { x: 1720, y: 150 },
          config: { provider: 'email' },
          icon: 'Mail'
        }
      ],
      edges: [
        { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
        { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
        { id: 'e3-4', source: 'node_3', target: 'node_4', label: 'مؤهل (Score >= 70)', conditionBranch: 'true', animated: true },
        { id: 'e4-5', source: 'node_4', target: 'node_5', animated: true },
        { id: 'e5-6', source: 'node_5', target: 'node_6', animated: true },
        { id: 'e6-7', source: 'node_6', target: 'node_7', animated: true }
      ]
    };
    saveWorkflow(newWf);
    loadWorkflowToBuilder(newWf);
  };

  const saveAgent = (agent: AIAgent) => {
    setAgents((prev) => {
      const idx = prev.findIndex((a) => a.id === agent.id);
      let updated: AIAgent[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = agent;
      } else {
        updated = [agent, ...prev];
      }
      localStorage.setItem('zain_agents', JSON.stringify(updated));
      return updated;
    });
  };

  const addLead = async (leadData: Omit<CustomerLead, 'id' | 'createdAt'> | any) => {
    const tempId = leadData.id || `lead_${Date.now()}`;
    const newLead: CustomerLead = {
      ...leadData,
      id: tempId,
      status: leadData.status || leadData.stage || 'new',
      stage: leadData.stage || leadData.status || 'new',
      createdAt: leadData.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      localStorage.setItem('zain_leads', JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await api.createLead(leadData);
      if (res.success && res.lead) {
        setLeads((prev) => {
          const updated = prev.map((l) => (l.id === tempId ? res.lead : l));
          localStorage.setItem('zain_leads', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend createLead error, maintained local copy:', err);
    }
  };

  const updateLeadStage = async (leadId: string, newStage: CustomerLead['stage']) => {
    const stageMap: Record<CustomerLead['stage'] & string, string> = {
      new: 'عميل جديد',
      contacted: 'تم التواصل',
      qualified: 'مؤهل للشراء',
      proposal: 'تقديم العرض',
      proposal_sent: 'تقديم العرض',
      won: 'تم الإغلاق بنجاح',
      lost: 'صفقة ملغاة'
    };
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === leadId ? { ...l, stage: newStage, status: newStage, stageAr: stageMap[newStage as any] || newStage, lastActivity: 'تم تحديث المرحلة' } : l
      );
      localStorage.setItem('zain_leads', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.updateLead(leadId, { status: newStage, stage: newStage, stageAr: stageMap[newStage as any] });
    } catch (err) {
      console.warn('Backend updateLeadStage error:', err);
    }
  };

  const updateLead = async (leadId: string, updates: Partial<CustomerLead> | any) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l));
      localStorage.setItem('zain_leads', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.updateLead(leadId, updates);
    } catch (err) {
      console.warn('Backend updateLead error:', err);
    }
  };

  const deleteLead = async (leadId: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== leadId);
      localStorage.setItem('zain_leads', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.deleteLead(leadId);
    } catch (err) {
      console.warn('Backend deleteLead error:', err);
    }
  };

  const refreshIntegrations = async () => {
    try {
      const res = await api.getIntegrations();
      if (res.integrations) {
        setIntegrations(res.integrations);
      }
    } catch (e) {
      console.warn('Failed to refresh integrations:', e);
    }
  };

  const saveIntegrationCredentials = async (id: string, credentials: Record<string, any>): Promise<boolean> => {
    try {
      const res = await api.saveIntegrationCredentials(id, credentials);
      if (res.success && res.integration) {
        setIntegrations((prev) => prev.map((item) => (item.id === id ? res.integration : item)));
        const notif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: 'تم ربط بيانات الاعتماد',
          titleAr: 'تم ربط بيانات الاعتماد',
          message: res.message || `تم حفظ بيانات اعتماد ${res.integration.nameAr || res.integration.name} بنجاح`,
          messageAr: res.message || `تم حفظ بيانات اعتماد ${res.integration.nameAr || res.integration.name} بنجاح`,
          type: 'success',
          timestamp: 'الآن',
          read: false
        };
        setNotifications((prev) => [notif, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save integration credentials:', err);
      return false;
    }
  };

  const disconnectIntegration = async (id: string): Promise<boolean> => {
    try {
      const res = await api.disconnectIntegration(id);
      if (res.success && res.integration) {
        setIntegrations((prev) => prev.map((item) => (item.id === id ? res.integration : item)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      return false;
    }
  };

  const testIntegrationConnection = async (id: string, credentials?: Record<string, any>) => {
    return api.testIntegrationConnection(id, credentials);
  };

  const triggerInboundWebhook = async (workflowId: string, payload: Record<string, any>) => {
    const res = await api.triggerWebhookPublic(workflowId, payload);
    // Refresh leads, executions, notifications, usage
    api.getExecutions().then((e) => { if (e.executions) setExecutions(e.executions); }).catch(() => {});
    api.getLeads().then((l) => { if (l.leads) setLeads(l.leads); }).catch(() => {});
    api.getNotifications().then((n) => { if (n.notifications) setNotifications(n.notifications); }).catch(() => {});
    api.getUsage().then((u) => { if (u.usage) setTenantUsage(u.usage); }).catch(() => {});
    return res;
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              connected: !item.connected,
              statusText: !item.connected ? 'Connected' : 'Disconnected',
              statusTextAr: !item.connected ? 'متصل بنجاح' : 'غير متصل'
            }
          : item
      )
    );
  };

  const submitForm = (formId: string, data: Record<string, any>) => {
    // 1. Update submissions count
    setForms((prev) =>
      prev.map((f) => (f.id === formId ? { ...f, submissionsCount: f.submissionsCount + 1 } : f))
    );

    // 2. Add lead to CRM
    const newLead: CustomerLead = {
      id: `lead_${Date.now()}`,
      name: data.name || data.fullName || 'زائر الموقع',
      email: data.email || 'lead@example.com',
      phone: data.phone || data.whatsapp || '+966 50 000 0000',
      company: data.company || 'شركة تجريبية',
      source: 'Smart Form Submission',
      stage: 'qualified',
      stageAr: 'مؤهل للشراء',
      sentimentScore: 'positive',
      sentimentNote: 'تم تسجيل العميل عبر النموذج الذكي وجارِ تشغيل الأتمتة المربوطة',
      notes: data.details || data.message || 'استفسار أتمتة عبر النموذج',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastActivity: 'تم تشغيل الـ Workflow بنجاح',
      linkedWorkflows: ['wf_01'],
      tags: ['Form Lead', 'Website'],
      value: 10000
    };
    setLeads((prev) => [newLead, ...prev]);

    // 3. Trigger simulation execution
    const targetForm = forms.find((f) => f.id === formId);
    if (targetForm && targetForm.linkedWorkflowId) {
      runWorkflowSimulation(targetForm.linkedWorkflowId, data);
    }

    // 4. Add notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'استلام نموذج جديد وتشغيل الأتمتة',
      titleAr: 'استلام نموذج جديد وتشغيل الأتمتة',
      message: `Form "${targetForm?.title}" submitted by ${newLead.name}. Workflow triggered.`,
      messageAr: `تم إرسال النموذج بنجاح من "${newLead.name}". مسار الأتمتة يعمل الآن.`,
      type: 'success',
      timestamp: 'الآن',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const runWorkflowSimulation = async (
    workflowId: string,
    customPayload?: Record<string, any>,
    mode: 'test' | 'production' = 'test'
  ): Promise<ExecutionLog> => {
    // 1. Attempt real backend execution engine call
    try {
      const res = await api.executeWorkflow(workflowId, customPayload, mode);
      if (res.execution) {
        setExecutions((prev) => [res.execution, ...prev]);
        setWorkflows((prev) =>
          prev.map((w) =>
            w.id === workflowId
              ? {
                  ...w,
                  executionCount: (w.executionCount || 0) + 1,
                  successRate: res.execution.status === 'success' ? Math.min(100, (w.successRate || 95) + 0.5) : Math.max(50, (w.successRate || 95) - 3)
                }
              : w
          )
        );

        // Sync leads if in production mode (since lead might be created/updated)
        api.getLeads().then((l) => {
          if (l.leads) {
            setLeads(l.leads);
            localStorage.setItem('zain_leads', JSON.stringify(l.leads));
          }
        }).catch(() => {});

        // Update Usage stats
        api.getUsage().then((u) => {
          if (u.usage) setTenantUsage(u.usage);
        }).catch(() => {});

        // Add Notification
        const exec = res.execution;
        const newNotif: AppNotification = {
          id: `notif_${Date.now()}`,
          title: mode === 'production' ? 'تنفيذ مسار العمل بالوضع الإنتاجي' : 'اكتمال محاكاة المسار التجريبي',
          titleAr: mode === 'production' ? 'تنفيذ مسار العمل بالوضع الإنتاجي' : 'اكتمال محاكاة المسار التجريبي',
          message: `المسار [${exec.workflowName}] بنتيجة [${exec.status}] في ${exec.durationMs}ms`,
          messageAr: `المسار [${exec.workflowName}] بنتيجة [${exec.status === 'success' ? 'ناجح' : 'فشل/توقف'}] في ${exec.durationMs}ms`,
          type: exec.status === 'success' ? 'success' : 'error',
          timestamp: 'الآن',
          read: false,
          workflowId
        };
        setNotifications((prev) => [newNotif, ...prev]);

        return exec;
      }
    } catch (err: any) {
      console.warn('Backend execution returned error or fallback:', err);
    }

    // 2. Local fallback if offline
    const wf = workflows.find((w) => w.id === workflowId) || workflows[0];
    const execId = `exec_${Date.now()}`;
    const startTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const payload = customPayload || {
      leadName: 'سلطان القحطاني',
      phone: '+966 50 123 4567',
      email: 'sultan@example.sa',
      message: 'أرغب بالاستفسار عن خطة أوتوميشن المبيعات وتأهيل العملاء'
    };

    // Construct traces for each node in workflow
    const traces = wf.nodes.map((node, index) => {
      return {
        nodeId: node.id,
        nodeName: node.nameAr || node.name,
        nodeType: node.type,
        status: 'success' as const,
        startedAt: `+${index * 250}ms`,
        durationMs: 180 + Math.floor(Math.random() * 240),
        input: { stepIndex: index, subType: node.subType, ...node.config },
        output: {
          success: true,
          processedAt: new Date().toLocaleTimeString(),
          result: node.type === 'ai' ? 'AI intent detected: High Value Prospect (Score 94%)' : 'Step completed successfully'
        }
      };
    });

    const newExec: ExecutionLog = {
      id: execId,
      workflowId: wf.id,
      workflowName: wf.nameAr || wf.name,
      triggerType: wf.nodes[0]?.nameAr || (mode === 'production' ? 'Live Production Run' : 'Manual Trigger'),
      status: 'success',
      mode,
      startedAt: startTime,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      durationMs: 1200 + Math.floor(Math.random() * 600),
      inputPayload: payload,
      outputPayload: {
        status: 'completed',
        nodesExecuted: wf.nodes.length,
        leadQualified: true,
        aiScore: 94
      },
      traces
    };

    setExecutions((prev) => {
      const updated = [newExec, ...prev];
      localStorage.setItem('zain_executions', JSON.stringify(updated));
      return updated;
    });

    // Update workflow stats
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === wf.id ? { ...w, executionCount: w.executionCount + 1 } : w
      )
    );

    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      totalExecutions: prev.totalExecutions + 1,
      aiTokensConsumed: prev.aiTokensConsumed + 650
    }));

    return newExec;
  };

  const addKnowledgeDoc = (docData: Omit<KnowledgeDoc, 'id' | 'lastUpdated'>) => {
    const newDoc: KnowledgeDoc = {
      ...docData,
      id: `kb_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        currentView,
        setCurrentView,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        workflows,
        selectedWorkflow,
        setSelectedWorkflow,
        saveWorkflow,
        toggleWorkflowStatus,
        deleteWorkflow,
        duplicateWorkflow,
        loadWorkflowToBuilder,
        createNewWorkflow,
        builderNodes,
        builderEdges,
        setBuilderNodes,
        setBuilderEdges,
        selectedNodeId,
        setSelectedNodeId,
        agents,
        saveAgent,
        leads,
        addLead,
        updateLead,
        updateLeadStage,
        deleteLead,
        forms,
        submitForm,
        integrations,
        toggleIntegration,
        saveIntegrationCredentials,
        disconnectIntegration,
        testIntegrationConnection,
        refreshIntegrations,
        executions,
        runWorkflowSimulation,
        triggerInboundWebhook,
        knowledgeDocs,
        addKnowledgeDoc,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        analytics,
        team,
        isAiCopilotOpen,
        setIsAiCopilotOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        t,

        // SaaS Multi-Tenancy
        currentUser,
        currentOrganization,
        organizations,
        tenantUsage,
        switchOrganization,
        createOrganization,
        installTemplate,
        testNodeExecution,
        rollbackWorkflowVersion,
        refreshTenantData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
