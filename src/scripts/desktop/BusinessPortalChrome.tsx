import type { ReactNode } from 'react';
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

export type BusinessPortalNavKey =
  | 'overview'
  | 'orders'
  | 'messages'
  | 'catalog'
  | 'deals'
  | 'locations'
  | 'customers'
  | 'analytics'
  | 'pos'
  | 'settings';

const NAV_ITEMS: Array<{ key: BusinessPortalNavKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders & Bookings' },
  { key: 'messages', label: 'Messages' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'deals', label: 'Deals' },
  { key: 'locations', label: 'Locations' },
  { key: 'customers', label: 'Customers' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

const navItem = (key: BusinessPortalNavKey) => NAV_ITEMS.find((item) => item.key === key)!;

const NAV_GROUPS: ReadonlyArray<RailGroup<BusinessPortalNavKey>> = [
  { label: '', items: [navItem('overview')] },
  { label: 'Selling', items: [navItem('orders'), navItem('messages')] },
  { label: 'Storefront', items: [navItem('catalog'), navItem('deals'), navItem('locations')] },
  { label: 'Growth', items: [navItem('customers'), navItem('analytics')] },
  { label: 'Account', items: [navItem('settings')] },
];

interface BusinessPortalChromeProps {
  children: ReactNode;
  activeNav?: BusinessPortalNavKey;
  onNav?: (key: BusinessPortalNavKey) => void;
  onBrand?: () => void;
  notificationCount?: number;
  onSignOut?: () => void;
}

export function BusinessPortalChrome({
  children,
  activeNav = 'overview',
  onNav,
  onBrand,
  notificationCount = 3,
  onSignOut,
}: BusinessPortalChromeProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface-subtle font-body-md text-body-md text-on-surface antialiased flex flex-col ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md flex-shrink-0">
            <button type="button" onClick={onBrand} className="flex items-center gap-space-xs">
              <span className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-heading-sm text-heading-sm font-bold tracking-tight shadow-[0_4px_12px_rgba(6,108,244,0.25)]">
                V
              </span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold tracking-tight">VEMTAP</span>
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-caption tracking-wider font-semibold">BUSINESS</span>
            </button>
            <div className="h-5 w-[1px] bg-border-subtle mx-space-2xs hidden xl:block" />
            <button
              type="button"
              className="hidden xl:flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container transition-colors text-text-secondary hover:text-on-surface"
            >
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md max-w-[190px] truncate">Wuse II Branch, Abuja, FCT</span>
              <Icon name="expand_more" className="text-[16px] text-text-tertiary" />
            </button>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <div className="hidden md:flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-caption font-medium">Cloud Synced</span>
            </div>
            <button
              type="button"
              title="Help & Support"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
            >
              <Icon name="help_outline" className="text-[20px]" />
            </button>
            <div className="relative">
              <button
                type="button"
                title="Notifications"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors"
              >
                <Icon name="notifications" className="text-[20px]" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary font-caption text-[10px] font-bold leading-none ring-2 ring-surface-canvas">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="h-6 w-[1px] bg-border-subtle mx-space-2xs" />
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} />

      <main className="w-full pt-16 flex-1 bg-surface-subtle">
        <PortalBody>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-canvas shadow-[0_-1px_6px_rgba(0,0,0,0.03)] py-space-md">
        <div className={`w-full ${PORTAL_CONTENT} flex flex-col md:flex-row items-center justify-between gap-space-sm`}>
          <div className="flex flex-wrap items-center gap-space-sm font-label-sm text-caption text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Icon name="verified_user" className="text-badge-discount-text text-[16px]" />
              <span>NDPR Compliant</span>
            </div>
            <span className="text-border-subtle">•</span>
            <div className="flex items-center gap-1.5">
              <Icon name="shield" className="text-badge-discount-text text-[16px]" />
              <span>ISO 27001 Certified</span>
            </div>
            <span className="text-border-subtle">•</span>
            <div className="flex items-center gap-1.5">
              <Icon name="lock" className="text-badge-discount-text text-[16px]" />
              <span>Bank-Grade 256-Bit SSL Security</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-label-sm text-caption text-text-secondary">
            <button type="button" className="hover:text-primary transition-colors">Privacy Policy</button>
            <button type="button" className="hover:text-primary transition-colors">Terms of Service</button>
            <button type="button" className="hover:text-primary transition-colors">Merchant Agreement</button>
            <span className="text-text-tertiary">© 2025 VEMTAP Technologies Limited</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
