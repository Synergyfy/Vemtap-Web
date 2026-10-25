export interface ServiceDraft {
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
  locations: string[]; // selected business locations/branch ids (maitama, wuseII, garki, main)
  branches: { maitama: boolean; wuseII: boolean; garki: boolean }; // derived from locations for backward compat
  pricingMode: 'universal' | 'tiered';
  genderSuitability: 'all' | 'women' | 'men';
  ageMin: number;
  ageMax?: number;
  accessibility: string[]; // e.g. ['Wheelchair accessible', 'Step-free entrance']
  clientRequirements: string[]; // e.g. ['Consent form', 'Health declaration']
  policies: import('./serviceStudioShared').ServicePolicy[];
  concurrentBookings: number;
  leadNotice: string;
  bookingHorizon: string;
}

export const INITIAL_SERVICE_DRAFT: ServiceDraft = {
  title: 'Deep Hydration Radiance Facial & Glow Therapy',
  provider: 'Glow & Serenity Spa & Salon',
  primaryCategory: 'Health, Beauty & Wellness',
  subCategory: 'Facials, Skincare & Esthetics',
  deliveryFormat: 'in-salon',
  description:
    'An intensive restorative facial combining botanical hyaluronic infusion, gentle lymphatic massage, and LED radiance light therapy. Leaves skin hydrated, plump, and deeply rejuvenated.',
  highlights: [
    { text: 'Sensitive Skin Safe', active: true },
    { text: 'Organic Botanicals', active: true },
    { text: 'Steam Extraction Included', active: false },
    { text: 'Aftercare Serum Sample', active: false },
  ],
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA5kJCcN5hfN4CHAyjM9ztBajNRH9N3SkL38ksjE3AyoelX4MEYejaPFoGwctYS266qyorIoQKcWEmZNs7Q5kgsygotoz2TJKsdyOZYsKcGnxlqAEEA6v2xVfV-oWp54srCsfwKZnaL4Xke7K7ZfNfVhgRqlpp7nIUNRt-iHDnIJxgjld79QZmEiqRPpWOQJ6NN-L-WTDKk9tyaTUh62Bs2W5DGAuGcrqcwBfQezAWCYT5AF74uuP4PBg',
  standardPrice: '18,000',
  comparePrice: '20,000',
  basePrice: '16,000',
  durationMins: 60,
  bufferMins: 15,
  tiersEnabled: true,
  tiers: [
    {
      id: 'essential-glow',
      name: 'Essential Glow',
      duration: '60 mins',
      price: '16,000',
      note: '1 client / slot',
    },
    {
      id: 'deluxe-radiance',
      name: 'Deluxe Radiance + LED Light',
      duration: '75 mins',
      price: '21,000',
      note: '1 client / slot',
    },
    {
      id: 'vip-serenity',
      name: 'VIP Serenity Package + Scalp',
      duration: '90 mins',
      price: '28,000',
      note: '1 client / slot',
    },
  ],
  skuCode: 'VT-SRV-4402',
  locations: ['main', 'maitama', 'wuseII'],
  branches: { maitama: true, wuseII: true, garki: false },
  pricingMode: 'tiered',
  genderSuitability: 'all',
  ageMin: 16,
  ageMax: 80,
  accessibility: ['Wheelchair accessible'],
  clientRequirements: ['Consent form'],
  policies: [
    { id: 'free-cancellation', title: 'Free Cancellation', body: 'Complimentary cancellation up to 2 hours before scheduled session start.', preset: true, removable: true },
    { id: 'late-arrival', title: 'Late Arrival Grace Window', body: '15 minutes buffer window maintained before the appointment slot is released.', preset: true, removable: true },
    { id: 'pay-at-reception', title: 'Pay at Reception', body: 'Customers pay directly at your salon after treatment.', preset: true, removable: false, locked: true },
  ],
  concurrentBookings: 2,
  leadNotice: 'Same day (2 hrs)',
  bookingHorizon: '30 days in advance',
};

/** Live setup starts from an empty service — the sample above is demo-only. */
export const BLANK_SERVICE_DRAFT: ServiceDraft = {
  ...INITIAL_SERVICE_DRAFT,
  title: '',
  provider: '',
  description: '',
  highlights: [],
  image: '',
  standardPrice: '',
  basePrice: '',
  comparePrice: '',
  tiersEnabled: false,
  tiers: [],
  skuCode: '',
  locations: [],
  branches: { maitama: false, wuseII: false, garki: false },
  pricingMode: 'universal',
};
