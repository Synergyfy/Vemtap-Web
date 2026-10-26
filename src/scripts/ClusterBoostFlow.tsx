/**
 * Cluster Boost Visibility — purchase flow (mobile-first).
 *
 * Steps: select an eligible item (skipped when preselected) → campaign
 * settings (config-driven priority slider, duration, start date, provisional
 * exposure estimate, live price) → payment (VEMTAP Wallet or sandbox card)
 * → confirmation with active / scheduled / pending status.
 *
 * Frontend-only: payment methods are clearly-labelled sandbox simulations.
 * The campaign store keeps an idempotency key per checkout so a retried
 * submit can never double-charge.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CalendarPicker } from '../components/ui/CalendarPicker';
import { BusinessPortalChrome } from './desktop/BusinessPortalChrome';
import { SubscriptionChrome } from './desktop/SubscriptionChrome';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { getClusterState, type ClusterShowcaseItem, type ShowcaseEntityType } from './clusterData';
import {
  addDaysIso,
  CAMPAIGN_PLACEMENTS,
  CLUSTER_BOOST_CONFIG,
  computeBoostPrice,
  estimateExposureShare,
  formatNaira,
  getBoostCapacity,
  getBoostEligibleItems,
  getClusterBoostWallet,
  getDurationByKey,
  getLiveBoostForItem,
  getPlacementAvailability,
  getTierByKey,
  hasActiveBoostForItem,
  isoDate,
  isItemBoostEligible,
  submitClusterBoostPayment,
  topUpClusterBoostWallet,
  type CampaignPlacementKey,
  type ClusterBoostCampaign,
  type ClusterBoostDurationKey,
  type ClusterBoostPaymentMethod,
} from './clusterBoostData';
import { hasApiConfig } from '../services/api/client';
import { adWalletService } from '../services';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import { useLiveClusterBoost } from './clusterLive';

interface ClusterBoostFlowProps {
  onBack: () => void;
  /** Success → My Boosts. */
  onDone: () => void;
  /** Existing Boost Wallet top-up screen (shared payment infrastructure). */
  onOpenWallet?: () => void;
  /** Set when launched from an item-level Boost action — skips selection. */
  preselectedItemId?: string | null;
  /**
   * Which shell the flow runs in. `portal` (default) keeps the signed-in
   * business dashboard chrome; `subscription` keeps the onboarding /
   * subscription chrome (Boost Studio during onboarding).
   */
  chrome?: 'portal' | 'subscription';
  /** Desktop sidebar navigation — required when `chrome="portal"`. */
  onNav?: (key: string) => void;
  /** Desktop sidebar item to highlight (portal chrome only). */
  desktopNav?: string;
}

type BoostFlowPhase =
  | 'placement'
  | 'select'
  | 'cluster'
  | 'settings'
  | 'payment'
  | 'success';

const PHASE_STEP_NAMES: Record<BoostFlowPhase, string> = {
  placement: 'Placement',
  select: 'Choose item',
  cluster: 'Cluster',
  settings: 'Campaign settings',
  payment: 'Payment',
  success: 'Confirmed',
};

const CATEGORY_LABELS: Record<ShowcaseEntityType, string> = {
  deal: 'Deal',
  product: 'Product',
  service: 'Service',
  profile: 'Business Profile',
};

const CATEGORY_ICONS: Record<ShowcaseEntityType, string> = {
  deal: 'local_offer',
  product: 'inventory_2',
  service: 'spa',
  profile: 'storefront',
};

function makeIdempotencyKey(): string {
  return `ck_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatDateLong(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ClusterBoostFlow({
  onBack,
  onDone,
  onOpenWallet,
  preselectedItemId,
  chrome = 'portal',
  onNav,
  desktopNav,
}: ClusterBoostFlowProps) {
  const isDesktop = useIsDesktop();
  const live = hasApiConfig();
  const liveBoost = useLiveClusterBoost();
  const clusterState = useMemo(() => getClusterState(), []);
  const cluster = live ? liveBoost.cluster : clusterState.currentCluster;
  const hasActiveBoost = live ? liveBoost.hasActiveBoostForItem : hasActiveBoostForItem;

  const localEligible = useMemo(() => getBoostEligibleItems(), []);
  const eligibleItems = live ? liveBoost.eligibleItems : localEligible;
  // Preselection accepts a pool item id or its title (the Boost Hub passes
  // display names). When matched, the placement and item steps are skipped.
  // An already-boosted deal/product/service can't be preselected into a
  // duplicate purchase — only the extendable Business Profile can.
  const preselected = preselectedItemId
    ? eligibleItems.find(
        (item) =>
          (item.id === preselectedItemId ||
            item.title.toLowerCase() === preselectedItemId.toLowerCase()) &&
          (!hasActiveBoost(item.id) || item.entityType === 'profile')
      ) ?? null
    : null;

  const tiers = CLUSTER_BOOST_CONFIG.tiers;
  const durations = CLUSTER_BOOST_CONFIG.durations;
  const defaultTier = tiers[Math.min(1, tiers.length - 1)].key;

  const todayIso = useMemo(() => isoDate(new Date()), []);
  const placementAvailability = useMemo(() => getPlacementAvailability(), []);

  // Steps depend on entry: a preselected item (Boost Visibility action on a
  // cluster item) auto-selects the Cluster placement and the item itself.
  const steps: BoostFlowPhase[] = useMemo(
    () => (preselected ? ['cluster', 'settings', 'payment'] : ['placement', 'select', 'cluster', 'settings', 'payment']),
    [Boolean(preselected)]
  );

  const [phase, setPhase] = useState<BoostFlowPhase>(preselected ? 'cluster' : 'placement');
  // Only the Cluster placement is purchasable at launch; the others are
  // Coming Soon and cannot proceed (enforced in the placement step).
  const placement: CampaignPlacementKey = 'cluster';
  const [category, setCategory] = useState<ShowcaseEntityType | null>(
    preselected ? preselected.entityType : null
  );
  const [selectedItem, setSelectedItem] = useState<ClusterShowcaseItem | null>(preselected);
  const [tierKey, setTierKey] = useState(defaultTier);
  const [durationKey, setDurationKey] = useState<ClusterBoostDurationKey>('daily');
  const [startDate, setStartDate] = useState(todayIso);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [method, setMethod] = useState<ClusterBoostPaymentMethod>('wallet');
  const [localWalletBalance, setWalletBalance] = useState(() => getClusterBoostWallet().balance);
  const walletBalance = live ? liveBoost.walletBalance : localWalletBalance;
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<ClusterBoostCampaign | null>(null);
  const [isExtension, setIsExtension] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const idempotencyKey = useRef(makeIdempotencyKey());

  const toastTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (liveBoost.error) showToast(apiErrorMessage(liveBoost.error, 'Could not load what you can boost.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveBoost.error]);

  const stepIndex = steps.indexOf(phase);
  const totalSteps = steps.length;

  /** Back walks through visited steps; at the first step it exits the flow. */
  const handleBack = () => {
    if (phase === 'success') {
      onBack();
      return;
    }
    const index = steps.indexOf(phase);
    if (index > 0) setPhase(steps[index - 1]);
    else onBack();
  };

  // Fresh idempotency key whenever a new checkout attempt begins.
  useEffect(() => {
    if (phase === 'payment') idempotencyKey.current = makeIdempotencyKey();
  }, [phase]);

  const localCapacity = useMemo(() => getBoostCapacity(), [phase]);
  const capacity = live ? liveBoost.capacity : localCapacity;
  const tier = getTierByKey(tierKey);
  const duration = getDurationByKey(durationKey);
  const price = useMemo(() => computeBoostPrice(tierKey, durationKey), [tierKey, durationKey]);
  const estimate = useMemo(
    () =>
      estimateExposureShare(
        tier.weight,
        Math.max(0, capacity.activeFeaturedEntries - (selectedItem?.showInCluster ? 1 : 0))
      ),
    [tier.weight, capacity.activeFeaturedEntries, selectedItem]
  );
  const endDate = useMemo(() => addDaysIso(startDate, duration.days), [startDate, duration.days]);
  const walletShortfall = Math.max(0, price.total - walletBalance);

  const categoriesAvailable = useMemo(() => {
    const counts: Partial<Record<ShowcaseEntityType, number>> = {};
    eligibleItems.forEach((item) => {
      counts[item.entityType] = (counts[item.entityType] ?? 0) + 1;
    });
    return counts;
  }, [eligibleItems]);

  const visibleItems = category ? eligibleItems.filter((item) => item.entityType === category) : [];
  const selectedWarning = selectedItem
    ? (live ? liveBoost.isItemBoostEligible : isItemBoostEligible)(selectedItem).warning
    : undefined;

  // Business profile exception: when the profile already has a live boost,
  // this purchase extends it (more days / heavier priority) instead of
  // creating a second campaign.
  const isProfileExtension = Boolean(
    !live && selectedItem && selectedItem.entityType === 'profile' && getLiveBoostForItem(selectedItem.id)
  );

  const startDateInvalid = startDate < todayIso;
  const canContinueSettings =
    Boolean(selectedItem) &&
    !startDateInvalid &&
    // Extensions reuse the existing cluster slot, so capacity never blocks them.
    (!capacity.isBlocked || isProfileExtension);

  const handlePay = async () => {
    if (submitting || !selectedItem) return;
    setSubmitting(true);
    setPaymentError(null);
    if (live) {
      try {
        const result = await liveBoost.purchase.mutateAsync({
          item: selectedItem,
          tierKey,
          weight: tier.weight,
          durationKey,
          days: duration.days,
          startDate,
          endDate,
          amount: price.total,
          paymentMethod: method,
          estimatedSharePct: estimate.sharePct,
          idempotencyKey: idempotencyKey.current,
        });
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl);
          return;
        }
        setCampaign(result.campaign);
        setIsExtension(false);
        setPhase('success');
      } catch (error) {
        setPaymentError(planErrorMessage(error) ?? apiErrorMessage(error, 'Payment could not be completed. Try again.'));
      } finally {
        setSubmitting(false);
      }
      return;
    }
    try {
      const result = await submitClusterBoostPayment({
        itemId: selectedItem.id,
        tierKey,
        durationKey,
        startDate,
        paymentMethod: method,
        idempotencyKey: idempotencyKey.current,
      });
      if (result.ok && result.campaign) {
        setWalletBalance(getClusterBoostWallet().balance);
        setCampaign(result.campaign);
        setIsExtension(Boolean(result.extension));
        setPhase('success');
      } else {
        setWalletBalance(getClusterBoostWallet().balance);
        setPaymentError(result.message ?? 'Payment could not be completed. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTopUp = (amount: number) => {
    if (live) {
      adWalletService
        .topUp({ amount, callbackUrl: window.location.href.split('?')[0] })
        .then((result) => {
          if (result.authorizationUrl) window.location.assign(result.authorizationUrl);
          else showToast(`Top-up of ${formatNaira(amount)} started`);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not start the top-up.')));
      return;
    }
    const wallet = topUpClusterBoostWallet(amount);
    setWalletBalance(wallet.balance);
    setTopUpOpen(false);
    showToast(`${formatNaira(amount)} added to your Boost Wallet (demo top-up)`);
  };

  // -------------------------------------------------------------------------
  // Shared building blocks
  // -------------------------------------------------------------------------

  const stepLabel =
    phase === 'success'
      ? 'Confirmed'
      : `Step ${stepIndex + 1} of ${totalSteps} · ${PHASE_STEP_NAMES[phase]}`;

  /** Desktop shell — dashboard sidebar or onboarding chrome. */
  const wrapDesktop = (content: ReactNode) =>
    chrome === 'subscription' ? (
      <SubscriptionChrome onBrand={onBack} breadcrumb="Create Campaign">
        {content}
      </SubscriptionChrome>
    ) : (
      <BusinessPortalChrome activeNav={desktopNav ?? 'cluster-system'} onNav={onNav ?? (() => undefined)}>
        {content}
      </BusinessPortalChrome>
    );

  const header = (
    <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle">
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-text-secondary hover:text-text-primary rounded-lg"
            aria-label="Go back"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight truncate">
              Create Campaign
            </h1>
            <p className="text-[11px] text-text-secondary truncate max-w-[220px]">
              {cluster?.name ?? 'VEMTAP advertising'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-tint-blue px-2.5 py-1 rounded-full shrink-0">
          {stepLabel}
        </span>
      </div>
      {phase !== 'success' && (
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
          aria-label="Campaign setup progress"
          className="h-1 bg-surface-container-highest"
        >
          <div
            className="h-full bg-primary-container transition-all"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      )}
    </header>
  );

  const itemSummaryCard = selectedItem && (
    <div className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
      <img
        src={selectedItem.image}
        alt={selectedItem.title}
        className="w-14 h-14 rounded-xl object-cover border border-border-subtle shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-canvas text-text-secondary border border-border-subtle">
            {CATEGORY_LABELS[selectedItem.entityType]}
          </span>
          {!selectedItem.showInCluster && (
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Hidden from rotator
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
          {selectedItem.title}
        </p>
        <p className="text-[11px] text-text-secondary truncate">{selectedItem.businessName}</p>
      </div>
      {phase !== 'select' && !preselected && (
        <button
          type="button"
          onClick={() => {
            setSelectedItem(null);
            setCategory(null);
            setPhase('select');
          }}
          className="text-[11px] font-semibold text-primary shrink-0"
        >
          Change
        </button>
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // Phase: success
  // -------------------------------------------------------------------------

  if (phase === 'success' && campaign) {
    const statusPill =
      campaign.status === 'active'
        ? { label: 'Active', className: 'bg-emerald-100 text-emerald-800' }
        : campaign.status === 'scheduled'
          ? { label: 'Scheduled', className: 'bg-surface-tint-blue text-primary' }
          : { label: 'Pending', className: 'bg-amber-100 text-amber-800' };

    const successBody = (
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <Icon name="check_circle" className="text-[30px] text-emerald-600" />
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusPill.className}`}
          >
            {statusPill.label}
          </span>
          <h2 className="text-lg font-bold text-text-primary">
            {campaign.status === 'pending'
              ? 'Payment received — activation queued'
              : isExtension
                ? 'Profile boost extended'
                : 'Your cluster campaign is live'}
          </h2>
          <p className="text-xs text-text-secondary">
            {campaign.status === 'pending'
              ? (campaign.activationNote ??
                'Your payment is recorded. Activation will follow once cluster capacity allows — you will not be charged again.')
              : isExtension
                ? `Your ${campaign.itemTitle} stays boosted through ${formatDateLong(campaign.endDate)} at ${getTierByKey(campaign.tierKey).label} priority. Your previous spend and this top-up are combined on one boost.`
                : `Your ${campaign.itemTitle} now carries raised selection priority in ${campaign.clusterName}.`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
            Campaign details
          </h3>
          {[
            { icon: 'label', label: 'Item', value: campaign.itemTitle },
            { icon: 'hub', label: 'Cluster', value: campaign.clusterName },
            { icon: 'tune', label: 'Priority', value: `${getTierByKey(campaign.tierKey).label} (${campaign.weight}× weight)` },
            {
              icon: 'schedule',
              label: 'Duration',
              value: `${getDurationByKey(campaign.durationKey).label} · ${formatDateLong(campaign.startDate)} – ${formatDateLong(campaign.endDate)}`,
            },
            {
              icon: 'payments',
              label: 'Amount paid',
              value: `${formatNaira(campaign.amount)} · ${campaign.paymentMethod === 'wallet' ? 'VEMTAP Wallet' : live ? 'Debit/Credit Card' : 'Debit/Credit Card (sandbox)'}`,
            },
            { icon: 'receipt_long', label: 'Payment reference', value: campaign.reference },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2.5">
              <Icon name={row.icon} className="text-[16px] text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-secondary">{row.label}</p>
                <p className="text-xs font-semibold text-text-primary break-words">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-text-secondary text-center leading-relaxed px-2">
          Sandbox checkout — no live payment gateway is connected in this build. Performance
          metrics appear in My Boosts once real cluster tracking is wired.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onDone}
            className="flex-1 h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Icon name="campaign" className="text-[18px]" />
            <span>View My Boosts</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-12 rounded-xl border border-border-subtle bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary"
          >
            Back to Cluster
          </button>
        </div>
      </div>
    );

    if (isDesktop) {
      return wrapDesktop(<div className="p-10">{successBody}</div>);
    }
    return <AppScreen surface="bg-surface-canvas">{header}{successBody}</AppScreen>;
  }

  // -------------------------------------------------------------------------
  // Phase: placement — "Where do you want to advertise?"
  // -------------------------------------------------------------------------

  const placementBody = (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-text-primary">Where do you want to advertise?</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Start with a Cluster Campaign to promote your listing inside its market, mall, or plaza.
          Wider placements roll out as coverage grows.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {CAMPAIGN_PLACEMENTS.map((option) => {
          const enabled = placementAvailability[option.key];
          const selected = enabled && placement === option.key;
          return (
            <button
              key={option.key}
              type="button"
              disabled={!enabled}
              onClick={() => {
                if (enabled) setPhase('select');
                else
                  showToast(
                    `${option.label} campaigns are coming soon — enabled by VEMTAP admins when coverage is ready.`
                  );
              }}
              className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                !enabled
                  ? 'bg-surface-subtle/60 border-border-subtle opacity-80 cursor-not-allowed'
                  : selected
                    ? 'bg-surface-tint-blue border-primary/40'
                    : 'bg-surface-subtle border-border-subtle hover:border-primary/30'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  enabled ? 'bg-primary-container/15 text-primary' : 'bg-surface-canvas text-text-tertiary'
                }`}
              >
                <Icon name={option.icon} className="text-[20px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{option.label}</p>
                  {enabled ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                      Available now
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-canvas text-text-tertiary border border-border-subtle shrink-0">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                  {option.description}
                </p>
              </div>
              {enabled ? (
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    selected ? 'bg-primary-container border-primary-container' : 'border-border-subtle'
                  }`}
                >
                  {selected && <Icon name="check" className="text-[12px] text-white" />}
                </span>
              ) : (
                <Icon name="lock" className="text-[16px] text-text-tertiary shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed">
        Locked placements are enabled by authorised VEMTAP admins once cluster coverage,
        measurement, and rotator capacity are ready — they cannot proceed to payment yet.
      </p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Phase: cluster — confirm the business's actual eligible cluster
  // -------------------------------------------------------------------------

  const clusterBody = cluster ? (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-text-primary">Confirm your cluster</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Campaigns run inside the cluster your business already belongs to — placements can't
          bypass cluster membership or location rules.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
            <Icon name="hub" className="text-[22px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{cluster.name}</p>
            <p className="text-[11px] text-text-secondary truncate">
              {cluster.address}, {cluster.city}
              {cluster.state ? ` · ${cluster.state}` : ''}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <p className="text-xs font-bold text-text-primary">{clusterState.members.length}</p>
            <p className="text-[9px] uppercase tracking-wider text-text-tertiary mt-0.5">Members</p>
          </div>
          <div className="p-2 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <p className="text-xs font-bold text-text-primary">
              {(cluster.radiusMeters / 1000).toFixed(1)} km
            </p>
            <p className="text-[9px] uppercase tracking-wider text-text-tertiary mt-0.5">Radius</p>
          </div>
          <div className="p-2 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <p className="text-xs font-bold text-text-primary">
              {cluster.rotatorSettings.isActive
                ? `${cluster.rotatorSettings.rotationIntervalSeconds}s`
                : 'Paused'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-text-tertiary mt-0.5">Rotation</p>
          </div>
        </div>
      </div>

      {itemSummaryCard}

      <p className="text-[11px] text-text-secondary leading-relaxed">
        Eligible paid campaigns join the featured rotation here — one at a time, rotating with
        other featured campaigns. No guaranteed impressions are promised.
      </p>
    </div>
  ) : (
    <div className="p-6 rounded-2xl bg-surface-subtle border border-border-subtle text-center space-y-3">
      <Icon name="hub" className="text-[32px] text-text-tertiary" />
      <p className="text-sm font-semibold text-text-primary">No eligible cluster</p>
      <p className="text-xs text-text-secondary">
        Your business isn't part of an active cluster yet. Cluster campaigns unlock once your
        cluster membership is confirmed.
      </p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Phase: select
  // -------------------------------------------------------------------------

  const selectBody = (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-text-primary">Boost an item in your cluster</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Pick one of your own listings to raise its featured-selection priority in{' '}
          {cluster?.name ?? 'your cluster'}. Boost as many different deals, products, and services
          as you like — your Business Profile has a single boost you can extend instead.
        </p>
      </div>

      {eligibleItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-surface-subtle border border-border-subtle text-center space-y-2">
          <Icon name="inventory_2" className="text-[32px] text-text-tertiary" />
          <p className="text-sm font-semibold text-text-primary">No eligible items yet</p>
          <p className="text-xs text-text-secondary">
            Feature a deal, product, service, or your store profile in the cluster pool first, then
            come back to boost it.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(Object.keys(CATEGORY_LABELS) as ShowcaseEntityType[])
              .filter((key) => (categoriesAvailable[key] ?? 0) > 0)
              .map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    category === key
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={CATEGORY_ICONS[key]} className="text-[13px]" />
                  <span>
                    {CATEGORY_LABELS[key]} ({categoriesAvailable[key]})
                  </span>
                </button>
              ))}
          </div>

          {category && (
            <div className="space-y-2">
              {visibleItems.map((item) => {
                const selected = selectedItem?.id === item.id;
                const alreadyBoosted = hasActiveBoost(item.id);
                // Profile exception: a live profile boost can be topped up
                // (more days / higher priority) instead of blocked.
                const isProfileExtend = alreadyBoosted && item.entityType === 'profile';
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={alreadyBoosted && !isProfileExtend}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      alreadyBoosted && !isProfileExtend
                        ? 'bg-surface-subtle/60 border-border-subtle opacity-70 cursor-not-allowed'
                        : selected
                          ? 'bg-surface-tint-blue border-primary/40'
                          : 'bg-surface-subtle border-border-subtle hover:border-primary/30'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-border-subtle shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {isProfileExtend
                          ? 'Live boost — extend days or raise priority'
                          : alreadyBoosted
                            ? 'Already has a live cluster boost'
                            : item.showInCluster
                              ? 'In the rotator now'
                              : 'Hidden from the rotator'}
                      </p>
                    </div>
                    {alreadyBoosted && !isProfileExtend ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary shrink-0">
                        Boosted
                      </span>
                    ) : isProfileExtend ? (
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-primary-container border-primary-container'
                            : 'border-border-subtle'
                        }`}
                      >
                        {selected && <Icon name="check" className="text-[12px] text-white" />}
                      </span>
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-primary-container border-primary-container'
                            : 'border-border-subtle'
                        }`}
                      >
                        {selected && <Icon name="check" className="text-[12px] text-white" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <p className="text-[11px] text-text-secondary leading-relaxed">
        Boosting changes how often the rotator can pick your item — it does not guarantee
        impressions and never bypasses cluster rotator controls.
      </p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Phase: settings
  // -------------------------------------------------------------------------

  const settingsBody = (
    <div className="flex flex-col gap-4">
      {itemSummaryCard}

      {selectedWarning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <Icon name="warning" className="text-[16px] text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">{selectedWarning}</p>
        </div>
      )}

      {isProfileExtension && (
        <div className="p-3 rounded-xl bg-surface-tint-blue border border-primary/30 flex items-start gap-2">
          <Icon name="trending_up" className="text-[16px] text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Extending your live profile boost — this purchase adds the chosen days on top of your
            current end date and raises the priority if you pick a heavier tier. No second profile
            boost is created.
          </p>
        </div>
      )}

      {/* Priority slider — steps through config-driven tiers */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Featured priority
            </h3>
            <p className="text-sm font-bold text-text-primary">{tier.label}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary text-[11px] font-bold">
            {tier.weight}× selection weight
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={tiers.length - 1}
          step={1}
          value={Math.max(0, tiers.findIndex((entry) => entry.key === tierKey))}
          onChange={(event) => setTierKey(tiers[Number(event.target.value)].key)}
          aria-label="Featured priority level"
          aria-valuetext={`${tier.label}, ${tier.weight} times selection weight`}
          className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-text-secondary font-medium">
          {tiers.map((entry) => (
            <span key={entry.key} className={entry.key === tierKey ? 'text-primary font-bold' : ''}>
              {entry.label.replace(' priority', '')}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-text-secondary">{tier.description}</p>
      </div>

      {/* Duration */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Duration</h3>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setDurationKey(entry.key)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                durationKey === entry.key
                  ? 'bg-primary-container text-white border-primary-container'
                  : 'bg-surface-canvas text-text-secondary border-border-subtle'
              }`}
            >
              <span className="block">{entry.label}</span>
              <span
                className={`block text-[10px] font-medium mt-0.5 ${
                  durationKey === entry.key ? 'text-white/80' : 'text-text-tertiary'
                }`}
              >
                {entry.days} day{entry.days === 1 ? '' : 's'}
                {entry.discountLabel ? ` · ${entry.discountLabel}` : ''}
              </span>
            </button>
          ))}
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-text-secondary mb-1">
            Start date
          </span>
          {/* Whole field is tappable — opens the full calendar below */}
          <button
            id="cluster-boost-start"
            type="button"
            onClick={() => setCalendarOpen((open) => !open)}
            aria-expanded={calendarOpen}
            aria-controls="cluster-boost-calendar"
            aria-label={`Start date: ${formatDateLong(startDate)}. Open calendar`}
            className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl bg-surface-canvas border font-body-md text-body-md text-on-surface flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              startDateInvalid ? 'border-error ring-2 ring-error' : 'border-border-subtle'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <Icon name="calendar_today" className="text-[18px] text-primary shrink-0" />
              <span className="truncate">{formatDateLong(startDate)}</span>
            </span>
            <Icon
              name={calendarOpen ? 'expand_less' : 'expand_more'}
              className="text-[18px] text-text-secondary shrink-0"
            />
          </button>
          {startDateInvalid && (
            <span role="alert" className="flex items-center gap-1 mt-1 text-[11px] text-error">
              <Icon name="error" className="text-[13px]" />
              Start date cannot be in the past.
            </span>
          )}

          {/* Full month calendar — every day box is directly clickable */}
          {calendarOpen && (
            <div
              id="cluster-boost-calendar"
              className="mt-2 rounded-2xl bg-surface-canvas border border-border-subtle p-3"
            >
              <CalendarPicker
                valueISO={startDate}
                onSelect={(iso) => {
                  setStartDate(iso);
                  setCalendarOpen(false);
                }}
                isDateDisabled={(date) => {
                  const start = new Date(`${todayIso}T00:00:00`);
                  start.setHours(0, 0, 0, 0);
                  return date.getTime() < start.getTime();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Estimates & price */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Estimate &amp; price
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <p className="text-base font-extrabold text-primary">~{estimate.sharePct}%</p>
            <p className="text-[10px] text-text-secondary">Estimated share of featured picks</p>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-center">
            <p className="text-base font-extrabold text-text-primary">
              {live ? '—' : `${capacity.remainingBoostSlots}/${capacity.maxBoostSlots}`}
            </p>
            <p className="text-[10px] text-text-secondary">Cluster boost slots open</p>
          </div>
        </div>

        <p className="text-[10px] text-text-secondary leading-relaxed">
          Provisional estimate based on your selection weight against{' '}
          {estimate.competingEntries} other featured entries. It is not measured traffic and does
          not guarantee impressions.
        </p>

        {capacity.isBlocked ? (
          <div className="p-3 rounded-xl bg-error-container/60 border border-error/30 flex items-start gap-2">
            <Icon name="error" className="text-[16px] text-error shrink-0 mt-0.5" />
            <p className="text-[11px] text-error leading-relaxed">{capacity.blockedReason}</p>
          </div>
        ) : (
          <p className="text-[11px] text-text-secondary">
            You currently run {capacity.liveForBusiness} live boost
            {capacity.liveForBusiness === 1 ? '' : 's'} — you can boost as many different deals,
            products, and services as you like.
          </p>
        )}

        <div className="pt-2 border-t border-border-subtle/60 space-y-1.5">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>
              {tier.label} × {duration.days} day{duration.days === 1 ? '' : 's'}
            </span>
            <span>{formatNaira(price.base)}</span>
          </div>
          {price.discountAmount > 0 && (
            <div className="flex justify-between text-xs text-badge-discount-text">
              <span>{duration.discountLabel ?? 'Duration discount'}</span>
              <span>-{formatNaira(price.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-bold text-text-primary">Total</span>
            <span className="text-lg font-extrabold text-text-primary">{formatNaira(price.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Phase: payment
  // -------------------------------------------------------------------------

  const paymentBody = (
    <div className="flex flex-col gap-4">
      {/* Campaign summary */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Campaign summary
        </h3>
        {itemSummaryCard}
        <div className="space-y-1.5 pt-1">
          {[
            { label: 'Placement', value: `${CAMPAIGN_PLACEMENTS.find((p) => p.key === placement)?.label ?? 'Cluster'} Campaign` },
            { label: 'Purchase', value: isProfileExtension ? 'Profile boost extension' : 'New boost' },
            { label: 'Cluster', value: cluster?.name ?? '—' },
            { label: 'Priority', value: `${tier.label} (${tier.weight}× weight)` },
            {
              label: 'Schedule',
              value: `${duration.label} · ${formatDateLong(startDate)} – ${formatDateLong(endDate)}`,
            },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-xs">
              <span className="text-text-secondary">{row.label}</span>
              <span className="font-semibold text-text-primary text-right">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-baseline pt-1.5 border-t border-border-subtle/60">
            <span className="text-sm font-bold text-text-primary">Total due today</span>
            <span className="text-lg font-extrabold text-text-primary">{formatNaira(price.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
          Payment method
        </h3>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMethod('wallet')}
            className={`w-full text-left p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              method === 'wallet'
                ? 'bg-surface-tint-blue border-primary/40'
                : 'bg-surface-canvas border-border-subtle'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0">
              <Icon name="account_balance_wallet" className="text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">VEMTAP Business Wallet</p>
              <p className="text-[11px] text-text-secondary">
                Balance {formatNaira(walletBalance)} · instant, no fees
              </p>
            </div>
            {method === 'wallet' && <Icon name="check_circle" className="text-[18px] text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`w-full text-left p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              method === 'card'
                ? 'bg-surface-tint-blue border-primary/40'
                : 'bg-surface-canvas border-border-subtle'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
              <Icon name="credit_card" className="text-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">Debit / Credit Card</p>
              <p className="text-[11px] text-text-secondary">Visa, Verve &amp; Mastercard via Paystack</p>
            </div>
            {method === 'card' && <Icon name="check_circle" className="text-[18px] text-primary" />}
          </button>
        </div>

        {method === 'wallet' && walletShortfall > 0 && (
          <div className="p-3 rounded-xl bg-error-container/60 border border-error/30 space-y-2.5">
            <div className="flex items-start gap-2">
              <Icon name="error" className="text-[16px] text-error shrink-0 mt-0.5" />
              <p className="text-[11px] text-error leading-relaxed">
                Insufficient wallet balance — you are {formatNaira(walletShortfall)} short. Top up,
                or pay with a supported card instead.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTopUpOpen((open) => !open)}
                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-[11px] font-semibold"
              >
                {topUpOpen ? 'Hide top-up' : 'Top up wallet'}
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className="px-3 py-1.5 rounded-lg bg-surface-canvas border border-border-subtle text-text-secondary text-[11px] font-semibold"
              >
                Pay with card instead
              </button>
              {onOpenWallet && (
                <button
                  type="button"
                  onClick={onOpenWallet}
                  className="px-3 py-1.5 rounded-lg text-primary text-[11px] font-semibold"
                >
                  Open Boost Wallet
                </button>
              )}
            </div>
            {topUpOpen && (
              <div className="flex flex-wrap gap-2 pt-1">
                {[5000, 10000, 25000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleTopUp(amount)}
                    className="px-3 py-1.5 rounded-lg bg-surface-canvas border border-border-subtle text-xs font-semibold text-text-primary"
                  >
                    + {formatNaira(amount)}
                  </button>
                ))}
                <span className="self-center text-[10px] text-text-secondary">Demo top-up</span>
              </div>
            )}
          </div>
        )}

        {method === 'card' && (
          <div className="p-3 rounded-xl bg-surface-canvas border border-border-subtle space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="lock" className="text-[15px] text-emerald-600" />
              <p className="text-xs font-semibold text-text-primary">Secure sandbox checkout</p>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              The existing Paystack integration runs in test mode in this build — no live card is
              ever charged and no card details are collected here.
            </p>
          </div>
        )}

        {paymentError && (
          <div role="alert" className="p-3 rounded-xl bg-error-container/60 border border-error/30 flex items-start gap-2">
            <Icon name="error" className="text-[16px] text-error shrink-0 mt-0.5" />
            <p className="text-[11px] text-error leading-relaxed">{paymentError}</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-text-secondary leading-relaxed">
        By paying you agree to the Cluster Fair Rotator Guidelines. Your boost adjusts selection
        weight only — it never overrides admin rotator controls or guarantees impressions.
      </p>
    </div>
  );

  // -------------------------------------------------------------------------
  // Sticky CTA per phase
  // -------------------------------------------------------------------------

  const stickyCta =
    phase === 'placement' ? (
      <button
        type="button"
        onClick={() => setPhase('select')}
        className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        <span>Continue with Cluster Campaign</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    ) : phase === 'select' ? (
      <button
        type="button"
        disabled={!selectedItem}
        onClick={() => setPhase('cluster')}
        className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        <span>Continue</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    ) : phase === 'cluster' ? (
      <button
        type="button"
        disabled={!cluster}
        onClick={() => setPhase('settings')}
        className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        <span>Continue to campaign settings</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    ) : phase === 'settings' ? (
      <button
        type="button"
        disabled={!canContinueSettings}
        onClick={() => setPhase('payment')}
        className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        <span>Continue to payment ({formatNaira(price.total)})</span>
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    ) : (
      <button
        type="button"
        disabled={submitting || (method === 'wallet' && walletShortfall > 0)}
        onClick={handlePay}
        className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        {submitting ? (
          <>
            <Icon name="progress_activity" className="text-[18px] animate-spin" />
            <span>Processing…</span>
          </>
        ) : (
          <>
            <Icon name="lock" className="text-[16px]" />
            <span>Pay {formatNaira(price.total)}</span>
          </>
        )}
      </button>
    );

  const secondaryCta = phase === 'payment' && !submitting && (
    <button
      type="button"
      onClick={() => setPhase('settings')}
      className="w-full h-11 rounded-xl border border-border-subtle bg-surface-canvas text-text-secondary font-button-secondary text-button-secondary"
    >
      Back to campaign settings
    </button>
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const body =
    phase === 'placement'
      ? placementBody
      : phase === 'select'
        ? selectBody
        : phase === 'cluster'
          ? clusterBody
          : phase === 'settings'
            ? settingsBody
            : paymentBody;

  if (isDesktop) {
    return wrapDesktop(
      <div className="p-10 max-w-5xl mx-auto">
        <div className="mb-6">{header}</div>
        <div
          className={`grid gap-6 items-start ${
            phase === 'payment' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'
          }`}
        >
          <div className={phase === 'payment' ? 'lg:col-span-1' : 'lg:col-span-2'}>{body}</div>
          <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-3">
            {phase !== 'payment' && phase !== 'placement' && itemSummaryCard}
            {phase === 'placement' && (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                  One system, growing reach
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  All VEMTAP campaigns share one flow. Cluster Campaign is live today; Area,
                  City, State, and Country placements unlock as admins confirm coverage and
                  measurement.
                </p>
              </div>
            )}
            {phase === 'select' && (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                  What this does
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Cluster Boost Visibility raises how often the cluster rotator can pick your own
                  item. Boost as many different deals, products, and services as you like — pricing
                  and slot limits are set by configuration and cluster capacity, never at the cost
                  of the admin rotator controls.
                </p>
              </div>
            )}
            {phase === 'settings' && (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                  Running total
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {tier.label} · {duration.label}
                  </span>
                  <span className="font-bold text-text-primary">{formatNaira(price.total)}</span>
                </div>
                <p className="text-[10px] text-text-secondary">
                  ~{estimate.sharePct}% provisional share · {formatDateLong(startDate)} –{' '}
                  {formatDateLong(endDate)}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {stickyCta}
              {secondaryCta}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppScreen surface="bg-surface-canvas">
      {toast && (
        <div className="fixed top-14 inset-x-4 z-50 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" className="text-[18px]" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {header}
      <main className="p-4 pb-32">{body}</main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-canvas/95 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe space-y-2">
        {stickyCta}
        {secondaryCta}
      </div>
    </AppScreen>
  );
}
