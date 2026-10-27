import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { catalogueItemsService } from '../services/catalogueItemsService';
import { catalogueItemKeys, useCatalogueItems } from '../hooks/business/useCatalogueItems';
import { useBranches } from '../hooks/business/useBranchesAndTeam';
import { apiErrorMessage } from '../services/errorMessages';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessProductAssignmentScreenProps {
  onBack: () => void;
  itemName: string;
  /** Live: the catalogue item whose branch availability and prices are edited. */
  itemId?: string | null;
}

const LIVE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e9eef9'/></svg>";

const naira = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;

/** One branch row of the live assignment. */
interface LiveRow {
  branchId: string;
  name: string;
  area: string;
  on: boolean;
  custom: boolean;
  price: string;
  stock: number | null;
}

const ITEM_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB8cD-H17QAO9FEIfrboS6Fl4mR52ukN-tHIZyMBooU46va9p8B4SUT7oJb-tMYAk2YQJV0vTOgoWjXUIvFoZO-7p6tnmfonoOAo6IIa9lNv1plWx4JpF78rd2uvlPrBoB9JgYNU2OljMq4GDtmeniIpaphl1ccce_w-XBCtqy4j4KXuNx50sZxcTduocQs99NVorVdZShNPQaXaW8e1vXIyLG7FESnO7B41JWa4DnkFjhzE-CymcjtYg';
const ITEM_ALT =
  'Gourmet prime woodfire aged ribeye steak cooked to medium rare with charred grill lines, garnished with fresh rosemary sprigs and Maldon flaky salt on a dark rustic slate presentation board with warm cinematic restaurant lighting';

export function BusinessProductAssignmentScreen({ onBack, itemName, itemId }: BusinessProductAssignmentScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  // Live: the item's real per-branch availability, price and stock; demo keeps the samples.
  const live = hasApiConfig() && Boolean(itemId);
  const id = itemId ?? '';
  const itemsQuery = useCatalogueItems();
  const item = (itemsQuery.data ?? []).find((entry) => entry.id === id);
  const queryClient = useQueryClient();
  const pricingQuery = useQuery({
    queryKey: ['catalogue-items', 'branch-pricing', id],
    queryFn: () => catalogueItemsService.branchPricing(id),
    enabled: live,
  });
  const branchesQuery = useBranches();
  const savePricing = useMutation({
    mutationFn: (input: Parameters<typeof catalogueItemsService.setBranchPricing>[1]) => catalogueItemsService.setBranchPricing(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all }),
  });
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [liveError, setLiveError] = useState<string | null>(null);
  const base = Number(pricingQuery.data?.basePrice ?? item?.price ?? 0);
  useEffect(() => {
    const pricing = pricingQuery.data;
    if (!live || !pricing) return;
    const areaOf = new Map((branchesQuery.data ?? []).map((branch) => [branch.id, [branch.city, branch.state].filter(Boolean).join(', ')]));
    setRows(
      pricing.branches.map((row) => ({
        branchId: row.branchId,
        name: row.branchName,
        area: areaOf.get(row.branchId) || '—',
        on: row.isAvailable,
        custom: row.hasOverride === true,
        price: String(Math.round(Number(row.price))),
        stock: row.stockQuantity ?? null,
      })),
    );
  }, [live, pricingQuery.data, branchesQuery.data]);
  const updateRow = (branchId: string, patch: Partial<LiveRow>) =>
    setRows((current) => current.map((row) => (row.branchId === branchId ? { ...row, ...patch } : row)));
  const activeRows = rows.filter((row) => (scope === 'all' ? true : row.on));
  const totalStock = activeRows.reduce((sum, row) => sum + (row.stock ?? 0), 0);
  const [maitamaOn, setMaitamaOn] = useState(true);
  const [victoriaOn, setVictoriaOn] = useState(true);
  const [garkiOn, setGarkiOn] = useState(false);
  const [maitamaCustom, setMaitamaCustom] = useState(false);
  const [victoriaCustom, setVictoriaCustom] = useState(true);
  const [victoriaPrice, setVictoriaPrice] = useState('14,000');
  const [dealLink, setDealLink] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (saved) return;
    if (live) {
      const anyCustom = rows.some((row) => row.custom);
      savePricing.mutate(
        {
          pricingMode: anyCustom ? 'per_branch' : 'uniform',
          branches: rows.map((row) => ({
            branchId: row.branchId,
            isAvailable: scope === 'all' ? true : row.on,
            price: row.custom && Number(row.price) ? Number(row.price) : null,
            stockQuantity: row.stock,
          })),
        },
        {
          onSuccess: () => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
          },
          onError: (error) => {
            setLiveError(apiErrorMessage(error, 'Could not save the branch assignment.'));
            window.setTimeout(() => setLiveError(null), 4000);
          },
        },
      );
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:text-text-primary hover:bg-surface-container-low transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate tracking-tight">
              Product Assignment
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 px-margin pt-space-md pb-40 space-y-space-lg">
        {/* Item Summary Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex items-center gap-space-md">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img alt={live ? item?.name ?? itemName : ITEM_ALT} className="w-full h-full object-cover" src={live ? item?.mainImage || LIVE_IMAGE_PLACEHOLDER : ITEM_IMG} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-space-2xs text-text-tertiary">
              <Icon name="restaurant_menu" className="text-[14px]" />
              <span className="font-caption text-caption tracking-wide uppercase">{live ? item?.category?.name ?? 'Product' : 'Steaks & Grills'}</span>
            </div>
            <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{live ? item?.name ?? 'Item' : itemName}</h2>
            <div className="flex items-baseline gap-space-2xs mt-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Base Default:</span>
              <span className="font-label-md text-label-md text-primary font-semibold">{live ? naira(base) : '₦12,000'}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Where is this available? */}
        <div className="space-y-space-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Where is this available?</h3>
            <span className="font-caption text-caption bg-surface-tint-blue text-primary px-space-xs py-space-2xs rounded-full font-medium">
              Step 4.4
            </span>
          </div>
          <div className="space-y-space-xs">
            <button
              className={`w-full text-left p-space-md rounded-xl shadow-sm transition-all ${
                scope === 'selected' ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest'
              }`}
              type="button"
              onClick={() => setScope('selected')}
            >
              <div className="flex items-start gap-space-sm">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    scope === 'selected' ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  {scope === 'selected' && <span className="w-2 h-2 rounded-full bg-surface-container-lowest" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-label-md text-label-md text-text-primary font-semibold">
                    Selected locations only
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                    Specify which branches stock this item and customize branch-level prices
                  </p>
                </div>
              </div>
            </button>
            <button
              className={`w-full text-left p-space-md rounded-xl shadow-sm transition-all ${
                scope === 'all' ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest'
              }`}
              type="button"
              onClick={() => setScope('all')}
            >
              <div className="flex items-start gap-space-sm">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    scope === 'all' ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  {scope === 'all' && <span className="w-2 h-2 rounded-full bg-surface-container-lowest" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-label-md text-label-md text-text-primary font-semibold">
                    All locations (Current & future branches)
                  </span>
                  <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                    Item is universally available at all business locations
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Branch Availability & Pricing */}
        <div className="space-y-space-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Availability & Pricing</h3>
              <p className="font-caption text-caption text-text-secondary mt-space-2xs">
                Configure availability, inventories, and regional surcharges
              </p>
            </div>
            <span className="font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant font-medium shrink-0">
              {live ? `${rows.length} ${rows.length === 1 ? 'Branch' : 'Branches'}` : '3 Branches'}
            </span>
          </div>

          {live &&
            rows.map((row) => {
              const on = scope === 'all' ? true : row.on;
              const diff = (Number(row.price) || base) - base;
              return (
                <div
                  key={row.branchId}
                  className={on ? 'bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md' : 'bg-surface-container-low rounded-xl p-space-md space-y-space-sm opacity-75'}
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-2xs">
                        <span className={`w-2 h-2 rounded-full ${on ? 'bg-badge-discount-text' : 'bg-text-tertiary'}`} />
                        <span className={`font-label-sm text-label-sm font-semibold uppercase ${on ? 'text-badge-discount-text' : 'text-text-tertiary'}`}>
                          {on ? 'Stocked Here' : 'Not Stocked'}
                        </span>
                      </div>
                      <h4 className={`font-heading-sm text-heading-sm truncate mt-space-2xs ${on ? 'text-text-primary' : 'text-text-secondary'}`}>{row.name}</h4>
                      <span className="font-caption text-caption text-text-tertiary">{row.area}</span>
                    </div>
                    <button
                      aria-checked={on}
                      className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${on ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'}`}
                      role="switch"
                      type="button"
                      onClick={() => updateRow(row.branchId, { on: !row.on })}
                    >
                      <span className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center">
                        <Icon name={on ? 'check' : 'close'} filled={on} className={`text-[14px] ${on ? 'text-primary' : 'text-outline'}`} />
                      </span>
                    </button>
                  </div>
                  {on && (
                    <>
                      <div className="grid grid-cols-2 gap-space-xs">
                        <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                          <Icon name="inventory_2" className="text-text-tertiary text-[18px]" />
                          <div className="min-w-0">
                            <span className="block font-caption text-caption text-text-tertiary">In-Stock</span>
                            <span className="font-label-sm text-label-sm text-text-primary font-medium">
                              {row.stock == null ? '—' : `${row.stock} units in stock`}
                            </span>
                          </div>
                        </div>
                        <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                          <Icon name="timer" className="text-text-tertiary text-[18px]" />
                          <div className="min-w-0">
                            <span className="block font-caption text-caption text-text-tertiary">Lead Prep</span>
                            <span className="font-label-sm text-label-sm text-text-primary font-medium">—</span>
                          </div>
                        </div>
                      </div>
                      <div className={`${row.custom ? 'bg-surface-tint-blue rounded-xl p-space-md' : 'bg-surface-container-low rounded-lg p-space-sm'} space-y-space-xs`}>
                        <button className="w-full flex items-center gap-space-sm text-left select-none" type="button" onClick={() => updateRow(row.branchId, { custom: !row.custom })}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${row.custom ? 'bg-primary' : 'bg-surface-container-lowest'}`}>
                            <Icon
                              name={row.custom ? 'check_box' : 'check_box_outline_blank'}
                              filled={row.custom}
                              className={`text-[16px] ${row.custom ? 'text-on-primary' : 'text-outline-variant'}`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`font-label-md text-label-md font-medium ${row.custom ? 'text-primary' : 'text-text-primary'}`}>
                              Use custom price for this branch
                            </span>
                            <p className="font-caption text-caption text-text-secondary">
                              {row.custom ? 'Custom retail rate for this branch' : 'Using standard base catalog price'}
                            </p>
                          </div>
                          {!row.custom && <span className="font-label-md text-label-md text-text-primary font-semibold">{naira(base)}</span>}
                        </button>
                        {row.custom && (
                          <div className="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm">
                            <span className="pl-space-md font-label-md text-label-md text-text-secondary font-semibold select-none">₦</span>
                            <input
                              className="w-full bg-transparent py-space-sm pl-space-xs pr-space-md font-heading-sm text-heading-sm text-text-primary focus:outline-none"
                              type="text"
                              value={row.price}
                              onChange={(event) => updateRow(row.branchId, { price: event.target.value.replace(/\D/g, '') })}
                            />
                            {diff !== 0 && (
                              <div className="pr-space-sm shrink-0">
                                <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                                  <Icon name={diff > 0 ? 'trending_up' : 'trending_down'} className="text-[13px]" />
                                  {diff > 0 ? '+' : '-'}
                                  {naira(Math.abs(diff))} vs base
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          {!live && (
            <>
          {/* Branch 1: Maitama Flagship */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold uppercase">
                    Active Terminal
                  </span>
                </div>
                <h4 className="font-heading-sm text-heading-sm text-text-primary truncate mt-space-2xs">
                  Maitama Flagship
                </h4>
                <span className="font-caption text-caption text-text-tertiary">Abuja, Federal Capital Territory</span>
              </div>
              <button
                aria-checked={maitamaOn}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                  maitamaOn ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                }`}
                role="switch"
                type="button"
                onClick={() => setMaitamaOn((on) => !on)}
              >
                <span className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center">
                  <Icon
                    name={maitamaOn ? 'check' : 'close'}
                    filled={maitamaOn}
                    className={`text-[14px] ${maitamaOn ? 'text-primary' : 'text-outline'}`}
                  />
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <Icon name="inventory_2" className="text-text-tertiary text-[18px]" />
                <div className="min-w-0">
                  <span className="block font-caption text-caption text-text-tertiary">In-Stock</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">42 units in stock</span>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <Icon name="timer" className="text-text-tertiary text-[18px]" />
                <div className="min-w-0">
                  <span className="block font-caption text-caption text-text-tertiary">Lead Prep</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">15-20 mins</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-lg p-space-sm space-y-space-xs">
              <button
                className="w-full flex items-center gap-space-sm text-left select-none"
                type="button"
                onClick={() => setMaitamaCustom((on) => !on)}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    maitamaCustom ? 'bg-primary' : 'bg-surface-container-lowest'
                  }`}
                >
                  <Icon
                    name={maitamaCustom ? 'check_box' : 'check_box_outline_blank'}
                    filled={maitamaCustom}
                    className={`text-[16px] ${maitamaCustom ? 'text-on-primary' : 'text-outline-variant'}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-text-primary font-medium">
                    Use custom price for this branch
                  </span>
                  <p className="font-caption text-caption text-text-secondary">Using standard base catalog price</p>
                </div>
                <span className="font-label-md text-label-md text-text-primary font-semibold">₦12,000</span>
              </button>
            </div>
          </div>

          {/* Branch 2: Victoria Island */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold uppercase">
                    Active Terminal
                  </span>
                </div>
                <h4 className="font-heading-sm text-heading-sm text-text-primary truncate mt-space-2xs">
                  Victoria Island
                </h4>
                <span className="font-caption text-caption text-text-tertiary">Lagos Island, Lagos</span>
              </div>
              <button
                aria-checked={victoriaOn}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                  victoriaOn ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                }`}
                role="switch"
                type="button"
                onClick={() => setVictoriaOn((on) => !on)}
              >
                <span className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center">
                  <Icon
                    name={victoriaOn ? 'check' : 'close'}
                    filled={victoriaOn}
                    className={`text-[14px] ${victoriaOn ? 'text-primary' : 'text-outline'}`}
                  />
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <Icon name="inventory_2" className="text-text-tertiary text-[18px]" />
                <div className="min-w-0">
                  <span className="block font-caption text-caption text-text-tertiary">In-Stock</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">18 units in stock</span>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <Icon name="local_shipping" className="text-text-tertiary text-[18px]" />
                <div className="min-w-0">
                  <span className="block font-caption text-caption text-text-tertiary">Fulfillment</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">Cold Express</span>
                </div>
              </div>
            </div>
            {/* Custom Pricing Section */}
            <div className="bg-surface-tint-blue rounded-xl p-space-md space-y-space-sm">
              <button
                className="w-full flex items-center gap-space-sm text-left select-none"
                type="button"
                onClick={() => setVictoriaCustom((on) => !on)}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    victoriaCustom ? 'bg-primary' : 'bg-surface-container-lowest border border-border-subtle'
                  }`}
                >
                  <Icon
                    name={victoriaCustom ? 'check' : 'check_box_outline_blank'}
                    filled={victoriaCustom}
                    className={`text-[16px] ${victoriaCustom ? 'text-on-primary' : 'text-outline-variant'}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`font-label-md text-label-md font-semibold ${
                      victoriaCustom ? 'text-primary' : 'text-text-primary'
                    }`}
                  >
                    Use different price for selected location
                  </span>
                  <p className="font-caption text-caption text-text-secondary">
                    Custom retail rate applied to local pos and apps
                  </p>
                </div>
              </button>
              {victoriaCustom && (
                <>
                  <div className="space-y-space-2xs">
                    <div className="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm">
                      <span className="pl-space-md font-label-md text-label-md text-text-secondary font-semibold select-none">
                        ₦
                      </span>
                      <input
                        className="w-full bg-transparent py-space-sm pl-space-xs pr-space-md font-heading-sm text-heading-sm text-text-primary focus:outline-none"
                        type="text"
                        value={victoriaPrice}
                        onChange={(event) => setVictoriaPrice(event.target.value.replace(/\D/g, ''))}
                      />
                      <div className="pr-space-sm shrink-0">
                        <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                          <Icon name="trending_up" className="text-[13px]" />
                          +₦2,000 logistics adjustment
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Active Deal Override */}
                  <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center justify-between gap-space-sm shadow-sm">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <div className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                        <Icon name="local_offer" className="text-primary text-[16px]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-label-sm text-label-sm text-text-primary font-medium truncate">
                          Link to Lagos 15% Weekend Deal
                        </span>
                        <span className="block font-caption text-caption text-badge-discount-text">
                          Auto-computes to ₦11,900 on Saturdays
                        </span>
                      </div>
                    </div>
                    <button
                      aria-checked={dealLink}
                      className={`w-9 h-5 rounded-full p-0.5 flex items-center shrink-0 transition-colors ${
                        dealLink ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                      }`}
                      role="switch"
                      type="button"
                      onClick={() => setDealLink((on) => !on)}
                    >
                      <span className="w-4 h-4 rounded-full bg-surface-container-lowest shadow-sm" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Branch 3: Garki Express Hub (Inactive) */}
          <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm opacity-75">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                  <span className="font-label-sm text-label-sm text-text-tertiary font-semibold uppercase">
                    Disabled Hub
                  </span>
                </div>
                <h4 className="font-heading-sm text-heading-sm text-text-secondary truncate mt-space-2xs">
                  Garki Express Hub
                </h4>
                <span className="font-caption text-caption text-text-tertiary">Garki II, Abuja</span>
              </div>
              <button
                aria-checked={garkiOn}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                  garkiOn ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                }`}
                role="switch"
                type="button"
                onClick={() => setGarkiOn((on) => !on)}
              >
                <span className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center">
                  <Icon
                    name={garkiOn ? 'check' : 'close'}
                    filled={garkiOn}
                    className={`text-[14px] ${garkiOn ? 'text-primary' : 'text-outline'}`}
                  />
                </span>
              </button>
            </div>
            <div className="bg-surface-container rounded-lg p-space-sm flex items-start gap-space-xs">
              <Icon name="construction" className="text-text-tertiary text-[18px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary">
                Branch is currently undergoing kitchen fitout. Item inactive.
              </p>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Section 3: Online Order & POS Routing */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
            <Icon name="sync_alt" className="text-primary text-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-label-md text-label-md text-text-primary font-semibold">Online Order & POS Routing</h5>
            <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
              Orders placed on VEMTAP or registered at branch POS terminals will automatically debit local stock and
              apply the branch-specific price.
            </p>
          </div>
        </div>

        {/* Live Network Capacity */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-text-secondary">Live Network Capacity</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">
              {live ? `${totalStock} Total Units` : '60 Total Ribeye Steaks'}
            </span>
          </div>
          {live ? (
            <>
              <div className="h-2 w-full rounded-full bg-surface-container-low overflow-hidden flex">
                {activeRows.map((row, index) => (
                  <div
                    key={row.branchId}
                    className={`${index % 2 ? 'bg-secondary-container' : 'bg-primary'} h-full`}
                    style={{ width: totalStock ? `${((row.stock ?? 0) / totalStock) * 100}%` : '0%' }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between font-caption text-caption text-text-tertiary pt-space-2xs flex-wrap gap-space-2xs">
                {rows.map((row, index) => (
                  <div key={row.branchId} className="flex items-center gap-space-2xs">
                    <span className={`w-2 h-2 rounded-full ${row.on ? (index % 2 ? 'bg-secondary-container' : 'bg-primary') : 'bg-surface-container-highest'}`} />
                    <span>
                      {row.name} ({totalStock && row.on ? Math.round(((row.stock ?? 0) / totalStock) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
          <div className="h-2 w-full rounded-full bg-surface-container-low overflow-hidden flex">
            <div className="bg-primary h-full" style={{ width: '70%' }} />
            <div className="bg-secondary-container h-full" style={{ width: '30%' }} />
          </div>
          <div className="flex items-center justify-between font-caption text-caption text-text-tertiary pt-space-2xs">
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Maitama (70%)</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-secondary-container" />
              <span>VI Lagos (30%)</span>
            </div>
            <div className="flex items-center gap-space-2xs">
              <span className="w-2 h-2 rounded-full bg-surface-container-highest" />
              <span>Garki (0%)</span>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky Bottom Save */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-canvas/95 backdrop-blur-md px-margin py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
        <div className="space-y-space-xs">
          <button
            className={`w-full h-14 rounded-xl font-button-primary text-button-primary shadow-lg flex items-center justify-center gap-space-xs active:scale-[0.98] transition-all ${
              saved ? 'bg-badge-discount-text text-on-primary' : 'bg-primary-container text-on-primary'
            }`}
            type="button"
            onClick={handleSave}
          >
            <Icon name={saved ? 'check_circle' : 'save'} className="text-[20px]" />
            <span>
              {saved
                ? 'Saved — Syncing to Terminals...'
                : live
                  ? `Save Location Assignment (${activeRows.length} Active ${activeRows.length === 1 ? 'Branch' : 'Branches'})`
                  : 'Save Location Assignment (2 Active Branches)'}
            </span>
          </button>
          <div className="flex items-center justify-center gap-space-2xs text-text-tertiary">
            <Icon name="lock_reset" className="text-[14px]" />
            <span className="font-caption text-caption">Changes push live instantly across connected terminals</span>
          </div>
        </div>
      </div>
      {liveError && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {liveError}
        </div>
      )}
    </AppScreen>
  );
}
