import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import type { DealStudioDraft, DealStrategy } from './dealStudio';
import type { ProductDraft } from './productDraft';

interface BusinessDealStudioStep1ScreenProps {
  draft: ProductDraft;
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const CATALOG_IMAGE = {
  src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBegO6wZn1Pkyeh_W7ogUoWoPzSup52SZy9Qsv6qu352UGD-32nsoPXPdnWU7nzr5oCNyyr75usbf5NsToY0h3jUp20Yx0TjiP4ooAn7tTorbsmJt1FlbxzZPG8gxGnyC7reOdNjoxbsGkzsqOHoDHTxpu0LhM33K2au5310WOcVSSixIJC5Kd047-jUuSz4P91sE2DGDRYKlajb2AVzoJ6n9vqYzYzQA9VXNAQCioA',
  alt: 'Gourmet prime woodfire aged ribeye steak sizzling on dark rustic slate with fresh rosemary sprig and coarse sea salt garnish, warm moody restaurant ambient lighting, rich deep brown and caramel tones, commercial food styling shot',
};

const PRESETS = [15, 20, 25, 30, 40];
const FIXED_PRESETS = [1500, 2500, 4000, 6000];
const TIERED_PRESETS = [30, 35, 40, 50];
const TIER_WINDOWS = ['2:00 – 5:00 PM', '8:00 – 11:00 PM'];
const TIER_DAYS = ['Tue – Thu', 'Mon – Fri'];

const STRATEGIES: Array<{
  id: DealStrategy;
  icon: string;
  title: string;
  badge: string;
  badgeActive: boolean;
  description: string;
}> = [
  {
    id: 'percentage',
    icon: 'percent',
    title: 'Percentage Discount (% Off)',
    badge: 'Recommended',
    badgeActive: true,
    description: 'Cut the catalog price by a fixed percentage. Best for driving general foot-traffic.',
  },
  {
    id: 'fixed',
    icon: 'payments',
    title: 'Fixed Amount Off (₦ Off)',
    badge: 'Flat cut',
    badgeActive: false,
    description: 'Flat reduction off the total bill above a minimum spend. Great for high-ticket dining.',
  },
  {
    id: 'combo',
    icon: 'ramen_dining',
    title: 'Combo & Bundle Deal',
    badge: 'Pair items',
    badgeActive: false,
    description: 'Buy 1 Get 1 Free, or paired combos like Steak + Cocktail. High perceived value.',
  },
  {
    id: 'tiered',
    icon: 'schedule',
    title: 'Tiered / Flash Happy Hour',
    badge: 'Time-locked',
    badgeActive: false,
    description: 'Deeper discount in low-demand hours or weekdays to turn quiet shifts profitable.',
  },
];

const COMBO_OPTIONS = [
  { id: 'bogo', label: 'Buy 1 Get 1 Free', detail: 'Second steak of equal value — free', extra: null },
  { id: 'pair', label: 'Steak + Craft Mocktail', detail: 'Any signature mocktail paired free', extra: 6500 },
  { id: 'fries', label: 'Steak + Truffle Fries', detail: 'Signature truffle fries on the house', extra: 4500 },
];

const parseAmount = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;

const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

interface PriceRow {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
  hint?: string;
}

function PriceMathRows({ rows }: { rows: Array<PriceRow> }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-space-sm flex flex-col">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-center justify-between py-1.5 ${index < rows.length - 1 ? 'border-b border-border-subtle' : ''}`}
        >
          <span className={`font-label-sm text-label-sm ${row.labelClass ?? 'text-text-secondary'}`}>
            {row.label}
            {row.hint && (
              <span title={row.hint}>
                <Icon name="info" className="text-[13px] text-text-tertiary ml-1" />
              </span>
            )}
          </span>
          <span className={`font-label-md text-label-md ${row.valueClass ?? ''}`}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function TakeHomeRow({ price }: { price: number }) {
  return (
    <div className="p-2 rounded-lg bg-surface-canvas shadow-xs flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-label-sm text-label-sm font-bold text-text-primary">Merchant Net Take-Home</span>
        <span className="font-caption text-caption text-text-secondary">0% VEMTAP Take Rate • Direct Payout</span>
      </div>
      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦{formatAmount(price)}</span>
    </div>
  );
}

export function BusinessDealStudioStep1Screen({
  draft,
  studio,
  onStudioChange,
  onBack,
  onNext,
  onSaveDraft,
}: BusinessDealStudioStep1ScreenProps) {
  const [strategy, setStrategy] = useState<DealStrategy | null>(studio.strategy);
  const [page, setPage] = useState<'choose' | 'configure'>('choose');
  const [amountOff, setAmountOff] = useState(2500);
  const [minSpend, setMinSpend] = useState(15000);
  const [comboId, setComboId] = useState('bogo');
  const [offPct, setOffPct] = useState(30);
  const [tierWindow, setTierWindow] = useState(TIER_WINDOWS[0]);
  const [tierDays, setTierDays] = useState(TIER_DAYS[0]);

  const activeStrategy = STRATEGIES.find((item) => item.id === strategy);

  const regularVariant = draft.variants.find((variant) => variant.name === 'Regular') ?? draft.variants[0];
  const baseAmount = parseAmount(regularVariant?.price ?? draft.basePrice);
  const pct = studio.discountPct;
  const pctSavings = Math.round((baseAmount * pct) / 100);
  const pctDealPrice = baseAmount - pctSavings;
  const activeBranchCount = Object.values(studio.branches).filter(Boolean).length;

  const fixedDealPrice = Math.max(baseAmount - amountOff, 0);
  const fixedSavings = Math.min(amountOff, baseAmount);

  const combo = COMBO_OPTIONS.find((option) => option.id === comboId) ?? COMBO_OPTIONS[0];
  const comboValue = combo.extra === null ? baseAmount * 2 : baseAmount + combo.extra;
  const comboSavings = comboValue - baseAmount;

  const tieredDealPrice = Math.round(baseAmount * (1 - offPct / 100));
  const tieredSavings = baseAmount - tieredDealPrice;

  const applyPct = (value: number) => onStudioChange({ discountPct: value });

  const handleInput = (raw: string) => {
    let num = parseInt(raw, 10);
    if (Number.isNaN(num)) num = 5;
    if (num > 90) num = 90;
    if (num < 1) num = 1;
    applyPct(num);
  };

  const chooseStrategy = (id: DealStrategy) => {
    setStrategy(id);
    onStudioChange({ strategy: id });
    setPage('configure');
    window.scrollTo(0, 0);
  };

  const backToChoose = () => {
    setPage('choose');
    window.scrollTo(0, 0);
  };

  const openConfigure = () => {
    setPage('configure');
    window.scrollTo(0, 0);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-space-xs text-on-surface hover:text-primary active:scale-95 transition-transform"
              type="button"
              onClick={page === 'configure' ? backToChoose : onBack}
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider leading-none">
                VEMTAP Merchant
              </span>
              <h1 className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate max-w-[170px]">
                {page === 'configure' ? 'Discount Setup' : 'Basic Details'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Save Draft"
              className="min-h-[44px] px-space-xs flex items-center justify-center font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant active:scale-95 transition-transform"
              type="button"
              onClick={onSaveDraft}
            >
              Save
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(6,108,244,0.25)]">
              <Icon name="person" className="text-on-primary text-[16px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full pb-36">
        <div className="px-margin pt-space-sm pb-space-2xs flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-on-primary font-caption font-semibold">
                1
              </span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                Step 1 of 4: Discount Strategy
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold">25% Complete</span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="px-margin mt-space-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-space-sm px-space-sm py-space-2xs">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img className="w-full h-full object-cover" alt={CATALOG_IMAGE.alt} src={CATALOG_IMAGE.src} />
                <div className="absolute bottom-0.5 left-0.5 px-1 py-px rounded bg-surface-canvas/90 backdrop-blur-sm flex items-center gap-0.5 shadow-xs">
                  <Icon name="sync" className="text-primary text-[9px]" filled />
                  <span className="font-caption text-[8px] leading-tight text-text-secondary font-medium">
                    POS Live
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-grow">
                <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider leading-none">
                  Synced Catalog Item
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate leading-snug">
                  {draft.title}
                </h2>
                <div className="flex items-baseline gap-space-2xs">
                  <span className="font-label-sm text-label-sm text-text-secondary">Base:</span>
                  <span className="font-label-sm text-label-sm text-text-primary font-bold">
                    ₦{formatAmount(baseAmount)}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">/ 350g cut</span>
                  <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption font-semibold">
                    <span className="w-1 h-1 rounded-full bg-badge-discount-text inline-block" />
                    {activeBranchCount} Branches
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface-subtle px-space-sm py-1">
              <div className="flex items-center gap-1 text-text-secondary">
                <Icon name="storefront" className="text-[13px] text-primary" />
                <span className="font-caption text-caption">Victoria Island & Lekki Phase 1</span>
              </div>
              <button
                className="font-caption text-caption text-primary font-semibold hover:underline flex items-center gap-0.5"
                type="button"
              >
                Change item <Icon name="tune" className="text-[12px]" />
              </button>
            </div>
          </div>
        </div>

        {page === 'choose' && (
          <>
            <div className="px-margin mt-space-md">
              <h3 className="font-heading-md text-heading-md text-text-primary leading-snug">
                Choose Discount Strategy
              </h3>
              <p className="font-caption text-caption text-text-secondary leading-snug">
                Select how your deal is priced and presented to diners nearby.
              </p>
            </div>

            <div className="px-margin mt-space-sm flex flex-col gap-space-sm">
              {STRATEGIES.map((item) => {
                const isSelected = strategy === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl overflow-hidden transition-all duration-200 bg-surface-container-lowest px-space-sm py-space-xs flex items-center gap-space-xs cursor-pointer select-none ${
                      isSelected ? 'shadow-sm ring-1 ring-primary' : 'shadow-xs ring-1 ring-border-subtle'
                    }`}
                    onClick={() => chooseStrategy(item.id)}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-fixed' : 'bg-surface-container'
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        className={`text-[18px] ${isSelected ? 'text-primary' : 'text-secondary'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading-sm text-heading-sm text-text-primary leading-snug">
                        {item.title}
                      </h4>
                      <p className="font-caption text-caption text-text-secondary leading-snug">{item.description}</p>
                      <span
                        className={`mt-1 inline-flex px-1.5 py-px rounded-full font-caption ${
                          item.badgeActive
                            ? 'bg-badge-discount-bg text-badge-discount-text font-bold'
                            : 'bg-surface-container text-text-secondary font-semibold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
                      }`}
                    >
                      <Icon name="check" className="text-[14px]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {page === 'configure' && activeStrategy && (
          <>
            <div className="px-margin mt-space-md">
              <div className="flex items-start justify-between gap-space-xs">
                <div className="min-w-0">
                  <h3 className="font-heading-md text-heading-md text-text-primary leading-snug">
                    {activeStrategy.title}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    {activeStrategy.description}
                  </p>
                </div>
                <button
                  className="font-caption text-caption text-primary font-semibold flex items-center gap-0.5 shrink-0 mt-0.5 hover:underline"
                  type="button"
                  onClick={backToChoose}
                >
                  <Icon name="swap_horiz" className="text-[14px]" /> Change
                </button>
              </div>
            </div>

            {strategy === 'percentage' && (
              <div className="px-margin mt-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pt-space-2xs no-scrollbar">
                  {PRESETS.map((preset) => {
                    const isActive = preset === pct;
                    return (
                      <button
                        key={preset}
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-primary text-on-primary font-semibold shadow-xs'
                            : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                        }`}
                        type="button"
                        onClick={() => applyPct(preset)}
                      >
                        {isActive ? `${preset}% OFF` : `${preset}%`}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">Custom rate</span>
                  <div className="flex items-center gap-1 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
                    <input
                      aria-label="Custom discount rate"
                      className="w-9 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
                      max={70}
                      min={5}
                      type="number"
                      value={pct}
                      onChange={(event) => handleInput(event.target.value)}
                    />
                    <span className="font-heading-sm text-heading-sm font-bold text-primary">%</span>
                  </div>
                </div>

                <input
                  aria-label="Discount slider"
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  max={60}
                  min={5}
                  step={5}
                  type="range"
                  value={Math.min(60, Math.max(5, pct))}
                  onChange={(event) => applyPct(Number(event.target.value))}
                />
                <div className="flex justify-between font-caption text-caption text-text-tertiary">
                  <span>5% Light</span>
                  <span>25% Sweet Spot</span>
                  <span>60% Clearance</span>
                </div>

                <PriceMathRows
                  rows={[
                    {
                      label: 'Regular Catalog Price',
                      value: `₦${formatAmount(baseAmount)}`,
                      valueClass: 'text-text-tertiary line-through',
                    },
                    {
                      label: 'Deal Member Price',
                      value: `₦${formatAmount(pctDealPrice)}`,
                      labelClass: 'text-text-primary font-semibold',
                      valueClass: 'font-bold text-primary',
                      hint: 'Diners pay this on VEMTAP',
                    },
                    {
                      label: 'Customer Net Savings',
                      value: `₦${formatAmount(pctSavings)} (${pct}% OFF)`,
                      labelClass: 'text-badge-discount-text font-medium',
                      valueClass: 'font-semibold text-badge-discount-text',
                    },
                  ]}
                />

                <TakeHomeRow price={pctDealPrice} />

                <div className="bg-surface-tint-blue rounded-xl px-space-sm py-space-2xs shadow-xs flex items-start gap-space-2xs">
                  <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="insights" className="text-primary text-[14px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    <span className="font-semibold text-primary">Pro Tip:</span> steakhouse deals with{' '}
                    <span className="font-semibold text-text-primary">20%–25% off</span> convert{' '}
                    <strong className="text-primary font-bold">3.6x faster</strong> and average 42 extra diners per
                    week in Victoria Island & Lekki.
                  </p>
                </div>
              </div>
            )}

            {strategy === 'fixed' && (
              <div className="px-margin mt-space-sm flex flex-col gap-space-xs">
                <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">Amount off</span>
                  <div className="flex items-center gap-0.5 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
                    <span className="font-heading-sm text-heading-sm font-bold text-primary">₦</span>
                    <input
                      aria-label="Fixed amount off"
                      className="w-16 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
                      type="number"
                      value={amountOff}
                      onChange={(event) => setAmountOff(parseAmount(event.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {FIXED_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                        amountOff === preset
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setAmountOff(preset)}
                    >
                      ₦{formatAmount(preset)} off
                    </button>
                  ))}
                </div>
                <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">Minimum table bill</span>
                  <div className="flex items-center gap-0.5 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
                    <span className="font-heading-sm text-heading-sm font-bold text-primary">₦</span>
                    <input
                      aria-label="Minimum table bill"
                      className="w-16 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
                      type="number"
                      value={minSpend}
                      onChange={(event) => setMinSpend(parseAmount(event.target.value))}
                    />
                  </div>
                </div>
                <p className="font-caption text-caption text-text-tertiary">
                  Deal activates when the total bill meets the minimum spend of ₦{formatAmount(minSpend)}.
                </p>
                <PriceMathRows
                  rows={[
                    {
                      label: 'Regular Catalog Price',
                      value: `₦${formatAmount(baseAmount)}`,
                      valueClass: 'text-text-tertiary line-through',
                    },
                    {
                      label: 'Deal Member Price',
                      value: `₦${formatAmount(fixedDealPrice)}`,
                      labelClass: 'text-text-primary font-semibold',
                      valueClass: 'font-bold text-primary',
                      hint: 'Diners pay this on VEMTAP',
                    },
                    {
                      label: 'Customer Net Savings',
                      value: `₦${formatAmount(fixedSavings)} flat off`,
                      labelClass: 'text-badge-discount-text font-medium',
                      valueClass: 'font-semibold text-badge-discount-text',
                    },
                  ]}
                />
                <TakeHomeRow price={fixedDealPrice} />
              </div>
            )}

            {strategy === 'combo' && (
              <div className="px-margin mt-space-sm flex flex-col gap-space-xs">
                <div className="flex flex-col gap-space-2xs">
                  {COMBO_OPTIONS.map((option) => {
                    const isActive = comboId === option.id;
                    return (
                      <div
                        key={option.id}
                        className={`rounded-xl px-space-sm py-space-2xs flex items-center gap-space-xs cursor-pointer select-none transition-all ${
                          isActive
                            ? 'bg-surface-container-lowest ring-1 ring-primary shadow-sm'
                            : 'bg-surface-container-lowest ring-1 ring-border-subtle shadow-xs'
                        }`}
                        onClick={() => setComboId(option.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
                          }`}
                        >
                          <Icon name="check" className="text-[14px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-md text-label-md text-text-primary font-semibold">
                            {option.label}
                          </span>
                          <p className="font-caption text-caption text-text-secondary leading-snug">
                            {option.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <PriceMathRows
                  rows={[
                    {
                      label: 'Full Bundle Value',
                      value: `₦${formatAmount(comboValue)}`,
                      valueClass: 'text-text-tertiary line-through',
                    },
                    {
                      label: 'Member Pays',
                      value: `₦${formatAmount(baseAmount)}`,
                      labelClass: 'text-text-primary font-semibold',
                      valueClass: 'font-bold text-primary',
                      hint: 'Diners pay this on VEMTAP',
                    },
                    {
                      label: 'Perceived Savings',
                      value: `₦${formatAmount(comboSavings)} free item`,
                      labelClass: 'text-badge-discount-text font-medium',
                      valueClass: 'font-semibold text-badge-discount-text',
                    },
                  ]}
                />
                <p className="font-caption text-caption text-text-tertiary">
                  No cash discounting — customers perceive value through the free pairing.
                </p>
                <TakeHomeRow price={baseAmount} />
              </div>
            )}

            {strategy === 'tiered' && (
              <div className="px-margin mt-space-sm flex flex-col gap-space-xs">
                <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-primary font-medium">Off-peak discount</span>
                  <div className="flex items-center gap-1 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
                    <input
                      aria-label="Off-peak discount rate"
                      className="w-9 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
                      max={60}
                      min={10}
                      type="number"
                      value={offPct}
                      onChange={(event) => setOffPct(Math.min(60, Math.max(10, parseAmount(event.target.value))))}
                    />
                    <span className="font-heading-sm text-heading-sm font-bold text-primary">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {TIERED_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                        offPct === preset
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setOffPct(preset)}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <span className="font-label-sm text-label-sm text-text-secondary">Active window</span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {TIER_WINDOWS.map((option) => (
                    <button
                      key={option}
                      className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                        tierWindow === option
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setTierWindow(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {TIER_DAYS.map((option) => (
                    <button
                      key={option}
                      className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                        tierDays === option
                          ? 'bg-primary text-on-primary font-semibold shadow-xs'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setTierDays(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <PriceMathRows
                  rows={[
                    {
                      label: 'Regular Catalog Price',
                      value: `₦${formatAmount(baseAmount)}`,
                      valueClass: 'text-text-tertiary line-through',
                    },
                    {
                      label: 'Window Member Price',
                      value: `₦${formatAmount(tieredDealPrice)}`,
                      labelClass: 'text-text-primary font-semibold',
                      valueClass: 'font-bold text-primary',
                      hint: 'Price during the happy hour window',
                    },
                    {
                      label: 'Customer Net Savings',
                      value: `₦${formatAmount(tieredSavings)} (${offPct}% OFF)`,
                      labelClass: 'text-badge-discount-text font-medium',
                      valueClass: 'font-semibold text-badge-discount-text',
                    },
                  ]}
                />
                <p className="font-caption text-caption text-text-tertiary">
                  {offPct}% off auto-activates {tierDays.toLowerCase()}, {tierWindow.toLowerCase()} only.
                </p>
                <TakeHomeRow price={tieredDealPrice} />
              </div>
            )}
          </>
        )}
      </div>

      {page === 'choose' ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs disabled:opacity-40 disabled:shadow-none"
            type="button"
            disabled={!strategy}
            onClick={openConfigure}
          >
            <span>{strategy ? 'Continue to Discount Setup' : 'Select a strategy to continue'}</span>
            {strategy && <Icon name="arrow_forward" className="text-[18px]" />}
          </button>
          <button
            className="w-full h-9 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:scale-[0.99] transition-transform flex items-center justify-center gap-1"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Catalog Items</span>
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl px-margin pb-safe flex flex-col gap-space-2xs pt-space-2xs shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-space-2xs"
            type="button"
            onClick={onNext}
          >
            <span>Continue to Limits & Rules</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
          <button
            className="w-full h-9 rounded-xl bg-transparent text-text-secondary font-button-secondary text-button-secondary hover:text-text-primary active:scale-[0.99] transition-transform flex items-center justify-center gap-1"
            type="button"
            onClick={backToChoose}
          >
            <Icon name="arrow_back" className="text-[16px]" />
            <span>Back to Discount Strategy</span>
          </button>
        </div>
      )}
    </AppScreen>
  );
}
