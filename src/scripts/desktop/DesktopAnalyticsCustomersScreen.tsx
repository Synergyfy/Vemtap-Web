import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { AnalyticsShell } from './AnalyticsShell';
import { downloadCsv } from '../../utils/exportCsv';
import { apiErrorMessage } from '../../services/errorMessages';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { CUSTOMER_AVATAR } from '../customersLive';
import { activityHeatmap, count, naira, periodLabel, signedChange, useLiveAnalytics } from '../analyticsLive';

interface DesktopAnalyticsCustomersScreenProps {
  onNav?: (key: BusinessPortalNavKey) => void;
}

const SUB_TABS = [
  { label: 'Business', active: false },
  { label: 'Customers (Active)', active: true },
  { label: 'Deals', active: false },
  { label: 'Locations', active: false },
  { label: 'POS Registers', active: false },
];

const COHORT_POINTS: Array<{ week: string; value: string; note: string; noteClass: string; valueClass: string; boxClass?: string; weekClass?: string }> = [
  {
    week: 'Week 1',
    value: '100%',
    note: 'Acquisition',
    noteClass: 'font-caption text-caption text-text-secondary',
    valueClass: 'font-heading-sm text-heading-sm font-bold text-on-surface mt-0.5',
  },
  {
    week: 'Week 3',
    value: '54%',
    note: '+14% vs Mkt',
    noteClass: 'font-caption text-caption text-badge-discount-text font-medium',
    valueClass: 'font-heading-sm text-heading-sm font-bold text-primary mt-0.5',
  },
  {
    week: 'Week 5',
    value: '46%',
    note: 'Loyalty Loop',
    noteClass: 'font-caption text-caption text-text-secondary',
    valueClass: 'font-heading-sm text-heading-sm font-bold text-on-surface mt-0.5',
  },
  {
    week: 'Week 8',
    value: '38%',
    note: '+10% Win',
    noteClass: 'font-caption text-caption text-badge-discount-text font-bold',
    valueClass: 'font-heading-sm text-heading-sm font-bold text-primary mt-0.5',
    boxClass: 'bg-surface-tint-blue rounded-lg py-1 px-2',
    weekClass: 'font-caption text-caption text-primary font-bold',
  },
];

const pct = (fraction?: number) => `${Math.round((fraction ?? 0) * 1000) / 10}%`;

export function DesktopAnalyticsCustomersScreen({ onNav }: DesktopAnalyticsCustomersScreenProps) {
  const { live, filter, data: customers, error } = useLiveAnalytics('customers');
  const { branches } = useBusinessBranch();
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };
  useEffect(() => {
    if (error) showToast(apiErrorMessage(error, 'Could not load customer analytics.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);

  const seg = customers?.segments;
  const segSpend = seg ? seg.vip.spend + seg.regular.spend + seg.new.spend + seg.lapsed.spend : 0;
  const vipShare = segSpend && seg ? Math.round((seg.vip.spend / segSpend) * 100) : 0;
  const top = customers?.topCustomers ?? [];
  const heat = activityHeatmap(customers?.heatmap);
  const branchLabel = filter.branchId ? (branches.find((b) => b.id === filter.branchId)?.name ?? '—') : 'All branches';
  const weeks = (customers?.growth ?? []).slice(-4);
  const cohortPoints = live
    ? weeks.map((week, index) => ({
        ...COHORT_POINTS[Math.min(index, COHORT_POINTS.length - 1)],
        week: `Wk of ${new Date(`${week.weekStart.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        value: count(week.new + week.returning),
        note: `${week.new} new · ${week.returning} back`,
      }))
    : COHORT_POINTS;

  return (
    <AnalyticsShell activeNav="analytics" onNav={onNav}>
      {/* Top Command & Action Canvas */}
      <div className="w-full pt-space-md pb-space-lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption mb-space-xs">
          <span className="hover:text-primary cursor-pointer transition-colors">Business Hub</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="hover:text-primary cursor-pointer transition-colors">Analytics &amp; Intelligence</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-text-primary font-medium">Customer Intelligence</span>
        </div>

        {/* Header & Universal Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Customer Intelligence &amp; CRM Analytics
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-3xl">
              Deep-dive patron retention cohorts, lifetime customer value (CLV), visit rhythm, and automated loyalty
              intervention triggers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
            {/* Outlet Selector */}
            <div className="relative bg-surface-canvas rounded-xl shadow-sm px-space-sm py-2 flex items-center gap-space-xs cursor-pointer hover:bg-surface-subtle transition-all">
              <Icon name="storefront" className="text-primary text-[20px]" />
              <div className="flex flex-col text-left">
                <span className="font-caption text-caption text-text-tertiary leading-none">Branch Hub</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface leading-tight mt-0.5">
                  {v(branchLabel, 'Downtown Hub / Wuse II')}
                </span>
              </div>
              <Icon name="expand_more" className="text-outline text-[18px] ml-1" />
            </div>
            {/* Period Selector */}
            <div className="relative bg-surface-canvas rounded-xl shadow-sm px-space-sm py-2 flex items-center gap-space-xs cursor-pointer hover:bg-surface-subtle transition-all">
              <Icon name="calendar_today" className="text-outline text-[18px]" />
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">{v(periodLabel(filter), 'Last 30 Days')}</span>
              <Icon name="expand_more" className="text-outline text-[18px]" />
            </div>
            {/* Secondary CTA: CSV Export */}
            <button
              className="bg-surface-canvas hover:bg-surface-subtle text-text-primary px-space-sm py-2.5 rounded-xl font-label-md text-label-md font-medium flex items-center gap-space-2xs shadow-sm transition-all active:scale-95"
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_customer_intelligence',
                  ['Metric', 'Value', 'Note'],
                  live
                    ? [
                        ['Customers', count(customers?.total.current), signedChange(customers?.total)],
                        ['Repeat rate', pct(customers?.repeatRate.current), signedChange(customers?.repeatRate)],
                        ['Avg spend', naira(customers?.averageSpend), 'Per active customer'],
                        ['VIP spend share', `${vipShare}%`, `${count(seg?.vip.count)} VIP customers`],
                        ['Lapsed customers', count(seg?.lapsed.count), naira(seg?.lapsed.spend)],
                        ...top.map((customer) => [customer.name || 'Customer', naira(customer.spend), `${customer.visits} visits`]),
                      ]
                    : [
                        ['Avg Lifetime Value', '₦38,400', '+8.4% vs benchmark'],
                        ['VIP Rev Share', '₦13.8M', 'High frequency, high basket'],
                        ['At-Risk Churn Value', '₦950k', 'No visit in 45+ days'],
                        ...COHORT_POINTS.map((point) => [`Cohort ${point.week}`, point.value, point.note]),
                      ],
                );
              }}
            >
              <Icon name="file_download" className="text-[18px] text-text-secondary" />
              <span>Export Directory (CSV)</span>
            </button>
            {/* Primary Campaign CTA */}
            <button
              className="bg-primary-container hover:bg-primary text-on-primary-container px-space-md py-2.5 rounded-xl font-button-primary text-button-primary shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] flex items-center gap-space-2xs transition-all active:scale-95"
              type="button"
            >
              <Icon name="campaign" className="text-[18px]" />
              <span>Launch Targeted Loyalty Campaign</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-space-xs mt-space-lg overflow-x-auto">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={
                tab.active
                  ? 'px-space-md py-2 rounded-lg font-button-secondary text-button-secondary bg-surface-tint-blue text-primary font-semibold shadow-xs whitespace-nowrap'
                  : 'px-space-md py-2 rounded-lg font-label-md text-label-md text-text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Strategic Banner */}
        <div className="mt-space-md rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-canvas to-surface-tint-blue p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-start md:items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(6,108,244,0.3)]">
              <Icon name="auto_awesome" className="text-[24px]" />
            </div>
            <div>
              <div className="flex items-center gap-space-2xs">
                <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                  VEMTAP AI Intelligence
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-badge-discount-text font-semibold">Active Engine</span>
              </div>
              <p className="font-heading-sm text-heading-sm font-semibold text-on-surface mt-0.5">
                {live ? (
                  <>
                    Repeat rate is{' '}
                    <span className="text-badge-discount-text font-bold">{pct(customers?.repeatRate.current)}</span> —{' '}
                    {count(seg?.vip.count)} VIP customers generated {vipShare}% of customer spend this period.
                  </>
                ) : (
                  <>
                    Patron Retention is Up <span className="text-badge-discount-text font-bold">+18%</span> — 76 VIP regulars
                    generated over 58% of gross revenue in Abuja Downtown this cycle.
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            className="self-start md:self-auto shrink-0 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-label-md text-label-md font-semibold flex items-center gap-space-2xs shadow-md transition-all active:scale-95"
            type="button"
          >
            <Icon name="bolt" className="text-[18px]" />
            <span>Trigger VIP Thank-You Perk</span>
          </button>
        </div>

        {/* Key Performance Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-md">
          {/* Metric 1 */}
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-medium text-text-secondary">Captured Diners</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                <Icon name="group" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold text-on-surface">{v(count(customers?.total.current), '1,842')}</span>
                <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Icon name="trending_up" className="text-[12px]" /> {v(`+${count(customers?.new.current)} new`, '+142 this mo')}
                </span>
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-1">{v('Customers with any visit, order or claim', 'Unique diners tied via POS Tap & QR')}</p>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: v(pct(customers?.total.current ? (customers.active.current / customers.total.current) : 0), '78%') }} />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-medium text-text-secondary">Repeat Rate</span>
              <span className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="cached" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold text-on-surface">{v(pct(customers?.repeatRate.current), '58%')}</span>
                <span className="font-caption text-caption text-primary font-semibold bg-surface-tint-blue px-2 py-0.5 rounded-full">
                  {v(signedChange(customers?.repeatRate), 'Optimal')}
                </span>
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-1">{v(`${count(customers?.returning)} returning customers`, '76 patrons power bulk gross volume')}</p>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
              <div className="bg-badge-discount-text h-full rounded-full" style={{ width: v(pct(customers?.repeatRate.current), '58%') }} />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-medium text-text-secondary">{v('Avg Spend', 'Avg Lifetime Value (CLV)')}</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                <Icon name="payments" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold text-on-surface">{v(naira(customers?.averageSpend), '₦38,400')}</span>
                <span className="font-caption text-caption text-badge-discount-text font-semibold bg-badge-discount-bg px-2 py-0.5 rounded-full">
                  {v('', '+8.4%')}
                </span>
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-1">
                {v('Per active customer this period', 'Benchmarked against FCT upscale dining')}
              </p>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '64%' }} />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-medium text-text-secondary">{v('Visit Frequency', 'VEMTAP Velocity')}</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center">
                <Icon name="speed" className="text-[18px]" />
              </span>
            </div>
            <div className="mt-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-hero text-display-hero font-bold text-on-surface">
                  {v((customers?.visitsPerActiveCustomer ?? 0).toFixed(1), '+34')}
                </span>
                <span className="font-caption text-caption text-text-secondary font-medium">{v('visits', 'walk-ins / wk')}</span>
              </div>
              <p className="font-caption text-caption text-text-tertiary mt-1">
                {v('Per active customer', 'Conversions straight via proximity pass')}
              </p>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-sm overflow-hidden">
              <div className="bg-tertiary-container h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace: Asymmetric 7-col vs 5-col Layout */}
      <div className="w-full pb-space-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* MODULE 1: Cohort Retention Curve */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                      Patron Comeback Frequency
                    </h2>
                    <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {v(periodLabel(filter), 'Cohort 2024')}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    {v('New and returning customers by week', '8-Week post-discovery retention baseline tracking repeat dining frequency')}
                  </p>
                </div>
                {/* Comparison Badge */}
                <div className="inline-flex items-center gap-1.5 px-space-sm py-1.5 rounded-xl bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="verified" className="text-[16px]" />
                  <span className="font-caption text-caption font-bold">
                    {v('Local benchmark: —', 'Local Abuja food & drink standard: 28% at W8 (+10% Outperform)')}
                  </span>
                </div>
              </div>

              {/* Cohort Visualization Graphic (SVG Chart + Milestones) */}
              <div className="mt-space-sm bg-surface-subtle rounded-xl p-space-md">
                {/* SVG Retention Line & Area */}
                {live ? null : (
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 600 140">
                    {/* Grid Lines */}
                    <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="600" y1="20" y2="20" />
                    <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="600" y1="60" y2="60" />
                    <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="600" y1="100" y2="100" />
                    {/* Regional benchmark dotted line (28% -> y~100) */}
                    <path d="M 30 20 C 150 70, 300 95, 570 102" fill="none" stroke="#9CA3AF" strokeDasharray="6 4" strokeWidth="2" />
                    {/* Area gradient for VEMTAP retention */}
                    <defs>
                      <linearGradient id="vemRetentionGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#066CF4" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#066CF4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 30 20 C 180 30, 240 65, 390 76 C 480 82, 530 87, 570 87 L 570 135 L 30 135 Z"
                      fill="url(#vemRetentionGrad)"
                    />
                    {/* Primary Curve */}
                    <path
                      d="M 30 20 C 180 30, 240 65, 390 76 C 480 82, 530 87, 570 87"
                      fill="none"
                      stroke="#066CF4"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                    {/* Data Points with pulsing anchors */}
                    <circle cx="30" cy="20" fill="#066CF4" r="5" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="210" cy="65" fill="#066CF4" r="5" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="390" cy="76" fill="#066CF4" r="5" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="570" cy="87" fill="#066CF4" r="6" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>
                </div>
                )}

                {/* Cohort Data Points Strip */}
                <div className="grid grid-cols-4 gap-space-xs mt-space-sm pt-space-sm border-t-0 bg-surface-canvas rounded-xl p-space-sm shadow-xs">
                  {live && !cohortPoints.length && (
                    <span className="col-span-4 text-center font-caption text-caption text-text-tertiary">No customer activity yet</span>
                  )}
                  {cohortPoints.map((point) => (
                    <div
                      key={point.week}
                      className={point.boxClass ?? 'flex flex-col items-center text-center'}
                    >
                      <span className={point.weekClass ?? 'font-caption text-caption text-text-tertiary'}>{point.week}</span>
                      <span className={point.valueClass}>{point.value}</span>
                      <span className={point.noteClass}>{point.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODULE 1B: Visit Rhythm Heatmap (live only — served by the customers analytics) */}
            {live && (
              <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md">
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">Visit Rhythm</h2>
                      <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                        {periodLabel(filter)}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Customer activity by weekday and hour
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-space-sm py-1.5 rounded-xl bg-surface-tint-blue text-primary">
                    <Icon name="schedule" className="text-[16px]" />
                    <span className="font-caption text-caption font-bold">Busiest: {heat.busiest}</span>
                  </div>
                </div>

                <div className="bg-surface-subtle rounded-xl p-space-md">
                  {/* Rush-window tiles */}
                  <div className="grid grid-cols-2 gap-space-sm mb-space-sm">
                    <div className="bg-surface-canvas rounded-xl p-space-sm shadow-xs">
                      <div className="flex items-center gap-1 text-primary">
                        <Icon name="wb_sunny" className="text-[16px]" />
                        <span className="font-caption text-caption font-semibold">Lunch window</span>
                      </div>
                      <div className="font-label-md text-label-md text-text-primary font-bold">12–2 PM</div>
                      <span className="font-caption text-caption text-text-tertiary">
                        {heat.lunchShare}% of day activity
                      </span>
                    </div>
                    <div className="bg-surface-canvas rounded-xl p-space-sm shadow-xs">
                      <div className="flex items-center gap-1 text-tertiary">
                        <Icon name="nightlight" className="text-[16px]" />
                        <span className="font-caption text-caption font-semibold">Dinner window</span>
                      </div>
                      <div className="font-label-md text-label-md text-text-primary font-bold">6–9 PM</div>
                      <span className="font-caption text-caption text-text-tertiary">
                        {heat.dinnerShare}% of day activity
                      </span>
                    </div>
                  </div>

                  {/* Weekday bars */}
                  <div className="flex items-end justify-between gap-space-2xs h-32">
                    {!heat.total && (
                      <span className="font-caption text-caption text-text-tertiary self-center mx-auto">
                        No activity in this period
                      </span>
                    )}
                    {heat.week.map((item) => (
                      <div className="flex-1 flex flex-col items-center gap-1" key={item.day}>
                        <div className="w-full flex items-end justify-center h-24">
                          <div
                            className={`w-full max-w-[36px] rounded-t-sm ${
                              item.pct === 100 ? 'bg-primary' : item.pct >= 74 ? 'bg-primary/55' : 'bg-primary/30'
                            }`}
                            style={{ height: `${item.pct}%` }}
                          />
                        </div>
                        <span className="font-caption text-caption text-text-tertiary">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: Customer Segmentation Breakdown */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex items-center justify-between pb-space-md">
                <div>
                  <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                    Customer Segmentation Breakdown
                  </h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Categorized automatically by lifetime gross spend and visit cadence
                  </p>
                </div>
                <span className="font-caption text-caption font-semibold text-text-secondary bg-surface-container-high px-2.5 py-1 rounded-full">
                  {v(`${count(customers?.total.current)} customers`, '4 Distinct Cohorts')}
                </span>
              </div>

              {/* Segments List */}
              <div className="space-y-space-sm">
                {/* Segment 1: VIP Patrons */}
                <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Icon name="crown" className="text-[22px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md font-bold text-on-surface">VIP Patrons</span>
                        <span className="font-caption text-caption font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Top 5% Tier
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        {v(`${naira(seg?.vip.spend)} spend`, 'High frequency, high basket • ₦150k+ spend threshold')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        {v(count(seg?.vip.count), '92')} <span className="font-caption text-caption text-text-tertiary font-normal">patrons</span>
                      </div>
                      <div className="font-caption text-caption text-primary font-semibold">{v(`${pct(seg?.vip.share)} of customers`, '₦13.8M Rev Share')}</div>
                    </div>
                    <button
                      className="px-space-sm py-2 rounded-lg bg-surface-canvas hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold shadow-xs transition-colors"
                      type="button"
                    >
                      VIP Concierge
                    </button>
                  </div>
                </div>

                {/* Segment 2: Regular Diners */}
                <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon name="restaurant" className="text-[22px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md font-bold text-on-surface">Regular Diners</span>
                        <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                          Core Engine
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        {v(`${naira(seg?.regular.spend)} spend`, 'Steady rhythm • 3 to 5 visits per calendar month')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        {v(count(seg?.regular.count), '482')} <span className="font-caption text-caption text-text-tertiary font-normal">patrons</span>
                      </div>
                      <div className="font-caption text-caption text-text-secondary font-semibold">{v(`${pct(seg?.regular.share)} Total Share`, '26.1% Total Share')}</div>
                    </div>
                    <button
                      className="px-space-sm py-2 rounded-lg bg-surface-canvas hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold shadow-xs transition-colors"
                      type="button"
                    >
                      View Roster
                    </button>
                  </div>
                </div>

                {/* Segment 3: Deal Explorers */}
                <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                      <Icon name="sell" className="text-[22px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md font-bold text-on-surface">{v('New Customers', 'Deal Explorers')}</span>
                        <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                          Promotion Driven
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        {v(`${naira(seg?.new.spend)} spend`, 'Price sensitive • 1-2 visits (voucher led discovery)')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        {v(count(seg?.new.count), '640')} <span className="font-caption text-caption text-text-tertiary font-normal">patrons</span>
                      </div>
                      <div className="font-caption text-caption text-text-secondary font-semibold">{v(`${pct(seg?.new.share)} Total Share`, '34.7% Total Share')}</div>
                    </div>
                    <button
                      className="px-space-sm py-2 rounded-lg bg-surface-canvas hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold shadow-xs transition-colors"
                      type="button"
                    >
                      Convert to Regs
                    </button>
                  </div>
                </div>

                {/* Segment 4: At-Risk / Lapsed (Action Required) */}
                <div className="p-space-md rounded-xl bg-error-container/40 hover:bg-error-container/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                      <Icon name="warning" className="text-[22px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          At-Risk / Lapsed Patrons
                        </span>
                        <span className="font-caption text-caption font-bold px-2 py-0.5 rounded-full bg-error text-on-error">
                          Action Required
                        </span>
                      </div>
                      <p className="font-caption text-caption text-error font-medium mt-0.5">
                        {v(`No recent visit • Past spend: ${naira(seg?.lapsed.spend)}`, 'No registered visit in 45+ days • Churn Risk: ₦950k')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-lg justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-heading-sm text-heading-sm font-bold text-error">
                        {v(count(seg?.lapsed.count), '124')} <span className="font-caption text-caption text-text-tertiary font-normal">patrons</span>
                      </div>
                      <div className="font-caption text-caption text-text-secondary font-semibold">Lapsed Pipeline</div>
                    </div>
                    <button
                      className="px-space-md py-2 rounded-xl bg-error text-on-error hover:bg-error/90 font-label-sm text-label-sm font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                      type="button"
                    >
                      <Icon name="replay" className="text-[16px]" />
                      <span>Re-engage with Deal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* MODULE 3: Discovery Radius & Catchment */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex items-center justify-between pb-space-sm">
                <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                  Discovery Radius &amp; Footfall
                </h2>
                <Icon name="near_me" className="text-primary text-[20px]" />
              </div>
              <p className="font-caption text-caption text-text-secondary">
                Geographic catchment of dine-in guests in Abuja municipal area
              </p>

              {/* Interactive Static Map Catchment View */}
              <div className="mt-space-md relative rounded-xl overflow-hidden shadow-xs">
                <div
                  className="w-full h-44 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB18ImB3hPb9_StZvYjkyuR2vZh-0TMI0ClkoAb5urBQUyD8ftyFqI8Pg9HTIQqICsT9GFzCW3ChchDrpgJMAJh_9slOWt7tM901pf1FRl4OgrWtsi7Ic7HulddrquAeRrQclLAPqqw2EVvQxXiI0Ur3iT541NSyNhvCaDrH4zMUByJiqZq3vg1BDv5ediv2EjVoAbXhFNehfJ9l_ZKvS-G0GzJAU9w02SSWBzK63eCaGdy3pb3dp_PbA')",
                  }}
                />
                {/* Catchment Overlay Badge */}
                <div className="absolute bottom-2 left-2 right-2 bg-surface/90 backdrop-blur-md rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
                    <span className="font-caption text-caption font-bold text-on-surface">
                      {v('Epicenter: —', 'Epicenter: Wuse II Flagship')}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-primary font-bold">Primary 5km Core</span>
                </div>
              </div>

              {/* Catchment Distribution Bars */}
              <div className="mt-space-md space-y-space-xs">
                <div className="flex justify-between items-center font-label-sm text-label-sm">
                  <span className="text-on-surface font-semibold">{v('5km Core', '5km Downtown Core (Wuse 2, Maitama, Central)')}</span>
                  <span className="text-primary font-bold">{v('—', '82%')}</span>
                </div>
                {/* Progress Split */}
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: v('0%', '82%') }} />
                  <div className="bg-outline-variant h-full" style={{ width: v('0%', '18%') }} />
                </div>
                <div className="flex justify-between text-text-tertiary font-caption text-caption">
                  <span>{v('Where customers travel from isn’t tracked yet', '82% Hyper-Local Catchment')}</span>
                  <span>{v('', '18% Cross-Town (Garki / Apo)')}</span>
                </div>
              </div>

              {/* Dining Format Breakdown */}
              <div className="grid grid-cols-2 gap-space-sm mt-space-md pt-space-md border-t-0 bg-surface-subtle p-space-sm rounded-xl">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="table_restaurant" className="text-[18px]" />
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm font-bold text-on-surface">{v('Dine-In —', 'Dine-In 74%')}</div>
                    <div className="font-caption text-caption text-text-tertiary">{v('Dwell time —', 'Avg 52m dwell time')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-low text-text-secondary flex items-center justify-center shrink-0">
                    <Icon name="takeout_dining" className="text-[18px]" />
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm font-bold text-on-surface">{v('Takeout —', 'Takeout 26%')}</div>
                    <div className="font-caption text-caption text-text-tertiary">Tap &amp; pick speed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 4: Hall of Fame - Top Patron Highlights */}
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
              <div className="flex items-center justify-between pb-space-sm">
                <div>
                  <h2 className="font-heading-sm text-heading-sm font-bold text-on-surface">Hall of Fame</h2>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Top-spending patrons &amp; platform power users
                  </p>
                </div>
                <Icon name="military_tech" className="text-amber-500 text-[22px]" />
              </div>
              <div className="space-y-space-sm mt-space-sm">
                {/* Patron 1: Top Spender */}
                <div className="p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-all flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="relative">
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        alt="Portrait of a sophisticated West African professional male diner wearing clean modern business casual attire smiling in Abuja upscale dining lounge with warm soft ambient lighting"
                        src={v(CUSTOMER_AVATAR, "https://lh3.googleusercontent.com/aida-public/AB6AXuBOYAjP73ox3oOVHbWhD7w1D9VmweMC7F2b_b9EhIBDpIMs3mSZVM3a3BHNUZdlwuX4Pz1ixYftL_3hDeNbW_R7XJQNMALJ6Q7Mw5I-86706EGYWk0tSoO995c6ECCrzlxWODcjhcfPUbDu9L6UNKv7E6jV6R9Tmm-atK_BadHafPYMNE9zLOM1-7JTFKjHy3mxWpdNLT9Hue_u_Xj1k0tB9rJxQL75OpR1hQGGucR4VbwLAqHmDOuQ-Q")}
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-caption text-caption font-bold shadow-xs">
                        #1
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md font-bold text-on-surface">{v(top[0]?.name || '—', 'Michael James')}</span>
                        <span className="px-1.5 py-0.2 rounded font-caption text-caption bg-amber-100 text-amber-800 font-bold">
                          {v(top[0]?.tier ? `${top[0].tier}` : '—', 'VIP Gold')}
                        </span>
                      </div>
                      <div className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                        <Icon name="location_on" className="text-[14px] text-text-tertiary" />
                        <span>{v(top[0] ? `${top[0].visits} visits logged` : '—', 'Maitama local • 14 visits logged')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-md text-label-md font-bold text-primary">{v(top[0] ? naira(top[0].spend) : '—', '₦184,200')}</div>
                    <div className="font-caption text-caption text-text-tertiary">Gross Spend</div>
                  </div>
                </div>

                {/* Patron 2: Deal Champion */}
                <div className="p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-all flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="relative">
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        alt="Portrait of a modern young Nigerian woman smiling joyfully holding a beverage at a chic modern cafe restaurant in Abuja with bright natural daylight"
                        src={v(CUSTOMER_AVATAR, "https://lh3.googleusercontent.com/aida-public/AB6AXuAadt9PRxWMRd6zM1f1VdTplyPG1ODc3if4sBDs9sKrL4u0LrvUc28BrJn30Tv1EEzZ7wvZdbTq4izrebat5RnA3xgh1gnPJITYHy5-XjQ2oqC2nlnyPTImnhCKWDb26QwwdUvYJhggGLeGX7G_616AEiNPc_nKB1t6_6CHTONr1-3h7a_KQ4_qT0ZjMsjQ6l6SGFU-YXhwOGc69Q04JL1WAPXVNlhrd6KAl6V-BAQuelOCa0sG9Qxuow")}
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-badge-discount-text text-white flex items-center justify-center font-caption text-caption font-bold shadow-xs">
                        #2
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md font-bold text-on-surface">{v(top[1]?.name || '—', 'Sarah Adams')}</span>
                        <span className="px-1.5 py-0.2 rounded font-caption text-caption bg-badge-discount-bg text-badge-discount-text font-bold">
                          {v(top[1]?.tier ? `${top[1].tier}` : '—', 'Deal Champion')}
                        </span>
                      </div>
                      <div className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                        <Icon name="confirmation_number" className="text-[14px] text-text-tertiary" />
                        <span>{v(top[1] ? `${top[1].visits} visits logged` : '—', '5 deals unlocked • 8 visits')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-md text-label-md font-bold text-on-surface">{v(top[1] ? naira(top[1].spend) : '—', '₦78,500')}</div>
                    <div className="font-caption text-caption text-text-tertiary">Gross Spend</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE 5: NDPR & Privacy Compliance Guard Banner */}
            <div className="bg-surface-container-low rounded-2xl p-space-md flex items-start gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-surface-canvas text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Icon name="verified_user" className="text-[20px]" />
              </div>
              <div>
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">
                    NDPR &amp; Privacy Compliance Guard
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-bold bg-badge-discount-bg px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-1">
                  Tokenized customer identifiers with explicit consent granted under the Nigeria Data Protection
                  Regulation (NDPR). PII is salted and anonymized across network mirrors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {toast}
        </div>
      )}
    </AnalyticsShell>
  );
}
