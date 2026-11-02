import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, hasApiConfig } from '../services/api/client';
import { downloadCsv } from '../utils/exportCsv';
import { NO_IMAGE } from '../utils/homeOffer';
import { printKvTable, printReport } from '../utils/printReport';
import { useReferralPoints } from './useMyReferrals';

export type SavingsTimeframe = 'month' | 'quarter' | 'all';

export const SAVINGS_TIMEFRAMES: Array<{ key: SavingsTimeframe; label: string }> = [
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'Last 3 Mo' },
  { key: 'all', label: 'All Time' },
];

const DAYS: Record<SavingsTimeframe, number | undefined> = { month: 30, quarter: 90, all: undefined };
/** The most rows `GET /me/savings` returns in one read. */
const PAGE_SIZE = 50;

const CATEGORY_STYLES = [
  { iconClass: 'bg-surface-tint-blue text-primary', barClass: 'bg-primary' },
  { iconClass: 'bg-surface-container text-secondary', barClass: 'bg-secondary-container' },
  { iconClass: 'bg-tertiary-fixed text-tertiary', barClass: 'bg-tertiary-fixed-dim' },
];

const categoryIcon = (name: string): string => {
  const label = name.toLowerCase();
  if (/food|drink|dining|restaurant|beverage|bakery|cafe/.test(label)) return 'restaurant';
  if (/beauty|wellness|spa|salon|health/.test(label)) return 'spa';
  if (/fashion|retail|shop|cloth/.test(label)) return 'shopping_bag';
  return 'storefront';
};

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const num = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const rowsOf = (payload: unknown): unknown[] => {
  const rows = Array.isArray(payload) ? payload : rec(payload).data;
  return Array.isArray(rows) ? rows : [];
};
const naira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
/** The print window renders HTML, and merchant and deal names are free text. */
const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const when = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : `${date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} • ${date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}`;
};

const toItem = (row: unknown) => {
  const entry = rec(row);
  const name = text(entry.merchantName);
  const deal = text(entry.offerName);
  return {
    id: text(entry.id),
    name,
    redeemedAt: new Date(text(entry.redeemedAt)).getTime() || 0,
    time: when(text(entry.redeemedAt)),
    code: text(entry.claimCode),
    saved: naira(num(entry.savedAmount)),
    deal,
    was: naira(num(entry.originalAmount)),
    paid: naira(num(entry.paidAmount)),
    image: text(entry.merchantImageUrl) || NO_IMAGE,
    alt: `${deal} at ${name}`,
    savedAmount: num(entry.savedAmount),
    originalAmount: num(entry.originalAmount),
  };
};

/** Every redemption in the period, so the list, average and export all cover the full ledger. */
const readAll = async (days: number | undefined) => {
  const data: unknown[] = [];
  for (let page = 1; ; page += 1) {
    const payload = await api.get<unknown>('/me/savings', { params: { page, limit: PAGE_SIZE, days } });
    const batch = rowsOf(payload);
    data.push(...batch);
    const total = num(rec(payload).total);
    if (batch.length === 0 || data.length >= total) {
      return { data, total, totalSavedAmount: num(rec(payload).totalSavedAmount) };
    }
  }
};

/**
 * The customer's savings page (desktop + mobile): the redemption ledger from
 * `GET /me/savings`, its category split from `GET /me/savings/categories`, and
 * the statement export, all for the chosen period. Empty without an API.
 */
export function useSavingsLedger(timeframe: SavingsTimeframe) {
  const { authed } = useAuth();
  const enabled = hasApiConfig() && authed;
  const days = DAYS[timeframe];
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const { available: points } = useReferralPoints();

  const ledger = useQuery({
    queryKey: ['savings', 'ledger', timeframe],
    queryFn: () => readAll(days),
    enabled,
  });
  const breakdown = useQuery({
    queryKey: ['savings', 'categories', timeframe],
    queryFn: () => api.get<unknown>('/me/savings/categories', { params: { days } }),
    enabled,
  });

  const allItems = useMemo(() => rowsOf(ledger.data).map(toItem), [ledger.data]);
  const items = useMemo(
    () => [...allItems].sort((a, b) => (sort === 'latest' ? b.redeemedAt - a.redeemedAt : a.redeemedAt - b.redeemedAt)),
    [allItems, sort],
  );
  const categories = useMemo(
    () =>
      rowsOf(breakdown.data).map((row, index) => {
        const entry = rec(row);
        const label = text(entry.name) || 'Other';
        const redemptions = num(entry.redemptions);
        const share = Math.round(num(entry.sharePercent));
        return {
          ...CATEGORY_STYLES[index % CATEGORY_STYLES.length],
          icon: categoryIcon(label),
          label,
          meta: `${redemptions} ${redemptions === 1 ? 'redemption' : 'redemptions'} • ${share}%`,
          amount: naira(num(entry.savedAmount)),
          width: num(entry.sharePercent),
        };
      }),
    [breakdown.data],
  );

  const totalSaved = num(rec(ledger.data).totalSavedAmount);
  const records = num(rec(ledger.data).total);
  const original = allItems.reduce((sum, item) => sum + item.originalAmount, 0);
  const saved = allItems.reduce((sum, item) => sum + item.savedAmount, 0);

  /** Downloads the period's full ledger as CSV and opens the print statement; resolves to the row count. */
  const exportStatement = (): number => {
    const rows = allItems;
    if (rows.length === 0) return 0;

    const period = SAVINGS_TIMEFRAMES.find((item) => item.key === timeframe)?.label ?? 'All Time';
    downloadCsv(
      'vemtap-savings-statement.csv',
      ['Merchant', 'Redeemed', 'Code', 'Deal', 'Was', 'Paid', 'Saved'],
      rows.map((item) => [item.name, item.time, item.code, item.deal, item.was, item.paid, item.saved]),
    );
    printReport(
      `VEMTAP Savings Statement — ${period}`,
      `${printKvTable('Statement', [
        ['Period', period],
        ['Total saved', naira(totalSaved)],
        ['Redemptions', `${rows.length}`],
      ])}
       ${printKvTable(
         'Redemptions',
         rows.map((item) => [esc(`${item.name} — ${item.time}`), esc(`${item.deal} • paid ${item.paid} (was ${item.was}) • saved ${item.saved} • ${item.code}`)] as [string, string]),
       )}
       ${printKvTable(
         'By category',
         categories.map((category) => [esc(category.label), `${category.amount} — ${category.meta}`] as [string, string]),
       )}
       <p class="foot">A CSV copy of this statement downloaded alongside the PDF.</p>`,
    );
    return rows.length;
  };

  return {
    loading: ledger.isLoading || breakdown.isLoading,
    failed: ledger.isError,
    retry: () => {
      void ledger.refetch();
      void breakdown.refetch();
    },
    totalLabel: ledger.isSuccess ? naira(totalSaved) : '—',
    records,
    avgDiscount: original > 0 ? Math.round((saved / original) * 100) : 0,
    points,
    categories,
    items,
    sort,
    toggleSort: () => setSort((current) => (current === 'latest' ? 'oldest' : 'latest')),
    exportStatement,
  };
}
