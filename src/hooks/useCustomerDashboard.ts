import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useLocationQuery } from '../context/LocationContext';
import { accountService } from '../services/accountService';
import { api, hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';
import { messageService } from '../services/messageService';

const rec = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});
const count = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** The most businesses `GET /public/businesses` returns in one read. */
export const NEARBY_BUSINESS_LIMIT = 50;

export interface DashboardTier {
  tier: string;
  points: number;
  nextTier: string | null;
  pointsToNext: number;
  progressPercent: number;
}

/** What the customer has saved across every redemption (`GET /me/savings`). */
export function useTotalSaved(): number {
  const { authed } = useAuth();
  const savings = useQuery({
    queryKey: ['dashboard', 'savings'],
    queryFn: () => api.get<unknown>('/me/savings', { params: { page: 1, limit: 1 } }),
    enabled: hasApiConfig() && authed,
    select: (payload) => count(rec(payload).totalSavedAmount),
  });
  return savings.data ?? 0;
}

/**
 * Everything the customer dashboard reads beyond the shared contexts, for the
 * desktop and mobile views alike. Each figure is the signed-in customer's own,
 * and stays empty until its endpoint answers.
 */
export function useCustomerDashboard() {
  const { authed } = useAuth();
  const enabled = hasApiConfig() && authed;
  const { lat, lng, radius } = useLocationQuery() as { lat?: number; lng?: number; radius?: number };
  const point = { lat, lng, radius };

  const totalSaved = useTotalSaved();

  const tier = useQuery({
    queryKey: ['dashboard', 'tier'],
    queryFn: () => accountService.getLoyaltyTier(),
    enabled,
    select: (payload): DashboardTier => {
      const row = rec(payload);
      return {
        tier: String(row.tier ?? 'Bronze'),
        points: count(row.points),
        nextTier: typeof row.nextTier === 'string' ? row.nextTier : null,
        pointsToNext: count(row.pointsToNext),
        progressPercent: Math.min(100, Math.max(0, count(row.progressPercent))),
      };
    },
  });

  const savedCount = useQuery({
    queryKey: ['dashboard', 'saved-count'],
    queryFn: () => api.get<unknown>('/me/saved', { params: { page: 1, limit: 1 } }),
    enabled,
    select: (payload) => count(rec(payload).total),
  });

  const unreadMessages = useQuery({
    queryKey: ['dashboard', 'unread-messages'],
    queryFn: () => messageService.listThreads(),
    enabled,
    select: (threads) => threads.filter((thread) => thread.unread).length,
  });

  const recommended = useQuery({
    queryKey: ['dashboard', 'recommendations', lat, lng, radius],
    queryFn: () => catalogueService.getRecommendations({ ...point, limit: 4 }),
    enabled,
    select: (payload) => {
      const rows = Array.isArray(payload) ? payload : rec(payload).data;
      return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
    },
  });

  const nearbyBusinesses = useQuery({
    queryKey: ['dashboard', 'nearby-businesses', lat, lng, radius],
    queryFn: () => catalogueService.getPublicBusinesses({ ...point, limit: NEARBY_BUSINESS_LIMIT, strictRadius: true }),
    enabled: hasApiConfig(),
    select: (payload) => {
      const rows = rec(payload).businesses;
      return Array.isArray(rows) ? rows.length : 0;
    },
  });

  return {
    totalSaved,
    tier: tier.data ?? null,
    savedCount: savedCount.data ?? 0,
    unreadMessages: unreadMessages.data ?? 0,
    recommended: recommended.data ?? [],
    nearbyBusinessCount: nearbyBusinesses.data ?? null,
  };
}
