import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  GitFork,
  Sparkles,
  Zap,
  FolderPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreateWorkflowModal } from './CreateWorkflowModal';

export const WorkflowsListView: React.FC = () => {
  const {
    workflows,
    loadWorkflowToBuilder,
    duplicateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    runWorkflowSimulation,
    language,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories = ['all', 'Sales & CRM', 'Customer Support', 'E-Commerce', 'General'];

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.nameAr.includes(searchQuery) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.descriptionAr.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="workflows_list_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('مسارات العمل والأتمتة', 'Workflows & Automations')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'أنشئ وراقب مسارات العمل الآلية الذكية التي تربط أنظمتك وتعمل دون توقف.',
              'Build, manage, and monitor workflows connecting your tools and services.'
            )}
          </p>
        </div>

        <button
          id="open_create_workflow_modal_btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إنشاء مسار جديد', 'New Workflow')}</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('بحث في مسارات العمل...', 'Search workflows...')}
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
              {cat === 'all' ? t('الكل', 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {wf.category}
                </span>

                <button
                  onClick={() => toggleWorkflowStatus(wf.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    wf.isActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{wf.isActive ? t('نشط', 'Active') : t('معطل', 'Paused')}</span>
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                {language === 'ar' ? wf.nameAr : wf.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {language === 'ar' ? wf.descriptionAr : wf.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {wf.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats & Actions Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{wf.nodes.length} {t('عقد', 'nodes')}</span>
                <span>{wf.executionCount.toLocaleString()} {t('تنفيذ', 'runs')}</span>
                <span className="text-emerald-500 font-semibold">{wf.successRate}% {t('نجاح', 'success')}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => runWorkflowSimulation(wf.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                  <span>{t('تشغيل سريع', 'Test Run')}</span>
                </button>

                <button
                  onClick={() => loadWorkflowToBuilder(wf)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('فتح المحرر', 'Edit Canvas')}</span>
                </button>

                <button
                  onClick={() => duplicateWorkflow(wf.id)}
                  title={t('نسخ المسار', 'Duplicate')}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteWorkflow(wf.id)}
                  title={t('حذف', 'Delete')}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {t('لا توجد مسارات عمل مطابقة', 'No Workflows Found')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
            {t(
              'لم يتم العثور على أي مسار يطابق معايير البحث أو الفلتر المحددة. يمكنك إنشاء مسار جديد أو تغيير خيارات البحث.',
              'No automation flows matched your filter. Start by creating a new custom workflow or clearing search filters.'
            )}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إنشاء مسار جديد الآن', 'Create New Workflow Now')}</span>
          </button>
        </div>
      )}

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
