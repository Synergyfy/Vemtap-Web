import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { SegmentRef } from '../BusinessSegmentsHubScreen';

interface DesktopSegmentsHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onOpenBoost: () => void;
  onOpenCampaigns: () => void;
  onCreate: () => void;
  onUseSegment: (segment: SegmentRef) => void;
  onViewCohort: () => void;
}

type SegmentCategory = 'default' | 'custom';

interface SegmentCard {
  key: string;
  category: SegmentCategory;
  icon: string;
  iconBoxClass: string;
  title: string;
  badge?: string;
  badgeClass?: string;
  meta: string;
  count: string;
  countClass?: string;
  desc: string;
  highlight: { icon: string; text: ReactNode; className: string };
  topBadge?: string;
  viewCohort?: boolean;
  ref: SegmentRef;
}

const SEGMENTS: SegmentCard[] = [
  {
    key: 'all-customers',
    category: 'default',
    icon: 'groups',
    iconBoxClass: 'bg-surface-tint-blue text-primary',
    title: 'All Customers',
    badge: 'Core',
    badgeClass: 'bg-surface-subtle text-text-secondary',
    meta: 'Last updated: Just now',
    count: '1,482',
    desc: 'Every customer profile that has transacted, claimed a deal, or interacted with Urban Grill & Bistro.',
    highlight: {
      icon: 'cell_tower',
      className: 'bg-surface-subtle',
      text: (
        <>
          <strong className="text-text-primary">1,320</strong> Reachable via Push/Feed •{' '}
          <strong className="text-text-primary">940</strong> In-App Chat
        </>
      ),
    },
    ref: {
      name: 'All Customers',
      count: '1,482',
      meta: 'Core CRM segment',
      desc: 'Every customer profile that has transacted, claimed a deal, or interacted with your business.',
    },
  },
  {
    key: 'returning',
    category: 'default',
    icon: 'cycle',
    iconBoxClass: 'bg-primary-container text-on-primary shadow-sm',
    title: 'Returning Customers',
    topBadge: 'Most Active Cohort',
    meta: 'Loyalty acceleration • 12m ago',
    count: '294',
    countClass: 'text-primary font-bold',
    desc: 'Customers who have interacted or ordered from your business 2 or more times.',
    highlight: {
      icon: 'trending_up',
      className: 'bg-surface-canvas shadow-sm flex items-center justify-between',
      text: (
        <>
          <span className="flex items-center gap-1.5">
            <span className="font-caption text-caption text-text-primary font-medium">68.2% Repeat Rate</span>
          </span>
          <span className="font-caption text-caption text-text-secondary">
            Avg. Basket <strong>₦11,200</strong>
          </span>
        </>
      ),
    },
    viewCohort: true,
    ref: {
      name: 'Returning Customers',
      count: '294',
      meta: '68.2% repeat interaction rate',
      desc: 'Interacted or placed 2+ orders at Urban Grill & Bistro in the trailing 90 days.',
    },
  },
  {
    key: 'frequent',
    category: 'default',
    icon: 'workspace_premium',
    iconBoxClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    title: 'Frequent Customers',
    badge: 'VIP Tier',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold',
    meta: 'Last updated: 1 hour ago',
    count: '76',
    countClass: 'text-tertiary font-bold',
    desc: 'High-frequency patrons with 5+ visits or >₦100,000 total verified spend.',
    highlight: {
      icon: 'diamond',
      className: 'bg-tertiary-fixed/30',
      text: (
        <span className="font-caption text-caption text-on-tertiary-fixed-variant font-medium">
          Generates 43% of in-store gross sales
        </span>
      ),
    },
    ref: {
      name: 'Frequent VIPs',
      count: '76',
      meta: 'High-value patrons',
      desc: 'High-frequency patrons with 5+ visits or more than ₦100,000 total verified spend.',
    },
  },
  {
    key: 'new-customers',
    category: 'default',
    icon: 'waving_hand',
    iconBoxClass: 'bg-surface-container text-primary',
    title: 'New Customers',
    meta: 'First 30 Days • Today, 11:30 AM',
    count: '218',
    desc: "First-time patrons within the trailing 30 days who haven't made a 2nd visit yet.",
    highlight: {
      icon: 'lightbulb',
      className: 'bg-surface-tint-blue',
      text: (
        <span className="font-caption text-caption text-text-secondary">
          Strategy: Ideal for 2nd-visit incentive deals or welcome messages.
        </span>
      ),
    },
    ref: {
      name: 'New Customers (30d)',
      count: '218',
      meta: 'Prospective regulars',
      desc: "First-time patrons within the trailing 30 days who haven't made a second visit yet.",
    },
  },
  {
    key: 'dormant',
    category: 'default',
    icon: 'bedtime',
    iconBoxClass: 'bg-surface-container-highest text-text-secondary',
    title: 'Inactive / Dormant',
    meta: '60d+ No Visit • Yesterday',
    count: '186',
    countClass: 'text-text-secondary',
    desc: 'Prior customers with zero orders, deal claims, or table visits in the past 60+ days.',
    highlight: {
      icon: 'history',
      className: 'bg-error-container/40',
      text: (
        <span className="font-caption text-caption text-on-error-container font-medium">
          High opportunity for targeted reactivation boost.
        </span>
      ),
    },
    ref: {
      name: 'Dormant Diners (60d+)',
      count: '186',
      meta: 'Win-back targets',
      desc: 'Prior customers with zero orders, deal claims, or table visits in the past 60+ days.',
    },
  },
  {
    key: 'lunch-claimers',
    category: 'custom',
    icon: 'restaurant_menu',
    iconBoxClass: 'bg-secondary-fixed text-primary',
    title: 'Prime Lunch Combo Claimers',
    badge: 'Custom',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant font-bold',
    meta: '2 days ago',
    count: '142',
    desc: 'Customers who claimed or redeemed the “Prime Lunch Combo (20% OFF)” voucher.',
    highlight: {
      icon: 'ads_click',
      className: 'bg-surface-subtle',
      text: (
        <span className="font-caption text-caption text-text-secondary">
          Source: <strong>Deal Campaign Attribution</strong>
        </span>
      ),
    },
    ref: {
      name: 'Prime Lunch Claimers',
      count: '142',
      meta: 'Lunch patrons',
      desc: 'Customers who claimed or redeemed the Prime Lunch Combo (20% OFF) voucher.',
    },
  },
  {
    key: 'wuse-regulars',
    category: 'custom',
    icon: 'qr_code_scanner',
    iconBoxClass: 'bg-surface-tint-blue text-primary',
    title: 'Wuse II Regulars',
    badge: 'Custom',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant font-bold',
    meta: 'Sync: Continuous',
    count: '410',
    desc: 'Diners who checked in or scanned Table QR specifically at Wuse II Flagship location.',
    highlight: {
      icon: 'location_on',
      className: 'bg-surface-subtle',
      text: <span className="font-caption text-caption text-text-secondary">Verified Physical Check-In Footfall</span>,
    },
    ref: {
      name: 'Wuse II Regulars',
      count: '410',
      meta: 'Verified in-store guests',
      desc: 'Diners who checked in or scanned Table QR specifically at the Wuse II Flagship location.',
    },
  },
  {
    key: 'ribeye-enthusiasts',
    category: 'custom',
    icon: 'skillet',
    iconBoxClass: 'bg-tertiary-fixed text-tertiary',
    title: 'High-Value Ribeye Enthusiasts',
    badge: 'Custom',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant font-bold',
    meta: 'POS Sync',
    count: '94',
    countClass: 'text-tertiary font-bold',
    desc: 'Purchased Woodfire Ribeye Steak or spent >₦25,000 on POS ticket.',
    highlight: {
      icon: 'receipt',
      className: 'bg-surface-subtle',
      text: <span className="font-caption text-caption text-text-secondary">Direct POS Menu-item correlation</span>,
    },
    ref: {
      name: 'Ribeye Enthusiasts',
      count: '94',
      meta: 'Premium foodies',
      desc: 'Purchased Woodfire Ribeye Steak or spent more than ₦25,000 on a single POS ticket.',
    },
  },
];

const CARD_SHADOW = 'shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)]';

export function DesktopSegmentsHubScreen({
  onNav,
  onBack,
  onOpenBoost,
  onOpenCampaigns,
  onCreate,
  onUseSegment,
  onViewCohort,
}: DesktopSegmentsHubScreenProps) {
  const [filter, setFilter] = useState<'all' | 'default' | 'custom'>('all');
  const [drawerSegment, setDrawerSegment] = useState<SegmentCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const visibleSegments = SEGMENTS.filter((entry) => filter === 'all' || entry.category === filter);
  const defaultCount = SEGMENTS.filter((entry) => entry.category === 'default').length;
  const customCount = SEGMENTS.filter((entry) => entry.category === 'custom').length;
  const showDefaultSection = filter !== 'custom';
  const showCustomSection = filter !== 'default';

  const FILTER_TABS: { key: 'all' | 'default' | 'custom'; label: string }[] = [
    { key: 'all', label: `All Segments (${SEGMENTS.length})` },
    { key: 'default', label: `Default (${defaultCount})` },
    { key: 'custom', label: `Custom (${customCount})` },
  ];

  const renderCard = (entry: SegmentCard) => (
    <div
      className={`rounded-xl p-space-md flex flex-col gap-space-sm transition-shadow hover:shadow-md ${
        entry.key === 'returning'
          ? 'bg-gradient-to-b from-surface-tint-blue/70 to-surface-canvas shadow-[0_6px_20px_-2px_rgba(6,108,244,0.08)]'
          : `bg-surface-canvas ${CARD_SHADOW}`
      }`}
      key={entry.key}
    >
      {entry.topBadge && (
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text text-caption font-caption font-semibold flex items-center gap-1">
            <Icon name="star" className="text-[14px]" />
            {entry.topBadge}
          </span>
          <span className="text-caption font-caption text-text-tertiary">{entry.meta.split('•').pop()?.trim()}</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-space-xs">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${entry.iconBoxClass}`}>
            <Icon name={entry.icon} className="text-[24px]" filled={entry.key === 'returning'} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-heading-sm text-heading-sm text-text-primary font-semibold truncate">{entry.title}</h4>
              {entry.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-caption font-caption shrink-0 ${entry.badgeClass ?? 'bg-surface-subtle text-text-secondary'}`}
                >
                  {entry.badge}
                </span>
              )}
            </div>
            <span className="text-caption font-caption text-text-tertiary truncate">{entry.meta}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`font-heading-md text-heading-md text-text-primary ${entry.countClass ?? ''}`}>
            {entry.count}
          </span>
          <span className="text-caption font-caption text-text-secondary">diners</span>
        </div>
      </div>
      <p className="text-body-md font-body-md text-text-secondary">{entry.desc}</p>
      <div className={`p-space-xs rounded-lg flex items-center gap-2 ${entry.highlight.className}`}>
        {entry.key !== 'returning' && (
          <Icon name={entry.highlight.icon} className="text-[18px] shrink-0 text-primary" />
        )}
        <span className="text-caption font-caption text-text-secondary leading-tight min-w-0">
          {entry.highlight.text}
        </span>
      </div>
      <div className={`gap-space-xs pt-1 ${entry.viewCohort ? 'grid grid-cols-2' : 'flex'}`}>
        {entry.viewCohort && (
          <button
            className="h-10 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary font-medium transition-colors"
            type="button"
            onClick={onViewCohort}
          >
            View Cohort
          </button>
        )}
        <button
          className={`h-10 rounded-lg font-button-secondary text-button-secondary flex items-center justify-center gap-1 transition-all ${
            entry.viewCohort
              ? 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(6,108,244,0.2)] hover:opacity-95'
              : 'w-full bg-primary text-on-primary hover:opacity-95'
          }`}
          type="button"
          onClick={() => setDrawerSegment(entry)}
        >
          <span>Use Segment</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
        {!entry.viewCohort && (
          <button
            aria-label={`More options for ${entry.title}`}
            className="w-10 h-10 rounded-lg bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors shrink-0"
            type="button"
            onClick={() => showToast(`${entry.title} — options menu opened`)}
          >
            <Icon name="more_horiz" className="text-[20px]" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <BusinessPortalChrome activeNav="customers" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm flex-wrap">
            <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('customers')}>
              Customers
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <button type="button" className="hover:text-primary transition-colors" onClick={() => onNav('customers')}>
              Customer CRM
            </button>
            <Icon name="chevron_right" className="text-outline text-[16px]" />
            <span className="text-text-primary font-semibold">Customer Segments Hub</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors font-label-md text-label-md w-fit"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>Back to Marketing &amp; Growth</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-xs">
              <Icon name="verified" className="text-primary text-[18px]" />
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                Urban Grill &amp; Bistro • Wuse II
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-caption font-caption text-text-tertiary">NDPR Compliant</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Customer Segments</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Define targeted diner cohorts for promotions, campaigns, and direct messaging.
            </p>
            <div className="inline-flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="text-caption font-caption text-text-tertiary">
                Connected directly to Business → Customers CRM data (NDPR Compliant).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => showToast('Segments update automatically from CRM & POS data')}
              className="px-space-md h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="help_outline" className="text-[18px] text-secondary" />
              <span>Sync Help</span>
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <Icon name="add_circle" className="text-[20px]" />
              <span>Create Custom Segment</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-caption uppercase tracking-wider font-semibold">Tracked Diners</span>
              <Icon name="group" className="text-[18px] text-primary" />
            </div>
            <div className="mt-space-2xs flex items-baseline gap-1.5">
              <span className="font-heading-md text-heading-md text-text-primary font-bold leading-none">1,482</span>
              <span className="text-caption font-caption text-badge-discount-text font-medium">+14%</span>
            </div>
          </div>
          <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-caption uppercase tracking-wider font-semibold">Active Cohorts</span>
              <Icon name="pie_chart" className="text-[18px] text-secondary" />
            </div>
            <div className="mt-space-2xs flex items-baseline gap-1.5">
              <span className="font-heading-md text-heading-md text-text-primary font-bold leading-none">
                {SEGMENTS.length}
              </span>
              <span className="text-caption font-caption text-text-tertiary">Total</span>
            </div>
          </div>
          <div className="bg-surface-tint-blue rounded-xl p-space-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-caption font-caption text-primary uppercase tracking-wider font-semibold">
                Real-time CRM Sync Active
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            </div>
            <span className="text-caption font-caption text-text-secondary mt-1">
              Updated 3m ago • Continuous federation with the Customers CRM directory
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          <div className="flex flex-col gap-space-lg min-w-0">
            <div className="flex items-center gap-space-xs bg-surface-container-high/60 p-1 rounded-full w-fit">
              {FILTER_TABS.map((tab) => {
                const active = filter === tab.key;
                return (
                  <button
                    className={`px-space-md py-2 rounded-full text-label-sm font-label-sm transition-all text-center ${
                      active
                        ? 'bg-surface-canvas text-primary shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-primary font-medium'
                    }`}
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {showDefaultSection && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="auto_fix_high" className="text-[18px] text-primary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                      System Default Segments
                    </h2>
                  </div>
                  <span className="text-caption font-caption text-text-tertiary">{defaultCount} Automated</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {visibleSegments.filter((entry) => entry.category === 'default').map(renderCard)}
                </div>
              </div>
            )}

            {showCustomSection && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="tune" className="text-[18px] text-tertiary" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">
                      Custom Diner Cohorts
                    </h2>
                  </div>
                  <span className="text-caption font-caption text-text-tertiary">{customCount} Configured</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {visibleSegments.filter((entry) => entry.category === 'custom').map(renderCard)}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-space-lg min-w-0 lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Marketing &amp; Growth</span>
              <span className="text-caption font-caption text-text-secondary pb-space-xs">
                Jump to adjacent growth modules
              </span>
              <button
                type="button"
                onClick={onOpenBoost}
                className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-tint-blue transition-colors text-left"
              >
                <span className="flex items-center gap-space-sm min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="rocket_launch" className="text-[18px]" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Boost</span>
                    <span className="text-caption font-caption text-text-secondary">Geo-targeted flash promotions</span>
                  </span>
                </span>
                <Icon name="chevron_right" className="text-outline-variant text-[18px] shrink-0" />
              </button>
              <button
                type="button"
                onClick={onOpenCampaigns}
                className="flex items-center justify-between p-space-sm rounded-lg bg-surface-subtle hover:bg-surface-tint-blue transition-colors text-left"
              >
                <span className="flex items-center gap-space-sm min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                    <Icon name="campaign" className="text-[18px]" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Campaigns</span>
                    <span className="text-caption font-caption text-text-secondary">Multi-day multi-channel runs</span>
                  </span>
                </span>
                <Icon name="chevron_right" className="text-outline-variant text-[18px] shrink-0" />
              </button>
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-tint-blue">
                <span className="flex items-center gap-space-sm min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="donut_small" className="text-[18px]" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-primary font-semibold">Customer Segments</span>
                    <span className="text-caption font-caption text-text-secondary">You are here</span>
                  </span>
                </span>
                <Icon name="check_circle" className="text-primary text-[18px] shrink-0" />
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center gap-2">
                <Icon name="shield" className="text-primary text-[20px]" />
                <span className="text-label-md font-label-md text-text-primary font-semibold">
                  NDPR Privacy &amp; Consumer Trust Assurance
                </span>
              </div>
              <p className="text-caption font-caption text-text-secondary leading-relaxed">
                All audience reach strictly respects consumer opt-in consent and VEMTAP fair messaging guidelines.
                Diners maintain unhindered rights to pause marketing notifications or request data anonymity.
              </p>
              <div className="pt-space-2xs">
                <button
                  className="inline-flex items-center gap-1 text-label-sm font-label-sm text-primary font-semibold hover:underline"
                  type="button"
                  onClick={() => showToast('Opening Customer CRM directory...')}
                >
                  <span>Manage Profiles in Customer CRM</span>
                  <Icon name="north_east" className="text-[16px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {drawerSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-lg">
          <button
            aria-label="Close drawer"
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            type="button"
            onClick={() => setDrawerSegment(null)}
          />
          <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-caption font-caption text-text-tertiary">Quick Marketing Action</span>
                <h3 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">
                  {drawerSegment.title}
                </h3>
                <p className="text-label-sm font-label-sm text-primary font-semibold mt-0.5">
                  {drawerSegment.count} reachable diners
                </p>
              </div>
              <button
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-secondary transition-colors shrink-0"
                type="button"
                onClick={() => setDrawerSegment(null)}
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <div className="flex flex-col gap-space-xs">
              <button
                className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container transition-all text-left w-full"
                type="button"
                onClick={() => {
                  const segment = drawerSegment.ref;
                  setDrawerSegment(null);
                  onUseSegment(segment);
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
                  <Icon name="rocket_launch" className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-body-md font-button-primary text-text-primary font-semibold">
                    Launch Geo-Boost Promotion
                  </span>
                  <span className="text-caption font-caption text-text-secondary">
                    Push exclusive 2-hour deal to this specific diner pool
                  </span>
                </div>
                <Icon name="chevron_right" className="text-outline-variant text-[20px] shrink-0" />
              </button>
              <button
                className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container transition-all text-left w-full"
                type="button"
                onClick={() => {
                  setDrawerSegment(null);
                  showToast('Direct in-app message composer opened');
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0">
                  <Icon name="mark_chat_unread" className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-body-md font-button-primary text-text-primary font-semibold">
                    Send Direct In-App Message
                  </span>
                  <span className="text-caption font-caption text-text-secondary">
                    Personalized dining perk or exclusive weekend invite
                  </span>
                </div>
                <Icon name="chevron_right" className="text-outline-variant text-[20px] shrink-0" />
              </button>
              <button
                className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container transition-all text-left w-full"
                type="button"
                onClick={() => {
                  setDrawerSegment(null);
                  showToast('VIP voucher drop generated');
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                  <Icon name="loyalty" className="text-[24px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-body-md font-button-primary text-text-primary font-semibold">
                    Generate VIP Voucher Drop
                  </span>
                  <span className="text-caption font-caption text-text-secondary">
                    Auto-deposit 15% discount into customer wallets
                  </span>
                </div>
                <Icon name="chevron_right" className="text-outline-variant text-[20px] shrink-0" />
              </button>
            </div>
            <button
              className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-medium transition-colors"
              type="button"
              onClick={() => setDrawerSegment(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-xl flex items-center gap-2">
          <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
          <span className="truncate">{toast}</span>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
