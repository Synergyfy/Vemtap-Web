import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { AnalyticsShell } from './AnalyticsShell';
import { downloadCsv } from '../../utils/exportCsv';
import { printReport, printKvTable } from '../../utils/printReport';

interface DesktopAnalyticsBusinessScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
}

const PERIODS = ['Today', '7D', 'Last 30 Days'] as const;
type PeriodKey = (typeof PERIODS)[number];

const DOMAIN_TABS: Array<{ key: string; label: string; shortLabel: string; icon: string }> = [
  { key: 'performance', label: 'Business Performance', shortLabel: 'Business', icon: 'query_stats' },
  { key: 'patrons', label: 'Patrons & Loyalty', shortLabel: 'Customers', icon: 'group' },
  { key: 'deals', label: 'Deals & Campaign ROI', shortLabel: 'Deals', icon: 'local_offer' },
  { key: 'locations', label: 'Locations & Geo-Footfall', shortLabel: 'Locations', icon: 'pin_drop' },
  { key: 'pos', label: 'POS Terminals', shortLabel: 'POS', icon: 'point_of_sale' },
];

const naira = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;
const count = (value: number) => Math.round(value).toLocaleString('en-US');
const percent = (value: number) => `${Math.round(value)}%`;

interface AnalyticsKpi {
  label: string;
  icon: string;
  value: string;
  change: string;
  changeUp: boolean;
  note: string;
  progress?: number;
}

const KPIS_BY_DOMAIN: Record<
  string,
  Array<{
    label: string;
    icon: string;
    base: number;
    fmt: (value: number) => string;
    scaled?: boolean;
    change: string;
    note: string;
    progress?: number;
  }>
> = {
  performance: [
    { label: 'Gross Sales Volume', icon: 'payments', base: 4850000, fmt: naira, change: '+18.4%', note: 'vs previous period' },
    { label: 'Orders Processed', icon: 'receipt_long', base: 1420, fmt: count, change: '+12.0%', note: '98.6% fulfilled' },
    { label: 'Average Ticket Value', icon: 'shopping_bag', base: 3415, fmt: naira, scaled: false, change: '+5.2%', note: 'Peak: dinner service' },
    { label: 'Patron Retention Rate', icon: 'loyalty', base: 64, fmt: percent, scaled: false, change: '+8.4%', note: 'repeat diners', progress: 64 },
  ],
  patrons: [
    { label: 'Active Patrons', icon: 'group', base: 3240, fmt: count, change: '+9.1%', note: 'visited this period' },
    { label: 'New Signups', icon: 'person_add', base: 412, fmt: count, change: '+14.6%', note: 'joined via store & deals' },
    { label: 'Loyalty Redeem Rate', icon: 'loyalty', base: 38, fmt: percent, scaled: false, change: '+3.2%', note: 'of issued points', progress: 38 },
    { label: 'Avg Visit Frequency', icon: 'autorenew', base: 2.8, fmt: (value) => `${value.toFixed(1)}x`, scaled: false, change: '+0.4', note: 'per patron / month' },
  ],
  deals: [
    { label: 'Deal Revenue Attributed', icon: 'local_offer', base: 1260000, fmt: naira, change: '+22.5%', note: '26% of gross intake' },
    { label: 'Vouchers Redeemed', icon: 'redeem', base: 684, fmt: count, change: '+18.2%', note: 'across 9 campaigns' },
    { label: 'Campaign ROI', icon: 'campaign', base: 312, fmt: percent, scaled: false, change: '+46%', note: 'return on promo spend', progress: 78 },
    { label: 'Avg Discount Depth', icon: 'percent', base: 17, fmt: percent, scaled: false, change: '-2.1%', note: 'margin-safe band' },
  ],
  locations: [
    { label: 'Total Footfall', icon: 'pin_drop', base: 5180, fmt: count, change: '+11.3%', note: 'check-ins across branches' },
    { label: 'Geo Conversion Rate', icon: 'explore', base: 42, fmt: percent, scaled: false, change: '+6.8%', note: 'store visit to order', progress: 42 },
    { label: 'Top Outlet Revenue', icon: 'storefront', base: 1980000, fmt: naira, change: '+15.2%', note: 'Maitama flagship' },
    { label: 'Delivery Zone Reach', icon: 'map', base: 24, fmt: (value) => `${Math.round(value)} km2`, scaled: false, change: '+3 km2', note: 'active radius' },
  ],
  pos: [
    { label: 'Terminal Gross Intake', icon: 'point_of_sale', base: 3010000, fmt: naira, change: '+13.7%', note: 'settled on VEMTAP rails' },
    { label: 'Tickets per Terminal', icon: 'receipt_long', base: 473, fmt: count, change: '+8.9%', note: 'avg across 3 terminals' },
    { label: 'Offline Synced Orders', icon: 'cloud_sync', base: 126, fmt: count, change: '+31.4%', note: 'queued & flushed' },
    { label: 'Terminal Uptime', icon: 'schedule', base: 99.4, fmt: (value) => `${value.toFixed(1)}%`, scaled: false, change: '+0.6%', note: '30-day rolling', progress: 99 },
  ],
};

const PERIOD_SCALE: Record<PeriodKey, number> = { Today: 0.033, '7D': 0.233, 'Last 30 Days': 1 };

const buildKpis = (domain: string, period: PeriodKey): AnalyticsKpi[] =>
  (KPIS_BY_DOMAIN[domain] ?? KPIS_BY_DOMAIN.performance).map((kpi) => ({
    label: kpi.label,
    icon: kpi.icon,
    value: kpi.fmt(kpi.scaled === false ? kpi.base : kpi.base * PERIOD_SCALE[period]),
    change: kpi.change,
    changeUp: !kpi.change.startsWith('-'),
    note: kpi.note,
    progress: kpi.progress,
  }));

const CHART_BUCKETS: Record<PeriodKey, Array<{ label: string; dates: string }>> = {
  Today: [
    { label: '10 AM', dates: 'Morning' },
    { label: '1 PM', dates: 'Lunch Rush' },
    { label: '4 PM', dates: 'Afternoon' },
    { label: '7 PM', dates: 'Dinner Peak' },
  ],
  '7D': [
    { label: 'Mon – Tue', dates: 'Oct 06 – 07' },
    { label: 'Wed – Thu', dates: 'Oct 08 – 09' },
    { label: 'Fri – Sat', dates: 'Oct 10 – 11' },
    { label: 'Sun', dates: 'Oct 12' },
  ],
  'Last 30 Days': [
    { label: 'Week 1', dates: 'Oct 01 - 07' },
    { label: 'Week 2', dates: 'Oct 08 - 14' },
    { label: 'Week 3', dates: 'Oct 15 - 21' },
    { label: 'Week 4 (Peak)', dates: 'Oct 22 - 31' },
  ],
};

const CHART_BASE = [980000, 1100000, 1240000, 1530000];
const CHART_TARGET_PCT = [60, 65, 70, 75];
const CHART_ACTUAL_PCT = [65, 73, 82, 98];
const DOMAIN_CHART_SCALE: Record<string, number> = {
  performance: 1,
  patrons: 0.55,
  deals: 0.26,
  locations: 0.72,
  pos: 0.62,
};

const buildWeeks = (domain: string, period: PeriodKey) =>
  CHART_BUCKETS[period].map((bucket, index) => ({
    label: bucket.label,
    dates: bucket.dates,
    amount: naira(CHART_BASE[index] * (DOMAIN_CHART_SCALE[domain] ?? 1) * PERIOD_SCALE[period]),
    peak: index === 3,
    targetHeight: `${CHART_TARGET_PCT[index]}%`,
    actualHeight: `${CHART_ACTUAL_PCT[index]}%`,
  }));

const CHANNEL_BASE = [
  { dot: 'bg-primary', name: 'In-Store POS', amount: 3010000, avgTicket: 3420 },
  { dot: 'bg-tertiary-container', name: 'VEMTAP Deals & Vouchers', amount: 1260000, avgTicket: 3405 },
  { dot: 'bg-secondary', name: 'Online Inquiries', amount: 580000, avgTicket: 3412 },
];
const DOMAIN_CHANNEL_SCALE: Record<string, number[]> = {
  performance: [1, 1, 1],
  patrons: [0.9, 1.4, 0.7],
  deals: [0.4, 2.2, 0.9],
  locations: [1.15, 0.7, 0.8],
  pos: [1.25, 0.8, 0.5],
};

const buildChannels = (domain: string, period: PeriodKey) => {
  const scale = DOMAIN_CHANNEL_SCALE[domain] ?? [1, 1, 1];
  const weights = CHANNEL_BASE.map((channel, index) => channel.amount * scale[index]);
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  return CHANNEL_BASE.map((channel, index) => ({
    dot: channel.dot,
    name: channel.name,
    amount: naira(weights[index] * PERIOD_SCALE[period]),
    share: `${((weights[index] / total) * 100).toFixed(1)}% share`,
    sharePct: (weights[index] / total) * 100,
    orders: `${count((weights[index] * PERIOD_SCALE[period]) / channel.avgTicket)} orders`,
  }));
};

type HeatLevel = 'low' | 'moderate' | 'high' | 'peak' | 'critical';

const HEAT_CLASS: Record<HeatLevel, string> = {
  low: 'bg-surface-container text-on-surface-variant font-normal',
  moderate: 'bg-secondary-fixed text-on-secondary-fixed font-medium',
  high: 'bg-primary-fixed-dim text-on-primary-fixed-variant font-semibold',
  peak: 'bg-surface-container text-on-surface-variant font-normal',
  critical: 'bg-primary text-on-primary font-bold shadow-sm',
};

const HEAT_DATA: Array<{ day: string; surge?: boolean; cells: Array<{ label: string; level: HeatLevel }> }> = [
  {
    day: 'Mon – Thu',
    cells: [
      { label: 'Moderate (62%)', level: 'moderate' },
      { label: 'Low (28%)', level: 'low' },
      { label: 'High (78%)', level: 'high' },
      { label: 'Low (35%)', level: 'low' },
    ],
  },
  {
    day: 'Friday',
    surge: true,
    cells: [
      { label: 'High (74%)', level: 'high' },
      { label: 'Moderate (58%)', level: 'moderate' },
      { label: 'CRITICAL RUSH (98%)', level: 'critical' },
      { label: 'High (81%)', level: 'high' },
    ],
  },
  {
    day: 'Saturday',
    cells: [
      { label: 'High (82%)', level: 'high' },
      { label: 'Moderate (66%)', level: 'moderate' },
      { label: 'PEAK RUSH (94%)', level: 'critical' },
      { label: 'High (88%)', level: 'high' },
    ],
  },
  {
    day: 'Sunday',
    cells: [
      { label: 'BRUNCH RUSH (92%)', level: 'critical' },
      { label: 'High (72%)', level: 'high' },
      { label: 'Moderate (64%)', level: 'moderate' },
      { label: 'Low (31%)', level: 'low' },
    ],
  },
];

const TOP_ITEMS: Array<{
  name: string;
  amount: string;
  covers: string;
  mom: string;
  momClass: string;
  width: string;
  img: string;
  alt: string;
}> = [
  {
    name: 'Woodfire Aged Ribeye',
    amount: '₦1.20M',
    covers: '248 covers sold',
    mom: '+14% MoM',
    momClass: 'text-badge-discount-text font-bold',
    width: '88%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmHrWN_UkS7Z1ldmp0ZAc2wnHeCnfL2c1ZACXYAkOdLA5NrqsNtPGGrdYtEet96BepfSy10qNoQdozsXW3isCI4WtMwaN92WvoN6tvHTKhQ6cFCnRskWv0TeC690XqmdTua0BWgcWBhOOQ-5fgPnh_RRNcfFtbkMfk0gAk9m8l1eBlSaDLTnS2yb66ThakebR7uQylKWBRQMiqECpGHCxTtexMS4vwSXI4cXqB7XW5T359fXSxPXB3XQ',
    alt: 'Gourmet medium-rare woodfire grilled ribeye steak served on a matte dark slate platter with rosemary and garlic butter garnish in warm ambient restaurant light',
  },
  {
    name: 'Signature Smash Burger',
    amount: '₦840,000',
    covers: '310 units sold',
    mom: '+9% MoM',
    momClass: 'text-badge-discount-text font-bold',
    width: '65%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2kg9Rm-FsbwLrxYm1XQP3DB-RHRBmbUyLE-1u-AALeEChPg4jEg4dgAWdGbLcqidbPK2u-rJglCLR0brabfNnx9YqlF_ViX0XmfuS27juKG64LEwBzfA4bXTUX_rwO25Xnky2xdJHS3u1ITmHJTBS1O2Tplzmev8pWrVvYqQQKrLFxjeZz72mNG4lpSSL-NkVkOkZN3qDVwJ6bUUZrSS21dHSqK7TQObWzv0yGV8tmb-eApykM44eng',
    alt: 'Artisanal smash burger with melted sharp cheddar, caramelized onions, crisp pickles on a toasted brioche bun with soft studio lighting',
  },
  {
    name: 'Craft House Cocktails',
    amount: '₦520,000',
    covers: '190 orders',
    mom: '+22% MoM',
    momClass: 'text-badge-discount-text font-bold',
    width: '44%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-sQqEao8w4SOu8CwjG9QsftufOEZ4ycFNsLY7pEoJ6yuehuGtE8ReAPZpVT5kV2SZCZIptU3knIp5UOY4nIV_oGJ42qwvGLugo9v1cYi8EifdJP7-RfxLGCYgjPn7t1PLv4KIZ3AApyhXcZOq1rRzkl8p10PkglHWs7voUj0sVEqelePP7x7Pw4tlhuJSzJPLSEHLC1vgzk79ZGkuoC3N8LdYO0J4YP2xk7u2F87-nUdX4-nqRtjfQQ',
    alt: 'Vibrant craft cocktail with fresh citrus garnish and clear artisan ice block in a crystal glass against moody lounge background',
  },
  {
    name: 'Truffle Parmesan Fries',
    amount: '₦380,000',
    covers: '142 portions',
    mom: '+4% MoM',
    momClass: 'text-text-secondary font-medium',
    width: '32%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuzqJovwEhs1BN5dotH7u-bwTdMA7uSaaxrbMkQ4wi3V4oFBHxncdaN0n8jnEroBvzOJwEp6s6_u91aUldFN7SlhD-88IxlttLPjDDAOtvHj9KBugH0J2wSR2c5mxDaraVvXdlUueVgOpbrUwc_sCv1hcjtu6zZ3k-9c6jNjqoTRf_G43lm5swfTrAnnf1axZfMfMTC3UeZWXhWeEDW6K0T-krppSi3ucDgKW2XWeh0LTc4JtI-NUZpQ',
    alt: 'Crispy golden hand-cut truffle parmesan fries in a ceramic serving bowl with fresh chopped parsley and aioli dipping sauce',
  },
];

export function DesktopAnalyticsBusinessScreen({ onNav }: DesktopAnalyticsBusinessScreenProps) {
  const [dateRange, setDateRange] = useState<PeriodKey>('Last 30 Days');
  const [domain, setDomain] = useState('performance');
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activeDomain = DOMAIN_TABS.find((tab) => tab.key === domain) ?? DOMAIN_TABS[0];
  const kpis = buildKpis(domain, dateRange);
  const weeks = buildWeeks(domain, dateRange);
  const channels = buildChannels(domain, dateRange);
  const grossTotal = channels.reduce((sum, channel) => sum + Number(channel.amount.replace(/[^0-9]/g, '')), 0);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleExportPdf = () => {
    printReport(
      `VEMTAP Executive Report — ${activeDomain.label} (${dateRange})`,
      `${printKvTable('Key Metrics', kpis.map((kpi) => [kpi.label, `${kpi.value} (${kpi.change})`] as [string, string]))}
${printKvTable(`${dateRange} Trajectory`, weeks.map((week) => [`${week.label} (${week.dates})`, week.amount] as [string, string]))}
${printKvTable('Sales Channel Distribution', channels.map((channel) => [channel.name, `${channel.amount} — ${channel.share}`] as [string, string]))}`,
    );
    showToast('Executive report ready — choose "Save as PDF" in the print dialog.');
  };

  const handleExportCsv = () => {
    const rows: Array<Array<string | number>> = [
      ...kpis.map((kpi) => ['Metric', kpi.label, kpi.value, kpi.change, kpi.note]),
      ...weeks.map((week) => ['Trend', `${week.label} (${week.dates})`, week.amount, week.peak ? 'Peak' : '', '']),
      ...channels.map((channel) => ['Channel', channel.name, channel.amount, channel.share, channel.orders]),
    ];
    downloadCsv(`vemtap_analytics_${domain}_${dateRange.replace(/\s+/g, '_').toLowerCase()}`, ['Section', 'Name', 'Value', 'Change', 'Note'], rows);
    showToast(`Exported ${rows.length} analytics rows to CSV`);
  };

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      <div className="flex flex-col w-full pb-space-3xl">
        {/* Breadcrumb & Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-lg pb-space-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm">
            <span className="hover:text-primary transition-colors cursor-pointer">Business Hub</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="hover:text-primary transition-colors cursor-pointer">Analytics &amp; Intelligence</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-on-surface font-semibold">Business Performance</span>
          </nav>
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
            <span>Live Mesh Synced • Real-time Node (Abuja Mainnet)</span>
          </div>
        </div>

        {/* Page Title & Primary Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mt-space-xs mb-space-lg">
          <div className="space-y-space-2xs max-w-3xl">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Business Performance &amp; Analytics Studio
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-bold uppercase tracking-wider">
                v2.4 Live
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              Consolidated sales volume, revenue trends, footfall heatmaps, and top grossing catalog performance across
              Nigeria outlets.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-space-xs">
            {/* Period Filter Dropdown */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-space-xs bg-surface-canvas text-on-surface px-space-md py-2.5 rounded-xl shadow-sm hover:bg-surface-subtle transition-all"
                type="button"
                onClick={() => {
                  setPeriodMenuOpen((open) => !open);
                  setDomainMenuOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={periodMenuOpen}
              >
                <Icon name="calendar_month" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md font-semibold">{dateRange}</span>
                <Icon name="expand_more" className="text-text-tertiary text-[18px]" />
              </button>
              {periodMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-40 w-48 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 animate-fade-in" role="listbox">
                  {PERIODS.map((period) => (
                    <button
                      key={period}
                      type="button"
                      role="option"
                      aria-selected={dateRange === period}
                      onClick={() => {
                        setDateRange(period);
                        setPeriodMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center justify-between transition-colors"
                    >
                      <span>{period}</span>
                      {dateRange === period && <Icon name="check" className="text-primary text-[16px]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain / Metric View Dropdown */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-space-xs bg-surface-canvas text-on-surface px-space-md py-2.5 rounded-xl shadow-sm hover:bg-surface-subtle transition-all"
                type="button"
                onClick={() => {
                  setDomainMenuOpen((open) => !open);
                  setPeriodMenuOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={domainMenuOpen}
              >
                <Icon name={activeDomain.icon} className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md font-semibold">{activeDomain.label}</span>
                <Icon name="expand_more" className="text-text-tertiary text-[18px]" />
              </button>
              {domainMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-40 w-60 bg-surface-canvas rounded-xl shadow-xl border border-border-subtle py-1.5 animate-fade-in" role="listbox">
                  {DOMAIN_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="option"
                      aria-selected={domain === tab.key}
                      onClick={() => {
                        setDomain(tab.key);
                        setDomainMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-text-primary hover:bg-surface-container flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name={tab.icon} className="text-[16px] text-primary" />
                        <span>{tab.label}</span>
                      </span>
                      {domain === tab.key && <Icon name="check" className="text-primary text-[16px]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Executive Report */}
            <button
              className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-2.5 rounded-xl font-button-secondary text-button-secondary shadow-md hover:bg-surface-tint active:scale-[0.98] transition-all"
              type="button"
              onClick={handleExportPdf}
            >
              <Icon name="picture_as_pdf" className="text-[18px]" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        </div>

        {/* Active View Caption */}
        <div className="flex items-center gap-space-xs mb-space-xl font-caption text-caption text-text-secondary">
          <Icon name={activeDomain.icon} className="text-primary text-[16px]" />
          <span>
            Showing <span className="font-semibold text-on-surface">{activeDomain.label}</span> for{' '}
            <span className="font-semibold text-on-surface">{dateRange}</span>
          </span>
        </div>

        {/* Metric Highlights Ribbon (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {kpis.map((kpi, index) => (
            <div
              key={kpi.label}
              className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />
              )}
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium">{kpi.label}</span>
                  <Icon name={kpi.icon} className="text-primary text-[20px]" />
                </div>
                <div className="flex items-baseline gap-space-xs mb-space-2xs">
                  <span className="font-heading-lg text-heading-lg font-bold text-on-surface tracking-tight">{kpi.value}</span>
                </div>
                <div className="flex items-center gap-1.5 font-caption text-caption">
                  <span
                    className={`inline-flex items-center font-bold ${
                      kpi.changeUp ? 'text-badge-discount-text' : 'text-text-secondary'
                    }`}
                  >
                    <Icon name={kpi.changeUp ? 'arrow_upward' : 'arrow_downward'} className="text-[14px]" />
                    {kpi.change.replace(/^[+-]/, '')}
                  </span>
                  <span className="text-text-tertiary">{kpi.note}</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between">
                {typeof kpi.progress === 'number' ? (
                  <>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${kpi.progress}%` }} />
                    </div>
                    <span className="ml-2 font-caption text-caption font-bold text-primary shrink-0">{kpi.progress}%</span>
                  </>
                ) : (
                  <span className="text-text-tertiary font-caption text-caption">{dateRange} Cycle</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Asymmetric Dashboard Grid (8 cols left, 4 cols right on lg screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: 8 Columns */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* Module 1: Revenue Trajectory with Benchmark Comparison */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-md text-heading-md font-bold text-on-surface">
                      {dateRange === 'Today' ? 'Hourly Revenue Trajectory' : 'Revenue Trajectory'}
                    </h2>
                    <span title="Gross intake compared against target run-rate">
                      <Icon name="info" className="text-text-tertiary text-[18px]" />
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    {activeDomain.shortLabel} intake for {dateRange} compared against branch target quota
                  </p>
                </div>
                <div className="flex items-center gap-space-md text-caption font-caption">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-text-secondary font-medium">Actual Volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-surface-container-high" />
                    <span className="text-text-secondary font-medium">Target Benchmark</span>
                  </div>
                </div>
              </div>

              {/* Period Outperformance Streak Banner */}
              <div className="bg-gradient-to-r from-surface-tint-blue via-surface-tint-blue to-badge-discount-bg/30 p-space-md rounded-xl flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="trending_up" className="text-[22px]" />
                  </div>
                  <div>
                    <div className="font-label-md text-label-md font-bold text-on-surface">
                      {dateRange === 'Today' ? 'Same-Day' : dateRange === '7D' ? 'Weekly' : '4-Week'} Outperformance Streak
                    </div>
                    <div className="font-caption text-caption text-text-secondary">
                      All branches exceeded conservative baseline intake targets.
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">
                    +{naira(grossTotal * 0.089)}
                  </span>
                  <div className="font-caption text-caption text-text-secondary font-medium">Above Cumulative Target</div>
                </div>
              </div>

              {/* Inline SVG Trajectory & Bar Chart Hybrid Visualization */}
              <div className="w-full bg-surface-subtle p-space-md rounded-xl">
                <div className="h-64 w-full flex items-end justify-between gap-space-md sm:gap-space-xl px-space-md pt-space-md pb-space-xs">
                  {weeks.map((week) => (
                    <div key={week.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div
                        className={`font-label-sm text-label-sm font-bold mb-2 ${
                          week.peak ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {week.amount}
                      </div>
                      <div className="w-full max-w-[72px] flex items-end justify-center gap-1.5 h-44">
                        {/* Target Bar */}
                        <div
                          className="w-1/2 bg-surface-container-highest rounded-t-md transition-all group-hover:opacity-80"
                          style={{ height: week.targetHeight }}
                        />
                        {/* Actual Bar */}
                        <div
                          className={`rounded-t-md transition-all group-hover:brightness-110 relative ${
                            week.peak
                              ? 'bg-primary-container shadow-md'
                              : 'bg-primary'
                          }`}
                          style={{ height: week.actualHeight }}
                        >
                          {week.peak && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-badge-discount-bg text-badge-discount-text font-bold text-[10px] px-1.5 py-0.5 rounded">
                              PEAK
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={
                          week.peak
                            ? 'font-label-sm text-label-sm text-primary font-bold mt-3'
                            : 'font-label-sm text-label-sm text-text-secondary font-semibold mt-3'
                        }
                      >
                        {week.label}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary">{week.dates}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Module 2: Sales Channel Distribution Breakdown */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-heading-md text-heading-md font-bold text-on-surface">Sales Channel Distribution</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Revenue contribution by customer checkout touchpoint
                  </p>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Gross Total: {naira(grossTotal)}</span>
              </div>

              {/* Segmented Stacked Progress Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-container mb-space-md">
                {channels.map((channel) => (
                  <div
                    key={channel.name}
                    className={`${channel.dot} hover:opacity-90 transition-opacity`}
                    style={{ width: `${channel.sharePct.toFixed(1)}%` }}
                    title={`${channel.name} (${channel.sharePct.toFixed(1)}%)`}
                  />
                ))}
              </div>

              {/* Channel Breakdown Legend / Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {channels.map((channel) => (
                  <div key={channel.name} className="p-space-md rounded-xl bg-surface-subtle flex flex-col justify-between">
                    <div className="flex items-center gap-space-xs mb-space-2xs">
                      <span className={`w-3 h-3 rounded-full ${channel.dot}`} />
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{channel.name}</span>
                    </div>
                    <div>
                      <div className="font-heading-sm text-heading-sm font-bold text-on-surface">{channel.amount}</div>
                      <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-1">
                        <span>{channel.share}</span>
                        <span className="font-medium text-text-primary">{channel.orders}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module 3: Peak Footfall & Kitchen Rush Heatmap */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-md text-heading-md font-bold text-on-surface">
                      Peak Footfall &amp; Kitchen Rush Heatmap
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                      POS Sensor Data
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Covers hourly dining floor occupancy and order placement velocity
                  </p>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center gap-space-xs text-caption font-caption">
                  <span className="text-text-tertiary">Light</span>
                  <span className="w-3.5 h-3.5 rounded bg-surface-container" />
                  <span className="w-3.5 h-3.5 rounded bg-secondary-fixed" />
                  <span className="w-3.5 h-3.5 rounded bg-primary-fixed-dim" />
                  <span className="w-3.5 h-3.5 rounded bg-primary" />
                  <span className="text-on-surface font-semibold">Rush / Peak</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-text-secondary font-label-sm text-label-sm">
                      <th className="py-2.5 px-3 font-medium text-left">Day of Week</th>
                      <th className="py-2.5 px-3 text-center">
                        11 AM – 2 PM
                        <br />
                        <span className="text-[11px] font-normal text-text-tertiary">Lunch Rush</span>
                      </th>
                      <th className="py-2.5 px-3 text-center">
                        2 PM – 6 PM
                        <br />
                        <span className="text-[11px] font-normal text-text-tertiary">Afternoon Lull</span>
                      </th>
                      <th className="py-2.5 px-3 text-center">
                        6 PM – 9 PM
                        <br />
                        <span className="text-[11px] font-normal text-text-tertiary">Prime Dinner</span>
                      </th>
                      <th className="py-2.5 px-3 text-center">
                        9 PM – 12 AM
                        <br />
                        <span className="text-[11px] font-normal text-text-tertiary">Late Social</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {HEAT_DATA.map((row) => (
                      <tr key={row.day}>
                        <td
                          className={
                            row.surge
                              ? 'py-3 px-3 font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5'
                              : 'py-3 px-3 font-label-md text-label-md font-semibold text-on-surface'
                          }
                        >
                          <span>{row.day}</span>
                          {row.surge && <span className="w-2 h-2 rounded-full bg-primary" title="Highest weekly surge" />}
                        </td>
                        {row.cells.map((cell, index) => (
                          <td key={`${row.day}-${index}`} className="py-2 px-2">
                            <div
                              className={`p-2.5 rounded-lg text-center font-label-sm text-label-sm ${HEAT_CLASS[cell.level]}`}
                            >
                              {cell.label}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Staff Recommendation Note */}
              <div className="mt-space-md p-space-md rounded-xl bg-surface-tint-blue flex items-start gap-space-sm">
                <Icon name="tips_and_updates" className="text-primary text-[22px] shrink-0" />
                <div>
                  <div className="font-label-md text-label-md font-bold text-on-surface">Staffing Recommendation System</div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    <strong>Recommended:</strong> Schedule <strong>+2 floor staff and 1 prep cook</strong> on{' '}
                    <span className="text-primary font-bold">Friday starting at 5:30 PM</span> to accommodate the recurring
                    6 PM – 9 PM dining surge and reduce table turnover delays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 Columns */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Leaderboard: Top Grossing Offerings */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-heading-md text-heading-md font-bold text-on-surface">Top Grossing Catalog</h2>
                  <p className="font-caption text-caption text-text-secondary">Highest revenue contributing items</p>
                </div>
                <Icon name="leaderboard" className="text-text-tertiary text-[20px]" />
              </div>
              <div className="flex flex-col gap-space-md">
                {TOP_ITEMS.map((item) => (
                  <div key={item.name} className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-subtle transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" alt={item.alt} src={item.img} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-label-md text-label-md font-bold text-on-surface truncate">{item.name}</h3>
                        <span className="font-label-md text-label-md font-bold text-on-surface">{item.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-caption font-caption text-text-secondary mt-0.5">
                        <span>{item.covers}</span>
                        <span className={item.momClass}>{item.mom}</span>
                      </div>
                      {/* Contribution Bar */}
                      <div className="w-full bg-surface-container rounded-full h-1 mt-1.5">
                        <div className="bg-primary h-full rounded-full" style={{ width: item.width }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-button-secondary text-button-secondary transition-colors text-center"
                type="button"
              >
                View Complete Catalog Breakdown (48 items)
              </button>
            </div>

            {/* Quick Operational Actions */}
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
              <h2 className="font-heading-md text-heading-md font-bold text-on-surface mb-space-xs">Executive Operations</h2>
              <p className="font-caption text-caption text-text-secondary mb-space-md">
                Rapid data extraction and scheduled intelligence
              </p>
              <div className="space-y-space-sm">
                {/* Action 1: CSV Export */}
                <button
                  className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container transition-colors group text-left"
                  type="button"
                  onClick={handleExportCsv}
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <Icon name="download" className="text-[20px]" />
                    </div>
                    <div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">Download CSV Telemetry</div>
                      <div className="font-caption text-caption text-text-secondary">Raw ticket level transaction logs</div>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-text-tertiary group-hover:text-primary transition-colors text-[18px]" />
                </button>

                {/* Action 2: Schedule Automated Digest */}
                <button
                  className="w-full flex items-center justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container transition-colors group text-left"
                  type="button"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <Icon name="forward_to_inbox" className="text-[20px]" />
                    </div>
                    <div>
                      <div className="font-label-md text-label-md font-bold text-on-surface">Automated Weekly Digest</div>
                      <div className="font-caption text-caption text-text-secondary">Delivers every Monday at 7:00 AM</div>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-text-tertiary group-hover:text-primary transition-colors text-[18px]" />
                </button>
              </div>
            </div>

            {/* Trust, NDPR & Bank-Grade Compliance Guarantee */}
            <div className="bg-gradient-to-br from-surface-subtle to-surface-container-low rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-space-sm mb-space-xs">
                <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="verified_user" className="text-[18px]" />
                </div>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">NDPR &amp; Audit Guarantee</h3>
              </div>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                All financial figures reflect immutable ledger receipts backed by Central Bank of Nigeria (CBN) certified
                settlement rails.
              </p>
              <div className="mt-space-md pt-space-xs space-y-1.5 font-caption text-caption">
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <Icon name="check" className="text-badge-discount-text text-[16px]" />
                  <span>0% third-party deductions or platform withholdings</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <Icon name="check" className="text-badge-discount-text text-[16px]" />
                  <span>Cryptographic daily batch reconciliation active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl border border-outline-variant animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md font-semibold">{toast}</span>
        </div>
      )}
    </AnalyticsShell>
  );
}
