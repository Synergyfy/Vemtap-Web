import { useEffect, useMemo, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { useLocationQuery } from '../context/LocationContext';
import { useDiscoverBusinesses } from './useDiscoverBusinesses';
import { realOfferId } from '../utils/homeOffer';

type Offer = Record<string, unknown>;

interface HomeOffers {
  nearby: Offer[];
  nearbyTotal: number;
  featured: Offer[];
  trending: Offer[];
  popular: Offer[];
}

const EMPTY: HomeOffers = { nearby: [], nearbyTotal: 0, featured: [], trending: [], popular: [] };

/**
 * Everything the customer home shows (desktop and mobile views), each section
 * from its own live source: `GET /catalogue/offers/public` sorted by `featured`,
 * `trending` and `popular`, the nearby feed, and live businesses. A section that
 * fails stays empty without taking the others down.
 */
export function useHomeFeed(categoryId: string | null) {
  const locationQuery = useLocationQuery();
  const [offers, setOffers] = useState<HomeOffers>(EMPTY);
  const [offersLoading, setOffersLoading] = useState(() => hasApiConfig());
  const directory = useDiscoverBusinesses({ categoryId, search: '' });

  useEffect(() => {
    let ignore = false;
    if (!hasApiConfig()) {
      setOffers(EMPTY);
      setOffersLoading(false);
      return;
    }
    const base = { ...locationQuery, page: 1, categoryId: categoryId ?? undefined };
    const load = (params: Record<string, string | number | undefined>) =>
      catalogueService.getPublicOffers({ ...base, ...params }).catch(() => null);
    const rows = (response: unknown): Offer[] => {
      const data = (response as { data?: unknown } | null)?.data;
      return Array.isArray(data) ? (data as Offer[]) : [];
    };
    setOffersLoading(true);
    Promise.all([load({ limit: 8 }), load({ limit: 3, sortBy: 'featured' }), load({ limit: 3, sortBy: 'trending' }), load({ limit: 2, sortBy: 'popular' })])
      .then(([nearby, featured, trending, popular]) => {
        if (ignore) return;
        const total = Number((nearby as { total?: unknown } | null)?.total);
        setOffers({
          nearby: rows(nearby),
          nearbyTotal: Number.isFinite(total) ? total : rows(nearby).length,
          featured: rows(featured),
          trending: rows(trending),
          popular: rows(popular),
        });
      })
      .finally(() => {
        if (!ignore) setOffersLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [locationQuery, categoryId]);

  /** Every offer on the page, for loading like states once per deal. */
  const offerIds = useMemo(
    () => [...new Set([...offers.nearby, ...offers.featured, ...offers.trending, ...offers.popular].map(realOfferId).filter((id): id is string => Boolean(id)))],
    [offers],
  );

  return { ...offers, businesses: directory.businesses, offerIds, offersLoading, businessesLoading: directory.loading };
}
