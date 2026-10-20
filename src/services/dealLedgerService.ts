import { api } from './api/client';
import { withMock } from './mock';

export type DealLedgerStatus = 'claimed' | 'redeemed' | 'expired';

/** One claim in `GET /catalogue/offers/ledger`. Contact arrives already masked. */
export interface DealLedgerRow {
  id: string;
  claimCode: string;
  status: DealLedgerStatus;
  customerName: string;
  contact?: string | null;
  dealName: string;
  dealGroupId: string;
  offerId: string;
  branchId: string;
  branchName?: string | null;
  /** Decimals may arrive as strings — read them through `toAmount`. */
  amount: number | string;
  discountGiven: number | string;
  claimedAt: string;
  redeemedAt?: string | null;
  expiresAt?: string | null;
  /** Redemption time when redeemed, otherwise claim time. */
  activityAt: string;
}

export interface DealLedgerPage {
  data: DealLedgerRow[];
  total?: number | null;
  page?: number | null;
  limit?: number | null;
  /** Over every claim matching branch/deal/date, regardless of status. */
  totals: {
    claims?: number | null;
    redeemed?: number | null;
    expired?: number | null;
    netRevenue: number | string;
    discountGiven: number | string;
  };
}

export interface DealLedgerQuery {
  status?: DealLedgerStatus;
  branchId?: string;
  dealGroupId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const toAmount = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value ?? 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const MOCK_ROWS: DealLedgerRow[] = [
  { id: 'cl-1', claimCode: 'VT-8F2K', status: 'redeemed', customerName: 'Tunde Bakare', contact: '+234 •••• •• 4821', dealName: 'Woodfire Ribeye Combo', dealGroupId: 'dg-1', offerId: 'of-1', branchId: 'wuse-ii', branchName: 'Wuse II', amount: 18500, discountGiven: 4500, claimedAt: hoursAgo(30), redeemedAt: hoursAgo(2), activityAt: hoursAgo(2) },
  { id: 'cl-2', claimCode: 'VT-3QX9', status: 'claimed', customerName: 'Amaka Obi', contact: 'am•••@gmail.com', dealName: 'Weekend Brunch for Two', dealGroupId: 'dg-2', offerId: 'of-2', branchId: 'wuse-ii', branchName: 'Wuse II', amount: 24000, discountGiven: 6000, claimedAt: hoursAgo(5), expiresAt: hoursAgo(-72), activityAt: hoursAgo(5) },
  { id: 'cl-3', claimCode: 'VT-7M1D', status: 'redeemed', customerName: 'Chidi Eze', contact: '+234 •••• •• 1190', dealName: '20% off Grills', dealGroupId: 'dg-3', offerId: 'of-3', branchId: 'vi', branchName: 'Victoria Island', amount: 12000, discountGiven: 2400, claimedAt: hoursAgo(50), redeemedAt: hoursAgo(26), activityAt: hoursAgo(26) },
  { id: 'cl-4', claimCode: 'VT-2PL4', status: 'expired', customerName: 'Funke A.', contact: null, dealName: 'Weekend Brunch for Two', dealGroupId: 'dg-2', offerId: 'of-2', branchId: 'vi', branchName: 'Victoria Island', amount: 24000, discountGiven: 0, claimedAt: hoursAgo(200), expiresAt: hoursAgo(32), activityAt: hoursAgo(200) },
  { id: 'cl-5', claimCode: 'VT-9RT6', status: 'redeemed', customerName: 'Ibrahim Musa', contact: '+234 •••• •• 7702', dealName: 'Woodfire Ribeye Combo', dealGroupId: 'dg-1', offerId: 'of-1', branchId: 'wuse-ii', branchName: 'Wuse II', amount: 18500, discountGiven: 4500, claimedAt: hoursAgo(80), redeemedAt: hoursAgo(60), activityAt: hoursAgo(60) },
];

const mockPage = (query: DealLedgerQuery): DealLedgerPage => {
  const scoped = MOCK_ROWS.filter((row) => !query.dealGroupId || row.dealGroupId === query.dealGroupId);
  const redeemed = scoped.filter((row) => row.status === 'redeemed');
  const data = scoped.filter((row) => !query.status || row.status === query.status);
  return {
    data,
    total: data.length,
    page: 1,
    limit: query.limit ?? 20,
    totals: {
      claims: scoped.length,
      redeemed: redeemed.length,
      expired: scoped.filter((row) => row.status === 'expired').length,
      netRevenue: redeemed.reduce((sum, row) => sum + toAmount(row.amount) - toAmount(row.discountGiven), 0),
      discountGiven: redeemed.reduce((sum, row) => sum + toAmount(row.discountGiven), 0),
    },
  };
};

export const dealLedgerService = {
  /** The owner's deal redemption ledger: one row per claim, newest first. */
  list: (query: DealLedgerQuery = {}) =>
    withMock(() => api.get<DealLedgerPage>('/catalogue/offers/ledger', { params: { ...query } }), () => mockPage(query)),
};
