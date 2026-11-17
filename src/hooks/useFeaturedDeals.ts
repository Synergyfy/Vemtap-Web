import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, getAccessToken, hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { dealEngagementService } from '../services/dealEngagementService';
import { sponsoredService } from '../services/sponsoredService';
import { useLocationQuery } from '../context/LocationContext';
import { filterApiParams, hasClientFilters, matchesClientFilters, useDealFilters } from '../context/DealFiltersContext';
import { realOfferId } from '../utils/homeOffer';

export type FeaturedSort = 'closest' | 'discount' | 'ending' | 'popular';
export type FeaturedOffer = Record<string, unknown> & { campaignId?: string };

const LIMIT = 24;
const discountOf = (offer: FeaturedOffer) => Number(offer.percentageOff ?? offer.discountPercent ?? 0) || 0;
const endOf = (offer: FeaturedOffer) => {
  const end = typeof offer.endDate === 'string' ? new Date(offer.endDate).getTime() : NaN;
  return Number.isFinite(end) ? end : Infinity;
};

/**
 * The Featured Deals page (desktop and mobile): real promoted deals from
 * `GET /sponsored?placement=feed` first, then the live feed ranked by the chosen
 * sort. Filters apply to the feed; a promoted slot is only shown unfiltered,
 * because `/sponsored` takes no filter params.
 */
export function useFeaturedDeals(sort: FeaturedSort) {
  const locationQuery = useLocationQuery();
  const { filters, activeCount } = useDealFilters();
  const [offers, setOffers] = useState<FeaturedOffer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(() => hasApiConfig());
  const hasPoint = 'lat' in locationQuery;

  useEffect(() => {
    let ignore = false;
    if (!hasApiConfig()) {
      setOffers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { lat, lng } = locationQuery as { lat?: number; lng?: number };
    const sortBy = sort === 'popular' ? 'popular' : sort === 'closest' && hasPoint ? 'nearest' : 'featured';
    Promise.all([
      activeCount === 0 ? sponsoredService.list({ placement: 'feed', lat, lng, limit: 10 }).catch(() => []) : Promise.resolve([]),
      catalogueService.getPublicOffers({ ...locationQuery, ...filterApiParams(filters), sortBy, page: 1, limit: LIMIT }).catch(() => null),
    ])
      .then(([sponsored, feed]) => {
        if (ignore) return;
        const rows = (Array.isArray(feed?.data) ? feed.data : []) as FeaturedOffer[];
        const promoted = sponsored.map((entry) => ({ ...entry.offer, campaignId: entry.campaignId }) as FeaturedOffer);
        const promotedIds = new Set(promoted.map((offer) => offer.id));
        let merged = [...promoted, ...rows.filter((offer) => !promotedIds.has(offer.id))];
        if (hasClientFilters(filters)) merged = merged.filter((offer) => matchesClientFilters(offer, filters));
        if (sort === 'discount') merged = [...merged].sort((a, b) => discountOf(b) - discountOf(a));
        if (sort === 'ending') merged = [...merged].sort((a, b) => endOf(a) - endOf(b));
        setOffers(merged);
        const reported = Number((feed as { total?: unknown } | null)?.total);
        setTotal(Number.isFinite(reported) && !hasClientFilters(filters) ? reported : merged.length);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [locationQuery, filters, activeCount, sort, hasPoint]);

  useEffect(() => {
    for (const offer of offers) {
      const id = realOfferId(offer);
      if (offer.campaignId && id) sponsoredService.track(offer.campaignId, id, 'impression');
    }
  }, [offers]);

  const hasPromoted = useMemo(() => offers.some((offer) => offer.campaignId), [offers]);
  return { offers, total, loading, hasPromoted, hasPoint };
}

/** Saved deals — `GET /deals/saved`, `POST /deals/:id/save` (signed-in customers). */
export function useSavedDeals() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const pending = useRef(new Set<string>());

  useEffect(() => {
    if (!hasApiConfig() || !getAccessToken()) return;
    let ignore = false;
    api
      .get<{ deals?: { id?: string }[]; data?: { deals?: { id?: string }[] } }>('/deals/saved')
      .then((response) => {
        if (ignore) return;
        const deals = response?.deals ?? response?.data?.deals ?? [];
        setSaved(Object.fromEntries(deals.filter((deal) => deal.id).map((deal) => [String(deal.id), true])));
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  /** Resolves to a message to show, or null when it saved. */
  const toggleSaved = useCallback(async (offerId: string): Promise<{ saved: boolean } | { error: string }> => {
    if (!getAccessToken()) return { error: 'Please sign in to save deals.' };
    if (pending.current.has(offerId)) return { error: 'Saving…' };
    pending.current.add(offerId);
    try {
      const result = (await dealEngagementService.toggleSave(offerId)) as { saved?: boolean };
      const next = Boolean(result?.saved);
      setSaved((prev) => ({ ...prev, [offerId]: next }));
      return { saved: next };
    } catch {
      return { error: 'Couldn’t save this deal. Please try again.' };
    } finally {
      pending.current.delete(offerId);
    }
  }, []);

  return { saved, toggleSaved };
}
