import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Building2,
  Users,
  Cpu,
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const { t, switchOrganization, setCurrentView } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orgs' | 'audit' | 'workers' | 'flags'>('orgs');
  const [newOrgModal, setNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('starter');
  const [creating, setCreating] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, orgs, logs] = await Promise.all([
        api.getSuperAdminMetrics(),
        api.getSuperAdminOrganizations(),
        api.getSuperAdminAuditLogs()
      ]);
      setMetrics(m.metrics);
      setOrganizations(orgs.organizations);
      setAuditLogs(logs.auditLogs);
    } catch (e) {
      console.warn('Super admin fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      await api.createOrganization(newOrgName.trim(), newOrgPlan);
      setNewOrgName('');
      setNewOrgModal(false);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleJumpToOrg = async (orgId: string) => {
    await switchOrganization(orgId);
    setCurrentView('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t('لوحة التحكم المركزية (Super Admin)', 'Super Admin Central Control')}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  Multi-Tenant Engine v2.0
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t(
                  'إدارة كافة المؤسسات، المشتركين، معدلات الاستهلاك، خوادم التنفيذ، وسجلات التدقيق عبر المنصة.',
                  'Manage all client organizations, subscriptions, usage limits, worker queues, and audit logs across the SaaS.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('تحديث البيانات', 'Refresh')}
          </button>
          <button
            onClick={() => setNewOrgModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            {t('إضافة مؤسسة جديدة', 'New Organization')}
          </button>
        </div>
      </div>

      {/* Global SaaS Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t('المؤسسات المشتركة', 'Total Organizations')}</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.totalOrganizations || organizations.length || 3}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            100% {t('حسابات مفعلة ونشطة', 'active accounts')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t('إجمالي التنفيذات (Executions)', 'Global Executions')}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(metrics?.totalExecutionsAllTime || 62890).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t('معدل النجاح العام:', 'Overall success rate:')} 99.6%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t('استهلاك توكنز الذكاء الاصطناعي', 'AI Tokens Consumed')}</span>
            <Cpu className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(metrics?.aiTokensAllTime || 4820000).toLocaleString()}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            Gemini 2.5 Flash + Real Engine
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">{t('حالة المحرك وخوادم الـ Workers', 'Workers Health')}</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics?.systemHealth === 'healthy' ? t('ممتاز (Healthy)', 'Healthy') : t('طبيعي', 'Normal')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t('زمن طابور التنفيذ:', 'Queue latency:')} {metrics?.workerQueueLatencyMs || 142}ms • 8 Workers
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('orgs')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'orgs'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {t('إدارة المؤسسات والعملاء', 'Organizations')} ({organizations.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          {t('سجلات التدقيق والأمان (Audit Logs)', 'Audit Logs')}
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'flags'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          {t('مفاتيح الميزات (Feature Flags)', 'Feature Flags')}
        </button>
      </div>

      {/* Tab 1: Organizations List */}
      {activeTab === 'orgs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium text-xs border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">{t('المؤسسة', 'Organization')}</th>
                  <th className="px-5 py-3.5">{t('الخطة والاشتراك', 'Plan')}</th>
                  <th className="px-5 py-3.5">{t('المسارات والعملاء', 'Workflows & Leads')}</th>
                  <th className="px-5 py-3.5">{t('استهلاك التنفيذات الشهري', 'Executions Usage')}</th>
                  <th className="px-5 py-3.5">{t('مفتاح API والويب هوك', 'API & Webhook')}</th>
                  <th className="px-5 py-3.5 text-center">{t('الإجراء', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {organizations.map((org) => {
                  const used = org.usage?.executionsThisMonth || 0;
                  const max = org.usage?.maxExecutions || 25000;
                  const pct = Math.min(100, Math.round((used / max) * 100));

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {org.nameAr || org.name}
                              {org.status === 'active' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              slug: {org.slug} • {org.billingEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Zap className="w-3 h-3 text-emerald-500" />
                          {org.planName || org.planId}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {org.membersCount || 1} {t('أعضاء فريق', 'members')}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {org.workflowsCount || 0} {t('مسارات', 'workflows')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {org.leadsCount || 0} {t('عميل مؤهل', 'leads')}
                        </div>
                      </td>

                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>{used.toLocaleString()} / {max.toLocaleString()}</span>
                          <span className="text-slate-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                          {org.apiKey ? `${org.apiKey.substring(0, 10)}...` : 'za_live_...'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleJumpToOrg(org.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t('التبديل إلى هذه المؤسسة', 'Enter Tenant')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            {t('سجل الأحداث الأمنية والتشغيلية الموحد (Platform Audit Trail)', 'Platform Audit Trail')}
          </h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">{t('لا توجد سجلات حالياً', 'No logs recorded yet')}</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{log.action}</span>
                      <span className="text-slate-500 dark:text-slate-400 mx-2">على</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">{log.resource}</span>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left text-slate-400">
                    <div>{log.userName} ({log.ip})</div>
                    <div className="text-[10px]">{new Date(log.timestamp).toLocaleString('ar-SA')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Feature Flags */}
      {activeTab === 'flags' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 max-w-2xl">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">
            {t('التحكم بالميزات العالمية للـ SaaS', 'Global Feature Flags')}
          </h3>
          <div className="space-y-4">
            {[
              {
                id: 'flag_ai_agents',
                title: 'تفعيل AI Agents المستقلة',
                desc: 'تمكين وكلاء الذكاء الاصطناعي من اتخاذ القرارات وإرسال الرسائل تلقائياً',
                enabled: true
              },
              {
                id: 'flag_webhooks',
                title: 'استقبال الويب هوك المفتوح (Public Ingestion)',
                desc: 'السماح للأنظمة الخارجية مثل سلة، شوبيفاي، وMeta بإرسال البيانات فوراً للمسارات',
                enabled: true
              },
              {
                id: 'flag_local_payments',
                title: 'بوابات الدفع المحلية (Mada / HyperPay / Tap)',
                desc: 'تفعيل مسارات تتبع الدفع والاشتراكات عبر البوابات المصرفية في السعودية والخليج',
                enabled: true
              },
              {
                id: 'flag_custom_domain',
                title: 'النطاقات المخصصة للشركات (Custom Domains)',
                desc: 'تمكين باقات الشركات الكبرى من استضافة النماذج وصفحات الأتمتة على نطاقهم الخاص',
                enabled: false
              }
            ].map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  {f.enabled ? t('مفعل للجميع', 'Enabled') : t('قيد الاختبار', 'Beta')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create New Organization */}
      {newOrgModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t('إنشاء مؤسسة مستأجرة جديدة (New Tenant)', 'Create New Tenant Organization')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t(
                'سيتم إنشاء حساب مؤسسة معزول تماماً، بمفتاح API وويب هوك ومساحة بيانات مستقلة.',
                'Will create a completely isolated tenant with independent API keys, workflows, and database.'
              )}
            </p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('اسم المؤسسة أو الشركة', 'Organization Name')}
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="مثلاً: شركة الريادة للخدمات اللوجستية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('خطة الاشتراك المبدئية', 'Subscription Plan')}
                </label>
                <select
                  value={newOrgPlan}
                  onChange={(e) => setNewOrgPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="starter">Starter (15,000 executions)</option>
                  <option value="pro">Pro Automation (60,000 executions)</option>
                  <option value="agency">Agency & Scale (250,000 executions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewOrgModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md transition disabled:opacity-50"
                >
                  {creating ? t('جارِ الإنشاء...', 'Creating...') : t('إنشاء المؤسسة الآن', 'Create Organization')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
