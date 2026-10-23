import { api } from './api/client';
import { withMock } from './mock';

/**
 * The business's referral network (`/business-network`): businesses it brought
 * to VemTap, the milestone ladder their verification climbs, nearby merchants,
 * and how the business appears in consumer discovery. Owner/Manager only.
 */
export type ReferralStatus = 'registered' | 'pending' | 'verified' | 'notQualified';
export type ReferralStatusFilter = 'all' | ReferralStatus;

export interface ReferralCard {
  id: string;
  name: string | null;
  logoUrl: string | null;
  code: string;
  category: string | null;
  location: string | null;
  status: ReferralStatus;
  joinedAt: string;
  verifiedAt?: string | null;
}

export interface NetworkTier {
  id: string;
  name: string;
  threshold: number;
  perks: string[];
  state: 'unlocked' | 'active' | 'locked';
  /** 0–1 */
  progress: number;
  remaining: number;
}

export interface NetworkSummary {
  referralCode: string;
  referralLink: string;
  counts: Record<'total' | ReferralStatus, number>;
  joined: { current: number; previous: number };
  conversionRate: number;
  tiers: NetworkTier[];
  current: { id: string; name: string } | null;
  next: { id: string; name: string; threshold: number; remaining: number; progress: number } | null;
  recent: ReferralCard[];
  nearby: {
    total: number;
    radiusMeters: number;
    merchants: { branchId: string; name: string | null; businessName: string | null; category: string | null; distanceMeters: number }[];
  };
}

export interface ReferralsPage {
  data: ReferralCard[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  /** Counts follow `search`, not `status`. */
  meta: { statusCounts: Record<ReferralStatusFilter, number> };
}

export type ReferralTimelineStep = 'registered' | 'setup' | 'submitted' | 'verified' | 'firstDeal';

export interface ReferralDetail extends ReferralCard {
  creditedTo: { id: string; name: string };
  countsTowardMilestone: boolean;
  timeline: { id: ReferralTimelineStep; at: string | null; done: boolean }[];
}

export interface DiscoverySettings {
  joinDiscoveryNetwork: boolean;
  receivePartnerRequests: boolean;
  allowPromotions: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  emailSummary: boolean;
}

export interface DiscoveryPresence {
  branch: { id: string; name: string | null };
  card: {
    name: string | null;
    category: string | null;
    logoUrl: string | null;
    coverImage: string | null;
    locality: string | null;
    rating: number | null;
    reviews: number;
    topDeal: { name: string | null; pricingType: string | null; discountValue: number | null; price: number | null } | null;
  };
  /** score is 10 per passed check. */
  health: { score: number; checks: Record<string, boolean> };
  /** visits + claims + saves, last 7 days vs the 7 before. */
  engagement: { current: number; previous: number };
  index: { catalogueItems: number; bookableServices: number; liveDeals: number; hoursSet: boolean };
  zones: { id: string; name: string | null; area: string | null; active: boolean }[];
  settings: DiscoverySettings;
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const MOCK_REFERRALS: ReferralCard[] = [
  { id: 'biz-1', name: 'Mama Put Express', logoUrl: null, code: 'MAMAPUT', category: 'Restaurant', location: 'Garki, Abuja', status: 'verified', joinedAt: daysAgo(40), verifiedAt: daysAgo(35) },
  { id: 'biz-2', name: 'Glow Beauty Lounge', logoUrl: null, code: 'GLOWBL', category: 'Salon & Spa', location: 'Wuse II, Abuja', status: 'verified', joinedAt: daysAgo(22), verifiedAt: daysAgo(18) },
  { id: 'biz-3', name: 'Crust & Co Bakery', logoUrl: null, code: 'CRUSTCO', category: 'Bakery', location: 'Jabi, Abuja', status: 'pending', joinedAt: daysAgo(6), verifiedAt: null },
  { id: 'biz-4', name: 'FitHub Gym', logoUrl: null, code: 'FITHUB', category: 'Fitness', location: 'Maitama, Abuja', status: 'registered', joinedAt: daysAgo(2), verifiedAt: null },
  { id: 'biz-5', name: 'Quick Wash Laundry', logoUrl: null, code: 'QWASH', category: 'Services', location: 'Kubwa, Abuja', status: 'notQualified', joinedAt: daysAgo(55), verifiedAt: null },
];

const TIERS: Omit<NetworkTier, 'state' | 'progress' | 'remaining'>[] = [
  { id: 'starter', name: 'Network Starter', threshold: 3, perks: ['Network badge on your storefront', '1 free boost credit'] },
  { id: 'partner', name: 'Network Partner', threshold: 5, perks: ['Priority placement in nearby discovery', '5 free SMS credits'] },
  { id: 'community', name: 'Community Network Partner', threshold: 10, perks: ['Featured in the area spotlight', '1 month Growth plan discount'] },
  { id: 'builder', name: 'Local Network Builder', threshold: 25, perks: ['Dedicated account manager', 'Co-marketing campaign'] },
];

const mockSummary = (): NetworkSummary => {
  const counts = { total: MOCK_REFERRALS.length, registered: 0, pending: 0, verified: 0, notQualified: 0 };
  MOCK_REFERRALS.forEach((r) => {
    counts[r.status] += 1;
  });
  const verified = counts.verified;
  let activeIndex = -1;
  TIERS.forEach((tier, index) => {
    if (verified >= tier.threshold) activeIndex = index;
  });
  const tiers: NetworkTier[] = TIERS.map((tier, index) => ({
    ...tier,
    state: index < activeIndex ? 'unlocked' : index === activeIndex ? 'active' : 'locked',
    progress: Math.min(1, verified / tier.threshold),
    remaining: Math.max(0, tier.threshold - verified),
  }));
  const next = tiers.find((tier) => tier.state === 'locked') ?? null;
  return {
    referralCode: 'URBANGRILL',
    referralLink: `${window.location.origin}/get-started?ref=URBANGRILL`,
    counts,
    joined: { current: 3, previous: 1 },
    conversionRate: verified / counts.total,
    tiers,
    current: activeIndex >= 0 ? { id: tiers[activeIndex].id, name: tiers[activeIndex].name } : null,
    next: next ? { id: next.id, name: next.name, threshold: next.threshold, remaining: next.remaining, progress: next.progress } : null,
    recent: MOCK_REFERRALS.slice(0, 5),
    nearby: {
      total: 18,
      radiusMeters: 10_000,
      merchants: [
        { branchId: 'nb-1', name: 'Wuse Market Branch', businessName: 'Kilimanjaro', category: 'Restaurant', distanceMeters: 650 },
        { branchId: 'nb-2', name: 'Banex Plaza', businessName: 'Slot', category: 'Electronics', distanceMeters: 1400 },
        { branchId: 'nb-3', name: 'Berger', businessName: 'Cafe Neo', category: 'Café', distanceMeters: 2100 },
      ],
    },
  };
};

const mockReferrals = (query: { status?: ReferralStatusFilter; search?: string }): ReferralsPage => {
  const term = query.search?.trim().toLowerCase() ?? '';
  const searched = MOCK_REFERRALS.filter((r) => !term || (r.name ?? '').toLowerCase().includes(term));
  const statusCounts = { all: searched.length, registered: 0, pending: 0, verified: 0, notQualified: 0 };
  searched.forEach((r) => {
    statusCounts[r.status] += 1;
  });
  const data = searched.filter((r) => !query.status || query.status === 'all' || r.status === query.status);
  return { data, total: data.length, page: 1, limit: 20, hasNextPage: false, meta: { statusCounts } };
};

const mockReferral = (id: string): ReferralDetail => {
  const card = MOCK_REFERRALS.find((r) => r.id === id) ?? MOCK_REFERRALS[0];
  const reached: Record<ReferralStatus, number> = { registered: 1, pending: 3, verified: 4, notQualified: 2 };
  const steps: ReferralTimelineStep[] = ['registered', 'setup', 'submitted', 'verified', 'firstDeal'];
  return {
    ...card,
    creditedTo: { id: 'me', name: 'Urban Grill' },
    countsTowardMilestone: card.status === 'verified',
    timeline: steps.map((step, index) => ({
      id: step,
      done: index < reached[card.status],
      at: index < reached[card.status] ? daysAgo(Math.max(0, 10 - index * 2)) : null,
    })),
  };
};

let mockDiscoverySettings: DiscoverySettings = {
  joinDiscoveryNetwork: true,
  receivePartnerRequests: true,
  allowPromotions: false,
  pushNotifications: true,
  smsAlerts: false,
  emailSummary: true,
};

const mockDiscovery = (): DiscoveryPresence => ({
  branch: { id: 'wuse-ii', name: 'Wuse II Branch' },
  card: {
    name: 'Urban Grill',
    category: 'Restaurant',
    logoUrl: null,
    coverImage: null,
    locality: 'Wuse II, Abuja',
    rating: 4.6,
    reviews: 128,
    topDeal: { name: 'Woodfire Ribeye Combo', pricingType: 'percentage', discountValue: 20, price: 18500 },
  },
  health: {
    score: 80,
    checks: {
      logo: true,
      cover: true,
      description: true,
      category: true,
      hours: true,
      location: true,
      catalogue: true,
      liveDeal: true,
      verified: false,
      discoverable: false,
    },
  },
  engagement: { current: 412, previous: 356 },
  index: { catalogueItems: 46, bookableServices: 0, liveDeals: 3, hoursSet: true },
  zones: [
    { id: 'wuse-ii', name: 'Wuse II Branch', area: 'Wuse II, Abuja', active: true },
    { id: 'vi', name: 'Victoria Island Branch', area: 'Victoria Island, Lagos', active: true },
  ],
  settings: { ...mockDiscoverySettings },
});

export const businessNetworkService = {
  summary: () => withMock(() => api.get<NetworkSummary>('/business-network/summary'), mockSummary),

  referrals: (query: { status?: ReferralStatusFilter; search?: string; page?: number; limit?: number } = {}) =>
    withMock(
      () => api.get<ReferralsPage>('/business-network/referrals', { params: { ...query } }),
      () => mockReferrals(query),
    ),

  referral: (businessId: string) =>
    withMock(() => api.get<ReferralDetail>(`/business-network/referrals/${businessId}`), () => mockReferral(businessId)),

  discovery: (branchId?: string) =>
    withMock(
      () => api.get<DiscoveryPresence>('/business-network/discovery', { params: branchId ? { branchId } : undefined }),
      mockDiscovery,
    ),

  /** `PATCH /discovery/settings/:branchId` (Owner only). */
  updateDiscoverySettings: (branchId: string, patch: Partial<DiscoverySettings>) =>
    withMock(
      () => api.patch<unknown>(`/discovery/settings/${branchId}`, patch),
      () => {
        mockDiscoverySettings = { ...mockDiscoverySettings, ...patch };
        return mockDiscoverySettings;
      },
    ),
};
