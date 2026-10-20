import { api } from './api/client';
import type {
  EligibleAsset,
  FundingSource,
  LaunchedPromotion,
  Promotion,
  PromotionForecast,
  PromotionForecastInput,
  PromotionStatus,
  SavePromotionInput,
  SponsoredCampaignOptions,
} from './promotionCampaignsService';

export type CampaignKind = 'boost' | 'promotion';

/** A `/boosts` or `/promotions` row as the list and lifecycle routes return it. */
export interface SponsoredCampaign extends Promotion {
  kind?: string;
  goalId?: string | null;
  spent?: number | string;
  remaining?: number | string;
  budget?: number;
  startDate?: string | null;
  endDate?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  createdAt?: string | null;
}

export interface CampaignSummary {
  live: number;
  scheduled: number;
  paused: number;
  drafts: number;
  ended: number;
  totalBudget: number | string;
  totalSpent: number | string;
  audienceReached: number;
  claims: number;
  redemptions: number;
  revenue: number | string;
}

export interface BoostOptions extends SponsoredCampaignOptions {
  goals?: { id: string; label: string }[];
}

export interface SaveBoostInput extends SavePromotionInput {
  goalId?: string;
  branchId?: string;
}

/** `GET /boosts/:id/stats` (and `/promotions/:id/stats`). */
export interface CampaignStats {
  id: string;
  status: PromotionStatus;
  kpis: {
    budget: number | string;
    spent: number | string;
    left: number | string;
    percentConsumed: number;
    redemptions: number;
    grossRevenue: number | string;
    reach: number;
    returnOnSpend?: number | string | null;
  };
  funnel: { id: string; label: string; value: number }[];
  rhythm: { hour: number; views?: number; claims: number }[];
  byBranch: { branchId: string; name: string; claims: number }[];
  series: { date: string; spend: number | string; claims: number }[];
  previous?: { id: string; name: string; endDate?: string | null; reach: number; claims: number; redemptions: number; spent: number | string; costPerClaim?: number | string | null } | null;
  benchmark?: { costPerClaim: number | string; campaigns: number } | null;
}

interface Page<T> {
  data: T[];
  total: number;
  hasNextPage: boolean;
}

const BASE: Record<CampaignKind, string> = { boost: '/boosts', promotion: '/promotions' };

/**
 * Lifecycle for sponsored campaigns. Boosts and promotions share one backend
 * controller, so every call takes the kind and hits the matching base path.
 */
export const sponsoredCampaignsService = {
  list: (kind: CampaignKind, status?: PromotionStatus) =>
    api.get<Page<SponsoredCampaign>>(BASE[kind], { params: { status, limit: 50 } }).then((page) => page.data ?? []),
  summary: (kind: CampaignKind) => api.get<CampaignSummary>(`${BASE[kind]}/summary`),
  options: () => api.get<BoostOptions>('/boosts/options'),
  eligibleAssets: () => api.get<EligibleAsset[]>('/boosts/eligible-assets'),
  forecast: (input: PromotionForecastInput) => api.post<PromotionForecast>('/boosts/forecast', input),
  createBoost: (input: SaveBoostInput) => api.post<SponsoredCampaign>('/boosts', input),
  remove: (kind: CampaignKind, id: string) => api.del<unknown>(`${BASE[kind]}/${id}`),
  launch: (kind: CampaignKind, id: string, fundingSource: FundingSource = 'wallet') =>
    api.post<LaunchedPromotion>(`${BASE[kind]}/${id}/launch`, { fundingSource }),
  pause: (kind: CampaignKind, id: string) => api.post<SponsoredCampaign>(`${BASE[kind]}/${id}/pause`),
  resume: (kind: CampaignKind, id: string) => api.post<SponsoredCampaign>(`${BASE[kind]}/${id}/resume`),
  end: (kind: CampaignKind, id: string) => api.post<SponsoredCampaign>(`${BASE[kind]}/${id}/end`),
  stats: (kind: CampaignKind, id: string) => api.get<CampaignStats>(`${BASE[kind]}/${id}/stats`),
  addBudget: (kind: CampaignKind, id: string, amount: number) => api.post<SponsoredCampaign>(`${BASE[kind]}/${id}/budget`, { amount }),
};
