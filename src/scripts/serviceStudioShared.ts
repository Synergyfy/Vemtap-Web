export interface ServicePolicy {
  id: string;
  title: string;
  body: string;
  preset: boolean;
  removable: boolean; // true if the business can remove this policy
  locked?: boolean; // if true, cannot be removed (e.g. compliance)
}

export const PRESET_POLICIES: ServicePolicy[] = [
  {
    id: 'free-cancellation',
    title: 'Free Cancellation',
    body: 'Complimentary cancellation up to 2 hours before scheduled session start.',
    preset: true,
    removable: true,
  },
  {
    id: 'late-arrival',
    title: 'Late Arrival Grace Window',
    body: '15 minutes buffer window maintained before the appointment slot is released.',
    preset: true,
    removable: true,
  },
  {
    id: 'pay-at-reception',
    title: 'Pay at Reception',
    body: 'Customers pay directly at your salon after treatment.',
    preset: true,
    removable: false,
    locked: true,
  },
];

export interface ServiceLocation {
  id: 'main' | 'maitama' | 'wuseII' | 'garki';
  name: string;
  address: string;
  eligible: boolean;
  note?: string;
  badge?: string;
}

export const SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: 'main',
    name: 'Downtown Flagship (Main Branch)',
    address: 'Plot 14 Amazon Street, Maitama',
    eligible: true,
    badge: 'Flagship',
  },
  {
    id: 'maitama',
    name: 'Maitama Heights Studio',
    address: 'Plot 14 Amazon Street, Maitama',
    eligible: true,
    badge: 'Flagship',
  },
  {
    id: 'wuseII',
    name: 'Wuse II Sanctuary',
    address: 'Plot 1428 Adetokunbo Ademola Cres',
    eligible: true,
  },
  {
    id: 'garki',
    name: 'Garki Branch',
    address: 'Area 11 Commercial District, Garki',
    eligible: false,
    note: 'Opening June',
  },
];

export interface ServiceValidationErrors {
  identity: string[];
  locations: string[];
  description: string[];
  pricing: string[];
  policies: string[];
}

export function validateServiceStep(
  step: 1 | 2 | 3 | 4 | 5,
  draft: ServiceValidationBase
): ServiceValidationErrors {
  const errors: ServiceValidationErrors = {
    identity: [],
    locations: [],
    description: [],
    pricing: [],
    policies: [],
  };

  switch (step) {
    case 1:
      if (!draft.title?.trim()) errors.identity.push('Service title is required');
      if (!draft.image) errors.identity.push('Service image is required');
      // primaryCategory is always inherited from the business profile — no user input needed.
      break;
    case 2:
      if (!draft.locations?.length) errors.locations.push('Select at least one business location or branch');
      break;
    case 3:
      if (!draft.description?.trim()) errors.description.push('Service description is required');
      if (!draft.deliveryFormat) errors.description.push('Delivery format is required');
      break;
    case 4:
      if (!draft.basePrice) errors.pricing.push('Base session price is required');
      if (!draft.standardPrice) errors.pricing.push('Standard price is required');
      if (!draft.comparePrice) errors.pricing.push('Comparison price is required');
      if (!draft.durationMins) errors.pricing.push('Session duration is required');
      if (draft.concurrentBookings == null) errors.pricing.push('Concurrent booking limit is required');
      break;
    case 5:
      if (!draft.policies?.some((p: ServicePolicy) => p.preset || p.removable)) errors.policies.push('Add at least one policy');
      break;
  }

  return errors;
}

export function validateAllServiceSteps(draft: ServiceValidationBase): ServiceValidationErrors {
  const s1 = validateServiceStep(1, draft);
  const s2 = validateServiceStep(2, draft);
  const s3 = validateServiceStep(3, draft);
  const s4 = validateServiceStep(4, draft);
  const s5 = validateServiceStep(5, draft);

  return {
    identity: s1.identity,
    locations: s2.locations,
    description: s3.description,
    pricing: s4.pricing,
    policies: s5.policies,
  };
}

export function hasServiceValidationErrors(errors: ServiceValidationErrors): boolean {
  return (
    errors.identity.length > 0 ||
    errors.locations.length > 0 ||
    errors.description.length > 0 ||
    errors.pricing.length > 0 ||
    errors.policies.length > 0
  );
}


export interface ServiceValidationBase {
  title?: string;
  image?: string;
  primaryCategory?: string;
  standardPrice?: string;
  basePrice?: string;
  comparePrice?: string;
  durationMins?: number;
  concurrentBookings?: number;
  policies?: ServicePolicy[];
  locations?: string[];
  description?: string;
  deliveryFormat?: 'in-salon' | 'mobile' | 'both';
}

/** Simple check: does the given object satisfy the base structural shape? */
export function isValidDraftBase(draft: unknown): draft is ServiceValidationBase {
  return (
    typeof draft === 'object' &&
    draft !== null &&
    ('title' in draft || 'image' in draft || 'standardPrice' in draft)
  );
}

/** Derive branches boolean object from a locations array (for backward compat). */
export function locationsToBranches(locations: string[]): {
  maitama: boolean;
  wuseII: boolean;
  garki: boolean;
} {
  return {
    maitama: locations.includes('maitama'),
    wuseII: locations.includes('wuseII'),
    garki: locations.includes('garki'),
  };
}

/** Derive locations array from the branches object (for backward compat). */
export function branchesToLocations(branches: {
  maitama: boolean;
  wuseII: boolean;
  garki: boolean;
}): string[] {
  const locs: string[] = [];
  if (branches.maitama) locs.push('maitama');
  if (branches.wuseII) locs.push('wuseII');
  if (branches.garki) locs.push('garki');
  return locs;
}