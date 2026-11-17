import { useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';
import { hasApiConfig } from '../services/api/client';
import {
  buildReferralIdentity,
  buildReferralLink,
  type ReferralAudience,
  type ReferralIdentity,
} from '../scripts/referralData';
import { useMyReferrals } from './useMyReferrals';

/**
 * The referral identity for the signed-in user.
 *
 * Live: the code stored on the account (`GET /referrals/me`), so it is the
 * same on every device and across reloads. Demo mode (no API configured)
 * keeps the deterministic preview from `buildReferralIdentity()`.
 */
export function useReferralIdentity(): ReferralIdentity {
  const profile = useProfile();
  const me = useMyReferrals();
  const seed = `${profile.firstName} ${profile.lastName} ${profile.email}`;
  return useMemo(() => {
    if (!hasApiConfig()) return buildReferralIdentity(seed);
    const code = me.data?.code ?? '';
    const audience: ReferralAudience = me.data?.audience ?? 'customer';
    return { code, link: buildReferralLink(code, audience), isPreview: false };
  }, [seed, me.data]);
}
