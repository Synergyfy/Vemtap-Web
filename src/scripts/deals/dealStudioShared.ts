/**
 * Shared Deal Studio model — product-based deals for both mobile and desktop.
 *
 * First-release structures:
 * - Bundle Deal: two or more live catalogue products at one combined price.
 * - Price Slash: a new price or a percentage off the selected products.
 * - Buy More, Save More: quantity/price tiers for the selected products.
 *
 * Free Delivery is an optional extra benefit, not a primary deal structure.
 * Keep the rules and pricing maths here so the two wizards, live publishing and
 * pre-publish validation cannot drift apart.
 */

/** Backend pricing strategy kept for the legacy onboarding wizard. */
export type DealStrategy = 'current' | 'percentage' | 'fixed' | 'combo' | 'tiered';

/** Customer-facing structures offered by the new Deal Studio. */
export type DealStructure = 'bundle' | 'price-slash' | 'buy-more-save-more';

export type DealPriceChoice = 'current' | 'changed';

export type DealDuration = '7-days' | '14-days' | '30-days' | '3-months' | '6-months' | 'forever';

/* ------------------------------------------------------------------ */
/* Legacy price-choice helpers (onboarding screens still use these)     */
/* ------------------------------------------------------------------ */

export const isCurrentPriceDeal = (studio: DealStudioDraft) => studio.strategy === 'current';

export const dealPriceChoiceFor = (studio: DealStudioDraft): DealPriceChoice =>
  isCurrentPriceDeal(studio) ? 'current' : 'changed';

export const withDealPriceChoice = (studio: DealStudioDraft, choice: DealPriceChoice): DealStudioDraft => ({
  ...studio,
  strategy: choice === 'current' ? 'current' : null,
  structure: null,
});

/** Choose a product-based structure and keep the legacy strategy field in sync. */
export function withDealStructure(studio: DealStudioDraft, structure: DealStructure): DealStudioDraft {
  const strategy: DealStrategy =
    structure === 'bundle' ? 'combo' : structure === 'price-slash' ? 'fixed' : 'tiered';
  return {
    ...studio,
    structure,
    strategy,
    ...(structure === 'bundle'
      ? { combo: { ...studio.combo, mode: 'bundle' as const, pricingMode: 'price' as const } }
      : {}),
  };
}

export const structureForStrategy = (strategy: DealStrategy | null): DealStructure | null => {
  if (strategy === 'combo') return 'bundle';
  if (strategy === 'fixed' || strategy === 'percentage') return 'price-slash';
  if (strategy === 'tiered') return 'buy-more-save-more';
  return null;
};

/** Keep the selected product list, bundle lines and price suggestions in sync. */
export function withSelectedProducts(
  studio: DealStudioDraft,
  productIds: string[],
  catalog: ComboProduct[] = [],
): DealStudioDraft {
  const ids = [...new Set(productIds.filter(Boolean))];
  const priceById = new Map(catalog.map((product) => [product.id, product.price]));
  const total = ids.reduce((sum, id) => sum + (priceById.get(id) ?? 0), 0);
  const tiers = [...studio.quantityTiers]
    .sort((a, b) => a.quantity - b.quantity)
    .map((tier, index) => ({
      ...tier,
      price: total > 0 ? Math.floor(total * tier.quantity * (0.9 - index * 0.05)) : 0,
    }));
  return {
    ...studio,
    productIds: ids,
    priceSlash: {
      ...studio.priceSlash,
      newPrice: total > 0 ? Math.floor(total * 0.8) : 0,
    },
    quantityTiers: tiers,
    combo: {
      ...studio.combo,
      mode: 'bundle',
      pricingMode: 'price',
      items: ids.map((productId) => ({ productId, qty: 1 })),
      bundlePromoPrice: total > 0 ? Math.floor(total * 0.75) : 0,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Durations                                                           */
/* ------------------------------------------------------------------ */

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
/* Deal structure catalogue                                            */
/* ------------------------------------------------------------------ */

export interface DealTypeOption {
  id: DealStructure;
  icon: string;
  title: string;
  badge: string;
  badgeActive: boolean;
  description: string;
  /** Shown under the three primary cards as guidance, not as a button. */
  requires?: string;
}

export const DEAL_TYPE_OPTIONS: DealTypeOption[] = [
  {
    id: 'bundle',
    icon: 'inventory_2',
    title: 'Bundle Deal',
    badge: 'Best value',
    badgeActive: true,
    description: 'Offer two or more products together at one combined price.',
    requires: 'Choose at least 2 products',
  },
  {
    id: 'price-slash',
    icon: 'percent',
    title: 'Price Slash',
    badge: 'Simple',
    badgeActive: false,
    description: 'Drop the price of the selected products, either by a new price or a percentage.',
    requires: 'Choose at least 1 product',
  },
  {
    id: 'buy-more-save-more',
    icon: 'local_offer',
    title: 'Buy More, Save More',
    badge: 'Volume',
    badgeActive: false,
    description: 'Set quantity levels with a matching deal price for each one.',
    requires: 'Choose at least 1 product',
  },
];

export const dealTypeTitle = (id: DealStructure | DealStrategy | null) => {
  if (id === 'current') return 'Current Price';
  return DEAL_TYPE_OPTIONS.find((option) => option.id === id)?.title ?? 'Choose a Deal Structure';
};

export const dealStructureTitle = (id: DealStructure | null) =>
  DEAL_TYPE_OPTIONS.find((option) => option.id === id)?.title ?? 'Deal';

export const dealStructureIcon = (id: DealStructure | null) =>
  DEAL_TYPE_OPTIONS.find((option) => option.id === id)?.icon ?? 'local_offer';

/* ------------------------------------------------------------------ */
/* Numeric / date helpers                                              */
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
/* Legacy configuration blocks                                         */
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

/** Live catalogue product used by the studio. No demo catalogue is injected. */
export interface ComboProduct {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

/* ------------------------------------------------------------------ */
/* Deal gallery                                                        */
/* ------------------------------------------------------------------ */

export type DealMediaKind = 'image' | 'video';
/** 0 is the compulsory main slot; 1–4 are the additional gallery slots. */
export type DealMediaSlot = 0 | 1 | 2 | 3 | 4;

export const DEAL_MEDIA_SLOTS: readonly DealMediaSlot[] = [0, 1, 2, 3, 4];
export const DEAL_GALLERY_SLOTS: readonly DealMediaSlot[] = [1, 2, 3, 4];
/** The limits shown in both Deal Gallery views and checked before upload. */
export const MAX_DEAL_IMAGE_MB = 2;
export const MAX_DEAL_VIDEO_MB = 5;
export const MAX_DEAL_VIDEOS = 1;

export interface DealMediaItem {
  slot: DealMediaSlot;
  kind: DealMediaKind;
  url: string;
  /** Kept for limit checks on restored drafts; not sent to the API. */
  sizeBytes?: number;
  name?: string;
}

/**
 * Uploads do not always keep the source extension, so gallery video URLs carry
 * a harmless marker. The backend stores gallery media as plain strings, which
 * is how the frontend keeps knowing a URL is a video after a reload.
 */
const VIDEO_URL_MARKER = 'vemtapMedia=video';

export const withVideoMediaMarker = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed || isVideoMediaUrl(trimmed)) return trimmed;
  return `${trimmed}${trimmed.includes('?') ? '&' : '?'}${VIDEO_URL_MARKER}`;
};

export const isVideoMediaUrl = (url: string | null | undefined): boolean => {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  return /\.(mp4|webm|mov)(?:[?#]|$)/i.test(trimmed) || trimmed.includes(VIDEO_URL_MARKER);
};

/** Verified facts passed to the AI prompt builder — never invented by the app. */
export interface DealAiPromptData {
  title: string;
  description: string;
  structure: string;
  offerLines: string[];
  products: { name: string; price: number }[];
  startDate: string;
  endDate: string;
  quantity: number;
  freeDelivery: boolean;
  branches: string[];
}

/** Builds the prompt facts from the same live state the merchant configured. */
export function dealAiPromptData(
  studio: DealStudioDraft,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
  branchNames: string[] = [],
): DealAiPromptData {
  const regularTotal = selectedRegularTotal(studio, catalog);
  const pricing = resolveDealPricing(studio, regularTotal, catalog);
  const structure = studio.structure ?? structureForStrategy(studio.strategy);
  const offerLines = [
    `Deal structure: ${dealTypeTitle(structure ?? null)}`,
    `Customer price: ₦${formatDealAmount(pricing.dealPrice)} (regular ₦${formatDealAmount(pricing.originalTotal)}, saving ₦${formatDealAmount(Math.max(pricing.savings, 0))}${
      pricing.savingsPct > 0 ? ` / ${pricing.savingsPct}%` : ''
    })`,
    ...(structure === 'bundle' ? describeComboRules(studio.combo, regularTotal, catalog).slice(0, 1) : []),
    ...(structure === 'buy-more-save-more' ? describeQuantityTiers(studio, regularTotal) : []),
    ...(studio.freeDelivery ? ['Free delivery is included'] : []),
  ];
  return {
    title: studio.title.trim() || dealTypeTitle(structure ?? null),
    description: studio.description.trim(),
    structure: dealTypeTitle(structure ?? null),
    offerLines,
    products: studio.productIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter((product): product is ComboProduct => Boolean(product))
      .map((product) => ({ name: product.name, price: product.price })),
    startDate: studio.startDate ? formatDealDate(studio.startDate) : '',
    endDate: studio.endDate ? formatDealDate(studio.endDate) : '',
    quantity: studio.vouchers,
    freeDelivery: studio.freeDelivery,
    branches: branchNames.filter(Boolean),
  };
}

export type ComboMode = 'quantity' | 'bundle';
export type ComboBenefit = 'free-units' | 'percent-off' | 'bundle-price';

export interface ComboLineItem {
  productId: string;
  qty: number;
}

export interface ComboConfig {
  mode: ComboMode;
  buyQty: number;
  benefit: ComboBenefit;
  freeQty: number;
  benefitPct: number;
  bundleQty: number;
  bundlePrice: number;
  items: ComboLineItem[];
  pricingMode: 'price' | 'percent';
  bundlePromoPrice: number;
  bundleDiscountPct: number;
  maxPurchaseLimit: number;
}

export const DEFAULT_COMBO_CONFIG: ComboConfig = {
  mode: 'bundle',
  buyQty: 2,
  benefit: 'free-units',
  freeQty: 1,
  benefitPct: 10,
  bundleQty: 3,
  bundlePrice: 5000,
  items: [],
  pricingMode: 'price',
  bundlePromoPrice: 0,
  bundleDiscountPct: 20,
  maxPurchaseLimit: 0,
};

/* ------------------------------------------------------------------ */
/* New product-based configuration                                     */
/* ------------------------------------------------------------------ */

export type PriceSlashMode = 'price' | 'percentage';

export interface PriceSlashConfig {
  mode: PriceSlashMode;
  newPrice: number;
  discountPct: number;
}

export const DEFAULT_PRICE_SLASH_CONFIG: PriceSlashConfig = {
  mode: 'price',
  newPrice: 0,
  discountPct: 20,
};

export interface QuantityPriceTier {
  id: string;
  quantity: number;
  price: number;
}

export const DEFAULT_QUANTITY_TIERS: QuantityPriceTier[] = [
  { id: 'tier-2', quantity: 2, price: 0 },
  { id: 'tier-3', quantity: 3, price: 0 },
];

/** Never ship a mock catalogue into live mode. Live products come from the API. */
export const DEFAULT_BUNDLE_CATALOG: ComboProduct[] = [];

/* ------------------------------------------------------------------ */
/* Studio draft                                                        */
/* ------------------------------------------------------------------ */

export interface DealStudioDraft {
  /** New product-based flow. */
  structure: DealStructure | null;
  /** Legacy/backend pricing strategy; kept in sync with `structure`. */
  strategy: DealStrategy | null;
  /** Live catalogue product IDs selected for this deal. */
  productIds: string[];
  /** Deal-specific content. The main gallery slot is compulsory in the studio. */
  title: string;
  description: string;
  /** Five explicit slots: main + four additional images/videos. */
  dealMedia?: DealMediaItem[];
  /** Mirrors the API's `galleryImages`; kept for restored older drafts. */
  galleryImages?: string[];
  /** Main media URL, derived from `dealMedia` for backwards compatibility. */
  imageUrl?: string;
  startDate: string;
  endDate: string;
  freeDelivery: boolean;
  priceSlash: PriceSlashConfig;
  quantityTiers: QuantityPriceTier[];

  /** Legacy fields below remain for the existing onboarding wizard. */
  discountPct: number;
  fixed: FixedDealConfig;
  combo: ComboConfig;
  flash: FlashDealConfig;
  /** Quantity Limit — total promotional stock / entitlements released. */
  vouchers: number;
  claimOnce: boolean;
  unlimitedClaims: boolean;
  maxClaims: number;
  maxUnitsPerOrder: number;
  gifting: boolean;
  otpVerify: boolean;
  socialBonus: boolean;
  dineIn: boolean;
  pickup: boolean;
  reservation: boolean;
  autoPause: boolean;
  branches: { wuseII: boolean; garkiII: boolean; maitama: boolean };
  branchIds?: string[];
  publishedDealGroupId?: string;
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
  structure: null,
  strategy: null,
  productIds: [],
  title: '',
  description: '',
  dealMedia: [],
  galleryImages: [],
  imageUrl: undefined,
  startDate: isoDate(0),
  endDate: isoDate(14),
  freeDelivery: false,
  priceSlash: { ...DEFAULT_PRICE_SLASH_CONFIG },
  quantityTiers: DEFAULT_QUANTITY_TIERS.map((tier) => ({ ...tier })),
  discountPct: 20,
  fixed: { ...DEFAULT_FIXED_CONFIG },
  combo: { ...DEFAULT_COMBO_CONFIG, items: [] },
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
  redeemAllDay: true,
  redeemStart: '12:00 PM',
  redeemEnd: '5:00 PM',
  duration: '14-days',
  claimSteps: [
    'Show your VEMTAP voucher pass at checkout or counter',
    'The deal price is applied to the selected products',
    'Pay any balance directly to the business',
  ],
  terms: ['Show voucher code before checkout', 'Not combinable with other promotions'],
};

export const LIVE_DEAL_STUDIO_DRAFT: DealStudioDraft = {
  ...INITIAL_DEAL_STUDIO_DRAFT,
  claimSteps: [
    'Show your VEMTAP voucher at the counter before you pay',
    'The deal price is applied to the selected products',
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

export function dealValidityRange(studio: DealStudioDraft, now = new Date()): { start: Date; end?: Date } {
  // The new Deal Studio asks for explicit start/end dates.
  if (studio.startDate || studio.endDate) {
    const start = studio.startDate ? new Date(`${studio.startDate}T00:00:00`) : now;
    const end = studio.endDate ? endOfDay(new Date(`${studio.endDate}T00:00:00`)) : undefined;
    return { start: Number.isNaN(start.getTime()) ? now : start, end };
  }
  // Legacy happy-hour deals use their own date range.
  if (studio.strategy === 'tiered' && studio.flash.startDate) {
    const start = new Date(`${studio.flash.startDate}T00:00:00`);
    if (studio.flash.endDate) return { start, end: endOfDay(new Date(`${studio.flash.endDate}T00:00:00`)) };
  }
  const days = DEAL_DURATION_DAYS[studio.duration];
  return { start: now, end: days === null ? undefined : endOfDay(new Date(now.getTime() + days * 86_400_000)) };
}

export function formatDealValidity(studio: DealStudioDraft, now = new Date()) {
  const { start, end } = dealValidityRange(studio, now);
  if (!end) return 'Always On — No Fixed Expiry';
  const day = (date: Date, withYear: boolean) =>
    date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  return `${day(start, start.getFullYear() !== end.getFullYear())} – ${day(end, true)}`;
}

/* ------------------------------------------------------------------ */
/* Customer-facing labels                                              */
/* ------------------------------------------------------------------ */

export const claimLimitLabel = (studio: DealStudioDraft) => {
  if (studio.claimOnce) return '1 Per Customer';
  if (studio.unlimitedClaims) return 'Unlimited Per Customer';
  return `${studio.maxClaims} Per Customer / Month`;
};

export const claimLimitPeriod = (studio: DealStudioDraft): 'lifetime' | 'month' | undefined =>
  studio.claimOnce ? 'lifetime' : studio.unlimitedClaims ? undefined : 'month';

export function dealBadgeLabel(studio: DealStudioDraft, savingsPct?: number) {
  const suffix = studio.freeDelivery ? ' • Free Delivery' : '';
  switch (studio.structure ?? structureForStrategy(studio.strategy)) {
    case 'bundle':
      return `Bundle${savingsPct && savingsPct > 0 ? ` • Save ${savingsPct}%` : ' Deal'}${suffix}`;
    case 'price-slash':
      return studio.priceSlash.mode === 'percentage'
        ? `${studio.priceSlash.discountPct}% Off${suffix}`
        : `₦${formatDealAmount(studio.priceSlash.newPrice)} Deal Price${suffix}`;
    case 'buy-more-save-more':
      return `Buy More, Save More${suffix}`;
    default:
      return `Deal${suffix}`;
  }
}

export const dealMinSpend = (_studio: DealStudioDraft) => 0;

export const redemptionModesLabel = (studio: DealStudioDraft) =>
  [studio.dineIn && 'Dine-in', studio.pickup && 'Pickup', studio.reservation && 'Reservation'].filter(Boolean).join(' • ');

/* ------------------------------------------------------------------ */
/* Pricing maths                                                       */
/* ------------------------------------------------------------------ */

export interface DealPricing {
  /** Regular combined price before the deal. */
  originalTotal: number;
  /** What the customer pays for the qualifying set. */
  dealPrice: number;
  savings: number;
  /** Effective discount percentage across the qualifying set. */
  savingsPct: number;
  valid: boolean;
}

/** Live products are already the catalogue; there is no placeholder entry. */
export function resolveBundleCatalog(_basePrice: number, catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG): ComboProduct[] {
  return catalog;
}

/** Regular combined price of every product selected for the deal. */
export function selectedRegularTotal(studio: DealStudioDraft, catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG): number {
  const priceById = new Map(catalog.map((product) => [product.id, product.price]));
  return studio.productIds.reduce((sum, id) => sum + (priceById.get(id) ?? 0), 0);
}

/**
 * Media in slot order. Older drafts only had `imageUrl`/`galleryImages`, so
 * they are migrated here instead of losing their uploaded media.
 */
export function dealMediaItems(studio: DealStudioDraft): DealMediaItem[] {
  if (studio.dealMedia?.length) {
    return [...studio.dealMedia].sort((a, b) => a.slot - b.slot);
  }
  const items: DealMediaItem[] = [];
  if (studio.imageUrl?.trim()) {
    items.push({ slot: 0, kind: isVideoMediaUrl(studio.imageUrl) ? 'video' : 'image', url: studio.imageUrl.trim() });
  }
  (studio.galleryImages ?? []).slice(0, 4).forEach((url, index) => {
    if (!url?.trim()) return;
    items.push({
      slot: (index + 1) as DealMediaSlot,
      kind: isVideoMediaUrl(url) ? 'video' : 'image',
      url: url.trim(),
    });
  });
  return items;
}

export const mainDealMedia = (studio: DealStudioDraft): DealMediaItem | null =>
  dealMediaItems(studio).find((item) => item.slot === 0) ?? null;

export const galleryDealMedia = (studio: DealStudioDraft): DealMediaItem[] =>
  dealMediaItems(studio).filter((item) => item.slot !== 0);

export const dealGalleryUrls = (studio: DealStudioDraft): string[] =>
  galleryDealMedia(studio).map((item) => item.url);

/** Replaces one slot (or clears it with `null`) and keeps the API fields in sync. */
export function withDealMediaSlot(
  studio: DealStudioDraft,
  slot: DealMediaSlot,
  item: Omit<DealMediaItem, 'slot'> | null,
): DealStudioDraft {
  const remaining = dealMediaItems(studio).filter((media) => media.slot !== slot);
  const next = item ? [...remaining, { ...item, slot }] : remaining;
  const main = next.find((media) => media.slot === 0);
  const gallery = next.filter((media) => media.slot !== 0).sort((a, b) => a.slot - b.slot);
  return {
    ...studio,
    dealMedia: [...next].sort((a, b) => a.slot - b.slot),
    galleryImages: gallery.map((media) => media.url),
    imageUrl: main?.url,
  };
}

export function resolveComboPricing(
  combo: ComboConfig,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): DealPricing {
  const products = resolveBundleCatalog(basePrice, catalog);
  const priceOf = (id: string) => products.find((product) => product.id === id)?.price ?? 0;

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
        valid: unit > 0 && pct >= 1 && pct <= 90,
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
    (sum, item) => sum + priceOf(item.productId) * Math.max(1, item.qty),
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

export function resolvePriceSlashPricing(studio: DealStudioDraft, basePrice: number): DealPricing {
  const { mode, newPrice, discountPct } = studio.priceSlash;
  if (mode === 'percentage') {
    const pct = clampNumber(discountPct, 1, 90);
    const savings = Math.round((basePrice * pct) / 100);
    return {
      originalTotal: basePrice,
      dealPrice: Math.max(basePrice - savings, 0),
      savings,
      savingsPct: pct,
      valid: basePrice > 0 && pct >= 1 && pct <= 90,
    };
  }
  const savings = basePrice - newPrice;
  return {
    originalTotal: basePrice,
    dealPrice: Math.max(newPrice, 0),
    savings,
    savingsPct: percentOf(Math.max(savings, 0), basePrice),
    valid: basePrice > 0 && newPrice > 0 && newPrice < basePrice,
  };
}

/** First quantity tier is the headline price; all tiers are shown in the UI. */
export function resolveQuantityPricing(studio: DealStudioDraft, basePrice: number): DealPricing {
  const tiers = [...studio.quantityTiers].sort((a, b) => a.quantity - b.quantity);
  const first = tiers[0];
  if (!first) {
    return { originalTotal: 0, dealPrice: 0, savings: 0, savingsPct: 0, valid: false };
  }
  const originalTotal = basePrice * Math.max(1, first.quantity);
  const savings = originalTotal - first.price;
  return {
    originalTotal,
    dealPrice: Math.max(first.price, 0),
    savings,
    savingsPct: percentOf(Math.max(savings, 0), originalTotal),
    valid: tiers.length >= 2 && originalTotal > 0 && first.price > 0 && first.price < originalTotal,
  };
}

/** Pricing for the new structure, with a legacy fallback for onboarding drafts. */
export function resolveDealPricing(
  studio: DealStudioDraft,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): DealPricing {
  switch (studio.structure ?? structureForStrategy(studio.strategy)) {
    case 'bundle':
      return resolveComboPricing(studio.combo, basePrice, catalog);
    case 'price-slash':
      return resolvePriceSlashPricing(studio, basePrice);
    case 'buy-more-save-more':
      return resolveQuantityPricing(studio, basePrice);
    default:
      return resolvePriceSlashPricing(
        { ...studio, priceSlash: { mode: 'percentage', newPrice: 0, discountPct: studio.discountPct } },
        basePrice,
      );
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
    return errors;
  }

  const products = resolveBundleCatalog(basePrice, catalog);
  const totalUnits = combo.items.reduce((sum, item) => sum + Math.max(1, item.qty), 0);
  if (combo.items.length < 2) errors.push('A bundle needs at least 2 products.');
  if (totalUnits < 2) errors.push('A bundle must contain at least 2 units.');
  if (combo.items.some((item) => !products.some((product) => product.id === item.productId)))
    errors.push('Every bundle line must reference an available product.');
  const pricing = resolveComboPricing(combo, basePrice, catalog);
  if (combo.pricingMode === 'price') {
    if (combo.bundlePromoPrice <= 0) errors.push('Enter the combined bundle price the customer pays.');
    else if (pricing.originalTotal > 0 && combo.bundlePromoPrice >= pricing.originalTotal)
      errors.push(`Bundle price must be below the ₦${formatDealAmount(pricing.originalTotal)} regular combined price.`);
  } else if (combo.bundleDiscountPct < 1 || combo.bundleDiscountPct > 90) {
    errors.push('Bundle discount must be between 1% and 90%.');
  }
  return errors;
}

export function validatePriceSlashDeal(studio: DealStudioDraft, basePrice: number): string[] {
  const { mode, newPrice, discountPct } = studio.priceSlash;
  if (basePrice <= 0) return ['Select at least one product with a valid price.'];
  if (mode === 'percentage') return validatePercentageDeal(discountPct);
  const errors: string[] = [];
  if (newPrice <= 0) errors.push('Enter the new deal price the customer pays.');
  else if (newPrice >= basePrice)
    errors.push(`New price must be below the ₦${formatDealAmount(basePrice)} regular price.`);
  return errors;
}

export function validateQuantityTiers(studio: DealStudioDraft, basePrice: number): string[] {
  const errors: string[] = [];
  if (basePrice <= 0) return ['Select at least one product with a valid price.'];
  if (studio.quantityTiers.length < 2) errors.push('Add at least two quantity levels.');

  const tiers = [...studio.quantityTiers].sort((a, b) => a.quantity - b.quantity);
  tiers.forEach((tier, index) => {
    if (tier.quantity < 2) errors.push('Each quantity level must be at least 2 units.');
    if (tier.price <= 0) errors.push(`Enter a deal price for the ${tier.quantity}-unit level.`);
    if (tier.price >= basePrice * tier.quantity)
      errors.push(`The ${tier.quantity}-unit price must be below its ₦${formatDealAmount(basePrice * tier.quantity)} regular total.`);
    if (index > 0) {
      const previous = tiers[index - 1];
      if (tier.quantity <= previous.quantity)
        errors.push('Each quantity level must be higher than the one before it.');
      if (tier.price / tier.quantity >= previous.price / previous.quantity)
        errors.push(`The ${tier.quantity}-unit level should save more per unit than ${previous.quantity} units.`);
    }
  });
  return [...new Set(errors)];
}

export function validateDealInformation(studio: DealStudioDraft): string[] {
  const errors: string[] = [];
  if (!studio.title.trim()) errors.push('Enter a deal title.');
  if (!studio.startDate || !studio.endDate) errors.push('Set a start date and an end date.');
  else if (studio.endDate < studio.startDate) errors.push('The end date must be on or after the start date.');
  if (studio.vouchers <= 0) errors.push('Set the deal quantity to at least 1.');
  return errors;
}

/** The Deal Gallery is mandatory: 1 main photo/video + up to 4 more, at most 1 video. */
export function validateDealGallery(studio: DealStudioDraft): string[] {
  const errors: string[] = [];
  const media = dealMediaItems(studio);
  if (!media.some((item) => item.slot === 0)) errors.push('Add a main deal image or video.');
  if (media.length > DEAL_MEDIA_SLOTS.length) errors.push('A deal can have one main media item and four additional items only.');
  if (media.some((item) => !item.url.trim())) errors.push('Every filled media slot needs a valid uploaded file.');
  if (media.filter((item) => item.kind === 'video').length > MAX_DEAL_VIDEOS) {
    errors.push('Only one video can be added to a deal.');
  }
  if (media.some((item) => item.kind === 'video' && (item.sizeBytes ?? 0) > MAX_DEAL_VIDEO_MB * 1024 * 1024)) {
    errors.push(`Videos must be ${MAX_DEAL_VIDEO_MB}MB or smaller.`);
  }
  if (media.some((item) => item.kind === 'image' && (item.sizeBytes ?? 0) > MAX_DEAL_IMAGE_MB * 1024 * 1024)) {
    errors.push(`Images must be ${MAX_DEAL_IMAGE_MB}MB or smaller.`);
  }
  return errors;
}

export function validateDealConfiguration(
  studio: DealStudioDraft,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): string[] {
  const structure = studio.structure ?? structureForStrategy(studio.strategy);
  if (!structure) return ['Choose what kind of deal you want to create.'];
  if (studio.productIds.length === 0) return ['Choose at least one product for this deal.'];
  if (structure === 'bundle' && studio.productIds.length < 2)
    return ['A Bundle Deal needs at least 2 products.'];

  switch (structure) {
    case 'bundle':
      return validateComboDeal(studio.combo, basePrice, catalog);
    case 'price-slash':
      return validatePriceSlashDeal(studio, basePrice);
    case 'buy-more-save-more':
      return validateQuantityTiers(studio, basePrice);
  }
}

/* ------------------------------------------------------------------ */
/* Customer-facing rule copy                                           */
/* ------------------------------------------------------------------ */

export function describeComboRules(
  combo: ComboConfig,
  basePrice: number,
  catalog: ComboProduct[] = DEFAULT_BUNDLE_CATALOG,
): string[] {
  const products = resolveBundleCatalog(basePrice, catalog);
  const nameOf = (id: string) => products.find((product) => product.id === id)?.name ?? 'Selected product';

  if (combo.mode === 'quantity') {
    if (combo.benefit === 'free-units')
      return [
        `Buy ${combo.buyQty}, get ${combo.freeQty} free`,
        `Customer pays for ${combo.buyQty} unit(s) and receives ${combo.freeQty} extra free.`,
      ];
    if (combo.benefit === 'percent-off')
      return [
        `Buy ${combo.buyQty}+, get ${combo.benefitPct}% off`,
        `${combo.benefitPct}% is applied to the multi-unit total for every qualifying order.`,
      ];
    return [
      `${combo.bundleQty} for ₦${formatDealAmount(combo.bundlePrice)}`,
      `Customer buys ${combo.bundleQty} units for one fixed price instead of the regular combined price.`,
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

export function describeQuantityTiers(studio: DealStudioDraft, basePrice: number): string[] {
  const tiers = [...studio.quantityTiers].sort((a, b) => a.quantity - b.quantity);
  return tiers.map((tier) => {
    const regular = basePrice * tier.quantity;
    const saved = Math.max(0, regular - tier.price);
    return `Buy ${tier.quantity} for ₦${formatDealAmount(tier.price)} — save ₦${formatDealAmount(saved)}`;
  });
}

export function describeQuantityRules(studio: DealStudioDraft): string[] {
  return [
    `Quantity Limit: ${studio.vouchers} promotional entitlements in total.`,
    `Claims per customer: ${claimLimitLabel(studio)}.`,
    `Max units per order: ${studio.maxUnitsPerOrder}.`,
  ];
}
