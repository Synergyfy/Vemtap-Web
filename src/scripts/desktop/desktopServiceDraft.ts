export interface ServiceDraft {
  title: string;
  provider: string;
  primaryCategory: string;
  subCategory: string;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  description: string;
  highlights: Array<{ icon: string; label: string }>;
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
    'An intensive restorative facial combining botanical hyaluronic infusion, gentle lymphatic massage, and LED radiance light therapy. Leaves skin deeply replenished, firm, and visibly luminous.',
  highlights: [
    { icon: 'spa', label: 'Sensitive Skin Safe' },
    { icon: 'eco', label: 'Organic Botanicals' },
    { icon: 'water_drop', label: 'Steam Extraction Included' },
    { icon: 'inventory_2', label: 'Aftercare Serum Sample' },
  ],
  basePrice: '16,000',
  comparePrice: '20,000',
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
  branches: { maitama: true, wuseII: true, garki: false },
  pricingMode: 'tiered',
};
