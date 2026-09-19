import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Database,
  Send,
  Webhook,
  ShieldAlert,
  ShieldCheck,
  Key,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap
} from 'lucide-react';
import { WorkflowNode, ExecutionLog, InboundWebhookEvent } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface ExecutionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: WorkflowNode[];
  workflowName: string;
}

export const ExecutionSimulatorModal: React.FC<ExecutionSimulatorModalProps> = ({
  isOpen,
  onClose,
  nodes,
  workflowName
}) => {
  const {
    language,
    selectedWorkflow,
    runWorkflowSimulation,
    triggerInboundWebhook,
    integrations,
    setCurrentView,
    t
  } = useApp();

  const workflowId = selectedWorkflow?.id || 'wf_01';

  // Mode: 'test' (simulation) | 'production' (real live run) | 'webhook' (inbound trigger)
  const [executionMode, setExecutionMode] = useState<'test' | 'production' | 'webhook'>('test');

  const [testPayload, setTestPayload] = useState({
    name: 'سلطان القحطاني',
    email: 'sultan@example.sa',
    phone: '+966 50 123 4567',
    company: 'مؤسسة القحطاني للحلول البرمجية',
    message: 'نريد أتمتة الرد على رسائل العملاء وتأهيل الـ Leads وربطها بالواتساب و CRM.',
    budget: '15,000 ريال'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionLog | null>(null);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState<number | null>(null);

  // Webhook gateway state
  const [inboundEvents, setInboundEvents] = useState<InboundWebhookEvent[]>([]);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/${workflowId}`
    : `https://api.zainauto.ai/api/webhooks/${workflowId}`;

  // Fetch inbound webhook events when opening webhook tab
  useEffect(() => {
    if (isOpen && executionMode === 'webhook') {
      api.getInboundWebhookEvents(workflowId)
        .then((res) => {
          if (res.events) setInboundEvents(res.events);
        })
        .catch(() => {});
    }
  }, [isOpen, executionMode, workflowId]);

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleStartRun = async () => {
    setIsRunning(true);
    setCompletedSteps([]);
    setActiveStepIndex(0);
    setExecutionResult(null);
    setExpandedTraceIndex(null);

    try {
      // Execute through context which calls backend with proper mode
      const log = await runWorkflowSimulation(workflowId, testPayload, executionMode === 'production' ? 'production' : 'test');
      setExecutionResult(log);

      // Animate steps visually based on actual node traces
      if (log?.traces) {
        for (let i = 0; i < nodes.length; i++) {
          setActiveStepIndex(i);
          await new Promise((resolve) => setTimeout(resolve, 150));
          const nodeTrace = log.traces.find((t) => t.nodeId === nodes[i]?.id);
          if (nodeTrace?.status === 'success') {
            setCompletedSteps((prev) => [...prev, i]);
          }
        }
      }
    } catch (err: any) {
      console.error('Execution run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendTestWebhook = async () => {
    setWebhookSending(true);
    setWebhookResponse(null);
    setExpandedTraceIndex(null);
    try {
      const res = await triggerInboundWebhook(workflowId, {
        ...testPayload,
        timestamp: new Date().toISOString(),
        source: 'Live Webhook Tester'
      });
      setWebhookResponse(res);

      if (res && res.execution) {
        setExecutionResult(res.execution);
        const succIndices = nodes
          .map((n, idx) => {
            const tr = res.execution.traces?.find((t: any) => t.nodeId === n.id);
            return tr?.status === 'success' ? idx : -1;
          })
          .filter((idx) => idx !== -1);
        setCompletedSteps(succIndices);
      }

      // Refresh inbound events safely without overriding webhook response
      try {
        const updated = await api.getInboundWebhookEvents(workflowId);
        if (updated && updated.events) {
          setInboundEvents(updated.events);
        }
      } catch (inboundErr) {
        console.warn('Inbound events fetch notice:', inboundErr);
      }
    } catch (err: any) {
      setWebhookResponse({
        success: false,
        httpStatus: err.httpStatus || 500,
        status: 'error',
        error: err.message || 'Webhook transmission failed'
      });
    } finally {
      setWebhookSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('بوابة تشغيل واختبار مسار العمل', 'Workflow Execution & Test Hub')}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {workflowName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'اختبر المسار بالمحاكاة الآمنة أو نفذه في بيئة الإنتاج الحقيقية وربط Webhook الفعلي',
                  'Simulate safely or execute with real production integrations & webhook ingestion.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 mt-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            id="tab_mode_simulation"
            onClick={() => { setExecutionMode('test'); setExecutionResult(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              executionMode === 'test'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('وضع المحاكاة (Test Simulation)', 'Test Simulation')}</span>
          </button>

          <button
            id="tab_mode_production"
            onClick={() => { setExecutionMode('production'); setExecutionResult(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              executionMode === 'production'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t('وضع الإنتاج الحقيقي (Live Production)', 'Live Production')}</span>
          </button>

          <button
            id="tab_mode_webhook"
            onClick={() => { setExecutionMode('webhook'); setExecutionResult(null); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              executionMode === 'webhook'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span>{t('بوابة الـ Webhook الحقيقية', 'Inbound Webhook Gateway')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="my-3 space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          
          {/* Mode Explanatory Notice */}
          {executionMode === 'test' && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">{t('بيئة محاكاة تجريبية آمنة (Mock Mode): ', 'Safe Test Simulation: ')}</span>
                {t(
                  'يتم تشغيل المنطق وتحليل الذكاء الاصطناعي مع توليد ردود محاكاة للتكاملات الخارجية دون إرسال رسائل حقيقية عبر WhatsApp أو البريد.',
                  'Executes workflow logic with simulated integration responses without consuming live third-party quotas.'
                )}
              </div>
            </div>
          )}

          {executionMode === 'production' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">{t('بيئة تنفيذ حقيقية (Live Production Mode): ', 'Live Production Execution: ')}</span>
                {t(
                  'سيتم استدعاء APIs الحقيقية للخدمات المرتبطة (WhatsApp, Email, Slack). إذا كانت بيانات الاعتماد غير متصلة، ستتوقف العملية فورًا وتظهر كغير متصلة دون إعطاء نجاح وهمي.',
                  'Performs live calls to external APIs. If credentials are missing, nodes fail with NOT_CONNECTED and do NOT return a fake 200 OK.'
                )}
              </div>
            </div>
          )}

          {/* Webhook Tab View */}
          {executionMode === 'webhook' ? (
            <div className="space-y-4">
              {/* Webhook Endpoint Info Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {t('رابط الـ Webhook المخصص لهذا المسار (Production Endpoint)', 'Dedicated Webhook Endpoint')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    POST / Inbound
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                  />
                  <button
                    onClick={handleCopyWebhook}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1">
                  <div className="text-slate-400 font-sans text-[10px] uppercase font-bold">cURL Example:</div>
                  <pre className="text-emerald-400">{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ZAIN_SECRET_2026" \\
  -d '{"name":"${testPayload.name}","phone":"${testPayload.phone}","message":"${testPayload.message}"}'`}</pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    {t('يمكنك إرسال طلب تجربة فوري من المتصفح الآن لحفظ الـ Inbound Payload في الـ DB وتشغيل المحرك:', 'Test trigger via live POST request:')}
                  </span>
                  <button
                    onClick={handleSendTestWebhook}
                    disabled={webhookSending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {webhookSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('جارِ الإرسال...', 'Dispatching...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('إرسال Webhook حقيقي الآن', 'Dispatch Test Webhook')}</span>
                      </>
                    )}
                  </button>
                </div>

                {webhookResponse && (
                  <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                    webhookResponse.success
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-amber-500/5 border-amber-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>{t('استجابة خادم زين للأتمتة والذكاء الاصطناعي (Zain Automation AI Server):', 'Zain Automation AI Server Response:')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          webhookResponse.httpStatus === 200 || webhookResponse.success
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : webhookResponse.httpStatus === 404
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {webhookResponse.httpStatus
                            ? `HTTP ${webhookResponse.httpStatus} ${webhookResponse.httpStatus === 200 ? 'OK' : webhookResponse.httpStatus === 404 ? 'NOT FOUND' : webhookResponse.httpStatus === 422 ? 'UNPROCESSABLE' : 'ERROR'}`
                            : (webhookResponse.success ? 'HTTP 200 OK' : 'HTTP ERROR')}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          webhookResponse.status === 'success' || webhookResponse.success
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          {String(webhookResponse.status || 'RESPONSE').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {webhookResponse.httpStatus === 404 && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{t('تنبيه مسار Vercel Serverless (404 Not Found)', 'Vercel Serverless Route Notice (404 Not Found)')}</span>
                        </div>
                        <p className="leading-relaxed">
                          {t(
                            'نقطة نهاية الويب هوك غير مفعّلة بعد على نشرة Vercel الحالية لأن Vercel لم يوجّه /api إلى Serverless Function. تم الآن إنشاء ملف vercel.json و api/[...all].ts في الكود المصدري. يرجى عمل Redeploy للمشروع على Vercel لتفعيل خادم الـ API كاملاً.',
                            'The webhook endpoint is not routed yet on the current Vercel deployment. vercel.json and api/[...all].ts have now been generated. Please perform a Redeploy on Vercel to activate the serverless API routes.'
                          )}
                        </p>
                      </div>
                    )}

                    {webhookResponse.httpStatus === 422 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{t('تشخيص حالة HTTP 422 (Unprocessable Entity)', 'HTTP 422 Diagnostic (Unprocessable Entity)')}</span>
                        </div>
                        <p className="leading-relaxed text-[11px]">
                          {t(
                            'تم استلام وحفظ الـ Inbound Webhook في قاعدة البيانات بنجاح، ولكن توقف المسار عند عقدة تتطلب بيانات اعتماد خارجية (مثل WhatsApp Business API أو Resend Email) أو مفتاح خدمة AI. في وضع الإنتاج الحقيقي، تلتزم المنصة بعدم إرجاع 200 OK لأي إجراء لم يكتمل فعلياً.',
                            'The Inbound Webhook was safely saved to DB, but pipeline execution halted at an action requiring external credentials (e.g. WhatsApp Business or Resend Email) or AI key. Real production mode enforces no 200 OK for incomplete actions.'
                          )}
                        </p>
                        {webhookResponse.error && (
                          <div className="font-mono text-[10px] bg-amber-500/20 p-1.5 rounded text-amber-900 dark:text-amber-100">
                            {webhookResponse.error}
                          </div>
                        )}
                      </div>
                    )}

                    {webhookResponse.inboundEventId && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{t('تم تسجيل وحفظ الحدث الوارد في قاعدة البيانات بنجاح: ', 'Inbound Event recorded in DB: ')}<strong>{webhookResponse.inboundEventId}</strong></span>
                      </div>
                    )}

                    <pre className={`font-mono max-h-36 overflow-y-auto ${
                      webhookResponse.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {JSON.stringify(webhookResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Live Pipeline Execution Trace directly under Webhook Response */}
                {executionResult && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500 fill-current" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {t('مراحل تنفيذ العقد الناتجة عن الـ Webhook (Execution Trace)', 'Webhook Inbound Node Pipeline Trace')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {`${executionResult.traces.length}/${nodes.length} ${t('عقد تم فحصها', 'nodes inspected')} (${executionResult.traces.filter((t) => t.status === 'success').length} ${t('ناجحة', 'success')}${executionResult.traces.some((t) => t.status === 'not_connected') ? `، ${executionResult.traces.filter((t) => t.status === 'not_connected').length} ${t('غير متصلة', 'not connected')}` : ''})`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nodes.map((node, index) => {
                        const trace = executionResult?.traces.find((tr) => tr.nodeId === node.id);
                        const isDone = trace ? trace.status === 'success' : false;
                        const isNotConnected = trace && trace.status === 'not_connected';
                        const isFailed = trace && trace.status === 'failed';
                        const isExpanded = expandedTraceIndex === index;

                        return (
                          <div
                            key={node.id}
                            className={`rounded-2xl border transition-all ${
                              isFailed
                                ? 'border-rose-500/50 bg-rose-500/5'
                                : isNotConnected
                                ? 'border-amber-500/50 bg-amber-500/5'
                                : isDone
                                ? 'border-emerald-500/40 bg-white dark:bg-slate-800/80'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-70'
                            }`}
                          >
                            <div
                              onClick={() => trace && setExpandedTraceIndex(isExpanded ? null : index)}
                              className="p-3 flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                                  {isFailed ? (
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                  ) : isNotConnected ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                  ) : isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                                      {index + 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {language === 'ar' ? node.nameAr : node.name}
                                    </span>
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                      {node.subType}
                                    </span>
                                    {isNotConnected && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        {t('غير متصل / مطلوب مفاتيح', 'NOT_CONNECTED')}
                                      </span>
                                    )}
                                    {isDone && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        {t('تم التنفيذ بنجاح', 'SUCCESS')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isNotConnected
                                      ? trace?.error || t('الخدمة غير متصلة ببيانات اعتماد صحيحة', 'Integration credentials missing')
                                      : isFailed
                                      ? trace?.error || t('فشل تنفيذ العقدة', 'Execution failed')
                                      : isDone
                                      ? trace?.output?.result || (node.type === 'trigger' ? t('تم استلام الـ Payload وتمريره للـ Pipeline', 'Payload forwarded') : node.type === 'ai' ? t('تم تحليل الاستفسار وتأهيل العميل بالذكاء الاصطناعي', 'AI analyzed & qualified') : node.type === 'logic' ? t(`تم تقييم الشرط: ${trace?.output?.evaluatedRule || 'ناجح'}`, 'Rule matched') : node.subType?.includes('crm') ? t('تم إنشاء وتحديث بيانات العميل في قاعدة CRM', 'Lead saved in CRM DB') : node.subType?.includes('notification') ? t('تم إرسال الإشعار الفوري للنظام', 'Notification dispatched') : t('تمت المعالجة بنجاح', 'Processed'))
                                      : t('في انتظار وصول البيانات...', 'Waiting in pipeline...')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-mono text-slate-400">
                                  {trace ? `${trace.durationMs}ms` : '--'}
                                </span>
                                {trace && (
                                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Trace Inspector Details */}
                            {isExpanded && trace && (
                              <div className="px-4 pb-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-[11px]">
                                {trace.error && (
                                  <div className={`p-2.5 rounded-xl border space-y-1 ${isNotConnected ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                                    <div className="font-bold flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>{isNotConnected ? t('بيان الربط والاعتماد:', 'Integration Status:') : t('سبب الخطأ:', 'Error Details:')}</span>
                                    </div>
                                    <p className="font-mono text-[10px]">{trace.error}</p>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                                  <div>
                                    <div className="font-sans font-bold text-slate-500 mb-1">
                                      {t('المدخلات (Input):', 'Input Payload:')}
                                    </div>
                                    <pre className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto text-slate-700 dark:text-slate-300">
                                      {JSON.stringify(trace.input || {}, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="font-sans font-bold text-slate-500 mb-1">
                                      {t('المخرجات (Output):', 'Output Result:')}
                                    </div>
                                    <pre className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400">
                                      {JSON.stringify(trace.output || {}, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Inbound Events History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {t('سجل الـ Payloads الواردة المخزنة في قاعدة البيانات (Inbound Events Table)', 'Stored Inbound Events (DB)')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inboundEvents.length} events
                  </span>
                </div>

                {inboundEvents.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                    {t('لم يتم استقبال أي Payload حتى الآن. اضغط "إرسال Webhook حقيقي" لتجربة الاستقبال الفوري.', 'No inbound payloads received yet. Send a test webhook to populate.')}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {inboundEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {evt.id}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {evt.receivedAt}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-lg overflow-x-auto">
                          {JSON.stringify(evt.payload)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Test Payload Setup */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {t('بيانات العميل والرسالة الواردة (Inbound Customer Payload)', 'Inbound Customer Payload')}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Mode: {executionMode.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-500">{t('اسم العميل', 'Lead Name')}</label>
                    <input
                      type="text"
                      value={testPayload.name}
                      onChange={(e) => setTestPayload({ ...testPayload, name: e.target.value })}
                      className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">{t('رقم الواتساب / الجوال', 'Phone / WhatsApp')}</label>
                    <input
                      type="text"
                      value={testPayload.phone}
                      onChange={(e) => setTestPayload({ ...testPayload, phone: e.target.value })}
                      className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">{t('البريد الإلكتروني', 'Email')}</label>
                    <input
                      type="email"
                      value={testPayload.email}
                      onChange={(e) => setTestPayload({ ...testPayload, email: e.target.value })}
                      className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">{t('الشركة / النشاط', 'Company')}</label>
                    <input
                      type="text"
                      value={testPayload.company}
                      onChange={(e) => setTestPayload({ ...testPayload, company: e.target.value })}
                      className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-500">{t('رسالة العميل الواردة (Inbound Inquiry)', 'Customer Inbound Message')}</label>
                    <input
                      type="text"
                      value={testPayload.message}
                      onChange={(e) => setTestPayload({ ...testPayload, message: e.target.value })}
                      className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Step By Step Execution Pipeline Trace */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {t('مراحل تنفيذ العقد (Node Execution Trace)', 'Node Pipeline Execution Trace')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {executionResult
                      ? `${executionResult.traces.length}/${nodes.length} ${t('عقد تم فحصها', 'nodes inspected')} (${executionResult.traces.filter((t) => t.status === 'success').length} ${t('ناجحة', 'success')}${executionResult.traces.some((t) => t.status === 'not_connected') ? `، ${executionResult.traces.filter((t) => t.status === 'not_connected').length} ${t('غير متصلة', 'not connected')}` : ''})`
                      : `${completedSteps.length} / ${nodes.length}`}
                  </span>
                </div>

                <div className="space-y-2">
                  {nodes.map((node, index) => {
                    const trace = executionResult?.traces.find((tr) => tr.nodeId === node.id);
                    const isActive = activeStepIndex === index && isRunning;
                    const isDone = trace ? trace.status === 'success' : completedSteps.includes(index);
                    const isNotConnected = trace && trace.status === 'not_connected';
                    const isFailed = trace && trace.status === 'failed';
                    const isExpanded = expandedTraceIndex === index;

                    return (
                      <div
                        key={node.id}
                        className={`rounded-2xl border transition-all ${
                          isFailed
                            ? 'border-rose-500/50 bg-rose-500/5'
                            : isNotConnected
                            ? 'border-amber-500/50 bg-amber-500/5'
                            : isActive
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20'
                            : isDone
                            ? 'border-emerald-500/40 bg-white dark:bg-slate-800/80'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-70'
                        }`}
                      >
                        <div
                          onClick={() => trace && setExpandedTraceIndex(isExpanded ? null : index)}
                          className="p-3 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                              {isFailed ? (
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                              ) : isNotConnected ? (
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                              ) : isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : isActive ? (
                                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {language === 'ar' ? node.nameAr : node.name}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                  {node.subType}
                                </span>
                                {isNotConnected && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    {t('غير متصل / مطلوب مفاتيح', 'NOT_CONNECTED')}
                                  </span>
                                )}
                                {isDone && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    {t('تم التنفيذ بنجاح', 'SUCCESS')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {isNotConnected
                                  ? trace?.error || t('الخدمة غير متصلة ببيانات اعتماد صحيحة', 'Integration credentials missing')
                                  : isFailed
                                  ? trace?.error || t('توقف المسار بسبب خطأ أو فشل في التنفيذ', 'Execution stopped due to error')
                                  : isDone
                                  ? trace?.output?.result || (node.type === 'trigger' ? t('تم استلام الـ Payload وتمريره للـ Pipeline', 'Payload forwarded') : node.type === 'ai' ? t('تم تحليل الاستفسار وتأهيل العميل بالذكاء الاصطناعي', 'AI analyzed & qualified') : node.type === 'logic' ? t(`تم تقييم الشرط: ${trace?.output?.evaluatedRule || 'ناجح'}`, 'Rule matched') : node.subType?.includes('crm') ? t('تم إنشاء وتحديث بيانات العميل في قاعدة CRM', 'Lead saved in CRM DB') : node.subType?.includes('notification') ? t('تم إرسال الإشعار الفوري للنظام', 'Notification dispatched') : t('تمت المعالجة بنجاح', 'Processed'))
                                  : isActive
                                  ? t('جارِ المعالجة الحية عبر المحرك...', 'Processing node live...')
                                  : t('في انتظار وصول البيانات...', 'Waiting in pipeline...')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-slate-400">
                              {trace ? `${trace.durationMs}ms` : isActive ? '...' : '--'}
                            </span>
                            {trace && (
                              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Trace Inspector Details (Input / Output / Error) */}
                        {isExpanded && trace && (
                          <div className="px-4 pb-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-[11px]">
                            {trace.error && (
                              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{t('سبب الخطأ:', 'Error Details:')}</span>
                                </div>
                                <p className="font-mono text-[10px]">{trace.error}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                              <div>
                                <div className="font-sans font-bold text-slate-500 mb-1">
                                  {t('المدخلات (Input):', 'Input Payload:')}
                                </div>
                                <pre className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto text-slate-700 dark:text-slate-300">
                                  {JSON.stringify(trace.input || {}, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <div className="font-sans font-bold text-slate-500 mb-1">
                                  {t('المخرجات (Output):', 'Output Result:')}
                                </div>
                                <pre className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400">
                                  {JSON.stringify(trace.output || {}, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Success or Failure Result Banner */}
              {executionResult && (
                executionResult.status === 'success' ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>
                          {executionMode === 'production'
                            ? t('اكتمل التنفيذ الحي في الإنتاج بنجاح! (Status: 200 OK)', 'Production Execution Succeeded (Status: 200 OK)')
                            : t('نجحت عملية المحاكاة بالكامل! (Simulation OK)', 'Simulation Test Completed (Status: 200 OK)')}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                        Total Time: {executionResult.durationMs}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t(
                        'تم تسجيل وتوثيق جميع خطوات المسار في سجل العمليات (Execution Logs). يمكنك مراجعة العقد وتفاصيل الـ Payloads بدقة.',
                        'All steps and traces have been saved to Execution Logs. You can inspect node payloads and timing metrics.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <span>
                          {t('توقف التنفيذ - هناك عقد تتطلب بيانات اعتماد (Status: 422 Unprocessable)', 'Execution Interrupted - Missing Credentials (Status: 422)')}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400">
                        {executionResult.durationMs}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {executionResult.errorMessage || t(
                        'في وضع الإنتاج الحقيقي، لا يتم إعطاء Status 200 أو نجاح لأي خطوة لم تُنفذ فعليًا. يرجى الانتقال إلى صفحة "التكاملات والمنصات" لإدخال مفاتيح الاعتماد الخاصة بالخدمة.',
                        'In Production Mode, unfulfilled actions are not marked successful. Please configure service credentials in the Integrations page.'
                      )}
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('إغلاق', 'Close')}
          </button>

          {executionMode !== 'webhook' && (
            <button
              id="start_simulation_test_btn"
              onClick={handleStartRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50 ${
                executionMode === 'production'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('جارِ التنفيذ...', 'Executing...')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {executionMode === 'production'
                      ? t('تشغيل الإنتاج الحي الآن', 'Run Live Production')
                      : t('تشغيل المحاكاة الآن', 'Run Live Simulation')}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
