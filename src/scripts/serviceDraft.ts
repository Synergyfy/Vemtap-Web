export interface ServiceDraft {
  title: string;
  provider: string;
  primaryCategory: string;
  subCategory: string;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  description: string;
  highlights: Array<{ text: string; active: boolean }>;
  basePrice: string;
  comparePrice: string;
  durationMins: number;
  bufferMins: number;
  tiersEnabled: boolean;
  tiers: Array<{ id: string; name: string; duration: string; price: string; note: string }>;
  skuCode: string;
  branches: { maitama: boolean; wuseII: boolean; garki: boolean };
  pricingMode: 'universal' | 'tiered';
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
  basePrice: '16,000',
  comparePrice: '20,000',
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
  branches: { maitama: true, wuseII: true, garki: false },
  pricingMode: 'tiered',
};
