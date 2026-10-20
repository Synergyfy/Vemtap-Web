import { useEffect, useRef, useState } from 'react';
import { URBAN_BUSINESS } from '../businessData';
import { useSwitchToCustomer } from '../../components/business/SwitchToCustomerDialog';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';

interface DesktopBusinessMoreScreenProps {
  onNav: (key: string) => void;
  onOpenPos: () => void;
  onOpenAnalytics: () => void;
  onOpenMarketing: () => void;
  onOpenStorefront: () => void;
  onOpenSubscription: () => void;
  onOpenVerification: () => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenCluster?: () => void;
  onSwitchConsumer: () => void;
  onSignOut: () => void;
  onOpenStoreOrdering?: (sub?: 'dashboard' | 'qr' | 'settings') => void;
}

interface RowData {
  key: string;
  icon: string;
  iconClass?: string;
  title: string;
  sub: string;
  badge?: string;
  badgeClass?: string;
  tag?: string;
  tagClass?: string;
  onClick: () => void;
}

interface SectionData {
  key: string;
  label: string;
  badge?: string;
  badgeClass?: string;
  link?: { label: string; onClick: () => void };
  rows: RowData[];
}

const LOGO_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2EiFZ1ls_xBxJJcrDj3qw0AC5jyu4f_R0K_rl_7aHafVCy_scGPJPVFD3zbfkLzbyasgUlVbewPilY0NbFEWncb0rqpRCUMK_1nYw-SfnxanH8nrzAtQT1DyFavq_aWGc8LGggveoK9u4F_5uEE68-d9ZrOxkg8PvV4ky_flx3H_6yeWcF8eq-dMrnpb_kSXbf4ghdvOJVfZEcxM82Q0BwA4X6tAMU2GiIN7vHwG-Y2Td-ZMMeNJyQw';

const GREEN_BADGE = 'bg-badge-discount-bg text-badge-discount-text';
const ERROR_BADGE = 'bg-error-container text-error';
const NEUTRAL_ICON = 'bg-surface-container-low text-on-surface-variant';

export function DesktopBusinessMoreScreen({
  onNav,
  onOpenPos,
  onOpenAnalytics,
  onOpenMarketing,
  onOpenStorefront,
  onOpenSubscription,
  onOpenVerification,
  onOpenNotifications,
  onOpenSupport,
  onOpenSettings,
  onOpenCluster,
  onSwitchConsumer,
  onSignOut,
  onOpenStoreOrdering,
}: DesktopBusinessMoreScreenProps) {
  const switchToCustomer = useSwitchToCustomer(onSwitchConsumer, URBAN_BUSINESS.name);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const sections: SectionData[] = [
    {
      key: 'cluster',
      label: 'Cluster System',
      badge: 'Amaka Mall',
      badgeClass: GREEN_BADGE,
      rows: [
        {
          key: 'cluster-system',
          icon: 'hub',
          iconClass: 'bg-surface-tint-blue text-primary',
          title: 'Cluster System Dashboard',
          sub: 'Mall network, shared QR pass, merchant directory & deal rotator',
          badge: 'Live',
          badgeClass: GREEN_BADGE,
          onClick: () => (onOpenCluster ? onOpenCluster() : onNav('cluster-system')),
        },
      ],
    },
    {
      key: 'store-ordering',
      label: 'Store Front & QR Touchpoints',
      badge: 'Live',
      badgeClass: GREEN_BADGE,
      rows: [
        {
          key: 'ordering-dash',
          icon: 'qr_code_scanner',
          title: 'Store Front Dashboard',
          sub: 'Live customer orders from QR codes & storefront',
          badge: 'Live',
          badgeClass: GREEN_BADGE,
          onClick: () =>
            onOpenStoreOrdering
              ? onOpenStoreOrdering('dashboard')
              : onNav('store-ordering-dashboard'),
        },
        {
          key: 'ordering-qr',
          icon: 'qr_code_2',
          title: 'QR Codes & Placement',
          sub: 'Store, Section, Product & Table placement codes',
          onClick: () =>
            onOpenStoreOrdering ? onOpenStoreOrdering('qr') : onNav('store-ordering-qr'),
        },
        {
          key: 'ordering-settings',
          icon: 'tune',
          title: 'Ordering Settings',
          sub: 'Pickup lead times, branch policies & rules',
          onClick: () =>
            onOpenStoreOrdering
              ? onOpenStoreOrdering('settings')
              : onNav('store-ordering-settings'),
        },
      ],
    },
    {
      key: 'pos',
      label: 'Point of Sale (POS)',
      badge: 'Active',
      badgeClass: GREEN_BADGE,
      rows: [
        {
          key: 'register',
          icon: 'point_of_sale',
          title: 'Point of Sale (POS)',
          sub: 'Launch register, products till & transactions',
          onClick: onOpenPos,
        },
      ],
    },
    {
      key: 'analytics',
      label: 'Analytics & Intelligence',
      link: { label: 'Insights', onClick: onOpenAnalytics },
      rows: [
        {
          key: 'insights',
          icon: 'insights',
          title: 'Analytics & Intelligence',
          sub: 'Revenue, sales reports & customer metrics',
          onClick: onOpenAnalytics,
        },
      ],
    },
    {
      key: 'marketing',
      label: 'Marketing & Growth',
      rows: [
        {
          key: 'marketing',
          icon: 'campaign',
          title: 'Marketing & Growth',
          sub: 'Boost deals, customer campaigns & segments',
          tag: 'HOT',
          tagClass: 'bg-error-container text-error',
          onClick: onOpenMarketing,
        },
        {
          key: 'network',
          icon: 'hub',
          title: 'Business Network',
          sub: 'Refer local peers, unlock perks & cross-promote',
          tag: 'NEW',
          tagClass: 'bg-surface-tint-blue text-primary',
          onClick: () => showToast('Business Network opens next release'),
        },
      ],
    },
    {
      key: 'discovery',
      label: 'QR & Storefront Discovery',
      rows: [
        {
          key: 'qr',
          icon: 'qr_code_2',
          title: 'QR & Storefront Discovery',
          sub: 'Master QR, table codes & local visibility',
          onClick: onOpenStorefront,
        },
      ],
    },
    {
      key: 'feedback',
      label: 'Customer Feedback & Alerts',
      rows: [
        {
          key: 'reviews',
          icon: 'hotel_class',
          title: 'Reviews & Ratings',
          sub: '4.9 ★ · 128 verified customer reviews',
          badge: '3 new',
          badgeClass: GREEN_BADGE,
          onClick: () => showToast('Opening 3 new reviews'),
        },
        {
          key: 'notifications',
          icon: 'notifications_active',
          iconClass: NEUTRAL_ICON,
          title: 'Notifications Center',
          sub: 'Till alerts, payout updates & staff clock-ins',
          badge: '4 unread',
          badgeClass: ERROR_BADGE,
          onClick: onOpenNotifications,
        },
      ],
    },
    {
      key: 'account',
      label: 'Account, Trust & Support',
      rows: [
        {
          key: 'billing',
          icon: 'credit_card',
          iconClass: NEUTRAL_ICON,
          title: 'Subscription & Billing',
          sub: 'Growth Tier · ₦5,000/mo · Next renewal Nov 14',
          onClick: onOpenSubscription,
        },
        {
          key: 'verification',
          icon: 'verified_user',
          iconClass: GREEN_BADGE,
          title: 'Business Verification',
          sub: 'CAC, Director ID & Bank Settlement Approved',
          badge: 'Tier 3',
          badgeClass: GREEN_BADGE,
          onClick: onOpenVerification,
        },
        {
          key: 'support',
          icon: 'support_agent',
          iconClass: NEUTRAL_ICON,
          title: 'Support & Help Desk',
          sub: 'Live WhatsApp support & merchant guides',
          onClick: onOpenSupport,
        },
        {
          key: 'settings',
          icon: 'tune',
          iconClass: NEUTRAL_ICON,
          title: 'Store Settings',
          sub: 'VAT/Taxes, thermal receipts & terminal permissions',
          onClick: () => showToast('Store settings coming soon'),
        },
        {
          key: 'business-settings',
          icon: 'settings',
          iconClass: NEUTRAL_ICON,
          title: 'Business Settings',
          sub: 'NDPR data rights, transaction PIN & account security',
          onClick: onOpenSettings,
        },
      ],
    },
  ];

  const renderRow = (row: RowData) => (
    <button
      className="w-full flex items-center gap-space-sm p-space-md text-left hover:bg-surface-subtle active:bg-surface-container-low transition-colors"
      key={row.key}
      type="button"
      onClick={row.onClick}
    >
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          row.iconClass ?? 'bg-surface-tint-blue text-primary'
        }`}
      >
        <Icon name={row.icon} className="text-[20px]" />
      </span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{row.title}</span>
          {row.tag && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${row.tagClass}`}
            >
              {row.tag}
            </span>
          )}
          {row.badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${row.badgeClass}`}
            >
              {row.badge}
            </span>
          )}
        </span>
        <span className="font-caption text-caption text-text-secondary truncate mt-0.5">{row.sub}</span>
      </span>
      <Icon name="chevron_right" className="text-[18px] text-text-tertiary shrink-0" />
    </button>
  );

  const renderSection = (section: SectionData) => (
    <div className="flex flex-col gap-2" key={section.key}>
      <div className="flex items-center justify-between gap-space-xs px-1">
        <span className="font-label-md text-label-md text-text-primary font-semibold tracking-wide uppercase truncate">
          {section.label}
        </span>
        {section.badge && (
          <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${section.badgeClass}`}>
            {section.badge}
          </span>
        )}
        {section.link && (
          <button
            className="flex items-center gap-0.5 font-label-sm text-label-sm text-primary font-semibold hover:underline transition-transform shrink-0"
            type="button"
            onClick={section.link.onClick}
          >
            <span>{section.link.label}</span>
            <Icon name="north_east" className="text-[15px]" />
          </button>
        )}
      </div>
      <div className="rounded-2xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden flex flex-col">
        {section.rows.map(renderRow)}
      </div>
    </div>
  );

  return (
    <BusinessPortalChrome activeNav="more" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        {/* Eyebrow, title & subtitle */}
        <section className="flex flex-col gap-space-2xs max-w-3xl">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
            Business Portal
          </span>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">More</h1>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Point of sale, analytics, growth tools, account trust and support — every secondary merchant control in one
            place.
          </p>
        </section>

        {/* Profile & live status deck */}
        <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full pointer-events-none blur-2xl" />
          <div className="flex items-start justify-between gap-space-sm relative z-10">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high shadow-inner">
                <img alt="Urban Grill & Bistro logo" className="w-full h-full object-cover" src={LOGO_SRC} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">
                    Urban Grill &amp; Bistro
                  </span>
                  <Icon name="verified" filled className="text-[18px] text-primary shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-caption text-caption text-text-tertiary">#VG-80492</span>
                  <span className="w-1 h-1 rounded-full bg-border-subtle" />
                  <span className="font-caption text-caption text-primary font-medium">Growth Plan</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-text-secondary min-w-0">
                  <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0" />
                  <span className="font-label-sm text-label-sm truncate">Wuse II, Abuja</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              title="Quick QR code"
              onClick={() => showToast('Business QR code ready to share')}
              className="shrink-0 w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <Icon name="qr_code_2" className="text-[20px]" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-space-xs pt-space-xs bg-surface-subtle rounded-xl px-space-sm py-2 relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 animate-pulse" />
              <span className="font-caption text-caption text-text-primary font-medium truncate">
                Terminal 01 Online
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-text-tertiary">
              <Icon name="cloud_done" className="text-[14px]" />
              <span className="font-caption text-caption">Synced 2m ago</span>
            </div>
          </div>
        </section>

        {/* Grouped link sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg items-start">
          {sections.map(renderSection)}

          {/* Switch to customer mode */}
          <section className="md:col-span-2 rounded-2xl bg-gradient-to-br from-surface-tint-blue via-surface-canvas to-surface-container-low p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
            <div className="flex items-center gap-space-sm">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="local_mall" className="text-[20px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Switch to Customer Mode
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Browse nearby deals, order food &amp; patronize businesses
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={switchToCustomer.request}
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
            >
              <span>Open Consumer Experience</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </section>

          {/* Destructive sign out row */}
          <section className="rounded-2xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden flex flex-col">
            <div className="px-space-md pt-space-md pb-space-2xs">
              <span className="font-label-md text-label-md text-text-primary font-semibold tracking-wide uppercase">
                Session
              </span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center gap-space-sm p-space-md text-left text-error hover:bg-error-container/40 active:bg-error-container transition-colors"
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-error-container text-error">
                <Icon name="logout" className="text-[20px]" />
              </span>
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md font-semibold truncate">Sign Out of Business</span>
                <span className="font-caption text-caption text-text-secondary truncate mt-0.5">
                  End this merchant session on the current device
                </span>
              </span>
              <Icon name="chevron_right" className="text-[18px] text-text-tertiary shrink-0" />
            </button>
          </section>
        </div>

        {/* Footnote */}
        <div className="flex flex-col items-center gap-space-xs pt-2 text-center">
          <span className="font-caption text-caption text-text-tertiary">
            VEMTAP Business OS · Version 2.4.0 (Build 9042)
          </span>
          <span className="flex items-center gap-1.5 text-text-tertiary">
            <Icon name="lock" className="text-[13px]" />
            <span className="font-caption text-caption">NDPR Compliant · ISO-27001 Certified Security</span>
          </span>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-margin">
          <div className="bg-surface-canvas border border-border-subtle text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
      {switchToCustomer.dialog}
    </BusinessPortalChrome>
  );
}
