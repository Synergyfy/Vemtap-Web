import type { DiscoverBusiness } from '../hooks/useDiscoverBusinesses';

/** One Discover card. Every value comes from the live API; optional fields are hidden when the API has none. */
export interface BusinessCard {
  name: string;
  kind: string;
  badge: string;
  badgeIcon: string;
  rating?: string;
  reviews?: string;
  distance: string;
  deals: string;
  image: string;
  alt: string;
  venue?: 'urban' | 'spa';
  /** Public business code (`uniqueCode`) — opens the business page. */
  code: string;
  slug?: string;
  id?: string;
}

/** Neutral stand-in when a business has no cover, logo or deal photo (never a stock photo). */
const NO_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23e1e8fd'/></svg>";

/** Maps a live Discover business (see useDiscoverBusinesses) onto the card the Discover screens render. */
export const toDiscoverCard = (business: DiscoverBusiness): BusinessCard => {
  const offerings = [
    business.productCount ? `${business.productCount} product${business.productCount === 1 ? '' : 's'}` : null,
    business.serviceCount ? `${business.serviceCount} service${business.serviceCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean).join(' • ');
  return {
    name: business.name,
    kind: [business.category, offerings].filter(Boolean).join(' • ') || 'Local business',
    badge: business.verified ? 'Verified Partner' : '',
    badgeIcon: 'verified',
    distance: business.location ?? '',
    deals: business.dealCount > 0
      ? `${business.dealCount} Active Deal${business.dealCount === 1 ? '' : 's'}${business.bestDiscount > 0 ? ` (up to ${Math.round(business.bestDiscount)}% off)` : ''}`
      : 'No live deals right now',
    image: business.image ?? business.logo ?? NO_IMAGE,
    alt: business.name,
    code: business.code,
    slug: business.code,
    id: business.id,
  };
};
