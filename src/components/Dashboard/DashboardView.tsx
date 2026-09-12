import React from 'react';
import {
  GitFork,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Users,
  Sparkles,
  Zap,
  ArrowUpRight,
  Play,
  Share2,
  Clock,
  Plus,
  Wand2,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppBusinessCard } from './WhatsAppBusinessCard';

export const DashboardView: React.FC = () => {
  const {
    workflows,
    executions,
    agents,
    leads,
    analytics,
    loadWorkflowToBuilder,
    setCurrentView,
    toggleWorkflowStatus,
    runWorkflowSimulation,
    language,
    t
  } = useApp();

  const activeWorkflows = workflows.filter((w) => w.isActive);
  const recentExecutions = executions.slice(0, 5);

  return (
    <div id="dashboard_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/20 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('منظومة أتمتة الأعمال الذكية بالذكاء الاصطناعي', 'Next-Gen AI Business Automation Engine')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {language === 'ar'
              ? 'أهلاً بك في منصة زين للأتمتة والذكاء الاصطناعي'
              : 'Welcome to Zain Automation AI'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'حوّل أي عملية عمل يدوية متكررة إلى مسار آلي ذكي يعمل على مدار الساعة. ادمج وكلاء الذكاء الاصطناعي، نماذج البيانات، ونظام CRM في منصة واحدة.'
              : 'Turn repetitive manual processes into self-driving 24/7 intelligent workflows. Combine AI Agents, Smart Forms, Integrations, and Built-in CRM.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="dashboard_open_ai_generator_hero"
              onClick={() => {
                loadWorkflowToBuilder(workflows[0]);
                setCurrentView('builder');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{t('فتح محرر المسارات البصري', 'Open Visual Builder')}</span>
            </button>

            <button
              onClick={() => setCurrentView('specs_roadmap')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/40 bg-slate-800/60 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <span>{t('استعراض خارطة الطريق والمواصفات التقنية', 'View Roadmap & Technical Specs')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Workflows */}
        <div
          onClick={() => setCurrentView('workflows')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('مسارات العمل النشطة', 'Active Workflows')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeWorkflows.length}
            </span>
            <span className="text-xs text-slate-400">
              / {workflows.length} {t('إجمالي', 'total')}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% {t('جاهزية النظام', 'system uptime')}</span>
          </div>
        </div>

        {/* Metric 2: Total Executions */}
        <div
          onClick={() => setCurrentView('executions')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('العمليات المنفذة', 'Total Executions')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {analytics.totalExecutions.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{analytics.successRate}% {t('معدل النجاح', 'success rate')}</span>
          </div>
        </div>

        {/* Metric 3: AI Agents */}
        <div
          onClick={() => setCurrentView('agents')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-500/40 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('وكلاء الذكاء الاصطناعي', 'Active AI Agents')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {agents.length}
            </span>
            <span className="text-xs text-purple-500 font-semibold">Gemini 2.5</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{(analytics.aiTokensConsumed / 1000000).toFixed(2)}M {t('توكنز مستهلكة', 'tokens')}</span>
          </div>
        </div>

        {/* Metric 4: CRM Leads */}
        <div
          onClick={() => setCurrentView('crm')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-sky-500/40 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('العملاء والـ Leads', 'Captured Leads')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {leads.length}
            </span>
            <span className="text-xs text-slate-400">+1,240 {t('هذا الشهر', 'mo')}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>28.4% {t('معدل التحويل البيعي', 'conversion')}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Business Cloud API Integration Card */}
      <WhatsAppBusinessCard />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Workflows List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('مسارات العمل السريعة والنشطة', 'Active Workflows Engine')}
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('workflows')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t('عرض الكل', 'View all')} ({workflows.length})
            </button>
          </div>

          <div className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'ar' ? wf.nameAr : wf.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {wf.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {language === 'ar' ? wf.descriptionAr : wf.description}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>{wf.nodes.length} {t('عقدة (Nodes)', 'nodes')}</span>
                    <span>•</span>
                    <span>{wf.executionCount.toLocaleString()} {t('تنفيذ', 'runs')}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">{wf.successRate}% {t('نجاح', 'success')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => runWorkflowSimulation(wf.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                    <span>{t('تشغيل سريع', 'Simulate')}</span>
                  </button>

                  <button
                    onClick={() => loadWorkflowToBuilder(wf)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    {t('المحرر', 'Edit')}
                  </button>

                  <button
                    onClick={() => toggleWorkflowStatus(wf.id)}
                    className={`p-1.5 rounded-xl border text-xs ${
                      wf.isActive
                        ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                        : 'border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                    title={wf.isActive ? 'Active' : 'Inactive'}
                  >
                    {wf.isActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Execution Feed & Top Agents */}
        <div className="space-y-6">
          {/* Live Executions Feed */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('بث العمليات اللحظي', 'Live Executions Stream')}
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('executions')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('السجل الكامل', 'Logs')}
              </button>
            </div>

            <div className="space-y-2.5">
              {recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => setCurrentView('executions')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        exec.status === 'success'
                          ? 'bg-emerald-500'
                          : exec.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {exec.workflowName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {exec.triggerType} • {exec.durationMs}ms
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {exec.startedAt.split(' ')[1] || exec.startedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents Quick Status */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('وكلاء الذكاء الاصطناعي النشطين', 'Deployed AI Agents')}
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('agents')}
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {t('إدارة الوكلاء', 'Manage')}
              </button>
            </div>

            <div className="space-y-2.5">
              {agents.slice(0, 3).map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setCurrentView('agents')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{agent.avatar}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {language === 'ar' ? agent.nameAr : agent.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {language === 'ar' ? agent.roleAr : agent.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t('نشط 24/7', 'Active')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
