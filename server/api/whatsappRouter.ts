/**
 * Dedicated WhatsApp API Router
 * Endpoints:
 * - GET /api/whatsapp/health : Live Meta API Health Check with exact metrics
 * - POST /api/whatsapp/test-message : Real Outbound Test Dispatch
 * - GET /api/whatsapp/info : Dashboard status metadata without exposing credentials
 * - POST /api/whatsapp/test-webhook : Local webhook verification handshake self-check
 */
import { Router, Request, Response } from 'express';
import { WhatsAppService } from '../integrations/whatsapp';
import { db } from '../db';
import { safeLogger } from '../security/index';

export const whatsappRouter = Router();

// In-memory rate-limiter for test-message endpoint (max 10 sends per minute per IP)
const testMessageRateMap = new Map<string, { count: number; resetAt: number }>();

function checkTestMessageRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const current = testMessageRateMap.get(ip);
  if (!current || now > current.resetAt) {
    testMessageRateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

function resolveOrgId(req: Request): string {
  return (req.headers['x-organization-id'] as string) || 'org_zain_hq';
}

/**
 * WhatsApp Real Connection Health Check
 * GET /api/whatsapp/health
 */
whatsappRouter.get('/health', async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  const creds = db.getRawCredentials(orgId, 'int_whatsapp') || undefined;

  try {
    const health = await WhatsAppService.getHealthStatus(creds);

    return res.status(200).json({
      status: health.connected ? 'ok' : 'error',
      overallStatus: health.overallStatus,
      whatsapp: {
        configured: health.configured,
        connected: health.connected,
        overallStatus: health.overallStatus,
        phoneNumber: health.phoneNumber,
        verifiedName: health.verifiedName,
        phoneNumberId: health.phoneNumberId,
        wabaId: health.wabaId,
        state: health.state,
        message: health.message,
        metrics: health.metrics,
        secretsInspection: health.secretsInspection,
        missingSecrets: health.missingSecrets,
        checkedAt: health.checkedAt
      }
    });
  } catch (err: any) {
    safeLogger.error('WhatsApp health check failed ungracefully:', err?.message);
    const { inspection, missing } = WhatsAppService.inspectSecrets(creds);
    return res.status(200).json({
      status: 'error',
      overallStatus: 'NOT_CONNECTED',
      whatsapp: {
        configured: false,
        connected: false,
        overallStatus: 'NOT_CONNECTED',
        phoneNumber: null,
        verifiedName: null,
        phoneNumberId: null,
        wabaId: null,
        state: 'CONNECTION_ERROR',
        message: 'فشل الاتصال بـ Meta',
        metrics: {
          apiConnection: 'Failed',
          phoneNumber: 'Invalid',
          accessToken: 'Invalid',
          webhook: 'Not Verified',
          sendMessageTest: 'Failed'
        },
        secretsInspection: inspection,
        missingSecrets: missing,
        checkedAt: new Date().toISOString()
      }
    });
  }
});

/**
 * Send Test WhatsApp Message
 * POST /api/whatsapp/test-message
 */
whatsappRouter.post('/test-message', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkTestMessageRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد المسموح به لإرسال رسائل الاختبار (بحد أقصى 10 رسائل في الدقيقة)',
      error: 'RATE_LIMIT_EXCEEDED'
    });
  }

  const { recipient, message } = req.body;
  if (!recipient || typeof recipient !== 'string' || !recipient.trim()) {
    return res.status(400).json({
      success: false,
      message: 'رقم هاتف المستلم مطلوب (مثال: +9665xxxxxxxx)',
      error: 'MISSING_RECIPIENT'
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'نص رسالة الاختبار مطلوب',
      error: 'MISSING_MESSAGE'
    });
  }

  const orgId = resolveOrgId(req);
  const creds = db.getRawCredentials(orgId, 'int_whatsapp') || undefined;

  const result = await WhatsAppService.sendMessage(recipient.trim(), message.trim(), creds);

  if (result.success) {
    return res.json({
      success: true,
      message: 'نجح إرسال الرسالة عبر WhatsApp Cloud API',
      messageId: result.messageId,
      recipient: result.recipient
    });
  }

  return res.status(200).json({
    success: false,
    message: `فشل الإرسال: ${result.error}`,
    error: result.error,
    recipient: result.recipient
  });
});

/**
 * Self-test Webhook Verification
 * POST /api/whatsapp/test-webhook
 */
whatsappRouter.post('/test-webhook', (req: Request, res: Response) => {
  const { verifyToken } = req.body || {};
  const currentToken = verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || 'zain_whatsapp_verify_token';

  const isMatch = WhatsAppService.verifyWebhookToken('subscribe', currentToken);
  if (isMatch) {
    WhatsAppService.setWebhookVerified(true);
    return res.json({
      success: true,
      webhook: 'Verified',
      message: 'تم التحقق بنجاح من Webhook Handshake (hub.verify_token تطابق بنجاح)'
    });
  }

  return res.json({
    success: false,
    webhook: 'Not Verified',
    message: 'فشل التحقق: رمز Verify Token غير متطابق'
  });
});

/**
 * Metadata info for dashboard
 * GET /api/whatsapp/info
 */
whatsappRouter.get('/info', (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  const creds = db.getRawCredentials(orgId, 'int_whatsapp') || undefined;
  const dashboardInfo = WhatsAppService.getDashboardInfo(creds);

  // Construct absolute or relative webhook URL
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'https';
  const webhookUrl = `${protocol}://${host}/api/webhooks/whatsapp`;

  return res.json({
    ...dashboardInfo,
    webhookUrl
  });
});

/**
 * Validate server-side WhatsApp environment variables without exposing secrets
 * GET /api/whatsapp/validate-env
 */
whatsappRouter.get('/validate-env', (req: Request, res: Response) => {
  const validation = WhatsAppService.validateEnvironment();
  return res.status(validation.isValid ? 200 : 422).json({
    ...validation,
    timestamp: new Date().toISOString()
  });
});
