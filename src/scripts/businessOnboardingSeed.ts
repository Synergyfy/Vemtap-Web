export const SEED_DESCRIPTION =
  'Artisanal wood-fired steaks, fresh gourmet burgers, and handcrafted botanical cocktails right in the vibrant heart of the city.';

export const MOCKUP_SEED_CHAR_COUNT = 142;

export interface BusinessCategory {
  value: string;
  label: string;
  /** Subcategories that belong to this parent category. */
  subcategories: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    value: 'restaurant',
    label: 'Restaurant & Dining',
    subcategories: ['Grill & Steakhouse', 'Bistro & Cafe', 'Fast Casual', 'Fine Dining', 'Bakery'],
  },
  {
    value: 'spa',
    label: 'Spa & Wellness',
    subcategories: ['Massage & Therapy', 'Skincare & Facials', 'Sauna & Steam', 'Yoga & Fitness'],
  },
  {
    value: 'fashion',
    label: 'Fashion & Apparel',
    subcategories: ['Womenswear', 'Menswear', 'Footwear', 'Accessories', 'Vintage & Thrift'],
  },
  {
    value: 'groceries',
    label: 'Groceries & Market',
    subcategories: ['Fresh Produce', 'Butcher & Seafood', 'Deli Counter', 'Wine & Spirits', 'Pantry Staples'],
  },
  {
    value: 'services',
    label: 'Local Services & Repair',
    subcategories: [
      'Phone & Electronics Repair',
      'Tailoring & Alterations',
      'Cleaning Services',
      'Plumbing & Electrical',
    ],
  },
];

export const MIN_CATEGORY_SELECTIONS = 1;
export const MAX_CATEGORY_SELECTIONS = 1;
export const MIN_SUBCATEGORY_SELECTIONS = 1;
export const MAX_SUBCATEGORY_SELECTIONS = 2;
