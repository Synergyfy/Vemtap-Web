import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';

export interface PublicStats {
  businesses: number;
  activeDeals: number;
  claims: number;
  branches: number;
}

const num = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Platform-wide figures from `GET /public/stats` (no sign-in needed); null until they load. */
export function usePublicStats(): PublicStats | null {
  const stats = useQuery({
    queryKey: ['public', 'stats'],
    queryFn: () => catalogueService.getPublicStats(),
    enabled: hasApiConfig(),
    staleTime: 5 * 60_000,
  });
  const data = stats.data as Record<string, unknown> | undefined;
  if (!data) return null;
  return {
    businesses: num(data.totalBusinesses),
    activeDeals: num(data.totalActiveDeals),
    claims: num(data.totalClaims),
    branches: num(data.totalBranches),
  };
}
