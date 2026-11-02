import { useQuery } from '@tanstack/react-query';
import { businessAnalyticsService, type AnalyticsModule } from '../../services/businessAnalyticsService';

/** Local Lagos midnight, as the API expects (`2026-10-01T00:00:00+01:00`). */
const lagosMidnight = (date: Date) => {
  const lagos = new Date(date.getTime() + (date.getTimezoneOffset() + 60) * 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${lagos.getFullYear()}-${pad(lagos.getMonth() + 1)}-${pad(lagos.getDate())}T00:00:00+01:00`;
};

/** The last `days` whole Lagos days, ending tomorrow's midnight (exclusive). */
export const analyticsRange = (days: number) => {
  const now = new Date();
  return {
    from: lagosMidnight(new Date(now.getTime() - (days - 1) * 86_400_000)),
    to: lagosMidnight(new Date(now.getTime() + 86_400_000)),
  };
};

/** The per-module filters the analytics filter screen sets; each module only sends its own. */
export interface AnalyticsModuleFilters {
  dealStatus?: string[];
  paymentMethod?: string[];
  tillId?: string[];
  cohort?: string | null;
}

const moduleParams = (module: AnalyticsModule, filters: AnalyticsModuleFilters = {}) => {
  const list = (values?: string[]) => (values && values.length ? values.join(',') : undefined);
  if (module === 'deals') return { dealStatus: list(filters.dealStatus) };
  if (module === 'pos') return { paymentMethod: list(filters.paymentMethod), tillId: list(filters.tillId) };
  if (module === 'customers') return { cohort: filters.cohort ?? undefined };
  return {};
};

export function useBusinessAnalytics<M extends AnalyticsModule>(
  module: M,
  days: number,
  branchId?: string,
  filters?: AnalyticsModuleFilters,
) {
  const extra = moduleParams(module, filters);
  return useQuery({
    queryKey: ['business-analytics', module, days, branchId ?? 'all', extra],
    queryFn: () => businessAnalyticsService.get(module, { ...analyticsRange(days), branchId, ...extra }),
    // Keep the last result while a new range loads, but never across modules —
    // each module has its own response shape.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === module ? previous : undefined),
    staleTime: 5 * 60_000,
  });
}
