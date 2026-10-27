import type { EligibleAsset } from '../services/promotionCampaignsService';
import type { BoostOptions, CampaignStats } from '../services/sponsoredCampaignsService';
import type { KindedCampaign } from '../hooks/business/useSponsored';
import { formatNaira } from '../utils/format';

/**
 * Display values for live boosts and promotions, shared by the Boost and
 * Campaign hub screens so each maps a real campaign into its own card shape.
 */

export type HubStatus = 'active' | 'scheduled' | 'completed' | 'draft';

const DAY = 86_400_000;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Which hub tab a campaign sits on; paused runs stay with the active ones. */
export const hubStatus = (campaign: KindedCampaign, now = Date.now()): HubStatus => {
  if (campaign.status === 'Draft') return 'draft';
  if (campaign.status === 'Ended') return 'completed';
  if (campaign.status === 'Pending') return 'scheduled';
  if (campaign.startDate && new Date(campaign.startDate).getTime() > now) return 'scheduled';
  return 'active';
};

/** "Active • 3 days left" / "Paused" / "Starts Oct 30" / "Ended Oct 20" / "Draft". */
export const statusLabel = (campaign: KindedCampaign, now = Date.now()) => {
  if (campaign.status === 'Draft') return 'Draft';
  if (campaign.status === 'Paused') return 'Paused';
  if (campaign.status === 'Pending') return campaign.awaitingPayment ? 'Awaiting payment' : 'Pending';
  if (campaign.status === 'Ended') return campaign.endDate ? `Ended ${shortDate(campaign.endDate)}` : 'Ended';
  if (campaign.startDate && new Date(campaign.startDate).getTime() > now) return `Starts ${shortDate(campaign.startDate)}`;
  if (!campaign.endDate) return 'Active';
  const days = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - now) / DAY));
  return `Active • ${days} day${days === 1 ? '' : 's'} left`;
};

export const goalLabel = (campaign: KindedCampaign, options?: BoostOptions) =>
  options?.goals?.find((goal) => goal.id === campaign.goalId)?.label ??
  options?.objectives?.find((objective) => objective.id === campaign.objective)?.label ??
  (campaign.kind === 'boost' ? 'Boost' : 'Campaign');

const ASSET_TYPE_LABEL: Record<string, string> = {
  deal: 'Deal',
  product: 'Product',
  service: 'Service',
  profile: 'Storefront profile',
};

const ASSET_ICON: Record<string, string> = {
  deal: 'local_offer',
  product: 'restaurant',
  service: 'design_services',
  profile: 'storefront',
};

/** The first promoted asset, named from the eligible-assets list. */
export const primaryAsset = (campaign: KindedCampaign, assets: EligibleAsset[] = []) => {
  const first = campaign.assets?.[0];
  if (!first) return null;
  const found = assets.find((asset) => asset.id === first.id);
  return {
    title: found?.title ?? ASSET_TYPE_LABEL[first.type] ?? 'Promoted item',
    image: found?.image ?? null,
    typeLabel: ASSET_TYPE_LABEL[first.type] ?? 'Item',
    icon: ASSET_ICON[first.type] ?? 'local_offer',
    more: (campaign.assets?.length ?? 1) - 1,
  };
};

export const audienceLabel = (campaign: KindedCampaign, branchName: (id: string) => string | undefined) => {
  const audience = campaign.audience ?? {};
  if (audience.strategy === 'segments' && audience.segmentIds?.length)
    return `${audience.segmentIds.length} customer segment${audience.segmentIds.length === 1 ? '' : 's'}`;
  const branches = (audience.branchIds ?? []).map(branchName).filter(Boolean).join(', ');
  const radius = audience.radiusKm ? `Nearby customers (${audience.radiusKm} km radius)` : 'Nearby customers';
  return branches ? `${radius} • ${branches}` : radius;
};

export const placementsLabel = (campaign: KindedCampaign, options?: BoostOptions) =>
  (campaign.placements ?? [])
    .map((id) => options?.placements.find((placement) => placement.id === id)?.label ?? id)
    .join(', ') || 'All placements';

export const scheduleLabel = (campaign: KindedCampaign) => {
  if (campaign.startDate && campaign.endDate) return `${shortDate(campaign.startDate)} – ${shortDate(campaign.endDate)}`;
  const days = campaign.schedule?.durationDays;
  return days ? `${days} days once launched` : 'Not scheduled yet';
};

export const campaignBudget = (campaign: KindedCampaign) => Number(campaign.budget ?? 0) || 0;
export const campaignSpent = (campaign: KindedCampaign) => Number(campaign.spent ?? 0) || 0;

/** Spent as a share of budget, 0–100. */
export const spentPercent = (campaign: KindedCampaign) => {
  const budget = campaignBudget(campaign);
  return budget ? Math.min(100, Math.round((campaignSpent(campaign) / budget) * 100)) : 0;
};

const count = (value?: number | null) => (value ?? 0).toLocaleString('en-US');

/** Reach, clicks, orders and conversion rate for a campaign card. */
export const campaignKpis = (campaign: KindedCampaign) => {
  const clicks = campaign.clicks ?? 0;
  const conversions = campaign.conversions ?? 0;
  return [
    { label: 'Reach', value: count(campaign.impressions) },
    { label: 'Clicks', value: count(clicks) },
    { label: 'Orders', value: count(conversions), valueClass: 'text-primary' },
    {
      label: 'Conv.',
      value: clicks ? `${((conversions / clicks) * 100).toFixed(1)}%` : '—',
      valueClass: 'text-badge-discount-text',
    },
  ];
};

export type CampaignStep = 'launch' | 'pause' | 'resume' | 'end';

/** The one lifecycle action a card's Manage button runs, if any. */
export const manageAction = (campaign: KindedCampaign): { label: string; icon: string; step: CampaignStep | null } => {
  switch (campaign.status) {
    case 'Active':
      return { label: 'Pause', icon: 'pause_circle', step: 'pause' };
    case 'Paused':
      return { label: 'Resume', icon: 'play_circle', step: 'resume' };
    case 'Draft':
      return { label: 'Launch', icon: 'rocket_launch', step: 'launch' };
    case 'Pending':
      return { label: campaign.awaitingPayment ? 'Awaiting payment' : 'Pending', icon: 'hourglass_top', step: null };
    default:
      return { label: 'Ended', icon: 'flag', step: null };
  }
};

export const STEP_DONE: Record<CampaignStep, string> = {
  launch: 'launched',
  pause: 'paused',
  resume: 'resumed',
  end: 'ended',
};

export const nairaLabel = (value: number) => formatNaira(value);

/** "18.4k" for compact reach figures. */
export const compactCount = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : value.toLocaleString('en-US');

/** The fields both hub screens' campaign cards share. */
interface HubCardShape {
  key: string;
  status: HubStatus;
  statusLabel: string;
  image: string;
  goal: string;
  title: string;
  contentName: string;
  contentSub: string;
  contentIcon: string;
  meta: { icon: string; text: string }[];
  spent: number;
  total: number;
  kpis: { label: string; value: string; valueClass?: string }[];
  manageLabel: string;
  manageIcon: string;
  live?: KindedCampaign;
}

/** A live campaign in a hub card, styled like the sample card it is given. */
export function liveHubCard<T extends HubCardShape>(
  template: T,
  campaign: KindedCampaign,
  context: { options?: BoostOptions; assets?: EligibleAsset[]; branchName: (id: string) => string | undefined; fallbackImage: string },
): T {
  const asset = primaryAsset(campaign, context.assets);
  const manage = manageAction(campaign);
  return {
    ...template,
    key: `${campaign.kind}-${campaign.id}`,
    status: hubStatus(campaign),
    statusLabel: statusLabel(campaign),
    image: asset?.image || context.fallbackImage,
    goal: goalLabel(campaign, context.options),
    title: campaign.name,
    contentName: asset ? `${asset.title}${asset.more > 0 ? ` + ${asset.more} more` : ''}` : 'No item selected',
    contentSub: asset ? `${asset.typeLabel} • ${campaign.kind === 'boost' ? 'Boost' : 'Promotion'}` : '—',
    contentIcon: asset?.icon ?? 'local_offer',
    meta: [
      { icon: 'groups', text: audienceLabel(campaign, context.branchName) },
      { icon: 'ads_click', text: placementsLabel(campaign, context.options) },
      { icon: 'schedule', text: scheduleLabel(campaign) },
    ],
    spent: campaignSpent(campaign),
    total: campaignBudget(campaign),
    kpis: campaignKpis(campaign),
    manageLabel: manage.label,
    manageIcon: manage.icon,
    live: campaign,
  };
}

const pctText = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

/** Six 4-hour windows of the day, for the traction rhythm chart. */
const RHYTHM_WINDOWS = ['12–4 AM', '4–8 AM', '8 AM–12', '12–4 PM', '4–8 PM', '8 PM–12'];

/** A campaign's `GET …/stats` turned into the metrics screens' figures. */
export function metricsView(stats: CampaignStats | undefined, campaign: KindedCampaign | undefined, options?: BoostOptions) {
  const kpis = stats?.kpis;
  const spent = Number(kpis?.spent ?? campaign?.spent ?? 0) || 0;
  const budget = Number(kpis?.budget ?? campaign?.budget ?? 0) || 0;
  const left = Number(kpis?.left ?? Math.max(0, budget - spent)) || 0;
  const funnel = stats?.funnel ?? [];
  const top = funnel[0]?.value ?? 0;
  const claims = funnel.find((stage) => stage.id === 'claims')?.value ?? funnel[funnel.length - 1]?.value ?? 0;
  const redemptions = kpis?.redemptions ?? 0;
  const costPerClaim = claims ? spent / claims : null;
  const benchmark = stats?.benchmark ? Number(stats.benchmark.costPerClaim) || null : null;
  const previousReach = stats?.previous?.reach ?? 0;
  const reach = kpis?.reach ?? 0;

  const windows = RHYTHM_WINDOWS.map((label, index) => {
    const hours = (stats?.rhythm ?? []).filter((slot) => Math.floor(slot.hour / 4) === index);
    return {
      label,
      views: hours.reduce((sum, slot) => sum + (slot.views ?? 0), 0),
      claims: hours.reduce((sum, slot) => sum + slot.claims, 0),
    };
  });
  const maxViews = Math.max(1, ...windows.map((slot) => slot.views));
  const maxClaims = Math.max(1, ...windows.map((slot) => slot.claims));
  const totalClaims = windows.reduce((sum, slot) => sum + slot.claims, 0);
  const peak = totalClaims ? windows.reduce((best, slot) => (slot.claims > best.claims ? slot : best), windows[0]) : null;

  const branchClaims = (stats?.byBranch ?? []).reduce((sum, row) => sum + row.claims, 0);

  return {
    title: campaign?.name ?? '—',
    idLabel: campaign ? `#${campaign.id.slice(0, 8).toUpperCase()}` : '—',
    goal: campaign ? goalLabel(campaign, options) : '—',
    status: campaign ? statusLabel(campaign) : 'No campaign yet',
    isActive: campaign?.status === 'Active',
    isPaused: campaign?.status === 'Paused',
    canEnd: campaign ? ['Active', 'Paused', 'Pending'].includes(campaign.status) : false,
    spent,
    budget,
    left,
    percentConsumed: kpis?.percentConsumed ?? (budget ? Math.round((spent / budget) * 100) : 0),
    redemptions,
    revenue: Number(kpis?.grossRevenue ?? 0) || 0,
    reach,
    reachTrend: previousReach ? `${reach >= previousReach ? '+' : ''}${(((reach - previousReach) / previousReach) * 100).toFixed(1)}% vs previous run` : '',
    costPerClaim,
    benchmark,
    cheaperChip:
      costPerClaim != null && benchmark ? `${Math.abs(Math.round((1 - costPerClaim / benchmark) * 100))}% ${costPerClaim <= benchmark ? 'Cheaper' : 'Dearer'}` : '',
    funnel: funnel.map((stage) => ({
      label: stage.label,
      value: stage.value.toLocaleString('en-US'),
      pct: top ? pctText(Math.round((stage.value / top) * 1000) / 10) : '0%',
      width: top ? Math.max(2, (stage.value / top) * 100) : 0,
    })),
    claims,
    redeemedShare: claims ? Math.round((redemptions / claims) * 1000) / 10 : 0,
    rhythm: windows.map((slot) => ({
      label: slot.label,
      views: Math.round((slot.views / maxViews) * 100),
      claims: Math.round((slot.claims / maxClaims) * 100),
      peak: peak?.label === slot.label,
    })),
    peak: peak
      ? { label: peak.label, claims: peak.claims, share: pctText(Math.round((peak.claims / totalClaims) * 1000) / 10) }
      : null,
    branches: (stats?.byBranch ?? []).map((row) => ({
      key: row.branchId,
      name: row.name,
      pct: branchClaims ? Math.round((row.claims / branchClaims) * 100) : 0,
      diners: `${row.claims.toLocaleString('en-US')} claim${row.claims === 1 ? '' : 's'}`,
    })),
  };
}
