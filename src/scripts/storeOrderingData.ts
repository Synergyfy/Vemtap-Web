export type StoreOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'awaiting-payment'
  | 'paid'
  | 'completed'
  | 'partially-fulfilled'
  | 'rejected'
  | 'cancelled';

export type StoreOrderOrigin =
  | 'Storefront'
  | 'Public Store Page'
  | 'Store QR'
  | 'Category QR'
  | 'Product QR'
  | 'Section QR'
  | 'Custom Placement QR'
  | 'Deal'
  | 'Service'
  | 'Booking'
  | 'Cluster'
  | 'POS'
  | 'POS Walk-in';

export interface StoreOrderItem {
  id: string;
  productId: string;
  name: string;
  variant?: string;
  options?: string[];
  qty: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  available: boolean;
  type?: 'product' | 'service' | 'deal' | 'booking';
  serviceAppointmentTime?: string;
  dealDiscount?: string;
  station?: string;
  meta?: string;
  substituted?: {
    originalName: string;
    replacementName: string;
    priceDiff: number;
  };
  removed?: boolean;
}

export interface StoreOrderStatusEvent {
  status: StoreOrderStatus;
  timestamp: string;
  note?: string;
  staffName?: string;
}

export interface StoreOrderPayment {
  status: 'unpaid' | 'partially-paid' | 'paid-in-store' | 'paid-pos' | 'refunded';
  method?: 'cash' | 'pos-terminal' | 'bank-transfer' | 'store-credit' | 'vemtap-pos' | 'pos-integrated' | string;
  amountDue?: number;
  amountReceived?: number;
  change?: number;
  balance?: number;
  recordedBy?: string;
  recordedAt?: string;
  reference?: string;
  posTransactionId?: string;
  completionType?: 'external-pos' | 'vemtap-pos' | 'cash' | 'transfer' | string;
  staffVerified?: boolean;
  notes?: string;
}

export interface StoreOrder {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  time: string;
  date: string;
  branchId: string;
  branchName: string;
  origin: StoreOrderOrigin;
  sourceRef?: string;
  placementDetails?: string;
  items: StoreOrderItem[];
  subtotal?: number;
  savings?: number;
  deliveryFee?: number;
  estimatedTotal: number;
  confirmedTotal: number;
  isTotalConfirmed: boolean;
  status: StoreOrderStatus;
  assignedStaff?: string;
  customerNotes?: string;
  pickupInstructions: string;
  estimatedPrepMins: number;
  statusHistory: StoreOrderStatusEvent[];
  payment: StoreOrderPayment;
}

export interface StoreQrRecord {
  id: string;
  name: string;
  type: 'store' | 'section' | 'product' | 'custom';
  branchId: string;
  branchName: string;
  destinationUrl: string;
  targetLabel: string;
  active: boolean;
  createdAt: string;
  scansCount: number;
  ordersCount: number;
  revenueGenerated: number;
}

export interface StoreOrderingSettings {
  enabled: boolean;
  usePosForCompletion: boolean; // When true: handover to VEMTAP POS; When false: complete order inside Store Ordering
  paymentMethods: Array<{ id: string; label: string; enabled: boolean }>;
  activeBranches: Record<string, boolean>;
  immediatePickup: boolean;
  scheduledPreOrder: boolean;
  defaultPrepMinutes: number;
  pickupInstructions: string;
  guestOrderingAllowed: boolean;
  acceptOrdersOutsideHours: boolean;
  allowSubstitutions: boolean;
  autoNotifyCustomerSms: boolean;
  autoNotifyCustomerWhatsApp: boolean;
  notifiedStaff: string[];
}

export const INITIAL_ORDERING_SETTINGS: StoreOrderingSettings = {
  enabled: true,
  usePosForCompletion: false,
  paymentMethods: [
    { id: 'cash', label: 'Cash at Counter', enabled: true },
    { id: 'pos-terminal', label: 'External Card Terminal', enabled: true },
    { id: 'bank-transfer', label: 'Direct Bank Transfer', enabled: true },
    { id: 'ussd', label: 'USSD / Quick Code', enabled: true },
  ],
  activeBranches: {
    'wuse-2': true,
    maitama: true,
    garki: false,
  },
  immediatePickup: true,
  scheduledPreOrder: true,
  defaultPrepMinutes: 20,
  pickupInstructions:
    'Proceed to the VEMTAP Express Pickup Counter inside Urban Grill & Bistro. Present your Order Reference code to our cashier.',
  guestOrderingAllowed: true,
  acceptOrdersOutsideHours: false,
  allowSubstitutions: true,
  autoNotifyCustomerSms: true,
  autoNotifyCustomerWhatsApp: true,
  notifiedStaff: ['Chef Adebayo (Head Chef)', 'Musa Danladi (Store Manager)', 'Grace Udoh (Front Desk)'],
};

export const SEED_STORE_ORDERS: StoreOrder[] = [
  {
    id: '#SO-94021',
    orderRef: 'VT-SO-94021',
    customerName: 'Amina Bello',
    customerPhone: '+234 803 123 4567',
    createdAt: '2026-10-14T12:14:00',
    time: '12:14 PM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Section QR',
    placementDetails: 'Table 04 • Indoor Dining Hall',
    items: [
      {
        id: 'item-1',
        productId: 'woodfire-ribeye',
        name: 'Woodfire Aged Ribeye (400g)',
        variant: 'Medium Rare',
        options: ['Truffle Butter Glaze', 'Rosemary Salt'],
        qty: 2,
        unitPrice: 12000,
        totalPrice: 24000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDpsN8HhOxVkyrlzsDSwWbUGCMx88H_i-90BzVRXFwiGexp5TQmPnpsXCVMNNUpRe7uxfo57ihFZuN1sb286o43Cccsc1Bfq4cETixHi2NZLcGFUUCbiCNWoIxrbEKlepUM4ZVandVLp9-O9ciAyksLpQx7Rt4rdxyME9dGck5X5bkm2ieVhQpVkkY1PujV1oiikexf1W1XU6HhE-7P1nVDVKkvKUKI9n8fsiZh3UpK',
        available: true,
      },
      {
        id: 'item-2',
        productId: 'truffle-fries',
        name: 'Truffle Parmesan Hand-Cut Fries',
        qty: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB6BaZG7YzMbQArQWnt4edHnV9aCqK3a7xIIh-c8OV4tFJBToZ7tcF2Nlpag653DPDvv1YwAEFvyZWLEWjhh3JKXPU_39La5FCCObsJ2bXVvYHYwRfdfbXPyrgvSgRX4XxMhc27qVEA_iTG43lTtzd34YcQozjDBHcuV7C7GWsm1WeMhPRtYcC2-I3NREV_8QfVRodpcjS7DvAGEn1vrjQohXldZ8Ghr28n4UXThhCL24s-z5spmv5Wbg',
        available: true,
      },
      {
        id: 'item-3',
        productId: 'mint-lemonade',
        name: 'Fresh Mint Citrus Cooler',
        qty: 2,
        unitPrice: 3000,
        totalPrice: 6000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU',
        available: true,
      },
    ],
    estimatedTotal: 34500,
    confirmedTotal: 34500,
    isTotalConfirmed: false,
    status: 'new',
    assignedStaff: 'Chef Adebayo (Head Chef)',
    customerNotes: 'Please serve steaks sizzling hot, pepper sauce on the side.',
    pickupInstructions: 'Pick up at Counter A inside Wuse II branch.',
    estimatedPrepMins: 20,
    statusHistory: [
      {
        status: 'new',
        timestamp: '12:14 PM',
        note: 'Customer submitted order via Section QR (Table 04)',
      },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#SO-93988',
    orderRef: 'VT-SO-93988',
    customerName: 'Tunde Balogun',
    customerPhone: '+234 812 888 9911',
    createdAt: '2026-10-14T11:48:00',
    time: '11:48 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Product QR',
    placementDetails: 'Product Standee QR • Ribeye Special',
    items: [
      {
        id: 'item-4',
        productId: 'smokey-jollof',
        name: 'Smokey Party Jollof Platter',
        variant: 'With Grilled Suya Chicken',
        options: ['Fried Sweet Plantains', 'House Slaw'],
        qty: 2,
        unitPrice: 6500,
        totalPrice: 13000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB91KTEStK91Ccurq-fAdEtC-3I8n4gXuMqpfwcMA_5A7h_nKUAouQfyxb6sIaLr4yh8qEJvf7XPR274pCgT_FOtGzBywL25v3g-trAUxSQ8fpYFeSAccqtSye0ekYzX75UlkTZxst5wHeAEpD6b88FITPNV7DVmR9ma0F2JfEciwHgIHFVb_B9cBDLYj3QeMAm3o-PANcSttHXXePp0sCRO1Pr9wbY1irA6QCDsOCquwmIvjT_twL9bA',
        available: true,
      },
      {
        id: 'item-5',
        productId: 'cold-brew',
        name: 'Single Origin Cold Brew',
        qty: 2,
        unitPrice: 2600,
        totalPrice: 5200,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU',
        available: true,
      },
    ],
    estimatedTotal: 18200,
    confirmedTotal: 18200,
    isTotalConfirmed: true,
    status: 'preparing',
    assignedStaff: 'Ibrahim Bello (Kitchen Lead)',
    customerNotes: 'Packaging for takeaway please.',
    pickupInstructions: 'Pick up at Counter B for Takeaway.',
    estimatedPrepMins: 15,
    statusHistory: [
      { status: 'new', timestamp: '11:48 AM', note: 'Order placed via Product QR' },
      { status: 'accepted', timestamp: '11:50 AM', staffName: 'Musa Danladi', note: 'Order accepted by store manager' },
      { status: 'preparing', timestamp: '11:52 AM', staffName: 'Ibrahim Bello', note: 'Platter currently on grill' },
    ],
    payment: {
      status: 'unpaid',
      method: 'cash',
    },
  },
  {
    id: '#SO-93910',
    orderRef: 'VT-SO-93910',
    customerName: 'Chiamaka Obi',
    customerPhone: '+234 809 555 4321',
    createdAt: '2026-10-14T11:30:00',
    time: '11:30 AM',
    date: 'Today',
    branchId: 'maitama',
    branchName: 'Maitama Heights',
    origin: 'Store QR',
    placementDetails: 'Front Window QR Code',
    items: [
      {
        id: 'item-6',
        productId: 'artisan-burger',
        name: 'Gourmet Wagyu Smash Burger',
        variant: 'Brioche Bun',
        options: ['Double Aged Cheddar', 'Caramelized Onions'],
        qty: 1,
        unitPrice: 7000,
        totalPrice: 7000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU',
        available: true,
      },
      {
        id: 'item-7',
        productId: 'cold-brew',
        name: 'Single Origin Cold Brew',
        qty: 1,
        unitPrice: 2600,
        totalPrice: 2600,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU',
        available: true,
      },
    ],
    estimatedTotal: 9600,
    confirmedTotal: 9600,
    isTotalConfirmed: true,
    status: 'ready',
    assignedStaff: 'Grace Udoh',
    customerNotes: 'No pickles please.',
    pickupInstructions: 'Order is packed in thermal bag at Maitama Front Desk.',
    estimatedPrepMins: 15,
    statusHistory: [
      { status: 'new', timestamp: '11:30 AM', note: 'Placed via Storefront QR' },
      { status: 'accepted', timestamp: '11:32 AM', staffName: 'Grace Udoh', note: 'Kitchen confirmed ticket' },
      { status: 'preparing', timestamp: '11:34 AM', staffName: 'Ibrahim Bello' },
      { status: 'ready', timestamp: '11:47 AM', staffName: 'Grace Udoh', note: 'Order ready for collection' },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#SO-93871',
    orderRef: 'VT-SO-93871',
    customerName: 'Seyi Adeleke',
    customerPhone: '+234 703 444 8822',
    createdAt: '2026-10-14T10:55:00',
    time: '10:55 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Public Store Page',
    placementDetails: 'Online Link (vemtap.com/store/urban-grill)',
    items: [
      {
        id: 'item-8',
        productId: 'woodfire-ribeye',
        name: 'Woodfire Aged Ribeye (400g)',
        qty: 1,
        unitPrice: 12400,
        totalPrice: 12400,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDpsN8HhOxVkyrlzsDSwWbUGCMx88H_i-90BzVRXFwiGexp5TQmPnpsXCVMNNUpRe7uxfo57ihFZuN1sb286o43Cccsc1Bfq4cETixHi2NZLcGFUUCbiCNWoIxrbEKlepUM4ZVandVLp9-O9ciAyksLpQx7Rt4rdxyME9dGck5X5bkm2ieVhQpVkkY1PujV1oiikexf1W1XU6HhE-7P1nVDVKkvKUKI9n8fsiZh3UpK',
        available: true,
      },
    ],
    estimatedTotal: 12400,
    confirmedTotal: 12400,
    isTotalConfirmed: true,
    status: 'completed',
    assignedStaff: 'Musa Danladi',
    customerNotes: 'Ready on arrival.',
    pickupInstructions: 'Handed over at Wuse 2 Pickup Counter.',
    estimatedPrepMins: 20,
    statusHistory: [
      { status: 'new', timestamp: '10:55 AM' },
      { status: 'accepted', timestamp: '10:57 AM' },
      { status: 'preparing', timestamp: '11:00 AM' },
      { status: 'ready', timestamp: '11:18 AM' },
      { status: 'paid', timestamp: '11:22 AM', note: 'Cashier confirmed POS payment', staffName: 'Musa Danladi' },
      { status: 'completed', timestamp: '11:25 AM', note: 'Customer collected meal' },
    ],
    payment: {
      status: 'paid-in-store',
      method: 'pos-terminal',
      recordedBy: 'Musa Danladi',
      recordedAt: '11:22 AM',
      reference: 'TXN-POS-89218',
    },
  },
  {
    id: '#SO-93922',
    orderRef: 'VT-SO-93922',
    customerName: 'Femi Adeyemi',
    customerPhone: '+234 802 991 3344',
    createdAt: '2026-10-14T11:35:00',
    time: '11:35 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Category QR',
    sourceRef: 'Gourmet Grills Category QR • Table Tent 12',
    placementDetails: 'Table Tent 12 • Gourmet Grills Category',
    items: [
      {
        id: 'item-cg-1',
        productId: 'woodfire-ribeye',
        name: 'Woodfire Aged Ribeye (400g)',
        variant: 'Medium',
        options: ['Herb Compound Butter'],
        qty: 1,
        unitPrice: 12400,
        totalPrice: 12400,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDpsN8HhOxVkyrlzsDSwWbUGCMx88H_i-90BzVRXFwiGexp5TQmPnpsXCVMNNUpRe7uxfo57ihFZuN1sb286o43Cccsc1Bfq4cETixHi2NZLcGFUUCbiCNWoIxrbEKlepUM4ZVandVLp9-O9ciAyksLpQx7Rt4rdxyME9dGck5X5bkm2ieVhQpVkkY1PujV1oiikexf1W1XU6HhE-7P1nVDVKkvKUKI9n8fsiZh3UpK',
        available: true,
      },
      {
        id: 'item-cg-2',
        productId: 'bbq-wings',
        name: 'Charcoal BBQ Glazed Wings',
        qty: 1,
        unitPrice: 4800,
        totalPrice: 4800,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB42l73epIsgk7B_tY1WUgXkAMqupiWNuv_ESkPB4zFMGLJHAUbnkL3kSTaxvcdRGKX61AgsAXlCuxsu3Awt-sk3zxg4usFKI5P96mVC5E5nxuvlodT9YegySP-4LUk4qAzAgbAUEcO6ln8qQ0qKDUaXawe66WclpwBtDJSsgjAP5Tk7nDB_Q7wo2km_0PUq7QSX0D9WihtFoIqGltzqwZ684yj_egxL_WwbltvIGHX',
        available: true,
      },
    ],
    estimatedTotal: 17200,
    confirmedTotal: 17200,
    isTotalConfirmed: true,
    status: 'accepted',
    assignedStaff: 'Chef Adebayo',
    customerNotes: 'Extra BBQ dip please.',
    pickupInstructions: 'Table 12 Dine-in Service.',
    estimatedPrepMins: 18,
    statusHistory: [
      { status: 'new', timestamp: '11:35 AM', note: 'Customer scanned Category QR (Gourmet Grills)' },
      { status: 'accepted', timestamp: '11:38 AM', staffName: 'Chef Adebayo', note: 'Kitchen ticket queued' },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#SO-93855',
    orderRef: 'VT-DL-4812',
    customerName: 'Zainab Ahmed',
    customerPhone: '+234 806 777 2211',
    createdAt: '2026-10-14T11:10:00',
    time: '11:10 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Deal',
    sourceRef: 'DL-4812 (20% OFF Prime Lunch Combo Deal)',
    placementDetails: 'Deal Voucher Redemption • Storefront Promo',
    items: [
      {
        id: 'item-dl-1',
        productId: 'lunch-combo-pass',
        name: 'Prime 3-Course Lunch Combo Pass',
        variant: '180g Sirloin + Truffle Fries + Peach Tea',
        qty: 1,
        unitPrice: 9600,
        totalPrice: 9600,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA660DBbL4p5hdOqDxPgDA4Ajl4WEqysOI95IjBc1LsMBzWNA3rffVBm4P_4vIKE-twAe4Ppj6VMgYLuq0e7Y7sIGV8Qe2la8vCq52rfp7Yu8OmPEjeZB0aalsAdgsOt4ZtRq_YeIf2AEduQ0OS5BQYF2_Iq8TcJ-pN5anghOI3fHE-JCrjTdnWRE2J8qSE1W32sOCgCF-ra_GJKR9BRGwiFfREayGH5y801aK96dLb',
        available: true,
        type: 'deal',
        dealDiscount: '20% OFF (Saved ₦2,400)',
      },
    ],
    subtotal: 12000,
    savings: 2400,
    estimatedTotal: 9600,
    confirmedTotal: 9600,
    isTotalConfirmed: true,
    status: 'ready',
    assignedStaff: 'Grace Udoh',
    customerNotes: 'Voucher code: VT-48F261 applied.',
    pickupInstructions: 'Pick up at Express Counter A.',
    estimatedPrepMins: 15,
    statusHistory: [
      { status: 'new', timestamp: '11:10 AM', note: 'Claimed via Deal Promo (20% OFF)' },
      { status: 'accepted', timestamp: '11:12 AM', staffName: 'Grace Udoh' },
      { status: 'preparing', timestamp: '11:15 AM' },
      { status: 'ready', timestamp: '11:28 AM', staffName: 'Grace Udoh', note: 'Voucher order ready for pickup' },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#SO-93820',
    orderRef: 'VT-SRV-891',
    customerName: 'Dr. Chidi Eze',
    customerPhone: '+234 809 331 7788',
    createdAt: '2026-10-14T10:30:00',
    time: '10:30 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Service',
    sourceRef: 'SRV-891 (Private Chef Consultation & Tasting)',
    placementDetails: 'Executive Service Request • Sat 2:00 PM',
    items: [
      {
        id: 'item-srv-1',
        productId: 'private-tasting-service',
        name: 'Private Chef Consultation & Tasting Session (2 Guests)',
        variant: 'Tasting Flight & Wine Pairings',
        qty: 1,
        unitPrice: 45000,
        totalPrice: 45000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCK_Zasd3tU1LibEdoOmRkShhGkUdxaj1LyOHPImE9RxYJx7j8kCqQSsuERLETrt_VTim3zGSiFojl5EHTR8pg3DV1B0tNkDTkgDppYAlyiWpzGWFKd1KWlZ4ZuhS2zbSTRHHyTpFQVsdVa58jJMdK2AZGNKT-c8Un5N7UoPCG6SWn5qBUZXyVEyhlb0b1QWg4okDK2G5Q7CQGcaFvdAmm-5iCxRERXavJu8giLpArhM3IuGdEim6Xb4w',
        available: true,
        type: 'service',
        serviceAppointmentTime: 'Saturday, 2:00 PM WAT',
      },
    ],
    estimatedTotal: 45000,
    confirmedTotal: 45000,
    isTotalConfirmed: true,
    status: 'accepted',
    assignedStaff: 'Chef Adebayo',
    customerNotes: 'Dietary preferences: No shellfish.',
    pickupInstructions: 'Private Dining Suite • Meeting Room B.',
    estimatedPrepMins: 30,
    statusHistory: [
      { status: 'new', timestamp: '10:30 AM', note: 'Service booking request submitted' },
      { status: 'accepted', timestamp: '10:35 AM', staffName: 'Chef Adebayo', note: 'Appointment confirmed with customer' },
    ],
    payment: {
      status: 'unpaid',
      method: 'bank-transfer',
    },
  },
  {
    id: '#SO-93812',
    orderRef: 'VT-BK-2201',
    customerName: 'Halima Yusuf',
    customerPhone: '+234 812 445 0091',
    createdAt: '2026-10-14T10:15:00',
    time: '10:15 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Booking',
    sourceRef: 'BK-2201 (VIP Table 2 Dinner Reservation)',
    placementDetails: 'Table Reservation • Today 5:15 PM • 4 Guests',
    items: [
      {
        id: 'item-bk-1',
        productId: 'vip-table-preorder',
        name: 'VIP Table Reservation Pre-Order (Set Dinner for 4)',
        variant: '4 Persons Signature Tasting Set',
        qty: 1,
        unitPrice: 68000,
        totalPrice: 68000,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCta-AVcjCZDWInIcUOJAuZYV2oAQHyTKLW5eoRshVGRfv8UJJbZ9ZCzBn61chEDIfTHAGW1GJtmX2WtS91OqMMUuKu_rwDf5fhd87TDW44tR2GYusQ1Q0A_EdzsPpIuPe9Ka3jV_pnY_4A-0zbBoXeaXu8h257sUKg1LWCudIZeklCl2b_QS7i_d4Cq3p8rIm-xBCEHufzUuVhTBN4Z6tLGW_WUhyJZBbwR8YVUOYg',
        available: true,
        type: 'booking',
      },
    ],
    estimatedTotal: 68000,
    confirmedTotal: 68000,
    isTotalConfirmed: true,
    status: 'ready',
    assignedStaff: 'Musa Danladi',
    customerNotes: 'Celebrating wedding anniversary. Quiet booth preferred.',
    pickupInstructions: 'Table reserved: VIP Booth 2.',
    estimatedPrepMins: 25,
    statusHistory: [
      { status: 'new', timestamp: '10:15 AM', note: 'Online table reservation & pre-order received' },
      { status: 'accepted', timestamp: '10:20 AM', staffName: 'Musa Danladi' },
      { status: 'ready', timestamp: '10:45 AM', staffName: 'Musa Danladi', note: 'Table dressed & prepared' },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#SO-93804',
    orderRef: 'VT-CLUST-77',
    customerName: 'Emeka Nwosu',
    customerPhone: '+234 701 220 4455',
    createdAt: '2026-10-14T09:40:00',
    time: '09:40 AM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'Cluster',
    sourceRef: 'Apo Boulevard Food Cluster Campaign',
    placementDetails: 'District Discovery Promotion',
    items: [
      {
        id: 'item-cl-1',
        productId: 'bbq-wings',
        name: 'Charcoal BBQ Glazed Wings',
        qty: 2,
        unitPrice: 4800,
        totalPrice: 9600,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB42l73epIsgk7B_tY1WUgXkAMqupiWNuv_ESkPB4zFMGLJHAUbnkL3kSTaxvcdRGKX61AgsAXlCuxsu3Awt-sk3zxg4usFKI5P96mVC5E5nxuvlodT9YegySP-4LUk4qAzAgbAUEcO6ln8qQ0qKDUaXawe66WclpwBtDJSsgjAP5Tk7nDB_Q7wo2km_0PUq7QSX0D9WihtFoIqGltzqwZ684yj_egxL_WwbltvIGHX',
        available: true,
      },
      {
        id: 'item-cl-2',
        productId: 'truffle-fries',
        name: 'Truffle Parmesan Hand-Cut Fries',
        qty: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB6BaZG7YzMbQArQWnt4edHnV9aCqK3a7xIIh-c8OV4tFJBToZ7tcF2Nlpag653DPDvv1YwAEFvyZWLEWjhh3JKXPU_39La5FCCObsJ2bXVvYHYwRfdfbXPyrgvSgRX4XxMhc27qVEA_iTG43lTtzd34YcQozjDBHcuV7C7GWsm1WeMhPRtYcC2-I3NREV_8QfVRodpcjS7DvAGEn1vrjQohXldZ8Ghr28n4UXThhCL24s-z5spmv5Wbg',
        available: true,
      },
    ],
    estimatedTotal: 14100,
    confirmedTotal: 14100,
    isTotalConfirmed: false,
    status: 'new',
    assignedStaff: 'Grace Udoh',
    customerNotes: 'Cluster discount applied at checkout.',
    pickupInstructions: 'Pick up at Counter B.',
    estimatedPrepMins: 20,
    statusHistory: [
      { status: 'new', timestamp: '09:40 AM', note: 'Customer entered via Apo Boulevard Cluster promotion' },
    ],
    payment: {
      status: 'unpaid',
      method: 'pos-terminal',
    },
  },
  {
    id: '#POS-1049',
    orderRef: 'POS-1049',
    customerName: 'Walk-in Customer (POS)',
    customerPhone: '+234 800 000 0000',
    createdAt: '2026-10-14T12:22:00',
    time: '12:22 PM',
    date: 'Today',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    origin: 'POS Walk-in',
    sourceRef: 'POS Register Terminal 01',
    placementDetails: 'Indoor Dining • Table 07',
    items: [
      {
        id: 'item-pos-1',
        productId: 'smokey-jollof',
        name: 'Smokey Party Jollof Platter',
        qty: 1,
        unitPrice: 6500,
        totalPrice: 6500,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB91KTEStK91Ccurq-fAdEtC-3I8n4gXuMqpfwcMA_5A7h_nKUAouQfyxb6sIaLr4yh8qEJvf7XPR274pCgT_FOtGzBywL25v3g-trAUxSQ8fpYFeSAccqtSye0ekYzX75UlkTZxst5wHeAEpD6b88FITPNV7DVmR9ma0F2JfEciwHgIHFVb_B9cBDLYj3QeMAm3o-PANcSttHXXePp0sCRO1Pr9wbY1irA6QCDsOCquwmIvjT_twL9bA',
        available: true,
      },
      {
        id: 'item-pos-2',
        productId: 'chapman',
        name: 'House Craft Chapman Cocktail',
        qty: 2,
        unitPrice: 2350,
        totalPrice: 4700,
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU',
        available: true,
      },
    ],
    estimatedTotal: 11200,
    confirmedTotal: 11200,
    isTotalConfirmed: true,
    status: 'completed',
    assignedStaff: 'Cashier Till 01',
    customerNotes: 'Walk-in fast checkout.',
    pickupInstructions: 'Table 7 Dine-in.',
    estimatedPrepMins: 15,
    statusHistory: [
      { status: 'new', timestamp: '12:22 PM' },
      { status: 'paid', timestamp: '12:22 PM', note: 'Paid via Card Terminal (****4412)', staffName: 'Cashier Till 01' },
      { status: 'completed', timestamp: '12:24 PM', note: 'POS Ticket printed' },
    ],
    payment: {
      status: 'paid-in-store',
      method: 'pos-integrated',
      posTransactionId: 'TXN-9021',
      reference: 'POS-TXN-9021',
      recordedBy: 'VEMTAP POS',
      recordedAt: '12:22 PM',
      completionType: 'vemtap-pos',
      staffVerified: true,
    },
  },
];

export const SEED_STORE_QRS: StoreQrRecord[] = [
  {
    id: 'qr-store-wuse',
    name: 'Wuse II Storefront Front Gate QR',
    type: 'store',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    destinationUrl: 'https://vemtap.com/business/urban-grill-bistro-104/products?src=store-qr&branch=wuse-2',
    targetLabel: 'Full Digital Catalogue & Storefront',
    active: true,
    createdAt: '2026-09-15',
    scansCount: 482,
    ordersCount: 168,
    revenueGenerated: 2840000,
  },
  {
    id: 'qr-sec-terrace',
    name: 'Table 04 Dining Hall Section QR',
    type: 'section',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    destinationUrl: 'https://vemtap.com/business/urban-grill-bistro-104/products?category=grills&src=category-qr&table=4',
    targetLabel: 'Steaks & Platters Menu (Table 04)',
    active: true,
    createdAt: '2026-09-20',
    scansCount: 219,
    ordersCount: 94,
    revenueGenerated: 1940000,
  },
  {
    id: 'qr-prod-ribeye',
    name: 'Counter Standee • Aged Ribeye QR',
    type: 'product',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    destinationUrl: 'https://vemtap.com/business/urban-grill-bistro-104/products/woodfire-ribeye-400g?src=prod-qr',
    targetLabel: 'Woodfire Aged Ribeye (Direct Order)',
    active: true,
    createdAt: '2026-10-01',
    scansCount: 341,
    ordersCount: 122,
    revenueGenerated: 1464000,
  },
  {
    id: 'qr-store-maitama',
    name: 'Maitama Heights Reception Window QR',
    type: 'store',
    branchId: 'maitama',
    branchName: 'Maitama Heights',
    destinationUrl: 'https://vemtap.com/business/urban-grill-bistro-104/products?src=store-qr&branch=maitama',
    targetLabel: 'Maitama Branch Digital Order Menu',
    active: true,
    createdAt: '2026-09-28',
    scansCount: 178,
    ordersCount: 61,
    revenueGenerated: 890000,
  },
  {
    id: 'qr-custom-patio',
    name: 'Outdoor Patio Tent Card QR',
    type: 'custom',
    branchId: 'wuse-2',
    branchName: 'Wuse II Flagship',
    destinationUrl: 'https://vemtap.com/business/urban-grill-bistro-104/products?src=custom-qr&placement=patio-lounge',
    targetLabel: 'Patio Express Ordering',
    active: true,
    createdAt: '2026-10-05',
    scansCount: 89,
    ordersCount: 35,
    revenueGenerated: 420000,
  },
];

export const STORE_ORDER_STATUS_CONFIG: Record<
  StoreOrderStatus,
  { label: string; badgeClass: string; dotClass: string; icon: string }
> = {
  new: {
    label: 'New Order',
    badgeClass: 'bg-primary-container/10 text-primary border border-primary/20',
    dotClass: 'bg-primary animate-pulse',
    icon: 'notifications_active',
  },
  accepted: {
    label: 'Accepted',
    badgeClass: 'bg-surface-tint-blue text-primary border border-primary/20',
    dotClass: 'bg-primary',
    icon: 'thumb_up',
  },
  preparing: {
    label: 'Preparing',
    badgeClass: 'bg-secondary-container/30 text-secondary border border-secondary/30',
    dotClass: 'bg-secondary',
    icon: 'soup_kitchen',
  },
  ready: {
    label: 'Ready for Pickup',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text border border-badge-discount-text/30',
    dotClass: 'bg-badge-discount-text',
    icon: 'shopping_bag',
  },
  'awaiting-payment': {
    label: 'Awaiting Payment',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    dotClass: 'bg-amber-500',
    icon: 'payments',
  },
  paid: {
    label: 'Paid (Store-Confirmed)',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    icon: 'verified',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40',
    dotClass: 'bg-text-tertiary',
    icon: 'check_circle',
  },
  'partially-fulfilled': {
    label: 'Partially Fulfilled',
    badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30',
    dotClass: 'bg-orange-500',
    icon: 'warning',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-error-container/20 text-error border border-error/30',
    dotClass: 'bg-error',
    icon: 'cancel',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-surface-container-highest text-text-tertiary border border-border-subtle',
    dotClass: 'bg-text-tertiary',
    icon: 'block',
  },
};
