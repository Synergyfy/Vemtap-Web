import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { adminService } from '../../services/adminService';

/**
 * Live data for the admin screens. Every hook is disabled in mock mode
 * (no `VITE_API_BASE_URL`), where the screens keep their sample data.
 */

export const adminKeys = {
  all: ['admin'] as const,
  summary: ['admin', 'summary'] as const,
  businessSummary: ['admin', 'business-summary'] as const,
  health: ['admin', 'system-health'] as const,
  subscriptionStats: ['admin', 'subscription-stats'] as const,
  deviceStats: ['admin', 'device-stats'] as const,
  businesses: (params: object) => ['admin', 'businesses', params] as const,
  pending: (params: object) => ['admin', 'pending-verification', params] as const,
  users: (params: object) => ['admin', 'users', params] as const,
  clusters: (params: object) => ['admin', 'clusters', params] as const,
};

const live = () => hasApiConfig();

export const useAdminSummary = () =>
  useQuery({ queryKey: adminKeys.summary, queryFn: adminService.summary, enabled: live(), staleTime: 60_000 });

export const useAdminBusinessSummary = () =>
  useQuery({ queryKey: adminKeys.businessSummary, queryFn: adminService.businessSummary, enabled: live(), staleTime: 60_000 });

export const useAdminSystemHealth = () =>
  useQuery({ queryKey: adminKeys.health, queryFn: adminService.systemHealth, enabled: live(), refetchInterval: 30_000 });

export const useAdminSubscriptionStats = () =>
  useQuery({ queryKey: adminKeys.subscriptionStats, queryFn: adminService.subscriptionStats, enabled: live(), staleTime: 60_000 });

export const useAdminDeviceStats = () =>
  useQuery({ queryKey: adminKeys.deviceStats, queryFn: adminService.deviceStats, enabled: live(), staleTime: 60_000 });

export const useAdminBusinesses = (
  params: { search?: string; status?: string; isVerified?: boolean; page?: number; limit?: number } = {},
) =>
  useQuery({
    queryKey: adminKeys.businesses(params),
    queryFn: () => adminService.businesses(params),
    enabled: live(),
    placeholderData: (previous) => previous,
  });

export const useAdminBusinessStats = (id: string | null | undefined) =>
  useQuery({
    queryKey: ['admin', 'business-stats', id],
    queryFn: () => adminService.businessStats(id as string),
    enabled: live() && Boolean(id),
  });

export const useAdminVerificationDetail = (businessId: string | null | undefined) =>
  useQuery({
    queryKey: ['admin', 'verification-detail', businessId],
    queryFn: () => adminService.verificationDetail(businessId as string),
    enabled: live() && Boolean(businessId),
  });

export const useAdminPendingVerification = (params: { search?: string; page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: adminKeys.pending(params),
    queryFn: () => adminService.pendingVerification(params),
    enabled: live(),
    placeholderData: (previous) => previous,
  });

export const useAdminUsers = (params: { search?: string; role?: string; status?: string; page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.users(params),
    enabled: live(),
    placeholderData: (previous) => previous,
  });

export const useAdminCustomerActivity = (id: string | null | undefined) =>
  useQuery({
    queryKey: ['admin', 'customer-activity', id],
    queryFn: () => adminService.customerActivity(id as string),
    enabled: live() && Boolean(id),
  });

export const useAdminCategories = () =>
  useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.categories({ page: 1, limit: 100 }),
    enabled: live(),
  });

export const useAdminClusters = (params: { search?: string; type?: string; page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: adminKeys.clusters(params),
    queryFn: () => adminService.clusters(params),
    enabled: live(),
    placeholderData: (previous) => previous,
  });

export const useAdminClusterDetail = (id: string | null | undefined) =>
  useQuery({
    queryKey: ['admin', 'cluster-detail', id],
    queryFn: () => adminService.clusterDetail(id as string),
    enabled: live() && Boolean(id),
  });

export const useAdminDeals = ({
  enabled = true,
  ...params
}: { search?: string; status?: string; isFeatured?: boolean; page?: number; limit?: number; enabled?: boolean }) =>
  useQuery({
    queryKey: ['admin', 'deals', params],
    queryFn: () => adminService.deals(params),
    enabled: live() && enabled,
    placeholderData: (previous) => previous,
  });

export const useAdminDealStats = () =>
  useQuery({ queryKey: ['admin', 'deal-stats'], queryFn: adminService.dealStats, enabled: live(), staleTime: 60_000 });

export const useAdminSubscriptions = () =>
  useQuery({ queryKey: ['admin', 'subscriptions'], queryFn: adminService.subscriptions, enabled: live() });

export const useAdminPlans = () =>
  useQuery({ queryKey: ['admin', 'plans'], queryFn: adminService.plans, enabled: live() });

export const useAdminTickets = () =>
  useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => adminService.tickets({ page: 1, limit: 100 }),
    enabled: live(),
    refetchInterval: 60_000,
  });

export const useAdminTicket = (id: string | null | undefined) =>
  useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: () => adminService.ticket(id as string),
    enabled: live() && Boolean(id),
  });

export const useAdminAuditLogs = (params: { module?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminService.auditLogs(params),
    enabled: live(),
    placeholderData: (previous) => previous,
  });

export const useAdminBroadcasts = () =>
  useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: () => adminService.broadcasts({ page: 1, limit: 100 }),
    enabled: live(),
  });

export const useAdminSponsoredCampaigns = () =>
  useQuery({
    queryKey: ['admin', 'sponsored'],
    queryFn: () => adminService.sponsoredCampaigns({ page: 1, limit: 100 }),
    enabled: live(),
  });

export const useAdminPlatformSettings = () =>
  useQuery({ queryKey: ['admin', 'platform-settings'], queryFn: adminService.platformSettings, enabled: live() });

/** Runs an admin action, then refreshes every admin list so counts and statuses agree. */
export function useAdminAction<TArgs, TResult = unknown>(action: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation<TResult, Error, TArgs>({
    mutationFn: action,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

/** Plain-language message for a failed admin call. */
export const adminErrorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.';
