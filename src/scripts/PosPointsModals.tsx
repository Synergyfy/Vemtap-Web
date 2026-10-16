import { useState, type ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';
import { LOYALTY_REWARDS, nextReward, unlockedRewards } from './desktop/posRegisterExtras';
import { usePosSettings } from '../context/PosSettingsContext';

/**
 * Shared loyalty modals used by the POS payment flows (desktop + mobile/tablet):
 *  - PosAddPointsModal — hand points to the attached customer before payment,
 *    for when points aren't already attached to the products/order.
 *  - PosRewardsModal — quick view of the rewards the customer has earned
 *    (plus anything this order is about to unlock).
 */
function ModalShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-2xl p-space-lg flex flex-col gap-space-sm animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="w-9 h-9 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
              <Icon name={icon} className="text-[19px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-heading-sm text-heading-sm text-text-primary leading-tight">{title}</span>
              {subtitle && <span className="font-caption text-caption text-text-secondary truncate">{subtitle}</span>}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface shrink-0 transition-colors"
          >
            <Icon name="close" className="text-[17px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const QUICK_POINTS = [50, 100, 250, 500];

/** Manually award points to the attached customer before the sale completes. */
export function PosAddPointsModal({
  customerName,
  currentPoints,
  suggested,
  onClose,
  onAward,
}: {
  customerName: string;
  currentPoints: number;
  /** Suggested award — normally the points the order itself earns. */
  suggested: number;
  onClose: () => void;
  onAward: (points: number) => void;
}) {
  const [value, setValue] = useState(() => Math.max(0, suggested));

  const clamp = (next: number) => Math.max(0, Math.min(next, 1000000));

  return (
    <ModalShell
      icon="add_circle"
      title="Add loyalty points"
      subtitle={`${customerName} · ${currentPoints.toLocaleString()} pts today`}
      onClose={onClose}
    >
      <p className="font-caption text-caption text-text-secondary leading-relaxed -mt-space-2xs">
        Give points for this sale when they aren’t attached to the products already — the award lands on the customer
        before the receipt prints.
      </p>

      {/* Quick chips */}
      <div className="flex gap-space-xs">
        {QUICK_POINTS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setValue(clamp(chip))}
            className={`flex-1 h-9 rounded-lg font-label-sm text-label-sm font-semibold border transition-colors ${
              value === chip
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-text-secondary border-border-subtle hover:bg-surface-container-low'
            }`}
          >
            +{chip}
          </button>
        ))}
      </div>

      {/* Fine-grained entry */}
      <div className="flex items-center gap-space-xs">
        <div className="flex items-center flex-1 h-11 rounded-xl bg-surface overflow-hidden border border-border-subtle">
          <button
            type="button"
            aria-label="Decrease points"
            onClick={() => setValue((current) => clamp(current - 10))}
            className="w-11 h-full text-text-secondary hover:text-text-primary text-[18px] font-bold"
          >
            −
          </button>
          <input
            value={value}
            inputMode="numeric"
            aria-label="Points to award"
            onChange={(event) => setValue(clamp(Number(event.target.value.replace(/[^0-9]/g, '') || '0')))}
            className="flex-1 h-full text-center bg-transparent font-label-md text-label-md font-semibold text-text-primary focus:outline-none"
          />
          <button
            type="button"
            aria-label="Increase points"
            onClick={() => setValue((current) => clamp(current + 10))}
            className="w-11 h-full text-text-secondary hover:text-text-primary text-[18px] font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Previous → new preview */}
      <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-1">
        <div className="flex justify-between font-caption text-caption text-text-secondary">
          <span>Previous points</span>
          <span className="font-semibold text-text-primary">{currentPoints.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-caption text-caption text-text-secondary">
          <span>Adding now</span>
          <span className="font-semibold text-badge-discount-text">+{value.toLocaleString()}</span>
        </div>
        <div className="h-px bg-border-subtle" />
        <div className="flex justify-between font-label-md text-label-md text-text-primary font-bold">
          <span>New total</span>
          <span>{(currentPoints + value).toLocaleString()} pts</span>
        </div>
      </div>

      <div className="flex gap-space-xs pt-space-2xs">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-text-secondary font-button-secondary text-button-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={value <= 0}
          onClick={() => onAward(value)}
          className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
        >
          <Icon name="stars" className="text-[17px]" />
          <span>Award {value.toLocaleString()} pts</span>
        </button>
      </div>
    </ModalShell>
  );
}

/** Small modal listing the rewards the customer has already unlocked. */
export function PosRewardsModal({
  customerName,
  points,
  projectedTotal,
  onClose,
}: {
  customerName: string;
  points: number;
  /** Balance after this order's points land — marks rewards this sale unlocks. */
  projectedTotal?: number;
  onClose: () => void;
}) {
  const eligible = unlockedRewards(points);
  const cap = projectedTotal ?? points;
  const afterOrder = cap > points ? LOYALTY_REWARDS.filter((reward) => reward.points > points && reward.points <= cap) : [];
  const next = nextReward(points);
  const { redemptionThreshold } = usePosSettings();
  const canRedeem = points >= redemptionThreshold;

  return (
    <ModalShell
      icon="workspace_premium"
      title="Eligible rewards"
      subtitle={`${customerName} · ${points.toLocaleString()} pts`}
      onClose={onClose}
    >
      {eligible.length === 0 && afterOrder.length === 0 ? (
        <div className="rounded-xl bg-surface-subtle p-space-md flex flex-col items-center text-center gap-space-xs">
          <Icon name="redeem" className="text-text-tertiary text-[26px]" />
          <span className="font-label-md text-label-md text-text-primary font-semibold">No rewards unlocked yet</span>
          {next && (
            <span className="font-caption text-caption text-text-secondary">
              {(next.points - points).toLocaleString()} pts to {next.label}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-space-xs">
          {eligible.map((reward) => (
            <div
              key={reward.points}
              className="rounded-xl bg-badge-discount-bg p-space-sm flex items-center justify-between gap-space-xs"
            >
              <span className="flex items-center gap-space-xs min-w-0">
                <span className="w-8 h-8 rounded-lg bg-badge-discount-text/15 text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name={reward.icon} className="text-[17px]" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                    {reward.label}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Unlocked at {reward.points.toLocaleString()} pts
                  </span>
                </span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold shrink-0 ${
                  canRedeem ? 'bg-badge-discount-text text-white' : 'bg-surface-container-high text-text-secondary'
                }`}
              >
                {canRedeem ? 'Eligible' : 'Locked'}
              </span>
            </div>
          ))}
          {afterOrder.map((reward) => (
            <div
              key={reward.points}
              className="rounded-xl bg-surface-subtle border border-dashed border-border-subtle p-space-sm flex items-center justify-between gap-space-xs"
            >
              <span className="flex items-center gap-space-xs min-w-0">
                <span className="w-8 h-8 rounded-lg bg-surface-container-high text-text-secondary flex items-center justify-center shrink-0">
                  <Icon name={reward.icon} className="text-[17px]" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                    {reward.label}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Unlocks at {reward.points.toLocaleString()} pts
                  </span>
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold shrink-0">
                After this order
              </span>
            </div>
          ))}
        </div>
      )}

      {next && (
        <p className="font-caption text-caption text-text-tertiary">
          Next reward: {next.label} at {next.points.toLocaleString()} pts — {(next.points - points).toLocaleString()}{' '}
          pts away.
        </p>
      )}
      <p className="font-caption text-caption text-text-tertiary">
        Redemption threshold: {redemptionThreshold.toLocaleString()} pts
        {!canRedeem && <> — {(redemptionThreshold - points).toLocaleString()} pts away</>}.
      </p>
    </ModalShell>
  );
}


