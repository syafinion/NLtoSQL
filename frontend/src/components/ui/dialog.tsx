import React, { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-lg w-full">
        {children}
        {onOpenChange && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => (
  <div className={`mt-2 ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-semibold mb-2">{children}</h2>
);

export const DialogFooter: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mt-4 flex justify-end gap-2">{children}</div>
); 