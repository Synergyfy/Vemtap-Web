import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Icon } from '../ui/Icon';

interface DesktopModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: string;
  backdropClassName?: string;
  cardClassName?: string;
  children: ReactNode;
}

export function DesktopModal({
  open,
  onClose,
  maxWidth = 'max-w-[580px]',
  backdropClassName = 'bg-on-surface/40 backdrop-blur-md',
  cardClassName = 'bg-surface-canvas',
  children,
}: DesktopModalProps) {
  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-space-md overflow-y-auto ${backdropClassName}`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} my-auto ${cardClassName} rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({ onClose, label = 'Close dialog' }: { onClose: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClose}
      className="w-9 h-9 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface transition-colors shrink-0"
    >
      <Icon name="close" className="text-[20px]" />
    </button>
  );
}

interface DesktopDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DesktopDrawer({ open, onClose, children }: DesktopDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        role="presentation"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute top-0 right-0 h-full w-full sm:w-[480px] bg-surface-canvas shadow-2xl flex flex-col overflow-hidden"
      >
        {children}
      </aside>
    </div>
  );
}
