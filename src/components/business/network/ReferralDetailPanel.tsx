import { Icon } from '../../ui/Icon';
import { ErrorState, LoadingRows } from '../QueryStates';
import { BusinessAvatar, Card, ReferralStatusBadge } from './NetworkShared';
import { useReferral } from '../../../hooks/business/useBusinessNetwork';
import type { ReferralTimelineStep } from '../../../services/businessNetworkService';

const STEP_LABEL: Record<ReferralTimelineStep, string> = {
  registered: 'Signed up with your code',
  setup: 'Completed business setup',
  submitted: 'Submitted verification',
  verified: 'Verified by VemTap',
  firstDeal: 'Published first deal',
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

export function ReferralDetailPanel({ referralId }: { referralId: string | null }) {
  const referral = useReferral(referralId);

  if (!referralId) return <ErrorState title="No referral selected" />;
  if (referral.isLoading) return <LoadingRows rows={3} label="Loading referral" />;
  if (referral.isError || !referral.data)
    return <ErrorState title="Could not load this referral" error={referral.error} onRetry={() => referral.refetch()} />;

  const data = referral.data;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-space-lg items-start max-w-5xl">
      <Card>
        <div className="flex items-center gap-space-sm">
          <BusinessAvatar name={data.name} logoUrl={data.logoUrl} />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-heading-sm text-heading-sm text-text-primary truncate">{data.name ?? 'New business'}</span>
            <span className="font-caption text-caption text-text-secondary truncate">
              {[data.category, data.location].filter(Boolean).join(' · ') || '—'}
            </span>
          </div>
          <ReferralStatusBadge status={data.status} />
        </div>
        <h3 className="font-label-md text-label-md text-text-secondary font-semibold mt-space-xs">Progress</h3>
        <ol className="flex flex-col">
          {data.timeline.map((step, index) => (
            <li key={step.id} className="flex gap-space-sm">
              <div className="flex flex-col items-center">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-tertiary'
                  }`}
                >
                  <Icon name={step.done ? 'check' : 'radio_button_unchecked'} className="text-[16px]" />
                </span>
                {index < data.timeline.length - 1 ? (
                  <span className={`w-0.5 flex-1 min-h-[20px] ${step.done ? 'bg-primary-container' : 'bg-surface-container'}`} />
                ) : null}
              </div>
              <div className="flex flex-col pb-space-sm">
                <span className={`font-label-md text-label-md ${step.done ? 'text-text-primary' : 'text-text-tertiary'}`}>{STEP_LABEL[step.id] ?? step.id}</span>
                {formatDate(step.at) ? <span className="font-caption text-caption text-text-tertiary">{formatDate(step.at)}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Referral">
        <dl className="flex flex-col gap-space-xs font-body-md text-body-md">
          <div className="flex justify-between gap-space-xs">
            <dt className="text-text-secondary">Their code</dt>
            <dd className="font-mono text-text-primary">{data.code}</dd>
          </div>
          <div className="flex justify-between gap-space-xs">
            <dt className="text-text-secondary">Credited to</dt>
            <dd className="text-text-primary text-right">{data.creditedTo.name}</dd>
          </div>
          <div className="flex justify-between gap-space-xs">
            <dt className="text-text-secondary">Joined</dt>
            <dd className="text-text-primary">{formatDate(data.joinedAt)}</dd>
          </div>
          {data.verifiedAt ? (
            <div className="flex justify-between gap-space-xs">
              <dt className="text-text-secondary">Verified</dt>
              <dd className="text-text-primary">{formatDate(data.verifiedAt)}</dd>
            </div>
          ) : null}
        </dl>
        <div
          className={`flex items-start gap-space-xs rounded-lg p-space-sm ${
            data.countsTowardMilestone ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container-low text-text-secondary'
          }`}
        >
          <Icon name={data.countsTowardMilestone ? 'verified' : 'hourglass_top'} className="text-[18px]" />
          <span className="font-caption text-caption">
            {data.countsTowardMilestone
              ? 'Counts toward your network milestones.'
              : 'Counts toward your milestones once the business is verified.'}
          </span>
        </div>
      </Card>
    </div>
  );
}
