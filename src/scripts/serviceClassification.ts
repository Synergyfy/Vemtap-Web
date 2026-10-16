/**
 * Service classification helper.
 *
 * A business already declares its primary category and sub-category during
 * business setup. The service editor must not ask for that classification
 * again: a service inherits the relevant business classification, and that
 * classification drives which service-specific settings and suggested policies
 * are surfaced to the merchant.
 *
 * The resolver accepts either the onboarding category *values* used by the
 * mobile flow (e.g. `spa`) or the category *labels* used by the desktop flow
 * (e.g. `Health & Wellness`), so both platforms resolve to the same sector.
 */

export type ServiceSector = 'wellness' | 'dining' | 'fashion' | 'grocery' | 'localServices' | 'general';

export interface SuggestedPolicy {
  id: string;
  title: string;
  body: string;
  icon: string;
}

export interface ServiceSectorPreset {
  id: ServiceSector;
  /** Human label for the sector, e.g. "Spa & Wellness". */
  label: string;
  /** How a session is described for this sector (service / treatment / reservation). */
  treatmentNoun: string;
  /** Recommended delivery format for this sector. */
  defaultDeliveryFormat: 'in-salon' | 'mobile' | 'both';
  /** Recommended buffer between appointments, in minutes. */
  defaultBufferMins: number;
  /** Fallback classification when the business profile is unavailable. */
  defaultCategory: string;
  defaultSubCategory: string;
  /** Service-specific settings/policies the merchant should consider. */
  suggestedPolicies: SuggestedPolicy[];
}

const SECTOR_PRESETS: Record<ServiceSector, ServiceSectorPreset> = {
  wellness: {
    id: 'wellness',
    label: 'Spa & Wellness',
    treatmentNoun: 'treatment',
    defaultDeliveryFormat: 'in-salon',
    defaultBufferMins: 15,
    defaultCategory: 'Spa & Wellness',
    defaultSubCategory: 'Skincare & Facials',
    suggestedPolicies: [
      {
        id: 'wellness-consent',
        title: 'Client Screening & Consent',
        body: 'Capture a short health and contraindication questionnaire plus signed consent before the first treatment.',
        icon: 'fact_check',
      },
      {
        id: 'wellness-patch-test',
        title: 'Patch Test & Allergy Check',
        body: 'Offer a patch test at least 24 hours before chemical, peel, or intensive treatments.',
        icon: 'healing',
      },
      {
        id: 'wellness-aftercare',
        title: 'Aftercare Guidance',
        body: 'Send post-treatment aftercare steps and product recommendations so results last longer.',
        icon: 'spa',
      },
    ],
  },
  dining: {
    id: 'dining',
    label: 'Food & Dining',
    treatmentNoun: 'service',
    defaultDeliveryFormat: 'in-salon',
    defaultBufferMins: 10,
    defaultCategory: 'Restaurant & Dining',
    defaultSubCategory: 'Fine Dining',
    suggestedPolicies: [
      {
        id: 'dining-allergen',
        title: 'Allergen & Dietary Disclosure',
        body: 'Publish allergen and dietary information so guests can order with confidence.',
        icon: 'restaurant',
      },
      {
        id: 'dining-reservation',
        title: 'Reservation & No-show Policy',
        body: 'State how far ahead bookings can be made and how late cancellations or no-shows are handled.',
        icon: 'event_seat',
      },
      {
        id: 'dining-safety',
        title: 'Food Safety & Handling',
        body: 'Follow cold-chain, storage, and hygiene standards for every preparation and handover.',
        icon: 'kitchen',
      },
    ],
  },
  fashion: {
    id: 'fashion',
    label: 'Fashion & Apparel',
    treatmentNoun: 'service',
    defaultDeliveryFormat: 'in-salon',
    defaultBufferMins: 10,
    defaultCategory: 'Fashion & Apparel',
    defaultSubCategory: 'Accessories',
    suggestedPolicies: [
      {
        id: 'fashion-fit',
        title: 'Fitting & Measurement',
        body: 'Record measurements or run a fitting before production so the piece matches the client.',
        icon: 'straighten',
      },
      {
        id: 'fashion-turnaround',
        title: 'Alteration Turnaround',
        body: 'Commit to a clear turnaround window and note any rush surcharge up front.',
        icon: 'schedule',
      },
      {
        id: 'fashion-care',
        title: 'Garment Care Guidance',
        body: 'Share washing, storage, and repair guidance to protect the item after purchase.',
        icon: 'dry_cleaning',
      },
    ],
  },
  grocery: {
    id: 'grocery',
    label: 'Groceries & Market',
    treatmentNoun: 'service',
    defaultDeliveryFormat: 'mobile',
    defaultBufferMins: 5,
    defaultCategory: 'Groceries & Market',
    defaultSubCategory: 'Fresh Produce',
    suggestedPolicies: [
      {
        id: 'grocery-substitution',
        title: 'Out-of-stock Substitution',
        body: 'Explain how substitutes are chosen (or let the customer opt out) when an item runs out.',
        icon: 'swap_horiz',
      },
      {
        id: 'grocery-window',
        title: 'Delivery Window & Fees',
        body: 'Publish delivery windows, cut-off times, and any fees before checkout.',
        icon: 'local_shipping',
      },
      {
        id: 'grocery-freshness',
        title: 'Freshness Guarantee',
        body: 'State the quality guarantee and how customers can report an item that misses the mark.',
        icon: 'verified_user',
      },
    ],
  },
  localServices: {
    id: 'localServices',
    label: 'Local Services & Repair',
    treatmentNoun: 'service',
    defaultDeliveryFormat: 'mobile',
    defaultBufferMins: 15,
    defaultCategory: 'Local Services & Repair',
    defaultSubCategory: 'Cleaning Services',
    suggestedPolicies: [
      {
        id: 'services-diagnostic',
        title: 'Diagnostic & Call-out Fee',
        body: 'Clarify any call-out or diagnostic charge and whether it is credited toward the repair.',
        icon: 'receipt_long',
      },
      {
        id: 'services-warranty',
        title: 'Workmanship Warranty',
        body: 'State the warranty period that covers your workmanship and parts.',
        icon: 'verified',
      },
      {
        id: 'services-access',
        title: 'Site Access & Safety',
        body: 'Note access requirements and safety responsibilities before the team arrives on site.',
        icon: 'engineering',
      },
    ],
  },
  general: {
    id: 'general',
    label: 'Your Business',
    treatmentNoun: 'service',
    defaultDeliveryFormat: 'in-salon',
    defaultBufferMins: 15,
    defaultCategory: 'Local Services & Repair',
    defaultSubCategory: 'Cleaning Services',
    suggestedPolicies: [
      {
        id: 'general-cancellation',
        title: 'Free Cancellation Cutoff',
        body: 'Set a complimentary cancellation window so customers know when a fee may apply.',
        icon: 'event_repeat',
      },
      {
        id: 'general-late',
        title: 'Late Arrival Grace Window',
        body: 'Define how long you hold a slot before it is released or a fee applies.',
        icon: 'hourglass_top',
      },
      {
        id: 'general-reminders',
        title: 'Appointment Reminders',
        body: 'Send reminders ahead of the session to reduce no-shows and last-minute changes.',
        icon: 'chat',
      },
    ],
  },
};

/** Canonical label lookup for the category *values* used by the mobile flow. */
const CATEGORY_VALUE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant & Dining',
  spa: 'Spa & Wellness',
  fashion: 'Fashion & Apparel',
  groceries: 'Groceries & Market',
  services: 'Local Services & Repair',
};

/** Keywords (lower-cased substrings) that map a classification onto a sector. */
const SECTOR_KEYWORDS: Array<{ sector: ServiceSector; keywords: string[] }> = [
  {
    sector: 'wellness',
    keywords: [
      'spa',
      'wellness',
      'beauty',
      'health',
      'facial',
      'skincare',
      'massage',
      'therapy',
      'sauna',
      'yoga',
      'fitness',
      'esthetic',
      'salon',
      'barber',
      'nail',
    ],
  },
  {
    sector: 'dining',
    keywords: ['restaurant', 'dining', 'bakery', 'cafe', 'food', 'grill', 'steakhouse', 'bistro', 'catering', 'chef'],
  },
  {
    sector: 'fashion',
    keywords: ['fashion', 'apparel', 'boutique', 'clothing', 'womenswear', 'menswear', 'footwear', 'accessor', 'tailor', 'alteration'],
  },
  {
    sector: 'grocery',
    keywords: ['grocer', 'market', 'produce', 'butcher', 'seafood', 'deli', 'wine', 'spirits', 'pantry'],
  },
  {
    sector: 'localServices',
    keywords: ['repair', 'plumbing', 'electrical', 'cleaning', 'electronic', 'install', 'maintenance'],
  },
];

/** Turn a category value (`spa`) or label into a human-friendly label. */
export function canonicalCategoryLabel(raw: string): string {
  if (!raw) return '';
  return CATEGORY_VALUE_LABELS[raw.toLowerCase()] ?? raw;
}

/** Resolve the most relevant service sector from any business classification. */
export function resolveServiceSector(categories: string[], subcategories: string[] = []): ServiceSector {
  const haystack = [...categories, ...subcategories].map((value) => value.toLowerCase());
  if (haystack.length === 0) return 'general';

  let best: ServiceSector = 'general';
  let bestScore = 0;

  // Iterate in priority order so earlier sectors win ties.
  for (const { sector, keywords } of SECTOR_KEYWORDS) {
    let score = 0;
    for (const candidate of haystack) {
      if (keywords.some((keyword) => candidate.includes(keyword))) score += 1;
    }
    if (score > bestScore) {
      best = sector;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : 'general';
}

export function getServiceSectorPreset(sector: ServiceSector): ServiceSectorPreset {
  return SECTOR_PRESETS[sector];
}

export interface ServiceClassification {
  /** Category label the service inherits from the business profile. */
  primaryCategory: string;
  /** The most relevant sub-category, falling back to a sector default. */
  subCategory: string;
  sector: ServiceSector;
  preset: ServiceSectorPreset;
}

export interface InheritedClassificationOption {
  category: string;
  subCategory: string;
  sector: ServiceSector;
  preset: ServiceSectorPreset;
}

/**
 * Return all distinct classifications that a business legitimately supports,
 * based on its configured categories and subcategories from business setup.
 * If the business supports multiple categories, the service editor can surface
 * these options so the user can easily reference the relevant category without
 * re-entering any business classification details.
 */
export function getBusinessClassificationOptions(
  categories: string[] = [],
  subcategories: string[] = [],
): InheritedClassificationOption[] {
  if (categories.length === 0) return [];

  return categories.map((cat, index) => {
    const primaryCategory = canonicalCategoryLabel(cat);
    const sector = resolveServiceSector([cat], subcategories);
    const preset = SECTOR_PRESETS[sector];
    const matchingSubcategory =
      subcategories.find((sub) => {
        const subLower = sub.toLowerCase();
        const catLower = cat.toLowerCase();
        return subLower.includes(catLower) || catLower.includes(subLower);
      }) ||
      subcategories[index] ||
      preset.defaultSubCategory;

    return {
      category: primaryCategory,
      subCategory: matchingSubcategory,
      sector,
      preset,
    };
  });
}

/**
 * Derive the classification a service should inherit from the business profile.
 * Returns `null` when the business has not declared any category yet, so callers
 * can keep whatever classification is already on the draft.
 */
export function classifyServiceFromBusiness(
  categories: string[],
  subcategories: string[] = [],
): ServiceClassification | null {
  if (categories.length === 0) return null;

  const sector = resolveServiceSector(categories, subcategories);
  const preset = SECTOR_PRESETS[sector];
  const primaryCategory = canonicalCategoryLabel(categories[0]) || preset.defaultCategory;
  const subCategory = subcategories[0] || preset.defaultSubCategory;

  return { primaryCategory, subCategory, sector, preset };
}

/** Convenience helper: does the business classification resolve to a specific sector? */
export function describeServiceSector(categories: string[], subcategories: string[] = []): string {
  return SECTOR_PRESETS[resolveServiceSector(categories, subcategories)].label;
}

