import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

export type BusinessSetupNavKey = 'profile' | 'locations' | 'catalog' | 'payouts' | 'deals';

const NAV_ITEMS: Array<{ key: BusinessSetupNavKey; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'locations', label: 'Locations' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'payouts', label: 'Payouts' },
];

const FOOTER_LINKS = ['Privacy Policy', 'Merchant Terms', 'Compliance & NDPR', 'Merchant Desk'];

interface BusinessSetupChromeProps {
  children: ReactNode;
  activeNav?: BusinessSetupNavKey;
  onBrand?: () => void;
}

export function BusinessSetupChrome({ children, activeNav = 'profile', onBrand }: BusinessSetupChromeProps) {
  return (
    <div className="biz-flow w-full min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <button type="button" onClick={onBrand} className="flex items-center gap-space-xs text-left">
              <Logo variant="full" className="h-10 md:h-11 w-auto" />
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0 leading-none">
                BUSINESS
              </span>
            </button>
            <div className="hidden md:flex items-center gap-space-xs pl-space-md text-on-surface-variant">
              <span className="w-1 h-4 rounded-full bg-surface-variant" />
              <span className="font-label-md text-label-md text-text-secondary">Merchant Onboarding &amp; Setup</span>
            </div>
          </div>
          <div className="flex items-center gap-space-lg">
            <nav className="hidden lg:flex items-center gap-space-xs">
              {NAV_ITEMS.map((item) => {
                const active = item.key === activeNav;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    className={`px-space-sm py-space-xs transition-colors rounded-lg ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-semibold'
                        : 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center gap-space-md">
              <div className="hidden sm:flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">
                <Icon name="cloud_done" className="text-text-tertiary text-[16px]" />
                <span>Draft Saved</span>
              </div>
              <button
                type="button"
                className="hidden sm:flex items-center gap-space-2xs text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors"
              >
                <Icon name="help" className="text-[18px]" />
                <span>Support</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="person" className="text-on-primary text-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface flex-1">
        <div className="flex flex-col w-full">{children}</div>
      </main>

      <footer className="w-full bg-surface-subtle shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
            <span>© 2025 VEMTAP Technologies Ltd. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-label-sm text-caption text-badge-discount-text font-medium">
              NDPR &amp; Data Protection Compliant
            </span>
          </div>
          <div className="flex items-center gap-space-lg text-text-secondary font-caption text-caption">
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
