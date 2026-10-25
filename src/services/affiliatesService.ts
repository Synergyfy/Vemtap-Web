import { api } from './api/client';

/** `GET /affiliates/stats` — money fields are naira. */
export interface AffiliateStats {
  totalEarnings: number;
  availableBalance: number;
  totalReferrals: number;
  activeReferrals: number;
  referralCode: string;
  tier: string;
}

/**
 * The referral earnings programme (`/affiliates`). The backend only opens it
 * once an admin has verified the business; before that every call is a 403.
 */
export const affiliatesService = {
  stats: () => api.get<AffiliateStats>('/affiliates/stats'),
};
