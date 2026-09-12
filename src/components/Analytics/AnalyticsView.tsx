import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { analytics, workflows, language, t } = useApp();

  const [dateRange, setDateRange] = useState('30d');

  // Simulated daily volume
  const dailyExecutions = [
    { day: 'Sat', count: 420, success: 418 },
    { day: 'Sun', count: 680, success: 672 },
    { day: 'Mon', count: 910, success: 902 },
    { day: 'Tue', count: 1140, success: 1130 },
    { day: 'Wed', count: 890, success: 885 },
    { day: 'Thu', count: 1250, success: 1240 },
    { day: 'Fri', count: 530, success: 527 }
  ];

  const maxCount = 1300;

  return (
    <div id="analytics_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('مؤشرات الأداء اللحظية', 'Real-Time Telemetry & Insights')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('لوحة التحليلات والإحصائيات (Analytics)', 'Analytics & Performance')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'راقب معدلات نجاح العمليات، وسرعة الاستجابة، واستهلاك الـ AI Tokens في مكان واحد.',
              'Track execution volume, success rates, latency distribution, and AI tokens consumed.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="7d">{t('آخر 7 أيام', 'Last 7 Days')}</option>
            <option value="30d">{t('آخر 30 يوم', 'Last 30 Days')}</option>
            <option value="90d">{t('آخر ربع سنوي', 'Last Quarter')}</option>
          </select>

          <button
            onClick={() => alert(language === 'ar' ? 'تم تصدير التقرير كـ CSV بنجاح.' : 'Report exported successfully.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('تصدير التقرير', 'Export')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">{t('معدل النجاح الإجمالي', 'Success Rate')}</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">{analytics.successRate}%</div>
          <div className="text-[11px] text-slate-400">+0.4% {t('مقارنة بالشهر السابق', 'vs last month')}</div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">{t('إجمالي التنفيذات', 'Total Runs')}</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {analytics.totalExecutions.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold">+18.2% {t('نمو متسارع', 'growth')}</div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">{t('متوسط زمن الاستجابة', 'Avg Execution Time')}</span>
          <div className="text-2xl sm:text-3xl font-black text-teal-500">{analytics.averageLatencyMs} ms</div>
          <div className="text-[11px] text-slate-400">{t('سرعة فائقة دون تأخير', 'Sub-second speed')}</div>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">{t('استهلاك التوكنز الذكي', 'AI Tokens Consumed')}</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-500">
            {(analytics.aiTokensConsumed / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400">Gemini 2.5 Flash / Pro</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('حجم العمليات المنفذة يوميًا', 'Daily Execution Volume')}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total: 5,820 runs</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {dailyExecutions.map((item, idx) => {
              const heightPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-emerald-500 group-hover:bg-emerald-400 transition-all rounded-t-xl"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Workflows Breakdown (1 col) */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('أكثر المسارات استخدامًا', 'Most Executed Workflows')}
          </h3>

          <div className="space-y-4">
            {workflows.map((wf) => {
              const percent = Math.round((wf.executionCount / analytics.totalExecutions) * 100);
              return (
                <div key={wf.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {language === 'ar' ? wf.nameAr : wf.name}
                    </span>
                    <span className="font-mono text-slate-400">{wf.executionCount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
