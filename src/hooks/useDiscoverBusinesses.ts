import { useEffect, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { formatDistanceKm, useLocationQuery } from '../context/LocationContext';
import { filterApiParams, matchesClientFilters, useDealFilters } from '../context/DealFiltersContext';
import { offerImage, type OfferRecord } from '../utils/homeOffer';

/** One Discover card — every field comes from the live API. */
export interface DiscoverBusiness {
  /** Public code for `GET /public/businesses/code/:code` (the business page). */
  code: string;
  id: string;
  name: string;
  category: string | null;
  image: string | null;
  logo: string | null;
  verified: boolean;
  location: string | null;
  dealCount: number;
  bestDiscount: number;
  productCount: number;
  serviceCount: number;
}

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const list = (payload: unknown, key: string): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const r = rec(payload);
  if (Array.isArray(r[key])) return r[key] as unknown[];
  if (Array.isArray(r.data)) return r.data as unknown[];
  return list(r.data && typeof r.data === 'object' ? r.data : [], key);
};

/**
 * Businesses for Discover (desktop + mobile): `GET /public/businesses` (active
 * businesses, nearest first, with product/service counts) merged with the live
 * deals feed (`GET /catalogue/offers/public`) for each business's deal count —
 * a business that only shows up through its public deals is listed too.
 */
export function useDiscoverBusinesses({ categoryId, search }: { categoryId: string | null; search: string }) {
  const locationQuery = useLocationQuery();
  const { filters: dealFilters, narrowed } = useDealFilters();
  const [businesses, setBusinesses] = useState<DiscoverBusiness[]>([]);
  const [loading, setLoading] = useState(() => hasApiConfig());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!hasApiConfig()) {
      setBusinesses([]);
      setLoading(false);
      return;
    }
    const { lat, lng, radius } = locationQuery as { lat?: number; lng?: number; radius?: number };
    const filters = { categoryId: categoryId ?? undefined, search: search || undefined };
    setLoading(true);
    setError(null);
    Promise.all([
      catalogueService.getPublicBusinesses({ ...filters, lat, lng, radius, limit: 24 }).then((r) => list(r, 'businesses')),
      catalogueService.getPublicOffers({ ...locationQuery, ...filterApiParams(dealFilters), ...filters, page: 1, limit: 50 }).then((r) => list(r, 'data')).catch(() => []),
    ])
      .then(([businessRows, offerRows]) => {
        if (ignore) return;
        const byKey = new Map<string, DiscoverBusiness>();
        for (const row of businessRows.map(rec)) {
          const code = str(row.uniqueCode) ?? str(row.slug);
          const name = str(row.name);
          if (!code || !name) continue;
          byKey.set(str(row.id) ?? code, {
            code,
            id: str(row.id) ?? '',
            name,
            category: str(row.categoryName),
            image: str(row.coverImage),
            logo: str(row.logoUrl),
            verified: row.isVerified === true,
            location: formatDistanceKm(row.distanceKm) ?? str(row.city),
            dealCount: 0,
            bestDiscount: 0,
            productCount: Number(row.productCount) || 0,
            serviceCount: Number(row.serviceCount) || 0,
          });
        }
        for (const offer of offerRows.map(rec) as OfferRecord[]) {
          if (!matchesClientFilters(offer, dealFilters)) continue;
          const b = rec(offer.business);
          const key = str(b.id) ?? str(b.uniqueCode);
          const code = str(b.uniqueCode) ?? str(b.slug);
          const name = str(b.name);
          if (!key || !code || !name) continue;
          const entry =
            byKey.get(key) ??
            {
              code,
              id: str(b.id) ?? '',
              name,
              category: str(b.categoryName) ?? str(offer.categoryName),
              image: null,
              logo: str(b.logo) ?? str(b.logoUrl),
              verified: b.isVerified === true,
              location: str(offer.distance) ?? str(b.city),
              dealCount: 0,
              bestDiscount: 0,
              productCount: 0,
              serviceCount: 0,
            };
          entry.dealCount += 1;
          entry.bestDiscount = Math.max(entry.bestDiscount, Number(offer.percentageOff ?? offer.discountPercent ?? 0) || 0);
          if (!entry.image) {
            const photo = offerImage(offer);
            if (!photo.startsWith('data:')) entry.image = photo;
          }
          byKey.set(key, entry);
        }
        // Deal filters are on: only businesses with a matching deal.
        setBusinesses([...byKey.values()].filter((business) => !narrowed || business.dealCount > 0));
      })
      .catch(() => {
        if (ignore) return;
        setBusinesses([]);
        setError('Businesses couldn’t be loaded. Please try again.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [locationQuery, categoryId, search, dealFilters, narrowed]);

  return { businesses, loading, error };
}
