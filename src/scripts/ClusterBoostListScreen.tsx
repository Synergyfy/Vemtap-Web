/**
 * Cluster Boost Visibility — My Boosts.
 *
 * Lists this business's cluster boost campaigns grouped by Active,
 * Scheduled, Completed and Pending. Compact cards on mobile, responsive
 * grid + sticky detail panel on tablet/desktop, with a detail overlay
 * following the existing cluster modal pattern.
 *
 * Metrics come straight from the campaign record — impressions/clicks stay
 * `null` until real cluster tracking exists and are rendered as
 * "not connected" rather than invented. Demo campaigns are seeded on first
 * run (see clusterBoostData) so the page is populated for walkthroughs.
 */

import { useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessPortalChrome } from './desktop/BusinessPortalChrome';
import { useIsDesktop } from '../hooks/useIsDesktop';
import {
  formatNaira,
  getCampaignDisplayStatus,
  getClusterBoostCampaign,
  getBoostCapacity,
  getDurationByKey,
  getTierByKey,
  listClusterBoostCampaigns,
  type ClusterBoostCampaign,
  type ClusterBoostStatus,
} from './clusterBoostData';

interface ClusterBoostListScreenProps {
  onBack: () => void;
  /** Open the boost purchase flow, optionally preselecting an item. */
  onBoostItem?: (itemId?: string) => void;
  onBackToCluster?: () => void;
}

type BoostListTab = Extract<ClusterBoostStatus, 'active' | 'scheduled' | 'completed' | 'pending'>;

const TABS: { key: BoostListTab; label: string; icon: string }[] = [
  { key: 'active', label: 'Active', icon: 'play_circle' },
  { key: 'scheduled', label: 'Scheduled', icon: 'schedule' },
  { key: 'completed', label: 'Completed', icon: 'check_circle' },
  { key: 'pending', label: 'Pending', icon: 'pending' },
];

const STATUS_META: Record<ClusterBoostStatus, { label: string; className: string; icon: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700', icon: 'play_circle' },
  scheduled: { label: 'Scheduled', className: 'bg-surface-tint-blue text-primary', icon: 'schedule' },
  completed: { label: 'Completed', className: 'bg-surface-container-highest text-text-secondary', icon: 'check_circle' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800', icon: 'pending' },
};

const CATEGORY_ICONS: Record<string, string> = {
  deal: 'local_offer',
  product: 'inventory_2',
  service: 'spa',
  profile: 'storefront',
};

function formatDateLong(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRemaining(endIso: string): string {
  const end = new Date(`${endIso}T23:59:59`).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'} left`;
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  return `${hours} hour${hours === 1 ? '' : 's'} left`;
}

function campaignProgress(campaign: ClusterBoostCampaign): { pct: number; label: string } {
  const status = getCampaignDisplayStatus(campaign);
  const start = new Date(`${campaign.startDate}T00:00:00`).getTime();
  const end = new Date(`${campaign.endDate}T23:59:59`).getTime();
  const now = Date.now();

  if (status === 'pending') return { pct: 4, label: 'Awaiting activation' };
  if (status === 'scheduled') {
    const days = Math.max(1, Math.ceil((start - now) / (1000 * 60 * 60 * 24)));
    return { pct: 0, label: `Starts in ${days} day${days === 1 ? '' : 's'}` };
  }
  if (status === 'completed') return { pct: 100, label: 'Run completed' };
  const total = end - start;
  const pct = total > 0 ? Math.min(100, Math.max(2, ((now - start) / total) * 100)) : 100;
  return { pct, label: formatRemaining(campaign.endDate) };
}

function MetricValue({ value, unit }: { value: number | null; unit: string }) {
  if (value === null) {
    return <span className="text-[11px] text-text-tertiary">Not connected</span>;
  }
  return (
    <span className="text-sm font-bold text-text-primary">
      {value.toLocaleString()}
      <span className="text-[10px] font-medium text-text-secondary"> {unit}</span>
    </span>
  );
}

export function ClusterBoostListScreen({
  onBack,
  onBoostItem,
  onBackToCluster,
}: ClusterBoostListScreenProps) {
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<BoostListTab>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const campaigns = useMemo(() => listClusterBoostCampaigns(), []);
  const capacity = useMemo(() => getBoostCapacity(), []);

  const { byTab, liveCount, investedTotal, pendingCount } = useMemo(() => {
    const groups: Record<BoostListTab, ClusterBoostCampaign[]> = {
      active: [],
      scheduled: [],
      completed: [],
      pending: [],
    };
    campaigns.forEach((campaign) => {
      groups[getCampaignDisplayStatus(campaign)].push(campaign);
    });
    return {
      byTab: groups,
      liveCount: groups.active.length + groups.scheduled.length,
      investedTotal: campaigns
        .filter((campaign) => campaign.paymentStatus === 'paid')
        .reduce((sum, campaign) => sum + campaign.amount, 0),
      pendingCount: groups.pending.length,
    };
  }, [campaigns]);

  const visible = byTab[tab];
  const selected = selectedId ? getClusterBoostCampaign(selectedId) : undefined;

  const openNewBoost = () => {
    if (onBoostItem) onBoostItem();
  };

  const campaignCard = (campaign: ClusterBoostCampaign) => {
    const status = getCampaignDisplayStatus(campaign);
    const meta = STATUS_META[status];
    const tier = getTierByKey(campaign.tierKey);
    const duration = getDurationByKey(campaign.durationKey);
    const progress = campaignProgress(campaign);

    return (
      <button
        key={campaign.id}
        type="button"
        onClick={() => setSelectedId(campaign.id)}
        className={`w-full text-left p-4 rounded-2xl border transition-all ${
          isDesktop
            ? 'bg-surface-subtle border-border-subtle hover:border-primary/40 hover:shadow-sm'
            : 'bg-surface-subtle border-border-subtle'
        } ${selectedId === campaign.id ? 'ring-2 ring-primary/40' : ''}`}
      >
        {/* Status row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${meta.className}`}
          >
            <Icon name={meta.icon} className="text-[11px]" />
            {meta.label}
          </span>
          <span className="text-[10px] font-semibold text-text-tertiary">
            {campaign.reference}
          </span>
        </div>

        {/* Item row */}
        <div className="flex items-center gap-3">
          <img
            src={campaign.itemImage}
            alt={campaign.itemTitle}
            className="w-12 h-12 rounded-xl object-cover border border-border-subtle shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-text-primary truncate">{campaign.itemTitle}</p>
            <p className="text-[11px] text-text-secondary truncate flex items-center gap-1">
              <Icon name={CATEGORY_ICONS[campaign.category] ?? 'label'} className="text-[12px]" />
              <span className="truncate">{campaign.clusterName}</span>
            </p>
          </div>
          <span className="text-sm font-extrabold text-text-primary shrink-0">
            {formatNaira(campaign.amount)}
          </span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary text-[9px] font-bold uppercase tracking-wider">
            {tier.label} · {campaign.weight}×
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary text-[9px] font-bold uppercase tracking-wider">
            {duration.label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary text-[9px] font-bold uppercase tracking-wider">
            ~{campaign.estimatedSharePct}% est. share
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                status === 'completed'
                  ? 'bg-text-tertiary'
                  : status === 'pending'
                    ? 'bg-amber-400'
                    : 'bg-primary-container'
              }`}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-semibold text-text-secondary">{progress.label}</span>
            <span className="text-[10px] text-text-tertiary">
              {formatDateLong(campaign.startDate)} – {formatDateLong(campaign.endDate)}
            </span>
          </div>
        </div>

        {/* Footer: tracked metrics + open hint */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border-subtle/60">
          <span className="text-[10px] text-text-secondary">
            {campaign.stats.impressions === null && campaign.stats.clicks === null ? (
              <>Impressions &amp; clicks — tracking not connected</>
            ) : (
              <>
                {campaign.stats.impressions ?? '—'} Impr. &bull; {campaign.stats.clicks ?? '—'}{' '}
                Clicks
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary shrink-0">
            Details
            <Icon name="chevron_right" className="text-[13px]" />
          </span>
        </div>
      </button>
    );
  };

  const detailPanel = selected && (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
        <img
          src={selected.itemImage}
          alt={selected.itemTitle}
          className="w-16 h-16 rounded-xl object-cover border border-border-subtle shrink-0"
        />
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              STATUS_META[getCampaignDisplayStatus(selected)].className
            }`}
          >
            {STATUS_META[getCampaignDisplayStatus(selected)].label}
          </span>
          <p className="text-sm font-bold text-text-primary truncate mt-1">{selected.itemTitle}</p>
          <p className="text-[11px] text-text-secondary truncate">{selected.clusterName}</p>
        </div>
      </div>

      {getCampaignDisplayStatus(selected) === 'pending' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <Icon name="pending" className="text-[16px] text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {selected.activationNote ??
              'Payment recorded — activation is queued behind cluster rotator controls. You will not be charged again.'}
          </p>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Campaign details
        </h3>
        {[
          { label: 'Priority', value: `${getTierByKey(selected.tierKey).label} (${selected.weight}× weight)` },
          {
            label: 'Duration',
            value: `${getDurationByKey(selected.durationKey).label} · ${formatDateLong(selected.startDate)} – ${formatDateLong(selected.endDate)}`,
          },
          ...(selected.extensions && selected.extensions.length > 0
            ? [
                {
                  label: 'Extensions',
                  value: `${selected.extensions.length} top-up${selected.extensions.length === 1 ? '' : 's'} · +${selected.extensions.reduce((sum, ext) => sum + ext.addedDays, 0)} days`,
                },
              ]
            : []),
          { label: 'Estimated share', value: `~${selected.estimatedSharePct}% (provisional)` },
          { label: 'Amount', value: formatNaira(selected.amount) },
          {
            label: 'Payment',
            value: `${selected.paymentMethod === 'wallet' ? 'VEMTAP Wallet' : 'Debit/Credit Card (sandbox)'} · ${selected.reference}`,
          },
        ].map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-xs">
            <span className="text-text-secondary shrink-0">{row.label}</span>
            <span className="font-semibold text-text-primary text-right">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Tracked performance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <MetricValue value={selected.stats.impressions} unit="impr." />
            <p className="text-[10px] text-text-secondary mt-0.5">Impressions</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <MetricValue value={selected.stats.clicks} unit="clicks" />
            <p className="text-[10px] text-text-secondary mt-0.5">Clicks</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <span className="text-sm font-bold text-text-primary">
              {(selected.featuredStats?.impressions ?? 0).toLocaleString()}
            </span>
            <p className="text-[10px] text-text-secondary mt-0.5">Featured slots</p>
          </div>
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          “Featured slots” counts qualifying featured appearances served by the app's rotation
          logic — tracked separately from raw QR scans. Impressions and clicks appear here once
          real cluster rotator tracking is connected; no estimates are fabricated in the meantime.
        </p>
      </div>
    </div>
  );

  const statCards = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {[
        {
          icon: 'rocket_launch',
          iconClass: 'bg-primary-container text-white',
          value: `${liveCount}`,
          label: 'Live boosts',
          sub: 'No limit — boost any eligible item',
        },
        {
          icon: 'sync',
          iconClass: 'bg-surface-tint-blue text-primary',
          value: `${capacity.remainingBoostSlots}/${capacity.maxBoostSlots}`,
          label: 'Cluster slots open',
          sub: 'Boost inventory this cluster',
        },
        {
          icon: 'payments',
          iconClass: 'bg-emerald-100 text-emerald-700',
          value: formatNaira(investedTotal),
          label: 'Total invested',
          sub: 'All cluster boosts to date',
        },
        {
          icon: 'pending',
          iconClass: 'bg-amber-100 text-amber-800',
          value: `${pendingCount}`,
          label: 'Pending',
          sub: 'Awaiting activation',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {stat.label}
            </span>
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${stat.iconClass}`}
            >
              <Icon name={stat.icon} className="text-[13px]" />
            </span>
          </div>
          <p className="text-lg font-extrabold text-text-primary mt-1.5">{stat.value}</p>
          <p className="text-[10px] text-text-secondary leading-tight">{stat.sub}</p>
        </div>
      ))}
    </div>
  );

  const listBody = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-text-primary">My Cluster Boosts</h2>
          <p className="text-[11px] text-text-secondary">
            Visibility campaigns for your own items in this cluster
          </p>
        </div>
        <button
          type="button"
          onClick={openNewBoost}
          className="py-2 px-3 rounded-xl bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all shrink-0"
        >
          <Icon name="rocket_launch" className="text-[15px]" />
          <span>Boost an item</span>
        </button>
      </div>

      {statCards}

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              tab === entry.key
                ? 'bg-primary-container text-white'
                : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={entry.icon} className="text-[13px]" />
            <span>
              {entry.label} ({byTab[entry.key].length})
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-subtle border border-border-subtle text-center space-y-2">
          <Icon name="campaign" className="text-[32px] text-text-tertiary" />
          <p className="text-sm font-semibold text-text-primary">No {tab} boosts</p>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            {tab === 'active'
              ? 'Paid boosts still within their run window appear here.'
              : tab === 'pending'
                ? 'Boosts waiting on payment confirmation or activation appear here.'
                : `Your ${tab} cluster boosts will appear here.`}
          </p>
          <button
            type="button"
            onClick={openNewBoost}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-semibold"
          >
            <Icon name="rocket_launch" className="text-[15px]" />
            <span>Boost an item</span>
          </button>
        </div>
      ) : (
        <div
          className={
            isDesktop ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'
          }
        >
          {visible.map(campaignCard)}
        </div>
      )}

      <p className="text-[10px] text-text-secondary leading-relaxed">
        Sandbox demo — payments are simulated and impressions/clicks appear once real cluster
        tracking is connected.
      </p>
    </div>
  );

  const content = (
    <div className={isDesktop ? 'max-w-6xl mx-auto' : ''}>
      {/* Mobile header */}
      {!isDesktop && (
        <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle px-4 py-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-text-secondary hover:text-text-primary rounded-lg"
            aria-label="Go back"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div>
            <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
              My Boosts
            </h1>
            <p className="text-[11px] text-text-secondary">Cluster Boost Visibility</p>
          </div>
        </header>
      )}

      <main className={isDesktop ? 'p-0' : 'p-4 pb-10'}>
        {isDesktop ? (
          <div className="grid gap-6 items-start lg:grid-cols-5">
            <div className="lg:col-span-3">{listBody}</div>
            <div className="lg:col-span-2 lg:sticky lg:top-6">
              {selected ? (
                <div className="p-5 rounded-3xl bg-surface-canvas border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-primary">Campaign detail</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="p-1 text-text-secondary hover:text-text-primary"
                      aria-label="Close detail"
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  </div>
                  {detailPanel}
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle text-center space-y-2">
                  <Icon name="touch_app" className="text-[28px] text-text-tertiary" />
                  <p className="text-sm font-semibold text-text-primary">Select a campaign</p>
                  <p className="text-xs text-text-secondary">
                    Pick a boost from the list to see its schedule, payment reference and tracked
                    performance.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          listBody
        )}
      </main>

      {/* Mobile detail overlay */}
      {!isDesktop && selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" role="dialog" aria-modal="true">
          <div className="w-full max-w-[430px] mx-auto bg-surface-canvas rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 pb-safe relative">
            <div className="w-10 h-1 rounded-full bg-surface-container-highest absolute top-2 left-1/2 -translate-x-1/2" />
            <div className="flex items-center justify-between mb-3 mt-2">
              <h3 className="text-sm font-bold text-text-primary">Campaign detail</h3>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-1 text-text-secondary"
                aria-label="Close detail"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            {detailPanel}
            {onBackToCluster && (
              <button
                type="button"
                onClick={onBackToCluster}
                className="w-full mt-4 h-11 rounded-xl border border-border-subtle bg-surface-canvas text-text-secondary text-sm font-medium"
              >
                Back to Cluster System
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <BusinessPortalChrome activeNav="cluster-system" onNav={() => undefined}>
        {content}
      </BusinessPortalChrome>
    );
  }
  return <AppScreen surface="bg-surface-canvas">{content}</AppScreen>;
}
