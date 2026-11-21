import { api } from './api/client';
import type { ComboProduct, DealStudioDraft } from '../scripts/deals/dealStudioShared';
import {
  claimLimitPeriod,
  dealGalleryUrls,
  dealValidityRange,
  isCurrentPriceDeal,
  mainDealMedia,
  resolveDealPricing,
  selectedRegularTotal,
  structureForStrategy,
} from '../scripts/deals/dealStudioShared';

export type OfferPricingType =
  | 'sum'
  | 'percentage_discount'
  | 'fixed_discount_price'
  | 'fixed_discount_amount'
  | 'combo'
  | 'tiered';

/** `GET /catalogue/offers/admin` row — only the fields the web uses. */
export interface BusinessOffer {
  id: string;
  dealGroupId?: string | null;
  name: string;
  description?: string | null;
  mainImage?: string | null;
  galleryImages?: string[] | null;
  pricingType: OfferPricingType;
  discountValue?: number | null;
  fixedPrice?: number | null;
  calculatedPrice?: number | null;
  originalPrice?: number | null;
  quantity?: number | null;
  itemIds?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  terms?: string[] | null;
  maxClaimsPerCustomer?: number | null;
  offerType?: string | null;
  branchId: string;
  branchName?: string | null;
  status: 'active' | 'inactive' | string;
  createdAt?: string | null;
  maxClaims?: number | null;
  claimedCount?: number | null;
  redeemedCount?: number | null;
  views?: number | null;
  likesCount?: number | null;
  claimSteps?: string[] | null;
  /** Weekdays 0–6 (Sunday = 0) with HH:mm start/end. */
  redemptionWindows?: { weekdays: number[]; start: string; end: string }[] | null;
}

export interface OfferSummary {
  activeDeals: number;
  activeOffers: number;
  claimsToday: number;
  redeemedToday: number;
  netRevenue30d: number;
  discountGiven30d: number;
}

/** Mirrors `CreateCatalogueOfferDto` (subset the web sends). */
export interface CreateOfferInput {
  name: string;
  description?: string;
  sourceProductId?: string;
  itemIds?: string[];
  /** Main gallery item; a video is stored as a marked URL string (no API video field). */
  mainImage?: string;
  /** The four additional gallery slots, also as plain URL strings. */
  galleryImages?: string[];
  quantity?: number;
  pricingType: OfferPricingType;
  discountValue?: number;
  fixedPrice?: number;
  /** Buy More, Save More: percentage discount that applies at each quantity level. */
  tiers?: { minQuantity: number; discountValue: number }[];
  branchId: string;
  /** Publish at several branches at once: one offer each, sharing a `dealGroupId`. */
  branchIds?: string[];
  startDate?: string;
  endDate?: string;
  offerType?: string;
  terms?: string[];
  claimSteps?: string[];
  maxClaimsPerCustomer?: number;
  /** Window `maxClaimsPerCustomer` is counted over (API default: lifetime). */
  claimLimitPeriod?: 'lifetime' | 'day' | 'week' | 'month';
  minOrderAmount?: number;
  autoPauseWhenSoldOut?: boolean;
  allowGifting?: boolean;
  requireGiftRecipientVerification?: boolean;
  socialSharingBonus?: boolean;
  redemptionChannels?: ('dine_in' | 'takeout' | 'reservation')[];
  redemptionWindows?: { weekdays: number[]; start: string; end: string }[];
}

const asList = <T>(res: T[] | { data: T[] }) => (Array.isArray(res) ? res : res.data ?? []);

/** `GET /catalogue/offers/groups/:dealGroupId/stats`: one deal across its branches. */
export interface DealGroupStats {
  dealGroupId?: string | null;
  name: string;
  status: string;
  views?: number | null;
  likes?: number | null;
  saves?: number | null;
  claims?: number | null;
  redeemed?: number | null;
  expired?: number | null;
  activeUnclaimed?: number | null;
  /** 0–1. */
  redemptionRate?: number | string | null;
  revenue?: number | string | null;
  discountGiven?: number | string | null;
  quantity?: number | null;
  remaining?: number | null;
  daysLeft?: number | null;
  series?: { date: string; claims?: number | null; redeemed?: number | null }[] | null;
  byBranch?: { offerId: string; branchId: string; branchName?: string | null; status: string; claims?: number | null; redeemed?: number | null; revenue?: number | string | null }[] | null;
}

/** `GET /catalogue/offers/groups/:id/branch-pricing` — one row per branch of the deal. */
export interface OfferGroupBranchPricing {
  dealGroupId: string;
  name: string;
  pricingType: OfferPricingType;
  branches: {
    offerId: string;
    branchId: string;
    branchName: string | null;
    isActive: boolean;
    fixedPrice: number | null;
    discountValue: number | null;
    calculatedPrice: number;
    quantity: number | null;
    claimedCount: number;
    redeemedCount: number;
  }[];
}

export interface SetOfferGroupBranchPricingInput {
  branches: { branchId: string; isActive: boolean; fixedPrice?: number; discountValue?: number; quantity?: number }[];
}

/** `GET /catalogue/offers/groups/:id/price-history` row (newest first). */
export interface OfferPriceChange {
  id: string;
  dealGroupId: string;
  offerId: string;
  branchId: string;
  branchName: string | null;
  oldPrice: number | string;
  newPrice: number | string;
  changedById: string | null;
  createdAt: string;
}

export const offersService = {
  groupBranchPricing: (dealGroupId: string) =>
    api.get<OfferGroupBranchPricing>(`/catalogue/offers/groups/${dealGroupId}/branch-pricing`),
  setGroupBranchPricing: (dealGroupId: string, input: SetOfferGroupBranchPricingInput) =>
    api.put<OfferGroupBranchPricing>(`/catalogue/offers/groups/${dealGroupId}/branch-pricing`, input),
  priceHistory: (dealGroupId: string) =>
    api.get<OfferPriceChange[]>(`/catalogue/offers/groups/${dealGroupId}/price-history`),
  groupStats: (dealGroupId: string) => api.get<DealGroupStats>(`/catalogue/offers/groups/${dealGroupId}/stats`),
  /** Applies the same edit to every branch of a deal. */
  updateGroup: (dealGroupId: string, input: Partial<Omit<CreateOfferInput, 'branchId'>> & { status?: 'active' | 'inactive' }) =>
    api.patch<unknown>(`/catalogue/offers/groups/${dealGroupId}`, input),
  setGroupStatus: (dealGroupId: string, status: 'active' | 'inactive') => api.patch<unknown>(`/catalogue/offers/groups/${dealGroupId}/status`, { status }),
  list: (branchId?: string) =>
    api.get<BusinessOffer[] | { data: BusinessOffer[] }>('/catalogue/offers/admin', { params: { branchId, limit: 100 } }).then(asList),
  summary: (branchId?: string) => api.get<OfferSummary>('/catalogue/offers/summary', { params: { branchId } }),
  create: (input: CreateOfferInput) => api.post<BusinessOffer>('/catalogue/offers', input),
  update: (id: string, input: Partial<CreateOfferInput> & { status?: 'active' | 'inactive' }) =>
    api.patch<BusinessOffer>(`/catalogue/offers/${id}`, input),
  remove: (id: string) => api.del<unknown>(`/catalogue/offers/${id}`),
};

// ---------------------------------------------------------------------------
// Deal Studio → offer
// ---------------------------------------------------------------------------

const WEEKDAY: Record<keyof DealStudioDraft['days'], number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/** "12:00 PM" / "17:30" → "12:00" / "17:30"; undefined when unreadable. */
export function toHhMm(value: string): string | undefined {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(value);
  if (!match) return undefined;
  let hours = Number(match[1]) % 12;
  if (!match[3]) hours = Number(match[1]);
  else if (match[3].toUpperCase() === 'PM') hours += 12;
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}

/** Every selected live product is linked to the deal; no synthetic ids survive. */
function dealItemIds(studio: DealStudioDraft, sourceId: string, catalog?: ComboProduct[]) {
  const known = catalog ? new Set(catalog.map((product) => product.id)) : null;
  const ids = studio.productIds.filter((id) => id && id !== 'current' && (!known || known.has(id)));
  return [...new Set(ids.length ? ids : [sourceId])];
}

/** The deal for the selected live products, built from the Deal Studio settings. */
export function studioToOfferInput(
  studio: DealStudioDraft,
  source: { itemId: string; name: string; basePrice: number; mainImage?: string | null },
  branchId: string,
  options: { branchIds?: string[]; catalog?: ComboProduct[] } = {},
): CreateOfferInput {
  const { start, end } = dealValidityRange(studio);
  const catalog = options.catalog ?? [];
  const structure = studio.structure ?? structureForStrategy(studio.strategy);
  const regularTotal = selectedRegularTotal(studio, catalog) || source.basePrice;
  const pricing = resolveDealPricing(studio, regularTotal, catalog);

  let pricingType: OfferPricingType = 'percentage_discount';
  let discountValue: number | undefined;
  let fixedPrice: number | undefined;
  let tiers: { minQuantity: number; discountValue: number }[] | undefined;

  switch (structure) {
    case 'bundle':
      pricingType = 'fixed_discount_price';
      fixedPrice = Math.round(pricing.dealPrice);
      break;
    case 'price-slash':
      if (studio.priceSlash.mode === 'percentage') {
        pricingType = 'percentage_discount';
        discountValue = studio.priceSlash.discountPct;
      } else {
        pricingType = 'fixed_discount_price';
        fixedPrice = Math.round(studio.priceSlash.newPrice);
      }
      break;
    case 'buy-more-save-more': {
      pricingType = 'tiered';
      tiers = [...studio.quantityTiers]
        .sort((a, b) => a.quantity - b.quantity)
        .map((tier) => ({
          minQuantity: tier.quantity,
          // The API stores a percentage at each quantity level; derive it from
          // the exact total price the merchant entered so checkout maths agrees.
          discountValue:
            regularTotal > 0
              ? Math.max(0, Math.min(100, Math.round((1 - tier.price / (regularTotal * tier.quantity)) * 100)))
              : 0,
        }));
      break;
    }
    case undefined:
      // Legacy "keep current catalogue price" deals use a fixed price.
      pricingType = 'fixed_discount_price';
      fixedPrice = Math.round(regularTotal);
      break;
    default:
      // Legacy onboarding strategies still resolve through the shared maths.
      if (studio.strategy === 'fixed') {
        pricingType = 'fixed_discount_amount';
        discountValue = studio.fixed.amountOff;
      } else if (studio.strategy === 'tiered') {
        pricingType = 'percentage_discount';
        discountValue = studio.flash.discountPct;
      } else if (studio.strategy === 'combo') {
        pricingType = 'fixed_discount_price';
        fixedPrice = Math.round(pricing.dealPrice);
      } else {
        discountValue = studio.discountPct;
      }
  }

  const name = studio.title.trim() || source.name;
  const weekdays = (Object.keys(studio.days) as (keyof DealStudioDraft['days'])[]).filter((d) => studio.days[d]).map((d) => WEEKDAY[d]);
  const startTime = toHhMm(studio.redeemStart);
  const endTime = toHhMm(studio.redeemEnd);
  const channels = [
    ...(studio.dineIn ? (['dine_in'] as const) : []),
    ...(studio.pickup ? (['takeout'] as const) : []),
    ...(studio.reservation ? (['reservation'] as const) : []),
  ];
  const terms = [
    ...studio.terms.filter(Boolean),
    ...(studio.freeDelivery ? ['Free delivery included'] : []),
  ];

  return {
    name,
    description: studio.description.trim() || name,
    sourceProductId: source.itemId,
    itemIds: dealItemIds(studio, source.itemId, catalog),
    // The deal cover comes from the mandatory Deal Gallery, never from the
    // source product's photo.
    mainImage: mainDealMedia(studio)?.url ?? undefined,
    galleryImages: dealGalleryUrls(studio).length ? dealGalleryUrls(studio) : undefined,
    quantity: studio.vouchers || undefined,
    pricingType,
    discountValue,
    fixedPrice,
    tiers,
    branchId,
    ...(options.branchIds && options.branchIds.length > 1 ? { branchIds: options.branchIds } : {}),
    startDate: start.toISOString(),
    endDate: end?.toISOString(),
    offerType: isCurrentPriceDeal(studio) ? 'Current price' : 'discount',
    terms,
    claimSteps: studio.claimSteps.filter(Boolean).slice(0, 10),
    maxClaimsPerCustomer: studio.claimOnce ? 1 : studio.unlimitedClaims ? undefined : studio.maxClaims,
    claimLimitPeriod: claimLimitPeriod(studio),
    autoPauseWhenSoldOut: studio.autoPause,
    allowGifting: studio.gifting,
    requireGiftRecipientVerification: studio.otpVerify,
    socialSharingBonus: studio.socialBonus,
    redemptionChannels: channels.length ? [...channels] : undefined,
    redemptionWindows:
      !studio.redeemAllDay && startTime && endTime ? [{ weekdays: weekdays.length === 7 ? [] : weekdays, start: startTime, end: endTime }] : undefined,
  };
}
