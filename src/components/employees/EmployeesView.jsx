import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import EmployeeCard from './EmployeeCard';
import EmployeeModal from './EmployeeModal';

export default function EmployeesView() {
  const { employees } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Διαχείριση Προσωπικού</h2>
        <Button variant="primary" onClick={handleAddClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Νέος Υπάλληλος
        </Button>
      </header>

      {employees.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-16 h-16 mx-auto mb-4 opacity-50">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 className="text-text-primary mb-2">Δεν υπάρχει προσωπικό</h3>
          <p>Κάντε κλικ στο "Νέος Υπάλληλος" για να ξεκινήσετε</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={handleEmployeeClick}
            />
          ))}
        </div>
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
}
