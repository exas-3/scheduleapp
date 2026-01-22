'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWeekStart, formatDate, calculateShiftHours } from '@/lib/helpers';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [currentView, setCurrentView] = useState('schedule');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesRes, shiftsRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/shifts')
        ]);

        if (!employeesRes.ok || !shiftsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const employeesData = await employeesRes.json();
        const shiftsData = await shiftsRes.json();

        setEmployees(employeesData);
        setShifts(shiftsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Employee CRUD operations
  const addEmployee = useCallback(async (employeeData) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });

      if (!res.ok) throw new Error('Failed to create employee');

      const newEmployee = await res.json();
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      console.error('Error adding employee:', err);
      throw err;
    }
  }, []);

  const updateEmployee = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Failed to update employee');

      const updatedEmployee = await res.json();
      setEmployees(prev =>
        prev.map(emp => emp.id === id ? updatedEmployee : emp)
      );
      return updatedEmployee;
    } catch (err) {
      console.error('Error updating employee:', err);
      throw err;
    }
  }, []);

  const deleteEmployee = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete employee');

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setShifts(prev => prev.filter(shift => shift.employeeId !== id));
    } catch (err) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  }, []);

  // Shift CRUD operations
  const addShift = useCallback(async (shiftData) => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });

      if (!res.ok) throw new Error('Failed to create shift');

      const newShift = await res.json();
      setShifts(prev => [...prev, newShift]);
      return newShift;
    } catch (err) {
      console.error('Error adding shift:', err);
      throw err;
    }
  }, []);

  const updateShift = useCallback(async (id, data) => {
    try {
      const currentShift = shifts.find(s => s.id === id);
      const updateData = { ...currentShift, ...data };

      const res = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to update shift');

      const updatedShift = await res.json();
      setShifts(prev =>
        prev.map(shift => shift.id === id ? updatedShift : shift)
      );
      return updatedShift;
    } catch (err) {
      console.error('Error updating shift:', err);
      throw err;
    }
  }, [shifts]);

  const deleteShift = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete shift');

      setShifts(prev => prev.filter(shift => shift.id !== id));
    } catch (err) {
      console.error('Error deleting shift:', err);
      throw err;
    }
  }, []);

  // Query helpers
  const getShiftsForWeek = useCallback((startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= start && shiftDate < end;
    });
  }, [shifts]);

  const getEmployeeShifts = useCallback((employeeId, startDate, endDate) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shift.employeeId === employeeId &&
             shiftDate >= new Date(startDate) &&
             shiftDate <= new Date(endDate);
    });
  }, [shifts]);

  const getEmployeeById = useCallback((id) => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  // Calculate week stats
  const getWeekStats = useCallback(() => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let totalHours = 0;
    let totalCost = 0;

    employees.forEach(emp => {
      const empShifts = getEmployeeShifts(emp.id, currentWeekStart, weekEnd);
      empShifts.forEach(shift => {
        const hours = calculateShiftHours(shift.start, shift.end);
        totalHours += hours;
        totalCost += hours * emp.rate;
      });
    });

    return { totalHours, totalCost };
  }, [currentWeekStart, employees, getEmployeeShifts]);

  // Labor law compliance check
  const checkLaborLawCompliance = useCallback(() => {
    const alerts = [];
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    employees.forEach(emp => {
      const empShifts = getEmployeeShifts(emp.id, currentWeekStart, weekEnd);

      const weeklyHours = empShifts.reduce((sum, shift) => {
        return sum + calculateShiftHours(shift.start, shift.end);
      }, 0);

      if (weeklyHours > emp.maxHours) {
        alerts.push({
          type: 'critical',
          title: `Υπέρβαση ωρών: ${emp.firstName} ${emp.lastName}`,
          message: `${weeklyHours.toFixed(1)} ώρες (όριο: ${emp.maxHours}). Απαιτείται έγκριση υπερωριών.`
        });
      }

      if (weeklyHours > 48) {
        alerts.push({
          type: 'critical',
          title: `Υπέρβαση νομικού ορίου: ${emp.firstName} ${emp.lastName}`,
          message: `${weeklyHours.toFixed(1)} ώρες υπερβαίνουν το μέγιστο 48ω/εβδομάδα (ΕΕ Οδηγία).`
        });
      }

      const sortedShifts = empShifts
        .map(s => ({ ...s, dateObj: new Date(s.date + 'T' + s.end) }))
        .sort((a, b) => a.dateObj - b.dateObj);

      for (let i = 1; i < sortedShifts.length; i++) {
        const prevEnd = new Date(sortedShifts[i - 1].date + 'T' + sortedShifts[i - 1].end);
        const currStart = new Date(sortedShifts[i].date + 'T' + sortedShifts[i].start);
        const restHours = (currStart - prevEnd) / (1000 * 60 * 60);

        if (restHours < 11 && restHours > 0) {
          alerts.push({
            type: 'warning',
            title: `Ανεπαρκής ανάπαυση: ${emp.firstName} ${emp.lastName}`,
            message: `Μόνο ${restHours.toFixed(1)} ώρες μεταξύ βαρδιών. Ελάχιστο: 11 ώρες.`
          });
        }
      }

      empShifts.forEach(shift => {
        const hours = calculateShiftHours(shift.start, shift.end);
        if (hours > 10) {
          const date = new Date(shift.date);
          const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
          const dateStr = `${date.getDate()} ${months[date.getMonth()]}`;
          alerts.push({
            type: 'warning',
            title: `Μεγάλη βάρδια: ${emp.firstName} ${emp.lastName}`,
            message: `${hours.toFixed(1)} ώρες στις ${dateStr}. Μέγιστο συνιστώμενο: 10 ώρες.`
          });
        }
      });

      empShifts.forEach(shift => {
        const date = new Date(shift.date);
        if (date.getDay() === 0) {
          const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
          const dateStr = `${date.getDate()} ${months[date.getMonth()]}`;
          alerts.push({
            type: 'info',
            title: `Εργασία Κυριακής: ${emp.firstName} ${emp.lastName}`,
            message: `Προσαύξηση 75% για εργασία Κυριακή (${dateStr}).`
          });
        }
      });
    });

    return alerts;
  }, [currentWeekStart, employees, getEmployeeShifts]);

  // ERGANI export
  const exportToErgani = useCallback(() => {
    const weekShifts = getShiftsForWeek(currentWeekStart);

    if (weekShifts.length === 0) {
      alert('Δεν υπάρχουν βάρδιες για εξαγωγή.');
      return;
    }

    let csv = 'ΑΦΜ,Επώνυμο,Όνομα,Ημερομηνία,Ώρα Έναρξης,Ώρα Λήξης,Τύπος\n';

    weekShifts.forEach(shift => {
      const emp = employees.find(e => e.id === shift.employeeId);
      if (emp) {
        csv += `"","${emp.lastName}","${emp.firstName}","${shift.date}","${shift.start}","${shift.end}","Κανονική"\n`;
      }
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ergani_${formatDate(currentWeekStart)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentWeekStart, employees, getShiftsForWeek]);

  const value = {
    employees,
    shifts,
    loading,
    error,
    currentWeekStart,
    currentView,
    setCurrentView,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addShift,
    updateShift,
    deleteShift,
    getShiftsForWeek,
    getEmployeeShifts,
    getEmployeeById,
    getWeekStats,
    checkLaborLawCompliance,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    exportToErgani
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
