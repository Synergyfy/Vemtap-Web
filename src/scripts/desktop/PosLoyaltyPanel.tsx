import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import {
  LOYALTY_REWARDS,
  nextReward,
  nextTier,
  naira,
  pointsForAmount,
  tierForPoints,
  unlockedRewards,
  type PosCustomerRecord,
} from './posRegisterExtras';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { posService } from '../../services/posService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { apiCustomerId } from '../posLive';

/**
 * Loyalty snapshot + point award for the customer on the current ticket.
 *
 * Shows current points, the tier they sit in, the next tier and the next
 * reward within reach — and lets the cashier hand out points for this sale
 * (auto-computed from the ticket total, editable before confirming).
 */
export function PosLoyaltyPanel({
  customer,
  ticketTotal,
  onAward,
  onError,
  compact,
}: {
  customer: PosCustomerRecord;
  /** Total of the ticket about to be paid — used to pre-fill the award. */
  ticketTotal: number;
  /** Commit the awarded points (caller persists them). */
  onAward: (points: number) => void;
  /** Live: why an award failed (shown as the screen's toast). */
  onError?: (message: string) => void;
  /** Tighter layout for the ticket pane. */
  compact?: boolean;
}) {
  const suggested = pointsForAmount(ticketTotal);
  const [award, setAward] = useState(suggested);
  const [awarded, setAwarded] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const live = hasApiConfig();
  const { activeBranchId } = useBusinessBranch();

  /** Live: credit the points through the loyalty API before reporting them. */
  const giveAward = () => {
    if (!live) {
      onAward(award);
      setAwarded(true);
      return;
    }
    const userId = apiCustomerId(customer.id);
    if (!userId || !activeBranchId) {
      onError?.('Pick a branch and a saved customer first.');
      return;
    }
    setAwarding(true);
    posService
      .awardPoints({ userId, points: award }, activeBranchId)
      .then(() => {
        onAward(award);
        setAwarded(true);
      })
      .catch((error: unknown) => onError?.(apiErrorMessage(error, 'Could not award points.')))
      .finally(() => setAwarding(false));
  };

  const localTier = tierForPoints(customer.points);
  // Live: the business's own tier name for this customer.
  const tier = hasApiConfig() && customer.tier ? { ...localTier, name: customer.tier } : localTier;
  const upcomingTier = nextTier(customer.points);
  const upcoming = nextReward(customer.points);
  const unlocked = useMemo(() => unlockedRewards(customer.points), [customer.points]);

  const pointsAfter = customer.points + (awarded ? award : 0);
  const progressToNext = useMemo(() => {
    if (!upcoming) return 100;
    const previousThreshold = [...LOYALTY_REWARDS].reverse().find((reward) => reward.points <= customer.points)?.points ?? 0;
    const span = upcoming.points - previousThreshold;
    if (span <= 0) return 100;
    return Math.min(100, Math.max(0, ((customer.points - previousThreshold) / span) * 100));
  }, [customer.points, upcoming]);

  return (
    <div className={`rounded-xl bg-surface-canvas shadow-sm border border-border-subtle flex flex-col ${compact ? 'p-space-sm' : 'p-space-md'}`}>
      {/* Member header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="loyalty" className="text-primary text-[18px] shrink-0" />
          <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${customer.tierClass}`}>
            {tier.name}
          </span>
          {customer.onVemtap && <Icon name="verified" filled className="text-[14px] text-primary shrink-0" />}
        </div>
        <span className="font-caption text-caption text-text-tertiary">{customer.visits} visits</span>
      </div>

      {/* Points balance */}
      <div className="mt-space-sm flex items-end justify-between gap-2">
        <div>
          <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary block">
            Current Points
          </span>
          <span className="font-heading-lg text-heading-lg font-bold text-text-primary leading-none">
            {(awarded ? pointsAfter : customer.points).toLocaleString()}
          </span>
        </div>
        {awarded && (
          <span className="font-label-sm text-label-sm font-semibold text-badge-discount-text flex items-center gap-1">
            <Icon name="add_circle" className="text-[14px]" />
            +{award.toLocaleString()} awarded
          </span>
        )}
      </div>

      {/* Tier + next reward progress */}
      <div className="mt-space-sm">
        <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
          <span>
            {upcomingTier ? `Next tier: ${upcomingTier.name}` : 'Top tier reached'}
          </span>
          <span className="text-text-tertiary">{upcomingTier ? `${(upcomingTier.threshold - customer.points).toLocaleString()} pts to go` : tier.perk}</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-surface-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Next reward in reach */}
      {upcoming ? (
        <div className="mt-space-sm p-space-sm rounded-lg bg-surface-subtle flex items-center gap-2">
          <Icon name="emoji_events" className="text-[18px] text-badge-discount-text shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-label-sm text-label-sm text-text-primary font-semibold block truncate">
              {upcoming.label}
            </span>
            <span className="font-caption text-caption text-text-secondary">
              {(upcoming.points - customer.points).toLocaleString()} pts away · unlocks at {upcoming.points.toLocaleString()}
            </span>
          </div>
          <span className="font-caption text-caption font-semibold text-text-tertiary shrink-0">
            {Math.round(progressToNext)}%
          </span>
        </div>
      ) : (
        <div className="mt-space-sm p-space-sm rounded-lg bg-badge-discount-bg flex items-center gap-2">
          <Icon name="workspace_premium" className="text-[18px] text-badge-discount-text shrink-0" />
          <span className="font-label-sm text-label-sm text-text-primary font-semibold">
            All rewards unlocked — top of the programme
          </span>
        </div>
      )}

      {/* Rewards already unlocked */}
      {unlocked.length > 0 && (
        <div className="mt-space-sm flex flex-wrap gap-1">
          {unlocked.map((reward) => (
            <span
              key={reward.points}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold"
            >
              <Icon name={reward.icon} className="text-[12px]" />
              {reward.label}
            </span>
          ))}
        </div>
      )}

      {/* Award points for this sale */}
      <div className="mt-space-sm pt-space-sm border-t border-border-subtle flex flex-col gap-2">
        <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
          Give Points for This Sale
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center flex-1 h-10 rounded-lg bg-surface overflow-hidden">
            <button
              type="button"
              aria-label="Decrease points"
              onClick={() => setAward((value) => Math.max(0, value - 10))}
              className="w-10 h-full text-text-secondary hover:text-text-primary text-[18px] font-bold"
            >
              −
            </button>
            <input
              value={award}
              inputMode="numeric"
              onChange={(e) => setAward(Math.max(0, Number(e.target.value.replace(/[^0-9]/g, '') || '0')))}
              className="flex-1 h-full text-center bg-transparent font-label-md text-label-md font-semibold text-text-primary focus:outline-none"
              aria-label="Points to award"
            />
            <button
              type="button"
              aria-label="Increase points"
              onClick={() => setAward((value) => value + 10)}
              className="w-10 h-full text-text-secondary hover:text-text-primary text-[18px] font-bold"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={award <= 0 || awarded || awarding}
            onClick={giveAward}
            className="h-10 px-space-sm rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 disabled:opacity-40 transition-opacity shrink-0"
          >
            <Icon name="stars" className="text-[16px]" />
            <span>{awarded ? 'Awarded' : 'Award'}</span>
          </button>
        </div>
        <span className="font-caption text-caption text-text-tertiary">
          Suggested {suggested.toLocaleString()} pts · {naira(ticketTotal)} spend{ticketTotal > 0 ? ` · ≈ ${naira(Math.round(ticketTotal * 0.01))} value` : ''}
        </span>
      </div>
    </div>
  );
}
