export interface ProductDraft {
  /** Live: the catalogue item this draft already published — publishing again updates it. */
  publishedItemId?: string;
  title: string;
  /** Uploaded photo URL (live). */
  mainImage?: string;
  /** Live: the business's catalogue category. */
  categoryId?: string;
  producer: string;
  unbranded: boolean;
  primaryCategory: string;
  subCategory: string;
  classification: string;
  description: string;
  condition: 'fresh' | 'packaged' | 'surplus';
  basePrice: string;
  comparePrice: string;
  costPrice: string;
  variantsEnabled: boolean;
  variants: Array<{ id: string; name: string; cut: string; price: string; inventory: string }>;
  skuCode: string;
  lowStock: string;
  backorder: boolean;
  branches: Record<string, boolean>;
  pricingMode: 'uniform' | 'custom';
  prepWindow: string;
  /** How customers can get it: collect at the counter and/or delivery. */
  fulfillment: { pickup: boolean; delivery: boolean };
}

export const INITIAL_PRODUCT_DRAFT: ProductDraft = {
  title: 'Woodfire Aged Angus Ribeye Steak (400g)',
  producer: 'Urban Grill Kitchen',
  unbranded: false,
  primaryCategory: 'Food & Dining',
  subCategory: 'Grill, Steaks & BBQ',
  classification: 'Fresh Cooked / Made to Order',
  description:
    'Prime grass-fed Angus beef aged 28 days. Flame-seared with artisanal house herb butter and served with crisp rosemary sea-salt potatoes.',
  condition: 'fresh',
  basePrice: '14,000',
  comparePrice: '16,000',
  costPrice: '8,500',
  variantsEnabled: true,
  variants: [
    { id: 'regular-300g', name: 'Regular', cut: '300g', price: '12,000', inventory: '25' },
    { id: 'king-cut-450g', name: 'King Cut', cut: '450g', price: '15,000', inventory: '15' },
    { id: 'chefs-reserve-600g', name: "Chef's Reserve", cut: '600g', price: '19,500', inventory: '8' },
  ],
  skuCode: 'UG-RB-042',
  lowStock: '5',
  backorder: false,
  branches: { wuse: true, garki: true, maitama: false },
  pricingMode: 'uniform',
  fulfillment: { pickup: true, delivery: true },
  prepWindow: '20-30',
};

/** Live setup starts from an empty product — the sample above is demo-only. */
export const BLANK_PRODUCT_DRAFT: ProductDraft = {
  ...INITIAL_PRODUCT_DRAFT,
  title: '',
  producer: '',
  description: '',
  basePrice: '',
  comparePrice: '',
  costPrice: '',
  variantsEnabled: false,
  variants: [],
  skuCode: '',
  lowStock: '',
  branches: {},
  pricingMode: 'uniform',
};
