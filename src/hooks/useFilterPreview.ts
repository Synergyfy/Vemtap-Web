import { useEffect, useState } from 'react';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { useLocationQuery } from '../context/LocationContext';
import { filterApiParams, hasClientFilters, matchesClientFilters, type DealFilters } from '../context/DealFiltersContext';

type Offer = Record<string, unknown>;

/** Live count and first matches for the choices still being made on the Filters screen. */
export function useFilterPreview(draft: DealFilters, radius: number) {
  const locationQuery = useLocationQuery();
  const [count, setCount] = useState<number | null>(null);
  const [deals, setDeals] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(() => hasApiConfig());
  const key = JSON.stringify({ draft, radius, locationQuery });

  useEffect(() => {
    if (!hasApiConfig()) {
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    const clientSide = hasClientFilters(draft);
    const timer = window.setTimeout(() => {
      const hasPoint = 'lat' in locationQuery;
      catalogueService
        .getPublicOffers({
          ...locationQuery,
          ...(hasPoint && draft.strictDistance ? { radius } : {}),
          ...filterApiParams(draft),
          page: 1,
          limit: clientSide ? 50 : 3,
        })
        .then((response) => {
          if (ignore) return;
          const rows = (Array.isArray(response?.data) ? response.data : []) as Offer[];
          const matching = clientSide ? rows.filter((offer) => matchesClientFilters(offer, draft)) : rows;
          const total = Number((response as { total?: unknown }).total);
          setDeals(matching.slice(0, 3));
          setCount(clientSide || !Number.isFinite(total) ? matching.length : total);
        })
        .catch(() => {
          if (ignore) return;
          setDeals([]);
          setCount(null);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
    // `key` covers draft, radius and location.
  }, [key]);

  return { count, deals, loading };
}
