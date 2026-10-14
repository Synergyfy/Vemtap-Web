import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopAddProductStep2ScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const parseNaira = (value: string) => {
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatNaira = (value: number) =>
  `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatWhole = (value: number) => `₦${Math.round(value).toLocaleString('en-US')}`;

export function DesktopAddProductStep2Screen({
  draft,
  onDraftChange,
  onBack,
  onNext,
  onNav,
}: DesktopAddProductStep2ScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const base = parseNaira(draft.basePrice);
  const cost = parseNaira(draft.costPrice);
  const compare = parseNaira(draft.comparePrice);
  const discount = compare - base;
  const grossMargin = base > 0 ? Math.round(((base - cost) / base) * 100) : 0;
  const vat = base * 0.075;
  const net = base - cost - vat;
  const costShare = base > 0 ? (cost / base) * 100 : 0;
  const vatShare = base > 0 ? (vat / base) * 100 : 0;
  const netShare = base > 0 ? (net / base) * 100 : 0;
  const netMargin = netShare;
  const totalUnits = draft.variants.reduce((sum, variant) => sum + (parseInt(variant.inventory, 10) || 0), 0);

  const updateVariant = (id: string, patch: Partial<ProductDraft['variants'][number]>) => {
    onDraftChange({
      variants: draft.variants.map((variant) => (variant.id === id ? { ...variant, ...patch } : variant)),
    });
  };

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
          cut: 'Custom Cut',
          price: '0',
          inventory: '0',
        },
      ],
    });
  };

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Step 3 of 4: Offerings &amp; Catalog Setup
              </span>
              <span className="font-caption text-caption text-text-tertiary">•</span>
              <span className="font-caption text-caption text-text-secondary">Catalog Management</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              Step 2 of 4: Price, Variants &amp; Stock
            </h1>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Configure pricing economics, multi-portion sizes, and real-time inventory tracking for Lagos branches.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 min-w-[220px]">
            <div className="flex items-center justify-between w-full font-caption text-caption text-text-secondary">
              <span className="font-medium text-text-primary">Sub-step 2 of 4</span>
              <span className="font-semibold text-primary">50% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '50%' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <section className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-sm pb-space-xs">
                <div>
                  <div className="flex items-center gap-space-2xs text-primary">
                    <Icon name="payments" className="text-[20px]" />
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Base Economics
                    </span>
                  </div>
                  <h2 className="font-heading-md text-heading-md text-text-primary mt-1">Standard Retail Pricing</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Define customer-facing prices and base costs across Nigerian consumer channels.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shadow-sm">
                  <Icon name="local_offer" className="text-[14px]" />
                  Active Promotion
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary flex items-center justify-between" htmlFor="inputBasePrice">
                    <span>
                      Customer Base Price <span className="text-error">*</span>
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">NGN (₦)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-heading-sm text-heading-sm text-text-tertiary font-semibold select-none">
                      ₦
                    </span>
                    <input
                      id="inputBasePrice"
                      type="text"
                      value={draft.basePrice}
                      onChange={(event) => onDraftChange({ basePrice: event.target.value })}
                      className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-surface-subtle font-heading-sm text-heading-sm text-text-primary focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Standard price displayed on checkout &amp; tap orders.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary flex items-center justify-between" htmlFor="inputComparePrice">
                    <span>Compare-at Price</span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">Strikethrough</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-heading-sm text-heading-sm text-text-tertiary font-semibold select-none">
                      ₦
                    </span>
                    <input
                      id="inputComparePrice"
                      type="text"
                      value={draft.comparePrice}
                      onChange={(event) => onDraftChange({ comparePrice: event.target.value })}
                      className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-surface-subtle font-heading-sm text-heading-sm text-text-secondary line-through focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-1.5 text-badge-discount-text font-caption text-caption">
                      <Icon name="verified" className="text-[16px]" />
                      <span>Shows {formatWhole(discount)} discount on normal listing</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <label className="font-label-md text-label-md text-text-primary" htmlFor="inputCostPrice">
                      Cost per Item
                    </label>
                    <span title="Only visible to merchant staff" className="flex items-center">
                      <Icon name="lock" className="text-[16px] text-text-tertiary cursor-pointer" />
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-variant font-caption text-caption text-on-surface-variant">
                      Private to shop
                    </span>
                  </div>
                  <div className="relative max-w-xs flex items-center mt-1">
                    <span className="absolute left-3.5 font-label-md text-label-md text-text-tertiary font-medium">
                      ₦
                    </span>
                    <input
                      id="inputCostPrice"
                      type="text"
                      value={draft.costPrice}
                      onChange={(event) => onDraftChange({ costPrice: event.target.value })}
                      className="w-full h-[44px] pl-9 pr-3 rounded-lg bg-surface-canvas font-label-md text-label-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-space-md bg-surface-canvas px-space-md py-3 rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                    <Icon name="trending_up" className="text-[22px]" />
                  </div>
                  <div>
                    <span className="font-caption text-caption text-text-secondary block">Calculated Gross Margin</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-heading-sm text-heading-sm text-badge-discount-text font-bold">
                        {grossMargin}%
                      </span>
                      <span className="text-text-tertiary text-xs">•</span>
                      <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Healthy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-sm pb-space-xs">
                <div>
                  <div className="flex items-center gap-space-2xs text-primary">
                    <Icon name="layers" className="text-[20px]" />
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Configuration Matrix
                    </span>
                  </div>
                  <h2 className="font-heading-md text-heading-md text-text-primary mt-1">
                    Product Variants &amp; Portion Sizes
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Allow customers to choose dining portion, cut thickness, or custom preparation packs.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    id="variantToggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={draft.variantsEnabled}
                    onChange={(event) => onDraftChange({ variantsEnabled: event.target.checked })}
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-canvas after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  <span className="ml-3 font-label-md text-label-md text-text-primary font-medium hidden sm:inline">
                    Active
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between bg-surface-subtle p-3.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Active Option:
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center gap-1.5">
                    <Icon name="restaurant" className="text-[16px]" />
                    Portion Size / Cut
                  </span>
                </div>
                <button
                  type="button"
                  className="font-caption text-caption text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Icon name="edit" className="text-[15px]" />
                  Modify Dimension
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[560px] flex flex-col gap-2.5">
                  <div className="grid grid-cols-12 gap-3 px-4 py-2 font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    <div className="col-span-4">Portion Name</div>
                    <div className="col-span-3">Retail Price (₦)</div>
                    <div className="col-span-3">Branch Inventory</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>
                  {draft.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-12 gap-3 items-center bg-surface-subtle hover:bg-surface-container-low transition-colors p-3 rounded-xl"
                    >
                      <div className="col-span-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-text-secondary shadow-sm">
                          <Icon name="scale" className="text-[18px]" />
                        </div>
                        <div>
                          <span className="font-label-md text-label-md text-text-primary font-semibold block leading-tight">
                            {variant.name}
                          </span>
                          <span className="font-caption text-caption text-text-secondary">{variant.cut}</span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-text-tertiary font-label-md text-label-md">₦</span>
                          <input
                            type="text"
                            value={variant.price}
                            onChange={(event) => updateVariant(variant.id, { price: event.target.value })}
                            className="w-full h-10 pl-7 pr-2.5 rounded-lg bg-surface-canvas font-label-md text-label-md text-text-primary font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={variant.inventory}
                            onChange={(event) => updateVariant(variant.id, { inventory: event.target.value })}
                            className="w-20 h-10 px-2.5 rounded-lg bg-surface-canvas font-label-md text-label-md text-text-primary font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                          />
                          <span className="font-caption text-caption text-text-secondary">units</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-colors"
                        >
                          <Icon name="drag_indicator" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/40 transition-colors"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-button-secondary text-button-secondary font-semibold transition-colors"
                >
                  <Icon name="add_circle" className="text-[20px]" />
                  + Add Another Option / Variant
                </button>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-sm pb-space-xs">
                <div>
                  <div className="flex items-center gap-space-2xs text-primary">
                    <Icon name="inventory_2" className="text-[20px]" />
                    <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                      Stock Ledger
                    </span>
                  </div>
                  <h2 className="font-heading-md text-heading-md text-text-primary mt-1">
                    Inventory &amp; SKU Management
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Real-time depletion tracking across in-store walk-ins and delivery orders.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {totalUnits} units available
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary flex items-center justify-between" htmlFor="sku-barcode">
                    <span>SKU / Merchant Barcode</span>
                    <span className="font-caption text-caption text-text-tertiary">Optional</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="sku-barcode"
                      type="text"
                      value={draft.skuCode}
                      onChange={(event) => onDraftChange({ skuCode: event.target.value })}
                      className="w-full h-[52px] pl-4 pr-12 rounded-xl bg-surface-subtle font-label-md text-label-md text-text-primary font-semibold tracking-wide focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                    <button
                      type="button"
                      title="Scan physical barcode"
                      className="absolute right-3 w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="barcode_scanner" className="text-[20px]" />
                    </button>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Unique inventory code for thermal receipt printouts.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary flex items-center justify-between" htmlFor="low-stock">
                    <span>Low Stock Threshold</span>
                    <span className="font-caption text-caption text-tertiary font-medium">Critical</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="low-stock"
                      type="text"
                      value={draft.lowStock}
                      onChange={(event) => onDraftChange({ lowStock: event.target.value })}
                      className="w-full h-[52px] px-4 pr-24 rounded-xl bg-surface-subtle font-label-md text-label-md text-text-primary font-semibold focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-11 font-label-md text-label-md text-text-tertiary font-medium">
                      units
                    </span>
                    <Icon
                      name="notifications_active"
                      className="absolute right-4 text-text-tertiary text-[20px]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
                    <Icon name="chat" className="text-[16px] text-badge-discount-text" />
                    <span>Automated WhatsApp alert sent to branch manager when reached.</span>
                  </div>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-md rounded-xl flex items-center justify-between gap-space-md mt-space-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                    <Icon name="all_inclusive" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-text-primary font-semibold block">
                      Continue selling when out of stock
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Accept pre-orders or backorder for kitchen preparation batches
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={draft.backorder}
                    onChange={(event) => onDraftChange({ backorder: event.target.checked })}
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-canvas after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-24">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="calculate" className="text-[18px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Profit &amp; Pricing Calculator</h3>
                </div>
                <span className="font-caption text-caption text-text-secondary">Live Audit</span>
              </div>
              <div className="p-3 bg-surface-subtle rounded-xl flex items-center gap-3">
                <svg className="w-14 h-14 shrink-0 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-secondary stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray={`${costShare.toFixed(1)}, 100`}
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-badge-discount-text stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray={`${netShare.toFixed(1)}, 100`}
                    strokeDashoffset={`-${costShare.toFixed(1)}`}
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-primary stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray={`${vatShare.toFixed(1)}, 100`}
                    strokeDashoffset={`-${(costShare + netShare).toFixed(1)}`}
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <span className="font-caption text-caption text-text-secondary">Expected Net Take-home</span>
                  <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                    {formatWhole(net)} / item
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    After VAT &amp; standard cost
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 font-label-md text-label-md pt-1">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Avg. Unit Retail</span>
                  <span className="font-semibold text-text-primary">{formatNaira(base)}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span className="flex items-center gap-1">
                    COGS (Cost of Goods)
                    <Icon name="info" className="text-[14px] text-text-tertiary" />
                  </span>
                  <span className="font-semibold text-text-primary">- {formatNaira(cost)}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span className="flex items-center gap-1">Gross Contribution</span>
                  <span className="font-semibold text-badge-discount-text">+ {formatNaira(base - cost)}</span>
                </div>
                <div className="w-full h-px bg-surface-container my-1" />
                <div className="flex justify-between items-center text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Nigerian VAT (7.5%)
                  </span>
                  <span className="font-semibold text-text-primary">{formatNaira(vat)}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Estimated Net Margin</span>
                  <span className="font-bold text-text-primary">{netMargin.toFixed(1)}%</span>
                </div>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg font-caption text-caption text-text-secondary">
                <span className="font-semibold text-text-primary">FIRS Statutory Preview:</span> Invoices generated will
                automatically separate the 7.5% VAT element for Nigerian tax clearance filing.
              </div>
            </div>

            <div className="bg-gradient-to-br from-surface-tint-blue via-surface-container to-surface-canvas rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-primary">
                <Icon name="bolt" className="text-[20px]" />
                <span className="font-label-md text-label-md font-bold uppercase tracking-wider">
                  Merchant Growth Insight
                </span>
              </div>
              <p className="font-body-md text-body-md text-text-primary font-medium leading-snug">
                &quot;Products with clear variant options like{' '}
                <span className="text-primary font-semibold">Portion Size</span> convert up to{' '}
                <span className="font-bold text-badge-discount-text">2.4x higher</span> on local Lagos food search.
                &quot;
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 font-caption text-caption text-text-secondary">
                  <Icon name="query_stats" className="text-[15px] text-badge-discount-text" />
                  Based on Q3 VEMTAP Retail Insights
                </span>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl shadow-md p-space-md flex flex-col gap-3">
              <button
                type="button"
                onClick={onNext}
                className="w-full h-[52px] rounded-xl bg-primary hover:bg-on-primary-fixed-variant active:scale-[0.99] text-on-primary font-button-primary text-button-primary shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Continue to Branch Availability</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full h-[46px] rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 transition-colors"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                <span>Back to Step 1: Basic Info</span>
              </button>
              <div className="text-center mt-1">
                <span className="font-caption text-caption text-text-tertiary">All edits auto-saved to cloud draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
