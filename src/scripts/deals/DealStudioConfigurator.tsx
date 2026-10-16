/**
 * Shared Deal Studio configurator UI — deal-type selector and the dedicated
 * per-type configuration panels (percentage, fixed, combo/bundle, flash).
 *
 * Rendered by both the mobile and desktop deal wizard steps so deal creation
 * behaves identically in onboarding and in the business dashboard.
 */
import { Icon } from '../../components/ui/Icon';
import {
  DEFAULT_BUNDLE_CATALOG,
  DEAL_TYPE_OPTIONS,
  FLASH_DAY_RANGES,
  FLASH_WINDOWS,
  clampNumber,
  describeComboRules,
  formatDealAmount,
  formatFlashValidity,
  parseDealAmount,
  resolveBundleCatalog,
  resolveComboPricing,
  validateComboDeal,
  validateFixedDeal,
  validateFlashDeal,
  validatePercentageDeal,
  type ComboBenefit,
  type ComboMode,
  type ComboProduct,
  type DealStudioDraft,
  type DealStrategy,
} from './dealStudioShared';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function ChipRow<T extends number | string>({
  options,
  active,
  onSelect,
  format,
}: {
  options: T[];
  active: T;
  onSelect: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {options.map((option) => (
        <button
          key={String(option)}
          className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
            option === active
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
          }`}
          type="button"
          onClick={() => onSelect(option)}
        >
          {format ? format(option) : String(option)}
        </button>
      ))}
    </div>
  );
}

function AmountField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between gap-space-xs">
      <span className="font-label-sm text-label-sm text-text-primary font-medium">{label}</span>
      <div className="flex items-center gap-1 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
        {prefix && <span className="font-heading-sm text-heading-sm font-bold text-primary">{prefix}</span>}
        <input
          aria-label={label}
          className="w-16 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) => onChange(parseDealAmount(event.target.value))}
        />
        {suffix && <span className="font-heading-sm text-heading-sm font-bold text-primary">{suffix}</span>}
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  decreaseLabel = 'Decrease quantity',
  increaseLabel = 'Increase quantity',
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel?: string;
  increaseLabel?: string;
}) {
  return (
    <div className="flex items-center bg-surface-container-lowest rounded-lg p-1 shadow-sm shrink-0">
      <button
        aria-label={decreaseLabel}
        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="remove" className="text-[16px]" />
      </button>
      <span className="font-caption text-caption font-semibold text-text-primary px-2 min-w-[28px] text-center">
        {value}
      </span>
      <button
        aria-label={increaseLabel}
        className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-95 transition-transform rounded-md"
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="add" className="text-[16px]" />
      </button>
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
      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦{formatDealAmount(price)}</span>
    </div>
  );
}

export interface DealMathRow {
  label: string;
  value: string;
  tone?: 'default' | 'strike' | 'primary' | 'savings';
  hint?: string;
}

export function DealMathRows({ rows }: { rows: DealMathRow[] }) {
  return (
    <div className="rounded-lg bg-surface-subtle px-space-sm flex flex-col">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-center justify-between py-1.5 gap-space-xs ${
            index < rows.length - 1 ? 'border-b border-border-subtle' : ''
          }`}
        >
          <span className="font-label-sm text-label-sm text-text-secondary">
            {row.label}
            {row.hint && (
              <span title={row.hint}>
                <Icon name="info" className="text-[13px] text-text-tertiary ml-1" />
              </span>
            )}
          </span>
          <span
            className={`font-label-md text-label-md text-right ${
              row.tone === 'strike'
                ? 'text-text-tertiary line-through'
                : row.tone === 'primary'
                  ? 'font-bold text-primary'
                  : row.tone === 'savings'
                    ? 'font-semibold text-badge-discount-text'
                    : 'text-text-primary'
            }`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DealConfigErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="rounded-lg bg-error-container px-space-sm py-space-2xs flex flex-col gap-1">
      {errors.map((error) => (
        <div key={error} className="flex items-start gap-1.5 text-on-error-container font-caption text-caption">
          <Icon name="error" className="text-[14px] mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Deal type selector                                                  */
/* ------------------------------------------------------------------ */

export function DealTypeSelector({
  selected,
  onSelect,
  variant = 'mobile',
}: {
  selected: DealStrategy | null;
  onSelect: (id: DealStrategy) => void;
  variant?: 'mobile' | 'desktop';
}) {
  if (variant === 'desktop') {
    return (
      <div className="flex flex-col gap-space-md">
        {DEAL_TYPE_OPTIONS.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full text-left rounded-2xl p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-space-sm ${
                isSelected ? 'bg-surface-tint-blue ring-1 ring-primary' : 'bg-surface-canvas'
              }`}
            >
              <div className="flex items-center gap-space-md min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <Icon name={item.icon} className="text-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">{item.title}</h3>
                    <span
                      className={`px-space-xs py-space-2xs rounded font-caption text-caption ${
                        item.badgeActive
                          ? 'bg-badge-discount-bg text-badge-discount-text font-bold'
                          : 'bg-surface-container text-on-surface-variant font-semibold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5 text-left">
                    {item.description}
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
                }`}
              >
                <Icon name="check" className="text-[16px]" />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      {DEAL_TYPE_OPTIONS.map((item) => {
        const isSelected = selected === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-xl overflow-hidden transition-all duration-200 bg-surface-container-lowest px-space-sm py-space-xs flex items-center gap-space-xs cursor-pointer select-none ${
              isSelected ? 'shadow-sm ring-1 ring-primary' : 'shadow-xs ring-1 ring-border-subtle'
            }`}
            onClick={() => onSelect(item.id)}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-primary-fixed' : 'bg-surface-container'
              }`}
            >
              <Icon name={item.icon} className={`text-[18px] ${isSelected ? 'text-primary' : 'text-secondary'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading-sm text-heading-sm text-text-primary leading-snug">{item.title}</h4>
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
  );
}

/* ------------------------------------------------------------------ */
/* Per-type configuration panels                                       */
/* ------------------------------------------------------------------ */

const PERCENT_PRESETS = [15, 20, 25, 30, 40];
const FIXED_PRESETS = [1500, 2500, 4000, 6000];
const FLASH_PRESETS = [30, 35, 40, 50];

const COMBO_BENEFITS: Array<{ id: ComboBenefit; label: string; description: string }> = [
  { id: 'free-units', label: 'Get free units (Buy N, Get M Free)', description: 'Customer pays for the qualifying units and receives extras free.' },
  { id: 'percent-off', label: 'Percentage off the multi-unit total', description: 'A percentage discount applies once the qualifying quantity is met.' },
  { id: 'bundle-price', label: 'Set a promotional price for the bundle', description: 'Customer pays one fixed price for a multi-unit set.' },
];

const COMBO_MODES: Array<{ id: ComboMode; icon: string; title: string; description: string }> = [
  {
    id: 'quantity',
    icon: 'add_shopping_cart',
    title: 'Option A — Quantity promotion',
    description: 'Buy N of one product and get a benefit, e.g. Buy 3 Get 1 Free or 5 for a special price.',
  },
  {
    id: 'bundle',
    icon: 'widgets',
    title: 'Option B — Multi-product bundle',
    description: 'Combine several products (with quantities) and sell them together at one bundle price or discount.',
  },
];

function PercentagePanel({
  studio,
  onStudioChange,
  basePrice,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  basePrice: number;
}) {
  const pct = studio.discountPct;
  const savings = Math.round((basePrice * pct) / 100);
  const dealPrice = basePrice - savings;

  return (
    <div className="flex flex-col gap-space-xs">
      <ChipRow
        active={pct}
        options={PERCENT_PRESETS}
        onSelect={(value: number) => onStudioChange({ discountPct: clampNumber(value, 1, 90) })}
        format={(value: number) => `${value}%`}
      />
      <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-text-primary font-medium">Custom rate</span>
        <div className="flex items-center gap-1 bg-surface-canvas px-2 py-0.5 rounded-lg shadow-xs">
          <input
            aria-label="Custom discount rate"
            className="w-9 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
            max={90}
            min={1}
            type="number"
            value={pct}
            onChange={(event) => onStudioChange({ discountPct: clampNumber(Number(event.target.value), 1, 90) })}
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
        onChange={(event) => onStudioChange({ discountPct: Number(event.target.value) })}
      />
      <div className="flex justify-between font-caption text-caption text-text-tertiary">
        <span>5% Light</span>
        <span>25% Sweet Spot</span>
        <span>60% Clearance</span>
      </div>
      <DealMathRows
        rows={[
          { label: 'Regular Catalog Price', value: `₦${formatDealAmount(basePrice)}`, tone: 'strike' },
          {
            label: 'Deal Member Price',
            value: `₦${formatDealAmount(dealPrice)}`,
            tone: 'primary',
            hint: 'Diners pay this on VEMTAP',
          },
          {
            label: 'Customer Net Savings',
            value: `₦${formatDealAmount(savings)} (${pct}% OFF)`,
            tone: 'savings',
          },
        ]}
      />
      <DealConfigErrors errors={validatePercentageDeal(pct)} />
      <TakeHomeRow price={dealPrice} />
    </div>
  );
}

function FixedPanel({
  studio,
  onStudioChange,
  basePrice,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  basePrice: number;
}) {
  const { amountOff, minSpend } = studio.fixed;
  const savings = Math.min(Math.max(amountOff, 0), basePrice);
  const dealPrice = Math.max(basePrice - amountOff, 0);

  return (
    <div className="flex flex-col gap-space-xs">
      <AmountField
        label="Amount off"
        prefix="₦"
        value={amountOff}
        onChange={(value) => onStudioChange({ fixed: { ...studio.fixed, amountOff: value } })}
      />
      <ChipRow
        active={amountOff}
        options={FIXED_PRESETS}
        onSelect={(value: number) => onStudioChange({ fixed: { ...studio.fixed, amountOff: value } })}
        format={(value: number) => `₦${formatDealAmount(value)} off`}
      />
      <AmountField
        label="Minimum table bill"
        prefix="₦"
        value={minSpend}
        onChange={(value) => onStudioChange({ fixed: { ...studio.fixed, minSpend: value } })}
      />
      <p className="font-caption text-caption text-text-tertiary">
        Deal activates when the total bill meets the minimum spend of ₦{formatDealAmount(minSpend)}.
      </p>
      <DealMathRows
        rows={[
          { label: 'Regular Catalog Price', value: `₦${formatDealAmount(basePrice)}`, tone: 'strike' },
          {
            label: 'Deal Member Price',
            value: `₦${formatDealAmount(dealPrice)}`,
            tone: 'primary',
            hint: 'Diners pay this on VEMTAP',
          },
          { label: 'Customer Net Savings', value: `₦${formatDealAmount(savings)} flat off`, tone: 'savings' },
        ]}
      />
      <DealConfigErrors errors={validateFixedDeal(studio.fixed, basePrice)} />
      <TakeHomeRow price={dealPrice} />
    </div>
  );
}

function ComboBundlePanel({
  studio,
  onStudioChange,
  basePrice,
  catalog,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  basePrice: number;
  catalog: ComboProduct[];
}) {
  const combo = studio.combo;
  const setCombo = (patch: Partial<typeof combo>) => onStudioChange({ combo: { ...combo, ...patch } });
  const products = resolveBundleCatalog(basePrice, catalog);
  const pricing = resolveComboPricing(combo, basePrice, catalog);
  const rules = describeComboRules(combo, basePrice, catalog);
  const errors = validateComboDeal(combo, basePrice, catalog);
  const usedIds = new Set(combo.items.map((item) => item.productId));
  const nextProduct = products.find((product) => !usedIds.has(product.id));

  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex flex-col gap-space-2xs">
        {COMBO_MODES.map((mode) => {
          const isActive = combo.mode === mode.id;
          return (
            <div
              key={mode.id}
              className={`rounded-xl px-space-sm py-space-2xs flex items-center gap-space-xs cursor-pointer select-none transition-all ${
                isActive
                  ? 'bg-surface-container-lowest ring-1 ring-primary shadow-sm'
                  : 'bg-surface-container-lowest ring-1 ring-border-subtle shadow-xs'
              }`}
              onClick={() => setCombo({ mode: mode.id })}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
                }`}
              >
                <Icon name="check" className="text-[14px]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold">{mode.title}</span>
                <p className="font-caption text-caption text-text-secondary leading-snug">{mode.description}</p>
              </div>
              <Icon name={mode.icon} className={`text-[18px] shrink-0 ${isActive ? 'text-primary' : 'text-text-tertiary'}`} />
            </div>
          );
        })}
      </div>

      {combo.mode === 'quantity' ? (
        <>
          <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-space-sm py-space-2xs">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-primary font-medium">Qualifying quantity (buy)</span>
              <span className="font-caption text-caption text-text-tertiary">Units a customer must purchase</span>
            </div>
            <QtyStepper
              decreaseLabel="Decrease qualifying quantity"
              increaseLabel="Increase qualifying quantity"
              max={20}
              value={combo.buyQty}
              onChange={(value) => setCombo({ buyQty: value })}
            />
          </div>
          <div className="flex flex-col gap-space-2xs">
            {COMBO_BENEFITS.map((benefit) => {
              const isActive = combo.benefit === benefit.id;
              return (
                <div key={benefit.id} className="flex flex-col">
                  <label
                    className={`rounded-lg px-space-sm py-space-2xs flex items-center gap-space-xs cursor-pointer transition-colors ${
                      isActive ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                    }`}
                    onClick={() => setCombo({ benefit: benefit.id })}
                  >
                    <input
                      aria-label={benefit.label}
                      checked={isActive}
                      className="w-4 h-4 text-primary-container focus:ring-0"
                      name="combo_benefit"
                      readOnly
                      type="radio"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{benefit.label}</span>
                      <span className="font-caption text-caption text-text-secondary leading-snug">
                        {benefit.description}
                      </span>
                    </div>
                  </label>
                  {isActive && benefit.id === 'free-units' && (
                    <div className="flex items-center justify-between bg-surface-container-lowest rounded-lg px-space-sm py-space-2xs mt-space-2xs ring-1 ring-border-subtle">
                      <span className="font-label-sm text-label-sm text-text-primary font-medium">Free units (get)</span>
                      <QtyStepper
                        decreaseLabel="Decrease free units"
                        increaseLabel="Increase free units"
                        max={20}
                        value={combo.freeQty}
                        onChange={(value) => setCombo({ freeQty: value })}
                      />
                    </div>
                  )}
                  {isActive && benefit.id === 'percent-off' && (
                    <div className="mt-space-2xs">
                      <AmountField
                        label="Discount on multi-unit total"
                        suffix="%"
                        value={combo.benefitPct}
                        onChange={(value) => setCombo({ benefitPct: value })}
                      />
                    </div>
                  )}
                  {isActive && benefit.id === 'bundle-price' && (
                    <div className="flex flex-col gap-space-2xs mt-space-2xs">
                      <div className="flex items-center justify-between bg-surface-container-lowest rounded-lg px-space-sm py-space-2xs ring-1 ring-border-subtle">
                        <span className="font-label-sm text-label-sm text-text-primary font-medium">Units in bundle</span>
                        <QtyStepper
                          decreaseLabel="Decrease bundle units"
                          increaseLabel="Increase bundle units"
                          max={20}
                          min={2}
                          value={combo.bundleQty}
                          onChange={(value) => setCombo({ bundleQty: value })}
                        />
                      </div>
                      <AmountField
                        label="Promotional bundle price (total)"
                        prefix="₦"
                        value={combo.bundlePrice}
                        onChange={(value) => setCombo({ bundlePrice: value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-space-2xs">
            {combo.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center gap-space-xs bg-surface-container-lowest rounded-lg px-space-sm py-space-2xs ring-1 ring-border-subtle"
              >
                <select
                  aria-label={`Bundle product ${index + 1}`}
                  className="flex-1 min-w-0 bg-surface-subtle rounded-lg px-space-xs py-1 font-label-sm text-label-sm text-text-primary outline-none"
                  value={item.productId}
                  onChange={(event) => {
                    const items = combo.items.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, productId: event.target.value } : entry,
                    );
                    setCombo({ items });
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — ₦{formatDealAmount(product.price)}
                    </option>
                  ))}
                </select>
                <QtyStepper
                  decreaseLabel={`Decrease quantity for product ${index + 1}`}
                  increaseLabel={`Increase quantity for product ${index + 1}`}
                  max={20}
                  value={item.qty}
                  onChange={(value) => {
                    const items = combo.items.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, qty: value } : entry,
                    );
                    setCombo({ items });
                  }}
                />
                <button
                  aria-label={`Remove product ${index + 1}`}
                  className="w-7 h-7 flex items-center justify-center text-text-tertiary hover:text-error active:scale-95 transition-transform rounded-md shrink-0"
                  type="button"
                  onClick={() => setCombo({ items: combo.items.filter((_, entryIndex) => entryIndex !== index) })}
                >
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            ))}
            {nextProduct && (
              <button
                className="self-start flex items-center gap-1 px-space-xs py-1 rounded-lg font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors"
                type="button"
                onClick={() => setCombo({ items: [...combo.items, { productId: nextProduct.id, qty: 1 }] })}
              >
                <Icon name="add" className="text-[14px]" />
                <span>Add product to bundle</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-space-2xs">
            {(
              [
                { id: 'price', label: 'Set one bundle price', description: 'Customer pays a single promotional total.' },
                {
                  id: 'percent',
                  label: 'Percentage discount on the combined price',
                  description: 'A percentage comes off the normal combined price.',
                },
              ] as Array<{ id: 'price' | 'percent'; label: string; description: string }>
            ).map((mode) => {
              const isActive = combo.pricingMode === mode.id;
              return (
                <div key={mode.id} className="flex flex-col">
                  <label
                    className={`rounded-lg px-space-sm py-space-2xs flex items-center gap-space-xs cursor-pointer transition-colors ${
                      isActive ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                    }`}
                    onClick={() => setCombo({ pricingMode: mode.id })}
                  >
                    <input
                      aria-label={mode.label}
                      checked={isActive}
                      className="w-4 h-4 text-primary-container focus:ring-0"
                      name="combo_pricing"
                      readOnly
                      type="radio"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-text-primary font-semibold">{mode.label}</span>
                      <span className="font-caption text-caption text-text-secondary leading-snug">
                        {mode.description}
                      </span>
                    </div>
                  </label>
                  {isActive && mode.id === 'price' && (
                    <div className="mt-space-2xs">
                      <AmountField
                        label="Bundle price (total)"
                        prefix="₦"
                        value={combo.bundlePromoPrice}
                        onChange={(value) => setCombo({ bundlePromoPrice: value })}
                      />
                    </div>
                  )}
                  {isActive && mode.id === 'percent' && (
                    <div className="mt-space-2xs">
                      <AmountField
                        label="Bundle discount"
                        suffix="%"
                        value={combo.bundleDiscountPct}
                        onChange={(value) => setCombo({ bundleDiscountPct: value })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-space-sm py-space-2xs">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-text-primary font-medium">Max purchase limit per order</span>
          <span className="font-caption text-caption text-text-tertiary">
            {combo.maxPurchaseLimit === 0 ? 'No cap — customers can redeem multiple bundles per order' : `Up to ${combo.maxPurchaseLimit} bundles per order`}
          </span>
        </div>
        <QtyStepper
          decreaseLabel="Decrease purchase limit"
          increaseLabel="Increase purchase limit"
          max={50}
          value={combo.maxPurchaseLimit}
          onChange={(value) => setCombo({ maxPurchaseLimit: value })}
        />
      </div>

      <DealMathRows
        rows={[
          {
            label: 'Normal combined price',
            value: `₦${formatDealAmount(pricing.originalTotal)}`,
            tone: 'strike',
            hint: 'Regular value of everything the customer must buy',
          },
          {
            label: 'Discount amount',
            value: `₦${formatDealAmount(Math.max(pricing.savings, 0))} (${pricing.savingsPct}% off)`,
            tone: 'savings',
          },
          {
            label: 'Final promotional price',
            value: `₦${formatDealAmount(pricing.dealPrice)}`,
            tone: 'primary',
            hint: 'Diners pay this total on VEMTAP',
          },
          {
            label: 'Customer savings',
            value: `₦${formatDealAmount(Math.max(pricing.savings, 0))}`,
            tone: 'savings',
          },
          {
            label: 'Quantity restrictions',
            value: combo.maxPurchaseLimit === 0 ? 'No per-order cap' : `Max ${combo.maxPurchaseLimit} per order`,
          },
        ]}
      />
      <div className="rounded-lg bg-surface-tint-blue px-space-sm py-space-2xs flex flex-col gap-0.5">
        {rules.map((rule, index) => (
          <span
            key={rule}
            className={
              index === 0
                ? 'font-label-sm text-label-sm text-primary font-semibold'
                : 'font-caption text-caption text-text-secondary leading-snug'
            }
          >
            {rule}
          </span>
        ))}
      </div>
      <DealConfigErrors errors={errors} />
      <TakeHomeRow price={Math.max(pricing.dealPrice, 0)} />
    </div>
  );
}

function FlashPanel({
  studio,
  onStudioChange,
  basePrice,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  basePrice: number;
}) {
  const flash = studio.flash;
  const setFlash = (patch: Partial<typeof flash>) => onStudioChange({ flash: { ...flash, ...patch } });
  const pct = flash.discountPct;
  const savings = Math.round((basePrice * pct) / 100);
  const dealPrice = basePrice - savings;

  return (
    <div className="flex flex-col gap-space-xs">
      <AmountField
        label="Off-peak discount"
        suffix="%"
        value={pct}
        onChange={(value) => setFlash({ discountPct: clampNumber(value, 1, 90) })}
      />
      <ChipRow
        active={pct}
        options={FLASH_PRESETS}
        onSelect={(value: number) => setFlash({ discountPct: value })}
        format={(value: number) => `${value}%`}
      />
      <div className="bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between gap-space-xs">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-text-primary font-medium">Validity period</span>
          <span className="font-caption text-caption text-text-tertiary">{formatFlashValidity(flash)}</span>
        </div>
        <div className="flex items-center gap-space-2xs">
          <input
            aria-label="Flash start date"
            className="bg-surface-canvas px-2 py-1 rounded-lg shadow-xs font-label-sm text-label-sm text-text-primary outline-none"
            type="date"
            value={flash.startDate}
            onChange={(event) => setFlash({ startDate: event.target.value })}
          />
          <span className="font-caption text-caption text-text-tertiary">→</span>
          <input
            aria-label="Flash end date"
            className="bg-surface-canvas px-2 py-1 rounded-lg shadow-xs font-label-sm text-label-sm text-text-primary outline-none"
            type="date"
            value={flash.endDate}
            onChange={(event) => setFlash({ endDate: event.target.value })}
          />
        </div>
      </div>
      <span className="font-label-sm text-label-sm text-text-secondary">Daily happy-hour window</span>
      <ChipRow active={flash.window} options={FLASH_WINDOWS} onSelect={(value: string) => setFlash({ window: value })} />
      <ChipRow active={flash.days} options={FLASH_DAY_RANGES} onSelect={(value: string) => setFlash({ days: value })} />
      <DealMathRows
        rows={[
          { label: 'Regular Catalog Price', value: `₦${formatDealAmount(basePrice)}`, tone: 'strike' },
          {
            label: 'Window Member Price',
            value: `₦${formatDealAmount(dealPrice)}`,
            tone: 'primary',
            hint: 'Price during the happy hour window',
          },
          {
            label: 'Customer Net Savings',
            value: `₦${formatDealAmount(savings)} (${pct}% OFF)`,
            tone: 'savings',
          },
        ]}
      />
      <p className="font-caption text-caption text-text-tertiary">
        {pct}% off auto-activates {flash.days.toLowerCase()}, {flash.window.toLowerCase()} only. Deal runs{' '}
        {formatFlashValidity(flash).toLowerCase()}.
      </p>
      <DealConfigErrors errors={validateFlashDeal(flash)} />
      <TakeHomeRow price={dealPrice} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public configurator                                                 */
/* ------------------------------------------------------------------ */

export function DealTypeConfigurator({
  studio,
  onStudioChange,
  basePrice,
  catalog = DEFAULT_BUNDLE_CATALOG,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  basePrice: number;
  catalog?: ComboProduct[];
}) {
  if (!studio.strategy) return null;
  if (studio.strategy === 'percentage')
    return <PercentagePanel studio={studio} onStudioChange={onStudioChange} basePrice={basePrice} />;
  if (studio.strategy === 'fixed')
    return <FixedPanel studio={studio} onStudioChange={onStudioChange} basePrice={basePrice} />;
  if (studio.strategy === 'combo')
    return (
      <ComboBundlePanel studio={studio} onStudioChange={onStudioChange} basePrice={basePrice} catalog={catalog} />
    );
  return <FlashPanel studio={studio} onStudioChange={onStudioChange} basePrice={basePrice} />;
}
