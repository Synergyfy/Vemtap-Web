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

export interface ScannedVoucher {
  id: string;
  claimCode: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  expiresAt: string;
  customerName: string;
  offerName: string;
  offerImage: string | null;
  calculatedPrice: number;
}

export const claimsService = {
  /** Business side: the voucher a merchant just scanned. */
  lookupVoucher: async (id: string) =>
    apiGet<ScannedVoucher>(`/catalogue/offers/claim/lookup/${encodeURIComponent(id)}`),

  redeemVoucher: async (code: string) =>
    apiPost<unknown>(`/catalogue/offers/claim/redeem/${encodeURIComponent(code)}`),

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
