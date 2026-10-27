import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { offersService, type CreateOfferInput, type SetOfferGroupBranchPricingInput } from '../../services/offersService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const offerKeys = { all: ['offers'] as const };

export function useOffers() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...offerKeys.all, 'list', activeBranchId ?? 'all'],
    queryFn: () => offersService.list(activeBranchId),
    enabled: hasApiConfig() && Boolean(activeBranchId),
  });
}

export function useOfferSummary() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...offerKeys.all, 'summary', activeBranchId ?? 'all'],
    queryFn: () => offersService.summary(activeBranchId),
    enabled: hasApiConfig() && Boolean(activeBranchId),
  });
}

export function useOfferMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: offerKeys.all });
  return {
    create: useMutation({ mutationFn: (input: CreateOfferInput) => offersService.create(input), onSuccess: refresh }),
    setStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => offersService.update(id, { status }),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (id: string) => offersService.remove(id), onSuccess: refresh }),
  };
}

/** A deal's stats, per-branch pricing and price history, by deal group id. */
export function useOfferGroup(dealGroupId: string | null | undefined) {
  const enabled = hasApiConfig() && Boolean(dealGroupId);
  const id = dealGroupId ?? '';
  return {
    stats: useQuery({ queryKey: [...offerKeys.all, 'group', id, 'stats'], queryFn: () => offersService.groupStats(id), enabled }),
    pricing: useQuery({ queryKey: [...offerKeys.all, 'group', id, 'pricing'], queryFn: () => offersService.groupBranchPricing(id), enabled }),
    history: useQuery({ queryKey: [...offerKeys.all, 'group', id, 'history'], queryFn: () => offersService.priceHistory(id), enabled }),
  };
}

export function useOfferGroupMutations(dealGroupId: string | null | undefined) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: offerKeys.all });
  const id = dealGroupId ?? '';
  return {
    setPricing: useMutation({
      mutationFn: (input: SetOfferGroupBranchPricingInput) => offersService.setGroupBranchPricing(id, input),
      onSuccess: refresh,
    }),
    setStatus: useMutation({
      mutationFn: (status: 'active' | 'inactive') => offersService.setGroupStatus(id, status),
      onSuccess: refresh,
    }),
  };
}
