import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const EMPLOYEES_FILE = join(DATA_DIR, 'employees.json');
const SHIFTS_FILE = join(DATA_DIR, 'shifts.json');

let nextEmployeeId = 1;
let nextShiftId = 1;

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData(file, defaultValue) {
  try {
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error loading ${file}:`, e);
  }
  return defaultValue;
}

function saveData(file, data) {
  ensureDataDir();
  writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize with demo data if needed
function initializeData() {
  ensureDataDir();

  let employees = loadData(EMPLOYEES_FILE, null);
  let shifts = loadData(SHIFTS_FILE, null);

  if (!employees) {
    console.log('Seeding demo data...');
    employees = seedEmployees();
    shifts = seedShifts(employees);
    saveData(EMPLOYEES_FILE, employees);
    saveData(SHIFTS_FILE, shifts);
    console.log('Demo data seeded successfully');
  }

  // Update next IDs
  if (employees.length > 0) {
    nextEmployeeId = Math.max(...employees.map(e => parseInt(e.id))) + 1;
  }
  if (shifts.length > 0) {
    nextShiftId = Math.max(...shifts.map(s => parseInt(s.id))) + 1;
  }
}

function seedEmployees() {
  return [
    { id: '1', firstName: 'Μαρία', lastName: 'Παπαδοπούλου', phone: '6971234567', email: 'maria@example.com', contract: 'full', rate: 7.50, maxHours: 40, availability: ['mon', 'tue', 'wed', 'thu', 'fri'], createdAt: new Date().toISOString() },
    { id: '2', firstName: 'Γιώργος', lastName: 'Αντωνίου', phone: '6987654321', email: 'giorgos@example.com', contract: 'part', rate: 6.50, maxHours: 25, availability: ['thu', 'fri', 'sat', 'sun'], createdAt: new Date().toISOString() },
    { id: '3', firstName: 'Ελένη', lastName: 'Κωστοπούλου', phone: '6945678901', email: 'eleni@example.com', contract: 'seasonal', rate: 7.00, maxHours: 40, availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], createdAt: new Date().toISOString() },
    { id: '4', firstName: 'Νίκος', lastName: 'Δημητρίου', phone: '6932145678', email: 'nikos@example.com', contract: 'full', rate: 8.00, maxHours: 40, availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], createdAt: new Date().toISOString() },
    { id: '5', firstName: 'Σοφία', lastName: 'Γεωργίου', phone: '6958741236', email: 'sofia@example.com', contract: 'part', rate: 6.00, maxHours: 20, availability: ['fri', 'sat', 'sun'], createdAt: new Date().toISOString() },
    { id: '6', firstName: 'Κώστας', lastName: 'Μαρκόπουλος', phone: '6912378456', email: 'kostas@example.com', contract: 'full', rate: 9.50, maxHours: 40, availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], createdAt: new Date().toISOString() }
  ];
}

function seedShifts(employees) {
  const shifts = [];
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const getDayKey = (d) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];

  let shiftId = 1;
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);
    const dayKey = getDayKey(date);

    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '1', date: dateStr, start: '08:00', end: '16:00', role: 'cashier', notes: '', createdAt: new Date().toISOString() });
    }
    if (['thu', 'fri', 'sat', 'sun'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '2', date: dateStr, start: '17:00', end: '23:00', role: 'waiter', notes: '', createdAt: new Date().toISOString() });
    }
    if (['mon', 'wed', 'fri'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '3', date: dateStr, start: '10:00', end: '18:00', role: 'barista', notes: '', createdAt: new Date().toISOString() });
    } else if (['tue', 'thu', 'sat'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '3', date: dateStr, start: '14:00', end: '22:00', role: 'barista', notes: '', createdAt: new Date().toISOString() });
    }
    if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '4', date: dateStr, start: '09:00', end: '17:00', role: 'manager', notes: '', createdAt: new Date().toISOString() });
    }
    if (['fri', 'sat', 'sun'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '5', date: dateStr, start: '18:00', end: '02:00', role: 'waiter', notes: '', createdAt: new Date().toISOString() });
    }
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '6', date: dateStr, start: '11:00', end: '19:00', role: 'kitchen', notes: '', createdAt: new Date().toISOString() });
    } else if (['sat', 'sun'].includes(dayKey)) {
      shifts.push({ id: String(shiftId++), employeeId: '6', date: dateStr, start: '10:00', end: '20:00', role: 'kitchen', notes: 'Σαββατοκύριακο - πολλή δουλειά', createdAt: new Date().toISOString() });
    }
  }
  return shifts;
}

// Initialize on first import
initializeData();

// Database operations
export const db = {
  employees: {
    getAll() {
      return loadData(EMPLOYEES_FILE, []).sort((a, b) =>
        a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
      );
    },
    getById(id) {
      const employees = loadData(EMPLOYEES_FILE, []);
      return employees.find(e => e.id === String(id));
    },
    create(data) {
      const employees = loadData(EMPLOYEES_FILE, []);
      const newEmployee = {
        id: String(nextEmployeeId++),
        ...data,
        availability: data.availability || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        createdAt: new Date().toISOString()
      };
      employees.push(newEmployee);
      saveData(EMPLOYEES_FILE, employees);
      return newEmployee;
    },
    update(id, data) {
      const employees = loadData(EMPLOYEES_FILE, []);
      const index = employees.findIndex(e => e.id === String(id));
      if (index === -1) return null;
      employees[index] = { ...employees[index], ...data };
      saveData(EMPLOYEES_FILE, employees);
      return employees[index];
    },
    delete(id) {
      const employees = loadData(EMPLOYEES_FILE, []);
      const index = employees.findIndex(e => e.id === String(id));
      if (index === -1) return false;
      employees.splice(index, 1);
      saveData(EMPLOYEES_FILE, employees);
      // Also delete employee's shifts
      const shifts = loadData(SHIFTS_FILE, []);
      const filteredShifts = shifts.filter(s => s.employeeId !== String(id));
      saveData(SHIFTS_FILE, filteredShifts);
      return true;
    }
  },
  shifts: {
    getAll(startDate, endDate) {
      let shifts = loadData(SHIFTS_FILE, []);
      if (startDate && endDate) {
        shifts = shifts.filter(s => s.date >= startDate && s.date <= endDate);
      } else if (startDate) {
        shifts = shifts.filter(s => s.date >= startDate);
      } else if (endDate) {
        shifts = shifts.filter(s => s.date <= endDate);
      }
      return shifts.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
    },
    getById(id) {
      const shifts = loadData(SHIFTS_FILE, []);
      return shifts.find(s => s.id === String(id));
    },
    create(data) {
      const shifts = loadData(SHIFTS_FILE, []);
      const newShift = {
        id: String(nextShiftId++),
        ...data,
        role: data.role || 'waiter',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      shifts.push(newShift);
      saveData(SHIFTS_FILE, shifts);
      return newShift;
    },
    update(id, data) {
      const shifts = loadData(SHIFTS_FILE, []);
      const index = shifts.findIndex(s => s.id === String(id));
      if (index === -1) return null;
      shifts[index] = { ...shifts[index], ...data };
      saveData(SHIFTS_FILE, shifts);
      return shifts[index];
    },
    delete(id) {
      const shifts = loadData(SHIFTS_FILE, []);
      const index = shifts.findIndex(s => s.id === String(id));
      if (index === -1) return false;
      shifts.splice(index, 1);
      saveData(SHIFTS_FILE, shifts);
      return true;
    }
  }
};
