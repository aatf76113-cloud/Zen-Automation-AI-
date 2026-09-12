import React, { useState, useEffect } from 'react';
import { X, Save, Sliders, Sparkles, HelpCircle, Code, Play } from 'lucide-react';
import { WorkflowNode } from '../../types';
import { useApp } from '../../context/AppContext';

interface NodeConfigDrawerProps {
  nodeId: string | null;
  onClose: () => void;
  onUpdateNode: (updatedNode: WorkflowNode) => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  nodeId,
  onClose,
  onUpdateNode
}) => {
  const { builderNodes, language, agents, knowledgeDocs, t } = useApp();

  const activeNode = (builderNodes || []).find((n) => n.id === nodeId);

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (activeNode) {
      setName(activeNode.name || '');
      setNameAr(activeNode.nameAr || '');
      setDescription(activeNode.description || '');
      setDescriptionAr(activeNode.descriptionAr || '');
      setConfig(activeNode.config || {});
    }
  }, [activeNode]);

  if (!activeNode) return null;

  const handleSave = () => {
    onUpdateNode({
      ...activeNode,
      name,
      nameAr,
      description,
      descriptionAr,
      config
    });
    onClose();
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        aria-hidden="true"
      />

      <aside
        id="node_config_drawer"
        className="fixed inset-y-0 end-0 z-50 w-full sm:w-96 max-w-[100vw] sm:max-w-md lg:static lg:h-full border-s border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl shrink-0 animate-in slide-in-from-right"
      >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('إعدادات العقدة', 'Node Configuration')}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {activeNode.id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Form */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Node Labels */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            {t('عنوان العقدة (بالعربية)', 'Node Title (Arabic)')}
          </label>
          <input
            type="text"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            {t('عنوان العقدة (بالإنجليزية)', 'Node Title (English)')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Dynamic Fields depending on Node Type */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {t('الخصائص البرمجية للمهمة', 'Task Parameters')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-mono">
              {activeNode.subType}
            </span>
          </div>

          {/* AI Settings */}
          {activeNode.type === 'ai' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('نموذج الذكاء الاصطناعي', 'AI Model')}
                </label>
                <select
                  value={config.model || 'gemini-2.5-flash'}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (سرعة فائقة)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (تحليل استراتيجي عميق)</option>
                </select>
              </div>

              {activeNode.subType === 'ai_chat' && (
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">
                    {t('تعيين وكيل ذكاء اصطناعي', 'Assign AI Agent')}
                  </label>
                  <select
                    value={config.agentId || (agents && agents[0]?.id) || ''}
                    onChange={(e) => handleConfigChange('agentId', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {(agents || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {language === 'ar' ? a.nameAr : a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('التعليمات والأوامر (Prompt)', 'Instructions / Prompt')}
                </label>
                <textarea
                  rows={4}
                  value={config.prompt || ''}
                  placeholder={t(
                    'مثال: افهم استفسار العميل، واستخرج الميزانية ورقم الجوال وحدد مستوى الجدية...',
                    'e.g., Analyze lead message, extract budget and phone, score intent...'
                  )}
                  onChange={(e) => handleConfigChange('prompt', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('ربط قاعدة المعرفة (RAG Knowledge Base)', 'Knowledge Base')}
                </label>
                <select
                  value={config.kbId || ''}
                  onChange={(e) => handleConfigChange('kbId', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">{t('-- بدون قاعدة معرفة إضافية --', '-- No attached KB --')}</option>
                  {(knowledgeDocs || []).map((kb) => (
                    <option key={kb.id} value={kb.id}>
                      {kb.title} ({kb.chunksCount} Chunks)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Trigger Settings */}
          {activeNode.type === 'trigger' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('مسار الـ Webhook المباشر', 'Webhook Endpoint URL')}
                </label>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                  <span>https://api.zainauto.ai{config.path || '/webhook/incoming'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">
                  {t('نوع الاستدعاء البرمجي', 'HTTP Method')}
                </label>
                <select
                  value={config.method || 'POST'}
                  onChange={(e) => handleConfigChange('method', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="POST">POST (JSON Body)</option>
                  <option value="GET">GET (Query Params)</option>
                </select>
              </div>
            </div>
          )}

          {/* Logic Settings */}
          {activeNode.type === 'logic' && (
            <div className="space-y-3">
              {activeNode.subType === 'if_else' && (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400 font-medium">
                      {t('حقل التحقق', 'Field to Evaluate')}
                    </label>
                    <input
                      type="text"
                      value={config.field || 'sentiment'}
                      onChange={(e) => handleConfigChange('field', e.target.value)}
                      placeholder="e.g. score, budget, sentiment"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 font-medium">
                        {t('المعامل', 'Operator')}
                      </label>
                      <select
                        value={config.operator || '>='}
                        onChange={(e) => handleConfigChange('operator', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="==">يساوي (==)</option>
                        <option value=">=">أكبر من أو يساوي (&gt;=)</option>
                        <option value="<=">أصغر من أو يساوي (&lt;=)</option>
                        <option value="contains">يحتوي على (contains)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 font-medium">
                        {t('القيمة المستهدفة', 'Target Value')}
                      </label>
                      <input
                        type="text"
                        value={config.value !== undefined ? config.value : '75'}
                        onChange={(e) => handleConfigChange('value', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeNode.subType === 'delay' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium">
                      {t('مدة الانتظار', 'Duration')}
                    </label>
                    <input
                      type="number"
                      value={config.duration || 2}
                      onChange={(e) => handleConfigChange('duration', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium">
                      {t('الوحدة', 'Unit')}
                    </label>
                    <select
                      value={config.unit || 'days'}
                      onChange={(e) => handleConfigChange('unit', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="minutes">دقائق (Minutes)</option>
                      <option value="hours">ساعات (Hours)</option>
                      <option value="days">أيام (Days)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Settings */}
          {activeNode.type === 'action' && (
            <div className="space-y-3">
              {(activeNode.subType === 'send_message' || activeNode.subType === 'send_email') && (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400 font-medium">
                      {t('المستقبل / رقم الهاتف أو البريد', 'Recipient Variable')}
                    </label>
                    <input
                      type="text"
                      value={config.recipient || '{{lead.phone}}'}
                      onChange={(e) => handleConfigChange('recipient', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400 font-medium">
                      {t('نص الرسالة أو القالب', 'Message Template')}
                    </label>
                    <textarea
                      rows={4}
                      value={config.messageTemplate || config.body || ''}
                      placeholder="أهلاً بك {{name}}، يسعدنا تواصلك مع زين للأتمتة والذكاء الاصطناعي (Zain Automation AI)..."
                      onChange={(e) => handleConfigChange('messageTemplate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                    />
                    <span className="text-[10px] text-slate-400">
                      {t('المتغيرات المتاحة: {{name}}, {{phone}}, {{service}}, {{score}}', 'Variables: {{name}}, {{phone}}, {{service}}')}
                    </span>
                  </div>
                </>
              )}

              {activeNode.subType === 'create_customer' && (
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400 font-medium">
                    {t('مرحلة الـ CRM المخصصة', 'Target CRM Stage')}
                  </label>
                  <select
                    value={config.stage || 'qualified'}
                    onChange={(e) => handleConfigChange('stage', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="new">عميل جديد (New Lead)</option>
                    <option value="qualified">مؤهل للشراء (Qualified)</option>
                    <option value="proposal">تقديم العرض (Proposal)</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {t('إلغاء', 'Cancel')}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('حفظ التعديلات', 'Save Node')}</span>
        </button>
      </div>
    </aside>
    </>
  );
};
