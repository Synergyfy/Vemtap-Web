import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { offersService } from '../../services/offersService';
import { hasApiConfig } from '../../services/api/client';
import { branchService, type CreateBranchInput, type UpdateBranchInput } from '../../services/branchService';
import { teamService, type InviteStaffInput, type UpdateStaffInput } from '../../services/teamService';
import { myBusinessKeys } from './useMyBusiness';

export const branchKeys = { all: ['branches'] as const };
export const teamKeys = { all: ['team'] as const };

export function useBranches() {
  return useQuery({ queryKey: branchKeys.all, queryFn: branchService.list, enabled: hasApiConfig() });
}

/** Branch writes also refresh `my-business`, which feeds the header branch picker. */
export function useBranchMutations() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: branchKeys.all }),
      queryClient.invalidateQueries({ queryKey: myBusinessKeys.all }),
    ]);
  return {
    create: useMutation({ mutationFn: (input: CreateBranchInput) => branchService.create(input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateBranchInput }) => branchService.update(id, input),
      onSuccess: refresh,
    }),
  };
}

export function useTeam() {
  return useQuery({ queryKey: teamKeys.all, queryFn: () => teamService.list({ allBranches: true }), enabled: hasApiConfig() });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: teamKeys.all });
  return {
    invite: useMutation({ mutationFn: (input: InviteStaffInput) => teamService.invite(input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, branchId, input }: { id: string; branchId?: string; input: UpdateStaffInput }) =>
        teamService.update(id, branchId, input),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: ({ id, branchId }: { id: string; branchId?: string }) => teamService.remove(id, branchId),
      onSuccess: refresh,
    }),
    resend: useMutation({ mutationFn: ({ id, branchId }: { id: string; branchId?: string }) => teamService.resendInvite(id, branchId) }),
    resetPin: useMutation({ mutationFn: ({ id, branchId }: { id: string; branchId?: string }) => teamService.resetPin(id, branchId) }),
  };
}

/** Products, services and active deals at each branch (one query per branch). */
export function useBranchCatalogueCounts(branchIds: string[]) {
  const live = hasApiConfig();
  const items = useQueries({
    queries: branchIds.map((branchId) => ({
      queryKey: ['catalogue-items', branchId, 'any'],
      queryFn: () => catalogueItemsService.list({ branchId, limit: 100 }),
      enabled: live,
    })),
  });
  const offers = useQueries({
    queries: branchIds.map((branchId) => ({
      queryKey: ['offers', 'list', branchId],
      queryFn: () => offersService.list(branchId),
      enabled: live,
    })),
  });
  return Object.fromEntries(
    branchIds.map((branchId, index) => {
      const list = items[index]?.data;
      const deals = offers[index]?.data;
      return [
        branchId,
        {
          products: list ? list.filter((item) => item.itemType !== 'service').length : null,
          services: list ? list.filter((item) => item.itemType === 'service').length : null,
          deals: deals ? deals.filter((offer) => offer.status === 'active').length : null,
        },
      ];
    }),
  ) as Record<string, { products: number | null; services: number | null; deals: number | null }>;
}
