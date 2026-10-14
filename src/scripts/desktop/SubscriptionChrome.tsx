import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

export type SubscriptionNavKey =
  | 'overview'
  | 'profile'
  | 'locations'
  | 'catalog'
  | 'deals'
  | 'analytics'
  | 'payouts'
  | 'billing';

const NAV_ITEMS: Array<{ key: SubscriptionNavKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Profile' },
  { key: 'locations', label: 'Locations' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'deals', label: 'Deals' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'billing', label: 'Subscription & Billing' },
];

const FOOTER_LINKS = ['Security Standards', 'NDPR & Privacy', 'Merchant Agreement', 'Support Desk'];

interface SubscriptionChromeProps {
  children: ReactNode;
  activeNav?: SubscriptionNavKey;
  onNav?: (key: SubscriptionNavKey) => void;
  onBrand?: () => void;
  onHelp?: () => void;
  breadcrumb?: string;
  breadcrumbRoot?: string;
  statusPills?: string[];
}

export function SubscriptionChrome({
  children,
  activeNav = 'billing',
  onNav,
  onBrand,
  onHelp,
  breadcrumb,
  breadcrumbRoot = 'Subscription & Billing',
  statusPills,
}: SubscriptionChromeProps) {
  return (
    <div className="w-full min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-canvas/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg min-w-0">
            <button type="button" onClick={onBrand} className="flex items-center gap-space-xs shrink-0">
              <Logo variant="full" className="h-10 md:h-11 w-auto" />
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0 leading-none">
                BUSINESS
              </span>
            </button>
            <nav className="hidden xl:flex items-center gap-space-2xs min-w-0">
              {NAV_ITEMS.map((item) => {
                const active = item.key === activeNav;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => onNav?.(item.key)}
                    className={`px-space-sm py-space-xs rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-primary-container text-on-primary-container font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden md:flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-subtle text-text-secondary">
              <Icon name="cloud_done" className="text-badge-discount-text text-[16px]" />
              <span className="font-caption text-caption">Auto-saved</span>
            </div>
            <button
              type="button"
              aria-label="Help"
              onClick={onHelp}
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            >
              <Icon name="help" className="text-[20px]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name="person" filled className="text-[18px]" />
            </div>
          </div>
        </div>
        {(breadcrumb || statusPills?.length) && (
          <div className="border-t border-border-subtle/60">
            <div className="h-11 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
              {breadcrumb ? (
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-text-secondary">
                  <span>{breadcrumbRoot}</span>
                  <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
                  <span className="text-text-primary font-medium">{breadcrumb}</span>
                </div>
              ) : (
                <span />
              )}
              {statusPills?.length ? (
                <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
                  {statusPills.map((pill) => (
                    <span
                      key={pill}
                      className="px-space-xs py-space-2xs rounded-full bg-surface-container-low border border-border-subtle/60"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-20 bg-background min-h-screen flex-1">
        {breadcrumb || statusPills?.length ? <div className="h-11" /> : null}
        <div className="flex flex-col w-full">{children}</div>
      </main>

      <footer className="w-full bg-surface-container-low py-space-2xl mt-space-2xl">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="bolt" filled className="text-on-primary text-[18px]" />
            </span>
            <span className="font-label-md text-label-md text-text-primary font-semibold">
              VEMTAP Business Enterprise Compliance
            </span>
          </div>
          <div className="text-center">
            <p className="font-caption text-caption text-text-secondary">
              © 2025 VEMTAP Technologies Ltd. Encrypted PCI-DSS Level 1 Merchant Gateway. ISO/IEC 27001 Certified &amp;
              NDPR Compliant.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-lg font-label-sm text-label-sm text-text-secondary">
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
