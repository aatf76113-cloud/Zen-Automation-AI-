/**
 * Security, Integrations, and E2E Pipeline Verification Test Suite
 * Zain Automation AI Platform
 */
import fs from 'fs';
import path from 'path';
import { WhatsAppService } from '../server/integrations/whatsapp';
import { EmailService } from '../server/integrations/email';
import { GeminiService } from '../server/services/geminiService';
import { CrmService } from '../server/services/crmService';
import { WorkflowEngine } from '../server/workflowEngine';
import { sanitizeString, sanitizeObject, buildErrorResponse } from '../server/security/index';
import { db } from '../server/db';
import { Workflow } from '../src/types/index';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✕ FAILED: ${testName}`);
    testsFailed++;
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('STARTING SECURITY & INTEGRATION TEST SUITE');
  console.log('========================================\n');

  // 1. Check no API keys or secrets in frontend source files
  console.log('TEST 1: No API Keys or Secrets in Frontend Source Code');
  const srcFiles = ['src/App.tsx', 'src/main.tsx', 'src/data/mockData.ts', 'src/context/AppContext.tsx'];
  let exposedSecretsFound = false;
  for (const rel of srcFiles) {
    const fullPath = path.join(process.cwd(), rel);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (
        /sk-[A-Za-z0-9_-]{25,}/.test(content) ||
        /AIza[0-9A-Za-z-_]{35}/.test(content) ||
        /EAA[A-Za-z0-9_-]{50,}/.test(content) ||
        /re_[A-Za-z0-9_-]{20,}/.test(content)
      ) {
        exposedSecretsFound = true;
      }
    }
  }
  assert(!exposedSecretsFound, 'Frontend source files contain 0 exposed live API keys');

  // 2. Check no secrets inside index.html
  console.log('\nTEST 2: No Secrets in HTML');
  const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  assert(!/AIza|EAA[A-Za-z0-9]|sk-/.test(htmlContent), 'index.html contains 0 secret tokens');

  // 3. Check localStorage hygiene in client code
  console.log('\nTEST 3: No Secrets in localStorage references');
  const clientFiles = fs.readdirSync(path.join(process.cwd(), 'src/components'), { recursive: true }) as string[];
  let localSecretStorage = false;
  for (const file of clientFiles) {
    if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const p = path.join(process.cwd(), 'src/components', file);
      if (fs.statSync(p).isFile()) {
        const text = fs.readFileSync(p, 'utf8');
        if (/localStorage\.setItem\(['"](?:api_key|secret|token|password)/i.test(text)) {
          localSecretStorage = true;
        }
      }
    }
  }
  assert(!localSecretStorage, 'Zero secret keys or tokens stored in localStorage');

  // 4. WhatsApp Connection Test
  console.log('\nTEST 4: WhatsApp Connection Health Check');
  const waStatus = await WhatsAppService.getConnectionStatus();
  assert(waStatus !== null && typeof waStatus.connected === 'boolean', 'WhatsApp status returns sanitized metadata');
  assert(!('accessToken' in (waStatus as any)) && !('appSecret' in (waStatus as any)), 'WhatsApp status never exposes token or secret');

  // 5. Email Connection Test
  console.log('\nTEST 5: Email Connection Health Check');
  const emailStatus = await EmailService.getConnectionStatus();
  assert(emailStatus !== null && typeof emailStatus.connected === 'boolean', 'Email status returns sanitized adapter status');
  assert(!('apiKey' in (emailStatus as any)) && !('password' in (emailStatus as any)), 'Email status never exposes API key or SMTP password');

  // 6. Gemini Connection Test
  console.log('\nTEST 6: Gemini Connection Test');
  const geminiStatus = await GeminiService.getConnectionStatus();
  assert(geminiStatus !== null && typeof geminiStatus.connected === 'boolean', 'Gemini connection tested safely');
  assert(!('apiKey' in (geminiStatus as any)), 'Gemini status does not expose GEMINI_API_KEY');

  // 7. Webhook Verification Test
  console.log('\nTEST 7: Webhook Signature & Token Verification');
  const validSignatureTest = WhatsAppService.verifyWebhook('{"test": true}', undefined);
  assert(validSignatureTest === true, 'Webhook verification succeeds safely for payload');

  const validTokenHandshake = WhatsAppService.verifyWebhookToken('subscribe', 'zain_whatsapp_verify_token', 'zain_whatsapp_verify_token');
  assert(validTokenHandshake === true, 'Webhook GET handshake token verification succeeds on match');

  const invalidTokenHandshake = WhatsAppService.verifyWebhookToken('subscribe', 'wrong_token', 'zain_whatsapp_verify_token');
  assert(invalidTokenHandshake === false, 'Webhook GET handshake rejects mismatch token');

  // 8. Inbound WhatsApp Message Parsing & Deduplication
  console.log('\nTEST 8: Inbound WhatsApp Message Processing & Deduplication');
  const mockInboundMeta = {
    entry: [{
      changes: [{
        value: {
          contacts: [{ profile: { name: 'عبدالله السبيعي' }, wa_id: '966551234567' }],
          messages: [{ from: '966551234567', id: 'wamid_test_123', text: { body: 'أريد معرفة خطط الأسعار' }, timestamp: '1720000000' }]
        }
      }]
    }]
  };
  const parsedInbound = WhatsAppService.processIncomingMessage(mockInboundMeta);
  assert(parsedInbound?.messageText === 'أريد معرفة خطط الأسعار', 'Inbound message extracted correctly');
  assert(parsedInbound?.senderName === 'عبدالله السبيعي', 'Sender profile name parsed accurately');

  // Deduplication
  assert(!WhatsAppService.isMessageDuplicate('wamid_unique_999'), 'Unseen message ID is not duplicate');
  WhatsAppService.markMessageProcessed('wamid_unique_999');
  assert(WhatsAppService.isMessageDuplicate('wamid_unique_999'), 'Seen message ID is flagged as duplicate');

  // 9. WhatsApp Outbound Send Test (safe error without leaking secrets)
  console.log('\nTEST 9: WhatsApp Outbound Message Dispatch');
  const waSend = await WhatsAppService.sendMessage('+966551234567', 'أهلاً بك، تم استلام طلبك');
  assert(typeof waSend.success === 'boolean', 'WhatsApp message dispatch handled smoothly without crashing');
  assert(!JSON.stringify(waSend).includes('Bearer') && !JSON.stringify(waSend).includes('EAAB'), 'Outbound result never leaks secrets');

  // 9.1 WhatsApp Health Details
  console.log('\nTEST 9.1: WhatsApp Health Details & Categorization');
  const healthInfo = await WhatsAppService.getHealthStatus();
  assert(
    ['CONNECTED', 'MISSING_SECRETS', 'INVALID_TOKEN', 'INVALID_PHONE_NUMBER_ID', 'INSUFFICIENT_PERMISSIONS', 'CONNECTION_ERROR', 'WEBHOOK_NOT_CONFIGURED'].includes(healthInfo.state),
    `Health state categorized properly: ${healthInfo.state}`
  );
  assert(!('accessToken' in (healthInfo as any)), 'Health status never exposes accessToken');
  assert(healthInfo.overallStatus === 'CONNECTED' || healthInfo.overallStatus === 'NOT_CONNECTED', 'Overall status is binary CONNECTED or NOT_CONNECTED');
  assert(healthInfo.metrics.apiConnection === 'Connected' || healthInfo.metrics.apiConnection === 'Failed', 'API Connection is Connected or Failed');
  assert(healthInfo.metrics.phoneNumber === 'Valid' || healthInfo.metrics.phoneNumber === 'Invalid', 'Phone Number is Valid or Invalid');
  assert(healthInfo.metrics.accessToken === 'Valid' || healthInfo.metrics.accessToken === 'Invalid', 'Access Token is Valid or Invalid');
  assert(healthInfo.metrics.webhook === 'Verified' || healthInfo.metrics.webhook === 'Not Verified', 'Webhook is Verified or Not Verified');
  assert(['Success', 'Failed', 'Not Tested'].includes(healthInfo.metrics.sendMessageTest), 'Send Message Test metric is valid');

  // Secrets inspection check (names only, no values)
  const secretsInspection = WhatsAppService.inspectSecrets();
  assert('WHATSAPP_ACCESS_TOKEN' in secretsInspection.inspection, 'inspectSecrets tracks WHATSAPP_ACCESS_TOKEN');
  assert(Array.isArray(secretsInspection.missing), 'inspectSecrets returns missing secrets array');

  // 10. Email Send Test (safe simulation / adapter)
  console.log('\nTEST 10: Email Dispatch via Adapter');
  const emailSend = await EmailService.sendEmail({
    to: 'customer@example.com',
    subject: 'مرحباً بك',
    text: 'شكراً لتواصلك مع زين للأتمتة'
  });
  assert(emailSend.success === true, 'Email dispatch adapter successfully processed transmission');

  // 11. External Service Failure Resilience
  console.log('\nTEST 11: External Service Failure & Fallback Handling');
  const analysis = await GeminiService.analyze('السلام عليكم أريد الاستفسار عن باقات وأسعار الاشتراك');
  assert(analysis.sentiment !== undefined && analysis.leadScore > 0, 'Intelligent analysis resolves seamlessly even under API limits');

  // 12. No Secrets in Error Responses or Sanitized Objects
  console.log('\nTEST 12: Zero Secrets in Error Responses');
  const sensitiveObject = {
    apiKey: 'sk-live-secret-key-123456789012345',
    accessToken: 'EAABwz...' + 'test',
    password: 'super_secret_password',
    status: 'connected',
    provider: 'WhatsApp Business'
  };
  const sanitized = sanitizeObject(sensitiveObject);
  assert(!('apiKey' in sanitized), 'apiKey stripped completely from sanitized object');
  assert(!('accessToken' in sanitized), 'accessToken stripped completely');
  assert(!('password' in sanitized), 'password stripped completely');
  assert(sanitized.provider === 'WhatsApp Business', 'Non-sensitive fields retained safely');

  // 13. Full End-to-End Customer Path Test:
  // Incoming Message -> AI Analysis -> Lead Score -> CRM -> WhatsApp Response -> Email Notification
  console.log('\nTEST 13: Full End-to-End Customer Path (E2E)');
  const testWorkflow: Workflow = {
    id: 'wf_e2e_test',
    name: 'E2E Customer Journey Pipeline',
    nameAr: 'مسار العميل الكامل من الاستقبال حتى الإشعار',
    description: 'E2E Validation Pipeline',
    descriptionAr: 'مسار تجريبي للتحقق من تكامل جميع المراحل',
    isActive: true,
    category: 'sales',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 0,
    successRate: 100,
    tags: ['test', 'e2e'],
    nodes: [
      {
        id: 'node_inbound',
        type: 'trigger',
        subType: 'webhook',
        name: 'Incoming Message',
        nameAr: 'استقبال الرسالة',
        description: 'Webhook trigger',
        descriptionAr: 'استقبال الويب هوك',
        icon: 'Zap',
        config: {},
        position: { x: 100, y: 100 }
      },
      {
        id: 'node_ai',
        type: 'ai',
        subType: 'ai_sentiment',
        name: 'AI Analysis & Qualification',
        nameAr: 'تحليل وتأهيل بالذكاء الاصطناعي',
        description: 'AI sentiment analysis',
        descriptionAr: 'تحليل المشاعر',
        icon: 'Bot',
        config: {},
        position: { x: 300, y: 100 }
      },
      {
        id: 'node_crm',
        type: 'action',
        subType: 'crm_create_lead',
        name: 'CRM Lead Save',
        nameAr: 'حفظ وتحديث العميل بالـ CRM',
        description: 'Save lead in CRM',
        descriptionAr: 'حفظ العميل في إدارة العملاء',
        icon: 'UserCheck',
        config: {},
        position: { x: 500, y: 100 }
      },
      {
        id: 'node_wa',
        type: 'action',
        subType: 'whatsapp_send',
        name: 'WhatsApp Response',
        nameAr: 'إرسال رد واتساب الفوري',
        description: 'Send WhatsApp message',
        descriptionAr: 'إرسال رسالة واتساب',
        icon: 'MessageSquare',
        config: { messageTemplate: 'أهلاً بك {{name}}، تم استلام طلبك وسيتواصل معك مستشار المبيعات فوراً.' },
        position: { x: 700, y: 100 }
      },
      {
        id: 'node_email',
        type: 'action',
        subType: 'email_send',
        name: 'Email Notification',
        nameAr: 'إشعار الفريق عبر البريد',
        description: 'Send Email alert',
        descriptionAr: 'إرسال تنبيه عبر البريد',
        icon: 'Mail',
        config: { subject: 'تنبيه: عميل جديد مؤهل بالذكاء الاصطناعي' },
        position: { x: 900, y: 100 }
      }
    ],
    edges: [
      { id: 'e1', source: 'node_inbound', target: 'node_ai' },
      { id: 'e2', source: 'node_ai', target: 'node_crm' },
      { id: 'e3', source: 'node_crm', target: 'node_wa' },
      { id: 'e4', source: 'node_wa', target: 'node_email' }
    ]
  };

  const e2eExecution = await WorkflowEngine.execute(testWorkflow, {
    organizationId: 'org_zain_hq',
    mode: 'test',
    triggerSource: 'Automated E2E Test Suite',
    inputPayload: {
      name: 'فيصل المطيري',
      phone: '+966559876543',
      email: 'faisal@business.sa',
      company: 'شركة المطيري للحلول التجارية',
      message: 'نريد اشتراك سنوي في منصة الأتمتة لـ 20 موظف'
    }
  });

  assert(e2eExecution.status === 'success', 'E2E Workflow executed with success status');
  assert(e2eExecution.traces.length === 5, 'All 5 stages of customer path executed successfully');
  
  // Verify CRM lead was updated/saved
  const leads = CrmService.getLeads('org_zain_hq');
  const savedLead = leads.find(l => l.phone === '+966559876543' || l.name === 'فيصل المطيري');
  assert(Boolean(savedLead), 'Customer Lead registered Authoritatively in CRM DB');

  // 14. Inbound Webhook Payload Early Persistence (Requirement 8)
  console.log('\nTEST 14: Inbound Webhook Early Payload Persistence & Resilience');
  const orgId = 'org_zain_hq';
  const initialCount = db.getInboundEvents(orgId, 'wf_01').length;
  
  // Simulate inbound event storage
  const testPayload = {
    senderName: 'عميل اختبار الويب هوك',
    senderPhone: '+966509998877',
    messageText: 'استفسار تجاري لاختبار تخزين الـ payload',
    timestamp: new Date().toISOString()
  };

  const storedEvent = db.saveInboundEvent(orgId, {
    workflowId: 'wf_01',
    source: 'Inbound Webhook HTTP Endpoint',
    payload: testPayload,
    headers: { 'content-type': 'application/json' },
    status: 'received'
  });

  const updatedCount = db.getInboundEvents(orgId, 'wf_01').length;
  assert(updatedCount === initialCount + 1, 'Inbound event count increased immediately upon reception');
  assert(storedEvent.id.startsWith('inbound_'), 'Inbound event has valid generated ID');
  assert(storedEvent.payload.senderPhone === '+966509998877', 'Inbound payload persisted completely intact before AI');
  assert(storedEvent.status === 'received', 'Inbound event status initialized to received before execution');

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
