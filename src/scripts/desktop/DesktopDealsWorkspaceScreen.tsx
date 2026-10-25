import { useState, type ReactNode } from 'react';
import { FilterMenu } from '../../components/FilterMenu';
import { Icon } from '../../components/ui/Icon';
import { MerchantPortalChrome } from './MerchantPortalChrome';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { hasApiConfig } from '../../services/api/client';
import { useOfferMutations, useOfferSummary, useOffers } from '../../hooks/business/useOffers';
import { useBusinessAnalytics } from '../../hooks/business/useBusinessAnalytics';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { apiErrorMessage } from '../../services/errorMessages';
import type { BusinessOffer } from '../../services/offersService';
import {
  dealBadgeLabel,
  isOfferPaused,
  offerClaimStats,
  offerComparePriceLabel,
  offerPriceLabel,
  offerScheduleLabel,
  offerSlot,
  pricingTypeLabel,
} from '../catalogueLive';
import { downloadCsv } from '../../utils/exportCsv';

interface DesktopDealsWorkspaceScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onCreateDeal?: () => void;
  /** Receive the live deal's group id (undefined in demo). */
  onEditDeal?: (dealGroupId?: string) => void;
  onOpenDealDetail?: (dealGroupId?: string) => void;
  onOpenLogs?: () => void;
  onOpenPos?: () => void;
  /** Opens the Boost Studio; the deal's name pre-selects it in the campaign. */
  onBoost?: (dealName?: string) => void;
}

// Telemetry backing the three live deal cards above — used by "Export Stats".
const DEAL_STATS: Array<{ title: string; promo: string; price: string; oldPrice: string; branches: string; performance: string }> = [
  {
    title: 'Weekend Prime Lunch Combo',
    promo: '20% OFF',
    price: '₦9,600',
    oldPrice: '₦12,000',
    branches: 'Wuse II, Garki & Maitama',
    performance: '89 / 128 redeemed (70%) • 39 vouchers pending',
  },
  {
    title: '2-for-1 Smash Burger Thursday',
    promo: '50% BOGO',
    price: '₦6,500',
    oldPrice: '₦13,000',
    branches: 'Wuse II Branch only',
    performance: '412 total claims • 84% boost cap taken',
  },
  {
    title: 'After-Work Chill Pass',
    promo: '22% OFF',
    price: '₦4,200',
    oldPrice: '₦5,400',
    branches: 'Maitama & Wuse II',
    performance: '78 claims today • 75% daily cap reached',
  },
];

interface DealCardProps {
  image: string;
  imageAlt: string;
  accent?: ReactNode;
  badges: ReactNode;
  dateBadge: ReactNode;
  priceLabel: string;
  price: string;
  oldPrice?: string;
  priceNote: string;
  category: string;
  status: ReactNode;
  title: string;
  branches: ReactNode;
  telemetry: ReactNode;
  primaryAction: ReactNode;
  pausedLabel?: string;
  onEdit?: () => void;
  onPause?: () => void;
  onMore?: () => void;
  paused: boolean;
}

/** Neutral image until a live deal has a photo. */
const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

function DealCard({
  image,
  imageAlt,
  accent,
  badges,
  dateBadge,
  priceLabel,
  price,
  oldPrice,
  priceNote,
  category,
  status,
  title,
  branches,
  telemetry,
  primaryAction,
  onEdit,
  onPause,
  onMore,
  paused,
}: DealCardProps) {
  return (
    <article className="bg-surface-canvas rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(13,37,76,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(13,37,76,0.12)] transition-all duration-300 flex flex-col justify-between group relative">
      {accent}
      <div>
        <div className="relative h-56 w-full overflow-hidden bg-surface-container">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={imageAlt}
            src={image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute top-space-sm left-space-sm flex flex-wrap gap-1.5 items-center">{badges}</div>
          <div className="absolute top-space-sm right-space-sm">{dateBadge}</div>
          <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-end justify-between text-on-primary">
            <div>
              <span className="font-caption text-caption text-on-primary/80 uppercase tracking-wider block">{priceLabel}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-lg text-heading-lg font-bold leading-tight">{price}</span>
                {oldPrice && <span className="font-body-md text-body-md line-through text-on-primary/70">{oldPrice}</span>}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-canvas/20 backdrop-blur-md font-caption text-caption text-on-primary">
              {priceNote}
            </span>
          </div>
        </div>

        <div className="p-space-lg flex flex-col gap-space-md">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">{category}</span>
              {status}
            </div>
            <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold group-hover:text-primary transition-colors">
              {title}
            </h2>
          </div>

          <div className="flex items-start gap-space-xs text-text-secondary bg-surface-subtle p-2.5 rounded-xl font-label-sm text-label-sm">
            {branches}
          </div>

          <div className="bg-surface-subtle p-space-sm rounded-xl flex flex-col gap-2">{telemetry}</div>
        </div>
      </div>

      <div className="p-space-lg pt-0 flex items-center justify-between gap-space-xs">
        {primaryAction}
        <button
          type="button"
          onClick={onEdit}
          className="h-11 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1 transition-colors"
          title="Edit Deal"
        >
          <Icon name="edit" className="text-[18px]" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          type="button"
          onClick={onPause}
          className="h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
          title={paused ? 'Resume Deal' : 'Pause Deal'}
        >
          <Icon name={paused ? 'play_arrow' : 'pause'} className="text-[18px]" />
        </button>
        <button
          type="button"
          onClick={onMore}
          className="h-11 w-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary flex items-center justify-center transition-colors"
          title="More Options"
        >
          <Icon name="more_vert" className="text-[20px]" />
        </button>
      </div>
    </article>
  );
}

export function DesktopDealsWorkspaceScreen({
  onNav,
  onCreateDeal,
  onEditDeal,
  onOpenDealDetail,
  onOpenLogs,
  onOpenPos,
  onBoost,
}: DesktopDealsWorkspaceScreenProps) {
  const [statusTab, setStatusTab] = useState<'active' | 'scheduled' | 'expired'>('active');
  const [pausedDeals, setPausedDeals] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const togglePause = (key: string) => setPausedDeals((prev) => ({ ...prev, [key]: !prev[key] }));

  // Live: the active branch's real deals and deal totals; demo keeps the sample cards.
  const live = hasApiConfig();
  const offersQuery = useOffers();
  const summaryQuery = useOfferSummary();
  const offerMutations = useOfferMutations();
  const locations = useBusinessAnalytics('locations', 30);
  const { branches } = useBusinessBranch();
  const liveOffers = offersQuery.data ?? [];
  const summary = summaryQuery.data;
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const showLiveToast = (message: string) => {
    setLiveToast(message);
    window.setTimeout(() => setLiveToast(null), 3500);
  };
  const totalClaims = liveOffers.reduce((sum, offer) => sum + (offer.claimedCount ?? 0), 0);
  const totalRedeemed = liveOffers.reduce((sum, offer) => sum + (offer.redeemedCount ?? 0), 0);
  const naira = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;
  const groupId = (offer: BusinessOffer) => offer.dealGroupId ?? offer.id;
  const toggleLivePause = (offer: BusinessOffer) =>
    offerMutations.setStatus.mutate(
      { id: offer.id, status: isOfferPaused(offer) ? 'active' : 'inactive' },
      { onError: (error) => showLiveToast(apiErrorMessage(error, 'Could not update this deal.')) },
    );

  /**
   * The deal cards further down are composed inline rather than mapped from a
   * list, so the searchable metadata for each one is declared here and the
   * command-deck controls filter against it. A future deals API would replace
   * both this table and the cards with a single mapped source.
   */
  const WORKSPACE_DEALS: Array<{ id: string; branch: string; haystack: string }> = [
    { id: 'wuse', branch: 'all', haystack: 'weekend prime lunch combo all 3 active branches' },
    { id: 'smash', branch: 'wuse', haystack: '2-for-1 smash burger thursday wuse ii branch only' },
    { id: 'chill', branch: 'wuse-maitama', haystack: 'after-work chill pass maitama wuse ii' },
  ];

  const branchChoices = [
    { value: '', label: 'All branches' },
    { value: 'all', label: 'Runs on every branch' },
    { value: 'wuse', label: 'Wuse II only' },
    { value: 'wuse-maitama', label: 'Wuse II & Maitama' },
  ];

  const query = search.trim().toLowerCase();

  const matchesDeal = (id: string) => {
    const deal = WORKSPACE_DEALS.find((entry) => entry.id === id);
    if (!deal) return true;
    if (branchFilter !== '' && deal.branch !== branchFilter) return false;
    return query === '' || deal.haystack.includes(query);
  };

  const liveVisible = liveOffers.filter((offer) => {
    if (offerSlot(offer) !== statusTab) return false;
    const haystack = `${offer.name} ${offer.branchName ?? ''} ${offer.offerType ?? ''}`.toLowerCase();
    return query === '' || haystack.includes(query);
  });

  const visibleDealCount = live ? liveVisible.length : WORKSPACE_DEALS.filter((deal) => matchesDeal(deal.id)).length;

  const slotCount = (slot: 'active' | 'scheduled' | 'expired') => String(liveOffers.filter((offer) => offerSlot(offer) === slot).length);
  const tabs: Array<{ key: 'active' | 'scheduled' | 'expired'; label: string; count: string }> = [
    { key: 'active', label: 'Active', count: live ? slotCount('active') : '6' },
    { key: 'scheduled', label: 'Scheduled', count: live ? slotCount('scheduled') : '2' },
    { key: 'expired', label: 'Expired', count: live ? slotCount('expired') : '14' },
  ];

  const demoBranchRows = [
    {
      name: 'Wuse II (Plot 1404 Aminu Kano)',
      deals: '3 active campaigns',
      claims: '312 vouchers',
      verified: '219 verified (70.1%)',
      verifiedTone: 'text-badge-discount-text font-medium',
      volume: '₦784,200',
    },
    {
      name: 'Maitama Flagship (Gana Street)',
      deals: '2 active campaigns',
      claims: '184 vouchers',
      verified: '134 verified (72.8%)',
      verifiedTone: 'text-badge-discount-text font-medium',
      volume: '₦463,800',
    },
    {
      name: 'Victoria Island (Adetokunbo Ademola)',
      deals: '1 active campaign',
      claims: '94 vouchers',
      verified: '58 verified (61.7%)',
      verifiedTone: 'text-text-secondary font-medium',
      volume: '₦194,500',
    },
  ];
  const branchRows = live
    ? (locations.data?.branches ?? []).map((branch) => ({
        name: branch.name,
        deals: branch.branchId === liveOffers[0]?.branchId ? `${slotCount('active')} active campaigns` : '—',
        claims: `${branch.claims} vouchers`,
        verified: '—',
        verifiedTone: 'text-text-secondary font-medium',
        volume: naira(branch.revenue.current),
      }))
    : demoBranchRows;

  return (
    <MerchantPortalChrome activeNav="business-deals" onNav={onNav} content="full">
      <div className="w-full px-margin py-space-xl flex flex-col gap-space-xl max-w-[1600px] mx-auto">
        {/* Top Workspace Header & Breadcrumbs — stacks until `xl` so it fits iPad Pro 13 */}
        <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-space-2xs max-w-3xl min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption mb-1">
              <button type="button" onClick={() => onNav('overview')} className="hover:text-primary transition-colors">Home</button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button type="button" onClick={() => onNav('overview')} className="hover:text-primary transition-colors">Business Hub</button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text-primary font-medium">Campaigns &amp; Deals</span>
            </nav>
            <div className="flex flex-wrap items-center gap-space-2xs sm:gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Campaigns &amp; Deals Management</h1>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-medium">
                Workspace Active
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Track claims, boost customer discovery, manage voucher redemption caps, and launch flash promotions across
              your branches in real time.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap self-start xl:self-end">
            <div className="flex items-center gap-2 px-space-sm py-2 rounded-xl bg-surface-container-low shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-ping" />
              <span className="font-label-sm text-label-sm text-text-secondary">
                Engine Status: <strong className="text-text-primary">Auto-Syncing VEMTAP Network</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenLogs}
              className="flex items-center gap-1.5 px-space-sm py-2 rounded-xl bg-surface-container-high text-on-secondary-container hover:bg-secondary-container font-label-sm text-label-sm transition-colors"
            >
              <Icon name="history" className="text-[18px]" />
              <span>Redemption Logs</span>
            </button>
          </div>
        </section>

        {/* Top Controls Command Deck */}
        <section className="bg-surface-canvas rounded-2xl p-space-md shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1">

            <div className="relative flex-1 min-w-[280px]">
              <label className="sr-only" htmlFor="deal-search">Search Deals</label>
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-text-tertiary pointer-events-none" />
              <input
                className="w-full h-[48px] pl-11 pr-4 bg-surface-subtle hover:bg-surface-container-low focus:bg-surface-canvas rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
                id="deal-search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search deals, SKU, promo codes or branches..."
                type="search"
                value={search}
              />
            </div>

            {/* The badge count is derived from the deck controls, never hard-coded. */}
            <FilterMenu
              align="right"
              buttonClassName="h-[48px] px-space-md bg-surface-subtle hover:bg-surface-container-low rounded-xl flex items-center justify-center gap-space-xs text-text-primary font-label-md text-label-md transition-colors"
              choices={branchChoices}
              icon="tune"
              iconClassName="text-[20px] text-text-secondary"
              label="Filters"
              onChange={setBranchFilter}
              title="Filter by branch"
              value={branchFilter}
            />
            {branchFilter !== '' && (
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption flex items-center justify-center font-bold">
                1
              </span>
            )}
          </div>

          <div className="flex items-center gap-space-sm justify-end">
            <button
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_deal_stats',
                  ['Deal', 'Promo', 'Price', 'Was', 'Branches', 'Performance'],
                  live
                    ? liveOffers.map((offer) => {
                        const stats = offerClaimStats(offer);
                        return [
                          offer.name,
                          dealBadgeLabel(offer),
                          offerPriceLabel(offer),
                          offerComparePriceLabel(offer),
                          offer.branchName ?? '',
                          `${stats.redeemed} / ${stats.claims} redeemed (${stats.rate}%)`,
                        ];
                      })
                    : DEAL_STATS.map((deal) => [deal.title, deal.promo, deal.price, deal.oldPrice, deal.branches, deal.performance]),
                );
              }}
              className="h-[48px] px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors"
            >
              <Icon name="download" className="text-[20px]" />
              <span>Export Stats</span>
            </button>
            <button
              type="button"
              onClick={onCreateDeal}
              className="h-[50px] px-space-lg rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-button-primary text-button-primary flex items-center gap-space-xs shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Icon name="add_circle" className="text-[22px]" />
              <span>+ Create New Deal</span>
            </button>
          </div>
        </section>

        {/* Tab Navigation & Quick Filter Rails */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-2xs bg-surface-container-low p-1.5 rounded-xl self-start">
            {tabs.map((tab) => {
              const active = statusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 ${
                    active ? 'bg-surface-canvas text-primary shadow-sm font-semibold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-caption text-caption ${
                      active ? 'bg-surface-tint-blue text-primary font-bold' : 'bg-surface-container text-text-secondary font-medium'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-space-sm text-text-tertiary font-caption text-caption flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> Live &amp; Claimable
            </span>
            <span className="text-surface-variant">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container" /> Rocket Boost Active
            </span>
            <span className="text-surface-variant">•</span>
            <span>Auto-archive after 30 days expired</span>
          </div>
        </div>

        {/* Live Pulse Telemetry Bar */}
        <section className="bg-gradient-to-r from-surface-canvas via-surface-container-lowest to-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_24px_-4px_rgba(13,37,76,0.05)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg items-center">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="sensors" className="text-[26px]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading-sm text-heading-sm text-text-primary">Live Pulse</span>
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                </div>
                <span className="font-caption text-caption text-text-tertiary">
                  {live ? `${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'} • Just now` : '3 Branches Synced • Just now'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                <span>ACTIVE CAMPAIGNS</span>
                <span className="text-badge-discount-text font-medium flex items-center gap-0.5">
                  <Icon name="trending_up" className="text-[14px]" />{' '}
                  {live ? `${summary?.claimsToday ?? 0} claims today` : '100% On air'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-md text-heading-md text-text-primary">
                  {live ? `${summary?.activeDeals ?? slotCount('active')} Active Deals` : '6 Active Deals'}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {live ? `/ ${totalClaims.toLocaleString('en-US')} Claims` : '/ 1,480 Claims'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                <span>{live ? 'DEAL REVENUE (30 DAYS)' : 'GROSS CLAIMED VOLUME'}</span>
                <span className="text-primary font-medium">
                  {live ? `${totalClaims ? Math.round((totalRedeemed / totalClaims) * 100) : 0}% Redeemed` : '94.2% Verified'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading-md text-heading-md text-text-primary">
                  {live ? naira(summary?.netRevenue30d ?? 0) : '₦1,842,500'}
                </span>
                <span className="font-caption text-caption text-badge-discount-text font-medium">
                  {live ? `${summary?.redeemedToday ?? 0} redeemed today` : '+₦340k today'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex items-center justify-between font-caption text-caption">
                <span className="text-text-tertiary">DAILY REDEMPTION GOAL</span>
                <span className="text-text-primary font-semibold">{live ? '—' : '76% Reached'}</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: live ? '0%' : '76%' }} />
              </div>
              <div className="flex items-center justify-between font-caption text-caption">
                <span className="text-badge-discount-text font-medium">{live ? '—' : '+18% vs last wk'}</span>
                <span className="text-text-tertiary">{live ? 'No goal set' : 'Target: ₦2.4M'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Expansive Deals Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
          {live &&
            liveVisible.map((offer) => {
              const stats = offerClaimStats(offer);
              const paused = isOfferPaused(offer);
              const was = Number(offer.originalPrice ?? 0);
              const now = Number(offer.calculatedPrice ?? offer.fixedPrice ?? 0);
              return (
                <DealCard
                  key={offer.id}
                  paused={paused}
                  onPause={() => toggleLivePause(offer)}
                  onEdit={() => onEditDeal?.(groupId(offer))}
                  onMore={() => onOpenDealDetail?.(groupId(offer))}
                  image={offer.mainImage || LIVE_IMAGE_PLACEHOLDER}
                  imageAlt={offer.name}
                  badges={
                    <>
                      <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                        {dealBadgeLabel(offer)}
                      </span>
                      {paused && (
                        <span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-medium shadow-sm">
                          Paused
                        </span>
                      )}
                    </>
                  }
                  dateBadge={
                    <span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-medium shadow-sm flex items-center gap-1">
                      <Icon name="timer" className="text-[14px] text-error" /> {offerScheduleLabel(offer)}
                    </span>
                  }
                  priceLabel={pricingTypeLabel(offer)}
                  price={offerPriceLabel(offer)}
                  oldPrice={offerComparePriceLabel(offer) || undefined}
                  priceNote={was > now && now ? `Save ${naira(was - now)}` : '—'}
                  category={[offer.branchName, offer.offerType].filter(Boolean).join(' • ') || 'Deal'}
                  status={<span className={`w-2 h-2 rounded-full ${paused ? 'bg-outline' : 'bg-badge-discount-text'}`} title={paused ? 'Paused' : 'Active'} />}
                  title={offer.name}
                  branches={
                    <>
                      <Icon name="location_on" className="text-[18px] text-primary flex-shrink-0 mt-0.5" />
                      <span className="flex flex-col">
                        <span className="font-medium text-text-primary">{offer.branchName ?? 'Your branch'}</span>
                        <span className="font-caption text-caption text-text-tertiary">
                          {offer.quantity ? `${offer.quantity} vouchers in this deal` : 'No voucher cap'}
                        </span>
                      </span>
                    </>
                  }
                  telemetry={
                    <>
                      <div className="flex items-center justify-between font-caption text-caption">
                        <span className="text-text-secondary">Redemption Rate ({stats.rate}%)</span>
                        <span className="text-text-primary font-semibold">
                          {stats.redeemed} / {stats.claims} Redeemed
                        </span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <div className="bg-badge-discount-text h-full rounded-full" style={{ width: `${stats.rate}%` }} />
                      </div>
                      <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Icon name="check_circle" className="text-[13px] text-badge-discount-text" /> {stats.redeemed} Redeemed
                        </span>
                        <span className="font-medium text-text-secondary">{stats.unredeemed} Vouchers Pending</span>
                      </div>
                    </>
                  }
                  primaryAction={
                    <button
                      type="button"
                      onClick={() => onBoost?.(offer.name)}
                      className="flex-1 h-11 px-3 rounded-xl bg-tertiary-container hover:bg-tertiary text-on-tertiary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Icon name="rocket_launch" className="text-[18px]" />
                      <span>Boost Deal 🚀</span>
                    </button>
                  }
                />
              );
            })}
          {!live && matchesDeal('wuse') && (
          <DealCard
            paused={!!pausedDeals.wuse}
            onPause={() => togglePause('wuse')}
            onEdit={() => onEditDeal?.()}
            onMore={() => undefined}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuApQ5ezQVyveoZZcJBH3RCv1zTnsyXz1eB4gQsiSmUjF1rc9P6BWIY1fEHizr7Gp4SSU5XgX6laUsXhmlrpJ1SGAN-uZoc-7dghtPWCIsUhAmZyYYNgEZgOi2C3DS3lb40N1JpN-35efQm9XfDEpKq94wKX8ekrYsbuCMFcQ03I2-vFrBbTNtJn5LSN5g7AtddvEkUa1Heq9Z8ge_NzW0MXEqj-Nl9AGw7mQ_RCFN_MdCFtg04Ux3t3Nw"
            imageAlt="Delectable premium lunch spread at an upscale urban bistro in Abuja with grilled steak cutlets, golden crispy plantains, gourmet salad, and fresh tropical drinks bathed in warm natural afternoon sunlight with modern minimalist plates."
            badges={
              <>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                  20% OFF
                </span>
                <span className="px-2.5 py-1 rounded-full bg-tertiary text-on-tertiary font-caption text-caption font-medium shadow-sm flex items-center gap-1">
                  <Icon name="local_fire_department" className="text-[13px]" /> High Demand
                </span>
              </>
            }
            dateBadge={
              <span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-medium shadow-sm flex items-center gap-1">
                <Icon name="timer" className="text-[14px] text-error" /> Ends Sunday (Oct 20)
              </span>
            }
            priceLabel="Special Promo Price"
            price="₦9,600"
            oldPrice="₦12,000"
            priceNote="Save ₦2,400"
            category="Urban Grill & Bistro • Combo"
            status={<span className="w-2 h-2 rounded-full bg-badge-discount-text" title="Active" />}
            title="Weekend Prime Lunch Combo"
            branches={
              <>
                <Icon name="location_on" className="text-[18px] text-primary flex-shrink-0 mt-0.5" />
                <span className="flex flex-col">
                  <span className="font-medium text-text-primary">Wuse II, Garki &amp; Maitama</span>
                  <span className="font-caption text-caption text-text-tertiary">All 3 active branches participating</span>
                </span>
              </>
            }
            telemetry={
              <>
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary">Redemption Rate (70%)</span>
                  <span className="text-text-primary font-semibold">89 / 128 Redeemed</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div className="bg-badge-discount-text h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Icon name="check_circle" className="text-[13px] text-badge-discount-text" /> 89 Claimed &amp; Eaten
                  </span>
                  <span className="font-medium text-text-secondary">39 Vouchers Pending</span>
                </div>
              </>
            }
            primaryAction={
              <button
                type="button"
                onClick={() => onBoost?.('Weekend Prime Lunch Combo')}
                className="flex-1 h-11 px-3 rounded-xl bg-tertiary-container hover:bg-tertiary text-on-tertiary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Icon name="rocket_launch" className="text-[18px]" />
                <span>Boost Deal 🚀</span>
              </button>
            }
          />
          )}

          {!live && matchesDeal('smash') && (
          <DealCard
            paused={!!pausedDeals.smash}
            onPause={() => togglePause('smash')}
            onEdit={() => onEditDeal?.()}
            onMore={() => undefined}
            accent={<span className="absolute top-0 left-0 right-0 h-1 bg-primary" />}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBtwn4LUvT44Y-9GKC3JPuD2xcw0icui-Rhxt0KEUzY8TpxgevkVbZylvMOucfTQG1KfEoS7CMplvxXevY8jBF_Yd4I8X8_HS5v_5fIaRLHCVRJkXt-dZLPnGiTou42rxCzvsCu3xFZP2OuI9Ptb3wn07d7Fg0GowiN-dB14VeTvaMVv2JN2YYMOKDgkV-SRZN0K4CxP7fQbruE6re1RBZH7SN6aC1VxeM-blNibkHhNmkhx__gUzL3Xg"
            imageAlt="Double gourmet smash burgers with caramelized edges, melted sharp cheddar cheese, dripping house secret sauce on toasted brioche buns served with hand-cut rosemary truffle fries in a vibrant trendy restaurant environment."
            badges={
              <>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                  50% BOGO
                </span>
                <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                  <Icon name="bolt" className="text-[14px]" /> Boost Active (+2.4k Views)
                </span>
              </>
            }
            dateBadge={
              <span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-medium shadow-sm">
                Oct 17 – Nov 17, 2024
              </span>
            }
            priceLabel="Buy 1 Get 1 Special"
            price="₦6,500"
            oldPrice="₦13,000"
            priceNote="50% SAVINGS"
            category="Burger Bar Specials • Flash Promo"
            status={
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-caption text-caption font-semibold">
                Accelerated
              </span>
            }
            title="2-for-1 Smash Burger Thursday"
            branches={
              <>
                <Icon name="storefront" className="text-[18px] text-primary flex-shrink-0 mt-0.5" />
                <span className="flex flex-col">
                  <span className="font-medium text-text-primary">Wuse II Branch only</span>
                  <span className="font-caption text-caption text-text-tertiary">Exclusive in-store redemption counter</span>
                </span>
              </>
            }
            telemetry={
              <div className="contents">
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <Icon name="rocket" className="text-[15px]" /> Rocket Boost Running (2d left)
                  </span>
                  <span className="text-text-primary font-bold">412 Total Claims</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '84%' }} />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>Generating 4x more nearby customer clicks</span>
                  <span className="text-primary font-medium">84% Cap Taken</span>
                </div>
              </div>
            }
            primaryAction={
              <button
                type="button"
                onClick={() => onOpenDealDetail?.()}
                className="flex-1 h-11 px-3 rounded-xl bg-primary text-on-primary hover:bg-surface-tint font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,85,196,0.25)] transition-all"
              >
                <Icon name="insights" className="text-[18px]" />
                <span>Boost Stats</span>
              </button>
            }
          />
          )}

          {!live && matchesDeal('chill') && (
          <DealCard
            paused={!!pausedDeals.chill}
            onPause={() => togglePause('chill')}
            onEdit={() => onEditDeal?.()}
            onMore={() => undefined}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCsG2QZ-uo912K8TVQkQhIj5Eaafr4k-vp_gNAFMoQVgSsuzXXuPDxdVWsgBfgf04RIyTsS4wzy3hIITuulPvRUnvFtziOHyAn9DwzQcEct6pB1rHG6so3k5CVbtVALoIX3DxJg2gqqYGZByq4-1r1ShE035TX3J-ospKAQx5fpg8nbBpI3JIjbpQjK3lEeoPKqxRSHsabElJ9bupNK8WN40johtun9h5THcwdU-CHb1ANvlZqZGaY44g"
            imageAlt="Artisanal cocktail drinks garnished with fresh mint and dehydrated orange slices set beside artisan charcuterie platter in a luxury lounge with atmospheric evening amber lighting and sleek dark mahogany wood counters."
            badges={
              <>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                  22% OFF
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-medium shadow-sm">
                  {pausedDeals.chill ? 'Paused' : 'Active'}
                </span>
              </>
            }
            dateBadge={
              <span className="px-2.5 py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-text-primary font-caption text-caption font-medium shadow-sm flex items-center gap-1">
                <Icon name="schedule" className="text-[14px] text-tertiary" /> Weekdays 4:00 – 7:00 PM
              </span>
            }
            priceLabel="Happy Hour Exclusive"
            price="₦4,200"
            oldPrice="₦5,400"
            priceNote="Save ₦1,200"
            category="Craft Bar & Bites • Happy Hour"
            status={<span className="w-2 h-2 rounded-full bg-badge-discount-text" title="Active" />}
            title="After-Work Chill Pass"
            branches={
              <>
                <Icon name="domain" className="text-[18px] text-primary flex-shrink-0 mt-0.5" />
                <span className="flex flex-col">
                  <span className="font-medium text-text-primary">Maitama &amp; Wuse II</span>
                  <span className="font-caption text-caption text-text-tertiary">2 branches • Bar seating &amp; terrace</span>
                </span>
              </>
            }
            telemetry={
              <>
                <div className="flex items-center justify-between font-caption text-caption">
                  <span className="text-text-secondary">Daily Cap Status</span>
                  <span className="text-tertiary-container font-semibold">75% Daily Cap Reached</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Icon name="how_to_reg" className="text-[13px]" /> 78 claims today
                  </span>
                  <span className="text-text-secondary font-medium">22 Passes Remaining</span>
                </div>
              </>
            }
            primaryAction={
              <button
                type="button"
                onClick={() => onBoost?.('After-Work Chill Pass')}
                className="flex-1 h-11 px-3 rounded-xl bg-tertiary-container hover:bg-tertiary text-on-tertiary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Icon name="rocket_launch" className="text-[18px]" />
                <span>Boost Deal 🚀</span>
              </button>
            }
          />
          )}

          {visibleDealCount === 0 && (
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)] flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-full bg-surface-container-high text-text-tertiary flex items-center justify-center mb-space-sm">
                <Icon name="search_off" className="text-[26px]" />
              </span>
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                No deals match these filters
              </span>
              <span className="font-caption text-caption text-text-secondary mt-1 max-w-xs leading-relaxed">
                {branchFilter !== ''
                  ? `Nothing running on ${branchChoices.find((choice) => choice.value === branchFilter)?.label ?? 'that branch'}`
                  : 'Nothing matches your search'}
                {query !== '' ? ` for “${search.trim()}”` : ''}. Clear the filters to see every campaign.
              </span>
              {(branchFilter !== '' || query !== '') && (
                <button
                  className="mt-space-sm h-10 px-space-md rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform"
                  onClick={() => {
                    setBranchFilter('');
                    setSearch('');
                  }}
                  type="button"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Branch Distribution & Real-Time Capacity */}
        <section className="bg-surface-canvas rounded-2xl p-space-lg shadow-[0_4px_20px_-2px_rgba(13,37,76,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Distribution &amp; Real-Time Capacity</h3>
              <p className="font-caption text-caption text-text-secondary">
                Voucher allotment per active terminal for current lunch &amp; dinner sessions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-caption text-caption text-text-tertiary">Real-Time Refresh Rate: 10s</span>
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-md">
              <thead>
                <tr className="text-text-tertiary font-caption text-caption uppercase tracking-wider bg-surface-subtle rounded-lg">
                  <th className="py-3 px-4 rounded-l-lg font-semibold">Branch Location</th>
                  <th className="py-3 px-4 font-semibold">Active Deals Allocated</th>
                  <th className="py-3 px-4 font-semibold">Today&apos;s Claims</th>
                  <th className="py-3 px-4 font-semibold">Direct Counter Redemptions</th>
                  <th className="py-3 px-4 font-semibold">Gross Realized Volume</th>
                  <th className="py-3 px-4 rounded-r-lg font-semibold text-right">Quick Terminal Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {branchRows.map((row) => (
                  <tr key={row.name} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-text-primary">
                      <span className="flex items-center gap-2">
                        <Icon name="store" className="text-[18px] text-primary" />
                        <span>{row.name}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">{row.deals}</td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{row.claims}</td>
                    <td className={`py-3.5 px-4 ${row.verifiedTone}`}>{row.verified}</td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">{row.volume}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={onOpenPos}
                        className="text-primary hover:text-surface-tint font-label-sm text-label-sm font-semibold"
                      >
                        View POS Scanner →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 0% VEMTAP Commission Guarantee */}
        <section className="bg-gradient-to-r from-surface-tint-blue via-surface-container to-surface-tint-blue rounded-2xl p-space-lg shadow-[0_4px_24px_-4px_rgba(6,108,244,0.12)] flex flex-col lg:flex-row items-center justify-between gap-space-lg">
          <div className="flex items-start gap-space-md max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="percent" className="text-[32px]" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">0% VEMTAP Commission Paid</span>
                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> LIVE POLICY
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-secondary">
                Net Merchant Realized Revenue: <strong className="text-text-primary">{live ? naira(summary?.netRevenue30d ?? 0) : '₦1,248,000'}</strong>. Zero take-rate on
                deal redemptions. Customers pay your business directly via counter POS, cash, or instant bank transfer upon
                voucher validation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={onOpenLogs}
              className="h-[50px] px-space-lg rounded-xl bg-primary text-on-primary hover:bg-surface-tint font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-[0_4px_16px_rgba(0,85,196,0.3)] transition-all"
            >
              <span>View Deal Redemption Ledger</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </section>
      </div>
      {liveToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {liveToast}
        </div>
      )}
    </MerchantPortalChrome>
  );
}
