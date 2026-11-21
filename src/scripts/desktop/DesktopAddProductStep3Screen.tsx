import { useBusinessBranch } from '../../context/BusinessBranchContext';
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

const PREP_WINDOWS: Array<{ value: string; label: string; hint: string }> = [
  { value: 'Ready', label: 'Ready (Available immediately / On ground)', hint: 'Ready on ground for immediate customer pickup or dispatch' },
  { value: 'Up to 10 mins', label: 'Up to 10 mins', hint: 'Fast turnaround / Express preparation' },
  { value: 'Up to 30 mins', label: 'Up to 30 mins', hint: 'Standard preparation & packaging window' },
  { value: 'Up to 1 hour', label: 'Up to 1 hour', hint: 'Custom crafting or assembled order' },
  { value: 'More than 1 hour', label: 'More than 1 hour', hint: 'Made-to-order or extended fulfillment' },
];

export function DesktopAddProductStep3Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onNav,
}: DesktopAddProductStep3ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  // Saved on the draft so it reaches the API; older drafts default to both.
  const pickup = draft.fulfillment?.pickup ?? true;
  const delivery = draft.fulfillment?.delivery ?? true;
  const setFulfillment = (patch: Partial<{ pickup: boolean; delivery: boolean }>) =>
    onDraftChange({ fulfillment: { pickup, delivery, ...patch } });

  // The business's real branches, keyed by branch id. Demo branches have no id
  // and are never shown here.
  const { branches: liveBranches } = useBusinessBranch();
  const activeBranches = liveBranches
    .filter((branch) => branch.id)
    .map((branch) => ({
      key: branch.id as string,
      name: branch.name,
      badge: branch.isMainBranch ? 'Main' : 'Branch',
      badgeClass: branch.isMainBranch
        ? 'bg-badge-discount-bg text-badge-discount-text'
        : 'bg-surface-container text-text-secondary',
      address: branch.area || 'No address on file',
      units: 'Available at this branch',
      price: draft.basePrice ? `₦${draft.basePrice}` : 'Base price not set',
    }));

  const previewBranches = activeBranches
    .filter((branch) => draft.branches[branch.key])
    .map((branch) => ({ key: branch.key, name: branch.name, detail: branch.address, price: branch.price }));
  const previewImage = draft.mainImage;
  const previewTitle = draft.title || 'Untitled product';
  const previewCategory = draft.primaryCategory || 'No category yet';

  const toggleBranch = (key: string, checked: boolean) => {
    onDraftChange({ branches: { ...draft.branches, [key]: checked } });
  };

  const selectAllActive = () => {
    onDraftChange({
      branches: { ...draft.branches, ...Object.fromEntries(activeBranches.map((branch) => [branch.key, true])) },
    });
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
                  Select All Active ({activeBranches.length})
                </button>
              </div>
              {activeBranches.length === 0 && (
                <p className="bg-surface-subtle rounded-xl p-space-md font-caption text-caption text-text-secondary">
                  No branches yet — add your business locations in your business profile, then they will appear here for
                  this product.
                </p>
              )}
              <div className="flex flex-col gap-space-sm">
                {activeBranches.map((branch) => (
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
                        Single standard checkout price across your selected branches.
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
                    <span>
                      Active: {activeBranches.filter((branch) => draft.branches[branch.key]).length} custom branch tiers
                    </span>
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
              </div>
              <div className="flex flex-col gap-space-sm">
                <label className="flex items-start justify-between p-space-md rounded-xl bg-surface-subtle hover:bg-surface-tint-blue/40 transition-colors cursor-pointer">
                  <div className="flex items-start gap-space-sm">
                    <input
                      type="checkbox"
                      checked={pickup}
                      onChange={(event) => setFulfillment({ pickup: event.target.checked })}
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
                      onChange={(event) => setFulfillment({ delivery: event.target.checked })}
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
                    Expected preparation &amp; fulfillment duration before customer pickup or delivery hand-off.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs">
                <label htmlFor="desktop-prep-window-select" className="font-label-md text-label-md text-text-primary font-medium">
                  Preparation Duration
                </label>
                <div className="relative">
                  <select
                    id="desktop-prep-window-select"
                    value={draft.prepWindow || 'Ready'}
                    onChange={(e) => onDraftChange({ prepWindow: e.target.value })}
                    className="w-full h-12 px-4 pr-10 rounded-xl border border-outline-variant/60 bg-surface-canvas text-text-primary font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {PREP_WINDOWS.map((window) => (
                      <option key={window.value} value={window.value}>
                        {window.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                    <Icon name="expand_more" className="text-[20px]" />
                  </div>
                </div>
                {(() => {
                  const currentWindow = PREP_WINDOWS.find((w) => w.value === (draft.prepWindow || 'Ready'));
                  return currentWindow ? (
                    <div className="flex items-center gap-1.5 text-caption font-caption text-text-secondary pt-0.5">
                      <Icon name="info" className="text-[15px] text-primary shrink-0" />
                      <span>{currentWindow.hint}</span>
                    </div>
                  ) : null;
                })()}
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
                {previewImage ? (
                  <img className="w-14 h-14 rounded-lg object-cover" alt={previewTitle} src={previewImage} />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Icon name="inventory_2" className="text-[24px]" />
                  </div>
                )}
                <div className="min-w-0">
                  {draft.sku && (
                    <span className="font-caption text-caption text-primary font-semibold block">Item #{draft.sku}</span>
                  )}
                  <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate">{previewTitle}</h4>
                  <span className="font-caption text-caption text-text-secondary">Category: {previewCategory}</span>
                </div>
              </div>
              <div className="space-y-space-xs">
                {previewBranches.length === 0 && (
                  <p className="p-space-sm rounded-lg bg-surface-subtle font-caption text-caption text-text-secondary">
                    Select branches above to see them here.
                  </p>
                )}
                {previewBranches.map((previewBranch) => (
                  <div
                    key={previewBranch.key}
                    className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between gap-space-sm"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {previewBranch.name}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">{previewBranch.detail}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{previewBranch.price}</span>
                      <span className="font-caption text-caption text-primary block">Selected branch</span>
                    </div>
                  </div>
                ))}
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
