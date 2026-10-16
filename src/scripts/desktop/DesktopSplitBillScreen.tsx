import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';
import { computeTotals, formatNaira, type PosTerminalLine } from './posTerminalData';
import { usePosSettings } from '../../context/PosSettingsContext';

interface DesktopSplitBillScreenProps {
  cart: PosTerminalLine[];
  onBack?: () => void;
  onPay?: () => void;
}

const TIP_OPTIONS = [
  { id: 'none', label: 'No Tip', percent: 0 },
  { id: 'p10', label: '10%', percent: 10 },
  { id: 'p15', label: '15%', percent: 15 },
];

interface Diner {
  id: string;
  name: string;
  /** Share of the bill (before tip) in NGN. */
  share: number;
  paid: boolean;
}

const DINER_NAMES = ['You', 'Guest 2', 'Guest 3', 'Guest 4', 'Guest 5', 'Guest 6'];

/**
 * Working split-bill workspace. Splits the live ticket evenly across a chosen
 * number of diners (or by selected items), applies an optional table tip, and
 * lets the cashier mark each share settled before taking it to payment.
 */
export function DesktopSplitBillScreen({ cart, onBack, onPay }: DesktopSplitBillScreenProps) {
  const { taxMode, taxRate, taxLabel } = usePosSettings();
  const totals = useMemo(() => computeTotals(cart, taxMode, taxRate / 100), [cart, taxMode, taxRate]);
  const [mode, setMode] = useState<'even' | 'items'>('even');
  const [dinerCount, setDinerCount] = useState(2);
  const [tipId, setTipId] = useState('none');
  const [paidIds, setPaidIds] = useState<string[]>([]);
  /** itemKey -> diner index, for the "by item" split. */
  const [itemAssign, setItemAssign] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  const tipPercent = TIP_OPTIONS.find((tip) => tip.id === tipId)?.percent ?? 0;
  const tipAmount = Math.round((totals.total * tipPercent) / 100);
  const grandTotal = totals.total + tipAmount;

  // Even split: divide the grand total across diners, remainder to the first.
  const diners: Diner[] = useMemo(() => {
    if (mode === 'even') {
      const base = Math.floor(grandTotal / dinerCount);
      const remainder = grandTotal - base * dinerCount;
      return Array.from({ length: dinerCount }, (_, index) => ({
        id: `diner-${index}`,
        name: DINER_NAMES[index] ?? `Guest ${index + 1}`,
        share: index === 0 ? base + remainder : base,
        paid: paidIds.includes(`diner-${index}`),
      }));
    }
    // By-item split: sum each diner's assigned lines + their share of VAT/tip.
    const shares = Array.from({ length: dinerCount }, () => 0);
    cart.forEach((line) => {
      const lineTotal = (line.unit - (line.promo ?? 0)) * line.qty;
      const assigned = itemAssign[line.id];
      if (assigned !== undefined && shares[assigned] !== undefined) shares[assigned] += lineTotal;
    });
    const net = totals.net || 1;
    return shares.map((share, index) => ({
      id: `diner-${index}`,
      name: DINER_NAMES[index] ?? `Guest ${index + 1}`,
      // Scale the diner's net by the VAT ratio, then add their tip slice.
      share: Math.round(share * (totals.total / net)) + Math.round((share / net) * tipAmount),
      paid: paidIds.includes(`diner-${index}`),
    }));
  }, [mode, dinerCount, grandTotal, cart, itemAssign, paidIds, totals, tipAmount]);

  const paidTotal = diners.filter((diner) => diner.paid).reduce((sum, diner) => sum + diner.share, 0);
  const remainingTotal = grandTotal - paidTotal;
  const allPaid = paidTotal >= grandTotal;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onBack?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const togglePaid = (diner: Diner) => {
    setPaidIds((prev) => {
      const next = prev.includes(diner.id) ? prev.filter((id) => id !== diner.id) : [...prev, diner.id];
      const nowPaid = next.includes(diner.id);
      flash(nowPaid ? `${diner.name}'s share (${formatNaira(diner.share)}) marked settled.` : `${diner.name}'s share reopened.`);
      return next;
    });
  };

  return (
    <CheckoutHubShell>
      <div className="w-full">
        {/* Header */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="call_split" className="text-primary text-[24px]" />
              <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                Split The Bill
              </span>
            </div>
            <div className="flex items-baseline gap-space-md flex-wrap">
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Split The Bill</h1>
              <span className="font-caption text-caption text-text-tertiary">
                {cart.length} line items • {formatNaira(totals.total)}
                {taxMode !== 'none' ? ` · incl. ${taxRate}% ${taxLabel}` : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xl z-10 bg-surface-subtle p-space-md rounded-xl">
            <div className="flex flex-col text-right">
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Total Table Bill
              </span>
              <span className="font-display-hero text-display-hero text-primary font-bold">
                {formatNaira(grandTotal)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
              <Icon name="receipt_long" className="text-[28px]" />
            </div>
          </div>
        </div>

        {/* Progress: paid vs remaining */}
        <div className="mt-space-lg bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
          <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
            {diners.map((diner) => (
              <div
                key={diner.id}
                className={`h-full transition-all duration-500 ${diner.paid ? 'bg-badge-discount-text' : 'bg-primary-container'}`}
                style={{ width: `${grandTotal > 0 ? (diner.share / grandTotal) * 100 : 0}%` }}
                title={`${diner.name}: ${formatNaira(diner.share)} ${diner.paid ? 'Paid' : 'Pending'}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1">
            <div className="flex items-center gap-2 font-caption text-caption text-text-secondary">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-badge-discount-text" />
              <span>
                Settled: <strong className="text-text-primary">{formatNaira(paidTotal)}</strong>
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary-container ml-2" />
              <span>
                Pending: <strong className="text-text-primary">{formatNaira(remainingTotal)}</strong>
              </span>
            </div>
            <span className="font-caption text-caption text-text-tertiary">
              {diners.filter((diner) => diner.paid).length}/{diners.length} shares paid
            </span>
          </div>
        </div>

        {/* Controls: split mode + tip */}
        <div className="mt-space-md flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle">
            <button
              type="button"
              onClick={() => setMode('even')}
              className={`h-9 px-space-sm rounded-lg font-label-sm text-label-sm font-semibold transition-colors ${
                mode === 'even' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Split Evenly
            </button>
            <button
              type="button"
              onClick={() => setMode('items')}
              className={`h-9 px-space-sm rounded-lg font-label-sm text-label-sm font-semibold transition-colors ${
                mode === 'items' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Split by Item
            </button>
          </div>

          {mode === 'even' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle">
              <span className="px-space-xs font-caption text-caption text-text-secondary">Diners</span>
              <button
                type="button"
                onClick={() => setDinerCount((count) => Math.max(2, count - 1))}
                className="w-8 h-8 rounded-lg bg-surface-canvas text-text-secondary hover:text-text-primary font-bold shadow-sm"
              >
                −
              </button>
              <span className="w-8 text-center font-label-md text-label-md font-bold text-text-primary">{dinerCount}</span>
              <button
                type="button"
                onClick={() => setDinerCount((count) => Math.min(DINER_NAMES.length, count + 1))}
                className="w-8 h-8 rounded-lg bg-surface-canvas text-text-secondary hover:text-text-primary font-bold shadow-sm"
              >
                +
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle">
            <span className="px-space-xs font-caption text-caption text-text-secondary">Tip</span>
            {TIP_OPTIONS.map((tip) => (
              <button
                key={tip.id}
                type="button"
                onClick={() => setTipId(tip.id)}
                className={`h-8 px-space-xs rounded-lg font-label-sm text-label-sm font-semibold transition-colors ${
                  tipId === tip.id ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diner shares */}
        <div className="mt-space-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {diners.map((diner) => (
            <div
              key={diner.id}
              className={`bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm transition-opacity ${
                diner.paid ? 'opacity-90' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold font-heading-sm text-heading-sm ${
                      diner.paid ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {diner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-text-primary block">{diner.name}</span>
                    <span
                      className={`font-caption text-caption font-semibold ${
                        diner.paid ? 'text-badge-discount-text' : 'text-text-tertiary'
                      }`}
                    >
                      {diner.paid ? 'Settled' : 'Pending'}
                    </span>
                  </div>
                </div>
                {diner.paid && <Icon name="check_circle" className="text-badge-discount-text text-[22px]" />}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                  Share
                </span>
                <span className="font-heading-md text-heading-md font-bold text-primary">{formatNaira(diner.share)}</span>
              </div>

              {mode === 'items' && (
                <div className="flex flex-col gap-1 pt-1 border-t border-surface-container">
                  {cart.map((line) => (
                    <label key={line.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`assign-${line.id}`}
                        checked={itemAssign[line.id] === Number(diner.id.split('-')[1])}
                        onChange={() =>
                          setItemAssign((prev) => ({ ...prev, [line.id]: Number(diner.id.split('-')[1]) }))
                        }
                        className="w-3.5 h-3.5 text-primary accent-primary"
                      />
                      <span className="font-caption text-caption text-text-secondary truncate">{line.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => togglePaid(diner)}
                className={`mt-1 h-11 rounded-xl font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  diner.paid
                    ? 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                <Icon name={diner.paid ? 'undo' : 'payments'} className="text-[18px]" />
                <span>{diner.paid ? 'Reopen Share' : `Mark ${formatNaira(diner.share)} Paid`}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-space-lg flex flex-col md:flex-row items-stretch md:items-center gap-space-sm">
          <button
            type="button"
            onClick={onPay}
            disabled={!allPaid && paidTotal === 0}
            className="flex-1 h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-space-xs disabled:opacity-40 disabled:hover:bg-primary-container"
          >
            <Icon name="bolt" className="text-[20px]" />
            <span>
              {allPaid
                ? 'All Shares Settled — Finish'
                : paidTotal > 0
                  ? `Continue to Payment (${formatNaira(remainingTotal)} left)`
                  : 'Mark a share paid to continue'}
            </span>
          </button>
          <div className="grid grid-cols-2 gap-space-sm md:w-auto">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="py-2.5 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 transition"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => flash('Split slips sent to terminal printer.')}
              className="py-2.5 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 transition"
            >
              <Icon name="print" className="text-[18px]" />
              Print Split Slips
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </CheckoutHubShell>
  );
}
