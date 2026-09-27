import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Terminal,
  Play,
  Filter,
  Plus,
  ArrowRight,
  Cpu,
  Trash2,
  Layers,
  ChevronDown,
  Info,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system';
  text: string;
  model?: string;
  timestamp: string;
  taskData?: {
    taskId?: string;
    status?: string;
    prompt?: string;
  };
}

interface SupabaseTask {
  id: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  result?: string | null;
  created_at?: string;
}

export const AiChatView: React.FC = () => {
  const { language, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'gemini',
      text: t(
        'مرحباً بك في واجهة محادثة الأتمتة! يمكنك التحدث معي مباشرة لطرح الأسئلة وتوليد الأكواد البرمجية عبر نماذج Google Gemini، أو الضغط على زر "معالجة مهام Supabase" لفحص جدول tasks ومعالجة كافة المهام المعلقة تلقائياً وحفظ النتائج في قاعدة البيانات.',
        'Welcome to the Automation AI Chat! You can chat directly to ask questions and generate code using Google Gemini models, or click "Process Supabase Tasks" to poll the tasks table, process all pending prompts automatically, and save results to the database.'
      ),
      model: 'gemini-3.1-flash-lite',
      timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isProcessingTasks, setIsProcessingTasks] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-flash-lite' | 'gemini-3.6-flash' | 'gemini-3.8-flash'>('gemini-3.1-flash-lite');
  
  // Supabase Tasks state
  const [tasks, setTasks] = useState<SupabaseTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [showTasksDrawer, setShowTasksDrawer] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [taskNotice, setTaskNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isProcessingTasks]);

  // Fetch Supabase Tasks
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const res = await fetch('/api/ai/supabase-tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Send direct chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputMessage.trim();
    if (!cleanText || isSending) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          model: selectedModel,
          systemPrompt: 'أنت مساعد ذكي متخصص في هندسة البرمجيات وأتمتة الأعمال والذكاء الاصطناعي. قدّم إجابات برمجية دقيقة، منظمة، وشاملة باللغة العربية مع نماذج الأكواد المناسبة.'
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `gemini_${Date.now()}`,
            sender: 'gemini',
            text: data.text,
            model: data.model || selectedModel,
            timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'system',
            text: data.error || t('تعذر تلقي الرد من النموذج. يرجى إعادة المحاولة.', 'Could not receive response from model. Please try again.'),
            timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'system',
          text: t(`خطأ في الاتصال: ${err.message}`, `Connection error: ${err.message}`),
          timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // 2. Process Supabase Pending Tasks
  const handleProcessSupabaseTasks = async () => {
    if (isProcessingTasks) return;
    setIsProcessingTasks(true);
    setTaskNotice(null);

    // Add immediate progress notice into chat
    const startMsgId = `sys_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: startMsgId,
        sender: 'system',
        text: t(
          '🔍 جاري فحص جدول tasks في Supabase والبحث عن المهام بحالة pending...',
          '🔍 Checking Supabase tasks table for pending records...'
        ),
        timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const res = await fetch('/api/ai/process-supabase-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          retryFailed: false
        })
      });

      const data = await res.json();

      if (data.success) {
        if (data.processedCount === 0) {
          setTaskNotice({
            type: 'info',
            message: t('لا توجد مهام معلقة (pending) حالياً في جدول tasks.', 'No pending tasks found in tasks table.')
          });
          setMessages((prev) => [
            ...prev,
            {
              id: `sys_none_${Date.now()}`,
              sender: 'system',
              text: t(
                'ℹ️ لا توجد مهام جديدة بحالة (pending) في Supabase. يمكنك إضافة مهمة جديدة مباشرة من الزر أدناه أو إرسال طلب جديد.',
                'ℹ️ No pending tasks found in Supabase. You can add a new task directly or send a prompt.'
              ),
              timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          setTaskNotice({
            type: 'success',
            message: t(`تمت معالجة وتحديث ${data.processedCount} مهمة بنجاح!`, `Successfully processed ${data.processedCount} tasks!`)
          });

          // Append each completed task directly into the conversation stream
          for (const item of data.tasks || []) {
            setMessages((prev) => [
              ...prev,
              {
                id: `task_item_${item.id}_${Date.now()}`,
                sender: 'gemini',
                text: `⚡ **${t('تمت معالجة مهمة Supabase:', 'Supabase Task Processed:')}**\n\n📌 **${t('الطلب (Prompt):', 'Prompt:')}**\n${item.prompt}\n\n---\n\n✅ **${t('النتيجة المحفوظة في Supabase (Result):', 'Result saved to Supabase:')}**\n\n${item.result}`,
                model: selectedModel,
                timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                taskData: {
                  taskId: item.id,
                  status: 'completed',
                  prompt: item.prompt
                }
              }
            ]);
          }
        }
        await fetchTasks();
      } else {
        setTaskNotice({
          type: 'error',
          message: data.error || t('حدث خطأ أثناء فحص ومعالجة المهام.', 'Error while processing tasks.')
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `err_proc_${Date.now()}`,
            sender: 'system',
            text: `❌ ${data.error || t('فشلت عملية المعالجة.', 'Processing failed.')}`,
            timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setTaskNotice({
        type: 'error',
        message: err.message
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `err_net_${Date.now()}`,
          sender: 'system',
          text: `❌ ${t('خطأ أثناء الاتصال بالخادم:', 'Server communication error:')} ${err.message}`,
          timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessingTasks(false);
    }
  };

  // 3. Reset or Retry single task in Supabase
  const handleResetTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/ai/reset-supabase-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        // Automatically trigger processing
        handleProcessSupabaseTasks();
      }
    } catch (err) {
      console.error('Reset task error:', err);
    }
  };

  // 4. Quick insert task to Supabase as pending
  const handleCreateTaskFromInput = async () => {
    const cleanText = inputMessage.trim();
    if (!cleanText) return;

    try {
      const res = await fetch('/api/ai/create-supabase-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanText })
      });
      const data = await res.json();
      if (data.success) {
        setInputMessage('');
        await fetchTasks();
        setMessages((prev) => [
          ...prev,
          {
            id: `task_queued_${Date.now()}`,
            sender: 'system',
            text: `📥 ${t('تمت إضافة المهمة بنجاح إلى جدول Supabase بحالة pending:', 'Task queued to Supabase tasks table with status pending:')} "${cleanText}"`,
            timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        // Trigger processing
        handleProcessSupabaseTasks();
      }
    } catch (err: any) {
      console.error('Create task error:', err);
    }
  };

  const filteredTasks = tasks.filter((item) => {
    if (taskFilter === 'all') return true;
    return item.status === taskFilter;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 dark:border-slate-800">
        
        {/* Top Header & Actions Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('محادثة الأتمتة (AI Chat)', 'Automation AI Chat')}
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800/50">
                  Gemini + Supabase
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('توليد أكواد برمجية ومحادثة حية ومعالجة مهام قاعدة البيانات الخلفية', 'Live code generation, intelligent chat, and background Supabase tasks processing')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Model Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200 dark:border-slate-700/60 text-xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-500 mx-1.5" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-medium focus:ring-0 cursor-pointer pr-4 text-xs"
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (الأسرع)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              </select>
            </div>

            {/* Primary Action: Process Supabase Tasks */}
            <button
              id="btn_process_supabase_tasks"
              onClick={handleProcessSupabaseTasks}
              disabled={isProcessingTasks}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isProcessingTasks
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 hover:shadow-md'
              }`}
            >
              {isProcessingTasks ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('جاري معالجة المهام...', 'Processing Tasks...')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('معالجة مهام Supabase', 'Process Supabase Tasks')}</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-mono">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Drawer Toggle */}
            <button
              onClick={() => setShowTasksDrawer(!showTasksDrawer)}
              className={`p-2 rounded-xl border transition-colors ${
                showTasksDrawer
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={t('إظهار/إخفاء لوحة مهام Supabase', 'Toggle Supabase tasks panel')}
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notice Toast */}
        {taskNotice && (
          <div
            className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
              taskNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : taskNotice.type === 'info'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {taskNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : taskNotice.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{taskNotice.message}</span>
            </div>
            <button
              onClick={() => setTaskNotice(null)}
              className="text-xs hover:underline opacity-70 hover:opacity-100"
            >
              {t('إغلاق', 'Dismiss')}
            </button>
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-xl px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 text-center flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{msg.text}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? 'U' : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[78%]">
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {isUser ? t('أنت', 'You') : 'Gemini AI'}
                    </span>
                    {msg.model && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                        {msg.model}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans break-words">{msg.text}</div>

                    {/* Copy Button for Model Output */}
                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">{t('تم النسخ', 'Copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t('نسخ الرد', 'Copy Response')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 mr-auto max-w-xl">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-600 text-white">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span>{t('جاري التفكير والتوليد عبر Gemini...', 'Thinking and generating with Gemini...')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
          <span className="text-slate-400 font-medium shrink-0">{t('اقتراحات سريعة:', 'Quick prompts:')}</span>
          {[
            t('اكتب دالة بايثون لجمع رقمين مع مثال بسيط', 'Write a python function to sum two numbers'),
            t('كيف أقوم بتأمين Webhook الـ WhatsApp برمز تحقق وسر؟', 'How to secure WhatsApp webhook with verify token?'),
            t('اكتب كود استعلام SQL للبحث عن المستخدمين النشطين', 'SQL query to select active users')
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="relative flex items-center">
              <textarea
                id="ai_chat_input"
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t(
                  'اكتب سؤالك أو طلبك البرمجي هنا (Enter للإرسال، Shift+Enter لسطر جديد)...',
                  'Type your question or coding task here (Enter to send, Shift+Enter for newline)...'
                )}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xs sm:text-sm resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t('يدعم Markdown ونماذج الأكواد البرمجية', 'Supports Markdown & code blocks')}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Secondary Button: Queue to Supabase tasks table */}
                <button
                  type="button"
                  onClick={handleCreateTaskFromInput}
                  disabled={!inputMessage.trim()}
                  title={t('إضافة الطلب كسطر في جدول tasks بـ Supabase بحالة pending ومعالجته', 'Add as row in Supabase tasks table and process')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('حفظ كـ مهمة في Supabase', 'Save to Supabase Tasks')}</span>
                </button>

                {/* Main Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('إرسال', 'Send')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Supabase Completed & Pending Tasks Viewer */}
      {showTasksDrawer && (
        <div className="w-full lg:w-[420px] xl:w-[460px] h-full flex flex-col border-t lg:border-t-0 bg-white dark:bg-slate-900 shrink-0">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('سجل مهام Supabase', 'Supabase Tasks')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono">
                    tasks ({tasks.length})
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">snyqtmugafvoqqpfsfxp</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchTasks}
                disabled={isLoadingTasks}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                title={t('تحديث البيانات', 'Refresh')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/40 dark:bg-slate-950/40 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                taskFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('الكل', 'All')} ({tasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                taskFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{t('المكتملة', 'Completed')}</span>
              <span className="font-mono">({completedCount})</span>
            </button>
            <button
              onClick={() => setTaskFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                taskFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{t('المعلقة', 'Pending')}</span>
              <span className="font-mono">({pendingCount})</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {isLoadingTasks && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                <span>{t('جاري جلب المهام من Supabase...', 'Fetching tasks from Supabase...')}</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs text-center px-4">
                <Database className="w-8 h-8 opacity-40 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {taskFilter === 'pending'
                    ? t('لا توجد أي مهام معلقة (Pending)', 'No pending tasks found')
                    : taskFilter === 'completed'
                    ? t('لا توجد مهام مكتملة بعد', 'No completed tasks yet')
                    : t('قاعدة البيانات خالية من المهام حالياً', 'No tasks in database')}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('اكتب طلباً في المحادثة واضغط "حفظ كـ مهمة في Supabase".', 'Type a prompt in chat and click "Save to Supabase Tasks".')}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isPending = task.status === 'pending';

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5 text-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {isPending && <Clock className="w-2.5 h-2.5 animate-pulse" />}
                        {!isCompleted && !isPending && <AlertCircle className="w-2.5 h-2.5" />}
                        <span>{task.status}</span>
                      </span>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <span>{task.created_at ? new Date(task.created_at).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {isCompleted && (
                          <button
                            onClick={() => handleResetTask(task.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline px-1"
                            title={t('إعادة التشغيل وتعيين كـ Pending', 'Re-run as pending')}
                          >
                            {t('إعادة', 'Rerun')}
                          </button>
                        )}
                        {!isCompleted && !isPending && (
                          <button
                            onClick={() => handleResetTask(task.id)}
                            className="text-amber-600 dark:text-amber-400 hover:underline px-1 font-bold"
                            title={t('إعادة المحاولة', 'Retry')}
                          >
                            {t('إعادة المحاولة', 'Retry')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                        {t('المهمة (Prompt):', 'Prompt:')}
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {task.prompt}
                      </div>
                    </div>

                    {/* Result (if completed) */}
                    {task.result && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-0.5">
                          <span>{t('النتيجة (Result):', 'Result:')}</span>
                          <button
                            onClick={() => handleCopy(task.result || '', task.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            {copiedId === task.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="font-normal">{copiedId === task.id ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}</span>
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {task.result}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
