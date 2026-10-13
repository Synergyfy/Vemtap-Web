import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { ProductDraft } from './desktopProductDraft';
import type { DealStudioDraft } from './desktopDealStudio';

interface DesktopDealStudioStep1ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const ITEM_IMAGE: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0VC-Bi9iAVGMK5VL_ZDqsvnEpRF0I_Kmmgb-g4CkUaSzD1BpQvxGYYvS5EtQMzQyNGhBdJtqjw8UQ_7PK4_eAPjIEfpudSDwfm12pCKXVHXDnhLooKIMBbxo3relAqD5JcNqRQrjaSZLcxTzPlUfE7o3cJ4WD69AHi9h-0iOXhX3VVSLUHO5uo9R4h5TS7zkoUHwI2-wOX2rIh37C7rNhUbmvKNluCcdW-_vKck8smFxgAs8BURcyQ',
    alt: 'Woodfire grilled ribeye steak with golden garlic butter glaze and rosemary sprig served on dark slate plate in high end restaurant, dramatic side lighting, warm tones',
  },
];

const PREVIEW_IMAGES: Array<{ src: string; alt: string }> = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzBHh02gfmqp0x37SftNFU3itW4G36jPTi2zQ4yw8rmibfHzdVCK_Ckq8uge2v_9yzO2mQOI70JdHTyY46baSGvp3oI2esxrZU06uwa65zUWcat5YqlzUI0VrfPWT7WMkOzT1DcLTRo1hvQPVI5i-stgDgManlRU6vYwijTc-5WnhmTd_3_bzL--pB9doRxZPINchLIBn5jcVPnCCiI0Klf6-m64mVaIoxvKvaeoiM-jl43f2mrggoUg',
    alt: 'Tender woodfire ribeye steak sliced into pink medium rare strips with herb compound butter dripping on top, fresh fine dining ambiance, macro food photography',
  },
];

const PRESETS: Array<{ val: number; label: string; sub?: 'price' | 'sweet' | 'volume' }> = [
  { val: 15, label: '15%', sub: 'price' },
  { val: 20, label: '20% OFF', sub: 'sweet' },
  { val: 25, label: '25%', sub: 'price' },
  { val: 30, label: '30%', sub: 'price' },
  { val: 40, label: '40%', sub: 'volume' },
];

const ALTERNATIVES: Array<{ id: string; icon: string; title: string; tag: string; body: string }> = [
  {
    id: 'fixed',
    icon: 'attach_money',
    title: 'Fixed Amount Off (₦ Off)',
    tag: 'Cart Trigger',
    body: 'Flat monetary reduction (e.g., ₦2,500 off total table bill with minimum spend of ₦15,000).',
  },
  {
    id: 'combo',
    icon: 'fastfood',
    title: 'Combo & Bundle Deal (BOGO / Pair)',
    tag: 'High Margin',
    body: 'Buy 1 Woodfire Steak Get 1 Craft Mocktail Free, or pair with Truffle Fries bundle.',
  },
  {
    id: 'happy',
    icon: 'schedule',
    title: 'Tiered / Flash Happy Hour',
    tag: 'Off-Peak Surge',
    body: 'Deeper 30% discount automatically active during quiet mid-week lunches (Tuesday–Thursday 2–5 PM).',
  },
];

const TO_NUMBER = (value: string) => {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const FORMAT_AMOUNT = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const STEP_RAIL: Array<{ step: string; label: string; meta: string }> = [
  { step: '1', label: 'Discount Strategy', meta: 'Active Phase' },
  { step: '2', label: 'Limits & Rules', meta: 'Next Step' },
  { step: '3', label: 'Branches & Schedule', meta: 'Pending' },
  { step: '4', label: 'Review & Launch', meta: 'Final Approval' },
];

export function DesktopDealStudioStep1Screen({
  draft,
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: DesktopDealStudioStep1ScreenProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const variantPriceSource =
    draft.variants.find((variant) => variant.name === 'Regular')?.price ?? draft.variants[0]?.price ?? draft.basePrice;
  const parsedVariantPrice = TO_NUMBER(variantPriceSource);
  const basePrice = parsedVariantPrice > 0 ? parsedVariantPrice : TO_NUMBER(draft.basePrice);
  const discount = studio.discountPct;
  const dealPrice = Math.round(basePrice * (1 - discount / 100));
  const savings = basePrice - dealPrice;
  const activeBranchCount = Object.values(draft.branches).filter(Boolean).length;

  const setDiscount = (value: number) => {
    onStudioChange({ discountPct: Math.min(60, Math.max(5, value)) });
  };

  const presetSub = (preset: { val: number; sub?: 'price' | 'sweet' | 'volume' }) => {
    if (preset.sub === 'sweet') return 'Sweet Spot';
    if (preset.sub === 'volume') return 'High Volume';
    return `₦${FORMAT_AMOUNT(Math.round(basePrice * (1 - preset.val / 100)))}`;
  };

  return (
    <BusinessSetupChrome activeNav="deals">
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="max-w-7xl mx-auto px-space-xl py-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
            <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
              <button type="button" className="hover:text-primary transition-colors">
                Catalog Workflow
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <button type="button" className="hover:text-primary transition-colors">
                Deal Studio
              </button>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="font-label-sm text-label-sm text-primary font-semibold">
                Step 1 of 4: Discount Strategy
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Progress: <strong className="text-on-surface font-semibold">25% Complete</strong>
              </span>
              <div className="w-32 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-space-xs">
            {STEP_RAIL.map((item, index) => (
              <div
                key={item.step}
                className={`flex items-center gap-space-sm p-space-sm rounded-xl ${
                  index === 0
                    ? 'bg-surface-tint-blue shadow-sm'
                    : index === 1
                      ? 'bg-surface-container-low opacity-80'
                      : 'bg-surface-container-low opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md ${
                    index === 0
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-highest text-on-surface-variant font-semibold'
                  }`}
                >
                  {item.step}
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-label-md text-label-md truncate ${
                      index === 0 ? 'text-primary font-semibold' : 'text-on-surface font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`font-caption text-caption ${
                      index === 0 ? 'text-secondary' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-space-xl py-space-lg w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold uppercase tracking-wider">
                Step 1 • Architecture
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-caption text-caption text-badge-discount-text font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" /> Live Engine Sync
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
              Choose Discount Strategy
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs max-w-2xl">
              Select how your deal is priced and presented to drive fast foot-traffic and convert high-intent diners
              nearby.
            </p>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              className="px-space-md py-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-on-surface-variant transition-colors flex items-center gap-space-xs"
            >
              <Icon name="history" className="text-[18px]" />
              <span>View Past Strategy ROI</span>
            </button>
          </div>
        </div>

        <div className="w-full bg-surface-canvas rounded-2xl p-space-sm mb-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container">
              <img className="w-full h-full object-cover" alt={ITEM_IMAGE[0].alt} src={ITEM_IMAGE[0].src} />
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow">
                <Icon name="restaurant" className="text-[12px]" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">
                  {draft.title}
                </span>
                <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-on-surface-variant font-caption text-caption">
                  Artisan Mains • 350g cut
                </span>
              </div>
              <div className="flex items-center gap-space-md mt-space-2xs text-on-surface-variant font-caption text-caption flex-wrap">
                <span className="flex items-center gap-1 font-medium text-on-surface">
                  <Icon name="payments" className="text-[15px] text-primary" /> Catalog Base: ₦
                  {FORMAT_AMOUNT(basePrice)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon name="storefront" className="text-[15px] text-badge-discount-text" /> {activeBranchCount}{' '}
                  Active Branches (Wuse II &amp; Garki II)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <Icon name="inventory_2" className="text-[15px]" /> SKU: {draft.skuCode}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 self-end md:self-center">
            <button
              type="button"
              className="px-space-md py-space-xs rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md hover:bg-secondary-fixed transition-colors flex items-center gap-space-2xs"
            >
              <Icon name="swap_horiz" className="text-[18px]" />
              <span>Change Catalog Item</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <button
              type="button"
              onClick={() => setSelectedStrategy('percentage')}
              className={`w-full text-left bg-surface-canvas rounded-2xl p-space-md shadow-sm relative overflow-hidden transition-shadow ${
                selectedStrategy === 'percentage' ? 'ring-1 ring-primary' : 'hover:shadow-md'
              }`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  selectedStrategy === 'percentage' ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              />
              <div className="flex items-start justify-between gap-space-md mb-space-sm pt-space-2xs">
                <div className="flex items-center gap-space-sm">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedStrategy === 'percentage'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <Icon name="percent" className="text-[24px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">
                        Percentage Discount (% Off)
                      </h2>
                      <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-wide uppercase">
                        Recommended
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Most familiar to diners; maximizes spontaneous map click-throughs.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                    selectedStrategy === 'percentage' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <Icon name="check" className="text-[16px]" />
                </div>
              </div>

              {selectedStrategy === 'percentage' ? (
                <>
                  <div className="mt-space-sm">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant font-medium mb-space-xs">
                      Quick Strategy Presets
                    </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs">
                  {PRESETS.map((preset) => {
                    const active = preset.val === discount;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setDiscount(preset.val)}
                        className={`py-space-sm px-space-xs rounded-xl font-label-md text-label-md text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          active
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'bg-surface-container-low hover:bg-surface-tint-blue text-on-surface'
                        }`}
                      >
                        <span className="font-bold">{preset.label}</span>
                        <span
                          className={`font-caption text-caption scale-90 ${
                            active ? 'text-on-primary opacity-90' : 'text-on-surface-variant'
                          }`}
                        >
                          {presetSub(preset)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Fine-tune Discount Rate
                  </span>
                  <div className="flex items-center gap-space-xs bg-surface-canvas rounded-xl px-space-sm py-space-2xs shadow-sm">
                    <input
                      className="w-12 bg-transparent text-right font-heading-sm text-heading-sm font-bold text-primary focus:outline-none"
                      max={60}
                      min={5}
                      type="number"
                      value={discount}
                      onChange={(event) => setDiscount(Number(event.target.value))}
                    />
                    <span className="font-heading-sm text-heading-sm font-bold text-primary">%</span>
                  </div>
                </div>
                <input
                  className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  max={60}
                  min={5}
                  type="range"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                />
                <div className="flex justify-between items-center mt-space-xs font-caption text-caption text-on-surface-variant">
                  <span>5% (Light Promo)</span>
                  <span className="text-primary font-semibold">20% - 25% (Sweet Spot)</span>
                  <span>60% (Flash Clearance)</span>
                </div>
              </div>

              <div className="mt-space-md rounded-2xl bg-surface-tint-blue p-space-sm">
                <div className="flex items-center justify-between pb-space-xs mb-space-sm">
                  <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
                    <Icon name="calculate" className="text-[18px]" /> Real-Time Revenue &amp; Value Breakdown
                  </span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    0% VEMTAP Commission
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm text-left">
                  <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                    <span className="block font-caption text-caption text-on-surface-variant mb-1">
                      Original Catalog
                    </span>
                    <span className="font-heading-sm text-heading-sm text-on-surface-variant line-through font-semibold">
                      ₦{FORMAT_AMOUNT(basePrice)}
                    </span>
                    <span className="block font-caption text-caption text-text-tertiary mt-1">Base menu price</span>
                  </div>
                  <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm bg-gradient-to-br from-surface-canvas to-surface-tint-blue">
                    <span className="block font-caption text-caption text-primary font-medium mb-1">
                      Deal Member Price
                    </span>
                    <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">
                      ₦{FORMAT_AMOUNT(dealPrice)}
                    </span>
                    <span className="block font-caption text-caption text-primary font-medium mt-1">
                      Diner pays on tap
                    </span>
                  </div>
                  <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                    <span className="block font-caption text-caption text-on-surface-variant mb-1">
                      Customer Savings
                    </span>
                    <span className="font-heading-sm text-heading-sm text-badge-discount-text font-bold">
                      ₦{FORMAT_AMOUNT(savings)}
                    </span>
                    <span className="block font-caption text-caption text-badge-discount-text font-medium mt-1">
                      {discount}% Direct Value
                    </span>
                  </div>
                  <div className="bg-surface-canvas p-space-sm rounded-xl shadow-sm">
                    <span className="block font-caption text-caption text-on-surface-variant mb-1">
                      Net Take-Home
                    </span>
                    <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                      ₦{FORMAT_AMOUNT(dealPrice)}
                    </span>
                    <span className="block font-caption text-caption text-on-surface-variant mt-1">
                      Instant Direct Payout
                    </span>
                  </div>
                </div>
                <div className="mt-space-sm flex items-center justify-between text-on-surface-variant font-caption text-caption pt-space-xs">
                  <span className="flex items-center gap-1">
                    <Icon name="verified" className="text-[15px] text-badge-discount-text" />
                    VEMTAP zero-intermediary guarantee: Diners pay direct via terminal at your location.
                  </span>
                  <button type="button" className="text-primary hover:underline font-medium">
                    Fee policy details
                  </button>
                </div>
              </div>
                </>
              ) : (
                <div className="mt-space-md rounded-xl border border-dashed border-outline-variant p-space-md text-center">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mx-auto mb-space-xs">
                    <Icon name="touch_app" className="text-[20px]" />
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Select Percentage Discount to configure presets, fine-tuning and live pricing math
                  </span>
                </div>
              )}
            </button>

            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between px-space-2xs">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Alternative Promotional Strategies
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Switch to test other dynamic models
                </span>
              </div>
              {ALTERNATIVES.map((option) => {
                const active = selectedStrategy === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedStrategy(option.id)}
                    className={`w-full text-left rounded-2xl p-space-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-space-sm ${
                      active ? 'bg-surface-tint-blue ring-1 ring-primary' : 'bg-surface-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-space-md">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <Icon name={option.icon} className="text-[22px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h3 className="font-label-md text-label-md text-on-surface font-bold">{option.title}</h3>
                          <span className="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                            {option.tag}
                          </span>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5 text-left">
                          {option.body}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                        active ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-on-primary' : 'bg-transparent'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-surface-tint-blue to-surface-canvas p-space-md shadow-sm flex items-start gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <Icon name="radar" className="text-[26px]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-label-md text-primary font-bold">
                    Abuja Dining Velocity Intel
                  </span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Verified Trend
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1">
                  Steakhouse deals in <strong>Wuse II &amp; Maitama</strong> offering{' '}
                  <strong>20% – 25% discount</strong> convert <strong>3.6x faster</strong> and average{' '}
                  <strong>+42 additional diners per week</strong> compared to discounts under 15%.
                </p>
                <div className="flex items-center gap-space-md mt-space-xs font-caption text-caption text-on-surface-variant">
                  <span>Benchmark source: Q1 2025 Central Abuja DineOut Index</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Icon name="smartphone" className="text-[20px] text-primary" />
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    Live Consumer Deal Preview
                  </span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-caption text-caption text-on-surface-variant">Real-Time App Feed</span>
                </div>
              </div>
              <p className="font-caption text-caption text-on-surface-variant mb-space-md">
                This card is rendered exactly as discovered by foodies browsing VEMTAP Discovery &amp; Map View:
              </p>
              <div className="w-full bg-surface-subtle rounded-2xl p-space-md">
                <div className="bg-surface-canvas rounded-2xl overflow-hidden shadow-md max-w-sm mx-auto">
                  <div className="relative h-44 w-full bg-surface-container overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt={PREVIEW_IMAGES[0].alt}
                      src={PREVIEW_IMAGES[0].src}
                    />
                    <div className="absolute top-3 left-3 px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm flex items-center gap-1">
                      <Icon name="bolt" className="text-[14px]" />
                      <span>{discount}% OFF</span>
                    </div>
                    <div className="absolute top-3 right-3 px-space-xs py-space-2xs rounded-full bg-inverse-surface/80 text-inverse-on-surface backdrop-blur font-caption text-caption flex items-center gap-1">
                      <Icon name="location_on" className="text-[13px]" />
                      <span>0.4 km • Wuse II</span>
                    </div>
                  </div>
                  <div className="p-space-md flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-secondary font-medium tracking-wide uppercase">
                        Artisan Steakhouse &amp; Grill
                      </span>
                      <div className="flex items-center gap-1 text-tertiary">
                        <Icon name="star" className="text-[15px]" filled />
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">4.8</span>
                        <span className="font-caption text-caption text-on-surface-variant">(180+)</span>
                      </div>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm text-on-surface font-bold">{draft.title}</h3>
                    <p className="font-caption text-caption text-on-surface-variant line-clamp-1">
                      350g prime rib cut with garlic rosemary glaze &amp; side greens
                    </p>
                    <div className="flex items-baseline gap-space-xs mt-space-2xs pt-space-2xs">
                      <span className="font-heading-md text-heading-md font-bold text-primary">
                        ₦{FORMAT_AMOUNT(dealPrice)}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant line-through font-normal">
                        ₦{FORMAT_AMOUNT(basePrice)}
                      </span>
                      <span className="font-caption text-caption font-semibold text-badge-discount-text ml-auto bg-badge-discount-bg px-space-xs py-space-2xs rounded-md">
                        Save ₦{FORMAT_AMOUNT(savings)}
                      </span>
                    </div>
                    <div className="mt-space-sm pt-space-xs">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold text-center shadow hover:bg-primary-container transition-colors flex items-center justify-center gap-space-xs"
                      >
                        <span>Tap to Claim Deal</span>
                        <Icon name="arrow_forward" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-space-md pt-space-xs font-caption text-caption text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Icon name="visibility" className="text-[16px]" />
                  Appears on consumer home radar instantly upon publishing
                </span>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-2xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-md text-label-md text-on-surface font-bold">Projected Deal Velocity</span>
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface font-caption text-caption">
                  Radius 3.5 km
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-badge-discount-text mb-1">
                    <Icon name="trending_up" className="text-[18px]" />
                    <span className="font-caption text-caption font-bold">Velocity Boost</span>
                  </div>
                  <span className="font-heading-md text-heading-md font-bold text-on-surface">+340%</span>
                  <span className="font-caption text-caption text-on-surface-variant mt-1">
                    Est. 1st-week foot-traffic surge
                  </span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <div className="flex items-center gap-1 text-primary mb-1">
                    <Icon name="group" className="text-[18px]" />
                    <span className="font-caption text-caption font-bold">Audience Pool</span>
                  </div>
                  <span className="font-heading-md text-heading-md font-bold text-on-surface">~1,420</span>
                  <span className="font-caption text-caption text-on-surface-variant mt-1">
                    Active diners within 3.5 km
                  </span>
                </div>
              </div>
              <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-caption text-caption text-on-surface font-medium">
                    Projected 7-Day Daily Redemptions
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-bold">~58 Claims</span>
                </div>
                <div className="h-10 w-full flex items-end gap-1.5 pt-2">
                  <div className="flex-1 bg-primary/20 rounded-t h-[40%]" title="Day 1: 5" />
                  <div className="flex-1 bg-primary/30 rounded-t h-[55%]" title="Day 2: 7" />
                  <div className="flex-1 bg-primary/50 rounded-t h-[70%]" title="Day 3: 9" />
                  <div className="flex-1 bg-primary/70 rounded-t h-[85%]" title="Day 4: 11" />
                  <div className="flex-1 bg-primary rounded-t h-[100%]" title="Day 5: 14" />
                  <div className="flex-1 bg-primary rounded-t h-[90%]" title="Day 6: 12" />
                  <div className="flex-1 bg-primary/60 rounded-t h-[60%]" title="Day 7: 8" />
                </div>
                <div className="flex justify-between text-on-surface-variant font-caption text-caption text-[11px] mt-1">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri (Peak)</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="mt-space-md flex items-center gap-space-xs text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="shield" className="text-[18px]" />
                <span>Zero-Risk Guarantee: No upfront merchant fees. Direct payout at counter.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-space-xl pt-space-md bg-surface-canvas rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm order-2 sm:order-1">
            <button
              type="button"
              onClick={onBack}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back to Catalog</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-space-md py-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-button-secondary text-button-secondary transition-colors flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft &amp; Exit</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto order-1 sm:order-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="font-caption text-caption text-on-surface-variant">Selected Strategy:</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {selectedStrategy === 'percentage'
                  ? `${discount}% Percentage Discount (₦${FORMAT_AMOUNT(dealPrice)})`
                  : selectedStrategy
                    ? (ALTERNATIVES.find((option) => option.id === selectedStrategy)?.title ?? 'Strategy selected')
                    : 'No strategy selected yet'}
              </span>
            </div>
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto px-space-xl py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-space-xs"
            >
              <span>Continue to Limits &amp; Rules</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
