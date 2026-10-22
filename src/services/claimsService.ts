import { apiDelete, apiGet, apiPost } from '../lib/api';

export interface ClaimQrResponse {
  id?: string;
  ref?: string;
  qrCode?: string;
  qrUrl?: string;
  url?: string;
  image?: string;
  code?: string;
  token?: string;
}

export const claimsService = {
  getGift: async (token: string) =>
    apiGet<unknown>(`/catalogue/offers/gift/${encodeURIComponent(token)}`),

  rejectGift: async (token: string, reason?: string) =>
    apiPost<unknown>(
      `/catalogue/offers/gift/${encodeURIComponent(token)}/reject`,
      reason ? { reason } : {},
    ),

  getClaimQr: async (id: string) =>
    apiGet<ClaimQrResponse>(`/me/claims/${encodeURIComponent(id)}/qr`),

  deleteClaim: async (id: string) =>
    apiDelete<unknown>(`/me/claims/${encodeURIComponent(id)}`),
};
