import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { AdWalletSummary, AdWalletTransaction } from './types';

export const adWalletService = {
  getSummary: async () => api.get<AdWalletSummary>(API_ENDPOINTS.adWallet.root),

  getTransactions: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Array<AdWalletTransaction>>(API_ENDPOINTS.adWallet.transactions, { params }),

  getPrepacks: async () => api.get<Array<Record<string, unknown>>>(API_ENDPOINTS.adWallet.prepacks),

  topUp: async (body: { amount?: number; prepackId?: string }) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.adWallet.topUp, body),

  getInvoice: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.adWallet.invoice(id)),
};
