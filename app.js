// ShiftFlow - Staff Scheduling App

// ==================== DATA STORE ====================
const Store = {
  employees: JSON.parse(localStorage.getItem('shiftflow_employees')) || [],
  shifts: JSON.parse(localStorage.getItem('shiftflow_shifts')) || [],

  save() {
    localStorage.setItem('shiftflow_employees', JSON.stringify(this.employees));
    localStorage.setItem('shiftflow_shifts', JSON.stringify(this.shifts));
  },

  addEmployee(employee) {
    employee.id = Date.now().toString();
    this.employees.push(employee);
    this.save();
    return employee;
  },

  updateEmployee(id, data) {
    const index = this.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...data };
      this.save();
    }
  },

  deleteEmployee(id) {
    this.employees = this.employees.filter(e => e.id !== id);
    this.shifts = this.shifts.filter(s => s.employeeId !== id);
    this.save();
  },

  addShift(shift) {
    shift.id = Date.now().toString();
    this.shifts.push(shift);
    this.save();
    return shift;
  },

  updateShift(id, data) {
    const index = this.shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      this.shifts[index] = { ...this.shifts[index], ...data };
      this.save();
    }
  },

  deleteShift(id) {
    this.shifts = this.shifts.filter(s => s.id !== id);
    this.save();
  },

  getShiftsForWeek(startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return this.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= start && shiftDate < end;
    });
  },

  getEmployeeShifts(employeeId, startDate, endDate) {
    return this.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shift.employeeId === employeeId &&
             shiftDate >= new Date(startDate) &&
             shiftDate <= new Date(endDate);
    });
  }
};

// ==================== UTILITIES ====================
const Utils = {
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  formatDateGreek(date) {
    const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  },

  getDayName(date) {
    const days = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
    return days[date.getDay()];
  },

  getDayKey(date) {
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return keys[date.getDay()];
  },

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  getInitials(firstName, lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  },

  calculateShiftHours(start, end) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let hours = endH - startH + (endM - startM) / 60;
    if (hours < 0) hours += 24; // overnight shift
    return hours;
  },

  getRoleName(role) {
    const roles = {
      waiter: 'Σερβιτόρος',
      barista: 'Barista',
      kitchen: 'Κουζίνα',
      cashier: 'Ταμείο',
      manager: 'Υπεύθυνος'
    };
    return roles[role] || role;
  },

  getContractName(contract) {
    const contracts = {
      full: 'Πλήρης',
      part: 'Μερική',
      seasonal: 'Εποχιακή'
    };
    return contracts[contract] || contract;
  }
};

// ==================== STATE ====================
let currentWeekStart = Utils.getWeekStart(new Date());
let currentView = 'schedule';

// ==================== NAVIGATION ====================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    switchView(view);
  });
});

function switchView(view) {
  currentView = view;

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${view}`);
  });

  if (view === 'costs') renderCosts();
  if (view === 'alerts') renderAlerts();
}

// ==================== WEEK NAVIGATION ====================
document.getElementById('prev-week').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderSchedule();
});

document.getElementById('next-week').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderSchedule();
});

document.getElementById('today-btn').addEventListener('click', () => {
  currentWeekStart = Utils.getWeekStart(new Date());
  renderSchedule();
});

// ==================== SCHEDULE RENDERING ====================
function renderSchedule() {
  const grid = document.getElementById('schedule-grid');
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Update week display
  document.getElementById('current-week').textContent =
    `${Utils.formatDateGreek(currentWeekStart)} - ${Utils.formatDateGreek(weekEnd)} ${weekEnd.getFullYear()}`;

  // Build grid HTML
  let html = '<div class="schedule-header"></div>';

  // Day headers
  const today = Utils.formatDate(new Date());
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    const isToday = Utils.formatDate(date) === today;
    html += `
      <div class="schedule-header ${isToday ? 'today' : ''}">
        ${Utils.getDayName(date)}
        <small>${date.getDate()}</small>
      </div>
    `;
  }

  // Calculate week totals
  let weekHours = 0;
  let weekCost = 0;

  // Employee rows
  if (Store.employees.length === 0) {
    html += `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 60px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>Δεν υπάρχει προσωπικό</h3>
        <p>Προσθέστε υπαλλήλους για να ξεκινήσετε</p>
      </div>
    `;
  } else {
    Store.employees.forEach(employee => {
      // Calculate employee hours for this week
      const employeeShifts = Store.getEmployeeShifts(
        employee.id,
        currentWeekStart,
        weekEnd
      );
      const employeeHours = employeeShifts.reduce((sum, shift) => {
        return sum + Utils.calculateShiftHours(shift.start, shift.end);
      }, 0);
      const employeeCost = employeeHours * employee.rate;
      weekHours += employeeHours;
      weekCost += employeeCost;

      html += `
        <div class="employee-row-header">
          <div class="employee-avatar">${Utils.getInitials(employee.firstName, employee.lastName)}</div>
          <div class="employee-info">
            <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
            <div class="employee-hours">${employeeHours.toFixed(1)}ω / ${employee.maxHours}ω</div>
          </div>
        </div>
      `;

      // Day cells
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateStr = Utils.formatDate(date);
        const dayKey = Utils.getDayKey(date);

        const isAvailable = employee.availability.includes(dayKey);
        const dayShifts = Store.shifts.filter(
          s => s.employeeId === employee.id && s.date === dateStr
        );

        let cellClass = 'schedule-cell';
        if (!isAvailable) cellClass += ' unavailable';

        html += `<div class="${cellClass}" data-date="${dateStr}" data-employee="${employee.id}">`;

        dayShifts.forEach(shift => {
          html += `
            <div class="shift-block ${shift.role}" data-shift-id="${shift.id}" draggable="true">
              <div class="shift-time">${shift.start} - ${shift.end}</div>
              <div class="shift-role">${Utils.getRoleName(shift.role)}</div>
            </div>
          `;
        });

        html += '</div>';
      }
    });
  }

  grid.innerHTML = html;

  // Update stats
  document.getElementById('week-hours').textContent = weekHours.toFixed(1);
  document.getElementById('week-cost').textContent = '€' + weekCost.toFixed(0);

  // Add cell click handlers
  grid.querySelectorAll('.schedule-cell:not(.unavailable)').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.closest('.shift-block')) return;
      openShiftModal(null, cell.dataset.date, cell.dataset.employee);
    });
  });

  // Add shift click handlers
  grid.querySelectorAll('.shift-block').forEach(block => {
    block.addEventListener('click', (e) => {
      e.stopPropagation();
      const shift = Store.shifts.find(s => s.id === block.dataset.shiftId);
      if (shift) openShiftModal(shift);
    });

    // Drag and drop
    block.addEventListener('dragstart', handleDragStart);
    block.addEventListener('dragend', handleDragEnd);
  });

  // Add drop handlers to cells
  grid.querySelectorAll('.schedule-cell:not(.unavailable)').forEach(cell => {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('dragleave', handleDragLeave);
    cell.addEventListener('drop', handleDrop);
  });

  // Update alerts count
  updateAlertsCount();
}

// ==================== DRAG AND DROP ====================
let draggedShiftId = null;

function handleDragStart(e) {
  draggedShiftId = e.target.dataset.shiftId;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.schedule-cell').forEach(cell => {
    cell.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (!draggedShiftId) return;

  const newDate = e.currentTarget.dataset.date;
  const newEmployeeId = e.currentTarget.dataset.employee;

  Store.updateShift(draggedShiftId, {
    date: newDate,
    employeeId: newEmployeeId
  });

  draggedShiftId = null;
  renderSchedule();
}

// ==================== SHIFT MODAL ====================
const shiftModal = document.getElementById('shift-modal');
const shiftForm = document.getElementById('shift-form');

function openShiftModal(shift = null, date = null, employeeId = null) {
  document.getElementById('modal-title').textContent = shift ? 'Επεξεργασία Βάρδιας' : 'Νέα Βάρδια';
  document.getElementById('delete-shift').style.display = shift ? 'block' : 'none';

  // Populate employee dropdown
  const employeeSelect = document.getElementById('shift-employee');
  employeeSelect.innerHTML = '<option value="">Επιλέξτε υπάλληλο</option>';
  Store.employees.forEach(emp => {
    employeeSelect.innerHTML += `<option value="${emp.id}">${emp.firstName} ${emp.lastName}</option>`;
  });

  if (shift) {
    document.getElementById('shift-id').value = shift.id;
    document.getElementById('shift-date').value = shift.date;
    document.getElementById('shift-employee').value = shift.employeeId;
    document.getElementById('shift-start').value = shift.start;
    document.getElementById('shift-end').value = shift.end;
    document.getElementById('shift-role').value = shift.role;
    document.getElementById('shift-notes').value = shift.notes || '';
  } else {
    document.getElementById('shift-id').value = '';
    document.getElementById('shift-date').value = date;
    document.getElementById('shift-employee').value = employeeId || '';
    document.getElementById('shift-start').value = '09:00';
    document.getElementById('shift-end').value = '17:00';
    document.getElementById('shift-role').value = 'waiter';
    document.getElementById('shift-notes').value = '';
  }

  shiftModal.classList.add('active');
}

document.getElementById('close-modal').addEventListener('click', () => {
  shiftModal.classList.remove('active');
});

shiftForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const shiftData = {
    employeeId: document.getElementById('shift-employee').value,
    date: document.getElementById('shift-date').value,
    start: document.getElementById('shift-start').value,
    end: document.getElementById('shift-end').value,
    role: document.getElementById('shift-role').value,
    notes: document.getElementById('shift-notes').value
  };

  const shiftId = document.getElementById('shift-id').value;

  if (shiftId) {
    Store.updateShift(shiftId, shiftData);
  } else {
    Store.addShift(shiftData);
  }

  shiftModal.classList.remove('active');
  renderSchedule();
});

document.getElementById('delete-shift').addEventListener('click', () => {
  const shiftId = document.getElementById('shift-id').value;
  if (shiftId && confirm('Διαγραφή αυτής της βάρδιας;')) {
    Store.deleteShift(shiftId);
    shiftModal.classList.remove('active');
    renderSchedule();
  }
});

// ==================== EMPLOYEES VIEW ====================
function renderEmployees() {
  const grid = document.getElementById('employees-grid');

  if (Store.employees.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>Δεν υπάρχει προσωπικό</h3>
        <p>Κάντε κλικ στο "Νέος Υπάλληλος" για να ξεκινήσετε</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = Store.employees.map(emp => `
    <div class="employee-card" data-employee-id="${emp.id}">
      <div class="employee-card-header">
        <div class="employee-avatar">${Utils.getInitials(emp.firstName, emp.lastName)}</div>
        <div>
          <div class="employee-card-name">${emp.firstName} ${emp.lastName}</div>
          <div class="employee-card-contract">${Utils.getContractName(emp.contract)}</div>
        </div>
      </div>
      <div class="employee-card-details">
        <div class="detail-item">
          <span class="detail-label">Ωρομίσθιο</span>
          <span class="detail-value">€${emp.rate.toFixed(2)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Μαξ. Ώρες/Εβδ.</span>
          <span class="detail-value">${emp.maxHours}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Τηλέφωνο</span>
          <span class="detail-value">${emp.phone || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Email</span>
          <span class="detail-value">${emp.email || '-'}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Add click handlers
  grid.querySelectorAll('.employee-card').forEach(card => {
    card.addEventListener('click', () => {
      const emp = Store.employees.find(e => e.id === card.dataset.employeeId);
      if (emp) openEmployeeModal(emp);
    });
  });
}

// ==================== EMPLOYEE MODAL ====================
const employeeModal = document.getElementById('employee-modal');
const employeeForm = document.getElementById('employee-form');

document.getElementById('add-employee').addEventListener('click', () => {
  openEmployeeModal();
});

function openEmployeeModal(employee = null) {
  document.getElementById('employee-modal-title').textContent =
    employee ? 'Επεξεργασία Υπαλλήλου' : 'Νέος Υπάλληλος';
  document.getElementById('delete-employee').style.display = employee ? 'block' : 'none';

  if (employee) {
    document.getElementById('employee-id').value = employee.id;
    document.getElementById('employee-firstname').value = employee.firstName;
    document.getElementById('employee-lastname').value = employee.lastName;
    document.getElementById('employee-phone').value = employee.phone || '';
    document.getElementById('employee-email').value = employee.email || '';
    document.getElementById('employee-contract').value = employee.contract;
    document.getElementById('employee-rate').value = employee.rate;
    document.getElementById('employee-max-hours').value = employee.maxHours;

    // Set availability checkboxes
    document.querySelectorAll('#availability-grid input').forEach(cb => {
      cb.checked = employee.availability.includes(cb.value);
    });
  } else {
    document.getElementById('employee-id').value = '';
    document.getElementById('employee-firstname').value = '';
    document.getElementById('employee-lastname').value = '';
    document.getElementById('employee-phone').value = '';
    document.getElementById('employee-email').value = '';
    document.getElementById('employee-contract').value = 'full';
    document.getElementById('employee-rate').value = '';
    document.getElementById('employee-max-hours').value = '40';

    // Reset availability
    document.querySelectorAll('#availability-grid input').forEach(cb => {
      cb.checked = true;
    });
  }

  employeeModal.classList.add('active');
}

document.getElementById('close-employee-modal').addEventListener('click', () => {
  employeeModal.classList.remove('active');
});

employeeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const availability = [];
  document.querySelectorAll('#availability-grid input:checked').forEach(cb => {
    availability.push(cb.value);
  });

  const employeeData = {
    firstName: document.getElementById('employee-firstname').value,
    lastName: document.getElementById('employee-lastname').value,
    phone: document.getElementById('employee-phone').value,
    email: document.getElementById('employee-email').value,
    contract: document.getElementById('employee-contract').value,
    rate: parseFloat(document.getElementById('employee-rate').value),
    maxHours: parseInt(document.getElementById('employee-max-hours').value),
    availability: availability
  };

  const employeeId = document.getElementById('employee-id').value;

  if (employeeId) {
    Store.updateEmployee(employeeId, employeeData);
  } else {
    Store.addEmployee(employeeData);
  }

  employeeModal.classList.remove('active');
  renderEmployees();
  renderSchedule();
});

document.getElementById('delete-employee').addEventListener('click', () => {
  const employeeId = document.getElementById('employee-id').value;
  if (employeeId && confirm('Διαγραφή αυτού του υπαλλήλου και όλων των βαρδιών του;')) {
    Store.deleteEmployee(employeeId);
    employeeModal.classList.remove('active');
    renderEmployees();
    renderSchedule();
  }
});

// ==================== COSTS VIEW ====================
function renderCosts() {
  const weekShifts = Store.getShiftsForWeek(currentWeekStart);

  let totalHours = 0;
  let totalCost = 0;
  let overtimeCost = 0;
  const employeeCosts = {};

  // Calculate per-employee stats
  Store.employees.forEach(emp => {
    const empShifts = weekShifts.filter(s => s.employeeId === emp.id);
    let hours = 0;

    empShifts.forEach(shift => {
      hours += Utils.calculateShiftHours(shift.start, shift.end);
    });

    const regularHours = Math.min(hours, emp.maxHours);
    const overtimeHours = Math.max(0, hours - emp.maxHours);
    const regularCost = regularHours * emp.rate;
    const empOvertimeCost = overtimeHours * emp.rate * 1.5; // 150% for overtime

    employeeCosts[emp.id] = {
      employee: emp,
      hours: hours,
      regularCost: regularCost,
      overtimeCost: empOvertimeCost,
      totalCost: regularCost + empOvertimeCost
    };

    totalHours += hours;
    totalCost += regularCost + empOvertimeCost;
    overtimeCost += empOvertimeCost;
  });

  document.getElementById('total-cost').textContent = '€' + totalCost.toFixed(2);
  document.getElementById('total-hours').textContent = totalHours.toFixed(1);
  document.getElementById('avg-hourly').textContent = totalHours > 0
    ? '€' + (totalCost / totalHours).toFixed(2)
    : '€0';
  document.getElementById('overtime-cost').textContent = '€' + overtimeCost.toFixed(2);

  // Breakdown list
  const breakdownList = document.getElementById('cost-breakdown');

  if (Object.keys(employeeCosts).length === 0) {
    breakdownList.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Δεν υπάρχουν δεδομένα</p>';
    return;
  }

  breakdownList.innerHTML = Object.values(employeeCosts)
    .sort((a, b) => b.totalCost - a.totalCost)
    .map(data => `
      <div class="breakdown-item">
        <div class="employee-avatar">${Utils.getInitials(data.employee.firstName, data.employee.lastName)}</div>
        <div class="breakdown-info">
          <div class="breakdown-name">${data.employee.firstName} ${data.employee.lastName}</div>
          <div class="breakdown-hours">${data.hours.toFixed(1)} ώρες ${data.overtimeCost > 0 ? '(+υπερωρίες)' : ''}</div>
        </div>
        <div class="breakdown-cost">€${data.totalCost.toFixed(2)}</div>
      </div>
    `).join('');
}

// ==================== ALERTS (LABOR LAW COMPLIANCE) ====================
function checkLaborLawCompliance() {
  const alerts = [];
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  Store.employees.forEach(emp => {
    const empShifts = Store.getEmployeeShifts(emp.id, currentWeekStart, weekEnd);

    // Check 1: Weekly hours exceed max
    const weeklyHours = empShifts.reduce((sum, shift) => {
      return sum + Utils.calculateShiftHours(shift.start, shift.end);
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

    // Check 2: Rest period between shifts (11 hours minimum)
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

    // Check 3: Shift longer than 10 hours
    empShifts.forEach(shift => {
      const hours = Utils.calculateShiftHours(shift.start, shift.end);
      if (hours > 10) {
        const date = new Date(shift.date);
        alerts.push({
          type: 'warning',
          title: `Μεγάλη βάρδια: ${emp.firstName} ${emp.lastName}`,
          message: `${hours.toFixed(1)} ώρες στις ${Utils.formatDateGreek(date)}. Μέγιστο συνιστώμενο: 10 ώρες.`
        });
      }
    });

    // Check 4: Working on Sunday without flag
    empShifts.forEach(shift => {
      const date = new Date(shift.date);
      if (date.getDay() === 0) {
        alerts.push({
          type: 'info',
          title: `Εργασία Κυριακής: ${emp.firstName} ${emp.lastName}`,
          message: `Προσαύξηση 75% για εργασία Κυριακή (${Utils.formatDateGreek(date)}).`
        });
      }
    });
  });

  return alerts;
}

function renderAlerts() {
  const alerts = checkLaborLawCompliance();
  const container = document.getElementById('alerts-list');

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="no-alerts">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3>Όλα καλά!</h3>
        <p>Δεν υπάρχουν προειδοποιήσεις εργατικής νομοθεσίας αυτή την εβδομάδα.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="alert-item ${alert.type}">
      <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div class="alert-content">
        <h4>${alert.title}</h4>
        <p>${alert.message}</p>
      </div>
    </div>
  `).join('');
}

function updateAlertsCount() {
  const alerts = checkLaborLawCompliance();
  const badge = document.getElementById('alert-count');
  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;

  badge.textContent = criticalCount;
  badge.classList.toggle('show', criticalCount > 0);
}

// ==================== ERGANI EXPORT ====================
document.getElementById('btn-ergani').addEventListener('click', () => {
  const weekShifts = Store.getShiftsForWeek(currentWeekStart);

  if (weekShifts.length === 0) {
    alert('Δεν υπάρχουν βάρδιες για εξαγωγή.');
    return;
  }

  // Generate CSV for ERGANI format
  let csv = 'ΑΦΜ,Επώνυμο,Όνομα,Ημερομηνία,Ώρα Έναρξης,Ώρα Λήξης,Τύπος\n';

  weekShifts.forEach(shift => {
    const emp = Store.employees.find(e => e.id === shift.employeeId);
    if (emp) {
      csv += `"","${emp.lastName}","${emp.firstName}","${shift.date}","${shift.start}","${shift.end}","Κανονική"\n`;
    }
  });

  // Download file
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ergani_${Utils.formatDate(currentWeekStart)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ==================== CLOSE MODALS ON BACKDROP CLICK ====================
shiftModal.addEventListener('click', (e) => {
  if (e.target === shiftModal) shiftModal.classList.remove('active');
});

employeeModal.addEventListener('click', (e) => {
  if (e.target === employeeModal) employeeModal.classList.remove('active');
});

// ==================== INITIAL RENDER ====================
renderSchedule();
renderEmployees();

// Demo data
if (Store.employees.length === 0) {
  const maria = Store.addEmployee({
    firstName: 'Μαρία',
    lastName: 'Παπαδοπούλου',
    phone: '6971234567',
    email: 'maria@example.com',
    contract: 'full',
    rate: 7.50,
    maxHours: 40,
    availability: ['mon', 'tue', 'wed', 'thu', 'fri']
  });

  const giorgos = Store.addEmployee({
    firstName: 'Γιώργος',
    lastName: 'Αντωνίου',
    phone: '6987654321',
    email: 'giorgos@example.com',
    contract: 'part',
    rate: 6.50,
    maxHours: 25,
    availability: ['thu', 'fri', 'sat', 'sun']
  });

  const eleni = Store.addEmployee({
    firstName: 'Ελένη',
    lastName: 'Κωστοπούλου',
    phone: '6945678901',
    email: 'eleni@example.com',
    contract: 'seasonal',
    rate: 7.00,
    maxHours: 40,
    availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  });

  const nikos = Store.addEmployee({
    firstName: 'Νίκος',
    lastName: 'Δημητρίου',
    phone: '6932145678',
    email: 'nikos@example.com',
    contract: 'full',
    rate: 8.00,
    maxHours: 40,
    availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  });

  const sofia = Store.addEmployee({
    firstName: 'Σοφία',
    lastName: 'Γεωργίου',
    phone: '6958741236',
    email: 'sofia@example.com',
    contract: 'part',
    rate: 6.00,
    maxHours: 20,
    availability: ['fri', 'sat', 'sun']
  });

  const kostas = Store.addEmployee({
    firstName: 'Κώστας',
    lastName: 'Μαρκόπουλος',
    phone: '6912378456',
    email: 'kostas@example.com',
    contract: 'full',
    rate: 9.50,
    maxHours: 40,
    availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  });

  // Add demo shifts for current week
  const weekStart = Utils.getWeekStart(new Date());

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = Utils.formatDate(date);
    const dayKey = Utils.getDayKey(date);

    // Maria - Mon-Fri mornings
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      Store.addShift({
        employeeId: maria.id,
        date: dateStr,
        start: '08:00',
        end: '16:00',
        role: 'cashier',
        notes: ''
      });
    }

    // Giorgos - Thu-Sun evenings
    if (['thu', 'fri', 'sat', 'sun'].includes(dayKey)) {
      Store.addShift({
        employeeId: giorgos.id,
        date: dateStr,
        start: '17:00',
        end: '23:00',
        role: 'waiter',
        notes: ''
      });
    }

    // Eleni - All week, rotating shifts
    if (['mon', 'wed', 'fri'].includes(dayKey)) {
      Store.addShift({
        employeeId: eleni.id,
        date: dateStr,
        start: '10:00',
        end: '18:00',
        role: 'barista',
        notes: ''
      });
    } else if (['tue', 'thu', 'sat'].includes(dayKey)) {
      Store.addShift({
        employeeId: eleni.id,
        date: dateStr,
        start: '14:00',
        end: '22:00',
        role: 'barista',
        notes: ''
      });
    }

    // Nikos - Manager, Mon-Sat
    if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(dayKey)) {
      Store.addShift({
        employeeId: nikos.id,
        date: dateStr,
        start: '09:00',
        end: '17:00',
        role: 'manager',
        notes: ''
      });
    }

    // Sofia - Weekends only
    if (['fri', 'sat', 'sun'].includes(dayKey)) {
      Store.addShift({
        employeeId: sofia.id,
        date: dateStr,
        start: '18:00',
        end: '02:00',
        role: 'waiter',
        notes: ''
      });
    }

    // Kostas - Kitchen, full coverage
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      Store.addShift({
        employeeId: kostas.id,
        date: dateStr,
        start: '11:00',
        end: '19:00',
        role: 'kitchen',
        notes: ''
      });
    } else if (['sat', 'sun'].includes(dayKey)) {
      Store.addShift({
        employeeId: kostas.id,
        date: dateStr,
        start: '10:00',
        end: '20:00',
        role: 'kitchen',
        notes: 'Σαββατοκύριακο - πολλή δουλειά'
      });
    }
  }

  renderSchedule();
  renderEmployees();
}
