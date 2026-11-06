export interface LoyaltyMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpent: number;
  lastVisit: string;
  joinedDate: string;
}

export interface LoyaltyPointAssignment {
  id: string;
  name: string;
  type: 'product' | 'service';
  category: string;
  price: number;
  points: number;
}

export interface LoyaltyTransaction {
  id: string;
  memberId: string;
  memberName: string;
  points: number;
  reason: string;
  staff: string;
  date: string;
}

export const INITIAL_LOYALTY_MEMBERS: LoyaltyMember[] = [
  {
    id: 'CUST-4021',
    name: 'Amina Bello',
    phone: '0803 456 7890',
    email: 'amina.bello@example.com',
    tier: 'Gold',
    points: 450,
    totalSpent: 142000,
    lastVisit: 'Today, 1:15 PM',
    joinedDate: 'Jan 14, 2026',
  },
  {
    id: 'CUST-4022',
    name: 'Michael James',
    phone: '0802 111 2233',
    email: 'michael.j@example.com',
    tier: 'VIP',
    points: 1250,
    totalSpent: 385000,
    lastVisit: 'Yesterday, 5:40 PM',
    joinedDate: 'Nov 02, 2025',
  },
  {
    id: 'CUST-4023',
    name: 'Sarah Adams',
    phone: '0814 333 4455',
    email: 'sarah.adams@example.com',
    tier: 'Silver',
    points: 320,
    totalSpent: 78500,
    lastVisit: 'Today, 8:41 AM',
    joinedDate: 'Feb 10, 2026',
  },
  {
    id: 'CUST-4024',
    name: 'Dr. Chidi Okafor',
    phone: '0809 555 6677',
    email: 'chidi.okafor@example.com',
    tier: 'VIP',
    points: 2100,
    totalSpent: 520000,
    lastVisit: 'Oct 15, 2:18 PM',
    joinedDate: 'Aug 19, 2025',
  },
  {
    id: 'CUST-4025',
    name: 'Zainab Ahmed',
    phone: '0807 888 9900',
    email: 'zainab.a@example.com',
    tier: 'Bronze',
    points: 80,
    totalSpent: 26000,
    lastVisit: '3 days ago',
    joinedDate: 'Mar 01, 2026',
  },
  {
    id: 'CUST-4026',
    name: 'Tunde Bakare',
    phone: '0901 222 3344',
    email: 'tunde.b@example.com',
    tier: 'Gold',
    points: 680,
    totalSpent: 194000,
    lastVisit: 'Yesterday, 1:19 PM',
    joinedDate: 'Dec 05, 2025',
  },
  {
    id: 'CUST-4027',
    name: 'Samuel Alabi',
    phone: '0805 777 8899',
    email: 'samuel.alabi@example.com',
    tier: 'Silver',
    points: 210,
    totalSpent: 59000,
    lastVisit: 'Oct 07, 6:55 PM',
    joinedDate: 'Jan 28, 2026',
  },
  {
    id: 'CUST-4028',
    name: 'Folake Davies',
    phone: '0802 999 1122',
    email: 'folake.d@example.com',
    tier: 'Bronze',
    points: 50,
    totalSpent: 18500,
    lastVisit: 'Oct 02, 11:10 AM',
    joinedDate: 'Feb 22, 2026',
  },
];

export const INITIAL_PRODUCT_ASSIGNMENTS: LoyaltyPointAssignment[] = [
  { id: 'prod-01', name: 'Aged Angus Ribeye Steak (400g)', type: 'product', category: 'Grill & BBQ', price: 14000, points: 50 },
  { id: 'prod-02', name: 'Jollof Fiesta Platter with Suya', type: 'product', category: 'Rice Dishes', price: 8500, points: 30 },
  { id: 'prod-03', name: 'BBQ Glazed Chicken Wings (12pcs)', type: 'product', category: 'Appetisers', price: 6500, points: 25 },
  { id: 'prod-04', name: 'Seafood Okro Supreme Pot', type: 'product', category: 'Soups & Bowls', price: 16500, points: 60 },
  { id: 'prod-05', name: 'Signature Hibiscus Berry Mocktail', type: 'product', category: 'Drinks', price: 3200, points: 15 },
  { id: 'serv-01', name: 'Deep Hydration Radiance Facial', type: 'service', category: 'Facials & Skincare', price: 18000, points: 90 },
  { id: 'serv-02', name: 'Swedish Aromatherapy Body Massage (60m)', type: 'service', category: 'Massage & Body', price: 25000, points: 125 },
  { id: 'serv-03', name: 'Deluxe Pedicure & Paraffin Treatment', type: 'service', category: 'Nail Care', price: 12000, points: 50 },
  { id: 'serv-04', name: 'Hair Revival Steaming & Deep Conditioning', type: 'service', category: 'Hair Salon', price: 15000, points: 65 },
];

export const INITIAL_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  { id: 'TX-901', memberId: 'CUST-4021', memberName: 'Amina Bello', points: 100, reason: 'Counter Purchase #POS-1049', staff: 'Till 01 Cashier', date: 'Today, 1:15 PM' },
  { id: 'TX-902', memberId: 'CUST-4022', memberName: 'Michael James', points: 250, reason: 'VIP Referral Bonus', staff: 'Manager', date: 'Today, 10:20 AM' },
  { id: 'TX-903', memberId: 'CUST-4023', memberName: 'Sarah Adams', points: -500, reason: 'Redeemed Free Appetiser Voucher', staff: 'Till 02 Cashier', date: 'Today, 8:41 AM' },
  { id: 'TX-904', memberId: 'CUST-4026', memberName: 'Tunde Bakare', points: 150, reason: 'Table 04 Dinner Spend', staff: 'Till 01 Cashier', date: 'Yesterday, 8:10 PM' },
  { id: 'TX-905', memberId: 'CUST-4024', memberName: 'Dr. Chidi Okafor', points: 300, reason: 'Corporate Event Spend Bonus', staff: 'Store Owner', date: 'Oct 15, 2:18 PM' },
];

