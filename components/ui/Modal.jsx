'use client';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content bg-dark-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 border-b border-dark-border">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none px-2 py-1"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
