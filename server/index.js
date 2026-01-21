import express from 'express';
import cors from 'cors';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to parse availability JSON
const parseEmployee = (emp) => ({
  ...emp,
  id: String(emp.id),
  availability: JSON.parse(emp.availability)
});

const parseShift = (shift) => ({
  ...shift,
  id: String(shift.id),
  employeeId: String(shift.employeeId)
});

// ==================== EMPLOYEES ====================

// Get all employees
app.get('/api/employees', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees ORDER BY lastName, firstName').all();
    res.json(employees.map(parseEmployee));
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(parseEmployee(employee));
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
app.post('/api/employees', (req, res) => {
  try {
    const { firstName, lastName, phone, email, contract, rate, maxHours, availability } = req.body;

    const result = db.prepare(`
      INSERT INTO employees (firstName, lastName, phone, email, contract, rate, maxHours, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      firstName,
      lastName,
      phone || '',
      email || '',
      contract || 'full',
      rate,
      maxHours || 40,
      JSON.stringify(availability || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    );

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseEmployee(newEmployee));
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  try {
    const { firstName, lastName, phone, email, contract, rate, maxHours, availability } = req.body;

    const result = db.prepare(`
      UPDATE employees
      SET firstName = ?, lastName = ?, phone = ?, email = ?, contract = ?, rate = ?, maxHours = ?, availability = ?
      WHERE id = ?
    `).run(
      firstName,
      lastName,
      phone || '',
      email || '',
      contract || 'full',
      rate,
      maxHours || 40,
      JSON.stringify(availability || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(parseEmployee(updatedEmployee));
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (also deletes associated shifts due to CASCADE)
app.delete('/api/employees/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// ==================== SHIFTS ====================

// Get all shifts (optionally filtered by date range)
app.get('/api/shifts', (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM shifts';
    const params = [];

    if (startDate && endDate) {
      query += ' WHERE date >= ? AND date <= ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE date >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' WHERE date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date, start';

    const shifts = db.prepare(query).all(...params);
    res.json(shifts.map(parseShift));
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

// Get shifts for a specific employee
app.get('/api/employees/:id/shifts', (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM shifts WHERE employeeId = ?';
    const params = [req.params.id];

    if (startDate && endDate) {
      query += ' AND date >= ? AND date <= ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date, start';

    const shifts = db.prepare(query).all(...params);
    res.json(shifts.map(parseShift));
  } catch (error) {
    console.error('Error fetching employee shifts:', error);
    res.status(500).json({ error: 'Failed to fetch employee shifts' });
  }
});

// Get single shift
app.get('/api/shifts/:id', (req, res) => {
  try {
    const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.json(parseShift(shift));
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
});

// Create shift
app.post('/api/shifts', (req, res) => {
  try {
    const { employeeId, date, start, end, role, notes } = req.body;

    const result = db.prepare(`
      INSERT INTO shifts (employeeId, date, start, end, role, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      employeeId,
      date,
      start,
      end,
      role || 'waiter',
      notes || ''
    );

    const newShift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseShift(newShift));
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

// Update shift
app.put('/api/shifts/:id', (req, res) => {
  try {
    const { employeeId, date, start, end, role, notes } = req.body;

    const result = db.prepare(`
      UPDATE shifts
      SET employeeId = ?, date = ?, start = ?, end = ?, role = ?, notes = ?
      WHERE id = ?
    `).run(
      employeeId,
      date,
      start,
      end,
      role || 'waiter',
      notes || '',
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const updatedShift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(req.params.id);
    res.json(parseShift(updatedShift));
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

// Delete shift
app.delete('/api/shifts/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM shifts WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
