import { api } from './api/client';

/** Which Paystack account checkout runs on: `test` moves no real money. */
export type PaymentMode = 'test' | 'live' | 'unconfigured';

export const paymentsService = {
  /** `GET /payments/config` — public; never returns a key. */
  config: () => api.get<{ provider: string; mode: PaymentMode }>('/payments/config'),
};
