export type BusinessVenue = 'urban' | 'spa';

export interface BusinessProfileRef {
  slug: string;
  id: string;
  name: string;
  venue: BusinessVenue;
}

export const BUSINESSES: BusinessProfileRef[] = [];

export const URBAN_BUSINESS: BusinessProfileRef = {
  slug: '',
  id: '',
  name: 'Your business',
  venue: 'urban',
};

export const SPA_BUSINESS: BusinessProfileRef = {
  slug: '',
  id: '',
  name: 'Your spa',
  venue: 'spa',
};

export const LEGACY_BUSINESS_PATHS: Record<string, string> = {};

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

/** Resolves public business paths and the short `/b/:code` links embedded in business QR codes. */
export function resolveBusinessPath(path: string): {
  business: BusinessProfileRef;
  section: string;
  productId?: string;
  serviceSlug?: string;
} | null {
  const url = new URL(path, 'https://vemtap.local');
  const shortLink = url.pathname.startsWith('/b/');
  if (!shortLink && !url.pathname.startsWith('/business/')) return null;

  const parts = shortLink
    ? url.pathname.slice('/b/'.length).split('/').filter(Boolean)
    : url.pathname.slice('/business/'.length).split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const rawSlug = decodeURIComponent(parts[0]);
  const migratedSlug = LEGACY_BUSINESS_PATHS[`/business/${rawSlug}`]?.replace('/business/', '');
  // Live businesses are not in a bundled list: an unknown slug is the business's public code,
  // which the business page loads from `GET /public/businesses/code/:code`.
  const business = findBusinessBySlug(migratedSlug ?? rawSlug) ?? { slug: rawSlug, id: '', name: '', venue: 'urban' as const };

  const section = shortLink ? 'products' : parts[1] ?? '';
  if (section === 'products' && (parts[2] || url.searchParams.get('product'))) {
    return { business, section, productId: decodeURIComponent(parts[2] ?? url.searchParams.get('product') ?? '') };
  }
  if (section === 'services' && parts[2]) {
    return { business, section, serviceSlug: decodeURIComponent(parts[2]) };
  }
  if (section === 'booking' && parts[2]) {
    return { business, section: `booking/${parts[2]}` };
  }
  return { business, section };
}
