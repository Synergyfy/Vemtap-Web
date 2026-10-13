import type { ReactNode } from 'react';

export interface SheetShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SheetShell({ open, onClose, children }: SheetShellProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
          className="bg-surface-canvas rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto pb-safe"
        >
          {children}
        </div>
      </div>
    </>
  );
}
