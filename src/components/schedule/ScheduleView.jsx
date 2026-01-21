import { useStore } from '../../hooks/useStore';
import { formatDateGreek } from '../../utils/helpers';
import { Button, IconButton } from '../ui/Button';
import ScheduleGrid from './ScheduleGrid';

export default function ScheduleView() {
  const {
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    getWeekStats
  } = useStore();

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { totalHours, totalCost } = getWeekStats();

  return (
    <div>
      <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <h2 className="text-2xl font-semibold">Εβδομαδιαίο Πρόγραμμα</h2>
          <div className="flex items-center gap-3">
            <IconButton onClick={goToPreviousWeek}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </IconButton>
            <span className="min-w-[160px] text-center font-medium">
              {formatDateGreek(currentWeekStart)} - {formatDateGreek(weekEnd)} {weekEnd.getFullYear()}
            </span>
            <IconButton onClick={goToNextWeek}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </IconButton>
            <Button variant="secondary" onClick={goToToday}>
              Σήμερα
            </Button>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <span className="block text-xl font-semibold text-primary">{totalHours.toFixed(1)}</span>
            <span className="text-xs text-text-secondary">Ώρες</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-semibold text-primary">€{totalCost.toFixed(0)}</span>
            <span className="text-xs text-text-secondary">Κόστος</span>
          </div>
        </div>
      </header>

      <ScheduleGrid />
    </div>
  );
}
