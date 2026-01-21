import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'shiftflow.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    contract TEXT NOT NULL DEFAULT 'full',
    rate REAL NOT NULL,
    maxHours INTEGER NOT NULL DEFAULT 40,
    availability TEXT NOT NULL DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    date TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'waiter',
    notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
  CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employeeId);
`);

// Check if we need to seed demo data
const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get();

if (employeeCount.count === 0) {
  console.log('Seeding demo data...');

  const insertEmployee = db.prepare(`
    INSERT INTO employees (firstName, lastName, phone, email, contract, rate, maxHours, availability)
    VALUES (@firstName, @lastName, @phone, @email, @contract, @rate, @maxHours, @availability)
  `);

  const insertShift = db.prepare(`
    INSERT INTO shifts (employeeId, date, start, end, role, notes)
    VALUES (@employeeId, @date, @start, @end, @role, @notes)
  `);

  const seedData = db.transaction(() => {
    // Insert employees
    const maria = insertEmployee.run({
      firstName: 'Μαρία',
      lastName: 'Παπαδοπούλου',
      phone: '6971234567',
      email: 'maria@example.com',
      contract: 'full',
      rate: 7.50,
      maxHours: 40,
      availability: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri'])
    });

    const giorgos = insertEmployee.run({
      firstName: 'Γιώργος',
      lastName: 'Αντωνίου',
      phone: '6987654321',
      email: 'giorgos@example.com',
      contract: 'part',
      rate: 6.50,
      maxHours: 25,
      availability: JSON.stringify(['thu', 'fri', 'sat', 'sun'])
    });

    const eleni = insertEmployee.run({
      firstName: 'Ελένη',
      lastName: 'Κωστοπούλου',
      phone: '6945678901',
      email: 'eleni@example.com',
      contract: 'seasonal',
      rate: 7.00,
      maxHours: 40,
      availability: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    });

    const nikos = insertEmployee.run({
      firstName: 'Νίκος',
      lastName: 'Δημητρίου',
      phone: '6932145678',
      email: 'nikos@example.com',
      contract: 'full',
      rate: 8.00,
      maxHours: 40,
      availability: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
    });

    const sofia = insertEmployee.run({
      firstName: 'Σοφία',
      lastName: 'Γεωργίου',
      phone: '6958741236',
      email: 'sofia@example.com',
      contract: 'part',
      rate: 6.00,
      maxHours: 20,
      availability: JSON.stringify(['fri', 'sat', 'sun'])
    });

    const kostas = insertEmployee.run({
      firstName: 'Κώστας',
      lastName: 'Μαρκόπουλος',
      phone: '6912378456',
      email: 'kostas@example.com',
      contract: 'full',
      rate: 9.50,
      maxHours: 40,
      availability: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    });

    // Get current week start (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const formatDate = (d) => d.toISOString().split('T')[0];
    const getDayKey = (d) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];

    // Generate shifts for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const dayKey = getDayKey(date);

      // Maria - Mon-Fri mornings
      if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
        insertShift.run({
          employeeId: maria.lastInsertRowid,
          date: dateStr,
          start: '08:00',
          end: '16:00',
          role: 'cashier',
          notes: ''
        });
      }

      // Giorgos - Thu-Sun evenings
      if (['thu', 'fri', 'sat', 'sun'].includes(dayKey)) {
        insertShift.run({
          employeeId: giorgos.lastInsertRowid,
          date: dateStr,
          start: '17:00',
          end: '23:00',
          role: 'waiter',
          notes: ''
        });
      }

      // Eleni - Rotating shifts
      if (['mon', 'wed', 'fri'].includes(dayKey)) {
        insertShift.run({
          employeeId: eleni.lastInsertRowid,
          date: dateStr,
          start: '10:00',
          end: '18:00',
          role: 'barista',
          notes: ''
        });
      } else if (['tue', 'thu', 'sat'].includes(dayKey)) {
        insertShift.run({
          employeeId: eleni.lastInsertRowid,
          date: dateStr,
          start: '14:00',
          end: '22:00',
          role: 'barista',
          notes: ''
        });
      }

      // Nikos - Manager, Mon-Sat
      if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(dayKey)) {
        insertShift.run({
          employeeId: nikos.lastInsertRowid,
          date: dateStr,
          start: '09:00',
          end: '17:00',
          role: 'manager',
          notes: ''
        });
      }

      // Sofia - Weekends only
      if (['fri', 'sat', 'sun'].includes(dayKey)) {
        insertShift.run({
          employeeId: sofia.lastInsertRowid,
          date: dateStr,
          start: '18:00',
          end: '02:00',
          role: 'waiter',
          notes: ''
        });
      }

      // Kostas - Kitchen
      if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
        insertShift.run({
          employeeId: kostas.lastInsertRowid,
          date: dateStr,
          start: '11:00',
          end: '19:00',
          role: 'kitchen',
          notes: ''
        });
      } else if (['sat', 'sun'].includes(dayKey)) {
        insertShift.run({
          employeeId: kostas.lastInsertRowid,
          date: dateStr,
          start: '10:00',
          end: '20:00',
          role: 'kitchen',
          notes: 'Σαββατοκύριακο - πολλή δουλειά'
        });
      }
    }
  });

  seedData();
  console.log('Demo data seeded successfully');
}

export default db;
