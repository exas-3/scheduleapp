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
