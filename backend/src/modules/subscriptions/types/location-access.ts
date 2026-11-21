export type LocationLimit = number | 'unlimited';
export type LocationAccessState = 'active' | 'restricted' | 'paused';
export type LocationEntitlementSource = 'free' | 'subscription' | 'purchased';
export type LocationBillingType = 'one_time' | 'recurring' | null;
export type LocationBlockedReason =
  | 'PLAN_LIMIT_REACHED'
  | 'PLAN_FEATURE_NOT_INCLUDED';

export interface LocationAccessBranch {
  id: string;
  name: string;
  isPrimary: boolean;
  isActive: boolean;
  access: LocationAccessState;
  restrictionReason: string | null;
  entitlementSource: LocationEntitlementSource | null;
  isFree: boolean;
  isPurchased: boolean;
  address: string | null;
}

export interface LocationPurchasedEntitlement {
  id: string;
  name: string;
  locations: number;
  billingType: LocationBillingType;
  expiresAt: Date | null;
  purchasedAt: Date;
}

/**
 * Breaking the allowance down makes the UI config-driven. `subscription` is
 * the number of EXTRA locations the plan adds after the permanent free one;
 * `purchased` comes from admin-configured location add-ons and is tracked
 * separately so expiry/downgrade can be explained without deleting branches.
 */
export interface LocationAccessAllowance {
  free: number;
  subscription: LocationLimit;
  purchased: number;
  total: LocationLimit;
}

export interface LocationPurchaseOption {
  available: boolean;
  /** True when an active, priced location add-on can be bought standalone. */
  checkoutEnabled: boolean;
  addonId: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  billingType: LocationBillingType;
  locationsPerPurchase: number;
  /** Honoured when an add-on is later configured with this optional limit. */
  maxPurchasable: number | null;
  remainingPurchasable: number | null;
  expiresAfterDays: number | null;
}

export interface LocationUpgradePlan {
  id: string;
  name: string;
  /** Total locations (including the free primary location). */
  locationLimit: LocationLimit;
  locationsEnabled: boolean;
  currency: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  isFree: boolean;
  permissionsConfigured: boolean;
  isCurrent: boolean;
}

export interface LocationAccessSummary {
  plan: {
    id: string | null;
    name: string;
    isActive: boolean;
    isTrial: boolean;
  };
  usage: {
    total: number;
    primary: number;
    active: number;
    restricted: number;
    paused: number;
  };
  allowance: LocationAccessAllowance;
  purchases: LocationPurchasedEntitlement[];
  canAddLocation: boolean;
  blockedReason: LocationBlockedReason | null;
  /** Records are never deleted; excess locations are marked restricted. */
  restrictionPolicy: 'restrict';
  notice: string | null;
  branches: LocationAccessBranch[];
  upgradePlans: LocationUpgradePlan[];
  purchaseOption: LocationPurchaseOption;
}
