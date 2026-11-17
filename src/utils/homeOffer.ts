import { dealPrimaryImage } from './dealImages';

/**
 * Honest field readers for public offers on the customer home (desktop and
 * mobile views). Each one returns what the API actually sent, or a neutral
 * label — never an invented rating, count, perk or stock photo.
 */

export type OfferRecord = Record<string, unknown>;

/** Neutral stand-in when a live offer has no photo, instead of a stock image. */
export const NO_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23eef0f4'/></svg>";

export const asRecord = (value: unknown): OfferRecord =>
  value && typeof value === 'object' ? (value as OfferRecord) : {};

export const firstString = (...values: unknown[]): string | undefined =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The offer's real backend id, or undefined (so likes never hit the API with a made-up key). */
export const realOfferId = (offer: OfferRecord): string | undefined => {
  const id = offer.id ?? offer.offerId;
  return typeof id === 'string' && UUID.test(id) ? id : undefined;
};

/** The deal's own photo first, then an item photo, then the business logo (shared with the detail page). */
export const offerImage = (offer: OfferRecord): string => dealPrimaryImage(offer) ?? NO_IMAGE;

/** "Ends 30 Oct" from the offer's end date; "Ongoing" when it has none. */
export const offerEndsLabel = (offer: OfferRecord): string => {
  if (typeof offer.ends === 'string' && offer.ends.trim()) return offer.ends;
  const end = offer.endDate ?? offer.expiresAt;
  const date = typeof end === 'string' || typeof end === 'number' ? new Date(end) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Ongoing';
  return `Ends ${date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`;
};

/** Where the offer is: its distance when the API sends one, else the business's city. */
export const offerLocationLabel = (offer: OfferRecord): string => {
  const business = asRecord(offer.business);
  return firstString(offer.distance, offer.location, business.city, offer.city) ?? 'Nearby';
};

export const isVerifiedOffer = (offer: OfferRecord): boolean => {
  const business = asRecord(offer.business);
  return Boolean(business.isVerified ?? business.verified ?? offer.isVerified ?? offer.verified);
};

/** "20% OFF" from the offer's own percentage; "Live Deal" when it has none. */
export const offerDiscountLabel = (offer: OfferRecord): string => {
  const percent = Number(offer.percentageOff ?? offer.discountPercent ?? 0);
  return Number.isFinite(percent) && percent > 0 ? `${Math.round(percent)}% OFF` : 'Live Deal';
};

/** The business's category name from the API, if any. */
export const offerCategoryLabel = (offer: OfferRecord): string | undefined =>
  firstString(offer.categoryName, asRecord(offer.business).categoryName);
