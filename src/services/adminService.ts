import { api } from './api/client';
import type {
  AdminCustomer,
  ClusterNode,
  PlatformTransaction,
  VerificationItem,
} from '../scripts/admin/adminData';

export interface AdminCustomerFilter {
  page?: number;
  limit?: number;
  search?: string;
  cluster?: string;
  status?: string;
  joined?: string;
}

export interface AdminCustomerListResponse {
  stats: {
    totalCustomers: number;
    activeThisMonth: number;
    totalSavedItems: number;
    repeatVisitRate: string;
    nfcHardwareTaps: number;
    coverageHubs: string;
    platformIndex: string;
  };
  data: AdminCustomer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminOverviewKPIs {
  totalCustomers: {
    value: number;
    formatted: string;
    growth: string;
    active30d: string;
  };
  activeMerchants: {
    value: number;
    formatted: string;
    newThisWeek: number;
    activeClusters: number;
    cacOkPercent: string;
  };
  grossVolume: {
    raw: number;
    formatted: string;
    settlementRate: string;
    transactionsCount: number;
    transactionsFormatted: string;
  };
  posFleet: {
    value: number;
    formatted: string;
    uptime: string;
    syncRate: string;
    firmware: string;
  };
  adPlacementRev: {
    formatted: string;
    inventoryUtil: string;
    slotsBooked: string;
    mtdTarget: string;
  };
}

export interface AdminOverviewData {
  timeframe: 'today' | '7d' | '30d';
  timestamp: string;
  clusterSyncNodes: {
    active: number;
    total: number;
    status: string;
  };
  kpis: AdminOverviewKPIs;
  verificationQueue: VerificationItem[];
  clusters: ClusterNode[];
  recentTransactions: PlatformTransaction[];
  subscriptionHealth: {
    status: string;
    mrr: string;
    growth: string;
    autoRenewalRate: string;
    tierAccountsCount: number;
    overdueCount: number;
    escrowReserve: string;
    nextClearingWindow: string;
  };
  adPerformance: {
    bookedRatio: string;
    fillPercent: number;
    remainingSlots: number;
    spotlight: {
      title: string;
      merchant: string;
      roas: string;
      footfall: string;
    };
  };
  systemNodes: Array<{
    name: string;
    latency: string;
    status: string;
  }>;
  streamLatency: string;
}

export const adminService = {
  /**
   * Fetch platform overview telemetry and pulse metrics
   * GET /api/v1/administration/overview?timeframe=today|7d|30d
   */
  async getOverview(timeframe: 'today' | '7d' | '30d' = 'today'): Promise<AdminOverviewData> {
    return api.get<AdminOverviewData>('/administration/overview', {
      params: { timeframe },
    });
  },

  /**
   * List and search registered platform consumers
   * GET /api/v1/administration/customers
   */
  async listCustomers(filter: AdminCustomerFilter = {}): Promise<AdminCustomerListResponse> {
    return api.get<AdminCustomerListResponse>('/administration/customers', {
      params: filter as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get single customer dossier
   * GET /api/v1/administration/customers/:id
   */
  async getCustomer(id: string): Promise<AdminCustomer> {
    return api.get<AdminCustomer>(`/administration/customers/${id}`);
  },

  /**
   * Update customer account status (e.g. Suspend, Reactivate)
   * PATCH /api/v1/administration/customers/:id/status
   */
  async updateCustomerStatus(
    id: string,
    status: string,
    reason?: string,
  ): Promise<{ success: boolean; status: string; restrictionStatus: string }> {
    return api.patch(`/administration/customers/${id}/status`, {
      body: { status, reason },
    });
  },

  /**
   * Add internal administrator note to customer dossier
   * POST /api/v1/administration/customers/:id/notes
   */
  async addCustomerNote(
    id: string,
    text: string,
  ): Promise<{ id: string; text: string; author: string; time: string }> {
    return api.post(`/administration/customers/${id}/notes`, {
      body: { text },
    });
  },

  /**
   * Force revoke all active session tokens for a customer
   * POST /api/v1/administration/customers/:id/revoke-tokens
   */
  async revokeCustomerTokens(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/administration/customers/${id}/revoke-tokens`);
  },
};
