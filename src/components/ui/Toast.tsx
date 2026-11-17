import { Icon } from './Icon';

/** A short message floating near the top of the screen (shared toast look). */
export function Toast({ message, icon = 'info' }: { message: string | null; icon?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none max-w-[90vw]"
    >
      <Icon name={icon} className="text-[18px] text-badge-discount-text" />
      <span className="font-caption text-caption font-medium">{message}</span>
    </div>
  );
}
