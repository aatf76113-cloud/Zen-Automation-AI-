import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  Tag,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ChevronRight,
  X,
  MessageSquare,
  Activity,
  Trash2
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types';
import { useApp } from '../../context/AppContext';

export const CrmView: React.FC = () => {
  const { leads, updateLead, addLead, deleteLead, runWorkflowSimulation, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'table'>('pipeline');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newBudget, setNewBudget] = useState(10000);
  const [newStage, setNewStage] = useState<LeadStatus>('new');

  const STAGES: { id: LeadStatus; labelAr: string; labelEn: string; color: string }[] = [
    { id: 'new', labelAr: 'جديد (New)', labelEn: 'New', color: 'border-slate-500 text-slate-500' },
    { id: 'contacted', labelAr: 'تم التواصل', labelEn: 'Contacted', color: 'border-sky-500 text-sky-500' },
    { id: 'qualified', labelAr: 'مؤهل للشراء', labelEn: 'Qualified', color: 'border-purple-500 text-purple-500' },
    { id: 'proposal_sent', labelAr: 'تقديم العرض', labelEn: 'Proposal Sent', color: 'border-amber-500 text-amber-500' },
    { id: 'won', labelAr: 'فاز بالصفقة (Won)', labelEn: 'Won', color: 'border-emerald-500 text-emerald-500' },
    { id: 'lost', labelAr: 'خسر (Lost)', labelEn: 'Lost', color: 'border-rose-500 text-rose-500' }
  ];

  const handleStageChange = (leadId: string, nextStage: LeadStatus) => {
    updateLead(leadId, { status: nextStage, stage: nextStage });
  };

  const handleCreateLead = async () => {
    if (!newName.trim()) return;

    const created: Lead = {
      id: `lead_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || 'user@example.com',
      phone: newPhone.trim() || '+966 50 000 0000',
      company: newCompany.trim() || 'شركة محترمة',
      status: newStage,
      stage: newStage,
      score: 85,
      source: 'Direct Form',
      budget: Number(newBudget) || 10000,
      value: Number(newBudget) || 10000,
      assignedAgentId: 'agent_sales_01',
      tags: ['Website Lead'],
      notes: 'تمت إضافته عبر نظام إدارة العملاء في زين للأتمتة والذكاء الاصطناعي (Zain Automation AI).',
      createdAt: new Date().toISOString().split('T')[0],
      activityHistory: [
        {
          id: `act_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'تم إنشاء العميل يدوياً',
          description: 'تم تسجيل بيانات العميل وبدء متابعته'
        }
      ]
    };

    await addLead(created);
    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCompany('');
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.company.toLowerCase().includes(q)
    );
  });

  return (
    <div id="crm_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{t('نظام إدارة علاقات العملاء الذكي (Smart CRM)', 'AI-Augmented Mini CRM')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('خط المبيعات وإدارة العملاء (Pipeline & Leads)', 'Leads & Sales Pipeline')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'تتبع مراحل صفقات العملاء، قياس درجات التأهيل، وتشغيل أتمتة الـ Workflows مع كل تغيير حالة.',
              'Track leads across sales stages, monitor qualification scores, and trigger instant automations.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('مراحل Pipeline', 'Kanban Board')}
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'table'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('جدول القائمة', 'List Table')}
            </button>
          </div>

          <button
            id="add_lead_button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('إضافة عميل جديد', 'Add Lead')}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('بحث عن عميل بالاسم، الهاتف، أو الشركة...', 'Search leads by name, phone, company...')}
          className="w-full pl-9 rtl:pr-9 rtl:pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Kanban Pipeline View */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => (l.status || l.stage) === stage.id);
            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 min-w-[210px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {language === 'ar' ? stage.labelAr : stage.labelEn}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards in this Stage */}
                <div className="space-y-2.5 flex-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500/50 shadow-sm cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {lead.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {lead.score}%
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p className="truncate">{lead.company}</p>
                        <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {lead.budget || lead.value ? `${(lead.budget || lead.value).toLocaleString()} SAR` : 'غير محدد'}
                        </p>
                      </div>

                      {/* Quick Move Stage Select */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lead.source}
                        </span>
                        <select
                          value={lead.status || lead.stage || 'new'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStatus)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {language === 'ar' ? s.labelAr : s.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-xl">
                      {t('لا يوجد عملاء', 'No leads')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {activeTab === 'table' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 text-start">{t('اسم العميل', 'Customer Name')}</th>
                  <th className="p-3.5 text-start">{t('الشركة', 'Company')}</th>
                  <th className="p-3.5 text-start">{t('الجوال / الواتساب', 'Phone / WhatsApp')}</th>
                  <th className="p-3.5 text-start">{t('المرحلة (Stage)', 'Stage')}</th>
                  <th className="p-3.5 text-start">{t('درجة الجدية', 'AI Score')}</th>
                  <th className="p-3.5 text-start">{t('الميزانية', 'Budget')}</th>
                  <th className="p-3.5 text-end">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {lead.name}
                    </td>
                    <td className="p-3.5 text-slate-500">{lead.company}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{lead.phone}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {lead.status || lead.stage || 'new'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-500">{lead.score || 85}%</td>
                    <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                      {lead.budget || lead.value ? `${(lead.budget || lead.value).toLocaleString()} SAR` : '--'}
                    </td>
                    <td className="p-3.5 text-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                      >
                        {t('التفاصيل', 'Inspect')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Lead Inspector Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedLead.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">{selectedLead.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lead Info */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-[10px] text-slate-400">{t('البريد', 'Email')}</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedLead.email}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">{t('الجوال', 'Phone')}</span>
                  <p className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {selectedLead.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">{t('الميزانية', 'Budget')}</span>
                  <p className="font-semibold font-mono text-emerald-500">
                    {selectedLead.budget || selectedLead.value ? `${(selectedLead.budget || selectedLead.value).toLocaleString()} SAR` : '--'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">{t('مستوى التأهيل', 'AI Score')}</span>
                  <p className="font-semibold text-purple-500">{selectedLead.score || 85}% Qualified</p>
                </div>
              </div>

              {/* Trigger Instant Automation CTA */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                    <Zap className="w-4 h-4 fill-current text-emerald-500" />
                    <span>{t('تشغيل أتمتة فورية لهذا العميل', 'Trigger Lead Automation')}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {t('إرسال رسالة واتساب تفاعلية، وتحديث بيانات العميل وتشغيل مسار المبيعات.', 'Send WhatsApp card & trigger sales nurture workflow.')}
                </p>
                <button
                  onClick={async () => {
                    await runWorkflowSimulation('wf_01', {
                      name: selectedLead.name,
                      phone: selectedLead.phone,
                      email: selectedLead.email,
                      budget: selectedLead.budget
                    });
                    setSelectedLead({
                      ...selectedLead,
                      activityHistory: [
                        {
                          id: `act_${Date.now()}`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          action: 'تشغيل أتمتة المبيعات والواتساب',
                          description: 'تم إرسال الرد الآلي وتحديث بيانات العميل بنجاح'
                        },
                        ...selectedLead.activityHistory
                      ]
                    });
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  {t('إطلاق مسار المتابعة الذكية الآن 🚀', 'Run Smart Automation Now')}
                </button>
              </div>

              {/* Activity History */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>{t('سجل النشاطات والأحداث (Activity Log)', 'Activity Log')}</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedLead.activityHistory || []).map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{act.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">{act.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={async () => {
                  if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this lead?')) {
                    await deleteLead(selectedLead.id);
                    setSelectedLead(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('حذف العميل', 'Delete Lead')}</span>
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('إضافة عميل جديد للـ CRM', 'Add New CRM Lead')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">{t('الاسم بالكامل', 'Full Name')}</label>
                <input
                  id="lead_name_input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: خالد المهندس"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{t('البريد الإلكتروني', 'Email')}</label>
                  <input
                    id="lead_email_input"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="khaled@company.com"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{t('رقم الجوال / الواتساب', 'Phone')}</label>
                  <input
                    id="lead_phone_input"
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+966 5..."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{t('الشركة', 'Company')}</label>
                  <input
                    id="lead_company_input"
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="شركة التقدم"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{t('الميزانية التقديرية (SAR)', 'Budget')}</label>
                  <input
                    id="lead_budget_input"
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">{t('مرحلة البداية', 'Initial Stage')}</label>
                <select
                  id="lead_stage_select"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as LeadStatus)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === 'ar' ? s.labelAr : s.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                id="save_lead_button"
                onClick={handleCreateLead}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
              >
                {t('حفظ العميل', 'Save Lead')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
