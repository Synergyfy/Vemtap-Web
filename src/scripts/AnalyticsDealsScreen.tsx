import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { AnalyticsHeader, AnalyticsSection, type AnalyticsTabKey } from '../components/AnalyticsChrome';
import { PUBLIC_IMAGES } from './publicPosData';
import { apiErrorMessage } from '../services/errorMessages';
import { useSponsoredSummary } from '../hooks/business/useSponsored';
import { count, dealsView, naira, useLiveAnalytics } from './analyticsLive';

interface AnalyticsDealsScreenProps {
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onTab: (tab: BusinessTabKey) => void;
  onManageDeals: () => void;
}

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

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsDealsScreen({
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onTab,
  onManageDeals,
}: AnalyticsDealsScreenProps) {
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

  const { live, data, error } = useLiveAnalytics('deals');
  const boosts = useSponsoredSummary();
  useEffect(() => {
    if (error) showToast(apiErrorMessage(error, 'Could not load deal analytics.'));
  }, [error]);

  const view = dealsView(data, boosts.data, KPIS);
  const totals = data?.totals;
  const kpis = live ? view.kpis : KPIS;
  const deals = live ? view.deals : DEALS;
  const funnelSteps = live ? view.funnel : FUNNEL;
  const benchmark = live ? view.benchmark : BENCHMARK;

  return (
    <AppScreen>
      <AnalyticsHeader active="deals" onTab={onAnalyticsTab} onOpenFilter={onOpenFilter} onOpenExport={onOpenExport} />

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-28">
        {/* Pulse header */}
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <span className="font-heading-sm text-heading-sm text-text-primary tracking-tight font-semibold">
              Deal Performance Pulse
            </span>
            <span className="font-caption text-caption text-text-secondary mt-0.5">
              Conversion &amp; redemption analytics
            </span>
          </div>
          <span className="flex items-center gap-1 font-caption text-caption font-semibold px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            {live ? `${count(totals?.live)} Live Deals` : '4 Live Deals'}
          </span>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <div className="flex items-center gap-1 text-primary">
                <Icon name={kpi.icon} className="text-[15px]" />
                <span className="font-caption text-caption text-text-secondary font-semibold">{kpi.label}</span>
              </div>
              <div className="font-heading-md text-heading-md text-text-primary font-bold mt-1">{kpi.value}</div>
              <span className="font-caption text-caption text-text-tertiary">{kpi.sub}</span>
            </Card>
          ))}
        </div>

        {/* Per-deal cards */}
        <AnalyticsSection title="Deal-by-Deal Performance" meta="Views → claims → attributed orders">
          <div className="flex flex-col gap-space-sm">
            {live && !deals.length && (
              <span className="font-caption text-caption text-text-tertiary">No deal activity in this period</span>
            )}
            {deals.map((deal) => (
              <Card key={deal.name}>
                <div className="flex items-start gap-space-sm">
                  <img
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    src={deal.image}
                  />
                  <div className="flex flex-col min-w-0 gap-1">
                    <div className="flex items-start justify-between gap-space-xs">
                      <span className="font-body-lg text-body-lg font-semibold text-on-surface leading-snug">
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
                      {live ? `${deal.progress}% of top deal` : `${deal.progress}% of cap`}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">
                    {deal.orders}
                  </span>
                </div>

                <button
                  className="w-full h-10 mt-space-sm rounded-xl border border-border-subtle bg-surface-container-low font-label-sm text-label-sm text-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
                  type="button"
                  onClick={() => (live ? onManageDeals() : showToast(`${deal.name} — details opened`))}
                >
                  <span>View deal detail</span>
                  <Icon name="arrow_forward" className="text-[15px]" />
                </button>
              </Card>
            ))}
          </div>
        </AnalyticsSection>

        {/* Benchmark */}
        <AnalyticsSection title="Comparative Benchmark" meta="Claim rate vs market">
          <Card>
            <div className="flex flex-col gap-space-sm">
              {benchmark.map((row) => (
                <div className="flex flex-col gap-1" key={row.name}>
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface">{row.name}</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                      {row.pct == null ? '—' : `${row.pct}%`}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                    <div className={`h-full rounded-full ${row.bar}`} style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-space-xs mt-space-sm pt-space-xs border-t border-border-subtle flex-wrap">
              {[
                { dot: 'bg-primary', label: 'Yours' },
                { dot: 'bg-surface-container-high', label: 'Industry avg' },
                { dot: 'bg-tertiary', label: 'Top quartile' },
              ].map((legend) => (
                <span className="flex items-center gap-1 font-caption text-caption text-text-secondary" key={legend.label}>
                  <span className={`w-2 h-2 rounded-full ${legend.dot}`} />
                  {legend.label}
                </span>
              ))}
            </div>
          </Card>
        </AnalyticsSection>

        {/* Funnel */}
        <AnalyticsSection
          title="Conversion Funnel"
          meta={live ? view.funnelMeta : '8,420 impressions → 186 repeat orders'}
        >
          <Card>
            <div className="flex flex-col gap-space-xs">
              {funnelSteps.map((step) => (
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
          </Card>
        </AnalyticsSection>

        {/* Boost */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/20">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Icon name="campaign" className="text-[19px]" />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">Boost Performance</span>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                {live ? view.boostLine : '₦15,000 promotion spend reached 5,200 profiles and drove 58 verified redemptions last month.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">{live ? naira(boosts.data?.totalSpent) : '₦15,000'}</div>
              <span className="font-caption text-caption text-text-tertiary">Spent</span>
            </div>
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">{live ? count(boosts.data?.audienceReached) : '5,200'}</div>
              <span className="font-caption text-caption text-text-tertiary">Reach</span>
            </div>
            <div className="bg-surface-canvas border border-border-subtle rounded-lg py-1.5 text-center">
              <div className="font-label-md text-label-md text-text-primary font-bold">{live ? count(boosts.data?.redemptions) : '58'}</div>
              <span className="font-caption text-caption text-text-tertiary">Verified</span>
            </div>
          </div>
          <button
            className="w-full h-11 mt-space-sm rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
            type="button"
            onClick={onManageDeals}
          >
            <Icon name="local_offer" className="text-[18px]" />
            <span>Manage Deals &amp; Create Promo</span>
          </button>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-32px)]">
          <div className="bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-space-md py-space-xs rounded-full shadow-lg flex items-center gap-space-2xs whitespace-nowrap">
            <Icon name="check_circle" className="text-[16px] text-badge-discount-text" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="more" onTab={onTab} />
    </AppScreen>
  );
}
