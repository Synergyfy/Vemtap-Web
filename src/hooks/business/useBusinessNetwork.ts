import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  businessNetworkService,
  type DiscoveryPresence,
  type DiscoverySettings,
  type ReferralStatusFilter,
} from '../../services/businessNetworkService';

export const businessNetworkKeys = {
  all: ['business-network'] as const,
  summary: ['business-network', 'summary'] as const,
  referrals: (status: ReferralStatusFilter, search: string) => ['business-network', 'referrals', status, search] as const,
  referral: (id: string) => ['business-network', 'referral', id] as const,
  discovery: (branchId?: string) => ['business-network', 'discovery', branchId ?? 'main'] as const,
};

export function useNetworkSummary() {
  return useQuery({ queryKey: businessNetworkKeys.summary, queryFn: businessNetworkService.summary });
}

export function useReferrals(status: ReferralStatusFilter, search: string) {
  return useQuery({
    queryKey: businessNetworkKeys.referrals(status, search),
    queryFn: () => businessNetworkService.referrals({ status, search: search || undefined, limit: 50 }),
    placeholderData: keepPreviousData,
  });
}

export function useReferral(id: string | null) {
  return useQuery({
    queryKey: businessNetworkKeys.referral(id ?? ''),
    queryFn: () => businessNetworkService.referral(id as string),
    enabled: Boolean(id),
  });
}

export function useDiscoveryPresence(branchId?: string) {
  return useQuery({ queryKey: businessNetworkKeys.discovery(branchId), queryFn: () => businessNetworkService.discovery(branchId) });
}

/** Toggles save one at a time and update the cached presence optimistically. */
export function useUpdateDiscoverySettings(branchId: string | undefined) {
  const queryClient = useQueryClient();
  const key = businessNetworkKeys.discovery(branchId);
  return useMutation<unknown, Error, Partial<DiscoverySettings>, { previous?: DiscoveryPresence }>({
    mutationFn: (patch) => {
      const target = branchId ?? queryClient.getQueryData<DiscoveryPresence>(key)?.branch.id;
      if (!target) throw new Error('No branch to update.');
      return businessNetworkService.updateDiscoverySettings(target, patch);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DiscoveryPresence>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, settings: { ...previous.settings, ...patch } });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
