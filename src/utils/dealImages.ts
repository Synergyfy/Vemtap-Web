/**
 * One rule for which photo a deal shows, so a deal card and its detail page
 * always agree: the deal's own photo, then its gallery, then its items'
 * photos — the business logo only when the deal has no photo at all.
 * Gallery video URLs are skipped so they never render as broken images.
 */

import { isVideoMediaUrl } from '../scripts/deals/dealStudioShared';

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const imageUrl = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  const image = asRecord(value);
  for (const key of ['url', 'src', 'secureUrl', 'imageUrl']) {
    const url = image[key];
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  return null;
};

const imageUrls = (value: unknown): string[] => asList(value).flatMap((entry) => {
  const url = imageUrl(entry);
  return url ? [url] : [];
});

/** Every photo of the deal in display order, without duplicates (empty when it has none). */
export function dealImageList(offer: unknown): string[] {
  const deal = asRecord(offer);
  const items = asList(deal.items).map(asRecord);
  const candidates = [
    deal.mainImage,
    deal.image,
    deal.coverImage,
    ...imageUrls(deal.images),
    ...imageUrls(deal.galleryImages),
    ...imageUrls(deal.photos),
    ...imageUrls(deal.media),
    ...items.flatMap((item) => [
      item.mainImage,
      item.image,
      item.mediaUrl,
      ...imageUrls(item.images),
      ...imageUrls(item.galleryImages),
    ]),
  ];
  return [...new Set(candidates.flatMap((candidate) => {
    const url = imageUrl(candidate);
    // Gallery videos are stored as URLs. Never hand one to an <img>; it
    // would render as a broken photo on deal cards and detail pages.
    return url && !isVideoMediaUrl(url) ? [url] : [];
  }))];
}

/** A single image URL safe for an <img>; gallery video URLs become undefined. */
export function safeDealImageUrl(value: unknown): string | undefined {
  const url = imageUrl(value);
  return url && !isVideoMediaUrl(url) ? url : undefined;
}

/** The business's logo or cover, for deals with no photo of their own. */
export function dealBusinessImage(offer: unknown): string | undefined {
  const business = asRecord(asRecord(offer).business);
  return [business.logo, business.logoUrl, business.image, business.coverImage]
    .map(safeDealImageUrl)
    .find((url): url is string => Boolean(url));
}

/** The photo a deal card and the detail hero show. */
export function dealPrimaryImage(offer: unknown): string | undefined {
  return dealImageList(offer)[0] ?? dealBusinessImage(offer);
}
