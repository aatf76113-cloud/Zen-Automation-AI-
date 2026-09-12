import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Zap,
  Layers,
  Bot,
  ShoppingCart,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Workflow, WorkflowNode, WorkflowEdge } from '../../types';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose
}) => {
  const { saveWorkflow, loadWorkflowToBuilder, language, t } = useApp();

  const [workflowNameAr, setWorkflowNameAr] = useState('');
  const [workflowNameEn, setWorkflowNameEn] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const templates = [
    {
      id: 'blank',
      titleAr: 'لوحة عمل فارغة (من الصفر)',
      titleEn: 'Blank Canvas',
      descAr: 'ابدأ بعقدة تشغيل واحدة وضع منطق الأتمتة المخصص بنفسك بحرية كاملة.',
      descEn: 'Start with an initial trigger and freely build custom automations.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      tag: 'سريع ومرن'
    },
    {
      id: 'ai_prompt',
      titleAr: 'توليد ذكي بالذكاء الاصطناعي',
      titleEn: 'AI Prompt Generation',
      descAr: 'صف فكرة مسار العمل بلغتك، وسيقوم المحرك الذكي ببنائها وربط العقد تلقائياً.',
      descEn: 'Describe what you want in plain text, and AI generates the entire pipeline.',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      tag: 'ذكاء اصطناعي'
    },
    {
      id: 'crm_sales',
      titleAr: 'تأهيل المبيعات وربط CRM وواتساب',
      titleEn: 'AI Sales & CRM Pipeline',
      descAr: 'استقبال الـ Leads الواردة، تقييمها بـ AI، حفظها بالـ CRM وإرسال واتساب تأكيدي.',
      descEn: 'Inbound leads, AI scoring, CRM synchronization, and WhatsApp follow-up.',
      icon: Bot,
      color: 'from-blue-600 to-cyan-600',
      tag: 'الأكثر استخداماً'
    },
    {
      id: 'ecommerce',
      titleAr: 'متابعة طلبات المتجر الإلكتروني',
      titleEn: 'E-Commerce Order Workflow',
      descAr: 'تنبيه فوري لطلبات الشراء الجديدة مع رسالة شكر للعميل وتحديث المخزون.',
      descEn: 'New order trigger, customer WhatsApp notification, and inventory sync.',
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      tag: 'متاجر إلكترونية'
    },
    {
      id: 'support_tickets',
      titleAr: 'خدمة العملاء وفرز التذاكر الذكي',
      titleEn: 'Smart Support & Ticketing',
      descAr: 'تحليل شكاوى واستفسارات العملاء وتوجيهها للموظف المناسب مع رد آلي فوري.',
      descEn: 'Sentiment analysis on tickets, auto-routing, and smart auto-reply.',
      icon: Headphones,
      color: 'from-rose-500 to-pink-600',
      tag: 'خدمة عملاء'
    }
  ];

  const handleCreate = () => {
    setIsGenerating(true);

    const wfId = `wf_${Date.now()}`;
    const nameAr = workflowNameAr.trim() || (selectedTemplate === 'blank' ? 'مسار أتمتة جديد' : 'مسار ذكي مخصص');
    const nameEn = workflowNameEn.trim() || (selectedTemplate === 'blank' ? 'New Automation Flow' : 'Smart Custom Pipeline');

    let nodes: WorkflowNode[] = [];
    let edges: WorkflowEdge[] = [];
    let category = 'Sales & CRM';

    if (selectedTemplate === 'blank') {
      category = 'General';
      nodes = [
        {
          id: 'node_start',
          type: 'trigger',
          subType: 'webhook',
          name: 'Webhook Trigger',
          nameAr: 'نقطة استقبال Webhook',
          description: 'Receive webhook events',
          descriptionAr: 'استقبال أحداث الويب هوك وتمريرها للمسار',
          position: { x: 80, y: 140 },
          config: { path: `/api/webhooks/${wfId}`, method: 'POST' },
          icon: 'Webhook'
        }
      ];
      edges = [];
    } else if (selectedTemplate === 'crm_sales' || selectedTemplate === 'ai_prompt') {
      category = 'Sales & CRM';
      nodes = [
        {
          id: 'n_1',
          type: 'trigger',
          subType: 'webhook',
          name: 'Customer Webhook Receiver',
          nameAr: 'استقبال بيانات العميل',
          description: 'Inbound customer inquiry payload',
          descriptionAr: 'استقبال الطلب من الموقع أو الإعلانات',
          position: { x: 60, y: 150 },
          config: { path: `/api/webhooks/${wfId}` },
          icon: 'Webhook'
        },
        {
          id: 'n_2',
          type: 'ai',
          subType: 'ai_agent',
          name: 'AI Lead Qualification Agent',
          nameAr: 'وكيل تأهيل وتحليل العميل',
          description: 'Extract customer intent & score lead',
          descriptionAr: 'استخراج نية الشراء وحساب درجة العميل',
          position: { x: 380, y: 150 },
          config: { agentName: 'سارة - المبيعات', model: 'moonshotai/kimi-k3' },
          icon: 'Bot'
        },
        {
          id: 'n_3',
          type: 'logic',
          subType: 'condition',
          name: 'Lead Score Router',
          nameAr: 'شرط درجة التأهيل (>= 75)',
          description: 'Check if lead score >= 75',
          descriptionAr: 'التحقق من جاهزية العميل للشراء',
          position: { x: 700, y: 150 },
          config: { field: 'score', operator: '>=', value: 75 },
          icon: 'GitBranch'
        },
        {
          id: 'n_4',
          type: 'action',
          subType: 'crm_create_lead',
          name: 'Add to Zain CRM',
          nameAr: 'حفظ العميل في CRM',
          description: 'Store contact in active sales pipeline',
          descriptionAr: 'حفظ العميل في خط المبيعات الفعال',
          position: { x: 1020, y: 150 },
          config: { stage: 'qualified' },
          icon: 'UserPlus'
        },
        {
          id: 'n_5',
          type: 'action',
          subType: 'send_whatsapp',
          name: 'Instant WhatsApp Welcome',
          nameAr: 'رسالة واتساب ترحيبية فورية',
          description: 'Send greeting with booking link via WhatsApp',
          descriptionAr: 'إرسال رسالة ترحيبية برابط الحجز عبر واتساب',
          position: { x: 1340, y: 150 },
          config: { provider: 'whatsapp' },
          icon: 'MessageSquare'
        }
      ];
      edges = [
        { id: 'e1-2', source: 'n_1', target: 'n_2', animated: true },
        { id: 'e2-3', source: 'n_2', target: 'n_3', animated: true },
        { id: 'e3-4', source: 'n_3', target: 'n_4', label: 'مؤهل (نعم)', animated: true },
        { id: 'e4-5', source: 'n_4', target: 'n_5', animated: true }
      ];
    } else if (selectedTemplate === 'ecommerce') {
      category = 'E-Commerce';
      nodes = [
        {
          id: 'n_1',
          type: 'trigger',
          subType: 'webhook',
          name: 'New Order Webhook',
          nameAr: 'استقبال طلب متجر جديد',
          description: 'Triggered when customer places order',
          descriptionAr: 'يتم تشغيله لحظة إتمام العميل للطلب في المتجر',
          position: { x: 60, y: 150 },
          config: { path: `/api/orders/${wfId}` },
          icon: 'ShoppingCart'
        },
        {
          id: 'n_2',
          type: 'action',
          subType: 'send_whatsapp',
          name: 'Order Confirmation WhatsApp',
          nameAr: 'إشعار واتساب بتأكيد الطلب',
          description: 'Send invoice and tracking link',
          descriptionAr: 'إرسال تفاصيل الفاتورة ورابط التتبع للعميل',
          position: { x: 380, y: 150 },
          config: { template: 'order_receipt' },
          icon: 'MessageSquare'
        },
        {
          id: 'n_3',
          type: 'action',
          subType: 'send_notification',
          name: 'Warehouse Dispatch Alert',
          nameAr: 'تنبيه مستودع التجهيز',
          description: 'Notify packaging team',
          descriptionAr: 'إشعار فريق التجهيز والشحن للبدء بتجهيز الطرد',
          position: { x: 700, y: 150 },
          config: { role: 'warehouse' },
          icon: 'Bell'
        }
      ];
      edges = [
        { id: 'e1-2', source: 'n_1', target: 'n_2', animated: true },
        { id: 'e2-3', source: 'n_2', target: 'n_3', animated: true }
      ];
    } else {
      category = 'Customer Support';
      nodes = [
        {
          id: 'n_1',
          type: 'trigger',
          subType: 'webhook',
          name: 'Customer Inquiry Received',
          nameAr: 'استقبال استفسار العميل',
          description: 'Inbound message from WhatsApp / Chatbot',
          descriptionAr: 'رسالة جديدة واردة من العميل',
          position: { x: 60, y: 150 },
          config: { channel: 'omnichannel' },
          icon: 'Headphones'
        },
        {
          id: 'n_2',
          type: 'ai',
          subType: 'ai_agent',
          name: 'AI Sentiment & Intent Classifier',
          nameAr: 'تحليل المشاعر وتصنيف الطلب',
          description: 'Determine urgency and appropriate department',
          descriptionAr: 'تحديد درجة الإلحاح وتصنيف القسم المطلوب',
          position: { x: 380, y: 150 },
          config: { agentName: 'دعم العملاء الذكي' },
          icon: 'Bot'
        },
        {
          id: 'n_3',
          type: 'action',
          subType: 'send_email',
          name: 'Support Ticket Dispatcher',
          nameAr: 'توليد تذكرة وإرسال بريد',
          description: 'Create ticket in desk and email agent',
          descriptionAr: 'توليد تذكرة رسمية وإخطار مسؤول الدعم',
          position: { x: 700, y: 150 },
          config: { priority: 'high' },
          icon: 'Mail'
        }
      ];
      edges = [
        { id: 'e1-2', source: 'n_1', target: 'n_2', animated: true },
        { id: 'e2-3', source: 'n_2', target: 'n_3', animated: true }
      ];
    }

    const newWf: Workflow = {
      id: wfId,
      name: nameEn,
      nameAr: nameAr,
      description: aiPrompt || 'Custom automation flow created in Zain Automation AI.',
      descriptionAr: aiPrompt || 'مسار أتمتة ذكي تم إنشاؤه عبر منصة زين للأتمتة والذكاء الاصطناعي.',
      isActive: true,
      category,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      successRate: 100,
      tags: [category, 'Zain AI', 'Automation'],
      nodes,
      edges
    };

    saveWorkflow(newWf);
    loadWorkflowToBuilder(newWf);
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t('إنشاء مسار أتمتة جديد', 'Create New Workflow')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('اختر قالباً جاهزاً أو ابدأ من الصفر مع محرك الذكاء الاصطناعي', 'Pick a pre-built template or start from scratch with AI')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Workflow Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('اسم المسار (بالعربية)', 'Workflow Name (Arabic)')}
              </label>
              <input
                type="text"
                value={workflowNameAr}
                onChange={(e) => setWorkflowNameAr(e.target.value)}
                placeholder="مثال: مسار استقبال وتأهيل العملاء"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('اسم المسار (بالإنجليزية - اختياري)', 'Workflow Name (English - Optional)')}
              </label>
              <input
                type="text"
                value={workflowNameEn}
                onChange={(e) => setWorkflowNameEn(e.target.value)}
                placeholder="e.g. Lead Qualification Pipeline"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Template Choices */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              {t('نمط البداية والقالب:', 'Starting Template:')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tmpl.color} text-white flex items-center justify-center shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {tmpl.tag}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                        {language === 'ar' ? tmpl.titleAr : tmpl.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {language === 'ar' ? tmpl.descAr : tmpl.descEn}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('محدد للإنشاء', 'Selected')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Prompt Box if AI Template Selected */}
          {selectedTemplate === 'ai_prompt' && (
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{t('صف ما ترغب في تنفيذه آلياً:', 'Describe your automation flow in plain words:')}</span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t(
                  'مثال: عندما يسجل عميل جديد في النموذج، قم بتحليل رسالته بـ AI، ثم أرسل له رد واتساب فوري وخزنه في الـ CRM.',
                  'e.g. When a lead submits a form, qualify them with AI, notify sales team on Slack, and send WhatsApp confirmation.'
                )}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('جاري التوليد...', 'Generating...')}</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>{t('إنشاء وبدء التصميم في المحرر', 'Create & Open Canvas')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
