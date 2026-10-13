import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { formatNaira, VAT_RATE } from './posTerminalData';

interface DesktopPosProductShiftScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
  onAddToSale: () => void;
}

type StockState = 'in' | 'low' | 'out';

const STOCK_STATES: {
  key: StockState;
  label: string;
  hint: string;
  chip: string;
  active: string;
}[] = [
  {
    key: 'in',
    label: 'In Stock',
    hint: 'Sells on register',
    chip: 'bg-badge-discount-bg text-badge-discount-text',
    active: 'bg-badge-discount-text text-white border-badge-discount-text',
  },
  {
    key: 'low',
    label: 'Low Stock',
    hint: 'Warns at 5 left',
    chip: 'bg-secondary-fixed text-on-secondary-fixed',
    active: 'bg-on-secondary-fixed text-white border-on-secondary-fixed',
  },
  {
    key: 'out',
    label: 'Out of Stock',
    hint: '86’d for this shift',
    chip: 'bg-surface-container-high text-text-secondary',
    active: 'bg-text-secondary text-white border-text-secondary',
  },
];

const STEPS = [
  { label: '-5', delta: -5 },
  { label: '-1', delta: -1 },
  { label: '+1', delta: 1 },
  { label: '+5', delta: 5 },
];

const PRODUCT_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q';

const BASE_PRICE = 14000;
const MEMBER_PRICE = 13300;
const VAT_PERCENT = (VAT_RATE * 100).toFixed(1);

export function DesktopPosProductShiftScreen({ onNav, onBack, onAddToSale }: DesktopPosProductShiftScreenProps) {
  const [count, setCount] = useState(18);
  const [state, setState] = useState<StockState>('in');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exactValue, setExactValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const bump = (delta: number) => {
    setCount((value) => Math.max(0, value + delta));
    setSaving(true);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaving(false);
      showToast('Shift stock synced to register');
    }, 700);
  };

  const save = () => {
    setSaving(true);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaving(false);
      showToast('Shift stock status saved for Till 01');
    }, 600);
  };

  const applyExactCount = () => {
    const trimmed = exactValue.trim();
    const parsed = Number(trimmed.replace(/[^\d]/g, ''));
    if (trimmed === '' || Number.isNaN(parsed)) {
      showToast('Enter a valid counted stock number');
      return;
    }
    setCount(parsed);
    setExactValue('');
    showToast(`Count set to ${parsed} units`);
  };

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Operational sub-header */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-2.5 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
            <Icon name="barcode_scanner" className="text-primary text-[17px]" />
            <span className="uppercase tracking-wider font-semibold">Shift Stock Status</span>
            <span className="text-text-tertiary">•</span>
            <span>Till 01 · Shift #2 Active</span>
          </div>
          <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
            <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text" />
            <span>Station online · 4 sold today</span>
          </div>
        </div>
      </section>

      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-space-xs self-start font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Back to Register</span>
        </button>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Catalogue Control</span>
              <span>•</span>
              <span>Till 01</span>
              <span>•</span>
              <span>Shift #2 Active</span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Shift Stock Status</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              Tune pricing, register availability and the shift-local stock signal for Woodfire Aged Ribeye Steak
              without touching the master catalogue.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              aria-label="Scan barcode"
              onClick={() => showToast('Barcode scanner ready for SKU input')}
              className="w-11 h-11 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors shadow-sm"
            >
              <Icon name="barcode_scanner" className="text-[20px]" />
            </button>
            <button
              type="button"
              onClick={onAddToSale}
              disabled={!available || state === 'out'}
              className="inline-flex items-center gap-space-xs px-space-lg h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            >
              <Icon name="add_shopping_cart" className="text-[18px]" />
              <span>Add to Sale · {formatNaira(BASE_PRICE)}</span>
            </button>
          </div>
        </div>

        {/* Metrics bento row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Metric 1: Pricing */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Pricing</span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs font-bold tracking-tight">
                  {formatNaira(BASE_PRICE)}
                </span>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                Margin 62%
              </span>
            </div>
            <span className="mt-space-md font-caption text-caption text-text-secondary">
              Base price · member {formatNaira(MEMBER_PRICE)}
            </span>
          </div>

          {/* Metric 2: Tax band */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">Tax band</span>
                <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">
                  VAT {VAT_PERCENT}% applied
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                <Icon name="receipt_long" className="text-[20px]" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Price editing is restricted to managers')}
              className="mt-space-md h-8 px-space-xs rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 self-start hover:bg-surface-container-high transition-colors"
            >
              <Icon name="lock" className="text-text-secondary text-[14px]" />
              <span>Adjust price</span>
            </button>
          </div>

          {/* Metric 3: Counted on shelf */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Counted on shelf
                </span>
                <span className="font-display-hero text-display-hero text-on-surface leading-none mt-space-2xs tabular-nums">
                  {count}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary shrink-0">
                <Icon name="inventory_2" className="text-[20px]" />
              </div>
            </div>
            <span className="mt-space-md font-caption text-caption text-text-tertiary">
              Shift-local units · resets at close
            </span>
          </div>

          {/* Metric 4: Register availability */}
          <div className="p-space-lg rounded-xl bg-surface-tint-blue shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-col min-w-0">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                  Available on this register
                </span>
                <span className="font-heading-sm text-heading-sm text-primary mt-space-2xs font-semibold truncate">
                  {available ? 'Visible in Till 01 grid' : 'Hidden from Till 01 grid'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-canvas flex items-center justify-center text-primary shrink-0">
                <Icon name="point_of_sale" className="text-[20px]" />
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => {
                setAvailable((value) => !value);
                showToast(available ? 'Item hidden from this register' : 'Item published to this register');
              }}
              className={`mt-space-md w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 self-start ${
                available ? 'bg-primary' : 'bg-border-subtle'
              }`}
            >
              <span
                className={`block w-6 h-6 rounded-full bg-surface-canvas shadow transition-transform ${
                  available ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Body: product + stock signal vs stepper deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left: hero, stock chips, governance */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Product hero */}
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm border border-border-subtle flex items-center gap-space-md">
              <img
                src={PRODUCT_IMG}
                alt="Woodfire Aged Ribeye Steak"
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-surface-container-high"
              />
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="font-heading-sm text-heading-sm text-on-surface truncate">
                  Woodfire Aged Ribeye Steak
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  400g · Grills station · SKU WRS-400
                </span>
                <span className="flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  <span className="font-caption text-caption text-badge-discount-text">
                    Station online · 4 sold today
                  </span>
                </span>
              </div>
            </div>

            {/* Stock chips */}
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Stock Signal For This Shift
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
                {STOCK_STATES.map((item) => {
                  const isActive = state === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setState(item.key);
                        if (item.key === 'out') setCount(0);
                        if (item.key === 'in' && count === 0) setCount(18);
                        showToast(`${item.label} set for this shift`);
                      }}
                      className={`rounded-xl px-space-sm py-space-xs flex flex-col items-center gap-0.5 border-2 transition-all hover:scale-[1.01] ${
                        isActive ? item.active : `bg-surface-canvas border-transparent shadow-sm ${item.chip}`
                      }`}
                    >
                      <span
                        className={`font-label-sm text-label-sm font-semibold ${isActive ? '' : 'text-on-surface'}`}
                      >
                        {item.label}
                      </span>
                      <span className={`font-caption text-caption ${isActive ? 'opacity-80' : 'text-text-secondary'}`}>
                        {item.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Governance note */}
            <div className="flex items-start gap-space-2xs bg-surface-tint-blue rounded-xl px-space-sm py-space-xs">
              <Icon name="policy" className="text-primary text-[15px] mt-0.5 shrink-0" />
              <span className="font-caption text-caption text-on-surface">
                Shift overrides are logged against Till 01 · manager approval needed to edit base stock.
              </span>
            </div>
          </div>

          {/* Right: quick adjustment deck */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="tune" className="text-primary text-[22px]" />
                <h2 className="font-heading-md text-heading-md text-on-surface">Quick Adjustment</h2>
              </div>
              <span
                className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${
                  saving ? 'bg-surface-tint-blue text-primary' : 'bg-badge-discount-bg text-badge-discount-text'
                }`}
              >
                <Icon name={saving ? 'sync' : 'cloud_done'} className="text-[13px]" />
                <span>{saving ? 'Syncing…' : 'Synced'}</span>
              </span>
            </div>

            {/* Stepper deck */}
            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Counted on shelf</span>
                  <span className="font-heading-md text-heading-md text-on-surface font-bold tabular-nums">
                    {count}
                  </span>
                </div>
                <div className="flex gap-space-2xs">
                  {STEPS.map((step) => (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => bump(step.delta)}
                      className="w-11 h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors active:scale-95"
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-space-xs">
                <div className="relative flex-1">
                  <Icon
                    name="pin"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[15px]"
                  />
                  <input
                    type="number"
                    min={0}
                    value={exactValue}
                    onChange={(e) => setExactValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyExactCount();
                    }}
                    placeholder="Set exact counted stock"
                    className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyExactCount}
                  className="h-9 px-space-xs rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 hover:bg-surface-container-high transition-colors shrink-0"
                >
                  <Icon name="pin" className="text-primary text-[15px]" />
                  <span>Set exact count…</span>
                </button>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Count is shift-local: it resets at close unless committed to the master catalogue.
              </span>
            </div>

            {/* Action deck */}
            <div className="p-space-md rounded-xl bg-surface-canvas border border-border-subtle shadow-md flex gap-space-xs">
              <button
                type="button"
                onClick={onAddToSale}
                disabled={!available || state === 'out'}
                className="flex-1 h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
              >
                <Icon name="add_shopping_cart" className="text-[17px]" />
                <span>Add to Sale · {formatNaira(BASE_PRICE)}</span>
              </button>
              <button
                type="button"
                onClick={save}
                className="w-28 h-12 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-container-high transition-colors active:scale-[0.98]"
              >
                <Icon name="save" className="text-text-secondary text-[16px]" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
