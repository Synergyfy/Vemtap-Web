import type { LoyaltyReward, LoyaltyRules, LoyaltyStats, PointLog, RewardCategory } from '../services/loyaltyService';
import { formatNaira } from '../utils/format';
import { whenLabel } from './customersLive';

/**
 * Display values for live loyalty, shared by the loyalty screens so each one
 * maps real rules, rewards and points history into its own row shape.
 */

/** A figure from `GET /loyalty/business-stats` by its label ("Points Issued"). */
export const statValue = (stats: LoyaltyStats | undefined, label: string) => {
  const value = stats?.stats?.find((stat) => stat.label === label)?.value;
  return value == null ? '—' : Number(value).toLocaleString('en-US');
};

/** Month-on-month change for a stat, e.g. "+14% this month", or '' when flat or unknown. */
export const statChange = (stats: LoyaltyStats | undefined, label: string) => {
  const change = stats?.stats?.find((stat) => stat.label === label)?.change;
  return change ? `${change > 0 ? '+' : ''}${Math.round(change)}% this month` : '';
};

/** "₦10 spent = 1 point" */
export const spendRuleLabel = (rules: LoyaltyRules) =>
  `${formatNaira(rules.spendingBaseAmount)} spent = ${rules.spendingBasePoints} point${rules.spendingBasePoints === 1 ? '' : 's'}`;

export const earnsOnSpend = (rules: LoyaltyRules) => rules.ruleType !== 'visit';
export const earnsOnVisit = (rules: LoyaltyRules) => rules.ruleType !== 'spending';

/** The rule type for a spend/visit on-off pair; null when both are off. */
export const ruleTypeFor = (spend: boolean, visit: boolean): LoyaltyRules['ruleType'] | null =>
  spend && visit ? 'hybrid' : spend ? 'spending' : visit ? 'visit' : null;

/** Bonuses fall back to the backend defaults when switched back on. */
export const DEFAULT_BONUS = { birthdayBonus: 500, referralBonus: 200 };

export type RewardStatus = 'active' | 'draft' | 'archived';

/** Live rewards: running, paused (the draft tab) or past their end date (archived). */
export const rewardStatus = (reward: LoyaltyReward, now = Date.now()): RewardStatus => {
  if (reward.expiryDate && new Date(reward.expiryDate).getTime() < now) return 'archived';
  return reward.isActive === false ? 'draft' : 'active';
};

/** How many have been redeemed, when the reward has a fixed stock. */
export const rewardRedeemed = (reward: LoyaltyReward) =>
  reward.totalQuantity != null && reward.totalQuantity >= 0 && reward.remainingQuantity != null
    ? reward.totalQuantity - reward.remainingQuantity
    : null;

export const rewardRedeemedLabel = (reward: LoyaltyReward) => {
  const redeemed = rewardRedeemed(reward);
  return redeemed == null ? '—' : `${redeemed.toLocaleString('en-US')} redeemed`;
};

export const rewardStockLabel = (reward: LoyaltyReward) =>
  reward.totalQuantity == null || reward.totalQuantity < 0
    ? 'Unlimited Stock'
    : `${(reward.remainingQuantity ?? 0).toLocaleString('en-US')} left`;

const monthDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** "Redeem by Dec 31" / "Ended Sep 30" / "No expiry set". */
export const rewardWindowLabel = (reward: LoyaltyReward) => {
  if (!reward.expiryDate) return 'No expiry set';
  return rewardStatus(reward) === 'archived' ? `Ended ${monthDay(reward.expiryDate)}` : `Redeem by ${monthDay(reward.expiryDate)}`;
};

export const pointsLabel = (points: number) => points.toLocaleString('en-US');

export const REWARD_CATEGORY_LABEL: Record<RewardCategory, string> = {
  custom_discount: 'Voucher',
  free_product: 'Free Item',
  service_upgrade: 'Upgrade',
  tangible_gifts: 'Gift',
};

/** A new reward from the quick form: a voucher with unlimited stock that runs for a year. */
export const newRewardDefaults = (name: string, points: number, branchId: string) => ({
  name,
  description: name,
  pointsRequired: points,
  category: 'custom_discount' as RewardCategory,
  branchId,
  totalQuantity: -1,
  expiryDate: new Date(Date.now() + 365 * 86_400_000).toISOString(),
});

export const isRedemption = (log: PointLog) => log.type.toLowerCase() === 'redeemed';

export const logMember = (log: PointLog) =>
  [log.customer?.firstName, log.customer?.lastName].filter(Boolean).join(' ') || 'Customer';

export const logPoints = (log: PointLog) => Math.abs(Number(log.amount) || 0);

/** A points movement for the activity lists. */
export const logEntry = (log: PointLog) => ({
  member: logMember(log),
  delta: `${isRedemption(log) ? '-' : '+'}${pointsLabel(logPoints(log))}`,
  positive: !isRedemption(log),
  reason: log.reason || (isRedemption(log) ? 'Points redeemed' : 'Points earned'),
  date: whenLabel(log.createdAt),
  branch: log.branch?.name ?? '',
});
