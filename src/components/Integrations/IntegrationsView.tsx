import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Search,
  Plus,
  Zap,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Sliders,
  Key,
  Lock,
  Server,
  Check,
  Send,
  Mail,
  MessageCircle,
  Hash,
  Layers
} from 'lucide-react';
import { IntegrationService } from '../../types';
import { useApp } from '../../context/AppContext';

export const IntegrationsView: React.FC = () => {
  const {
    integrations,
    saveIntegrationCredentials,
    disconnectIntegration,
    testIntegrationConnection,
    refreshIntegrations,
    language,
    t
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [configuringIntegration, setConfiguringIntegration] = useState<IntegrationService | null>(null);

  // Form state for configuration modal
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Real API Keys Health Check
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthResults, setHealthResults] = useState<Record<string, { status: string }> | null>(null);

  const handleCheckAllApiKeys = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/integrations/health');
      if (res.ok) {
        const data = await res.json();
        setHealthResults(data);
      }
    } catch {
      // safe fallback
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    refreshIntegrations();
  }, []);

  const categories = [
    'all',
    'messaging',
    'crm',
    'productivity',
    'automation'
  ];

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    messaging: { ar: 'المراسلة والتواصل', en: 'Messaging' },
    crm: { ar: 'إدارة العملاء CRM', en: 'CRM & Leads' },
    productivity: { ar: 'الإنتاجية وقواعد البيانات', en: 'Productivity' },
    automation: { ar: 'الأتمتة والويب هوك', en: 'Automation' }
  };

  const handleOpenConfig = (item: IntegrationService) => {
    setConfiguringIntegration(item);
    setTestResult(null);

    // Populate initial fields based on integration ID
    if (item.id === 'int_whatsapp') {
      setFormCredentials({
        phoneNumberId: item.config?.phoneNumberId || '',
        accessToken: item.hasCredentials ? '••••••••••••••••••••' : '',
        businessAccountId: item.config?.businessAccountId || '',
        verifyToken: item.config?.verifyToken || 'zain_verify_meta_token'
      });
    } else if (item.id === 'int_email') {
      setFormCredentials({
        provider: item.config?.provider || 'resend',
        apiKey: item.hasCredentials ? '••••••••••••••••••••' : '',
        fromEmail: item.config?.fromEmail || 'notifications@yourdomain.sa'
      });
    } else if (item.id === 'int_slack') {
      setFormCredentials({
        webhookUrl: item.hasCredentials ? '••••••••••••••••••••' : '',
        channel: item.config?.channel || '#leads'
      });
    } else if (item.id === 'int_ollama') {
      setFormCredentials({
        baseUrl: item.config?.baseUrl || 'http://127.0.0.1:11434',
        apiKey: item.config?.apiKey || 'ZAIN_SECRET_2026',
        model: item.config?.model || 'llama3:latest'
      });
    } else if (item.id === 'int_supabase') {
      setFormCredentials({
        publishableKey: item.config?.publishableKey || 'sb_publishable_0Oz4cvN8zitr3I_nJZ_vXA_pyMzQarR',
        apiKey: item.config?.publishableKey || 'sb_publishable_0Oz4cvN8zitr3I_nJZ_vXA_pyMzQarR',
        projectUrl: item.config?.projectUrl || 'https://api.supabase.co'
      });
    } else {
      setFormCredentials({
        apiKey: item.hasCredentials ? '••••••••••••••••••••' : '',
        endpointUrl: item.config?.endpointUrl || ''
      });
    }
  };

  const handleTestConnection = async () => {
    if (!configuringIntegration) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testIntegrationConnection(configuringIntegration.id, formCredentials);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'فشل الاتصال بالخدمة'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!configuringIntegration) return;
    setIsSaving(true);
    try {
      const success = await saveIntegrationCredentials(configuringIntegration.id, formCredentials);
      if (success) {
        setConfiguringIntegration(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    await disconnectIntegration(id);
    if (configuringIntegration?.id === id) {
      setConfiguringIntegration(null);
    }
  };

  const filtered = integrations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.descriptionAr.includes(search);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalConnected = integrations.filter((i) => i.connected).length;
  const totalWithCreds = integrations.filter((i) => i.hasCredentials).length;

  return (
    <div id="integrations_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('منظومة التكامل والربط السحابي الحقيقي', 'Production Integrations & Credentials Hub')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('التكاملات وبيانات الاعتماد (Integrations & Credentials)', 'Integrations & Credentials')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'اربط مفاتيح الـ API الحقيقية لواتساب، مزودات البريد، سلاك، والويب هوك لتشغيل المسارات في بيئة الإنتاج الفعلية.',
              'Connect real API keys and credentials for WhatsApp, Email, Slack, and Webhooks for live production workflows.'
            )}
          </p>
        </div>

        {/* Quick Stats Pill and Check All Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">{t('الخدمات النشطة', 'Active')}</div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {totalConnected} / {integrations.length}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400">{t('المفاتيح المرتبطة', 'Credentials')}</div>
              <div className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                {totalWithCreds}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckAllApiKeys}
            disabled={isCheckingHealth}
            className="flex items-center gap-2 px-3.5 py-3 rounded-2xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            {isCheckingHealth ? t('جارِ الفحص الفعلي...', 'Verifying APIs...') : t('فحص جميع مفاتيح API', 'Check all API Keys')}
          </button>
        </div>
      </div>

      {/* Real API Key Health Results Card */}
      {healthResults && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Activity className="w-4 h-4 text-emerald-500" />
              {t('نتائج الفحص الفعلي لمفاتيح الـ API والاتصالات:', 'Live API Key Health Verification Results:')}
            </div>
            <button
              type="button"
              onClick={() => setHealthResults(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(healthResults).map(([key, item]) => {
              const title =
                key === 'gemini'
                  ? 'Google Gemini AI'
                  : key === 'whatsapp'
                  ? 'WhatsApp Business API'
                  : key === 'email'
                  ? 'Email / Resend'
                  : 'CRM Database';
              const status = item?.status || 'NOT_CONFIGURED';
              const config =
                status === 'VALID'
                  ? {
                      text: t('✓ المفتاح صالح ويعمل', '✓ Valid & Operational'),
                      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }
                  : status === 'INSUFFICIENT_PERMISSIONS'
                  ? {
                      text: t('⚠ المفتاح موجود لكن الصلاحيات غير كافية', '⚠ Insufficient Permissions'),
                      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }
                  : status === 'INVALID' || status === 'EXPIRED'
                  ? {
                      text: t('✕ المفتاح غير صالح أو منتهي', '✕ Invalid or Expired Key'),
                      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    }
                  : status === 'CONNECTION_ERROR'
                  ? {
                      text: t('⚠ الخدمة غير متصلة', '⚠ Connection Error'),
                      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }
                  : {
                      text: t('⚠ المفتاح غير مُعرّف', '⚠ Not Configured'),
                      color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                    };

              return (
                <div key={key} className={`p-3 rounded-xl border ${config.color} flex flex-col justify-between`}>
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{title}</div>
                  <div className="text-[11px] font-medium mt-1">{config.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Production Warning Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold">
            {t('معيار الأمان ومصداقية التنفيذ في زين للأتمتة والذكاء الاصطناعي:', 'Production Execution Standard (Zain Automation AI):')}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {t(
              'في وضع الإنتاج الحي (Live Production Mode)، يتم استدعاء APIs الحقيقية للخدمات المرتبطة فقط عند وجود بيانات اعتماد حقيقية. إذا كانت الخدمة غير متصلة، سيتوقف المسار ولن يتم إظهار Status 200 وهمي حفاظًا على دقة السجلات ومصداقية النظام.',
              'In Live Production Mode, real APIs are called. Missing credentials cause nodes to halt with clear NOT_CONNECTED states—never false 200 OKs.'
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('بحث عن تطبيق أو خدمة أو API...', 'Search integrations or APIs...')}
            className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {categoryLabels[cat] ? (language === 'ar' ? categoryLabels[cat].ar : categoryLabels[cat].en) : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                    {item.id === 'int_whatsapp' ? (
                      <MessageCircle className="w-6 h-6" />
                    ) : item.id === 'int_email' ? (
                      <Mail className="w-6 h-6" />
                    ) : item.id === 'int_slack' ? (
                      <Hash className="w-6 h-6" />
                    ) : (
                      <Layers className="w-6 h-6" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      item.connected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span>
                      {item.connected
                        ? (language === 'ar' ? item.statusTextAr || 'متصل' : item.statusText || 'Connected')
                        : t('غير متصل / مطلوب مفاتيح', 'Disconnected')}
                    </span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {language === 'ar' ? item.descriptionAr : item.description}
                  </p>
                </div>

                {item.hasCredentials && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono pt-1">
                    <Key className="w-3 h-3" />
                    <span>{t('بيانات الاعتماد مخزنة ومفعلة', 'Encrypted credentials active')}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenConfig(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {item.hasCredentials
                      ? t('تعديل المفاتيح والربط', 'Configure Keys')
                      : t('ربط بيانات الاعتماد', 'Connect Credentials')}
                  </span>
                </button>

                {item.connected && (
                  <button
                    onClick={() => handleDisconnect(item.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                    title={t('فصل الخدمة', 'Disconnect')}
                  >
                    {t('فصل', 'Disconnect')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration & Credentials Modal */}
      {configuringIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('ربط بيانات الاعتماد بـ', 'Credentials for')} {configuringIntegration.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('يتم حفظ وتشفير المفاتيح في قاعدة بيانات زين للأتمتة والذكاء الاصطناعي لتشغيل بيئة الإنتاج.', 'Credentials are encrypted in Zain Automation AI tenant vault for live runs.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfiguringIntegration(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs based on Integration */}
            <div className="space-y-3 text-xs">
              {configuringIntegration.id === 'int_whatsapp' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('معرف رقم هاتف واتساب (Phone Number ID)', 'Phone Number ID')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 104928374829102"
                      value={formCredentials.phoneNumberId || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, phoneNumberId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('رمز الوصول الدائم (System User Permanent Access Token)', 'Permanent Access Token')}
                    </label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={formCredentials.accessToken || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, accessToken: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('معرف حساب أعمال واتساب (WABA ID)', 'WhatsApp Business Account ID')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 293847592817263"
                      value={formCredentials.businessAccountId || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, businessAccountId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </>
              ) : configuringIntegration.id === 'int_email' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('مزود خدمة البريد (Email Provider)', 'Email Provider')}
                    </label>
                    <select
                      value={formCredentials.provider || 'resend'}
                      onChange={(e) => setFormCredentials({ ...formCredentials, provider: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    >
                      <option value="resend">Resend API (موصى به)</option>
                      <option value="sendgrid">SendGrid API</option>
                      <option value="smtp">خادم بريد خاص (Custom SMTP)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('مفتاح الـ API للبريد (API Key)', 'API Key / Auth Secret')}
                    </label>
                    <input
                      type="password"
                      placeholder="re_123456789... or SG..."
                      value={formCredentials.apiKey || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, apiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('البريد المرسل الافتراضي (From Email)', 'Default Sender Email')}
                    </label>
                    <input
                      type="email"
                      placeholder="notifications@yourdomain.sa"
                      value={formCredentials.fromEmail || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, fromEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </>
              ) : configuringIntegration.id === 'int_slack' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('رابط Webhook لسلاك (Incoming Webhook URL)', 'Slack Incoming Webhook URL')}
                    </label>
                    <input
                      type="password"
                      placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                      value={formCredentials.webhookUrl || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('القناة الافتراضية (Target Channel)', 'Default Channel')}
                    </label>
                    <input
                      type="text"
                      placeholder="#sales-leads"
                      value={formCredentials.channel || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, channel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </>
              ) : configuringIntegration.id === 'int_ollama' ? (
                <>
                  {/* Mode Selector Presets */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('نوع الاتصال ونمط التوجيه', 'Connection Mode & Endpoint')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormCredentials({ ...formCredentials, baseUrl: 'http://127.0.0.1:11434' })}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                          (formCredentials.baseUrl || '').includes('127.0.0.1') || (formCredentials.baseUrl || '').includes('localhost')
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        💻 {t('خادم محلي داخلي', 'Internal Local (127.0.0.1)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormCredentials({
                          ...formCredentials,
                          baseUrl: (formCredentials.baseUrl && formCredentials.baseUrl.includes('trycloudflare.com'))
                            ? formCredentials.baseUrl
                            : 'https://xxxx.trycloudflare.com'
                        })}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                          (formCredentials.baseUrl || '').includes('trycloudflare.com') || (formCredentials.baseUrl || '').startsWith('https://')
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🌐 {t('عام وخارجي (Cloudflare)', 'Public Cloudflare Tunnel')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs">
                      <span>{t('رابط الخادم أو نفق Cloudflare (Base URL)', 'Ollama Base URL / Cloudflare Tunnel')}</span>
                      {(formCredentials.baseUrl || '').includes('trycloudflare.com') || (formCredentials.baseUrl || '').startsWith('https://') ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-medium">
                          🌐 {t('نفق عام وخارجي', 'Public Tunnel Active')}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                          🔒 {t('داخلي محلي', 'Local Internal')}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="https://xxxx.trycloudflare.com أو http://127.0.0.1:11434"
                      value={formCredentials.baseUrl || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, baseUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t(
                        'يدعم الخوادم الداخلية (127.0.0.1:11434) والأنفاق الخارجية العامة (مثل https://xxxx.trycloudflare.com).',
                        'Supports internal servers (127.0.0.1:11434) and public external tunnels (e.g. https://xxxx.trycloudflare.com).'
                      )}
                    </p>
                  </div>

                  {/* API Key Header */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs">
                      <span>{t('مفتاح المصادقة والترويسة (x-api-key)', 'API Key Header (x-api-key)')}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Content-Type: application/json
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="ZAIN_SECRET_2026"
                      value={formCredentials.apiKey !== undefined ? formCredentials.apiKey : 'ZAIN_SECRET_2026'}
                      onChange={(e) => setFormCredentials({ ...formCredentials, apiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t('يتم إرسال المفتاح تلقائياً في ترويسات `x-api-key` و `Authorization: Bearer`.', 'Sent automatically in `x-api-key` and `Authorization: Bearer` headers.')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {t('النموذج الافتراضي (Default Model)', 'Default Model')}
                    </label>
                    <input
                      type="text"
                      placeholder="llama3:latest أو mistral أو deepseek-r1"
                      value={formCredentials.model || 'llama3:latest'}
                      onChange={(e) => setFormCredentials({ ...formCredentials, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      {t('أمثلة: `llama3:latest` أو `deepseek-r1:latest` أو `mistral:latest` أو `qwen2.5:latest`.', 'Examples: `llama3:latest`, `deepseek-r1:latest`, `mistral:latest`, `qwen2.5:latest`.')}
                    </p>
                  </div>
                </>
              ) : configuringIntegration.id === 'int_supabase' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs">
                      <span>{t('المفتاح المنشور (Publishable API Key)', 'Publishable API Key (sb_publishable_...)')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                        RLS Protected
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="sb_publishable_0Oz4cvN8zitr3I_nJZ_vXA_pyMzQarR"
                      value={formCredentials.publishableKey !== undefined ? formCredentials.publishableKey : (formCredentials.apiKey || '')}
                      onChange={(e) => setFormCredentials({ ...formCredentials, publishableKey: e.target.value, apiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t('مفتاح Supabase المنشور الحديث المخصص للعميل والبروكسي الآمن، محمي بسياسات RLS على مستوى الصفوف.', 'Modern Supabase publishable key for client/safe-proxy usage, governed by Row Level Security.')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {t('رابط مشروع Supabase (Project URL)', 'Supabase Project URL')}
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzproject.supabase.co"
                      value={formCredentials.projectUrl || 'https://api.supabase.co'}
                      onChange={(e) => setFormCredentials({ ...formCredentials, projectUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      {t('مثال: `https://xxxx.supabase.co` للاتصال بـ PostgreSQL والـ Storage و Edge Functions.', 'Example: `https://xxxx.supabase.co` to connect PostgreSQL, Storage, and Edge Functions.')}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('مفتاح الـ API أو Token', 'API Key / Token')}
                    </label>
                    <input
                      type="password"
                      placeholder="sk_live_..."
                      value={formCredentials.apiKey || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, apiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t('رابط نقطة النهاية (Endpoint URL)', 'API Base URL / Endpoint')}
                    </label>
                    <input
                      type="text"
                      placeholder="https://api.service.com/v1"
                      value={formCredentials.endpointUrl || ''}
                      onChange={(e) => setFormCredentials({ ...formCredentials, endpointUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </>
              )}

              {/* Encryption Banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{t('يتم تشفير وتخزين المفاتيح في خادم زين للأتمتة والذكاء الاصطناعي ولا يتم كشفها للواجهة الأمامية.', 'Encrypted server-side in your isolated Zain Automation AI tenant vault.')}</span>
              </div>

              {/* Test Connection Result Feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.latencyMs && (
                    <span className="font-mono text-[10px] font-bold">
                      {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-500' : ''}`} />
                <span>{isTesting ? t('فحص الاتصال...', 'Testing...') : t('فحص الاتصال الفعلي', 'Ping Real API')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguringIntegration(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('جارِ الحفظ...', 'Saving...')}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('حفظ وتفعيل الاعتماد', 'Save & Connect')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
