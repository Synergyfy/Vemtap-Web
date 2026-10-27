import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { downloadCsv } from '../utils/exportCsv';
import { printReport, printKvTable } from '../utils/printReport';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { useBusinessAnalytics } from '../hooks/business/useBusinessAnalytics';
import { CUSTOMER_AVATAR } from './customersLive';
import { DAY_LONG, change, changeLabel, hourLabel, isUp, share, useAnalyticsFilter } from './analyticsLive';

export type AnalyticsTab = 'overview' | 'audience';

interface BusinessAnalyticsScreenProps {
  initialTab: AnalyticsTab;
  onExit: () => void;
  onNavigate: (target: 'overview' | 'audience' | 'branches') => void;
}

type NavKey = 'overview' | 'traffic' | 'offers' | 'audience' | 'manage';
type ChipKey = 'business' | 'customers' | 'deals' | 'locations' | 'pos';
type PeriodKey = 'Today' | '7D' | '30D' | 'Custom';

const NAV_ITEMS: { key: NavKey; icon: string; label: string }[] = [
  { key: 'overview', icon: 'dashboard', label: 'Overview' },
  { key: 'traffic', icon: 'insights', label: 'Traffic' },
  { key: 'offers', icon: 'campaign', label: 'Offers' },
  { key: 'audience', icon: 'group', label: 'Audience' },
  { key: 'manage', icon: 'tune', label: 'Manage' },
];

const PERIODS: PeriodKey[] = ['Today', '7D', '30D', 'Custom'];

const PERIOD_SCALE: Record<PeriodKey, number> = { Today: 0.033, '7D': 0.233, '30D': 1, Custom: 1 };
/** Days each period chip queries when live (Custom uses the analytics filter's period). */
const PERIOD_DAYS: Record<Exclude<PeriodKey, 'Custom'>, number> = { Today: 1, '7D': 7, '30D': 30 };
const CHANNEL_STYLES = [
  { dot: 'bg-primary', shareClass: 'text-text-secondary' },
  { dot: 'bg-primary-container', shareClass: 'text-badge-discount-text' },
  { dot: 'bg-secondary-container', shareClass: 'text-text-secondary' },
];
const pct = (fraction: number) => `${Math.round(fraction * 1000) / 10}%`;
const deltaText = (comparison?: { current: number; previous: number }) => {
  const value = change(comparison);
  return value == null ? '—' : `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}%`;
};
const deltaClassFor = (comparison?: { current: number; previous: number }) =>
  (change(comparison) ?? 0) >= 0 ? 'text-badge-discount-text' : 'text-error';

const naira = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;
const countFmt = (value: number) => Math.round(value).toLocaleString('en-US');

interface ChannelRow {
  name: string;
  meta: string;
  base: number;
  sharePct: number;
  dot: string;
  shareClass: string;
}

const OVERVIEW_CONFIG: Record<
  'business' | 'deals' | 'pos',
  {
    heroLabel: string;
    heroBase: number;
    heroFmt: (value: number) => string;
    heroDelta: string;
    heroDeltaUp: boolean;
    heroNote: string;
    metrics: Array<{
      label: string;
      base?: number;
      fmt?: (value: number) => string;
      fixedValue?: string;
      delta: string;
      deltaClass: string;
    }>;
    channels: ChannelRow[];
  }
> = {
  business: {
    heroLabel: 'Gross Sales Volume',
    heroBase: 4850000,
    heroFmt: naira,
    heroDelta: '18.4%',
    heroDeltaUp: true,
    heroNote: '0% platform commission',
    metrics: [
      { label: 'Orders', base: 1420, fmt: countFmt, delta: '+12%', deltaClass: 'text-badge-discount-text' },
      { label: 'Avg Ticket', fixedValue: '₦3,415', delta: '+5.2%', deltaClass: 'text-badge-discount-text' },
      { label: 'Retention', fixedValue: '64%', delta: 'Repeat', deltaClass: 'text-primary' },
    ],
    channels: [
      { name: 'In-Store POS', meta: 'Countertop & Tableside', base: 3010000, sharePct: 62, dot: 'bg-primary', shareClass: 'text-text-secondary' },
      { name: 'VEMTAP Deals & Vouchers', meta: 'Mobile discovery purchases', base: 1260000, sharePct: 26, dot: 'bg-primary-container', shareClass: 'text-badge-discount-text' },
      { name: 'Online Catalog Inquiries', meta: 'Social link orders', base: 580000, sharePct: 12, dot: 'bg-secondary-container', shareClass: 'text-text-secondary' },
    ],
  },
  deals: {
    heroLabel: 'Deal Revenue Attributed',
    heroBase: 1260000,
    heroFmt: naira,
    heroDelta: '22.5%',
    heroDeltaUp: true,
    heroNote: '26% of gross intake',
    metrics: [
      { label: 'Vouchers', base: 684, fmt: countFmt, delta: '+18%', deltaClass: 'text-badge-discount-text' },
      { label: 'Campaign ROI', fixedValue: '312%', delta: '+46%', deltaClass: 'text-badge-discount-text' },
      { label: 'Discount', fixedValue: '17%', delta: 'Margin-safe', deltaClass: 'text-primary' },
    ],
    channels: [
      { name: 'Lunch Combo Deals', meta: 'Weekday set menus', base: 620000, sharePct: 49, dot: 'bg-primary', shareClass: 'text-text-secondary' },
      { name: 'Voucher Redemptions', meta: 'In-store claimed', base: 410000, sharePct: 33, dot: 'bg-primary-container', shareClass: 'text-badge-discount-text' },
      { name: 'Referral Rewards', meta: 'Bring-a-friend credits', base: 230000, sharePct: 18, dot: 'bg-secondary-container', shareClass: 'text-text-secondary' },
    ],
  },
  pos: {
    heroLabel: 'Terminal Gross Intake',
    heroBase: 3010000,
    heroFmt: naira,
    heroDelta: '13.7%',
    heroDeltaUp: true,
    heroNote: 'settled on VEMTAP rails',
    metrics: [
      { label: 'Tickets', base: 1420, fmt: countFmt, delta: '+9%', deltaClass: 'text-badge-discount-text' },
      { label: 'Offline Sync', base: 126, fmt: countFmt, delta: '+31%', deltaClass: 'text-badge-discount-text' },
      { label: 'Uptime', fixedValue: '99.4%', delta: '3 terminals', deltaClass: 'text-primary' },
    ],
    channels: [
      { name: 'Countertop Terminal', meta: 'Front desk checkout', base: 1380000, sharePct: 46, dot: 'bg-primary', shareClass: 'text-text-secondary' },
      { name: 'Tableside Terminal', meta: 'Waiter handhelds', base: 1050000, sharePct: 35, dot: 'bg-primary-container', shareClass: 'text-badge-discount-text' },
      { name: 'Drive-Thru Kiosk', meta: 'Self-service lane', base: 580000, sharePct: 19, dot: 'bg-secondary-container', shareClass: 'text-text-secondary' },
    ],
  },
};

const TREND_BUCKETS: Record<PeriodKey, Array<{ label: string; amount: number }>> = {
  Today: [
    { label: '10A', amount: 98000 },
    { label: '1P', amount: 110000 },
    { label: '4P', amount: 124000 },
    { label: '7P', amount: 153000 },
  ],
  '7D': [
    { label: 'Mon', amount: 250000 },
    { label: 'Wed', amount: 281000 },
    { label: 'Fri', amount: 340000 },
    { label: 'Sun', amount: 309000 },
  ],
  '30D': [
    { label: 'W1', amount: 980000 },
    { label: 'W2', amount: 1100000 },
    { label: 'W3', amount: 1240000 },
    { label: 'W4', amount: 1530000 },
  ],
  Custom: [
    { label: 'W1', amount: 980000 },
    { label: 'W2', amount: 1100000 },
    { label: 'W3', amount: 1240000 },
    { label: 'W4', amount: 1530000 },
  ],
};

const TOP_ITEMS = [
  { name: 'Prime Ribeye Steak', meta: '248 sold • Main Course', amount: '₦1,200,000', delta: '+14% MoM', width: '82%' },
  { name: 'Signature Smash Burgers', meta: '310 sold • Quick Bites', amount: '₦840,000', delta: '+9% MoM', width: '65%' },
  { name: 'Craft House Cocktails', meta: '190 sold • Bar & Drinks', amount: '₦520,000', delta: '+22% MoM', width: '48%' },
];

const HEATMAP = [
  { day: 'Mon-Thu', cells: ['bg-surface-container-high', 'bg-surface-container', 'bg-secondary-container', 'bg-surface-container-low'], muted: true },
  { day: 'Friday', cells: ['bg-secondary-container', 'bg-secondary-container', 'peak', 'bg-primary-container'], muted: false },
  { day: 'Saturday', cells: ['bg-secondary-container', 'bg-primary-container', 'rush', 'bg-primary-container'], muted: false },
  { day: 'Sunday', cells: ['bg-primary-container', 'bg-secondary-container', 'bg-surface-container-high', 'bg-surface-container-low'], muted: true },
];

const SEGMENTS = [
  { title: 'VIP Patrons (Top 5%)', meta: '92 patrons • ₦150k+ spend', badge: '₦13.8M Rev', badgeClass: 'text-badge-discount-text bg-badge-discount-bg', icon: 'stars', iconClass: 'bg-tertiary-fixed text-tertiary', bar: 'bg-tertiary', width: '88%', pct: '' },
  { title: 'Regular Diners', meta: '482 patrons • 3–5 visits/month', badge: '26.1%', badgeClass: 'text-text-primary', icon: 'restaurant', iconClass: 'bg-surface-tint-blue text-primary', bar: 'bg-primary-container', width: '62%', pct: '' },
  { title: 'Deal Explorers', meta: '640 patrons • 1–2 visits (voucher led)', badge: '34.7%', badgeClass: 'text-text-secondary', icon: 'local_activity', iconClass: 'bg-surface-container text-secondary', bar: 'bg-secondary', width: '35%', pct: '' },
];

const PATRONS = [
  { name: 'Michael James', meta: '14 visits • Maitama local', amount: '₦184,200', tag: 'Top #1 Spender', tagClass: 'text-badge-discount-text', icon: 'verified', iconClass: 'text-tertiary', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE0xFpoDoULewM4BgHAHbHhiVZRZZGpfUo5nodyK6e3a16iDzOk1F7v1WMOhSx2twvwwGwprh85ogMjmartkr5dZLUoUmrK-5X6v7U1GMuxNByC4YXasAYfvKEedNeCGadYqL0SqJHs9ILLKCDbFRpogHDHSDzLHIaS8iMcM6pUQcs8maYckyvB9LNxMXVqGwwWQ661JWoBX7LCWBwpLZ1J6V94kgh4p2zAmEYlKbtuaS_jTxdzry39g' },
  { name: 'Sarah Adams', meta: '8 visits • 5 deals unlocked', amount: '₦78,500', tag: 'Deal Champion', tagClass: 'text-primary', icon: 'local_fire_department', iconClass: 'text-primary', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwObFKdW8I_pwVZqmrcIyOq7PfG9Ch7GTkqQ1abYorskCvhn-oug02ZlvM-14syv98ZtPp4s4rFmoQFXWxhIoClyTJxeyiYhqA6RNXhlLzE6GIsQFw2N_kPrJhUKWvrs_79iFXqLQZvkfyVi7o8-RxIjUM22U0pF2A21vkwFsGypD4y2CehjQGy996G9KTvlXAAXgzIb4_eQnw-D-EEwQf4dxgIKCA1nJkSieJwIKa85-Feof9r_6pww' },
];

export function BusinessAnalyticsScreen({ initialTab, onExit, onNavigate }: BusinessAnalyticsScreenProps) {
  const [nav, setNav] = useState<NavKey>(initialTab);
  const [chip, setChip] = useState<ChipKey>(initialTab === 'audience' ? 'customers' : 'business');
  const [dateRange, setDateRange] = useState<PeriodKey>('Today');
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setNav(initialTab);
    setChip(initialTab === 'audience' ? 'customers' : 'business');
  }, [initialTab]);

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

  const live = hasApiConfig();
  const filter = useAnalyticsFilter();
  const days = dateRange === 'Custom' ? filter.days : PERIOD_DAYS[dateRange];
  const branchId = filter.branchId ?? undefined;
  const overviewQuery = useBusinessAnalytics('overview', days, branchId);
  const overviewData = overviewQuery.data;
  const dealsData = useBusinessAnalytics('deals', days, branchId).data;
  const posData = useBusinessAnalytics('pos', days, branchId).data;
  const customersQuery = useBusinessAnalytics('customers', days, branchId);
  const customersData = customersQuery.data;
  const overviewError = overviewQuery.error ?? customersQuery.error;

  useEffect(() => {
    if (live && overviewError) showToast(apiErrorMessage(overviewError, 'Could not load your analytics.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewError]);

  /** Live: the hero, metrics and channel split for the chosen domain, in the config's shape. */
  const liveConfig = (key: 'business' | 'deals' | 'pos'): (typeof OVERVIEW_CONFIG)['business'] => {
    if (key === 'deals') {
      const totals = dealsData?.totals;
      const topDeals = [...(dealsData?.deals ?? [])].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
      const dealRevenue = topDeals.reduce((sum, deal) => sum + deal.revenue, 0);
      return {
        heroLabel: 'Deal Revenue Attributed',
        heroBase: totals?.revenue ?? 0,
        heroFmt: naira,
        heroDelta: changeLabel(totals?.claims),
        heroDeltaUp: isUp(totals?.claims),
        heroNote: `${countFmt(totals?.claims.current ?? 0)} claims`,
        metrics: [
          { label: 'Redeemed', fixedValue: countFmt(totals?.redeemed ?? 0), delta: deltaText(totals?.claims), deltaClass: deltaClassFor(totals?.claims) },
          { label: 'Claim Rate', fixedValue: pct(totals?.claimRate ?? 0), delta: 'of views', deltaClass: 'text-primary' },
          { label: 'Live Deals', fixedValue: countFmt(totals?.live ?? 0), delta: `${countFmt(totals?.ended ?? 0)} ended`, deltaClass: 'text-primary' },
        ],
        channels: topDeals.map((deal, index) => ({
          name: deal.name,
          meta: `${countFmt(deal.claims)} claims • ${countFmt(deal.redeemed)} redeemed`,
          base: deal.revenue,
          sharePct: Math.round(share(deal.revenue, dealRevenue)),
          ...CHANNEL_STYLES[index],
        })),
      };
    }
    if (key === 'pos') {
      const tenders = [...(posData?.tenders ?? [])].sort((a, b) => b.amount - a.amount).slice(0, 3);
      return {
        heroLabel: 'Terminal Gross Intake',
        heroBase: posData?.sales.current ?? 0,
        heroFmt: naira,
        heroDelta: changeLabel(posData?.sales),
        heroDeltaUp: isUp(posData?.sales),
        heroNote: `${countFmt(posData?.tickets.current ?? 0)} tickets`,
        metrics: [
          { label: 'Tickets', fixedValue: countFmt(posData?.tickets.current ?? 0), delta: deltaText(posData?.tickets), deltaClass: deltaClassFor(posData?.tickets) },
          { label: 'Avg Ticket', fixedValue: naira(posData?.averageTicket.current ?? 0), delta: deltaText(posData?.averageTicket), deltaClass: deltaClassFor(posData?.averageTicket) },
          { label: 'Refunds', fixedValue: pct(posData?.refunds.rate ?? 0), delta: `${countFmt(posData?.refunds.count ?? 0)} refunds`, deltaClass: 'text-primary' },
        ],
        channels: tenders.map((tender, index) => ({
          name: tender.method.charAt(0).toUpperCase() + tender.method.slice(1),
          meta: `${countFmt(tender.count)} payments`,
          base: tender.amount,
          sharePct: Math.round(tender.share * 100),
          ...CHANNEL_STYLES[index],
        })),
      };
    }
    const channels = overviewData?.channels ?? [];
    const channelRevenue = channels.reduce((sum, channel) => sum + channel.revenue, 0);
    return {
      heroLabel: 'Gross Sales Volume',
      heroBase: overviewData?.revenue.current ?? 0,
      heroFmt: naira,
      heroDelta: changeLabel(overviewData?.revenue),
      heroDeltaUp: isUp(overviewData?.revenue),
      heroNote: `${countFmt(overviewData?.interactions.current ?? 0)} interactions`,
      metrics: [
        { label: 'Orders', fixedValue: countFmt(overviewData?.orders.current ?? 0), delta: deltaText(overviewData?.orders), deltaClass: deltaClassFor(overviewData?.orders) },
        { label: 'Avg Ticket', fixedValue: naira(overviewData?.averageOrderValue.current ?? 0), delta: deltaText(overviewData?.averageOrderValue), deltaClass: deltaClassFor(overviewData?.averageOrderValue) },
        { label: 'Retention', fixedValue: pct(overviewData?.customers.repeatRate ?? 0), delta: 'Repeat', deltaClass: 'text-primary' },
      ],
      channels: channels.map((channel, index) => ({
        name: channel.id === 'pos' ? 'In-Store POS' : 'Online Orders',
        meta: `${countFmt(channel.orders)} ${channel.id === 'pos' ? 'tickets' : 'orders'}`,
        base: channel.revenue,
        sharePct: Math.round(share(channel.revenue, channelRevenue)),
        ...CHANNEL_STYLES[index % CHANNEL_STYLES.length],
      })),
    };
  };

  /** Live: the period split into up to four buckets, current vs previous revenue. */
  const liveTrend = () => {
    if (days <= 1) {
      const windows = [0, 1, 2, 3].map((index) => {
        const hours = (overviewData?.hourly ?? []).filter((row) => Math.floor(row.hour / 6) === index);
        return { label: hourLabel(index * 6).replace(' ', ''), amount: hours.reduce((sum, row) => sum + row.revenue, 0), previous: 0 };
      });
      return windows;
    }
    const series = overviewData?.series ?? [];
    const size = Math.max(1, Math.ceil(series.length / 4));
    return [0, 1, 2, 3]
      .map((index) => series.slice(index * size, (index + 1) * size))
      .filter((chunk) => chunk.length)
      .map((chunk, index) => ({
        label:
          days <= 7
            ? new Date(`${chunk[0].date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
            : `W${index + 1}`,
        amount: chunk.reduce((sum, row) => sum + row.revenue, 0),
        previous: chunk.reduce((sum, row) => sum + row.previousRevenue, 0),
      }));
  };

  const handleExportReport = () => {
    printReport(
      `VEMTAP Analytics Report — ${activeChip.label} (${dateRange})`,
      `${printKvTable('Key Metrics', [
        [overview.heroLabel, `${overview.heroFmt(overview.heroBase * periodScale)} (${overview.heroDelta})`],
        ...overview.metrics.map(
          (metric) => [metric.label, metric.fixedValue ?? metric.fmt?.((metric.base ?? 0) * periodScale) ?? '—'] as [string, string],
        ),
      ])}
${printKvTable('Sales Channels', overview.channels.map((channel) => [channel.name, `${naira(channel.base * periodScale)} — ${channel.sharePct}% share`] as [string, string]))}
${printKvTable('Revenue Trend', trendBuckets.map((bucket) => [bucket.label, naira(bucket.amount * periodScale)] as [string, string]))}`,
    );
    showToast('Report ready — choose "Save as PDF" in the print dialog.');
  };

  const handleExportCsv = () => {
    const rows: Array<Array<string | number>> = [
      [overview.heroLabel, overview.heroFmt(overview.heroBase * periodScale), overview.heroDelta],
      ...overview.metrics.map((metric) => [
        metric.label,
        metric.fixedValue ?? metric.fmt?.((metric.base ?? 0) * periodScale) ?? '—',
        metric.delta,
      ]),
      ...overview.channels.map((channel) => [
        channel.name,
        naira(channel.base * periodScale),
        `${channel.sharePct}% share`,
      ]),
      ...trendBuckets.map((bucket) => [`Trend ${bucket.label}`, naira(bucket.amount * periodScale), '']),
    ];
    downloadCsv(`vemtap_analytics_${overviewKey}_${dateRange.toLowerCase()}`, ['Metric', 'Value', 'Change'], rows);
    showToast(`Exported ${rows.length} rows to CSV`);
  };

  const handleNav = (key: NavKey) => {
    if (key === 'overview' || key === 'audience') {
      onNavigate(key);
      return;
    }
    setNav(key);
  };

  const handleChip = (key: ChipKey) => {
    setDomainMenuOpen(false);
    if (key === 'business') {
      setChip('business');
      onNavigate('overview');
      return;
    }
    if (key === 'customers') {
      setChip('customers');
      onNavigate('audience');
      return;
    }
    if (key === 'locations') {
      onNavigate('branches');
      return;
    }
    setChip(key);
    showToast(key === 'deals' ? 'Deal campaign analytics loaded' : 'POS terminal sync status refreshed');
  };

  const chips: { key: ChipKey; label: string; icon?: string }[] = [
    { key: 'business', label: 'Business', icon: 'query_stats' },
    { key: 'customers', label: 'Customers', icon: 'group' },
    { key: 'deals', label: 'Deals', icon: 'local_offer' },
    { key: 'locations', label: 'Locations', icon: 'pin_drop' },
    { key: 'pos', label: 'POS Sync', icon: 'point_of_sale' },
  ];
  const activeChip = chips.find((item) => item.key === chip) ?? chips[0];
  const overviewKey: 'business' | 'deals' | 'pos' = chip === 'deals' || chip === 'pos' ? chip : 'business';
  const overview = live ? liveConfig(overviewKey) : OVERVIEW_CONFIG[overviewKey];
  const periodScale = live ? 1 : PERIOD_SCALE[dateRange];
  const trendBuckets = live ? liveTrend() : TREND_BUCKETS[dateRange].map((bucket) => ({ ...bucket, previous: 0 }));
  const trendMax = Math.max(1, ...trendBuckets.flatMap((bucket) => [bucket.amount, bucket.previous]));
  const trendDelta = (overviewData?.revenue.current ?? 0) - (overviewData?.revenue.previous ?? 0);
  const bestDay = (overviewData?.weekdays ?? []).reduce<{ dow: number; revenue: number } | null>(
    (best, day) => (!best || day.revenue > best.revenue ? day : best),
    null,
  );
  const bestHour = (overviewData?.hourly ?? []).reduce<{ hour: number; revenue: number } | null>(
    (best, hour) => (!best || hour.revenue > best.revenue ? hour : best),
    null,
  );
  const topItemMax = Math.max(1, ...(overviewData?.topItems ?? []).map((item) => item.revenue));
  const topItems = live
    ? (overviewData?.topItems ?? []).slice(0, 3).map((item) => ({
        name: item.name,
        meta: `${countFmt(item.quantity)} sold`,
        amount: naira(item.revenue),
        delta: `${Math.round(item.dealShare * 100)}% via deals`,
        width: `${Math.round((item.revenue / topItemMax) * 100)}%`,
      }))
    : TOP_ITEMS;
  const segmentsData = customersData?.segments;
  const segmentSpend = segmentsData
    ? segmentsData.vip.spend + segmentsData.regular.spend + segmentsData.new.spend + segmentsData.lapsed.spend
    : 0;
  const segments = live
    ? (
        [
          ['vip', 'VIP Customers'],
          ['regular', 'Regular Customers'],
          ['new', 'New Customers'],
        ] as const
      ).map(([key, title], index) => {
        const segment = segmentsData?.[key];
        return {
          ...SEGMENTS[index],
          title,
          meta: `${countFmt(segment?.count ?? 0)} customers • ${naira(segment?.spend ?? 0)} spend`,
          badge: pct(segment?.share ?? 0),
          width: `${Math.round((segment?.share ?? 0) * 100)}%`,
        };
      })
    : SEGMENTS;
  const patrons = live
    ? (customersData?.topCustomers ?? []).slice(0, 3).map((customer, index) => ({
        ...PATRONS[index % PATRONS.length],
        name: customer.name || 'Customer',
        meta: `${countFmt(customer.visits)} visits`,
        amount: naira(customer.spend),
        tag: customer.tier ? `${customer.tier} Tier` : index === 0 ? 'Top spender' : 'Top customer',
        avatar: CUSTOMER_AVATAR,
      }))
    : PATRONS;
  const vipShare = segmentSpend && segmentsData ? Math.round((segmentsData.vip.spend / segmentSpend) * 100) : 0;
  const audienceMetrics = live
    ? [
        {
          label: 'Customers',
          icon: 'person_pin',
          value: countFmt(customersData?.total.current ?? 0),
          delta: `+${countFmt(customersData?.new.current ?? 0)} new this period`,
          deltaClass: 'text-badge-discount-text',
        },
        {
          label: 'Repeat Rate',
          icon: 'repeat',
          value: pct(customersData?.repeatRate.current ?? 0),
          delta: `${countFmt(customersData?.returning ?? 0)} returning`,
          deltaClass: 'text-text-secondary',
        },
        {
          label: 'Avg Spend',
          icon: 'payments',
          value: naira(customersData?.averageSpend ?? 0),
          delta: 'Per active customer',
          deltaClass: 'text-text-secondary',
        },
        {
          label: 'Visit Frequency',
          icon: 'near_me',
          value: `${Math.round((customersData?.visitsPerActiveCustomer ?? 0) * 10) / 10}`,
          delta: 'Visits per active customer',
          deltaClass: 'text-text-secondary',
        },
      ]
    : [
        { label: 'Captured Diners', icon: 'person_pin', value: '1,842', delta: '+142 this mo', deltaClass: 'text-badge-discount-text' },
        { label: 'Repeat Rate', icon: 'repeat', value: '58%', delta: '76 patrons power bulk', deltaClass: 'text-text-secondary' },
        { label: 'Avg Lifetime Value', icon: 'payments', value: '₦38,400', delta: '+8.4% vs benchmark', deltaClass: 'text-badge-discount-text' },
        { label: 'VEMTAP Velocity', icon: 'near_me', value: '+34', delta: 'New walk-ins / week', deltaClass: 'text-text-secondary' },
      ];

  const header = (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin pt-space-xs pb-space-2xs flex flex-col gap-space-2xs">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Back to business hub"
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
              type="button"
              onClick={onExit}
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
              Analytics &amp; Intelligence
            </span>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Export report"
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              type="button"
              onClick={handleExportReport}
            >
              <Icon name="ios_share" className="text-[18px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[17px]" />
            </div>
          </div>
        </div>
        {/* Period dropdown (replaces the old date-range chips) */}
        <div className="relative">
          <button
            aria-expanded={periodMenuOpen}
            aria-haspopup="listbox"
            className="h-9 px-space-sm rounded-full bg-surface-container-low flex items-center gap-space-2xs text-on-surface hover:bg-surface-container transition-colors"
            type="button"
            onClick={() => {
              setPeriodMenuOpen((open) => !open);
              setDomainMenuOpen(false);
            }}
          >
            <Icon name="calendar_month" className="text-primary text-[16px]" />
            <span className="font-label-sm text-label-sm font-semibold">{dateRange}</span>
            <Icon name="expand_more" className="text-on-surface-variant text-[16px]" />
          </button>
          {periodMenuOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-50 w-44 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 animate-fade-in"
              role="listbox"
            >
              {PERIODS.map((period) => (
                <button
                  aria-selected={dateRange === period}
                  className="w-full px-3 py-2 text-left font-label-sm text-label-sm text-text-primary hover:bg-surface-container-low flex items-center justify-between"
                  key={period}
                  role="option"
                  type="button"
                  onClick={() => {
                    setDateRange(period);
                    setPeriodMenuOpen(false);
                    showToast(`Period set to ${period}`);
                  }}
                >
                  <span>{period}</span>
                  {dateRange === period && <Icon name="check" className="text-primary text-[16px]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const analyticsNav = (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-space-xs">
        {NAV_ITEMS.map((item) => {
          const active = nav === item.key;
          return (
            <button
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-space-2xs w-16 h-12 transition-colors ${
                active ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              key={item.key}
              type="button"
              onClick={() => handleNav(item.key)}
            >
              <Icon name={item.icon} className="text-[21px]" filled={active} />
              <span className="font-caption text-caption">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  const categoryChips = (
    <div className="relative">
      <button
        aria-expanded={domainMenuOpen}
        aria-haspopup="listbox"
        className="h-9 px-space-sm rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs shadow-sm active:scale-95 transition-transform"
        type="button"
        onClick={() => {
          setDomainMenuOpen((open) => !open);
          setPeriodMenuOpen(false);
        }}
      >
        {activeChip.icon && <Icon name={activeChip.icon} className="text-[15px]" />}
        <span>{activeChip.label}</span>
        <Icon name="expand_more" className="text-[16px]" />
      </button>
      {domainMenuOpen && (
        <div
          className="absolute left-0 top-full mt-1 z-50 w-48 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 animate-fade-in"
          role="listbox"
        >
          {chips.map((item) => (
            <button
              aria-selected={chip === item.key}
              className="w-full px-3 py-2 text-left font-label-sm text-label-sm text-text-primary hover:bg-surface-container-low flex items-center justify-between"
              key={item.key}
              role="option"
              type="button"
              onClick={() => handleChip(item.key)}
            >
              <span className="flex items-center gap-2">
                {item.icon && <Icon name={item.icon} className="text-[15px] text-primary" />}
                <span>{item.label}</span>
              </span>
              {chip === item.key && <Icon name="check" className="text-primary text-[16px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <>
      {/* Sub-header */}
      <section className="px-margin pt-space-xs pb-space-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="font-caption text-caption text-text-secondary tracking-wide uppercase font-semibold">
              Analytics &amp; Intelligence
            </span>
            <h1 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">{overview.heroLabel}</h1>
          </div>
          <button
            className="h-9 px-space-sm rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm flex items-center gap-space-2xs shadow-sm active:scale-95 transition-transform"
            type="button"
            onClick={handleExportCsv}
          >
            <Icon name="file_download" className="text-[16px]" />
            <span>Export</span>
          </button>
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          <span className="shrink-0 flex items-center gap-space-2xs px-space-sm h-8 rounded-full bg-surface-container-low text-text-primary font-label-sm text-label-sm">
            <Icon name="calendar_today" className="text-text-secondary text-[14px]" />
            <span className="font-semibold">{dateRange}</span>
          </span>
          <span className="shrink-0 flex items-center px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span>Live Sync</span>
          </span>
        </div>
        {/* Domain switcher dropdown (replaces the old chip row) */}
        {categoryChips}
      </section>

      {/* Hero KPI */}
      <section className="px-margin pb-space-xs flex flex-col gap-space-sm">
        <div className="p-space-md rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">{overview.heroLabel}</span>
            <span
              className={`inline-flex items-center gap-0.5 px-space-2xs py-0.5 rounded-md font-caption text-caption font-semibold ${
                overview.heroDeltaUp ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
              }`}
            >
              <Icon name={overview.heroDeltaUp ? 'arrow_upward' : 'arrow_downward'} className="text-[13px]" />
              {overview.heroDelta}
            </span>
          </div>
          <div className="font-heading-md text-heading-md text-text-primary font-bold">
            {overview.heroFmt(overview.heroBase * periodScale)}
          </div>
          <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
            <span>Period: {dateRange}</span>
            <span className="text-primary font-semibold">{overview.heroNote}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {overview.metrics.map((metric) => ({
            label: metric.label,
            value: metric.fixedValue ?? metric.fmt?.((metric.base ?? 0) * periodScale) ?? '—',
            delta: metric.delta,
            deltaClass: metric.deltaClass,
          })).map((metric) => (
            <div className="p-space-sm rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-0.5" key={metric.label}>
              <span className="font-caption text-caption text-text-secondary truncate">{metric.label}</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">{metric.value}</span>
              <span className={`font-caption text-caption font-semibold ${metric.deltaClass}`}>{metric.delta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue trend */}
      <section className="px-margin py-space-xs">
        <div className="p-space-md rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Revenue Trend</h2>
              <span className="font-caption text-caption text-text-secondary">{dateRange} performance trajectory</span>
            </div>
            <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span>Current</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-surface-container ml-1" />
              <span>Benchmark</span>
            </div>
          </div>
          <div className="w-full flex flex-col justify-end pt-space-2xs">
            <svg className="w-full h-32" fill="none" preserveAspectRatio="none" viewBox="0 0 320 120">
              <line stroke="#f1f3ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="30" y2="30" />
              <line stroke="#f1f3ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="70" y2="70" />
              <line stroke="#e9edff" strokeWidth="1" x1="0" x2="320" y1="110" y2="110" />
              {live ? (
                trendBuckets.map((bucket, index) => {
                  const previous = Math.round((bucket.previous / trendMax) * 100);
                  const current = Math.round((bucket.amount / trendMax) * 100);
                  return (
                    <g key={bucket.label}>
                      <rect fill="#e9edff" height={previous} rx="3" width="16" x={24 + index * 72} y={110 - previous} />
                      <rect fill="#0055c4" height={current} rx="3" width="16" x={44 + index * 72} y={110 - current} />
                    </g>
                  );
                })
              ) : (
                <>
              <rect fill="#e9edff" height="55" rx="3" width="16" x="24" y="55" />
                <rect fill="#0055c4" height="68" rx="3" width="16" x="44" y="42" />
                <rect fill="#e9edff" height="62" rx="3" width="16" x="96" y="48" />
                <rect fill="#0055c4" height="78" rx="3" width="16" x="116" y="32" />
                <rect fill="#e9edff" height="70" rx="3" width="16" x="168" y="40" />
                <rect fill="#0055c4" height="88" rx="3" width="16" x="188" y="22" />
                <rect fill="#e9edff" height="74" rx="3" width="16" x="240" y="36" />
                <rect fill="#066cf4" height="100" rx="3" width="16" x="260" y="10" />
                <circle cx="268" cy="10" fill="#066cf4" r="4" stroke="#ffffff" strokeWidth="2" />
                </>
              )}
            </svg>
            <div className="flex justify-around text-text-tertiary font-caption text-caption pt-space-2xs">
              {trendBuckets.map((bucket, index) => (
                <span
                  className={`w-16 text-center ${index === 3 ? 'text-primary font-semibold' : ''}`}
                  key={bucket.label}
                >
                  {bucket.label} ({naira(bucket.amount * periodScale)})
                </span>
              ))}
            </div>
          </div>
          <div className="p-space-xs rounded-xl bg-surface-container-low flex items-center justify-between text-on-surface">
            <div className="flex items-center gap-space-2xs">
              <Icon name="bolt" className="text-primary text-[17px]" />
              <span className="font-label-sm text-label-sm font-semibold">
                {live
                  ? `${trendDelta >= 0 ? '+' : '-'}${naira(Math.abs(trendDelta))} vs previous period`
                  : `Target Exceeded: +${naira(overview.heroBase * periodScale * 0.089)}`}
              </span>
            </div>
            <span className="font-caption text-caption text-text-secondary">{live ? dateRange : `${dateRange} streak`}</span>
          </div>
        </div>
      </section>

      {/* Sales channel split */}
      <section className="px-margin py-space-xs">
        <div className="p-space-md rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Sales Channel Split</h2>
              <span className="font-caption text-caption text-text-secondary">Direct POS vs VEMTAP touchpoints</span>
            </div>
            <Icon name="donut_large" className="text-text-tertiary text-[18px]" />
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface-container flex overflow-hidden">
            {overview.channels.map((channel) => (
              <div className={`h-full ${channel.dot}`} key={channel.name} style={{ width: `${channel.sharePct}%` }} />
            ))}
          </div>
          <div className="flex flex-col gap-space-xs">
            {overview.channels.map((channel) => (
              <div className="flex items-center justify-between p-space-xs rounded-xl bg-surface-subtle" key={channel.name}>
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${channel.dot}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{channel.name}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">{channel.meta}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                    {naira(channel.base * periodScale)}
                  </span>
                  <span className={`font-caption text-caption font-semibold ${channel.shareClass}`}>
                    {channel.sharePct}% share
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heatmap */}
      <section className="px-margin py-space-xs">
        <div className="p-space-md rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Peak Footfall Heatmap</h2>
              <span className="font-caption text-caption text-text-secondary">Busiest operational windows</span>
            </div>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
              {live ? (bestDay && bestDay.revenue > 0 ? `${DAY_LONG[bestDay.dow]} peak` : '—') : 'Fri & Sat Surge'}
            </span>
          </div>
          <div className="flex flex-col gap-space-2xs">
            <div className="grid grid-cols-5 text-center font-caption text-caption text-text-tertiary pb-1">
              <span>Day</span>
              <span>11A-2P</span>
              <span>2P-6P</span>
              <span className="text-primary font-semibold">6P-9P</span>
              <span>9P-12A</span>
            </div>
            {HEATMAP.map((row) => (
              <div className="grid grid-cols-5 items-center text-center py-0.5" key={row.day}>
                <span
                  className={`font-caption text-caption text-left pl-1 ${
                    row.muted ? 'text-text-secondary' : 'text-text-primary font-medium'
                  }`}
                >
                  {row.day}
                </span>
                {row.cells.map((cell, index) =>
                  live ? (
                    // Day-by-hour figures are not reported yet, so live cells stay neutral.
                    <span className="h-6 mx-1 rounded bg-surface-container-low" key={`${row.day}-${index}`} />
                  ) : cell === 'peak' || cell === 'rush' ? (
                    <span
                      className="h-6 mx-1 rounded bg-primary text-on-primary font-caption text-caption flex items-center justify-center font-bold shadow-sm"
                      key={`${row.day}-${index}`}
                    >
                      {cell === 'peak' ? 'Peak' : 'Rush'}
                    </span>
                  ) : (
                    <span className={`h-6 mx-1 rounded ${cell}`} key={`${row.day}-${index}`} />
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="pt-space-2xs flex items-center gap-space-xs text-text-secondary font-caption text-caption">
            <Icon name="schedule" className="text-[15px] text-tertiary-container" />
            <span>
              {live
                ? bestDay && bestDay.revenue > 0
                  ? `Busiest: ${DAY_LONG[bestDay.dow]}${bestHour && bestHour.revenue > 0 ? ` around ${hourLabel(bestHour.hour)}` : ''}. Day-by-hour detail isn't available yet.`
                  : 'Not enough activity yet.'
                : 'Recommended: Schedule +2 floor staff on Friday 5:30 PM.'}
            </span>
          </div>
        </div>
      </section>

      {/* Top grossing */}
      <section className="px-margin py-space-xs">
        <div className="p-space-md rounded-2xl bg-surface-canvas shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold">Top Grossing Offerings</h2>
              <span className="font-caption text-caption text-text-secondary">Highest volume drivers</span>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary font-semibold"
              type="button"
              onClick={() => showToast(live ? 'Your full sales list is in the POS analytics.' : 'Showing all 42 offerings')}
            >
              {live ? `Top ${topItems.length}` : 'View All (42)'}
            </button>
          </div>
          <div className="flex flex-col gap-space-xs">
            {topItems.map((item) => (
              <div className="p-space-xs rounded-xl bg-surface-subtle flex items-center gap-space-sm" key={item.name}>
                <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                  <Icon name="restaurant_menu" className="text-primary text-[18px]" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">{item.name}</span>
                  <span className="font-caption text-caption text-text-secondary">{item.meta}</span>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: item.width }} />
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-bold">{item.amount}</span>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold">{item.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-margin pt-space-xs pb-space-xl flex flex-col gap-space-xs">
        <button
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
          type="button"
          onClick={handleExportReport}
        >
          <Icon name="picture_as_pdf" className="text-[18px]" />
          <span>Download PDF Executive Report</span>
        </button>
        <p className="text-center font-caption text-caption text-text-tertiary">
          Instant settlement data verified. No third-party processing deductions.
        </p>
      </section>
    </>
  );

  const renderAudience = () => (
    <div className="flex flex-col w-full px-margin pb-space-xl gap-space-md pt-space-xs">
      {categoryChips}

      {/* AI insight hero */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center">
              <Icon name="smart_toy" className="text-primary text-[17px]" />
            </div>
            <span className="font-caption text-caption text-primary font-semibold tracking-wide uppercase">
              AI Merchant Insight
            </span>
          </div>
          <span className="font-caption text-caption bg-badge-discount-bg text-badge-discount-text font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            Live sync
          </span>
        </div>
        <div>
          <p className="font-heading-sm text-heading-sm text-text-primary font-bold">
            {live
              ? `Repeat rate is ${pct(customersData?.repeatRate.current ?? 0)} (${deltaText(customersData?.repeatRate)})`
              : 'Patron Retention is Up +18%'}
          </p>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            {live ? (
              <>
                {countFmt(segmentsData?.vip.count ?? 0)} VIP customers generated{' '}
                <strong className="text-text-primary">{vipShare}% of customer spend</strong> this period.
              </>
            ) : (
              <>
                76 VIP regulars generated over <strong className="text-text-primary">58% of gross revenue</strong> in Abuja
                Downtown this cycle.
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-space-xs pt-space-2xs">
          <button
            className="h-10 px-space-md bg-surface-tint-blue text-primary rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs active:scale-95 transition-all"
            type="button"
            onClick={() =>
              showToast(live ? 'Sending perks from analytics is coming soon.' : 'VIP Chef Special invite queued for 76 regulars!')
            }
          >
            <Icon name="bolt" className="text-[16px]" />
            <span>Trigger VIP Thank-You Perk</span>
          </button>
        </div>
      </div>

      {/* Metrics matrix */}
      <div className="grid grid-cols-2 gap-space-sm">
        {audienceMetrics.map((metric) => (
          <div className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex flex-col justify-between" key={metric.label}>
            <div className="flex items-center justify-between mb-space-2xs">
              <span className="font-caption text-caption text-text-secondary font-medium">{metric.label}</span>
              <Icon name={metric.icon} className="text-primary text-[18px]" />
            </div>
            <div>
              <div className="font-heading-md text-heading-md text-text-primary font-bold">{metric.value}</div>
              <div className={`flex items-center gap-1 font-caption text-caption font-semibold mt-0.5 ${metric.deltaClass}`}>
                {metric.deltaClass === 'text-badge-discount-text' && <Icon name="trending_up" className="text-[13px]" />}
                <span>{metric.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Retention curve */}
      <div className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-label-md text-label-md text-text-primary font-semibold">Patron Comeback Frequency</h2>
            <p className="font-caption text-caption text-text-secondary">Weekly post-discovery return rate (W1 - W8)</p>
          </div>
          <span className="font-caption text-caption font-semibold text-primary bg-surface-tint-blue px-2.5 py-1 rounded-full">
            {live ? '—' : 'Cohort 2024'}
          </span>
        </div>
        <div className="w-full relative">
          {live ? (
            <p className="font-caption text-caption text-text-tertiary py-space-md text-center">
              Week-by-week return rates aren't available yet.
            </p>
          ) : (
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 340 130">
            <defs>
              <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#066CF4" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#066CF4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line stroke="#f1f3ff" strokeDasharray="3 3" strokeWidth="1.5" x1="10" x2="330" y1="20" y2="20" />
            <line stroke="#f1f3ff" strokeDasharray="3 3" strokeWidth="1.5" x1="10" x2="330" y1="60" y2="60" />
            <line stroke="#f1f3ff" strokeWidth="1.5" x1="10" x2="330" y1="100" y2="100" />
            <path
              d="M 15 25 C 50 35, 75 50, 110 58 C 160 70, 200 66, 250 82 C 290 92, 310 94, 325 96 L 325 100 L 15 100 Z"
              fill="url(#curveGradient)"
            />
            <path
              d="M 15 25 C 50 35, 75 50, 110 58 C 160 70, 200 66, 250 82 C 290 92, 310 94, 325 96"
              fill="none"
              stroke="#066CF4"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <circle cx="15" cy="25" fill="#FFFFFF" r="4.5" stroke="#066CF4" strokeWidth="2.5" />
            <circle cx="110" cy="58" fill="#FFFFFF" r="4.5" stroke="#066CF4" strokeWidth="2.5" />
            <circle cx="200" cy="66" fill="#FFFFFF" r="4.5" stroke="#066CF4" strokeWidth="2.5" />
            <circle cx="325" cy="96" fill="#FFFFFF" r="4.5" stroke="#066CF4" strokeWidth="2.5" />
            <rect fill="#141B2B" height="18" rx="6" width="42" x="90" y="32" />
            <text fill="#FFFFFF" fontFamily="Inter" fontSize="9" fontWeight="600" textAnchor="middle" x="111" y="44">
              54.2%
            </text>
          </svg>
          )}
          <div className="flex justify-between items-center text-text-tertiary font-caption text-caption pt-1 px-1">
            <span>{live ? 'W1 —' : 'W1 (100%)'}</span>
            <span>{live ? 'W3 —' : 'W3 (54%)'}</span>
            <span>{live ? 'W5 —' : 'W5 (46%)'}</span>
            <span>{live ? 'W8 —' : 'W8 (38%)'}</span>
          </div>
        </div>
        <div className="bg-surface-subtle p-space-xs rounded-xl flex items-center justify-between text-text-secondary">
          <span className="font-caption text-caption flex items-center gap-1 min-w-0">
            <Icon name="verified" className="text-[15px] text-badge-discount-text" />
            <span className="truncate">{live ? 'Local benchmark: —' : 'Abuja food & drink standard: 28% at W8'}</span>
          </span>
          <span className="font-label-sm text-label-sm font-semibold text-text-primary shrink-0">{live ? '—' : '+10% Outperform'}</span>
        </div>
      </div>

      {/* Segments */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-label-md text-label-md text-text-primary font-semibold">Customer Segments</h2>
          <span className="font-caption text-caption text-text-secondary">Sorted by lifetime impact</span>
        </div>
        {segments.map((segment) => (
          <div className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex flex-col gap-space-2xs" key={segment.title}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${segment.iconClass}`}>
                  <Icon name={segment.icon} className="text-[18px]" />
                </div>
                <div className="min-w-0">
                  <div className="font-label-sm text-label-sm text-text-primary font-bold truncate">{segment.title}</div>
                  <div className="font-caption text-caption text-text-secondary truncate">{segment.meta}</div>
                </div>
              </div>
              <span
                className={`font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full shrink-0 ${segment.badgeClass}`}
              >
                {segment.badge}
              </span>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mt-1">
              <div className={`${segment.bar} h-full rounded-full`} style={{ width: segment.width }} />
            </div>
          </div>
        ))}
        {/* At risk */}
        <div className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-9 h-9 rounded-xl bg-error-container flex items-center justify-center shrink-0">
                <Icon name="hourglass_empty" className="text-error text-[18px]" />
              </div>
              <div className="min-w-0">
                <div className="font-label-sm text-label-sm text-text-primary font-bold">At-Risk / Lapsed</div>
                <div className="font-caption text-caption text-text-secondary">
                  {live
                    ? `${countFmt(segmentsData?.lapsed.count ?? 0)} customers • No recent visit`
                    : '124 patrons • No visit in 45+ days'}
                </div>
              </div>
            </div>
            <span className="font-label-sm text-label-sm font-semibold text-error bg-error-container/60 px-2 py-0.5 rounded-full shrink-0">
              Action Req
            </span>
          </div>
          <div className="flex items-center justify-between bg-surface-container-low p-space-xs rounded-xl gap-space-xs">
            <span className="font-caption text-caption text-text-secondary">
              {live ? `Past spend: ${naira(segmentsData?.lapsed.spend ?? 0)}` : 'Potential churn: ₦950k'}
            </span>
            <button
              className="h-8 px-space-sm bg-primary text-on-primary rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform shrink-0"
              type="button"
              onClick={() =>
                showToast(live ? 'Re-engaging from analytics is coming soon. Use Segments instead.' : '45-day comeback voucher sent to 124 patrons!')
              }
            >
              <Icon name="send" className="text-[14px]" />
              <span>Re-engage with Deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovery radius */}
      <div className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-label-md text-label-md text-text-primary font-semibold">Discovery Radius &amp; Habits</h2>
          <Icon name="location_on" className="text-on-surface-variant text-[18px]" />
        </div>
        <div className="p-space-sm rounded-xl bg-surface-subtle flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">
              {live ? '— within 5km Radius' : '82% within 5km Radius'}
            </span>
            <span className="font-caption text-caption text-primary font-semibold">Primary Zone</span>
          </div>
          <p className="font-caption text-caption text-text-secondary">
            {live ? (
              'Where customers travel from isn’t tracked yet.'
            ) : (
              <>
                Heaviest footfall originates from <strong className="text-text-primary">Wuse 2</strong>,{' '}
                <strong className="text-text-primary">Maitama</strong>, and Central Business District.
              </>
            )}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex mt-1">
            <div className="bg-primary-container h-full" style={{ width: live ? '0%' : '82%' }} />
            <div className="bg-secondary-fixed h-full" style={{ width: live ? '0%' : '18%' }} />
          </div>
          <div className="flex justify-between items-center font-caption text-caption text-text-tertiary">
            <span>{live ? '5km Downtown (—)' : '5km Downtown (82%)'}</span>
            <span>{live ? 'Cross-Town (—)' : 'Cross-Town (18%)'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-sm pt-space-2xs">
          <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-primary">
              <Icon name="table_bar" className="text-[16px]" />
              <span className="font-label-sm text-label-sm font-semibold">Dine-In</span>
            </div>
            <div className="font-heading-sm text-heading-sm text-text-primary font-bold">{live ? '—' : '74%'}</div>
            <span className="font-caption text-caption text-text-secondary">{live ? 'Avg duration: —' : 'Avg duration: 52 mins'}</span>
          </div>
          <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-secondary">
              <Icon name="takeout_dining" className="text-[16px]" />
              <span className="font-label-sm text-label-sm font-semibold">Takeout &amp; Tap</span>
            </div>
            <div className="font-heading-sm text-heading-sm text-text-primary font-bold">{live ? '—' : '26%'}</div>
            <span className="font-caption text-caption text-text-secondary">Quick checkout</span>
          </div>
        </div>
      </div>

      {/* Top patrons */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-label-md text-label-md text-text-primary font-semibold">Top Patron Highlights</h2>
          <span className="font-caption text-caption text-primary font-semibold">Hall of Fame</span>
        </div>
        {patrons.map((patron) => (
          <div
            className="bg-surface-canvas p-space-md rounded-2xl shadow-sm flex items-center justify-between gap-space-xs"
            key={patron.name}
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <img alt={patron.name} className="w-11 h-11 rounded-full object-cover shrink-0 bg-surface-container" src={patron.avatar} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-label-sm text-label-sm text-text-primary font-bold truncate">{patron.name}</span>
                  <Icon name={patron.icon} className={`${patron.iconClass} text-[14px]`} filled />
                </div>
                <div className="font-caption text-caption text-text-secondary truncate">{patron.meta}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-label-sm text-label-sm text-text-primary font-bold">{patron.amount}</div>
              <span className={`font-caption text-caption font-semibold ${patron.tagClass}`}>{patron.tag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <button
          className="w-full h-11 bg-primary-container text-on-primary font-label-md text-label-md rounded-xl flex items-center justify-center gap-space-2xs shadow-md active:scale-95 transition-all"
          type="button"
          onClick={() => showToast(live ? 'Open Loyalty from the Business Hub to start a campaign.' : 'Opening Loyalty Builder Studio...')}
        >
          <Icon name="campaign" className="text-[18px]" />
          <span>Launch Targeted Loyalty Campaign</span>
        </button>
        <button
          className="w-full h-11 bg-surface-container-low text-text-primary font-label-sm text-label-sm font-semibold rounded-xl flex items-center justify-center gap-space-2xs active:scale-95 transition-all"
          type="button"
          onClick={() => {
            downloadCsv(
              'vemtap_customer_directory',
              ['Name', 'Visits', 'Total Spend', 'Segment'],
              patrons.map((patron) => [patron.name, patron.meta, patron.amount, patron.tag]),
            );
            showToast(`Exported ${patrons.length} patron records (CSV)`);
          }}
        >
          <Icon name="download" className="text-on-surface-variant text-[16px]" />
          <span>Export Customer Directory (CSV)</span>
        </button>
      </div>

      {/* NDPR */}
      <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low/60 rounded-xl">
        <Icon name="security" className="text-on-surface-variant text-[15px] mt-0.5 shrink-0" />
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          <strong>NDPR &amp; VEMTAP Privacy Compliant:</strong> Customer phone numbers and raw identifiers remain
          strictly tokenized. Direct marketing respects patron opt-ins in Abuja jurisdiction.
        </p>
      </div>
    </div>
  );

  const renderPlaceholder = () => {
    const copy: Record<string, { title: string; message: string; icon: string }> = {
      traffic: { title: 'Traffic & Footfall', message: 'Hourly footfall sensors and dwell-time analytics are syncing for this branch.', icon: 'insights' },
      offers: { title: 'Campaign ROI', message: 'Deal campaign attribution and redemption ROI will appear here once data lands.', icon: 'campaign' },
      manage: { title: 'Merchant Settings', message: 'Tune analytics permissions, data retention and report delivery preferences.', icon: 'tune' },
    };
    const current = copy[nav] ?? copy.traffic;
    return (
      <div className="px-margin pt-space-lg pb-space-xl flex flex-col items-center text-center gap-space-sm">
        <span className="w-12 h-12 rounded-2xl bg-surface-tint-blue text-primary flex items-center justify-center">
          <Icon name={current.icon} className="text-[24px]" />
        </span>
        <h2 className="font-heading-sm text-heading-sm text-text-primary">{current.title}</h2>
        <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">{current.message}</p>
        <button
          className="h-10 px-space-md rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold active:scale-95 transition-transform"
          type="button"
          onClick={() => showToast(`${current.title} data refresh started`)}
        >
          Refresh data
        </button>
      </div>
    );
  };

  return (
    <AppScreen>
      {header}
      <div className="flex flex-col w-full flex-1 pb-24">
        <div className="flex flex-col w-full">
          {nav === 'overview' && renderOverview()}
          {nav === 'audience' && renderAudience()}
          {nav !== 'overview' && nav !== 'audience' && renderPlaceholder()}
        </div>
      </div>
      {analyticsNav}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
