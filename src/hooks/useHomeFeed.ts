import { useEffect, useMemo, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { useLocationQuery } from '../context/LocationContext';
import { filterApiParams, hasClientFilters, matchesClientFilters, useDealFilters } from '../context/DealFiltersContext';
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
export function useHomeFeed() {
  const { filters } = useDealFilters();
  const categoryId = filters.categoryId;
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
    const base = { ...locationQuery, ...filterApiParams(filters), page: 1 };
    const clientSide = hasClientFilters(filters);
    // Timing filters run here on the offers' dates, so read a wider page for them.
    const load = (params: { limit: number; sortBy?: string }) =>
      catalogueService
        .getPublicOffers({ ...base, ...params, limit: clientSide ? 50 : params.limit })
        .then((response) => ({ response, limit: params.limit }))
        .catch(() => null);
    const rows = (result: { response: unknown; limit: number } | null): Offer[] => {
      const data = (result?.response as { data?: unknown } | undefined)?.data;
      const list = Array.isArray(data) ? (data as Offer[]) : [];
      return clientSide ? list.filter((offer) => matchesClientFilters(offer, filters)).slice(0, result?.limit) : list;
    };
    setOffersLoading(true);
    Promise.all([load({ limit: 8 }), load({ limit: 3, sortBy: 'featured' }), load({ limit: 3, sortBy: 'trending' }), load({ limit: 2, sortBy: 'popular' })])
      .then(([nearby, featured, trending, popular]) => {
        if (ignore) return;
        const total = clientSide ? NaN : Number((nearby?.response as { total?: unknown } | undefined)?.total);
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
    // `filters` is a stable state object: it only changes when the customer applies filters.
  }, [locationQuery, filters]);

  /** Every offer on the page, for loading like states once per deal. */
  const offerIds = useMemo(
    () => [...new Set([...offers.nearby, ...offers.featured, ...offers.trending, ...offers.popular].map(realOfferId).filter((id): id is string => Boolean(id)))],
    [offers],
  );

  return { ...offers, businesses: directory.businesses, offerIds, offersLoading, businessesLoading: directory.loading };
}
