import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  };
}
