import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/accountService';
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

/**
 * The customer's points and redeemed rewards for the Referrals & Rewards tiles.
 * Each figure stays null until its endpoint answers, so a failure never reads as 0.
 * Earned has no endpoint of its own: it is the balance plus what redemptions spent.
 */
export function useReferralPoints() {
  const { authed } = useAuth();
  const enabled = hasApiConfig() && authed;
  const tier = useQuery({
    queryKey: ['dashboard', 'tier'],
    queryFn: () => accountService.getLoyaltyTier(),
    enabled,
    select: (payload) => {
      const points = Number((payload as { points?: unknown } | null)?.points);
      return Number.isFinite(points) ? points : null;
    },
  });
  const redemptions = useQuery({
    queryKey: ['loyalty', 'redemptions'],
    queryFn: () => accountService.getLoyaltyRedemptions(),
    enabled,
    select: (payload) => (Array.isArray(payload) ? (payload as { pointsSpent?: unknown }[]) : null),
  });
  const available = tier.data ?? null;
  const redeemed = redemptions.data ?? null;
  const spent = redeemed?.reduce((sum, row) => sum + (Number(row.pointsSpent) || 0), 0) ?? null;
  return {
    available,
    earned: available !== null && spent !== null ? available + spent : null,
    redeemedRewards: redeemed ? redeemed.length : null,
  };
}
