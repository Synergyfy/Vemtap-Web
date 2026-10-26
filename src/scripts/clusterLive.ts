import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import {
  clustersService,
  type ClusterCard,
  type ClusterKind,
  type ClusterMember,
  type MyCluster,
  type ShowcaseItem,
  type ShowcasePreference,
} from '../services/clustersService';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useBranches } from '../hooks/business/useBranchesAndTeam';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import type {
  Cluster,
  ClusterBusinessMember,
  ClusterChatMessage,
  ClusterShowcaseItem,
  ClusterStateStore,
  ClusterType,
} from './clusterData';
import type { BoostEligibility, ClusterBoostCampaign, ClusterBoostCapacity } from './clusterBoostData';
import {
  sponsoredKeys,
  useAdWallet,
  useEligibleAssets,
  useSponsoredCampaigns,
  type KindedCampaign,
} from '../hooks/business/useSponsored';
import { sponsoredCampaignsService } from '../services/sponsoredCampaignsService';

/**
 * The cluster store the cluster screens read (`ClusterStateStore`), built from
 * `/business/clusters/*` for the active branch, plus the actions they run.
 * Figures the API does not report (weekly scans, view analytics, unit numbers)
 * stay empty so the screens can show "—".
 */

export const clusterKeys = { all: ['business-clusters'] as const };

/** Neutral tile for items without a photo, so cards never show a broken image. */
const NO_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Cpath d="M11 27l6-7 4 5 3-3 5 5z" fill="%23938f99"/%3E%3Ccircle cx="25" cy="15" r="3" fill="%23938f99"/%3E%3C/svg%3E';

const CATEGORIES: ClusterBusinessMember['category'][] = ['food', 'fashion', 'beauty', 'electronics', 'health', 'services'];

export const toCluster = (mine: MyCluster): Cluster => ({
  id: mine.id,
  name: mine.name,
  slug: mine.id,
  type: (mine.kind || mine.type) as ClusterType,
  city: mine.city,
  state: mine.state,
  address: mine.address,
  coordinates: mine.coordinates,
  radiusMeters: mine.radiusMeters,
  creatorBusinessId: '',
  createdAt: mine.createdAt,
  status: mine.status,
  qrCode: { url: mine.qrCode.url, displayCode: mine.qrCode.displayCode, scansThisWeek: 0, scansTotal: mine.qrCode.scansTotal },
  rotatorSettings: {
    isActive: mine.qrCode.isActive,
    rotationIntervalSeconds: 0,
    maxActiveDeals: 0,
    activeDealsCount: mine.stats.totalDealsInPool,
  },
  stats: {
    totalBusinesses: mine.stats.totalBusinesses,
    activeBusinesses: mine.stats.activeBusinesses,
    totalDealsInPool: mine.stats.totalDealsInPool,
    totalScans: mine.stats.totalScans,
    thisMonthScans: 0,
    avgDealsClaimedPerDay: 0,
  },
  analytics: {
    clusterViews: 0,
    clusterImpressions: 0,
    clusterClicks: 0,
    clusterScans: mine.stats.totalScans,
    businessViews: 0,
    businessImpressions: 0,
    businessClicks: 0,
    businessCtr: 0,
    dailyTrend: [],
  },
  description: mine.description,
});

/** A detected cluster card (no QR or figures yet) in the store's cluster shape. */
export const cardToCluster = (card: ClusterCard): Cluster =>
  toCluster({
    ...card,
    qrCode: { url: '', displayCode: '', scansTotal: 0, isActive: false },
    stats: { totalBusinesses: 0, activeBusinesses: 0, totalDealsInPool: 0, totalScans: 0 },
    membership: { branchId: '', joinedAt: null, showcase: 'all' },
  });

/** The onboarding's "what to show" choice as the backend's showcase preference. */
export const SHOWCASE_PREFERENCE: Record<string, ShowcasePreference> = {
  deal: 'deals',
  product: 'products',
  service: 'services',
  profile: 'profile',
};

const toMember = (member: ClusterMember, clusterId: string): ClusterBusinessMember => ({
  id: member.id,
  businessId: member.branchId,
  clusterId,
  businessName: member.branchName && member.branchName !== member.businessName
    ? `${member.businessName} • ${member.branchName}`
    : member.businessName,
  category: CATEGORIES.find((category) => category === member.category?.toLowerCase()) ?? 'services',
  unitOrSuite: member.unitOrSuite || '—',
  joinedAt: member.joinedAt,
  status: member.status,
  isVerified: member.isVerified,
  logoUrl: member.logoUrl ?? undefined,
  bannerUrl: member.bannerUrl ?? undefined,
  phone: member.phone || '—',
  email: member.email || '—',
  hours: '—',
  bio: member.bio || '',
  dealsCount: member.dealsCount,
  scansContributed: 0,
  topOffers: [],
});

const toShowcaseItem = (item: ShowcaseItem, clusterId: string, businessName: string): ClusterShowcaseItem => ({
  id: item.id,
  clusterId,
  businessId: 'self',
  businessName,
  entityType: item.entityType,
  title: item.title,
  price: Number(item.price) || 0,
  image: item.image || NO_IMAGE,
  category: item.entityType,
  status: item.showInCluster ? 'in_rotator' : 'hidden',
  showInCluster: item.showInCluster,
  views: 0,
  impressions: 0,
  clicks: 0,
  submittedAt: '',
  expiresAt: '',
});

export function useLiveCluster() {
  const live = hasApiConfig();
  const { activeBranchId } = useBusinessBranch();
  const business = useMyBusiness();
  const branches = useBranches();
  const queryClient = useQueryClient();
  const scope = activeBranchId ?? 'none';
  const enabled = live && Boolean(activeBranchId);

  const detection = useQuery({
    queryKey: [...clusterKeys.all, 'detect', scope],
    queryFn: () => clustersService.detect(activeBranchId),
    enabled,
  });
  const mine = useQuery({
    queryKey: [...clusterKeys.all, 'mine', scope],
    // 404 means "not in a cluster yet", which is an answer, not an error.
    queryFn: () => clustersService.mine(activeBranchId).catch((error: { status?: number }) => {
      if (error?.status === 404) return null;
      throw error;
    }),
    enabled,
  });
  const clusterId = mine.data?.id;
  const members = useQuery({
    queryKey: [...clusterKeys.all, 'members', clusterId],
    queryFn: () => clustersService.members(clusterId as string, { limit: 100, branchId: activeBranchId }),
    enabled: enabled && Boolean(clusterId),
  });
  const showcase = useQuery({
    queryKey: [...clusterKeys.all, 'showcase', scope],
    queryFn: () => clustersService.showcase(activeBranchId),
    enabled,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: clusterKeys.all });
  const businessName = business.data?.name ?? 'Your business';

  const cluster = mine.data ? toCluster(mine.data) : null;
  const memberRows = (members.data?.data ?? []).map((member) => toMember(member, clusterId ?? ''));
  const self = (members.data?.data ?? []).find((member) => member.isSelf);
  const items = (showcase.data?.items ?? []).map((item) => toShowcaseItem(item, clusterId ?? '', businessName));
  const detected = detection.data?.cluster;

  const state: ClusterStateStore = {
    currentCluster: cluster,
    isMember: Boolean(cluster),
    memberRecord: self ? toMember(self, clusterId ?? '') : null,
    members: memberRows,
    showcaseItems: items,
    deals: items,
    allClusters: cluster ? [cluster] : [],
    scenario: cluster ? 'already_joined' : detection.data?.scenario === 'detected' ? 'detected' : 'not_found',
    showcasePreference: showcase.data?.preference ?? mine.data?.membership.showcase ?? 'all',
  };

  const join = useMutation({
    mutationFn: (id: string) => clustersService.join(id, activeBranchId),
    onSuccess: refresh,
  });
  const leave = useMutation({ mutationFn: () => clustersService.leave(activeBranchId), onSuccess: refresh });
  const propose = useMutation({
    mutationFn: (input: { name: string; address: string; kind: ClusterKind; description?: string }) => {
      const branch = (branches.data ?? []).find((row) => row.id === activeBranchId);
      const latitude = Number(branch?.latitude);
      const longitude = Number(branch?.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (!latitude && !longitude)) {
        return Promise.reject(new Error('Add this branch’s map location first, then propose a cluster.'));
      }
      return clustersService.propose(
        { ...input, city: branch?.city ?? undefined, state: branch?.state ?? undefined, latitude, longitude },
        activeBranchId,
      );
    },
    onSuccess: refresh,
  });
  const toggleItem = useMutation({
    mutationFn: (item: ClusterShowcaseItem) =>
      clustersService.updateShowcase(
        [{ type: item.entityType as ShowcaseItem['entityType'], id: item.id, show: !item.showInCluster }],
        activeBranchId,
      ),
    onSuccess: refresh,
  });
  const setPreference = useMutation({
    mutationFn: (preference: ShowcasePreference) => clustersService.setPreference(preference, activeBranchId),
    onSuccess: refresh,
  });

  return {
    live,
    state,
    loading: detection.isLoading || mine.isLoading,
    error: detection.error ?? mine.error ?? members.error ?? showcase.error,
    detected: detected ? cardToCluster(detected) : null,
    detectReason: detection.data?.reason ?? null,
    refresh,
    join,
    leave,
    propose,
    toggleItem,
    setPreference,
  };
}

/** Messages with another branch in the cluster, oldest first, in the chat modal's shape. */
export function useClusterChat(clusterId: string | undefined, otherBranchId: string, otherName: string) {
  const { activeBranchId } = useBusinessBranch();
  const business = useMyBusiness();
  const queryClient = useQueryClient();
  const key = [...clusterKeys.all, 'chat', clusterId, otherBranchId];
  const messages = useQuery({
    queryKey: key,
    queryFn: () => clustersService.chat(clusterId as string, otherBranchId, activeBranchId),
    enabled: hasApiConfig() && Boolean(clusterId),
    refetchInterval: 15_000,
  });
  const selfName = business.data?.name ?? 'You';
  const rows: ClusterChatMessage[] = (messages.data?.data ?? []).map((message) => ({
    id: message.id,
    senderBusinessId: message.senderBranchId,
    senderBusinessName: message.isSelf ? selfName : otherName,
    recipientBusinessId: message.recipientBranchId,
    recipientBusinessName: message.isSelf ? otherName : selfName,
    text: message.text,
    timestamp: message.timestamp,
    isSelf: message.isSelf,
  }));
  const send = useMutation({
    mutationFn: (body: string) => clustersService.send(clusterId as string, otherBranchId, body, activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return { messages: rows, send, error: messages.error };
}

/**
 * Live stand-ins for the local boost helpers the cluster screens call: live
 * boost count, whether an item already has a running boost, and eligibility.
 */
export function liveBoostHelpers(campaigns: KindedCampaign[]) {
  const running = campaigns.filter((campaign) => campaign.status === 'Active' || campaign.status === 'Pending');
  const boosted = new Set(running.flatMap((campaign) => (campaign.assets ?? []).map((asset) => asset.id)));
  return {
    count: running.length,
    hasActiveBoostForItem: (itemId: string) => boosted.has(itemId),
    isItemBoostEligible: (item: ClusterShowcaseItem): BoostEligibility =>
      item.showInCluster
        ? { eligible: true }
        : {
            eligible: true,
            warning: 'Hidden from the rotator — the boost raises its priority once you show it in the pool.',
          },
  };
}

/**
 * Live data and checkout for the cluster boost purchase flow: what can be
 * boosted (eligible assets), the Boost Wallet balance, and a purchase that
 * creates a boost aimed at the cluster and launches it from the wallet (or
 * card, which may hand back a Paystack checkout).
 */
export function useLiveClusterBoost() {
  const live = hasApiConfig();
  const cluster = useLiveCluster();
  const assets = useEligibleAssets();
  const sponsored = useSponsoredCampaigns();
  const wallet = useAdWallet();
  const queryClient = useQueryClient();
  const current = cluster.state.currentCluster;
  const shown = new Map(cluster.state.showcaseItems.map((item) => [item.id, item.showInCluster]));
  const helpers = liveBoostHelpers(sponsored.data ?? []);

  const eligibleItems: ClusterShowcaseItem[] = (assets.data ?? []).map((asset) => ({
    id: asset.id,
    clusterId: current?.id ?? '',
    businessId: 'self',
    businessName: '',
    entityType: asset.type,
    title: asset.title,
    price: Number(asset.price) || 0,
    oldPrice: asset.wasPrice ? Number(asset.wasPrice) : undefined,
    image: asset.image || NO_IMAGE,
    category: asset.type,
    status: shown.get(asset.id) === false ? 'hidden' : 'in_rotator',
    showInCluster: shown.get(asset.id) ?? asset.type === 'profile',
    views: 0,
    impressions: 0,
    clicks: 0,
    submittedAt: '',
    expiresAt: '',
  }));

  const capacity: ClusterBoostCapacity = {
    maxBoostSlots: 0,
    takenBoostSlots: 0,
    remainingBoostSlots: 0,
    maxFeaturedSlots: 0,
    activeFeaturedEntries: current?.stats.totalDealsInPool ?? 0,
    rotatorActive: current?.rotatorSettings.isActive ?? false,
    liveForBusiness: helpers.count,
    isBlocked: false,
  };

  const purchase = useMutation({
    mutationFn: async (input: {
      item: ClusterShowcaseItem;
      tierKey: string;
      weight: number;
      durationKey: ClusterBoostCampaign['durationKey'];
      days: number;
      startDate: string;
      endDate: string;
      amount: number;
      paymentMethod: ClusterBoostCampaign['paymentMethod'];
      estimatedSharePct: number;
      idempotencyKey: string;
    }) => {
      if (!current) throw new Error('Join a cluster before boosting in it.');
      const today = new Date().toISOString().slice(0, 10);
      const draft = await sponsoredCampaignsService.createBoost({
        name: `${input.item.title} — ${current.name}`,
        goalId: 'views',
        assets: [{ type: input.item.entityType, id: input.item.id }],
        audience: { strategy: 'nearby', clusterIds: [current.id] },
        placements: ['feed'],
        schedule: {
          durationDays: input.days,
          instantLaunch: input.startDate <= today,
          ...(input.startDate > today ? { startAt: `${input.startDate}T00:00:00` } : {}),
        },
        budgetMode: 'total',
        budget: input.amount,
      });
      const launched = await sponsoredCampaignsService.launch('boost', draft.id, input.paymentMethod);
      const campaign: ClusterBoostCampaign = {
        id: launched.id,
        reference: launched.checkout?.reference ?? `#${launched.id.slice(0, 8).toUpperCase()}`,
        idempotencyKey: input.idempotencyKey,
        clusterId: current.id,
        clusterName: current.name,
        businessId: 'self',
        itemId: input.item.id,
        category: input.item.entityType,
        itemTitle: input.item.title,
        itemImage: input.item.image,
        tierKey: input.tierKey,
        weight: input.weight,
        durationKey: input.durationKey,
        startDate: input.startDate,
        endDate: input.endDate,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'paid',
        status: launched.status === 'Active' ? (input.startDate > today ? 'scheduled' : 'active') : 'pending',
        activationNote: launched.awaitingPayment ? 'Finish the card payment to start this boost.' : undefined,
        estimatedSharePct: input.estimatedSharePct,
        createdAt: Date.now(),
        stats: { impressions: null, clicks: null },
      };
      return { campaign, checkoutUrl: launched.checkout?.authorizationUrl ?? null };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sponsoredKeys.all }),
  });

  return {
    live,
    cluster: current,
    eligibleItems,
    capacity,
    hasActiveBoostForItem: helpers.hasActiveBoostForItem,
    isItemBoostEligible: helpers.isItemBoostEligible,
    walletBalance: Number(wallet.data?.spendable ?? 0) || 0,
    walletLoaded: Boolean(wallet.data),
    purchase,
    error: cluster.error ?? assets.error ?? wallet.error,
  };
}

/** Live boosts aimed at a cluster, in the My Boosts list's campaign shape. */
export function useLiveClusterBoosts() {
  const live = hasApiConfig();
  const sponsored = useSponsoredCampaigns();
  const assets = useEligibleAssets();
  const cluster = useLiveCluster();
  const clusterName = cluster.state.currentCluster?.name ?? 'Your cluster';
  const today = new Date().toISOString().slice(0, 10);

  const campaigns: ClusterBoostCampaign[] = (sponsored.data ?? [])
    .filter((row) => row.kind === 'boost' && (row.audience?.clusterIds?.length ?? 0) > 0)
    .map((row) => {
      const first = row.assets?.[0];
      const asset = (assets.data ?? []).find((entry) => entry.id === first?.id);
      const start = (row.startDate ?? row.createdAt ?? new Date().toISOString()).slice(0, 10);
      const end = (row.endDate ?? start).slice(0, 10);
      const ended = row.status === 'Ended';
      return {
        id: row.id,
        reference: `#${row.id.slice(0, 8).toUpperCase()}`,
        idempotencyKey: row.id,
        clusterId: row.audience?.clusterIds?.[0] ?? '',
        clusterName,
        businessId: 'self',
        itemId: first?.id ?? '',
        category: first?.type ?? 'profile',
        itemTitle: asset?.title ?? row.name,
        itemImage: asset?.image || NO_IMAGE,
        tierKey: '',
        weight: 0,
        durationKey: 'daily',
        startDate: start,
        // An ended run closes on its end date (or today if it stopped early).
        endDate: ended && end > today ? today : end,
        amount: Number(row.budget ?? 0) || 0,
        paymentMethod: 'wallet',
        paymentStatus: row.status === 'Draft' || row.awaitingPayment ? 'failed' : 'paid',
        status: row.status === 'Pending' || row.status === 'Draft' ? 'pending' : 'active',
        activationNote: row.awaitingPayment ? 'Finish the card payment to start this boost.' : undefined,
        estimatedSharePct: 0,
        createdAt: new Date(row.createdAt ?? Date.now()).getTime(),
        stats: { impressions: row.impressions ?? null, clicks: row.clicks ?? null },
      } satisfies ClusterBoostCampaign;
    });

  return { live, campaigns, error: sponsored.error ?? assets.error };
}
