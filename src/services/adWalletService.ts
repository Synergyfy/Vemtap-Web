import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { AdWalletInvoice, AdWalletPage, AdWalletPrepack, AdWalletSummary, AdWalletTransaction } from './types';

export const adWalletService = {
  getSummary: async () => api.get<AdWalletSummary>(API_ENDPOINTS.adWallet.root),

  /** The API answers a page; older callers read the rows straight off it. */
  getTransactions: async (params?: Record<string, string | number | boolean | undefined>) =>
    api
      .get<AdWalletPage<AdWalletTransaction> | AdWalletTransaction[]>(API_ENDPOINTS.adWallet.transactions, { params })
      .then((res) => (Array.isArray(res) ? res : res.data ?? [])),

  getPrepacks: async () => api.get<Array<AdWalletPrepack>>(API_ENDPOINTS.adWallet.prepacks),

  /** Opens a Paystack checkout; the wallet is credited once `confirmTopUp` sees it paid. */
  topUp: async (body: { amount?: number; prepackId?: string; callbackUrl?: string }) =>
    api.post<{ reference: string; amount: number | string; bonus: number | string; authorizationUrl?: string | null }>(API_ENDPOINTS.adWallet.topUp, body),

  confirmTopUp: async (reference: string) =>
    api.post<{ reference: string; status: 'completed' | 'pending'; wallet: AdWalletSummary }>(`${API_ENDPOINTS.adWallet.topUp}/${reference}/confirm`),

  setAutoReload: async (body: { enabled: boolean; threshold: number; amount: number }) =>
    api.put<AdWalletSummary>('/ad-wallet/auto-reload', body),

  getInvoices: async (params?: { page?: number; limit?: number }) =>
    api.get<AdWalletPage<AdWalletInvoice>>('/ad-wallet/invoices', { params }).then((res) => res.data ?? []),

  getInvoice: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.adWallet.invoice(id)),
};
