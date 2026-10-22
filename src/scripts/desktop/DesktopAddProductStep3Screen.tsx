import { LiveAvailabilityStep } from '../../components/business/LiveItemSteps';
import { hasApiConfig } from '../../services/api/client';
import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopAddProductStep3ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const SNIPPET_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrseYLW3neMDq2sxhnRg33k0tYRKb1o81UQjqQpSVXZTYb_27mHPVNUqIkergjfADDorcB5ERx9tnBIaUHcsgyoAntmn-zsEAhLL02Ov_jAhtAHZ3_sHRr0lkmCAFVYJKEyE6qZy_ygunVHuRLmZ3c6a-aB-GsYNs5tsVct3HQYpuvyB48J0VMymizD_6VlcYN1zw4N1L0aVGjjahghGIH34nCc6Wb-gno4P_6TBGU';

const SNIPPET_ALT =
  'Close-up gourmet handcrafted artisan smash burger on toasted brioche bun with sharp cheddar cheese and crisp microgreens studio lighting on slate background';

const COVERAGE_MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBqWD43yLaKpE9TIGaFLtU_5aHMSk0PuSaxOgMb8TSVllg8vSBOiFZRtV_WLcRxA1WrdN51jmFq-09V4RuMV10PFE61dEue1dZvARrecwX8Ipd4lxejGCOQ-wahGuFAHUnxB5WrLBXHBzYi8HWcXEwCiou1dFWWuYICQhrRpyQhJY8N13GQWhZWSnkDY8p7KHET6kvdykYloEhP-eIlYjB4vVjAUC_fVk0Hd0MFG4ei';

const COVERAGE_MAP_LABEL = 'Wuse 2, Abuja, Nigeria';

const ACTIVE_BRANCHES: Array<{
  key: string;
  name: string;
  badge: string;
  badgeClass: string;
  address: string;
  units: string;
  radius: string;
  price: string;
}> = [
  {
    key: 'wuse',
    name: 'Wuse Branch (Flagship)',
    badge: 'Primary Depot',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    address: 'Plot 1428 Adetokunbo Ademola Cres, Wuse 2, Abuja',
    units: '30 units available',
    radius: 'Radius: 5.2 km',
    price: '₦12,000',
  },
  {
    key: 'garki',
    name: 'Garki Branch',
    badge: 'District 2',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    address: 'Suite 4B, Garki Mall, Area 11, Abuja',
    units: '18 units available',
    radius: 'Radius: 3.8 km',
    price: '₦12,500',
  },
];

const PREP_WINDOWS: Array<{ value: string; hint: string }> = [
  { value: '10 – 15 Mins', hint: 'Express / Ready to Grab' },
  { value: '20 – 30 Mins', hint: 'Standard Fresh Made' },
  { value: '45 – 60 Mins', hint: 'Custom Batch Preparation' },
];

const PEAK_BARS: Array<{ x: number; y: number; height: number; opacity: number }> = [
  { x: 10, y: 20, height: 12, opacity: 0.3 },
  { x: 30, y: 16, height: 16, opacity: 0.4 },
  { x: 50, y: 10, height: 22, opacity: 0.6 },
  { x: 70, y: 4, height: 28, opacity: 0.9 },
  { x: 90, y: 8, height: 24, opacity: 0.7 },
  { x: 110, y: 18, height: 14, opacity: 0.3 },
  { x: 130, y: 14, height: 18, opacity: 0.5 },
  { x: 150, y: 6, height: 26, opacity: 0.85 },
  { x: 170, y: 2, height: 30, opacity: 1 },
];

function DemoDesktopAddProductStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onNav,
}: DesktopAddProductStep3ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(true);

  const toggleBranch = (key: string, checked: boolean) => {
    onDraftChange({ branches: { ...draft.branches, [key]: checked } });
  };

  const selectAllActive = () => {
    onDraftChange({ branches: { ...draft.branches, wuse: true, garki: true } });
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue font-caption text-caption text-primary font-semibold">
                Step 4 of 5
              </span>
              <span className="text-text-tertiary text-caption font-caption">Offerings &amp; Catalog Setup</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Branch Availability &amp; Fulfillment
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Configure physical branch inventory levels, hyper-local pricing variations, and dispatch channels.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-space-2xs min-w-[260px]">
            <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
              <span className="font-semibold text-primary">80% Completed</span>
              <span>•</span>
              <span>Next: Review &amp; Launch</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="storefront" className="text-[20px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Where is this sold &amp; fulfilled?
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Select operating branches stocking this stock-keeping unit (SKU).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={selectAllActive}
                  className="text-caption font-caption text-primary font-medium cursor-pointer hover:underline"
                >
                  Select All Active
                </button>
              </div>
              <div className="flex flex-col gap-space-sm">
                {ACTIVE_BRANCHES.map((branch) => (
                  <label
                    key={branch.key}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-tint-blue/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-space-sm min-w-0">
                      <input
                        type="checkbox"
                        checked={Boolean(draft.branches[branch.key])}
                        onChange={(event) => toggleBranch(branch.key, event.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-none accent-primary cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            {branch.name}
                          </span>
                          <span
                            className={`px-space-2xs py-0.5 rounded text-[11px] font-medium ${branch.badgeClass}`}
                          >
                            {branch.badge}
                          </span>
                        </div>
                        <p className="font-caption text-caption text-text-secondary truncate mt-0.5">
                          {branch.address}
                        </p>
                        <div className="flex items-center gap-space-sm mt-space-2xs">
                          <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text inline-block" />{' '}
                            {branch.units}
                          </span>
                          <span className="text-text-tertiary text-caption font-caption">•</span>
                          <span className="font-caption text-caption text-text-secondary">{branch.radius}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-space-sm sm:mt-0 flex items-center gap-space-sm self-end sm:self-center">
                      <div className="text-right">
                        <span className="font-caption text-caption text-text-tertiary block">Branch Price</span>
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          {branch.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-space-xs py-1 rounded-lg bg-surface-container-high hover:bg-surface-tint-blue text-primary font-label-sm text-label-sm transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </label>
                ))}
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low opacity-60 cursor-not-allowed">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <input
                      className="mt-1 w-4 h-4 rounded text-outline-variant cursor-not-allowed"
                      disabled
                      type="checkbox"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-md text-label-md text-text-secondary font-semibold">
                          Maitama Branch
                        </span>
                        <span className="px-space-2xs py-0.5 rounded text-[11px] font-medium bg-tertiary-fixed text-on-tertiary-fixed">
                          Opening Soon
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-tertiary truncate mt-0.5">
                        Plot 880 Shehu Shagari Way, Maitama, Abuja
                      </p>
                      <div className="flex items-center gap-space-xs mt-space-2xs">
                        <span className="font-caption text-caption text-text-tertiary">
                          Site under commercial inspection
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-space-sm sm:mt-0 flex items-center gap-space-xs self-end sm:self-center text-text-tertiary">
                    <Icon name="lock" className="text-[18px]" />
                    <span className="font-caption text-caption">Unavailable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="payments" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Location Pricing Mode</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Determine uniform base retail pricing or bespoke regional surcharges.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <label
                  className={`p-space-md rounded-xl transition-colors cursor-pointer flex flex-col justify-between gap-space-sm ${
                    draft.pricingMode === 'uniform'
                      ? 'bg-surface-tint-blue'
                      : 'bg-surface-subtle hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <span
                        className={`font-label-md text-label-md font-semibold ${
                          draft.pricingMode === 'uniform' ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        Use same base price
                      </span>
                      <span className="font-caption text-caption text-text-secondary mt-1">
                        Single standard checkout price (₦12,000) across all Abuja points of sale.
                      </span>
                    </div>
                    <input
                      className="mt-0.5 w-4 h-4 text-primary focus:ring-primary accent-primary"
                      name="pricing_mode"
                      type="radio"
                      checked={draft.pricingMode === 'uniform'}
                      onChange={() => onDraftChange({ pricingMode: 'uniform' })}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-space-2xs font-caption text-caption ${
                      draft.pricingMode === 'uniform' ? 'text-primary font-medium' : 'text-text-tertiary'
                    }`}
                  >
                    <Icon name="sync" className="text-[16px]" />
                    <span>Auto-synced catalogs</span>
                  </div>
                </label>
                <label
                  className={`p-space-md rounded-xl transition-colors cursor-pointer flex flex-col justify-between gap-space-sm ${
                    draft.pricingMode === 'custom' ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span
                          className={`font-label-md text-label-md font-semibold ${
                            draft.pricingMode === 'custom' ? 'text-primary' : 'text-text-primary'
                          }`}
                        >
                          Customize prices per branch
                        </span>
                        {draft.pricingMode === 'custom' && (
                          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        )}
                      </div>
                      <span className="font-caption text-caption text-text-secondary mt-1">
                        Adjust for varying logistics, rent, premium packaging, or local delivery surcharges.
                      </span>
                    </div>
                    <input
                      className="mt-0.5 w-4 h-4 text-primary focus:ring-primary accent-primary"
                      name="pricing_mode"
                      type="radio"
                      checked={draft.pricingMode === 'custom'}
                      onChange={() => onDraftChange({ pricingMode: 'custom' })}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-space-2xs font-caption text-caption ${
                      draft.pricingMode === 'custom' ? 'text-primary font-medium' : 'text-text-tertiary'
                    }`}
                  >
                    <Icon name="tune" className="text-[16px]" />
                    <span>Active: 2 custom branch tiers</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between flex-wrap gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="local_shipping" className="text-[20px]" />
                  </div>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Fulfillment &amp; Ordering Channels
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Enable immediate local pathways and 3rd-party logistics discovery.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Jumia Ready
                  </span>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                    Jiji Sync
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-space-sm">
                <label className="flex items-start justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-tint-blue/40 transition-colors cursor-pointer">
                  <div className="flex items-start gap-space-sm">
                    <input
                      type="checkbox"
                      checked={pickup}
                      onChange={(event) => setPickup(event.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          In-Store Pickup / Dine-In Walk
                        </span>
                        <span className="px-space-2xs py-0.5 rounded text-[11px] font-medium bg-badge-discount-bg text-badge-discount-text">
                          Instant
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Customers can order through VEMTAP App and pick up counter-side in 15 mins upon confirmation.
                      </p>
                    </div>
                  </div>
                  <Icon name="storefront" className="text-text-secondary text-[20px]" />
                </label>
                <label className="flex items-start justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-tint-blue/40 transition-colors cursor-pointer">
                  <div className="flex items-start gap-space-sm">
                    <input
                      type="checkbox"
                      checked={delivery}
                      onChange={(event) => setDelivery(event.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md text-text-primary font-semibold">
                          Local Delivery / Express Dispatch
                        </span>
                        <span className="px-space-2xs py-0.5 rounded text-[11px] font-medium bg-secondary-fixed text-on-secondary-fixed-variant">
                          20-30 Mins
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Direct merchant courier rider dispatched within the district delivery perimeter.
                      </p>
                    </div>
                  </div>
                  <Icon name="two_wheeler" className="text-text-secondary text-[20px]" />
                </label>
                <div className="flex items-start justify-between p-space-md rounded-xl bg-surface-container-low opacity-60 cursor-not-allowed">
                  <div className="flex items-start gap-space-sm">
                    <input
                      className="mt-1 w-4 h-4 rounded cursor-not-allowed text-outline-variant"
                      disabled
                      type="checkbox"
                    />
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-md text-label-md text-text-secondary font-semibold">
                          Nationwide Interstate Waybill
                        </span>
                        <span className="px-space-2xs py-0.5 rounded text-[11px] font-medium bg-error-container text-on-error-container">
                          Disabled • Perishable
                        </span>
                      </div>
                      <p className="font-caption text-caption text-text-tertiary mt-0.5">
                        Excluded because this product category is tagged as temperature-sensitive fresh food.
                      </p>
                    </div>
                  </div>
                  <Icon name="flight_takeoff" className="text-text-tertiary text-[20px]" />
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="schedule" className="text-[20px]" />
                </div>
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Handling &amp; Prep Window</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Expected kitchen/fulfillment duration before rider hand-off.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                {PREP_WINDOWS.map((window) => {
                  const selected = draft.prepWindow === window.value;
                  return (
                    <label
                      key={window.value}
                      className={`p-space-md rounded-xl transition-colors cursor-pointer flex flex-col items-center text-center gap-space-2xs ${
                        selected ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-high'
                      }`}
                    >
                      <input
                        className="w-4 h-4 text-primary accent-primary mb-1"
                        name="prep_window"
                        type="radio"
                        checked={selected}
                        onChange={() => onDraftChange({ prepWindow: window.value })}
                      />
                      <span
                        className={`font-label-md text-label-md font-semibold ${
                          selected ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        {window.value}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">{window.hint}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="hub" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Branch Matrix Preview</h3>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" /> Active Sync
                </span>
              </div>
              <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-subtle">
                <img className="w-14 h-14 rounded-lg object-cover" alt={SNIPPET_ALT} src={SNIPPET_IMAGE} />
                <div className="min-w-0">
                  <span className="font-caption text-caption text-primary font-semibold block">Item #VEM-8402</span>
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">
                    Smoked Angus Truffle Burger
                  </h4>
                  <span className="font-caption text-caption text-text-secondary">Category: Artisan Mains</span>
                </div>
              </div>
              <div className="space-y-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Wuse 2</span>
                    <span className="font-caption text-caption text-text-secondary">Inventory: 30 units</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">₦12,000</span>
                    <span className="font-caption text-caption text-badge-discount-text block">
                      High Demand (94%)
                    </span>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">Garki Area 11</span>
                    <span className="font-caption text-caption text-text-secondary">Inventory: 18 units</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">₦12,500</span>
                    <span className="font-caption text-caption text-primary block">Stable Demand (78%)</span>
                  </div>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-2xs">
                <div className="flex justify-between items-center text-caption font-caption text-text-secondary">
                  <span>Estimated Peak Hours Reach</span>
                  <span className="font-semibold text-text-primary">12:30 PM • 7:00 PM</span>
                </div>
                <svg className="w-full h-8 text-primary" preserveAspectRatio="none" viewBox="0 0 200 32">
                  {PEAK_BARS.map((bar) => (
                    <rect
                      key={bar.x}
                      fill="currentColor"
                      height={bar.height}
                      opacity={bar.opacity}
                      rx="2"
                      width="12"
                      x={bar.x}
                      y={bar.y}
                    />
                  ))}
                </svg>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="near_me" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Delivery Coverage</h3>
                </div>
                <span className="font-caption text-caption text-text-secondary font-medium">3km Perimeter</span>
              </div>
              <div
                role="img"
                aria-label={COVERAGE_MAP_LABEL}
                className="w-full h-36 bg-cover bg-center rounded-lg relative overflow-hidden flex items-end p-space-xs"
                style={{ backgroundImage: `url('${COVERAGE_MAP_IMAGE}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative z-10 flex items-center justify-between w-full text-surface-canvas text-caption font-caption">
                  <span className="flex items-center gap-1 font-medium">
                    <Icon name="radio_button_checked" className="text-[14px] text-badge-discount-text" /> Wuse &amp;
                    Garki Corridors
                  </span>
                  <span className="bg-text-primary/70 backdrop-blur px-2 py-0.5 rounded text-[11px]">
                    ~42,000 Consumers
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm text-center">
                <div className="p-space-xs rounded-lg bg-surface-subtle">
                  <span className="text-caption font-caption text-text-secondary block">Avg. Fulfillment</span>
                  <span className="font-label-md text-label-md text-text-primary font-bold">24 Mins</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-subtle">
                  <span className="text-caption font-caption text-text-secondary block">Rider Density</span>
                  <span className="font-label-md text-label-md text-badge-discount-text font-bold">
                    High (38 nearby)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Step 3 (Product Image)</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Review &amp; Publish Product</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/** Live: the business's real branches and item; demo keeps the designed screen. */
export function DesktopAddProductStep3Screen(props: DesktopAddProductStep3ScreenProps) {
  if (!hasApiConfig()) return <DemoDesktopAddProductStep3Screen {...props} />;
  const Shell = props.onNav ? MerchantShell : BusinessSetupChrome;
  return (
    <Shell activeNav="catalog" onNav={props.onNav}>
      <div className="max-w-4xl mx-auto w-full px-6 py-space-xl">
      <LiveAvailabilityStep
        item={{
    kind: 'product',
    title: props.draft.title,
    image: props.draft.mainImage,
    category: props.draft.subCategory,
    description: props.draft.description,
    price: props.draft.basePrice,
    was: props.draft.comparePrice,
    details: props.draft.lowStock ? [['Low-stock alert', `${props.draft.lowStock} units`]] : [],
  }}
        selected={Object.keys(props.draft.branches ?? {}).filter((id) => props.draft.branches[id])}
        onChange={(ids) => props.onDraftChange({ branches: Object.fromEntries(ids.map((id) => [id, true])) })}
        onBack={props.onBack}
        onNext={props.onNext}
        nextLabel="Review & publish"
      />
      </div>
    </Shell>
  );
}
