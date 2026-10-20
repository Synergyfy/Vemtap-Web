import { api } from './api/client';
import type { DealDuration, DealStudioDraft } from '../scripts/deals/dealStudioShared';
import { resolveDealPricing } from '../scripts/deals/dealStudioShared';

export type OfferPricingType = 'sum' | 'percentage_discount' | 'fixed_discount_price' | 'fixed_discount_amount';

/** `GET /catalogue/offers/admin` row — only the fields the web uses. */
export interface BusinessOffer {
  id: string;
  dealGroupId?: string | null;
  name: string;
  description?: string | null;
  mainImage?: string | null;
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
  mainImage?: string;
  quantity?: number;
  pricingType: OfferPricingType;
  discountValue?: number;
  fixedPrice?: number;
  branchId: string;
  startDate?: string;
  endDate?: string;
  offerType?: string;
  terms?: string[];
  claimSteps?: string[];
  maxClaimsPerCustomer?: number;
  minOrderAmount?: number;
  autoPauseWhenSoldOut?: boolean;
  allowGifting?: boolean;
  requireGiftRecipientVerification?: boolean;
  socialSharingBonus?: boolean;
  redemptionChannels?: ('dine_in' | 'takeout' | 'reservation')[];
  redemptionWindows?: { weekdays: number[]; start: string; end: string }[];
}

const asList = <T>(res: T[] | { data: T[] }) => (Array.isArray(res) ? res : res.data ?? []);

export const offersService = {
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

const DURATION_DAYS: Record<DealDuration, number | null> = {
  '7-days': 7,
  '14-days': 14,
  '30-days': 30,
  '3-months': 91,
  '6-months': 182,
  forever: null,
};

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

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 0);
  return copy;
};

/** The deal for one catalogue item, built from the Deal Studio settings. */
export function studioToOfferInput(
  studio: DealStudioDraft,
  source: { itemId: string; name: string; basePrice: number; mainImage?: string | null },
  branchId: string,
): CreateOfferInput {
  const start = studio.strategy === 'tiered' && studio.flash.startDate ? new Date(`${studio.flash.startDate}T00:00:00`) : new Date();
  const days = DURATION_DAYS[studio.duration];
  const end =
    studio.strategy === 'tiered' && studio.flash.endDate
      ? endOfDay(new Date(`${studio.flash.endDate}T00:00:00`))
      : days === null
        ? undefined
        : endOfDay(new Date(start.getTime() + days * 86_400_000));

  const pricing = resolveDealPricing(studio, source.basePrice);
  let pricingType: OfferPricingType = 'percentage_discount';
  let discountValue: number | undefined;
  let fixedPrice: number | undefined;
  let minOrderAmount: number | undefined;
  let name = source.name;
  switch (studio.strategy) {
    case 'fixed':
      pricingType = 'fixed_discount_amount';
      discountValue = studio.fixed.amountOff;
      minOrderAmount = studio.fixed.minSpend || undefined;
      name = `₦${studio.fixed.amountOff.toLocaleString('en-NG')} off ${source.name}`;
      break;
    case 'combo':
      pricingType = 'fixed_discount_price';
      fixedPrice = Math.round(pricing.dealPrice);
      name = `${source.name} combo`;
      break;
    case 'tiered':
      discountValue = studio.flash.discountPct;
      name = `${studio.flash.discountPct}% off ${source.name} (happy hour)`;
      break;
    default:
      discountValue = studio.discountPct;
      name = `${studio.discountPct}% off ${source.name}`;
  }

  const weekdays = (Object.keys(studio.days) as (keyof DealStudioDraft['days'])[]).filter((d) => studio.days[d]).map((d) => WEEKDAY[d]);
  const startTime = toHhMm(studio.redeemStart);
  const endTime = toHhMm(studio.redeemEnd);
  const channels = [
    ...(studio.dineIn ? (['dine_in'] as const) : []),
    ...(studio.pickup ? (['takeout'] as const) : []),
    ...(studio.reservation ? (['reservation'] as const) : []),
  ];

  return {
    name,
    description: studio.terms[0] ?? name,
    sourceProductId: source.itemId,
    itemIds: [source.itemId],
    mainImage: source.mainImage ?? undefined,
    quantity: studio.vouchers || undefined,
    pricingType,
    discountValue,
    fixedPrice,
    minOrderAmount,
    branchId,
    startDate: start.toISOString(),
    endDate: end?.toISOString(),
    offerType: 'discount',
    terms: studio.terms.filter(Boolean),
    claimSteps: studio.claimSteps.filter(Boolean).slice(0, 10),
    maxClaimsPerCustomer: studio.claimOnce ? 1 : studio.unlimitedClaims ? undefined : studio.maxClaims,
    autoPauseWhenSoldOut: studio.autoPause,
    allowGifting: studio.gifting,
    requireGiftRecipientVerification: studio.otpVerify,
    socialSharingBonus: studio.socialBonus,
    redemptionChannels: channels.length ? [...channels] : undefined,
    redemptionWindows:
      !studio.redeemAllDay && startTime && endTime ? [{ weekdays: weekdays.length === 7 ? [] : weekdays, start: startTime, end: endTime }] : undefined,
  };
}
