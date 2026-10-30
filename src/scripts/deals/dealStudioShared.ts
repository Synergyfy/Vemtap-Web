/**
 * Shared Deal Studio model — single source of truth for deal types, per-type
 * configuration, pricing math and validation.
 *
 * Used by BOTH the mobile and desktop deal wizards (onboarding flow) and the
 * business-dashboard deal creation entry points, so the flows cannot drift
 * apart. Keep all rules here; screens should only render and dispatch.
 */

export type DealStrategy = 'percentage' | 'fixed' | 'combo' | 'tiered';

export type DealDuration = '7-days' | '14-days' | '30-days' | '3-months' | '6-months' | 'forever';

export const DEAL_DURATIONS: Array<{ id: DealDuration; label: string; hint: string }> = [
  { id: '7-days', label: '7 Days', hint: 'Quick flash promo' },
  { id: '14-days', label: '14 Days', hint: 'Standard window' },
  { id: '30-days', label: '30 Days', hint: 'Monthly campaign' },
  { id: '3-months', label: '3 Months', hint: 'Quarterly push' },
  { id: '6-months', label: '6 Months', hint: 'Long-running offer' },
  { id: 'forever', label: 'Always On (Forever)', hint: 'Deal never expires automatically' },
];

export const dealDurationLabel = (duration: DealDuration) =>
  DEAL_DURATIONS.find((option) => option.id === duration)?.label ?? '14 Days';

/* ------------------------------------------------------------------ */
/* Deal type catalogue                                                 */
/* ------------------------------------------------------------------ */

export interface DealTypeOption {
  id: DealStrategy;
  icon: string;
  title: string;
  badge: string;
  badgeActive: boolean;
  description: string;
}

export const DEAL_TYPE_OPTIONS: DealTypeOption[] = [
  {
    id: 'percentage',
    icon: 'percent',
    title: 'Percentage Discount (% Off)',
    badge: 'Recommended',
    badgeActive: true,
    description: 'Cut the catalog price by a fixed percentage. Best for driving general foot-traffic.',
  },
  {
    id: 'fixed',
    icon: 'payments',
    title: 'Fixed Amount Off (₦ Off)',
    badge: 'Flat cut',
    badgeActive: false,
    description: 'Flat reduction off the total bill above a minimum spend. Great for high-ticket dining.',
  },
  {
    id: 'combo',
    icon: 'ramen_dining',
    title: 'Combo & Bundle Deal',
    badge: 'Pair items',
    badgeActive: false,
    description: 'Buy N Get M free, or pair multiple products at one bundle price. High perceived value.',
  },
  {
    id: 'tiered',
    icon: 'schedule',
    title: 'Tiered / Flash Happy Hour',
    badge: 'Time-locked',
    badgeActive: false,
    description:
      'Deeper promotional price locked to a validity period and quiet hours to turn idle shifts profitable.',
  },
];

export const dealTypeTitle = (id: DealStrategy | null) =>
  DEAL_TYPE_OPTIONS.find((option) => option.id === id)?.title ?? 'Discount Strategy';

/* ------------------------------------------------------------------ */
/* Small numeric helpers                                               */
/* ------------------------------------------------------------------ */

export const formatDealAmount = (value: number) =>
  Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const parseDealAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

export const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const percentOf = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const isoDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

export const formatDealDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* Per-type configuration                                              */
/* ------------------------------------------------------------------ */

export interface FixedDealConfig {
  amountOff: number;
  minSpend: number;
}

export const DEFAULT_FIXED_CONFIG: FixedDealConfig = { amountOff: 2500, minSpend: 15000 };

export const FLASH_WINDOWS = ['2:00 – 5:00 PM', '8:00 – 11:00 PM'];
export const FLASH_DAY_RANGES = ['Tue – Thu', 'Mon – Fri'];

export interface FlashDealConfig {
  discountPct: number;
  /** Validity period (yyyy-mm-dd) */
  startDate: string;
  endDate: string;
  window: string;
  days: string;
}

export const DEFAULT_FLASH_CONFIG: FlashDealConfig = {
  discountPct: 30,
  startDate: isoDate(0),
  endDate: isoDate(14),
  window: FLASH_WINDOWS[0],
  days: FLASH_DAY_RANGES[0],
};

export const formatFlashValidity = (config: FlashDealConfig) =>
  !config.startDate || !config.endDate
    ? 'Validity period not set'
    : `${formatDealDate(config.startDate)} → ${formatDealDate(config.endDate)}`;

export interface ComboProduct {
  id: string;
  name: string;
  price: number;
}

/** Default pick-list for bundle building. The current product is injected as `current`. */
export const DEFAULT_BUNDLE_CATALOG: ComboProduct[] = [
  { id: 'truffle-fries', name: 'Truffle Parmesan Fries', price: 4500 },
  { id: 'mocktail', name: 'Craft Botanical Mocktail', price: 6500 },
  { id: 'jollof-chicken', name: 'Smoked Jollof & Chicken', price: 8000 },
  { id: 'smash-burger', name: 'Gourmet Smash Burger', price: 7500 },
  { id: 'molten-cake', name: 'Molten Chocolate Cake', price: 4000 },
];

export type ComboMode = 'quantity' | 'bundle';
export type ComboBenefit = 'free-units' | 'percent-off' | 'bundle-price';

export interface ComboLineItem {
  productId: string;
  qty: number;
}

export interface ComboConfig {
  mode: ComboMode;
  /* Option A — quantity-based promotion */
  buyQty: number;
  benefit: ComboBenefit;
  freeQty: number;
  benefitPct: number;
  bundleQty: number;
  bundlePrice: number;
  /* Option B — multi-product bundle */
  items: ComboLineItem[];
  pricingMode: 'price' | 'percent';
  bundlePromoPrice: number;
  bundleDiscountPct: number;
  /* Shared: max units a customer may redeem in a single order (0 = no cap) */
  maxPurchaseLimit: number;
}

export const DEFAULT_COMBO_CONFIG: ComboConfig = {
  mode: 'quantity',
  buyQty: 2,
  benefit: 'free-units',
  freeQty: 1,
  benefitPct: 10,
  bundleQty: 3,
  bundlePrice: 5000,
  items: [{ productId: 'current', qty: 1 }],
  pricingMode: 'price',
  bundlePromoPrice: 15000,
  bundleDiscountPct: 20,
  maxPurchaseLimit: 0,
};

/* ------------------------------------------------------------------ */
/* Studio draft                                                        */
/* ------------------------------------------------------------------ */

export interface DealStudioDraft {
  strategy: DealStrategy | null;
  discountPct: number;
  fixed: FixedDealConfig;
  combo: ComboConfig;
  flash: FlashDealConfig;
  /** Quantity Limit — total promotional stock / entitlements released. */
  vouchers: number;
  claimOnce: boolean;
  /** Multiple-claims option: cap per customer is unlimited. */
  unlimitedClaims: boolean;
  maxClaims: number;
  /** Max units a customer may redeem in a single order. */
  maxUnitsPerOrder: number;
  gifting: boolean;
  otpVerify: boolean;
  socialBonus: boolean;
  dineIn: boolean;
  pickup: boolean;
  reservation: boolean;
  autoPause: boolean;
  /** Demo outlets only; live deals use `branchIds`. */
  branches: { wuseII: boolean; garkiII: boolean; maitama: boolean };
  /** Live: the business's branches the deal runs at (unset = the active branch). */
  branchIds?: string[];
  /** Live: the deal group this draft already published — publishing again updates it. */
  publishedDealGroupId?: string;
  /** Live: the branches it was published at, so a re-publish can add or pause branches. */
  publishedBranchIds?: string[];
  days: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean; sun: boolean };
  redeemAllDay: boolean;
  redeemStart: string;
  redeemEnd: string;
  duration: DealDuration;
  claimSteps: string[];
  terms: string[];
}

export const INITIAL_DEAL_STUDIO_DRAFT: DealStudioDraft = {
  strategy: null,
  discountPct: 20,
  fixed: { ...DEFAULT_FIXED_CONFIG },
  combo: { ...DEFAULT_COMBO_CONFIG },
  flash: { ...DEFAULT_FLASH_CONFIG },
  vouchers: 50,
  claimOnce: true,
  unlimitedClaims: false,
  maxClaims: 2,
  maxUnitsPerOrder: 5,
  gifting: true,
  otpVerify: true,
  socialBonus: true,
  dineIn: true,
  pickup: true,
  reservation: true,
  autoPause: true,
  branches: { wuseII: true, garkiII: true, maitama: false },
  days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
  redeemAllDay: false,
  redeemStart: '12:00 PM',
  redeemEnd: '5:00 PM',
  duration: '14-days',
  claimSteps: [
    'Show your digital VEMTAP voucher pass at reception/counter',
    'Enjoy your meal with the deal discount applied to eligible items',
    'Settle remaining balance directly with restaurant via Card, Cash or Transfer',
  ],
  terms: [
    'Show voucher code before placing order',
    'Dine-in and pickup only. Not combinable with other promotions',
    'Valid only during specified lunch hours (12:00 PM – 5:00 PM)',
  ],
};

/**
 * Live starting point: same rules as the sample, but claim steps and terms that
 * fit any business (no restaurant wording or fixed hours) for the owner to edit.
 */
export const LIVE_DEAL_STUDIO_DRAFT: DealStudioDraft = {
  ...INITIAL_DEAL_STUDIO_DRAFT,
  claimSteps: [
    'Show your VEMTAP voucher at the counter before you pay',
    'The deal price is applied to the eligible item',
    'Pay any balance directly with the business',
  ],
  terms: ['Show your voucher code before you pay', 'Not combinable with other promotions'],
};

/* ------------------------------------------------------------------ */
/* Validity period                                                     */
/* ------------------------------------------------------------------ */

export const DEAL_DURATION_DAYS: Record<DealDuration, number | null> = {
  '7-days': 7,
  '14-days': 14,
  '30-days': 30,
  '3-months': 91,
  '6-months': 182,
  forever: null,
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 0);
  return copy;
};

/**
 * When the deal runs if published now: happy-hour deals use their own dates,
 * the rest start today and last the chosen duration (no end when "forever").
 */
export function dealValidityRange(studio: DealStudioDraft, now = new Date()): { start: Date; end?: Date } {
  const start = studio.strategy === 'tiered' && studio.flash.startDate ? new Date(`${studio.flash.startDate}T00:00:00`) : now;
  if (studio.strategy === 'tiered' && studio.flash.endDate) return { start, end: endOfDay(new Date(`${studio.flash.endDate}T00:00:00`)) };
  const days = DEAL_DURATION_DAYS[studio.duration];
  return { start, end: days === null ? undefined : endOfDay(new Date(start.getTime() + days * 86_400_000)) };
}

/** "29 Oct – 12 Nov 2026 (14 Days)" / "Always On — No Fixed Expiry". */
export function formatDealValidity(studio: DealStudioDraft, now = new Date()) {
  const { start, end } = dealValidityRange(studio, now);
  if (!end) return 'Always On — No Fixed Expiry';
  const day = (date: Date, withYear: boolean) =>
    date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  const label = studio.strategy === 'tiered' ? 'Happy hour' : dealDurationLabel(studio.duration);
  return `${day(start, start.getFullYear() !== end.getFullYear())} – ${day(end, true)} (${label})`;
}

/** Customer-facing claim restriction label (distinct from quantity & per-order limits). */
export const claimLimitLabel = (studio: DealStudioDraft) => {
  if (studio.claimOnce) return '1 Per Customer';
  if (studio.unlimitedClaims) return 'Unlimited Per Customer';
  return `${studio.maxClaims} Per Customer / Month`;
};

/**
 * The window the per-customer cap is counted over, as the API names it:
 * "once" is once ever, a numeric cap is per calendar month (as the studio shows).
 */
export const claimLimitPeriod = (studio: DealStudioDraft): 'lifetime' | 'month' | undefined =>
  studio.claimOnce ? 'lifetime' : studio.unlimitedClaims ? undefined : 'month';

/** The headline badge customers see for this deal ("20% Off", "₦2,500 Off", …). */
export function dealBadgeLabel(studio: DealStudioDraft, savingsPct?: number) {
  switch (studio.strategy) {
    case 'fixed':
      return `₦${formatDealAmount(studio.fixed.amountOff)} Off`;
    case 'combo':
      return savingsPct && savingsPct > 0 ? `Combo • Save ${savingsPct}%` : 'Combo Deal';
    case 'tiered':
      return `${studio.flash.discountPct}% Off Happy Hour`;
    default:
      return `${studio.discountPct}% Off`;
  }
}

/** Minimum bill for the deal, when it has one (only fixed-amount deals do). */
export const dealMinSpend = (studio: DealStudioDraft) =>
  studio.strategy === 'fixed' && studio.fixed.minSpend > 0 ? studio.fixed.minSpend : 0;

/** "Dine-in • Pickup • Reservation" from the redemption modes switched on. */
export const redemptionModesLabel = (studio: DealStudioDraft) =>
  [studio.dineIn && 'Dine-in', studio.pickup && 'Pickup', studio.reservation && 'Reservation'].filter(Boolean).join(' • ');

/* ------------------------------------------------------------------ */
/* Pricing math                                                        */
/* ------------------------------------------------------------------ */

export interface DealPricing {
  /** Regular combined / catalog price before the deal. */
  originalTotal: number;
  /** What the customer pays for the qualifying set. */
  dealPrice: number;
  savings: number;
  /** Effective discount percentage across the qualifying set. */
  savingsPct: number;
  valid: boolean;
}

/** Catalog for bundle building with the current product injected (id `current`). */
export function resolveBundleCatalog(basePrice: number, catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG): ComboProduct[] {
  const merged = catalog.map((product) => (product.id === 'current' ? { ...product, price: basePrice } : product));
  return merged.some((product) => product.id === 'current')
    ? merged
    : [{ id: 'current', name: 'This catalog item', price: basePrice }, ...merged];
}

export function resolveComboPricing(
  combo: ComboConfig,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): DealPricing {
  const products = resolveBundleCatalog(basePrice, catalog);

  if (combo.mode === 'quantity') {
    const unit = basePrice;
    if (combo.benefit === 'free-units') {
      const free = Math.max(1, combo.freeQty);
      const buy = Math.max(1, combo.buyQty);
      const originalTotal = unit * (buy + free);
      const savings = unit * free;
      return {
        originalTotal,
        dealPrice: originalTotal - savings,
        savings,
        savingsPct: percentOf(savings, originalTotal),
        valid: unit > 0,
      };
    }
    if (combo.benefit === 'percent-off') {
      const units = Math.max(1, combo.buyQty);
      const pct = clampNumber(combo.benefitPct, 1, 90);
      const originalTotal = unit * units;
      const savings = Math.round((originalTotal * pct) / 100);
      return {
        originalTotal,
        dealPrice: originalTotal - savings,
        savings,
        savingsPct: percentOf(savings, originalTotal),
        valid: unit > 0 && combo.benefitPct >= 1 && combo.benefitPct <= 90,
      };
    }
    const units = Math.max(2, combo.bundleQty);
    const originalTotal = unit * units;
    const savings = originalTotal - combo.bundlePrice;
    return {
      originalTotal,
      dealPrice: combo.bundlePrice,
      savings,
      savingsPct: percentOf(Math.max(savings, 0), originalTotal),
      valid: unit > 0 && combo.bundlePrice > 0 && combo.bundlePrice < originalTotal,
    };
  }

  const originalTotal = combo.items.reduce(
    (sum, item) => sum + (products.find((product) => product.id === item.productId)?.price ?? 0) * Math.max(1, item.qty),
    0,
  );
  const totalUnits = combo.items.reduce((sum, item) => sum + Math.max(1, item.qty), 0);
  if (combo.pricingMode === 'price') {
    const savings = originalTotal - combo.bundlePromoPrice;
    return {
      originalTotal,
      dealPrice: combo.bundlePromoPrice,
      savings,
      savingsPct: percentOf(Math.max(savings, 0), originalTotal),
      valid: totalUnits >= 2 && originalTotal > 0 && combo.bundlePromoPrice > 0 && combo.bundlePromoPrice < originalTotal,
    };
  }
  const pct = clampNumber(combo.bundleDiscountPct, 1, 90);
  const savings = Math.round((originalTotal * pct) / 100);
  return {
    originalTotal,
    dealPrice: originalTotal - savings,
    savings,
    savingsPct: percentOf(savings, originalTotal),
    valid: totalUnits >= 2 && originalTotal > 0 && combo.bundleDiscountPct >= 1 && combo.bundleDiscountPct <= 90,
  };
}

/** Pricing for whatever type the draft has selected (falls back to percentage). */
export function resolveDealPricing(
  studio: DealStudioDraft,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): DealPricing {
  switch (studio.strategy ?? 'percentage') {
    case 'percentage': {
      const pct = clampNumber(studio.discountPct, 1, 90);
      const savings = Math.round((basePrice * pct) / 100);
      return {
        originalTotal: basePrice,
        dealPrice: Math.max(basePrice - savings, 0),
        savings,
        savingsPct: pct,
        valid: basePrice > 0 && pct >= 1 && pct <= 90,
      };
    }
    case 'fixed': {
      const { amountOff } = studio.fixed;
      const savings = Math.min(Math.max(amountOff, 0), basePrice);
      return {
        originalTotal: basePrice,
        dealPrice: Math.max(basePrice - amountOff, 0),
        savings,
        savingsPct: percentOf(savings, basePrice),
        valid: basePrice > 0 && amountOff > 0 && amountOff < basePrice,
      };
    }
    case 'tiered': {
      const pct = clampNumber(studio.flash.discountPct, 1, 90);
      const savings = Math.round((basePrice * pct) / 100);
      return {
        originalTotal: basePrice,
        dealPrice: Math.max(basePrice - savings, 0),
        savings,
        savingsPct: pct,
        valid: basePrice > 0 && pct >= 1 && pct <= 90,
      };
    }
    case 'combo':
      return resolveComboPricing(studio.combo, basePrice, catalog);
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validatePercentageDeal(pct: number): string[] {
  const errors: string[] = [];
  if (pct < 1 || pct > 90) errors.push('Discount must be between 1% and 90%.');
  return errors;
}

export function validateFixedDeal(config: FixedDealConfig, basePrice: number): string[] {
  const errors: string[] = [];
  if (config.amountOff <= 0) errors.push('Enter an amount greater than zero to deduct.');
  if (basePrice > 0 && config.amountOff >= basePrice)
    errors.push(
      `Amount off must be less than the ₦${formatDealAmount(basePrice)} original price so the final price never hits zero.`,
    );
  return errors;
}

export function validateFlashDeal(config: FlashDealConfig): string[] {
  const errors: string[] = [];
  if (config.discountPct < 1 || config.discountPct > 90) errors.push('Flash discount must be between 1% and 90%.');
  if (!config.startDate || !config.endDate) errors.push('Set both a start and an end date for the validity period.');
  else if (config.endDate <= config.startDate) errors.push('The end date must be after the start date.');
  return errors;
}

export function validateComboDeal(
  combo: ComboConfig,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): string[] {
  const errors: string[] = [];
  if (combo.mode === 'quantity') {
    if (combo.buyQty < 1) errors.push('Qualifying quantity must be at least 1 unit.');
    if (combo.benefit === 'free-units' && combo.freeQty < 1)
      errors.push('Set at least 1 free unit for a Buy-N-Get-M promotion.');
    if (combo.benefit === 'percent-off' && (combo.benefitPct < 1 || combo.benefitPct > 90))
      errors.push('Bundle discount must be between 1% and 90%.');
    if (combo.benefit === 'bundle-price') {
      if (combo.bundleQty < 2) errors.push('A promotional bundle price needs at least 2 qualifying units.');
      if (combo.bundlePrice <= 0) errors.push('Enter the promotional bundle price the customer pays.');
      else if (basePrice > 0 && combo.bundlePrice >= basePrice * Math.max(2, combo.bundleQty))
        errors.push(
          `Bundle price must be below the ₦${formatDealAmount(basePrice * Math.max(2, combo.bundleQty))} regular combined price.`,
        );
    }
  } else {
    const products = resolveBundleCatalog(basePrice, catalog);
    const totalUnits = combo.items.reduce((sum, item) => sum + Math.max(1, item.qty), 0);
    if (combo.items.length === 0) errors.push('Add at least one product to the bundle.');
    if (totalUnits < 2)
      errors.push('A multi-product bundle must contain at least 2 units (two products, or one product × 2).');
    if (combo.items.some((item) => !products.some((product) => product.id === item.productId)))
      errors.push('Every bundle line must reference an available product.');
    if (combo.pricingMode === 'price') {
      const { originalTotal } = resolveComboPricing(combo, basePrice, catalog);
      if (combo.bundlePromoPrice <= 0) errors.push('Enter the bundle price the customer pays.');
      else if (originalTotal > 0 && combo.bundlePromoPrice >= originalTotal)
        errors.push(`Bundle price must be below the ₦${formatDealAmount(originalTotal)} regular combined price.`);
    } else if (combo.bundleDiscountPct < 1 || combo.bundleDiscountPct > 90)
      errors.push('Bundle discount must be between 1% and 90%.');
  }
  return errors;
}

/** Validation for whatever type the draft has selected. */
export function validateDealConfiguration(
  studio: DealStudioDraft,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): string[] {
  switch (studio.strategy ?? 'percentage') {
    case 'percentage':
      return validatePercentageDeal(studio.discountPct);
    case 'fixed':
      return validateFixedDeal(studio.fixed, basePrice);
    case 'tiered':
      return validateFlashDeal(studio.flash);
    case 'combo':
      return validateComboDeal(studio.combo, basePrice, catalog);
  }
}

/* ------------------------------------------------------------------ */
/* Customer-facing rule copy                                           */
/* ------------------------------------------------------------------ */

/** First entry is the headline; the rest are supporting detail lines. */
export function describeComboRules(
  combo: ComboConfig,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): string[] {
  const products = resolveBundleCatalog(basePrice, catalog);
  const nameOf = (id: string) => products.find((product) => product.id === id)?.name ?? 'Unknown item';

  if (combo.mode === 'quantity') {
    if (combo.benefit === 'free-units')
      return [
        `Buy ${combo.buyQty}, get ${combo.freeQty} free`,
        `Customer pays for ${combo.buyQty} unit(s) and receives ${combo.freeQty} extra ${nameOf('current')} free.`,
      ];
    if (combo.benefit === 'percent-off')
      return [
        `Buy ${combo.buyQty}+, get ${combo.benefitPct}% off`,
        `${combo.benefitPct}% is applied to the multi-unit total for every qualifying order.`,
      ];
    return [
      `${combo.bundleQty} for ₦${formatDealAmount(combo.bundlePrice)}`,
      `Customer buys ${combo.bundleQty} units for a fixed ₦${formatDealAmount(combo.bundlePrice)} instead of the regular combined price.`,
    ];
  }

  const parts = combo.items.map((item) => `${item.qty}× ${nameOf(item.productId)}`);
  const headline = combo.pricingMode === 'price'
    ? `Bundle for ₦${formatDealAmount(combo.bundlePromoPrice)}`
    : `${combo.bundleDiscountPct}% off selected bundle`;
  return [
    headline,
    `Customer must buy: ${parts.join(' + ')}${
      combo.pricingMode === 'price'
        ? ` for ₦${formatDealAmount(combo.bundlePromoPrice)} (regular ₦${formatDealAmount(resolveComboPricing(combo, basePrice, catalog).originalTotal)}).`
        : ` and receives ${combo.bundleDiscountPct}% off the combined price.`
    }`,
  ];
}

/** Short human summary of the three distinct limits (stock vs claims vs per-order). */
export function describeQuantityRules(studio: DealStudioDraft): string[] {
  return [
    `Quantity Limit: ${studio.vouchers} promotional entitlements in total.`,
    `Claims per customer: ${claimLimitLabel(studio)}.`,
    `Max units per order: ${studio.maxUnitsPerOrder}.`,
  ];
}
