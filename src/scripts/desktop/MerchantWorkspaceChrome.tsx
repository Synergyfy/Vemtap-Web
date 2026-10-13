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

interface MerchantWorkspaceChromeProps {
  children: ReactNode;
  activeNav?: BusinessPortalNavKey;
  onNav?: (key: BusinessPortalNavKey) => void;
  notificationCount?: number;
  onSignOut?: () => void;
}

export function MerchantWorkspaceChrome({
  children,
  activeNav,
  onNav,
  notificationCount = 3,
  onSignOut,
}: MerchantWorkspaceChromeProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg flex-shrink-0">
            <button type="button" onClick={() => onNav?.('overview')} className="flex items-center gap-space-xs">
              <span className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-display-hero text-heading-md font-bold select-none">
                V
              </span>
              <span className="font-heading-md text-heading-md font-bold tracking-tight text-primary-container">VEMTAP</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-subtle border border-border-subtle cursor-pointer hover:bg-surface-tint-blue transition-colors"
            >
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary leading-tight">Wuse II Branch</span>
                <span className="font-caption text-caption text-text-tertiary leading-tight">Abuja, FCT</span>
              </span>
              <Icon name="unfold_more" className="text-text-secondary text-[16px]" />
            </button>
          </div>

          <div className="flex items-center gap-space-md flex-shrink-0">
            <div className="hidden md:flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Cloud Synced</span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-140px)] flex-1">
        <PortalBody>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-canvas border-t border-border-subtle py-space-lg">
        <div className={`${PORTAL_CONTENT} flex flex-col md:flex-row items-center justify-between gap-space-md`}>
          <div className="flex items-center gap-space-sm text-text-secondary font-caption text-caption">
            <span>© 2025 VEMTAP Technologies Limited. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-lg text-text-secondary font-caption text-caption">
            <span className="flex items-center gap-space-2xs text-text-secondary">
              <Icon name="verified_user" className="text-[16px] text-badge-discount-text" />
              <span>NDPR Compliant</span>
            </span>
            <span className="flex items-center gap-space-2xs text-text-secondary">
              <Icon name="security" className="text-[16px] text-primary" />
              <span>ISO/IEC 27001 Certified</span>
            </span>
            <button type="button" className="hover:text-primary-container transition-colors">Privacy Policy</button>
            <button type="button" className="hover:text-primary-container transition-colors">Terms of Service</button>
            <button type="button" className="hover:text-primary-container transition-colors">Merchant Agreement</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
