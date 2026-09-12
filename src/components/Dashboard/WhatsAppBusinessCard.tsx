import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Activity,
  Send,
  Link2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Info,
  Clock,
  X,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface WhatsAppMetrics {
  apiConnection: 'Connected' | 'Failed';
  phoneNumber: 'Valid' | 'Invalid';
  accessToken: 'Valid' | 'Invalid';
  webhook: 'Verified' | 'Not Verified';
  sendMessageTest: 'Success' | 'Failed' | 'Not Tested';
}

export interface WhatsAppSecretsInspection {
  WHATSAPP_ACCESS_TOKEN: 'PRESENT' | 'MISSING';
  WHATSAPP_PHONE_NUMBER_ID: 'PRESENT' | 'MISSING';
  WHATSAPP_BUSINESS_ACCOUNT_ID: 'PRESENT' | 'MISSING';
  WHATSAPP_API_VERSION: 'PRESENT' | 'DEFAULT_V19';
  WHATSAPP_VERIFY_TOKEN: 'PRESENT' | 'MISSING';
}

export interface WhatsAppHealthData {
  configured: boolean;
  connected: boolean;
  overallStatus: 'CONNECTED' | 'NOT_CONNECTED';
  phoneNumber: string | null;
  verifiedName: string | null;
  phoneNumberId: string | null;
  wabaId: string | null;
  apiVersion?: string;
  state:
    | 'CONNECTED'
    | 'MISSING_SECRETS'
    | 'INVALID_TOKEN'
    | 'INVALID_PHONE_NUMBER_ID'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'CONNECTION_ERROR'
    | 'WEBHOOK_NOT_CONFIGURED';
  message: string;
  metrics: WhatsAppMetrics;
  secretsInspection?: WhatsAppSecretsInspection;
  missingSecrets?: string[];
  checkedAt: string;
}

interface LastWebhookEvent {
  timestamp: string;
  messageId?: string;
  senderPhone?: string;
  senderName?: string;
  messageText?: string;
  messageType?: string;
}

interface LastTestMessage {
  timestamp: string;
  recipient: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface WhatsAppInfoData {
  configured: boolean;
  phoneNumberId: string | null;
  wabaId: string | null;
  apiVersion: string;
  verifyTokenConfigured: boolean;
  secretsInspection?: WhatsAppSecretsInspection;
  missingSecrets?: string[];
  metrics: WhatsAppMetrics;
  lastHealthCheck: WhatsAppHealthData | null;
  lastWebhookEvent: LastWebhookEvent | null;
  lastTestMessage: LastTestMessage | null;
  webhookUrl: string;
  webhookHandshakeVerified?: boolean;
}

export const WhatsAppBusinessCard: React.FC = () => {
  const { t } = useApp();

  // State
  const [loading, setLoading] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [healthData, setHealthData] = useState<WhatsAppHealthData | null>(null);
  const [infoData, setInfoData] = useState<WhatsAppInfoData | null>(null);

  // Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Test Message Form
  const [recipient, setRecipient] = useState('+966500000000');
  const [testMessageText, setTestMessageText] = useState('رسالة اختبار من منصة زين للأتمتة عبر WhatsApp Cloud API');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Webhook copy feedback
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<string | null>(null);

  // Fetch initial info from backend
  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/whatsapp/info');
      if (res.ok) {
        const data: WhatsAppInfoData = await res.json();
        setInfoData(data);
        if (data.lastHealthCheck) {
          setHealthData(data.lastHealthCheck);
        }
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // Real Meta Health Check Handler
  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/whatsapp/health');
      if (res.ok) {
        const json = await res.json();
        if (json.whatsapp) {
          setHealthData(json.whatsapp);
        }
      }
      await fetchInfo();
    } catch {
      setHealthData({
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
        missingSecrets: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_ACCOUNT_ID'],
        checkedAt: new Date().toISOString()
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  // Self-test Webhook Verification Handler
  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookTestFeedback(null);
    try {
      const res = await fetch('/api/whatsapp/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setWebhookTestFeedback(data.message || (data.success ? 'Webhook: Verified' : 'Webhook: Not Verified'));
      await fetchInfo();
    } catch {
      setWebhookTestFeedback('تعذر فحص الـ Webhook');
    } finally {
      setTestingWebhook(false);
    }
  };

  // Send Test Message Handler
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !testMessageText.trim()) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipient.trim(),
          message: testMessageText.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: 'نجح إرسال الرسالة عبر WhatsApp Cloud API'
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || `فشل الإرسال: ${data.error || 'خطأ غير متوقع'}`
        });
      }

      await fetchInfo();
    } catch {
      setTestResult({
        success: false,
        message: 'فشل الإرسال: تعذر الاتصال بالخادم'
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Determine overall connected status
  const isConnected = Boolean(healthData?.connected || healthData?.overallStatus === 'CONNECTED');

  // Resolved metrics
  const metrics: WhatsAppMetrics = healthData?.metrics || infoData?.metrics || {
    apiConnection: 'Failed',
    phoneNumber: 'Invalid',
    accessToken: 'Invalid',
    webhook: infoData?.webhookHandshakeVerified ? 'Verified' : 'Not Verified',
    sendMessageTest: infoData?.lastTestMessage
      ? infoData.lastTestMessage.success
        ? 'Success'
        : 'Failed'
      : 'Not Tested'
  };

  // Missing secrets
  const missingSecrets = healthData?.missingSecrets || infoData?.missingSecrets || [];

  const effectiveWebhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/whatsapp`
      : infoData?.webhookUrl || '/api/webhooks/whatsapp';

  const copyToClipboard = (text: string, type: 'webhook' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div
      id="whatsapp_business_card"
      className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-6"
    >
      {/* 1. Header & Main Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                WhatsApp Business API
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Meta Cloud API {infoData?.apiVersion || 'v19.0'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                'الربط المباشر مع Meta Graph API لإرسال واستقبال المحادثات الذكية دون وسطاء',
                'Direct Meta Graph API connection for automated customer conversations'
              )}
            </p>
          </div>
        </div>

        {/* Primary Status Banner: 🟢 Connected أو 🔴 Not Connected */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div
            id="whatsapp_overall_status_badge"
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-sm font-black transition-all ${
              isConnected
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isConnected ? '🟢 Connected' : '🔴 Not Connected'}</span>
          </div>
        </div>
      </div>

      {/* 2. Clear Status Board (لوحة الحالة الواضحة) */}
      <div
        id="whatsapp_status_board"
        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            {t('لوحة حالة المؤشرات الخمسة', 'WhatsApp Integration Status Board')}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {healthData?.checkedAt
              ? `${t('آخر تحديث:', 'Updated:')} ${new Date(healthData.checkedAt).toLocaleTimeString('ar-SA')}`
              : t('اضغط فحص الاتصال للتحديث الفوري', 'Click check connection for real verification')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* 1. API Connection */}
          <div
            id="metric_api_connection"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              API Connection
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className={`text-sm font-black ${
                  metrics.apiConnection === 'Connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metrics.apiConnection}
              </span>
              {metrics.apiConnection === 'Connected' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
          </div>

          {/* 2. Phone Number */}
          <div
            id="metric_phone_number"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Phone Number
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className={`text-sm font-black ${
                  metrics.phoneNumber === 'Valid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metrics.phoneNumber}
              </span>
              {metrics.phoneNumber === 'Valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
          </div>

          {/* 3. Access Token */}
          <div
            id="metric_access_token"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Access Token
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className={`text-sm font-black ${
                  metrics.accessToken === 'Valid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {metrics.accessToken}
              </span>
              {metrics.accessToken === 'Valid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
          </div>

          {/* 4. Webhook */}
          <div
            id="metric_webhook"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Webhook
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className={`text-sm font-black ${
                  metrics.webhook === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {metrics.webhook}
              </span>
              {metrics.webhook === 'Verified' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>

          {/* 5. Send Message Test */}
          <div
            id="metric_send_message_test"
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Send Message Test
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <span
                className={`text-sm font-black ${
                  metrics.sendMessageTest === 'Success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : metrics.sendMessageTest === 'Failed'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {metrics.sendMessageTest}
              </span>
              {metrics.sendMessageTest === 'Success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : metrics.sendMessageTest === 'Failed' ? (
                <XCircle className="w-4 h-4 text-rose-500" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Server-side Secrets Inspection & Instruction Callout */}
      {!isConnected && (
        <div
          id="whatsapp_missing_secrets_banner"
          className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-100 space-y-3 text-xs shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200 leading-snug">
                لإكمال الاتصال، أضف WHATSAPP_ACCESS_TOKEN و WHATSAPP_PHONE_NUMBER_ID و WHATSAPP_BUSINESS_ACCOUNT_ID داخل Server-Side Secrets.
              </p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                {t(
                  'يتم ضبط هذه القيم الثلاث من خلال لوحة تحكم المنصة عبر المسار: Google AI Studio > Settings > Secrets. يتم الاحتفاظ بها في خادم التطبيق المشفر (Server-Side) ولا يتم نقلها أو كشفها في المتصفح أو واجهة الاستخدام.',
                  'Configure these 3 keys via Google AI Studio > Settings > Secrets. They are stored strictly server-side and never exposed to the browser.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
              {t('حالة المفاتيح في البيئة الخادمة:', 'Server-Side Secrets Status:')}
            </span>
            {['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_ACCOUNT_ID'].map((sec) => {
              const isMissing = missingSecrets.includes(sec);
              return (
                <span
                  key={sec}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border ${
                    isMissing
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {sec}: {isMissing ? 'MISSING' : 'PRESENT'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Button 1: Real Health Check */}
        <button
          id="btn_whatsapp_check_health"
          type="button"
          onClick={handleCheckHealth}
          disabled={checkingHealth}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          <span>{checkingHealth ? t('جارِ فحص Meta...', 'Checking Meta...') : t('فحص الاتصال (Real Health Check)', 'Check Connection')}</span>
        </button>

        {/* Button 2: Test Message */}
        <div className="relative group">
          <button
            id="btn_whatsapp_open_test_modal"
            type="button"
            onClick={() => {
              if (!isConnected || metrics.apiConnection !== 'Connected') return;
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            disabled={!isConnected || metrics.apiConnection !== 'Connected'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('اختبار إرسال رسالة', 'Send Test Message')}</span>
          </button>
          {(!isConnected || metrics.apiConnection !== 'Connected') && (
            <div className="hidden group-hover:block absolute top-full mt-1.5 start-0 z-30 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap shadow-lg pointer-events-none">
              {t('لا يمكن اختبار إرسال رسالة قبل نجاح اتصال API Connection', 'Cannot test send before API Connection is Connected')}
            </div>
          )}
        </div>

        {/* Button 3: Self-test Webhook */}
        <button
          id="btn_whatsapp_test_webhook"
          type="button"
          onClick={handleTestWebhook}
          disabled={testingWebhook}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
        >
          <Activity className={`w-3.5 h-3.5 text-sky-500 ${testingWebhook ? 'animate-spin' : ''}`} />
          <span>{testingWebhook ? t('جارِ فحص الويب هوك...', 'Testing...') : t('فحص Webhook Handshake', 'Test Webhook Handshake')}</span>
        </button>

        {/* Button 4: Setup Webhook Guide */}
        <button
          id="btn_whatsapp_open_webhook_modal"
          type="button"
          onClick={() => setIsWebhookModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{t('إعدادات Webhook', 'Configure Webhook')}</span>
        </button>

        {/* Security Shield Note */}
        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('الأمان: لا يتم عرض المفاتيح في المتصفح أبداً', 'Zero credentials exposed')}</span>
        </div>
      </div>

      {/* Webhook Test Feedback Banner */}
      {webhookTestFeedback && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-between">
          <span className="font-semibold">{webhookTestFeedback}</span>
          <button
            type="button"
            onClick={() => setWebhookTestFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Modal: Test Message */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('اختبار إرسال رسالة WhatsApp حقيقية', 'Real WhatsApp Message Dispatch')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('إرسال تجريبي آمن من Backend فقط إلى Meta Cloud API', 'Direct backend dispatch to Meta Graph API')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendTestMessage} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('رقم الهاتف المستلم (بالصيغة الدولية مع رمز الدولة):', 'Recipient Phone Number (e.g. +9665xxxxxxxx):')}
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+9665xxxxxxxx"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('نص الرسالة:', 'Message Text:')}
                </label>
                <textarea
                  rows={3}
                  value={testMessageText}
                  onChange={(e) => setTestMessageText(e.target.value)}
                  placeholder={t('اكتب نص رسالة الاختبار هنا...', 'Type message here...')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold">
                      {testResult.success ? t('نجح إرسال الرسالة', 'Message sent successfully') : t('فشل الإرسال', 'Dispatch failed')}
                    </div>
                    <div className="text-[11px] leading-relaxed break-words">{testResult.message}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {t('إغلاق', 'Close')}
                </button>
                <button
                  type="submit"
                  disabled={sendingTest || !recipient.trim() || !testMessageText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {sendingTest && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{sendingTest ? t('جارِ الإرسال...', 'Sending...') : t('إرسال اختبار', 'Send Test')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Webhook Configuration & Meta Steps */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('إعدادات Webhook الخاصة بـ Meta WhatsApp', 'Meta WhatsApp Webhook Configuration')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('الربط والتحقق عبر بوابة مطوري Meta (Meta Developers)', 'Setup in Meta Developers Console')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWebhookModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Callback URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('رابط استدعاء الويب هوك (Callback URL):', 'Webhook Callback URL:')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={effectiveWebhookUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(effectiveWebhookUrl, 'webhook')}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Verify Token */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('رمز التحقق الافتراضي (Verify Token):', 'Default Verify Token:')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="zain_whatsapp_verify_token"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard('zain_whatsapp_verify_token', 'token')}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {t(
                    'يمكن تخصيص هذه القيمة عبر متغير WHATSAPP_VERIFY_TOKEN في Secrets.',
                    'Can be customized via WHATSAPP_VERIFY_TOKEN in Secrets.'
                  )}
                </p>
              </div>

              {/* Setup Steps Guide */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Info className="w-4 h-4" />
                  <span>{t('الخطوات المطلوبة بالضبط في Meta Developers:', 'Exact Meta Developers Setup Steps:')}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                  <li>
                    <strong>{t('الدخول للبوابة:', 'Login:')}</strong>{' '}
                    {t(
                      'توجه إلى developers.facebook.com واختر تطبيقك التجاري ثم منتج WhatsApp.',
                      'Navigate to developers.facebook.com, select your business app and WhatsApp product.'
                    )}
                  </li>
                  <li>
                    <strong>{t('إعداد الويب هوك:', 'Configure Webhook:')}</strong>{' '}
                    {t(
                      'في القائمة الجانبية اختر Configuration > Webhook واضغط Edit.',
                      'In sidebar select Configuration > Webhook and click Edit.'
                    )}
                  </li>
                  <li>
                    <strong>{t('التحقق والحفظ:', 'Verify & Save:')}</strong>{' '}
                    {t(
                      'ألصق Callback URL و Verify Token الموجودين بالأعلى، ثم اضغط "Verify and save".',
                      'Paste Callback URL and Verify Token from above, then click "Verify and save".'
                    )}
                  </li>
                  <li>
                    <strong>{t('الاشتراك في الرسائل:', 'Subscribe to Fields:')}</strong>{' '}
                    {t(
                      'تحت جدول Webhook fields، ابحث عن حقل messages واضغط Subscribe لتلقي كافة رسائل العملاء لحظياً.',
                      'Under Webhook fields table, locate the messages field and click Subscribe.'
                    )}
                  </li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold"
                >
                  {t('تم، إغلاق', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
