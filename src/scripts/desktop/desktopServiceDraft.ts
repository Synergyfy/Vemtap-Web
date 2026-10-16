export interface ServiceDraft {
  title: string;
  provider: string;
  primaryCategory: string;
  subCategory: string;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  description: string;
  highlights: Array<{ icon: string; label: string }>;
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
  policies: import('../serviceStudioShared').ServicePolicy[];
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
    'An intensive restorative facial combining botanical hyaluronic infusion, gentle lymphatic massage, and LED radiance light therapy. Leaves skin deeply replenished, firm, and visibly luminous.',
  highlights: [
    { icon: 'spa', label: 'Sensitive Skin Safe' },
    { icon: 'eco', label: 'Organic Botanicals' },
    { icon: 'water_drop', label: 'Steam Extraction Included' },
    { icon: 'inventory_2', label: 'Aftercare Serum Sample' },
  ],
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog',
  standardPrice: '18,000',
  comparePrice: '20,000',
  basePrice: '16,000',
  durationMins: 60,
  bufferMins: 15,
  tiersEnabled: true,
  tiers: [
    {
      id: 'tier-1',
      name: 'Essential Glow',
      duration: '60 mins',
      price: '16,000',
      note: 'Standard Hydration & Steam',
    },
    {
      id: 'tier-2',
      name: 'Deluxe Radiance + LED Light',
      duration: '75 mins',
      price: '21,000',
      note: 'Red Spectrum Phototherapy',
    },
    {
      id: 'tier-3',
      name: 'VIP Serenity Package + Scalp Massage',
      duration: '90 mins',
      price: '28,000',
      note: 'Organic Essential Oils Included',
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
