import { useStore } from './hooks/useStore';
import Sidebar from './components/Sidebar';
import ScheduleView from './components/schedule/ScheduleView';
import EmployeesView from './components/employees/EmployeesView';
import CostsView from './components/costs/CostsView';
import AlertsView from './components/alerts/AlertsView';

export default function App() {
  const { currentView } = useStore();

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
