import type {
  LoyaltyReward,
  LoyaltyRules,
  LoyaltyRulesPatch,
  LoyaltyStats,
  PointLog,
  RewardCategory,
} from '../services/loyaltyService';
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

/** Bonuses fall back to these values when a disabled rule is switched back on. */
export const DEFAULT_BONUS = { birthdayBonus: 500, referralBonus: 200 };

/** Live bonus labels: a zero bonus is shown as off, never as a sample figure. */
export const birthdayRuleLabel = (rules: LoyaltyRules) =>
  rules.birthdayBonus > 0
    ? `+${rules.birthdayBonus.toLocaleString('en-US')} Points on customer birthday week`
    : 'Birthday bonus is off';

export const referralRuleLabel = (rules: LoyaltyRules) =>
  rules.referralBonus > 0
    ? `+${rules.referralBonus.toLocaleString('en-US')} Points per referral`
    : 'Referral bonus is off';

/** The four earning rules supported by `PATCH /loyalty/rules`. */
export type EarningRuleKey = 'spend' | 'visit' | 'birthday' | 'referral';

type NumericRuleField =
  | 'spendingBaseAmount'
  | 'spendingBasePoints'
  | 'visitPoints'
  | 'visitCooldownHours'
  | 'birthdayBonus'
  | 'referralBonus';

export interface EditableRuleField {
  field: NumericRuleField;
  label: string;
  min: number;
}

/** Inline editor fields for each live rule (the same fields in both views). */
export const EDITABLE_RULE_FIELDS: Record<EarningRuleKey, EditableRuleField[]> = {
  spend: [
    { field: 'spendingBaseAmount', label: 'Spend amount (₦)', min: 1 },
    { field: 'spendingBasePoints', label: 'Points awarded', min: 1 },
  ],
  visit: [
    { field: 'visitPoints', label: 'Points per visit', min: 0 },
    { field: 'visitCooldownHours', label: 'Cooldown (hours)', min: 0 },
  ],
  birthday: [{ field: 'birthdayBonus', label: 'Birthday points', min: 0 }],
  referral: [{ field: 'referralBonus', label: 'Referral points', min: 0 }],
};

/** Current values of a rule's editable fields, read from the live rules response. */
export const ruleEditValues = (rules: LoyaltyRules, key: EarningRuleKey) =>
  Object.fromEntries(EDITABLE_RULE_FIELDS[key].map(({ field }) => [field, Number(rules[field]) || 0])) as Record<
    NumericRuleField,
    number
  >;

/** A safe PATCH body from the inline editor's numeric inputs. */
export const rulePatchFromValues = (
  key: EarningRuleKey,
  values: Record<NumericRuleField, number>,
): LoyaltyRulesPatch =>
  Object.fromEntries(
    EDITABLE_RULE_FIELDS[key].map(({ field, min }) => [field, Math.max(min, Number(values[field]) || 0)]),
  ) as LoyaltyRulesPatch;

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

/** Points taken off: redemptions and staff deductions (`adjusted`, stored negative). */
export const isDebit = (log: PointLog) => isRedemption(log) || Number(log.amount) < 0;

/** A points movement for the activity lists. */
export const logEntry = (log: PointLog) => ({
  member: logMember(log),
  delta: `${isDebit(log) ? '-' : '+'}${pointsLabel(logPoints(log))}`,
  positive: !isDebit(log),
  reason: log.reason || (isRedemption(log) ? 'Points redeemed' : isDebit(log) ? 'Points deducted' : 'Points earned'),
  date: whenLabel(log.createdAt),
  branch: log.branch?.name ?? '',
});
