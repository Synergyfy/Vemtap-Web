import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import { MerchantShell } from './MerchantShell';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import type { ProductDraft } from './desktopProductDraft';

interface DesktopProductPricingConfigScreenProps {
  draft: ProductDraft;
  onDraftChange: (patch: Partial<ProductDraft>) => void;
  onSaved: () => void;
  onCancel: () => void;
  onNav?: (key: BusinessPortalNavKey) => void;
}

const PRODUCT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzMe_A4mcVo8v5fFkG6ivg71_I-QcCjIrQsdVUG-zBgm5fHqwDiE0aJcauKynYuk_TUeafMkmb3u2JgcYtR6l61zMKyaqPeYzMDHXqk-3YgOqxMIIV7ufMrTfAHtzHPxsWdYHoOwXwXbPCvxmAmR3CA9txhKJ1YRI9x3TtO7amlnDfRKe4dKqcd_3s92SJ87S_80hfjpNSbtAl-klD5fYjE2vDGoXURX6tosEUVIXt';

const PRODUCT_IMAGE_ALT =
  'Exquisite artisanal dry aged ribeye steak sizzling on woodfire grill with charred herb crust, rosemary springs, and melted garlic butter glistening in warm editorial restaurant lighting with deep brand tones';

export function DesktopProductPricingConfigScreen({
  draft,
  onDraftChange,
  onSaved,
  onCancel,
  onNav,
}: DesktopProductPricingConfigScreenProps) {
  const Shell = onNav ? MerchantShell : BusinessSetupChrome;
  const [inStock, setInStock] = useState(true);
  const [wusePrice, setWusePrice] = useState('12,000');
  const [garkiPrice, setGarkiPrice] = useState('12,500');

  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;

  const toggleBranch = (key: string, checked: boolean) => {
    onDraftChange({ branches: { ...draft.branches, [key]: checked } });
  };

  const uniformSelected = draft.pricingMode === 'uniform';
  const perBranchSelected = draft.pricingMode === 'custom';

  return (
    <Shell activeNav="catalog" onNav={onNav}>
      <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="flex items-center gap-space-2xs">
                <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
              </div>
              <span className="font-label-md text-label-md text-primary font-semibold tracking-wide uppercase">
                Step 3 of 4: New Product Location Setup
              </span>
              <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption">
                <Icon name="verified" className="text-[14px]" />
                Draft Auto-saved
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Add Product &amp; Location Pricing
            </h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
              Define product details, select branch availability, and configure location-specific pricing for
              maximum margin across regional stores.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button
              type="button"
              className="px-space-md py-space-xs rounded-lg font-button-secondary text-button-secondary text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="save" className="text-[20px]" />
              Save as Draft
            </button>
            <div className="h-8 w-px bg-surface-container-high hidden md:block" />
            <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-lg bg-surface-tint-blue text-primary font-label-sm text-label-sm">
              <Icon name="storefront" className="text-[18px]" />
              <span>Abuja Territory (3 Branches)</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Icon name="inventory_2" className="text-[20px]" />
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">General Details (Core Item)</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">SKU: VEM-NG-RB-094</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-space-lg items-start">
                <div className="relative group w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container shadow-inner">
                  <img
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    alt={PRODUCT_IMAGE_ALT}
                    src={PRODUCT_IMAGE}
                  />
                  <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-on-primary">
                    <Icon name="photo_camera" className="text-[24px]" />
                    <span className="font-caption text-caption font-semibold">Change</span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-text-primary/80 text-on-primary font-caption text-[10px]">
                    1080×1080
                  </span>
                </div>
                <div className="flex-1 w-full flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-label-md text-label-md text-text-primary">woodfire-ribeye-final.jpg</p>
                      <p className="font-caption text-caption text-text-tertiary">
                        JPEG Format • 1.4 MB • High Resolution
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-space-sm py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-label-sm text-label-sm transition-colors flex items-center gap-1"
                    >
                      <Icon name="upload_file" className="text-[16px]" />
                      Change Photo
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-text-primary font-medium"
                      htmlFor="product-name"
                    >
                      Product Name <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-[52px] rounded-xl px-space-md bg-surface-container-low text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.15)] transition-all"
                        id="product-name"
                        type="text"
                        value={draft.title}
                        onChange={(event) => onDraftChange({ title: event.target.value })}
                      />
                      <Icon
                        name="check_circle"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary text-[20px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-text-primary font-medium"
                    htmlFor="category-select"
                  >
                    Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-[52px] rounded-xl px-space-md pr-10 bg-surface-container-low text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none appearance-none transition-all cursor-pointer"
                      id="category-select"
                      defaultValue="Grill & Steaks"
                    >
                      <option>Grill &amp; Steaks</option>
                      <option>Entrees &amp; Mains</option>
                      <option>Chef's Signature Specials</option>
                      <option>Artisanal Platters</option>
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[22px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-text-primary font-medium"
                    htmlFor="prep-time"
                  >
                    Estimated Kitchen Preparation
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-[52px] rounded-xl px-space-md bg-surface-container-low text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none transition-all"
                      id="prep-time"
                      type="text"
                      defaultValue="25 - 30 Minutes"
                    />
                    <Icon
                      name="timer"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label
                    className="font-label-md text-label-md text-text-primary font-medium"
                    htmlFor="product-description"
                  >
                    Description
                  </label>
                  <span className="font-caption text-caption text-text-tertiary">
                    {draft.description.length} / 300 characters
                  </span>
                </div>
                <textarea
                  className="w-full rounded-xl p-space-md bg-surface-container-low text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.15)] transition-all resize-none"
                  id="product-description"
                  rows={3}
                  value={draft.description}
                  onChange={(event) => onDraftChange({ description: event.target.value })}
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Icon name="hub" className="text-[20px]" />
                  </span>
                  <div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">
                      Where is this product available?
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Assigned branches can immediately accept orders upon activation.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-space-sm py-1 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm">
                  {activeBranchCount} of 3 Branches Active
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="pt-0.5">
                    <input
                      className="w-5 h-5 rounded text-primary-container focus:ring-primary-container accent-primary-container cursor-pointer"
                      type="checkbox"
                      checked={Boolean(draft.branches.wuse)}
                      onChange={(event) => toggleBranch('wuse', event.target.checked)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading-sm text-[16px] text-text-primary">Wuse Branch</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-[11px] font-medium tracking-wide">
                          PRIMARY KITCHEN
                        </span>
                      </div>
                      <span className="font-body-md text-[14px] text-text-secondary mt-0.5">
                        Plot 1428 Adetokunbo Ademola Cres, Wuse II, Abuja
                      </span>
                      <div className="flex items-center gap-space-sm mt-1.5">
                        <span className="font-caption text-caption text-badge-discount-text flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Full Line Inventory
                        </span>
                        <span className="font-caption text-caption text-text-tertiary">• Instant Dispatch</span>
                      </div>
                    </div>
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="font-label-sm text-label-sm text-primary font-semibold">Ready for Sync</span>
                      <span className="font-caption text-caption text-text-tertiary">Pos terminal #01</span>
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="pt-0.5">
                    <input
                      className="w-5 h-5 rounded text-primary-container focus:ring-primary-container accent-primary-container cursor-pointer"
                      type="checkbox"
                      checked={Boolean(draft.branches.garki)}
                      onChange={(event) => toggleBranch('garki', event.target.checked)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading-sm text-[16px] text-text-primary">Garki Branch</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-caption text-[11px] font-medium">
                          HUB #2
                        </span>
                      </div>
                      <span className="font-body-md text-[14px] text-text-secondary mt-0.5">
                        Suite 4B, Garki Mall, Area 11, Garki, Abuja
                      </span>
                      <div className="flex items-center gap-space-sm mt-1.5">
                        <span className="font-caption text-caption text-badge-discount-text flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Woodfire Grill
                          Station
                        </span>
                        <span className="font-caption text-caption text-tertiary font-medium">
                          + Logistics Surcharge Applicable
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="font-label-sm text-label-sm text-primary font-semibold">Ready for Sync</span>
                      <span className="font-caption text-caption text-text-tertiary">Pos terminal #04</span>
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-subtle opacity-70 hover:opacity-100 transition-all cursor-not-allowed group">
                  <div className="pt-0.5">
                    <input
                      className="w-5 h-5 rounded text-primary-container focus:ring-primary-container accent-primary-container cursor-not-allowed"
                      type="checkbox"
                      disabled
                      checked={Boolean(draft.branches.maitama)}
                      onChange={() => toggleBranch('maitama', false)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading-sm text-[16px] text-text-primary">Maitama Branch</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-tertiary font-caption text-[11px] font-medium">
                          COMING SOON
                        </span>
                      </div>
                      <span className="font-body-md text-[14px] text-text-secondary mt-0.5">
                        Transcorp Boulevard Walk, Maitama Phase 1, Abuja
                      </span>
                      <span className="font-caption text-caption text-text-tertiary mt-1">
                        Currently fitting commercial kitchen extraction system
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-caption text-caption text-outline font-medium">Deployment Q2 2025</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                  <Icon name="check_box" className="text-[24px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading-sm text-[16px] text-text-primary">In Stock &amp; Ready for Orders</span>
                  <span className="font-caption text-caption text-text-secondary">
                    Disable this toggle anytime to temporarily pause customer ordering across all branches.
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={inStock}
                onClick={() => setInStock((value) => !value)}
                className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center shadow-sm cursor-pointer ${
                  inStock ? 'bg-primary-container justify-end' : 'bg-outline-variant justify-start'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-surface-canvas shadow-md transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-xl sticky top-24">
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Icon name="payments" className="text-[20px]" />
                  </span>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Pricing Configuration</h2>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold">
                  Per-Branch Mode
                </span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <label
                  className={`flex items-start gap-space-sm p-space-sm rounded-xl transition-colors cursor-pointer ${
                    uniformSelected ? 'bg-surface-tint-blue shadow-sm' : 'bg-surface-subtle hover:bg-surface-container'
                  }`}
                >
                  <input
                    className="mt-1 w-4 h-4 text-primary-container accent-primary-container cursor-pointer"
                    name="pricing-mode"
                    type="radio"
                    checked={uniformSelected}
                    onChange={() => onDraftChange({ pricingMode: 'uniform' })}
                  />
                  <div className="flex flex-col">
                    <span
                      className={`font-label-md text-label-md ${
                        uniformSelected ? 'text-primary font-semibold' : 'text-text-primary'
                      }`}
                    >
                      Use the same price at all selected locations
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Applies an identical base rate regardless of location logistics.
                    </span>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-space-sm p-space-md rounded-xl transition-colors cursor-pointer ${
                    perBranchSelected
                      ? 'bg-surface-tint-blue shadow-sm'
                      : 'bg-surface-subtle hover:bg-surface-container'
                  }`}
                >
                  <input
                    className="mt-1 w-4 h-4 text-primary-container accent-primary-container cursor-pointer"
                    name="pricing-mode"
                    type="radio"
                    checked={perBranchSelected}
                    onChange={() => onDraftChange({ pricingMode: 'custom' })}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`font-label-md text-label-md ${
                          perBranchSelected ? 'text-primary font-semibold' : 'text-text-primary'
                        }`}
                      >
                        Set different prices per location
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Optimal for varying logistics surcharges, differing procurement freight, or prime mall tenant
                      rents.
                    </span>
                  </div>
                </label>
              </div>
              <div className="flex flex-col gap-space-md pt-space-xs">
                <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider font-semibold">
                  Active Location Tariffs
                </span>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="restaurant" className="text-primary text-[18px]" />
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Wuse Branch
                      </span>
                    </div>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">
                      Standard Kitchen Margin (68%)
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading-sm text-[16px] text-text-secondary font-semibold">
                      ₦
                    </span>
                    <input
                      className="w-full h-[52px] pl-10 pr-space-md rounded-xl bg-surface-canvas text-text-primary font-heading-sm text-heading-sm tracking-tight focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.15)] transition-all"
                      type="text"
                      value={wusePrice}
                      onChange={(event) => setWusePrice(event.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-caption text-caption text-text-tertiary">
                      Base Menu Rate
                    </span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="local_mall" className="text-primary text-[18px]" />
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Garki Branch
                      </span>
                    </div>
                    <span className="font-caption text-caption text-tertiary font-medium">
                      +₦500 Mall Logistic Adj.
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading-sm text-[16px] text-text-secondary font-semibold">
                      ₦
                    </span>
                    <input
                      className="w-full h-[52px] pl-10 pr-space-md rounded-xl bg-surface-canvas text-text-primary font-heading-sm text-heading-sm tracking-tight focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.15)] transition-all"
                      type="text"
                      value={garkiPrice}
                      onChange={(event) => setGarkiPrice(event.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-[11px] font-semibold">
                      +4.1% Adjustment
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-[16px] text-text-primary">
                  Regional Profit &amp; VAT Summary
                </h3>
                <Icon name="info" className="text-text-tertiary text-[20px]" />
              </div>
              <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col gap-space-sm text-body-md">
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>Weighted Avg. Customer Price</span>
                  <span className="font-label-md text-label-md text-text-primary font-semibold">₦12,250.00</span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>Nigerian VAT (7.5% Included)</span>
                  <span className="text-text-primary font-medium">₦854.65</span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>Estimated Cost of Goods (COGS - Meat &amp; Truffle)</span>
                  <span className="text-text-primary font-medium">₦3,850.00</span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                  <span>VEMTAP Protocol Processing (1.5%)</span>
                  <span className="text-text-primary font-medium">₦183.75</span>
                </div>
                <div className="w-full h-px bg-surface-container-high my-1" />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Projected Net Net Margin
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">
                      ~60.09% Net Profit per Dish
                    </span>
                  </div>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold">₦7,361.60</span>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <Icon name="trending_up" className="text-primary text-[20px]" />
                  <span className="font-caption text-caption text-text-secondary">Branch Margin Performance</span>
                </div>
                <div className="flex items-end gap-1.5 h-6">
                  <div className="w-2.5 h-4 bg-primary rounded-t" title="Wuse: 68%" />
                  <div className="w-2.5 h-5 bg-primary-container rounded-t" title="Garki: 71%" />
                  <div className="w-2.5 h-2 bg-surface-container-highest rounded-t" title="Maitama: Inactive" />
                </div>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={onSaved}
                  className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-primary active:scale-[0.98] transition-all text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] flex items-center justify-center gap-space-xs cursor-pointer"
                >
                  <span>Save Product &amp; Availability</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full h-[44px] rounded-xl text-text-secondary hover:text-error hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors flex items-center justify-center cursor-pointer"
                >
                  Cancel and Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
