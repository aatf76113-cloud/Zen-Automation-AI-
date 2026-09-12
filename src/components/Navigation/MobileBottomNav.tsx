import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  PenTool,
  Users,
  Menu,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrentView } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    workflows,
    selectedWorkflow,
    builderNodes,
    loadWorkflowToBuilder,
    leads,
    t
  } = useApp();

  interface BottomTab {
    id: CurrentView | 'menu';
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number | string;
  }

  const tabs: BottomTab[] = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'workflows',
      labelAr: 'المسارات',
      labelEn: 'Flows',
      icon: <GitFork className="w-5 h-5" />,
      badge: workflows.length
    },
    {
      id: 'builder',
      labelAr: 'المحرر',
      labelEn: 'Canvas',
      icon: <PenTool className="w-5 h-5" />
    },
    {
      id: 'crm',
      labelAr: 'العملاء',
      labelEn: 'CRM',
      icon: <Users className="w-5 h-5" />,
      badge: leads.length
    },
    {
      id: 'menu',
      labelAr: 'القائمة',
      labelEn: 'Menu',
      icon: <Menu className="w-5 h-5" />
    }
  ];

  return (
    <nav
      id="mobile_bottom_nav"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg transition-transform"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab) => {
        const isMenu = tab.id === 'menu';
        const isActive = isMenu ? isMobileMenuOpen : currentView === tab.id;

        return (
          <button
            key={tab.id}
            id={`mobile_tab_${tab.id}`}
            onClick={() => {
              if (isMenu) {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              } else {
                if (tab.id === 'builder') {
                  loadWorkflowToBuilder(selectedWorkflow || (workflows && workflows[0]) || null);
                } else {
                  setCurrentView(tab.id as CurrentView);
                }
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all relative ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && Number(tab.badge) > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">
              {t(tab.labelAr, tab.labelEn)}
            </span>
            {isActive && (
              <span className="absolute bottom-0.5 w-6 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
