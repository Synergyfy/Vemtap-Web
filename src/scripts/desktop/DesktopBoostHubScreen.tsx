import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import type { BoostTabKey } from '../../components/BoostTabBar';
import { PUBLIC_IMAGES } from '../publicPosData';

interface DesktopBoostHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  onTab: (key: BoostTabKey) => void;
  onBoost: (item: string) => void;
  onOpenMetrics: () => void;
  onOpenSegments: () => void;
  /** Opens the 6-step Create Campaign wizard; falls back to Boost studio. */
  onCreateCampaign?: () => void;
}

type HubStatusTab = 'active' | 'scheduled' | 'completed' | 'draft';

interface HubCampaign {
  key: string;
  status: HubStatusTab;
  statusLabel: string;
  image: string;
  goal: string;
  goalIcon: string;
  goalClass: string;
  title: string;
  contentName: string;
  contentSub: string;
  contentIcon: string;
  contentIconBoxClass: string;
  meta: { icon: string; text: string }[];
  spent: number;
  total: number;
  pctLabel: string;
  pacingPrefix: string;
  barClass: string;
  kpis: { label: string; value: string; valueClass?: string }[];
  manageLabel: string;
  manageIcon: string;
}

const MODULE_TABS: { key: BoostTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'boost', label: 'Boost Studio' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'wallet', label: 'Wallet' },
];

const CAMPAIGNS: HubCampaign[] = [
  {
    key: 'wuse-weekend',
    status: 'active',
    statusLabel: 'Active • 3 days left',
    image: PUBLIC_IMAGES.combo,
    goal: 'Drive Orders & Deals',
    goalIcon: 'shopping_bag',
    goalClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Wuse Weekend Lunch Surge',
    contentName: 'Prime Lunch Combo (20% OFF)',
    contentSub: 'Storefront Profile & Online Menu',
    contentIcon: 'local_offer',
    contentIconBoxClass: 'bg-primary-fixed text-primary',
    meta: [
      { icon: 'groups', text: 'Nearby Foodies & Corporate Diners (3.5 km radius)' },
      { icon: 'store', text: 'Wuse II Flagship & Maitama Heights' },
      { icon: 'schedule', text: 'Oct 18 – Oct 25 (11:30 AM – 3:30 PM daily)' },
    ],
    spent: 21400,
    total: 35000,
    pctLabel: 'deployed',
    pacingPrefix: 'Pacing',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: '18,420' },
      { label: 'Clicks', value: '2,140' },
      { label: 'Orders', value: '148', valueClass: 'text-primary' },
      { label: 'Conv.', value: '6.9%', valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'Manage',
    manageIcon: 'pause_circle',
  },
  {
    key: 'late-night-bogo',
    status: 'active',
    statusLabel: 'Active • 5 days left',
    image: PUBLIC_IMAGES.mojito,
    goal: 'Increase Visits',
    goalIcon: 'nightlife',
    goalClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    title: 'Late Night Cocktails BOGO Drive',
    contentName: 'Late Night Cocktails (Buy 1 Get 1)',
    contentSub: 'QR Tap Deal voucher',
    contentIcon: 'local_bar',
    contentIconBoxClass: 'bg-secondary-fixed-dim text-primary',
    meta: [
      { icon: 'explore', text: 'Nightlife & Weekend Crowd • 5.0 km cluster' },
      { icon: 'deck', text: 'Wuse II Bar & Patio' },
      { icon: 'event_repeat', text: 'Oct 20 – Oct 27 (9:00 PM – 1:00 AM)' },
    ],
    spent: 8600,
    total: 20000,
    pctLabel: 'spent',
    pacingPrefix: 'Budget',
    barClass: 'bg-secondary',
    kpis: [
      { label: 'Reach', value: '9,200' },
      { label: 'Claims', value: '62', valueClass: 'text-primary' },
      { label: 'POS Scans', value: '48', valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'Pause',
    manageIcon: 'pause_circle',
  },
  {
    key: 'steak-awareness',
    status: 'active',
    statusLabel: 'Active • 8 days left',
    image: PUBLIC_IMAGES.ribeye,
    goal: 'Promote Products',
    goalIcon: 'restaurant',
    goalClass: 'bg-primary-fixed text-on-primary-fixed-variant',
    title: 'Woodfire Steak Lover Awareness',
    contentName: 'Woodfire Ribeye Steak (250g)',
    contentSub: 'Featured Menu Item Highlight',
    contentIcon: 'dinner_dining',
    contentIconBoxClass: 'bg-surface-container text-tertiary-container',
    meta: [
      { icon: 'workspace_premium', text: 'High-Ticket Spenders (VIP Segment)' },
      { icon: 'apartment', text: 'All Abuja Branches' },
    ],
    spent: 14200,
    total: 50000,
    pctLabel: 'spent',
    pacingPrefix: 'Budget',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: '15,200' },
      { label: 'Item Views', value: '1,890', valueClass: 'text-primary' },
      { label: 'Attrib. Sales', value: '₦384k', valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'Manage',
    manageIcon: 'tune',
  },
  {
    key: 'sunday-brunch',
    status: 'scheduled',
    statusLabel: 'Scheduled • Starts Sun 10 AM',
    image: PUBLIC_IMAGES.wings,
    goal: 'Drive Orders & Deals',
    goalIcon: 'shopping_bag',
    goalClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Sunday Brunch Family Bundle',
    contentName: 'Sunday Brunch Bundle',
    contentSub: 'Family platter deal voucher',
    contentIcon: 'local_offer',
    contentIconBoxClass: 'bg-primary-fixed text-primary',
    meta: [
      { icon: 'groups', text: 'Family & Household Segment (4 km radius)' },
      { icon: 'event_repeat', text: 'Oct 27 – Nov 03 (10:00 AM – 4:00 PM)' },
    ],
    spent: 0,
    total: 18000,
    pctLabel: 'budget set',
    pacingPrefix: 'Budget',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: '—' },
      { label: 'Clicks', value: '—' },
      { label: 'Orders', value: '—' },
    ],
    manageLabel: 'Edit Setup',
    manageIcon: 'edit_note',
  },
  {
    key: 'happy-hour',
    status: 'scheduled',
    statusLabel: 'Scheduled • Starts Tue 4 PM',
    image: PUBLIC_IMAGES.fries,
    goal: 'Promote a Deal',
    goalIcon: 'local_offer',
    goalClass: 'bg-primary-fixed text-primary',
    title: 'Weekday Happy Hour 2→4→2',
    contentName: 'Happy Hour Cocktails (50% OFF)',
    contentSub: 'Timed happy-hour voucher',
    contentIcon: 'local_bar',
    contentIconBoxClass: 'bg-secondary-fixed-dim text-primary',
    meta: [
      { icon: 'near_me', text: 'Nearby Office Workers (2.5 km radius)' },
      { icon: 'schedule', text: 'Oct 29 – Nov 05 (4:00 PM – 7:00 PM)' },
    ],
    spent: 0,
    total: 12000,
    pctLabel: 'budget set',
    pacingPrefix: 'Budget',
    barClass: 'bg-secondary',
    kpis: [
      { label: 'Reach', value: '—' },
      { label: 'Claims', value: '—' },
      { label: 'POS Scans', value: '—' },
    ],
    manageLabel: 'Edit Setup',
    manageIcon: 'edit_note',
  },
  {
    key: 'lunch-rush-sept',
    status: 'completed',
    statusLabel: 'Completed • Oct 10',
    image: PUBLIC_IMAGES.burger,
    goal: 'Get More Customers',
    goalIcon: 'group_add',
    goalClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'September Lunch Rush Push',
    contentName: 'Prime Lunch Combo (20% OFF)',
    contentSub: 'Storefront Profile & Online Menu',
    contentIcon: 'local_offer',
    contentIconBoxClass: 'bg-primary-fixed text-primary',
    meta: [
      { icon: 'groups', text: 'All Shoppers Nearby (5 km radius)' },
      { icon: 'schedule', text: 'Sep 28 – Oct 10 (11:30 AM – 3:30 PM daily)' },
    ],
    spent: 25000,
    total: 25000,
    pctLabel: 'deployed',
    pacingPrefix: 'Pacing',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: '42,100' },
      { label: 'Claims', value: '310', valueClass: 'text-primary' },
      { label: 'Conv.', value: '7.4%', valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'View Report',
    manageIcon: 'query_stats',
  },
  {
    key: 'jollof-fest',
    status: 'completed',
    statusLabel: 'Completed • Sep 28',
    image: PUBLIC_IMAGES.hero,
    goal: 'Increase Business Visibility',
    goalIcon: 'campaign',
    goalClass: 'bg-surface-container text-secondary',
    title: 'Abuja Jollof Festival Teaser',
    contentName: 'Urban Grill & Bistro Flagship',
    contentSub: 'Storefront Profile Highlight',
    contentIcon: 'storefront',
    contentIconBoxClass: 'bg-surface-container-high text-on-surface-variant',
    meta: [
      { icon: 'apartment', text: 'All Abuja Branches (8 km metro)' },
      { icon: 'schedule', text: 'Sep 20 – Sep 28 (All day)' },
    ],
    spent: 30000,
    total: 30000,
    pctLabel: 'deployed',
    pacingPrefix: 'Pacing',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: '58,400' },
      { label: 'Profile Visits', value: '3,240', valueClass: 'text-primary' },
      { label: 'Follows', value: '412', valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'View Report',
    manageIcon: 'query_stats',
  },
  {
    key: 'steak-night-draft',
    status: 'draft',
    statusLabel: 'Draft • Not scheduled',
    image: PUBLIC_IMAGES.ribeye,
    goal: 'Promote Products',
    goalIcon: 'auto_awesome',
    goalClass: 'bg-surface-container text-secondary',
    title: 'Woodfire Steak Lovers Night',
    contentName: 'Woodfire Ribeye Steak (250g)',
    contentSub: 'Featured Menu Item Highlight',
    contentIcon: 'dinner_dining',
    contentIconBoxClass: 'bg-surface-container text-tertiary-container',
    meta: [
      { icon: 'workspace_premium', text: 'High-Ticket Spenders (VIP Segment)' },
      { icon: 'calendar_month', text: 'Dates not configured yet' },
    ],
    spent: 0,
    total: 40000,
    pctLabel: 'draft budget',
    pacingPrefix: 'Budget',
    barClass: 'bg-outline-variant',
    kpis: [
      { label: 'Reach', value: '—' },
      { label: 'Clicks', value: '—' },
      { label: 'Orders', value: '—' },
    ],
    manageLabel: 'Continue Draft',
    manageIcon: 'edit_note',
  },
  {
    key: 'spa-recovery-draft',
    status: 'draft',
    statusLabel: 'Draft • Not scheduled',
    image: PUBLIC_IMAGES.logo,
    goal: 'Get More Customers',
    goalIcon: 'group_add',
    goalClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Midweek Spa Recovery Drive',
    contentName: 'Swedish Massage Session',
    contentSub: 'Bookable service spotlight',
    contentIcon: 'event',
    contentIconBoxClass: 'bg-secondary-container text-on-secondary-container',
    meta: [
      { icon: 'groups', text: 'Premium Spenders & Couples (6 km radius)' },
      { icon: 'calendar_month', text: 'Dates not configured yet' },
    ],
    spent: 0,
    total: 22000,
    pctLabel: 'draft budget',
    pacingPrefix: 'Budget',
    barClass: 'bg-outline-variant',
    kpis: [
      { label: 'Reach', value: '—' },
      { label: 'Bookings', value: '—' },
      { label: 'Conv.', value: '—' },
    ],
    manageLabel: 'Continue Draft',
    manageIcon: 'edit_note',
  },
];

const STATUS_TABS: { key: HubStatusTab; label: (count: number) => string }[] = [
  { key: 'active', label: (count) => `Active ${count}` },
  { key: 'scheduled', label: (count) => `Scheduled ${count}` },
  { key: 'completed', label: (count) => `Completed ${count}` },
  { key: 'draft', label: (count) => `Drafts ${count}` },
];

const fmt = (value: number) => Math.round(value).toLocaleString('en-US');

export function DesktopBoostHubScreen({
  onNav,
  onBack,
  onTab,
  onBoost,
  onOpenMetrics,
  onOpenSegments,
  onCreateCampaign,
}: DesktopBoostHubScreenProps) {
  const [statusTab, setStatusTab] = useState<HubStatusTab>('active');
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const visibleCampaigns = CAMPAIGNS.filter((entry) => entry.status === statusTab);
  const activeCampaigns = CAMPAIGNS.filter((entry) => entry.status === 'active');
  const activeSpend = activeCampaigns.reduce((sum, entry) => sum + entry.spent, 0);
  const reachTotal = activeCampaigns.reduce((sum, entry) => {
    const raw = entry.kpis.find((kpi) => kpi.label === 'Reach')?.value ?? '0';
    return sum + Number(raw.replace(/[^\d]/g, '') || 0);
  }, 0);
  const reachLabel = reachTotal >= 1000 ? `${(reachTotal / 1000).toFixed(1)}k` : fmt(reachTotal);

  const countFor = (key: HubStatusTab) => CAMPAIGNS.filter((entry) => entry.status === key).length;

  const bentoMetrics = [
    {
      key: 'active',
      label: 'Active Campaigns',
      icon: 'campaign',
      value: String(activeCampaigns.length),
      delta: 'Live now',
      note: `₦${fmt(activeSpend)} paced across live runs`,
    },
    {
      key: 'spend',
      label: 'Budget Paced',
      icon: 'payments',
      value: `₦${fmt(activeSpend)}`,
      delta: undefined,
      note: 'Spend velocity across every active boost',
    },
    {
      key: 'reach',
      label: 'Total Reach',
      icon: 'radar',
      value: reachLabel,
      delta: '+14.2%',
      note: 'Unique diners reached this week',
    },
    {
      key: 'pipeline',
      label: 'Scheduled Campaigns',
      icon: 'event_repeat',
      value: String(countFor('scheduled')),
      delta: undefined,
      note: `Drafts ${countFor('draft')} • Completed ${countFor('completed')}`,
    },
  ];

  const quickNav = [
    { label: 'Boost', onClick: () => onBoost(''), active: false },
    { label: 'Campaigns', onClick: undefined, active: true },
    { label: 'Customer Segments', onClick: onOpenSegments, active: false },
  ];

  return (
    <BusinessPortalChrome activeNav="more-marketing" onNav={onNav}>
      <div className="w-full py-space-xl flex flex-col gap-space-lg">
        {/* Back link + Boost module tabs (desktop replacement for the mobile tab bar) */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Overview</span>
          </button>
          <div className="flex items-center gap-space-2xs bg-surface-container p-space-2xs rounded-xl">
            {MODULE_TABS.map((tab) => {
              const active = tab.key === 'overview';
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onTab(tab.key)}
                  className={`px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-medium tracking-wide uppercase">
                Marketing &amp; Growth
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="font-caption text-caption text-text-tertiary">Campaigns Hub</span>
              <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded-full">
                <Icon className="text-primary text-[16px]" name="location_on" />
                <span className="font-caption text-caption text-on-surface-variant font-medium">Wuse II, Abuja</span>
              </div>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Campaigns Hub</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Structured promotions &amp; multi-channel marketing
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => (onCreateCampaign ? onCreateCampaign() : onBoost(''))}
              className="px-space-lg h-[46px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
            >
              <Icon name="add_circle" className="text-[20px]" />
              <span>Create Campaign</span>
            </button>
          </div>
        </section>

        {/* Metric bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {bentoMetrics.map((metric) => (
            <div
              key={metric.key}
              className="bg-surface-canvas rounded-xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary">{metric.label}</span>
                <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name={metric.icon} className="text-[18px]" />
                </span>
              </div>
              <div className="flex items-baseline gap-space-xs flex-wrap">
                <span className="font-heading-md text-heading-md text-text-primary font-bold">{metric.value}</span>
                {metric.delta && (
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">{metric.delta}</span>
                )}
              </div>
              <span className="font-caption text-caption text-text-tertiary">{metric.note}</span>
            </div>
          ))}
        </section>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-lg items-start">
          {/* Campaign workspace */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex flex-col gap-space-2xs">
                <h2 className="font-heading-md text-heading-md text-text-primary">Marketing Campaigns</h2>
                <span className="font-caption text-caption text-text-tertiary">
                  Structured promotions &amp; multi-channel marketing
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                {quickNav.map((pill) =>
                  pill.active ? (
                    <span
                      className="px-3 py-1.5 rounded-full text-label-sm font-label-sm whitespace-nowrap bg-surface-tint-blue text-primary font-semibold"
                      key={pill.label}
                    >
                      {pill.label}
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1.5 rounded-full text-label-sm font-label-sm whitespace-nowrap bg-surface-subtle text-text-secondary hover:bg-surface-container-high transition-colors"
                      key={pill.label}
                      type="button"
                      onClick={pill.onClick}
                    >
                      {pill.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Status segmented tabs */}
            <div className="flex items-center justify-between bg-surface-container-high p-space-2xs rounded-xl gap-space-2xs">
              {STATUS_TABS.map((tab) => {
                const active = statusTab === tab.key;
                const count = countFor(tab.key);
                return (
                  <button
                    className={`flex-1 py-2 px-space-xs rounded-lg font-label-sm text-label-sm text-center transition-all ${
                      active
                        ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusTab(tab.key)}
                  >
                    {tab.label(count)}
                  </button>
                );
              })}
            </div>

            {/* Campaign list */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
              {visibleCampaigns.map((campaign) => {
                const pct = Math.round((campaign.spent / campaign.total) * 100);
                return (
                  <div
                    className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] overflow-hidden flex flex-col"
                    key={campaign.key}
                  >
                    {/* Media header */}
                    <div
                      className="relative h-36 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${campaign.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/25 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-caption text-caption font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${campaign.goalClass}`}
                        >
                          <Icon className="text-[13px]" name={campaign.goalIcon} />
                          {campaign.goal}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                          {campaign.statusLabel}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3 text-on-primary">
                        <h3 className="font-heading-sm text-heading-sm leading-snug drop-shadow-sm">{campaign.title}</h3>
                      </div>
                    </div>

                    <div className="p-space-md flex flex-col gap-space-sm flex-1">
                      {/* Content link */}
                      <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center justify-between gap-2">
                        <div className="flex items-center gap-space-xs min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${campaign.contentIconBoxClass}`}
                          >
                            <Icon className="text-[18px]" name={campaign.contentIcon} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                              {campaign.contentName}
                            </span>
                            <span className="font-caption text-caption text-text-secondary truncate">
                              {campaign.contentSub}
                            </span>
                          </div>
                        </div>
                        <Icon className="text-text-tertiary text-[20px] shrink-0" name="chevron_right" />
                      </div>

                      {/* Meta rows */}
                      <div className="flex flex-col gap-space-2xs text-text-secondary font-caption text-caption">
                        {campaign.meta.map((row) => (
                          <div className="flex items-center gap-space-xs" key={row.text}>
                            <Icon className="text-[16px] text-primary shrink-0" name={row.icon} />
                            <span>{row.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pacing bar */}
                      <div className="flex flex-col gap-1 pt-1">
                        <div className="flex items-center justify-between font-caption text-caption">
                          <span className="text-text-secondary">
                            {campaign.pacingPrefix}:{' '}
                            <strong className="text-text-primary font-semibold">₦{fmt(campaign.spent)}</strong> of ₦
                            {fmt(campaign.total)}
                          </span>
                          <span className="text-primary font-semibold">
                            {pct}% {campaign.pctLabel}
                          </span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                          <div
                            className={`${campaign.barClass} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* KPI grid */}
                      <div
                        className={`grid ${campaign.kpis.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-space-2xs bg-surface-subtle p-space-xs rounded-xl`}
                      >
                        {campaign.kpis.map((kpi) => (
                          <div className="flex flex-col items-center text-center" key={kpi.label}>
                            <span className="font-caption text-caption text-text-secondary">{kpi.label}</span>
                            <span
                              className={`font-label-md text-label-md font-bold ${kpi.valueClass ?? 'text-text-primary'}`}
                            >
                              {kpi.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-space-xs pt-1 mt-auto">
                        <button
                          className="flex-1 h-10 bg-surface-tint-blue hover:bg-surface-container text-primary font-button-secondary text-button-secondary rounded-lg flex items-center justify-center gap-1 transition-colors"
                          type="button"
                          onClick={onOpenMetrics}
                        >
                          <Icon className="text-[18px]" name="query_stats" />
                          <span>View Insights</span>
                        </button>
                        <button
                          className="h-10 px-space-sm bg-surface-container-low hover:bg-surface-container text-text-secondary font-label-md text-label-md rounded-lg flex items-center justify-center gap-1 transition-colors"
                          type="button"
                          onClick={() =>
                            showToast(
                              campaign.status === 'active'
                                ? `${campaign.title} — manage controls opened`
                                : `${campaign.title} — ${campaign.manageLabel.toLowerCase()}`,
                            )
                          }
                        >
                          <Icon className="text-[18px]" name={campaign.manageIcon} />
                          <span>{campaign.manageLabel}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {visibleCampaigns.length === 0 && (
                <div className="xl:col-span-2 bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col items-center gap-space-xs text-center">
                  <Icon name="campaign" className="text-[28px] text-text-tertiary" />
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    No campaigns in this view
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Switch status tabs above, or create a campaign to start reaching nearby diners.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-space-md">
            {/* Quick metric strip (mobile quick strip, vertical) */}
            <div className="bg-surface-tint-blue rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    {activeCampaigns.length} Active Campaigns
                  </span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-border-active" />
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-2xs">
                  <Icon className="text-[16px] text-text-secondary" name="payments" />
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">₦{fmt(activeSpend)} Paced</span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-border-active" />
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-2xs">
                  <Icon className="text-[16px] text-text-secondary" name="radar" />
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">{reachLabel} Reached</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (onCreateCampaign ? onCreateCampaign() : onBoost(''))}
                className="mt-space-2xs h-10 w-full bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-lg flex items-center justify-center gap-space-xs transition-colors shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]"
              >
                <Icon className="text-[18px]" name="add_circle" />
                <span>Create Campaign</span>
              </button>
            </div>

            {/* Portfolio status */}
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-heading-sm text-heading-sm text-text-primary">Portfolio Status</span>
                <Icon name="donut_small" className="text-primary text-[20px]" />
              </div>
              {STATUS_TABS.map((tab) => {
                const count = countFor(tab.key);
                const pct = Math.round((count / CAMPAIGNS.length) * 100);
                const active = statusTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusTab(tab.key)}
                    className={`w-full flex flex-col gap-1 p-space-xs rounded-lg text-left transition-colors ${
                      active ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between font-label-sm text-label-sm">
                      <span className={active ? 'text-primary font-semibold' : 'text-text-secondary'}>
                        {tab.label(count)}
                      </span>
                      <span className="text-text-primary font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${active ? 'bg-primary' : 'bg-surface-container-highest'} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Strategy tip */}
            <div className="bg-gradient-to-br from-surface-tint-blue via-surface-canvas to-surface-container p-space-md rounded-xl flex items-start gap-space-sm shadow-sm">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary shadow-sm">
                <Icon className="text-[20px]" name="lightbulb" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-semibold">Campaign Strategy Tip</span>
                <p className="font-body-md text-body-md text-text-primary leading-relaxed">
                  Multi-location campaigns scheduled during peak footfall windows achieve{' '}
                  <strong>3.2x higher POS redemption rates</strong> than static boosts. Consider synchronizing your
                  weekend dining runs.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon className="text-badge-discount-text text-[18px]" name="check_circle" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
