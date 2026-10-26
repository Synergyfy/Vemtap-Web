import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome } from './BusinessPortalChrome';
import {
  getClusterState,
  toggleItemShowInCluster,
  setClusterScenario,
  type ClusterBusinessMember,
} from '../clusterData';
import { countLiveBoosts, getFeaturedCampaignSlot, hasActiveBoostForItem, isItemBoostEligible } from '../clusterBoostData';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { useSponsoredCampaigns } from '../../hooks/business/useSponsored';
import { liveBoostHelpers, useLiveCluster } from '../clusterLive';
import { ClusterQrCode } from '../../components/ClusterQrCode';
import { ClusterMemberProfileModal } from '../../components/ClusterMemberProfileModal';
import { ClusterMemberChatModal } from '../../components/ClusterMemberChatModal';
import { ClusterImportModal } from '../../components/ClusterImportModal';

interface DesktopClusterSystemScreenProps {
  onNav: (key: string) => void;
  onOpenOnboarding?: () => void;
  onCreateDeal?: () => void;
  onCreateProduct?: () => void;
  onCreateLocation?: () => void;
  /** Open Cluster Boost Visibility, optionally preselecting an eligible item. */
  onBoostItem?: (itemId?: string) => void;
  /** Open the My Boosts campaign list. */
  onOpenBoosts?: () => void;
}

export type DesktopClusterTab = 'overview' | 'analytics' | 'businesses' | 'deals' | 'qr';

export function DesktopClusterSystemScreen({
  onNav,
  onOpenOnboarding,
  onCreateDeal,
  onCreateProduct,
  onCreateLocation,
  onBoostItem,
  onOpenBoosts,
}: DesktopClusterSystemScreenProps) {
  const handleCreateDeal = () => {
    if (onCreateDeal) onCreateDeal();
    else onNav('business-deals');
  };
  const handleCreateProduct = () => {
    if (onCreateProduct) onCreateProduct();
    else onNav('business-catalog');
  };
  const handleCreateLocation = () => {
    if (onCreateLocation) onCreateLocation();
    else onNav('business-locations');
  };
  const handleBoostItem = (itemId?: string) => {
    if (onBoostItem) onBoostItem(itemId);
    else onNav('cluster-boost-new');
  };
  const handleOpenBoosts = () => {
    if (onOpenBoosts) onOpenBoosts();
    else onNav('cluster-boost');
  };

  const [activeTab, setActiveTab] = useState<DesktopClusterTab>('overview');
  const live = hasApiConfig();
  const liveCluster = useLiveCluster();
  const sponsored = useSponsoredCampaigns();
  const boosts = live
    ? liveBoostHelpers(sponsored.data ?? [])
    : { count: 0, hasActiveBoostForItem, isItemBoostEligible };
  const [localState, setClusterState] = useState(getClusterState());
  const clusterState = live ? liveCluster.state : localState;
  const cluster = clusterState.currentCluster;
  /** Figures the API does not report yet show "—" when live. */
  const fig = (value: string) => (live ? '—' : value);
  const isMine = (item: { businessId: string }) =>
    live ? item.businessId === 'self' || item.businessId === clusterState.memberRecord?.businessId : item.businessId === '104';

  // One featured paid campaign at a time; rotates between windows using the
  // cluster's own rotator cadence. Computed once per visit. Live: no feed yet.
  const featuredSlot = useMemo(() => (live ? null : getFeaturedCampaignSlot()), [live]);

  // Search & Filters
  const [bizSearch, setBizSearch] = useState('');
  const [bizCategory, setBizCategory] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | 'deal' | 'product' | 'profile'>('all');

  // Modals for Member Profiles & In-App Chat
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<ClusterBusinessMember | null>(
    null
  );
  const [selectedMemberChat, setSelectedMemberChat] = useState<ClusterBusinessMember | null>(null);

  // Import / Feature Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  const refreshState = () => {
    if (live) void liveCluster.refresh();
    else setClusterState(getClusterState());
  };

  const showNotification = (msg: string) => {
    setSubmitToast(msg);
    setTimeout(() => setSubmitToast(null), 3500);
    refreshState();
  };

  const handleToggleShow = (id: string) => {
    if (live) {
      const item = clusterState.showcaseItems.find((entry) => entry.id === id);
      if (!item) return;
      liveCluster.toggleItem.mutate(item, {
        onError: (error) => showNotification(apiErrorMessage(error, 'Could not update the cluster showcase.')),
      });
      return;
    }
    toggleItemShowInCluster(id);
    refreshState();
  };

  // Live: every deal, product and service is listed already; import only
  // exists for the local demo store.
  const openImport = () => {
    if (live) {
      showNotification('Your deals, products and services are listed below. Switch one on to show it in the cluster.');
      return;
    }
    setShowImportModal(true);
  };

  useEffect(() => {
    if (liveCluster.error) showNotification(apiErrorMessage(liveCluster.error, 'Could not load your cluster.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveCluster.error]);

  // Filtered lists
  const filteredBusinesses = clusterState.members.filter((b) => {
    const matchesSearch =
      b.businessName.toLowerCase().includes(bizSearch.toLowerCase()) ||
      b.unitOrSuite.toLowerCase().includes(bizSearch.toLowerCase());
    const matchesCategory = bizCategory === 'all' || b.category === bizCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredItems = clusterState.showcaseItems.filter((item) => {
    if (entityFilter !== 'all' && item.entityType !== entityFilter) return false;
    return true;
  });

  if (!cluster) {
    return (
      <BusinessPortalChrome activeNav="cluster-system" onNav={onNav}>
        <div className="p-12 text-center max-w-lg mx-auto">
          <Icon name="hub" className="text-[56px] text-text-tertiary mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">No Active Cluster</h2>
          <p className="text-sm text-text-secondary mt-1 mb-6">
            Your business is not currently registered with a commercial cluster.
          </p>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-6 py-3 bg-primary-container text-white font-semibold text-sm rounded-xl"
          >
            Start Cluster Onboarding
          </button>
        </div>
      </BusinessPortalChrome>
    );
  }

  const analytics = cluster.analytics;
  const myItems = clusterState.showcaseItems.filter(isMine);
  const liveBoostCount = live ? boosts.count : countLiveBoosts();

  return (
    <BusinessPortalChrome activeNav="cluster-system" onNav={onNav}>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
        {/* Toast */}
        {submitToast && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white text-sm font-semibold shadow-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-[20px]" />
              <span>{submitToast}</span>
            </div>
            <button type="button" onClick={() => setSubmitToast(null)}>
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="hub" className="text-[20px]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                VEMTAP COMMERCIAL NETWORK
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-text-primary mt-1">
              {cluster.name}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {cluster.address} &bull; {cluster.stats.totalBusinesses} Verified Merchants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenOnboarding) {
                  if (!live) setClusterScenario('not_found');
                  onOpenOnboarding();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container border border-border-subtle text-xs font-semibold text-text-secondary flex items-center gap-1.5 transition-colors"
              title="Test onboarding screens with simulated scenario"
            >
              <Icon name="refresh" className="text-[16px] text-primary" />
              <span>Restart Onboarding Demo</span>
            </button>

            <button
              type="button"
              onClick={openImport}
              className="px-4 py-2 rounded-xl bg-primary-container hover:opacity-95 text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Icon name="tune" className="text-[16px]" />
              <span>Choose What to Feature</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex space-x-8 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="space_dashboard" className="text-[18px]" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="query_stats" className="text-[18px]" />
            <span>Analytics &amp; Impressions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('businesses')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'businesses'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="storefront" className="text-[18px]" />
            <span>Member Businesses ({clusterState.members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'deals'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="local_offer" className="text-[18px]" />
            <span>Showcase Pool ({clusterState.showcaseItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'qr'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name="qr_code_2" className="text-[18px]" />
            <span>Cluster QR Pass</span>
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards: Cluster overall metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-xs font-bold uppercase tracking-wider">Cluster Views</span>
                  <Icon name="visibility" className="text-[20px] text-primary" />
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-text-primary">
                    {fig(analytics.clusterViews.toLocaleString())}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Total cluster hub visitors</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-xs font-bold uppercase tracking-wider">Impressions</span>
                  <Icon name="query_stats" className="text-[20px] text-emerald-600" />
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-emerald-600">
                    {fig(analytics.clusterImpressions.toLocaleString())}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Across rotator &amp; directory</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-xs font-bold uppercase tracking-wider">Clicks / Taps</span>
                  <Icon name="ads_click" className="text-[20px] text-primary" />
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-primary">
                    {fig(analytics.clusterClicks.toLocaleString())}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">16.2% overall engagement</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-xs font-bold uppercase tracking-wider">Shared QR Scans</span>
                  <Icon name="qr_code_scanner" className="text-[20px] text-purple-600" />
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-extrabold text-purple-600">
                    {analytics.clusterScans.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Entrance &amp; counter scans</p>
                </div>
              </div>
            </div>

            {/* Boost Visibility Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-primary-container to-[#0055c4] text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon name="rocket_launch" className="text-[22px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">Boost Visibility</h3>
                    {liveBoostCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                        {liveBoostCount} live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80">
                    Pay to raise your own item's featured-selection priority in {cluster.name} —
                    separate from global Boost campaigns.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleBoostItem()}
                  className="px-4 py-2 rounded-xl bg-white text-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                >
                  <Icon name="trending_up" className="text-[16px]" />
                  <span>Boost an Item</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenBoosts}
                  className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  My Boosts
                </button>
              </div>
            </div>

            {/* Rotator Card & Business Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Deal Rotator Card */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-container text-white flex items-center justify-center">
                      <Icon name="sync" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-text-primary">
                        VEMTAP Deal Rotator Engine
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Managed cluster cycle &bull; Every {fig(`${cluster.rotatorSettings.rotationIntervalSeconds}s`)}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Active (5/6 slots)
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Deals and products auto-import from your business. You control whether items appear
                  in rotation or remain hidden. You can also feature your verified{' '}
                  <strong className="text-text-primary">Store Profile</strong> in the rotator.
                </p>

                {/* Live Rotator Items */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                    Currently Featured in Rotator:
                  </h4>
                  {featuredSlot && (
                    <div className="p-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-surface-canvas to-surface-tint-blue/30 flex items-center gap-2.5">
                      <img
                        src={featuredSlot.item.image}
                        alt={featuredSlot.item.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon name="star" className="text-[12px] text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                            Featured campaign &bull; rotates with other paid boosts
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {featuredSlot.item.title}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {featuredSlot.item.businessName}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {clusterState.showcaseItems
                      .filter((d) => d.showInCluster)
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-surface-canvas border border-border-subtle flex items-center gap-2.5"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-text-primary truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-text-secondary">
                              {item.businessName} &bull;{' '}
                              <strong className="text-badge-discount-text">
                                {item.discount || `₦${item.price.toLocaleString()}`}
                              </strong>
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openImport}
                    className="px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                  >
                    <Icon name="tune" className="text-[16px]" />
                    <span>Choose What to Feature (Deals / Products / Profile)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('deals')}
                    className="px-4 py-2 rounded-xl bg-surface-canvas border border-border-subtle text-text-secondary text-xs font-medium hover:text-text-primary transition-colors"
                  >
                    View All Pool Items &rarr;
                  </button>
                </div>
              </div>

              {/* Your Business's Cluster Footfall Box */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-text-primary">
                    Your Cluster Performance
                  </h3>
                  <span className="text-xs font-bold text-primary bg-surface-tint-blue px-2.5 py-1 rounded-full">
                    Urban Grill &amp; Bistro
                  </span>
                </div>

                <p className="text-xs text-text-secondary">
                  Customer interaction and footfall generated for your store via the Amaka Mall
                  collective pass.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle">
                    <p className="text-[11px] text-text-tertiary">Store Profile Views</p>
                    <p className="text-2xl font-extrabold text-text-primary mt-1">
                      {fig(analytics.businessViews.toLocaleString())}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">+18% this month</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle">
                    <p className="text-[11px] text-text-tertiary">Impressions in Hub</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                      {fig(analytics.businessImpressions.toLocaleString())}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Rotator &amp; catalog</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle">
                    <p className="text-[11px] text-text-tertiary">Clicks &amp; Taps</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {fig(analytics.businessClicks.toLocaleString())}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      CTR: {fig(`${analytics.businessCtr}%`)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle">
                    <p className="text-[11px] text-text-tertiary">Scans Contributed</p>
                    <p className="text-2xl font-extrabold text-purple-600 mt-1">
                      {clusterState.memberRecord?.scansContributed.toLocaleString() || '3,480'}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">From till standee</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="w-full py-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="query_stats" className="text-[16px]" />
                  <span>View Full Analytics Breakdown</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DETAILED ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 7-Day Trend Chart Simulation */}
            <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-primary">
                    7-Day Engagement Trend: Views, Impressions &amp; Clicks
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Cluster visitor traffic versus store engagement
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    <span>Views</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Impressions</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Clicks</span>
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="grid grid-cols-7 gap-3 pt-4 items-end h-48 border-b border-border-subtle pb-3">
                {analytics.dailyTrend.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        className="w-2.5 bg-primary rounded-t-sm"
                        style={{ height: `${(day.views / 1000) * 100}%` }}
                        title={`${day.views} views`}
                      />
                      <div
                        className="w-2.5 bg-emerald-500 rounded-t-sm"
                        style={{ height: `${(day.impressions / 3500) * 100}%` }}
                        title={`${day.impressions} impressions`}
                      />
                      <div
                        className="w-2.5 bg-purple-500 rounded-t-sm"
                        style={{ height: `${(day.clicks / 700) * 100}%` }}
                        title={`${day.clicks} clicks`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-text-secondary">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Item Performance Table */}
            <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-primary">
                    Item-by-Item Performance &amp; Cluster Visibility
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Individual views, impressions, clicks and show/hide controls in the cluster pool
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openImport}
                  className="px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Icon name="tune" className="text-[16px]" />
                  <span>Choose What to Feature</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-surface-canvas border border-border-subtle flex items-center justify-between gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border-subtle"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-text-primary truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border-subtle">
                          {item.entityType}
                        </span>
                        {item.discount && (
                          <span className="text-[10px] font-bold text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded">
                            {item.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {item.subtitle || `₦${item.price.toLocaleString()}`}
                      </p>
                    </div>

                    {/* Analytics numbers */}
                    <div className="grid grid-cols-4 gap-4 text-center text-xs">
                      <div>
                        <p className="text-[11px] text-text-tertiary">Views</p>
                        <p className="font-bold text-text-primary mt-0.5">
                          {fig(item.views.toLocaleString())}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-text-tertiary">Impressions</p>
                        <p className="font-bold text-emerald-600 mt-0.5">
                          {fig(item.impressions.toLocaleString())}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-text-tertiary">Clicks</p>
                        <p className="font-bold text-primary mt-0.5">
                          {fig(item.clicks.toLocaleString())}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-text-tertiary">CTR</p>
                        <p className="font-bold text-purple-600 mt-0.5">
                          {live
                            ? '—'
                            : `${item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : 0}%`}
                        </p>
                      </div>
                    </div>

                    {/* Show / Hide Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleShow(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        item.showInCluster
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-surface-subtle text-text-secondary border border-border-subtle hover:text-text-primary'
                      }`}
                    >
                      <Icon
                        name={item.showInCluster ? 'visibility' : 'visibility_off'}
                        className="text-[16px]"
                      />
                      <span>{item.showInCluster ? 'Shown in Pool' : 'Hidden'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BUSINESSES (VIEW PROFILE & IN-APP CHAT) ================= */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Icon
                  name="search"
                  className="absolute left-3 top-2.5 text-[18px] text-text-tertiary"
                />
                <input
                  type="text"
                  value={bizSearch}
                  onChange={(e) => setBizSearch(e.target.value)}
                  placeholder="Search merchant name or unit..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {['all', 'food', 'fashion', 'electronics', 'beauty', 'services'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBizCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                      bizCategory === cat
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredBusinesses.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-text-primary">
                            {b.businessName}
                          </h4>
                          {b.isVerified && (
                            <Icon name="verified" className="text-[16px] text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{b.unitOrSuite}</p>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-canvas text-text-secondary border border-border-subtle">
                        {b.category}
                      </span>
                    </div>

                    {isMine(b) && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-primary bg-surface-tint-blue px-2 py-0.5 rounded-md">
                        Your Business
                      </span>
                    )}

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mt-2">
                      {b.bio}
                    </p>
                  </div>

                  {/* Actions: View Profile & In-App Chat */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle gap-2">
                    <span className="text-xs text-text-secondary font-medium">
                      {b.dealsCount} deals in pool
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberProfile(b)}
                        className="py-1.5 px-3 rounded-xl bg-surface-canvas border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="visibility" className="text-[15px]" />
                        <span>View Profile</span>
                      </button>

                      {!isMine(b) && (
                        <button
                          type="button"
                          onClick={() => setSelectedMemberChat(b)}
                          className="py-1.5 px-3 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
                        >
                          <Icon name="chat" className="text-[15px]" />
                          <span>In-App Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SHOWCASE POOL ================= */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {(['all', 'deal', 'product', 'profile'] as const).map((ent) => (
                  <button
                    key={ent}
                    type="button"
                    onClick={() => setEntityFilter(ent)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      entityFilter === ent
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {ent === 'all' ? 'All Items' : `${ent}s`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openImport}
                  className="px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-md hover:opacity-95"
                >
                  <Icon name="tune" className="text-[16px]" />
                  <span>Choose What to Feature</span>
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    item.showInCluster
                      ? 'bg-surface-subtle border-border-subtle hover:border-primary/40'
                      : 'bg-surface-subtle/60 border-border-subtle opacity-70'
                  }`}
                >
                  <div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-3 bg-surface-container">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                          {item.entityType}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md ${
                            item.showInCluster
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {item.showInCluster ? 'Shown' : 'Hidden'}
                        </span>
                        {isMine(item) && boosts.hasActiveBoostForItem(item.id) && (
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md ${
                              item.entityType === 'profile'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-primary'
                            }`}
                          >
                            {item.entityType === 'profile' ? 'Boosted · extendable' : 'Boosted'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] font-bold text-primary">{item.businessName}</p>
                    <h4 className="font-bold text-sm text-text-primary line-clamp-1 mt-0.5">
                      {item.title}
                    </h4>

                    {item.price > 0 && (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-extrabold text-text-primary">
                          ₦{item.price.toLocaleString()}
                        </span>
                        {item.oldPrice && (
                          <span className="text-xs text-text-tertiary line-through">
                            ₦{item.oldPrice.toLocaleString()}
                          </span>
                        )}
                        {item.discount && (
                          <span className="text-xs font-bold text-badge-discount-text">
                            {item.discount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs text-text-secondary gap-2">
                    <span>
                      {fig(String(item.impressions))} Impr. &bull; {fig(String(item.clicks))} Clicks
                    </span>

                    <div className="flex items-center gap-3 shrink-0">
                      {isMine(item) && boosts.isItemBoostEligible(item).eligible && (
                        <button
                          type="button"
                          disabled={boosts.hasActiveBoostForItem(item.id) && item.entityType !== 'profile'}
                          onClick={() => handleBoostItem(item.id)}
                          className={`font-bold hover:underline text-xs ${
                            boosts.hasActiveBoostForItem(item.id)
                              ? item.entityType === 'profile'
                                ? 'text-primary'
                                : 'text-text-tertiary no-underline cursor-not-allowed'
                              : 'text-primary'
                          }`}
                        >
                          {boosts.hasActiveBoostForItem(item.id)
                            ? item.entityType === 'profile'
                              ? 'Extend Boost'
                              : 'Boosted'
                            : 'Boost Visibility'}
                        </button>
                      )}
                      {isMine(item) && (
                        <button
                          type="button"
                          onClick={() => handleToggleShow(item.id)}
                          className="font-bold text-text-secondary hover:underline text-xs"
                        >
                          {item.showInCluster ? 'Hide from Rotator' : 'Show in Rotator'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: CLUSTER QR PASS ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">Official Cluster QR Pass</h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Shared QR touchpoint for {cluster.name}. One universal pass connects shoppers to all
                participating merchants.
              </p>
            </div>

            <div className="flex justify-center">
              <ClusterQrCode
                url={cluster.qrCode.url}
                clusterName={cluster.name}
                displayCode={cluster.qrCode.displayCode}
                size={240}
              />
            </div>
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      {selectedMemberProfile && (
        <ClusterMemberProfileModal
          member={selectedMemberProfile}
          onClose={() => setSelectedMemberProfile(null)}
          onOpenChat={(member) => {
            setSelectedMemberProfile(null);
            setSelectedMemberChat(member);
          }}
        />
      )}

      {/* Member Chat Modal */}
      {selectedMemberChat && (
        <ClusterMemberChatModal
          member={selectedMemberChat}
          onClose={() => setSelectedMemberChat(null)}
        />
      )}

      {/* Import / Showcase Picker Modal */}
      {showImportModal && (
        <ClusterImportModal
          showcaseItems={clusterState.showcaseItems}
          onClose={() => setShowImportModal(false)}
          onToggleShow={handleToggleShow}
          onSuccess={showNotification}
          onCreateDeal={handleCreateDeal}
          onCreateProduct={handleCreateProduct}
          onCreateLocation={handleCreateLocation}
        />
      )}
    </BusinessPortalChrome>
  );
}
