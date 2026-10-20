import { api } from './api/client';
import { withMock } from './mock';

/**
 * `/business-analytics/*` — Owner/Manager with the `analytics` permission.
 * Every route takes `from`/`to` (ISO, `to` exclusive) and optional `branchId`;
 * comparisons are `{ current, previous }` over the previous period of the same
 * length. Amounts are NGN numbers, ratios are 0–1.
 */
export interface Comparison {
  current: number;
  previous: number;
}

export interface AnalyticsRange {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  days: number;
  branchId: string | null;
}

export interface AnalyticsQuery {
  from?: string;
  to?: string;
  branchId?: string;
}

export interface OverviewAnalytics {
  range: AnalyticsRange;
  revenue: Comparison;
  orders: Comparison;
  averageOrderValue: Comparison;
  interactions: Comparison;
  activity: Record<'dealViews' | 'visits' | 'claims' | 'redemptions' | 'saves' | 'chats' | 'reviews' | 'newCustomers' | 'returningCustomers', number>;
  redemptionRate: number;
  customers: { active: number; new: number; returning: number; repeatRate: number; previousActive: number; previousNew: number };
  channels: { id: 'pos' | 'orders'; revenue: number; orders: number }[];
  sources: { id: 'deals' | 'visits' | 'pos' | 'orders' | 'chats'; count: number }[];
  series: { date: string; revenue: number; orders: number; visits: number; customers: number; previousRevenue: number }[];
  hourly: { hour: number; orders: number; revenue: number }[];
  weekdays: { dow: number; revenue: number; orders: number }[];
  topDeal: { name: string; branchName: string | null; claims: number; share: number } | null;
  topItems: { name: string; quantity: number; revenue: number; dealShare: number }[];
  branchCount: number;
}

export interface CustomersAnalytics {
  range: AnalyticsRange;
  total: Comparison;
  active: Comparison;
  new: Comparison;
  dormant: Comparison;
  repeatRate: Comparison;
  returning: number;
  averageSpend: number;
  visitsPerActiveCustomer: number;
  segments: Record<'vip' | 'regular' | 'new' | 'lapsed', { count: number; share: number; spend: number }>;
  growth: { weekStart: string; new: number; returning: number }[];
  topCustomers: { userId: string; name: string; visits: number; spend: number; lastVisitAt: string | null; tier: string | null }[];
}

export interface DealsAnalytics {
  range: AnalyticsRange;
  totals: { views: number; claims: Comparison; redeemed: number; revenue: number; claimRate: number; live: number; ended: number };
  funnel: { views: number; saves: number; claims: number; redeemed: number };
  deals: { id: string; name: string; live: boolean; views: number; claims: number; previousClaims: number; redeemed: number; revenue: number; claimRate: number }[];
}

export interface PosAnalytics {
  range: AnalyticsRange;
  sales: Comparison;
  tickets: Comparison;
  averageTicket: Comparison;
  itemsSold: number;
  itemsPerTicket: number;
  tips: number;
  discounts: number;
  refunds: { count: number; amount: number; rate: number };
  hourly: { hour: number; sales: number; tickets: number }[];
  tenders: { method: string; count: number; amount: number; share: number }[];
  topItems: { name: string; quantity: number; revenue: number; tickets: number }[];
}

export interface LocationsAnalytics {
  range: AnalyticsRange;
  totals: { branches: number; revenue: Comparison; orders: number; visits: number; dealViews: number };
  branches: {
    branchId: string;
    name: string;
    isMainBranch: boolean;
    revenue: Comparison;
    orders: Comparison;
    averageOrderValue: number;
    customers: number;
    visits: number;
    claims: number;
    rating: number | null;
    revenueShare: number;
    percentOfBest: number;
  }[];
}

export type AnalyticsModule = 'overview' | 'customers' | 'deals' | 'pos' | 'locations';

export interface AnalyticsByModule {
  overview: OverviewAnalytics;
  customers: CustomersAnalytics;
  deals: DealsAnalytics;
  pos: PosAnalytics;
  locations: LocationsAnalytics;
}

// ---------------------------------------------------------------------------
// Demo data — deterministic per range so charts don't flicker between renders.
// ---------------------------------------------------------------------------

const seeded = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const cmp = (current: number, change: number): Comparison => ({ current, previous: Math.round(current / (1 + change)) });

const mockRange = (query: AnalyticsQuery): AnalyticsRange => {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 86_400_000);
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    previousFrom: new Date(from.getTime() - days * 86_400_000).toISOString(),
    previousTo: from.toISOString(),
    days,
    branchId: query.branchId ?? null,
  };
};

function mockAnalytics<M extends AnalyticsModule>(module: M, query: AnalyticsQuery): AnalyticsByModule[M] {
  const range = mockRange(query);
  const rand = seeded(range.days * 31 + (query.branchId?.length ?? 0));
  const scale = range.days / 30;
  const series = Array.from({ length: range.days }, (_, index) => {
    const date = new Date(new Date(range.from).getTime() + index * 86_400_000);
    const weekend = date.getDay() === 5 || date.getDay() === 6;
    const revenue = Math.round((90_000 + rand() * 60_000) * (weekend ? 1.45 : 1));
    return {
      date: date.toISOString().slice(0, 10),
      revenue,
      orders: Math.round(revenue / 6_800),
      visits: Math.round(40 + rand() * 30),
      customers: Math.round(18 + rand() * 14),
      previousRevenue: Math.round(revenue * (0.82 + rand() * 0.2)),
    };
  });
  const revenue = series.reduce((sum, d) => sum + d.revenue, 0);
  const orders = series.reduce((sum, d) => sum + d.orders, 0);
  const hourly = Array.from({ length: 24 }, (_, hour) => {
    const peak = hour >= 12 && hour <= 14 ? 2.6 : hour >= 18 && hour <= 21 ? 3.1 : hour >= 9 && hour <= 22 ? 1 : 0.05;
    const hourOrders = Math.round((orders / 30) * peak * (0.8 + rand() * 0.4));
    return { hour, orders: hourOrders, revenue: hourOrders * 6_800, sales: hourOrders * 6_800, tickets: hourOrders };
  });
  const weekdays = Array.from({ length: 7 }, (_, dow) => {
    const days = series.filter((d) => new Date(d.date).getDay() === dow);
    return { dow, revenue: days.reduce((s, d) => s + d.revenue, 0), orders: days.reduce((s, d) => s + d.orders, 0) };
  });

  const data: AnalyticsByModule = {
    overview: {
      range,
      revenue: cmp(revenue, 0.14),
      orders: cmp(orders, 0.09),
      averageOrderValue: cmp(Math.round(revenue / orders), 0.05),
      interactions: cmp(Math.round(2_400 * scale), 0.21),
      activity: {
        dealViews: 18_420,
        visits: Math.round(1_350 * scale),
        claims: Math.round(312 * scale),
        redemptions: Math.round(204 * scale),
        saves: Math.round(188 * scale),
        chats: Math.round(64 * scale),
        reviews: Math.round(21 * scale),
        newCustomers: Math.round(96 * scale),
        returningCustomers: Math.round(171 * scale),
      },
      redemptionRate: 0.65,
      customers: { active: Math.round(267 * scale), new: Math.round(96 * scale), returning: Math.round(171 * scale), repeatRate: 0.64, previousActive: Math.round(240 * scale), previousNew: Math.round(101 * scale) },
      channels: [
        { id: 'pos', revenue: Math.round(revenue * 0.72), orders: Math.round(orders * 0.7) },
        { id: 'orders', revenue: Math.round(revenue * 0.28), orders: Math.round(orders * 0.3) },
      ],
      sources: [
        { id: 'pos', count: Math.round(orders * 0.7) },
        { id: 'deals', count: Math.round(312 * scale) },
        { id: 'visits', count: Math.round(1_350 * scale) },
        { id: 'orders', count: Math.round(orders * 0.3) },
        { id: 'chats', count: Math.round(64 * scale) },
      ],
      series,
      hourly,
      weekdays,
      topDeal: { name: 'Woodfire Ribeye Combo', branchName: 'Wuse II', claims: Math.round(118 * scale), share: 0.38 },
      topItems: [
        { name: 'Woodfire Ribeye', quantity: Math.round(212 * scale), revenue: Math.round(3_074_000 * scale), dealShare: 0.41 },
        { name: 'Jollof Rice', quantity: Math.round(388 * scale), revenue: Math.round(1_358_000 * scale), dealShare: 0.12 },
        { name: 'Chapman', quantity: Math.round(301 * scale), revenue: Math.round(541_800 * scale), dealShare: 0.05 },
      ],
      branchCount: 2,
    },
    customers: {
      range,
      total: cmp(2_140, 0.06),
      active: cmp(Math.round(267 * scale), 0.11),
      new: cmp(Math.round(96 * scale), -0.05),
      dormant: cmp(412, 0.03),
      repeatRate: { current: 0.64, previous: 0.58 },
      returning: Math.round(171 * scale),
      averageSpend: 21_400,
      visitsPerActiveCustomer: 2.3,
      segments: {
        vip: { count: 86, share: 0.04, spend: 4_920_000 },
        regular: { count: 640, share: 0.3, spend: 6_210_000 },
        new: { count: 1_002, share: 0.47, spend: 2_180_000 },
        lapsed: { count: 412, share: 0.19, spend: 0 },
      },
      growth: Array.from({ length: Math.max(1, Math.round(range.days / 7)) }, (_, index) => ({
        weekStart: new Date(new Date(range.from).getTime() + index * 7 * 86_400_000).toISOString().slice(0, 10),
        new: Math.round(18 + rand() * 12),
        returning: Math.round(30 + rand() * 18),
      })),
      topCustomers: [
        { userId: 'u1', name: 'Tunde Bakare', visits: 14, spend: 312_000, lastVisitAt: new Date().toISOString(), tier: 'Gold' },
        { userId: 'u2', name: 'Amaka Obi', visits: 11, spend: 254_500, lastVisitAt: new Date().toISOString(), tier: 'Gold' },
        { userId: 'u3', name: 'Chidi Eze', visits: 9, spend: 198_000, lastVisitAt: new Date().toISOString(), tier: 'Silver' },
      ],
    },
    deals: {
      range,
      totals: { views: 18_420, claims: cmp(Math.round(312 * scale), 0.18), redeemed: Math.round(204 * scale), revenue: Math.round(4_210_000 * scale), claimRate: 0.017, live: 3, ended: 5 },
      funnel: { views: 18_420, saves: 1_310, claims: Math.round(312 * scale), redeemed: Math.round(204 * scale) },
      deals: [
        { id: 'dg-1', name: 'Woodfire Ribeye Combo', live: true, views: 7_820, claims: Math.round(118 * scale), previousClaims: Math.round(92 * scale), redeemed: Math.round(84 * scale), revenue: Math.round(1_554_000 * scale), claimRate: 0.015 },
        { id: 'dg-2', name: 'Weekend Brunch for Two', live: true, views: 6_110, claims: Math.round(104 * scale), previousClaims: Math.round(110 * scale), redeemed: Math.round(66 * scale), revenue: Math.round(1_584_000 * scale), claimRate: 0.017 },
        { id: 'dg-3', name: '20% off Grills', live: true, views: 4_490, claims: Math.round(90 * scale), previousClaims: Math.round(61 * scale), redeemed: Math.round(54 * scale), revenue: Math.round(648_000 * scale), claimRate: 0.02 },
      ],
    },
    pos: {
      range,
      sales: cmp(Math.round(revenue * 0.72), 0.12),
      tickets: cmp(Math.round(orders * 0.7), 0.08),
      averageTicket: cmp(Math.round((revenue * 0.72) / (orders * 0.7)), 0.04),
      itemsSold: Math.round(orders * 0.7 * 3.1),
      itemsPerTicket: 3.1,
      tips: Math.round(revenue * 0.02),
      discounts: Math.round(revenue * 0.05),
      refunds: { count: 6, amount: 48_500, rate: 0.006 },
      hourly,
      tenders: [
        { method: 'card', count: Math.round(orders * 0.35), amount: Math.round(revenue * 0.38), share: 0.38 },
        { method: 'transfer', count: Math.round(orders * 0.25), amount: Math.round(revenue * 0.22), share: 0.22 },
        { method: 'cash', count: Math.round(orders * 0.1), amount: Math.round(revenue * 0.12), share: 0.12 },
      ],
      topItems: [
        { name: 'Woodfire Ribeye', quantity: Math.round(160 * scale), revenue: Math.round(2_320_000 * scale), tickets: Math.round(150 * scale) },
        { name: 'Jollof Rice', quantity: Math.round(300 * scale), revenue: Math.round(1_050_000 * scale), tickets: Math.round(220 * scale) },
      ],
    },
    locations: {
      range,
      totals: { branches: 2, revenue: cmp(revenue, 0.14), orders, visits: Math.round(1_350 * scale), dealViews: 18_420 },
      branches: [
        { branchId: 'wuse-ii', name: 'Wuse II Branch', isMainBranch: true, revenue: cmp(Math.round(revenue * 0.62), 0.18), orders: cmp(Math.round(orders * 0.6), 0.1), averageOrderValue: 7_100, customers: Math.round(170 * scale), visits: Math.round(820 * scale), claims: Math.round(190 * scale), rating: 4.7, revenueShare: 0.62, percentOfBest: 1 },
        { branchId: 'vi', name: 'Victoria Island Branch', isMainBranch: false, revenue: cmp(Math.round(revenue * 0.38), 0.07), orders: cmp(Math.round(orders * 0.4), 0.06), averageOrderValue: 6_300, customers: Math.round(97 * scale), visits: Math.round(530 * scale), claims: Math.round(122 * scale), rating: 4.4, revenueShare: 0.38, percentOfBest: 0.61 },
      ],
    },
  };
  return data[module];
}

export type ExportModule = 'overview' | 'customers' | 'deals' | 'locations' | 'pos' | 'audit';

export interface AnalyticsExportInput extends AnalyticsQuery {
  format?: 'csv' | 'pdf';
  /** Sections to include; the API defaults to all of them. */
  modules?: ExportModule[];
}

export interface AnalyticsExportFile {
  filename: string;
  mimeType: string;
  contentBase64: string;
  sizeBytes?: number;
  records?: number;
}

export const businessAnalyticsService = {
  /** `POST /business-analytics/export` — the report comes back base64-encoded. */
  export: (input: AnalyticsExportInput) => api.post<AnalyticsExportFile>('/business-analytics/export', input),

  get: <M extends AnalyticsModule>(module: M, query: AnalyticsQuery) =>
    withMock(
      () => api.get<AnalyticsByModule[M]>(`/business-analytics/${module}`, { params: { ...query } }),
      () => mockAnalytics(module, query),
    ),
};
