export interface ProductOptionChoice {
  id: string;
  label: string;
  hint?: string;
  price?: number;
}

export interface ProductOptionGroup {
  key: string;
  title: string;
  meta?: string;
  required?: boolean;
  type: 'single' | 'multi';
  defaultId?: string;
  choices: ProductOptionChoice[];
}

export interface CentralCategory {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service';
  description: string;
  icon: string;
  image?: string;
  productCount: number;
  activeBranches: string[];
  isArchived?: boolean;
  qrDestinationUrl: string;
  stats: {
    scans: number;
    uniqueScans: number;
    ordersCount: number;
    unitsOrdered: number;
    totalRevenue: number;
  };
}

export interface CatalogueProduct {
  id: string;
  name: string;
  sku?: string;
  desc: string;
  category: string; // Required link to CentralCategory id
  price: number;
  was?: number;
  stock?: number;
  rating?: string;
  reviews?: string;
  badge?: string;
  badgeClass?: string;
  topRightBadge?: string;
  topRightClass?: string;
  image: string;
  imageAlt: string;
  dietary?: string[];
  warnings?: string[];
  optionGroups?: ProductOptionGroup[];
  branchAvailability?: string[];
  qrDestinationUrl?: string;
  scansCount?: number;
}

export const URBAN_PRODUCTS: CatalogueProduct[] = [
  {
    id: 'woodfire-ribeye-400g',
    category: 'grills',
    name: 'Woodfire Aged Ribeye Steak (400g)',
    desc: '400g aged Angus ribeye, herb garlic butter, truffle fries, grilled baby asparagus with smoky reduction.',
    price: 14000,
    was: 16500,
    rating: '4.9',
    reviews: '(88)',
    badge: '-15%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    topRightBadge: 'Best Seller',
    topRightClass: 'bg-primary text-on-primary',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q',
    imageAlt:
      'Gourmet prime woodfire aged ribeye steak cooked medium rare, rested on a rustic wooden platter with charred green asparagus and crisp golden potato fries. Shot with moody warm restaurant spotlighting, realistic sizzle steam, and high contrast culinary styling.',
    dietary: ['Halal certified beef', 'Gluten-free on request'],
    warnings: ['Contains dairy (garlic herb butter)'],
    optionGroups: [
      {
        key: 'temperature',
        title: 'Steak Temperature',
        meta: 'Required',
        required: true,
        type: 'single',
        defaultId: 'medium-rare',
        choices: [
          { id: 'medium-rare', label: 'Medium Rare', hint: 'Warm red center, very juicy (Chef Recommended)' },
          { id: 'medium', label: 'Medium', hint: 'Warm pink center with firm texture' },
          { id: 'medium-well', label: 'Medium Well', hint: 'Slight hint of pink in center' },
          { id: 'well-done', label: 'Well Done', hint: 'Cooked through completely, no pink' },
        ],
      },
      {
        key: 'side',
        title: 'Choice of Side',
        meta: 'Included in price',
        type: 'single',
        defaultId: 'truffle-wedges',
        choices: [
          { id: 'truffle-wedges', label: 'Truffle Parmesan Wedges' },
          { id: 'jollof', label: 'Firewood Jollof Rice' },
          { id: 'mashed-potatoes', label: 'Creamy Mashed Potatoes' },
          { id: 'steamed-veg', label: 'Steamed Seasonal Vegetables' },
        ],
      },
      {
        key: 'addons',
        title: 'Add Extra Sauce / Toppings',
        meta: 'Optional',
        type: 'multi',
        choices: [
          { id: 'extra-butter', label: 'Extra Garlic Herb Butter', price: 800 },
          { id: 'peppercorn-sauce', label: 'Peppercorn Cognac Sauce', price: 1200 },
          { id: 'tiger-prawn', label: 'Grilled Jumbo Tiger Prawn', price: 3500 },
        ],
      },
    ],
  },
  {
    id: 'smoked-wagyu-double-burger',
    category: 'burgers',
    name: 'Smoked Wagyu Double Burger',
    desc: 'Double smash wagyu patty, melted sharp cheddar, caramelized onions, smoked garlic mayo, toasted brioche bun.',
    price: 6500,
    was: 8000,
    rating: '4.8',
    reviews: '(64)',
    badge: '-20%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    topRightBadge: 'Lunch Deal',
    topRightClass: 'bg-secondary-container text-on-secondary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQLg7pUC0q7pmZdwCiuxOAwH4HyQ0lVrpIS-biAhHk9By-zENlS6bScexTjgHqLZExsaQdvdJJ-hhegzvdTcUNKyd_U02YLNeHAzgqhsGee7XXkTEuKhnbLEowcdAHTmJrb3ATIAxCFo_AADwtAi0BtUGSXgNTNrDOwUcOlHJ05WvLpcFFFiF1XUuDGXw3AAuUG4jVqUpGXPqRP8sKGfnEAgKFNQV2bAqHvXj4O-V_RO_40CWF7idlw',
    imageAlt:
      'Mouthwatering double smash wagyu beef burger stacked high with dripping melted cheddar cheese, caramelized onions, crisp butterhead lettuce, and secret sauce on a toasted shiny brioche bun. Professional food commercial lighting against deep dark kitchen backdrop.',
  },
  {
    id: 'hickory-bbq-brisket',
    category: 'grills',
    name: '14-Hour Hickory Smoked BBQ Brisket',
    desc: 'Slow-smoked for 14 hours over hickory, charred sweetcorn, spicy tangy coleslaw, signature house BBQ glaze.',
    price: 12500,
    rating: '4.9',
    reviews: '(51)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfhTpIhWJUDxq5cVoxFpaGPEkQlKdC4Tqjj0smOij4ftrAa3vLFDOoLoNxEDibwSk6Nn5zUH6X58GuK-CmtPTEoE9255Bt-c2zFvQX6G0ARBhGuL3euNEoZrcTNatgkzKinwGf_v-G0V2zHwv0AcRS732xDajA-TQSucVAxQNRw0J5NuVBDmTqkRQNqrVKk2BzcAL_pV-eKOVLMOsyC89LWZqy4d_0hyuZIV0tqvgotWQA6RNfn20LjQ',
    imageAlt:
      'Tender 14-hour hickory smoked BBQ beef brisket platter sliced thick, revealing a deep ruby smoke ring, glazed with sweet tangy barbecue reduction, served beside fire charred buttered sweet corn cob and pickled jalapeño slices.',
  },
  {
    id: 'suya-lamb-chops',
    category: 'grills',
    name: 'Flame-Grilled Suya Lamb Chops',
    desc: 'Spiced Northern Nigerian yaji rub, charred sweet red onions, and honey-roasted ripe plantain dodo.',
    price: 11000,
    rating: '4.7',
    reviews: '(39)',
    topRightBadge: 'Local Favorite',
    topRightClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-ONaECl1Mo7tlAksq4ggHbFX-Cs8m5kw_KTjwO4mnWuPgGqyOJjgJWRJ_W1wPVOIKJgGkZeKSyIHwhaZ7BV2qS-w15OgH1hxqPe5l9l8NJo_WPCCPprt7RLRToSxGQGuHCyvtEAXROoaA6IwQn-2yXnwmOSAthebrWQrOIqE5RqQv5A1uRyQzSGS3ScVcWeYOHI5m8a4BGFIGgF68xYacOB4wCagNE-twewk02l-SsZuYelasqCc9PQ',
    imageAlt:
      'Sizzling flame grilled Nigerian suya spiced lamb chops dusted with authentic kuli kuli yaji spice blend, arranged with sliced purple onions, fresh red tomatoes, and fresh lime wedges on smoked slate.',
  },
  {
    id: 'smoked-jollof-prawns',
    category: 'mains',
    name: 'Smoked Native Party Jollof & Prawns',
    desc: 'Smoky native party jollof with charred jumbo tiger prawns, diced ripe plantain dodo and bell pepper puree.',
    price: 7500,
    was: 8300,
    rating: '4.8',
    reviews: '(112)',
    badge: '-10%',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD--ZrQ9BPR-v4wCL1Q7uE2AYVX8zeC94AyAbdZ5dJNB8wYutSK0oiFb7czFgChdfecIezofI-5oX7kM7etRYN7SDIeQARX5XfbL3AZTQZ6ZLwk3Rzt2Vazwgan4HaW7LbckOQ4m7ELh0dU3Meoi608Qqth34VcjQCTtXOZMAu9obryFseo4LHxj4OkEwHcYfrU3nD97UXttOSd-UtNtIReIvE01ATU6KfcUv5yYqtn1K53JKncC2NxJw',
    imageAlt:
      'Rich reddish-orange firewood smoked Nigerian party jollof rice served in a rustic earthenware pot, topped with giant succulent charred tiger prawns, deep fried plantain dodo, and freshly chopped scallions.',
  },
  {
    id: 'truffle-parmesan-wedges',
    category: 'sides',
    name: 'Truffle Parmesan Potato Wedges',
    desc: 'Crispy skin-on potato wedges tossed in white truffle oil, grated aged parmesan, and fresh chopped parsley.',
    price: 3200,
    rating: '4.6',
    reviews: '(45)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZBLI62hH7PvPzp7VpQGgwpg7LfdxmAi3qRvFrmVCxcHj8AvVUGqDXZvI7PviGqK-rLyerMNO6nPrR1aP1TuRZIUGkX0o2kZcBW-vr_62JdqiI2aF51a2vbrseOvdSIA6Rh-N3l1TxCpZxmxzJgwoAV4waad1cXYLz2aJ57hjcqXYpTRM7GiPw8nE4Xne2xVPKmDPAJygZJTJnq30j_6mymdQg_VWYdx_tZV2BeTqTZlUGiDn7zPKifg',
    imageAlt:
      'Crispy golden skin-on potato wedges generously dusted with aged grated parmesan cheese shavings and fresh thyme, with an aromatic white truffle aioli dipping sauce in a small ceramic ramekin beside it.',
  },
  {
    id: 'hibiscus-zobo-mint-fizz',
    category: 'drinks',
    name: 'Hibiscus Zobo & Mint Fizz (500ml)',
    desc: 'Handcrafted dried hibiscus calyces, ginger, fresh garden mint, sparkling soda, and lime wheel garnish.',
    price: 2500,
    rating: '4.9',
    reviews: '(78)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSUhaEcxymfFmuB0GifzM_C9g0_L_zJHUWxkCvps48vopZC-LcKg68tojM6ZEC8lgym_UNs0MWz1UEP7MBFoz3mU3CK1qO_fHgbvpSZzj1Y6begDEaT_tu6H8EeOioVkXVVcH2WSEyxfzVjzOE-uu3dt5m0S83wo9Cou8gyxX1JDbW2ehOrgTPUW4dfVggbbCgcvtlEi0758iOY1HHlF_0LXV1U1zMHr1m4CgJoqqSbH2xqYRgYstdrA',
    imageAlt:
      'Tall crystal glass filled with ruby-red chilled hibiscus zobo mocktail over crushed ice cubes, garnished with aromatic green mint leaves, dried cloves, and a dehydrated orange slice. Dramatic high-end cocktail bar lighting with condensation beads.',
  },
  {
    id: 'chapman-royale',
    category: 'drinks',
    name: 'Chapman Royale Signature Drink',
    desc: 'The classic Nigerian staple elevated with aromatic Angostura bitters, fresh cucumber ribbons, citrus medleys, and sparkling tonic.',
    price: 3000,
    rating: '4.7',
    reviews: '(34)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsU3SvD-Btxvj1DEhn03rh0KfnGRHZZr0bl7uK54A2wsa9n1nRxXp3PwbzEjYa0emOV5-a-ESYrqS4137Rjqgop_oxSWZoBAx-TxSslqPzjDouJrA48SfopnAz4ZWWSSh6P3Z6vd-6FVycagcwUCMNg6LT78zLSlVM-vBhu8oFXMeqdddMTcQLDnPi0YP2av4vI0M-KoNZxB9Ni9OBMGzLrJb4K5wYCBqBS-1Q9fHQnqtc3I3kDs0WLQ',
    imageAlt:
      'A refreshing Chapman Royale cocktail in a vintage fluted tumbler with Angostura bitters tint, bubbly sparkling citrus soda, fresh cucumber ribbons, lemon wheel, and a sprig of mint. Bright sunny terrace dining ambience.',
  },
  {
    id: 'crispy-buttermilk-chicken',
    category: 'burgers',
    name: 'Crispy Buttermilk Chicken',
    desc: 'Crispy fried chicken breast, spicy house slaw, pickled jalapeños, sweet honey sriracha sauce on brioche.',
    price: 5200,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTaZ70v7IMkkNBmSXKKsv06kUp0B1MoF5XMjkYg_YOZoVinS0R0e0AoiYXRkVMxRHOR5hBQBljFh7csaCtEeiS2X_JWtJZwUMwhnhkT6Q3SEsRHyyJAo3VBeg6dBKNK-sXv9QxnrfBuAtRKQBXXTjweGpN9_MrWJuqi6xzTDdeKHy0862uld3oqgbhh0U5g_uFzlppMjFIB3idfAY_FioW-pxYr4KjzD0eKZ1PntR65EZuW1AeLfq-ZA',
    imageAlt:
      'Golden extra-crunchy buttermilk fried chicken breast sandwich inside a warm seeded bun, topped with creamy purple cabbage coleslaw, thin sliced green pickled jalapeños and vibrant dripping honey sriracha glaze, appetizing restaurant lighting, close-up food shot.',
  },
  {
    id: 'crisp-garden-salad',
    category: 'sides',
    name: 'Crisp Garden Chopped Salad',
    desc: 'Crisp mixed field greens, cherry tomatoes, avocado, toasted pumpkin seeds, tangy citrus vinaigrette.',
    price: 3800,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU37fqCs1YX0yGEmJgck5K9VbCTtQ41LwQQUvKLG3G4C3ezk_AbLFCQ13XM_WFF2ocnK1KdUeP028aPt7gS-MocWEMdo_Dc4WJECvswwR-q-mPAuWWc5seYc33nOGFvin3D5SQZKvrMnJuZr79E5nAHAdWpyKalBSra1pSaFb42CwlunxRt0n9--QQPn4ZwdPL-u6ftK2EWwycleVA6GYjot1b51gpSvzDWXCb3gTo_iROfUAocuS1WA',
    imageAlt:
      'Fresh vibrant chopped salad bowl packed with emerald romaine lettuce, ripe sliced avocado, ruby red sweet baby tomatoes, cucumber slices and toasted pumpkin seeds with a delicate drizzle of citrus lemon dressing, clean bright natural daylight.',
  },
];

export function findProduct(productId?: string | null): CatalogueProduct | undefined {
  if (!productId) return undefined;
  return URBAN_PRODUCTS.find((product) => product.id === productId);
}

/** Maps the grid catalogue's numeric keys to shareable product ids. */
export const PRODUCT_ID_BY_KEY: Record<number, string> = {
  1: 'woodfire-ribeye-400g',
  2: 'smoked-wagyu-double-burger',
  3: 'hickory-bbq-brisket',
  4: 'suya-lamb-chops',
  5: 'smoked-jollof-prawns',
  6: 'truffle-parmesan-wedges',
  7: 'hibiscus-zobo-mint-fizz',
  8: 'chapman-royale',
};

export const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export const nairaToNumber = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0;

/** Maps menu list names to shareable product ids. */
export const MENU_PRODUCT_ID: Record<string, string> = {
  'Woodfire Grilled Ribeye': 'woodfire-ribeye-400g',
  'Smoked BBQ Brisket Platter': 'hickory-bbq-brisket',
  'Flame-Grilled Suya Lamb Chops': 'suya-lamb-chops',
  'Smoked Wagyu Burger': 'smoked-wagyu-double-burger',
  'Crispy Buttermilk Chicken': 'crispy-buttermilk-chicken',
  'Firewood Smoked Jollof Rice': 'smoked-jollof-prawns',
  'Truffle Parmesan Wedges': 'truffle-parmesan-wedges',
  'Crisp Garden Chopped Salad': 'crisp-garden-salad',
  'Hibiscus Zobo & Mint Fizz': 'hibiscus-zobo-mint-fizz',
  'Chapman Royale': 'chapman-royale',
};

export const CENTRAL_CATEGORIES: CentralCategory[] = [
  {
    id: 'grills',
    name: 'Woodfire Grills & Steaks',
    slug: 'grills',
    type: 'product',
    description: 'Dry-aged Angus steaks, woodfire smoked cuts, artisanal sausages, and herb-buttered flame specialties.',
    icon: 'local_fire_department',
    productCount: 4,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=grills',
    stats: {
      scans: 386,
      uniqueScans: 312,
      ordersCount: 91,
      unitsOrdered: 142,
      totalRevenue: 1274000,
    },
  },
  {
    id: 'burgers',
    name: 'Artisan Burgers & Sandwiches',
    slug: 'burgers',
    type: 'product',
    description: 'Freshly ground smoked Wagyu beef patties, brioche buns, aged cheddar, and house-cured BBQ brisket.',
    icon: 'lunch_dining',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=burgers',
    stats: {
      scans: 240,
      uniqueScans: 198,
      ordersCount: 63,
      unitsOrdered: 89,
      totalRevenue: 623000,
    },
  },
  {
    id: 'mains',
    name: 'Signature Mains & Bowls',
    slug: 'mains',
    type: 'product',
    description: 'Firewood smoked jollof rice, seafood platters, buttermilk chicken, and Nigerian gourmet chef creations.',
    icon: 'restaurant',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=mains',
    stats: {
      scans: 215,
      uniqueScans: 180,
      ordersCount: 54,
      unitsOrdered: 76,
      totalRevenue: 486000,
    },
  },
  {
    id: 'sides',
    name: 'Appetizers, Fries & Sides',
    slug: 'sides',
    type: 'product',
    description: 'Crisp parmesan potato wedges, garden chopped salads, truffle chips, and plantain bites.',
    icon: 'fastfood',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=sides',
    stats: {
      scans: 174,
      uniqueScans: 155,
      ordersCount: 38,
      unitsOrdered: 58,
      totalRevenue: 192000,
    },
  },
  {
    id: 'drinks',
    name: 'Craft Cocktails & Beverages',
    slug: 'drinks',
    type: 'product',
    description: 'Small-batch artisanal mocktails, signature Chapman Royale, botanical zobo spritz, and chilled juices.',
    icon: 'local_bar',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=drinks',
    stats: {
      scans: 310,
      uniqueScans: 260,
      ordersCount: 82,
      unitsOrdered: 135,
      totalRevenue: 385000,
    },
  },
  {
    id: 'desserts',
    name: 'Boutique Pastries & Desserts',
    slug: 'desserts',
    type: 'product',
    description: 'Molten chocolate lava cake, vanilla bean gelato, warm caramel tarts, and fresh seasonal berry parfaits.',
    icon: 'cake',
    productCount: 1,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/urban-grill-bistro-104/products?category=desserts',
    stats: {
      scans: 95,
      uniqueScans: 80,
      ordersCount: 24,
      unitsOrdered: 32,
      totalRevenue: 112000,
    },
  },
];

export const SERVICE_CATEGORIES: CentralCategory[] = [
  {
    id: 'private-dining',
    name: 'Private Dining & Room Booking',
    slug: 'private-dining',
    type: 'service',
    description: 'Exclusive private chef tables and VIP lounge reservations with customized tasting menus.',
    icon: 'table_restaurant',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/glow-serenity-spa-219/services?category=private-dining',
    stats: {
      scans: 142,
      uniqueScans: 120,
      ordersCount: 18,
      unitsOrdered: 18,
      totalRevenue: 720000,
    },
  },
  {
    id: 'event-catering',
    name: 'Corporate & Event Catering',
    slug: 'event-catering',
    type: 'service',
    description: 'On-site barbecue catering, corporate buffet setups, and custom celebration packages.',
    icon: 'room_service',
    productCount: 2,
    activeBranches: ['all'],
    qrDestinationUrl: '/business/glow-serenity-spa-219/services?category=event-catering',
    stats: {
      scans: 88,
      uniqueScans: 75,
      ordersCount: 12,
      unitsOrdered: 12,
      totalRevenue: 1450000,
    },
  },
];

// In-memory / session persistent category store
let memoryCategories: CentralCategory[] = [...CENTRAL_CATEGORIES, ...SERVICE_CATEGORIES];

export function getCentralCategories(type?: 'product' | 'service'): CentralCategory[] {
  if (!type) return memoryCategories.filter((c) => !c.isArchived);
  return memoryCategories.filter((c) => !c.isArchived && c.type === type);
}

export function addCentralCategory(newCat: Omit<CentralCategory, 'stats'>): CentralCategory {
  const categoryWithStats: CentralCategory = {
    ...newCat,
    stats: {
      scans: 0,
      uniqueScans: 0,
      ordersCount: 0,
      unitsOrdered: 0,
      totalRevenue: 0,
    },
  };
  memoryCategories = [categoryWithStats, ...memoryCategories];
  return categoryWithStats;
}

export function updateCentralCategory(id: string, updates: Partial<CentralCategory>): CentralCategory | undefined {
  const index = memoryCategories.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  memoryCategories[index] = { ...memoryCategories[index], ...updates };
  return memoryCategories[index];
}

export function archiveCentralCategory(id: string): void {
  const cat = memoryCategories.find((c) => c.id === id);
  if (cat) cat.isArchived = true;
}

export function getCategoryById(id: string): CentralCategory | undefined {
  return memoryCategories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): CentralCategory | undefined {
  return memoryCategories.find((c) => c.slug === slug || c.id === slug);
}

/**
 * Resolves a category's optional image by its display name or slug.
 * Used by the "use category image when the product has none" import fallback —
 * looked up live (never copied onto the product) so editing or removing the
 * category image propagates to every product that falls back to it.
 */
export function getCategoryImageByName(nameOrSlug?: string): string | undefined {
  const needle = (nameOrSlug ?? '').trim().toLowerCase();
  if (!needle) return undefined;
  const match = memoryCategories.find(
    (c) => !c.isArchived && (c.name.toLowerCase() === needle || c.slug.toLowerCase() === needle || c.id.toLowerCase() === needle),
  );
  return match?.image || undefined;
}
