import { useStore } from '../hooks/useStore';
import { Button } from './ui/Button';

const navItems = [
  {
    view: 'schedule',
    label: 'Πρόγραμμα',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    )
  },
  {
    view: 'employees',
    label: 'Προσωπικό',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    view: 'costs',
    label: 'Κόστος',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    )
  },
  {
    view: 'alerts',
    label: 'Ειδοποιήσεις',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    showBadge: true
  }
];

export default function Sidebar() {
  const { currentView, setCurrentView, checkLaborLawCompliance, exportToErgani } = useStore();

  const alerts = checkLaborLawCompliance();
  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;

  return (
    <nav className="w-60 bg-dark-card border-r border-dark-border flex flex-col fixed h-screen">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold text-primary">ShiftFlow</h1>
        <span className="text-xs text-text-secondary">Διαχείριση Προσωπικού</span>
      </div>

      {/* Navigation */}
      <ul className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <li
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all relative
              ${currentView === item.view
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
              }`}
          >
            {item.icon}
            {item.label}
            {item.showBadge && criticalCount > 0 && (
              <span className="absolute right-3 bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                {criticalCount}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-4 border-t border-dark-border">
        <Button variant="export" onClick={exportToErgani}>
          Εξαγωγή ΕΡΓΑΝΗ
        </Button>
      </div>
    </nav>
  );
}
