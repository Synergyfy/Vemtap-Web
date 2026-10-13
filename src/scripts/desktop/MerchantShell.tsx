import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import {
  PortalBody,
  PortalRail,
  PORTAL_CONTENT,
  RAIL_OFFSET,
  ShellAccountMenu,
  type RailGroup,
  type ShellAccountKey,
} from './PortalShell';

const NAV_ITEMS: Array<{ key: BusinessPortalNavKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders & Bookings' },
  { key: 'messages', label: 'Messages' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'deals', label: 'Deals' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'pos', label: 'POS' },
  { key: 'settings', label: 'Settings' },
];

const navItem = (key: BusinessPortalNavKey) => NAV_ITEMS.find((item) => item.key === key)!;

const NAV_GROUPS: ReadonlyArray<RailGroup<BusinessPortalNavKey>> = [
  { label: '', items: [navItem('overview')] },
  { label: 'Selling', items: [navItem('orders'), navItem('messages')] },
  { label: 'Storefront', items: [navItem('catalog'), navItem('deals')] },
  { label: 'Insights', items: [navItem('analytics'), navItem('pos')] },
  { label: 'Account', items: [navItem('settings')] },
];

interface MerchantShellProps {
  children: ReactNode;
  activeNav?: BusinessPortalNavKey;
  onNav?: (key: BusinessPortalNavKey) => void;
  onSignOut?: () => void;
}

export function MerchantShell({ children, activeNav = 'catalog', onNav, onSignOut }: MerchantShellProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased ${RAIL_OFFSET}`}>
      <header className="fixed top-0 w-full z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs">
              <span className="font-heading-lg text-heading-lg tracking-tight font-bold text-primary">VEMTAP</span>
              <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Merchant
              </span>
            </div>
            <div className="h-6 w-px bg-surface-container-high hidden md:block" />
            <button
              type="button"
              className="hidden lg:flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="store" className="text-primary text-[18px]" />
              <div className="text-left">
                <p className="font-label-sm text-label-sm font-semibold text-on-surface leading-tight">Wuse II Branch</p>
                <p className="font-caption text-caption text-text-secondary leading-tight">Abuja, FCT</p>
              </div>
              <Icon name="arrow_drop_down" className="text-text-secondary text-[18px]" />
            </button>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="hidden sm:flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-medium">Live Synced</span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-space-xs rounded-lg hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-canvas" />
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} headerHeight="20" />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
        <div className="py-space-lg">
          <PortalBody>{children}</PortalBody>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className={`${PORTAL_CONTENT} py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md`}>
          <div className="flex flex-wrap items-center gap-space-md text-text-secondary font-caption text-caption">
            <div className="flex items-center gap-space-2xs">
              <Icon name="verified_user" className="text-badge-discount-text text-[16px]" />
              <span>NDPR Compliant</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <Icon name="lock" className="text-primary text-[16px]" />
              <span>ISO/IEC 27001 Certified</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <Icon name="shield" className="text-secondary text-[16px]" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-caption text-caption text-text-secondary">
            <button type="button" className="hover:text-on-surface transition-colors">
              Merchant Agreement
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              Security Standards
            </button>
            <button type="button" className="hover:text-on-surface transition-colors">
              System Status
            </button>
            <span>© 2025 VEMTAP Technologies Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
