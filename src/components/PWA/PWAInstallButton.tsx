import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const { t } = useApp();

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // Only show if browser supports prompt or is iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        id="pwa_install_btn"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all shadow-sm ${
          installedSuccess
            ? 'bg-emerald-600 text-white'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
        } ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'}`}
        title={t('تثبيت التطبيق على جهازك', 'Install App')}
      >
        {installedSuccess ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>{t('تم التثبيت!', 'Installed!')}</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('تثبيت التطبيق', 'Install App')}</span>
          </>
        )}
      </button>

      {/* iOS Install Guide Dialog */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('تثبيت على iPhone و iPad', 'Install on iOS / iPad')}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                'لتثبيت زين للأتمتة والذكاء الاصطناعي كتطبيق سريع ومباشر على شاشتك الرئيسية، اتبع الخطوات التالية في متصفح Safari:',
                'To install Zain Automation AI as an app on your home screen, follow these steps in Safari:'
              )}
            </p>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span>{t('اضغط على زر المشاركة', 'Tap Share button')}</span>
                  <Share className="w-4 h-4 text-sky-500" />
                  <span>{t('في أسفل المتصفح', 'in bottom bar')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span>{t('اختر "إضافة إلى الشاشة الرئيسية"', 'Select "Add to Home Screen"')}</span>
                  <PlusSquare className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <span className="text-slate-700 dark:text-slate-300">
                  {t('اضغط على "إضافة" (Add) في الزاوية العلوية.', 'Tap "Add" in top-right.')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              {t('حسناً، فهمت', 'Got it')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
