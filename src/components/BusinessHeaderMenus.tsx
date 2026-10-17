import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './ui/Icon';
import { MOBILE_ACCOUNT_NAV_EVENT, SIGN_OUT_EVENT, type MobileAccountNavKey } from '../utils/appEvents';
import { NOTIFICATION_FEED } from '../utils/notificationFeed';

/**
 * Shared mobile/tablet dashboard header menus.
 *
 * Below `lg` (1024px) the business dashboard swaps the desktop chrome
 * (`BusinessPortalChrome`) for inline headers, which previously rendered an
 * inert avatar and a bell that only fired a toast. These components give the
 * mobile & tablet dashboards the same notification and account dropdowns the
 * desktop header has.
 *
 * Outside-tap closing uses a transparent full-screen overlay (the same pattern
 * as `BusinessBranchSelect`) because document-level mouse listeners are
 * unreliable on touch devices.
 */

function dispatchNav(key: MobileAccountNavKey) {
  window.dispatchEvent(new CustomEvent(MOBILE_ACCOUNT_NAV_EVENT, { detail: key }));
}

interface MobileNotificationBellProps {
  /** Overrides the default navigation to the notifications page. */
  onViewAll?: () => void;
  /** How many feed items start unread — drives the badge count. */
  unreadStartCount?: number;
  /** Override the trigger's sizing classes (defaults match mobile headers). */
  className?: string;
}

export function MobileNotificationBell({
  onViewAll,
  unreadStartCount = 3,
  className,
}: MobileNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const initialRead = new Set<string>();
    NOTIFICATION_FEED.slice(unreadStartCount).forEach((item) => initialRead.add(item.id));
    return initialRead;
  });
  const unreadCount = NOTIFICATION_FEED.filter((item) => !readIds.has(item.id)).length;

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const openAll = () => {
    setOpen(false);
    if (onViewAll) onViewAll();
    else dispatchNav('notifications');
  };

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[45]" onClick={() => setOpen(false)} />}
      <button
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
        className={
          className ??
          'w-11 h-11 flex items-center justify-center relative rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors'
        }
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="notifications" className="text-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-caption text-[10px] font-bold text-on-primary leading-none ring-2 ring-surface-canvas">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl bg-surface-canvas border border-border-subtle shadow-xl overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-b border-border-subtle bg-surface-subtle/60">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-space-2xs py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              disabled={unreadCount === 0}
              type="button"
              className="font-label-sm text-label-sm text-primary active:underline disabled:text-text-tertiary disabled:no-underline"
              onClick={() => setReadIds(new Set(NOTIFICATION_FEED.map((item) => item.id)))}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-border-subtle">
            {NOTIFICATION_FEED.map((item) => {
              const unread = !readIds.has(item.id);
              return (
                <button
                  className="w-full flex items-start gap-space-sm px-space-md py-space-sm text-left active:bg-surface-subtle transition-colors"
                  key={item.id}
                  type="button"
                  onClick={openAll}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconClass}`}>
                    <Icon name={item.icon} className="text-[18px]" />
                  </span>
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-space-2xs">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                        {item.title}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                        {item.time}
                      </span>
                    </span>
                    <span className="font-caption text-caption text-text-secondary leading-snug mt-0.5">
                      {item.body}
                    </span>
                  </span>
                  {unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </button>
              );
            })}
          </div>

          <button
            className="w-full px-space-md py-space-sm border-t border-border-subtle bg-surface-subtle/60 active:bg-surface-subtle text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs transition-colors"
            type="button"
            onClick={openAll}
          >
            <span>View all notifications</span>
            <Icon name="arrow_forward" className="text-[15px]" />
          </button>
        </div>
      )}
    </div>
  );
}

interface MobileAccountMenuProps {
  onDashboard?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
  name?: string;
  role?: string;
  /** Override the trigger's sizing classes (defaults match mobile headers). */
  className?: string;
}

export function MobileAccountMenu({
  onDashboard,
  onSettings,
  onSignOut,
  name = 'Musa Danladi',
  role = 'Store Manager',
  className,
}: MobileAccountMenuProps) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const choose = (key: MobileAccountNavKey | 'sign-out') => {
    setOpen(false);
    if (key === 'sign-out') {
      signOut();
      window.dispatchEvent(new CustomEvent(SIGN_OUT_EVENT));
      onSignOut?.();
      return;
    }
    if (key === 'dashboard') {
      if (onDashboard) onDashboard();
      else dispatchNav('dashboard');
      return;
    }
    if (onSettings) onSettings();
    else dispatchNav('settings');
  };

  const items: Array<{ key: MobileAccountNavKey | 'sign-out'; icon: string; label: string; danger?: boolean }> = [
    { key: 'dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { key: 'settings', icon: 'settings', label: 'Settings' },
    { key: 'sign-out', icon: 'logout', label: 'Sign Out', danger: true },
  ];

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-[45]" onClick={() => setOpen(false)} />}
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={
          className ??
          'w-11 h-11 -mr-1 flex items-center justify-center rounded-full active:bg-surface-container-high transition-colors'
        }
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Icon name="person" filled className="text-on-primary text-[18px]" />
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-60 py-space-xs bg-surface-canvas rounded-xl shadow-[0_12px_32px_-8px_rgba(13,37,76,0.18)] border border-border-subtle flex flex-col"
          role="menu"
        >
          <div className="px-space-sm py-space-2xs flex flex-col border-b border-border-subtle mb-space-2xs">
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{name}</span>
            <span className="font-caption text-caption text-text-secondary truncate">{role}</span>
          </div>
          {items.map((item) => (
            <button
              aria-label={item.label}
              className={`w-full h-10 px-space-sm rounded-lg flex items-center gap-space-sm text-left transition-colors ${
                item.danger ? 'text-error active:bg-error/10' : 'text-on-surface active:bg-surface-subtle'
              }`}
              key={item.key}
              role="menuitem"
              type="button"
              onClick={() => choose(item.key)}
            >
              <Icon name={item.icon} className={`text-[19px] ${item.danger ? 'text-error' : 'text-text-secondary'}`} />
              <span className="font-label-sm text-label-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
