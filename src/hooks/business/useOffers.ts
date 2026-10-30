import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import {
  offersService,
  type CreateOfferInput,
  type OfferGroupBranchPricing,
  type SetOfferGroupBranchPricingInput,
} from '../../services/offersService';
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

/** Total claims across every branch of a deal (customers' vouchers). */
export const dealGroupClaims = (pricing: OfferGroupBranchPricing | undefined | null) =>
  (pricing?.branches ?? []).reduce((sum, row) => sum + (row.claimedCount ?? 0), 0);

/**
 * Ending or removing a whole deal (every branch).
 * - `close`: stops it now — hidden from feeds, no new claims, end date set to now so it
 *   moves to Expired. Existing claims stay valid.
 * - `remove`: deletes it. The API deletes a deal's claims with it, so this refuses when
 *   anyone has claimed it (close it instead).
 */
export function useDealLifecycle() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: offerKeys.all });
  return {
    close: useMutation({
      mutationFn: (dealGroupId: string) =>
        offersService.updateGroup(dealGroupId, { status: 'inactive', endDate: new Date().toISOString() }),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: async (dealGroupId: string) => {
        const pricing = await offersService.groupBranchPricing(dealGroupId);
        const claims = dealGroupClaims(pricing);
        if (claims > 0) {
          throw new Error(
            `This deal has ${claims} claim${claims === 1 ? '' : 's'}. Deleting it would cancel customers' vouchers — close it instead.`,
          );
        }
        await Promise.all(pricing.branches.map((row) => offersService.remove(row.offerId)));
      },
      onSuccess: refresh,
    }),
  };
}
