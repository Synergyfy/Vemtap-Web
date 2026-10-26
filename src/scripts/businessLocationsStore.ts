/**
 * Persistence for locations the merchant adds from the dashboard AFTER
 * registration (the paid, ₦2,000-per-extra-location flow). Seeded with the two
 * demo locations the dashboard already ships with so the list never looks empty
 * on a fresh device.
 *
 * Kept intentionally tiny and framework-free: the flow container, the mobile
 * locations hub and the desktop locations hub all read from the same key.
 */

export interface AddedBusinessLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  /** ISO timestamp — used for stable keys and ordering. */
  addedAt: string;
  /** One-time location fee captured at checkout (₦). */
  feePaid: number;
}

const STORE_KEY = 'vemtap_added_business_locations_v1';

/** Demo locations already present in the dashboard before any real add. */
const SEED_LOCATIONS: AddedBusinessLocation[] = [
  {
    id: 'seed-maitama',
    name: 'Maitama Flagship',
    address: 'Plot 14 Amazon Street, Maitama Heights',
    district: 'Maitama, Abuja',
    addedAt: '2026-01-12T09:00:00.000Z',
    feePaid: 0,
  },
  {
    id: 'seed-victoria-island',
    name: 'Victoria Island',
    address: '18 Adetokunbo Ademola Street',
    district: 'Victoria Island, Lagos',
    addedAt: '2026-03-04T09:00:00.000Z',
    feePaid: 0,
  },
];

function seed(): AddedBusinessLocation[] {
  return SEED_LOCATIONS.map((location) => ({ ...location }));
}

export function getAddedBusinessLocations(): AddedBusinessLocation[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seed();
    return parsed.filter(
      (entry): entry is AddedBusinessLocation =>
        Boolean(entry) && typeof entry.id === 'string' && typeof entry.name === 'string',
    );
  } catch {
    return seed();
  }
}

/** Total number of locations the business currently has (seeded + added). */
export function getBusinessLocationCount(): number {
  return getAddedBusinessLocations().length;
}

/** Records a location whose one-time fee was captured at checkout. */
export function addPaidBusinessLocation(location: Omit<AddedBusinessLocation, 'addedAt'>): AddedBusinessLocation[] {
  const record: AddedBusinessLocation = { ...location, addedAt: new Date().toISOString() };
  const next = [...getAddedBusinessLocations(), record];
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode) — keep the in-memory list only.
  }
  return next;
}
