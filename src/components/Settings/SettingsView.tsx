import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Key,
  CreditCard,
  Bell,
  Shield,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, theme, setTheme, toggleTheme, t } = useApp();
  const [currentPlan, setCurrentPlan] = useState(SUBSCRIPTION_TIERS[1]);

  const changePlan = (tier: (typeof SUBSCRIPTION_TIERS)[0]) => {
    setCurrentPlan(tier);
  };

  const [activeTab, setActiveTab] = useState<'general' | 'api_keys' | 'billing' | 'security'>('billing');
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; created: string; lastUsed: string }[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/api-keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKeys) {
          setApiKeys(data.apiKeys);
        }
      })
      .catch(() => {
        setApiKeys([
          {
            id: 'key_1',
            name: 'Production Server Webhook Key',
            key: 'za_live_••••••••••••34e7',
            created: '2026-02-15',
            lastUsed: 'Just now'
          }
        ]);
      });
  }, []);

  const handleCopyKey = (id: string, keyStr: string) => {
    navigator.clipboard?.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateNewKey = async () => {
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `API Key ${apiKeys.length + 1}` })
      });
      const data = await res.json();
      if (data.apiKey) {
        setApiKeys((prev) => [data.apiKey, ...prev]);
      }
    } catch {
      // Fallback local safe representation
      const newKey = {
        id: `key_${Date.now()}`,
        name: `API Key ${apiKeys.length + 1}`,
        key: `za_live_••••••••••••${Math.random().toString(36).substring(2, 6)}`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never'
      };
      setApiKeys((prev) => [newKey, ...prev]);
    }
  };

  return (
    <div id="settings_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t('إعدادات المنصة والاشتراكات', 'Platform Settings & Subscriptions')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t(
            'تحكم في مفاتيح الـ API، إدارة خطة الاشتراك، وتفضيلات النظام ومساحة العمل.',
            'Manage API keys, upgrade your quota plan, and customize platform preferences.'
          )}
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'billing'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('الاشتراكات والباقات (Plans)', 'Billing & Plans')}</span>
        </button>

        <button
          onClick={() => setActiveTab('api_keys')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'api_keys'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>{t('مفاتيح الـ API والـ Webhooks', 'API Keys')}</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'general'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('التفضيلات واللغة', 'General Preferences')}</span>
        </button>
      </div>

      {/* Billing & Plans Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {t('خطتك الحالية', 'Current Active Plan')}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {currentPlan.name} Tier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentPlan.priceMonthly === 0
                  ? t('خطة تجريبية مجانية', 'Free tier for personal exploration')
                  : `$${currentPlan.priceMonthly} / ${t('شهرياً', 'month')}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {currentPlan.maxExecutionsPerMonth.toLocaleString()} {t('عملية شهرياً', 'runs/mo')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrent = currentPlan.id === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{tier.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ${tier.priceMonthly}
                      </span>
                      <span className="text-xs text-slate-400">/{t('شهر', 'mo')}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === 'ar' ? tier.descriptionAr : tier.description}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => changePlan(tier)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    }`}
                  >
                    {isCurrent ? t('خطتك الحالية', 'Current Plan') : t('ترقية الباقة الآن', 'Upgrade to Plan')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api_keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('المفاتيح الأمنية (Active Secret Keys)', 'Active API Credentials')}
            </h3>
            <button
              onClick={handleGenerateNewKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('توليد مفتاح جديد', 'Generate New Key')}</span>
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{k.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      {k.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(k.id, k.key)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{t('آخر استخدام:', 'Last used:')} {k.lastUsed}</span>
                  <button
                    onClick={() => setApiKeys((prev) => prev.filter((item) => item.id !== k.id))}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 max-w-xl text-xs">
          <div className="space-y-2">
            <label className="font-bold text-slate-900 dark:text-white">{t('لغة المنصة الافتراضية', 'Platform Language')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                  language === 'ar' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>🇸🇦 العربية (RTL)</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                  language === 'en' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>🇺🇸 English (LTR)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-900 dark:text-white">{t('مظهر الواجهة (Theme)', 'Theme Appearance')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>🌙 Dark Mode</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                  theme === 'light' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>☀️ Light Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
