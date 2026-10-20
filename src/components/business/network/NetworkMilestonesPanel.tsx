import { Icon } from '../../ui/Icon';
import { ErrorState, LoadingRows } from '../QueryStates';
import { ProgressBar } from './NetworkShared';
import { useNetworkSummary } from '../../../hooks/business/useBusinessNetwork';
import type { NetworkTier } from '../../../services/businessNetworkService';

const STATE_STYLE: Record<NetworkTier['state'], { badge: string; label: string; icon: string; ring: string }> = {
  unlocked: { badge: 'bg-badge-discount-bg text-badge-discount-text', label: 'Unlocked', icon: 'check_circle', ring: 'border-border-subtle' },
  active: { badge: 'bg-primary-container text-on-primary', label: 'Current tier', icon: 'military_tech', ring: 'border-primary/50 ring-2 ring-primary-container/20' },
  locked: { badge: 'bg-surface-container text-text-secondary', label: 'Locked', icon: 'lock', ring: 'border-border-subtle' },
};

/** The milestone ladder: each tier unlocks at a number of verified referrals. */
export function NetworkMilestonesPanel() {
  const summary = useNetworkSummary();
  if (summary.isLoading) return <LoadingRows rows={4} label="Loading milestones" />;
  if (summary.isError || !summary.data)
    return <ErrorState title="Could not load milestones" error={summary.error} onRetry={() => summary.refetch()} />;

  const { tiers, counts } = summary.data;
  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      <p className="font-body-md text-body-md text-text-secondary">
        You have <strong className="text-text-primary">{counts.verified}</strong> verified{' '}
        {counts.verified === 1 ? 'referral' : 'referrals'}. Only verified businesses count toward a tier.
      </p>
      <ol className="flex flex-col gap-space-sm">
        {tiers.map((tier) => {
          const style = STATE_STYLE[tier.state];
          return (
            <li key={tier.id} className={`rounded-xl bg-surface-canvas shadow-sm border p-space-md flex flex-col gap-space-sm ${style.ring}`}>
              <div className="flex items-start gap-space-sm">
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    tier.state === 'locked' ? 'bg-surface-container text-text-tertiary' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  }`}
                >
                  <Icon name={style.icon} filled={tier.state !== 'locked'} className="text-[22px]" />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-heading-sm text-heading-sm text-text-primary">{tier.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${style.badge}`}>{style.label}</span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary">{tier.threshold} verified referrals</span>
                </div>
              </div>
              {tier.state === 'locked' ? (
                <div className="flex flex-col gap-1">
                  <ProgressBar value={tier.progress} />
                  <span className="font-caption text-caption text-text-tertiary">{tier.remaining} to go</span>
                </div>
              ) : null}
              <ul className="flex flex-col gap-1">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-space-xs font-body-md text-body-md text-text-primary">
                    <Icon name="redeem" className="text-[16px] text-primary" />
                    {perk}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
