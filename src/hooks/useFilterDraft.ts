import { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { DEFAULT_DEAL_FILTERS, countActiveFilters, useDealFilters, type DealFilters } from '../context/DealFiltersContext';
import { useFilterPreview } from './useFilterPreview';

const parseAmount = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : undefined;
};

export const formatAmount = (value: number | undefined) => (value === undefined ? '' : value.toLocaleString('en-NG'));

/**
 * The Filters screen's working copy (desktop and mobile). Nothing changes on the
 * feeds until `apply`; the live count and preview follow the choices as they are made.
 */
export function useFilterDraft(onDone: () => void) {
  const { filters, replaceFilters } = useDealFilters();
  const { district, city, lat, lng, radius: savedRadius, hasCoordinates, setLocation } = useLocation();
  const [draft, setDraftState] = useState<DealFilters>(filters);
  const [radius, setRadius] = useState(savedRadius);
  const [minPrice, setMinPrice] = useState(formatAmount(filters.minPrice));
  const [maxPrice, setMaxPrice] = useState(formatAmount(filters.maxPrice));
  const preview = useFilterPreview(draft, radius);

  const patch = (next: Partial<DealFilters>) => setDraftState((prev) => ({ ...prev, ...next }));
  const setPrices = (min?: number, max?: number) => {
    setMinPrice(formatAmount(min));
    setMaxPrice(formatAmount(max));
    patch({ minPrice: min, maxPrice: max });
  };
  const typeMin = (value: string) => {
    const amount = parseAmount(value);
    setMinPrice(formatAmount(amount));
    patch({ minPrice: amount });
  };
  const typeMax = (value: string) => {
    const amount = parseAmount(value);
    setMaxPrice(formatAmount(amount));
    patch({ maxPrice: amount });
  };
  /** A chosen distance; `null` is "Near Me" (the location's own radius). */
  const chooseDistance = (km: number | null) => {
    setRadius(km ?? savedRadius);
    patch({ strictDistance: km !== null });
  };
  const reset = () => {
    setDraftState(DEFAULT_DEAL_FILTERS);
    setRadius(savedRadius);
    setMinPrice('');
    setMaxPrice('');
  };
  const apply = () => {
    replaceFilters(draft);
    if (draft.strictDistance && hasCoordinates) setLocation(district, radius, { city, lat, lng });
    onDone();
  };

  return {
    draft,
    patch,
    radius,
    minPrice,
    maxPrice,
    setPrices,
    typeMin,
    typeMax,
    chooseDistance,
    reset,
    apply,
    preview,
    hasCoordinates,
    activeCount: countActiveFilters(draft),
    showLabel: preview.loading ? 'Checking deals…' : preview.count === null ? 'Show Deals' : `Show ${preview.count} Deal${preview.count === 1 ? '' : 's'}`,
    matchText: preview.loading ? 'Checking live deals…' : preview.count === null ? 'Couldn’t count matching deals' : `Matching ${preview.count} live deal${preview.count === 1 ? '' : 's'}`,
  };
}
