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
