import { useSyncExternalStore } from 'react';
import { hasApiConfig } from '../services/api/client';
import type { AnalyticsModule, DealsAnalytics, OverviewAnalytics } from '../services/businessAnalyticsService';
import { useBusinessAnalytics } from '../hooks/business/useBusinessAnalytics';
import { formatNaira } from '../utils/format';

/**
 * Live analytics shared by the analytics screens: the period and branch the
 * filter screen sets (kept for the session and the next visit), the query for
 * a module under that filter, and the formatting the screens repeat.
 */

export interface AnalyticsFilter {
  /** Preset label as the filter screen shows it ("30 Days", "This Year", …). */
  preset: string;
  /** Whole days the period covers, ending today. */
  days: number;
  /** A live branch id, or null for every branch. */
  branchId: string | null;
}

const STORAGE_KEY = 'vemtap_analytics_filter';
const DEFAULT_FILTER: AnalyticsFilter = { preset: '30 Days', days: 30, branchId: null };

const read = (): AnalyticsFilter => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_FILTER, ...(JSON.parse(stored) as AnalyticsFilter) } : DEFAULT_FILTER;
  } catch {
    return DEFAULT_FILTER;
  }
};

let current: AnalyticsFilter = typeof window === 'undefined' ? DEFAULT_FILTER : read();
const listeners = new Set<() => void>();

export function setAnalyticsFilter(next: Partial<AnalyticsFilter>) {
  current = { ...current, ...next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // storage unavailable — the filter lasts for this session only
  }
  listeners.forEach((listener) => listener());
}

export function useAnalyticsFilter(): AnalyticsFilter {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => DEFAULT_FILTER,
  );
}

/** Days a preset covers; "This Year" counts from 1 January. */
export const presetDays = (preset: string, now = new Date()) => {
  switch (preset) {
    case 'Today':
      return 1;
    case '7 Days':
      return 7;
    case '90 Days':
      return 90;
    case 'This Year':
      return Math.max(1, Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000));
    default:
      return 30;
  }
};

/** "Last 30 days" / "Today" / "This year" for section captions. */
export const periodLabel = (filter: AnalyticsFilter) =>
  filter.preset === 'Today' ? 'Today' : filter.preset === 'This Year' ? 'This year' : `Last ${filter.days} days`;

/** One analytics module under the current filter (disabled in demo mode). */
export function useLiveAnalytics<M extends AnalyticsModule>(module: M) {
  const filter = useAnalyticsFilter();
  const query = useBusinessAnalytics(module, filter.days, filter.branchId ?? undefined);
  return { live: hasApiConfig(), filter, ...query };
}

export const naira = (value?: number | null) => (value == null ? '—' : formatNaira(value));

export const count = (value?: number | null) => (value == null ? '—' : Math.round(value).toLocaleString('en-US'));

/** Percent change between two figures, or null when there is nothing to compare. */
export const change = (comparison?: { current: number; previous: number } | null) =>
  comparison && comparison.previous ? ((comparison.current - comparison.previous) / comparison.previous) * 100 : null;

/** "18.4%" (absolute) for a change badge, or "—". */
export const changeLabel = (comparison?: { current: number; previous: number } | null) => {
  const value = change(comparison);
  return value == null ? '—' : `${Math.abs(value).toFixed(1)}%`;
};

export const isUp = (comparison?: { current: number; previous: number } | null) => (change(comparison) ?? 0) >= 0;

/** 0–100 share, one decimal. */
export const share = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0);

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "6 PM" for an hour of the day. */
export const hourLabel = (hour: number) => {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve} ${suffix}`;
};

type SeriesMetric = 'revenue' | 'orders' | 'visits' | 'customers';

/** The last seven days of a series metric as 0–100 bar heights with day labels. */
export function lastSevenDays(overview: OverviewAnalytics | undefined, metric: SeriesMetric) {
  const rows = (overview?.series ?? []).slice(-7);
  const max = Math.max(1, ...rows.map((row) => row[metric]));
  return {
    days: rows.map((row) => ({
      day: DAY_SHORT[new Date(`${row.date}T12:00:00`).getDay()],
      value: Math.round((row[metric] / max) * 100),
      raw: row[metric],
    })),
    peak: rows.reduce<(typeof rows)[number] | null>((best, row) => (!best || row[metric] > best[metric] ? row : best), null),
  };
}

const SOURCE_LABEL: Record<string, string> = {
  deals: 'Deals & Vouchers',
  visits: 'Walk-in Visits',
  pos: 'In-Store POS',
  orders: 'Online Orders',
  chats: 'Chats',
};

/** Interaction sources as shares of all interactions. */
export const sourceShares = (overview?: OverviewAnalytics) => {
  const sources = overview?.sources ?? [];
  const total = sources.reduce((sum, source) => sum + source.count, 0);
  return sources
    .filter((source) => source.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((source) => ({
      id: source.id,
      name: SOURCE_LABEL[source.id] ?? source.id,
      count: source.count,
      pct: Math.round(share(source.count, total)),
    }));
};

/** The best weekday and hour by revenue, the top deal and the top item, as plain facts. */
export function overviewInsights(overview?: OverviewAnalytics) {
  if (!overview) return [];
  const insights: { icon: string; title: string; meta: string; tag: string }[] = [];
  const weekdayTotal = overview.weekdays.reduce((sum, day) => sum + day.revenue, 0);
  const bestDay = overview.weekdays.reduce<(typeof overview.weekdays)[number] | null>(
    (best, day) => (!best || day.revenue > best.revenue ? day : best),
    null,
  );
  const bestHour = overview.hourly.reduce<(typeof overview.hourly)[number] | null>(
    (best, hour) => (!best || hour.revenue > best.revenue ? hour : best),
    null,
  );
  if (bestDay && bestDay.revenue > 0) {
    insights.push({
      icon: 'trending_up',
      title: `${DAY_LONG[bestDay.dow]} is your strongest day`,
      meta: `${Math.round(share(bestDay.revenue, weekdayTotal))}% of revenue in this period${
        bestHour && bestHour.revenue > 0 ? `; the busiest hour is ${hourLabel(bestHour.hour)}` : ''
      }.`,
      tag: 'Plan staffing',
    });
  }
  if (overview.topDeal) {
    insights.push({
      icon: 'local_offer',
      title: `${overview.topDeal.name} leads your deals`,
      meta: `${overview.topDeal.claims.toLocaleString('en-US')} claims — ${Math.round(overview.topDeal.share * 100)}% of all claims.`,
      tag: 'Keep promo cadence',
    });
  }
  const topItem = overview.topItems[0];
  if (topItem) {
    insights.push({
      icon: 'inventory_2',
      title: `${topItem.name} is your best seller`,
      meta: `${topItem.quantity.toLocaleString('en-US')} sold for ${formatNaira(topItem.revenue)}.`,
      tag: 'Check stock',
    });
  }
  return insights;
}

/** "+18.4%" / "-3.0%" for a change, or "—" when there is nothing to compare. */
export const signedChange = (comparison?: { current: number; previous: number } | null) => {
  const value = change(comparison);
  return value == null ? '—' : `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}%`;
};

/** Neutral tile for items without a photo. */
export const NO_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Cpath d="M11 27l6-7 4 5 3-3 5 5z" fill="%23938f99"/%3E%3Ccircle cx="25" cy="15" r="3" fill="%23938f99"/%3E%3C/svg%3E';

/** "2.9%" from a 0–1 fraction. */
export const percent = (fraction?: number | null) => `${Math.round((fraction ?? 0) * 1000) / 10}%`;

/** The deal analytics screens' KPIs, deal cards, funnel, benchmark and boost line. */
export function dealsView<K extends { label: string; value: string; sub: string }>(
  data: DealsAnalytics | undefined,
  boosts: { totalSpent: number; audienceReached: number; redemptions: number } | undefined,
  kpiTemplates: K[],
) {
  const totals = data?.totals;
  const funnel = data?.funnel;
  const topClaims = Math.max(1, ...(data?.deals ?? []).map((deal) => deal.claims));
  const views = funnel?.views ?? 0;
  return {
    liveCount: count(totals?.live),
    kpis: <K[]>[
      { ...kpiTemplates[0], value: count(totals?.views), sub: `${count(funnel?.saves)} saves` },
      { ...kpiTemplates[1], value: count(totals?.claims.current), sub: `${signedChange(totals?.claims)} · ${count(totals?.redeemed)} redeemed` },
      { ...kpiTemplates[2], value: percent(totals?.claimRate), sub: 'of deal views' },
      { ...kpiTemplates[3], label: 'Ended', value: count(totals?.ended), sub: `${count(totals?.live)} live now` },
    ],
    deals: [...(data?.deals ?? [])]
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 5)
      .map((deal, index) => {
        const top = index === 0 && deal.claims > 0;
        return {
          image: NO_IMAGE,
          name: deal.name,
          meta: `${count(deal.redeemed)} redeemed · ${deal.previousClaims ? `${count(deal.previousClaims)} claims before` : 'new this period'}`,
          views: count(deal.views),
          claims: count(deal.claims),
          rate: percent(deal.claimRate),
          status: top ? 'Top Performer' : deal.live ? 'Active' : 'Ended',
          statusClass: top
            ? 'bg-badge-discount-bg text-badge-discount-text'
            : deal.live
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-high text-text-secondary',
          progress: Math.round((deal.claims / topClaims) * 100),
          orders: naira(deal.revenue),
        };
      }),
    funnelMeta: `${count(funnel?.views)} views → ${count(funnel?.redeemed)} redeemed`,
    funnel: [
      { step: 'Deal Views', value: funnel?.views ?? 0 },
      { step: 'Saves', value: funnel?.saves ?? 0 },
      { step: 'Voucher Claims', value: funnel?.claims ?? 0 },
      { step: 'Redemptions', value: funnel?.redeemed ?? 0, highlight: true },
    ].map((step) => ({
      ...step,
      value: count(step.value),
      pct: views ? percent(step.value / views) : '0%',
      width: views ? `${Math.max(2, Math.round((step.value / views) * 100))}%` : '0%',
    })),
    benchmark: [
      { name: 'Your claim rate', pct: Math.round((totals?.claimRate ?? 0) * 1000) / 10 as number | null, width: percent(totals?.claimRate), bar: 'bg-primary' },
      { name: 'Industry average', pct: null as number | null, width: '0%', bar: 'bg-surface-container-high' },
      { name: 'Top quartile', pct: null as number | null, width: '0%', bar: 'bg-tertiary' },
    ],
    boostLine: `${naira(boosts?.totalSpent)} boost spend reached ${count(boosts?.audienceReached)} customers and drove ${count(boosts?.redemptions)} redemptions.`,
    boostStats: [
      { value: naira(boosts?.totalSpent), label: 'Spent' },
      { value: count(boosts?.audienceReached), label: 'Reach' },
      { value: count(boosts?.redemptions), label: 'Verified' },
    ],
  };
}
