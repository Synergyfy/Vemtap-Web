import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { useAuth } from '../context/AuthContext';
import { referralsService } from '../services/referralsService';

/** Query key for `GET /referrals/me` (the signed-in user's own referrals). */
export const myReferralsKeys = { me: ['referrals', 'me'] as const };

/** The signed-in user's referral code and referrals. Disabled in demo mode or when signed out. */
export function useMyReferrals() {
  const { authed } = useAuth();
  return useQuery({
    queryKey: myReferralsKeys.me,
    queryFn: () => referralsService.me(),
    enabled: hasApiConfig() && authed,
  });
}
