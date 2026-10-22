import { api } from './api/client';

export interface BusinessQrSummary {
  business: { id: string; name: string; logoUrl?: string | null; code: string; qr: { url: string; svg: string } };
}

/** The business's own scan/tap link and its printable kit. */
export const businessQrService = {
  summary: () => api.get<BusinessQrSummary>('/business-qr/summary'),
  kit: () => api.get<{ filename: string; mimeType: string; contentBase64: string }>('/business-qr/kit'),
};
