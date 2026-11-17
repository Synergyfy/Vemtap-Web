/**
 * One rule for which photo a deal shows, so a deal card and its detail page
 * always agree: the deal's own photo, then its gallery, then its items'
 * photos — the business logo only when the deal has no photo at all.
 */

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const isImage = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Every photo of the deal in display order, without duplicates (empty when it has none). */
export function dealImageList(offer: unknown): string[] {
  const deal = asRecord(offer);
  const items = asList(deal.items).map(asRecord);
  const candidates = [
    deal.mainImage,
    deal.image,
    deal.coverImage,
    ...asList(deal.galleryImages),
    ...items.flatMap((item) => [item.mainImage, item.image, item.mediaUrl, ...asList(item.galleryImages)]),
  ];
  return [...new Set(candidates.filter(isImage).map((value) => value.trim()))];
}

/** The business's logo or cover, for deals with no photo of their own. */
export function dealBusinessImage(offer: unknown): string | undefined {
  const business = asRecord(asRecord(offer).business);
  return [business.logo, business.logoUrl, business.image, business.coverImage].find(isImage);
}

/** The photo a deal card and the detail hero show. */
export function dealPrimaryImage(offer: unknown): string | undefined {
  return dealImageList(offer)[0] ?? dealBusinessImage(offer);
}
