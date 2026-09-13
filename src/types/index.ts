export type NodeType = 'trigger' | 'ai' | 'logic' | 'action';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  subType: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  icon: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  conditionBranch?: 'true' | 'false' | 'default';
  animated?: boolean;
}

export interface WorkflowVersion {
  version: number;
  createdAt: string;
  changelog?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Workflow {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  successRate: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags: string[];
  organizationId?: string;
  version?: number;
  versions?: WorkflowVersion[];
  webhookUrl?: string;
}

export type ExecutionStatus = 'success' | 'running' | 'failed' | 'waiting' | 'not_connected' | 'skipped';

export interface NodeExecutionTrace {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number;
  input: Record<string, any>;
  output: Record<string, any>;
  error?: string;
  retries?: number;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerType: string;
  status: ExecutionStatus;
  mode?: 'test' | 'production';
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  traces: NodeExecutionTrace[];
  inputPayload: Record<string, any>;
  outputPayload?: Record<string, any>;
  errorMessage?: string;
}

export interface InboundWebhookEvent {
  id: string;
  workflowId: string;
  source: string;
  receivedAt: string;
  payload: Record<string, any>;
  headers?: Record<string, any>;
  executionId?: string;
  status: 'received' | 'processed' | 'completed_with_warnings' | 'failed' | 'ignored';
}

export interface AIAgent {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatar: string;
  description: string;
  descriptionAr: string;
  systemPrompt: string;
  goal: string;
  model: string;
  temperature: number;
  maxTokens: number;
  allowedTools: string[];
  knowledgeBaseIds: string[];
  status: 'active' | 'training' | 'idle';
  conversationsCount: number;
  totalTokensUsed: number;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'proposal_sent' | 'won' | 'lost';

export interface CustomerLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  stage?: LeadStatus;
  status?: LeadStatus;
  stageAr?: string;
  sentimentScore?: 'positive' | 'neutral' | 'negative';
  sentimentNote?: string;
  notes?: string;
  createdAt: string;
  lastActivity?: string;
  linkedWorkflows?: string[];
  tags: string[];
  value?: number;
  score?: number;
  budget?: number;
  assignedAgentId?: string;
  activityHistory?: Array<{
    id: string;
    timestamp: string;
    action: string;
    description: string;
  }>;
}

export interface SmartForm {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: 'lead' | 'contact' | 'survey' | 'order' | 'registration';
  linkedWorkflowId: string;
  fields: {
    id: string;
    label: string;
    labelAr: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'number';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  submissionsCount: number;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface IntegrationService {
  id: string;
  name: string;
  nameAr?: string;
  category: 'messaging' | 'crm' | 'productivity' | 'automation';
  icon: string;
  connected: boolean;
  statusText: string;
  statusTextAr: string;
  description: string;
  descriptionAr: string;
  authType: 'api_key' | 'oauth' | 'webhook';
  config?: Record<string, any>;
  hasCredentials?: boolean;
  maskedCredentials?: Record<string, string>;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'url' | 'text';
  size: string;
  tokensCount: number;
  chunksCount: number;
  status: 'ready' | 'vectorizing' | 'error';
  assignedAgents: string[];
  lastUpdated: string;
  summary: string;
  summaryAr: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  roleAr: string;
  avatar: string;
  status: 'active' | 'invited';
  lastActive: string;
  department?: string;
  joinedAt?: string;
  assignedWorkflows?: string[];
  permissions?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  membersCount: number;
  workflowsCount: number;
  isCurrent?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'error' | 'success' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
  workflowId?: string;
}

export interface AnalyticsSummary {
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  averageLatencyMs: number;
  aiTokensConsumed: number;
  activeWorkflows: number;
  totalLeadsGenerated: number;
  conversionRate: number;
  dailyStats: {
    date: string;
    executions: number;
    success: number;
    failed: number;
    aiCalls: number;
  }[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  nameAr?: string;
  price?: number;
  priceMonthly: number;
  priceAnnual: number;
  maxExecutionsPerMonth: number;
  description: string;
  descriptionAr: string;
  features: string[];
}

export interface Organization {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  planId: string;
  planName: string;
  membersCount: number;
  createdAt: string;
  apiKey: string;
  webhookSecret: string;
  billingEmail: string;
  status: 'active' | 'trial' | 'suspended';
}

export interface TenantUsage {
  organizationId: string;
  executionsThisMonth: number;
  maxExecutions: number;
  aiTokensThisMonth: number;
  maxAiTokens: number;
  activeWorkflows: number;
  maxWorkflows: number;
  connectedIntegrations: number;
  apiCallsCount: number;
  resetDate: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'super_admin' | 'owner' | 'admin' | 'member' | 'viewer';
  organizationId: string;
  organizations: { id: string; name: string; role: string }[];
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export interface SuperAdminMetrics {
  totalOrganizations: number;
  activeSubscriptions: number;
  totalExecutionsAllTime: number;
  aiTokensAllTime: number;
  systemHealth: 'healthy' | 'degraded' | 'maintenance';
  uptimePercentage: number;
  workerQueueLatencyMs: number;
  failedExecutionsRate: number;
  activeWorkersCount: number;
}

export type CurrentView =
  | 'dashboard'
  | 'builder'
  | 'workflows'
  | 'templates'
  | 'agents'
  | 'crm'
  | 'forms'
  | 'executions'
  | 'integrations'
  | 'knowledge_base'
  | 'knowledge'
  | 'analytics'
  | 'specs_roadmap'
  | 'team'
  | 'settings'
  | 'super_admin';

export type Lead = CustomerLead;
export type Integration = IntegrationService;
export type KnowledgeDocument = KnowledgeDoc;


