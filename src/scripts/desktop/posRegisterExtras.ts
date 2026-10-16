/**
 * Shared data + helpers for the POS register & payment upgrades:
 *  - Walk-in customers (no details required to take payment)
 *  - Tender methods the business actually handles externally
 *  - Item modifiers
 *  - Loyalty tiers, point accrual and reward eligibility
 */

export interface PosCustomerRecord {
  id: string;
  name: string;
  phone: string;
  /** Email is optional — never required to take a walk-in payment. */
  email?: string;
  /** Already on the wider VEMTAP network (drives the "existing member" hint). */
  onVemtap: boolean;
  tier: string;
  tierClass: string;
  points: number;
  spend: number;
  visits: number;
  note?: string;
}

/**
 * Business customer directory. Customers added at the till via the "Add New"
 * tab land here (and, when not already on VEMTAP, are also flagged for the
 * VEMTAP network — see PosCustomerModal).
 */
export const POS_CUSTOMERS: PosCustomerRecord[] = [
  {
    id: 'adaeze',
    name: 'Adaeze Nwosu',
    phone: '+234 803 411 9082',
    email: 'adaeze.nwosu@mail.com',
    onVemtap: true,
    tier: 'Gold Member',
    tierClass: 'bg-badge-discount-bg text-badge-discount-text',
    points: 2450,
    spend: 186400,
    visits: 24,
    note: 'Prefers terrace seating · no shellfish',
  },
  {
    id: 'michael',
    name: 'Michael James',
    phone: '+234 701 228 5510',
    email: 'michael.james@mail.com',
    onVemtap: true,
    tier: 'Platinum',
    tierClass: 'bg-surface-tint-blue text-primary',
    points: 5120,
    spend: 412900,
    visits: 58,
    note: 'Always requests peppercorn sauce',
  },
  {
    id: 'zainab',
    name: 'Zainab Bello',
    phone: '+234 909 670 3321',
    onVemtap: true,
    tier: 'Silver',
    tierClass: 'bg-surface-container-high text-text-secondary',
    points: 760,
    spend: 54300,
    visits: 9,
    note: 'Birthday month · double points active',
  },
  {
    id: 'tunde',
    name: 'Tunde Adeyemi',
    phone: '+234 812 550 7741',
    email: 'tunde.adeyemi@mail.com',
    onVemtap: false,
    tier: 'Member',
    tierClass: 'bg-surface-container text-text-secondary',
    points: 320,
    spend: 21800,
    visits: 4,
  },
];

/** Loyalty tiers — points thresholds gate the next reward. */
export const LOYALTY_TIERS: Array<{ name: string; threshold: number; perk: string; tone: string }> = [
  { name: 'Member', threshold: 0, perk: '1 pt per ₦100 spent', tone: 'bg-surface-container text-text-secondary' },
  { name: 'Silver', threshold: 500, perk: 'Free dessert at 500 pts', tone: 'bg-surface-container-high text-text-secondary' },
  { name: 'Gold Member', threshold: 2000, perk: '10% member perk + priority tables', tone: 'bg-badge-discount-bg text-badge-discount-text' },
  { name: 'Platinum', threshold: 5000, perk: '15% perk + free delivery', tone: 'bg-surface-tint-blue text-primary' },
];

/** Rewards a customer can qualify for, keyed by the points needed. */
export const LOYALTY_REWARDS: Array<{ points: number; label: string; icon: string }> = [
  { points: 500, label: 'Free Dessert', icon: 'cake' },
  { points: 1000, label: 'Redeem ₦1,000 Off', icon: 'sell' },
  { points: 2000, label: 'Free Starter', icon: 'restaurant' },
  { points: 3500, label: 'Free Main Course', icon: 'lunch_dining' },
  { points: 5000, label: 'Free Bottle of Wine', icon: 'wine_bar' },
];

/** Points earned per naira spent (Member default). */
export const POINTS_PER_N100 = 1;

export function tierForPoints(points: number) {
  return [...LOYALTY_TIERS].reverse().find((tier) => points >= tier.threshold) ?? LOYALTY_TIERS[0];
}

export function nextTier(points: number) {
  return LOYALTY_TIERS.find((tier) => points < tier.threshold) ?? null;
}

/** Next reward the customer has not yet unlocked. */
export function nextReward(points: number) {
  return LOYALTY_REWARDS.find((reward) => points < reward.points) ?? null;
}

/** Rewards already unlocked at the customer's current points. */
export function unlockedRewards(points: number) {
  return LOYALTY_REWARDS.filter((reward) => points >= reward.points);
}

export function pointsForAmount(amount: number): number {
  return Math.floor((amount / 100) * POINTS_PER_N100);
}

/**
 * Tender methods. VEMTAP QR / NFC-CHIP / One-Tap are removed — the business
 * handles card, cash and transfer externally at the till.
 */
export interface PosTenderMethod {
  id: 'cash' | 'transfer' | 'card' | 'split';
  key: string;
  icon: string;
  title: string;
  sub: string;
  span?: boolean;
}

export const POS_TENDER_METHODS: PosTenderMethod[] = [
  { id: 'cash', key: '1', icon: 'payments', title: 'Cash', sub: 'Till drawer · change calculator' },
  { id: 'card', key: '2', icon: 'credit_card', title: 'Card / POS', sub: 'External card terminal' },
  { id: 'transfer', key: '3', icon: 'account_balance', title: 'Transfer', sub: 'Bank transfer · confirm receipt' },
  {
    id: 'split',
    key: '4',
    icon: 'call_split',
    title: 'Split Payment',
    sub: 'Combine cash + card + transfer on one ticket',
    span: true,
  },
];

/** Modifiers grouped the way a cashier applies them to a line. */
export interface PosModifierGroup {
  id: string;
  label: string;
  options: Array<{ id: string; label: string; price: number }>;
}

export const POS_MODIFIER_GROUPS: PosModifierGroup[] = [
  {
    id: 'temperature',
    label: 'Temperature',
    options: [
      { id: 'rare', label: 'Rare', price: 0 },
      { id: 'medium-rare', label: 'Medium Rare', price: 0 },
      { id: 'medium', label: 'Medium', price: 0 },
      { id: 'well-done', label: 'Well Done', price: 0 },
    ],
  },
  {
    id: 'sauce',
    label: 'Sauces',
    options: [
      { id: 'peppercorn', label: 'Peppercorn', price: 500 },
      { id: 'garlic-butter', label: 'Garlic Butter', price: 500 },
      { id: 'truffle-dip', label: 'Truffle Dip', price: 800 },
      { id: 'blue-cheese', label: 'Blue Cheese', price: 600 },
    ],
  },
  {
    id: 'sides',
    label: 'Add Sides',
    options: [
      { id: 'extra-fries', label: 'Extra Fries', price: 1500 },
      { id: 'side-salad', label: 'Side Salad', price: 1200 },
      { id: 'jollof', label: 'Jollof Rice', price: 2000 },
    ],
  },
  {
    id: 'preferences',
    label: 'Preferences',
    options: [
      { id: 'no-pickles', label: 'No Pickles', price: 0 },
      { id: 'low-sugar', label: 'Low Sugar', price: 0 },
      { id: 'extra-ice', label: 'Extra Ice', price: 0 },
    ],
  },
];

/** Human-readable label for a set of modifier ids, for the ticket line. */
export function describeModifiers(groupIds: string[]): string {
  if (groupIds.length === 0) return '';
  const labels: string[] = [];
  for (const group of POS_MODIFIER_GROUPS) {
    for (const option of group.options) {
      if (groupIds.includes(option.id)) labels.push(option.label);
    }
  }
  return labels.join(' • ');
}

/** Total naira surcharge for a set of modifier ids. */
export function modifierSurcharge(groupIds: string[]): number {
  let total = 0;
  for (const group of POS_MODIFIER_GROUPS) {
    for (const option of group.options) {
      if (groupIds.includes(option.id)) total += option.price;
    }
  }
  return total;
}

export const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;
