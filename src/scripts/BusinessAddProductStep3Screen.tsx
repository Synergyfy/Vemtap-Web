import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ProductDraft } from './productDraft';

interface BusinessAddProductStep3ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

interface SelectableBranch {
  key: string;
  name: string;
  badge?: string;
  address: string;
  stock: string;
}

const SELECTABLE_BRANCHES: SelectableBranch[] = [
  {
    key: 'wuse',
    name: 'Wuse Branch',
    badge: 'Flagship',
    address: 'Plot 1428 Adetokunbo Ademola Cres',
    stock: 'In Stock (30 units)',
  },
  {
    key: 'garki',
    name: 'Garki Branch',
    address: 'Suite 4B, Garki Mall',
    stock: 'In Stock (18 units)',
  },
];

const PREP_CHIPS = [
  { range: '10-15', title: '10 – 15m', sub: 'Express', label: '10 - 15 minutes' },
  { range: '20-30', title: '20 – 30m', sub: 'Standard', label: '20 - 30 minutes' },
  { range: '45+', title: '45 – 60m', sub: 'Custom', label: '45 - 60 minutes' },
];

export function BusinessAddProductStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddProductStep3ScreenProps) {
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(true);

  const activeBranches = SELECTABLE_BRANCHES.filter((branch) => draft.branches[branch.key]);
  const allSelected = activeBranches.length === SELECTABLE_BRANCHES.length;

  const toggleAll = () => {
    const next: Record<string, boolean> = { ...draft.branches };
    SELECTABLE_BRANCHES.forEach((branch) => {
      next[branch.key] = !allSelected;
    });
    onDraftChange({ branches: next });
  };

  const selectedPrep = PREP_CHIPS.find((chip) => chip.range === draft.prepWindow) ?? PREP_CHIPS[1];

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1 truncate px-space-xs">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
              Step 4 of 5
            </span>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate">Add New Product</h1>
          </div>
          <div className="flex items-center gap-space-xs -mr-2">
            <button
              aria-label="Save draft"
              className="h-11 min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-all"
              type="button"
              onClick={onSaveDraft}
            >
              Draft
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-32">
        <div className="px-margin pt-space-md pb-space-xs">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-text-secondary">
              Step 4 of 5: Branch Availability
            </span>
            <span className="font-label-sm text-label-sm font-semibold text-primary">80% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-300" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="px-margin pt-space-sm pb-space-md">
          <h2 className="font-heading-md text-heading-md text-on-surface">
            Where is this sold &amp; fulfilled?
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Assign which of your registered branch locations stock and fulfill this item.
          </p>
        </div>

        <div className="px-margin space-y-space-sm mb-space-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-medium">Select available locations</span>
            <button
              className="font-caption text-caption text-primary hover:text-on-primary-fixed-variant transition-colors"
              id="selectAllBtn"
              type="button"
              onClick={toggleAll}
            >
              Select all (2 active)
            </button>
          </div>
          {SELECTABLE_BRANCHES.map((branch) => {
            const checked = Boolean(draft.branches[branch.key]);
            return (
              <div
                key={branch.key}
                className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all duration-200 ${
                  checked ? '' : 'opacity-50'
                }`}
              >
                <div className="flex items-start gap-space-sm">
                  <label className="relative flex items-center justify-center w-6 h-6 mt-0.5 cursor-pointer">
                    <input
                      checked={checked}
                      className="sr-only peer"
                      type="checkbox"
                      onChange={() => onDraftChange({ branches: { ...draft.branches, [branch.key]: !checked } })}
                    />
                    <div className="w-5 h-5 rounded-md bg-surface-container-high peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                      <Icon
                        className={`text-on-primary text-[16px] transition-transform font-bold ${
                          checked ? 'scale-100' : 'scale-0'
                        }`}
                        name="check"
                      />
                    </div>
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <span className="font-button-primary text-button-primary text-on-surface truncate">
                        {branch.name}
                      </span>
                      {branch.badge && (
                        <span className="bg-surface-tint-blue text-primary font-caption text-caption px-2 py-0.5 rounded-full font-semibold">
                          {branch.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{branch.address}</p>
                    <div className="flex items-center justify-between mt-space-sm pt-space-xs">
                      <span className="inline-flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-2 py-1 rounded-md font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                        {branch.stock}
                      </span>
                      <button
                        className="font-caption text-caption text-primary flex items-center gap-1 hover:underline"
                        type="button"
                      >
                        <Icon name="edit" className="text-[14px]" /> Edit Price
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-surface-container-low/60 rounded-xl p-space-md opacity-75">
            <div className="flex items-start gap-space-sm">
              <div className="w-6 h-6 mt-0.5 flex items-center justify-center">
                <div className="w-5 h-5 rounded-md bg-surface-container-high flex items-center justify-center">
                  <Icon name="lock" className="text-outline-variant text-[14px]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-button-primary text-button-primary text-text-secondary truncate">
                    Maitama Branch
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant font-caption text-caption px-2 py-0.5 rounded-full">
                    Opening Soon
                  </span>
                </div>
                <p className="font-caption text-caption text-text-tertiary truncate mt-0.5">
                  Maitama City Center (Commissioning May 2025)
                </p>
                <div className="mt-space-xs">
                  <span className="font-caption text-caption text-text-tertiary">Inventory linked after launch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-margin mb-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center gap-space-xs mb-space-sm">
              <Icon name="tune" className="text-primary text-[20px]" />
              <span className="font-heading-sm text-heading-sm text-on-surface">Location Pricing Mode</span>
            </div>
            <div className="space-y-space-sm">
              <label
                className={`flex items-start gap-space-sm p-space-sm rounded-lg cursor-pointer transition-colors ${
                  draft.pricingMode === 'uniform' ? 'bg-surface-tint-blue' : 'bg-surface-container-low'
                }`}
                id="labelPriceUnified"
              >
                <input
                  checked={draft.pricingMode === 'uniform'}
                  className="sr-only peer"
                  name="price_mode"
                  type="radio"
                  value="unified"
                  onChange={() => onDraftChange({ pricingMode: 'uniform' })}
                />
                <div className="w-5 h-5 mt-0.5 rounded-full bg-surface-container-lowest flex items-center justify-center peer-checked:bg-primary-container">
                  <div className="w-2 h-2 rounded-full bg-on-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-label-md text-on-surface font-semibold">
                    Use same base price across branches
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Single standard checkout price across Abuja branches.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-space-sm p-space-sm rounded-lg cursor-pointer transition-colors ${
                  draft.pricingMode === 'custom' ? 'bg-surface-tint-blue' : 'bg-surface-container-low'
                }`}
                id="labelPriceCustom"
              >
                <input
                  checked={draft.pricingMode === 'custom'}
                  className="sr-only peer"
                  name="price_mode"
                  type="radio"
                  value="custom"
                  onChange={() => onDraftChange({ pricingMode: 'custom' })}
                />
                <div className="w-5 h-5 mt-0.5 rounded-full bg-surface-container-high flex items-center justify-center peer-checked:bg-primary-container">
                  <div className="w-2 h-2 rounded-full bg-on-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-label-md text-on-surface font-semibold">
                    Customize prices per branch
                  </p>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Adjust for varying logistics, rent, or regional premiums.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="px-margin mb-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <Icon name="local_shipping" className="text-primary text-[20px]" />
                <span className="font-heading-sm text-heading-sm text-on-surface">Fulfillment &amp; Ordering</span>
              </div>
              <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full font-medium">
                Jumia / Jiji Ready
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mb-space-sm">
              Define how hyper-local shoppers receive this item.
            </p>
            <div className="space-y-space-sm">
              <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface cursor-pointer">
                <input
                  checked={pickup}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => setPickup((current) => !current)}
                />
                <div className="w-5 h-5 mt-0.5 rounded-md bg-surface-container-high peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                  <Icon className="text-on-primary text-[15px] font-bold" name="check" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      In-Store Pickup / Dine-In Walk
                    </span>
                    <span className="bg-badge-discount-bg text-badge-discount-text text-[11px] px-1.5 py-0.2 rounded font-medium">
                      Instant
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Customers pick up directly from active counters.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface cursor-pointer">
                <input
                  checked={delivery}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => setDelivery((current) => !current)}
                />
                <div className="w-5 h-5 mt-0.5 rounded-md bg-surface-container-high peer-checked:bg-primary-container flex items-center justify-center transition-colors">
                  <Icon className="text-on-primary text-[15px] font-bold" name="check" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Local Delivery / Express Dispatch
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-0.5">
                    Direct merchant courier rider, 30–45 mins within district perimeter.
                  </p>
                </div>
              </label>
              <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low opacity-60 cursor-not-allowed">
                <div className="w-5 h-5 mt-0.5 rounded-md bg-surface-container-high flex items-center justify-center">
                  <Icon name="block" className="text-outline-variant text-[14px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-text-secondary font-medium">
                      Nationwide Interstate Waybill
                    </span>
                    <span className="bg-error-container text-on-error-container text-[11px] px-1.5 py-0.2 rounded">
                      Perishable
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-0.5">
                    Unavailable for freshly prepared or temperature-sensitive goods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-margin mb-space-xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <Icon name="schedule" className="text-primary text-[20px]" />
                <span className="font-heading-sm text-heading-sm text-on-surface">Handling &amp; Prep Window</span>
              </div>
              <span className="font-caption text-caption text-text-secondary">Expected Lead</span>
            </div>
            <p className="font-caption text-caption text-text-secondary mb-space-sm">
              Time needed from order confirmation to rider handoff or customer collection.
            </p>
            <div className="grid grid-cols-3 gap-space-xs">
              {PREP_CHIPS.map((chip) => {
                const isActive = chip.range === selectedPrep.range;
                return (
                  <button
                    key={chip.range}
                    className={`prep-chip py-2.5 px-2 rounded-lg text-center transition-colors ${
                      isActive ? 'bg-surface-tint-blue' : 'bg-surface hover:bg-surface-container-low'
                    }`}
                    type="button"
                    onClick={() => onDraftChange({ prepWindow: chip.range })}
                  >
                    <p
                      className={`font-label-sm text-label-sm font-semibold ${
                        isActive ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {chip.title}
                    </p>
                    <span className={`font-caption text-[11px] ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                      {chip.sub}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-space-sm p-space-xs bg-surface-container-low rounded-lg flex items-center gap-space-xs text-text-secondary">
              <Icon name="info" className="text-[16px] text-primary" />
              <span className="font-caption text-caption">
                Selected window: <strong>Ready in {selectedPrep.label}</strong> for live dispatch.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/90 backdrop-blur-md px-margin py-space-sm shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        <div className="max-w-md mx-auto flex items-center gap-space-sm">
          <button
            className="h-[52px] px-space-md rounded-xl bg-surface-container-high text-on-surface font-button-secondary text-button-secondary active:scale-95 transition-all flex items-center justify-center"
            type="button"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="flex-1 h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2"
            type="button"
            onClick={onNext}
          >
            <span>Review &amp; Publish</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
