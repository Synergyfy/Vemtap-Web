export type CatalogItemCondition = 'new' | 'refurbished' | 'used';
export type CatalogItemFulfillmentMode = 'pickup' | 'delivery' | 'dine_in';
export type CataloguePriceMode = 'uniform' | 'per_branch';
export type ClaimLimitPeriod = 'lifetime' | 'day' | 'week' | 'month';
export type RedemptionChannel = 'dine_in' | 'takeout' | 'reservation';

export interface CatalogueVariant {
  id?: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
}

export interface CatalogueItemBranchPrice {
  branchId: string;
  isAvailable?: boolean;
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
}

export interface CreateCatalogueItemDto {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  price?: number;
  compareAtPrice?: number;
  condition?: CatalogItemCondition;
  audience?: string;
  variants?: CatalogueVariant[];
  fulfillmentModes?: CatalogItemFulfillmentMode[];
  pricingMode?: CataloguePriceMode;
  branchIds?: string[];
  branchPricing?: CatalogueItemBranchPrice[];
}

export interface UpdateCatalogueItemDto extends Partial<CreateCatalogueItemDto> {}

export interface OfferTier {
  minQuantity: number;
  discountValue: number;
}

export interface CatalogueOfferBranchPrice {
  branchId: string;
  isActive?: boolean;
  dealPrice?: number;
  quantity?: number;
}

export interface ClaimLimitConfig {
  count: number;
  period: ClaimLimitPeriod;
}

export interface CreateCatalogueOfferDto {
  title: string;
  branchId?: string;
  branchIds?: string[];
  description?: string;
  pricingType?: 'percentage' | 'fixed' | 'combo' | 'tiered';
  discountValue?: number;
  fixedPrice?: number;
  tiers?: OfferTier[];
  autoPauseWhenSoldOut?: boolean;
  allowGifting?: boolean;
  requireGiftRecipientVerification?: boolean;
  socialSharingBonus?: boolean;
  redemptionChannels?: RedemptionChannel[];
  claimSteps?: string[];
  claimLimit?: ClaimLimitConfig;
  maxClaimsPerCustomer?: number;
  itemIds?: string[];
}

export interface UpdateCatalogueOfferDto extends Partial<CreateCatalogueOfferDto> {}

export interface SegmentCriteria {
  deals?: {
    offerIds?: string[];
    redeemedAtLeast?: number;
    withinDays?: number;
  };
  menu?: {
    itemIds?: string[];
    orderedAtLeast?: number;
  };
  location?: {
    branchIds?: string[];
    radiusKm?: number;
  };
  recency?: {
    visitedWithinDays?: number;
    notVisitedForDays?: number;
    minVisits?: number;
  };
  spend?: {
    minTotal?: number;
    minAverageTicket?: number;
  };
  loyalty?: {
    minPoints: number;
  };
}

export interface SegmentSummary {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  size?: number;
  description?: string | null;
  branchId?: string | null;
  criteria?: SegmentCriteria;
  lastComputedAt?: string;
}

export interface SegmentReach {
  size: number;
  reachableByPush?: number;
  reachableBySms?: number;
  reachableByEmail?: number;
}

export interface PromotionAudience {
  strategy: 'nearby' | 'segments';
  segmentIds?: string[];
  cohorts?: string[];
  branchIds?: string[];
  clusterIds?: string[];
  radiusKm?: number;
}

export interface PromotionBody {
  objective?: string;
  assets?: Array<{ type: string; id: string }>;
  audience?: PromotionAudience;
  schedule?: {
    durationDays?: number;
    startAt?: string;
    instantLaunch?: boolean;
    dayparting?: boolean;
    windows?: string[];
    weekdays?: number[];
    autoRenew?: boolean;
  };
  budget?: {
    mode?: 'total' | 'daily';
    total?: number;
    daily?: number;
    funding?: 'wallet' | 'card';
    autoDebit?: boolean;
  };
}

export interface BoostGoalOption {
  id: string;
  label: string;
  description?: string;
}

export interface AdWalletTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface AdWalletSummary {
  balance: number;
  reserved: number;
  spendable: number;
  walletRef?: string;
  virtualAccount?: {
    bank: string;
    number: string;
  };
}

export interface ApiListResponse<T> {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
}
