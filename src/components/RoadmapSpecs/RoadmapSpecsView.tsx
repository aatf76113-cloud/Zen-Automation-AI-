import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Target,
  CheckCircle2,
  Clock,
  Zap,
  Building2,
  ShoppingCart,
  Megaphone,
  Laptop,
  CreditCard,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ROADMAP_PHASES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const RoadmapSpecsView: React.FC = () => {
  const { language, t } = useApp();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'audience' | 'usecases' | 'architecture'>('roadmap');

  const useCases = [
    {
      titleAr: 'أتمتة طلبات المتاجر الإلكترونية (سلة، زد، شوبيفاي)',
      titleEn: 'E-commerce Order Automation (Salla / Zid / Shopify)',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
      descAr: 'عند وصول طلب جديد، يتم إرسال رسالة واتساب للعميل برقم التتبع وتحديث جدول الطلبات وإشعار المستودع فورًا.',
      descEn: 'On order creation, send instant WhatsApp confirmation with tracking URL, sync Google Sheets & notify warehouse.'
    },
    {
      titleAr: 'خدمة عملاء ذكية بالذكاء الاصطناعي على واتساب 24/7',
      titleEn: '24/7 WhatsApp AI Customer Support',
      icon: <Cpu className="w-5 h-5 text-purple-500" />,
      descAr: 'وكيل ذكاء اصطناعي يرد على الاستفسارات فورًا معتمداً على مستندات الشركة وسياسات الاسترجاع، وتصعيد الحالات المعقدة لموظف بشري.',
      descEn: 'AI Agent answers inquiries using company knowledge base PDFs & escalates complex tickets to humans.'
    },
    {
      titleAr: 'تأهيل الـ Leads وإضافتها مباشرة لـ CRM والمبيعات',
      titleEn: 'Lead Qualification & Real-Time CRM Pipeline Sync',
      icon: <Target className="w-5 h-5 text-sky-500" />,
      descAr: 'تحليل رسائل وتفاعلات العملاء بالذكاء الاصطناعي، فرز العملاء الجادين وتحديد الميزانية وإشعار فريق المبيعات فورًا.',
      descEn: 'Analyze prospect messages with Gemini AI, score intent & budget, route directly to sales reps.'
    },
    {
      titleAr: 'صناعة وجدولة المحتوى التسويقي الذكي',
      titleEn: 'Automated Social Media Content & Publishing',
      icon: <Megaphone className="w-5 h-5 text-amber-500" />,
      descAr: 'توليد أفكار المحتوى والمنشورات بالذكاء الاصطناعي وتجهيزها وإرسالها للموافقة ونشرها تلقائيًا على القنوات.',
      descEn: 'Generate content calendar, craft engaging marketing posts with AI, and push scheduled updates.'
    }
  ];

  const targetAudiences = [
    {
      titleAr: 'الشركات الصغيرة والمتوسطة (SMEs)',
      titleEn: 'Small & Medium Businesses (SMEs)',
      descAr: 'لتقليل التكاليف التشغيلية وتشغيل خدمة عملاء ومبيعات آلية دون الحاجة لتوظيف فريق تقني ضخم.',
      benefitAr: 'توفير ما يصل إلى 65% من تكاليف الرواتب التشغيلية الروتينية.'
    },
    {
      titleAr: 'وكالات التسويق الرقمي (Marketing Agencies)',
      titleEn: 'Digital Marketing & Growth Agencies',
      descAr: 'إدارة أتمتة العملاء وحملات الـ Leads وربط الإعلانات بنظام CRM والواتساب بنظام Multi-Tenant.',
      benefitAr: 'تحقيق نتائج مضاعفة لعملائهم وتوسيع هوامش الربح.'
    },
    {
      titleAr: 'المتاجر الإلكترونية (E-Commerce Brands)',
      titleEn: 'E-Commerce Stores & Direct-to-Consumer',
      descAr: 'تحسين تجربة العميل، استرداد السلات المتروكة، إشعارات الشحن التلقائية، واستبيانات الرضا.',
      benefitAr: 'رفع معدلات إتمام الشراء وتقليل نسبة السلات المهجورة.'
    },
    {
      titleAr: 'رواد الأعمال والمستقلون (Founders & Freelancers)',
      titleEn: 'Startup Founders & Solo Entrepreneurs',
      descAr: 'بناء نظام أتمتة متكامل للشركات الناشئة وإدارة التدفقات اليومية بدون كتابة كود معقد.',
      benefitAr: 'التركيز على نمو المشروع وترك المهام المتكررة للنظام الذكي.'
    }
  ];

  return (
    <div id="specs_roadmap_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('رؤية ومواصفات منصة زين للأتمتة والذكاء الاصطناعي الشاملة', 'Zain Automation AI Official Blueprint')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('المواصفات وخارطة الطريق (Roadmap & Specs)', 'Specs & Strategic Roadmap')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'الرؤية المعمارية المتكاملة، ومراحل التطوير، والجمهور المستهدف وحالات الاستخدام الواقعية.',
              'Architectural vision, execution phases (MVP to Enterprise), and core business value propositions.'
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('مراحل الإطلاق الأربعة (Phases)', '4 Execution Phases')}
        </button>
        <button
          onClick={() => setActiveTab('usecases')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeTab === 'usecases'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('حالات الاستخدام (Use Cases)', 'Use Cases')}
        </button>
        <button
          onClick={() => setActiveTab('audience')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
            activeTab === 'audience'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {t('الجمهور المستهدف (Target Audience)', 'Target Audience')}
        </button>
      </div>

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROADMAP_PHASES.map((phase) => (
              <div
                key={phase.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-col justify-between shadow-sm space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {phase.phase}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        phase.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : phase.status === 'in_progress'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {phase.status === 'completed'
                        ? t('مكتمل وجاهز', 'Completed')
                        : phase.status === 'in_progress'
                        ? t('قيد التطوير', 'In Progress')
                        : t('مخطط له', 'Planned')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? phase.titleAr : phase.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {language === 'ar' ? phase.descriptionAr : phase.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {phase.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Use Cases Tab */}
      {activeTab === 'usecases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((uc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {uc.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? uc.titleAr : uc.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'ar' ? uc.descAr : uc.descEn}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Target Audience Tab */}
      {activeTab === 'audience' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targetAudiences.map((aud, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? aud.titleAr : aud.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {aud.descAr}
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                💎 {aud.benefitAr}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
