import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, hasApiConfig } from '../services/api/client';
import { downloadCsv } from '../utils/exportCsv';
import { NO_IMAGE } from '../utils/homeOffer';
import { clearRecentDeals, readRecentDeals, type RecentDeal } from '../utils/recentlyViewed';
import { useTotalSaved } from './useCustomerDashboard';
import { useSessionUser } from './useSessionUser';

export type ActivityPeriod = 'all' | 'month';

export interface ActivityRow {
  id: string;
  kind: string;
  label: string;
  /** Claim: the deal. Order and booking: their own record. Visit: the branch. */
  refId: string;
  merchant: string;
  businessCode: string | null;
  detail: string;
  date: string;
  location: string;
  value: string;
  status: string;
  image: string;
  rating: number | null;
  body: string;
  reply: string;
}

const PAGE_SIZE = 100;
const LABELS: Record<string, string> = {
  claim: 'Deal claimed',
  order: 'Order',
  booking: 'Booking',
  visit: 'Visit',
  review: 'Deal review',
  comment: 'Product review',
};

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const count = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const naira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
const when = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toRow = (raw: unknown): ActivityRow => {
  const row = rec(raw);
  const kind = text(row.kind);
  const status = text(row.status);
  const amount = count(row.amount);
  const title = text(row.title);
  return {
    id: `${kind}-${text(row.id)}`,
    kind,
    label: kind === 'claim' && status === 'redeemed' ? 'Deal redeemed' : LABELS[kind] ?? 'Activity',
    refId: text(row.refId),
    merchant: text(row.businessName) || text(row.branchName) || 'VEMTAP business',
    businessCode: text(row.businessCode) || null,
    detail: title || LABELS[kind] || 'Activity',
    date: when(text(row.at)),
    location: text(row.branchName) || text(row.branchAddress),
    value: amount > 0 ? naira(amount) : '',
    status,
    image: text(row.image) || text(row.businessLogo) || NO_IMAGE,
    rating: row.rating === null || row.rating === undefined ? null : count(row.rating),
    body: text(row.body),
    reply: text(row.reply),
  };
};

const fetchAll = async (from: string | undefined): Promise<ActivityRow[]> => {
  const rows: ActivityRow[] = [];
  for (let page = 1; ; page += 1) {
    const payload = rec(await api.get<unknown>('/me/activity', { params: { page, limit: PAGE_SIZE, from } }));
    const batch = Array.isArray(payload.data) ? payload.data : [];
    rows.push(...batch.map(toRow));
    if (batch.length === 0 || rows.length >= count(payload.total)) return rows;
  }
};

/**
 * The customer's activity page (desktop + mobile): the timeline and counts from
 * `GET /me/activity`, the savings total, and this device's recently viewed deals.
 */
export function useActivityFeed() {
  const { authed } = useAuth();
  const enabled = hasApiConfig() && authed;
  const userId = useSessionUser().data?.id;
  const [period, setPeriod] = useState<ActivityPeriod>('all');
  const [recentTick, setRecentTick] = useState(0);
  const from = useMemo(
    () => (period === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : undefined),
    [period],
  );
  const totalSaved = useTotalSaved();

  const feed = useQuery({ queryKey: ['activity', 'feed', period], queryFn: () => fetchAll(from), enabled });
  const summary = useQuery({
    queryKey: ['activity', 'summary', period],
    queryFn: () => api.get<unknown>('/me/activity/summary', { params: { from } }),
    enabled,
  });

  const rows = feed.data ?? [];
  const recent = useMemo<RecentDeal[]>(() => readRecentDeals(userId), [userId, recentTick]);
  const stat = (key: string) => (summary.isSuccess ? String(count(rec(summary.data)[key])) : '—');

  const exportCsv = () =>
    downloadCsv(
      'vemtap_activity_log',
      ['Type', 'Merchant', 'Detail', 'Date', 'Location', 'Value'],
      rows.map((row) => [row.label, row.merchant, row.detail, row.date, row.location, row.value]),
    );

  return {
    period,
    togglePeriod: () => setPeriod((current) => (current === 'all' ? 'month' : 'all')),
    periodLabel: period === 'all' ? 'All Time' : 'Last 30 Days',
    loading: feed.isLoading,
    failed: feed.isError,
    retry: () => void feed.refetch(),
    stats: [
      { icon: 'account_balance_wallet', value: naira(totalSaved), label: 'Total Saved' },
      { icon: 'local_activity', value: stat('claimed'), label: 'Deals Claimed' },
      { icon: 'storefront', value: stat('businesses'), label: 'Spots Visited' },
    ],
    visits: rows.filter((row) => ['claim', 'order', 'booking', 'visit'].includes(row.kind)),
    reviews: rows.filter((row) => row.kind === 'review' || row.kind === 'comment'),
    recent,
    clearRecent: () => {
      clearRecentDeals(userId);
      setRecentTick((tick) => tick + 1);
    },
    exportCsv,
    canExport: rows.length > 0,
  };
}
