import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wand2,
  GitFork,
  Bot,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AiAssistantFloating: React.FC = () => {
  const { isAiCopilotOpen, setIsAiCopilotOpen, setCurrentView, language, t } = useApp();

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; provider?: string }>>([
    {
      sender: 'ai',
      text:
        language === 'ar'
          ? 'مرحباً! أنا زين كوبايلوت (Zain Copilot) مساعدك الذكي داخل المنصة. يمكنني مساعدتك في بناء مسارات العمل، كتابة الـ Prompts، وربط الواتساب و CRM ونماذج Ollama المحلية (http://127.0.0.1:11434). كيف أساعدك الآن؟'
          : 'Hello! I am Zain Copilot, your in-platform AI automation architect. I can assist with workflows, CRM, and local Ollama models (http://127.0.0.1:11434). How can I help?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useOllama, setUseOllama] = useState(false);

  if (!isAiCopilotOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          provider: useOllama ? 'ollama' : undefined,
          model: useOllama ? 'ollama/llama3:latest' : undefined,
          systemPrompt: 'أنت مساعد ذكي لمنصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI). قدم نصائح برمجية وعملية دقيقة وموجزة بالعربية.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response || 'تم استلام طلبك ومعالجته بنجاح.';
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: reply,
            provider: data.provider || (useOllama ? 'Ollama Local' : 'Zain AI')
          }
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      let reply = '';
      if (userText.includes('واتساب') || userText.toLowerCase().includes('whatsapp')) {
        reply = `لربط الواتساب بأفضل ممارسة: توجه إلى تبويب التكاملات (Integrations) وفعل WhatsApp Business API. بعد ذلك، يمكنك سحب عقدة Trigger "Inbound Message" في محرر الـ Workflow وربطها بوكيل الذكاء الاصطناعي للرد الفوري خلال 200ms.`;
      } else if (userText.includes('crm') || userText.includes('عميل')) {
        reply = `يمكنك إرسال أي عميل مؤهل إلى الـ CRM تلقائياً باستخدام عقدة "Create Customer" في محرر المسارات، وتحديد مرحلة الـ Pipeline المناسبة مثل (Qualified أو Proposal).`;
      } else if (userText.includes('ollama') || userText.includes('داخلي') || userText.includes('نفق') || userText.includes('cloudflare')) {
        reply = `يدعم النظام خادم Ollama المحلي (http://127.0.0.1:11434) والأنفاق الخارجية العامة عبر Cloudflare (https://xxxx.trycloudflare.com) مع حماية وترويسات x-api-key: ZAIN_SECRET_2026 ومطابقة Content-Type: application/json.`;
      } else {
        reply = `في منصة زين للأتمتة والذكاء الاصطناعي (Zain Automation AI) يمكنك استخدام ميزة "AI Workflow Generator" أو تشغيل النماذج محلياً (http://127.0.0.1:11434) أو عبر نفق عام خارجي (https://xxxx.trycloudflare.com) بأمان تام.`;
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[520px] rounded-3xl border border-emerald-500/30 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Zain AI Copilot</h4>
            <span className="text-[10px] text-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>{t('متصل بالمنصة', 'Connected')}</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsAiCopilotOpen(false)}
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl border border-slate-200 dark:border-slate-700'
              }`}
            >
              <p>{m.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs w-24">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300" />
          </div>
        )}
      </div>

      {/* Quick Prompts & Mode Toggle */}
      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto text-[10px]">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setInput('كيف أربط الواتساب وأرسل رسائل ترحيب؟')}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            💬 ربط الواتساب
          </button>
          <button
            onClick={() => setInput('فحص حالة خادم Ollama الداخلي على http://127.0.0.1:11434')}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            💻 فحص Ollama الداخلي
          </button>
        </div>

        <button
          onClick={() => setUseOllama(!useOllama)}
          className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            useOllama
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="استخدام خادم Ollama الداخلي (http://127.0.0.1:11434)"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${useOllama ? 'bg-white' : 'bg-slate-400'}`} />
          <span>{useOllama ? 'Ollama 127.0.0.1' : 'سحابي'}</span>
        </button>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('اسأل كوبايلوت أي شيء عن الأتمتة...', 'Ask Copilot anything...')}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
