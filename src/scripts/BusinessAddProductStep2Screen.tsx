import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { getActiveVariants } from './productVariants';
import type { ProductDraft } from './productDraft';

interface BusinessAddProductStep2ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const parseNaira = (value: string) => parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

export function BusinessAddProductStep2Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessAddProductStep2ScreenProps) {
  const base = parseNaira(draft.basePrice);
  const cost = parseNaira(draft.costPrice);
  const compare = parseNaira(draft.comparePrice);
  const discount = compare - base;
  const margin = base > 0 ? Math.round(((base - cost) / base) * 100) : 0;
  const activeVariants = getActiveVariants(draft);
  const combinedStock = activeVariants.reduce(
    (total, variant) => total + (parseInt(variant.inventory, 10) || 0),
    0,
  );

  const removeVariant = (id: string) => {
    onDraftChange({ variants: draft.variants.filter((variant) => variant.id !== id) });
  };

  const addVariant = () => {
    onDraftChange({
      variants: [
        ...draft.variants,
        {
          id: `variant-${Date.now()}`,
          name: 'New Option',
          cut: 'Size',
          price: '0',
          inventory: '0',
        },
      ],
    });
  };

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
              Step 2 of 4
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
        <div className="px-margin pt-space-md pb-space-xs flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between text-on-surface-variant font-caption text-caption mb-1">
            <span className="font-label-md text-label-md font-semibold text-primary">Step 2 of 4</span>
            <span className="text-text-secondary font-medium">50% Completed</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full w-1/2 transition-all duration-500 ease-out" />
          </div>
        </div>

        <div className="px-margin pt-space-sm pb-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <h2 className="font-heading-lg text-heading-lg text-on-surface tracking-tight">
                Price, Variants &amp; Stock
              </h2>
              <p className="font-body-md text-body-md text-text-secondary mt-1">
                Set your regular selling price, sizes/options, and inventory quantity.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <Icon name="payments" className="text-[24px]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col px-margin gap-space-lg">
          <section className="flex flex-col gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex items-center gap-space-xs">
              <Icon name="sell" className="text-primary text-[20px]" />
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Standard Retail Pricing</h3>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between" htmlFor="regular-price">
                Regular Base Price
                <span className="text-primary font-caption text-caption">Required</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-heading-sm text-heading-sm text-text-primary select-none">₦</span>
                <input
                  className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-surface-subtle text-on-surface font-heading-sm text-heading-sm focus:outline-none focus:bg-surface-canvas shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all"
                  id="regular-price"
                  inputMode="numeric"
                  placeholder="0"
                  type="text"
                  value={draft.basePrice}
                  onChange={(event) => onDraftChange({ basePrice: event.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between" htmlFor="compare-price">
                Compare-at Price
                <span className="text-text-tertiary font-caption text-caption">Optional</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-heading-sm text-heading-sm text-text-secondary select-none">₦</span>
                <input
                  className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-surface-subtle text-text-secondary line-through font-body-lg text-body-lg focus:outline-none focus:bg-surface-canvas transition-all"
                  id="compare-price"
                  inputMode="numeric"
                  placeholder="0"
                  type="text"
                  value={draft.comparePrice}
                  onChange={(event) => onDraftChange({ comparePrice: event.target.value })}
                />
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-badge-discount-bg text-badge-discount-text w-fit mt-1">
                  <Icon name="local_offer" className="text-[16px]" />
                  <span className="font-caption text-caption font-semibold">
                    Shows ₦{discount.toLocaleString('en-US')} discount on normal listing
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-text-secondary" htmlFor="cost-per-item">
                  Cost per Item
                  <Icon className="text-[14px] align-middle text-text-tertiary" name="lock" />
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-body-md text-body-md text-text-secondary">₦</span>
                  <input
                    className="w-full h-[46px] pl-8 pr-3 rounded-lg bg-surface-subtle text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-canvas"
                    id="cost-per-item"
                    inputMode="numeric"
                    type="text"
                    value={draft.costPrice}
                    onChange={(event) => onDraftChange({ costPrice: event.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-md text-label-md text-text-secondary">Gross Margin</span>
                <div className="h-[46px] px-3.5 rounded-lg bg-surface-tint-blue flex items-center justify-between">
                  <span className="font-heading-sm text-heading-sm text-primary">{margin}%</span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-0.5">
                    <Icon name="trending_up" className="text-[14px]" /> Healthy
                  </span>
                </div>
              </div>
            </div>
            <p className="font-caption text-caption text-text-tertiary">
              Cost per item is strictly private to your shop reports and never displayed to shoppers.
            </p>
          </section>

          <section className="flex flex-col gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="tune" className="text-primary text-[20px]" />
                <div className="flex flex-col">
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Product Variants</h3>
                  <span className="font-caption text-caption text-text-secondary">
                    Sizes, cuts, colors or preparation styles
                  </span>
                </div>
              </div>
              <button
                aria-checked={draft.variantsEnabled}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors focus:outline-none ${
                  draft.variantsEnabled ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
                id="variant-toggle"
                role="switch"
                type="button"
                onClick={() => onDraftChange({ variantsEnabled: !draft.variantsEnabled })}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-surface shadow-md transform transition-transform ${
                    draft.variantsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {draft.variantsEnabled ? (
              <div className="flex flex-col gap-space-md pt-2" id="variant-section-body">
                <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-on-surface-variant">Active Option:</span>
                    <span className="font-button-secondary text-button-secondary text-primary font-semibold">
                      Portion Size / Cut
                    </span>
                  </div>
                  <button
                    className="font-caption text-caption text-text-secondary flex items-center gap-0.5 hover:text-primary transition-colors"
                    type="button"
                  >
                    <Icon name="edit" className="text-[16px]" /> Edit
                  </button>
                </div>
                <div className="flex flex-col gap-space-sm" id="variant-list">
                  {draft.variants.length === 0 && (
                    <div className="rounded-xl border border-dashed border-outline-variant bg-surface-subtle px-4 py-5 text-center">
                      <span className="font-label-md text-label-md text-text-secondary">
                        No variants yet — add your first option below.
                      </span>
                    </div>
                  )}
                  {draft.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex flex-col p-space-sm rounded-xl bg-surface-subtle gap-space-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {variant.name} ({variant.cut})
                          </span>
                        </div>
                        <button
                          aria-label={`Remove ${variant.name}`}
                          className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-error transition-colors"
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-space-xs pt-1">
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-secondary mb-1">Variant Price (₦)</span>
                          <div className="h-10 px-3 rounded-lg bg-surface-container-lowest flex items-center shadow-sm">
                            <span className="font-label-md text-label-md text-on-surface font-medium">
                              {variant.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-caption text-caption text-text-secondary mb-1">Inventory Qty</span>
                          <div className="h-10 px-3 rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-sm">
                            <span className="font-label-md text-label-md text-on-surface font-medium">
                              {variant.inventory}
                            </span>
                            <span className="font-caption text-caption text-text-tertiary">units</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full h-12 rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 hover:bg-surface-container active:scale-[0.99] transition-all"
                  type="button"
                  onClick={addVariant}
                >
                  <Icon name="add_circle" className="text-[20px]" />+ Add Another Option / Variant
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-surface-subtle p-4 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="inventory_2" className="text-[20px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Sold as a single standard item
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    Customers will see one price and one stock count. Variants are switched off.
                    {draft.variants.length > 0
                      ? ` Your ${draft.variants.length} saved option${draft.variants.length === 1 ? '' : 's'} will be kept and restored if you switch this back on.`
                      : ''}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="inventory_2" className="text-primary text-[20px]" />
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Inventory &amp; SKU</h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                Auto-synced
              </div>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <Icon name="production_quantity_limits" className="text-[22px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">
                    {draft.variantsEnabled ? 'Combined Variant Stock' : 'Standard Product Stock'}
                  </span>
                  <span className="font-heading-sm text-heading-sm text-on-surface">
                    {draft.variantsEnabled ? `${combinedStock} units available` : 'Single item — no variants'}
                  </span>
                </div>
              </div>
              <Icon name="check_circle" className="text-text-tertiary text-[20px]" />
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between" htmlFor="sku-code">
                SKU / Barcode
                <span className="text-text-tertiary font-caption text-caption">Optional</span>
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md uppercase tracking-wider focus:outline-none focus:bg-surface-canvas"
                  id="sku-code"
                  placeholder="e.g. PRD-001"
                  type="text"
                  value={draft.skuCode}
                  onChange={(event) => onDraftChange({ skuCode: event.target.value })}
                />
                <button
                  aria-label="Scan barcode"
                  className="absolute right-3 w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary"
                  type="button"
                >
                  <Icon name="barcode_scanner" className="text-[20px]" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="low-stock">
                Low Stock Alert Threshold
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-[52px] px-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-canvas"
                  id="low-stock"
                  type="number"
                  value={draft.lowStock}
                  onChange={(event) => onDraftChange({ lowStock: event.target.value })}
                />
                <span className="absolute right-4 font-caption text-caption text-text-tertiary">units</span>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Receive WhatsApp &amp; In-app notification when stock drops below this number.
              </span>
            </div>
            <div className="flex items-center justify-between pt-space-xs">
              <div className="flex flex-col pr-4">
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  Continue selling when out of stock
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Orders will still be accepted for backorder or pre-prep
                </span>
              </div>
              <button
                aria-checked={draft.backorder}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors focus:outline-none shrink-0 ${
                  draft.backorder ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
                id="backorder-toggle"
                role="switch"
                type="button"
                onClick={() => onDraftChange({ backorder: !draft.backorder })}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-surface shadow-md transform transition-transform ${
                    draft.backorder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </section>

          <div className="p-space-sm rounded-xl bg-surface-tint-blue flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 text-primary">
              <Icon name="verified" className="text-[18px]" />
            </div>
            <p className="font-caption text-caption text-on-secondary-container">
              Products with clear variant options like <span className="font-semibold text-primary">Portion Size</span>{' '}
              convert up to 2.4x higher on local search.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-margin py-4 pb-safe flex flex-col gap-2">
        <button
          className="w-full h-[52px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all"
          type="button"
          onClick={onNext}
        >
          <span>Continue to Branch Availability</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
        <button
          className="w-full h-11 rounded-xl text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
          type="button"
          onClick={onBack}
        >
          Back to Step 1
        </button>
      </div>
    </AppScreen>
  );
}
