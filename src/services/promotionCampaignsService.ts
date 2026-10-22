import { api } from './api/client';
import { withMock } from './mock';

/**
 * Sponsored promotion campaigns — `/promotions`, the 6-step Create Campaign
 * wizard. Not `/campaigns` (the SMS/WhatsApp message blast). Shapes follow the
 * backend `SaveCampaignDto` / `view()` / `options()`; decimals may arrive as
 * strings, so read them through `Number()`.
 */
export type PromotionAssetType = 'deal' | 'product' | 'service' | 'profile';
export type PromotionStatus = 'Draft' | 'Pending' | 'Active' | 'Paused' | 'Ended';
export type BudgetMode = 'total' | 'daily';
export type FundingSource = 'wallet' | 'card';

export interface EligibleAsset {
  type: PromotionAssetType;
  id: string;
  title: string;
  image?: string | null;
  price?: number | string | null;
  wasPrice?: number | string | null;
  priorClaims?: number | null;
}

export interface PromotionAudience {
  strategy?: 'nearby' | 'segments';
  segmentIds?: string[];
  cohorts?: string[];
  branchIds?: string[];
  clusterIds?: string[];
  radiusKm?: number;
}

export interface PromotionSchedule {
  durationDays: number;
  instantLaunch?: boolean;
  startAt?: string;
  dayparting?: boolean;
  windows?: string[];
  /** 0 = Sunday … 6 = Saturday. */
  weekdays?: number[];
  autoRenew?: boolean;
}

export interface SavePromotionInput {
  name?: string;
  objective?: string;
  assets?: { type: PromotionAssetType; id: string }[];
  audience?: PromotionAudience;
  placements?: string[];
  schedule?: PromotionSchedule;
  budgetMode?: BudgetMode;
  /** Total budget (₦) when `budgetMode` is `total`. */
  budget?: number;
  /** Per-day budget (₦) when `budgetMode` is `daily`. */
  dailyBudget?: number;
}

export interface Promotion extends SavePromotionInput {
  id: string;
  name: string;
  status: PromotionStatus;
  awaitingPayment?: boolean;
}

export interface LaunchedPromotion extends Promotion {
  /** Present when card funding needs a Paystack checkout for the shortfall. */
  checkout?: { reference: string; amount: number | string; authorizationUrl?: string | null };
}

export interface PromotionForecastInput {
  budget?: number;
  dailyBudget?: number;
  durationDays?: number;
  radiusKm?: number;
  clusterIds?: string[];
}

export interface PromotionForecast {
  budget: number | string;
  durationDays: number;
  dailyPace: number | string;
  radiusKm: number;
  reachMin: number;
  reachMax: number;
  claimsMin: number;
  claimsMax: number;
  audienceCapped: boolean;
  isEstimate?: boolean;
}

interface Option {
  id: string;
  label: string;
}

export interface SponsoredCampaignOptions {
  radiusKm: number[];
  placements: Option[];
  daypartWindows: (Option & { start: string; end: string })[];
  durationsDays: number[];
  budgetModes: string[];
  minBudget: number;
  budgetTiers: { id: string; amount: number; label: string }[];
  objectives?: Option[];
  cohorts?: Option[];
}

const MOCK_OPTIONS: SponsoredCampaignOptions = {
  radiusKm: [1, 3, 5, 10],
  placements: [
    { id: 'feed', label: 'Discovery feed' },
    { id: 'nearby', label: 'Nearby search' },
    { id: 'push', label: 'Push notification' },
  ],
  daypartWindows: [
    { id: 'breakfast', label: 'Breakfast', start: '07:00', end: '11:00' },
    { id: 'lunch', label: 'Lunch', start: '11:00', end: '15:00' },
    { id: 'evening', label: 'Evening', start: '17:00', end: '22:00' },
  ],
  durationsDays: [3, 7, 14, 30],
  budgetModes: ['total', 'daily'],
  minBudget: 5_000,
  budgetTiers: [
    { id: 'starter', amount: 10_000, label: 'Starter' },
    { id: 'growth', amount: 25_000, label: 'Growth' },
    { id: 'max', amount: 50_000, label: 'Max reach' },
  ],
  cohorts: [
    { id: 'new', label: 'New to you' },
    { id: 'regulars', label: 'Regulars' },
    { id: 'lapsed', label: 'Lapsed (90d+)' },
  ],
};

const MOCK_ASSETS: EligibleAsset[] = [
  { type: 'deal', id: 'of-1', title: 'Woodfire Ribeye Combo', price: 18_500, wasPrice: 23_000, priorClaims: 118 },
  { type: 'deal', id: 'of-2', title: 'Weekend Brunch for Two', price: 24_000, wasPrice: 30_000, priorClaims: 104 },
  { type: 'deal', id: 'of-3', title: '20% off Grills', price: 12_000, wasPrice: 15_000, priorClaims: 90 },
  { type: 'product', id: 'pr-1', title: 'Jollof Rice Platter', price: 3_500 },
  { type: 'product', id: 'pr-2', title: 'Chapman (Jug)', price: 4_200 },
  { type: 'profile', id: 'profile', title: 'Your storefront profile' },
];

const mockForecast = (input: PromotionForecastInput): PromotionForecast => {
  const days = input.durationDays ?? 7;
  const budget = input.budget ?? (input.dailyBudget ?? 0) * days;
  const radius = input.radiusKm ?? 3;
  const reach = Math.round(budget / 12) * Math.min(1.6, 0.7 + radius / 10);
  return {
    budget,
    durationDays: days,
    dailyPace: Math.round(budget / days),
    radiusKm: radius,
    reachMin: Math.round(reach * 0.8),
    reachMax: Math.round(reach * 1.2),
    claimsMin: Math.round(reach * 0.012),
    claimsMax: Math.round(reach * 0.022),
    audienceCapped: radius <= 1 && budget > 40_000,
    isEstimate: true,
  };
};

let mockSaved: Promotion | null = null;

export const promotionCampaignsService = {
  options: () => withMock(() => api.get<SponsoredCampaignOptions>('/promotions/options'), () => MOCK_OPTIONS),

  eligibleAssets: () => withMock(() => api.get<EligibleAsset[]>('/promotions/eligible-assets'), () => MOCK_ASSETS),

  forecast: (input: PromotionForecastInput) =>
    withMock(() => api.post<PromotionForecast>('/promotions/forecast', input), () => mockForecast(input)),

  create: (input: SavePromotionInput) =>
    withMock(
      () => api.post<Promotion>('/promotions', input),
      () => {
        mockSaved = { ...input, id: `promo-${Date.now()}`, name: input.name ?? 'Untitled campaign', status: 'Draft' };
        return mockSaved;
      },
    ),

  update: (id: string, input: SavePromotionInput) =>
    withMock(
      () => api.patch<Promotion>(`/promotions/${id}`, input),
      () => {
        mockSaved = { ...(mockSaved as Promotion), ...input, id };
        return mockSaved;
      },
    ),

  /** Reserves the budget from the ad wallet; card funding may return a checkout. */
  launch: (id: string, fundingSource: FundingSource) =>
    withMock(
      () => api.post<LaunchedPromotion>(`/promotions/${id}/launch`, { fundingSource }),
      () => ({ ...(mockSaved as Promotion), id, status: mockSaved?.schedule?.instantLaunch === false ? 'Pending' : 'Active' }) as LaunchedPromotion,
    ),
};
