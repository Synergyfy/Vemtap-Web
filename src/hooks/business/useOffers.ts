import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { offersService, type CreateOfferInput } from '../../services/offersService';
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
