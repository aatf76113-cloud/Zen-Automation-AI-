import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Plus,
  Send,
  Sliders,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  FileText,
  Wrench,
  ChevronRight,
  X
} from 'lucide-react';
import { AIAgent } from '../../types';
import { useApp } from '../../context/AppContext';

export const AgentsView: React.FC = () => {
  const { agents, saveAgent, language, t } = useApp();

  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(agents[0]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'مرحبًا بك! أنا وكيل المبيعات والتأهيل الذكي لمنصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI). كيف يمكنني مساعدتك في أتمتة أعمالك اليوم؟',
      time: '10:30'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);

  // New Agent State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: userInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    // Realistic Agent Response Simulation
    setTimeout(() => {
      let reply = '';
      if (selectedAgent.id === 'agent_sales_01') {
        reply = `يسعدني جداً اهتمامك! منصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI) توفر لك حلولاً متكاملة للربط بين الواتساب والـ CRM وأتمتة الردود على مدار الساعة. هل تفضل أن أحجز لك موعداً استشارياً سريعاً مدته 15 دقيقة لمناقشة متطلبات مشروعك بالتفصيل؟`;
      } else if (selectedAgent.id === 'agent_support_02') {
        reply = `أهلاً بك. قمت بفحص سجلات الـ Webhooks وقاعدة المعرفة، وتبين أن المشكلة سببها عدم تطابق الـ Headers في طلب الـ POST. يمكنك تصحيح ذلك بإضافة "Authorization: Bearer <TOKEN>" وسيعمل الربط فوريًا. هل تحب أن أقوم باختبار الاتصال لك؟`;
      } else if (selectedAgent.id === 'agent_marketing_03') {
        reply = `إليك اقتراح لمنشور تسويقي تفاعلي: "هل تقضي أكثر من 3 ساعات يوميًا في مهام متكررة؟ 🚀 أتمت مبيعاتك وخدمة عملائك على مدار الساعة مع زين للأتمتة والذكاء الاصطناعي (Zain Automation AI) ووفّر 70% من وقت فريقك." ما رأيك بنبرة الطرح؟`;
      } else {
        reply = `مرحباً بك! تلقيت طلبك وجارِ معالجته وتحليله وفق القواعد المحددة في قاعدة المعرفة. كل شيء يعمل بكفاءة 100%.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;
    const agent: AIAgent = {
      id: `agent_${Date.now()}`,
      name: newAgentName,
      nameAr: newAgentName,
      role: newAgentRole || 'Custom Automation Agent',
      roleAr: newAgentRole || 'وكيل أتمتة مخصص',
      avatar: '🤖',
      description: 'Custom AI agent configured to execute specific company tasks.',
      descriptionAr: 'وكيل ذكاء اصطناعي مخصص تم تدريبه لتنفيذ مهام الشركة بدقة.',
      systemPrompt: newAgentPrompt || 'أنت وكيل ذكي ومساعد خبير للشركة.',
      goal: 'أتمتة الأعمال بنجاح بنسبة تفوق 95%.',
      model: 'gemini-2.5-flash',
      temperature: 0.5,
      maxTokens: 1500,
      allowedTools: ['CRM Sync', 'WhatsApp API'],
      knowledgeBaseIds: [],
      status: 'active',
      conversationsCount: 0,
      totalTokensUsed: 0
    };
    saveAgent(agent);
    setSelectedAgent(agent);
    setIsNewAgentModalOpen(false);
    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentPrompt('');
  };

  return (
    <div id="ai_agents_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('وكلاء أذكياء ذاتيون (Autonomous AI Agents)', 'Autonomous Cognitive AI Agents')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('استوديو وكلاء الذكاء الاصطناعي', 'AI Agents Studio')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'أنشئ ودرّب وكلاء أذكياء متخصصين في المبيعات، الدعم الفني، التسويق، وتحليل البيانات.',
              'Deploy, configure, and monitor specialized AI agents powered by Gemini models.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsNewAgentModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إنشاء وكيل جديد', 'Deploy New Agent')}</span>
        </button>
      </div>

      {/* Agents Grid & Live Playground Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agent Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('قائمة الوكلاء النشطين في المنصة', 'Active AI Agents Directory')}
          </h3>

          <div className="space-y-3">
            {agents.map((agent) => {
              const isSelected = selectedAgent.id === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setChatMessages([
                      {
                        sender: 'agent',
                        text:
                          language === 'ar'
                            ? `مرحبًا بك! أنا ${agent.nameAr} (${agent.roleAr}). كيف يمكنني خدمتك الآن؟`
                            : `Hello! I am ${agent.name} (${agent.role}). How can I assist you right now?`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-2xl flex items-center justify-center shadow-inner">
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {language === 'ar' ? agent.nameAr : agent.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {t('نشط', 'Active')}
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                          {language === 'ar' ? agent.roleAr : agent.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {agent.model}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {language === 'ar' ? agent.descriptionAr : agent.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>{agent.allowedTools.join(', ')}</span>
                    </div>
                    <span>
                      {agent.conversationsCount.toLocaleString()} {t('محادثة', 'chats')} • {(agent.totalTokensUsed / 1000).toFixed(0)}k {t('توكن', 'tokens')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Interactive Agent Chat Playground (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden sticky top-24">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-xl flex items-center justify-center">
                {selectedAgent.avatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? selectedAgent.nameAr : selectedAgent.name}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('جاهز للاختبار الفوري', 'Live Playground')}</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Temp: {selectedAgent.temperature}
            </span>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs w-28">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-300" />
                <span className="text-[10px]">{t('يكتب...', 'typing...')}</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('اكتب رسالة لتجربة رد الوكيل...', 'Type a test prompt to the agent...')}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isTyping}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Agent Modal */}
      {isNewAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('إنشاء وكيل ذكاء اصطناعي جديد', 'Create New AI Agent')}
              </h3>
              <button
                onClick={() => setIsNewAgentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('اسم الوكيل', 'Agent Name')}
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="مثال: وكيل الاستشارات العقارية"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('الدور والتخصص', 'Role & Specialty')}
                </label>
                <input
                  type="text"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  placeholder="مثال: Real Estate Sales Specialist"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('تعليمات النظام وشخصية الوكيل (System Prompt)', 'System Instructions')}
                </label>
                <textarea
                  rows={4}
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  placeholder="حدد له طريقة الإجابة، الشروط، وأسلوب التواصل..."
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsNewAgentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                onClick={handleCreateAgent}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
              >
                {t('نشر وتفعيل الوكيل', 'Deploy Agent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
