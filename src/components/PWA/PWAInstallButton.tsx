import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const { t } = useApp();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium ${
          compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
        title={t('التطبيق مثبت بالفعل على جهازك كتطبيق PWA', 'App is already installed as PWA')}
      >
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('مثبت', 'Installed')}</span>
      </div>
    );
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
        } ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'}`}
        title={t('تثبيت زين للأتمتة والذكاء الاصطناعي كتطبيق على جهازك (PWA)', 'Install Zain Automation AI App')}
      >
        {installedSuccess ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>{t('تم التثبيت!', 'Installed!')}</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>{t('تثبيت التطبيق', 'Install App')}</span>
          </>
        )}
      </button>

      {/* Installation Guide Dialog (Android / iOS / Desktop) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('تثبيت Zain Automation AI كتطبيق', 'Install Zain Automation AI App')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('تطبيق PWA مستقل وسريع يعمل بدون متصفح', 'Fast standalone PWA mobile application')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If iOS Safari */}
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(
                    'لتثبيت التطبيق على iPhone أو iPad، اتبع الخطوات التالية في متصفح Safari:',
                    'To install on iPhone or iPad, follow these steps in Safari:'
                  )}
                </p>
                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
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
                      <span>{t('مرر لأسفل واختر "إضافة إلى الشاشة الرئيسية"', 'Scroll down and tap "Add to Home Screen"')}</span>
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
              </div>
            ) : (
              /* Android Chrome or Desktop Chrome instructions */
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(
                    'يمكنك تثبيت المنصة كتطبيق مستقل وخفيف على هاتف Android أو الكمبيوتر عبر Google Chrome بسهولة:',
                    'You can install the platform as a fast standalone app on Android or Desktop via Google Chrome:'
                  )}
                </p>

                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t(
                        'اضغط على قائمة الخيارات (الثلاث نقاط ⋮) في أعلى يمين/يسار متصفح Chrome.',
                        'Tap the options menu (three dots ⋮) in Google Chrome.'
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span>{t('اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"', 'Select "Install app" or "Add to Home screen"')}</span>
                      <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t(
                        'أكّد بالضغط على "تثبيت" وسيظهر التطبيق فوراً على شاشة تطبيقات هاتفك كبرنامج أصلي.',
                        'Confirm by clicking "Install". The app will appear on your home screen with its custom icon.'
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Monitor className="w-4 h-4 shrink-0" />
                  <span>
                    {t(
                      'ميزة: يمنحك التطبيق تجربة شاشة كاملة فائقة السرعة مع تخزين مؤقت وتشغيل فوري دون أشرطة المتصفح.',
                      'Feature: Full-screen native experience, background caching, and instant launch without URL bars.'
                    )}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              {t('حسناً، تم الفهم', 'Understood, got it')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
