import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { downloadCsv } from '../../utils/exportCsv';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { catalogueItemsService } from '../../services/catalogueItemsService';
import { useCatalogueItems, catalogueItemKeys } from '../../hooks/business/useCatalogueItems';
import { useBranches } from '../../hooks/business/useBranchesAndTeam';
import { posService } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { branchAddressLabel } from '../branchLive';

interface DesktopBusinessBranchPricingScreenProps {
  /** Live: the catalogue item whose branch prices are edited (defaults to the first product). */
  itemId?: string | null;
  onNav: (key: BusinessPortalNavKey) => void;
  onBackToCatalog?: () => void;
}

const PRODUCT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPpLKVWmNjSvvNLAS2i3mYOgP5IXFON9Zic9i2UAqQjcR0ekc_sMlEJMX6bQUSTdZrnIwme_kRWcMprUuJ7JQeCIDrNVS0gsNX7GCm72ilSk1VkE1MvyWvFv11IaatRHCUKl3eK74xIDBahHOzRx5K6wjTCkI568bszfe-wbWAMLnsfFwKg-ONP6y-Yk3pwEY2Ss1Pg7UL-WCbeiVIcA5CTiLiOqqq9dVDm79rl3irEueRAgDSdz-j-g';

const PRODUCT_ALT =
  'Plated juicy woodfire grilled lamb chops with rosemary herb garnish and roasted garlic cloves served on a rustic dark slate plate with warm ambient restaurant spotlighting';

const TERMINALS: Array<{ icon: string; name: string }> = [
  { icon: 'desktop_windows', name: 'Wuse Counter 01 (Abuja)' },
  { icon: 'tablet_mac', name: 'Wuse Terrace Tab 02' },
  { icon: 'desktop_windows', name: 'VI Main Bar POS 01 (Lagos)' },
  { icon: 'phone_iphone', name: 'VI Handheld Server 03' },
];

// Mirrors the three branch pricing cards below — backs the "Export CSV" button.
const BRANCH_PRICING: Array<{ branch: string; address: string; price: string; note: string }> = [
  {
    branch: 'Wuse Branch (Flagship Outlet)',
    address: 'Aminu Kano Crescent, Wuse II, Central Area, Abuja, FCT',
    price: '₦14,500',
    note: 'Standard Base',
  },
  {
    branch: 'Victoria Island Branch (Coastal Cluster)',
    address: 'Ahmadu Bello Way, Victoria Island, Lagos State',
    price: '₦16,500',
    note: '+₦2,000 Uplift (Coastal Margin)',
  },
  {
    branch: 'Garki Express Hub (Delisted)',
    address: 'Festival Road, Area 11, Garki, Abuja, FCT',
    price: '—',
    note: 'Item delisted from Garki terminals until facility reactivation',
  },
];

const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

const money = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;

/** One branch row of the live matrix. */
interface LiveRow {
  branchId: string;
  name: string;
  address: string;
  isMain: boolean;
  available: boolean;
  price: string;
  stock: string;
  hasOverride: boolean;
}

export function DesktopBusinessBranchPricingScreen({ itemId, onNav, onBackToCatalog }: DesktopBusinessBranchPricingScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [pricingMode, setPricingMode] = useState<'standard' | 'custom'>('custom');
  const [branchToggles, setBranchToggles] = useState<Record<string, boolean>>({
    wuse: true,
    vi: true,
    garki: false,
  });
  const [dirty, setDirty] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  // Live: the item's real per-branch availability, price and stock; demo keeps the samples.
  const live = hasApiConfig();
  const products = useCatalogueItems('product');
  const item = (products.data ?? []).find((entry) => entry.id === itemId) ?? (itemId ? undefined : products.data?.[0]);
  const id = item?.id ?? itemId ?? '';
  const queryClient = useQueryClient();
  const pricingQuery = useQuery({
    queryKey: ['catalogue-items', 'branch-pricing', id],
    queryFn: () => catalogueItemsService.branchPricing(id),
    enabled: live && Boolean(id),
  });
  const branchesQuery = useBranches();
  const tillsQuery = useQuery({ queryKey: ['pos', 'tills', 'all'], queryFn: () => posService.tills(null), enabled: live });
  const savePricing = useMutation({
    mutationFn: (input: Parameters<typeof catalogueItemsService.setBranchPricing>[1]) => catalogueItemsService.setBranchPricing(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all }),
  });
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const base = Number(pricingQuery.data?.basePrice ?? item?.price ?? 0);
  useEffect(() => {
    const pricing = pricingQuery.data;
    if (!live || !pricing) return;
    const addressOf = new Map((branchesQuery.data ?? []).map((branch) => [branch.id, branchAddressLabel(branch)]));
    setRows(
      pricing.branches.map((row) => ({
        branchId: row.branchId,
        name: row.branchName,
        address: addressOf.get(row.branchId) ?? '—',
        isMain: row.isMainBranch,
        available: row.isAvailable,
        price: String(Math.round(Number(row.price))),
        stock: row.stockQuantity != null ? String(row.stockQuantity) : '',
        hasOverride: row.hasOverride === true,
      })),
    );
    setPricingMode(pricing.pricingMode === 'per_branch' ? 'custom' : 'standard');
    setDirty(false);
  }, [live, pricingQuery.data, branchesQuery.data]);
  const updateRow = (branchId: string, patch: Partial<LiveRow>) => {
    setRows((current) => current.map((row) => (row.branchId === branchId ? { ...row, ...patch } : row)));
    setDirty(true);
  };
  const activeRows = rows.filter((row) => (scope === 'all' ? true : row.available));
  const totalStock = activeRows.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);
  const tills = tillsQuery.data ?? [];
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);

  const toggleBranch = (id: string) => {
    setBranchToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  };

  const handleCancel = () => {
    if (live) {
      void pricingQuery.refetch();
      setEditing(null);
      setDirty(false);
      return;
    }
    setBranchToggles({ wuse: true, vi: true, garki: false });
    setScope('selected');
    setPricingMode('custom');
    setDirty(false);
  };

  const handleSave = () => {
    if (live) {
      savePricing.mutate(
        {
          pricingMode: pricingMode === 'custom' ? 'per_branch' : 'uniform',
          branches: rows.map((row) => ({
            branchId: row.branchId,
            isAvailable: scope === 'all' ? true : row.available,
            price: pricingMode === 'custom' && Number(row.price) ? Number(row.price) : null,
            stockQuantity: row.stock === '' ? null : Number(row.stock),
          })),
        },
        {
          onSuccess: () => {
            setDirty(false);
            setEditing(null);
            setToast('Branch availability and prices saved.');
            window.setTimeout(() => setToast(null), 2500);
          },
          onError: (error) => {
            setToast(apiErrorMessage(error, 'Could not save the branch pricing.'));
            window.setTimeout(() => setToast(null), 3500);
          },
        },
      );
      return;
    }
    setDirty(false);
    setToast('Location assignment saved & pushed to POS cluster.');
    window.setTimeout(() => setToast(null), 2500);
  };

  const goBack = () => onBackToCatalog?.();

  return (
    <MerchantShell activeNav="business-catalog" onNav={onNav}>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-space-xs text-text-secondary font-label-sm text-label-sm mb-space-md flex-wrap"
      >
        <button type="button" onClick={goBack} className="hover:text-primary transition-colors">
          Business Hub
        </button>
        <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
        <button type="button" onClick={goBack} className="hover:text-primary transition-colors">
          Catalog
        </button>
        <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
        <button type="button" onClick={goBack} className="hover:text-primary transition-colors">
          Products
        </button>
        <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
        <button type="button" onClick={goBack} className="hover:text-primary transition-colors">
          {v(item?.name ?? 'Item', 'Woodfire Grilled Lamb Chops')}
        </button>
        <Icon name="chevron_right" className="text-[16px] text-text-tertiary" />
        <span className="text-on-surface font-semibold">Location Availability &amp; Pricing</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-xl">
        <div>
          <div className="flex items-center gap-space-xs mb-space-2xs">
            <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-caption text-caption font-semibold uppercase tracking-wider">
              {v(`SKU #${item?.sku ?? '—'}`, 'SKU #VG-LAMB-02')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            <span className="font-caption text-caption text-badge-discount-text font-medium">{v('Live in POS', 'Synced with POS Cluster')}</span>
          </div>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Branch Availability &amp; Location Pricing Matrix
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs max-w-3xl">
            Specify which store branches stock {v(`${item?.name ?? 'this item'} (${money(base)} MSRP)`, 'Woodfire Grilled Lamb Chops (₦14,500 MSRP)')} and
            configure location-specific price overrides.
          </p>
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <button
            type="button"
            className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-button-secondary text-button-secondary flex items-center gap-space-2xs"
          >
            <Icon name="history" className="text-[18px]" />
            <span>Revision Log</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadCsv(
                'vemtap_branch_pricing',
                ['Branch', 'Address', 'Selling Price', 'Note'],
                live
                  ? rows.map((row) => [row.name, row.address, row.available ? money(Number(row.price) || base) : '—', row.hasOverride ? 'Branch override' : 'Standard base'])
                  : BRANCH_PRICING.map((row) => [row.branch, row.address, row.price, row.note]),
              );
            }}
            className="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-button-secondary text-button-secondary flex items-center gap-space-2xs"
          >
            <Icon name="file_download" className="text-[18px]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm mb-space-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-surface-tint-blue rounded-full pointer-events-none opacity-50" />
        <div className="flex items-center gap-space-md min-w-0">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm bg-surface-container">
            <img alt={v(item?.name ?? 'Item', PRODUCT_ALT)} className="w-full h-full object-cover" src={v(item?.mainImage || LIVE_IMAGE_PLACEHOLDER, PRODUCT_IMAGE)} />
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-on-background/80 text-surface font-caption text-[10px] font-bold">
              HQ
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="px-space-xs py-space-2xs rounded bg-surface-container text-secondary font-label-sm text-label-sm font-medium">
                {v(item?.category?.name ?? 'Uncategorised', 'Steaks & Grills')}
              </span>
              <span className="font-caption text-caption text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-secondary">{v('Product', 'Signature Main Dish')}</span>
            </div>
            <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold truncate mt-space-2xs">
              {v(`${item?.name ?? 'Item'}${item?.sku ? ` (${item.sku})` : ''}`, 'Woodfire Grilled Lamb Chops (VG-LAMB-02)')}
            </h2>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              {v(item?.shortDescription || item?.description || '—', 'Pre-marinated herb rub • Minimum 200g serving per portion')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xl w-full md:w-auto justify-between md:justify-end shrink-0 pt-space-xs md:pt-0 border-t md:border-t-0 border-surface-container">
          <div className="text-left md:text-right">
            <p className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
              HQ Standard MSRP
            </p>
            <p className="font-heading-md text-heading-md font-bold text-on-surface">{v(money(base), '₦14,500')}</p>
          </div>
          <div className="w-px h-10 bg-surface-container hidden md:block" />
          <div className="text-left md:text-right">
            <p className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
              Total Network Stock
            </p>
            <div className="flex items-center md:justify-end gap-space-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
              <p className="font-heading-md text-heading-md font-bold text-primary">{v(`${totalStock} Units`, '35 Units')}</p>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              {v(`Across ${activeRows.length} Active ${activeRows.length === 1 ? 'Branch' : 'Branches'}`, 'Across 2 Active Branches')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
          <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-bold font-label-md text-label-md">
                  1
                </span>
                <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                  Distribution Scope Configuration
                </h3>
              </div>
              <span className="font-caption text-caption text-text-secondary">Scope: Granular Override</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <label
                className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all ${
                  scope === 'selected' ? 'bg-surface-tint-blue shadow-sm hover:shadow-md' : 'bg-surface-subtle hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-xs">
                    <input
                      checked={scope === 'selected'}
                      className="w-4 h-4 text-primary accent-primary cursor-pointer"
                      name="distribution-scope"
                      type="radio"
                      value="selected"
                      onChange={() => setScope('selected')}
                    />
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        scope === 'selected' ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      Selected Locations Only
                    </span>
                  </div>
                  {scope === 'selected' ? (
                    <span className="px-space-xs py-space-2xs rounded-full bg-primary text-on-primary font-caption text-[11px] font-semibold">
                      Active Mode
                    </span>
                  ) : null}
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-space-sm pl-6 leading-relaxed">
                  Specify which branches stock this item and customize branch-level prices based on local operational
                  constraints.
                </p>
                <div
                  className={`mt-space-md pl-6 flex items-center gap-space-2xs font-label-sm text-label-sm ${
                    scope === 'selected' ? 'text-primary font-semibold' : 'text-text-tertiary'
                  }`}
                >
                  <Icon name="tune" className="text-[16px]" />
                  <span>{v(`${rows.filter((row) => row.available).length} of ${rows.length} branches currently allocated`, '2 of 3 branches currently allocated')}</span>
                </div>
              </label>
              <label
                className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all ${
                  scope === 'all' ? 'bg-surface-tint-blue shadow-sm hover:shadow-md' : 'bg-surface-subtle hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-xs">
                    <input
                      checked={scope === 'all'}
                      className="w-4 h-4 text-primary accent-primary cursor-pointer"
                      name="distribution-scope"
                      type="radio"
                      value="all"
                      onChange={() => setScope('all')}
                    />
                    <span
                      className={`font-label-md text-label-md font-bold ${
                        scope === 'all' ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      All Locations (Current &amp; Future)
                    </span>
                  </div>
                  {scope === 'all' ? (
                    <span className="px-space-xs py-space-2xs rounded-full bg-primary text-on-primary font-caption text-[11px] font-semibold">
                      Active Mode
                    </span>
                  ) : null}
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-space-sm pl-6 leading-relaxed">
                  Universal stock availability. Automatically registers item onto menus at all current stores and
                  upcoming additions.
                </p>
                <div
                  className={`mt-space-md pl-6 flex items-center gap-space-2xs font-label-sm text-label-sm ${
                    scope === 'all' ? 'text-primary font-semibold' : 'text-text-tertiary'
                  }`}
                >
                  <Icon name="public" className="text-[16px]" />
                  <span>Enforces global default catalog</span>
                </div>
              </label>
            </div>
          </section>

          <section className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-bold font-label-md text-label-md">
                  2
                </span>
                <div>
                  <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Pricing Strategy Mode</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Determine baseline calculation across regional clusters
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPricingMode('standard')}
                  className={`px-space-sm py-space-2xs rounded-lg font-label-md text-label-md transition-colors ${
                    pricingMode === 'standard'
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  Standard Base ({v(money(base), '₦14,500')})
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('custom')}
                  className={`px-space-sm py-space-2xs rounded-lg font-label-md text-label-md transition-colors ${
                    pricingMode === 'custom'
                      ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  Custom Branch Dynamic (Active)
                </button>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-tint-blue text-on-surface">
              <Icon name="info" className="text-primary text-[22px] shrink-0" />
              <div className="text-body-md font-body-md">
                {pricingMode === 'custom' ? (
                  <>
                    <p className="text-on-surface font-medium">Branch Dynamic Pricing Strategy is active</p>
                    <p className="text-text-secondary mt-0.5">
                      Customize branch prices to reflect varying logistics, dining formats, cold-chain overheads, or
                      regional market margins without altering the HQ catalog base.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-on-surface font-medium">Standard Base pricing strategy is active</p>
                    <p className="text-text-secondary mt-0.5">
                      Every stocked branch sells at the HQ standard base of {v(money(base), '₦14,500')}. Switch to Custom
                      Branch Dynamic to apply location-specific overrides.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-7 h-7 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-bold font-label-md text-label-md">
                  3
                </span>
                <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                  Granular Branch Breakdown &amp; Overrides
                </h3>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                {v(`${rows.length} Registered Store ${rows.length === 1 ? 'Outlet' : 'Outlets'}`, '3 Registered Store Outlets')}
              </span>
            </div>

            {live &&
              rows.map((row) => {
                const on = scope === 'all' ? true : row.available;
                const price = pricingMode === 'custom' ? Number(row.price) || base : base;
                const diff = price - base;
                return (
                  <div key={row.branchId} className={`bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative ${on ? '' : 'opacity-75'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                          <Icon name={on ? 'storefront' : 'domain_disabled'} className="text-[26px]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <h4 className="font-heading-sm text-heading-sm font-bold text-on-surface">{row.name}</h4>
                            {row.isMain && (
                              <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-caption text-caption font-semibold">
                                Main Branch
                              </span>
                            )}
                          </div>
                          <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1">
                            <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                            {row.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0 bg-surface-subtle p-space-2xs px-space-sm rounded-xl">
                        <span className={`font-label-sm text-label-sm font-semibold ${on ? 'text-badge-discount-text' : 'text-text-tertiary'}`}>
                          {on ? 'Branch Active' : 'Not Stocked'}
                        </span>
                        <button
                          aria-label={`Toggle ${row.name}`}
                          onClick={() => updateRow(row.branchId, { available: !row.available })}
                          type="button"
                          className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none p-0.5 ${on ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
                        >
                          <span className={`block w-5 h-5 rounded-full bg-surface-canvas shadow-sm transform transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                    {on && (
                      <div className="mt-space-lg pt-space-md grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-subtle p-space-md rounded-xl">
                        <div className="flex flex-col justify-center">
                          <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                            {diff ? 'Selling Price (Override)' : 'Selling Price'}
                          </span>
                          <div className="flex items-center gap-space-xs mt-1">
                            {editing === row.branchId ? (
                              <input
                                autoFocus
                                inputMode="numeric"
                                className="w-28 bg-transparent font-heading-md text-heading-md font-bold text-on-surface outline-none border-b border-primary"
                                value={row.price}
                                onChange={(event) => updateRow(row.branchId, { price: event.target.value.replace(/[^\d]/g, '') })}
                                onBlur={() => setEditing(null)}
                                onKeyDown={(event) => event.key === 'Enter' && setEditing(null)}
                              />
                            ) : (
                              <span className={`font-heading-md text-heading-md font-bold ${diff ? 'text-primary' : 'text-on-surface'}`}>{money(price)}</span>
                            )}
                            {!diff && (
                              <span className="px-space-xs py-space-2xs rounded bg-surface-container text-text-secondary font-caption text-caption">Standard Base</span>
                            )}
                            <button
                              className="p-1 text-text-secondary hover:text-primary transition-colors"
                              title="Edit Selling Price"
                              type="button"
                              onClick={() => {
                                setPricingMode('custom');
                                setEditing(row.branchId);
                              }}
                            >
                              <Icon name="edit" className="text-[18px]" />
                            </button>
                          </div>
                          {diff !== 0 && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                                <Icon name={diff > 0 ? 'trending_up' : 'trending_down'} className="text-[12px]" />
                                {diff > 0 ? '+' : '-'}
                                {money(Math.abs(diff))} vs base
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">Branch Stock</span>
                          <div className="flex items-center gap-space-xs mt-1">
                            <span className="font-heading-md text-heading-md font-bold text-primary">{row.stock === '' ? '—' : `${row.stock} Units`}</span>
                          </div>
                          <p className="font-caption text-caption text-text-tertiary mt-0.5">
                            {item?.minStock != null ? `Threshold alert at ${item.minStock} units` : 'No low-stock threshold'}
                          </p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">Prep Lead &amp; Dining</span>
                          <div className="flex items-center gap-space-xs mt-1">
                            <Icon name="timer" className="text-[18px] text-text-secondary" />
                            <span className="font-label-md text-label-md font-semibold text-on-surface">—</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            {!live && (
              <>
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <Icon name="storefront" className="text-[26px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h4 className="font-heading-sm text-heading-sm font-bold text-on-surface">Wuse Branch</h4>
                      <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-caption text-caption font-semibold">
                        Flagship Outlet
                      </span>
                      <span className="px-space-xs py-space-2xs rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                        Fine Dining
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                      Aminu Kano Crescent, Wuse II, Central Area, Abuja, FCT
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0 bg-surface-subtle p-space-2xs px-space-sm rounded-xl">
                  <span className="font-label-sm text-label-sm font-semibold text-badge-discount-text">Branch Active</span>
                  <button
                    aria-label="Toggle Wuse Branch Status"
                    onClick={() => toggleBranch('wuse')}
                    type="button"
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none p-0.5 ${
                      branchToggles.wuse ? 'bg-primary-container' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-surface-canvas shadow-sm transform transition-transform ${
                        branchToggles.wuse ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-subtle p-space-md rounded-xl">
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Selling Price
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <span className="font-heading-md text-heading-md font-bold text-on-surface">₦14,500</span>
                    <span className="px-space-xs py-space-2xs rounded bg-surface-container text-text-secondary font-caption text-caption">
                      Standard Base
                    </span>
                    <button
                      className="p-1 text-text-secondary hover:text-primary transition-colors"
                      title="Edit Selling Price"
                      type="button"
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Shift Stock Quota
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <span className="font-heading-md text-heading-md font-bold text-primary">20 Units</span>
                    <span className="font-caption text-caption text-text-secondary">in Cold Room A</span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-0.5">Threshold alert at 4 units</p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Prep Lead &amp; Dining
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <Icon name="timer" className="text-[18px] text-text-secondary" />
                    <span className="font-label-md text-label-md font-semibold text-on-surface">15–20 mins prep</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Dine-in, Takeaway &amp; Express Delivery
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <Icon name="apartment" className="text-[26px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h4 className="font-heading-sm text-heading-sm font-bold text-on-surface">
                        Victoria Island Branch
                      </h4>
                      <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                        Coastal Cluster
                      </span>
                      <span className="px-space-xs py-space-2xs rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-medium">
                        Express Kitchen
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                      Ahmadu Bello Way, Victoria Island, Lagos State
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0 bg-surface-subtle p-space-2xs px-space-sm rounded-xl">
                  <span className="font-label-sm text-label-sm font-semibold text-badge-discount-text">Branch Active</span>
                  <button
                    aria-label="Toggle VI Branch Status"
                    onClick={() => toggleBranch('vi')}
                    type="button"
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none p-0.5 ${
                      branchToggles.vi ? 'bg-primary-container' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-surface-canvas shadow-sm transform transition-transform ${
                        branchToggles.vi ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-subtle p-space-md rounded-xl">
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Selling Price (Override)
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <span className="font-heading-md text-heading-md font-bold text-primary">₦16,500</span>
                    <button
                      className="p-1 text-text-secondary hover:text-primary transition-colors"
                      title="Edit Selling Price"
                      type="button"
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                      <Icon name="trending_up" className="text-[12px]" />+₦2,000 Uplift (Coastal Margin)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Shift Stock Quota
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <span className="font-heading-md text-heading-md font-bold text-primary">15 Units</span>
                    <span className="font-caption text-caption text-text-secondary">Walk-in chiller</span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-0.5">
                    Automated re-stock via Lagos Hub
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-caption text-caption uppercase text-text-tertiary font-semibold tracking-wider">
                    Fulfillment Modes
                  </span>
                  <div className="flex items-center gap-space-xs mt-1">
                    <Icon name="check_circle" className="text-[18px] text-badge-discount-text" />
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Dine-in &amp; Delivery
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Average dispatch time: 24 mins
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm opacity-75 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-text-tertiary shrink-0">
                    <Icon name="domain_disabled" className="text-[26px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <h4 className="font-heading-sm text-heading-sm font-bold text-text-secondary">Garki Express Hub</h4>
                      <span className="px-space-xs py-space-2xs rounded bg-surface-container text-text-tertiary font-caption text-caption font-semibold">
                        Area 11, Garki
                      </span>
                      <span className="px-space-xs py-space-2xs rounded bg-error-container text-on-error-container font-caption text-caption font-medium">
                        Under Renovation
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-tertiary mt-1 flex items-center gap-1">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                      Festival Road, Area 11, Garki, Abuja, FCT
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0 bg-surface-container-low p-space-2xs px-space-sm rounded-xl">
                  <span className="font-label-sm text-label-sm font-semibold text-text-tertiary">Location Inactive</span>
                  <button
                    aria-label="Toggle Garki Branch Status"
                    onClick={() => toggleBranch('garki')}
                    type="button"
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none p-0.5 ${
                      branchToggles.garki ? 'bg-primary-container' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-surface-canvas shadow-sm transform transition-transform ${
                        branchToggles.garki ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-sm">
                <Icon name="info" className="text-text-tertiary text-[20px] shrink-0" />
                <p className="font-caption text-caption text-text-secondary">
                  <strong className="text-on-surface">Item delisted from Garki terminals:</strong> Woodfire Grilled Lamb
                  Chops will not appear on Garki POS or digital ordering tablets until branch facility reactivation is
                  completed by HQ Ops.
                </p>
              </div>
            </div>
              </>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-xl">
          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="analytics" className="text-primary text-[22px]" />
                <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">Network Telemetry</h3>
              </div>
              <span className="px-space-xs py-space-2xs rounded bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                Live Quota
              </span>
            </div>
            <div className="bg-surface-subtle p-space-md rounded-xl flex items-center gap-space-md mb-space-md">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-primary-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={v(`${rows.length ? Math.round((activeRows.length / rows.length) * 100) : 0}, 100`, '66, 100')}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-label-md text-label-md font-bold text-on-surface leading-none">
                  {v(rows.length ? `${Math.round((activeRows.length / rows.length) * 100)}%` : '—', '67%')}
                </span>
                  <span className="font-caption text-[10px] text-text-tertiary">Active</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-heading-md text-heading-md font-bold text-on-surface leading-tight">{v(`${totalStock} Total Units`, '35 Total Units')}</p>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  {v(`Allocated across ${activeRows.length} of ${rows.length} store branches`, 'Allocated across 2 of 3 store branches')}
                </p>
                <div className="flex items-center gap-space-xs mt-1 text-badge-discount-text font-caption text-[11px] font-semibold">
                  <Icon name="check_circle" className="text-[14px]" />
                  <span>{v('—', 'Both cold chains nominal')}</span>
                </div>
              </div>
            </div>
            <div className="space-y-space-xs mb-space-md">
              {live ? (
                activeRows.map((row, index) => {
                  const share = totalStock ? Math.round(((Number(row.stock) || 0) / totalStock) * 100) : 0;
                  return (
                    <div key={row.branchId} className={index ? 'pt-1' : ''}>
                      <div className="flex justify-between font-caption text-caption">
                        <span className="text-text-secondary">{row.name}</span>
                        <span className="font-semibold text-on-surface">
                          {row.stock === '' ? '—' : `${row.stock} units (${share}%)`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`${index % 2 ? 'bg-primary-container' : 'bg-primary'} h-full rounded-full`} style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
              <div className="flex justify-between font-caption text-caption">
                <span className="text-text-secondary">Wuse Branch (Abuja)</span>
                <span className="font-semibold text-on-surface">20 units (57%)</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '57%' }} />
              </div>
              <div className="flex justify-between font-caption text-caption pt-1">
                <span className="text-text-secondary">Victoria Island (Lagos)</span>
                <span className="font-semibold text-on-surface">15 units (43%)</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '43%' }} />
              </div>
                </>
              )}
            </div>
            <div className="p-space-sm rounded-xl bg-surface-tint-blue flex items-start gap-space-xs">
              <Icon name="sync_alt" className="text-primary text-[18px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary">
                <strong className="text-on-surface">Real-time depletion:</strong> Customer orders placed on table QR
                codes, POS, or delivery channels deduct branch quota instantly in real time.
              </p>
            </div>
          </div>

          <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <Icon name="point_of_sale" className="text-badge-discount-text text-[22px]" />
                <h3 className="font-heading-sm text-heading-sm font-bold text-on-surface">POS Terminal Sync</h3>
              </div>
              <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span>Live Push</span>
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed mb-space-md">
              Price adjustments and stock quotas propagate directly to all connected counter hardware without requiring
              cashier logout or application restarts.
            </p>
            <div className="space-y-space-xs bg-surface-subtle p-space-sm rounded-xl mb-space-md">
              {(live ? tills.map((till) => ({ icon: 'point_of_sale', name: till.name, status: till.status })) : TERMINALS.map((terminal) => ({ ...terminal, status: 'active' as const }))).map((terminal) => (
                <div
                  key={terminal.name}
                  className="flex items-center justify-between p-space-2xs font-caption text-caption"
                >
                  <div className="flex items-center gap-space-xs">
                    <Icon name={terminal.icon} className="text-[16px] text-text-secondary" />
                    <span className="font-medium text-on-surface">{terminal.name}</span>
                  </div>
                  <span className="text-badge-discount-text font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                    {terminal.status === 'active' || terminal.status === 'idle' ? 'Ready' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-text-secondary font-caption text-caption px-space-xs">
              <span>{v(`${tills.length} ${tills.length === 1 ? 'Terminal' : 'Terminals'}`, '6 Active Terminals')}</span>
              <span className="font-semibold text-primary">{v('—', 'Latency: ~240ms')}</span>
            </div>
          </div>

          <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm">
            <h4 className="font-label-md text-label-md font-bold text-on-surface mb-space-xs flex items-center gap-1">
              <Icon name="verified" className="text-secondary text-[18px]" />
              Pricing Policy Assurance
            </h4>
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              {v(
                'Branch prices apply to that branch only; the catalogue base price is unchanged.',
                'Overrides are verified against VEMTAP fair-price bounds. The coastal uplift applied to VI branch (₦16,500) complies within the permissible +15% regional variance policy.',
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-space-2xl pt-space-md pb-space-lg border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface sticky bottom-0 z-20 backdrop-blur-md bg-surface/95">
        <div className="flex items-center gap-space-sm text-text-secondary font-caption text-caption order-2 sm:order-1">
          <Icon name="info" className="text-primary text-[18px]" />
          <span>
            {dirty
              ? live
                ? 'Unsaved changes to this item’s branch rules.'
                : 'Unsaved modifications: 2 location rules staged for deployment.'
              : 'All location rules synced with the HQ catalog.'}
          </span>
        </div>
        <div className="flex items-center gap-space-md w-full sm:w-auto justify-end order-1 sm:order-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-surface-canvas hover:bg-surface-container text-on-surface font-button-secondary text-button-secondary transition-colors shadow-sm"
          >
            Cancel Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-all active:scale-[0.98]"
          >
            <span>Save Location Assignment &amp; Continue</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md shadow-xl">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md">{toast ?? ''}</span>
        </div>
      </div>
    </MerchantShell>
  );
}
