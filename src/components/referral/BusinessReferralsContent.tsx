import { HowItWorks } from './HowItWorks';
import { ReferralCodeCard } from './ReferralCodeCard';
import { ReferralRecordsPanel } from './ReferralRecordsPanel';
import { ReferralStatGrid } from './ReferralStatGrid';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { useBusinessReferrals } from '../../hooks/business/useBusinessReferrals';
import {
  BUSINESS_HOW_IT_WORKS,
  BUSINESS_REFERRAL_DISCLAIMER,
  REFERRAL_REWARDS_DISCLAIMER,
  buildReferralLink,
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

const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * Body of the Business → Referrals page, shared by the mobile and desktop
 * shells so both stay identical.
 *
 * Live: the business's real referral code (`GET /affiliates/stats`), totals and
 * the businesses that signed up with it (`GET /affiliates/referrals`). Credits per
 * business and subscription status aren't tracked yet, so those cells show "—".
 * Demo: a preview code with every figure at zero.
 */
export function BusinessReferralsContent() {
  const preview = useReferralIdentity();
  const referrals = useBusinessReferrals();
  const live = referrals.live;
  const code = live ? (referrals.stats?.referralCode ?? '') : preview.code;
  const identity = live
    ? { code, link: buildReferralLink(code, 'business'), isPreview: false }
    : preview;
  const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;
  const stats = live
    ? [
        { ...EMPTY_STATS[0], value: referrals.stats ? naira(referrals.stats.availableBalance) : '—' },
        { ...EMPTY_STATS[1], value: referrals.stats ? String(referrals.stats.totalReferrals) : '—' },
        {
          ...EMPTY_STATS[2],
          value: String(referrals.referrals.filter((row) => row.referredBusiness?.isVerified || row.referredBusiness?.verificationStatus === 'verified').length),
        },
        { ...EMPTY_STATS[3], value: '—' },
        { ...EMPTY_STATS[4], value: referrals.stats ? naira(referrals.stats.totalEarnings) : '—' },
      ]
    : EMPTY_STATS;
  const rows = live
    ? referrals.referrals.map((row) => {
        const name = row.referredBusiness?.name || 'Business';
        const onboarding = row.status === 'Converted' ? 'Active' : 'Pending';
        const verification = row.referredBusiness?.isVerified ? 'Verified' : row.referredBusiness?.verificationStatus ? row.referredBusiness.verificationStatus.charAt(0).toUpperCase() + row.referredBusiness.verificationStatus.slice(1) : 'Not started';
        return {
          id: row.id,
          cells: [name, shortDate(row.createdAt), onboarding, verification, '—', '—', '—'],
          card: (
            <div className="flex flex-col gap-0.5">
              <span className="font-label-md text-label-md text-text-primary font-semibold">{name}</span>
              <span className="font-caption text-caption text-text-secondary">
                Referred {shortDate(row.createdAt)} • {onboarding} • {verification}
              </span>
            </div>
          ),
        };
      })
    : [];
  const recordsStatus = live ? (referrals.loading ? 'loading' : referrals.error ? 'error' : 'ready') : 'empty';

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
        stats={stats}
        note={
          live
            ? 'Credits and referred businesses update as businesses join with your link.'
            : 'Referral tracking isn’t live yet, so every tile starts at zero. Figures appear here once the referral programme launches.'
        }
      />

      <ReferralCodeCard
        audience="business"
        accountType="business"
        code={identity.code}
        link={identity.link}
        isPreview={identity.isPreview}
        title="Your business referral link"
        description="Share this link with another business. They sign up through it and complete onboarding — that’s all we need to connect them to you."
      />

      <HowItWorks steps={BUSINESS_HOW_IT_WORKS} disclaimer={BUSINESS_REFERRAL_DISCLAIMER} />

      <ReferralRecordsPanel
        description="Businesses that joined through your link will be listed here."
        emptyIcon="person_search"
        emptyMessage={
          live
            ? 'No business has joined with your link yet. Share it to start earning credits.'
            : 'Referral tracking will become available when the programme launches. Until then, keep sharing your link — it’s ready to use.'
        }
        emptyTitle="No referrals yet"
        headers={REFERRAL_HEADERS}
        onRetry={live ? referrals.refetch : undefined}
        rows={rows}
        status={recordsStatus}
        title="My Referrals"
      />

      <p className="font-caption text-caption text-text-secondary leading-relaxed">{REFERRAL_REWARDS_DISCLAIMER}</p>
    </div>
  );
}
