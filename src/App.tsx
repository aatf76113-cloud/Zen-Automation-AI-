import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

// Direct synchronous imports for rock-solid stability and zero-lag rendering
import { DashboardView } from './components/Dashboard/DashboardView';
import { WorkflowCanvas } from './components/WorkflowBuilder/WorkflowCanvas';
import { WorkflowsListView } from './components/Workflows/WorkflowsListView';
import { TemplatesView } from './components/Templates/TemplatesView';
import { AgentsView } from './components/AiAgents/AgentsView';
import { CrmView } from './components/CRM/CrmView';
import { FormsView } from './components/Forms/FormsView';
import { ExecutionsView } from './components/Executions/ExecutionsView';
import { IntegrationsView } from './components/Integrations/IntegrationsView';
import { KnowledgeBaseView } from './components/KnowledgeBase/KnowledgeBaseView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { RoadmapSpecsView } from './components/RoadmapSpecs/RoadmapSpecsView';
import { TeamView } from './components/Team/TeamView';
import { SettingsView } from './components/Settings/SettingsView';
import { SuperAdminView } from './components/SuperAdmin/SuperAdminView';
import { AiAssistantFloating } from './components/AiAssistant/AiAssistantFloating';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'builder':
        return <WorkflowCanvas />;
      case 'workflows':
        return <WorkflowsListView />;
      case 'templates':
        return <TemplatesView />;
      case 'agents':
        return <AgentsView />;
      case 'crm':
        return <CrmView />;
      case 'forms':
        return <FormsView />;
      case 'executions':
        return <ExecutionsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'knowledge_base':
        return <KnowledgeBaseView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'specs_roadmap':
        return <RoadmapSpecsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      case 'super_admin':
        return <SuperAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Responsive Left/Right Sidebar (Persistent on Desktop, Slide-over Drawer on Mobile/Tablet) */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <Header />

        {/* Dynamic Viewport with Mobile Bottom Nav Clearance */}
        <main className="flex-1 flex overflow-hidden relative pb-16 lg:pb-0 min-w-0">
          <ErrorBoundary>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on phones & tablets < 1024px) */}
      <MobileBottomNav />

      {/* Floating AI Copilot Assistant */}
      <AiAssistantFloating />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
