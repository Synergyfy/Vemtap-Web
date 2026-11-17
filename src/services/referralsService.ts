import { api } from './api/client';

export type ReferralAudience = 'customer' | 'business';

/** `GET /referrals/me` — the signed-in user's own referral code and referrals. */
export interface MyReferralsResponse {
  code: string;
  audience: ReferralAudience;
  totalReferrals: number;
  referrals: Array<{
    id: string;
    /** First name plus last initial — the server masks the rest. */
    name: string;
    type: ReferralAudience;
    joinedAt: string;
  }>;
}

/** The user's own referral code plus who has used it so far. */
export const referralsService = {
  me: () => api.get<MyReferralsResponse>('/referrals/me'),

  /** Applies one referral code for the freshly created signed-in account. */
  claim: (code: string) => api.post<{ message: string }>('/referrals/claim', { code }),
};
