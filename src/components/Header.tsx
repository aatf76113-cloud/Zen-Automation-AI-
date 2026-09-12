import React, { useState } from 'react';
import {
  Sparkles,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Zap,
  UserCheck,
  Building,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthModal } from './Auth/AuthModal';
import { PWAInstallButton } from './PWA/PWAInstallButton';

export const Header: React.FC = () => {
  const {
    currentUser,
    language,
    setLanguage,
    theme,
    toggleTheme,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    currentOrganization,
    organizations,
    switchOrganization,
    tenantUsage,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setIsAiCopilotOpen,
    createNewWorkflow,
    setCurrentView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    t
  } = useApp();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      id="app_header"
      className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors"
    >
      {/* Brand & Workspace */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Toggle Button */}
        <button
          id="mobile_menu_toggle_btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('فتح القائمة الرئيسية', 'Open menu')}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          id="brand_logo_button"
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white font-mono">
                {language === 'ar' ? 'زين للأتمتة والذكاء الاصطناعي' : 'Zain Automation AI'}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI SaaS
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block">
              {language === 'ar'
                ? 'منصة ذكية متكاملة للأتمتة وإدارة الـ Workflows'
                : 'Enterprise Multi-Tenant Automation Platform'}
            </span>
          </div>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="relative hidden lg:block">
          <button
            id="workspace_switcher_btn"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold max-w-[160px] truncate">
              {currentOrganization?.nameAr || currentOrganization?.name || (language === 'ar' ? currentWorkspace.nameAr : currentWorkspace.name)}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase">
              {currentOrganization?.planName || 'Pro'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute top-full mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 animate-in fade-in">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{t('المؤسسات والعملاء', 'Organizations')}</span>
                <span className="text-emerald-500 font-bold">{organizations.length} {t('نشطة', 'active')}</span>
              </div>
              
              <div className="space-y-1 my-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      currentOrganization?.id === org.id
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span className="truncate max-w-[130px]">{language === 'ar' ? (org.nameAr || org.name) : org.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {org.planName || org.planId}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setCurrentView('super_admin');
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-center py-1.5 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
                >
                  {t('إدارة كافة المؤسسات (Super Admin)', 'Manage All Tenants')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search / Copilot Quick Bar */}
      <div className="hidden xl:flex items-center flex-1 max-w-md mx-6">
        <div
          onClick={() => setIsAiCopilotOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/40 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>
            {t(
              'اطلب من زين للأتمتة والذكاء الاصطناعي: "اعمل لي مسار لمتابعة العملاء"...',
              'Ask Zain Automation AI: "Create lead followup workflow"...'
            )}
          </span>
          <span className="ms-auto text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* PWA Install Button */}
        <PWAInstallButton compact={true} />

        {/* AI Copilot Button */}
        <button
          id="open_ai_copilot_btn"
          onClick={() => setIsAiCopilotOpen(true)}
          className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">{t('المساعد الذكي', 'AI Copilot')}</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>

        {/* New Workflow Button */}
        <button
          id="new_workflow_btn"
          onClick={() => createNewWorkflow()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">{t('مسار جديد', 'New Workflow')}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications_bell_btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('الإشعارات والتنبيهات', 'Notifications')}
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {unreadCount} {t('جديد', 'new')}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-emerald-500"
                >
                  {t('تحديد الكل كمقروء', 'Mark all read')}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`py-2.5 px-1 flex items-start gap-2.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors ${
                      !n.read ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {n.type === 'error' && (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      )}
                      {n.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {language === 'ar' ? n.titleAr : n.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {language === 'ar' ? n.messageAr : n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          id="language_toggle_btn"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          id="theme_toggle_btn"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Account / Auth Profile Trigger */}
        <button
          id="user_auth_profile_btn"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 ps-1.5 pe-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-emerald-500/50 transition-all text-xs text-slate-700 dark:text-slate-200"
          title={t('إدارة الحساب والمؤسسة', 'Manage Account & Tenant')}
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
            alt={currentUser?.name || 'User'}
            className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
          />
          <div className="hidden sm:flex flex-col items-start leading-tight text-start">
            <span className="font-bold text-[11px] truncate max-w-[90px]">
              {currentUser?.name || t('حسابي', 'My Account')}
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
              {currentUser?.role || 'Admin'}
            </span>
          </div>
        </button>
      </div>

      {/* Real Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
