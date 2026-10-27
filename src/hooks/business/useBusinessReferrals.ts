import { useQuery } from '@tanstack/react-query';
import { api, hasApiConfig } from '../../services/api/client';

/** `GET /affiliates/stats` — the business's referral code and totals. */
export interface ReferralStats {
  totalEarnings: number;
  availableBalance: number;
  totalReferrals: number;
  activeReferrals: number;
  referralCode: string;
  tier?: string | null;
}

/** `GET /affiliates/referrals` row for a business owner: a business that signed up with their code. */
export interface ReferredBusiness {
  id: string;
  status: 'Converted' | 'Pending' | string;
  createdAt: string;
  referredBusiness?: {
    id: string;
    name?: string | null;
    verificationStatus?: string | null;
    isVerified?: boolean | null;
    status?: string | null;
  } | null;
}

const keys = { all: ['referrals', 'business'] as const };

/** The signed-in owner's referral code, totals and referred businesses (live only). */
export function useBusinessReferrals() {
  const live = hasApiConfig();
  const stats = useQuery({
    queryKey: [...keys.all, 'stats'],
    queryFn: () => api.get<ReferralStats>('/affiliates/stats'),
    enabled: live,
  });
  const referrals = useQuery({
    queryKey: [...keys.all, 'list'],
    queryFn: () => api.get<ReferredBusiness[]>('/affiliates/referrals'),
    enabled: live,
  });
  return {
    live,
    stats: stats.data ?? null,
    referrals: referrals.data ?? [],
    loading: stats.isLoading || referrals.isLoading,
    error: stats.error ?? referrals.error ?? null,
    refetch: () => {
      void stats.refetch();
      void referrals.refetch();
    },
  };
}
