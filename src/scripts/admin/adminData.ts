/**
 * VEMTAP Enterprise Admin Platform Mock Data & Master Registry
 */

export interface AdminBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  tier: 'Platinum Enterprise' | 'Gold Merchant' | 'Silver Tier' | 'Basic Trial';
  cacRc: string;
  tin: string;
  cluster: string;
  state: string;
  branchCount: number;
  staffCount: number;
  complianceStatus: 'Verified' | 'Under Review' | 'Pending Validation' | 'Suspended';
  billingPlan: string;
  monthlyGmv: string;
  uptime: string;
  retention: string;
  posCount: number;
  dailyOrders: number;
  activeDeals: number;
  owner: {
    name: string;
    role: string;
    email: string;
    phone: string;
    supportEmail: string;
    escrowAccount: string;
    avatarUrl: string;
  };
  hqAddress: string;
  operatingHours: {
    weekdays: string;
    saturdays: string;
    sundays: string;
  };
  branches: Array<{
    id: string;
    name: string;
    address: string;
    manager: string;
    geofence: string;
    terminals: number;
    staff: number;
    type: 'Main Hub / HQ' | 'Regional Store' | 'Express Outlet';
  }>;
  staff: Array<{
    id: string;
    name: string;
    initials: string;
    email: string;
    branch: string;
    role: string;
    posAuth: string;
    status: string;
  }>;
  catalogue: Array<{
    id: string;
    title: string;
    sku: string;
    price: string;
    discount?: string;
    stock: number;
    image: string;
  }>;
  qrTokens: Array<{
    token: string;
    assignment: string;
    status: 'Active Signal' | 'Standby' | 'Offline';
  }>;
}

export interface AdminCustomer {
  id: string;
  code: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  cluster: string;
  status: 'Active' | 'Dormant' | 'Suspended';
  tier: string;
  memberSince: string;
  activeDays: number;
  devicePlatform: string;
  restrictionStatus: string;
  authRail: string;
  tapsRecorded: number;
  lifetimeValue: string;
  purchasesCount: number;
  savedPlaces: Array<{
    name: string;
    cluster: string;
    claimedDeals: number;
    initial: string;
  }>;
  claimedDeals: Array<{
    title: string;
    voucher: string;
    status: 'Ready for POS Tap' | 'Saved to Wallet' | 'Redeemed';
    expiresIn?: string;
  }>;
  activityHistory: Array<{
    id: string;
    type: 'nfc_tap' | 'qr_scan' | 'search' | 'saved_deal';
    title: string;
    timestamp: string;
    description: string;
    amount?: string;
  }>;
  savedPlacesCount: number;
  savedDealsCount: number;
  lastActive: string;
}

export interface ClusterNode {
  id: string;
  name: string;
  state: string;
  impressions: number;
  taps: number;
  conversion: string;
  activeMerchants: number;
  posCount: number;
  status: 'Healthy' | 'Congested' | 'Warning';
}

export interface VerificationItem {
  id: string;
  batchId: string;
  type: 'kyb' | 'geofence' | 'flagged_deal' | 'payment_exception';
  title: string;
  tag: string;
  tagColor: 'red' | 'amber' | 'purple' | 'blue';
  description: string;
  remainingTime: string;
  entityName: string;
  docs?: string[];
}

export interface PlatformTransaction {
  id: string;
  timestamp: string;
  merchantName: string;
  branchOrTerminal: string;
  rail: string;
  railColor: string;
  amount: string;
  status: 'Settled' | 'Pending Escrow' | 'Flagged' | 'Refunded';
}

export const ADMIN_CLUSTERS: ClusterNode[] = [
  {
    id: 'c1',
    name: 'Ikeja Computer Village',
    state: 'Lagos Mainland, NG',
    impressions: 42100,
    taps: 11420,
    conversion: '27.1%',
    activeMerchants: 840,
    posCount: 3240,
    status: 'Healthy',
  },
  {
    id: 'c2',
    name: 'Lekki Phase 1 Admiralty Corridor',
    state: 'Lagos Urban, NG',
    impressions: 36800,
    taps: 9850,
    conversion: '26.7%',
    activeMerchants: 620,
    posCount: 2890,
    status: 'Healthy',
  },
  {
    id: 'c3',
    name: 'Victoria Island Commercial Belt',
    state: 'Lagos Island, NG',
    impressions: 29400,
    taps: 8110,
    conversion: '27.5%',
    activeMerchants: 580,
    posCount: 2450,
    status: 'Healthy',
  },
  {
    id: 'c4',
    name: 'Abuja Wuse 2 High Street',
    state: 'FCT, NG',
    impressions: 21900,
    taps: 5430,
    conversion: '24.7%',
    activeMerchants: 410,
    posCount: 1820,
    status: 'Healthy',
  },
  {
    id: 'c5',
    name: 'Port Harcourt GRA Phase 2',
    state: 'Rivers State, NG',
    impressions: 18500,
    taps: 4210,
    conversion: '22.8%',
    activeMerchants: 290,
    posCount: 1150,
    status: 'Healthy',
  },
  {
    id: 'c6',
    name: 'Kano City Trade Corridor',
    state: 'Kano State, NG',
    impressions: 14200,
    taps: 3100,
    conversion: '21.8%',
    activeMerchants: 210,
    posCount: 890,
    status: 'Healthy',
  },
];

export const ADMIN_BUSINESSES: AdminBusiness[] = [
  {
    id: 'biz_slot',
    name: 'Slot Electronics Flagship',
    slug: 'slot-ikeja',
    category: 'Consumer Electronics',
    tier: 'Platinum Enterprise',
    cacRc: 'RC-1049281',
    tin: '28491029-001',
    cluster: 'Ikeja Computer Village',
    state: 'Lagos Mainland, NG',
    branchCount: 8,
    staffCount: 184,
    complianceStatus: 'Verified',
    billingPlan: 'Active Platinum (₦180k/mo)',
    monthlyGmv: '₦42.8M',
    uptime: '99.8%',
    retention: '78.4%',
    posCount: 26,
    dailyOrders: 318,
    activeDeals: 9,
    owner: {
      name: 'Nnamdi Kalu',
      role: 'Chief Executive Officer / Primary Signatory',
      email: 'nnamdi.kalu@slot.ng',
      phone: '+234 (01) 803 294 0019',
      supportEmail: 'operations@slot.ng',
      escrowAccount: 'Access Bank ••••••9102',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    hqAddress: 'No. 2B Medical Road / Otigba Junction, Ikeja, Lagos State.',
    operatingHours: {
      weekdays: '08:00 AM – 07:00 PM',
      saturdays: '09:00 AM – 06:00 PM',
      sundays: 'Closed (Logistics only)',
    },
    branches: [
      {
        id: 'br_1',
        name: 'Ikeja Flagship',
        address: 'Otigba St, Computer Village, Lagos',
        manager: 'Tunde Adebayo',
        geofence: '150m Perimeter Lock',
        terminals: 12,
        staff: 68,
        type: 'Main Hub / HQ',
      },
      {
        id: 'br_2',
        name: 'Victoria Island Hub',
        address: '14 Adeola Odeku St, Lagos',
        manager: 'Chioma Eze',
        geofence: '80m Radius Lock',
        terminals: 6,
        staff: 42,
        type: 'Regional Store',
      },
      {
        id: 'br_3',
        name: 'Abuja Central',
        address: 'Adetokunbo Ademola Cres, Wuse 2, Abuja',
        manager: 'Ibrahim Musa',
        geofence: '120m Perimeter Lock',
        terminals: 8,
        staff: 38,
        type: 'Regional Store',
      },
      {
        id: 'br_4',
        name: 'Lekki Admiralty Store',
        address: 'Block 12 Admiralty Way, Lekki Phase 1',
        manager: 'Sarah Briggs',
        geofence: '100m Perimeter Lock',
        terminals: 5,
        staff: 24,
        type: 'Regional Store',
      },
    ],
    staff: [
      {
        id: 'st_1',
        name: 'Tunde Adebayo',
        initials: 'TA',
        email: 'tunde@slot.ng',
        branch: 'Ikeja Flagship',
        role: 'Store Manager',
        posAuth: 'Full POS Override',
        status: 'Active (2FA)',
      },
      {
        id: 'st_2',
        name: 'Chioma Eze',
        initials: 'CE',
        email: 'chioma.e@slot.ng',
        branch: 'Victoria Island',
        role: 'Store Manager',
        posAuth: 'Full POS Override',
        status: 'Active (2FA)',
      },
      {
        id: 'st_3',
        name: 'Folake Olufemi',
        initials: 'FO',
        email: 'f.olufemi@slot.ng',
        branch: 'Ikeja Flagship',
        role: 'Head Cashier',
        posAuth: 'Shift POS Operator',
        status: 'Active',
      },
    ],
    catalogue: [
      {
        id: 'cat_1',
        title: 'Samsung Galaxy S24 Ultra 512GB',
        sku: 'SMG-S24U-BLK',
        price: '₦1,720,000',
        discount: '-12%',
        stock: 38,
        image:
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'cat_2',
        title: 'Apple iPhone 15 Pro Max 256GB',
        sku: 'APL-IP15PM-NAT',
        price: '₦1,850,000',
        stock: 19,
        image:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'cat_3',
        title: 'Sony WH-1000XM5 Noise Canceling',
        sku: 'SNY-XM5-SLV',
        price: '₦380,000',
        discount: '-25%',
        stock: 64,
        image:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
      },
    ],
    qrTokens: [
      {
        token: 'NFC-IKJ-01',
        assignment: 'Cashier Counter 1 (Main Hall)',
        status: 'Active Signal',
      },
      {
        token: 'NFC-IKJ-02',
        assignment: 'VIP Support Desk 2',
        status: 'Active Signal',
      },
      {
        token: 'NFC-VI-01',
        assignment: 'Victoria Island Branch Entrance',
        status: 'Active Signal',
      },
    ],
  },
  {
    id: 'biz_mega',
    name: 'Mega Plaza Century Mall',
    slug: 'megaplaza-vi',
    category: 'Retail & Lifestyle',
    tier: 'Gold Merchant',
    cacRc: 'RC-0849204',
    tin: '19482012-001',
    cluster: 'Victoria Island Hub',
    state: 'Lagos Island, NG',
    branchCount: 3,
    staffCount: 92,
    complianceStatus: 'Verified',
    billingPlan: 'Gold Annual (Cycle: 14 Dec 2025)',
    monthlyGmv: '₦28.4M',
    uptime: '99.5%',
    retention: '72.1%',
    posCount: 18,
    dailyOrders: 210,
    activeDeals: 6,
    owner: {
      name: 'Adekunle Gomez',
      role: 'Operations Director',
      email: 'a.gomez@megaplaza.ng',
      phone: '+234 (01) 271 8840',
      supportEmail: 'desk@megaplaza.ng',
      escrowAccount: 'Zenith Bank ••••••4401',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    hqAddress: '14 Idowu Martins St, Victoria Island, Lagos.',
    operatingHours: {
      weekdays: '09:00 AM – 09:00 PM',
      saturdays: '09:00 AM – 09:00 PM',
      sundays: '11:00 AM – 07:00 PM',
    },
    branches: [
      {
        id: 'br_mp1',
        name: 'VI Century Mall',
        address: 'Idowu Martins St, VI',
        manager: 'Chinedu Okeke',
        geofence: '180m Perimeter Lock',
        terminals: 10,
        staff: 50,
        type: 'Main Hub / HQ',
      },
    ],
    staff: [],
    catalogue: [],
    qrTokens: [
      {
        token: 'NFC-MP-01',
        assignment: 'Ground Floor Checkout Station',
        status: 'Active Signal',
      },
    ],
  },
  {
    id: 'biz_medplus',
    name: 'Medplus Pharmacy Network',
    slug: 'medplus-lagos',
    category: 'Pharma & Health',
    tier: 'Platinum Enterprise',
    cacRc: 'RC-0492819',
    tin: '84920194-002',
    cluster: 'Lekki Commercial Zone',
    state: 'Lagos Urban, NG',
    branchCount: 14,
    staffCount: 240,
    complianceStatus: 'Verified',
    billingPlan: 'Active Platinum (₦180k/mo)',
    monthlyGmv: '₦54.2M',
    uptime: '99.9%',
    retention: '84.2%',
    posCount: 42,
    dailyOrders: 560,
    activeDeals: 12,
    owner: {
      name: 'Dr. Joke Bakare',
      role: 'Managing Director & Founder',
      email: 'j.bakare@medplus.ng',
      phone: '+234 (01) 461 9021',
      supportEmail: 'care@medplus.ng',
      escrowAccount: 'GTBank ••••••1192',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    hqAddress: 'Medplus HQ, Plot 7 Block 2 Admiralty Way, Lekki Phase 1.',
    operatingHours: {
      weekdays: '24 Hours Open',
      saturdays: '24 Hours Open',
      sundays: '24 Hours Open',
    },
    branches: [],
    staff: [],
    catalogue: [],
    qrTokens: [],
  },
  {
    id: 'biz_cr',
    name: 'Chicken Republic Wuse',
    slug: 'cr-wuse2',
    category: 'Dining & Quick Service',
    tier: 'Gold Merchant',
    cacRc: 'RC-0029481',
    tin: '48102948-001',
    cluster: 'Abuja Central Trade Ring',
    state: 'FCT, NG',
    branchCount: 6,
    staffCount: 118,
    complianceStatus: 'Under Review',
    billingPlan: 'Enterprise Retainer (Grace Period Active)',
    monthlyGmv: '₦21.8M',
    uptime: '98.9%',
    retention: '76.8%',
    posCount: 14,
    dailyOrders: 420,
    activeDeals: 4,
    owner: {
      name: 'Farouk Ahmed',
      role: 'Franchise Partner',
      email: 'f.ahmed@foodconcepts.ng',
      phone: '+234 809 112 3344',
      supportEmail: 'cr.wuse2@foodconcepts.ng',
      escrowAccount: 'First Bank ••••••7890',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    hqAddress: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja.',
    operatingHours: {
      weekdays: '07:30 AM – 10:00 PM',
      saturdays: '08:00 AM – 10:00 PM',
      sundays: '08:00 AM – 09:30 PM',
    },
    branches: [],
    staff: [],
    catalogue: [],
    qrTokens: [],
  },
];

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  {
    id: 'cust_chiamaka',
    code: '#CUST-88219-LAG',
    name: 'Chiamaka Okonkwo',
    initials: 'CO',
    email: 'c.okonkwo@lagosmail.ng',
    phone: '+234 803 491 2280',
    cluster: 'Lagos Lekki',
    status: 'Active',
    tier: 'Tier 1 Consumer',
    memberSince: '14 Nov 2023 (182 days active)',
    activeDays: 182,
    devicePlatform: 'iPhone 14 Pro • iOS 17.4 (v2.8.2)',
    restrictionStatus: 'None (Clean standing)',
    authRail: 'Phone OTP + Biometric TouchID',
    tapsRecorded: 142,
    lifetimeValue: '₦248,500',
    purchasesCount: 34,
    savedPlacesCount: 14,
    savedDealsCount: 28,
    lastActive: 'Today, 14:12',
    savedPlaces: [
      {
        name: 'Slot Electronics Flagship',
        cluster: 'Ikeja Hub',
        claimedDeals: 1,
        initial: 'S',
      },
      {
        name: 'Chicken Republic',
        cluster: 'Admiralty Lekki',
        claimedDeals: 2,
        initial: 'C',
      },
      {
        name: 'Medplus Pharmacy',
        cluster: 'Victoria Island',
        claimedDeals: 1,
        initial: 'M',
      },
    ],
    claimedDeals: [
      {
        title: 'Lekki Gourmet: 20% Tap & Dine Discount',
        voucher: '#LG-9428-VMT',
        status: 'Ready for POS Tap',
      },
      {
        title: 'Mega Seafood Market: ₦2,500 Off Fresh Bundles',
        voucher: '#MS-1102-VMT',
        status: 'Saved to Wallet',
        expiresIn: '4 days',
      },
    ],
    activityHistory: [
      {
        id: 'act_1',
        type: 'nfc_tap',
        title: 'NFC Tap Recorded',
        timestamp: 'Today, 14:12 WAT',
        description: 'At Slot Electronics Flagship (Terminal POS-IKJ-04). Completed purchase ₦52,000.',
        amount: '₦52,000',
      },
      {
        id: 'act_2',
        type: 'qr_scan',
        title: 'Voucher Scanned',
        timestamp: 'Yesterday, 19:42 WAT',
        description: 'Scanned QR Deal Code #CR-7718 at Chicken Republic Admiralty.',
      },
      {
        id: 'act_3',
        type: 'search',
        title: 'Discovery Feed Search',
        timestamp: '3 days ago',
        description: 'Search query performed in Discovery feed: "Pharmacies near Lekki Phase 1" (6 merchant cards viewed).',
      },
      {
        id: 'act_4',
        type: 'saved_deal',
        title: 'Deal Saved to Wallet',
        timestamp: '5 days ago',
        description: 'Saved deal "20% Weekend Dining Passport" to wallet.',
      },
    ],
  },
  {
    id: 'cust_tunde',
    code: '#CUST-88204-IKJ',
    name: 'Tunde Bakare',
    initials: 'TB',
    email: 'tundebakare@gmail.com',
    phone: '+234 812 770 1194',
    cluster: 'Lagos Ikeja',
    status: 'Active',
    tier: 'Tier 2 Consumer',
    memberSince: '02 Jan 2024 (120 days active)',
    activeDays: 120,
    devicePlatform: 'Samsung S23 Ultra • Android 14',
    restrictionStatus: 'None (Clean standing)',
    authRail: 'Phone OTP',
    tapsRecorded: 68,
    lifetimeValue: '₦118,200',
    purchasesCount: 16,
    savedPlacesCount: 8,
    savedDealsCount: 11,
    lastActive: '2h ago',
    savedPlaces: [
      {
        name: 'Slot Electronics Flagship',
        cluster: 'Ikeja Hub',
        claimedDeals: 1,
        initial: 'S',
      },
    ],
    claimedDeals: [],
    activityHistory: [],
  },
  {
    id: 'cust_amina',
    code: '#CUST-88190-ABJ',
    name: 'Amina Danjuma',
    initials: 'AD',
    email: 'a.danjuma@wuseventures.com',
    phone: '+234 809 332 9901',
    cluster: 'Abuja Wuse 2',
    status: 'Active',
    tier: 'Tier 1 Consumer',
    memberSince: '18 Oct 2023 (210 days active)',
    activeDays: 210,
    devicePlatform: 'iPhone 15 • iOS 17.5',
    restrictionStatus: 'None (Clean standing)',
    authRail: 'Biometric FaceID',
    tapsRecorded: 184,
    lifetimeValue: '₦394,000',
    purchasesCount: 48,
    savedPlacesCount: 22,
    savedDealsCount: 49,
    lastActive: 'Yesterday',
    savedPlaces: [],
    claimedDeals: [],
    activityHistory: [],
  },
  {
    id: 'cust_emeka',
    code: '#CUST-88145-PH',
    name: 'Emeka Obi',
    initials: 'EO',
    email: 'emeka.obi@ph-oilandgas.io',
    phone: '+234 818 554 0921',
    cluster: 'PH GRA Phase 2',
    status: 'Dormant',
    tier: 'Basic Consumer',
    memberSince: '10 Feb 2024 (80 days active)',
    activeDays: 80,
    devicePlatform: 'Pixel 8 Pro • Android 14',
    restrictionStatus: 'Dormant (No tap in 30 days)',
    authRail: 'Phone OTP',
    tapsRecorded: 12,
    lifetimeValue: '₦34,000',
    purchasesCount: 4,
    savedPlacesCount: 3,
    savedDealsCount: 5,
    lastActive: '3 weeks ago',
    savedPlaces: [],
    claimedDeals: [],
    activityHistory: [],
  },
  {
    id: 'cust_fatima',
    code: '#CUST-87992-KAN',
    name: 'Fatima Garba',
    initials: 'FG',
    email: 'f.garba@kntrade.net',
    phone: '+234 802 612 8490',
    cluster: 'Kano City',
    status: 'Active',
    tier: 'Tier 2 Consumer',
    memberSince: '12 Dec 2023 (150 days active)',
    activeDays: 150,
    devicePlatform: 'iPhone 13 • iOS 17.2',
    restrictionStatus: 'None (Clean standing)',
    authRail: 'Phone OTP',
    tapsRecorded: 52,
    lifetimeValue: '₦89,400',
    purchasesCount: 11,
    savedPlacesCount: 11,
    savedDealsCount: 19,
    lastActive: '4 days ago',
    savedPlaces: [],
    claimedDeals: [],
    activityHistory: [],
  },
  {
    id: 'cust_kenneth',
    code: '#CUST-86411-IKJ',
    name: 'Kenneth Nwosu',
    initials: 'KN',
    email: 'knwosu99@yahoo.co.uk',
    phone: '+234 701 989 4432',
    cluster: 'Lagos Ikeja',
    status: 'Suspended',
    tier: 'Suspended',
    memberSince: '15 Aug 2023',
    activeDays: 15,
    devicePlatform: 'Android 11',
    restrictionStatus: 'Suspended (Abuse flag)',
    authRail: 'Disabled',
    tapsRecorded: 0,
    lifetimeValue: '₦0',
    purchasesCount: 0,
    savedPlacesCount: 0,
    savedDealsCount: 0,
    lastActive: '8 weeks ago',
    savedPlaces: [],
    claimedDeals: [],
    activityHistory: [],
  },
];

export const VERIFICATION_QUEUE: VerificationItem[] = [
  {
    id: 'vq_1',
    batchId: 'Batch #904',
    type: 'kyb',
    title: '42 Merchant KYB & CAC Audits',
    tag: 'Critical SLA',
    tagColor: 'red',
    description: 'TIN & Corporate Affairs clearance gate • 4 hours remaining on regulatory SLA',
    remainingTime: '4 hours',
    entityName: 'Corporate Registry Ingest',
    docs: ['CAC Certificate (Part A)', 'Tax Clearance 2024', 'Utility Bill proof of address', 'Director NIN/BVN validation'],
  },
  {
    id: 'vq_2',
    batchId: 'VI-Grid #12',
    type: 'geofence',
    title: '7 Spatial Geofence Mismatch Alerts',
    tag: 'Spatial',
    tagColor: 'amber',
    description: 'Polygon boundary disputes detected between Victoria Island and Lekki Phase 1 clusters',
    remainingTime: '12 hours',
    entityName: 'VI & Lekki Border GIS',
  },
  {
    id: 'vq_3',
    batchId: 'Rule #FD-88',
    type: 'flagged_deal',
    title: '26 Flagged Flash Deals (Price Deviation)',
    tag: 'Anomaly',
    tagColor: 'purple',
    description: 'Discounts >75% triggering merchant inventory fraud risk rules in Ikeja and Abuja nodes',
    remainingTime: '6 hours',
    entityName: 'Automated Fraud Engine',
  },
  {
    id: 'vq_4',
    batchId: 'Paystack Rail',
    type: 'payment_exception',
    title: '5 Webhook Settlement Exceptions',
    tag: 'Escrow Hold',
    tagColor: 'blue',
    description: '₦420,000 currently held in escrow reserve awaiting payment gateway reconciliation',
    remainingTime: '2 hours',
    entityName: 'Payment Gateway Escrow Gate',
  },
];

export const RECENT_TRANSACTIONS: PlatformTransaction[] = [
  {
    id: 'txn_1',
    timestamp: '13:42:18',
    merchantName: 'Slot Electronics Ikeja',
    branchOrTerminal: 'NFC Tap Check-in & Checkout',
    rail: 'Paystack Direct',
    railColor: 'bg-blue-500',
    amount: '₦185,000',
    status: 'Settled',
  },
  {
    id: 'txn_2',
    timestamp: '13:41:05',
    merchantName: 'MegaMart Groceries Lekki',
    branchOrTerminal: 'POS Terminal #NG-104',
    rail: 'GTBank NIBSS',
    railColor: 'bg-orange-500',
    amount: '₦42,650',
    status: 'Settled',
  },
  {
    id: 'txn_3',
    timestamp: '13:38:49',
    merchantName: 'Medplus Pharmacy Palms',
    branchOrTerminal: 'Voucher Redemption & Escrow',
    rail: 'Flutterwave',
    railColor: 'bg-indigo-500',
    amount: '₦18,200',
    status: 'Settled',
  },
  {
    id: 'txn_4',
    timestamp: '13:35:12',
    merchantName: 'Casabella Beauty Wuse 2',
    branchOrTerminal: 'In-store POS Settlement',
    rail: 'Paystack Direct',
    railColor: 'bg-blue-500',
    amount: '₦29,900',
    status: 'Settled',
  },
];

