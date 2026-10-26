import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import {
  getClusterState,
  toggleItemShowInCluster,
  setClusterScenario,
  type ClusterBusinessMember,
  type ShowcaseEntityType,
} from './clusterData';
import {
  countLiveBoosts,
  getFeaturedCampaignSlot,
  hasActiveBoostForItem,
  isItemBoostEligible,
} from './clusterBoostData';
import { ClusterQrCode } from '../components/ClusterQrCode';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { useSponsoredCampaigns } from '../hooks/business/useSponsored';
import { liveBoostHelpers, useLiveCluster } from './clusterLive';
import { ClusterMemberProfileModal } from '../components/ClusterMemberProfileModal';
import { ClusterMemberChatModal } from '../components/ClusterMemberChatModal';
import { ClusterImportModal } from '../components/ClusterImportModal';

interface ClusterSystemScreenProps {
  onBack: () => void;
  onTab?: (tab: BusinessTabKey) => void;
  onOpenOnboarding?: () => void;
  onCreateDeal?: () => void;
  onCreateProduct?: () => void;
  onCreateLocation?: () => void;
  /** Open Cluster Boost Visibility, optionally preselecting an eligible item. */
  onBoostItem?: (itemId?: string) => void;
  /** Open the My Boosts campaign list. */
  onOpenBoosts?: () => void;
}

export type ClusterTab = 'overview' | 'analytics' | 'businesses' | 'qr' | 'deals';

export function ClusterSystemScreen({
  onBack,
  onTab,
  onOpenOnboarding,
  onCreateDeal,
  onCreateProduct,
  onCreateLocation,
  onBoostItem,
  onOpenBoosts,
}: ClusterSystemScreenProps) {
  const [activeTab, setActiveTab] = useState<ClusterTab>('overview');
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

  // One featured paid campaign at a time, rotating with other eligible
  // campaigns via the existing rotator cadence. Computed once on mount so the
  // page stays stable during this visit. Live: there is no featured slot feed.
  const featuredSlot = useMemo(() => (live ? null : getFeaturedCampaignSlot()), [live]);

  const handleCreateDeal = () => {
    if (onCreateDeal) onCreateDeal();
  };

  const handleCreateProduct = () => {
    if (onCreateProduct) onCreateProduct();
  };

  const handleCreateLocation = () => {
    if (onCreateLocation) onCreateLocation();
  };

  // Search & Filters for Businesses
  const [bizSearch, setBizSearch] = useState('');
  const [bizCategory, setBizCategory] = useState<string>('all');

  // Modals for Member Profiles & In-App Chat
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<ClusterBusinessMember | null>(
    null
  );
  const [selectedMemberChat, setSelectedMemberChat] = useState<ClusterBusinessMember | null>(null);

  // Import / Feature Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [dealFilter, setDealFilter] = useState<'all' | 'in_rotator' | 'hidden'>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | ShowcaseEntityType>('all');
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

  // Live: every deal, product and service is listed already; import only
  // exists for the local demo store.
  const openImport = () => {
    if (live) {
      showNotification('Your deals, products and services are listed below. Switch one on to show it in the cluster.');
      return;
    }
    setShowImportModal(true);
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

  useEffect(() => {
    if (liveCluster.error) showNotification(apiErrorMessage(liveCluster.error, 'Could not load your cluster.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveCluster.error]);

  // Filtered businesses
  const filteredBusinesses = clusterState.members.filter((b) => {
    const matchesSearch =
      b.businessName.toLowerCase().includes(bizSearch.toLowerCase()) ||
      b.unitOrSuite.toLowerCase().includes(bizSearch.toLowerCase());
    const matchesCategory = bizCategory === 'all' || b.category === bizCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered showcase items (deals / products / services / profile)
  const filteredItems = clusterState.showcaseItems.filter((item) => {
    if (entityFilter !== 'all' && item.entityType !== entityFilter) return false;
    if (dealFilter === 'in_rotator') return item.showInCluster;
    if (dealFilter === 'hidden') return !item.showInCluster;
    return true;
  });

  if (!cluster) {
    return (
      <AppScreen surface="bg-surface-canvas">
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
          <Icon name="hub" className="text-[48px] text-text-tertiary mb-3" />
          <h2 className="text-xl font-bold text-text-primary">No Active Cluster</h2>
          <p className="text-xs text-text-secondary mt-1 mb-4">
            You haven't joined a commercial cluster yet.
          </p>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-5 py-2.5 bg-primary-container text-white font-semibold text-sm rounded-xl"
          >
            Start Cluster Onboarding
          </button>
        </div>
      </AppScreen>
    );
  }

  const analytics = cluster.analytics;
  const myItems = clusterState.showcaseItems.filter(isMine);
  const liveBoostCount = live ? boosts.count : countLiveBoosts();

  return (
    <AppScreen surface="bg-surface-canvas">
      {/* Toast */}
      {submitToast && (
        <div className="fixed top-14 inset-x-4 z-50 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" className="text-[18px]" />
            <span>{submitToast}</span>
          </div>
          <button type="button" onClick={() => setSubmitToast(null)}>
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-text-secondary hover:text-text-primary rounded-lg"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="hub" className="text-[18px]" />
            </div>
            <div>
              <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                Cluster System
              </h1>
              <p className="text-[11px] text-text-secondary truncate max-w-[190px]">
                {cluster.name}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenOnboarding) {
              if (!live) setClusterScenario('not_found');
              onOpenOnboarding();
            }
          }}
          className="text-[11px] font-semibold text-primary bg-surface-tint-blue px-2.5 py-1 rounded-full hover:opacity-90"
          title="Restart onboarding flow with scenario testing"
        >
          Flow Demo
        </button>
      </header>

      {/* Tab Bar Navigation */}
      <div className="bg-surface-canvas border-b border-border-subtle px-4 flex space-x-5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="dashboard" className="text-[16px]" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="query_stats" className="text-[16px]" />
          <span>Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('businesses')}
          className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'businesses'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="storefront" className="text-[16px]" />
          <span>Businesses ({clusterState.members.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deals')}
          className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'deals'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="local_offer" className="text-[16px]" />
          <span>Pool Items ({clusterState.showcaseItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'qr'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon name="qr_code_2" className="text-[16px]" />
          <span>Cluster QR</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Cluster Header Card */}
            <div className="p-4 rounded-3xl bg-surface-subtle border border-border-subtle shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Active Commercial Hub</span>
                  </div>
                  <h2 className="text-lg font-bold text-text-primary">{cluster.name}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{cluster.address}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name="hub" className="text-[22px]" />
                </div>
              </div>

              {/* Cluster Live Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border-subtle/60 text-center">
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-extrabold text-text-primary">
                    {fig(`${(analytics.clusterViews / 1000).toFixed(1)}k`)}
                  </p>
                  <p className="text-[10px] text-text-secondary">Hub Views</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-extrabold text-emerald-600">
                    {fig(`${(analytics.clusterImpressions / 1000).toFixed(1)}k`)}
                  </p>
                  <p className="text-[10px] text-text-secondary">Impressions</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-extrabold text-primary">
                    {fig(`${(analytics.clusterClicks / 1000).toFixed(1)}k`)}
                  </p>
                  <p className="text-[10px] text-text-secondary">Clicks/Taps</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-extrabold text-purple-600">
                    {(analytics.clusterScans / 1000).toFixed(1)}k
                  </p>
                  <p className="text-[10px] text-text-secondary">QR Scans</p>
                </div>
              </div>
            </div>

            {/* Rotator Status & Showcase Choice Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-surface-subtle to-surface-tint-blue/20 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary-container text-white flex items-center justify-center">
                    <Icon name="sync" className="text-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-xs">
                      VEMTAP Deal Rotator
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Rotates every {fig(`${cluster.rotatorSettings.rotationIntervalSeconds}s`)}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  Active (5/6 slots)
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Urban Grill &amp; Bistro has{' '}
                <strong className="text-text-primary">
                  {myItems.filter((i) => i.showInCluster).length} active items
                </strong>{' '}
                in rotation. You can choose whether to feature{' '}
                <strong className="text-text-primary">Deals, Products/Menu</strong>, or your{' '}
                <strong className="text-text-primary">Store Profile</strong>.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={openImport}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                >
                  <Icon name="tune" className="text-[16px]" />
                  <span>Choose What to Feature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deals')}
                  className="py-2 px-3 rounded-xl bg-surface-canvas border border-border-subtle text-text-secondary text-xs font-medium hover:text-text-primary"
                >
                  View Pool
                </button>
              </div>
            </div>

            {/* Boost Visibility Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-container to-[#0055c4] text-white space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon name="rocket_launch" className="text-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs">Boost Visibility</h3>
                    <p className="text-[11px] text-white/80">
                      Raise your item's featured priority in this cluster
                    </p>
                  </div>
                </div>
                {liveBoostCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold shrink-0">
                    {liveBoostCount} live
                  </span>
                )}
              </div>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onBoostItem?.()}
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-primary text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Icon name="trending_up" className="text-[16px]" />
                  <span>Boost an Item</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenBoosts?.()}
                  className="py-2 px-3 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/20"
                >
                  My Boosts
                </button>
              </div>
            </div>

            {/* Your Business Cluster Performance Glance */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary text-xs">
                    Your Business Footfall &amp; Engagement
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    From Amaka Mall QR pass &amp; rotator
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Details &rarr;
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-base font-bold text-text-primary">
                    {fig(analytics.businessViews.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-text-secondary">Store Views</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-base font-bold text-emerald-600">
                    {fig(analytics.businessImpressions.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-text-secondary">Impressions</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-base font-bold text-primary">
                    {fig(analytics.businessClicks.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-text-secondary">Clicks ({fig(`${analytics.businessCtr}%`)})</p>
                </div>
              </div>
            </div>

            {/* Member Directory Preview */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-xs">
                  Cluster Merchants &amp; Network
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('businesses')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  See All ({clusterState.members.length}) &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {clusterState.members.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text-primary">
                          {m.businessName}
                        </span>
                        {m.isVerified && (
                          <Icon name="verified" className="text-[13px] text-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary">{m.unitOrSuite}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberProfile(m)}
                        className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary text-[11px] font-semibold"
                        title="View Profile"
                      >
                        <Icon name="visibility" className="text-[15px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberChat(m)}
                        className="p-1.5 rounded-lg bg-surface-tint-blue text-primary text-[11px] font-semibold flex items-center gap-1"
                        title="In-App Chat"
                      >
                        <Icon name="chat" className="text-[15px]" />
                        <span className="hidden sm:inline">Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DETAILED ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
              <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider">
                Overall Cluster Network Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-xs text-text-tertiary">Cluster Total Views</p>
                  <p className="text-xl font-extrabold text-text-primary mt-1">
                    {fig(analytics.clusterViews.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">+14% vs last week</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-xs text-text-tertiary">Total Impressions</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-1">
                    {fig(analytics.clusterImpressions.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Across all member slots</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-xs text-text-tertiary">Customer Clicks/Taps</p>
                  <p className="text-xl font-extrabold text-primary mt-1">
                    {fig(analytics.clusterClicks.toLocaleString())}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">16.2% overall CTR</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle">
                  <p className="text-xs text-text-tertiary">Shared QR Scans</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-1">
                    {analytics.clusterScans.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">At entrances &amp; counters</p>
                </div>
              </div>
            </div>

            {/* Individual Items Analytics Table */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider">
                    Your Items Performance Breakdown
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Individual views, impressions &amp; clicks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openImport}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Manage Items
                </button>
              </div>

              <div className="space-y-2">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-surface-canvas border border-border-subtle space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-text-primary truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              item.showInCluster
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.showInCluster ? 'Shown' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary capitalize">
                          Type: {item.entityType} &bull; ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Quick Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleShow(item.id)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                          item.showInCluster
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                        }`}
                      >
                        {item.showInCluster ? 'Hide' : 'Show in Pool'}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-border-subtle/50 text-[10px]">
                      <div>
                        <span className="text-text-tertiary">Views:</span>
                        <p className="font-bold text-text-primary">{fig(String(item.views))}</p>
                      </div>
                      <div>
                        <span className="text-text-tertiary">Impr:</span>
                        <p className="font-bold text-text-primary">{fig(String(item.impressions))}</p>
                      </div>
                      <div>
                        <span className="text-text-tertiary">Clicks:</span>
                        <p className="font-bold text-primary">{fig(String(item.clicks))}</p>
                      </div>
                      <div>
                        <span className="text-text-tertiary">CTR:</span>
                        <p className="font-bold text-emerald-600">
                          {live
                            ? '—'
                            : `${item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : 0}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BUSINESSES (WITH PROFILE & CHAT) ================= */}
        {activeTab === 'businesses' && (
          <div className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-2.5 text-[18px] text-text-tertiary"
              />
              <input
                type="text"
                value={bizSearch}
                onChange={(e) => setBizSearch(e.target.value)}
                placeholder="Search businesses or suite..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'food', 'fashion', 'electronics', 'beauty', 'services'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBizCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                    bizCategory === cat
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Business List */}
            <div className="space-y-2.5 pt-1">
              {filteredBusinesses.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-text-primary">{b.businessName}</h4>
                        {b.isVerified && (
                          <Icon name="verified" className="text-[15px] text-primary" />
                        )}
                        {isMine(b) && (
                          <span className="text-[10px] font-bold text-primary bg-surface-tint-blue px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">{b.unitOrSuite}</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-canvas text-text-secondary border border-border-subtle">
                      {b.category}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {b.bio}
                  </p>

                  {/* Actions: View Profile & In-App Chat */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 gap-2">
                    <span className="text-[11px] text-text-secondary">
                      {b.dealsCount} deals in rotator
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberProfile(b)}
                        className="py-1.5 px-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Icon name="visibility" className="text-[14px]" />
                        <span>View Profile</span>
                      </button>

                      {!isMine(b) && (
                        <button
                          type="button"
                          onClick={() => setSelectedMemberChat(b)}
                          className="py-1.5 px-3 rounded-xl bg-primary-container text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs hover:opacity-95 transition-all"
                        >
                          <Icon name="chat" className="text-[14px]" />
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

        {/* ================= TAB 4: POOL ITEMS (DEALS / PRODUCTS / PROFILE) ================= */}
        {activeTab === 'deals' && (
          <div className="flex flex-col gap-3">
            {/* Featured campaign slot — one at a time, ahead of organic listings */}
            {featuredSlot && (
              <div className="p-3.5 rounded-2xl border border-primary/30 bg-gradient-to-br from-surface-subtle to-surface-tint-blue/30 flex gap-3 items-center">
                <img
                  src={featuredSlot.item.image}
                  alt={featuredSlot.item.title}
                  className="w-16 h-16 rounded-xl object-cover border border-border-subtle shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon name="star" className="text-[13px] text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                      Featured campaign
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
                    {featuredSlot.item.title}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate">
                    {featuredSlot.item.businessName}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    Rotates with other paid boosts — not shown on every visit
                  </p>
                </div>
              </div>
            )}

            {/* Header with Feature Modal CTA */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-text-primary">Cluster Showcase Pool</h3>
                <p className="text-[11px] text-text-secondary">
                  Active deals, products &amp; profiles in rotation
                </p>
              </div>
              <button
                type="button"
                onClick={openImport}
                className="py-1.5 px-3 rounded-xl bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Icon name="tune" className="text-[16px]" />
                <span>Feature in Cluster</span>
              </button>
            </div>

            {/* Quick Create Action Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={handleCreateDeal}
                className="px-2.5 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-[11px] font-semibold text-text-primary flex items-center gap-1 shrink-0 hover:border-primary/40"
              >
                <Icon name="local_offer" className="text-[13px] text-primary" />
                <span>Create Deal</span>
              </button>
              <button
                type="button"
                onClick={handleCreateProduct}
                className="px-2.5 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-[11px] font-semibold text-text-primary flex items-center gap-1 shrink-0 hover:border-primary/40"
              >
                <Icon name="inventory_2" className="text-[13px] text-primary" />
                <span>Create Product/Service</span>
              </button>
              <button
                type="button"
                onClick={handleCreateLocation}
                className="px-2.5 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-[11px] font-semibold text-text-primary flex items-center gap-1 shrink-0 hover:border-primary/40"
              >
                <Icon name="storefront" className="text-[13px] text-primary" />
                <span>Create Storefront</span>
              </button>
            </div>

            {/* Entity Filters: Deals, Products, Profile */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {(['all', 'deal', 'product', 'profile'] as const).map((ent) => (
                <button
                  key={ent}
                  type="button"
                  onClick={() => setEntityFilter(ent)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    entityFilter === ent
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {ent === 'all' ? 'All Entities' : `${ent}s`}
                </button>
              ))}
            </div>

            {/* Status Filter: All, Active in Rotator, Hidden */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDealFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                  dealFilter === 'all'
                    ? 'bg-primary-container text-white'
                    : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                All ({filteredItems.length})
              </button>
              <button
                type="button"
                onClick={() => setDealFilter('in_rotator')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                  dealFilter === 'in_rotator'
                    ? 'bg-primary-container text-white'
                    : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                Shown in Rotator
              </button>
              <button
                type="button"
                onClick={() => setDealFilter('hidden')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                  dealFilter === 'hidden'
                    ? 'bg-primary-container text-white'
                    : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                Hidden
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-3 pt-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex gap-3 ${
                    item.showInCluster
                      ? 'bg-surface-subtle border-border-subtle'
                      : 'bg-surface-subtle/60 border-border-subtle opacity-70'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-border-subtle"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-primary truncate">
                          {item.businessName}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-surface-canvas text-text-secondary border border-border-subtle">
                            {item.entityType}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                              item.showInCluster
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.showInCluster ? 'Shown' : 'Hidden'}
                          </span>
                          {isMine(item) && boosts.hasActiveBoostForItem(item.id) && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                item.entityType === 'profile'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-surface-tint-blue text-primary'
                              }`}
                            >
                              {item.entityType === 'profile' ? 'Boosted · extendable' : 'Boosted'}
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold text-xs text-text-primary line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      {item.price > 0 && (
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-bold text-xs text-text-primary">
                            ₦{item.price.toLocaleString()}
                          </span>
                          {item.oldPrice && (
                            <span className="text-[10px] text-text-tertiary line-through">
                              ₦{item.oldPrice.toLocaleString()}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-[10px] font-bold text-badge-discount-text">
                              {item.discount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-[10px] text-text-secondary gap-2">
                      <span>
                        {fig(String(item.impressions))} Impr. &bull; {fig(String(item.clicks))} Clicks
                      </span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        {isMine(item) && boosts.isItemBoostEligible(item).eligible && (
                          <button
                            type="button"
                            disabled={boosts.hasActiveBoostForItem(item.id) && item.entityType !== 'profile'}
                            onClick={() => onBoostItem?.(item.id)}
                            className={`font-bold hover:underline ${
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
                            className="font-bold text-text-secondary hover:underline"
                          >
                            {item.showInCluster ? 'Hide from Rotator' : 'Show in Rotator'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: CLUSTER QR ================= */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center gap-5 pt-2">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-text-primary">Official Cluster QR Pass</h2>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Display this at your cashier counter, table standees, or plaza entrance.
              </p>
            </div>

            <ClusterQrCode
              url={cluster.qrCode.url}
              clusterName={cluster.name}
              displayCode={cluster.qrCode.displayCode}
              size={200}
            />

            <div className="w-full p-4 rounded-2xl bg-surface-subtle border border-border-subtle text-left space-y-2.5">
              <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wider">
                Touchpoint Specifications
              </h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-start gap-2">
                  <Icon name="nfc" className="text-[16px] text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>NFC Tap Compatible:</strong> Compatible with VEMTAP Smart Tap plates and
                    printable QR counter stands.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    name="storefront"
                    className="text-[16px] text-emerald-600 shrink-0 mt-0.5"
                  />
                  <span>
                    <strong>Centralized Landing:</strong> When scanned, shoppers see the cluster
                    store directory and active deals in the rotator.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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

      {/* Bottom Business Tab Bar */}
      {onTab && <BusinessTabBar active="more" onTab={onTab} />}
    </AppScreen>
  );
}
