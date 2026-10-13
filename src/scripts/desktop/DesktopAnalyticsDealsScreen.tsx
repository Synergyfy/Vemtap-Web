import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { AnalyticsShell } from './AnalyticsShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { AnalyticsTabKey } from '../../components/AnalyticsChrome';
import { PUBLIC_IMAGES } from '../publicPosData';

interface DesktopAnalyticsDealsScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onManageDeals: () => void;
}

const DOMAIN_TABS: Array<{ key: AnalyticsTabKey; label: string; icon: string }> = [
  { key: 'business', label: 'Business', icon: 'query_stats' },
  { key: 'customers', label: 'Customers', icon: 'group' },
  { key: 'deals', label: 'Deals', icon: 'local_offer' },
  { key: 'locations', label: 'Locations', icon: 'pin_drop' },
  { key: 'pos', label: 'POS', icon: 'point_of_sale' },
];

const KPIS = [
  { label: 'Total Views', value: '8,420', sub: '+22.4% vs last', icon: 'visibility' },
  { label: 'Total Claims', value: '248', sub: '+31 redemptions', icon: 'confirmation_number' },
  { label: 'Claim Rate', value: '2.9%', sub: 'Benchmark 2.1%', icon: 'percent' },
  { label: 'Scheduled', value: '1', sub: 'Weekend Happy Hour', icon: 'schedule' },
];

const DEALS = [
  {
    image: PUBLIC_IMAGES.burger,
    name: '20% OFF Signature Smash Burger',
    meta: 'Mon–Thu · Dine-in · ₦1,000 min spend',
    views: '3,240',
    claims: '112',
    rate: '3.5%',
    status: 'Top Performer',
    statusClass: 'bg-badge-discount-bg text-badge-discount-text',
    progress: 74,
    orders: '₦412,000',
  },
  {
    image: PUBLIC_IMAGES.ribeye,
    name: '15% OFF Prime Ribeye Steak',
    meta: 'Daily · Served 4–9 PM · Dine-in only',
    views: '2,860',
    claims: '86',
    rate: '3.0%',
    status: 'Active',
    statusClass: 'bg-primary-container text-on-primary-container',
    progress: 58,
    orders: '₦560,400',
  },
  {
    image: PUBLIC_IMAGES.mojito,
    name: 'Buy 1 Get 1 Craft House Cocktails',
    meta: 'Fri–Sat · 6–10 PM · Bar section',
    views: '2,320',
    claims: '50',
    rate: '2.2%',
    status: 'Ending Soon',
    statusClass: 'bg-surface-container-high text-text-secondary',
    progress: 41,
    orders: '₦148,600',
  },
];

const FUNNEL = [
  { step: 'Impressions', value: '8,420', pct: '100%', width: '100%' },
  { step: 'Detail Views', value: '3,940', pct: '46.8%', width: '47%' },
  { step: 'Voucher Claims', value: '248', pct: '6.3%', width: '30%' },
  { step: 'Redemptions', value: '214', pct: '86.3%', width: '24%' },
  { step: 'Repeat Orders', value: '186', pct: '87.1%', width: '20%', highlight: true },
];

const BENCHMARK = [
  { name: 'Your claim rate', pct: 2.9, width: '86%', bar: 'bg-primary' },
  { name: 'Industry average', pct: 2.1, width: '62%', bar: 'bg-surface-container-high' },
  { name: 'Top quartile', pct: 3.4, width: '100%', bar: 'bg-tertiary' },
];

const BOOST_STATS = [
  { value: '₦15,000', label: 'Spent' },
  { value: '5,200', label: 'Reach' },
  { value: '58', label: 'Verified' },
];

const BENCHMARK_LEGEND = [
  { dot: 'bg-primary', label: 'Yours' },
  { dot: 'bg-surface-container-high', label: 'Industry avg' },
  { dot: 'bg-tertiary', label: 'Top quartile' },
];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>{children}</div>
  );
}

function Panel({
  title,
  meta,
  action,
  children,
  className = '',
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-lg shadow-sm ${className}`}>
      <div className="flex items-end justify-between gap-space-sm mb-space-md">
        <div className="flex flex-col min-w-0">
          <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">{title}</h2>
          {meta && <div className="font-caption text-caption text-text-secondary mt-0.5">{meta}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DesktopAnalyticsDealsScreen({
  onNav,
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onManageDeals,
}: DesktopAnalyticsDealsScreenProps) {
  const [domainTab, setDomainTab] = useState<AnalyticsTabKey>('deals');
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

  const handleTab = (tab: AnalyticsTabKey) => {
    setDomainTab(tab);
    onAnalyticsTab(tab);
  };

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      <div className="flex flex-col w-full pb-space-3xl">
        {/* Breadcrumb & Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-lg pb-space-xs">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm"
          >
            <span className="hover:text-primary transition-colors cursor-pointer">Business Hub</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="hover:text-primary transition-colors cursor-pointer">Analytics &amp; Intelligence</span>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-on-surface font-semibold">Deals &amp; Campaign ROI</span>
          </nav>
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
            <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
            <span>4 Live Deals</span>
          </div>
        </div>

        {/* Page Title & Action Cluster */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mt-space-xs mb-space-lg">
          <div className="space-y-space-2xs max-w-3xl">
            <div className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
              Deal Intelligence
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Deal Performance Pulse
            </h1>
            <p className="font-body-md text-body-md text-text-secondary">Conversion &amp; redemption analytics</p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              className="flex items-center gap-space-2xs bg-surface-container-lowest px-space-sm py-2 rounded-xl font-button-secondary text-button-secondary text-on-surface shadow-sm hover:bg-surface-tint-blue hover:text-primary transition-all"
              type="button"
              onClick={onOpenFilter}
            >
              <Icon name="tune" className="text-[18px]" />
              <span>Filter</span>
            </button>
            <button
              className="flex items-center gap-space-2xs bg-surface-container-lowest px-space-sm py-2 rounded-xl font-button-secondary text-button-secondary text-on-surface shadow-sm hover:bg-surface-tint-blue hover:text-primary transition-all"
              type="button"
              onClick={onOpenExport}
            >
              <Icon name="ios_share" className="text-[18px]" />
              <span>Export</span>
            </button>
            <button
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.3)] hover:bg-surface-tint transition-all active:scale-[0.98]"
              type="button"
              onClick={onManageDeals}
            >
              <Icon name="local_offer" className="text-[18px]" />
              <span>Manage Deals</span>
            </button>
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl mb-space-xl overflow-x-auto">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-current={domainTab === tab.key ? 'page' : undefined}
              onClick={() => handleTab(tab.key)}
              className={
                domainTab === tab.key
                  ? 'flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-bold shadow-sm whitespace-nowrap'
                  : 'flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:text-on-surface font-label-md text-label-md font-medium transition-colors whitespace-nowrap'
              }
            >
              <Icon name={tab.icon} className="text-[18px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* KPI Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface-canvas rounded-2xl border border-border-subtle p-space-lg shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-medium">{kpi.label}</span>
                <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                  <Icon name={kpi.icon} className="text-[18px]" />
                </span>
              </div>
              <div className="mt-space-sm">
                <div className="font-heading-md text-heading-md text-text-primary font-bold">{kpi.value}</div>
                <span className="font-caption text-caption text-text-tertiary">{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Asymmetric Dashboard Grid (7 cols left, 5 cols right on lg screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Deal-by-Deal Performance */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <Panel title="Deal-by-Deal Performance" meta="Views → claims → attributed orders">
              <div className="flex flex-col gap-space-sm">
                {DEALS.map((deal) => (
                  <Card key={deal.name}>
                    <div className="flex items-start gap-space-sm">
                      <img alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" src={deal.image} />
                      <div className="flex flex-col min-w-0 gap-1 flex-1">
                        <div className="flex items-start justify-between gap-space-xs">
                          <span className="font-heading-sm text-heading-sm font-semibold text-on-surface leading-snug">
                            {deal.name}
                          </span>
                          <span
                            className={`font-caption text-caption font-semibold px-2 py-0.5 rounded-full shrink-0 ${deal.statusClass}`}
                          >
                            {deal.status}
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">{deal.meta}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
                      <div className="bg-surface-container-low rounded-lg px-space-xs py-1 text-center">
                        <div className="font-label-md text-label-md text-text-primary font-bold">{deal.views}</div>
                        <span className="font-caption text-caption text-text-tertiary">Views</span>
                      </div>
                      <div className="bg-surface-container-low rounded-lg px-space-xs py-1 text-center">
                        <div className="font-label-md text-label-md text-text-primary font-bold">{deal.claims}</div>
                        <span className="font-caption text-caption text-text-tertiary">Claims</span>
                      </div>
                      <div className="bg-surface-container-low rounded-lg px-space-xs py-1 text-center">
                        <div className="font-label-md text-label-md text-text-primary font-bold">{deal.rate}</div>
                        <span className="font-caption text-caption text-text-tertiary">Rate</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-space-xs mt-space-sm">
                      <div className="flex items-center gap-space-2xs min-w-0 flex-1">
                        <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden flex-1">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${deal.progress}%` }} />
                        </div>
                        <span className="font-caption text-caption text-text-secondary shrink-0">
                          {deal.progress}% of cap
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">
                        {deal.orders}
                      </span>
                    </div>

                    <button
                      className="w-full h-10 mt-space-sm rounded-xl border border-border-subtle bg-surface-container-low font-label-sm text-label-sm text-primary font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-tint-blue transition-all active:scale-95"
                      type="button"
                      onClick={() => showToast(`${deal.name} — details opened`)}
                    >
                      <span>View deal detail</span>
                      <Icon name="arrow_forward" className="text-[15px]" />
                    </button>
                  </Card>
                ))}
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN: Benchmark & Funnel */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Comparative Benchmark */}
            <Panel title="Comparative Benchmark" meta="Claim rate vs market">
              <div className="flex flex-col gap-space-sm">
                {BENCHMARK.map((row) => (
                  <div className="flex flex-col gap-1" key={row.name}>
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface">{row.name}</span>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{row.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                      <div className={`h-full rounded-full ${row.bar}`} style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-space-xs mt-space-sm pt-space-xs border-t border-border-subtle flex-wrap">
                {BENCHMARK_LEGEND.map((legend) => (
                  <span
                    className="flex items-center gap-1 font-caption text-caption text-text-secondary"
                    key={legend.label}
                  >
                    <span className={`w-2 h-2 rounded-full ${legend.dot}`} />
                    {legend.label}
                  </span>
                ))}
              </div>
            </Panel>

            {/* Conversion Funnel */}
            <Panel title="Conversion Funnel" meta="8,420 impressions → 186 repeat orders">
              <div className="flex flex-col gap-space-xs">
                {FUNNEL.map((step) => (
                  <div className="flex flex-col gap-0.5" key={step.step}>
                    <div className="flex items-center justify-between gap-space-xs">
                      <span className="font-caption text-caption text-text-secondary">{step.step}</span>
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                        {step.value} · {step.pct}
                      </span>
                    </div>
                    <div
                      className={`h-6 rounded-lg flex items-center px-space-xs ${
                        step.highlight ? 'bg-primary-container' : 'bg-surface-container-low'
                      }`}
                    >
                      <div
                        className={`h-full rounded-md ${step.highlight ? 'bg-primary' : 'bg-primary/40'}`}
                        style={{ width: step.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* Boost Performance */}
        <div className="mt-space-lg rounded-2xl bg-gradient-to-br from-surface-tint-blue to-surface-canvas border border-primary/20 p-space-lg shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="flex items-start gap-space-sm max-w-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="campaign" className="text-[19px]" />
              </div>
              <div className="flex flex-col min-w-0 gap-1">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Boost Performance</span>
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  ₦15,000 promotion spend reached 5,200 profiles and drove 58 verified redemptions last month.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm shrink-0">
              <div className="grid grid-cols-3 gap-space-xs">
                {BOOST_STATS.map((stat) => (
                  <div
                    className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 px-space-sm text-center"
                    key={stat.label}
                  >
                    <div className="font-label-md text-label-md text-text-primary font-bold">{stat.value}</div>
                    <span className="font-caption text-caption text-text-tertiary">{stat.label}</span>
                  </div>
                ))}
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform hover:bg-surface-tint"
                type="button"
                onClick={onManageDeals}
              >
                <Icon name="local_offer" className="text-[18px]" />
                <span>Manage Deals &amp; Create Promo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AnalyticsShell>
  );
}
