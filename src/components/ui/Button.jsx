export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseClasses = 'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white border-none',
    secondary: 'bg-dark-hover border border-dark-border text-text-primary hover:bg-dark-card',
    danger: 'bg-danger hover:opacity-90 text-white border-none',
    icon: 'p-2 bg-dark-card border border-dark-border text-text-primary hover:bg-dark-hover flex items-center justify-center',
    export: 'w-full p-3 bg-dark-hover border border-dark-border rounded-lg text-text-primary hover:bg-primary hover:border-primary'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, className = '', ...props }) {
  return (
    <button
      className={`p-2 bg-dark-card border border-dark-border rounded-md text-text-primary hover:bg-dark-hover flex items-center justify-center transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
