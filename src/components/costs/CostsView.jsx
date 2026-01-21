import { useStore } from '../../hooks/useStore';
import { calculateShiftHours } from '../../utils/helpers';
import Avatar from '../ui/Avatar';

export default function CostsView() {
  const { employees, currentWeekStart, getShiftsForWeek } = useStore();

  const weekShifts = getShiftsForWeek(currentWeekStart);

  let totalHours = 0;
  let totalCost = 0;
  let overtimeCost = 0;
  const employeeCosts = [];

  employees.forEach(emp => {
    const empShifts = weekShifts.filter(s => s.employeeId === emp.id);
    let hours = 0;

    empShifts.forEach(shift => {
      hours += calculateShiftHours(shift.start, shift.end);
    });

    const regularHours = Math.min(hours, emp.maxHours);
    const overtimeHours = Math.max(0, hours - emp.maxHours);
    const regularCost = regularHours * emp.rate;
    const empOvertimeCost = overtimeHours * emp.rate * 1.5;

    employeeCosts.push({
      employee: emp,
      hours: hours,
      regularCost: regularCost,
      overtimeCost: empOvertimeCost,
      totalCost: regularCost + empOvertimeCost
    });

    totalHours += hours;
    totalCost += regularCost + empOvertimeCost;
    overtimeCost += empOvertimeCost;
  });

  const avgHourly = totalHours > 0 ? totalCost / totalHours : 0;

  const sortedEmployeeCosts = employeeCosts.sort((a, b) => b.totalCost - a.totalCost);

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ανάλυση Κόστους</h2>
        <select className="p-2 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary">
          <option value="week">Αυτή η εβδομάδα</option>
          <option value="month">Αυτός ο μήνας</option>
        </select>
      </header>

      <div className="flex flex-col gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
            <h3 className="text-sm text-text-secondary font-medium mb-2">Συνολικό Κόστος</h3>
            <div className="text-3xl font-bold text-primary">€{totalCost.toFixed(2)}</div>
          </div>
          <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
            <h3 className="text-sm text-text-secondary font-medium mb-2">Συνολικές Ώρες</h3>
            <div className="text-3xl font-bold text-primary">{totalHours.toFixed(1)}</div>
          </div>
          <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
            <h3 className="text-sm text-text-secondary font-medium mb-2">Μέσο Κόστος/Ώρα</h3>
            <div className="text-3xl font-bold text-primary">€{avgHourly.toFixed(2)}</div>
          </div>
          <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
            <h3 className="text-sm text-text-secondary font-medium mb-2">Υπερωρίες</h3>
            <div className="text-3xl font-bold text-warning">€{overtimeCost.toFixed(2)}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-dark-card rounded-xl p-5 border border-dark-border">
          <h3 className="font-semibold mb-4">Κόστος ανά Υπάλληλο</h3>

          {sortedEmployeeCosts.length === 0 ? (
            <p className="text-text-secondary py-5">Δεν υπάρχουν δεδομένα</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedEmployeeCosts.map(data => (
                <div key={data.employee.id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                  <Avatar firstName={data.employee.firstName} lastName={data.employee.lastName} size="sm" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{data.employee.firstName} {data.employee.lastName}</div>
                    <div className="text-xs text-text-secondary">
                      {data.hours.toFixed(1)} ώρες {data.overtimeCost > 0 ? '(+υπερωρίες)' : ''}
                    </div>
                  </div>
                  <div className="font-semibold text-primary">€{data.totalCost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
