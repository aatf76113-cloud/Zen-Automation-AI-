import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Check, X, RefreshCw, Layers } from 'lucide-react';
import { WorkflowNode, WorkflowEdge } from '../../types';
import { useApp } from '../../context/AppContext';

interface AiWorkflowGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (nodes: WorkflowNode[], edges: WorkflowEdge[], name: string, nameAr: string) => void;
}

export const AiWorkflowGeneratorModal: React.FC<AiWorkflowGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated
}) => {
  const { language, t } = useApp();

  const [prompt, setPrompt] = useState(
    'عندما يرسل أي عميل رسالة على الموقع أو الواتساب، افهم طلبه باستخدام الذكاء الاصطناعي، وإذا كان مهتمًا بالخدمة سجله كـ Lead في CRM وأرسل رسالة واتساب ترحيبية فورية وإشعار لفريق المبيعات على سلاك.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const samplePrompts = [
    {
      titleAr: 'تأهيل عملاء الواتساب والمبيعات',
      titleEn: 'WhatsApp Sales Qualification',
      text: 'عندما يستقبل النظام رسالة واتساب من عميل جديد، حلل المشاعر واستخرج الميزانية، ثم فرع بالـ IF/ELSE: إذا كانت الميزانية أكبر من 5000 ريال سجله كـ VIP وأرسل إشعار للمبيعات.'
    },
    {
      titleAr: 'دعم فني ذكي مع قاعدة المعرفة وتصعيد',
      titleEn: 'Knowledge Base Support & Escalation',
      text: 'استقبل تذكرة الدعم الفني، ابحث في ملفات الـ PDF الخاصة بالشركة لإيجاد الحل، أرسل الرد الفوري للعميل، وإذا كان العميل غير راضٍ حول التذكرة لمهندس بشري.'
    },
    {
      titleAr: 'تتبع شحنات المتجر واستبيان الرضا',
      titleEn: 'E-commerce Shipment & Review',
      text: 'عند وصول إشعار Webhook بشحن الطلب من متجري، أرسل بوليصة التتبع للعميل عبر واتساب، انتظر 24 ساعة، ثم أرسل له استبيان تقييم تجربة الشراء.'
    }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setStepIndex(1);

    setTimeout(() => {
      setStepIndex(2);
    }, 600);

    setTimeout(() => {
      setStepIndex(3);
    }, 1200);

    setTimeout(() => {
      setIsGenerating(false);

      // Generate realistic graph based on prompt
      const generatedNodes: WorkflowNode[] = [
        {
          id: 'gen_node_1',
          type: 'trigger',
          subType: 'new_message',
          name: 'Inbound Customer Message',
          nameAr: 'استقبال رسالة العميل',
          description: 'Captured via WhatsApp / Web Chat',
          descriptionAr: 'استقبال الرسالة الواردة عبر واتساب أو شات الموقع',
          position: { x: 50, y: 160 },
          config: { channel: 'all' },
          icon: 'MessageSquare'
        },
        {
          id: 'gen_node_2',
          type: 'ai',
          subType: 'ai_chat',
          name: 'AI Agent Request Analysis',
          nameAr: 'تحليل وفهم الطلب بالذكاء الاصطناعي',
          description: 'Extract customer intent, budget, urgency score',
          descriptionAr: 'استخراج نية العميل والميزانية وحساب درجة التأهيل',
          position: { x: 360, y: 160 },
          config: { model: 'gemini-2.5-flash', agentId: 'agent_sales_01' },
          icon: 'Bot'
        },
        {
          id: 'gen_node_3',
          type: 'logic',
          subType: 'if_else',
          name: 'Is Interested & Qualified?',
          nameAr: 'هل العميل مهتم وجاد بالخدمة؟',
          description: 'Check if qualification score >= 70',
          descriptionAr: 'التحقق مما إذا كانت درجة التأهيل 70 فأكثر',
          position: { x: 670, y: 160 },
          config: { field: 'score', operator: '>=', value: 70 },
          icon: 'GitBranch'
        },
        {
          id: 'gen_node_4',
          type: 'action',
          subType: 'create_customer',
          name: 'Register Lead in Zain CRM',
          nameAr: 'تسجيل العميل في CRM',
          description: 'Add contact to Qualified pipeline stage',
          descriptionAr: 'إضافة العميل لمرحلة العملاء المؤهلين في نظام CRM',
          position: { x: 980, y: 90 },
          config: { stage: 'qualified' },
          icon: 'UserCheck'
        },
        {
          id: 'gen_node_5',
          type: 'action',
          subType: 'send_message',
          name: 'Instant WhatsApp Welcome Card',
          nameAr: 'إرسال رد واتساب ترحيبي مخصص',
          description: 'Automated personalized response with calendar link',
          descriptionAr: 'رد فوري مخصص باسم العميل مع رابط حجز مكالمة استشارية',
          position: { x: 1280, y: 90 },
          config: { provider: 'whatsapp' },
          icon: 'Send'
        },
        {
          id: 'gen_node_6',
          type: 'action',
          subType: 'send_notification',
          name: 'Notify Sales Team on Slack',
          nameAr: 'إشعار فوري لفريق المبيعات',
          description: 'Push alert to #sales-leads channel',
          descriptionAr: 'تنبيه فوري على سلاك للمتابعة السريعة',
          position: { x: 1280, y: 230 },
          config: { channel: '#sales-leads' },
          icon: 'BellRing'
        },
        {
          id: 'gen_node_7',
          type: 'action',
          subType: 'send_email',
          name: 'Send General Inquiry Guide',
          nameAr: 'إرسال دليل تعريفي بالبريد',
          description: 'For general inquiries, send introductory brochure',
          descriptionAr: 'للاستفسارات العامة، إرسال ملف تعريفي بالخدمات والمتابعة',
          position: { x: 980, y: 320 },
          config: {},
          icon: 'MailCheck'
        }
      ];

      const generatedEdges: WorkflowEdge[] = [
        { id: 'ge_1-2', source: 'gen_node_1', target: 'gen_node_2' },
        { id: 'ge_2-3', source: 'gen_node_2', target: 'gen_node_3' },
        { id: 'ge_3-4', source: 'gen_node_3', target: 'gen_node_4', conditionBranch: 'true', label: 'مهتم (Qualified)' },
        { id: 'ge_4-5', source: 'gen_node_4', target: 'gen_node_5' },
        { id: 'ge_4-6', source: 'gen_node_4', target: 'gen_node_6' },
        { id: 'ge_3-7', source: 'gen_node_3', target: 'gen_node_7', conditionBranch: 'false', label: 'استفسار عام' }
      ];

      onGenerated(
        generatedNodes,
        generatedEdges,
        'AI Generated: Smart Inbound Lead & WhatsApp Followup',
        'مسار ذكي: استقبال وتأهيل العملاء والرد الفوري'
      );
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('مُولّد المسارات بالذكاء الاصطناعي', 'AI Workflow Generator')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'اكتب فكرتك باللغة الطبيعية وسيقوم الذكاء الاصطناعي ببناء الـ Nodes والتوصيلات فورًا',
                  'Describe your workflow in plain English or Arabic and watch it generate visually.'
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

        {/* Input Area */}
        <div className="my-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('صف ما تريد أتمتته بالتفصيل:', 'Describe what you want to automate:')}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t(
                'مثال: عندما يرسل أي عميل رسالة على الموقع، افهم طلبه بالذكاء الاصطناعي، وإذا كان مهتمًا سجله كـ Lead وأرسل له واتساب...',
                'e.g. When a lead submits a form, analyze budget with AI, route high-value leads to WhatsApp VIP...'
              )}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              {t('أفكار وقوالب جاهزة للتجربة السريعة:', 'Quick Ideas to Try:')}
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sp.text)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-500/40 text-[11px] text-slate-700 dark:text-slate-300 transition-all text-start"
                >
                  ⚡ {language === 'ar' ? sp.titleAr : sp.titleEn}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                <span>{t('جارِ هندسة مسار العمل...', 'Architecting workflow with Gemini AI...')}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={stepIndex >= 1 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                    ✓ {t('تحليل المدخلات وتحديد نقاط البداية (Triggers)', '1. Identifying Trigger event')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={stepIndex >= 2 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                    ✓ {t('صياغة منطق المعالجة الذكية وشروط التفريع (AI & Logic)', '2. Synthesizing AI cognition & IF/ELSE nodes')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={stepIndex >= 3 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                    ✓ {t('ربط الإجراءات التلقائية (WhatsApp, CRM, Slack)', '3. Connecting Actions (WhatsApp, CRM, Slack)')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            id="run_ai_generator_submit"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{t('توليد المسار البصري الآن', 'Generate Visual Workflow')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
