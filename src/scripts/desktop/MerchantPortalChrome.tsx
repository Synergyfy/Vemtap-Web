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

interface MerchantPortalChromeProps {
  children: ReactNode;
  activeNav?: BusinessPortalNavKey;
  onNav?: (key: BusinessPortalNavKey) => void;
  /** `'full'` opts a screen out of the standard 1440px container. */
  content?: 'contained' | 'full';
  onSignOut?: () => void;
}

export function MerchantPortalChrome({
  children,
  activeNav,
  onNav,
  content = 'contained',
  onSignOut,
}: MerchantPortalChromeProps) {
  const handleAccount = (key: ShellAccountKey) => {
    if (key === 'sign-out') onSignOut?.();
    else onNav?.(key);
  };

  return (
    <div className={`w-full min-h-screen bg-surface font-body-md text-on-surface flex flex-col ${RAIL_OFFSET}`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <button
              type="button"
              onClick={() => onNav?.('overview')}
              className="flex items-center gap-space-xs flex-shrink-0"
            >
              <span className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_4px_16px_-2px_rgba(6,108,244,0.3)]">
                <Icon name="bolt" className="text-[20px]" />
              </span>
              <span className="flex flex-col text-left">
                <span className="font-heading-sm text-heading-sm tracking-tight text-text-primary leading-none">VEMTAP</span>
                <span className="font-caption text-caption text-text-tertiary leading-none mt-1 uppercase tracking-wider">
                  Merchant
                </span>
              </span>
            </button>
            <span className="h-6 w-px bg-surface-variant" />
            <button
              type="button"
              className="relative flex items-center gap-space-xs bg-surface-subtle hover:bg-surface-container-low px-space-sm py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              <Icon name="storefront" className="text-primary text-[18px]" />
              <span className="flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-text-primary font-medium leading-tight">Wuse II Branch</span>
                <span className="font-caption text-caption text-text-tertiary leading-tight">Abuja, FCT</span>
              </span>
              <Icon name="expand_more" className="text-text-tertiary text-[18px] ml-space-xs" />
            </button>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Cloud Synced</span>
            </div>
            <span className="h-5 w-px bg-surface-variant hidden sm:block" />
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="notifications" className="text-[22px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-canvas" />
            </button>
            <ShellAccountMenu onSelect={handleAccount} />
          </div>
        </div>
      </header>

      <PortalRail groups={NAV_GROUPS} active={activeNav} onSelect={onNav} />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-160px)] flex-1">
        <PortalBody content={content}>{children}</PortalBody>
      </main>

      <footer className="w-full bg-surface-container-low py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className={`${PORTAL_CONTENT} flex flex-col md:flex-row items-center justify-between gap-space-lg`}>
          <div className="flex flex-col gap-space-2xs text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-space-xs">
              <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight">VEMTAP</span>
              <span className="font-caption text-caption text-text-tertiary">Merchant Platform OS</span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              © 2025 VEMTAP Technologies Ltd. All rights reserved. Built for high-volume retail &amp; commerce.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <span className="flex items-center gap-1.5 px-space-xs py-1 rounded-lg bg-surface-canvas text-text-secondary font-caption text-caption shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <Icon name="verified_user" className="text-[16px] text-badge-discount-text" />
              <span>NDPR Compliant</span>
            </span>
            <span className="flex items-center gap-1.5 px-space-xs py-1 rounded-lg bg-surface-canvas text-text-secondary font-caption text-caption shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <Icon name="security" className="text-[16px] text-primary" />
              <span>ISO/IEC 27001 Certified</span>
            </span>
            <span className="flex items-center gap-1.5 px-space-xs py-1 rounded-lg bg-surface-canvas text-text-secondary font-caption text-caption shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <Icon name="lock" className="text-[16px] text-badge-discount-text" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md font-caption text-caption text-text-tertiary">
            <button type="button" className="hover:text-text-primary transition-colors">Merchant Terms</button>
            <button type="button" className="hover:text-text-primary transition-colors">Privacy Policy</button>
            <button type="button" className="hover:text-text-primary transition-colors">Merchant SLA</button>
            <button type="button" className="hover:text-text-primary transition-colors">Support Desk</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
