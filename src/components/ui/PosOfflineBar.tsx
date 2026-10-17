import { Icon } from './Icon';
import { usePosOffline } from '../../context/PosOfflineContext';

/**
 * Offline banner + "Sync Online" control shared by the desktop and mobile
 * register screens.
 *
 * There is deliberately no link to a separate sync page: the till shows its
 * state inline, queues orders locally, and pushes them the moment the network
 * returns (or when the cashier taps Sync Online).
 */
export function PosOfflineBar({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { isOnline, isSyncing, pendingCount, statusLabel, syncNow } = usePosOffline();

  const compact = variant === 'mobile';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex flex-wrap items-center justify-between gap-space-xs px-space-sm py-space-2xs rounded-xl border transition-colors ${
        isOnline
          ? pendingCount > 0
            ? 'bg-badge-discount-bg/60 border-badge-discount-bg text-badge-discount-text'
            : 'bg-surface-subtle border-border-subtle text-text-secondary'
          : 'bg-error-container/70 border-error-container text-on-error-container'
      }`}
    >
      <span className="flex items-center gap-space-2xs min-w-0">
        <span className="relative flex h-2 w-2 shrink-0">
          {!isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-70" />}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline ? (pendingCount > 0 ? 'bg-badge-discount-text' : 'bg-badge-discount-text') : 'bg-error'
            }`}
          />
        </span>
        <Icon name={isOnline ? 'cloud_done' : 'cloud_off'} className="text-[16px] shrink-0" />
        <span
          className={`truncate ${compact ? 'font-caption text-caption' : 'font-label-sm text-label-sm'} font-semibold`}
        >
          {statusLabel}
        </span>
      </span>

      {pendingCount > 0 && (
        <button
          type="button"
          disabled={isSyncing || !isOnline}
          onClick={() => void syncNow()}
          className={`inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
            isOnline ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-canvas/70 text-text-tertiary'
          }`}
        >
          <Icon name={isSyncing ? 'progress_activity' : 'sync'} className={`text-[15px] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing…' : `Sync Online (${pendingCount})`}</span>
        </button>
      )}
    </div>
  );
}
