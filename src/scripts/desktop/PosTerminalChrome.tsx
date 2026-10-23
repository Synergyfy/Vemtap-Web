import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import {
  PortalBody,
  PORTAL_CONTENT,
  POS_RAIL_OFFSET,
  BUSINESS_NAV_EVENT,
  ShellAccountMenu,
  type ShellAccountKey,
} from './PortalShell';
import { BusinessSidebarRail } from './BusinessSidebarRail';
import { PosNavRail } from './PosNavRail';
import { BusinessBranchSelect } from '../../components/BusinessBranchSelect';

export type PosTerminalNavKey =
  | 'home'
  | 'register'
  | 'orders'
  | 'bookings'
  | 'products'
  | 'ledger'
  | 'hardware-and-sync'
  | 'settings';

/**
 * Maps a terminal nav key to the POS rail item that should read as active, and
 * back again — so the POS menu beside the collapsed business rail always reflects
 * the terminal page the user is on.
 */
const TERMINAL_TO_RAIL: Record<PosTerminalNavKey, string> = {
  home: 'pos-home',
  register: 'pos-sale',
  orders: 'orders-all',
  bookings: 'orders-bookings',
  products: 'pos-stock',
  ledger: 'pos-transactions',
  // "Hardware & Sync" no longer has its own page — the offline banner and
  // "Sync Online" button live on the register itself.
  'hardware-and-sync': 'pos-sale',
  settings: 'pos-settings',
};

const RAIL_TO_TERMINAL: Record<string, PosTerminalNavKey> = {
  'pos-home': 'home',
  'pos-sale': 'register',
  'orders-all': 'orders',
  // Bookings must land on the bookings page — not the order lookup page.
  'orders-bookings': 'bookings',
  'pos-transactions': 'ledger',
  'pos-stock': 'products',
  'pos-ledger': 'ledger',
  'pos-settings': 'settings',
};

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
  /** Rail item to highlight when the page is a sub-page of `activeNav`. */
  railActive?: string;
  onNav: (key: PosTerminalNavKey) => void;
  onExitToDashboard?: () => void;
  onSignOut?: () => void;
}

export function PosTerminalChrome({ children, activeNav, railActive, onNav, onExitToDashboard, onSignOut }: PosTerminalChromeProps) {
  const sessionTime = useWatClock();
  // The POS menu beside the collapsed business rail highlights the item that
  // matches the current terminal page.
  const railKey = railActive ?? TERMINAL_TO_RAIL[activeNav ?? 'register'];

  const exitToDashboard = () => {
    if (onExitToDashboard) {
      onExitToDashboard();
    } else {
      window.history.pushState(null, '', '/business/overview');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else if (key === 'overview') exitToDashboard();
    else onNav('settings');
  };

  return (
    <div className={`bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased ${POS_RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={exitToDashboard}
              className="w-auto xl:w-60 flex items-center gap-space-xs shrink-0 cursor-pointer text-left hover:opacity-85 transition-opacity"
              title="Return to Business Dashboard"
            >
              <Logo variant="full" className="h-10 md:h-11 w-auto" />
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant shrink-0 leading-none">
                POS
              </span>
            </button>
            <div className="h-5 w-[1px] bg-border-subtle mx-space-md hidden xl:block" />
            {/* Branch control — the location shown in the header drives every page. */}
            <div className="hidden lg:block">
              <BusinessBranchSelect
                align="left"
                triggerClassName="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle text-text-secondary hover:bg-surface-container transition-colors max-w-[240px]"
                nameClassName="font-label-sm text-label-sm font-medium text-text-primary"
              />
            </div>
            <div className="lg:hidden">
              <BusinessBranchSelect iconOnly align="left" />
            </div>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={exitToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
              title="Return to Business Management Dashboard"
            >
              <Icon name="arrow_back" className="text-[16px] text-primary" />
              <span className="font-medium">Exit to Dashboard</span>
            </button>
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption font-semibold tracking-wide uppercase">Live Edge Mesh Synced</span>
            </div>
            <div className="h-6 w-px bg-surface-container-highest hidden sm:block" />
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      {/* POS mode: the main business rail stays visible (collapsed to icons) and the
          POS menu opens beside it — instead of the side menu being swapped out. */}
      <BusinessSidebarRail
        collapsed
        headerHeight="16"
        active={railKey}
        onSelect={(key) => window.dispatchEvent(new CustomEvent(BUSINESS_NAV_EVENT, { detail: key }))}
      />
      <PosNavRail
        headerHeight="16"
        active={railKey}
        onSelect={(key) => {
          const terminalKey = RAIL_TO_TERMINAL[key];
          if (terminalKey) {
            onNav(terminalKey);
            return;
          }
          // Store Front pages belong to the business portal shell — hand the key
          // back to the shared business router instead of the terminal switch.
          window.dispatchEvent(new CustomEvent(BUSINESS_NAV_EVENT, { detail: key }));
        }}
      />

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
