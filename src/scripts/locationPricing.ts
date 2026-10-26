/**
 * Business-location pricing — the single source of truth for how much a
 * business pays for its locations (onboarding checkout AND later additions
 * from the dashboard use these same rules).
 *
 * Frontend-only for now: `DEFAULT_LOCATION_PRICING` stands in for an
 * admin-managed pricing record, and `setLocationPricing()` mirrors the exact
 * shape an admin/API response would deliver. When a real backend exists, only
 * the storage read inside `getLocationPricing()` needs to be swapped for the
 * API call — every screen already reads through it.
 *
 * Rules:
 * - The first `freeLocations` locations are free. With the default of 1 that
 *   is the primary business location, which is always free.
 * - Every location beyond the free count costs `pricePerAdditionalLocation`
 *   (default ₦2,000) as a one-time fee — e.g. three extra locations total
 *   ₦6,000.
 */

export interface LocationPricingConfig {
  /** How many locations a business gets for free (the primary location is always within this count). */
  freeLocations: number;
  /** One-time fee, in naira, for each location beyond the free count. */
  pricePerAdditionalLocation: number;
}

export const DEFAULT_LOCATION_PRICING: LocationPricingConfig = {
  freeLocations: 1,
  pricePerAdditionalLocation: 2000,
};

/** localStorage stand-in for the admin-controlled pricing record. */
const PRICING_STORAGE_KEY = 'vemtap_location_pricing_v1';

function isValidPricing(value: unknown): value is LocationPricingConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LocationPricingConfig>;
  const isCount =
    typeof candidate.freeLocations === 'number' &&
    Number.isInteger(candidate.freeLocations) &&
    candidate.freeLocations >= 0;
  const isPrice =
    typeof candidate.pricePerAdditionalLocation === 'number' &&
    Number.isFinite(candidate.pricePerAdditionalLocation) &&
    candidate.pricePerAdditionalLocation >= 0;
  return isCount && isPrice;
}

/**
 * Current pricing: the defaults, overridden by any admin-supplied config
 * saved on this device. Every fee calculation in the app goes through here so
 * an admin change (or future API value) applies everywhere at once.
 */
export function getLocationPricing(): LocationPricingConfig {
  try {
    const raw = window.localStorage.getItem(PRICING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isValidPricing(parsed)) {
        // The primary business location is always free, so the free count
        // can never be configured below 1.
        return { ...parsed, freeLocations: Math.max(1, parsed.freeLocations) };
      }
    }
  } catch {
    // Storage blocked or payload unreadable — fall back to the defaults.
  }
  return DEFAULT_LOCATION_PRICING;
}

/**
 * Admin hook (frontend stand-in): persist a pricing override, e.g.
 * `{ freeLocations: 2, pricePerAdditionalLocation: 1500 }`. Pass `null` to
 * clear the override and fall back to the defaults. Invalid payloads are
 * ignored rather than clobbering a good config.
 */
export function setLocationPricing(config: LocationPricingConfig | null): void {
  try {
    if (config === null || !isValidPricing(config)) {
      window.localStorage.removeItem(PRICING_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable — the in-memory default still applies.
  }
}

/**
 * One-time fee for a single location.
 *
 * @param locationIndex 0-based index across ALL of a business's locations,
 *   where index 0 is the primary location (so index 1 is the first
 *   additional location).
 */
export function locationFeeAt(
  locationIndex: number,
  config: LocationPricingConfig = getLocationPricing(),
): number {
  return locationIndex < config.freeLocations ? 0 : config.pricePerAdditionalLocation;
}

/** Total one-time fee across the given 0-based location indexes. */
export function locationsFeeTotal(
  locationIndexes: number[],
  config: LocationPricingConfig = getLocationPricing(),
): number {
  return locationIndexes.reduce((sum, index) => sum + locationFeeAt(index, config), 0);
}

/** `'₦2,000'` — the naira display format used across the app. */
export function formatNaira(amount: number): string {
  return `₦${new Intl.NumberFormat('en-NG').format(amount)}`;
}
