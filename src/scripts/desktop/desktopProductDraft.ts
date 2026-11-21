export interface ProductDraft {
  /** Live: the catalogue item this draft already published — publishing again updates it. */
  publishedItemId?: string;
  title: string;
  /** Uploaded photo URL (live). */
  mainImage?: string;
  /** Additional gallery photo URLs (up to 4 optional photos). */
  galleryImages?: string[];
  /** Uploaded video URLs (live), saved with the catalogue item. */
  videos?: string[];
  producer: string;
  sku: string;
  unbranded: boolean;
  categoryId?: string;
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
  barcode: string;
  lowStock: string;
  backorder: boolean;
  branches: Record<string, boolean>;
  pricingMode: 'uniform' | 'custom';
  prepWindow: string;
  /** How customers can get it: collect at the counter and/or delivery. */
  fulfillment: { pickup: boolean; delivery: boolean };
  /** Attribute badges customers see ("Halal certified", "Gluten-free", …). */
  tags: string[];
  /** Units on hand when the product has no variants. */
  stock: string;
  loyaltyPoints?: string;
}

export const INITIAL_PRODUCT_DRAFT: ProductDraft = {
  title: 'Woodfire Aged Angus Ribeye Steak (400g)',
  producer: '',
  sku: 'UGK-RIBEYE-400',
  unbranded: true,
  categoryId: undefined,
  primaryCategory: '',
  subCategory: '',
  classification: 'Fresh Cooked / Made to order',
  description:
    'Prime grass-fed Angus beef aged 28 days. Flame-seared with artisanal house herb butter and served with crisp rosemary sea-salt potatoes.',
  condition: 'fresh',
  basePrice: '14,000',
  comparePrice: '16,000',
  costPrice: '8,500',
  variantsEnabled: true,
  variants: [
    { id: 'variant-1', name: 'Regular', cut: '300g Cut', price: '12,000', inventory: '25' },
    { id: 'variant-2', name: 'King Cut', cut: '450g Cut', price: '15,000', inventory: '15' },
    { id: 'variant-3', name: "Chef's Reserve", cut: '600g Premium Cut', price: '19,500', inventory: '8' },
  ],
  skuCode: 'UG-RB-042',
  barcode: '',
  lowStock: '5',
  backorder: false,
  branches: { wuse: true, garki: true, maitama: false },
  pricingMode: 'custom',
  fulfillment: { pickup: true, delivery: true },
  tags: ['Halal certified', 'Medium Spicy'],
  stock: '',
  prepWindow: 'Ready',
  loyaltyPoints: '50',
  galleryImages: [],
};

/** Live catalogue starts from an empty product — the sample above is demo-only. */
export const BLANK_PRODUCT_DRAFT: ProductDraft = {
  ...INITIAL_PRODUCT_DRAFT,
  loyaltyPoints: '',
  title: '',
  producer: '',
  sku: '',
  categoryId: undefined,
  description: '',
  basePrice: '',
  comparePrice: '',
  costPrice: '',
  galleryImages: [],
  prepWindow: 'Ready',
  variantsEnabled: false,
  variants: [],
  skuCode: '',
  barcode: '',
  lowStock: '',
  branches: {},
  pricingMode: 'uniform',
  tags: [],
};
