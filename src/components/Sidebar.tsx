import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  PenTool,
  Wand2,
  Boxes,
  Bot,
  Users,
  FileCheck2,
  Activity,
  Share2,
  BookOpen,
  BarChart3,
  Map,
  UserCheck,
  Settings,
  Sparkles,
  ShieldCheck,
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CurrentView } from '../types';
import { PWAInstallButton } from './PWA/PWAInstallButton';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    workflows,
    agents,
    leads,
    executions,
    integrations,
    forms,
    currentOrganization,
    tenantUsage,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    language,
    t
  } = useApp();

  const failedExecutionsCount = executions.filter((e) => e.status === 'failed').length;

  interface NavItem {
    id: CurrentView;
    label: string;
    labelAr: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    category: 'core' | 'ai_crm' | 'system' | 'docs';
  }

  const navItems: NavItem[] = [
    // Core
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: <LayoutDashboard className="w-4 h-4" />,
      category: 'core'
    },
    {
      id: 'workflows',
      label: 'Workflows',
      labelAr: 'مسارات العمل',
      icon: <GitFork className="w-4 h-4" />,
      badge: workflows.length,
      category: 'core'
    },
    {
      id: 'builder',
      label: 'Workflow Canvas',
      labelAr: 'المحرر البصري',
      icon: <PenTool className="w-4 h-4" />,
      category: 'core'
    },
    {
      id: 'templates',
      label: 'Templates Library',
      labelAr: 'قوالب الأتمتة',
      icon: <Boxes className="w-4 h-4" />,
      badge: '11+',
      badgeColor: 'emerald',
      category: 'core'
    },

    // AI & CRM
    {
      id: 'agents',
      label: 'AI Agents Studio',
      labelAr: 'وكلاء الذكاء الاصطناعي',
      icon: <Bot className="w-4 h-4" />,
      badge: agents.length,
      badgeColor: 'purple',
      category: 'ai_crm'
    },
    {
      id: 'crm',
      label: 'CRM & Leads',
      labelAr: 'إدارة العملاء والـ Leads',
      icon: <Users className="w-4 h-4" />,
      badge: leads.length,
      category: 'ai_crm'
    },
    {
      id: 'forms',
      label: 'Smart Forms',
      labelAr: 'النماذج الذكية',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: forms.length,
      category: 'ai_crm'
    },

    // System & Ops
    {
      id: 'executions',
      label: 'Execution Logs',
      labelAr: 'سجل العمليات والتنفيذ',
      icon: <Activity className="w-4 h-4" />,
      badge: failedExecutionsCount > 0 ? `${failedExecutionsCount} خطأ` : `${executions.length}`,
      badgeColor: failedExecutionsCount > 0 ? 'rose' : 'slate',
      category: 'system'
    },
    {
      id: 'integrations',
      label: 'Integrations Hub',
      labelAr: 'مركز التكاملات',
      icon: <Share2 className="w-4 h-4" />,
      badge: `${integrations.filter((i) => i.connected).length}/${integrations.length}`,
      category: 'system'
    },
    {
      id: 'knowledge_base',
      label: 'Knowledge Base (RAG)',
      labelAr: 'قاعدة المعرفة',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'system'
    },
    {
      id: 'analytics',
      label: 'Analytics & ROI',
      labelAr: 'التحليلات والأداء',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'system'
    },

    // Roadmap, Specs, Team & Settings
    {
      id: 'specs_roadmap',
      label: 'Roadmap & Specs',
      labelAr: 'المواصفات وخارطة الطريق',
      icon: <Map className="w-4 h-4" />,
      badge: 'جديد',
      badgeColor: 'emerald',
      category: 'docs'
    },
    {
      id: 'team',
      label: 'Team & Roles',
      labelAr: 'فريق العمل والصلاحيات',
      icon: <UserCheck className="w-4 h-4" />,
      category: 'docs'
    },
    {
      id: 'settings',
      label: 'Settings & API',
      labelAr: 'الإعدادات والـ API',
      icon: <Settings className="w-4 h-4" />,
      category: 'docs'
    },
    {
      id: 'super_admin',
      label: 'Super Admin',
      labelAr: 'لوحة التحكم المركزية (SaaS)',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Admin',
      badgeColor: 'purple',
      category: 'docs'
    }
  ];

  const renderSection = (category: NavItem['category'], title: string, titleAr: string) => {
    const items = navItems.filter((item) => item.category === category);
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {t(titleAr, title)}
        </div>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar_nav_${item.id}`}
                onClick={() => {
                  setCurrentView(item.id);
                  if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group min-h-[44px] ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{t(item.labelAr, item.label)}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : item.badgeColor === 'purple'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : item.badgeColor === 'rose'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          id="mobile_sidebar_backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        id="app_sidebar"
        className={`fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] border-e border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isMobileMenuOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full rtl:translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                  {language === 'ar' ? 'زين للأتمتة والذكاء الاصطناعي' : 'Zain Automation AI'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  SaaS Enterprise
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={t('إغلاق القائمة', 'Close menu')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderSection('core', 'Workflows & Canvas', 'مسارات العمل والمحرر')}
          {renderSection('ai_crm', 'AI Agents & CRM', 'الذكاء والعملاء')}
          {renderSection('system', 'System & Automation', 'التنفيذ والأنظمة')}
          {renderSection('docs', 'Specs, Team & Setup', 'المواصفات والإدارة')}
        </div>

        <div>
          {/* PWA Install Button inside sidebar */}
          <div className="mb-3 pt-2">
            <PWAInstallButton />
          </div>

          {/* Plan quota indicator card */}
          <div className="p-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {currentOrganization?.planName || currentOrganization?.nameAr || t('خطة الأعمال', 'Business Pro')}
                </span>
              </div>
              <span className="text-[10px] text-emerald-500 font-bold">
                {tenantUsage ? `${Math.max(0, 100 - Math.round(((tenantUsage.executionsThisMonth || 0) / (tenantUsage.maxExecutions || 25000)) * 100))}% ${t('متاح', 'free')}` : '92%'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, tenantUsage ? Math.round(((tenantUsage.executionsThisMonth || 0) / (tenantUsage.maxExecutions || 25000)) * 100) : 24)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{workflows.length} / {tenantUsage?.maxWorkflows || 50} {t('مسار', 'flows')}</span>
              <span>{tenantUsage ? `${((tenantUsage.executionsThisMonth || 0) / 1000).toFixed(1)}k / ${((tenantUsage.maxExecutions || 25000) / 1000).toFixed(0)}k` : '14.8k / 100k'} {t('تنفيذ', 'runs')}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
