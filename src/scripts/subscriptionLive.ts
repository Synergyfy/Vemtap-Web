import {
  planPrice,
  type BillingPeriod,
  type CreditPlan,
  type Plan,
  type Subscription,
} from '../services/subscriptionService';
import { formatNaira } from '../utils/format';

/**
 * Live subscription helpers shared by the billing and add-on screens: which
 * plan the marketing cards feature, price lines, live trial state, and the
 * credit bundle each card sells.
 */

/** The plan the pricing cards feature: popular first, then the first paid plan. */
export function featuredPlan(plans: Plan[]): Plan | null {
  if (!plans.length) return null;
  return (
    plans.find((plan) => plan.isPopular && !plan.isFree) ??
    plans.find((plan) => !plan.isFree) ??
    plans[0]
  );
}

/** "₦5,000 / month" for a plan at one billing period. */
export function planPriceLine(plan: Plan, period: BillingPeriod = 'monthly'): string {
  const suffix = period === 'yearly' ? '/ year' : period === 'quarterly' ? '/ quarter' : '/ month';
  return `${formatNaira(planPrice(plan, period))} ${suffix}`;
}

/** Days left on a live trial subscription, or null when there is none. */
export function trialDaysLeft(sub?: Subscription | null): number | null {
  if (!sub || sub.status !== 'trial') return null;
  if (typeof sub.daysRemaining === 'number') return sub.daysRemaining;
  if (!sub.trialEndsAt && !sub.endDate) return null;
  const ends = new Date(sub.trialEndsAt ?? sub.endDate ?? '').getTime();
  if (Number.isNaN(ends)) return null;
  return Math.max(0, Math.ceil((ends - Date.now()) / 86_400_000));
}

/** "1 Nov 2025" for renewal / end dates, or null when absent or past. */
export function renewalDate(iso?: string | null): string | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time) || time < Date.now()) return null;
  return new Date(time).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The cheapest live credit bundle that includes a given credit type. */
export function cheapestCreditPlan(plans: CreditPlan[], kind: 'sms' | 'ai' | 'email' | 'whatsapp'): CreditPlan | null {
  const withKind = plans.filter((plan) => (plan[`${kind}Amount`] ?? 0) > 0);
  if (!withKind.length) return null;
  return withKind.reduce((best, plan) => (Number(plan.price) < Number(best.price) ? plan : best));
}

/** "₦1,500 / 250 SMS" for a live credit bundle; null when no bundle exists. */
export function creditBundleLine(plan: CreditPlan | null, kind: 'sms' | 'ai'): string | null {
  if (!plan) return null;
  const amount = kind === 'sms' ? plan.smsAmount : plan.aiAmount;
  if (!amount) return null;
  return `${formatNaira(Number(plan.price))} / ${amount} ${kind.toUpperCase()}`;
}
