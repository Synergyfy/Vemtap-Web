import { useState, type ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { BarChart } from './BarChart';
import { ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useBusinessAnalytics } from '../../hooks/business/useBusinessAnalytics';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import type {
  Comparison,
  CustomersAnalytics,
  DealsAnalytics,
  LocationsAnalytics,
  OverviewAnalytics,
  PosAnalytics,
} from '../../services/businessAnalyticsService';
import { formatNaira } from '../../utils/format';

export type IntelligenceTab = 'business' | 'customers' | 'deals' | 'locations' | 'pos';

const RANGES = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
] as const;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pct = (ratio: number) => (Math.abs(ratio) < 0.1 && ratio !== 0 ? `${(ratio * 100).toFixed(1)}%` : `${Math.round(ratio * 100)}%`);
const num = (value: number) => Math.round(value).toLocaleString('en-NG');
const hourLabel = (hour: number) => `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
const change = (c: Comparison) => (c.previous ? (c.current - c.previous) / c.previous : 0);

interface Insight {
  icon: string;
  title: string;
  body: string;
  tone?: 'good' | 'warn';
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function Delta({ value, inverse = false }: { value: number; inverse?: boolean }) {
  if (!Number.isFinite(value) || value === 0) return <span className="font-caption text-caption text-text-tertiary">No change</span>;
  const good = inverse ? value < 0 : value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-caption text-caption font-medium ${good ? 'text-badge-discount-text' : 'text-red-600'}`}>
      <Icon name={value > 0 ? 'trending_up' : 'trending_down'} className="text-[14px]" />
      {value > 0 ? '+' : ''}
      {Math.round(value * 100)}% vs previous
    </span>
  );
}

function Kpi({ label, value, delta, inverse }: { label: string; value: string; delta?: number; inverse?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-sm flex flex-col gap-1 min-w-0">
      <span className="font-label-sm text-label-sm text-text-secondary truncate">{label}</span>
      <span className="font-heading-md text-heading-md text-text-primary font-semibold truncate">{value}</span>
      {typeof delta === 'number' ? <Delta value={delta} inverse={inverse} /> : null}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm min-w-0">
      <header className="flex flex-col">
        <h3 className="font-heading-sm text-heading-sm text-text-primary">{title}</h3>
        {subtitle ? <span className="font-caption text-caption text-text-secondary">{subtitle}</span> : null}
      </header>
      {children}
    </section>
  );
}

function Insights({ items }: { items: Insight[] }) {
  return (
    <Panel title="Vemtap Intelligence" subtitle="What stands out in this period">
      {!items.length ? (
        <p className="font-caption text-caption text-text-secondary">
          Not enough activity in this period yet. Insights appear once customers start claiming, ordering and visiting.
        </p>
      ) : null}
      <ul className="flex flex-col gap-space-xs">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-space-sm rounded-lg bg-surface-subtle p-space-sm">
            <span
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                item.tone === 'warn'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  : item.tone === 'good'
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-surface-tint-blue text-primary'
              }`}
            >
              <Icon name={item.icon} className="text-[18px]" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-primary font-semibold">{item.title}</span>
              <span className="font-caption text-caption text-text-secondary">{item.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RankedList({
  rows,
  empty = 'Nothing to show for this period yet.',
}: {
  rows: { key: string; label: string; value: string; share: number; sub?: string }[];
  empty?: string;
}) {
  if (!rows.length) return <p className="font-caption text-caption text-text-secondary">{empty}</p>;
  return (
    <ul className="flex flex-col gap-space-sm">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-primary truncate">{row.label}</span>
              {row.sub ? <span className="font-caption text-caption text-text-tertiary truncate">{row.sub}</span> : null}
            </span>
            <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">{row.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
            <div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.round(row.share * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const grid = 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-space-lg items-start';
const kpiGrid = 'grid grid-cols-2 lg:grid-cols-4 gap-space-sm';

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function BusinessView({ data }: { data: OverviewAnalytics }) {
  // Peaks only mean something once there is activity to rank.
  const peak = [...data.hourly].sort((a, b) => b.orders - a.orders).find((h) => h.orders > 0);
  const bestDay = [...data.weekdays].sort((a, b) => b.revenue - a.revenue).find((d) => d.revenue > 0);
  const revenueChange = change(data.revenue);
  const days = data.series.length;
  const insights: Insight[] = [
    (data.revenue.current > 0 || data.revenue.previous > 0) && {
      icon: revenueChange >= 0 ? 'trending_up' : 'trending_down',
      tone: revenueChange >= 0 ? 'good' : 'warn',
      title: `Revenue ${revenueChange >= 0 ? 'up' : 'down'} ${pct(Math.abs(revenueChange))}`,
      body: `${formatNaira(data.revenue.current)} over ${days} days against ${formatNaira(data.revenue.previous)} the period before.`,
    },
    peak && {
      icon: 'schedule',
      title: `Busiest at ${hourLabel(peak.hour)}`,
      body: `${num(peak.orders)} orders land in that hour. Schedule staff and kitchen prep around it.`,
    },
    bestDay && {
      icon: 'calendar_month',
      title: `${WEEKDAYS[bestDay.dow]}s earn the most`,
      body: `${formatNaira(bestDay.revenue)} across the period. A deal on your quietest day can even out the week.`,
    },
    data.topDeal && data.topDeal.claims > 0 && {
      icon: 'local_offer',
      title: `${data.topDeal.name} drives ${pct(data.topDeal.share)} of claims`,
      body: `${num(data.topDeal.claims)} claims${data.topDeal.branchName ? ` at ${data.topDeal.branchName}` : ''}. Consider boosting it.`,
    },
  ].filter(Boolean) as Insight[];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className={kpiGrid}>
        <Kpi label="Revenue" value={formatNaira(data.revenue.current)} delta={revenueChange} />
        <Kpi label="Orders" value={num(data.orders.current)} delta={change(data.orders)} />
        <Kpi label="Avg order value" value={formatNaira(data.averageOrderValue.current)} delta={change(data.averageOrderValue)} />
        <Kpi label="Interactions" value={num(data.interactions.current)} delta={change(data.interactions)} />
      </div>
      <div className={grid}>
        <div className="flex flex-col gap-space-lg min-w-0">
          <Panel title="Daily revenue">
            <BarChart
              ariaLabel="Daily revenue"
              data={data.series.map((d) => ({
                key: d.date,
                label: new Date(d.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                value: d.revenue,
              }))}
              format={formatNaira}
              labelEvery={Math.max(1, Math.ceil(data.series.length / 6))}
            />
          </Panel>
          <Panel title="Orders by hour" subtitle="Africa/Lagos time">
            <BarChart
              ariaLabel="Orders by hour"
              data={data.hourly.map((h) => ({ key: String(h.hour), label: hourLabel(h.hour), value: h.orders }))}
              format={(v) => `${num(v)} orders`}
              labelEvery={4}
              height={120}
              highlightKey={peak ? String(peak.hour) : undefined}
            />
          </Panel>
        </div>
        <div className="flex flex-col gap-space-lg">
          <Insights items={insights} />
          <Panel title="Top items">
            <RankedList
              empty="No items sold in this period yet."
              rows={data.topItems.map((item) => ({
                key: item.name,
                label: item.name,
                sub: `${num(item.quantity)} sold · ${pct(item.dealShare)} via deals`,
                value: formatNaira(item.revenue),
                share: item.revenue / Math.max(1, data.topItems[0]?.revenue ?? 1),
              }))}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CustomersView({ data }: { data: CustomersAnalytics }) {
  const repeatDelta = data.repeatRate.current - data.repeatRate.previous;
  const insights: Insight[] = [
    data.active.current > 0 && {
      icon: 'autorenew',
      tone: repeatDelta >= 0 ? 'good' : 'warn',
      title: `Repeat rate ${pct(data.repeatRate.current)}`,
      body: `${repeatDelta >= 0 ? 'Up' : 'Down'} ${Math.abs(Math.round(repeatDelta * 100))} points on the previous period.`,
    },
    data.segments.lapsed.count > 0 && {
      icon: 'person_off',
      tone: 'warn',
      title: `${num(data.segments.lapsed.count)} customers have lapsed`,
      body: 'No visit in 90+ days. A win-back segment with a time-limited deal is the cheapest growth you have.',
    },
    data.topCustomers[0] && data.topCustomers[0].spend > 0 && {
      icon: 'workspace_premium',
      title: `${data.topCustomers[0].name} is your top customer`,
      body: `${formatNaira(data.topCustomers[0].spend)} across ${data.topCustomers[0].visits} visits this period.`,
    },
  ].filter(Boolean) as Insight[];

  const segments = (['vip', 'regular', 'new', 'lapsed'] as const).map((key) => ({ key, ...data.segments[key] }));
  const segmentLabel = { vip: 'VIP', regular: 'Regular', new: 'New', lapsed: 'Lapsed' } as const;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className={kpiGrid}>
        <Kpi label="Active customers" value={num(data.active.current)} delta={change(data.active)} />
        <Kpi label="New customers" value={num(data.new.current)} delta={change(data.new)} />
        <Kpi label="Average spend" value={formatNaira(data.averageSpend)} />
        <Kpi label="Dormant (90d+)" value={num(data.dormant.current)} delta={change(data.dormant)} inverse />
      </div>
      <div className={grid}>
        <div className="flex flex-col gap-space-lg min-w-0">
          <Panel title="New customers per week">
            <BarChart
              ariaLabel="New customers per week"
              data={data.growth.map((g) => ({
                key: g.weekStart,
                label: new Date(g.weekStart).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                value: g.new,
              }))}
              format={(v) => `${num(v)} new`}
              labelEvery={Math.max(1, Math.ceil(data.growth.length / 6))}
            />
          </Panel>
          <Panel title="Segments">
            <RankedList
              rows={segments.map((s) => ({
                key: s.key,
                label: segmentLabel[s.key],
                sub: `${num(s.count)} customers · ${formatNaira(s.spend)} spend`,
                value: pct(s.share),
                share: s.share,
              }))}
            />
          </Panel>
        </div>
        <div className="flex flex-col gap-space-lg">
          <Insights items={insights} />
          <Panel title="Top customers">
            <RankedList
              empty="No customer spend in this period yet."
              rows={data.topCustomers.map((c) => ({
                key: c.userId,
                label: c.name,
                sub: `${c.visits} visits${c.tier ? ` · ${c.tier}` : ''}`,
                value: formatNaira(c.spend),
                share: c.spend / Math.max(1, data.topCustomers[0]?.spend ?? 1),
              }))}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DealsView({ data }: { data: DealsAnalytics }) {
  const best = [...data.deals].sort((a, b) => b.claimRate - a.claimRate).find((d) => d.claims > 0);
  const slipping = data.deals.find((d) => d.claims < d.previousClaims);
  const redeemRate = data.funnel.claims ? data.funnel.redeemed / data.funnel.claims : 0;
  const insights: Insight[] = [
    best && { icon: 'star', tone: 'good', title: `${best.name} converts best`, body: `${pct(best.claimRate)} of viewers claim it.` },
    slipping && {
      icon: 'trending_down',
      tone: 'warn',
      title: `${slipping.name} is slowing`,
      body: `${num(slipping.claims)} claims, down from ${num(slipping.previousClaims)}. Refresh the image or terms, or boost it.`,
    },
    data.funnel.claims > 0 && {
      icon: 'task_alt',
      title: `${pct(redeemRate)} of claims are redeemed`,
      body: 'Unredeemed claims are customers who meant to come — a reminder push can recover some.',
    },
  ].filter(Boolean) as Insight[];

  const funnel = [
    { key: 'views', label: 'Views', value: data.funnel.views },
    { key: 'saves', label: 'Saves', value: data.funnel.saves },
    { key: 'claims', label: 'Claims', value: data.funnel.claims },
    { key: 'redeemed', label: 'Redeemed', value: data.funnel.redeemed },
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className={kpiGrid}>
        <Kpi label="Claims" value={num(data.totals.claims.current)} delta={change(data.totals.claims)} />
        <Kpi label="Redeemed" value={num(data.totals.redeemed)} />
        <Kpi label="Deal revenue" value={formatNaira(data.totals.revenue)} />
        <Kpi label="Live deals" value={`${data.totals.live}`} />
      </div>
      <div className={grid}>
        <div className="flex flex-col gap-space-lg min-w-0">
          <Panel title="Funnel" subtitle="Views and saves are lifetime">
            <RankedList
              rows={funnel.map((step) => ({
                key: step.key,
                label: step.label,
                value: num(step.value),
                share: step.value / Math.max(1, funnel[0].value),
              }))}
            />
          </Panel>
          <Panel title="Deals by claims">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-body-md">
                <thead className="font-label-sm text-label-sm text-text-secondary">
                  <tr>
                    <th className="py-space-xs pr-space-sm font-medium">Deal</th>
                    <th className="py-space-xs px-space-sm font-medium text-right">Claims</th>
                    <th className="py-space-xs px-space-sm font-medium text-right">Redeemed</th>
                    <th className="py-space-xs px-space-sm font-medium text-right">Claim rate</th>
                    <th className="py-space-xs pl-space-sm font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.deals.length ? (
                    <tr>
                      <td colSpan={5} className="py-space-sm font-caption text-caption text-text-secondary">
                        No deal activity in this period yet.
                      </td>
                    </tr>
                  ) : null}
                  {data.deals.map((deal) => (
                    <tr key={deal.id} className="border-t border-border-subtle">
                      <td className="py-space-xs pr-space-sm text-text-primary">{deal.name}</td>
                      <td className="py-space-xs px-space-sm text-right">{num(deal.claims)}</td>
                      <td className="py-space-xs px-space-sm text-right">{num(deal.redeemed)}</td>
                      <td className="py-space-xs px-space-sm text-right">{pct(deal.claimRate)}</td>
                      <td className="py-space-xs pl-space-sm text-right">{formatNaira(deal.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <Insights items={insights} />
      </div>
    </div>
  );
}

function LocationsView({ data }: { data: LocationsAnalytics }) {
  const [best, ...rest] = data.branches;
  const laggard = best && best.revenue.current > 0 ? rest.sort((a, b) => a.percentOfBest - b.percentOfBest)[0] : undefined;
  const insights: Insight[] = [
    best && best.revenue.current > 0 && { icon: 'emoji_events', tone: 'good', title: `${best.name} leads`, body: `${pct(best.revenueShare)} of revenue, ${formatNaira(best.averageOrderValue)} average order.` },
    laggard && {
      icon: 'insights',
      tone: 'warn',
      title: `${laggard.name} is at ${pct(laggard.percentOfBest)} of your best`,
      body: 'Assign your top deal to this branch or run a local campaign to close the gap.',
    },
  ].filter(Boolean) as Insight[];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className={kpiGrid}>
        <Kpi label="Branches" value={`${data.totals.branches}`} />
        <Kpi label="Revenue" value={formatNaira(data.totals.revenue.current)} delta={change(data.totals.revenue)} />
        <Kpi label="Orders" value={num(data.totals.orders)} />
        <Kpi label="Visits" value={num(data.totals.visits)} />
      </div>
      <div className={grid}>
        <Panel title="Revenue by branch">
          <RankedList
            rows={data.branches.map((b) => ({
              key: b.branchId,
              label: `${b.name}${b.isMainBranch ? ' (main)' : ''}`,
              sub: `${num(b.orders.current)} orders · ${num(b.customers)} customers · ${b.rating?.toFixed(1) ?? '—'}★`,
              value: formatNaira(b.revenue.current),
              share: b.percentOfBest,
            }))}
          />
        </Panel>
        <Insights items={insights} />
      </div>
    </div>
  );
}

function PosView({ data }: { data: PosAnalytics }) {
  const topTender = [...data.tenders].sort((a, b) => b.share - a.share).find((t) => t.amount > 0);
  const peak = [...data.hourly].sort((a, b) => b.sales - a.sales).find((h) => h.sales > 0);
  const insights: Insight[] = [
    topTender && { icon: 'payments', title: `${topTender.method} is the top tender`, body: `${pct(topTender.share)} of sales value.` },
    data.tickets.current > 0 && {
      icon: 'undo',
      tone: data.refunds.rate > 0.02 ? 'warn' : 'good',
      title: `Refund rate ${(data.refunds.rate * 100).toFixed(1)}%`,
      body: `${data.refunds.count} refunds worth ${formatNaira(data.refunds.amount)}.`,
    },
    peak && { icon: 'schedule', title: `Till peaks at ${hourLabel(peak.hour)}`, body: `${formatNaira(peak.sales)} rung up in that hour.` },
  ].filter(Boolean) as Insight[];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className={kpiGrid}>
        <Kpi label="POS sales" value={formatNaira(data.sales.current)} delta={change(data.sales)} />
        <Kpi label="Tickets" value={num(data.tickets.current)} delta={change(data.tickets)} />
        <Kpi label="Avg ticket" value={formatNaira(data.averageTicket.current)} delta={change(data.averageTicket)} />
        <Kpi label="Items per ticket" value={data.itemsPerTicket.toFixed(1)} />
      </div>
      <div className={grid}>
        <div className="flex flex-col gap-space-lg min-w-0">
          <Panel title="Sales by hour" subtitle="Africa/Lagos time">
            <BarChart
              ariaLabel="Sales by hour"
              data={data.hourly.map((h) => ({ key: String(h.hour), label: hourLabel(h.hour), value: h.sales }))}
              format={formatNaira}
              labelEvery={4}
              highlightKey={peak ? String(peak.hour) : undefined}
            />
          </Panel>
          <Panel title="Tenders">
            <RankedList
              rows={data.tenders.map((t) => ({
                key: t.method,
                label: t.method.charAt(0).toUpperCase() + t.method.slice(1),
                sub: `${num(t.count)} payments`,
                value: formatNaira(t.amount),
                share: t.share,
              }))}
            />
          </Panel>
        </div>
        <Insights items={insights} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

const MODULE_FOR_TAB = {
  business: 'overview',
  customers: 'customers',
  deals: 'deals',
  locations: 'locations',
  pos: 'pos',
} as const;

function TabBody({ tab, days }: { tab: IntelligenceTab; days: number }) {
  const { activeBranchId } = useBusinessBranch();
  // Locations compares branches, so it is always business-wide.
  const query = useBusinessAnalytics(MODULE_FOR_TAB[tab], days, tab === 'locations' ? undefined : activeBranchId);
  if (query.isLoading) return <LoadingRows rows={4} label="Loading analytics" />;
  if (query.isError || !query.data)
    return <ErrorState title="Could not load analytics" error={query.error} onRetry={() => query.refetch()} />;
  switch (tab) {
    case 'business':
      return <BusinessView data={query.data as OverviewAnalytics} />;
    case 'customers':
      return <CustomersView data={query.data as CustomersAnalytics} />;
    case 'deals':
      return <DealsView data={query.data as DealsAnalytics} />;
    case 'locations':
      return <LocationsView data={query.data as LocationsAnalytics} />;
    case 'pos':
      return <PosView data={query.data as PosAnalytics} />;
  }
}

/** Vemtap Intelligence: live analytics per area with period comparison and derived insights. */
export function IntelligencePanel({ initialTab = 'business', onExport }: { initialTab?: IntelligenceTab; onExport?: () => void }) {
  const [tab, setTab] = useState<IntelligenceTab>(initialTab);
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('30');

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
        <FilterChips<IntelligenceTab>
          value={tab}
          onChange={setTab}
          options={[
            { key: 'business', label: 'Business' },
            { key: 'customers', label: 'Customers' },
            { key: 'deals', label: 'Deals' },
            { key: 'locations', label: 'Locations' },
            { key: 'pos', label: 'POS' },
          ]}
        />
        <div className="flex items-center gap-space-xs">
        <div className="flex gap-1 p-1 rounded-lg bg-surface-container-low w-fit" role="radiogroup" aria-label="Date range">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={range === option.key}
              onClick={() => setRange(option.key)}
              className={`h-8 px-space-sm rounded-md font-label-sm text-label-sm ${
                range === option.key ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {onExport ? (
          <button type="button" onClick={onExport} className="h-10 px-space-sm rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="download" className="text-[18px]" /> Export
          </button>
        ) : null}
        </div>
      </div>
      <TabBody tab={tab} days={Number(range)} />
    </div>
  );
}
