import { api } from './api/client';

export type CustomerSegment = 'all' | 'frequent' | 'returning' | 'new' | 'inactive';
export type CustomerSort = 'recent' | 'spend' | 'visits' | 'name';

export interface CustomerCard {
  userId: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  segment: 'frequent' | 'returning' | 'new' | 'inactive' | 'occasional' | string;
  visits: number;
  orders: number;
  claims: number;
  bookings: number;
  spend: number | string;
  pointsBalance?: number | null;
  tier?: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  lastInteraction?: { kind: string; reference?: string | null } | null;
}

export interface CustomersPage {
  data: CustomerCard[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  meta: {
    segmentCounts: Record<CustomerSegment, number>;
    insight?: { customers: number; frequentCustomers: number; frequentSpendShare: number; dormant: number };
  };
}

export interface CustomerDossier extends CustomerCard {
  memberSince?: string | null;
  preferredBranch?: { id: string; name: string } | null;
  metrics?: { visitsPerMonth: number; averageOrder: number | string; redeemed: number; redemptionRate: number };
  recentPurchases?: { id: string; kind: 'pos' | 'order'; reference?: string | null; total: number | string; paymentMethod?: string | null; items?: number; at: string; branchName?: string | null }[];
  recentClaims?: { id: string; offerName: string; status: string; claimCode?: string | null; saved?: number | string | null; claimedAt: string; redeemedAt?: string | null; branchName?: string | null }[];
  loyaltyLedger?: { id: string; points: number; reason: string; at: string }[];
  note?: { note?: string | null; tags?: string[] | null; updatedAt?: string | null } | null;
}

export interface CustomersQuery {
  search?: string;
  segment?: CustomerSegment;
  branchId?: string;
  sort?: CustomerSort;
  page?: number;
  limit?: number;
}

export const businessCustomersService = {
  list: (query: CustomersQuery) => api.get<CustomersPage>('/business-customers', { params: { ...query } }),
  get: (userId: string) => api.get<CustomerDossier>(`/business-customers/${userId}`),
  saveNote: (userId: string, input: { note?: string; tags?: string[] }) =>
    api.put<{ note: string | null; tags: string[]; updatedAt: string }>(`/business-customers/${userId}/note`, input),
  export: (query: CustomersQuery) =>
    api.post<{ filename: string; mimeType: string; contentBase64: string; records: number }>('/business-customers/export', query),
};
