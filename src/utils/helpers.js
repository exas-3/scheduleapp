// Date formatting utilities
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const formatDateGreek = (date) => {
  const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getDayName = (date) => {
  const days = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
  return days[date.getDay()];
};

export const getDayKey = (date) => {
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return keys[date.getDay()];
};

export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getInitials = (firstName, lastName) => {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
};

export const calculateShiftHours = (start, end) => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let hours = endH - startH + (endM - startM) / 60;
  if (hours < 0) hours += 24; // overnight shift
  return hours;
};

export const getRoleName = (role) => {
  const roles = {
    waiter: 'Σερβιτόρος',
    barista: 'Barista',
    kitchen: 'Κουζίνα',
    cashier: 'Ταμείο',
    manager: 'Υπεύθυνος'
  };
  return roles[role] || role;
};

export const getContractName = (contract) => {
  const contracts = {
    full: 'Πλήρης',
    part: 'Μερική',
    seasonal: 'Εποχιακή'
  };
  return contracts[contract] || contract;
};

// Demo data generator
export const generateDemoData = () => {
  const employees = [
    {
      id: '1',
      firstName: 'Μαρία',
      lastName: 'Παπαδοπούλου',
      phone: '6971234567',
      email: 'maria@example.com',
      contract: 'full',
      rate: 7.50,
      maxHours: 40,
      availability: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    {
      id: '2',
      firstName: 'Γιώργος',
      lastName: 'Αντωνίου',
      phone: '6987654321',
      email: 'giorgos@example.com',
      contract: 'part',
      rate: 6.50,
      maxHours: 25,
      availability: ['thu', 'fri', 'sat', 'sun']
    },
    {
      id: '3',
      firstName: 'Ελένη',
      lastName: 'Κωστοπούλου',
      phone: '6945678901',
      email: 'eleni@example.com',
      contract: 'seasonal',
      rate: 7.00,
      maxHours: 40,
      availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    },
    {
      id: '4',
      firstName: 'Νίκος',
      lastName: 'Δημητρίου',
      phone: '6932145678',
      email: 'nikos@example.com',
      contract: 'full',
      rate: 8.00,
      maxHours: 40,
      availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    },
    {
      id: '5',
      firstName: 'Σοφία',
      lastName: 'Γεωργίου',
      phone: '6958741236',
      email: 'sofia@example.com',
      contract: 'part',
      rate: 6.00,
      maxHours: 20,
      availability: ['fri', 'sat', 'sun']
    },
    {
      id: '6',
      firstName: 'Κώστας',
      lastName: 'Μαρκόπουλος',
      phone: '6912378456',
      email: 'kostas@example.com',
      contract: 'full',
      rate: 9.50,
      maxHours: 40,
      availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    }
  ];

  const shifts = [];
  const weekStart = getWeekStart(new Date());

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = formatDate(date);
    const dayKey = getDayKey(date);

    // Maria - Mon-Fri mornings
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      shifts.push({
        id: `shift-maria-${i}`,
        employeeId: '1',
        date: dateStr,
        start: '08:00',
        end: '16:00',
        role: 'cashier',
        notes: ''
      });
    }

    // Giorgos - Thu-Sun evenings
    if (['thu', 'fri', 'sat', 'sun'].includes(dayKey)) {
      shifts.push({
        id: `shift-giorgos-${i}`,
        employeeId: '2',
        date: dateStr,
        start: '17:00',
        end: '23:00',
        role: 'waiter',
        notes: ''
      });
    }

    // Eleni - All week, rotating shifts
    if (['mon', 'wed', 'fri'].includes(dayKey)) {
      shifts.push({
        id: `shift-eleni-${i}`,
        employeeId: '3',
        date: dateStr,
        start: '10:00',
        end: '18:00',
        role: 'barista',
        notes: ''
      });
    } else if (['tue', 'thu', 'sat'].includes(dayKey)) {
      shifts.push({
        id: `shift-eleni-${i}`,
        employeeId: '3',
        date: dateStr,
        start: '14:00',
        end: '22:00',
        role: 'barista',
        notes: ''
      });
    }

    // Nikos - Manager, Mon-Sat
    if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(dayKey)) {
      shifts.push({
        id: `shift-nikos-${i}`,
        employeeId: '4',
        date: dateStr,
        start: '09:00',
        end: '17:00',
        role: 'manager',
        notes: ''
      });
    }

    // Sofia - Weekends only
    if (['fri', 'sat', 'sun'].includes(dayKey)) {
      shifts.push({
        id: `shift-sofia-${i}`,
        employeeId: '5',
        date: dateStr,
        start: '18:00',
        end: '02:00',
        role: 'waiter',
        notes: ''
      });
    }

    // Kostas - Kitchen, full coverage
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(dayKey)) {
      shifts.push({
        id: `shift-kostas-${i}`,
        employeeId: '6',
        date: dateStr,
        start: '11:00',
        end: '19:00',
        role: 'kitchen',
        notes: ''
      });
    } else if (['sat', 'sun'].includes(dayKey)) {
      shifts.push({
        id: `shift-kostas-${i}`,
        employeeId: '6',
        date: dateStr,
        start: '10:00',
        end: '20:00',
        role: 'kitchen',
        notes: 'Σαββατοκύριακο - πολλή δουλειά'
      });
    }
  }

  return { employees, shifts };
};
