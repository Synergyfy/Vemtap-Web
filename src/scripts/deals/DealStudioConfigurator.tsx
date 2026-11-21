/**
 * Shared Deal Studio configurator — the offer setup screen used by both the
 * mobile and desktop wizards after the merchant has chosen a structure and
 * live catalogue products.
 */
import { Icon } from '../../components/ui/Icon';
import {
  DEFAULT_BUNDLE_CATALOG,
  DEAL_TYPE_OPTIONS,
  describeComboRules,
  describeQuantityTiers,
  formatDealAmount,
  parseDealAmount,
  resolveComboPricing,
  resolvePriceSlashPricing,
  resolveQuantityPricing,
  selectedRegularTotal,
  validateDealConfiguration,
  type ComboProduct,
  type DealStructure,
  type DealStudioDraft,
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
          className="w-20 font-heading-sm text-heading-sm font-bold text-primary text-right bg-transparent outline-none p-0"
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
/* Structure selector                                                  */
/* ------------------------------------------------------------------ */

export function DealTypeSelector({
  selected,
  onSelect,
  variant = 'mobile',
}: {
  selected: DealStructure | null;
  onSelect: (id: DealStructure) => void;
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
                  {item.requires && (
                    <p className="font-caption text-caption text-primary mt-0.5 text-left">{item.requires}</p>
                  )}
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
          <button
            key={item.id}
            className={`rounded-xl overflow-hidden transition-all duration-200 bg-surface-container-lowest px-space-sm py-space-xs text-left flex items-center gap-space-xs cursor-pointer select-none ${
              isSelected ? 'shadow-sm ring-1 ring-primary' : 'shadow-xs ring-1 ring-border-subtle'
            }`}
            type="button"
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
              {item.requires && (
                <span className="mt-1 inline-flex font-caption text-caption text-primary font-semibold">
                  {item.requires}
                </span>
              )}
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
              }`}
            >
              <Icon name="check" className="text-[14px]" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Offer panels                                                        */
/* ------------------------------------------------------------------ */

const PERCENT_PRESETS = [10, 15, 20, 25, 30, 40];

function BundlePanel({
  studio,
  onStudioChange,
  catalog,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  catalog: ComboProduct[];
}) {
  const combo = studio.combo;
  const setCombo = (patch: Partial<typeof combo>) => onStudioChange({ combo: { ...combo, ...patch } });
  const priceById = new Map(catalog.map((product) => [product.id, product.price]));
  const nameById = new Map(catalog.map((product) => [product.id, product.name]));
  const selectedProducts = studio.productIds
    .map((id) => catalog.find((product) => product.id === id))
    .filter((product): product is ComboProduct => Boolean(product));
  const pricing = resolveComboPricing(combo, selectedRegularTotal(studio, catalog), catalog);
  const rules = describeComboRules(combo, selectedRegularTotal(studio, catalog), catalog);

  const setLineQty = (productId: string, qty: number) =>
    setCombo({
      items: combo.items.map((line) => (line.productId === productId ? { ...line, qty } : line)),
    });

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col gap-space-2xs">
        <span className="font-label-md text-label-md text-text-primary font-semibold">Products in this bundle</span>
        {selectedProducts.map((product) => {
          const line = combo.items.find((item) => item.productId === product.id);
          return (
            <div
              key={product.id}
              className="flex items-center justify-between gap-space-xs bg-surface-container-lowest rounded-lg px-space-sm py-space-2xs ring-1 ring-border-subtle"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold truncate">
                  {nameById.get(product.id) ?? product.name}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  ₦{formatDealAmount(priceById.get(product.id) ?? product.price)} each
                </span>
              </div>
              <QtyStepper
                decreaseLabel={`Decrease quantity for ${product.name}`}
                increaseLabel={`Increase quantity for ${product.name}`}
                value={line?.qty ?? 1}
                onChange={(value) => setLineQty(product.id, value)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-space-2xs">
        <span className="font-label-md text-label-md text-text-primary font-semibold">
          One combined deal price
        </span>
        <p className="font-caption text-caption text-text-secondary leading-snug">
          The customer pays one total for every product and quantity above.
        </p>
      </div>

      <AmountField
        label="Combined deal price"
        prefix="₦"
        value={combo.bundlePromoPrice}
        onChange={(value) => setCombo({ pricingMode: 'price', bundlePromoPrice: value })}
      />

      <DealMathRows
        rows={[
          { label: 'Regular combined price', value: `₦${formatDealAmount(pricing.originalTotal)}`, tone: 'strike' },
          {
            label: 'Customer savings',
            value: `₦${formatDealAmount(Math.max(pricing.savings, 0))} (${pricing.savingsPct}% off)`,
            tone: 'savings',
          },
          { label: 'Bundle deal price', value: `₦${formatDealAmount(pricing.dealPrice)}`, tone: 'primary' },
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
      <DealConfigErrors errors={validateDealConfiguration(studio, pricing.originalTotal, catalog)} />
    </div>
  );
}

function PriceSlashPanel({
  studio,
  onStudioChange,
  regularTotal,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  regularTotal: number;
}) {
  const slash = studio.priceSlash;
  const setSlash = (patch: Partial<typeof slash>) => onStudioChange({ priceSlash: { ...slash, ...patch } });
  const pricing = resolvePriceSlashPricing(studio, regularTotal);

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col gap-space-2xs">
        {(
          [
            { id: 'price', label: 'Set the new price', description: 'Enter the exact amount the customer pays.' },
            { id: 'percentage', label: 'Choose a percentage off', description: 'The deal price is calculated for you.' },
          ] as const
        ).map((mode) => (
          <label
            key={mode.id}
            className={`rounded-lg px-space-sm py-space-2xs flex items-center gap-space-xs cursor-pointer transition-colors ${
              slash.mode === mode.id ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
            }`}
          >
            <input
              aria-label={mode.label}
              checked={slash.mode === mode.id}
              className="w-4 h-4 text-primary-container focus:ring-0"
              name="price_slash_mode"
              type="radio"
              onChange={() => setSlash({ mode: mode.id })}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{mode.label}</span>
              <span className="font-caption text-caption text-text-secondary leading-snug">{mode.description}</span>
            </div>
          </label>
        ))}
      </div>

      {slash.mode === 'price' ? (
        <AmountField
          label="New deal price"
          prefix="₦"
          value={slash.newPrice}
          onChange={(value) => setSlash({ newPrice: value })}
        />
      ) : (
        <ChipRow
          active={slash.discountPct}
          options={PERCENT_PRESETS}
          onSelect={(value: number) => setSlash({ discountPct: value })}
          format={(value: number) => `${value}% off`}
        />
      )}

      <DealMathRows
        rows={[
          { label: 'Regular price', value: `₦${formatDealAmount(pricing.originalTotal)}`, tone: 'strike' },
          {
            label: 'Customer savings',
            value: `₦${formatDealAmount(Math.max(pricing.savings, 0))} (${pricing.savingsPct}% off)`,
            tone: 'savings',
          },
          { label: 'New deal price', value: `₦${formatDealAmount(pricing.dealPrice)}`, tone: 'primary' },
        ]}
      />
      <DealConfigErrors errors={validateDealConfiguration(studio, regularTotal, [])} />
    </div>
  );
}

function BuyMorePanel({
  studio,
  onStudioChange,
  regularTotal,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  regularTotal: number;
}) {
  const pricing = resolveQuantityPricing(studio, regularTotal);
  const tiers = [...studio.quantityTiers].sort((a, b) => a.quantity - b.quantity);
  const setTiers = (next: typeof studio.quantityTiers) => onStudioChange({ quantityTiers: next });

  const updateTier = (id: string, patch: Partial<(typeof studio.quantityTiers)[number]>) =>
    setTiers(studio.quantityTiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)));

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col gap-space-2xs">
        <span className="font-label-md text-label-md text-text-primary font-semibold">Quantity levels</span>
        <p className="font-caption text-caption text-text-secondary">
          Set the quantity a customer must buy and the total price they pay at that level. Each level should save more
          per unit than the one before it.
        </p>
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            className="rounded-xl bg-surface-container-lowest ring-1 ring-border-subtle p-space-sm flex flex-col gap-space-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">Level {index + 1}</span>
              {studio.quantityTiers.length > 2 && (
                <button
                  aria-label={`Remove level ${index + 1}`}
                  className="text-text-tertiary hover:text-error"
                  type="button"
                  onClick={() => setTiers(studio.quantityTiers.filter((entry) => entry.id !== tier.id))}
                >
                  <Icon name="delete" className="text-[16px]" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between bg-surface-subtle rounded-lg px-space-sm py-space-2xs">
              <span className="font-label-sm text-label-sm text-text-primary">Buy</span>
              <QtyStepper
                decreaseLabel={`Decrease quantity for level ${index + 1}`}
                increaseLabel={`Increase quantity for level ${index + 1}`}
                min={2}
                value={tier.quantity}
                onChange={(value) => updateTier(tier.id, { quantity: value })}
              />
            </div>
            <AmountField
              label="Total price at this level"
              prefix="₦"
              value={tier.price}
              onChange={(value) => updateTier(tier.id, { price: value })}
            />
          </div>
        ))}
        <button
          className="self-start flex items-center gap-1 px-space-xs py-1 rounded-lg font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors"
          type="button"
          onClick={() =>
            setTiers([
              ...studio.quantityTiers,
              {
                id: `tier-${Date.now()}`,
                quantity: Math.max(...studio.quantityTiers.map((tier) => tier.quantity), 1) + 1,
                price: 0,
              },
            ])
          }
        >
          <Icon name="add" className="text-[14px]" />
          <span>Add another level</span>
        </button>
      </div>

      <DealMathRows
        rows={[
          {
            label: 'Headline regular total',
            value: `₦${formatDealAmount(pricing.originalTotal)}`,
            tone: 'strike',
          },
          { label: 'Headline savings', value: `₦${formatDealAmount(Math.max(pricing.savings, 0))}`, tone: 'savings' },
          { label: 'Headline deal price', value: `₦${formatDealAmount(pricing.dealPrice)}`, tone: 'primary' },
        ]}
      />
      <div className="rounded-lg bg-surface-tint-blue px-space-sm py-space-2xs flex flex-col gap-0.5">
        {describeQuantityTiers(studio, regularTotal).map((rule) => (
          <span key={rule} className="font-caption text-caption text-text-secondary leading-snug">
            {rule}
          </span>
        ))}
      </div>
      <DealConfigErrors errors={validateDealConfiguration(studio, regularTotal, [])} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public configurator                                                 */
/* ------------------------------------------------------------------ */

export function DealOfferConfigurator({
  studio,
  onStudioChange,
  catalog = DEFAULT_BUNDLE_CATALOG,
}: {
  studio: DealStudioDraft;
  onStudioChange: (patch: Partial<DealStudioDraft>) => void;
  catalog?: ComboProduct[];
}) {
  const regularTotal = selectedRegularTotal(studio, catalog);
  switch (studio.structure) {
    case 'bundle':
      return <BundlePanel studio={studio} onStudioChange={onStudioChange} catalog={catalog} />;
    case 'price-slash':
      return <PriceSlashPanel studio={studio} onStudioChange={onStudioChange} regularTotal={regularTotal} />;
    case 'buy-more-save-more':
      return <BuyMorePanel studio={studio} onStudioChange={onStudioChange} regularTotal={regularTotal} />;
    default:
      return null;
  }
}

/** Backwards-compatible name used by older callers. */
export const DealTypeConfigurator = DealOfferConfigurator;
