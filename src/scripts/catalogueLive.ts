import { toPrice, type CatalogueItem } from '../services/catalogueItemsService';
import type { BusinessOffer } from '../services/offersService';
import { naira } from './catalogueData';

/**
 * Display values for live catalogue items, shared by the catalogue screens so
 * each one maps a real item into its own row shape the same way.
 */

export const itemPriceLabel = (item: CatalogueItem) => naira(toPrice(item.price ?? undefined) ?? 0);

/** The "was" price, only when it is really higher than the selling price. */
export const itemComparePriceLabel = (item: CatalogueItem) => {
  const was = toPrice(item.compareAtPrice ?? undefined);
  const now = toPrice(item.price ?? undefined) ?? 0;
  return was && was > now ? naira(was) : undefined;
};

export const isItemActive = (item: CatalogueItem) =>
  (item.status === 'active' || item.status === 'published') && !item.isSuspended;

export const isService = (item: CatalogueItem) => item.itemType === 'service';

/** At or below the item's own low-stock threshold (products that track stock only). */
export const isLowStock = (item: CatalogueItem) =>
  !isService(item) &&
  typeof item.stockQuantity === 'number' &&
  item.stockQuantity <= (item.minStock ?? 0);

export const stockLabel = (item: CatalogueItem) => {
  if (isService(item)) return item.duration || 'Bookable service';
  if (typeof item.stockQuantity !== 'number') return 'Stock not tracked';
  if (item.stockQuantity <= 0) return 'Out of stock';
  return isLowStock(item) ? `Low stock • ${item.stockQuantity} left` : `${item.stockQuantity} in stock`;
};

/** "Available at 2/3 branches" from the item's branch links. */
export const availabilityLabel = (item: CatalogueItem, branchCount: number) => {
  const at = (item.branches ?? []).filter((branch) => branch.isActive !== false).length;
  if (!branchCount) return at ? `Available at ${at} branch${at === 1 ? '' : 'es'}` : 'Not assigned to a branch';
  if (at >= branchCount) return 'Available at all locations';
  return `Available at ${at}/${branchCount} branches`;
};

/** The active deal running on this item, if any. */
export const activeDealFor = (item: CatalogueItem, offers: BusinessOffer[]) =>
  offers.find((offer) => offer.status === 'active' && (offer.itemIds ?? []).includes(item.id));

/** "20% OFF" / "₦5,000 deal price" for a deal badge. */
export const dealBadgeLabel = (offer: BusinessOffer) => {
  if (offer.pricingType === 'percentage_discount' && offer.discountValue) return `${offer.discountValue}% OFF`;
  const price = offer.calculatedPrice ?? offer.fixedPrice;
  return price ? `${naira(Number(price))} deal price` : 'Deal active';
};

/** Which deals tab an offer belongs on: paused deals stay with the active ones. */
export const offerSlot = (offer: BusinessOffer, now = Date.now()): 'active' | 'scheduled' | 'expired' => {
  if (offer.endDate && new Date(offer.endDate).getTime() < now) return 'expired';
  if (offer.startDate && new Date(offer.startDate).getTime() > now) return 'scheduled';
  return 'active';
};

export const isOfferPaused = (offer: BusinessOffer) => offer.status !== 'active';

const shortDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/** "Ends Sun 20 Oct" / "Starts Mon 4 Nov" / "Ended Fri 1 Nov" / "No end date". */
export const offerScheduleLabel = (offer: BusinessOffer, now = Date.now()) => {
  const slot = offerSlot(offer, now);
  if (slot === 'scheduled' && offer.startDate) return `Starts ${shortDay(offer.startDate)}`;
  if (slot === 'expired' && offer.endDate) return `Ended ${shortDay(offer.endDate)}`;
  return offer.endDate ? `Ends ${shortDay(offer.endDate)}` : 'No end date';
};

export const offerPriceLabel = (offer: BusinessOffer) => {
  const price = offer.calculatedPrice ?? offer.fixedPrice;
  return price != null ? naira(Number(price)) : '—';
};

export const offerComparePriceLabel = (offer: BusinessOffer) => {
  const was = offer.originalPrice;
  const now = offer.calculatedPrice ?? offer.fixedPrice;
  return was != null && now != null && Number(was) > Number(now) ? naira(Number(was)) : '';
};

/** Claims, redemptions and the redemption rate (0–100) of one offer. */
export const offerClaimStats = (offer: BusinessOffer) => {
  const claims = offer.claimedCount ?? 0;
  const redeemed = offer.redeemedCount ?? 0;
  return { claims, redeemed, unredeemed: Math.max(claims - redeemed, 0), rate: claims ? Math.round((redeemed / claims) * 100) : 0 };
};

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Mon – Fri · 12:00 – 17:00" from an offer's redemption windows. */
export const redemptionWindowLabel = (offer: BusinessOffer) => {
  const windows = offer.redemptionWindows ?? [];
  if (!windows.length) return 'Any time the deal is live';
  return windows
    .map((window) => {
      const days = [...window.weekdays].sort((a, b) => a - b);
      const consecutive = days.every((day, index) => index === 0 || day === days[index - 1] + 1);
      const dayLabel =
        days.length === 7
          ? 'Every day'
          : consecutive && days.length > 2
            ? `${WEEKDAY_SHORT[days[0]]} – ${WEEKDAY_SHORT[days[days.length - 1]]}`
            : days.map((day) => WEEKDAY_SHORT[day]).join(', ');
      return `${dayLabel} · ${window.start} – ${window.end}`;
    })
    .join('; ');
};

const PRICING_TYPE_LABEL: Record<string, string> = {
  percentage_discount: 'Percentage Off',
  fixed_discount_price: 'Fixed Deal Price',
  fixed_discount_amount: 'Amount Off',
  sum: 'Bundle Price',
};

export const pricingTypeLabel = (offer: BusinessOffer) => PRICING_TYPE_LABEL[offer.pricingType] ?? 'Deal Price';
