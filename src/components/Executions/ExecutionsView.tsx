import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  Code,
  X,
  Play,
  Copy,
  ChevronRight
} from 'lucide-react';
import { ExecutionLog } from '../../types';
import { useApp } from '../../context/AppContext';

export const ExecutionsView: React.FC = () => {
  const { executions, runWorkflowSimulation, language, t } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'running'>('all');
  const [selectedExecution, setSelectedExecution] = useState<ExecutionLog | null>(null);
  const [activeJsonTab, setActiveJsonTab] = useState<'input' | 'output'>('input');
  const [isRetrying, setIsRetrying] = useState(false);

  const filtered = executions.filter((exec) => {
    const matchesSearch =
      exec.workflowName.toLowerCase().includes(search.toLowerCase()) ||
      exec.id.toLowerCase().includes(search.toLowerCase()) ||
      exec.triggerType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetry = async () => {
    if (!selectedExecution) return;
    setIsRetrying(true);
    await runWorkflowSimulation(selectedExecution.workflowId, selectedExecution.inputPayload);
    setIsRetrying(false);
  };

  return (
    <div id="executions_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>{t('سجل العمليات والمراقبة اللحظية', 'Execution Engine & Telemetry')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('سجل تنفيذ العمليات (Execution Logs)', 'Workflow Execution Logs')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'تتبع كل عملية تشغيل لمسارات العمل بالتفصيل، وافحص مدخلات ومخرجات كل خطوة مع إمكانية إعادة التشغيل.',
              'Inspect step-by-step logs, durations, payload data, and retry failed operations.'
            )}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('بحث بالاسم أو المعرف...', 'Search by workflow or run ID...')}
            className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'success', 'failed', 'running'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all'
                ? t('الكل', 'All')
                : st === 'success'
                ? t('ناجحة', 'Success')
                : st === 'failed'
                ? t('فاشلة', 'Failed')
                : t('قيد التشغيل', 'Running')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 text-start">{t('الحالة', 'Status')}</th>
                <th className="p-3.5 text-start">{t('الوضع (Mode)', 'Mode')}</th>
                <th className="p-3.5 text-start">{t('اسم المسار', 'Workflow')}</th>
                <th className="p-3.5 text-start">{t('نقطة البدء (Trigger)', 'Trigger')}</th>
                <th className="p-3.5 text-start">{t('مدة التنفيذ', 'Duration')}</th>
                <th className="p-3.5 text-start">{t('وقت البدء', 'Started At')}</th>
                <th className="p-3.5 text-end">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((exec) => (
                <tr
                  key={exec.id}
                  onClick={() => setSelectedExecution(exec)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exec.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : exec.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exec.status === 'success'
                            ? 'bg-emerald-500'
                            : exec.status === 'failed'
                            ? 'bg-rose-500'
                            : 'bg-amber-500 animate-ping'
                        }`}
                      />
                      <span>{exec.status.toUpperCase()}</span>
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        exec.mode === 'production'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {exec.mode === 'production' ? 'PRODUCTION' : 'TEST/MOCK'}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {exec.workflowName}
                    <div className="text-[10px] font-mono text-slate-400 font-normal">
                      {exec.id}
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                    {exec.triggerType}
                  </td>

                  <td className="p-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {exec.durationMs}ms
                  </td>

                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {exec.startedAt}
                  </td>

                  <td className="p-3.5 text-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExecution(exec);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      {t('فحص الخطوات', 'Inspect Trace')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Detailed Drawer */}
      {selectedExecution && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedExecution.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedExecution.workflowName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedExecution(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                  selectedExecution.status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedExecution.status === 'success'
                      ? t('اكتملت العملية بنجاح كامل', 'Execution Completed Successfully')
                      : t('فشلت العملية في إحدى الخطوات', 'Execution Failed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/50 dark:bg-slate-800">
                    {selectedExecution.mode === 'production' ? 'PRODUCTION' : 'TEST MOCK'}
                  </span>
                  <span className="font-mono">{selectedExecution.durationMs}ms</span>
                </div>
              </div>

              {selectedExecution.errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
                  <span className="font-bold">{t('سبب الخطأ: ', 'Error: ')}</span>
                  <span>{selectedExecution.errorMessage}</span>
                </div>
              )}

              {/* Step by Step Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('المراحل والعقد المنفذة (Node Traces)', 'Step-by-step Nodes Trace')}
                </h4>
                <div className="space-y-2">
                  {(selectedExecution.traces || []).map((st, idx) => (
                    <div
                      key={st.nodeId}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        st.status === 'success'
                          ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                          : st.status === 'not_connected'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            st.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {st.nodeName}
                            </p>
                            <span className={`text-[10px] font-semibold ${
                              st.status === 'success'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : st.status === 'not_connected'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {st.status.toUpperCase()}
                              {st.retries && st.retries > 0 ? ` (${st.retries} retries)` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {st.durationMs}ms
                        </span>
                      </div>

                      {st.error && (
                        <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                          {st.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload Data Tabs */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('حزم البيانات (Payload Data)', 'Payload Data')}
                  </h4>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px]">
                    <button
                      onClick={() => setActiveJsonTab('input')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        activeJsonTab === 'input'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      Input Data
                    </button>
                    <button
                      onClick={() => setActiveJsonTab('output')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        activeJsonTab === 'output'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      Output Data
                    </button>
                  </div>
                </div>

                <pre className="p-3 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                  {JSON.stringify(
                    activeJsonTab === 'input'
                      ? selectedExecution.inputPayload
                      : selectedExecution.outputPayload,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* Footer with Retry Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? t('جارِ إعادة المحاولة...', 'Retrying...') : t('إعادة تشغيل العملية (Retry)', 'Retry Execution')}</span>
              </button>
              <button
                onClick={() => setSelectedExecution(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
