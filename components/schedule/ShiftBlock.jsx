'use client';

import { getRoleName } from '@/lib/helpers';

export default function ShiftBlock({ shift, onClick, onDragStart, onDragEnd, compact = false }) {
  const roleColors = {
    waiter: 'shift-waiter',
    barista: 'shift-barista',
    kitchen: 'shift-kitchen',
    cashier: 'shift-cashier',
    manager: 'shift-manager'
  };

  return (
    <div
      className={`${roleColors[shift.role]} rounded-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
        compact ? 'px-1.5 py-1 text-[0.65rem] mb-0.5' : 'px-2 py-1.5 text-xs mb-1'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(shift);
      }}
      draggable
      onDragStart={(e) => onDragStart(e, shift.id)}
      onDragEnd={onDragEnd}
    >
      <div className="font-semibold leading-tight">{shift.start} - {shift.end}</div>
      {!compact && <div className="opacity-90 text-[0.7rem]">{getRoleName(shift.role)}</div>}
    </div>
  );
}
