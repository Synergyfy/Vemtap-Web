/**
 * VEMTAP Cluster System — Mock Data & State Store
 *
 * Location-based clusters: shopping malls, plazas, markets, and commercial areas.
 * Provides cluster profile, member businesses, cluster shared QR, pool items (deals/products/services/profile)
 * with rotator, member directory with profiles & in-app chat, and detailed view/impression/click analytics.
 *
 * All state is reactive and persists to localStorage for realistic frontend demo simulation.
 */

export type ClusterType = 'mall' | 'plaza' | 'market' | 'commercial-axis' | 'strip';
export type ShowcaseEntityType = 'deal' | 'product' | 'service' | 'profile';

export interface ClusterQRCode {
  url: string;
  displayCode: string;
  scansThisWeek: number;
  scansTotal: number;
}

export interface ClusterRotatorSettings {
  isActive: boolean;
  rotationIntervalSeconds: number;
  maxActiveDeals: number;
  activeDealsCount: number;
}

export interface ClusterStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalDealsInPool: number;
  totalScans: number;
  thisMonthScans: number;
  avgDealsClaimedPerDay: number;
}

export interface ClusterAnalytics {
  clusterViews: number;
  clusterImpressions: number;
  clusterClicks: number;
  clusterScans: number;
  businessViews: number;
  businessImpressions: number;
  businessClicks: number;
  businessCtr: number;
  dailyTrend: Array<{
    date: string;
    views: number;
    impressions: number;
    clicks: number;
  }>;
}

export interface Cluster {
  id: string;
  name: string;
  slug: string;
  type: ClusterType;
  city: string;
  state: string;
  address: string;
  coordinates: { lat: number; lng: number };
  radiusMeters: number;
  creatorBusinessId: string; // stored internally only — no founder badge displayed
  createdAt: string;
  status: 'active' | 'review' | 'inactive';
  qrCode: ClusterQRCode;
  rotatorSettings: ClusterRotatorSettings;
  stats: ClusterStats;
  analytics: ClusterAnalytics;
  description: string;
}

export interface ClusterBusinessMember {
  id: string;
  businessId: string;
  clusterId: string;
  businessName: string;
  category: 'food' | 'fashion' | 'beauty' | 'electronics' | 'health' | 'services';
  unitOrSuite: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
  isVerified: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  phone: string;
  email: string;
  hours: string;
  bio: string;
  dealsCount: number;
  scansContributed: number;
  topOffers: Array<{ title: string; price: number; discount?: string }>;
}

export interface ClusterShowcaseItem {
  id: string;
  clusterId: string;
  businessId: string;
  businessName: string;
  entityType: ShowcaseEntityType;
  title: string;
  subtitle?: string;
  discount?: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  status: 'in_rotator' | 'queued' | 'hidden';
  showInCluster: boolean; // Business chooses whether to show or not show in cluster
  views: number;
  impressions: number;
  clicks: number;
  redemptions?: number;
  submittedAt: string;
  expiresAt: string;
}

export interface ClusterChatMessage {
  id: string;
  senderBusinessId: string;
  senderBusinessName: string;
  recipientBusinessId: string;
  recipientBusinessName: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

// Predefined clusters
export const EXISTING_CLUSTERS: Cluster[] = [
  {
    id: 'cluster-amaka-mall',
    name: 'Amaka Mall Business Cluster',
    slug: 'amaka-mall',
    type: 'mall',
    city: 'Abuja',
    state: 'FCT',
    address: 'Plot 1044 Ahmadu Bello Way, Area 11, Garki, Abuja',
    coordinates: { lat: 9.0345, lng: 7.4891 },
    radiusMeters: 450,
    creatorBusinessId: '101',
    createdAt: '2024-03-12',
    status: 'active',
    description:
      'Premier retail and dining destination in the heart of Garki, hosting 24 verified merchants with unified customer rewards.',
    qrCode: {
      url: 'https://vemtap.com/c/amaka-mall',
      displayCode: 'AMAKA-MALL-709',
      scansThisWeek: 1420,
      scansTotal: 18450,
    },
    rotatorSettings: {
      isActive: true,
      rotationIntervalSeconds: 45,
      maxActiveDeals: 6,
      activeDealsCount: 5,
    },
    stats: {
      totalBusinesses: 24,
      activeBusinesses: 22,
      totalDealsInPool: 18,
      totalScans: 18450,
      thisMonthScans: 4890,
      avgDealsClaimedPerDay: 42,
    },
    analytics: {
      clusterViews: 24800,
      clusterImpressions: 58200,
      clusterClicks: 9450,
      clusterScans: 18450,
      businessViews: 3840,
      businessImpressions: 12600,
      businessClicks: 2190,
      businessCtr: 17.4,
      dailyTrend: [
        { date: 'Mon', views: 480, impressions: 1650, clicks: 290 },
        { date: 'Tue', views: 520, impressions: 1720, clicks: 310 },
        { date: 'Wed', views: 610, impressions: 1980, clicks: 370 },
        { date: 'Thu', views: 590, impressions: 1890, clicks: 340 },
        { date: 'Fri', views: 820, impressions: 2750, clicks: 490 },
        { date: 'Sat', views: 980, impressions: 3400, clicks: 610 },
        { date: 'Sun', views: 760, impressions: 2500, clicks: 440 },
      ],
    },
  },
  {
    id: 'cluster-silverbird',
    name: 'Silverbird Entertainment Centre Hub',
    slug: 'silverbird-centre',
    type: 'mall',
    city: 'Abuja',
    state: 'FCT',
    address: 'Plot 1161 Memorial Drive, Central Business District, Abuja',
    coordinates: { lat: 9.0578, lng: 7.4952 },
    radiusMeters: 500,
    creatorBusinessId: '98',
    createdAt: '2024-01-15',
    status: 'active',
    description: 'Central hub for entertainment, cinema, electronics, and food court merchants.',
    qrCode: {
      url: 'https://vemtap.com/c/silverbird-centre',
      displayCode: 'SEC-ABUJA-102',
      scansThisWeek: 980,
      scansTotal: 12200,
    },
    rotatorSettings: {
      isActive: true,
      rotationIntervalSeconds: 60,
      maxActiveDeals: 5,
      activeDealsCount: 4,
    },
    stats: {
      totalBusinesses: 19,
      activeBusinesses: 18,
      totalDealsInPool: 12,
      totalScans: 12200,
      thisMonthScans: 3100,
      avgDealsClaimedPerDay: 28,
    },
    analytics: {
      clusterViews: 16400,
      clusterImpressions: 41000,
      clusterClicks: 6200,
      clusterScans: 12200,
      businessViews: 2100,
      businessImpressions: 8400,
      businessClicks: 1420,
      businessCtr: 16.9,
      dailyTrend: [
        { date: 'Mon', views: 280, impressions: 1100, clicks: 190 },
        { date: 'Tue', views: 310, impressions: 1250, clicks: 210 },
        { date: 'Wed', views: 360, impressions: 1400, clicks: 240 },
        { date: 'Thu', views: 390, impressions: 1520, clicks: 260 },
        { date: 'Fri', views: 540, impressions: 2100, clicks: 360 },
        { date: 'Sat', views: 680, impressions: 2600, clicks: 440 },
        { date: 'Sun', views: 490, impressions: 1900, clicks: 320 },
      ],
    },
  },
  {
    id: 'cluster-banex-plaza',
    name: 'Banex Plaza Commercial Hub',
    slug: 'banex-plaza',
    type: 'plaza',
    city: 'Abuja',
    state: 'FCT',
    address: 'Aminu Kano Crescent, Wuse 2, Abuja',
    coordinates: { lat: 9.0765, lng: 7.4721 },
    radiusMeters: 600,
    creatorBusinessId: '80',
    createdAt: '2023-11-20',
    status: 'active',
    description: 'Bustling tech and gadget district with over 40 retail units and smartphone specialists.',
    qrCode: {
      url: 'https://vemtap.com/c/banex-plaza',
      displayCode: 'BANEX-TECH-404',
      scansThisWeek: 2310,
      scansTotal: 34100,
    },
    rotatorSettings: {
      isActive: true,
      rotationIntervalSeconds: 30,
      maxActiveDeals: 8,
      activeDealsCount: 7,
    },
    stats: {
      totalBusinesses: 38,
      activeBusinesses: 35,
      totalDealsInPool: 24,
      totalScans: 34100,
      thisMonthScans: 8900,
      avgDealsClaimedPerDay: 76,
    },
    analytics: {
      clusterViews: 42000,
      clusterImpressions: 98000,
      clusterClicks: 16500,
      clusterScans: 34100,
      businessViews: 5100,
      businessImpressions: 17200,
      businessClicks: 3100,
      businessCtr: 18.0,
      dailyTrend: [
        { date: 'Mon', views: 720, impressions: 2400, clicks: 430 },
        { date: 'Tue', views: 760, impressions: 2550, clicks: 460 },
        { date: 'Wed', views: 840, impressions: 2900, clicks: 520 },
        { date: 'Thu', views: 880, impressions: 3100, clicks: 560 },
        { date: 'Fri', views: 1150, impressions: 4100, clicks: 740 },
        { date: 'Sat', views: 1380, impressions: 4900, clicks: 880 },
        { date: 'Sun', views: 920, impressions: 3300, clicks: 590 },
      ],
    },
  },
];

// Member businesses for Amaka Mall Cluster with rich profile details
export const AMAKA_MALL_MEMBERS: ClusterBusinessMember[] = [
  {
    id: 'mem-104',
    businessId: '104',
    clusterId: 'cluster-amaka-mall',
    businessName: 'Urban Grill & Bistro',
    category: 'food',
    unitOrSuite: 'Shop G-12, Ground Floor',
    joinedAt: '2024-04-01',
    status: 'active',
    isVerified: true,
    phone: '+234 803 456 7890',
    email: 'contact@urbangrillbistro.com',
    hours: '11:00 AM – 11:00 PM (Mon - Sun)',
    bio: 'Artisan smokehouse and grill bistro in Abuja serving aged wagyu cuts, smoked BBQ platters, craft mocktails, and fresh woodfire dishes.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUGGVIpCUSLqlt98cYR2Kj4otzS8A3jD9Vd49iHIZtmCuwg4JGt-4xGDXcojgKA7EfwP1g5KJ0yYc1PRhhvAuGjCLOlJl4js18SWfuqEJ1Q3-FEe7NSHInPrWL7DLC5sjJ1MNdzp1mrBu1raKFe_ejXJNDv0e9DM4_Z5qzXep91UsXwqUUivw-Y93_K6ZB5RC56jEnIMVWa6y-ISWWPJ9F1CiZVFJwVNNYiRrkOAJ2b0-FuFZZ9lbJ_A',
    dealsCount: 2,
    scansContributed: 3480,
    topOffers: [
      { title: 'Smoked BBQ Ribs Platter + Drink', price: 11250, discount: '25% OFF' },
      { title: 'Gourmet Wagyu Burger + Handcut Truffle Fries', price: 8500, discount: '15% OFF' },
    ],
  },
  {
    id: 'mem-201',
    businessId: '201',
    clusterId: 'cluster-amaka-mall',
    businessName: 'Zaria Artisan Bakery & Cafe',
    category: 'food',
    unitOrSuite: 'Kiosk 04, Central Atrium',
    joinedAt: '2024-03-15',
    status: 'active',
    isVerified: true,
    phone: '+234 809 111 2233',
    email: 'hello@zariabakery.ng',
    hours: '8:00 AM – 9:00 PM (Daily)',
    bio: 'Sourdough breads, delicate French pastries, specialty African single-origin pour-overs and custom celebration cakes.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mVwJbVAhXMM6239ZPfDxwph2u7rXh0Me0cneDcRhckqCG_zdKDD2N_U8F7OK8e3jF5BJ2M0prZjgOX_1rQUbl5SJSX27asdG82U5vIYoaeC-SwhTYdK3Tr-da_MBPcs00hrZX4a8XBjl4JD9J6BTr3RflgchtVCldlT7yQzQOdSScCg7yC1Zagz_1EsP-7VUerTf5jQH7KjI-KelSjRNCL8gD9QySyXtULI9QIWC',
    dealsCount: 1,
    scansContributed: 1920,
    topOffers: [
      { title: 'Buy 1 Caramel Latte, Get Pastry 50% Off', price: 3200, discount: '50% OFF' },
    ],
  },
  {
    id: 'mem-202',
    businessId: '202',
    clusterId: 'cluster-amaka-mall',
    businessName: 'Aura Couture & Fabrics',
    category: 'fashion',
    unitOrSuite: 'Suite 204, 1st Floor',
    joinedAt: '2024-03-18',
    status: 'active',
    isVerified: true,
    phone: '+234 802 333 4455',
    email: 'aura.couture@gmail.com',
    hours: '9:30 AM – 7:30 PM (Mon - Sat)',
    bio: 'Bespoke Nigerian and contemporary tailored kaftans, luxury lace textiles, and ready-to-wear formal collections.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Eg_JS8x1JFRVATxQeOiiQ3TMoMDrh4EhAiR9-wIDqscysVxQV1cCp4l-BDSgx3n_UAd_vD-1tD_Xv4YcSei9qtvi0YKwPPv08-rYPo0-tGJXM-rbpQI8WxkvYpP_0XqQymVLOAf7kewqDGZSq29JRiMRtfD-j5v-HuOyD3WFf7C10KeQzNGI2zaE14CE6XtUY04jA2LMw-juPENi_JB9-S82f_5yhQUbX8OwN1Ux',
    dealsCount: 3,
    scansContributed: 840,
    topOffers: [
      { title: 'Ready-to-Wear Kaftan & Senator Cut', price: 36000, discount: '20% OFF' },
    ],
  },
  {
    id: 'mem-203',
    businessId: '203',
    clusterId: 'cluster-amaka-mall',
    businessName: 'GadgetZone Express',
    category: 'electronics',
    unitOrSuite: 'Shop G-08, North Wing',
    joinedAt: '2024-03-20',
    status: 'active',
    isVerified: true,
    phone: '+234 818 777 8899',
    email: 'support@gadgetzone.ng',
    hours: '9:00 AM – 8:00 PM (Daily)',
    bio: 'Authorized accessories retailer: genuine high-wattage chargers, active noise cancellation earbuds, smart watch straps and screen protectors.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYU9CHvad8mmB1n7HZebj-9-RJNU48y8c41IO7GzzEk_4mD-lhgfd9MReQAi7YmYcbcDcZHGy4JlFEc8Y_xvGS6GKTRikmdwO8inJNNZQsqJthBLoFuxRSpANFde0IjudqyzaZd9ctxXpfJ_cpK_TFjTBltS6O6CxRYEBNCjzmWBdHm6GkyB7QsKUssO8D-I_atfFeR6xo6CqLFnTTx60Hn6je8raKJ2qdZ15i07to',
    dealsCount: 2,
    scansContributed: 2640,
    topOffers: [
      { title: 'Anker 20,000mAh Powerbank with Fast Charge', price: 24000, discount: '20% OFF' },
    ],
  },
  {
    id: 'mem-204',
    businessId: '204',
    clusterId: 'cluster-amaka-mall',
    businessName: 'Bella Glow Skincare Clinic',
    category: 'beauty',
    unitOrSuite: 'Suite 302, 2nd Floor',
    joinedAt: '2024-03-25',
    status: 'active',
    isVerified: true,
    phone: '+234 813 555 6677',
    email: 'appointments@bellaglow.com',
    hours: '10:00 AM – 7:00 PM (Tue - Sun)',
    bio: 'Dermatologist-formulated skin treatments, non-invasive hydra-facials, chemical peels, and botanical body polishes.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8LxbXWebu4BeWFCBPcQnwZ3yOVjHO9H4S9ZOfPGV9cMmACi2aZB_Hhu0JontfNGmJN7KDb9t8ObRhK6kcgRU9c1neHq-t6gNg7HFK2Z7F6XMKJNJcoMQCUei7KQvEMOdk3yYtVf3e5Ie3aMnIgjAIYTBFhfC430FSqSmLEtAuHlaO5BSCLUxZ4BFq5qVHBfhvErtWg7n15YG4LtYJ5TbHhVwyxpqngk-At1VnoQZ5',
    dealsCount: 2,
    scansContributed: 1110,
    topOffers: [
      { title: 'Hydra-Facial & Deep Pore Cleanse Session', price: 17500, discount: '30% OFF' },
    ],
  },
  {
    id: 'mem-205',
    businessId: '205',
    clusterId: 'cluster-amaka-mall',
    businessName: 'Prime Cuts Barber & Grooming',
    category: 'services',
    unitOrSuite: 'Suite 108, Mezzanine',
    joinedAt: '2024-03-29',
    status: 'active',
    isVerified: true,
    phone: '+234 805 222 3344',
    email: 'primecuts.abuja@gmail.com',
    hours: '9:00 AM – 9:00 PM (Daily)',
    bio: 'Executive hair sculpting, beard oil hot-towel treatments, blackhead masks, and junior haircuts in a lounge ambiance.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    dealsCount: 1,
    scansContributed: 980,
    topOffers: [
      { title: 'Executive Haircut + Hot Towel Beard Treatment', price: 7000, discount: '20% OFF' },
    ],
  },
];

// Initial auto-imported deals, products, services, and profile showcase items
export const INITIAL_SHOWCASE_ITEMS: ClusterShowcaseItem[] = [
  // Deals from Urban Grill & Bistro
  {
    id: 'cdeal-1',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'deal',
    title: 'Smoked BBQ Ribs Platter + Drink',
    subtitle: 'Full rack tender pork ribs with seasoned fries and house soda',
    discount: '25% OFF',
    price: 11250,
    oldPrice: 15000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    category: 'food',
    status: 'in_rotator',
    showInCluster: true,
    views: 1840,
    impressions: 5920,
    clicks: 1040,
    redemptions: 148,
    submittedAt: '2024-04-02',
    expiresAt: '2026-12-31',
  },
  {
    id: 'cdeal-5',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'deal',
    title: 'Gourmet Wagyu Burger + Handcut Truffle Fries',
    subtitle: 'Brioche bun, caramelised onions, smoked gouda, truffle parmesan chips',
    discount: '15% OFF',
    price: 8500,
    oldPrice: 10000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    category: 'food',
    status: 'in_rotator',
    showInCluster: true,
    views: 1420,
    impressions: 4680,
    clicks: 810,
    redemptions: 74,
    submittedAt: '2024-04-08',
    expiresAt: '2026-12-31',
  },
  {
    id: 'cdeal-7',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'deal',
    title: 'Charcoal Grilled Suya Platter Special',
    subtitle: 'Spiced beef tenderloin chunks served with sliced red onions and yaji pepper',
    discount: '20% OFF',
    price: 6400,
    oldPrice: 8000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    category: 'food',
    status: 'queued',
    showInCluster: false, // Toggled off by default so merchant can choose to show it
    views: 290,
    impressions: 910,
    clicks: 140,
    redemptions: 18,
    submittedAt: '2024-04-12',
    expiresAt: '2026-12-31',
  },
  // Products from Urban Grill
  {
    id: 'cprod-1',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'product',
    title: 'Woodfire Aged Ribeye Steak (400g)',
    subtitle: 'Prime cut with charred asparagus, garlic herb butter and choice of side',
    price: 14000,
    oldPrice: 16500,
    discount: 'Popular Item',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q',
    category: 'food',
    status: 'in_rotator',
    showInCluster: true,
    views: 980,
    impressions: 3120,
    clicks: 520,
    redemptions: 41,
    submittedAt: '2024-04-05',
    expiresAt: '2026-12-31',
  },
  {
    id: 'cprod-2',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'product',
    title: 'Firewood Jollof & Smoked Half-Chicken',
    subtitle: 'Slow cooked party style smoky jollof with fried sweet plantains',
    price: 8500,
    discount: 'Chef Pick',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    category: 'food',
    status: 'queued',
    showInCluster: false,
    views: 410,
    impressions: 1200,
    clicks: 190,
    redemptions: 15,
    submittedAt: '2024-04-10',
    expiresAt: '2026-12-31',
  },
  // Service item (Spa & Wellness for service rendering businesses)
  {
    id: 'cserv-1',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'service',
    title: 'Private Dining & Executive Chef Table Experience',
    subtitle: 'Exclusive 5-course tailored tasting menu with personal sommelier service',
    price: 45000,
    discount: 'Premium Service',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAI--zdhCQDqNIaUAFQUyyScD32B6PaFE8PYNPlwAAEUS3hvyURD_3XYhNE2ZssLu5cp1F51uX9_OJd2-F9zXtPPzyZDGx3PLSijXXJR7o0RYbFx2EPQ0JLA4pWSRlyejuc-I0MP3ps0FVbccbgwEQcsn5vt1_UUrHiJLzrXe_y0tOjDFe9tI_nByQxsEhv4gjxkXD-FKJyK57YQinUWWstMkdrx27HK_zhRFkspQSI',
    category: 'services',
    status: 'queued',
    showInCluster: false,
    views: 320,
    impressions: 890,
    clicks: 110,
    redemptions: 6,
    submittedAt: '2024-04-14',
    expiresAt: '2026-12-31',
  },
  // Business Profile Spotlight
  {
    id: 'cprof-1',
    clusterId: 'cluster-amaka-mall',
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: 'profile',
    title: 'Urban Grill & Bistro — Official Storefront Profile',
    subtitle: 'Artisan Smokehouse & Grill &bull; Shop G-12, Ground Floor &bull; Open Daily',
    price: 0,
    discount: 'Verified Merchant',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUGGVIpCUSLqlt98cYR2Kj4otzS8A3jD9Vd49iHIZtmCuwg4JGt-4xGDXcojgKA7EfwP1g5KJ0yYc1PRhhvAuGjCLOlJl4js18SWfuqEJ1Q3-FEe7NSHInPrWL7DLC5sjJ1MNdzp1mrBu1raKFe_ejXJNDv0e9DM4_Z5qzXep91UsXwqUUivw-Y93_K6ZB5RC56jEnIMVWa6y-ISWWPJ9F1CiZVFJwVNNYiRrkOAJ2b0-FuFZZ9lbJ_A',
    category: 'food',
    status: 'in_rotator',
    showInCluster: true,
    views: 3840,
    impressions: 12600,
    clicks: 2190,
    submittedAt: '2024-04-01',
    expiresAt: '2026-12-31',
  },
  // Deals from other center merchants
  {
    id: 'cdeal-2',
    clusterId: 'cluster-amaka-mall',
    businessId: '201',
    businessName: 'Zaria Artisan Bakery & Cafe',
    entityType: 'deal',
    title: 'Buy 1 Caramel Latte, Get Pastry 50% Off',
    subtitle: 'Handcrafted espresso beverages paired with golden flaky croissants',
    discount: '50% OFF',
    price: 3200,
    oldPrice: 4800,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mVwJbVAhXMM6239ZPfDxwph2u7rXh0Me0cneDcRhckqCG_zdKDD2N_U8F7OK8e3jF5BJ2M0prZjgOX_1rQUbl5SJSX27asdG82U5vIYoaeC-SwhTYdK3Tr-da_MBPcs00hrZX4a8XBjl4JD9J6BTr3RflgchtVCldlT7yQzQOdSScCg7yC1Zagz_1EsP-7VUerTf5jQH7KjI-KelSjRNCL8gD9QySyXtULI9QIWC',
    category: 'food',
    status: 'in_rotator',
    showInCluster: true,
    views: 2210,
    impressions: 6840,
    clicks: 1320,
    redemptions: 210,
    submittedAt: '2024-04-03',
    expiresAt: '2026-12-31',
  },
  {
    id: 'cdeal-3',
    clusterId: 'cluster-amaka-mall',
    businessId: '203',
    businessName: 'GadgetZone Express',
    entityType: 'deal',
    title: 'Anker 20,000mAh Powerbank with Type-C Fast Charge',
    subtitle: 'Dual port 22.5W high output power storage with digital display',
    discount: '20% OFF',
    price: 24000,
    oldPrice: 30000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYU9CHvad8mmB1n7HZebj-9-RJNU48y8c41IO7GzzEk_4mD-lhgfd9MReQAi7YmYcbcDcZHGy4JlFEc8Y_xvGS6GKTRikmdwO8inJNNZQsqJthBLoFuxRSpANFde0IjudqyzaZd9ctxXpfJ_cpK_TFjTBltS6O6CxRYEBNCjzmWBdHm6GkyB7QsKUssO8D-I_atfFeR6xo6CqLFnTTx60Hn6je8raKJ2qdZ15i07to',
    category: 'electronics',
    status: 'in_rotator',
    showInCluster: true,
    views: 1190,
    impressions: 3950,
    clicks: 740,
    redemptions: 89,
    submittedAt: '2024-04-04',
    expiresAt: '2026-12-31',
  },
  {
    id: 'cdeal-4',
    clusterId: 'cluster-amaka-mall',
    businessId: '204',
    businessName: 'Bella Glow Skincare Clinic',
    entityType: 'deal',
    title: 'Hydra-Facial & Deep Pore Cleanse Session',
    subtitle: '60 minutes full skin detox with hyaluronic acid infusion',
    discount: '30% OFF',
    price: 17500,
    oldPrice: 25000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8LxbXWebu4BeWFCBPcQnwZ3yOVjHO9H4S9ZOfPGV9cMmACi2aZB_Hhu0JontfNGmJN7KDb9t8ObRhK6kcgRU9c1neHq-t6gNg7HFK2Z7F6XMKJNJcoMQCUei7KQvEMOdk3yYtVf3e5Ie3aMnIgjAIYTBFhfC430FSqSmLEtAuHlaO5BSCLUxZ4BFq5qVHBfhvErtWg7n15YG4LtYJ5TbHhVwyxpqngk-At1VnoQZ5',
    category: 'beauty',
    status: 'in_rotator',
    showInCluster: true,
    views: 1540,
    impressions: 4890,
    clicks: 980,
    redemptions: 115,
    submittedAt: '2024-04-06',
    expiresAt: '2026-12-31',
  },
];

// Initial mock chat messages between merchants
export const INITIAL_CHAT_MESSAGES: Record<string, ClusterChatMessage[]> = {
  '201': [
    {
      id: 'msg-1',
      senderBusinessId: '201',
      senderBusinessName: 'Zaria Artisan Bakery & Cafe',
      recipientBusinessId: '104',
      recipientBusinessName: 'Urban Grill & Bistro',
      text: 'Good afternoon Urban Grill team! We loved the joint footfall on Saturday from the Amaka Mall QR stand.',
      timestamp: 'Yesterday 3:15 PM',
      isSelf: false,
    },
    {
      id: 'msg-2',
      senderBusinessId: '104',
      senderBusinessName: 'Urban Grill & Bistro',
      recipientBusinessId: '201',
      recipientBusinessName: 'Zaria Artisan Bakery & Cafe',
      text: 'Hi Chef! Yes, we had 14 customers walk over after getting coffee at your kiosk with the cluster pass!',
      timestamp: 'Yesterday 3:45 PM',
      isSelf: true,
    },
  ],
  '202': [
    {
      id: 'msg-3',
      senderBusinessId: '202',
      senderBusinessName: 'Aura Couture & Fabrics',
      recipientBusinessId: '104',
      recipientBusinessName: 'Urban Grill & Bistro',
      text: 'Hello Urban Grill! Are you open for a cross-promotional weekend banner near the atrium escalator?',
      timestamp: '2 days ago',
      isSelf: false,
    },
  ],
};

const STORAGE_KEYS = {
  CLUSTERS: 'vemtap_clusters_list',
  MEMBERS: 'vemtap_cluster_members',
  SHOWCASE_ITEMS: 'vemtap_cluster_showcase_items',
  DETECTED_SCENARIO: 'vemtap_cluster_test_scenario',
  SHOWCASE_PREF: 'vemtap_cluster_showcase_pref',
  MESSAGES: 'vemtap_cluster_messages',
};

export type ClusterScenario = 'detected' | 'not_found' | 'already_joined';
export type ShowcasePreference = 'all' | 'deals' | 'products' | 'services' | 'profile' | ShowcaseEntityType;

export interface ClusterStateStore {
  currentCluster: Cluster | null;
  isMember: boolean;
  memberRecord: ClusterBusinessMember | null;
  members: ClusterBusinessMember[];
  showcaseItems: ClusterShowcaseItem[];
  deals: ClusterShowcaseItem[]; // Backward compatibility alias
  allClusters: Cluster[];
  scenario: ClusterScenario;
  showcasePreference: ShowcasePreference;
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/**
 * Returns the current cluster state.
 */
export function getClusterState(): ClusterStateStore {
  const scenario = getStored<ClusterScenario>(STORAGE_KEYS.DETECTED_SCENARIO, 'already_joined');
  const allClusters = getStored<Cluster[]>(STORAGE_KEYS.CLUSTERS, EXISTING_CLUSTERS);
  const currentCluster = allClusters[0] || EXISTING_CLUSTERS[0];
  const members = getStored<ClusterBusinessMember[]>(STORAGE_KEYS.MEMBERS, AMAKA_MALL_MEMBERS);
  const showcaseItems = getStored<ClusterShowcaseItem[]>(
    STORAGE_KEYS.SHOWCASE_ITEMS,
    INITIAL_SHOWCASE_ITEMS
  );
  const showcasePreference = getStored<'all' | 'deals' | 'products' | 'services' | 'profile'>(
    STORAGE_KEYS.SHOWCASE_PREF,
    'all'
  );

  const memberRecord = members.find((m) => m.businessId === '104') || null;
  const isMember = scenario === 'already_joined' && Boolean(memberRecord);

  return {
    currentCluster,
    isMember,
    memberRecord,
    members,
    showcaseItems,
    deals: showcaseItems, // alias
    allClusters,
    scenario,
    showcasePreference,
  };
}

/**
 * Toggles whether an item is featured/shown in the cluster system.
 */
export function toggleItemShowInCluster(itemId: string): ClusterShowcaseItem | null {
  const state = getClusterState();
  let updatedItem: ClusterShowcaseItem | null = null;

  const updated = state.showcaseItems.map((item) => {
    if (item.id === itemId) {
      updatedItem = {
        ...item,
        showInCluster: !item.showInCluster,
        status: !item.showInCluster ? 'in_rotator' : 'hidden',
      };
      return updatedItem;
    }
    return item;
  });

  setStored(STORAGE_KEYS.SHOWCASE_ITEMS, updated);
  return updatedItem;
}

/**
 * Sets what entity type the business wants to highlight in the cluster.
 */
export function setBusinessShowcasePreference(
  pref: ShowcasePreference
): void {
  setStored(STORAGE_KEYS.SHOWCASE_PREF, pref);
}

/**
 * Imports or submits an item (deal, product, service, or profile) to the cluster rotator pool.
 */
export function importShowcaseItem(item: {
  entityType: ShowcaseEntityType;
  title: string;
  subtitle?: string;
  discount?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  category?: string;
  showInCluster?: boolean;
}): ClusterShowcaseItem {
  const state = getClusterState();
  const currentClusterId = state.currentCluster?.id || 'cluster-amaka-mall';

  const newItem: ClusterShowcaseItem = {
    id: `citem-${Date.now()}`,
    clusterId: currentClusterId,
    businessId: '104',
    businessName: 'Urban Grill & Bistro',
    entityType: item.entityType,
    title: item.title,
    subtitle: item.subtitle,
    discount: item.discount || (item.entityType === 'deal' ? 'Special Offer' : undefined),
    price: item.price,
    oldPrice: item.oldPrice,
    image:
      item.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzuzWH0U2QwYnphmSNvwNgYy2KT9cbZZxQNp4OF417hvHDjdXIJqcXgAC0Jq8C7aUqvI9P8d-w7L8889ftoMaC7SVb55GxQI8STHGI_jgEb4tRuyj8-9dAez7sJPsXlovchJ-pR0bEzWHx0RgkXq2BlmOzLSdyrwzyteeyXHL-RtjY_NoILSeP30TIsuIXZ9oQkLa1XyGCEuUU0ytwTAoVRMYGUsww_IPRVpVUea3B',
    category: item.category || 'food',
    status: item.showInCluster !== false ? 'in_rotator' : 'hidden',
    showInCluster: item.showInCluster !== false,
    views: 0,
    impressions: 0,
    clicks: 0,
    redemptions: 0,
    submittedAt: new Date().toISOString().split('T')[0],
    expiresAt: '2026-12-31',
  };

  const updatedItems = [newItem, ...state.showcaseItems];
  setStored(STORAGE_KEYS.SHOWCASE_ITEMS, updatedItems);
  return newItem;
}

/**
 * Backward compatibility alias for submitDealToCluster.
 */
export function submitDealToCluster(deal: {
  title: string;
  discount: string;
  price: number;
  oldPrice: number;
  image?: string;
  category?: string;
}): ClusterShowcaseItem {
  return importShowcaseItem({
    entityType: 'deal',
    title: deal.title,
    discount: deal.discount,
    price: deal.price,
    oldPrice: deal.oldPrice,
    image: deal.image,
    category: deal.category,
    showInCluster: true,
  });
}

/**
 * Gets chat messages for a member business.
 */
export function getClusterMessages(otherBusinessId: string): ClusterChatMessage[] {
  const allMessages = getStored<Record<string, ClusterChatMessage[]>>(
    STORAGE_KEYS.MESSAGES,
    INITIAL_CHAT_MESSAGES
  );
  return allMessages[otherBusinessId] || [];
}

/**
 * Sends a message to another member business.
 */
export function sendClusterMessage(
  recipientId: string,
  recipientName: string,
  text: string
): ClusterChatMessage {
  const allMessages = getStored<Record<string, ClusterChatMessage[]>>(
    STORAGE_KEYS.MESSAGES,
    INITIAL_CHAT_MESSAGES
  );
  const thread = allMessages[recipientId] || [];

  const newMsg: ClusterChatMessage = {
    id: `msg-${Date.now()}`,
    senderBusinessId: '104',
    senderBusinessName: 'Urban Grill & Bistro',
    recipientBusinessId: recipientId,
    recipientBusinessName: recipientName,
    text,
    timestamp: 'Just now',
    isSelf: true,
  };

  const updatedThread = [...thread, newMsg];
  allMessages[recipientId] = updatedThread;
  setStored(STORAGE_KEYS.MESSAGES, allMessages);

  return newMsg;
}

/**
 * Simulates joining an existing cluster.
 */
export function joinCluster(
  clusterId: string,
  unitOrSuite = 'Shop G-12, Ground Floor'
): ClusterBusinessMember {
  const state = getClusterState();
  const existing = state.members.find((m) => m.businessId === '104' && m.clusterId === clusterId);
  if (existing) {
    setStored(STORAGE_KEYS.DETECTED_SCENARIO, 'already_joined');
    return existing;
  }

  const newMember: ClusterBusinessMember = {
    id: `mem-${Date.now()}`,
    businessId: '104',
    clusterId,
    businessName: 'Urban Grill & Bistro',
    category: 'food',
    unitOrSuite,
    joinedAt: new Date().toISOString().split('T')[0],
    status: 'active',
    isVerified: true,
    phone: '+234 803 456 7890',
    email: 'contact@urbangrillbistro.com',
    hours: '11:00 AM – 11:00 PM (Mon - Sun)',
    bio: 'Artisan smokehouse and grill bistro in Abuja serving aged wagyu cuts, smoked BBQ platters, craft mocktails, and fresh woodfire dishes.',
    bannerUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUGGVIpCUSLqlt98cYR2Kj4otzS8A3jD9Vd49iHIZtmCuwg4JGt-4xGDXcojgKA7EfwP1g5KJ0yYc1PRhhvAuGjCLOlJl4js18SWfuqEJ1Q3-FEe7NSHInPrWL7DLC5sjJ1MNdzp1mrBu1raKFe_ejXJNDv0e9DM4_Z5qzXep91UsXwqUUivw-Y93_K6ZB5RC56jEnIMVWa6y-ISWWPJ9F1CiZVFJwVNNYiRrkOAJ2b0-FuFZZ9lbJ_A',
    dealsCount: 2,
    scansContributed: 0,
    topOffers: [
      { title: 'Smoked BBQ Ribs Platter + Drink', price: 11250, discount: '25% OFF' },
      { title: 'Gourmet Wagyu Burger + Handcut Truffle Fries', price: 8500, discount: '15% OFF' },
    ],
  };

  const updatedMembers = [newMember, ...state.members];
  setStored(STORAGE_KEYS.MEMBERS, updatedMembers);
  setStored(STORAGE_KEYS.DETECTED_SCENARIO, 'already_joined');

  const updatedClusters = state.allClusters.map((c) => {
    if (c.id === clusterId) {
      return {
        ...c,
        stats: {
          ...c.stats,
          totalBusinesses: c.stats.totalBusinesses + 1,
          activeBusinesses: c.stats.activeBusinesses + 1,
        },
      };
    }
    return c;
  });
  setStored(STORAGE_KEYS.CLUSTERS, updatedClusters);

  return newMember;
}

/**
 * Checks duplicate cluster by name or address.
 */
export function checkDuplicateCluster(
  name: string,
  address: string
): { isDuplicate: boolean; matchedCluster?: Cluster; reason?: string } {
  const state = getClusterState();
  const normalizedName = name.trim().toLowerCase();
  const normalizedAddr = address.trim().toLowerCase();

  for (const c of state.allClusters) {
    if (c.name.trim().toLowerCase() === normalizedName) {
      return {
        isDuplicate: true,
        matchedCluster: c,
        reason: `A cluster with the name "${c.name}" already exists in ${c.city}.`,
      };
    }
    if (normalizedAddr.length > 5 && c.address.trim().toLowerCase().includes(normalizedAddr)) {
      return {
        isDuplicate: true,
        matchedCluster: c,
        reason: `A cluster at "${c.address}" is already registered (${c.name}).`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Creates a new cluster (simulated).
 */
export function createCluster(data: {
  name: string;
  type: ClusterType;
  city: string;
  state: string;
  address: string;
  radiusMeters?: number;
  unitOrSuite?: string;
}): Cluster {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const displayCode = `${slug.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const newCluster: Cluster = {
    id: `cluster-${Date.now()}`,
    name: data.name,
    slug,
    type: data.type,
    city: data.city,
    state: data.state,
    address: data.address,
    coordinates: { lat: 9.0412, lng: 7.4812 },
    radiusMeters: data.radiusMeters || 500,
    creatorBusinessId: '104',
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active',
    description: `Merchant collective for ${data.name}, connecting verified local businesses with shared QR discovery.`,
    qrCode: {
      url: `https://vemtap.com/c/${slug}`,
      displayCode,
      scansThisWeek: 0,
      scansTotal: 0,
    },
    rotatorSettings: {
      isActive: true,
      rotationIntervalSeconds: 45,
      maxActiveDeals: 6,
      activeDealsCount: 1,
    },
    stats: {
      totalBusinesses: 1,
      activeBusinesses: 1,
      totalDealsInPool: 1,
      totalScans: 0,
      thisMonthScans: 0,
      avgDealsClaimedPerDay: 0,
    },
    analytics: {
      clusterViews: 0,
      clusterImpressions: 0,
      clusterClicks: 0,
      clusterScans: 0,
      businessViews: 0,
      businessImpressions: 0,
      businessClicks: 0,
      businessCtr: 0,
      dailyTrend: [
        { date: 'Mon', views: 0, impressions: 0, clicks: 0 },
        { date: 'Tue', views: 0, impressions: 0, clicks: 0 },
        { date: 'Wed', views: 0, impressions: 0, clicks: 0 },
        { date: 'Thu', views: 0, impressions: 0, clicks: 0 },
        { date: 'Fri', views: 0, impressions: 0, clicks: 0 },
        { date: 'Sat', views: 0, impressions: 0, clicks: 0 },
        { date: 'Sun', views: 0, impressions: 0, clicks: 0 },
      ],
    },
  };

  const state = getClusterState();
  const updatedClusters = [newCluster, ...state.allClusters];
  setStored(STORAGE_KEYS.CLUSTERS, updatedClusters);

  joinCluster(newCluster.id, data.unitOrSuite || 'Suite 1');
  return newCluster;
}

/**
 * Resets or switches testing scenario for the demo.
 */
export function setClusterScenario(scenario: ClusterScenario): void {
  setStored(STORAGE_KEYS.DETECTED_SCENARIO, scenario);
  if (scenario === 'not_found' || scenario === 'detected') {
    const state = getClusterState();
    const filtered = state.members.filter((m) => m.businessId !== '104');
    setStored(STORAGE_KEYS.MEMBERS, filtered);
  } else if (scenario === 'already_joined') {
    const state = getClusterState();
    if (!state.members.some((m) => m.businessId === '104')) {
      const restored = [AMAKA_MALL_MEMBERS[0], ...state.members];
      setStored(STORAGE_KEYS.MEMBERS, restored);
    }
  }
}
