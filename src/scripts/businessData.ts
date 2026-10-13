export type BusinessVenue = 'urban' | 'spa';

export interface BusinessProfileRef {
  slug: string;
  id: string;
  name: string;
  venue: BusinessVenue;
}

export const BUSINESSES: BusinessProfileRef[] = [
  { slug: 'urban-grill-bistro-104', id: '104', name: 'Urban Grill & Bistro', venue: 'urban' },
  { slug: 'glow-serenity-spa-219', id: '219', name: 'Glow & Serenity Spa', venue: 'spa' },
];

export const URBAN_BUSINESS = BUSINESSES[0];
export const SPA_BUSINESS = BUSINESSES[1];

export const LEGACY_BUSINESS_PATHS: Record<string, string> = {
  '/business/urban-grill': URBAN_BUSINESS.slug,
  '/business/glow-serenity': SPA_BUSINESS.slug,
};

export const businessPath = (business: BusinessProfileRef) => `/business/${business.slug}`;

export const businessSubPath = (business: BusinessProfileRef, section: string) =>
  `/business/${business.slug}/${section}`;

export const productPath = (businessSlug: string, productId: string) =>
  `/business/${businessSlug}/products/${productId}`;

export const servicePath = (businessSlug: string, serviceSlug: string) =>
  `/business/${businessSlug}/services/${serviceSlug}`;

export function findBusinessBySlug(slug: string): BusinessProfileRef | undefined {
  return BUSINESSES.find((business) => business.slug === slug);
}

/** Resolves any /business/... path (current slug, legacy slug, or sub-page) to a business + section. */
export function resolveBusinessPath(path: string): {
  business: BusinessProfileRef;
  section: string;
  productId?: string;
  serviceSlug?: string;
} | null {
  if (!path.startsWith('/business/')) return null;

  const parts = path.slice('/business/'.length).split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const rawSlug = decodeURIComponent(parts[0]);
  const slug = LEGACY_BUSINESS_PATHS[`/business/${rawSlug}`]?.replace('/business/', '') ?? rawSlug;
  const business = findBusinessBySlug(slug);
  if (!business) return null;

  const section = parts[1] ?? '';
  if (section === 'products' && parts[2]) {
    return { business, section, productId: decodeURIComponent(parts[2]) };
  }
  if (section === 'services' && parts[2]) {
    return { business, section, serviceSlug: decodeURIComponent(parts[2]) };
  }
  if (section === 'booking' && parts[2]) {
    return { business, section: `booking/${parts[2]}` };
  }
  return { business, section };
}
