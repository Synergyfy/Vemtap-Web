import { useBusinessBranch } from '../context/BusinessBranchContext';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { ProductDraft } from './productDraft';
import { UserAvatar } from '../components/ui/UserAvatar';

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

const PREP_OPTIONS = [
  { value: 'Ready', label: 'Ready (Available immediately / On ground)', hint: 'Ready on ground for immediate customer pickup or dispatch' },
  { value: 'Up to 10 mins', label: 'Up to 10 mins', hint: 'Fast turnaround / Express preparation' },
  { value: 'Up to 30 mins', label: 'Up to 30 mins', hint: 'Standard preparation & packaging window' },
  { value: 'Up to 1 hour', label: 'Up to 1 hour', hint: 'Custom crafting or assembled order' },
  { value: 'More than 1 hour', label: 'More than 1 hour', hint: 'Made-to-order or extended fulfillment' },
];

export function BusinessAddProductStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddProductStep3ScreenProps) {
  // The business's real branches, keyed by branch id or key.
  const { branches: liveBranches } = useBusinessBranch();
  const selectableBranches: SelectableBranch[] = liveBranches
    .filter((branch) => Boolean(branch.id || branch.key))
    .map((branch) => ({
      key: (branch.id || branch.key) as string,
      name: branch.name,
      badge: branch.isMainBranch ? 'Main' : undefined,
      address: branch.area || 'No address on file',
      stock: 'Available at this branch',
    }));
  // Saved on the draft so it reaches the API; older drafts default to both.
  const pickup = draft.fulfillment?.pickup ?? true;
  const delivery = draft.fulfillment?.delivery ?? true;
  const setFulfillment = (patch: Partial<{ pickup: boolean; delivery: boolean }>) =>
    onDraftChange({ fulfillment: { pickup, delivery, ...patch } });

  const activeBranches = selectableBranches.filter((branch) => draft.branches[branch.key]);
  const allSelected = activeBranches.length === selectableBranches.length;

  const toggleAll = () => {
    const next: Record<string, boolean> = { ...draft.branches };
    selectableBranches.forEach((branch) => {
      next[branch.key] = !allSelected;
    });
    onDraftChange({ branches: next });
  };

  const selectedPrep = PREP_OPTIONS.find((opt) => opt.value === draft.prepWindow) ?? PREP_OPTIONS[0];

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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
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
              Select all ({selectableBranches.length} active)
            </button>
          </div>
          {selectableBranches.length === 0 && (
            <p className="bg-surface-container-lowest rounded-xl p-space-md font-caption text-caption text-text-secondary shadow-sm">
              No branches yet — add your business locations in your business profile, then they will appear here for
              this product.
            </p>
          )}
          {selectableBranches.map((branch) => {
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
                    Single standard checkout price across your selected branches.
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
                  onChange={() => setFulfillment({ pickup: !pickup })}
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
                  onChange={() => setFulfillment({ delivery: !delivery })}
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
              Time needed from order confirmation to customer pickup or delivery hand-off.
            </p>
            <div className="flex flex-col gap-space-xs">
              <div className="relative">
                <select
                  id="mobile-prep-window-select"
                  value={draft.prepWindow || 'Ready'}
                  onChange={(e) => onDraftChange({ prepWindow: e.target.value })}
                  className="w-full h-12 px-3.5 pr-10 rounded-xl border border-outline-variant/60 bg-surface text-on-surface font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                >
                  {PREP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <Icon name="expand_more" className="text-[20px]" />
                </div>
              </div>
              <div className="mt-1 p-space-xs bg-surface-container-low rounded-lg flex items-center gap-space-xs text-text-secondary">
                <Icon name="info" className="text-[16px] text-primary shrink-0" />
                <span className="font-caption text-caption">
                  {selectedPrep.hint}
                </span>
              </div>
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
