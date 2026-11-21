import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';
import { hasApiConfig } from '../services/api/client';
import { useBranchCatalogueCounts, useBranches, useBranchMutations } from '../hooks/business/useBranchesAndTeam';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { apiErrorMessage } from '../services/errorMessages';
import { branchAddressLabel, branchHoursLabel, branchOpenLabel } from './branchLive';

import { getAddedBusinessLocations } from './businessLocationsStore';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';
import {
  useLocationAccess,
  useLocationCheckout,
  useLocationCheckoutReturn,
} from '../hooks/business/useSubscription';
import type { LocationAccessSummary } from '../services/subscriptionService';
import {
  branchAccessLabel,
  formatLocationLimit,
  formatLocationMoney,
  locationAllowanceLabel,
  locationPlanLabel,
  locationPurchaseTotal,
  planLocationLabel,
  purchaseTermLabel,
} from './locationAccessUi';

interface BusinessLocationsScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  /** Live: opens the add-branch form. */
  onAddBranch?: () => void;
  /** Demo: opens the paid add-location flow. */
  onAddLocation?: () => void;
  /** Live: opens the plan chooser when the current plan cannot add locations. */
  onUpgradePlan?: () => void;
  /** Live: opens the standalone location purchase page. */
  onBuyLocations?: () => void;
  /** Route mode: show the purchase form immediately. */
  initialBuyLocations?: boolean;
}

const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

interface BranchMetric {
  products: string;
  services: string;
  deals: string;
}

const BRANCHES: {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  address: string;
  phone: string;
  hours: string;
  status: string;
  restrictionReason?: string | null;
  cluster: string;
  img: string;
  alt: string;
  imgHeight: string;
  pulse?: boolean;
  metrics: BranchMetric;
}[] = [
  {
    id: 'maitama',
    name: 'Maitama Flagship',
    badge: 'Branch #1',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed',
    address: 'Plot 14 Amazon Street, Maitama Heights, Abuja, FCT, Nigeria',
    phone: '+234 803 219 8831',
    hours: 'Mon - Sun: 10:00 AM - 10:00 PM',
    status: 'Active • Open Now (Closes 10:00 PM)',
    cluster: 'Abuja Central Cluster • Maitama District',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvetH4NUomgKtLXt81URGH9_tHOQfFtzoSPl5xBlarPB7-Lj3IROzFdOuHc_jtSHV-Cjpk7tYh2QoqcrZZCy7lEx4emQQSXuFKk0lEfRJR_Zs573-Bz6Ouge76v0cxnr03aXMwsQqwCE456ZoDrqyC1dqbBi8CQrHAjZzXhE-bfvhHGXvuuey0qlCMD4Wiqd0i3SsIGeFmOg99e8UuuVxGTQMMOnWfngYxyVF_-nyF2DJpGCgefbMnig',
    alt: 'Street level view of Plot 14 Amazon Street, Maitama Heights, Abuja Nigeria with modern commercial architecture and clean urban landscaping.',
    imgHeight: 'h-32',
    pulse: true,
    metrics: { products: '38', services: '14', deals: '3' },
  },
  {
    id: 'victoria-island',
    name: 'Victoria Island Branch',
    badge: 'Branch #2',
    badgeClass: 'bg-surface-container-highest text-on-surface',
    address: 'Plot 8B Adeola Odeku St, Victoria Island, Lagos, Nigeria',
    phone: '+234 812 443 0912',
    hours: 'Tue - Sun: 11:00 AM - 11:00 PM',
    status: 'Active • Open Now',
    cluster: 'Lagos Island Cluster',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz9BySSCNneXu66vlZvJPf1g3rEWwf6VAjf7kxZgUz8EWnJ9pL-AyTtHwnUo3jDl85yr1VBrk2ZrStg3U50VJx8pKWQLuplNNGH02n6o0tiVtX520F0wW9P-XAXsyveR7Q7L3xIwAQamBQtncEzSz6g9jvo-2iH-h2KBfXwHiyyg2oZndOUplJMOZmTJNCAqxNmXQFdyglFcwZgNgpjKO1hrliZQjqkpFNPdHVcKQ-WzmDiQIA0etu3w',
    alt: 'Warm welcoming daylight interior of a modern flagship retail apothecary store in Lagos with pristine marble checkout counter, soft directional architectural lights, lush potted indoor tropical plants, and subtle blue brand accents',
    imgHeight: 'h-28',
    metrics: { products: '32', services: '8', deals: '2' },
  },
];

export function BusinessLocationsScreen({ onTab, onAddBranch, onAddLocation, onUpgradePlan, onBuyLocations, initialBuyLocations = false }: BusinessLocationsScreenProps) {
  // Live: the business's real branches and what each one sells; demo keeps the samples.
  const live = hasApiConfig();
  const branchesQuery = useBranches();
  const accessQuery = useLocationAccess();
  const liveList = branchesQuery.data ?? [];
  // Live allowance, usage and restriction state all come from the backend.
  const access: LocationAccessSummary | null = live ? accessQuery.data ?? null : null;
  const accessByBranchId = new Map((access?.branches ?? []).map((item) => [item.id, item]));
  const isRestricted = (branchId: string) => accessByBranchId.get(branchId)?.access === 'restricted';
  const counts = useBranchCatalogueCounts(liveList.map((branch) => branch.id));
  const count = (value: number | null | undefined) => (value == null ? '—' : String(value));
  const branches: typeof BRANCHES = live
    ? liveList.map((branch, index) => {
        const entitlement = accessByBranchId.get(branch.id);
        const restricted = entitlement?.access === 'restricted';
        const badgeParts = [`Branch #${index + 1}`];
        if (branch.isMainBranch || entitlement?.isPrimary) badgeParts.push('Main');
        if (entitlement?.isFree) badgeParts.push('Free');
        else if (entitlement?.isPurchased) badgeParts.push('Purchased');
        else if (entitlement?.entitlementSource === 'subscription') badgeParts.push('Plan');
        if (restricted) badgeParts.push('Restricted');
        return {
          id: branch.id,
          name: branch.name,
          badge: badgeParts.join(' • '),
          badgeClass: restricted
            ? 'bg-error-container text-on-error-container'
            : branch.isMainBranch
              ? 'bg-primary-fixed text-on-primary-fixed'
              : 'bg-surface-container-highest text-on-surface',
          address: branchAddressLabel(branch),
          phone: branch.phone || '—',
          hours: branchHoursLabel(branch),
          status: entitlement
            ? branchAccessLabel(entitlement)
            : branch.isActive === false
              ? 'Paused'
              : `Active • ${branchOpenLabel(branch)}`,
          restrictionReason: entitlement?.restrictionReason ?? null,
          cluster: branch.district || [branch.city, branch.state].filter(Boolean).join(', ') || '—',
          img: branch.logoUrl || LIVE_IMAGE_PLACEHOLDER,
          alt: branch.name,
          imgHeight: index === 0 ? 'h-32' : 'h-28',
          pulse: branch.isActive !== false && !restricted,
          metrics: {
            products: count(counts[branch.id]?.products),
            services: count(counts[branch.id]?.services),
            deals: count(counts[branch.id]?.deals),
          },
        };
      })
    : BRANCHES;
  const { getEffectiveBranchOfferings } = useBusinessOfferings();
  const { update } = useBranchMutations();
  const { branch: operatingBranch, activeBranchId, switchTo } = useBusinessBranch();
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [deactivatingBranch, setDeactivatingBranch] = useState<any | null>(null);
  const [optionsBranch, setOptionsBranch] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [demoOverrides, setDemoOverrides] = useState<Record<string, any>>({});
  const [dismissed, setDismissed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showLocationLimitModal, setShowLocationLimitModal] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(initialBuyLocations);
  const [purchaseLocations, setPurchaseLocations] = useState(
    access?.purchaseOption.locationsPerPurchase || 1,
  );
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const locationCheckout = useLocationCheckout();
  const toastTimer = useRef<number | null>(null);
  // Locations bought from the dashboard (seeded demo entries match the two
  // cards below, so only real additions are rendered as extra cards).
  const [addedLocations] = useState(() =>
    live ? [] : getAddedBusinessLocations().filter((location) => !location.id.startsWith('seed-')),
  );

  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    district: '',
    city: 'Abuja',
    state: 'FCT',
    phone: '',
    openTime: '08:00',
    closeTime: '22:00',
  });

  const openEdit = (br: any) => {
    setOptionsBranch(null);
    setEditForm({
      name: br.name || '',
      address: br.address || '',
      district: br.cluster || '',
      city: 'Abuja',
      state: 'FCT',
      phone: br.phone !== '—' ? br.phone : '',
      openTime: '08:00',
      closeTime: '22:00',
    });
    setEditingBranch(br);
  };

  const handleSaveMobileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showToast('Branch name is required.');
      return;
    }

    if (live && editingBranch?.id) {
      setSavingEdit(true);
      update.mutate(
        {
          id: editingBranch.id,
          input: {
            name: editForm.name.trim(),
            address: editForm.address.trim(),
            district: editForm.district.trim(),
            city: editForm.city.trim(),
            state: editForm.state.trim(),
            phone: editForm.phone.trim(),
          },
        },
        {
          onSuccess: () => {
            setSavingEdit(false);
            setEditingBranch(null);
            showToast('Branch details updated successfully.');
          },
          onError: (err) => {
            setSavingEdit(false);
            showToast(apiErrorMessage(err, 'Failed to update branch.'));
          },
        }
      );
    } else {
      setDemoOverrides((prev) => ({
        ...prev,
        [editingBranch.id]: {
          name: editForm.name.trim(),
          address: editForm.address.trim(),
          district: editForm.district.trim(),
          phone: editForm.phone.trim(),
        },
      }));
      setEditingBranch(null);
      showToast('Branch details updated successfully.');
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingBranch) return;
    const isPaused = deactivatingBranch.status === 'Paused';
    const nextActive = isPaused;

    if (live && deactivatingBranch.id) {
      update.mutate(
        { id: deactivatingBranch.id, input: { isActive: nextActive } },
        {
          onSuccess: () => {
            setDeactivatingBranch(null);
            showToast(nextActive ? `${deactivatingBranch.name} is active again.` : `${deactivatingBranch.name} has been deactivated.`);
          },
          onError: (err) => {
            setDeactivatingBranch(null);
            showToast(apiErrorMessage(err, 'Failed to update branch status.'));
          },
        }
      );
    } else {
      setDemoOverrides((prev) => ({
        ...prev,
        [deactivatingBranch.id]: {
          status: nextActive ? 'Active • Open now' : 'Paused',
          pulse: nextActive,
        },
      }));
      setDeactivatingBranch(null);
      showToast(nextActive ? `${deactivatingBranch.name} is active again.` : `${deactivatingBranch.name} has been deactivated.`);
    }
  };

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    if (initialBuyLocations) setShowBuyForm(true);
  }, [initialBuyLocations]);

  const purchaseOption = access?.purchaseOption ?? null;
  const locationsPerPurchase = purchaseOption?.locationsPerPurchase || 1;
  useEffect(() => {
    setPurchaseLocations((current) => (current < locationsPerPurchase ? locationsPerPurchase : current));
  }, [locationsPerPurchase]);

  // A Paystack return lands back on this same page; confirm it once and refresh
  // the live allowance before showing the result.
  useLocationCheckoutReturn(
    (result) => {
      if (result.status === 'completed') {
        setShowBuyForm(false);
        showToast(`${result.locations} location${result.locations === 1 ? '' : 's'} added to your plan.`);
      } else {
        showToast('Payment is still being confirmed. Your locations will appear shortly.');
      }
    },
    (error) => showToast(apiErrorMessage(error, 'Could not confirm this location purchase.')),
  );

  const openBuyLocations = () => {
    setPurchaseError(null);
    if (onBuyLocations) onBuyLocations();
    else setShowBuyForm(true);
  };

  const submitLocationPurchase = () => {
    if (!purchaseOption?.addonId || !purchaseOption.checkoutEnabled) {
      setPurchaseError('Location checkout is not configured for this account.');
      return;
    }
    const requested = Number(purchaseLocations);
    if (!Number.isInteger(requested) || requested < locationsPerPurchase) {
      setPurchaseError(`Choose at least ${locationsPerPurchase} location${locationsPerPurchase === 1 ? '' : 's'}.`);
      return;
    }
    if (requested % locationsPerPurchase !== 0) {
      setPurchaseError(`Choose a multiple of ${locationsPerPurchase} location${locationsPerPurchase === 1 ? '' : 's'}.`);
      return;
    }
    const remaining = purchaseOption.remainingPurchasable;
    if (remaining != null && requested > remaining) {
      setPurchaseError(`You can buy at most ${remaining} more location${remaining === 1 ? '' : 's'}.`);
      return;
    }
    setPurchaseError(null);
    locationCheckout.mutate(
      {
        addonId: purchaseOption.addonId,
        locations: requested,
        callbackUrl: window.location.href.split('?')[0],
      },
      { onError: (error) => setPurchaseError(apiErrorMessage(error, 'Could not start checkout.')) },
    );
  };

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Sub-Header and Primary Add Action */}
        <section className="px-margin pt-space-xs pb-space-sm flex items-center justify-between gap-space-sm">
          <div className="min-w-0">
            <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight truncate">
              Business Locations
            </h2>
            <p className="font-caption text-caption text-text-secondary mt-space-2xs">
              Manage branches, operating hours, and live availability
            </p>
          </div>
          <button
            className="shrink-0 h-[42px] px-space-md bg-primary-container text-on-primary font-button-secondary text-button-secondary rounded-xl flex items-center gap-space-2xs shadow-[0_4px_14px_rgba(6,108,244,0.22)] active:scale-95 transition-all"
            type="button"
            onClick={() => {
              if (live && !access) {
                showToast('Checking your location allowance…');
                return;
              }
              if (live && access && !access.canAddLocation) {
                setShowLocationLimitModal(true);
                return;
              }
              if (live && onAddBranch) onAddBranch();
              else if (onAddLocation) onAddLocation();
              else showToast('New branch wizard opening...');
            }}
          >
            <Icon name="add_location_alt" className="text-[19px]" />
            <span>Add New Location</span>
          </button>
        </section>

        {/* Backend-derived allowance and usage */}
        {access && (
          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="min-w-0">
                  <p className="font-caption text-caption text-text-secondary">{locationPlanLabel(access)}</p>
                  <p className="font-heading-sm text-heading-sm text-text-primary mt-0.5">
                    {locationAllowanceLabel(access)} locations used
                  </p>
                </div>
                <span className="shrink-0 px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  {access.plan.isActive ? 'Plan active' : 'Free plan'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-space-2xs font-caption text-caption text-text-secondary">
                <span>Free: {access.allowance.free}</span>
                <span>Plan: {formatLocationLimit(access.allowance.subscription)}</span>
                <span>Purchased: {access.allowance.purchased}</span>
              </div>
              {access.notice && (
                <p className="font-caption text-caption text-on-error-container bg-error-container rounded-lg px-space-xs py-1.5">
                  {access.notice}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Backend-derived plan and capacity options */}
        {access && (access.upgradePlans.length > 0 || access.purchaseOption.available) && (
          <section className="px-margin mb-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle p-space-md flex flex-col gap-space-sm">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Location capacity options</h3>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Plans, pricing and purchase terms are supplied by your backend configuration.
                </p>
              </div>
              <div className="flex flex-col gap-space-xs">
                {access.upgradePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between gap-space-xs rounded-lg bg-surface-subtle px-space-sm py-space-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {plan.name}
                        {plan.isCurrent && <span className="ml-1 text-primary">• Current</span>}
                      </p>
                      <p className="font-caption text-caption text-text-secondary">{planLocationLabel(plan)}</p>
                    </div>
                    <span className="shrink-0 font-label-sm text-label-sm text-text-primary">
                      {formatLocationMoney(plan.monthlyPrice, plan.currency)}/mo
                    </span>
                  </div>
                ))}
              </div>
              {access.purchaseOption.available && (
                <div className="rounded-lg bg-surface-subtle px-space-sm py-space-xs flex flex-col gap-space-2xs">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">
                    {access.purchaseOption.name ?? 'Additional location capacity'}
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    {purchaseTermLabel(access.purchaseOption)}
                  </p>
                  <button
                    type="button"
                    onClick={openBuyLocations}
                    disabled={!access.purchaseOption.checkoutEnabled || !access.purchaseOption.addonId}
                    className="mt-space-2xs h-10 rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary disabled:bg-surface-container-high disabled:text-text-secondary disabled:cursor-not-allowed"
                  >
                    {access.purchaseOption.checkoutEnabled && access.purchaseOption.addonId
                      ? 'Buy More Location'
                      : 'Checkout unavailable'}
                  </button>

                  {showBuyForm && access.purchaseOption.checkoutEnabled && access.purchaseOption.addonId && (
                    <div className="mt-space-xs rounded-lg border border-border-subtle bg-surface-canvas p-space-sm flex flex-col gap-space-xs">
                      <label className="font-label-sm text-label-sm text-text-primary" htmlFor="buy-locations-count">
                        Number of locations
                      </label>
                      <input
                        id="buy-locations-count"
                        type="number"
                        min={locationsPerPurchase}
                        step={locationsPerPurchase}
                        value={purchaseLocations}
                        onChange={(event) => setPurchaseLocations(Number(event.target.value))}
                        className="h-10 w-full rounded-lg bg-surface-subtle border border-border-subtle px-space-sm text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <div className="flex items-center justify-between font-label-sm text-label-sm text-text-primary">
                        <span>Total</span>
                        <strong>{formatLocationMoney(locationPurchaseTotal(access.purchaseOption, purchaseLocations), access.purchaseOption.currency)}</strong>
                      </div>
                      {purchaseError && (
                        <p className="font-caption text-caption text-on-error-container bg-error-container rounded-lg px-space-xs py-1.5">
                          {purchaseError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={submitLocationPurchase}
                        disabled={locationCheckout.isPending}
                        className="h-10 rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary disabled:opacity-50"
                      >
                        {locationCheckout.isPending ? 'Opening checkout…' : 'Continue to Payment'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {initialBuyLocations && access && !access.purchaseOption.available && (
          <section className="px-margin mb-space-lg">
            <div className="rounded-xl border border-border-subtle bg-surface-canvas p-space-md flex flex-col gap-space-xs">
              <p className="font-label-md text-label-md text-text-primary font-semibold">
                Location purchases are not configured
              </p>
              <p className="font-caption text-caption text-text-secondary">
                Your backend has no active location add-on. Upgrade your plan to include more locations.
              </p>
              <button
                type="button"
                onClick={onUpgradePlan}
                className="h-10 rounded-lg bg-primary text-on-primary font-button-secondary text-button-secondary"
              >
                Upgrade
              </button>
            </div>
          </section>
        )}

        {/* Branch Card List */}
        <section className="px-margin flex flex-col gap-space-md">
          {branches.map((branch) => (
            <article
              className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06)] overflow-hidden"
              key={branch.id}
            >
              {/* Media Cover */}
              <div className={`relative w-full ${branch.imgHeight} bg-surface-container-low overflow-hidden`}>
                <img alt={branch.alt} className="w-full h-full object-cover" src={branch.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute top-space-xs left-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                    {branch.status}
                  </span>
                </div>
                {branch.restrictionReason && (
                  <div className="absolute bottom-space-xs right-space-xs max-w-[70%]">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-error-container/90 text-on-error-container font-caption text-caption">
                      {branch.restrictionReason}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-space-xs left-space-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-canvas/90 backdrop-blur-md text-on-surface font-caption text-caption">
                    <Icon name="distance" className="text-[13px] text-primary" />
                    {branch.cluster}
                  </span>
                </div>
              </div>
              {/* Card Content */}
              <div className="p-space-md">
                <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">{branch.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded font-caption text-caption font-semibold ${branch.badgeClass}`}>
                        {branch.badge}
                      </span>
                      {/* Offering tags per branch */}
                      {(() => {
                        const eff = getEffectiveBranchOfferings(branch.id);
                        return (
                          <>
                            {eff.includes('products') && (
                              <span className="px-1.5 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">Products</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 flex items-start gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                  </div>
                  <button
                    aria-label="Branch Options"
                    className="w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low flex items-center justify-center shrink-0 transition-colors"
                    type="button"
                    onClick={() => setOptionsBranch({ ...branch, ...(demoOverrides[branch.id] ?? {}) })}
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                </div>
                {/* Contact & Hours */}
                <div className="bg-surface-subtle rounded-lg p-space-xs my-space-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-caption text-caption">
                    <span className="text-text-secondary flex items-center gap-1">
                      <Icon name="call" className="text-[14px]" />
                      {demoOverrides[branch.id]?.phone ?? branch.phone}
                    </span>
                    <span className="text-text-primary font-medium flex items-center gap-1">
                      <Icon name="schedule" className="text-[14px] text-primary" />
                      {branch.hours}
                    </span>
                  </div>
                </div>
                {/* Live Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 my-space-sm pt-space-xs">
                  <div className="bg-surface-container-low rounded-lg p-2 text-center">
                    <span className="block font-heading-sm text-heading-sm text-primary font-bold">
                      {branch.metrics.products}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Products</span>
                  </div>
                  <div className="bg-surface-tint-blue rounded-lg p-2 text-center">
                    <span className="block font-heading-sm text-heading-sm text-primary-container font-bold">
                      {branch.metrics.deals}
                    </span>
                    <span className="font-caption text-caption text-primary-container font-semibold">Active Deals</span>
                  </div>
                </div>
                {/* Action Row */}
                <div className="flex items-center gap-space-xs mt-space-xs">
                  <button
                    className="flex-1 h-11 bg-surface-container-low text-primary-container font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled={isRestricted(branch.id)}
                    onClick={() => openEdit({ ...branch, ...(demoOverrides[branch.id] ?? {}) })}
                  >
                    <Icon name="edit_location" className="text-[18px]" />
                    Edit Location
                  </button>
                  <button
                    className="w-11 h-11 bg-surface-container-low text-text-secondary hover:text-text-primary rounded-xl flex items-center justify-center transition-colors"
                    title="Live View on Map"
                    type="button"
                    onClick={() => showToast(`Loading ${branch.name} map pin...`)}
                  >
                    <Icon name="map" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* Locations added from the dashboard (paid ₦2,000 each) */}
          {addedLocations.map((location) => (
            <article
              className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.06)] p-space-md"
              key={location.id}
            >
              <div className="flex items-start justify-between gap-space-xs">
                <div className="flex items-start gap-space-sm min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="add_location_alt" className="text-[21px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">
                        {location.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                        Active
                      </span>
                      {(() => {
                        const eff = getEffectiveBranchOfferings(location.id || location.name);
                        return (
                          <>
                            {eff.includes('products') && (
                              <span className="px-1.5 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold shrink-0">Products</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 flex items-start gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                      <span className="truncate">{location.address}</span>
                    </p>
                    <p className="font-caption text-caption text-text-tertiary mt-0.5 truncate">
                      {location.district}
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Branch Options"
                  className="w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low flex items-center justify-center shrink-0 transition-colors"
                  type="button"
                  onClick={() => showToast(`${location.name} options opening...`)}
                >
                  <Icon name="more_vert" className="text-[20px]" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-surface-subtle rounded-lg p-space-xs mt-space-sm">
                <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                  <Icon name="payments" className="text-[14px] text-primary" />
                  {location.feePaid > 0
                    ? `${formatLocationMoney(location.feePaid, 'NGN')} one-time location fee paid`
                    : 'Included with your plan'}
                </span>
                <button
                  className="h-9 px-space-sm rounded-lg bg-surface-container-low text-primary-container font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors flex items-center gap-1"
                  type="button"
                  onClick={() => openEdit({ id: location.id, name: location.name, address: location.address, cluster: location.district, phone: '' })}
                >
                  <Icon name="edit_location" className="text-[17px]" />
                  Edit
                </button>
              </div>
            </article>
          ))}

          {/* Garki Express Hub (Draft) */}
          {!live && !dismissed && (
            <article className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] p-space-md opacity-90">
              <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Garki Express Hub</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-caption text-caption font-semibold">
                      Branch #3 • Draft
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1 flex items-start gap-1">
                    <Icon name="location_on" className="text-[15px] text-text-tertiary shrink-0 mt-0.5" />
                    <span>Area 11 Commercial Arcade, Garki, Abuja</span>
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-text-tertiary shrink-0">
                  <Icon name="store" className="text-[18px]" />
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm my-space-sm flex items-center gap-space-xs">
                <Icon name="info" className="text-tertiary-container text-[20px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary">
                  Setup pending: Operating hours and merchant payout accounts need verification before this outlet can
                  accept customer tap orders.
                </p>
              </div>
              <div className="flex items-center gap-space-xs pt-space-2xs">
                <button
                  className="flex-1 h-11 bg-primary text-on-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition-all"
                  type="button"
                  onClick={() => showToast('Garki setup wizard opening...')}
                >
                  <Icon name="rocket_launch" className="text-[18px]" />
                  Complete Setup & Activate
                </button>
                <button
                  className="h-11 px-space-sm bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary rounded-xl hover:text-text-primary transition-colors"
                  type="button"
                  onClick={() => setDismissed(true)}
                >
                  Dismiss
                </button>
              </div>
            </article>
          )}
        </section>

        {/* Centralized Ecosystem Notice */}
        <section className="px-margin mt-space-lg mb-space-xs">
          <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
              <Icon name="hub" className="text-[18px]" />
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-text-primary font-semibold">
                Centralized Ecosystem Notice
              </h4>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                Branches share your central brand identity and customer loyalty programme while maintaining independent
                live inventories, pricing catalogs, and localized operating hours.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Branch Options Action Sheet */}
      {optionsBranch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setOptionsBranch(null)}>
          <div className="w-full max-w-lg bg-surface-canvas rounded-t-3xl p-space-md shadow-2xl border-t border-border-subtle space-y-2 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="min-w-0">
                <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">{optionsBranch.name}</h4>
                <p className="font-caption text-caption text-text-secondary truncate">{optionsBranch.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setOptionsBranch(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="py-1 space-y-1">
              <button
                type="button"
                onClick={() => openEdit(optionsBranch)}
                disabled={live && isRestricted(optionsBranch.id)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="edit_location" className="text-[18px] text-primary" />
                <span>Edit Location</span>
              </button>

              {(() => {
                const isCurrent = Boolean(
                  (live && optionsBranch.id)
                    ? (optionsBranch.id === activeBranchId || optionsBranch.id === operatingBranch?.id)
                    : (
                      optionsBranch.id === operatingBranch?.key ||
                      optionsBranch.id === operatingBranch?.id ||
                      optionsBranch.name === operatingBranch?.name
                    )
                );
                if (isCurrent) return null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const br = optionsBranch;
                      setOptionsBranch(null);
                      switchTo(br.id || br.key || br.name);
                      showToast(`Switched operating view to ${br.name}`);
                    }}
                    disabled={live && isRestricted(optionsBranch.id)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="sync_alt" className="text-[18px] text-secondary" />
                    <span>Switch to this Operating View</span>
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  const br = optionsBranch;
                  setOptionsBranch(null);
                  setDeactivatingBranch(br);
                }}
                disabled={live && isRestricted(optionsBranch.id)}
                className={`w-full h-11 px-3 rounded-xl font-label-md text-label-md font-semibold flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  optionsBranch.status === 'Paused'
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                <Icon name="power_settings_new" className="text-[18px]" />
                <span>{optionsBranch.status === 'Paused' ? 'Reactivate Location' : 'Deactivate Location'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Deactivate Location Danger Modal */}
      {deactivatingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-canvas p-space-md shadow-2xl border border-border-subtle flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                <Icon name="warning" className="text-[24px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                  Deactivate Location?
                </h3>
                <p className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                  {deactivatingBranch.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeactivatingBranch(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 space-y-1.5 text-xs text-on-error-container">
              <p className="font-semibold flex items-center gap-1 text-on-error-container">
                <Icon name="error" className="text-[16px] text-error" />
                <span>Operational Impact of Deactivation</span>
              </p>
              <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                <li>Storefront &amp; Deals: Customers cannot order or redeem vouchers here.</li>
                <li>POS Walk-ins: Cashiers and tills at this outlet will be locked offline.</li>
                <li>Staff Access: Staff cannot process shifts until reactivated.</li>
              </ul>
              <p className="text-[10px] text-text-secondary pt-1 border-t border-error/20">
                Past receipts and sales logs remain safe. You can reactivate anytime.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setDeactivatingBranch(null)}
                className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-button-secondary text-button-secondary text-xs"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-3 py-2 rounded-xl bg-error text-white font-button-primary text-button-primary text-xs shadow-sm flex items-center gap-1"
              >
                <Icon name="power_settings_new" className="text-[15px]" />
                <span>Confirm Deactivation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-canvas p-space-md shadow-2xl border border-border-subtle flex flex-col gap-space-sm my-6">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="edit_location" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                  Edit Location
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <form onSubmit={handleSaveMobileEdit} className="space-y-3">
              <div>
                <label className="block font-label-sm text-[12px] font-semibold text-text-primary mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block font-label-sm text-[12px] font-semibold text-text-primary mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block font-label-sm text-[12px] font-semibold text-text-primary mb-1">
                  District / Area
                </label>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block font-label-sm text-[12px] font-semibold text-text-primary mb-1">
                  Phone Hotline
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-button-secondary text-button-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-3 py-2 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary text-xs shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location limit / missing entitlement — fail closed to the upgrade or purchase flows. */}
      {showLocationLimitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowLocationLimitModal(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-surface-canvas p-space-md shadow-2xl border border-border-subtle flex flex-col gap-space-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-limit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="add_location_alt" className="text-[20px]" />
                </div>
                <h3 id="location-limit-title" className="font-heading-sm text-heading-sm text-text-primary font-bold">
                  More locations needed
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowLocationLimitModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-normal">
              {access?.blockedReason === 'PLAN_FEATURE_NOT_INCLUDED'
                ? 'Your current plan does not include additional locations. Upgrade to a plan that includes them, or buy location capacity directly.'
                : 'Your current plan does not include additional locations beyond the allowance you have already used. Upgrade to a higher plan, or buy more locations directly.'}
            </p>
            <div className="flex flex-col gap-space-2xs pt-space-2xs border-t border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setShowLocationLimitModal(false);
                  onUpgradePlan?.();
                }}
                className="h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs"
              >
                <Icon name="arrow_upward" className="text-[17px]" />
                <span>Upgrade</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLocationLimitModal(false);
                  onBuyLocations?.();
                }}
                className="h-11 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-2xs"
              >
                <Icon name="shopping_cart" className="text-[17px]" />
                <span>Buy More Location</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      <BusinessTabBar active="business" onTab={onTab} />
    </AppScreen>
  );
}
