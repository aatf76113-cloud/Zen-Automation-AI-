import {
  Workflow,
  AIAgent,
  CustomerLead,
  SmartForm,
  IntegrationService,
  KnowledgeDoc,
  TeamMember,
  Workspace,
  AppNotification,
  AnalyticsSummary,
  ExecutionLog,
  NodeType
} from '../types';

export interface NodeDefinition {
  type: NodeType;
  subType: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  categoryColor: string;
  defaultConfig: Record<string, any>;
}

export const AVAILABLE_NODES: NodeDefinition[] = [
  // Triggers
  {
    type: 'trigger',
    subType: 'webhook',
    name: 'Webhook Trigger',
    nameAr: 'مستقبل Webhook',
    description: 'Listen for real-time incoming HTTP POST requests from any external platform',
    descriptionAr: 'استقبال طلبات HTTP POST الفورية من أي منصة أو موقع خارجي',
    icon: 'Webhook',
    categoryColor: 'emerald',
    defaultConfig: { method: 'POST', path: '/webhook/lead-incoming', authRequired: false }
  },
  {
    type: 'trigger',
    subType: 'schedule',
    name: 'Schedule (Cron)',
    nameAr: 'جدولة زمنية (Cron)',
    description: 'Execute workflows periodically (hourly, daily, weekly, or cron syntax)',
    descriptionAr: 'تشغيل المسار آليًا بشكل متكرر كل ساعة أو يوميًا أو بتوقيت محدد',
    icon: 'Clock',
    categoryColor: 'emerald',
    defaultConfig: { frequency: 'daily', time: '09:00', timezone: 'Asia/Riyadh' }
  },
  {
    type: 'trigger',
    subType: 'new_lead',
    name: 'New Lead',
    nameAr: 'عميل محتمل جديد',
    description: 'Triggers when a new lead is captured via forms, ads, or website',
    descriptionAr: 'يتم تفعيله عند وصول عميل محتمل جديد من الإعلانات أو النماذج',
    icon: 'UserPlus',
    categoryColor: 'emerald',
    defaultConfig: { sourceFilter: 'all', minScore: 50 }
  },
  {
    type: 'trigger',
    subType: 'form_submission',
    name: 'Form Submission',
    nameAr: 'إرسال نموذج ذكي',
    description: 'Triggers immediately when a user submits any Zain Smart Form',
    descriptionAr: 'يبدأ فور إرسال الزائر لنموذج مدمج داخل المنصة',
    icon: 'FileText',
    categoryColor: 'emerald',
    defaultConfig: { formId: 'form_lead_gen_01' }
  },
  {
    type: 'trigger',
    subType: 'new_message',
    name: 'New Message (Chat/WhatsApp)',
    nameAr: 'رسالة واردة (واتساب / شات)',
    description: 'Triggers on incoming messages from WhatsApp, Telegram, or Messenger',
    descriptionAr: 'يعمل عند استلام رسالة جديدة عبر واتساب أو تيليجرام أو الموقع',
    icon: 'MessageSquare',
    categoryColor: 'emerald',
    defaultConfig: { channel: 'whatsapp', filterKeywords: [] }
  },
  {
    type: 'trigger',
    subType: 'email_received',
    name: 'Email Received',
    nameAr: 'استلام بريد إلكتروني',
    description: 'Triggers when an email matching rules arrives in connected inbox',
    descriptionAr: 'يعمل فور وصول بريد إلكتروني يطابق الشروط المحددة',
    icon: 'Mail',
    categoryColor: 'emerald',
    defaultConfig: { subjectContains: '', senderFilter: '' }
  },

  // AI Nodes
  {
    type: 'ai',
    subType: 'ai_chat',
    name: 'AI Agent Triage',
    nameAr: 'تحليل وكيل الذكاء الاصطناعي',
    description: 'Assign incoming request to a specialized AI Agent with knowledge context',
    descriptionAr: 'تحويل الطلب لوكيل ذكاء اصطناعي متخصص مع تزويده بقاعدة المعرفة',
    icon: 'Bot',
    categoryColor: 'purple',
    defaultConfig: { agentId: 'agent_sales_01', temperature: 0.7, model: 'gemini-2.5-flash' }
  },
  {
    type: 'ai',
    subType: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    nameAr: 'تحليل المشاعر والنبرة',
    description: 'Detect whether customer tone is positive, urgent, angry, or neutral',
    descriptionAr: 'تحديد نبرة العميل (إيجابي، غاضب، مستعجل، محايد) تلقائيًا',
    icon: 'Smile',
    categoryColor: 'purple',
    defaultConfig: { outputScale: 'positive_neutral_negative', detectUrgency: true }
  },
  {
    type: 'ai',
    subType: 'data_extraction',
    name: 'Data Extraction',
    nameAr: 'استخراج البيانات المهيكلة',
    description: 'Extract customer name, budget, phone, requirements into JSON schema',
    descriptionAr: 'استخراج الاسم، رقم الهاتف، الميزانية، والطلب في صيغة بيانات منظمة',
    icon: 'Sparkles',
    categoryColor: 'purple',
    defaultConfig: { fieldsToExtract: ['name', 'phone', 'budget', 'serviceRequired'] }
  },
  {
    type: 'ai',
    subType: 'classification',
    name: 'Smart Classification',
    nameAr: 'تصنيف المحتوى الذكي',
    description: 'Categorize inquiries into Sales, Technical Support, Invoicing, or General',
    descriptionAr: 'تصنيف الاستفسارات إلى: مبيعات، دعم فني، فواتير، عام',
    icon: 'Tag',
    categoryColor: 'purple',
    defaultConfig: { categories: ['Sales', 'Support', 'Billing', 'Partnership'] }
  },
  {
    type: 'ai',
    subType: 'text_generation',
    name: 'AI Text Generation',
    nameAr: 'توليد المحتوى بالذكاء الاصطناعي',
    description: 'Generate personalized email responses, proposals, or WhatsApp replies',
    descriptionAr: 'كتابة ردود بريدية مخصصة أو رسائل واتساب تسويقية احترافية',
    icon: 'Wand2',
    categoryColor: 'purple',
    defaultConfig: { prompt: 'اكتب ردًا مهذبًا ومقنعًا للعميل يعرض خدماتنا مع حثه على حجز موعد', tone: 'professional' }
  },
  {
    type: 'ai',
    subType: 'translation',
    name: 'Translation & Localization',
    nameAr: 'الترجمة والتعريب الذكي',
    description: 'Translate messages between Arabic, English, and other languages instantly',
    descriptionAr: 'ترجمة الرسائل بدقة بين العربية والإنجليزية ولغات أخرى فوريًا',
    icon: 'Languages',
    categoryColor: 'purple',
    defaultConfig: { targetLanguage: 'ar' }
  },

  // Logic Nodes
  {
    type: 'logic',
    subType: 'if_else',
    name: 'IF / ELSE Condition',
    nameAr: 'شرط منطقي (إذا / وإلا)',
    description: 'Branch the execution path based on customer budget, score, or status',
    descriptionAr: 'تفريع مسار التنفيذ حسب ميزانية العميل، تقييمه، أو حالته',
    icon: 'GitBranch',
    categoryColor: 'amber',
    defaultConfig: { field: 'sentiment', operator: 'equals', value: 'positive' }
  },
  {
    type: 'logic',
    subType: 'filter',
    name: 'Filter Rule',
    nameAr: 'فلترة البيانات',
    description: 'Stop workflow execution if incoming data does not meet criteria',
    descriptionAr: 'إيقاف مسار العمل إذا لم تطابق البيانات المدخلة الشروط المحددة',
    icon: 'Filter',
    categoryColor: 'amber',
    defaultConfig: { condition: 'budget > 1000' }
  },
  {
    type: 'logic',
    subType: 'delay',
    name: 'Delay / Wait',
    nameAr: 'تأخير زمني / انتظار',
    description: 'Pause the workflow for minutes, hours, or days before following up',
    descriptionAr: 'تأخير تنفيذ الخطوة القادمة لدقائق أو ساعات أو أيام للمتابعة الذكية',
    icon: 'Hourglass',
    categoryColor: 'amber',
    defaultConfig: { duration: 2, unit: 'days' }
  },
  {
    type: 'logic',
    subType: 'router',
    name: 'Multi-Path Router',
    nameAr: 'موزع المسارات المتعددة',
    description: 'Route leads to different sales reps or departments based on category',
    descriptionAr: 'توزيع المهام تلقائيًا على مندوبي المبيعات أو الأقسام المختلفة',
    icon: 'Network',
    categoryColor: 'amber',
    defaultConfig: { routes: ['Enterprise', 'SMB', 'Individual'] }
  },

  // Action Nodes
  {
    type: 'action',
    subType: 'send_message',
    name: 'Send WhatsApp / SMS',
    nameAr: 'إرسال رسالة واتساب / SMS',
    description: 'Send instant automated message to the customer phone number',
    descriptionAr: 'إرسال رسالة واتساب آلية فورية مخصصة لرقم هاتف العميل',
    icon: 'Send',
    categoryColor: 'sky',
    defaultConfig: { provider: 'whatsapp', messageTemplate: 'أهلاً بك {{name}}، يسعدنا تواصلك مع زين للأتمتة والذكاء الاصطناعي (Zain Automation AI)!' }
  },
  {
    type: 'action',
    subType: 'send_email',
    name: 'Send Email',
    nameAr: 'إرسال بريد إلكتروني',
    description: 'Send rich HTML or plain text email with dynamic merge tags',
    descriptionAr: 'إرسال بريد إلكتروني احترافي يحتوي على متغيرات العميل وملفات مرفقة',
    icon: 'MailCheck',
    categoryColor: 'sky',
    defaultConfig: { subject: 'شكرًا لتواصلك - تفاصيل العرض المقترح', body: 'مرحبًا {{name}}، إليك تفاصيل العرض...' }
  },
  {
    type: 'action',
    subType: 'create_customer',
    name: 'Create / Update CRM Lead',
    nameAr: 'إضافة / تحديث عميل في CRM',
    description: 'Save contact details, AI tags, and notes to Zain CRM system',
    descriptionAr: 'حفظ بيانات العميل ونبرته وملاحظات الذكاء الاصطناعي في نظام CRM الداخلي',
    icon: 'UserCheck',
    categoryColor: 'sky',
    defaultConfig: { stage: 'qualified', notifySalesTeam: true }
  },
  {
    type: 'action',
    subType: 'send_notification',
    name: 'Send Team Notification',
    nameAr: 'إرسال تنبيه لفريق العمل',
    description: 'Alert team on Slack, Telegram, or internal notification bell',
    descriptionAr: 'إرسال إشعار فوري لفريق المبيعات على سلاك أو تيليجرام أو لوحة التحكم',
    icon: 'BellRing',
    categoryColor: 'sky',
    defaultConfig: { channel: 'slack', message: '🔔 عميل محتمل عالي الأهمية وصل للتو: {{name}}' }
  },
  {
    type: 'action',
    subType: 'http_request',
    name: 'HTTP / API Request',
    nameAr: 'طلب API خارجي (HTTP)',
    description: 'Send JSON payload to any 3rd-party REST API or backend system',
    descriptionAr: 'إرسال البيانات لأي نظام خارجي، ERP، أو منصة سحابية عبر REST API',
    icon: 'Globe',
    categoryColor: 'sky',
    defaultConfig: { method: 'POST', url: 'https://api.external-crm.com/v1/sync', headers: { 'Authorization': 'Bearer YOUR_KEY' } }
  },
  {
    type: 'action',
    subType: 'update_database',
    name: 'Update Google Sheets / DB',
    nameAr: 'تحديث جداول بيانات / قاعدة بيانات',
    description: 'Append new row into Google Sheets or record into SQL database',
    descriptionAr: 'إضافة صف جديد تلقائيًا في Google Sheets أو جدول قواعد البيانات',
    icon: 'Database',
    categoryColor: 'sky',
    defaultConfig: { sheetName: 'Leads 2026', range: 'A:G' }
  }
];

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_01',
    name: 'Smart Lead Qualification & Auto-Followup',
    nameAr: 'تأهيل العملاء الجدد والمتابعة الذكية',
    description: 'Inbound Webhook triggers AI lead qualification, Condition branching, CRM creation, WhatsApp followup, in-app notification, and confirmation email.',
    descriptionAr: 'استقبال الـ Payload عبر Webhook، التحليل بالذكاء الاصطناعي، التحقق من الشرط، التسجيل في الـ CRM، إرسال واتساب، إشعار النظام، وإرسال البريد الإلكتروني.',
    isActive: true,
    category: 'Sales & CRM',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-07',
    executionCount: 1420,
    successRate: 99.2,
    tags: ['Webhook', 'AI Agent', 'Condition', 'CRM', 'WhatsApp', 'Notification', 'Email'],
    nodes: [
      {
        id: 'node_1',
        type: 'trigger',
        subType: 'webhook',
        name: 'Inbound Webhook HTTP Endpoint',
        nameAr: 'استقبال الويب هوك (Inbound Webhook)',
        description: 'Receives external HTTP POST request with lead payload',
        descriptionAr: 'استقبال الـ Payload المباشر عبر رابط Webhook للإنتاج',
        position: { x: 50, y: 150 },
        config: { webhookUrl: '/api/webhooks/wf_01', method: 'POST' },
        icon: 'Webhook'
      },
      {
        id: 'node_2',
        type: 'ai',
        subType: 'ai_agent',
        name: 'AI Sales Agent Analysis',
        nameAr: 'تحليل وكيل المبيعات الذكي (AI)',
        description: 'Understands client needs, budget, urgency and scores intent',
        descriptionAr: 'فهم احتياج العميل، تقدير الجدية، وحساب درجة التأهيل وتوليد الرد',
        position: { x: 300, y: 150 },
        config: {
          agentId: 'agent_sales_01',
          model: 'moonshotai/kimi-k3',
          fallbackModel: 'gemini-2.5-flash',
          systemPrompt: 'أنت وكيل مبيعات ذكي ومحترف لشركة حلول تقنية وأتمتة. حلل رسالة العميل وحدد درجة التأهيل (leadScore 0-100) والرد المناسب.'
        },
        icon: 'Bot'
      },
      {
        id: 'node_3',
        type: 'logic',
        subType: 'if_else',
        name: 'Is High Intent Lead?',
        nameAr: 'فحص شرط التأهيل (Condition)',
        description: 'Branch if AI score >= 70 / High Intent',
        descriptionAr: 'التحقق من أن درجة التأهيل لا تقل عن 70% لإتمام دورة المبيعات',
        position: { x: 550, y: 150 },
        config: { field: 'leadScore', operator: '>=', value: 70 },
        icon: 'GitBranch'
      },
      {
        id: 'node_4',
        type: 'action',
        subType: 'create_customer',
        name: 'Add / Update CRM Record',
        nameAr: 'تسجيل وتحديث العميل في الـ CRM',
        description: 'Stores contact details with AI summary in Zain CRM',
        descriptionAr: 'حفظ وتحديث بيانات العميل وسجل التواصل في قاعدة بيانات CRM',
        position: { x: 800, y: 150 },
        config: { stage: 'qualified', priority: 'high', provider: 'crm' },
        icon: 'UserCheck'
      },
      {
        id: 'node_5',
        type: 'action',
        subType: 'send_message',
        name: 'Instant WhatsApp Followup',
        nameAr: 'إرسال واتساب ترحيبي فوري (WhatsApp)',
        description: 'Send personalized WhatsApp with booking link via Meta Cloud API',
        descriptionAr: 'إرسال رسالة واتساب آلية عبر مزود واتساب المعتمد عند توفر الاعتمادات',
        position: { x: 1050, y: 150 },
        config: { provider: 'whatsapp', template: 'vip_welcome' },
        icon: 'Send'
      },
      {
        id: 'node_6',
        type: 'action',
        subType: 'send_notification',
        name: 'Dispatch In-App Notification',
        nameAr: 'إرسال إشعار فوري للنظام (Notification)',
        description: 'Push high priority notification to notification center & team channel',
        descriptionAr: 'تسجيل إشعار فوري في مركز التنبيهات مع تنبيه الفريق بالمتابعة',
        position: { x: 1300, y: 150 },
        config: { title: 'عميل مؤهل جديد عبر Webhook', channel: 'In-App Notification Center', urgent: true },
        icon: 'BellRing'
      },
      {
        id: 'node_7',
        type: 'action',
        subType: 'send_email',
        name: 'Send Confirmation Email',
        nameAr: 'إرسال بريد إلكتروني تأكيدي (Email)',
        description: 'Dispatches confirmation email via Resend / SMTP provider',
        descriptionAr: 'إرسال بريد إلكتروني تأكيدي للعميل عبر مزود البريد المعتمد',
        position: { x: 1550, y: 150 },
        config: { provider: 'email', template: 'lead_confirmation', subject: 'تأكيد استلام طلبك - زين للأتمتة والذكاء الاصطناعي' },
        icon: 'MailCheck'
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
      { id: 'e2-3', source: 'node_2', target: 'node_3' },
      { id: 'e3-4', source: 'node_3', target: 'node_4', conditionBranch: 'true', label: 'مؤهل (Score >= 70)' },
      { id: 'e4-5', source: 'node_4', target: 'node_5' },
      { id: 'e5-6', source: 'node_5', target: 'node_6' },
      { id: 'e6-7', source: 'node_6', target: 'node_7' },
      { id: 'e3-7', source: 'node_3', target: 'node_7', conditionBranch: 'false', label: 'غير مؤهل (بريد فقط)' }
    ]
  },
  {
    id: 'wf_02',
    name: 'Customer Support Auto-Triage & Knowledge Resolver',
    nameAr: 'توجيه الدعم الفني والحل التلقائي لقاعدة المعرفة',
    description: 'Incoming support ticket is matched against company Knowledge Base. Simple queries are auto-resolved; critical issues escalated.',
    descriptionAr: 'مطابقة تذكرة الدعم مع قاعدة المعرفة للشركة، الرد التلقائي على الأسئلة الشائعة وتصعيد الحالات المعقدة للموظفين.',
    isActive: true,
    category: 'Customer Support',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-02',
    executionCount: 2840,
    successRate: 98.6,
    tags: ['Support', 'Knowledge Base', 'Gemini AI', 'Escalation'],
    nodes: [
      {
        id: 'node_201',
        type: 'trigger',
        subType: 'new_message',
        name: 'Incoming Support Chat',
        nameAr: 'رسالة دعم فني واردة',
        description: 'Customer initiates chat from app or WhatsApp',
        descriptionAr: 'بدء محادثة دعم من التطبيق أو الواتساب',
        position: { x: 50, y: 150 },
        config: { channel: 'all' },
        icon: 'MessageSquare'
      },
      {
        id: 'node_202',
        type: 'ai',
        subType: 'sentiment_analysis',
        name: 'Urgency & Sentiment Analysis',
        nameAr: 'تحليل المشاعر ومستوى الاستعجال',
        description: 'Detects if customer is frustrated or system is down',
        descriptionAr: 'تحديد ما إذا كان العميل غاضباً أو هناك عطل فني طارئ',
        position: { x: 350, y: 150 },
        config: {},
        icon: 'Smile'
      },
      {
        id: 'node_203',
        type: 'ai',
        subType: 'ai_chat',
        name: 'Knowledge Base Search & Resolution',
        nameAr: 'البحث في قاعدة المعرفة والحل الذكي',
        description: 'Consults company documentation and generates solution',
        descriptionAr: 'مطابقة الاستفسار مع وثائق الشركة وصياغة رد دقيق',
        position: { x: 650, y: 150 },
        config: { kbId: 'kb_product_docs' },
        icon: 'Bot'
      },
      {
        id: 'node_204',
        type: 'action',
        subType: 'send_message',
        name: 'Instant Solution Reply',
        nameAr: 'إرسال الحل الفوري للعميل',
        description: 'Deliver clear step-by-step guidance directly to customer',
        descriptionAr: 'إرسال خطوات الحل مباشرة إلى العميل لإنهاء المشكلة',
        position: { x: 950, y: 150 },
        config: {},
        icon: 'Send'
      }
    ],
    edges: [
      { id: 'e201-202', source: 'node_201', target: 'node_202' },
      { id: 'e202-203', source: 'node_202', target: 'node_203' },
      { id: 'e203-204', source: 'node_203', target: 'node_204' }
    ]
  },
  {
    id: 'wf_03',
    name: 'E-commerce Order Status & WhatsApp Tracking',
    nameAr: 'متابعة وتحديث طلبات المتاجر عبر واتساب',
    description: 'When an order status changes in Shopify/WooCommerce, sends automated shipping link, tracking number, and customer satisfaction survey.',
    descriptionAr: 'عند تغير حالة الطلب في المتجر الإلكتروني، إرسال رقم التتبع ورابط الشحن واستبيان الرضا عبر واتساب تلقائيًا.',
    isActive: true,
    category: 'E-Commerce',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-01',
    executionCount: 4510,
    successRate: 99.8,
    tags: ['E-Commerce', 'Orders', 'WhatsApp', 'Shipping'],
    nodes: [
      {
        id: 'node_301',
        type: 'trigger',
        subType: 'webhook',
        name: 'Shopify Order Shipped Webhook',
        nameAr: 'إشعار شحن الطلب من المتجر',
        description: 'Webhook from e-commerce store with tracking info',
        descriptionAr: 'استقبال إشعار الشحن ورقم بوليصة النقل من المتجر',
        position: { x: 50, y: 150 },
        config: { path: '/webhook/order-shipped' },
        icon: 'Webhook'
      },
      {
        id: 'node_302',
        type: 'action',
        subType: 'send_message',
        name: 'Send WhatsApp Tracking Card',
        nameAr: 'إرسال بطاقة التتبع عبر واتساب',
        description: 'WhatsApp message with driver number & live GPS tracking',
        descriptionAr: 'إرسال رسالة واتساب تحتوي على رقم الشحنة ورابط التتبع المباشر',
        position: { x: 380, y: 150 },
        config: {},
        icon: 'Send'
      },
      {
        id: 'node_303',
        type: 'logic',
        subType: 'delay',
        name: 'Wait 24 Hours After Delivery',
        nameAr: 'انتظار 24 ساعة بعد التسليم',
        description: 'Allow customer to unpack product before asking for review',
        descriptionAr: 'إمهال العميل 24 ساعة لتجربة المنتج قبل طلب التقييم',
        position: { x: 700, y: 150 },
        config: { duration: 24, unit: 'hours' },
        icon: 'Hourglass'
      },
      {
        id: 'node_304',
        type: 'action',
        subType: 'send_message',
        name: 'Send 1-Click Review Survey',
        nameAr: 'إرسال استبيان الرضا بنقرة واحدة',
        description: 'Interactive WhatsApp buttons for 5-star rating',
        descriptionAr: 'إرسال أزرار تفاعلية في واتساب لتقييم تجربة الشراء',
        position: { x: 1000, y: 150 },
        config: {},
        icon: 'Smile'
      }
    ],
    edges: [
      { id: 'e301-302', source: 'node_301', target: 'node_302' },
      { id: 'e302-303', source: 'node_302', target: 'node_303' },
      { id: 'e303-304', source: 'node_303', target: 'node_304' }
    ]
  }
];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent_sales_01',
    name: 'Sales Champion Agent',
    nameAr: 'وكيل المبيعات والتأهيل الذكي',
    role: 'Lead Qualifier & Sales Representative',
    roleAr: 'مؤهل العملاء وممثل المبيعات الأول',
    avatar: '💼',
    description: 'Engages inbound leads, answers service questions, qualifies budget and timeline, and books discovery calls.',
    descriptionAr: 'يستقبل العملاء الجدد، يجيب عن تفاصيل الخدمات والأسعار، يؤهل العميل حسب الميزانية والجدية ويحجز المواعيد.',
    systemPrompt: 'أنت وكيل المبيعات الرسمي لمنصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI). أسلوبك ودود، احترافي، ومقنع. افهم حاجة العميل أولاً ثم بين كيف توفر له الأتمتة 70% من وقته وتكاليفه التشغيلية.',
    goal: 'تحويل 40% من العملاء المحتملين إلى مكالمات بيعية مجدولة مع فريق المبيعات.',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    maxTokens: 1024,
    allowedTools: ['CRM Search', 'Calendar Booking', 'Price Calculator', 'WhatsApp API'],
    knowledgeBaseIds: ['kb_sales_playbook', 'kb_pricing_sheet'],
    status: 'active',
    conversationsCount: 1845,
    totalTokensUsed: 945200
  },
  {
    id: 'agent_support_02',
    name: 'Customer Support Genie',
    nameAr: 'وكيل الدعم الفني الذكي',
    role: '24/7 Technical Support Specialist',
    roleAr: 'أخصائي الدعم الفني على مدار الساعة',
    avatar: '🛠️',
    description: 'Troubleshoots issues, searches technical documentation, and provides instant step-by-step guidance.',
    descriptionAr: 'يحل مشاكل المستخدمين الفنية، يبحث في الوثائق وقواعد البيانات، ويصعد التذاكر المعقدة للمهندسين.',
    systemPrompt: 'أنت أخصائي الدعم الفني لمنصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI). قدم حلولاً واضحة ومباشرة ومرقمة للمشاكل التي يواجهها المستخدم في الـ Workflows أو الـ Integrations.',
    goal: 'حل 80% من استفسارات الدعم الفني فوريًا دون تدخل بشري.',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxTokens: 1500,
    allowedTools: ['Knowledge Base Query', 'Workflow Log Inspector', 'Ticket Escalation'],
    knowledgeBaseIds: ['kb_product_docs', 'kb_troubleshooting_guide'],
    status: 'active',
    conversationsCount: 3410,
    totalTokensUsed: 1420800
  },
  {
    id: 'agent_marketing_03',
    name: 'Content & Growth Agent',
    nameAr: 'وكيل التسويق وصناعة المحتوى',
    role: 'Copywriter & Growth Strategist',
    roleAr: 'كاتب المحتوى واستراتيجي النمو',
    avatar: '🚀',
    description: 'Generates bilingual marketing copy, social media posts, email sequences, and ad headlines tailored to target audiences.',
    descriptionAr: 'يكتب منشورات تسويقية جذابة، رسائل بريدية إخبارية، وحملات إعلانية احترافية تلائم الجمهور المستهدف في الخليج والوطن العربي.',
    systemPrompt: 'أنت خبير تسويق رقمي وكتابة إعلانية (Copywriting) متخصص في الـ B2B و SaaS في المنطقة العربية.',
    goal: 'صناعة محتوى تسويقي عالي التحويل ورفع معدل التفاعل بنسبة 35%.',
    model: 'gemini-2.5-flash',
    temperature: 0.8,
    maxTokens: 2048,
    allowedTools: ['Hashtag Generator', 'SEO Keyword Analyzer', 'Social Media Publisher'],
    knowledgeBaseIds: ['kb_brand_voice'],
    status: 'active',
    conversationsCount: 920,
    totalTokensUsed: 830100
  },
  {
    id: 'agent_data_04',
    name: 'Data Intelligence Agent',
    nameAr: 'وكيل تحليل البيانات والتقارير',
    role: 'Analytics & Reporting Analyst',
    roleAr: 'محلل الأداء واستخراج التقارير',
    avatar: '📊',
    description: 'Aggregates workflow logs, calculates ROI, detects bottlenecks, and exports executive business summaries.',
    descriptionAr: 'يحلل سجلات العمليات، يحسب العائد على الاستثمار، يكتشف الاختناقات في مسارات العمل ويصدر تقارير تنفيذية دقيقة.',
    systemPrompt: 'أنت محلل بيانات تنفيذي. استخرج الأرقام الدقيقة، معدلات الفشل، تكاليف الـ AI، ومعدلات التحويل وقدم توصيات عملية.',
    goal: 'تحديد فرص تحسين الأداء وتخفيض زمن تنفيذ الـ Workflows بنسبة 25%.',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    maxTokens: 2048,
    allowedTools: ['SQL Query', 'Export CSV/Excel', 'Cost Estimator'],
    knowledgeBaseIds: ['kb_analytics_dictionary'],
    status: 'active',
    conversationsCount: 460,
    totalTokensUsed: 420000
  },
  {
    id: 'agent_copilot_05',
    name: 'Zain Automation AI Copilot',
    nameAr: 'مساعد بناء الأتمتة المدمج',
    role: 'AI Workflow Architect',
    roleAr: 'مهندس مسارات العمل بالذكاء الاصطناعي',
    avatar: '⚡',
    description: 'Translates natural language ideas into ready-to-run workflows, suggests optimal nodes, and debugs logic errors.',
    descriptionAr: 'يحول الأفكار والوصف الطبيعي إلى مسارات عمل كاملة ومترابطة فورًا، ويقترح تحسينات ذكية للمسار.',
    systemPrompt: 'أنت مهندس الأتمتة المساعد في زين للأتمتة والذكاء الاصطناعي (Zain Automation AI). ساعد المستخدم في تحويل أي فكرة عمل إلى Triggers, AI Nodes, Logic, و Actions بصريًا.',
    goal: 'مساعدة المستخدم على إطلاق أي Workflow خلال أقل من 60 ثانية.',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    maxTokens: 2048,
    allowedTools: ['Workflow Canvas API', 'Node Injector', 'Error Diagnostics'],
    knowledgeBaseIds: ['kb_workflow_best_practices'],
    status: 'active',
    conversationsCount: 2150,
    totalTokensUsed: 1250000
  }
];

export const INITIAL_LEADS: CustomerLead[] = [
  {
    id: 'lead_1',
    name: 'عبدالله السبيعي',
    email: 'abdullah.subaie@technovate.sa',
    phone: '+966 50 123 4567',
    company: 'شركة تك نوفيت للاستشارات',
    source: 'Landing Page Form',
    stage: 'qualified',
    stageAr: 'مؤهل للشراء',
    sentimentScore: 'positive',
    sentimentNote: 'مهتم جدًا بأتمتة خدمة العملاء وربطها بالواتساب ولديه ميزانية معتمدة',
    notes: 'تمت إضافته عبر Workflow "تأهيل العملاء الجدد". تواصل أولي مبشر.',
    createdAt: '2026-09-04 14:32',
    lastActivity: 'تم إرسال العرض المقترح عبر واتساب',
    linkedWorkflows: ['wf_01'],
    tags: ['Enterprise', 'Saudi Arabia', 'High Budget'],
    value: 12500
  },
  {
    id: 'lead_2',
    name: 'فاطمة الزهراء المنصوري',
    email: 'fatima@almansoori-retail.ae',
    phone: '+971 52 987 6543',
    company: 'مجموعة المنصوري للتجزئة',
    source: 'WhatsApp Inbound',
    stage: 'proposal',
    stageAr: 'تقديم العرض',
    sentimentScore: 'positive',
    sentimentNote: 'ترغب في ربط 5 فروع ومتجر إلكتروني مع نظام CRM موحد',
    notes: 'تم حجز مكالمة ديمو تجريبية ليوم الغد الساعة 11 صباحًا',
    createdAt: '2026-09-03 10:15',
    lastActivity: 'مكالمة ديمو مجدولة',
    linkedWorkflows: ['wf_01', 'wf_03'],
    tags: ['E-Commerce', 'Retail', 'UAE'],
    value: 28000
  },
  {
    id: 'lead_3',
    name: 'محمد خالد العمري',
    email: 'm.omari@alalamiah.com',
    phone: '+966 55 432 1098',
    company: 'الشركة العالمية للخدمات اللوجستية',
    source: 'LinkedIn Ad',
    stage: 'new',
    stageAr: 'عميل جديد',
    sentimentScore: 'neutral',
    sentimentNote: 'يسأل عن إمكانية الربط مع نظام ERP داخلي و Webhooks مخصصة',
    notes: 'تم إرسال بروشور المواصفات التقنية آليًا',
    createdAt: '2026-09-05 09:12',
    lastActivity: 'استلم بريد التعريفي بنجاح',
    linkedWorkflows: ['wf_01'],
    tags: ['Logistics', 'API Integration'],
    value: 18000
  },
  {
    id: 'lead_4',
    name: 'سارة الدوسري',
    email: 'sara@growthhub.co',
    phone: '+966 54 876 5432',
    company: 'وكالة جروث هب للتسويق',
    source: 'Referral',
    stage: 'won',
    stageAr: 'تم الإغلاق بنجاح',
    sentimentScore: 'positive',
    sentimentNote: 'اشتركت في خطة الوكالات (Agency Plan) لإدارة 8 عملاء',
    notes: 'عميل استراتيجي نشط يستخدم 14 Workflow حاليًا',
    createdAt: '2026-08-28 16:40',
    lastActivity: 'تم تفعيل حساب الوكالة',
    linkedWorkflows: ['wf_01', 'wf_02'],
    tags: ['Agency', 'Active Client'],
    value: 45000
  }
];

export const INITIAL_SMART_FORMS: SmartForm[] = [
  {
    id: 'form_lead_gen_01',
    title: 'Lead Capture & Consultation Request',
    titleAr: 'نموذج طلب استشارة وأتمتة مجانية',
    description: 'High-converting form used on main website and campaigns',
    descriptionAr: 'نموذج رئيسي لجمع بيانات العملاء واستفساراتهم على الموقع والحملات',
    type: 'lead',
    linkedWorkflowId: 'wf_01',
    submissionsCount: 384,
    status: 'published',
    createdAt: '2026-08-12',
    fields: [
      { id: 'f1', label: 'Full Name', labelAr: 'الاسم الكامل', type: 'text', required: true, placeholder: 'مثال: محمد عبدالله' },
      { id: 'f2', label: 'Business Email', labelAr: 'البريد الإلكتروني للعمل', type: 'email', required: true, placeholder: 'name@company.com' },
      { id: 'f3', label: 'WhatsApp / Phone', labelAr: 'رقم الواتساب أو الجوال', type: 'phone', required: true, placeholder: '+966 5x xxx xxxx' },
      { id: 'f4', label: 'Company Name', labelAr: 'اسم الشركة أو المشروع', type: 'text', required: false, placeholder: 'اسم شركتك' },
      { id: 'f5', label: 'Required Automation', labelAr: 'نوع الأتمتة المطلوبة', type: 'select', required: true, options: ['أتمتة خدمة العملاء والواتساب', 'أتمتة المبيعات وتأهيل الـ Leads', 'ربط المتجر الإلكتروني والمخزون', 'بناء وكيل ذكاء اصطناعي مخصص'] },
      { id: 'f6', label: 'Project Details & Goals', labelAr: 'تفاصيل العملية التي تريد أتمتتها', type: 'textarea', required: false, placeholder: 'اشرح التحدي الذي تواجهه حاليًا...' }
    ]
  },
  {
    id: 'form_support_02',
    title: 'Instant Support & Ticket Form',
    titleAr: 'نموذج الدعم الفني المباشر',
    description: 'Tickets submitted here feed directly into the AI Support Triage workflow',
    descriptionAr: 'يغذي مسار الدعم الفني والحل التلقائي عبر قاعدة المعرفة فوريًا',
    type: 'contact',
    linkedWorkflowId: 'wf_02',
    submissionsCount: 712,
    status: 'published',
    createdAt: '2026-08-18',
    fields: [
      { id: 'sf1', label: 'Name', labelAr: 'الاسم', type: 'text', required: true },
      { id: 'sf2', label: 'Account Email', labelAr: 'البريد المسجل', type: 'email', required: true },
      { id: 'sf3', label: 'Issue Category', labelAr: 'تصنيف المشكلة', type: 'select', required: true, options: ['ربط الـ Webhooks', 'فشل في تنفيذ Workflow', 'استهلاك الـ AI', 'الفواتير والاشتراك'] },
      { id: 'sf4', label: 'Problem Description', labelAr: 'وصف المشكلة بالتفصيل', type: 'textarea', required: true }
    ]
  }
];

export const INITIAL_INTEGRATIONS: IntegrationService[] = [
  // Messaging
  {
    id: 'int_whatsapp',
    name: 'WhatsApp Business API',
    category: 'messaging',
    icon: 'MessageCircle',
    connected: true,
    statusText: 'Connected (Cloud API v19.0)',
    statusTextAr: 'متصل بنجاح (Meta Cloud API)',
    description: 'Send and receive automated messages, template notifications, and interactive chat flows.',
    descriptionAr: 'إرسال واستقبال رسائل واتساب الآلية، القوالب المعتمدة، والمحادثات التفاعلية مع العملاء.',
    authType: 'api_key'
  },
  {
    id: 'int_telegram',
    name: 'Telegram Bot API',
    category: 'messaging',
    icon: 'Send',
    connected: true,
    statusText: 'Connected (@ZainAutoBot)',
    statusTextAr: 'متصل (البوت الرسمي جاهز)',
    description: 'Instant alerts, executive summary reports, and interactive admin control via Telegram.',
    descriptionAr: 'تنبيهات فورية وتقارير تنفيذية سريعة وتحكم مباشر عبر بوت تيليجرام مشفر.',
    authType: 'api_key'
  },
  {
    id: 'int_slack',
    name: 'Slack Workspaces',
    category: 'messaging',
    icon: 'Hash',
    connected: true,
    statusText: 'Connected (#sales-leads, #ops)',
    statusTextAr: 'متصل بالقنوات الداخلية',
    description: 'Notify sales and engineering teams in dedicated Slack channels with action buttons.',
    descriptionAr: 'إرسال تنبيهات غنية لفريق المبيعات والدعم الفني مع أزرار الإجراء السريع.',
    authType: 'oauth'
  },
  {
    id: 'int_email',
    name: 'Email & SMTP (SendGrid/Gmail)',
    category: 'messaging',
    icon: 'Mail',
    connected: true,
    statusText: 'Connected (support@zainauto.ai)',
    statusTextAr: 'متصل وخادم الإرسال جاهز',
    description: 'Send automated transaction emails, drip campaigns, and receive incoming replies.',
    descriptionAr: 'إرسال الرسائل البريدية التفاعلية، حملات المتابعة التلقائية واستقبال الردود.',
    authType: 'api_key'
  },

  // CRM & Data
  {
    id: 'int_crm',
    name: 'Zain Built-in CRM',
    category: 'crm',
    icon: 'Users',
    connected: true,
    statusText: 'Native Engine Active',
    statusTextAr: 'المحرك الداخلي نشط',
    description: 'Seamless zero-latency synchronization with internal contacts, deals, and lead scoring.',
    descriptionAr: 'تزامن فوري ومجاني بدون تأخير مع جهات الاتصال، الصفقات، ومراحل المبيعات.',
    authType: 'api_key'
  },
  {
    id: 'int_sheets',
    name: 'Google Sheets',
    category: 'crm',
    icon: 'FileSpreadsheet',
    connected: true,
    statusText: 'Connected (3 Linked Sheets)',
    statusTextAr: 'متصل (3 جداول مرتبطة)',
    description: 'Append rows, update cell data, and sync leads to collaborative Google Spreadsheets.',
    descriptionAr: 'إضافة صفوف وتحديث الخلايا تلقائيًا في جداول جوجل لمشاركتها مع الفريق.',
    authType: 'oauth'
  },
  {
    id: 'int_airtable',
    name: 'Airtable Databases',
    category: 'crm',
    icon: 'Layers',
    connected: false,
    statusText: 'Ready to Connect',
    statusTextAr: 'جاهز للربط',
    description: 'Sync complex relational records, bases, and views for visual project tracking.',
    descriptionAr: 'مزامنة السجلات المترابطة والقواعد والجداول المرئية في منصة إيرتيبل.',
    authType: 'api_key'
  },

  // Productivity
  {
    id: 'int_drive',
    name: 'Google Drive & Docs',
    category: 'productivity',
    icon: 'Folder',
    connected: true,
    statusText: 'Connected (Auto-PDF Generation)',
    statusTextAr: 'متصل (إنشاء العقود والفواتير)',
    description: 'Generate contracts, proposals, and invoices dynamically and store them safely.',
    descriptionAr: 'توليد عروض الأسعار والعقود وملفات PDF آليًا وحفظها في مجلدات السحابة.',
    authType: 'oauth'
  },
  {
    id: 'int_calendar',
    name: 'Google Calendar',
    category: 'productivity',
    icon: 'Calendar',
    connected: true,
    statusText: 'Connected (Meeting Auto-Booking)',
    statusTextAr: 'متصل لحجز المواعيد',
    description: 'Check consultant availability and auto-schedule video discovery calls.',
    descriptionAr: 'فحص التوفر وجدولة اجتماعات المبيعات والاستشارات آليًا في تقويم جوجل.',
    authType: 'oauth'
  },
  {
    id: 'int_notion',
    name: 'Notion Workspace',
    category: 'productivity',
    icon: 'BookOpen',
    connected: false,
    statusText: 'Ready to Connect',
    statusTextAr: 'جاهز للربط',
    description: 'Sync meeting notes, tasks, and documentation to Notion team databases.',
    descriptionAr: 'مزامنة ملخصات الاجتماعات وقوائم المهام إلى صفحات ومشاريع نوشن.',
    authType: 'oauth'
  },

  // Automation & Developer
  {
    id: 'int_webhooks',
    name: 'Custom Webhooks In/Out',
    category: 'automation',
    icon: 'Zap',
    connected: true,
    statusText: 'Active (Endpoints Live)',
    statusTextAr: 'نشط (الروابط تعمل بكفاءة)',
    description: 'High-throughput webhook receivers with signature verification and retry queues.',
    descriptionAr: 'استقبال وإرسال Webhooks فورية مع التحقق الأمني من التوقيع وإعادة المحاولة التلقائية.',
    authType: 'webhook'
  },
  {
    id: 'int_rest_api',
    name: 'Zain Developer REST API',
    category: 'automation',
    icon: 'Code',
    connected: true,
    statusText: 'API Keys Active (v1.2)',
    statusTextAr: 'المفاتيح البرمجية نشطة',
    description: 'Programmatic API to trigger workflows, fetch executions, and manage agents remotely.',
    descriptionAr: 'واجهة برمجية كاملة لتشغيل المسارات برمجياً وإدارة الوكلاء والبيانات من أي نظام خارجي.',
    authType: 'api_key'
  }
];

export const INITIAL_EXECUTIONS: ExecutionLog[] = [
  {
    id: 'exec_1098',
    workflowId: 'wf_01',
    workflowName: 'تأهيل العملاء الجدد والمتابعة الذكية',
    triggerType: 'Form Submission',
    status: 'success',
    startedAt: '2026-09-05 10:41:22',
    completedAt: '2026-09-05 10:41:24',
    durationMs: 1820,
    inputPayload: {
      name: 'عبدالله السبيعي',
      email: 'abdullah@technovate.sa',
      phone: '+966501234567',
      budget: '15000 SAR',
      message: 'نحتاج أتمتة الرد على استفسارات العملاء على الواتساب وربطها مع CRM'
    },
    outputPayload: {
      leadScore: 92,
      sentiment: 'Very Positive & Urgent',
      crmLeadId: 'lead_1',
      whatsappSent: true,
      slackNotified: true
    },
    traces: [
      {
        nodeId: 'node_1',
        nodeName: 'إرسال نموذج الموقع',
        nodeType: 'trigger',
        status: 'success',
        startedAt: '10:41:22.050',
        durationMs: 120,
        input: { formId: 'lead_form_main' },
        output: { receivedData: true, fieldsCount: 5 }
      },
      {
        nodeId: 'node_2',
        nodeName: 'تحليل وكيل المبيعات الذكي',
        nodeType: 'ai',
        status: 'success',
        startedAt: '10:41:22.170',
        durationMs: 940,
        input: { prompt: 'حلل رغبة العميل وجديته', model: 'gemini-2.5-flash' },
        output: { score: 92, classification: 'High Intent Enterprise', keyPoints: ['WhatsApp API', 'CRM sync'] }
      },
      {
        nodeId: 'node_3',
        nodeName: 'هل العميل مؤهل ومستعجل؟',
        nodeType: 'logic',
        status: 'success',
        startedAt: '10:41:23.110',
        durationMs: 15,
        input: { score: 92, threshold: 75 },
        output: { branchTaken: 'true (Passes threshold)' }
      },
      {
        nodeId: 'node_4',
        nodeName: 'تسجيل في الـ CRM (مؤهل)',
        nodeType: 'action',
        status: 'success',
        startedAt: '10:41:23.125',
        durationMs: 310,
        input: { stage: 'qualified', priority: 'high' },
        output: { recordId: 'lead_1', status: 'created' }
      },
      {
        nodeId: 'node_5',
        nodeName: 'إرسال واتساب ترحيبي فوري',
        nodeType: 'action',
        status: 'success',
        startedAt: '10:41:23.435',
        durationMs: 435,
        input: { recipient: '+966501234567', template: 'vip_welcome' },
        output: { messageId: 'wamid.HBgLMzk2NjUw...', deliveryStatus: 'delivered' }
      }
    ]
  },
  {
    id: 'exec_1097',
    workflowId: 'wf_02',
    workflowName: 'توجيه الدعم الفني والحل التلقائي لقاعدة المعرفة',
    triggerType: 'WhatsApp Chat',
    status: 'success',
    startedAt: '2026-09-05 10:35:10',
    completedAt: '2026-09-05 10:35:12',
    durationMs: 2150,
    inputPayload: {
      userPhone: '+966554321098',
      messageText: 'كيف يمكنني ربط الـ Webhook الخاص بمتجري في شوبيفاي مع زين للأتمتة والذكاء الاصطناعي؟'
    },
    outputPayload: {
      kbArticleFound: 'KB-8821: Connecting Shopify Webhooks',
      confidenceScore: 0.96,
      replySent: true
    },
    traces: [
      {
        nodeId: 'node_201',
        nodeName: 'رسالة دعم فني واردة',
        nodeType: 'trigger',
        status: 'success',
        startedAt: '10:35:10.010',
        durationMs: 90,
        input: { source: 'WhatsApp' },
        output: { textLength: 72 }
      },
      {
        nodeId: 'node_202',
        nodeName: 'تحليل المشاعر ومستوى الاستعجال',
        nodeType: 'ai',
        status: 'success',
        startedAt: '10:35:10.100',
        durationMs: 650,
        input: {},
        output: { sentiment: 'neutral', urgency: 'normal' }
      },
      {
        nodeId: 'node_203',
        nodeName: 'البحث في قاعدة المعرفة والحل الذكي',
        nodeType: 'ai',
        status: 'success',
        startedAt: '10:35:10.750',
        durationMs: 1020,
        input: { searchContext: 'Shopify Webhooks' },
        output: { matchedDoc: 'Shopify Integration Guide', answerGenerated: true }
      },
      {
        nodeId: 'node_204',
        nodeName: 'إرسال الحل الفوري للعميل',
        nodeType: 'action',
        status: 'success',
        startedAt: '10:35:11.770',
        durationMs: 380,
        input: { channel: 'WhatsApp' },
        output: { status: 'sent' }
      }
    ]
  },
  {
    id: 'exec_1096',
    workflowId: 'wf_03',
    workflowName: 'متابعة وتحديث طلبات المتاجر عبر واتساب',
    triggerType: 'Shopify Webhook',
    status: 'failed',
    startedAt: '2026-09-05 09:50:00',
    completedAt: '2026-09-05 09:50:03',
    durationMs: 3100,
    errorMessage: 'فشل إرسال رسالة الواتساب: رقم الهاتف غير صالح (+966 00 000 0000)',
    inputPayload: {
      orderId: '#ORD-99120',
      customerPhone: '+966 00 000 0000',
      trackingNumber: 'SAUDI-POST-88127'
    },
    traces: [
      {
        nodeId: 'node_301',
        nodeName: 'إشعار شحن الطلب من المتجر',
        nodeType: 'trigger',
        status: 'success',
        startedAt: '09:50:00.000',
        durationMs: 140,
        input: { event: 'orders/fulfilled' },
        output: { validPayload: true }
      },
      {
        nodeId: 'node_302',
        nodeName: 'إرسال بطاقة التتبع عبر واتساب',
        nodeType: 'action',
        status: 'failed',
        startedAt: '09:50:00.140',
        durationMs: 2960,
        input: { phone: '+966 00 000 0000' },
        output: {},
        error: 'Error 400: Recipient phone number invalid or not on WhatsApp network. Triggering fallback error notification.'
      }
    ]
  }
];

export const INITIAL_KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: 'kb_1',
    title: 'دليل منتجات وخدمات زين للأتمتة والذكاء الاصطناعي الشامل',
    type: 'pdf',
    size: '2.4 MB',
    tokensCount: 48500,
    chunksCount: 64,
    status: 'ready',
    assignedAgents: ['agent_sales_01', 'agent_support_02'],
    lastUpdated: '2026-09-01',
    summary: 'Contains complete specifications of workflows, node catalog, pricing tiers, and integration parameters.',
    summaryAr: 'يشمل الشرح الكامل لخصائص المنصة، أنواع الـ Nodes، أسعار الخطط، وطريقة ربط الخدمات.'
  },
  {
    id: 'kb_2',
    title: 'سياسة الدعم الفني وحلول الأخطاء الشائعة (Troubleshooting)',
    type: 'docx',
    size: '1.1 MB',
    tokensCount: 32000,
    chunksCount: 42,
    status: 'ready',
    assignedAgents: ['agent_support_02'],
    lastUpdated: '2026-08-28',
    summary: 'Standard troubleshooting guides for webhooks, token limits, and API connection failures.',
    summaryAr: 'إجراءات تصحيح أخطاء الـ Webhooks وإعادة المحاولة ومعالجة استهلاك التوكنز.'
  },
  {
    id: 'kb_3',
    title: 'دليل نبرة البراند والمحتوى الإعلاني (Brand Voice)',
    type: 'txt',
    size: '420 KB',
    tokensCount: 15400,
    chunksCount: 18,
    status: 'ready',
    assignedAgents: ['agent_marketing_03'],
    lastUpdated: '2026-08-20',
    summary: 'Tone of voice guidelines, persuasive sales vocabulary, and audience psychology for GCC markets.',
    summaryAr: 'إرشادات النبرة والأسلوب التسويقي، المفردات الجاذبة وسيكولوجية الإقناع لعملاء الخليج.'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'عميل جديد فائق الأهمية (High-Score Lead)',
    titleAr: 'عميل جديد فائق الأهمية (High-Score Lead)',
    message: 'New lead "عبدالله السبيعي" was scored 92/100 by AI and routed to sales.',
    messageAr: 'قام الذكاء الاصطناعي بتأهيل العميل "عبدالله السبيعي" بدرجة 92% وإرسال بياناته للمبيعات.',
    type: 'success',
    timestamp: 'منذ 5 دقائق',
    read: false,
    workflowId: 'wf_01'
  },
  {
    id: 'notif_2',
    title: 'تنبيه خطأ في إرسال واتساب',
    titleAr: 'تنبيه خطأ في إرسال واتساب',
    message: 'Workflow "متابعة وتحديث طلبات المتاجر" encountered invalid phone number.',
    messageAr: 'واجه مسار تحديث الطلبات خطأ بسبب رقم هاتف غير صحيح للطلب #ORD-99120.',
    type: 'error',
    timestamp: 'منذ ساعة',
    read: false,
    workflowId: 'wf_03'
  },
  {
    id: 'notif_3',
    title: 'تحديث نجاح الذكاء الاصطناعي',
    titleAr: 'تحديث نجاح الذكاء الاصطناعي',
    message: 'AI Agents resolved 94.2% of customer queries today automatically.',
    messageAr: 'أنجز وكلاء الذكاء الاصطناعي 94.2% من استفسارات اليوم دون أي تدخل بشري.',
    type: 'info',
    timestamp: 'منذ 3 ساعات',
    read: true
  }
];

export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl_1',
    title: 'Lead Generation & WhatsApp Auto-Followup',
    titleAr: 'تأهيل العملاء الجدد ومتابعة الواتساب',
    category: 'Sales & Marketing',
    categoryAr: 'المبيعات والتسويق',
    description: 'Capture leads from forms, score intent with AI, add to CRM and send instant WhatsApp reply.',
    descriptionAr: 'استقبال العملاء من النماذج، تقييم الجدية بالذكاء الاصطناعي، وتسجيلهم في CRM ومراسلتهم عبر واتساب.',
    nodesCount: 5,
    popular: true,
    icon: 'UserCheck',
    badge: 'الأكثر استخدامًا'
  },
  {
    id: 'tmpl_2',
    title: '24/7 AI Customer Support & Escalation',
    titleAr: 'دعم العملاء الذكي 24/7 مع التصعيد',
    category: 'Customer Support',
    categoryAr: 'الدعم الفني والخدمة',
    description: 'Query company documentation to solve customer issues, escalate complex cases to human agents.',
    descriptionAr: 'البحث في قاعدة المعرفة لحل استفسارات العملاء تلقائياً، وتصعيد الحالات المعقدة لفريق العمل.',
    nodesCount: 4,
    popular: true,
    icon: 'Headphones',
    badge: 'يوفر 70% من الوقت'
  },
  {
    id: 'tmpl_3',
    title: 'E-commerce Order Status & Tracking',
    titleAr: 'متابعة شحنات المتاجر الإلكترونية',
    category: 'E-Commerce',
    categoryAr: 'التجارة الإلكترونية',
    description: 'Triggered when order ships. Sends live WhatsApp tracking link and collects 5-star review.',
    descriptionAr: 'يعمل عند شحن الطلب؛ يرسل رابط التتبع الحي عبر واتساب ويطلب تقييم تجربة الشراء.',
    nodesCount: 4,
    popular: true,
    icon: 'ShoppingBag',
    badge: 'زيادة التقييمات'
  },
  {
    id: 'tmpl_4',
    title: 'Smart Meeting Booking & Reminders',
    titleAr: 'حجز المواعيد الآلي والتذكيرات الذكية',
    category: 'Productivity',
    categoryAr: 'الإنتاجية وإدارة المواعيد',
    description: 'Sync Google Calendar, send confirmation email with Zoom link, and WhatsApp reminders.',
    descriptionAr: 'مزامنة تقويم جوجل، إرسال رابط الاجتماع عبر البريد وتذكيرات واتساب قبل الموعد بنصف ساعة.',
    nodesCount: 6,
    popular: false,
    icon: 'Calendar',
    badge: 'بدون تفويت مواعيد'
  },
  {
    id: 'tmpl_5',
    title: 'Social Media AI Content Multi-Publisher',
    titleAr: 'توليد ونشر المحتوى على منصات التواصل',
    category: 'Marketing',
    categoryAr: 'التسويق الرقمي',
    description: 'Generate weekly niche posts, hashtags, and schedule publication across Twitter/X and LinkedIn.',
    descriptionAr: 'توليد مقالات ومنشورات أسبوعية بالذكاء الاصطناعي وجدولتها آليًا على منصات التواصل.',
    nodesCount: 5,
    popular: false,
    icon: 'Share2',
    badge: 'أتمتة المحتوى'
  },
  {
    id: 'tmpl_6',
    title: 'Invoice Generation & Payment Follow-up',
    titleAr: 'إصدار الفواتير ومتابعة الدفع التلقائي',
    category: 'Finance & Invoicing',
    categoryAr: 'المالية والفواتير',
    description: 'Create branded PDF invoice, email client with payment gateway link, and follow up before due date.',
    descriptionAr: 'إنشاء فاتورة PDF رسمية، إرسال رابط الدفع الإلكتروني، ومتابعة التحصيل قبل تاريخ الاستحقاق.',
    nodesCount: 5,
    popular: false,
    icon: 'Receipt',
    badge: 'تسريع التحصيل'
  }
];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalExecutions: 14850,
  successRate: 98.8,
  failureRate: 1.2,
  averageLatencyMs: 1420,
  aiTokensConsumed: 4890000,
  activeWorkflows: 8,
  totalLeadsGenerated: 1240,
  conversionRate: 28.4,
  dailyStats: [
    { date: '30 Aug', executions: 1210, success: 1198, failed: 12, aiCalls: 1140 },
    { date: '31 Aug', executions: 1450, success: 1435, failed: 15, aiCalls: 1380 },
    { date: '01 Sep', executions: 1680, success: 1660, failed: 20, aiCalls: 1590 },
    { date: '02 Sep', executions: 1920, success: 1895, failed: 25, aiCalls: 1820 },
    { date: '03 Sep', executions: 2150, success: 2125, failed: 25, aiCalls: 2040 },
    { date: '04 Sep', executions: 2480, success: 2455, failed: 25, aiCalls: 2380 },
    { date: '05 Sep', executions: 2610, success: 2590, failed: 20, aiCalls: 2510 }
  ]
};

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm_1',
    name: 'سلطان القحطاني',
    email: 'sultan@zainauto.ai',
    role: 'owner',
    roleAr: 'المالك والمؤسس (Owner)',
    avatar: '👑',
    status: 'active',
    lastActive: 'الآن (نشط)'
  },
  {
    id: 'tm_2',
    name: 'رنا الشهري',
    email: 'rana@zainauto.ai',
    role: 'admin',
    roleAr: 'مدير النظام (Admin)',
    avatar: '👩‍💼',
    status: 'active',
    lastActive: 'منذ 15 دقيقة'
  },
  {
    id: 'tm_3',
    name: 'أحمد التميمي',
    email: 'ahmed@zainauto.ai',
    role: 'editor',
    roleAr: 'مطور ومصمم مسارات (Editor)',
    avatar: '👨‍💻',
    status: 'active',
    lastActive: 'منذ ساعتين'
  },
  {
    id: 'tm_4',
    name: 'منى الشامسي',
    email: 'mona@zainauto.ai',
    role: 'viewer',
    roleAr: 'مشاهد ومحلل تقارير (Viewer)',
    avatar: '📈',
    status: 'active',
    lastActive: 'أمس'
  }
];

export const WORKSPACES_LIST: Workspace[] = [
  {
    id: 'ws_main',
    name: 'Zain Agency Hub (الرئيسية)',
    nameAr: 'مساحة وكالة زين (الرئيسية)',
    icon: '⚡',
    membersCount: 4,
    workflowsCount: 8,
    isCurrent: true
  },
  {
    id: 'ws_sales',
    name: 'Sales & Growth Team',
    nameAr: 'فريق المبيعات والنمو',
    icon: '🎯',
    membersCount: 3,
    workflowsCount: 5
  },
  {
    id: 'ws_support',
    name: 'Customer Care & 24/7 Bot',
    nameAr: 'خدمة العملاء والدعم الذكي',
    icon: '🎧',
    membersCount: 2,
    workflowsCount: 3
  }
];

// Technical specifications and Roadmap data as requested in prompt:
export const PROJECT_ROADMAP_SPECS = {
  title: 'خارطة الطريق ومواصفات منصة زين للأتمتة والذكاء الاصطناعي الشاملة',
  phases: [
    {
      phase: 'المرحلة 1: إطلاق النواة والمحرر البصري (MVP Core)',
      duration: 'الربع الأول (Q1)',
      status: 'completed',
      statusText: 'تم الإنجاز بنجاح (جاهز للاستخدام)',
      badgeColor: 'emerald',
      items: [
        'بناء Drag & Drop Visual Workflow Builder مع كوابل ديناميكية وإحداثيات فورية.',
        'توفير الحزمة الأساسية من الـ Triggers (Webhooks, Form Submissions, Schedule).',
        'تضمين حزمة الـ Actions الأساسية (Email, WhatsApp API, Internal CRM sync).',
        'محرك تنفيذ متزامن وتوليد سجلات العمليات اللحظية (Execution Logs & Traces).',
        'دعم ثنائي اللغة (عربي / إنجليزي) مع توافق كامل للشاشات المتنقلة والمكتبية.'
      ]
    },
    {
      phase: 'المرحلة 2: منظومة الذكاء الاصطناعي المتقدمة والوكلاء (AI Agents Ecosystem)',
      duration: 'الربع الثاني (Q2)',
      status: 'active',
      statusText: 'المرحلة الحالية (قيد التشغيل)',
      badgeColor: 'purple',
      items: [
        'إطلاق استوديو وكلاء الذكاء الاصطناعي (Sales Agent, Support Agent, Marketing Agent).',
        'ميزة توليد مسارات العمل من الوصف الطبيعي (AI Workflow Generator).',
        'ربط قاعدة المعرفة (RAG / Knowledge Base) مع ملفات PDF و DOCX وروابط الويب.',
        'عقد الذكاء الاصطناعي المتخصصة (Sentiment Analysis, Data Extraction, Content Gen).',
        'مساعد ذكي تفاعلي مدمج في لوحة التحكم (In-App Copilot).'
      ]
    },
    {
      phase: 'المرحلة 3: متجر القوالب والتكاملات المفتوحة (Marketplace & Ecosystem)',
      duration: 'الربع الثالث (Q3)',
      status: 'upcoming',
      statusText: 'مجدول للتطوير',
      badgeColor: 'sky',
      items: [
        'نظام إضافات وقوالب مجتمعية (Community Templates & Plugin Store).',
        'تكاملات عميقة مع Shopify, Salla, Zid, WooCommerce, Zoho, HubSpot.',
        'محرك معالجة متوازي فائق السرعة عبر Redis Queue و Workers موزعة.',
        'نظام توجيه مسارات العمل المتقدم (Multi-Branch Routers & Conditional Looping).'
      ]
    },
    {
      phase: 'المرحلة 4: المؤسسات الكبرى والامتثال الأمني (Enterprise & Scaling)',
      duration: 'الربع الرابع (Q4)',
      status: 'planned',
      statusText: 'مخطط مستقبلي',
      badgeColor: 'slate',
      items: [
        'نظام عزل البيانات للشركات الكبرى (Single-Tenant Private Deployments).',
        'توافق كامل مع معايير الأمان الوطنية وحماية البيانات (PDPL & ISO 27001).',
        'تسجيل موحد Single Sign-On (SSO / SAML) وسجل تدقيق تفصيلي (Audit Trail).',
        'ضمان تشغيل ومستوى خدمة 99.99% SLA مع دعم فني مخصص على مدار الساعة.'
      ]
    }
  ],
  technicalSpecs: [
    {
      category: 'المحرك والبنية التحتية (Core Architecture)',
      specs: [
        { name: 'نمط المعمارية', value: 'Event-Driven Microservices + Asynchronous Event Queue' },
        { name: 'محرك المسارات البصري', value: 'SVG Bezier Interactivity + Node Graph State Machine' },
        { name: 'سرعة الاستجابة اللحظية', value: '< 250ms زمن معالجة عقدة القرار والتحويل' },
        { name: 'التوافقية البرمجية', value: 'RESTful API v1 + OpenAPI 3.0 Specs + Real-time Webhooks' }
      ]
    },
    {
      category: 'قدرات الذكاء الاصطناعي (AI & Cognitive Engine)',
      specs: [
        { name: 'النماذج المدعومة', value: 'Gemini 2.5 Flash / Gemini 2.5 Pro مع زمن استجابة فائق السرعة' },
        { name: 'قاعدة المعرفة RAG', value: 'Vector Embeddings + Cosine Similarity Chunker' },
        { name: 'التحليل اللغوي', value: 'فهم عميق للهجات العربية واللغة الإنجليزية والألفاظ العامية والتجارية' },
        { name: 'حدود التوكنز والتحكم', value: 'التحكم الدقيق بـ Max Tokens و Temperature لكل وكيل وعقدة' }
      ]
    },
    {
      category: 'الأمان والامتثال (Security & Resilience)',
      specs: [
        { name: 'تشفير البيانات', value: 'تشفير البيانات الحساسة ومفاتيح الربط عبر AES-256 و TLS 1.3' },
        { name: 'التحكم بالصلاحيات', value: 'Role-Based Access Control (RBAC: Owner, Admin, Editor, Viewer)' },
        { name: 'التعافي من الأخطاء', value: 'Automatic Exponential Backoff Retry + Dead Letter Queue' },
        { name: 'سجلات المراقبة', value: 'سجل كامل لكل خطوة تنفيذ (Input, Output, Latency, Errors)' }
      ]
    }
  ],
  targetAudience: [
    {
      title: 'الشركات الناشئة والمشاريع الصغيرة (SMBs & Startups)',
      icon: 'Rocket',
      description: 'أتمتة عمليات المبيعات وتأهيل العملاء دون الحاجة لتوظيف طاقم كبير، مما يوفر حتى 60% من تكاليف التشغيل.',
      examples: ['إشعار المبيعات فور وصول زبون جديد', 'إرسال العروض الترويجية عبر واتساب', 'مزامنة فواتير الدفع']
    },
    {
      title: 'وكالات التسويق والأعمال (Agencies & Consultancies)',
      icon: 'Briefcase',
      description: 'إدارة حسابات وأتمتة حملات عدة عملاء في مساحات عمل (Workspaces) مفصولة مع تقديم حلول متقدمة للعملاء كخدمة مدفوعة.',
      examples: ['توليد محتوى الحملات بضغطة زر', 'متابعة الـ Leads من إعلانات تيك توك وسناب شات', 'تقارير أداء أسبوعية آلية']
    },
    {
      title: 'المتاجر الإلكترونية (E-Commerce Brands)',
      icon: 'ShoppingBag',
      description: 'متابعة بوليصات الشحن، استعادة سلات الشراء المتروكة، إرسال فواتير الطلبات، وجمع التقييمات الإيجابية عبر واتساب.',
      examples: ['تحديث تتبع أرامكس وسمسا تلقائياً', 'إرسال كوبون خصم بعد 3 ساعات من ترك السلة', 'استبيان الرضا الفوري']
    },
    {
      title: 'فرق الدعم الفني وخدمة العملاء (Support Teams)',
      icon: 'Headphones',
      description: 'الرد الفوري على الأسئلة الشائعة من خلال ربط وكلاء الذكاء الاصطناعي بقاعدة معلومات الشركة، مما يخفض زمن الاستجابة إلى ثوانٍ.',
      examples: ['حل مشكلات شحن الحسابات', 'توجيه العميل لصفحة الشروط والأحكام', 'تصعيد الحالات الحرجة للمشرفين']
    }
  ],
  useCases: [
    {
      title: 'الحالة 1: استقبال استفسار واتساب ← تأهيل ذكي ← إضافة لـ CRM ← إشعار مبيعات',
      steps: [
        '1. العميل يرسل رسالة "أريد معرفة أسعار خدمات التسويق لشركتي".',
        '2. عقدة New Message تستقبل الرسالة وتمررها لـ AI Sales Agent.',
        '3. الذكاء الاصطناعي يستخرج اسم العميل ونوع نشاطه ويحدد نبرته كـ "مهتم ومستعجل".',
        '4. عقدة IF/ELSE توجه العميل إلى مسار العملاء المميزين (High Value).',
        '5. يتم تسجيل العميل في CRM وتحديث مرحلته إلى "مؤهل".',
        '6. إرسال رد واتساب فوري برابط جدول المقابلات + إشعار فوري لفريق المبيعات على سلاك.'
      ]
    },
    {
      title: 'الحالة 2: استمارة على الموقع ← فحص الجدية ← إرسال بروشور مخصص ← متابعة بعد يومين',
      steps: [
        '1. زائر يسجل في نموذج "طلب استشارة مجانية".',
        '2. الذكاء الاصطناعي يصنف حجم الشركة والميزانية.',
        '3. النظام يولد عرض PDF مخصص باسم شركته ويرسله عبر البريد الإلكتروني.',
        '4. عقدة Delay تنتظر 48 ساعة.',
        '5. إذا لم يقم العميل بفتح الرابط، يتم إرسال رسالة واتساب ودية: "مرحباً محمد، هل اطلعت على العرض؟ نحن هنا للإجابة عن أي استفسار".'
      ]
    }
  ]
};

export const INITIAL_FORMS = INITIAL_SMART_FORMS;

export const ROADMAP_PHASES = [
  {
    id: 'phase_1',
    phase: 'المرحلة 1: MVP Core',
    title: 'Core Engine & Visual Drag & Drop Builder',
    titleAr: 'المحرك الأساسي ومحرر الـ Workflows البصري',
    description: 'Visual builder with real-time SVG connectors, basic triggers, actions, and execution simulator.',
    descriptionAr: 'المحرر البصري التفاعلي، حزمة Triggers و Actions الأساسية ومحاكي التنفيذ.',
    status: 'completed',
    features: ['Canvas Drag & Drop', 'Webhook & Schedule Triggers', 'Execution Logs', 'RTL Arabic / English']
  },
  {
    id: 'phase_2',
    phase: 'المرحلة 2: AI Agents & RAG',
    title: 'AI Agents Studio & Vector Knowledge Base',
    titleAr: 'استوديو وكلاء الذكاء الاصطناعي وقاعدة المعرفة',
    description: 'Natural language workflow generator, multi-agent playground, PDF vector grounding with Gemini AI.',
    descriptionAr: 'توليد المسارات باللغة الطبيعية، استوديو الوكلاء المتخصصين، واسترجاع المعرفة RAG.',
    status: 'in_progress',
    features: ['AI Workflow Generator', 'Interactive Agent Playground', 'Document Vectorizer (RAG)', 'Zain Copilot']
  },
  {
    id: 'phase_3',
    phase: 'المرحلة 3: Marketplace & Ecosystem',
    title: 'Templates Hub & Local E-Commerce Integrations',
    titleAr: 'متجر القوالب والتكاملات المحلية والتجارة الإلكترونية',
    description: 'One-click community template catalog, deep integration with Salla, Zid, Shopify, and WhatsApp Cloud API.',
    descriptionAr: 'قوالب جاهزة، تكامل مباشر مع منصات سلة، زد، وشوبيفاي، ورسائل واتساب التلقائية.',
    status: 'planned',
    features: ['Salla & Zid Connectors', 'WhatsApp Cloud API Manager', 'Community Templates Sharing', 'Advanced Conditional Routers']
  },
  {
    id: 'phase_4',
    phase: 'المرحلة 4: Enterprise Scale',
    title: 'Enterprise RBAC, Multi-tenancy & SLA',
    titleAr: 'المؤسسات الكبرى وحوكمة الصلاحيات والأمان',
    description: 'Private multi-tenant cloud workspaces, SSO / SAML login, 99.99% uptime SLA and automated retries.',
    descriptionAr: 'بيئات سحابية مخصصة، صلاحيات تدقيق تفصيلية، دعم فني متقدم وضمان جاهزية 99.99%.',
    status: 'planned',
    features: ['Single-Tenant Private VPC', 'Custom Domain Branding', 'Role-Based Access Control', 'Automated Dead-Letter Queue']
  }
];

export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free Starter',
    priceMonthly: 0,
    priceAnnual: 0,
    maxExecutionsPerMonth: 1000,
    description: 'Explore visual automation and test AI workflows with generous free tier.',
    descriptionAr: 'استكشف قوة الأتمتة وجرّب بناء المسارات مجاناً للبدء.',
    features: [
      '1,000 عملية تنفيذ شهرياً (Executions)',
      '3 مسارات عمل نشطة (Active Workflows)',
      '1 وكيل ذكاء اصطناعي (AI Agent)',
      'دعم الـ Webhooks الأساسية',
      'تحديثات دورية وسجل عمليات 7 أيام'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    priceMonthly: 29,
    priceAnnual: 290,
    maxExecutionsPerMonth: 15000,
    description: 'For growing businesses and freelancers automating daily operations.',
    descriptionAr: 'للشركات الناشئة والمستقلين لأتمتة خدمة العملاء والمبيعات اليومية.',
    features: [
      '15,000 عملية تنفيذ شهرياً',
      'مسارات عمل غير محدودة (Unlimited)',
      '3 وكلاء ذكاء اصطناعي متخصصين',
      'تكامل WhatsApp Business API كامل',
      'ربط Google Sheets & CRM داخلي',
      'سجل عمليات وتتبع أخطاء 30 يوماً'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Automation',
    priceMonthly: 79,
    priceAnnual: 790,
    maxExecutionsPerMonth: 60000,
    description: 'For growing e-commerce brands and active digital companies.',
    descriptionAr: 'للمتاجر والشركات المتنامية التي تحتاج سرعة استجابة فائقة وتحليلات عميقة.',
    features: [
      '60,000 عملية تنفيذ شهرياً',
      'وكلاء ذكاء اصطناعي غير محدودين',
      'قاعدة معرفة RAG مخصصة (تصل إلى 100 مستند)',
      'معالجة فائقة السرعة بزمن استجابة <300ms',
      'إعادة المحاولة التلقائية عند الفشل (Auto-retry)',
      'دعم فني عبر تذاكر ذات أولوية'
    ]
  },
  {
    id: 'agency',
    name: 'Agency & Scale',
    priceMonthly: 199,
    priceAnnual: 1990,
    maxExecutionsPerMonth: 250000,
    description: 'For digital agencies and scale-ups managing multiple customer workspaces.',
    descriptionAr: 'للوكالات والشركات الكبرى لإدارة حسابات عدة عملاء وتكاملات مخصصة.',
    features: [
      '250,000 عملية تنفيذ شهرياً',
      'مساحات عمل متعددة للعملاء (Multi-Tenant Workspaces)',
      'واجهة بيضاء مخصصة (White-label ready)',
      'تكاملات مخصصة عبر REST API و Webhooks غير محدودة',
      'أعلى أولوية معالجة في السحابة',
      'مدير حساب تقني مخصص 24/7'
    ]
  }
];
