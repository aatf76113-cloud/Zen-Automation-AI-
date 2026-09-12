import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Share2,
  ExternalLink,
  CheckCircle2,
  Code,
  Sparkles,
  Zap,
  ArrowRight,
  Send,
  X,
  Play
} from 'lucide-react';
import { INITIAL_FORMS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const FormsView: React.FC = () => {
  const { addLead, runWorkflowSimulation, language, t } = useApp();

  const [forms, setForms] = useState(INITIAL_FORMS);
  const [activeTestForm, setActiveTestForm] = useState<(typeof INITIAL_FORMS)[0] | null>(null);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedFormCode, setEmbedFormCode] = useState('');

  // Form input simulation state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const handleOpenTestModal = (form: (typeof INITIAL_FORMS)[0]) => {
    setActiveTestForm(form);
    setFormData({});
    setIsSubmittedSuccess(false);
  };

  const handleSubmitLiveForm = async () => {
    if (!activeTestForm) return;
    setIsSubmitting(true);

    // AI validation and CRM insert simulation
    setTimeout(async () => {
      addLead({
        id: `lead_form_${Date.now()}`,
        name: formData['name'] || 'عميل تجريبي من النموذج الذكي',
        email: formData['email'] || 'test@client.sa',
        phone: formData['phone'] || '+966 54 321 9876',
        company: formData['company'] || 'شركة رقمية',
        status: 'new',
        score: 92,
        source: activeTestForm.title,
        budget: 12000,
        assignedAgentId: 'agent_sales_01',
        tags: ['Smart Form', 'AI Verified'],
        notes: `Submitted via Smart Form: ${activeTestForm.title}. Message: ${formData['message'] || 'None'}`,
        createdAt: new Date().toISOString().split('T')[0],
        activityHistory: [
          {
            id: `act_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: 'إرسال بيانات عبر النموذج الذكي',
            description: 'تم التحقق من الحقول بالذكاء الاصطناعي وتمريرها للمسار'
          }
        ]
      });

      // Trigger linked workflow
      await runWorkflowSimulation(activeTestForm.linkedWorkflowId, formData);

      // Increment submissions count
      setForms((prev) =>
        prev.map((f) => (f.id === activeTestForm.id ? { ...f, submissionsCount: f.submissionsCount + 1 } : f))
      );

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 1000);
  };

  const handleOpenEmbedCode = (form: (typeof INITIAL_FORMS)[0]) => {
    const snippet = `<!-- Zain Automation AI Smart Form Widget -->\n<div id="zain-form-${form.id}"></div>\n<script src="https://cdn.zainauto.ai/forms.js" data-form-id="${form.id}" async></script>`;
    setEmbedFormCode(snippet);
    setIsEmbedModalOpen(true);
  };

  return (
    <div id="smart_forms_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('نماذج تفاعلية ذكية مع التحقق الآلي', 'AI-Augmented Form Builder')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('النماذج الذكية (Smart Forms)', 'Smart Inbound Forms')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'اجمع بيانات عملائك بنماذج ذكية تتحقق من صحة المدخلات بالذكاء الاصطناعي وتغذي الـ CRM والمسارات فوريًا.',
              'Embed responsive smart forms that validate input with AI and push leads into workflows.'
            )}
          </p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {forms.map((form) => (
          <div
            key={form.id}
            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {form.submissionsCount} {t('استجابة', 'submissions')}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {form.fields.length} {t('حقول', 'fields')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                {language === 'ar' ? form.titleAr : form.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'ar' ? form.descriptionAr : form.description}
              </p>

              {/* Fields preview */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {form.fields.map((f) => (
                  <span
                    key={f.id}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {language === 'ar' ? f.labelAr : f.label} {f.required && '*'}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenTestModal(form)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('تجربة الإرسال الحي', 'Live Test')}</span>
              </button>

              <button
                onClick={() => handleOpenEmbedCode(form)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title={t('كود التضمين في الموقع', 'Embed snippet')}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Form Submission Modal */}
      {activeTestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? activeTestForm.titleAr : activeTestForm.title}
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('مفعل: التحقق بالذكاء الاصطناعي وتغذية CRM تلقائيًا', 'AI Field Validation Active')}</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTestForm(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmittedSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('تم إرسال النموذج بنجاح!', 'Form Submitted Successfully!')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {t(
                    'تم تسجيل العميل بنجاح في نظام الـ CRM وتشغيل مسار الأتمتة المرتبط وإرسال الإشعارات.',
                    'Lead has been registered in your CRM and the connected automation workflow was triggered.'
                  )}
                </p>
                <button
                  onClick={() => setActiveTestForm(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {t('تم', 'Done')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {activeTestForm.fields.map((f) => (
                  <div key={f.id} className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? f.labelAr : f.label} {f.required && '*'}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={f.placeholder}
                        value={formData[f.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                      />
                    ) : (
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formData[f.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTestForm(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    onClick={handleSubmitLiveForm}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? t('جارِ الإرسال والمعالجة...', 'Submitting & Executing...') : t('إرسال وتفعيل المسار', 'Submit & Trigger Workflow')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('كود تضمين النموذج الذكي', 'Smart Form Embed Code')}
              </h3>
              <button
                onClick={() => setIsEmbedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                'انسخ هذا الكود والصقه في موقعك أو متجرك (سلة، زد، ووردبريس، شوبيفاي) ليعمل النموذج فورياً.',
                'Copy and paste this snippet into your website or e-commerce store to collect leads immediately.'
              )}
            </p>

            <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {embedFormCode}
            </pre>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setIsEmbedModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {t('تم النسخ والإغلاق', 'Copy & Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
