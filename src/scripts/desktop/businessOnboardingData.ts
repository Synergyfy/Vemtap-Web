export const SEED_DESCRIPTION =
  'Artisanal wood-fired steaks, fresh gourmet burgers, and handcrafted botanical cocktails right in the vibrant heart of the city.';

export const MOCKUP_SEED_CHAR_COUNT = 142;

export interface BusinessCategory {
  label: string;
  /** Subcategories that belong to this parent category. */
  subcategories: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    label: 'Restaurant & Dining',
    subcategories: ['Grill & Steakhouse', 'Bistro & Cafe', 'Fast Casual', 'Fine Dining', 'Bakery'],
  },
  {
    label: 'Artisanal Bakery & Cafe',
    subcategories: ['Sourdough & Artisan Loaves', 'Pastries & Viennoiserie', 'Coffee & Espresso', 'Cakes & Celebration'],
  },
  {
    label: 'Specialty Grocery & Wine',
    subcategories: ['Fresh Produce', 'Butcher & Seafood', 'Deli Counter', 'Wine & Spirits', 'Pantry Staples'],
  },
  {
    label: 'Health & Wellness',
    subcategories: ['Massage & Therapy', 'Skincare & Facials', 'Sauna & Steam', 'Yoga & Fitness'],
  },
  {
    label: 'Local Fashion & Boutiques',
    subcategories: ['Womenswear', 'Menswear', 'Footwear', 'Accessories', 'Vintage & Thrift'],
  },
];

export const MIN_CATEGORY_SELECTIONS = 1;
export const MAX_CATEGORY_SELECTIONS = 1;
export const MIN_SUBCATEGORY_SELECTIONS = 1;
export const MAX_SUBCATEGORY_SELECTIONS = 2;
