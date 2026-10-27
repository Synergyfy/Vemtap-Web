import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { adWalletService } from '../../services';
import { sponsoredCampaignsService, type CampaignKind, type SponsoredCampaign } from '../../services/sponsoredCampaignsService';

export const sponsoredKeys = { all: ['sponsored'] as const };

/** A boost or promotion row, tagged with the kind so lifecycle calls hit the right route. */
export type KindedCampaign = SponsoredCampaign & { kind: CampaignKind };

/** The business's boosts and promotions, newest first. */
export function useSponsoredCampaigns() {
  return useQuery({
    queryKey: [...sponsoredKeys.all, 'list'],
    queryFn: async (): Promise<KindedCampaign[]> => {
      const [boosts, promotions] = await Promise.all([
        sponsoredCampaignsService.list('boost'),
        sponsoredCampaignsService.list('promotion'),
      ]);
      return [
        ...boosts.map((row) => ({ ...row, kind: 'boost' as const })),
        ...promotions.map((row) => ({ ...row, kind: 'promotion' as const })),
      ].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    },
    enabled: hasApiConfig(),
  });
}

/** Boost and promotion summaries added together. */
export function useSponsoredSummary() {
  return useQuery({
    queryKey: [...sponsoredKeys.all, 'summary'],
    queryFn: async () => {
      const [boost, promotion] = await Promise.all([
        sponsoredCampaignsService.summary('boost'),
        sponsoredCampaignsService.summary('promotion'),
      ]);
      const add = (key: keyof typeof boost) => Number(boost[key] || 0) + Number(promotion[key] || 0);
      return {
        live: add('live'),
        scheduled: add('scheduled'),
        paused: add('paused'),
        drafts: add('drafts'),
        ended: add('ended'),
        totalBudget: add('totalBudget'),
        totalSpent: add('totalSpent'),
        audienceReached: add('audienceReached'),
        claims: add('claims'),
        redemptions: add('redemptions'),
        revenue: add('revenue'),
      };
    },
    enabled: hasApiConfig(),
  });
}

/** Goals, placements, durations, budgets and districts for the boost builder. */
export function useBoostOptions() {
  return useQuery({
    queryKey: [...sponsoredKeys.all, 'options'],
    queryFn: sponsoredCampaignsService.options,
    enabled: hasApiConfig(),
    staleTime: 10 * 60_000,
  });
}

/** The deals, items and profile the business can promote. */
export function useEligibleAssets() {
  return useQuery({
    queryKey: [...sponsoredKeys.all, 'assets'],
    queryFn: sponsoredCampaignsService.eligibleAssets,
    enabled: hasApiConfig(),
  });
}

export function useCampaignStats(target: { kind: CampaignKind; id: string } | null | undefined) {
  return useQuery({
    queryKey: [...sponsoredKeys.all, 'stats', target?.kind, target?.id],
    queryFn: () => sponsoredCampaignsService.stats(target!.kind, target!.id),
    enabled: hasApiConfig() && Boolean(target?.id),
  });
}

export function useAdWallet() {
  return useQuery({ queryKey: [...sponsoredKeys.all, 'wallet'], queryFn: adWalletService.getSummary, enabled: hasApiConfig() });
}

export function useSponsoredMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: sponsoredKeys.all });
  return {
    step: useMutation({
      mutationFn: ({ campaign, step }: { campaign: KindedCampaign; step: 'launch' | 'pause' | 'resume' | 'end' }) =>
        step === 'launch'
          ? sponsoredCampaignsService.launch(campaign.kind, campaign.id, 'wallet')
          : sponsoredCampaignsService[step](campaign.kind, campaign.id),
      onSuccess: refresh,
    }),
    addBudget: useMutation({
      mutationFn: ({ campaign, amount }: { campaign: KindedCampaign; amount: number }) =>
        sponsoredCampaignsService.addBudget(campaign.kind, campaign.id, amount),
      onSuccess: refresh,
    }),
  };
}
