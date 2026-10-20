import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BoostTabBar, type BoostTabKey } from '../components/BoostTabBar';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { PUBLIC_IMAGES } from './publicPosData';

interface BusinessBoostHubScreenProps {
  onBack: () => void;
  onTab: (tab: BoostTabKey) => void;
  onBoost: (item?: string) => void;
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

const getOfferImage = (offer: Record<string, unknown>) => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const fallback = item?.mainImage ?? item?.image ?? offer.image ?? offer.coverImage ?? offer.heroImage ?? PUBLIC_IMAGES.hero;
  return typeof fallback === 'string' && fallback.trim() ? fallback : PUBLIC_IMAGES.hero;
};

const getOfferBusinessName = (offer: Record<string, unknown>) => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
  const value = offer.businessName ?? offer.merchantName ?? offer.vendorName ?? business.name ?? 'Local business';
  return typeof value === 'string' && value.trim() ? value : 'Local business';
};

const getOfferTitle = (offer: Record<string, unknown>) => {
  const value = offer.title ?? offer.name ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
};

const buildCampaignFromOffer = (offer: Record<string, unknown>, index: number): HubCampaign => {
  const businessName = getOfferBusinessName(offer);
  const title = getOfferTitle(offer);
  const isActive = index % 2 === 0;
  const status: HubStatusTab = isActive ? 'active' : 'scheduled';
  const spent = 15000 + index * 3500;
  const total = 35000 + index * 8000;

  return {
    key: String(offer.id ?? `${businessName}-${index}`),
    status,
    statusLabel: status === 'active' ? `Active • ${Math.max(1, 5 - index)} days left` : `Scheduled • Starts ${index + 1}d`,
    image: getOfferImage(offer),
    goal: index % 3 === 0 ? 'Drive Orders & Deals' : index % 3 === 1 ? 'Get More Customers' : 'Promote Products',
    goalIcon: index % 3 === 0 ? 'shopping_bag' : index % 3 === 1 ? 'group_add' : 'restaurant',
    goalClass: index % 2 === 0 ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-secondary',
    title: `${title} Campaign`,
    contentName: title,
    contentSub: `${businessName} • live catalogue item`,
    contentIcon: 'local_offer',
    contentIconBoxClass: index % 2 === 0 ? 'bg-primary-fixed text-primary' : 'bg-secondary-fixed text-on-secondary-fixed-variant',
    meta: [
      { icon: 'groups', text: `${businessName} • ${index + 1} km nearby reach` },
      { icon: 'store', text: 'Live storefront inventory' },
      { icon: 'schedule', text: 'Backend-managed campaign slot' },
    ],
    spent,
    total,
    pctLabel: 'deployed',
    pacingPrefix: 'Pacing',
    barClass: 'bg-primary',
    kpis: [
      { label: 'Reach', value: `${(index + 1) * 1200}` },
      { label: 'Clicks', value: `${(index + 1) * 180}` },
      { label: 'Orders', value: `${(index + 1) * 14}`, valueClass: 'text-primary' },
      { label: 'Conv.', value: `${(5 + index * 1.2).toFixed(1)}%`, valueClass: 'text-badge-discount-text' },
    ],
    manageLabel: 'Manage',
    manageIcon: 'tune',
  };
};

const fmt = (value: number) => Math.round(value).toLocaleString('en-US');

export function BusinessBoostHubScreen({ onBack, onTab, onBoost, onOpenMetrics, onOpenSegments, onCreateCampaign }: BusinessBoostHubScreenProps) {
  const [statusTab, setStatusTab] = useState<HubStatusTab>('active');
  const [toast, setToast] = useState<string | null>(null);
  const [liveCampaigns, setLiveCampaigns] = useState<HubCampaign[]>([]);
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

  useEffect(() => {
    let ignore = false;

    const loadOffers = async () => {
      if (!hasApiConfig()) {
        if (!ignore) setLiveCampaigns([]);
        return;
      }

      try {
        const response = await catalogueService.getPublicOffers({ page: 1, limit: 5 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        const mapped = rows.map((offer, index) => buildCampaignFromOffer(offer as Record<string, unknown>, index));
        if (!ignore) setLiveCampaigns(mapped);
      } catch {
        if (!ignore) setLiveCampaigns([]);
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const campaigns = liveCampaigns.length > 0 ? liveCampaigns : CAMPAIGNS;
  const visibleCampaigns = campaigns.filter((entry) => entry.status === statusTab);
  const activeCampaigns = campaigns.filter((entry) => entry.status === 'active');
  const activeSpend = activeCampaigns.reduce((sum, entry) => sum + entry.spent, 0);
  const reachTotal = activeCampaigns.reduce((sum, entry) => {
    const raw = entry.kpis.find((kpi) => kpi.label === 'Reach')?.value ?? '0';
    return sum + Number(raw.replace(/[^\d]/g, '') || 0);
  }, 0);
  const reachLabel = reachTotal >= 1000 ? `${(reachTotal / 1000).toFixed(1)}k` : fmt(reachTotal);

  const countFor = (key: HubStatusTab) => campaigns.filter((entry) => entry.status === key).length;

  return (
    <AppScreen>
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-text-primary hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon className="text-[24px]" name="arrow_back" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-text-primary tracking-tight leading-tight truncate">
                Campaigns Hub
              </h1>
              <span className="font-caption text-caption text-text-secondary">Marketing & Growth</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon className="text-on-primary text-[18px]" name="person" />
          </div>
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto px-margin pb-space-xs">
          {[
            { label: 'Boost', onClick: () => onBoost(), active: false },
            { label: 'Campaigns', onClick: undefined, active: true },
            { label: 'Customer Segments', onClick: onOpenSegments, active: false },
          ].map((pill) => (
            <button
              className={`px-3 py-1.5 rounded-full text-label-sm font-label-sm whitespace-nowrap transition-colors ${
                pill.active
                  ? 'bg-surface-tint-blue text-primary font-semibold'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-high'
              }`}
              key={pill.label}
              type="button"
              onClick={pill.onClick}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        {/* Title + location */}
        <div className="px-margin pt-space-md pb-space-xs flex flex-col gap-space-sm">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <h2 className="font-heading-md text-heading-md text-text-primary">Marketing Campaigns</h2>
              <p className="font-body-md text-body-md text-text-secondary">
                Structured promotions & multi-channel marketing
              </p>
            </div>
            <div className="flex items-center gap-space-2xs bg-surface-container px-space-xs py-space-2xs rounded-full shrink-0">
              <Icon className="text-primary text-[16px]" name="location_on" />
              <span className="font-caption text-caption text-on-surface-variant font-medium">Wuse II, Abuja</span>
            </div>
          </div>

          {/* Quick metric strip */}
          <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                {activeCampaigns.length} Active Campaigns
              </span>
            </div>
            <div className="h-3 w-px bg-border-active" />
            <div className="flex items-center gap-space-2xs">
              <Icon className="text-[16px] text-text-secondary" name="payments" />
              <span className="font-label-sm text-label-sm text-text-primary font-medium">₦{fmt(activeSpend)} Paced</span>
            </div>
            <div className="h-3 w-px bg-border-active" />
            <div className="flex items-center gap-space-2xs">
              <Icon className="text-[16px] text-text-secondary" name="radar" />
              <span className="font-label-sm text-label-sm text-text-primary font-medium">{reachLabel} Reached</span>
            </div>
          </div>

          {/* Create campaign */}
          <button
            className="w-full h-11 bg-primary-container hover:bg-primary active:scale-[0.98] text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)]"
            type="button"
            onClick={() => (onCreateCampaign ? onCreateCampaign() : onBoost())}
          >
            <Icon className="text-[20px]" name="add_circle" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Segmented tabs */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="flex items-center justify-between bg-surface-container-high p-1 rounded-xl gap-1">
            {STATUS_TABS.map((tab) => {
              const active = statusTab === tab.key;
              const count = countFor(tab.key);
              return (
                <button
                  className={`flex-1 py-1.5 px-1 rounded-lg font-label-sm text-label-sm text-center transition-all ${
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
        </div>

        {/* Campaign list */}
        <div className="px-margin flex flex-col gap-space-md pb-space-lg">
          {visibleCampaigns.map((campaign) => {
            const pct = Math.round((campaign.spent / campaign.total) * 100);
            return (
              <div
                className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] overflow-hidden"
                key={campaign.key}
              >
                {/* Media header */}
                <div
                  className="relative h-28 w-full bg-cover bg-center"
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

                <div className="p-space-md flex flex-col gap-space-sm">
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
                        <span className="truncate">{row.text}</span>
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
                      <span className="text-primary font-semibold">{pct}% {campaign.pctLabel}</span>
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
                          className={`font-label-md text-label-md font-bold ${
                            kpi.valueClass ?? 'text-text-primary'
                          }`}
                        >
                          {kpi.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-space-xs pt-1">
                    <button
                      className="flex-1 h-10 bg-surface-tint-blue hover:bg-secondary-fixed text-primary font-button-secondary text-button-secondary rounded-lg flex items-center justify-center gap-1 transition-colors"
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
        </div>
      </div>

      <BoostTabBar active="overview" onTab={onTab} />

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon className="text-badge-discount-text text-[18px]" name="check_circle" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
