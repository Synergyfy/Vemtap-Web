import { api } from './api/client';

export type RewardCategory = 'custom_discount' | 'free_product' | 'service_upgrade' | 'tangible_gifts';

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string | null;
  pointsRequired: number;
  category: RewardCategory;
  branchId?: string | null;
  /** `-1` means unlimited. */
  totalQuantity?: number | null;
  remainingQuantity?: number | null;
  isActive?: boolean;
  expiryDate?: string | null;
}

/** `GET /loyalty/rules` — one row per business (or branch); created on first read. */
export interface LoyaltyRules {
  ruleType: 'spending' | 'visit' | 'hybrid';
  isActive: boolean;
  spendingBaseAmount: number;
  spendingBasePoints: number;
  visitPoints: number;
  visitCooldownHours: number;
  firstVisitBonus: number;
  birthdayBonus: number;
  referralBonus: number;
}
export type LoyaltyRulesPatch = Partial<LoyaltyRules>;

export interface LoyaltyStats {
  stats?: { label?: string | null; value?: string | null; change?: number | null }[] | null;
  growthForecast?: string | null;
}

export interface PointLog {
  id: string;
  amount: number | string;
  type: string;
  reason?: string | null;
  createdAt?: string | null;
  customer?: { firstName?: string | null; lastName?: string | null } | null;
  branch?: { name?: string | null } | null;
}

export interface CreateRewardInput {
  name: string;
  description: string;
  pointsRequired: number;
  category: RewardCategory;
  branchId: string;
  totalQuantity: number;
  expiryDate: string;
}

const asList = <T>(res: T[] | { data?: T[] | null }) => (Array.isArray(res) ? res : res.data ?? []);
const scope = (branchId?: string) => ({ params: branchId ? { branchId } : {} });

/** Owner-side loyalty: earning rules, branch rewards, stats and the points ledger. */
export const loyaltyService = {
  stats: (branchId?: string) => api.get<LoyaltyStats>('/loyalty/business-stats', scope(branchId)),
  rules: (branchId?: string) => api.get<LoyaltyRules>('/loyalty/rules', scope(branchId)),
  updateRules: (patch: LoyaltyRulesPatch, branchId?: string) => api.patch<LoyaltyRules>('/loyalty/rules', patch, scope(branchId)),
  rewards: (branchId: string) =>
    api.get<LoyaltyReward[] | { data: LoyaltyReward[] }>(`/loyalty/rewards/branch/${branchId}`, { params: { page: 1, limit: 50 } }).then(asList),
  createReward: (input: CreateRewardInput) => api.post<LoyaltyReward>('/loyalty/rewards', input),
  updateReward: (id: string, patch: Partial<Omit<CreateRewardInput, 'branchId' | 'category'>> & { isActive?: boolean }) =>
    api.patch<LoyaltyReward>(`/loyalty/rewards/${id}`, patch),
  removeReward: (id: string) => api.del<unknown>(`/loyalty/rewards/${id}`),
  logs: (businessId: string, branchId?: string) =>
    api
      .get<{ data?: PointLog[] | null }>('/loyalty/points/business-logs', { params: { businessId, ...(branchId ? { branchId } : {}), page: 1, limit: 10 } })
      .then(asList),
};
