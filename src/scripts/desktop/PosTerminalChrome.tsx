import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import {
  PortalBody,
  PortalRail,
  PORTAL_CONTENT,
  RAIL_OFFSET,
  ShellAccountMenu,
  type RailGroup,
  type ShellAccountKey,
} from './PortalShell';

export type PosTerminalNavKey =
  | 'register'
  | 'orders'
  | 'products'
  | 'ledger'
  | 'hardware-and-sync'
  | 'settings';

const NAV_ITEMS: Array<{ key: PosTerminalNavKey; label: string }> = [
  { key: 'register', label: 'Register' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'hardware-and-sync', label: 'Hardware & Sync' },
  { key: 'settings', label: 'Settings' },
];

const navItem = (key: PosTerminalNavKey) => NAV_ITEMS.find((item) => item.key === key)!;

const NAV_GROUPS: ReadonlyArray<RailGroup<PosTerminalNavKey>> = [
  { label: 'Point of Sale', items: [navItem('register'), navItem('orders')] },
  { label: 'Inventory', items: [navItem('products'), navItem('ledger')] },
  { label: 'Terminal', items: [navItem('hardware-and-sync'), navItem('settings')] },
];

function formatWat(date: Date): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wat = new Date(utc + 3600000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(wat.getHours())}:${pad(wat.getMinutes())}:${pad(wat.getSeconds())} WAT`;
}

function useWatClock() {
  const [time, setTime] = useState(() => formatWat(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatWat(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

interface PosTerminalChromeProps {
  children: ReactNode;
  activeNav?: PosTerminalNavKey;
  onNav: (key: PosTerminalNavKey) => void;
  onSignOut?: () => void;
}

export function PosTerminalChrome({ children, activeNav, onNav, onSignOut }: PosTerminalChromeProps) {
  const sessionTime = useWatClock();
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav(key === 'overview' ? 'register' : 'settings');
  };

  return (
    <div className={`bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs shrink-0">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-heading-sm font-bold shadow-[0_2px_8px_-2px_rgba(6,108,244,0.3)]">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight leading-none">VEMTAP</span>
                <span className="font-caption text-caption text-text-tertiary tracking-wider uppercase font-semibold leading-none mt-1">
                  POS Terminal
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-surface-container-highest hidden lg:block" />
            <button
              type="button"
              className="hidden lg:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle text-text-secondary hover:bg-surface-container transition-colors"
            >
              <Icon name="storefront" className="text-[18px] text-primary" />
              <span className="font-label-sm text-label-sm font-medium text-text-primary">Wuse II Branch Flagship</span>
              <Icon name="expand_more" className="text-[16px] text-text-tertiary" />
            </button>
          </div>

          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption font-semibold tracking-wide uppercase">Live Edge Mesh Synced</span>
            </div>
            <div className="h-6 w-px bg-surface-container-highest hidden sm:block" />
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} />

      <main className="w-full pt-16 flex-1 bg-surface">
        <PortalBody>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-canvas shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
        <div className={`${PORTAL_CONTENT} py-3 flex flex-wrap items-center justify-between gap-space-md text-text-secondary`}>
          <div className="flex items-center gap-space-xs">
            <span className="font-caption text-caption text-text-secondary">
              © 2025 VEMTAP Technologies Ltd. Hyper-Local Terminal Infrastructure.
            </span>
          </div>
          <div className="flex items-center gap-space-lg font-caption text-caption">
            <div className="flex items-center gap-1.5">
              <Icon name="pin" className="text-[14px] text-text-tertiary" />
              <span className="text-text-tertiary">Station ID:</span>
              <span className="font-medium text-text-primary">POS-NG-ABJ-004</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="point_of_sale" className="text-[14px] text-text-tertiary" />
              <span className="text-text-tertiary">Hardware:</span>
              <span className="font-medium text-text-primary">PAX A920 Pro Linked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-[14px] text-badge-discount-text" />
              <span className="text-text-tertiary">Session:</span>
              <span className="font-medium text-text-primary">{sessionTime}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
