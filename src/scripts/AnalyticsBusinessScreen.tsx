import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { AnalyticsHeader, AnalyticsSection, type AnalyticsTabKey } from '../components/AnalyticsChrome';

interface AnalyticsBusinessScreenProps {
  onAnalyticsTab: (tab: AnalyticsTabKey) => void;
  onOpenFilter: () => void;
  onOpenExport: () => void;
  onTab: (tab: BusinessTabKey) => void;
}

const ACTIVITY = [
  { value: '14,280', label: 'Profile Views', icon: 'visibility' },
  { value: '218', label: 'New Customers', icon: 'person_add' },
  { value: '294', label: 'Returning', icon: 'replay' },
  { value: '184', label: 'Deal Claims', icon: 'confirmation_number' },
  { value: '640', label: 'Menu Scans', icon: 'qr_code_scanner' },
];

const SOURCES = [
  { name: 'In-Store QR Scans', pct: 41, amount: '₦1,988,500', bar: 'bg-primary' },
  { name: 'Direct Storefront', pct: 26, amount: '₦1,261,000', bar: 'bg-primary-container' },
  { name: 'Deals & Vouchers', pct: 18, amount: '₦873,000', bar: 'bg-badge-discount-text' },
  { name: 'Social Profile Link', pct: 11, amount: '₦533,500', bar: 'bg-secondary' },
  { name: 'Walk-in Referral', pct: 4, amount: '₦194,000', bar: 'bg-tertiary' },
];

const INSIGHTS = [
  {
    icon: 'trending_up',
    iconClass: 'bg-surface-tint-blue text-primary',
    title: 'Saturday dinner is your power hour',
    meta: '62% of weekly revenue lands Friday–Sunday between 6–9 PM.',
    tag: 'Plan staffing',
  },
  {
    icon: 'local_offer',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Deal buyers convert to regulars',
    meta: '38% of voucher redemptions return within 14 days at full price.',
    tag: 'Keep promo cadence',
  },
  {
    icon: 'inventory_2',
    iconClass: 'bg-tertiary-fixed text-tertiary',
    title: 'Ribeye outpaces kitchen capacity',
    meta: 'Prime Ribeye sells out by 8 PM on 4 of 6 weekends — prep more.',
    tag: 'Adjust prep',
  },
];

const TREND_METRICS = ['Revenue', 'Orders', 'Visits', 'Customers', 'Views'];
const TREND_DAYS = [
  { day: 'Mon', value: 44 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 52 },
  { day: 'Thu', value: 70 },
  { day: 'Fri', value: 96 },
  { day: 'Sat', value: 100 },
  { day: 'Sun', value: 88 },
];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-canvas rounded-2xl border border-border-subtle p-space-md ${className}`}>
      {children}
    </div>
  );
}

export function AnalyticsBusinessScreen({
  onAnalyticsTab,
  onOpenFilter,
  onOpenExport,
  onTab,
}: AnalyticsBusinessScreenProps) {
  const [metric, setMetric] = useState('Revenue');
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

  return (
    <AppScreen>
      <AnalyticsHeader active="business" onTab={onAnalyticsTab} onOpenFilter={onOpenFilter} onOpenExport={onOpenExport} />

      <div className="flex flex-col gap-space-xl px-margin pt-space-sm pb-28">
        {/* Hero KPI */}
        <Card className="bg-gradient-to-br from-surface-container-low to-surface-canvas border-primary/15">
          <div className="flex items-center gap-space-2xs mb-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wide">
              Business Pulse · Live
            </span>
          </div>
          <span className="font-label-md text-label-md text-text-secondary">Gross Revenue</span>
          <div className="flex items-end justify-between gap-space-sm mt-1">
            <span className="font-heading-md text-heading-md text-text-primary font-bold tracking-tight">
              ₦4,850,000
            </span>
            <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full">
              <Icon name="north_east" className="text-[13px]" />
              <span>18.4%</span>
            </span>
          </div>
          <span className="font-caption text-caption text-text-tertiary mt-1 block">
            vs ₦4,095,000 last 30 days
          </span>

          <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
            <div className="bg-surface-canvas rounded-xl p-space-sm border border-border-subtle">
              <span className="font-caption text-caption text-text-secondary">Total Orders</span>
              <div className="font-heading-sm text-heading-sm text-text-primary font-bold">512</div>
            </div>
            <div className="bg-surface-canvas rounded-xl p-space-sm border border-border-subtle">
              <span className="font-caption text-caption text-text-secondary">Interactions</span>
              <div className="font-heading-sm text-heading-sm text-text-primary font-bold">4,820</div>
            </div>
          </div>
        </Card>

        {/* Activity counters */}
        <div className="flex gap-space-xs overflow-x-auto no-scrollbar -mx-margin px-margin">
          {ACTIVITY.map((item) => (
            <button
              className="shrink-0 bg-surface-canvas border border-border-subtle rounded-xl px-space-sm py-space-xs flex flex-col items-start gap-0.5 min-w-[104px] active:scale-95 transition-transform"
              key={item.label}
              type="button"
              onClick={() => showToast(`${item.label}: ${item.value}`)}
            >
              <Icon name={item.icon} className="text-primary text-[16px]" />
              <span className="font-label-md text-label-md text-text-primary font-bold">{item.value}</span>
              <span className="font-caption text-caption text-text-secondary">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Performance trend */}
        <AnalyticsSection
          title="Performance Trend"
          meta={`${metric} · Last 7 days`}
          action={
            <button
              className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1"
              type="button"
              onClick={onOpenFilter}
            >
              <span>Details</span>
              <Icon name="arrow_forward" className="text-[14px]" />
            </button>
          }
        >
          <Card>
            <div className="flex gap-space-2xs overflow-x-auto no-scrollbar -mb-1">
              {TREND_METRICS.map((item) => (
                <button
                  className={`h-7 px-space-sm rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    metric === item ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-text-secondary'
                  }`}
                  key={item}
                  type="button"
                  onClick={() => setMetric(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-space-sm flex items-end justify-between gap-space-2xs h-32">
              {TREND_DAYS.map((day) => (
                <div className="flex-1 flex flex-col items-center gap-1" key={day.day}>
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className={`w-full max-w-[22px] rounded-t-md transition-all ${
                        day.value === 100 ? 'bg-primary' : 'bg-primary/35'
                      }`}
                      style={{ height: `${day.value}%` }}
                    />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-space-sm pt-space-xs border-t border-border-subtle">
              <span className="font-caption text-caption text-text-secondary">Weekly high · Saturday</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">₦1,140,000</span>
            </div>
          </Card>
        </AnalyticsSection>

        {/* Growth & retention */}
        <AnalyticsSection title="Growth & Retention" meta="Customer mix across the period">
          <Card>
            <div className="flex items-center justify-between font-label-sm text-label-sm font-semibold mb-space-2xs">
              <span className="text-primary">New 42.6%</span>
              <span className="text-secondary">Returning 57.4%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-surface-container-low">
              <div className="h-full bg-primary" style={{ width: '42.6%' }} />
              <div className="h-full bg-secondary" style={{ width: '57.4%' }} />
            </div>
            <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
              <div className="bg-surface-container-low rounded-xl p-space-sm">
                <div className="flex items-center gap-1 text-primary">
                  <Icon name="person_add" className="text-[15px]" />
                  <span className="font-caption text-caption font-semibold">New</span>
                </div>
                <div className="font-heading-sm text-heading-sm text-text-primary font-bold">218</div>
                <span className="font-caption text-caption text-text-tertiary">first-time buyers</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-sm">
                <div className="flex items-center gap-1 text-secondary">
                  <Icon name="replay" className="text-[15px]" />
                  <span className="font-caption text-caption font-semibold">Returning</span>
                </div>
                <div className="font-heading-sm text-heading-sm text-text-primary font-bold">294</div>
                <span className="font-caption text-caption text-text-tertiary">repeat visits</span>
              </div>
            </div>
          </Card>
        </AnalyticsSection>

        {/* Activity by source */}
        <AnalyticsSection title="Activity by Source" meta="₦4,850,000 attributed revenue">
          <Card>
            <div className="flex flex-col gap-space-sm">
              {SOURCES.map((source) => (
                <div className="flex flex-col gap-1" key={source.name}>
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{source.name}</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">
                      {source.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className={`h-full rounded-full ${source.bar}`} style={{ width: `${source.pct}%` }} />
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">{source.amount}</span>
                </div>
              ))}
            </div>
          </Card>
        </AnalyticsSection>

        {/* Key factual insights */}
        <AnalyticsSection title="Key Factual Insights" meta="Based on 30 days of store data">
          <div className="flex flex-col gap-space-xs">
            {INSIGHTS.map((insight) => (
              <Card key={insight.title}>
                <div className="flex items-start gap-space-sm">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${insight.iconClass}`}>
                    <Icon name={insight.icon} className="text-[17px]" />
                  </div>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">{insight.title}</span>
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">{insight.meta}</p>
                    <span className="font-caption text-caption text-primary font-semibold mt-0.5">
                      {insight.tag}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AnalyticsSection>

        {/* Handoff */}
        <Card className="bg-gradient-to-br from-surface-tint-blue to-surface-canvas border-primary/20">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Icon name="build" className="text-[19px]" />
            </div>
            <div className="flex flex-col min-w-0 gap-1">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                Adjust Operations &amp; Pricing?
              </span>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                These insights map to menu pricing, prep lists and staff shifts. Review them in the business hub.
              </p>
            </div>
          </div>
          <button
            className="w-full h-11 mt-space-sm rounded-xl bg-primary text-on-primary font-button-primary font-semibold flex items-center justify-center gap-space-2xs active:scale-95 transition-transform"
            type="button"
            onClick={() => onTab('business')}
          >
            <Icon name="storefront" className="text-[18px]" />
            <span>Open Business Hub</span>
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
