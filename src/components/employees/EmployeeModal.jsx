import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../hooks/useStore';

const DAYS = [
  { key: 'mon', label: 'Δευ' },
  { key: 'tue', label: 'Τρι' },
  { key: 'wed', label: 'Τετ' },
  { key: 'thu', label: 'Πεμ' },
  { key: 'fri', label: 'Παρ' },
  { key: 'sat', label: 'Σαβ' },
  { key: 'sun', label: 'Κυρ' }
];

export default function EmployeeModal({ isOpen, onClose, employee }) {
  const { addEmployee, updateEmployee, deleteEmployee } = useStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    contract: 'full',
    rate: '',
    maxHours: 40,
    availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone || '',
        email: employee.email || '',
        contract: employee.contract,
        rate: employee.rate,
        maxHours: employee.maxHours,
        availability: employee.availability
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        contract: 'full',
        rate: '',
        maxHours: 40,
        availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const employeeData = {
      ...formData,
      rate: parseFloat(formData.rate),
      maxHours: parseInt(formData.maxHours)
    };

    if (employee) {
      updateEmployee(employee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (employee && confirm('Διαγραφή αυτού του υπαλλήλου και όλων των βαρδιών του;')) {
      deleteEmployee(employee.id);
      onClose();
    }
  };

  const toggleDay = (dayKey) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(dayKey)
        ? prev.availability.filter(d => d !== dayKey)
        : [...prev.availability, dayKey]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Επεξεργασία Υπαλλήλου' : 'Νέος Υπάλληλος'}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Όνομα</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Επώνυμο</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Τηλέφωνο</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Τύπος Σύμβασης</label>
            <select
              value={formData.contract}
              onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="full">Πλήρης Απασχόληση</option>
              <option value="part">Μερική Απασχόληση</option>
              <option value="seasonal">Εποχιακή</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm text-text-secondary">Ωρομίσθιο (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              required
              className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Μέγιστες Ώρες/Εβδομάδα</label>
          <input
            type="number"
            min="1"
            max="48"
            value={formData.maxHours}
            onChange={(e) => setFormData({ ...formData, maxHours: e.target.value })}
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 text-sm text-text-secondary">Διαθεσιμότητα</label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <label key={day.key} className="flex items-center gap-2 cursor-pointer text-text-primary">
                <input
                  type="checkbox"
                  checked={formData.availability.includes(day.key)}
                  onChange={() => toggleDay(day.key)}
                  className="w-4 h-4"
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-6">
          {employee && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Διαγραφή
            </Button>
          )}
          <Button type="submit" variant="primary" className={!employee ? 'ml-auto' : ''}>
            Αποθήκευση
          </Button>
        </div>
      </form>
    </Modal>
  );
}
