'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/components/StoreProvider';
import { formatDate, getDayName, getDayKey, calculateShiftHours } from '@/lib/helpers';
import Avatar from '@/components/ui/Avatar';
import ShiftBlock from './ShiftBlock';
import ShiftModal from './ShiftModal';

export default function ScheduleGrid() {
  const { employees, shifts, currentWeekStart, getEmployeeShifts, updateShift } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [existingShiftsForDay, setExistingShiftsForDay] = useState([]);
  const [draggedShiftId, setDraggedShiftId] = useState(null);

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const today = formatDate(new Date());

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    weekDays.push(date);
  }

  const handleCellClick = (date, employeeId, dayShifts) => {
    setSelectedShift(null);
    setSelectedDate(date);
    setSelectedEmployeeId(employeeId);
    setExistingShiftsForDay(dayShifts);
    setModalOpen(true);
  };

  const handleAddClick = (e, date, employeeId, dayShifts) => {
    e.stopPropagation();
    handleCellClick(date, employeeId, dayShifts);
  };

  const handleShiftClick = (shift) => {
    // Get other shifts for the same day (excluding the one being edited)
    const dayShifts = shifts.filter(
      s => s.employeeId === shift.employeeId && s.date === shift.date && s.id !== shift.id
    );
    setSelectedShift(shift);
    setSelectedDate(null);
    setSelectedEmployeeId(null);
    setExistingShiftsForDay(dayShifts);
    setModalOpen(true);
  };

  const handleDragStart = useCallback((e, shiftId) => {
    setDraggedShiftId(shiftId);
    e.target.classList.add('shift-block-dragging');
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('shift-block-dragging');
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.add('cell-drag-over');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove('cell-drag-over');
  }, []);

  const handleDrop = useCallback((e, date, employeeId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('cell-drag-over');

    if (draggedShiftId) {
      updateShift(draggedShiftId, {
        date,
        employeeId
      });
      setDraggedShiftId(null);
    }
  }, [draggedShiftId, updateShift]);

  if (employees.length === 0) {
    return (
      <div className="schedule-grid">
        <div className="col-span-8 text-center py-16 text-text-secondary bg-dark-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-16 h-16 mx-auto mb-4 opacity-50">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 className="text-text-primary mb-2">Δεν υπάρχει προσωπικό</h3>
          <p>Προσθέστε υπαλλήλους για να ξεκινήσετε</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="schedule-grid">
        {/* Empty header cell */}
        <div className="bg-dark-card p-4"></div>

        {/* Day headers */}
        {weekDays.map((date) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`bg-dark-card p-4 text-center font-medium text-sm ${isToday ? 'bg-primary' : ''}`}
            >
              {getDayName(date)}
              <small className={`block text-xs mt-0.5 font-normal ${isToday ? 'text-white/80' : 'text-text-secondary'}`}>
                {date.getDate()}
              </small>
            </div>
          );
        })}

        {/* Employee rows */}
        {employees.map((employee) => {
          const empShifts = getEmployeeShifts(employee.id, currentWeekStart, weekEnd);
          const employeeHours = empShifts.reduce((sum, shift) => {
            return sum + calculateShiftHours(shift.start, shift.end);
          }, 0);

          return (
            <>
              {/* Employee header */}
              <div key={`header-${employee.id}`} className="bg-dark-card p-3 flex items-center gap-2.5 min-h-[80px]">
                <Avatar firstName={employee.firstName} lastName={employee.lastName} />
                <div className="overflow-hidden">
                  <div className="font-medium text-sm truncate">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {employeeHours.toFixed(1)}ω / {employee.maxHours}ω
                  </div>
                </div>
              </div>

              {/* Day cells */}
              {weekDays.map((date) => {
                const dateStr = formatDate(date);
                const dayKey = getDayKey(date);
                const isAvailable = employee.availability.includes(dayKey);
                const dayShifts = shifts.filter(
                  s => s.employeeId === employee.id && s.date === dateStr
                );
                const hasMultipleShifts = dayShifts.length > 1;

                return (
                  <div
                    key={`${employee.id}-${dateStr}`}
                    className={`min-h-[80px] p-1 cursor-pointer transition-colors relative group ${
                      isAvailable
                        ? 'bg-dark-bg hover:bg-dark-hover'
                        : 'schedule-cell-unavailable'
                    }`}
                    onClick={() => isAvailable && dayShifts.length === 0 && handleCellClick(dateStr, employee.id, dayShifts)}
                    onDragOver={isAvailable ? handleDragOver : undefined}
                    onDragLeave={isAvailable ? handleDragLeave : undefined}
                    onDrop={isAvailable ? (e) => handleDrop(e, dateStr, employee.id) : undefined}
                  >
                    {dayShifts.map((shift) => (
                      <ShiftBlock
                        key={shift.id}
                        shift={shift}
                        onClick={handleShiftClick}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        compact={hasMultipleShifts}
                      />
                    ))}

                    {/* Add shift button - shows on hover when shifts exist */}
                    {isAvailable && dayShifts.length > 0 && (
                      <button
                        onClick={(e) => handleAddClick(e, dateStr, employee.id, dayShifts)}
                        className="absolute bottom-1 right-1 w-5 h-5 bg-primary/80 hover:bg-primary rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Προσθήκη βάρδιας"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          );
        })}
      </div>

      <ShiftModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        shift={selectedShift}
        date={selectedDate}
        employeeId={selectedEmployeeId}
        existingShifts={existingShiftsForDay}
      />
    </>
  );
}
