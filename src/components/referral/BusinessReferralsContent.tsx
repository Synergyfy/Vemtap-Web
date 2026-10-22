import { useQuery } from '@tanstack/react-query';
import { HowItWorks } from './HowItWorks';
import { ReferralCodeCard } from './ReferralCodeCard';
import { ReferralRecordsPanel } from './ReferralRecordsPanel';
import { ReferralStatGrid } from './ReferralStatGrid';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { useNetworkSummary, useReferrals } from '../../hooks/business/useBusinessNetwork';
import { hasApiConfig, ApiError } from '../../services/api/client';
import { affiliatesService } from '../../services/affiliatesService';
import type { ReferralCard, ReferralStatus } from '../../services/businessNetworkService';
import { formatNaira } from '../../utils/format';
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
 * shells so both stay identical. Live: the server-issued code, the referral
 * counts and list from `/business-network`, and earnings from `/affiliates`.
 */
export function BusinessReferralsContent() {
  return hasApiConfig() ? <LiveBusinessReferralsContent /> : <DemoBusinessReferralsContent />;
}

const STATUS_LABEL: Record<ReferralStatus, string> = {
  registered: 'Registered',
  pending: 'Verification pending',
  verified: 'Verified',
  notQualified: 'Not qualified',
};

const STATUS_CLASS: Record<ReferralStatus, string> = {
  registered: 'bg-surface-container text-text-secondary',
  pending: 'bg-amber-100 text-amber-800',
  verified: 'bg-badge-discount-bg text-badge-discount-text',
  notQualified: 'bg-red-50 text-red-700',
};

const LIVE_HEADERS = ['Business name', 'Date referred', 'Category', 'Location', 'Status', 'Verified on'];

const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function StatusPill({ status }: { status: ReferralStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full font-caption text-caption font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function toRow(referral: ReferralCard) {
  const name = referral.name || 'Business setting up';
  return {
    id: referral.id,
    cells: [
      <span className="font-semibold">{name}</span>,
      shortDate(referral.joinedAt),
      referral.category || '—',
      referral.location || '—',
      <StatusPill status={referral.status} />,
      shortDate(referral.verifiedAt),
    ],
    card: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{name}</span>
          <StatusPill status={referral.status} />
        </div>
        <span className="font-caption text-caption text-text-secondary">
          Referred {shortDate(referral.joinedAt)}
          {referral.location ? ` · ${referral.location}` : ''}
        </span>
      </div>
    ),
  };
}

function LiveBusinessReferralsContent() {
  const summary = useNetworkSummary();
  const referrals = useReferrals('all', '');
  // Earnings open only after admin verification; a 403 before then is expected.
  const earnings = useQuery({
    queryKey: ['affiliates', 'stats'],
    queryFn: affiliatesService.stats,
    retry: (count, error) => !(error instanceof ApiError && error.status === 403) && count < 2,
  });
  const locked = earnings.error instanceof ApiError && earnings.error.status === 403;
  const counts = summary.data?.counts;
  const count = (value?: number) => (summary.isLoading ? '…' : String(value ?? 0));
  const money = (value?: number) => (earnings.isLoading ? '…' : earnings.data ? formatNaira(value ?? 0) : '—');

  const stats = [
    { id: 'credits', label: 'Available referral balance', value: money(earnings.data?.availableBalance), icon: 'account_balance_wallet' },
    { id: 'referred', label: 'Total referred businesses', value: count(counts?.total), icon: 'group_add' },
    { id: 'pending', label: 'Awaiting verification', value: count(counts?.pending), icon: 'pending' },
    { id: 'verified', label: 'Verified businesses', value: count(counts?.verified), icon: 'verified_user' },
    { id: 'earned', label: 'Total referral earnings', value: money(earnings.data?.totalEarnings), icon: 'stars' },
  ];
  const note = locked
    ? 'Referral earnings unlock once VEMTAP has verified your business. Your link already works, and referrals are tracked from today.'
    : earnings.isError
      ? 'Earnings could not be loaded right now.'
      : undefined;

  const rows = (referrals.data?.data ?? []).map(toRow);
  const status = referrals.isLoading ? 'loading' : referrals.isError ? 'error' : rows.length ? 'ready' : 'empty';

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-2xs">
        <h2 className="font-heading-md text-heading-md text-text-primary font-semibold tracking-tight">Referrals</h2>
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
          Invite other businesses to VEMTAP. When a business you referred joins and qualifies, you may earn rewards.
        </p>
      </div>

      <ReferralStatGrid stats={stats} note={note} />

      {summary.isError ? (
        <p className="font-body-md text-body-md text-red-600">
          Your referral link could not be loaded.{' '}
          <button type="button" className="underline" onClick={() => summary.refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <ReferralCodeCard
          audience="business"
          accountType="business"
          isPreview={false}
          code={summary.data?.referralCode ?? '…'}
          link={summary.data?.referralLink ?? ''}
          title="Your business referral link"
          description="Share this link with another business. They sign up through it and complete onboarding — that’s all we need to connect them to you."
        />
      )}

      <HowItWorks steps={BUSINESS_HOW_IT_WORKS} disclaimer={BUSINESS_REFERRAL_DISCLAIMER} />

      <ReferralRecordsPanel
        description={`Businesses that joined through your link${referrals.data?.total ? ` (${referrals.data.total})` : ''}.`}
        emptyIcon="person_search"
        emptyMessage="Businesses that sign up with your link or code show up here as soon as they register."
        emptyTitle="No referrals yet"
        headers={LIVE_HEADERS}
        rows={rows}
        status={status}
        title="My Referrals"
        onRetry={() => referrals.refetch()}
      />

      <p className="font-caption text-caption text-text-secondary leading-relaxed">{REFERRAL_REWARDS_DISCLAIMER}</p>
    </div>
  );
}

function DemoBusinessReferralsContent() {
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
