import { PRESET_POLICIES, type ServicePolicy } from './serviceStudioShared';

export interface ServiceDraft {
  /** Live: the catalogue item this draft already published — publishing again updates it. */
  publishedItemId?: string;
  title: string;
  provider: string;
  primaryCategory: string;
  subCategory: string;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  description: string;
  highlights: Array<{ text: string; active: boolean }>;
  image: string; // cover image URL (saved & displayed consistently)
  standardPrice: string; // standard per-session price (between base & compare)
  basePrice: string;    // entry-level / base session price
  comparePrice: string;
  durationMins: number;
  bufferMins: number;
  tiersEnabled: boolean;
  tiers: Array<{ id: string; name: string; duration: string; price: string; note: string }>;
  skuCode: string;
  locations: string[]; // selected business locations/branch ids (real branch UUIDs live; legacy ids in demo)
  branches: { maitama: boolean; wuseII: boolean; garki: boolean }; // derived from locations for backward compat
  pricingMode: 'universal' | 'tiered';
  genderSuitability: 'all' | 'women' | 'men';
  ageMin: number;
  ageMax?: number;
  accessibility: string[]; // e.g. ['Wheelchair accessible', 'Step-free entrance']
  clientRequirements: string[]; // e.g. ['Consent form', 'Health declaration']
  policies: ServicePolicy[];
  concurrentBookings: number;
  leadNotice: string;
  bookingHorizon: string;
}

/**
 * Starting point for a brand-new service. Every content field (title, provider,
 * description, highlights, photo, prices, tiers, SKU, locations) is blank — the
 * business fills in its own live values. The numeric keys (duration, buffer,
 * concurrency, ages) are editable form defaults, and the policies are the
 * platform's own preset rules — neither is sample service content. The service
 * category is applied from the business's real profile when the form opens.
 */
export const INITIAL_SERVICE_DRAFT: ServiceDraft = {
  title: '',
  provider: '',
  primaryCategory: '',
  subCategory: '',
  deliveryFormat: 'in-salon',
  description: '',
  highlights: [],
  image: '',
  standardPrice: '',
  comparePrice: '',
  basePrice: '',
  durationMins: 60,
  bufferMins: 15,
  tiersEnabled: false,
  tiers: [],
  skuCode: '',
  locations: [],
  branches: { maitama: false, wuseII: false, garki: false },
  pricingMode: 'universal',
  genderSuitability: 'all',
  ageMin: 16,
  ageMax: undefined,
  accessibility: [],
  clientRequirements: [],
  policies: [...PRESET_POLICIES],
  concurrentBookings: 2,
  leadNotice: 'Same day (2 hrs)',
  bookingHorizon: '30 days in advance',
};

/** Creating starts blank everywhere — demo mode no longer uses a sample service. */
export const BLANK_SERVICE_DRAFT: ServiceDraft = { ...INITIAL_SERVICE_DRAFT };
