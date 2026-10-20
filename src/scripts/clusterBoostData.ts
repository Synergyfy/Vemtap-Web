/**
 * VEMTAP Cluster Boost Visibility — Configuration & State Store
 *
 * Cluster-specific visibility product: a business pays to raise the
 * featured-selection priority of ONE of its own eligible items (deal,
 * product, service, or business profile) inside its current cluster rotator.
 * This is intentionally separate from the global Boost Studio campaigns.
 *
 * Everything here is configuration-driven (tiers, durations, pricing,
 * capacity) and frontend-only: campaigns and wallet movements persist to
 * localStorage for realistic demo simulation.
 *
 * BACKEND GAP — a future API must own: pricing & tier catalogue, cluster
 * capacity/inventory checks at purchase and at activation time, real payment
 * capture (wallet ledger or gateway), rotator weighting enforcement, and
 * impressions/clicks tracking. No gateway is wired today; payment methods
 * below are clearly-labelled sandbox simulations and never claim a live
 * charge. Campaign stats stay `null` until real tracking exists — screens
 * must display them as unavailable, never invented.
 */

import {
  getClusterState,
  type ClusterShowcaseItem,
  type ShowcaseEntityType,
} from './clusterData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Reuses the cluster pool vocabulary: deal / product / service / profile. */
export type ClusterBoostCategory = ShowcaseEntityType;

export type ClusterBoostDurationKey = 'daily' | 'weekly' | 'monthly';

export type ClusterBoostPaymentMethod = 'wallet' | 'card';

/** Lifecycle of a cluster boost campaign. */
export type ClusterBoostStatus = 'pending' | 'scheduled' | 'active' | 'completed';

export interface ClusterBoostTierConfig {
  key: string;
  label: string;
  description: string;
  /** Relative selection weight inside the rotator (1 = baseline entry). */
  weight: number;
  /** Naira per day at this weight, before duration discount. */
  pricePerDay: number;
}

export interface ClusterBoostDurationConfig {
  key: ClusterBoostDurationKey;
  label: string;
  days: number;
  /** Multiplier applied to the computed base price (e.g. 0.9 = 10% off). */
  discountFactor: number;
  discountLabel?: string;
}

export interface ClusterBoostConfig {
  tiers: ClusterBoostTierConfig[];
  durations: ClusterBoostDurationConfig[];
  /** Live boosts allowed on a single item at once. Businesses may boost as
   * many different deals, products, and services as they like — there is no
   * per-business cap. The business profile is the one exception: its boost is
   * extended/upgraded instead of duplicated. */
  maxLiveCampaignsPerItem: number;
  /** Cluster-wide boost inventory — slots purchasable at any one time. */
  maxBoostSlotsPerCluster: number;
  /** Demo baseline: live boost slots already taken by other merchants. */
  otherMerchantsLiveBoosts: number;
  /** Seeds the local demo wallet so it mirrors the Boost Wallet screen. */
  walletSeedBalance: number;
}

// ---------------------------------------------------------------------------
// Campaign placements — one unified campaign system. Cluster is live; wider
// placements are Coming Soon until an authorised admin enables them.
// ---------------------------------------------------------------------------

export type CampaignPlacementKey = 'cluster' | 'area' | 'city' | 'state' | 'country';

export interface CampaignPlacementConfig {
  key: CampaignPlacementKey;
  label: string;
  icon: string;
  description: string;
  /** Default availability. Only cluster launches enabled. */
  enabled: boolean;
}

export const CAMPAIGN_PLACEMENTS: CampaignPlacementConfig[] = [
  {
    key: 'cluster',
    label: 'Cluster Campaign',
    icon: 'hub',
    description:
      'Promote a product, service, deal, or business profile to customers exploring a specific market, mall, plaza, or other eligible cluster.',
    enabled: true,
  },
  {
    key: 'area',
    label: 'Area Campaign',
    icon: 'map',
    description: 'Reach customers exploring one neighbourhood or commercial area.',
    enabled: false,
  },
  {
    key: 'city',
    label: 'City Campaign',
    icon: 'location_city',
    description: 'Reach customers exploring an entire city.',
    enabled: false,
  },
  {
    key: 'state',
    label: 'State Campaign',
    icon: 'public',
    description: 'Reach customers exploring a whole state.',
    enabled: false,
  },
  {
    key: 'country',
    label: 'Country Campaign',
    icon: 'flag',
    description: 'Reach customers exploring anywhere in the country.',
    enabled: false,
  },
];

/** Optional admin override flags — written by a future admin console. */
const PLACEMENT_FLAGS_KEY = 'vemtap_admin_campaign_placement_flags';

/**
 * Effective placement availability: config defaults overridden by optional
 * admin flags. BACKEND GAP — an authorised admin console/API must own these
 * flags and enable wider placements only once coverage, active clusters and
 * measurement are adequate. Nothing here auto-enables a placement from raw
 * cluster counts.
 */
export function getPlacementAvailability(): Record<CampaignPlacementKey, boolean> {
  const flags = getStored<Partial<Record<CampaignPlacementKey, boolean>>>(
    PLACEMENT_FLAGS_KEY,
    {}
  );
  const availability = {} as Record<CampaignPlacementKey, boolean>;
  CAMPAIGN_PLACEMENTS.forEach((placement) => {
    availability[placement.key] = flags[placement.key] ?? placement.enabled;
  });
  return availability;
}

export interface ClusterBoostCampaign {
  id: string;
  /** Human payment reference shown on the confirmation, e.g. CLB-8F4K2. */
  reference: string;
  /** Guards against duplicate charges when a submit is retried. */
  idempotencyKey: string;
  clusterId: string;
  clusterName: string;
  businessId: string;
  itemId: string;
  category: ClusterBoostCategory;
  itemTitle: string;
  itemImage: string;
  tierKey: string;
  /** Selection weight captured from config at purchase time. */
  weight: number;
  durationKey: ClusterBoostDurationKey;
  /** ISO dates (yyyy-mm-dd). */
  startDate: string;
  endDate: string;
  /** Total amount charged. */
  amount: number;
  paymentMethod: ClusterBoostPaymentMethod;
  paymentStatus: 'paid' | 'failed';
  /**
   * 'pending' = paid but activation not confirmed yet (capacity or rotator
   * controls may still gate it). Never re-charged for a pending activation.
   */
  status: ClusterBoostStatus;
  activationNote?: string;
  /** Provisional estimate captured at purchase (not measured traffic). */
  estimatedSharePct: number;
  createdAt: number;
  paidAt?: number;
  activatedAt?: number;
  /**
   * Tracked performance. `null` = not connected yet; screens must render
   * these as unavailable rather than inventing numbers.
   */
  stats: { impressions: number | null; clicks: number | null };
  /**
   * Qualifying featured impressions counted by the featured rotation below —
   * tracked separately from raw QR scans and showcase impressions.
   */
  featuredStats?: { impressions: number };
  /**
   * Business profile only: each paid extension appends days (and may raise the
   * priority tier). There is always at most ONE profile boost per business —
   * topping it up never creates a second campaign.
   */
  extensions?: Array<{ addedDays: number; tierKey: string; amount: number; at: number }>;
}

export interface ClusterBoostWallet {
  balance: number;
}

export type ClusterBoostPaymentErrorCode =
  | 'insufficient_wallet'
  | 'capacity_full'
  | 'already_boosted'
  | 'item_not_eligible'
  | 'payment_failed';

export interface ClusterBoostPaymentResult {
  ok: boolean;
  code?: ClusterBoostPaymentErrorCode;
  message?: string;
  campaign?: ClusterBoostCampaign;
  /** True when the purchase extended the existing business-profile boost. */
  extension?: boolean;
}

// ---------------------------------------------------------------------------
// Configuration — the single source of truth for slider limits, pricing and
// inventory. No package sizes are hard-coded in the UI.
// ---------------------------------------------------------------------------

export const CLUSTER_BOOST_CONFIG: ClusterBoostConfig = {
  tiers: [
    {
      key: 'standard',
      label: 'Standard priority',
      description: 'Baseline entry weight in the featured rotation.',
      weight: 1,
      pricePerDay: 500,
    },
    {
      key: 'plus',
      label: 'Plus priority',
      description: 'Raised weight so your item is picked more often.',
      weight: 2,
      pricePerDay: 900,
    },
    {
      key: 'premium',
      label: 'Premium priority',
      description: 'Highest configured weight in the cluster rotator.',
      weight: 3,
      pricePerDay: 1400,
    },
  ],
  durations: [
    { key: 'daily', label: 'Daily', days: 1, discountFactor: 1 },
    { key: 'weekly', label: 'Weekly', days: 7, discountFactor: 0.9, discountLabel: '10% off' },
    { key: 'monthly', label: 'Monthly', days: 30, discountFactor: 0.8, discountLabel: '20% off' },
  ],
  maxLiveCampaignsPerItem: 1,
  maxBoostSlotsPerCluster: 8,
  otherMerchantsLiveBoosts: 3,
  walletSeedBalance: 25000,
};

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  CAMPAIGNS: 'vemtap_cluster_boosts_v1',
  WALLET: 'vemtap_cluster_boost_wallet_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

export function getBoostTiers(): ClusterBoostTierConfig[] {
  return CLUSTER_BOOST_CONFIG.tiers;
}

export function getBoostDurations(): ClusterBoostDurationConfig[] {
  return CLUSTER_BOOST_CONFIG.durations;
}

export function getTierByKey(key: string): ClusterBoostTierConfig {
  return (
    CLUSTER_BOOST_CONFIG.tiers.find((tier) => tier.key === key) ??
    CLUSTER_BOOST_CONFIG.tiers[0]
  );
}

export function getDurationByKey(key: ClusterBoostDurationKey): ClusterBoostDurationConfig {
  return (
    CLUSTER_BOOST_CONFIG.durations.find((duration) => duration.key === key) ??
    CLUSTER_BOOST_CONFIG.durations[0]
  );
}

export interface ClusterBoostPrice {
  base: number;
  discountAmount: number;
  total: number;
  days: number;
}

/** Prices a campaign from config — no hard-coded package amounts in the UI. */
export function computeBoostPrice(
  tierKey: string,
  durationKey: ClusterBoostDurationKey
): ClusterBoostPrice {
  const tier = getTierByKey(tierKey);
  const duration = getDurationByKey(durationKey);
  const base = tier.pricePerDay * duration.days;
  const discountAmount = Math.round(base * (1 - duration.discountFactor));
  return {
    base,
    discountAmount,
    total: base - discountAmount,
    days: duration.days,
  };
}

export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDaysIso(startIso: string, days: number): string {
  const start = new Date(`${startIso}T00:00:00`);
  start.setDate(start.getDate() + Math.max(0, days - 1));
  return isoDate(start);
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-US')}`;
}

export interface ClusterBoostEstimate {
  /** Provisional share of featured selections, 0–100. */
  sharePct: number;
  /** Other featured entries the weight competes against right now. */
  competingEntries: number;
  provisional: true;
}

/**
 * Provisional exposure estimate. Derived only from the configured weight and
 * the number of other entries currently shown in the cluster rotator — it is
 * NOT measured traffic and the UI must label it as an estimate.
 */
export function estimateExposureShare(
  weight: number,
  competingEntries: number
): ClusterBoostEstimate {
  const denominator = weight + Math.max(0, competingEntries);
  const sharePct = denominator > 0 ? Math.round((weight / denominator) * 1000) / 10 : 0;
  return { sharePct, competingEntries, provisional: true };
}

// ---------------------------------------------------------------------------
// Eligibility — ownership + cluster membership only. Boosts never bypass the
// admin rotator controls (show/hide stays with the business, slot capacity
// stays with the cluster).
// ---------------------------------------------------------------------------

export interface BoostEligibility {
  eligible: boolean;
  /** Warning that does not block the purchase. */
  warning?: string;
  reason?: string;
}

export function isItemBoostEligible(item: ClusterShowcaseItem): BoostEligibility {
  const state = getClusterState();
  const clusterId = state.currentCluster?.id;
  const today = isoDate(new Date());

  if (item.businessId !== '104') {
    return { eligible: false, reason: 'Not owned by your business' };
  }
  if (clusterId && item.clusterId !== clusterId) {
    return { eligible: false, reason: 'Not part of your current cluster' };
  }
  if (item.expiresAt && item.expiresAt < today) {
    return { eligible: false, reason: 'Listing has expired' };
  }
  if (!item.showInCluster) {
    return {
      eligible: true,
      warning:
        'Hidden from the rotator — the boost raises its priority once you show it in the pool.',
    };
  }
  return { eligible: true };
}

/** Items owned by the current business and eligible in the current cluster. */
export function getBoostEligibleItems(): ClusterShowcaseItem[] {
  return getClusterState().showcaseItems.filter((item) => isItemBoostEligible(item).eligible);
}

// ---------------------------------------------------------------------------
// Capacity — reuses the cluster's own rotator settings as the hard ceiling.
// ---------------------------------------------------------------------------

export interface ClusterBoostCapacity {
  /** Cluster-wide boost inventory from config (purchasable slots). */
  maxBoostSlots: number;
  /** Slots taken by other merchants' live boosts plus your own. */
  takenBoostSlots: number;
  remainingBoostSlots: number;
  /** Rotator display entries — informational, feeds the exposure estimate. */
  maxFeaturedSlots: number;
  activeFeaturedEntries: number;
  rotatorActive: boolean;
  /** Live boosts currently running for this business (informational — there
   * is no per-business cap; boost as many different items as you like). */
  liveForBusiness: number;
  /** True when cluster inventory blocks a new purchase. */
  isBlocked: boolean;
  blockedReason?: string;
}

export function getBoostCapacity(): ClusterBoostCapacity {
  const state = getClusterState();
  const rotator = state.currentCluster?.rotatorSettings;
  const maxFeaturedSlots = rotator?.maxActiveDeals ?? 0;
  const activeFeaturedEntries = state.showcaseItems.filter((item) => item.showInCluster).length;

  const liveForBusiness = listClusterBoostCampaigns().filter((campaign) =>
    isCampaignLive(campaign)
  ).length;

  const maxBoostSlots = CLUSTER_BOOST_CONFIG.maxBoostSlotsPerCluster;
  const takenBoostSlots = CLUSTER_BOOST_CONFIG.otherMerchantsLiveBoosts + liveForBusiness;
  const remainingBoostSlots = Math.max(0, maxBoostSlots - takenBoostSlots);

  let blockedReason: string | undefined;
  if (rotator && !rotator.isActive) {
    blockedReason = 'The cluster rotator is paused by the cluster admin.';
  } else if (remainingBoostSlots <= 0) {
    blockedReason = 'All cluster boost slots are taken right now.';
  }

  return {
    maxBoostSlots,
    takenBoostSlots,
    remainingBoostSlots,
    maxFeaturedSlots,
    activeFeaturedEntries,
    rotatorActive: rotator?.isActive ?? false,
    liveForBusiness,
    isBlocked: Boolean(blockedReason),
    blockedReason,
  };
}

// ---------------------------------------------------------------------------
// Wallet — local demo ledger mirroring the Boost Wallet screen balance.
// BACKEND GAP: replace with the real wallet balance & top-up API.
// ---------------------------------------------------------------------------

export function getClusterBoostWallet(): ClusterBoostWallet {
  return getStored<ClusterBoostWallet>(STORAGE_KEYS.WALLET, {
    balance: CLUSTER_BOOST_CONFIG.walletSeedBalance,
  });
}

function setClusterBoostWallet(wallet: ClusterBoostWallet): void {
  setStored(STORAGE_KEYS.WALLET, wallet);
}

/** Sandbox top-up used by the insufficient-balance path (demo only). */
export function topUpClusterBoostWallet(amount: number): ClusterBoostWallet {
  const wallet = getClusterBoostWallet();
  const next = { balance: wallet.balance + Math.max(0, amount) };
  setClusterBoostWallet(next);
  return next;
}

// ---------------------------------------------------------------------------
// Campaign store
// ---------------------------------------------------------------------------

function isoOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

/**
 * Demo campaigns seeded on first run so My Boosts is populated for the
 * walkthrough. Dates are computed relative to "today" so every status
 * (active / scheduled / completed / pending) always looks correct.
 * Stats stay `null` — real tracking is not connected and nothing is faked.
 */
function buildSeedCampaigns(): ClusterBoostCampaign[] {
  const now = Date.now();
  const state = getClusterState();
  const clusterId = state.currentCluster?.id ?? 'cluster-amaka-mall';
  const clusterName = state.currentCluster?.name ?? 'Amaka Mall Business Cluster';

  const itemFor = (
    id: string,
    fallbackTitle: string,
    fallbackImage: string
  ): { itemId: string; itemTitle: string; itemImage: string; category: ShowcaseEntityType } => {
    const item = state.showcaseItems.find((entry) => entry.id === id);
    return {
      itemId: item?.id ?? id,
      itemTitle: item?.title ?? fallbackTitle,
      itemImage: item?.image ?? fallbackImage,
      category: item?.entityType ?? 'deal',
    };
  };

  const seed = (
    reference: string,
    item: ReturnType<typeof itemFor>,
    tier: ClusterBoostTierConfig,
    duration: ClusterBoostDurationConfig,
    startDate: string,
    status: ClusterBoostStatus,
    createdAtOffsetDays: number,
    extra?: Partial<ClusterBoostCampaign>
  ): ClusterBoostCampaign => ({
    id: `seed-${reference.toLowerCase()}`,
    reference,
    idempotencyKey: `seed_${reference}`,
    clusterId,
    clusterName,
    businessId: '104',
    ...item,
    tierKey: tier.key,
    weight: tier.weight,
    durationKey: duration.key,
    startDate,
    endDate: addDaysIso(startDate, duration.days),
    amount: computeBoostPrice(tier.key, duration.key).total,
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    status,
    estimatedSharePct: Math.round((tier.weight / (tier.weight + 4)) * 100),
    createdAt: now + createdAtOffsetDays * 24 * 60 * 60 * 1000,
    paidAt: now + createdAtOffsetDays * 24 * 60 * 60 * 1000,
    stats: { impressions: null, clicks: null },
    ...extra,
  });

  return [
    // Active — weekly premium boost on the ribs deal, mid-run.
    seed(
      'CLB-7KQ2M',
      itemFor('cdeal-1', 'Smoked BBQ Ribs Platter + Drink', ''),
      getTierByKey('premium'),
      getDurationByKey('weekly'),
      isoOffset(-3),
      'active',
      -4,
      { activatedAt: now - 4 * 24 * 60 * 60 * 1000 }
    ),
    // Scheduled — monthly plus boost on the ribeye, starts soon.
    seed(
      'CLB-3TX9P',
      itemFor('cprod-1', 'Woodfire Aged Ribeye Steak (400g)', ''),
      getTierByKey('plus'),
      getDurationByKey('monthly'),
      isoOffset(5),
      'scheduled',
      -1
    ),
    // Completed — daily plus boost on the wagyu burger, ran yesterday.
    seed(
      'CLB-9WD4R',
      itemFor('cdeal-5', 'Gourmet Wagyu Burger + Handcut Truffle Fries', ''),
      getTierByKey('plus'),
      getDurationByKey('daily'),
      isoOffset(-2),
      'completed',
      -2
    ),
    // Pending — paid, activation queued behind rotator controls.
    seed(
      'CLB-2MH8C',
      itemFor('cprof-1', 'Urban Grill & Bistro — Official Storefront Profile', ''),
      getTierByKey('standard'),
      getDurationByKey('daily'),
      isoOffset(0),
      'pending',
      0,
      {
        activationNote:
          'Payment received — activation is queued behind the cluster rotator controls. You will not be charged again.',
      }
    ),
  ];
}

export function listClusterBoostCampaigns(): ClusterBoostCampaign[] {
  // `null` (never stored) or an empty list (written by the pre-seed build)
  // both trigger the demo seed; the store has no delete path, so an empty
  // list can only come from the earlier version.
  const stored = getStored<ClusterBoostCampaign[] | null>(STORAGE_KEYS.CAMPAIGNS, null);
  const campaigns = stored && stored.length > 0 ? stored : buildSeedCampaigns();
  if (!stored || stored.length === 0) setStored(STORAGE_KEYS.CAMPAIGNS, campaigns);
  return [...campaigns].sort((a, b) => b.createdAt - a.createdAt);
}

export function getClusterBoostCampaign(id: string): ClusterBoostCampaign | undefined {
  return listClusterBoostCampaigns().find((campaign) => campaign.id === id);
}

function saveCampaign(campaign: ClusterBoostCampaign): void {
  const campaigns = getStored<ClusterBoostCampaign[]>(STORAGE_KEYS.CAMPAIGNS, []);
  const index = campaigns.findIndex((entry) => entry.id === campaign.id);
  if (index >= 0) campaigns[index] = campaign;
  else campaigns.unshift(campaign);
  setStored(STORAGE_KEYS.CAMPAIGNS, campaigns);
}

function startOfDay(iso: string): number {
  return new Date(`${iso}T00:00:00`).getTime();
}

/** Live = paid and still within its run window (active or scheduled). */
export function isCampaignLive(campaign: ClusterBoostCampaign): boolean {
  if (campaign.paymentStatus !== 'paid') return false;
  if (campaign.status === 'pending') return false;
  const now = Date.now();
  return startOfDay(campaign.endDate) >= now;
}

/**
 * Effective status shown in My Boosts — derives scheduled/active/completed
 * from the stored dates so campaigns age out without a background job.
 */
export function getCampaignDisplayStatus(
  campaign: ClusterBoostCampaign,
  now: number = Date.now()
): ClusterBoostStatus {
  if (campaign.status === 'pending') return 'pending';
  if (campaign.paymentStatus !== 'paid') return 'pending';
  if (startOfDay(campaign.startDate) > now) return 'scheduled';
  if (startOfDay(campaign.endDate) < now) return 'completed';
  return 'active';
}

export function hasActiveBoostForItem(itemId: string): boolean {
  return listClusterBoostCampaigns().some(
    (campaign) => campaign.itemId === itemId && isCampaignLive(campaign)
  );
}

/** The live boost currently attached to an item, if any. */
export function getLiveBoostForItem(itemId: string): ClusterBoostCampaign | null {
  return (
    listClusterBoostCampaigns().find(
      (campaign) => campaign.itemId === itemId && isCampaignLive(campaign)
    ) ?? null
  );
}

export function countLiveBoosts(): number {
  return listClusterBoostCampaigns().filter((campaign) => isCampaignLive(campaign)).length;
}

// ---------------------------------------------------------------------------
// Featured campaign rotation
//
// Integrates with the existing cluster rotator architecture: featured windows
// reuse the cluster's own `rotationIntervalSeconds` cadence, and eligibility
// follows the existing pool rules (item shown in the rotator, not expired).
// Campaign duration = how long a campaign stays ELIGIBLE to be featured, not
// that it holds the featured slot on every visit.
//
// BACKEND GAP — when the consumer cluster landing (QR destination) ships it
// must call the same getFeaturedCampaignSlot(); real viewability, per-customer
// frequency capping and dedupe should move server-side.
// ---------------------------------------------------------------------------

export interface FeaturedCampaignSlot {
  campaign: ClusterBoostCampaign;
  item: ClusterShowcaseItem;
}

const FEATURED_STORAGE_KEYS = {
  WINDOW: 'vemtap_cluster_boost_featured_window_v1',
  SERVED: 'vemtap_cluster_boost_featured_served_v1',
};

interface FeaturedWindowRecord {
  windowKey: string;
  pickId: string;
}

interface FeaturedServeRecord {
  windowKey: string;
  at: number;
}

/**
 * Returns the campaign currently holding the featured slot, or null when no
 * paid campaign is eligible (the rotator then shows organic listings only).
 *
 * - One campaign at a time; it rotates between windows instead of holding
 *   the slot for the whole campaign duration.
 * - Stable within a window, so a page refresh mid-visit keeps the same
 *   featured campaign and never counts a duplicate impression.
 * - Campaigns that held the previous window are avoided while other
 *   eligible campaigns exist; a single eligible campaign may repeat.
 * - Counts ONE qualifying featured impression per window, separately from
 *   raw QR scans and showcase impressions.
 */
export function getFeaturedCampaignSlot(): FeaturedCampaignSlot | null {
  const state = getClusterState();
  const cluster = state.currentCluster;
  if (!cluster || !cluster.rotatorSettings.isActive) return null;

  const now = Date.now();
  const windowMs = Math.max(cluster.rotatorSettings.rotationIntervalSeconds * 2, 60) * 1000;
  const bucket = Math.floor(now / windowMs);
  const windowKey = String(bucket);
  const previousWindowKey = String(bucket - 1);
  const today = isoDate(new Date());

  const eligible = listClusterBoostCampaigns().filter((campaign) => {
    if (campaign.paymentStatus !== 'paid') return false;
    if (getCampaignDisplayStatus(campaign, now) !== 'active') return false;
    const item = state.showcaseItems.find((entry) => entry.id === campaign.itemId);
    if (!item || !item.showInCluster) return false;
    if (item.expiresAt && item.expiresAt < today) return false;
    return true;
  });
  if (eligible.length === 0) return null;

  const served = getStored<Record<string, FeaturedServeRecord>>(FEATURED_STORAGE_KEYS.SERVED, {});
  const windowRecord = getStored<FeaturedWindowRecord | null>(FEATURED_STORAGE_KEYS.WINDOW, null);

  const heldPick =
    windowRecord?.windowKey === windowKey
      ? eligible.find((campaign) => campaign.id === windowRecord.pickId) ?? null
      : null;

  if (heldPick) {
    const heldItem = state.showcaseItems.find((entry) => entry.id === heldPick.itemId);
    return heldItem ? { campaign: heldPick, item: heldItem } : null;
  }

  // New featured window: choose a campaign that did not hold either of the
  // last two windows while others are eligible; otherwise any of them repeats.
  let pool = eligible.filter(
    (campaign) =>
      served[campaign.id]?.windowKey !== previousWindowKey &&
      served[campaign.id]?.windowKey !== windowKey
  );
  if (pool.length === 0) pool = eligible;
  const pick = pool[bucket % pool.length];
  const item = state.showcaseItems.find((entry) => entry.id === pick.itemId);
  if (!item) return null;

  setStored(FEATURED_STORAGE_KEYS.WINDOW, { windowKey, pickId: pick.id } satisfies FeaturedWindowRecord);
  served[pick.id] = { windowKey, at: now };
  setStored(FEATURED_STORAGE_KEYS.SERVED, served);

  // One qualifying featured impression per campaign per window.
  const featuredCampaign: ClusterBoostCampaign = {
    ...pick,
    featuredStats: { impressions: (pick.featuredStats?.impressions ?? 0) + 1 },
  };
  saveCampaign(featuredCampaign);
  return { campaign: featuredCampaign, item };
}

function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CLB-${suffix}`;
}

export interface ClusterBoostPurchaseInput {
  itemId: string;
  tierKey: string;
  durationKey: ClusterBoostDurationKey;
  /** yyyy-mm-dd. */
  startDate: string;
  paymentMethod: ClusterBoostPaymentMethod;
  /**
   * Stable per-checkout key so a retried submit returns the original result
   * instead of charging again. Generate once per checkout attempt.
   */
  idempotencyKey: string;
}

/**
 * Mock checkout: validates capacity & eligibility, simulates the charge and
 * then attempts activation. Activation failure leaves the campaign 'pending'
 * with the payment recorded — the customer is never charged twice and never
 * told a boost is live before it is.
 */
export function submitClusterBoostPayment(
  input: ClusterBoostPurchaseInput
): Promise<ClusterBoostPaymentResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      // Idempotency: a replayed submit returns the already-charged campaign.
      const existing = listClusterBoostCampaigns().find(
        (campaign) => campaign.idempotencyKey === input.idempotencyKey
      );
      if (existing) {
        resolve({
          ok: existing.paymentStatus === 'paid',
          code: existing.paymentStatus === 'paid' ? undefined : 'payment_failed',
          message:
            existing.paymentStatus === 'paid'
              ? 'This checkout was already processed — no new charge was made.'
              : undefined,
          campaign: existing,
        });
        return;
      }

      const state = getClusterState();
      const cluster = state.currentCluster;
      const item = state.showcaseItems.find((entry) => entry.id === input.itemId);
      if (!item || !cluster || !isItemBoostEligible(item).eligible) {
        resolve({
          ok: false,
          code: 'item_not_eligible',
          message: 'This item can no longer be boosted in your cluster.',
        });
        return;
      }

      const liveForItem = getLiveBoostForItem(item.id);
      // One live boost per item. The business profile is the single exception:
      // buying again while a profile boost is live EXTENDS and upgrades that
      // same boost instead of starting a second campaign.
      const isProfileExtension = item.entityType === 'profile' && liveForItem !== null;
      if (liveForItem && !isProfileExtension) {
        resolve({
          ok: false,
          code: 'already_boosted',
          message: 'This item already has a live cluster boost.',
        });
        return;
      }

      const capacity = getBoostCapacity();
      // Extensions reuse the slot the profile boost already holds, so cluster
      // inventory never blocks topping up your own profile.
      if (!isProfileExtension && capacity.isBlocked) {
        resolve({
          ok: false,
          code: 'capacity_full',
          message: capacity.blockedReason ?? 'No cluster boost capacity is available right now.',
        });
        return;
      }

      const tier = getTierByKey(input.tierKey);
      const duration = getDurationByKey(input.durationKey);
      const price = computeBoostPrice(input.tierKey, input.durationKey);
      const endDate = addDaysIso(input.startDate, duration.days);
      const estimate = estimateExposureShare(
        tier.weight,
        Math.max(0, capacity.activeFeaturedEntries - (item.showInCluster ? 1 : 0))
      );
      const now = Date.now();

      const baseCampaign: ClusterBoostCampaign = {
        id: `cb-${now}-${Math.random().toString(36).slice(2, 7)}`,
        reference: makeReference(),
        idempotencyKey: input.idempotencyKey,
        clusterId: cluster.id,
        clusterName: cluster.name,
        businessId: item.businessId,
        itemId: item.id,
        category: item.entityType,
        itemTitle: item.title,
        itemImage: item.image,
        tierKey: tier.key,
        weight: tier.weight,
        durationKey: duration.key,
        startDate: input.startDate,
        endDate,
        amount: price.total,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'failed',
        status: 'pending',
        estimatedSharePct: estimate.sharePct,
        createdAt: now,
        stats: { impressions: null, clicks: null },
      };

      // --- Simulated charge -------------------------------------------------
      if (input.paymentMethod === 'wallet') {
        const wallet = getClusterBoostWallet();
        if (wallet.balance < price.total) {
          resolve({
            ok: false,
            code: 'insufficient_wallet',
            message: `Wallet balance is ${formatNaira(
              price.total - wallet.balance
            )} short. Top up or pay with a card.`,
          });
          return;
        }
        setClusterBoostWallet({ balance: wallet.balance - price.total });
      }

      // --- Profile extension: charge applied, extend the SAME campaign -----
      // No second boost is created; only the end date, spend and (if heavier)
      // the priority tier increase. No new cluster slot is consumed.
      if (isProfileExtension && liveForItem) {
        const existingTier = getTierByKey(liveForItem.tierKey);
        const keptTier = existingTier.weight >= tier.weight ? existingTier : tier;
        const currentEnd =
          liveForItem.endDate > input.startDate ? liveForItem.endDate : input.startDate;
        const extended: ClusterBoostCampaign = {
          ...liveForItem,
          tierKey: keptTier.key,
          weight: keptTier.weight,
          durationKey: duration.key,
          endDate: addDaysIso(currentEnd, duration.days),
          amount: liveForItem.amount + price.total,
          idempotencyKey: input.idempotencyKey,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'paid',
          paidAt: now,
          estimatedSharePct: Math.max(liveForItem.estimatedSharePct, estimate.sharePct),
          extensions: [
            ...(liveForItem.extensions ?? []),
            { addedDays: duration.days, tierKey: keptTier.key, amount: price.total, at: now },
          ],
        };
        saveCampaign(extended);
        resolve({ ok: true, campaign: extended, extension: true });
        return;
      }

      const paidCampaign: ClusterBoostCampaign = {
        ...baseCampaign,
        paymentStatus: 'paid',
        paidAt: now,
      };
      saveCampaign(paidCampaign);

      // --- Activation (separate step — payment success ≠ activation) --------
      const liveCapacity = getBoostCapacity();
      const canActivate = liveCapacity.rotatorActive && liveCapacity.remainingBoostSlots > 0;
      if (!canActivate) {
        const activationNote =
          'Payment received — activation is queued behind the cluster rotator controls. You will not be charged again.';
        const pendingCampaign = { ...paidCampaign, status: 'pending' as const, activationNote };
        saveCampaign(pendingCampaign);
        resolve({ ok: true, campaign: pendingCampaign });
        return;
      }

      const activated: ClusterBoostCampaign = {
        ...paidCampaign,
        status: startOfDay(input.startDate) > now ? 'scheduled' : 'active',
        activatedAt: now,
      };
      saveCampaign(activated);
      resolve({ ok: true, campaign: activated });
    }, 1200);
  });
}
