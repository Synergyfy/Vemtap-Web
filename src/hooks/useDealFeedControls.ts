import { useEffect, useMemo, useState } from 'react';
import { useLocationQuery } from '../context/LocationContext';

export const DEAL_PAGE_SIZE = 6;

export type DealSortBy = 'nearest' | 'newest' | 'price_asc' | 'price_desc' | 'popular';

const SORT_LABELS: Record<DealSortBy, string> = {
  nearest: 'Nearest first',
  newest: 'Newest first',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  popular: 'Most claimed',
};

/**
 * Search, sort and "load more" for the public deals feed, shared by the desktop
 * and mobile Deals views. Everything maps to real `GET /catalogue/offers/public`
 * params: `search` (deal name, description or business name), `sortBy`,
 * `categoryId`, and a growing `limit`. "Nearest first" is only offered once the
 * customer has a location (the API needs `lat`/`lng` for it).
 */
export function useDealFeedControls(categoryId: string | null, initialSearch = '') {
  const locationQuery = useLocationQuery();
  const hasPoint = 'lat' in locationQuery && 'lng' in locationQuery;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch.trim());
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const [chosenSort, setSortBy] = useState<DealSortBy | null>(null);
  const sortBy: DealSortBy = chosenSort === 'nearest' && !hasPoint ? 'newest' : chosenSort ?? (hasPoint ? 'nearest' : 'newest');
  const sortOptions = (Object.keys(SORT_LABELS) as DealSortBy[])
    .filter((value) => value !== 'nearest' || hasPoint)
    .map((value) => ({ value, label: SORT_LABELS[value] }));

  // "Load more" grows the limit; any change to what is being asked for starts again at one page.
  const feedKey = `${categoryId ?? ''}|${search}|${sortBy}|${JSON.stringify(locationQuery)}`;
  const [more, setMore] = useState({ key: feedKey, limit: DEAL_PAGE_SIZE });
  const limit = more.key === feedKey ? more.limit : DEAL_PAGE_SIZE;
  const loadMore = () => setMore({ key: feedKey, limit: limit + DEAL_PAGE_SIZE });

  const feedParams = useMemo(
    () => ({
      ...locationQuery,
      page: 1,
      limit,
      sortBy,
      search: search || undefined,
      categoryId: categoryId ?? undefined,
    }),
    [locationQuery, limit, sortBy, search, categoryId],
  );

  return {
    searchInput,
    setSearchInput,
    /** The debounced term actually sent to the API. */
    search,
    sortBy,
    setSortBy,
    sortOptions,
    sortLabel: SORT_LABELS[sortBy],
    limit,
    isLoadingMorePage: limit > DEAL_PAGE_SIZE,
    loadMore,
    feedParams,
  };
}
