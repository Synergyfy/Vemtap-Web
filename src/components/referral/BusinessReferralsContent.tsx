import { HowItWorks } from './HowItWorks';
import { ReferralCodeCard } from './ReferralCodeCard';
import { ReferralRecordsPanel } from './ReferralRecordsPanel';
import { ReferralStatGrid } from './ReferralStatGrid';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import {
  BUSINESS_HOW_IT_WORKS,
  BUSINESS_REFERRAL_DISCLAIMER,
  REFERRAL_REWARDS_DISCLAIMER,
} from '../../scripts/referralData';

/** The columns shown once referral tracking is connected. */
const REFERRAL_HEADERS = [
  'Business name',
  'Date referred',
  'Onboarding',
  'Verification',
  'Subscription',
  'Reward',
  'Credits earned',
];

const EMPTY_STATS = [
  { id: 'credits', label: 'Available VEMTAP Credits', value: '0', icon: 'account_balance_wallet' },
  { id: 'referred', label: 'Total referred businesses', value: '0', icon: 'group_add' },
  { id: 'verified', label: 'Verified businesses', value: '0', icon: 'verified_user' },
  { id: 'subscribed', label: 'Businesses that subscribed', icon: 'workspace_premium', value: '0' },
  { id: 'earned', label: 'Total credits earned', value: '0', icon: 'stars' },
];

/**
 * Body of the Business → Referrals page, shared by the mobile and desktop
 * shells so both stay identical.
 *
 * No figure here is a live reading: the programme has no backend yet, so the
 * overview is pinned at zero and the referral list renders its empty state.
 */
export function BusinessReferralsContent() {
  const identity = useReferralIdentity();

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-2xs">
        <h2 className="font-heading-md text-heading-md text-text-primary font-semibold tracking-tight">Referrals</h2>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Invite other businesses to VEMTAP. When a business you referred joins and qualifies, you may earn VEMTAP
          Credits.
        </p>
      </div>

      <ReferralStatGrid
        stats={EMPTY_STATS}
        note="Referral tracking isn’t live yet, so every tile starts at zero. Figures appear here once the referral programme launches."
      />

      <ReferralCodeCard
        audience="business"
        accountType="business"
        code={identity.code}
        link={identity.link}
        title="Your business referral link"
        description="Share this link with another business. They sign up through it and complete onboarding — that’s all we need to connect them to you."
      />

      <HowItWorks steps={BUSINESS_HOW_IT_WORKS} disclaimer={BUSINESS_REFERRAL_DISCLAIMER} />

      <ReferralRecordsPanel
        description="Businesses that joined through your link will be listed here."
        emptyIcon="person_search"
        emptyMessage="Referral tracking will become available when the programme launches. Until then, keep sharing your link — it’s ready to use."
        emptyTitle="No referrals yet"
        headers={REFERRAL_HEADERS}
        rows={[]}
        status="empty"
        title="My Referrals"
      />

      <p className="font-caption text-caption text-text-secondary leading-relaxed">{REFERRAL_REWARDS_DISCLAIMER}</p>
    </div>
  );
}
