import { useEffect, useRef, useState } from 'react';
import { useSwitchToCustomer } from '../components/business/SwitchToCustomerDialog';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MobileAccountMenu, MobileLocationMenu, MobileNotificationBell } from '../components/BusinessHeaderMenus';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { URBAN_BUSINESS } from './businessData';
import { useMoreSummary } from '../hooks/business/useMoreSummary';

interface BusinessMoreScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenAnalytics: () => void;
  onOpenMarketing: () => void;
  onOpenSubscription: () => void;
  onOpenAddOns: () => void;
  onOpenVerification: () => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenCluster?: () => void;
  /** Opens a page by its business nav key (same keys as the desktop sidebar). */
  onNavKey: (key: string) => void;
  onSwitchConsumer: () => void;
  onSignOut: () => void;
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
const ERROR_BADGE = 'bg-error-container text-on-error-container';

export function BusinessMoreScreen({
  onTab,
  onOpenAnalytics,
  onOpenMarketing,
  onOpenSubscription,
  onOpenAddOns,
  onOpenVerification,
  onOpenNotifications,
  onOpenSupport,
  onOpenSettings,
  onOpenCluster,
  onNavKey,
  onSwitchConsumer,
  onSignOut,
}: BusinessMoreScreenProps) {
  const { branch } = useBusinessBranch();
  const more = useMoreSummary();
  const card = more.live
    ? {
        name: more.name ?? 'Your business',
        code: more.code,
        plan: more.planName,
        location: more.location,
        logo: more.logoUrl,
        verified: more.verified,
        status: `${more.branchName} · Online`,
        synced: 'Live data',
      }
    : {
        name: URBAN_BUSINESS.name,
        code: '#VG-80492',
        plan: 'Growth Plan',
        location: branch.area,
        logo: LOGO_SRC,
        verified: true,
        status: 'Terminal 01 Online',
        synced: 'Synced 2m ago',
      };
  const switchToCustomer = useSwitchToCustomer(onSwitchConsumer, card.name);
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

  // Order mirrors the desktop More side-menu list — keep both in sync.
  // POS and Store Front now live in the POS menu (Overview quick action).
  const sections: SectionData[] = [
    {
      key: 'cluster',
      label: 'Cluster System',
      rows: [
        {
          key: 'cluster-system',
          icon: 'hub',
          iconClass: 'bg-surface-tint-blue text-primary',
          title: 'Cluster System',
          sub: 'Mall network, shared QR & deal rotator pool',
          badge: more.live ? more.clusterName ?? undefined : 'Amaka Mall',
          badgeClass: GREEN_BADGE,
          onClick: onOpenCluster || (() => {}),
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
          tagClass: 'bg-error-container text-on-error-container',
          onClick: onOpenMarketing,
        },
      ],
    },
    {
      key: 'network',
      label: 'Business Network',
      rows: [
        {
          key: 'network-dashboard',
          icon: 'diversity_3',
          title: 'Business Network',
          sub: 'Invite businesses & climb the milestone ladder',
          onClick: () => onNavKey('network-dashboard'),
        },
        {
          key: 'network-referrals',
          icon: 'group_add',
          title: 'My Referrals',
          sub: 'Businesses that joined with your code',
          onClick: () => onNavKey('network-referrals'),
        },
        {
          key: 'network-discovery',
          icon: 'travel_explore',
          title: 'Discovery Presence',
          sub: 'How customers find you nearby',
          onClick: () => onNavKey('network-discovery'),
        },
      ],
    },
    {
      key: 'catalogue',
      label: 'Catalogue',
      rows: [
        {
          key: 'categories',
          icon: 'category',
          title: 'Catalogue Categories',
          sub: 'Group items & set your menu order',
          onClick: () => onNavKey('business-categories'),
        },
      ],
    },
    {
      key: 'reputation',
      label: 'Reputation',
      rows: [
        {
          key: 'reviews',
          icon: 'reviews',
          iconClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
          title: 'Reviews & Reputation',
          sub: 'Moderate deal reviews & reply to guests',
          onClick: () => onNavKey('more-reviews'),
        },
        {
          key: 'deal-ledger',
          icon: 'receipt_long',
          title: 'Deal Redemption Ledger',
          sub: 'Every claim, redemption & discount given',
          onClick: () => onNavKey('business-deal-ledger'),
        },
      ],
    },
    {
      key: 'analytics',
      label: 'Analytics',
      rows: [
        {
          key: 'insights',
          icon: 'insights',
          title: 'Analytics & Intelligence',
          sub: 'Revenue, sales reports & customer metrics',
          onClick: onOpenAnalytics,
        },
        {
          key: 'intelligence',
          icon: 'auto_awesome',
          title: 'Vemtap Intelligence',
          sub: 'Live trends, comparisons & what to act on',
          onClick: () => onNavKey('more-intelligence'),
        },
      ],
    },
    {
      key: 'billing',
      label: 'Subscription & Billing',
      rows: [
        {
          key: 'subscription',
          icon: 'credit_card',
          iconClass: 'bg-surface-container text-on-surface-variant',
          title: 'Subscription & Billing',
          sub: more.live ? more.planLine ?? 'View your plan & billing' : 'Growth Tier · ₦5,000/mo · Next renewal Nov 14',
          onClick: onOpenSubscription,
        },
        {
          key: 'addons',
          icon: 'extension',
          iconClass: 'bg-surface-container text-on-surface-variant',
          title: 'Add-ons & Credits',
          sub: 'SMS credits, boosts & paid extensions',
          onClick: onOpenAddOns,
        },
      ],
    },
    {
      key: 'notifications',
      label: 'Notifications',
      rows: [
        {
          key: 'notifications',
          icon: 'notifications_active',
          iconClass: 'bg-surface-container text-on-surface-variant',
          title: 'Notifications Center',
          sub: 'Till alerts, payout updates & staff clock-ins',
          badge: more.live ? (more.unread ? `${more.unread} unread` : undefined) : '4 unread',
          badgeClass: ERROR_BADGE,
          onClick: onOpenNotifications,
        },
      ],
    },
    {
      key: 'verification',
      label: 'Verification',
      rows: [
        {
          key: 'verification',
          icon: 'verified_user',
          iconClass: GREEN_BADGE,
          title: 'Business Verification',
          sub: !more.live || more.verified ? 'CAC, Director ID & Bank Settlement Approved' : 'Verify your business to earn the badge',
          badge: more.live ? (more.verified ? 'Verified' : 'Not verified') : 'Tier 3',
          badgeClass: GREEN_BADGE,
          onClick: onOpenVerification,
        },
      ],
    },
    {
      key: 'support',
      label: 'Help & Support',
      rows: [
        {
          key: 'support',
          icon: 'support_agent',
          iconClass: 'bg-surface-container text-on-surface-variant',
          title: 'Support & Help Desk',
          sub: 'Live WhatsApp support & merchant guides',
          onClick: onOpenSupport,
        },
      ],
    },
    {
      key: 'settings',
      label: 'Business Settings',
      rows: [
        {
          key: 'business-settings',
          icon: 'settings',
          iconClass: 'bg-surface-container text-on-surface-variant',
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
      <Icon name="chevron_right" className="text-[18px] text-outline-variant shrink-0" />
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
            className="flex items-center gap-0.5 font-label-sm text-label-sm text-primary font-semibold active:scale-95 transition-transform shrink-0"
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
    <div className="biz-flow">
      <AppScreen>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate">More</h1>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              {/* Persistent location switcher — sits right by the notification bell. */}
              <MobileLocationMenu />
              <MobileNotificationBell />
              <MobileAccountMenu />
            </div>
          </div>
        </header>

        <div className="flex flex-col w-full flex-1 pb-24">
          <div className="px-margin pt-space-sm space-y-space-lg pb-space-xl">
            {/* Profile & live status deck */}
            <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full pointer-events-none blur-2xl" />
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high shadow-inner">
                    {card.logo ? (
                      <img alt={`${card.name} logo`} className="w-full h-full object-cover" src={card.logo} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-heading-sm text-heading-sm text-primary">
                        {card.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">
                        {card.name}
                      </span>
                      {card.verified && <Icon name="verified" filled className="text-[18px] text-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {card.code && <span className="font-caption text-caption text-text-tertiary">{card.code}</span>}
                      {card.code && card.plan && <span className="w-1 h-1 rounded-full bg-outline-variant" />}
                      {card.plan && <span className="font-caption text-caption text-primary font-medium">{card.plan}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-text-secondary min-w-0">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0" />
                      <span className="font-label-sm text-label-sm truncate">{card.location ?? 'Add your address'}</span>
                    </div>
                  </div>
                </div>
                <button
                  aria-label="Quick QR code"
                  className="shrink-0 w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center active:scale-95 transition-transform"
                  type="button"
                  onClick={() => showToast('Business QR code ready to share')}
                >
                  <Icon name="qr_code_2" className="text-[20px]" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-space-xs pt-space-xs bg-surface-subtle/80 rounded-xl px-space-sm py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 animate-pulse" />
                  <span className="font-caption text-caption text-text-primary font-medium truncate">
                    {card.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-text-tertiary">
                  <Icon name="cloud_done" className="text-[14px]" />
                  <span className="font-caption text-caption">{card.synced}</span>
                </div>
              </div>
            </section>

            {sections.map(renderSection)}

            {/* Switch to customer mode */}
            <section className="rounded-2xl bg-gradient-to-br from-surface-tint-blue via-surface-canvas to-surface-container-low p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-center gap-space-sm">
                <span className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="local_mall" className="text-[20px]" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">Switch to Customer Mode</span>
                  <span className="font-caption text-caption text-text-secondary">
                    Browse nearby deals, order food &amp; patronize businesses
                  </span>
                </div>
              </div>
              <button
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                type="button"
                onClick={switchToCustomer.request}
              >
                <span>Open Consumer Experience</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </section>

            {/* Sign out & footnote */}
            <div className="flex flex-col items-center gap-space-sm pt-2 text-center">
              <button
                className="h-11 px-6 rounded-xl text-error font-label-md text-label-md hover:bg-error-container/20 active:bg-error-container/40 transition-colors flex items-center gap-2"
                type="button"
                onClick={onSignOut}
              >
                <Icon name="logout" className="text-[18px]" />
                <span>Sign Out of Business</span>
              </button>
              <div className="flex flex-col items-center gap-1">
                <span className="font-caption text-caption text-text-tertiary">
                  VEMTAP Business OS · Version 2.4.0 (Build 9042)
                </span>
                <span className="flex items-center gap-1.5 text-text-tertiary">
                  <Icon name="lock" className="text-[13px]" />
                  <span className="font-caption text-caption">NDPR Compliant · ISO-27001 Certified Security</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
            <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
              <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
              <span className="truncate">{toast}</span>
            </div>
          </div>
        )}

        <BusinessTabBar active="more" onTab={onTab} />
      </AppScreen>
      {switchToCustomer.dialog}
    </div>
  );
}
