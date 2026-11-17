import { hasApiConfig } from '../../services/api/client';

/** Neutral tile while the live item has no photo. */
export const NO_ITEM_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

/** The item's own photo; without one, a neutral tile live and the sample in demo mode. */
export const draftImage = (image: string | null | undefined, sample: string) =>
  image || (hasApiConfig() ? NO_ITEM_IMAGE : sample);

/** Live: alt text from the item's name; demo keeps the sample description. */
export const draftImageAlt = (name: string | null | undefined, sample: string) =>
  hasApiConfig() ? name?.trim() || 'Item photo' : sample;
