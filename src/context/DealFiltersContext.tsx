import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** What the customer chose on the Filters screen. Applies to home, Deals and Discover. */
export interface DealFilters {
  categoryId: string | null;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  availableNow: boolean;
  endingSoon: boolean;
  /** The customer picked a distance: keep results inside it instead of widening when it is empty. */
  strictDistance: boolean;
}

export const DEFAULT_DEAL_FILTERS: DealFilters = {
  categoryId: null,
  availableNow: false,
  endingSoon: false,
  strictDistance: false,
};

/** Params for `GET /catalogue/offers/public`. */
export const filterApiParams = (filters: DealFilters) => ({
  categoryId: filters.categoryId ?? undefined,
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  minDiscount: filters.minDiscount,
  strictRadius: filters.strictDistance || undefined,
});

/** The API has no timing params, so these two are checked against each offer's own dates. */
export const hasClientFilters = (filters: DealFilters) => filters.availableNow || filters.endingSoon;

export const matchesClientFilters = (offer: Record<string, unknown>, filters: DealFilters, now = Date.now()) => {
  const time = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? new Date(value).getTime() : NaN);
  if (filters.availableNow) {
    const start = time(offer.startDate);
    if (Number.isFinite(start) && start > now) return false;
  }
  if (filters.endingSoon) {
    const end = time(offer.endDate);
    if (!Number.isFinite(end) || end < now || end > now + 24 * 60 * 60 * 1000) return false;
  }
  return true;
};

export const countActiveFilters = (filters: DealFilters) =>
  [
    filters.categoryId,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.minDiscount,
    filters.availableNow,
    filters.endingSoon,
    filters.strictDistance,
  ].filter(Boolean).length;

interface DealFiltersValue {
  filters: DealFilters;
  setFilters: (patch: Partial<DealFilters>) => void;
  replaceFilters: (next: DealFilters) => void;
  /** Filters beyond the category chip (price, discount, timing, distance) are on. */
  narrowed: boolean;
  activeCount: number;
}

const DealFiltersContext = createContext<DealFiltersValue | null>(null);

export function DealFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, replaceFilters] = useState<DealFilters>(DEFAULT_DEAL_FILTERS);
  const setFilters = useCallback((patch: Partial<DealFilters>) => replaceFilters((prev) => ({ ...prev, ...patch })), []);
  const value = useMemo<DealFiltersValue>(() => {
    const activeCount = countActiveFilters(filters);
    return { filters, setFilters, replaceFilters, activeCount, narrowed: activeCount > (filters.categoryId ? 1 : 0) };
  }, [filters, setFilters]);
  return <DealFiltersContext.Provider value={value}>{children}</DealFiltersContext.Provider>;
}

export function useDealFilters(): DealFiltersValue {
  const context = useContext(DealFiltersContext);
  if (!context) throw new Error('useDealFilters must be used within DealFiltersProvider');
  return context;
}
