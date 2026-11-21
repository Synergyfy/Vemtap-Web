import type { LocationAccessSummary } from '../services/subscriptionService';

type Limit = number | 'unlimited';
type Money = number | string | null | undefined;

/** Backend-derived limit text — no frontend allowance defaults. */
export function formatLocationLimit(limit: Limit | null | undefined): string {
  if (limit === 'unlimited') return 'Unlimited';
  if (limit == null) return '—';
  return String(Math.max(0, limit));
}

/** Money is formatted from the currency supplied by backend configuration. */
export function formatLocationMoney(
  amount: Money,
  currency: string | null | undefined,
): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const code = currency?.trim() || 'NGN';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${code} ${new Intl.NumberFormat('en-NG').format(value)}`;
  }
}

export function locationAllowanceLabel(access: LocationAccessSummary): string {
  const total = formatLocationLimit(access.allowance.total);
  return `${access.usage.total} / ${total}`;
}

export function locationPlanLabel(access: LocationAccessSummary): string {
  const planName = access.plan.name || 'Current plan';
  const suffix = access.plan.isTrial ? ' (Trial)' : '';
  return `${planName}${suffix}`;
}

export function planLocationLabel(
  plan: LocationAccessSummary['upgradePlans'][number],
): string {
  if (!plan.locationsEnabled) return 'Locations not included';
  return `${formatLocationLimit(plan.locationLimit)} locations`;
}

export function purchaseTermLabel(
  option: LocationAccessSummary['purchaseOption'],
): string {
  if (!option.available) return 'Purchases are not configured';
  const locations = `${option.locationsPerPurchase} location${option.locationsPerPurchase === 1 ? '' : 's'}`;
  const price = formatLocationMoney(option.price, option.currency);
  const terms =
    option.billingType === 'recurring'
      ? ` • recurring${option.expiresAfterDays ? ` • ${option.expiresAfterDays}-day term` : ''}`
      : option.billingType === 'one_time'
        ? ' • one-time'
        : option.expiresAfterDays
          ? ` • ${option.expiresAfterDays}-day term`
          : '';
  const cap =
    option.remainingPurchasable == null
      ? ''
      : ` • ${option.remainingPurchasable} still purchasable`;
  return `${locations} for ${price}${terms}${cap}`;
}

/** Admin-configured price for one location slot, derived from the add-on bundle. */
export function locationPricePerLocation(
  option: LocationAccessSummary['purchaseOption'],
): number {
  const perPurchase = Number(option.locationsPerPurchase) || 0;
  const price = Number(option.price) || 0;
  if (perPurchase <= 0 || price <= 0) return 0;
  return price / perPurchase;
}

/** Live total for the requested number of location slots. */
export function locationPurchaseTotal(
  option: LocationAccessSummary['purchaseOption'],
  locations: number,
): number {
  return locationPricePerLocation(option) * Math.max(0, locations);
}

export function branchAccessLabel(
  access: LocationAccessSummary['branches'][number],
): string {
  if (access.access === 'restricted') return 'Restricted';
  if (access.access === 'paused') return 'Paused';
  if (access.isPrimary) return access.isActive ? 'Active • Primary' : 'Paused • Primary';
  if (access.isPurchased) return access.isActive ? 'Active • Purchased' : 'Paused • Purchased';
  return access.isActive ? 'Active' : 'Paused';
}
