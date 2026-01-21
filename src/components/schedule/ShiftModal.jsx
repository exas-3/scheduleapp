import { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';

// Minimum break between shifts in hours (Greek labor law)
const MIN_BREAK_HOURS = 0.5; // 30 minutes minimum between split shifts

// Convert time string to minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to time string
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Check if two time ranges overlap
const shiftsOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  let e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  let e2 = timeToMinutes(end2);

  // Handle overnight shifts
  if (e1 <= s1) e1 += 24 * 60;
  if (e2 <= s2) e2 += 24 * 60;

  return s1 < e2 && s2 < e1;
};

// Calculate break between two shifts in hours
const calculateBreak = (end1, start2) => {
  let e1 = timeToMinutes(end1);
  let s2 = timeToMinutes(start2);

  // If start2 is before end1, it means start2 is the next shift (later in day)
  if (s2 < e1) {
    // Check if it's an overnight scenario or just wrong order
    if (e1 - s2 > 12 * 60) {
      // Likely start2 is actually later (overnight shift ended, new shift starts in afternoon)
      s2 += 24 * 60;
    }
  }

  return (s2 - e1) / 60;
};

export default function ShiftModal({ isOpen, onClose, shift, date, employeeId, existingShifts = [] }) {
  const { employees, addShift, updateShift, deleteShift } = useStore();

  const [formData, setFormData] = useState({
    employeeId: '',
    start: '09:00',
    end: '17:00',
    role: 'waiter',
    notes: ''
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (shift) {
      setFormData({
        employeeId: shift.employeeId,
        start: shift.start,
        end: shift.end,
        role: shift.role,
        notes: shift.notes || ''
      });
    } else {
      // For split shifts, suggest a time after existing shifts
      let suggestedStart = '09:00';
      let suggestedEnd = '17:00';

      if (existingShifts.length > 0) {
        // Find the latest ending shift
        const sortedShifts = [...existingShifts].sort((a, b) =>
          timeToMinutes(b.end) - timeToMinutes(a.end)
        );
        const lastShift = sortedShifts[0];
        const lastEndMinutes = timeToMinutes(lastShift.end);

        // Suggest start 1 hour after last shift ends
        const suggestedStartMinutes = lastEndMinutes + 60;
        if (suggestedStartMinutes < 24 * 60) {
          suggestedStart = minutesToTime(suggestedStartMinutes);
          suggestedEnd = minutesToTime(Math.min(suggestedStartMinutes + 4 * 60, 23 * 60 + 59));
        }
      }

      setFormData({
        employeeId: employeeId || '',
        start: suggestedStart,
        end: suggestedEnd,
        role: 'waiter',
        notes: ''
      });
    }
    setValidationError('');
  }, [shift, employeeId, isOpen, existingShifts]);

  // Validate the shift against existing shifts
  const validation = useMemo(() => {
    const errors = [];
    const warnings = [];

    if (!formData.start || !formData.end) {
      return { errors, warnings, isValid: true };
    }

    // Check for overlaps with existing shifts
    for (const existing of existingShifts) {
      if (shiftsOverlap(formData.start, formData.end, existing.start, existing.end)) {
        errors.push(`Επικάλυψη με υπάρχουσα βάρδια (${existing.start} - ${existing.end})`);
      }
    }

    // Check minimum break between shifts
    for (const existing of existingShifts) {
      // Check if new shift is after existing
      if (timeToMinutes(formData.start) > timeToMinutes(existing.end)) {
        const breakHours = calculateBreak(existing.end, formData.start);
        if (breakHours > 0 && breakHours < MIN_BREAK_HOURS) {
          warnings.push(`Μόνο ${Math.round(breakHours * 60)} λεπτά διάλειμμα μετά τη βάρδια ${existing.start}-${existing.end}. Συνιστάται τουλάχιστον 30 λεπτά.`);
        }
      }
      // Check if new shift is before existing
      if (timeToMinutes(formData.end) < timeToMinutes(existing.start)) {
        const breakHours = calculateBreak(formData.end, existing.start);
        if (breakHours > 0 && breakHours < MIN_BREAK_HOURS) {
          warnings.push(`Μόνο ${Math.round(breakHours * 60)} λεπτά διάλειμμα πριν τη βάρδια ${existing.start}-${existing.end}. Συνιστάται τουλάχιστον 30 λεπτά.`);
        }
      }
    }

    return {
      errors,
      warnings,
      isValid: errors.length === 0
    };
  }, [formData.start, formData.end, existingShifts]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validation.isValid) {
      setValidationError(validation.errors.join('\n'));
      return;
    }

    const shiftData = {
      ...formData,
      date: shift?.date || date
    };

    if (shift) {
      updateShift(shift.id, shiftData);
    } else {
      addShift(shiftData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (shift && confirm('Διαγραφή αυτής της βάρδιας;')) {
      deleteShift(shift.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shift ? 'Επεξεργασία Βάρδιας' : 'Νέα Βάρδια'}
    >
      <form onSubmit={handleSubmit} className="p-6">
        {/* Show existing shifts info for split shift context */}
        {existingShifts.length > 0 && (
          <div className="mb-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <div className="text-xs text-text-secondary mb-1">Υπάρχουσες βάρδιες αυτή την ημέρα:</div>
            <div className="flex flex-wrap gap-2">
              {existingShifts.map((s, i) => (
                <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {s.start} - {s.end}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Υπάλληλος</label>
          <select
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            required
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">Επιλέξτε υπάλληλο</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Έναρξη</label>
            <input
              type="time"
              value={formData.start}
              onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              required
              className={`w-full p-3 bg-dark-bg border rounded-lg text-text-primary focus:outline-none focus:border-primary ${
                validation.errors.length > 0 ? 'border-danger' : 'border-dark-border'
              }`}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Λήξη</label>
            <input
              type="time"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              required
              className={`w-full p-3 bg-dark-bg border rounded-lg text-text-primary focus:outline-none focus:border-primary ${
                validation.errors.length > 0 ? 'border-danger' : 'border-dark-border'
              }`}
            />
          </div>
        </div>

        {/* Validation errors */}
        {validation.errors.length > 0 && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-danger flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div className="text-sm text-danger">
                {validation.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation warnings */}
        {validation.warnings.length > 0 && validation.errors.length === 0 && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div className="text-sm text-warning">
                {validation.warnings.map((warn, i) => (
                  <div key={i}>{warn}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Θέση</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="waiter">Σερβιτόρος</option>
            <option value="barista">Barista</option>
            <option value="kitchen">Κουζίνα</option>
            <option value="cashier">Ταμείο</option>
            <option value="manager">Υπεύθυνος</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Σημειώσεις</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex justify-between gap-3 mt-6">
          {shift && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Διαγραφή
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className={!shift ? 'ml-auto' : ''}
            disabled={!validation.isValid}
          >
            Αποθήκευση
          </Button>
        </div>
      </form>
    </Modal>
  );
}
