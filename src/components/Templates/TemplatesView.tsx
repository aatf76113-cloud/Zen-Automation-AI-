import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Tag,
  Search,
  ExternalLink
} from 'lucide-react';
import { INITIAL_TEMPLATES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { Workflow } from '../../types';

export const TemplatesView: React.FC = () => {
  const { createNewWorkflow, loadWorkflowToBuilder, saveWorkflow, language, t } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Sales & Marketing',
    'Customer Support',
    'E-Commerce',
    'Productivity',
    'Finance & Invoicing'
  ];

  const handleUseTemplate = (tmpl: (typeof INITIAL_TEMPLATES)[0]) => {
    const newWorkflow: Workflow = {
      id: `wf_from_tmpl_${Date.now()}`,
      name: tmpl.title,
      nameAr: tmpl.titleAr,
      description: tmpl.description,
      descriptionAr: tmpl.descriptionAr,
      isActive: true,
      category: tmpl.category,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      successRate: 100,
      tags: [tmpl.category, 'Template'],
      nodes: [
        {
          id: 'tmpl_n1',
          type: 'trigger',
          subType: 'form_submission',
          name: 'Inbound Event Trigger',
          nameAr: 'استقبال البيانات والطلب',
          description: 'Triggered from customer action',
          descriptionAr: 'يبدأ فور وصول بيانات العميل',
          position: { x: 80, y: 160 },
          config: {},
          icon: 'FileText'
        },
        {
          id: 'tmpl_n2',
          type: 'ai',
          subType: 'ai_chat',
          name: 'AI Agent Triage',
          nameAr: 'تحليل الذكاء الاصطناعي',
          description: 'Understand customer inquiry & classify',
          descriptionAr: 'فهم وتصنيف استفسار العميل آليًا',
          position: { x: 380, y: 160 },
          config: { model: 'gemini-2.5-flash' },
          icon: 'Bot'
        },
        {
          id: 'tmpl_n3',
          type: 'action',
          subType: 'send_message',
          name: 'Automated Response & WhatsApp',
          nameAr: 'إرسال الرد والتحديث الفوري',
          description: 'Deliver response via WhatsApp or SMS',
          descriptionAr: 'إرسال الرد المخصص للعميل مباشرة',
          position: { x: 680, y: 160 },
          config: {},
          icon: 'Send'
        }
      ],
      edges: [
        { id: 'te_1_2', source: 'tmpl_n1', target: 'tmpl_n2' },
        { id: 'te_2_3', source: 'tmpl_n2', target: 'tmpl_n3' }
      ]
    };

    saveWorkflow(newWorkflow);
    loadWorkflowToBuilder(newWorkflow);
  };

  const filtered = INITIAL_TEMPLATES.filter((tmpl) => {
    const matchesSearch =
      tmpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.titleAr.includes(search) ||
      tmpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.descriptionAr.includes(search);

    const matchesCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="templates_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('قوالب معتمدة وجاهزة للتشغيل الفوري', 'Verified Production-Ready Templates')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('مكتبة قوالب الأتمتة الجاهزة', 'Automation Templates Library')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'اختر من بين أفضل المسارات المعدّة مسبقاً وابدأ العمل بها خلال ثوانٍ بنقرة واحدة.',
              'Choose from curated workflows built for high conversion and fast deployment.'
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat === 'all' ? t('كل القوالب', 'All Templates') : cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {language === 'ar' ? tmpl.categoryAr : tmpl.category}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {tmpl.badge}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                {language === 'ar' ? tmpl.titleAr : tmpl.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'ar' ? tmpl.descriptionAr : tmpl.description}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 font-medium">
                <span>{tmpl.nodesCount} {t('عقد جاهزة', 'nodes included')}</span>
                <span>•</span>
                <span>{t('ربط تلقائي', 'Auto-wired')}</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => handleUseTemplate(tmpl)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{t('استخدام القالب فورًا', 'Use Template')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
