import { useStore } from '../../hooks/useStore';

export default function AlertsView() {
  const { checkLaborLawCompliance } = useStore();

  const alerts = checkLaborLawCompliance();

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-l-danger',
          iconColor: 'text-danger'
        };
      case 'warning':
        return {
          border: 'border-l-warning',
          iconColor: 'text-warning'
        };
      case 'info':
      default:
        return {
          border: 'border-l-primary',
          iconColor: 'text-primary'
        };
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Ειδοποιήσεις Εργατικής Νομοθεσίας</h2>
      </header>

      {alerts.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-16 h-16 mx-auto mb-4 text-success">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3 className="text-text-primary mb-2">Όλα καλά!</h3>
          <p>Δεν υπάρχουν προειδοποιήσεις εργατικής νομοθεσίας αυτή την εβδομάδα.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert, index) => {
            const styles = getAlertStyles(alert.type);

            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 bg-dark-card rounded-xl border-l-4 ${styles.border}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`w-6 h-6 flex-shrink-0 ${styles.iconColor}`}
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div>
                  <h4 className="font-semibold mb-1">{alert.title}</h4>
                  <p className="text-text-secondary text-sm">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
