import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { useLivePos, useLiveStock, useShiftProductId } from './posLive';

interface BusinessPosProductShiftScreenProps {
  onBack: () => void;
  /** Live screens hand over the product so the register adds the real item. */
  onAddToSale: (line?: { id: string; name: string; unit: number }) => void;
}

type StockState = 'in' | 'low' | 'out';

const DEMO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAeuBPQ9PDF8HJFqZbU7ZYnHtjReICQYCqWxquCZyA0eA29B75GOQjW2BsIX0p8sRTtfDpLi2hdMoi1Q-PboaBSK8_kfNzQx_F8UZAlwQZlkA4eV28w2avSNLD6KbfgdY-QCDT1tBT_Qxh-3VGysgkxM6f4Wlw8yUhWzadnR09csO0qx6RussnGks0c08-DOMezCCZb1nnAYH3RSHZaVhB3v4hUf-B60k8CS4uaFPz27Fg5bk2UZNyc2Q";

const STOCK_STATES: { key: StockState; label: string; hint: string; chip: string; active: string }[] = [
  { key: 'in', label: 'In Stock', hint: 'Sells on register', chip: 'bg-badge-discount-bg text-badge-discount-text', active: 'bg-badge-discount-text text-white border-badge-discount-text' },
  { key: 'low', label: 'Low Stock', hint: 'Warns at 5 left', chip: 'bg-secondary-fixed text-on-secondary-fixed', active: 'bg-on-secondary-fixed text-white border-on-secondary-fixed' },
  { key: 'out', label: 'Out of Stock', hint: '86’d for this shift', chip: 'bg-surface-container text-text-secondary', active: 'bg-text-secondary text-white border-text-secondary' },
];

export function BusinessPosProductShiftScreen({ onBack, onAddToSale }: BusinessPosProductShiftScreenProps) {
  const [count, setCount] = useState(18);
  const [state, setState] = useState<StockState>('in');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const live = hasApiConfig();
  const pos = useLivePos();
  const liveStock = useLiveStock();
  const shiftId = useShiftProductId();
  const liveRow = live ? (liveStock.rows.find((row) => row.item.id === shiftId) ?? liveStock.rows[0] ?? null) : null;
  const tillLabel = live ? (pos.isOpen ? pos.tillName : 'No till open') : 'Till 01';
  const price = liveRow ? liveRow.product.price : 14000;

  // Live: start from the product's real count and state.
  useEffect(() => {
    if (!liveRow) return;
    setCount(liveRow.quantity ?? 0);
    setState(liveRow.availability);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRow?.item.id, liveRow?.quantity]);

  useEffect(() => {
    if (live && liveStock.error) showToast(apiErrorMessage(liveStock.error, 'Could not load this product.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStock.error]);

  const bump = (delta: number) => {
    setCount((value) => Math.max(0, value + delta));
    if (live) return; // saved with Save
    setSaving(true);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaving(false);
      showToast('Shift stock synced to register');
    }, 700);
  };

  const save = () => {
    if (live) {
      if (!liveRow) {
        showToast('Pick a product from the stock view first');
        return;
      }
      setSaving(true);
      liveStock
        .setQuantity(liveRow.item.id, count, 'Till shift count')
        .then(() => showToast(`Stock saved · ${count} on hand`))
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not save stock.')))
        .finally(() => setSaving(false));
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      showToast('Shift stock status saved for Till 01');
    }, 600);
  };

  const steps = [
    { label: '-5', delta: -5 },
    { label: '-1', delta: -1 },
    { label: '+1', delta: 1 },
    { label: '+5', delta: 5 },
  ];

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between gap-space-xs">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all shrink-0"
          >
            <Icon name="arrow_back" className="text-[21px]" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">Shift Stock Status</span>
            <span className="font-caption text-caption text-text-secondary leading-none">
              {live ? `${tillLabel} · ${pos.session ? 'Shift active' : 'No open shift'}` : 'Till 01 · Shift #2 Active'}
            </span>
          </div>
          <button
            type="button"
            aria-label="Scan barcode"
            onClick={() => showToast(live ? 'Barcode scanning is coming soon' : 'Barcode scanner ready for SKU input')}
            className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="barcode_scanner" className="text-primary text-[16px]" />
          </button>
        </div>
      </header>

      <div className="flex flex-col pb-32">
        {/* Product hero */}
        <div className="px-margin pt-space-xs">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex items-center gap-space-xs">
            <img
              src={liveRow ? liveRow.product.image : DEMO_IMAGE}
              alt={liveRow ? liveRow.product.name : 'Woodfire Aged Ribeye Steak'}
              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-surface-container"
            />
            <div className="flex flex-col min-w-0 gap-0.5">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {liveRow ? liveRow.product.name : 'Woodfire Aged Ribeye Steak'}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                {liveRow
                  ? `${liveRow.item.category?.name ?? 'Uncategorised'} · SKU ${liveRow.item.sku ?? '—'}`
                  : '400g · Grills station · SKU WRS-400'}
              </span>
              <span className="flex items-center gap-space-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-badge-discount-text">{live ? (pos.offline.isOnline ? 'Online' : 'Offline') : 'Station online · 4 sold today'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing card */}
        <div className="px-margin pt-space-xs">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">Pricing</span>
            <div className="flex items-end justify-between gap-space-xs">
              <div className="flex flex-col">
                <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">{naira(price)}</span>
                <span className="font-caption text-caption text-text-secondary">{live ? 'Base price' : <>Base price · member {naira(13300)}</>}</span>
              </div>
              <span className="h-6 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center">
                Margin 62%
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-xs border-t border-border-subtle pt-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Tax band · VAT 7.5% applied</span>
              <button
                type="button"
                onClick={() => showToast('Price editing is restricted to managers')}
                className="h-8 px-space-xs rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <Icon name="lock" className="text-text-secondary text-[14px]" />
                <span>Adjust price</span>
              </button>
            </div>
          </div>
        </div>

        {/* Register availability toggle */}
        <div className="px-margin pt-space-xs">
          <div className="bg-surface-canvas rounded-2xl px-space-sm py-space-xs shadow-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0">
                <Icon name="point_of_sale" className="text-primary text-[18px]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">Available on this register</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {available ? `Visible in ${tillLabel} grid` : `Hidden from ${tillLabel} grid`}
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => {
                if (live) {
                  showToast('Hiding items from one register is coming soon');
                  return;
                }
                setAvailable((value) => !value);
                showToast(available ? 'Item hidden from this register' : 'Item published to this register');
              }}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ${available ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span
                className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Stock chips */}
        <div className="px-margin pt-space-sm pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Stock Signal For This Shift
          </span>
        </div>
        <div className="px-margin grid grid-cols-3 gap-space-2xs">
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
                  showToast(live ? `${item.label} — press Save to publish` : `${item.label} set for this shift`);
                }}
                className={`rounded-xl px-space-2xs py-space-xs flex flex-col items-center gap-0.5 border-2 transition-all active:scale-95 ${
                  isActive ? item.active : `bg-surface-canvas border-transparent shadow-sm ${item.chip}`
                }`}
              >
                <span className={`font-label-sm text-label-sm font-semibold ${isActive ? '' : 'text-on-surface'}`}>{item.label}</span>
                <span className={`font-caption text-caption ${isActive ? 'opacity-80' : 'text-text-secondary'}`}>{item.hint}</span>
              </button>
            );
          })}
        </div>

        {/* Stepper deck */}
        <div className="px-margin pt-space-sm">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Quick Adjustment
              </span>
              <span
                className={`h-6 px-space-xs rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${
                  saving ? 'bg-surface-tint-blue text-primary' : 'bg-badge-discount-bg text-badge-discount-text'
                }`}
              >
                <Icon name={saving ? 'sync' : 'cloud_done'} className="text-[13px]" />
                <span>{saving ? 'Syncing…' : 'Synced'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-secondary">Counted on shelf</span>
                <span className="font-heading-md text-heading-md text-on-surface font-bold tabular-nums">{count}</span>
              </div>
              <div className="flex gap-space-2xs">
                {steps.map((step) => (
                  <button
                    key={step.label}
                    type="button"
                    onClick={() => bump(step.delta)}
                    className="w-11 h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-bold active:scale-95 transition-transform"
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const input = window.prompt('Set exact counted stock', String(count));
                if (input === null) return;
                const parsed = Number(input.replace(/[^\d]/g, ''));
                if (Number.isNaN(parsed)) return;
                setCount(parsed);
                showToast(`Count set to ${parsed} units`);
              }}
              className="h-9 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
            >
              <Icon name="pin" className="text-primary text-[15px]" />
              <span>Set exact count…</span>
            </button>
            <span className="font-caption text-caption text-text-secondary">
              Count is shift-local: it resets at close unless committed to the master catalogue.
            </span>
          </div>
        </div>

        {/* Governance note */}
        <div className="px-margin pt-space-xs">
          <div className="flex items-start gap-space-2xs bg-surface-tint-blue rounded-xl px-space-xs py-space-2xs">
            <Icon name="policy" className="text-primary text-[15px] mt-0.5 shrink-0" />
            <span className="font-caption text-caption text-on-surface">
              Shift overrides are logged against Till 01 · manager approval needed to edit base stock.
            </span>
          </div>
        </div>
      </div>

      {/* Sticky deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex gap-space-xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => (liveRow ? onAddToSale({ id: liveRow.item.id, name: liveRow.product.name, unit: price }) : onAddToSale())}
          disabled={!available || state === 'out' || (live && !liveRow)}
          className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <Icon name="add_shopping_cart" className="text-[17px]" />
          <span>Add to Sale · {naira(price)}</span>
        </button>
        <button
          type="button"
          onClick={save}
          className="w-28 h-11 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs active:scale-[0.98] transition-transform"
        >
          <Icon name="save" className="text-text-secondary text-[16px]" />
          <span>Save</span>
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
