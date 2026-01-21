import Avatar from '../ui/Avatar';
import { getContractName } from '../../utils/helpers';

export default function EmployeeCard({ employee, onClick }) {
  return (
    <div
      onClick={() => onClick(employee)}
      className="bg-dark-card rounded-xl p-5 cursor-pointer transition-all border border-dark-border hover:border-primary hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar firstName={employee.firstName} lastName={employee.lastName} size="lg" />
        <div>
          <div className="font-semibold text-lg">{employee.firstName} {employee.lastName}</div>
          <div className="text-sm text-text-secondary">{getContractName(employee.contract)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-text-secondary text-xs">Ωρομίσθιο</span>
          <span className="font-medium">€{employee.rate.toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-text-secondary text-xs">Μαξ. Ώρες/Εβδ.</span>
          <span className="font-medium">{employee.maxHours}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-text-secondary text-xs">Τηλέφωνο</span>
          <span className="font-medium">{employee.phone || '-'}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-text-secondary text-xs">Email</span>
          <span className="font-medium truncate">{employee.email || '-'}</span>
        </div>
      </div>
    </div>
  );
}
