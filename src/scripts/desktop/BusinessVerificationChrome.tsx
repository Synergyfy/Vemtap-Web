import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';

export type BusinessVerificationNavKey =
  | 'profile'
  | 'locations'
  | 'catalog'
  | 'deals'
  | 'analytics'
  | 'payouts'
  | 'trust';

const NAV_ITEMS: Array<{ key: BusinessVerificationNavKey; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'locations', label: 'Locations' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'deals', label: 'Deals' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'trust', label: 'Trust & Verification' },
];

const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Merchant Helpdesk'];

interface BusinessVerificationChromeProps {
  children: ReactNode;
  activeNav?: BusinessVerificationNavKey;
  onNav?: (key: BusinessVerificationNavKey) => void;
  onBrand?: () => void;
}

export function BusinessVerificationChrome({
  children,
  activeNav = 'trust',
  onNav,
  onBrand,
}: BusinessVerificationChromeProps) {
  return (
    <div className="w-full min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-28 max-w-7xl mx-auto px-margin flex flex-col justify-between">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-space-lg">
              <button type="button" onClick={onBrand} className="flex items-center gap-space-xs">
                <span className="font-heading-md text-heading-md text-primary tracking-tight font-bold">VEMTAP</span>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-primary font-caption text-caption uppercase font-semibold tracking-wider">
                  BUSINESS
                </span>
              </button>
              <nav className="hidden xl:flex items-center gap-space-xs">
                {NAV_ITEMS.map((item) => {
                  const active = item.key === activeNav;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => onNav?.(item.key)}
                      className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="hidden md:flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-subtle text-text-secondary">
                <Icon name="cloud_done" className="text-badge-discount-text text-[16px]" />
                <span className="font-caption text-caption">Auto-saved</span>
              </div>
              <button
                type="button"
                aria-label="Help"
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <Icon name="help" className="text-[20px]" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="person" className="text-on-primary text-[18px]" />
              </div>
            </div>
          </div>
          <div className="h-12 flex items-center justify-between">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-text-secondary">
              <button type="button" onClick={() => onNav?.('profile')} className="hover:text-primary transition-colors">
                Merchant Portal
              </button>
              <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
              <button type="button" onClick={() => onNav?.('trust')} className="hover:text-primary transition-colors">
                Trust &amp; Compliance
              </button>
              <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
              <span className="text-text-primary font-medium">Business Verification</span>
            </div>
            <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span>Production Workspace Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-28 bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">{children}</div>
      </main>

      <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)] mt-space-2xl">
        <div className="max-w-7xl mx-auto px-margin py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs text-left">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-badge-discount-bg text-badge-discount-text">
                <Icon name="verified_user" className="text-[16px]" />
                <span className="font-caption text-caption font-semibold">NDPR Compliant</span>
              </div>
              <div className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg bg-surface-subtle text-text-secondary">
                <Icon name="lock" className="text-[16px]" />
                <span className="font-caption text-caption font-semibold">ISO 27001 Certified Enterprise Rails</span>
              </div>
            </div>
            <p className="font-caption text-caption text-text-tertiary">© 2025 VEMTAP Technologies Ltd. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-lg font-label-sm text-label-sm text-text-secondary">
            {FOOTER_LINKS.map((label) => (
              <button key={label} type="button" className="hover:text-primary transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
