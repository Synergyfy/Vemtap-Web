import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { loyaltyService, type CreateRewardInput, type LoyaltyRulesPatch } from '../../services/loyaltyService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useMyBusiness } from './useMyBusiness';

export const loyaltyKeys = { all: ['loyalty'] as const };

/** The business-wide earning rules (created with defaults on first read). */
export function useLoyaltyRules() {
  return useQuery({ queryKey: [...loyaltyKeys.all, 'rules'], queryFn: () => loyaltyService.rules(), enabled: hasApiConfig() });
}

/** Members, points issued, rewards redeemed and active rewards across the business. */
export function useLoyaltyStats() {
  return useQuery({ queryKey: [...loyaltyKeys.all, 'stats'], queryFn: () => loyaltyService.stats(), enabled: hasApiConfig() });
}

/** Rewards at the active branch, active or not. */
export function useLoyaltyRewards() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...loyaltyKeys.all, 'rewards', activeBranchId ?? 'none'],
    queryFn: () => loyaltyService.rewards(activeBranchId as string),
    enabled: hasApiConfig() && Boolean(activeBranchId),
  });
}

/** The latest points earned and redeemed across the business. */
export function useLoyaltyLogs() {
  const business = useMyBusiness();
  const businessId = business.data?.id;
  return useQuery({
    queryKey: [...loyaltyKeys.all, 'logs', businessId ?? 'none'],
    queryFn: () => loyaltyService.logs(businessId as string),
    enabled: hasApiConfig() && Boolean(businessId),
  });
}

export function useLoyaltyMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: loyaltyKeys.all });
  return {
    updateRules: useMutation({ mutationFn: (patch: LoyaltyRulesPatch) => loyaltyService.updateRules(patch), onSuccess: refresh }),
    createReward: useMutation({ mutationFn: (input: CreateRewardInput) => loyaltyService.createReward(input), onSuccess: refresh }),
    updateReward: useMutation({
      mutationFn: ({ id, ...patch }: { id: string; name?: string; pointsRequired?: number; isActive?: boolean }) =>
        loyaltyService.updateReward(id, patch),
      onSuccess: refresh,
    }),
  };
}
