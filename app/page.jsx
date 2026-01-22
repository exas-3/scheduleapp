'use client';

import { StoreProvider, useStore } from '@/components/StoreProvider';
import Sidebar from '@/components/Sidebar';
import ScheduleView from '@/components/schedule/ScheduleView';
import EmployeesView from '@/components/employees/EmployeesView';
import CostsView from '@/components/costs/CostsView';
import AlertsView from '@/components/alerts/AlertsView';

function AppContent() {
  const { currentView, loading } = useStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <div className="text-text-secondary">Φόρτωση...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'schedule':
        return <ScheduleView />;
      case 'employees':
        return <EmployeesView />;
      case 'costs':
        return <CostsView />;
      case 'alerts':
        return <AlertsView />;
      default:
        return <ScheduleView />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 p-6">
        {renderView()}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
