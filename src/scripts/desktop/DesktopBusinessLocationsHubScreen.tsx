import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { useBranchCatalogueCounts, useBranches } from '../../hooks/business/useBranchesAndTeam';
import { useBusinessAnalytics } from '../../hooks/business/useBusinessAnalytics';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { posService } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { branchAddressLabel, branchOpenLabel } from '../branchLive';
import { getAddedBusinessLocations } from '../businessLocationsStore';
import { useBusinessOfferings } from '../../context/BusinessOfferingsContext';
import {
  useLocationAccess,
  useLocationCheckout,
  useLocationCheckoutReturn,
} from '../../hooks/business/useSubscription';
import type { LocationAccessSummary } from '../../services/subscriptionService';
import {
  branchAccessLabel,
  formatLocationLimit,
  formatLocationMoney,
  locationAllowanceLabel,
  locationPlanLabel,
  locationPurchaseTotal,
  planLocationLabel,
  purchaseTermLabel,
} from '../locationAccessUi';

interface DesktopBusinessLocationsHubScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onAddBranch?: () => void;
  /** Live: receives the branch id to open. */
  onOpenBranch?: (branchId?: string) => void;
  /** Location-limit modal — opens the dashboard plan page. */
  onUpgradePlan?: () => void;
  /** Location-limit modal and capacity card — opens the purchase form. */
  onBuyLocations?: () => void;
  /** Route mode: show the standalone purchase form immediately. */
  initialBuyLocations?: boolean;
}

const LIVE_MAP_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

interface BranchCardData {
  id: string;
  index: string;
  indexClass: string;
  tag1: string;
  tag1Class: string;
  tag2: string;
  tag2Class: string;
  openLabel: string;
  restricted?: boolean;
  restrictionReason?: string | null;
  name: string;
  address: string;
  manager: string;
  phone: string;
  geofence: string;
  metrics: Array<{ label: string; value: string; valueClass: string }>;
  registerLabel: string;
  mapImage: string;
  mapLocation: string;
  mapBadge: string;
  mapCaption: string;
  beaconSize: string;
}

const LIVE_BRANCHES: BranchCardData[] = [
  {
    id: 'wuse',
    index: 'BRANCH #01',
    indexClass: 'text-primary',
    tag1: 'Flagship Outlet',
    tag1Class: 'bg-primary-fixed text-on-primary-fixed',
    tag2: 'Primary Node',
    tag2Class: 'bg-surface-tint-blue text-primary',
    openLabel: 'Open Now • Closes 9:00 PM WAT',
    name: 'Wuse Branch',
    address: 'Plot 12 Adetokunbo Ademola Crescent, Wuse II, Abuja, FCT',
    manager: 'John Peter',
    phone: '+234 803 219 8831',
    geofence: '300m Geofence Active',
    metrics: [
      { label: 'Products', value: '42 Items', valueClass: 'text-on-surface' },
      { label: 'Services', value: '8 Available', valueClass: 'text-on-surface' },
      { label: 'Active Deals', value: '3 Flash Deals', valueClass: 'text-badge-discount-text' },
      { label: 'POS Hardware', value: '4 Terminals', valueClass: 'text-primary' },
    ],
    registerLabel: 'View Branch Register & Terminals',
    mapImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPCdVWPhgVT0KKvEBzw0zIiwNjLmEqcOkVf4N-MKxIw0X8XvFyCRQww3t0V2lWdAZeTGs-baMC1D86AlRBdQdTp35V6bfIJYtTaBla1rsg2TulHoYpdgRs4r-AOhDQEHR9KJb0DWVAJl-31yoH6df0-BH5NP5kycx2MhW2XQqb3-0c4RHf_dt_AndUby5Rz3Dbc_06fIXYqafo-8UAYGQnJlptNlFFliyK5PGDxnPEMr4ljQyBZceopQ',
    mapLocation: 'Adetokunbo Ademola Crescent, Wuse II, Abuja',
    mapBadge: 'Wuse II Commercial Radius',
    mapCaption: 'Customers within 300m receive instant lockscreen deal notifications.',
    beaconSize: 'w-24 h-24',
  },
  {
    id: 'vi',
    index: 'BRANCH #02',
    indexClass: 'text-secondary',
    tag1: 'Coastal Cluster',
    tag1Class: 'bg-secondary-fixed text-on-secondary-fixed',
    tag2: 'Lagos Node',
    tag2Class: 'bg-surface-container text-text-secondary',
    openLabel: 'Open Now • Closes 10:30 PM WAT',
    name: 'Victoria Island Branch',
    address: '8B Adeola Odeku Street, Victoria Island, Lagos Island, Lagos',
    manager: 'Folake Adebayo',
    phone: '+234 812 443 0912',
    geofence: '500m Coastal Beacon Active',
    metrics: [
      { label: 'Products', value: '36 Items', valueClass: 'text-on-surface' },
      { label: 'Services', value: '6 Available', valueClass: 'text-on-surface' },
      { label: 'Active Deals', value: '2 Happy Hours', valueClass: 'text-badge-discount-text' },
      { label: 'POS Hardware', value: '3 Synced', valueClass: 'text-primary' },
    ],
    registerLabel: 'View Branch Register',
    mapImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFkA00W2W_pFwH0_WDPGniUHZsXYPYAiIuPd18fouM6Hxrtei1BRwf7Fa1wJxaiJ8yY6VUb26A4XIGLoF40sCY5mIp5dM06hRnMtsj6NzfkR4l8PrlmwnpJWECyXMydAdvYlfEwtadlhJa8rB4SOYAnRrEjidk2VNrvqqUpuwXcqTSnDfQ2sj_U27UW3W0aXhVUAmBsUuGXIgtSK9Jqk8hBpFGqbGiruHmg1_ylxnT7qC-HK1tVyuEPg',
    mapLocation: 'Adeola Odeku Street, Victoria Island, Lagos',
    mapBadge: 'VI Adeola Odeku Strip',
    mapCaption: 'Expanded 500m geofence covering high foot-traffic financial boulevard.',
    beaconSize: 'w-28 h-28',
  },
];

export function DesktopBusinessLocationsHubScreen({
  onNav,
  onAddBranch,
  onOpenBranch,
  onUpgradePlan,
  onBuyLocations,
  initialBuyLocations = false,
}: DesktopBusinessLocationsHubScreenProps) {
  // Live: the business's real branches, what each sells, its tills and visits; demo keeps the samples.
  const live = hasApiConfig();
  const branchesQuery = useBranches();
  const accessQuery = useLocationAccess();
  const liveList = branchesQuery.data ?? [];
  const access: LocationAccessSummary | null = live ? accessQuery.data ?? null : null;
  const accessByBranchId = new Map((access?.branches ?? []).map((item) => [item.id, item]));
  const isRestricted = (branchId: string) => accessByBranchId.get(branchId)?.access === 'restricted';
  const counts = useBranchCatalogueCounts(liveList.map((branch) => branch.id));
  const tillsQuery = useQuery({ queryKey: ['pos', 'tills', 'all'], queryFn: () => posService.tills(null), enabled: live });
  const locations = useBusinessAnalytics('locations', 30);
  const { branch: activeBranch, branches: allBranches, switchTo } = useBusinessBranch();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showLocationLimitModal, setShowLocationLimitModal] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(initialBuyLocations);
  const [purchaseLocations, setPurchaseLocations] = useState(
    access?.purchaseOption.locationsPerPurchase || 1,
  );
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [headerNotice, setHeaderNotice] = useState<string | null>(null);
  const locationCheckout = useLocationCheckout();
  const tillCount = (branchId: string) => (tillsQuery.data ?? []).filter((till) => till.branchId === branchId).length;
  const n = (value: number | null | undefined) => (value == null ? '—' : String(value));
  const cards: BranchCardData[] = live
    ? liveList.map((branch, index) => {
        const entitlement = accessByBranchId.get(branch.id);
        const restricted = entitlement?.access === 'restricted';
        return {
        id: branch.id,
        index: `BRANCH #${String(index + 1).padStart(2, '0')}`,
        indexClass: restricted ? 'text-error' : branch.isMainBranch ? 'text-primary' : 'text-secondary',
        tag1: restricted
          ? 'Restricted'
          : entitlement?.isFree
            ? 'Primary • Free'
            : entitlement?.isPurchased
              ? 'Purchased'
              : branch.isMainBranch
                ? 'Main Branch'
                : entitlement?.entitlementSource === 'subscription'
                  ? 'Plan Capacity'
                  : 'Branch',
        tag1Class: restricted
          ? 'bg-error-container text-on-error-container'
          : branch.isMainBranch
            ? 'bg-primary-fixed text-on-primary-fixed'
            : 'bg-secondary-fixed text-on-secondary-fixed',
        tag2: branch.state || branch.city || '—',
        tag2Class: 'bg-surface-tint-blue text-primary',
        openLabel: entitlement ? branchAccessLabel(entitlement) : branch.isActive === false ? 'Paused' : branchOpenLabel(branch),
        restricted,
        restrictionReason: entitlement?.restrictionReason ?? null,
        name: branch.name,
        address: branchAddressLabel(branch),
        manager: branch.managerName || '—',
        phone: branch.phone || '—',
        geofence: '—',
        metrics: [
          { label: 'Products', value: `${n(counts[branch.id]?.products)} Items`, valueClass: 'text-on-surface' },
          { label: 'Services', value: `${n(counts[branch.id]?.services)} Available`, valueClass: 'text-on-surface' },
          { label: 'Active Deals', value: `${n(counts[branch.id]?.deals)} Deals`, valueClass: 'text-badge-discount-text' },
          { label: 'POS Hardware', value: `${tillsQuery.data ? tillCount(branch.id) : '—'} Terminals`, valueClass: 'text-primary' },
        ],
        registerLabel: 'View Branch Register & Terminals',
        mapImage: LIVE_MAP_PLACEHOLDER,
        mapLocation: branchAddressLabel(branch),
        mapBadge: branch.district || branch.city || 'Branch area',
        mapCaption: 'Customers near this branch see its deals in discovery.',
        beaconSize: 'w-24 h-24',
        };
      })
    : LIVE_BRANCHES;
  const activeCount = liveList.filter((branch) => branch.isActive !== false).length;
  const states = Array.from(new Set(liveList.map((branch) => branch.state || branch.city).filter(Boolean))) as string[];
  const skuTotal = liveList.reduce((sum, branch) => sum + (counts[branch.id]?.products ?? 0) + (counts[branch.id]?.services ?? 0), 0);
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);

  const purchaseOption = access?.purchaseOption ?? null;
  const locationsPerPurchase = purchaseOption?.locationsPerPurchase || 1;
  useEffect(() => {
    if (initialBuyLocations) setShowBuyForm(true);
  }, [initialBuyLocations]);
  useEffect(() => {
    setPurchaseLocations((current) => (current < locationsPerPurchase ? locationsPerPurchase : current));
  }, [locationsPerPurchase]);

  useLocationCheckoutReturn(
    (result) => {
      if (result.status === 'completed') {
        setShowBuyForm(false);
        setPurchaseNotice(`${result.locations} location${result.locations === 1 ? '' : 's'} added to your plan.`);
      } else {
        setPurchaseNotice('Payment is still being confirmed. Your locations will appear shortly.');
      }
    },
    (error) => setPurchaseError(apiErrorMessage(error, 'Could not confirm this location purchase.')),
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
    setPurchaseNotice(null);
    locationCheckout.mutate(
      {
        addonId: purchaseOption.addonId,
        locations: requested,
        callbackUrl: window.location.href.split('?')[0],
      },
      { onError: (error) => setPurchaseError(apiErrorMessage(error, 'Could not start checkout.')) },
    );
  };

  const { getEffectiveBranchOfferings } = useBusinessOfferings();
  // Locations bought from the dashboard (seeded demo entries already match the
  // cards below, so only real additions are rendered as extra cards).
  const addedLocations = live
    ? []
    : getAddedBusinessLocations().filter(
        (location) => !location.id.startsWith('seed-'),
      );
  return (
    <MerchantShell activeNav="business-locations" onNav={onNav}>
      <div className="flex flex-col gap-space-2xs mb-space-lg">
        <div className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
          <button
            type="button"
            onClick={() => onNav('overview')}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Business Hub
          </button>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="text-primary font-semibold">Locations & Branches</span>
        </div>
        {/* Header — stacks until `xl` so it fits iPad Pro 13 */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mt-space-2xs">
          <div className="min-w-0">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Locations &amp; Branch Network Management
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-3xl">
              Manage physical store outlets, localized operating hours, local inventory pools, and geofence beacon
              visibility across Nigeria.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => {
                downloadCsv(
                  'vemtap_branch_directory',
                  ['Branch', 'Address', 'Manager', 'Phone', 'Geofence', ...LIVE_BRANCHES[0].metrics.map((metric) => metric.label)],
                  cards.map((branch) => [
                    branch.name,
                    branch.address,
                    branch.manager,
                    branch.phone,
                    branch.geofence,
                    ...branch.metrics.map((metric) => metric.value),
                  ]),
                );
              }}
              className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm"
            >
              <Icon name="file_download" className="text-[18px] text-text-secondary" />
              <span>Export Directory (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (live && !access) {
                  setHeaderNotice('Checking your location allowance…');
                  return;
                }
                if (access && !access.canAddLocation) {
                  setHeaderNotice(null);
                  setShowLocationLimitModal(true);
                  return;
                }
                setHeaderNotice(null);
                onAddBranch?.();
              }}
              className="flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md transition-all shadow-md hover:shadow-lg"
            >
              <Icon name="add_location_alt" className="text-[18px]" />
              <span>+ Add New Location</span>
            </button>
          </div>
        </div>
      </div>

      {headerNotice && (
        <p className="mb-space-md rounded-lg bg-surface-container-low px-space-sm py-space-xs font-label-sm text-label-sm text-text-secondary">
          {headerNotice}
        </p>
      )}

      {/* Backend-derived allowance and usage */}
      {access && (
        <div className="rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle p-space-md mb-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                {locationPlanLabel(access)}
              </p>
              <p className="font-heading-md text-heading-md text-text-primary mt-0.5">
                {locationAllowanceLabel(access)} locations used
              </p>
            </div>
            <div className="flex flex-wrap gap-x-space-lg gap-y-space-2xs font-label-md text-label-md text-text-secondary">
              <span>Free: <strong className="text-text-primary">{access.allowance.free}</strong></span>
              <span>Plan: <strong className="text-text-primary">{formatLocationLimit(access.allowance.subscription)}</strong></span>
              <span>Purchased: <strong className="text-text-primary">{access.allowance.purchased}</strong></span>
            </div>
          </div>
          {access.notice && (
            <p className="mt-space-sm rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm px-space-sm py-space-xs">
              {access.notice}
            </p>
          )}
        </div>
      )}

      {/* Backend-derived plan and capacity options */}
      {access && (access.upgradePlans.length > 0 || access.purchaseOption.available) && (
        <div className="rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle p-space-lg mb-space-xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-md">
            <div>
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Location capacity options</h2>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Plans, pricing and purchase terms are supplied by your backend configuration.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-sm">
            {access.upgradePlans.map((plan) => (
              <div key={plan.id} className="rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-2xs">
                <p className="font-label-md text-label-md font-semibold text-text-primary">
                  {plan.name}
                  {plan.isCurrent && <span className="ml-1 text-primary">• Current</span>}
                </p>
                <p className="font-caption text-caption text-text-secondary">{planLocationLabel(plan)}</p>
                <p className="font-heading-sm text-heading-sm text-text-primary">
                  {formatLocationMoney(plan.monthlyPrice, plan.currency)}/mo
                </p>
              </div>
            ))}
          </div>
          {access.purchaseOption.available && (
            <div className="mt-space-md rounded-xl bg-surface-container-low p-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="min-w-0">
                <p className="font-label-md text-label-md font-semibold text-text-primary">
                  {access.purchaseOption.name ?? 'Additional location capacity'}
                </p>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  {purchaseTermLabel(access.purchaseOption)}
                </p>
              </div>
              <button
                type="button"
                onClick={openBuyLocations}
                disabled={!access.purchaseOption.checkoutEnabled || !access.purchaseOption.addonId}
                className="px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md disabled:bg-surface-container-high disabled:text-text-secondary disabled:cursor-not-allowed"
              >
                {access.purchaseOption.checkoutEnabled && access.purchaseOption.addonId
                  ? 'Buy More Location'
                  : 'Checkout unavailable'}
              </button>

              {showBuyForm && access.purchaseOption.checkoutEnabled && access.purchaseOption.addonId && (
                <div className="w-full lg:max-w-md rounded-xl border border-border-subtle bg-surface-canvas p-space-sm flex flex-col gap-space-xs">
                  <label className="font-label-sm text-label-sm text-text-primary" htmlFor="desktop-buy-locations-count">
                    Number of locations
                  </label>
                  <input
                    id="desktop-buy-locations-count"
                    type="number"
                    min={locationsPerPurchase}
                    step={locationsPerPurchase}
                    value={purchaseLocations}
                    onChange={(event) => setPurchaseLocations(Number(event.target.value))}
                    className="h-10 w-full rounded-lg bg-surface-subtle border border-border-subtle px-space-sm text-body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex items-center justify-between font-label-md text-label-md text-text-primary">
                    <span>Total</span>
                    <strong>{formatLocationMoney(locationPurchaseTotal(access.purchaseOption, purchaseLocations), access.purchaseOption.currency)}</strong>
                  </div>
                  {purchaseError && (
                    <p className="font-caption text-caption text-on-error-container bg-error-container rounded-lg px-space-xs py-1.5">
                      {purchaseError}
                    </p>
                  )}
                  {purchaseNotice && (
                    <p className="font-caption text-caption text-on-primary-container bg-primary-container rounded-lg px-space-xs py-1.5">
                      {purchaseNotice}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={submitLocationPurchase}
                    disabled={locationCheckout.isPending}
                    className="h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50"
                  >
                    {locationCheckout.isPending ? 'Opening checkout…' : 'Continue to Payment'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {initialBuyLocations && access && !access.purchaseOption.available && (
        <div className="rounded-xl border border-border-subtle bg-surface-canvas p-space-md mb-space-lg flex flex-col gap-space-xs">
          <p className="font-label-md text-label-md text-text-primary font-semibold">
            Location purchases are not configured
          </p>
          <p className="font-caption text-caption text-text-secondary">
            Your backend has no active location add-on. Upgrade your plan to include more locations.
          </p>
          <button
            type="button"
            onClick={onUpgradePlan}
            className="self-start h-10 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Workspace focus bar */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm mb-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed">
            <Icon name="storefront" className="text-[26px]" />
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-caption text-caption text-badge-discount-text font-semibold uppercase tracking-wider bg-badge-discount-bg px-space-2xs py-0.5 rounded">
                Active Workspace Focus
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-secondary">{v(activeBranch.area || '—', 'Abuja Capital Metro')}</span>
            </div>
            <p className="font-heading-sm text-heading-sm text-on-surface mt-0.5">
              {v(activeBranch.name, 'Wuse Branch #01 — Flagship (Abuja, FCT)')}
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <Icon name="swap_horiz" className="text-[18px] text-primary" />
            <span>Switch Operating View</span>
            <Icon name="expand_more" className={`text-[18px] text-text-secondary transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>
          {switcherOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-surface-canvas border border-border-subtle shadow-xl p-2 z-50 flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary px-2 py-1 font-semibold">Select Operating Branch</span>
              {(allBranches ?? []).filter((b) => !live || !isRestricted(b.key || b.id || '')).map((b) => (
                <button
                  key={b.key || b.id}
                  type="button"
                  onClick={() => {
                    switchTo(b.key || b.id || '');
                    setSwitcherOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-label-md text-label-md flex items-center justify-between transition-colors ${
                    (b.key || b.id) === (activeBranch.key || activeBranch.id)
                      ? 'bg-surface-tint-blue text-primary font-bold'
                      : 'hover:bg-surface-container text-text-primary'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {(b.key || b.id) === (activeBranch.key || activeBranch.id) && (
                    <Icon name="check" className="text-[16px] text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            title="Branch Network Map Configuration"
            className="p-space-xs rounded-lg hover:bg-surface-container text-text-secondary hover:text-on-surface transition-colors"
          >
            <Icon name="tune" className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-2xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Active Locations</span>
            <span className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="domain" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">{v(`${activeCount} Live`, '2 Live')}</span>
              <span className="font-caption text-caption text-text-tertiary">{v(`/ ${liveList.length} total`, '/ 3 total')}</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error inline-block" />
              {v(`${liveList.length - activeCount} Paused`, '1 Outlet Paused / Under Renovation')}
            </p>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: v(liveList.length ? `${(activeCount / liveList.length) * 100}%` : '0%', '66.6%') }} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Regional Clusters</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <Icon name="hub" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">
                {v(`${states.length} ${states.length === 1 ? 'Zone' : 'Zones'}`, '2 Zones')}
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">
              {v(
                states.map((state) => `${state} (${liveList.filter((branch) => (branch.state || branch.city) === state).length})`).join(' • ') || '—',
                'Abuja FCT (2) • Lagos Island (1)',
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-space-md">
            {(live ? states : ['FCT Zone A', 'Lagos SW']).map((zone) => (
              <span key={zone} className="px-space-xs py-0.5 rounded text-[11px] font-medium bg-surface-container text-secondary">
                {zone}
              </span>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Total Network SKUs</span>
            <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <Icon name="inventory_2" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">{v(`${skuTotal} SKUs`, '70 SKUs')}</span>
              <span className="font-caption text-caption text-badge-discount-text font-medium">Synced</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">Decentralized Stock Distribution</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-tertiary mt-space-md">
            {live ? (
              liveList.map((branch) => (
                <span key={branch.id}>
                  {n((counts[branch.id]?.products ?? 0) + (counts[branch.id]?.services ?? 0))} {branch.name}
                </span>
              ))
            ) : (
              <>
                <span>42 Wuse</span>
                <span>36 VI</span>
                <span>0 Garki</span>
              </>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Footfall Velocity</span>
            <span className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
              <Icon name="trending_up" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-2xs">
              <span className="font-heading-lg text-heading-lg text-on-surface font-bold">
                {v(locations.data ? locations.data.totals.visits.toLocaleString('en-US') : '—', '8,420')}
              </span>
              <span className="font-caption text-caption text-badge-discount-text font-semibold">{v('Last 30 days', '+14% MoM')}</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-1">
              Monthly consumer walk-ins verified
            </p>
          </div>
          <div className="w-full mt-space-md">
            <svg className="w-full h-4 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path
                d="M0 16 Q 25 18, 40 10 T 70 8 T 100 2"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-sm">
          <h2 className="font-heading-sm text-heading-sm text-on-surface">Store Locations & Geofences</h2>
          <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm">
            {v(`${liveList.length} Registered`, '3 Registered')}
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"
          >
            <Icon name="grid_view" className="text-[16px]" />
            <span>Detailed View</span>
          </button>
          <button
            type="button"
            className="px-space-sm py-1.5 rounded-lg bg-transparent text-text-secondary hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <Icon name="map" className="text-[16px]" />
            <span>Unified Map</span>
          </button>
        </div>
      </div>

      {/* Branch cards */}
      <div className="flex flex-col gap-space-lg mb-space-2xl">
        {cards.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex flex-col xl:flex-row items-start justify-between gap-space-lg">
              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                  <span className={`font-label-sm text-label-sm font-bold tracking-wide ${branch.indexClass}`}>
                    {branch.index}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span
                    className={`px-space-xs py-0.5 rounded font-caption text-caption font-semibold ${branch.tag1Class}`}
                  >
                    {branch.tag1}
                  </span>
                  <span
                    className={`px-space-xs py-0.5 rounded font-caption text-caption font-semibold ${branch.tag2Class}`}
                  >
                    {branch.tag2}
                  </span>
                  {(() => {
                    const eff = getEffectiveBranchOfferings(branch.id);
                    return (
                      <>
                        {eff.includes('products') && (
                          <span className="px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                            Products
                          </span>
                        )}
                        {eff.includes('services') && (
                          <span className="px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                            Services
                          </span>
                        )}
                      </>
                    );
                  })()}
                  <span className="ml-auto inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    {branch.openLabel}
                  </span>
                </div>
                {branch.restrictionReason && (
                  <div className="rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm px-space-sm py-space-xs mt-space-xs">
                    {branch.restrictionReason}
                  </div>
                )}
                <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{branch.name}</h3>
                <div className="flex items-center gap-space-2xs text-text-secondary font-body-md text-body-md mt-space-2xs">
                  <Icon name="location_on" className="text-[18px] text-text-tertiary" />
                  <span className="truncate">{branch.address}</span>
                </div>
                <div className="flex flex-wrap items-center gap-space-md mt-space-sm py-space-xs px-space-sm bg-surface-container-low rounded-lg text-text-secondary font-label-sm text-label-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon name="person" className="text-[16px] text-primary" />
                    <span>
                      Manager: <strong className="text-on-surface">{branch.manager}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="call" className="text-[16px] text-text-tertiary" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-primary font-medium">
                    <Icon name="radar" className="text-[16px]" />
                    <span>{branch.geofence}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mt-space-md pt-space-md bg-surface-subtle p-space-sm rounded-xl">
                  {branch.metrics.map((metric) => (
                    <div key={metric.label}>
                      <p className="font-caption text-caption text-text-secondary">{metric.label}</p>
                      <p
                        className={`font-heading-sm text-heading-sm font-bold mt-0.5 ${metric.valueClass}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-space-xs mt-space-lg">
                  <button
                    type="button"
                    onClick={() => onOpenBranch?.(live ? branch.id : undefined)}
                    disabled={Boolean(live && branch.restricted)}
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="edit_location" className="text-[18px]" />
                    <span>Edit Location</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (live && branch.id) switchTo(branch.id);
                      onNav('pos-register');
                    }}
                    disabled={Boolean(live && branch.restricted)}
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="point_of_sale" className="text-[18px]" />
                    <span>{branch.registerLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenBranch?.(live ? branch.id : undefined)}
                    disabled={Boolean(live && branch.restricted)}
                    className="px-space-md py-space-xs rounded-xl bg-surface-tint-blue hover:bg-primary-fixed text-primary font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="settings_input_antenna" className="text-[18px]" />
                    <span>Manage Geofence</span>
                  </button>
                </div>
              </div>
              <div className="w-full xl:w-80 shrink-0 flex flex-col gap-space-xs">
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner group">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    data-location={branch.mapLocation}
                    style={{ backgroundImage: `url('${branch.mapImage}')` }}
                  />
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none flex items-center justify-center">
                    <div
                      className={`${branch.beaconSize} rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/40 animate-pulse`}
                    >
                      <span className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded text-on-surface font-caption text-caption font-semibold flex items-center gap-1">
                    <Icon name="gps_fixed" className="text-primary text-[14px]" />
                    <span>{branch.mapBadge}</span>
                  </div>
                </div>
                <p className="font-caption text-caption text-text-tertiary text-center">{branch.mapCaption}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Garki — paused branch */}
        {!live && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden opacity-90">
          <div className="flex flex-col xl:flex-row items-start justify-between gap-space-lg">
            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
                <span className="font-label-sm text-label-sm font-bold text-text-tertiary tracking-wide">BRANCH #03</span>
                <span className="text-text-tertiary">•</span>
                <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption font-semibold">
                  Under Renovation
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container text-text-secondary font-caption text-caption font-semibold">
                  Garki Cluster
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-caption font-medium">
                  <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                  Paused From Discovery Feeds
                </span>
              </div>
              <h3 className="font-heading-md text-heading-md text-on-surface font-bold">Garki Branch</h3>
              <div className="flex items-center gap-space-2xs text-text-secondary font-body-md text-body-md mt-space-2xs">
                <Icon name="location_on" className="text-[18px] text-text-tertiary" />
                <span className="truncate">Shop 14 Area 11 Shopping Arcade, Garki II, Abuja</span>
              </div>
              <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                    <Icon name="construction" className="text-[20px]" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Scheduled Facility Refurbishment & Fiber Link Setup
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      Expected consumer reopening: <strong className="text-on-surface">Q2 2025</strong>. Inventory and
                      beacons are held offline.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                  >
                    Reactivate Location
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-space-xs rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
                  >
                    View Setup Tasks
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-80 shrink-0 flex flex-col gap-space-xs">
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-container-high flex flex-col items-center justify-center p-space-md text-center">
                <Icon name="domain_disabled" className="text-[32px] text-text-tertiary mb-1" />
                <p className="font-label-sm text-label-sm font-semibold text-text-secondary">
                  Area 11 Arcade Geofence Paused
                </p>
                <p className="font-caption text-caption text-text-tertiary mt-0.5">
                  Zero customer broadcast traffic active
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Locations added from the dashboard (paid ₦2,000 each) */}
        {addedLocations.map((location, index) => (
          <div
            key={location.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-space-xs mb-space-xs">
              <span className="font-label-sm text-label-sm font-bold text-primary tracking-wide">
                BRANCH #{String(3 + index + 1).padStart(2, '0')}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                Active
              </span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-text-secondary font-caption text-caption font-semibold">
                {location.district}
              </span>
              {(() => {
                const eff = getEffectiveBranchOfferings(location.id || location.name);
                return (
                  <>
                    {eff.includes('products') && (
                      <span className="px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        Products
                      </span>
                    )}
                    {eff.includes('services') && (
                      <span className="px-space-xs py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        Services
                      </span>
                    )}
                  </>
                );
              })()}
              <span className="ml-auto inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                Open Now
              </span>
            </div>
            <h3 className="font-heading-md text-heading-md text-on-surface font-bold">{location.name}</h3>
            <div className="flex items-center gap-space-2xs text-text-secondary font-body-md text-body-md mt-space-2xs">
              <Icon name="location_on" className="text-[18px] text-text-tertiary" />
              <span className="truncate">{location.address}</span>
            </div>
            <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm">
              <span className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
                <Icon name="payments" className="text-[16px] text-primary" />
                {location.feePaid > 0
                  ? `${formatLocationMoney(location.feePaid, 'NGN')} one-time location fee paid`
                  : 'Included with your plan'}
              </span>
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => onOpenBranch?.(location.id)}
                  className="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="edit_location" className="text-[18px]" />
                  <span>Edit Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenBranch?.(location.id)}
                  className="px-space-md py-space-xs rounded-xl bg-surface-tint-blue hover:bg-primary-fixed text-primary font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="settings_input_antenna" className="text-[18px]" />
                  <span>Manage Geofence</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture card */}
      <div className="rounded-xl bg-surface-container-low p-space-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md max-w-4xl">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <Icon name="sync_alt" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-heading-sm text-heading-sm text-on-surface">
                Centralized Multi-Branch Operating Architecture
              </h4>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                VEMTAP synchronizes real-time terminal transactions, customer walk-in redemptions, and localized stock
                reservations across all nationwide branches. Product alterations made in catalog automatically trigger
                localized safety stock levels per outlet.
              </p>
              <div className="flex flex-wrap items-center gap-space-md mt-space-sm text-text-secondary font-caption text-caption">
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Sub-second POS Heartbeat
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Decentralized Tax Invoicing (FIRS & LIRS)
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
                  Isolated Cashier Drawer Permissions
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-space-xs shrink-0">
            <button
              type="button"
              className="w-full sm:w-auto px-space-md py-space-xs rounded-xl bg-surface-canvas hover:bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-colors text-center"
            >
              Network Logs
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-colors text-center"
            >
              Global Sync Settings
            </button>
          </div>
        </div>
      </div>

      {/* Same entitlement gate as mobile: no silent disabled button. */}
      {showLocationLimitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-on-surface/50 backdrop-blur-xs"
          onClick={() => setShowLocationLimitModal(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-canvas p-space-lg shadow-2xl border border-border-subtle flex flex-col gap-space-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-location-limit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="add_location_alt" className="text-[20px]" />
                </div>
                <h3 id="desktop-location-limit-title" className="font-heading-sm text-heading-sm text-text-primary font-bold">
                  More locations needed
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowLocationLimitModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface-container"
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
                className="h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-2xs"
              >
                <Icon name="arrow_upward" className="text-[17px]" />
                <span>Upgrade</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLocationLimitModal(false);
                  openBuyLocations();
                }}
                className="h-11 rounded-xl bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center justify-center gap-space-2xs"
              >
                <Icon name="shopping_cart" className="text-[17px]" />
                <span>Buy More Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MerchantShell>
  );
}
