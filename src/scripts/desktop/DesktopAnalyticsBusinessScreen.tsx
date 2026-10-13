import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { AnalyticsShell } from './AnalyticsShell';

interface DesktopAnalyticsBusinessScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
}

const DATE_RANGES = ['Today', '7D', 'Last 30 Days', 'Custom'];

const DOMAIN_TABS: Array<{ key: string; label: string; icon: string }> = [
  { key: 'performance', label: 'Business Performance', icon: 'query_stats' },
  { key: 'patrons', label: 'Patrons & Loyalty', icon: 'group' },
  { key: 'deals', label: 'Deals & Campaign ROI', icon: 'local_offer' },
  { key: 'locations', label: 'Locations & Geo-Footfall', icon: 'pin_drop' },
  { key: 'pos', label: 'POS Terminals', icon: 'point_of_sale' },
];

const WEEKS: Array<{
  label: string;
  dates: string;
  amount: string;
  amountClass: string;
  targetHeight: string;
  actualHeight: string;
  actualClass: string;
  tooltip?: string;
  badge?: string;
}> = [
  {
    label: 'Week 1',
    dates: 'Oct 01 - 07',
    amount: '₦980,000',
    amountClass: 'font-label-sm text-label-sm font-bold text-on-surface mb-2',
    targetHeight: '60%',
    actualHeight: '65%',
    actualClass: 'bg-primary rounded-t-md transition-all group-hover:brightness-110 relative',
    tooltip: '+9%',
  },
  {
    label: 'Week 2',
    dates: 'Oct 08 - 14',
    amount: '₦1,100,000',
    amountClass: 'font-label-sm text-label-sm font-bold text-on-surface mb-2',
    targetHeight: '65%',
    actualHeight: '73%',
    actualClass: 'bg-primary rounded-t-md transition-all group-hover:brightness-110 relative',
    tooltip: '+12%',
  },
  {
    label: 'Week 3',
    dates: 'Oct 15 - 21',
    amount: '₦1,240,000',
    amountClass: 'font-label-sm text-label-sm font-bold text-on-surface mb-2',
    targetHeight: '70%',
    actualHeight: '82%',
    actualClass: 'bg-primary rounded-t-md transition-all group-hover:brightness-110 relative',
    tooltip: '+17%',
  },
  {
    label: 'Week 4 (Peak)',
    dates: 'Oct 22 - 31',
    amount: '₦1,530,000',
    amountClass: 'font-label-sm text-label-sm font-bold text-primary mb-2',
    targetHeight: '75%',
    actualHeight: '98%',
    actualClass: 'bg-primary-container rounded-t-md transition-all group-hover:brightness-110 relative shadow-md',
    badge: 'NEW HIGH',
  },
];

const CHANNELS: Array<{ dot: string; name: string; amount: string; share: string; orders: string }> = [
  { dot: 'bg-primary', name: 'In-Store POS', amount: '₦3,010,000', share: '62.0% share', orders: '880 orders' },
  { dot: 'bg-tertiary-container', name: 'VEMTAP Deals & Vouchers', amount: '₦1,260,000', share: '26.0% share', orders: '370 orders' },
  { dot: 'bg-secondary', name: 'Online Inquiries', amount: '₦580,000', share: '12.0% share', orders: '170 orders' },
];

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
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [domainTab, setDomainTab] = useState('performance');

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
            {/* Outlet Selector */}
            <div className="relative inline-block text-left">
              <button
                className="flex items-center gap-space-xs bg-surface-canvas text-on-surface px-space-md py-2.5 rounded-xl shadow-sm hover:bg-surface-subtle transition-all"
                type="button"
              >
                <Icon name="storefront" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md font-semibold">All Branches (3)</span>
                <Icon name="expand_more" className="text-text-tertiary text-[18px]" />
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
              {DATE_RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={
                    dateRange === range
                      ? 'px-space-sm py-1.5 rounded-lg bg-surface-canvas text-primary font-label-sm text-label-sm font-bold shadow-sm transition-all'
                      : 'px-space-sm py-1.5 rounded-lg text-text-secondary hover:text-on-surface font-label-sm text-label-sm font-medium transition-colors'
                  }
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Export Executive Report */}
            <button
              className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-2.5 rounded-xl font-button-secondary text-button-secondary shadow-md hover:bg-surface-tint active:scale-[0.98] transition-all"
              type="button"
            >
              <Icon name="picture_as_pdf" className="text-[18px]" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl mb-space-xl overflow-x-auto">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDomainTab(tab.key)}
              className={
                domainTab === tab.key
                  ? 'flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-bold shadow-sm'
                  : 'flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:text-on-surface font-label-md text-label-md font-medium transition-colors'
              }
            >
              <Icon name={tab.icon} className="text-[18px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Metric Highlights Ribbon (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {/* Card 1: Gross Sales */}
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Gross Sales Volume</span>
                <Icon name="payments" className="text-primary text-[20px]" />
              </div>
              <div className="flex items-baseline gap-space-xs mb-space-2xs">
                <span className="font-heading-lg text-heading-lg font-bold text-on-surface tracking-tight">₦4,850,000</span>
              </div>
              <div className="flex items-center gap-1.5 font-caption text-caption">
                <span className="inline-flex items-center text-badge-discount-text font-bold">
                  <Icon name="arrow_upward" className="text-[14px]" />
                  18.4%
                </span>
                <span className="text-text-tertiary">vs ₦4,096,000 prev</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="check_circle" className="text-[14px]" /> 0% VEMTAP Commission
              </span>
              <span className="text-text-tertiary font-caption text-caption">30d Cycle</span>
            </div>
          </div>

          {/* Card 2: Orders Processed */}
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Orders Processed</span>
                <Icon name="receipt_long" className="text-secondary text-[20px]" />
              </div>
              <div className="flex items-baseline gap-space-xs mb-space-2xs">
                <span className="font-heading-lg text-heading-lg font-bold text-on-surface tracking-tight">1,420</span>
                <span className="font-caption text-caption text-text-secondary font-medium">tickets</span>
              </div>
              <div className="flex items-center gap-1.5 font-caption text-caption">
                <span className="inline-flex items-center text-badge-discount-text font-bold">
                  <Icon name="arrow_upward" className="text-[14px]" />
                  12.0%
                </span>
                <span className="text-text-tertiary">+152 more diners</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between">
              <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>98.6% Fulfilled</span>
              </div>
              <span className="text-text-tertiary font-caption text-caption">Avg 47 / day</span>
            </div>
          </div>

          {/* Card 3: Average Ticket Value */}
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Average Ticket Value</span>
                <Icon name="shopping_bag" className="text-primary-container text-[20px]" />
              </div>
              <div className="flex items-baseline gap-space-xs mb-space-2xs">
                <span className="font-heading-lg text-heading-lg font-bold text-on-surface tracking-tight">₦3,415</span>
              </div>
              <div className="flex items-center gap-1.5 font-caption text-caption">
                <span className="inline-flex items-center text-badge-discount-text font-bold">
                  <Icon name="arrow_upward" className="text-[14px]" />
                  5.2%
                </span>
                <span className="text-text-tertiary">+₦170 per cover</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between">
              <span className="text-text-secondary font-caption text-caption">Peak: Dinner service</span>
              <span className="text-badge-discount-text font-caption text-caption font-semibold">₦4,280 avg</span>
            </div>
          </div>

          {/* Card 4: Patron Retention Rate */}
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">Patron Retention Rate</span>
                <Icon name="loyalty" className="text-tertiary text-[20px]" />
              </div>
              <div className="flex items-baseline gap-space-xs mb-space-2xs">
                <span className="font-heading-lg text-heading-lg font-bold text-on-surface tracking-tight">64%</span>
                <span className="font-caption text-caption text-text-secondary font-medium">repeat diners</span>
              </div>
              <div className="flex items-center gap-1.5 font-caption text-caption">
                <span className="inline-flex items-center text-badge-discount-text font-bold">
                  <Icon name="arrow_upward" className="text-[14px]" />
                  8.4%
                </span>
                <span className="text-text-tertiary">Top decile in Abuja</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between">
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '64%' }} />
              </div>
              <span className="ml-2 font-caption text-caption font-bold text-primary">64%</span>
            </div>
          </div>
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
                    <h2 className="font-heading-md text-heading-md font-bold text-on-surface">Weekly Revenue Trajectory</h2>
                    <span title="Weekly gross intake compared against monthly run-rate target">
                      <Icon name="info" className="text-text-tertiary text-[18px]" />
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Comparing 4-week dynamic cycles against branch target quota
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

              {/* 4-Week Streak Target Exceeded Banner */}
              <div className="bg-gradient-to-r from-surface-tint-blue via-surface-tint-blue to-badge-discount-bg/30 p-space-md rounded-xl flex items-center justify-between mb-space-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                    <Icon name="trending_up" className="text-[22px]" />
                  </div>
                  <div>
                    <div className="font-label-md text-label-md font-bold text-on-surface">4-Week Outperformance Streak</div>
                    <div className="font-caption text-caption text-text-secondary">
                      All branches exceeded conservative baseline intake targets.
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">+₦430,000</span>
                  <div className="font-caption text-caption text-text-secondary font-medium">Above Cumulative Target</div>
                </div>
              </div>

              {/* Inline SVG Trajectory & Bar Chart Hybrid Visualization */}
              <div className="w-full bg-surface-subtle p-space-md rounded-xl">
                <div className="h-64 w-full flex items-end justify-between gap-space-md sm:gap-space-xl px-space-md pt-space-md pb-space-xs">
                  {WEEKS.map((week) => (
                    <div key={week.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className={week.amountClass}>{week.amount}</div>
                      <div className="w-full max-w-[72px] flex items-end justify-center gap-1.5 h-44">
                        {/* Target Bar */}
                        <div
                          className="w-1/2 bg-surface-container-highest rounded-t-md transition-all group-hover:opacity-80"
                          style={{ height: week.targetHeight }}
                        />
                        {/* Actual Bar */}
                        <div className={week.actualClass} style={{ height: week.actualHeight }}>
                          {week.tooltip && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-[10px] px-1 py-0.5 rounded pointer-events-none">
                              {week.tooltip}
                            </span>
                          )}
                          {week.badge && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-badge-discount-bg text-badge-discount-text font-bold text-[10px] px-1.5 py-0.5 rounded">
                              {week.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={
                          week.label.includes('Peak')
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
                <span className="font-caption text-caption text-text-tertiary">Gross Total: ₦4,850,000</span>
              </div>

              {/* Segmented Stacked Progress Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-container mb-space-md">
                <div
                  className="bg-primary hover:opacity-90 transition-opacity"
                  style={{ width: '62.0%' }}
                  title="In-Store POS (62.0%)"
                />
                <div
                  className="bg-tertiary-container hover:opacity-90 transition-opacity"
                  style={{ width: '26.0%' }}
                  title="VEMTAP Deals & Vouchers (26.0%)"
                />
                <div
                  className="bg-secondary hover:opacity-90 transition-opacity"
                  style={{ width: '12.0%' }}
                  title="Online Catalog Inquiries (12.0%)"
                />
              </div>

              {/* Channel Breakdown Legend / Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {CHANNELS.map((channel) => (
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
    </AnalyticsShell>
  );
}
