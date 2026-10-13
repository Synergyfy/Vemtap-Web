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

interface EnterpriseShellProps {
  children: ReactNode;
  activeNav?: BusinessPortalNavKey;
  onNav?: (key: BusinessPortalNavKey) => void;
  onSignOut?: () => void;
}

export function EnterpriseShell({ children, activeNav, onNav, onSignOut }: EnterpriseShellProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg shrink-0">
            <div className="flex items-center gap-space-xs">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
                <span className="text-on-primary font-heading-sm text-heading-sm">V</span>
              </div>
              <div className="flex items-center gap-space-2xs">
                <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">VEMTAP</span>
                <span className="px-space-2xs py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption tracking-wider uppercase font-semibold">
                  Merchant
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-subtle text-text-secondary">
              <Icon name="store" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Wuse II Branch, Abuja, FCT</span>
              <Icon name="expand_more" className="text-outline text-[16px]" />
            </div>
          </div>
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden md:flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              Live Synced
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="notifications" className="text-[20px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-canvas" />
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} />

      <main className="w-full pt-16 bg-surface">
        <PortalBody>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-container-low mt-space-3xl">
        <div className={`w-full ${PORTAL_CONTENT} py-space-xl`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-space-md pb-space-lg">
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-canvas text-text-secondary shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <Icon name="verified_user" className="text-primary text-[16px]" />
                <span className="font-caption text-caption font-medium">NDPR Compliant</span>
              </div>
              <div className="flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-canvas text-text-secondary shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <Icon name="security" className="text-primary text-[16px]" />
                <span className="font-caption text-caption font-medium">ISO/IEC 27001 Certified</span>
              </div>
              <div className="flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-surface-canvas text-text-secondary shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <Icon name="lock" className="text-badge-discount-text text-[16px]" />
                <span className="font-caption text-caption font-medium">256-Bit SSL Encrypted</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-md font-caption text-caption text-text-secondary">
              <button type="button" className="hover:text-primary transition-colors">
                Merchant Agreement
              </button>
              <button type="button" className="hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button type="button" className="hover:text-primary transition-colors">
                Security Standards
              </button>
              <button type="button" className="flex items-center gap-space-2xs hover:text-primary transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                System Status
              </button>
            </div>
          </div>
          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm text-text-tertiary font-caption text-caption">
            <span>© 2025 VEMTAP Technologies Limited. All rights reserved. Enterprise Merchant Operating System.</span>
            <span className="text-text-secondary">OS Version 4.8.2-NG Enterprise Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
