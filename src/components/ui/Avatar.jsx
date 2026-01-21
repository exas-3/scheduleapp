import { getInitials } from '../../utils/helpers';

export default function Avatar({ firstName, lastName, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div
      className={`bg-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${sizes[size]} ${className}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
