import { api } from './api/client';

/** `GET /business-dashboard?branchId=` — loosely typed upstream; numbers may arrive as strings. */
export interface BusinessDashboard {
  businessName?: string | null;
  businessLogo?: string | null;
  generatedAt?: string | null;
  stats?: {
    totalVisitors?: number | string;
    todaysVisits?: number | string;
    totalViews?: number | string;
    totalClaims?: number | string;
    ordersRevenue?: number | string;
    bookingsCount?: number | string;
    visitorsDelta?: number | null;
    claimsDelta?: number | null;
    revenueDelta?: number | null;
  };
  weekly?: { visits?: number; claims?: number; revenue?: number } | null;
  insights?: { id?: string | null; title?: string | null; message?: string | null; priority?: string | null }[] | null;
  /** Conversation messages the branch has not opened yet. */
  unreadMessages?: number | null;
}

/** `GET /pos/dashboard` — today's POS figures for the branch. */
export interface PosDashboard {
  revenue?: number | string;
  transactionCount?: number | string;
  averageSaleValue?: number | string;
  heldSalesCount?: number | string;
}

/** `GET /subscriptions/active` — null when the business has no plan. */
export interface ActiveSubscription {
  status?: string | null;
  isTrial?: boolean | null;
  trialEndsAt?: string | null;
  endDate?: string | null;
  plan?: { id?: string; name?: string | null; isFree?: boolean | null } | null;
}

export const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const dashboardService = {
  dashboard: (branchId: string) => api.get<BusinessDashboard>('/business-dashboard', { params: { branchId } }),
  posDashboard: (branchId: string) => api.get<PosDashboard>('/pos/dashboard', { params: { branchId } }),
  activeSubscription: () => api.get<ActiveSubscription | null>('/subscriptions/active'),
};
