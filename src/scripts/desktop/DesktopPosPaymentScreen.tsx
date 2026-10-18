import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { computeTotals, formatNaira, type PosTerminalLine } from './posTerminalData';
import { POS_TENDER_METHODS, pointsForAmount, unlockedRewards, type PosCustomerRecord } from './posRegisterExtras';
import { PosCalculatorKeypad } from './PosCalculatorKeypad';
import { PosCustomerModal } from './PosCustomerModal';
import { PosLoyaltyPanel } from './PosLoyaltyPanel';
import { PosAddPointsModal, PosRewardsModal } from '../PosPointsModals';
import { usePosSettings } from '../../context/PosSettingsContext';

interface DesktopPosPaymentScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  /** Walk-in is fully supported — a null customer never blocks payment. */
  customer: PosCustomerRecord | null;
  onCustomerChange: (customer: PosCustomerRecord | null) => void;
  onBack: () => void;
  /** Completes the sale with the loyalty points awarded during it (drives the receipt). */
  onComplete: (loyaltyPoints: number) => void;
}

type TenderId = 'cash' | 'card' | 'transfer' | 'split';

interface TenderSlice {
  id: string;
  method: Exclude<TenderId, 'split'>;
  amount: number;
}

const METHOD_LABEL: Record<Exclude<TenderId, 'split'>, string> = {
  cash: 'Cash',
  card: 'Card / POS',
  transfer: 'Transfer',
};

const METHOD_ICON: Record<Exclude<TenderId, 'split'>, string> = {
  cash: 'payments',
  card: 'credit_card',
  transfer: 'account_balance',
};

function dispenseBreakdown(amount: number): string {
  const denominations = [1000, 500, 200, 100, 50];
  let remaining = Math.ceil(amount / 50) * 50;
  const parts: string[] = [];
  for (const denom of denominations) {
    const count = Math.floor(remaining / denom);
    if (count > 0) {
      parts.push(`${count}× ${formatNaira(denom)}`);
      remaining -= count * denom;
    }
  }
  return parts.length ? parts.join(', ') : '—';
}

export function DesktopPosPaymentScreen({
  onNav,
  cart,
  customer,
  onCustomerChange,
  onBack,
  onComplete,
}: DesktopPosPaymentScreenProps) {
  const { taxMode, taxRate, taxLabel, loyaltyEnabled, allowWalkIn } = usePosSettings();
  const totals = useMemo(() => computeTotals(cart, taxMode, taxRate / 100), [cart, taxMode, taxRate]);
  const due = totals.total;

  const [tenderMode, setTenderMode] = useState<TenderId>('cash');
  const [cashReceived, setCashReceived] = useState(due);
  const [slices, setSlices] = useState<TenderSlice[]>([]);
  const [splitMethod, setSplitMethod] = useState<Exclude<TenderId, 'split'>>('cash');
  const [splitAmount, setSplitAmount] = useState(0);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [popDrawer, setPopDrawer] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  /** Points handed out on THIS screen only — keeps "previous" vs "new" honest when the customer changes. */
  const [awardLedger, setAwardLedger] = useState<{ id: string | null; total: number }>({ id: null, total: 0 });

  const change = cashReceived - due;
  const splitPaid = slices.reduce((sum, slice) => sum + slice.amount, 0);
  const splitRemaining = Math.max(0, due - splitPaid);

  const flash = (message: string) => {
    setNote(message);
    window.setTimeout(() => setNote(null), 2600);
  };

  useEffect(() => {
    // Reset split bookkeeping whenever the amount due changes.
    setSlices([]);
    setSplitAmount(0);
  }, [due]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(event.key)) {
        const mode = POS_TENDER_METHODS.find((m) => m.key === event.key);
        if (mode) setTenderMode(mode.id as TenderId);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  // Loyalty maths shown before completing payment:
  //  - orderPoints: points attached to this order (accruing from the products' spend)
  //  - previousPoints: balance before anything awarded on this screen
  //  - projectedTotal: previous + new, once the order's points land on completion
  const orderPoints = useMemo(() => (loyaltyEnabled ? pointsForAmount(due) : 0), [due, loyaltyEnabled]);
  const awardedHere = awardLedger.id === customer?.id ? awardLedger.total : 0;
  const previousPoints = customer ? customer.points - awardedHere : 0;
  const projectedTotal = customer ? customer.points + orderPoints : 0;
  const eligibleCount = customer ? unlockedRewards(customer.points).length : 0;

  const recordAward = (points: number) =>
    setAwardLedger((prev) =>
      prev.id === (customer?.id ?? null)
        ? { id: customer?.id ?? null, total: prev.total + points }
        : { id: customer?.id ?? null, total: points },
    );

  /** Single-tender cash / card / transfer completes the sale. */
  const canComplete =
    (tenderMode === 'cash' ? cashReceived >= due : tenderMode === 'split' ? splitRemaining <= 0 : true) &&
    // Walk-in sales can be switched off in POS Settings — a customer must then be attached.
    (allowWalkIn || customer !== null);

  const completeSale = () => {
    if (completing || !canComplete) return;
    setCompleting(true);
    window.setTimeout(() => {
      setCompleting(false);
      // Land the order's own points on the customer, then hand the receipt its total.
      const landing = customer && orderPoints > 0 ? orderPoints : 0;
      if (customer && landing > 0) onCustomerChange({ ...customer, points: customer.points + landing });
      onComplete(awardedHere + landing);
    }, 900);
  };

  /** Split Multi-Tender: park a slice of the total on a method until covered. */
  const addSplitSlice = () => {
    const amount = Math.min(splitAmount || splitRemaining, splitRemaining);
    if (amount <= 0) return;
    setSlices((prev) => [...prev, { id: `slice-${Date.now()}`, method: splitMethod, amount }]);
    setSplitAmount(0);
    flash(`${formatNaira(amount)} added to ${METHOD_LABEL[splitMethod]}`);
  };

  const removeSplitSlice = (id: string) => {
    setSlices((prev) => prev.filter((slice) => slice.id !== id));
  };

  const acceptedNotes =
    cashReceived >= 10000
      ? `${Math.floor(cashReceived / 10000)} × ₦10,000 Notes`
      : `${Math.floor(cashReceived / 1000)} × ₦1,000 Notes`;

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Top Checkout Context Bar */}
      <section className="w-full py-space-sm bg-surface-canvas shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="px-space-xs py-1 rounded bg-primary-container text-on-primary font-caption text-caption font-semibold tracking-wider uppercase">
                Live Sale
              </span>
              <span className="font-heading-sm text-heading-sm text-text-primary">Ticket #TK-108</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-md text-label-md text-text-secondary">{itemCount} Line Items</span>
            </div>
            <div className="h-5 w-px bg-surface-container-highest hidden sm:block" />
            {/* Customer chip — walk-in friendly. Attach is optional. */}
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-tint-blue">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {customer ? customer.name : 'Walk-in Guest'}
                </span>
                {customer && (
                  <>
                    <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-primary text-on-primary">
                      {customer.tier}
                    </span>
                    <span className="font-caption text-caption text-primary font-medium tracking-tight">
                      {customer.points.toLocaleString()} pts
                    </span>
                    <button
                      type="button"
                      title="Remove customer"
                      aria-label="Remove customer from this sale"
                      onClick={() => {
                        onCustomerChange(null);
                        flash('Customer removed — this is now a walk-in sale.');
                      }}
                      className="w-5 h-5 rounded-full bg-surface-canvas text-text-tertiary hover:text-error flex items-center justify-center transition-colors"
                    >
                      <Icon name="close" className="text-[13px]" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-canvas text-primary hover:bg-primary hover:text-on-primary transition-colors"
                >
                  {customer ? 'Change' : 'Add Customer'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between lg:justify-end gap-space-md pt-space-2xs lg:pt-0">
            <div className="flex items-center gap-space-xs px-2.5 py-1 rounded bg-badge-discount-bg text-badge-discount-text">
              <Icon name="verified" className="text-[16px]" />
              <span className="font-caption text-caption font-semibold uppercase tracking-wider">Verified Rate</span>
            </div>
            <div className="text-right">
              <span className="block font-caption text-caption uppercase text-text-tertiary tracking-wider font-semibold">
                Amount Due
              </span>
              <span className="font-display-hero text-display-hero text-primary tracking-tight leading-none">
                {formatNaira(due)}{' '}
                <span className="font-label-sm text-label-sm font-medium text-text-secondary">NGN</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column POS Tender Workspace */}
      <main className="w-full py-space-md">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN */}
          <section className="xl:col-span-7 flex flex-col gap-space-lg">
            {/* 1. Select Tender Mode — only the 4 methods the business handles */}
            <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-2">
                  <Icon name="payments" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary uppercase tracking-wide">
                    Select Tender Mode
                  </h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary uppercase font-medium">
                  Quick Hotkeys [1-4]
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-xs">
                {POS_TENDER_METHODS.map((mode) => {
                  const active = tenderMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTenderMode(mode.id as TenderId)}
                      className={`text-left p-space-sm rounded-lg shadow-sm flex flex-col justify-between transition-all relative overflow-hidden ${
                        mode.span ? 'sm:col-span-2 lg:col-span-2 items-center' : ''
                      } ${active ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-low'}`}
                    >
                      {mode.span ? (
                        <div className="flex items-center gap-space-sm w-full justify-between">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-9 h-9 rounded bg-surface-container-high flex items-center justify-center text-primary">
                              <Icon name={mode.icon} className="text-[20px]" />
                            </div>
                            <div>
                              <p className="font-label-md text-label-md font-semibold text-text-primary">{mode.title}</p>
                              <p className="font-caption text-caption text-text-secondary">{mode.sub}</p>
                            </div>
                          </div>
                          <span
                            className={`font-caption text-caption font-bold px-2 py-1 rounded ${
                              active ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-text-secondary'
                            }`}
                          >
                            [{mode.key}]
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between w-full mb-2">
                            <Icon name={mode.icon} className={`text-[22px] ${active ? 'text-primary' : 'text-secondary'}`} />
                            <span
                              className={`font-caption text-caption font-bold px-1.5 py-0.5 rounded ${
                                active ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-text-secondary'
                              }`}
                            >
                              [{mode.key}]
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                              <p className="font-label-md text-label-md font-semibold text-text-primary">{mode.title}</p>
                            </div>
                            <p className="font-caption text-caption text-text-secondary mt-0.5">{mode.sub}</p>
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Cash Calculator & Dispenser (cash tender) */}
            {tenderMode === 'cash' && (
              <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon name="calculate" className="text-badge-discount-text text-[22px]" />
                    <div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">Cash Calculator & Dispenser</h3>
                      <p className="font-caption text-caption text-text-secondary">
                        On-screen keypad • Till drawer ready
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-badge-discount-bg text-badge-discount-text">
                    <Icon name="check_circle" className="text-[16px]" />
                    <span className="font-caption text-caption font-semibold">Till Solenoid Synced</span>
                  </div>
                </div>

                {/* On-screen number pad + calculator */}
                <PosCalculatorKeypad
                  value={cashReceived}
                  due={due}
                  onChange={(value) => setCashReceived(value)}
                  onConfirm={completeSale}
                />

                {/* Change Due Box */}
                <div className="rounded-xl p-space-md bg-badge-discount-bg shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-2">
                    <div>
                      <span className="font-caption text-caption uppercase tracking-wider font-bold text-badge-discount-text">
                        Change Due To Customer
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span
                          className={`font-display-hero text-display-hero leading-none ${
                            change >= 0 ? 'text-badge-discount-text' : 'text-error'
                          }`}
                        >
                          {change >= 0 ? '' : '-'}
                          {formatNaira(Math.abs(change))}
                        </span>
                        <span
                          className={`font-label-md text-label-md font-bold ${
                            change >= 0 ? 'text-badge-discount-text' : 'text-error'
                          }`}
                        >
                          NGN
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-canvas text-badge-discount-text shadow-sm self-start sm:self-auto">
                      <Icon name="local_atm" className="text-[16px]" />
                      <span className="font-caption text-caption font-semibold">{acceptedNotes}</span>
                    </div>
                  </div>
                  <div className="pt-space-xs border-t border-badge-discount-text/20 flex items-start gap-2">
                    <Icon name="paid" className="text-badge-discount-text text-[18px] shrink-0 mt-0.5" />
                    <p className="font-body-md text-body-md text-text-primary">
                      <strong className="font-semibold text-badge-discount-text">Dispense Recommendation:</strong>{' '}
                      {change > 0 ? dispenseBreakdown(change) : 'No change required'}
                    </p>
                  </div>
                </div>

                {/* Till Drawer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={popDrawer}
                      onChange={(e) => setPopDrawer(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <span className="font-label-md text-label-md font-medium text-text-primary">
                      Pop Cash Drawer On Completion
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* 3. Card / POS terminal (external) */}
            {tenderMode === 'card' && (
              <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-2">
                  <Icon name="credit_card" className="text-primary text-[22px]" />
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Card / POS Terminal</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Process on the external card terminal, then confirm below.
                    </p>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name="contactless" className="text-[22px]" />
                    </div>
                    <div>
                      <span className="font-label-md text-label-md font-semibold text-text-primary block">
                        Present card on the terminal
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Sunmi / Moniepoint link • amount pushed {formatNaira(due)}
                      </span>
                    </div>
                  </div>
                  <span className="font-heading-sm text-heading-sm font-bold text-primary shrink-0">
                    {formatNaira(due)}
                  </span>
                </div>
                <p className="font-caption text-caption text-text-tertiary">
                  VEMTAP does not process the card — the business settles it on its own POS. Confirm once the terminal
                  approves so the receipt and order are marked paid.
                </p>
              </div>
            )}

            {/* 4. Transfer (external) */}
            {tenderMode === 'transfer' && (
              <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-2">
                  <Icon name="account_balance" className="text-secondary text-[22px]" />
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Bank Transfer</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Confirm the transfer landed before completing.
                    </p>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-subtle flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
                      <Icon name="account_balance" className="text-[22px]" />
                    </div>
                    <div>
                      <span className="font-label-md text-label-md font-semibold text-text-primary block">
                        Business account credited {formatNaira(due)}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Paste or note the transfer reference for the audit trail
                      </span>
                    </div>
                  </div>
                </div>
                <input
                  placeholder="Transfer reference (optional)"
                  className="h-11 px-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* 5. Split Multi-Tender */}
            {tenderMode === 'split' && (
              <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="call_split" className="text-primary text-[22px]" />
                    <div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">Split Multi-Tender</h3>
                      <p className="font-caption text-caption text-text-secondary">
                        Cover the total across cash, card and transfer.
                      </p>
                    </div>
                  </div>
                  <span className="font-heading-sm text-heading-sm font-bold text-primary">
                    {formatNaira(splitRemaining)} left
                  </span>
                </div>

                {/* Remaining progress */}
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${due > 0 ? Math.min(100, (splitPaid / due) * 100) : 0}%` }}
                  />
                </div>

                {/* Recorded slices */}
                {slices.length > 0 && (
                  <div className="flex flex-col gap-space-xs">
                    {slices.map((slice) => (
                      <div
                        key={slice.id}
                        className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle"
                      >
                        <div className="flex items-center gap-space-xs">
                          <Icon name={METHOD_ICON[slice.method]} className="text-primary text-[18px]" />
                          <span className="font-label-md text-label-md font-semibold text-text-primary">
                            {METHOD_LABEL[slice.method]}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md font-bold text-text-primary">
                            {formatNaira(slice.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSplitSlice(slice.id)}
                            aria-label="Remove slice"
                            className="text-text-tertiary hover:text-error transition-colors"
                          >
                            <Icon name="close" className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add a slice */}
                <div className="flex flex-col sm:flex-row gap-space-xs">
                  <div className="flex items-center gap-space-xs flex-1">
                    {(['cash', 'card', 'transfer'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSplitMethod(method)}
                        className={`flex-1 h-11 rounded-xl font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          splitMethod === method
                            ? 'bg-surface-tint-blue text-primary'
                            : 'bg-surface-subtle text-text-secondary hover:bg-surface-container-high'
                        }`}
                      >
                        <Icon name={METHOD_ICON[method]} className="text-[17px]" />
                        <span>{METHOD_LABEL[method]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                      ₦
                    </span>
                    <input
                      inputMode="numeric"
                      value={splitAmount || (splitRemaining > 0 ? '' : '')}
                      onChange={(e) => setSplitAmount(Number(e.target.value.replace(/[^0-9]/g, '') || '0'))}
                      placeholder={`Amount (up to ${formatNaira(splitRemaining)})`}
                      className="w-full h-11 pl-8 pr-3 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSplitSlice}
                    disabled={splitRemaining <= 0}
                    className="h-11 px-space-md rounded-xl bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 disabled:opacity-40 transition-opacity shrink-0"
                  >
                    <Icon name="add" className="text-[17px]" />
                    <span>Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitAmount(splitRemaining)}
                    disabled={splitRemaining <= 0}
                    className="h-11 px-space-md rounded-xl bg-surface-subtle text-text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1 disabled:opacity-40 transition-opacity shrink-0"
                  >
                    <span>Rest</span>
                  </button>
                </div>

                {splitRemaining <= 0 && (
                  <div className="p-space-sm rounded-xl bg-badge-discount-bg flex items-center gap-2">
                    <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      Fully covered — complete the sale to settle every tender.
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* RIGHT COLUMN */}
          <section className="xl:col-span-5 flex flex-col gap-space-lg">
            {/* Order Summary Card */}
            <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="receipt_long" className="text-primary text-[20px]" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Summary</h3>
                </div>
                <span className="font-caption text-caption text-text-tertiary">{itemCount} Items Confirmed</span>
              </div>

              <div className="flex flex-col gap-space-sm max-h-[240px] overflow-y-auto pr-1">
                {cart.map((line) => {
                  const lineTotal = (line.unit - (line.promo ?? 0)) * line.qty;
                  return (
                    <div key={line.id} className="p-space-xs rounded-lg bg-surface-subtle flex items-start justify-between gap-space-xs">
                      <div className="flex gap-space-xs">
                        <span className="w-6 h-6 rounded bg-surface-container-high text-primary font-caption text-caption font-bold flex items-center justify-center shrink-0">
                          {line.qty}x
                        </span>
                        <div>
                          <h4 className="font-label-md text-label-md font-semibold text-text-primary leading-tight">
                            {line.name}
                          </h4>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">{line.mods}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          {formatNaira(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ledger Totals Breakdown */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatNaira(totals.gross)}</span>
                </div>
                <div className="flex items-center justify-between font-label-md text-label-md text-badge-discount-text">
                  <div className="flex items-center gap-1">
                    <Icon name="stars" className="text-[16px]" />
                    <span>Member Deal Rebate</span>
                  </div>
                  <span className="font-semibold">-{formatNaira(totals.discount)}</span>
                </div>
                <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                  <span>
                    {taxLabel} ({taxRate}%){taxMode === 'inclusive' && ' · included'}
                  </span>
                  <span className="font-semibold text-text-primary">{formatNaira(totals.vat)}</span>
                </div>
                <div className="pt-2 mt-1 border-t border-surface-container-highest flex items-baseline justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                    Total Amount Due
                  </span>
                  <span className="font-heading-lg text-heading-lg font-bold text-primary leading-none">
                    {formatNaira(due)}
                  </span>
                </div>
              </div>

              {/* Actions CTA Block */}
              <div className="pt-space-xs flex flex-col gap-2">
                {/* Points & rewards — visible before completing payment when a customer is attached */}
                {customer && loyaltyEnabled && (
                  <div className="rounded-xl border border-border-subtle bg-badge-discount-bg p-space-sm flex flex-col gap-space-2xs">
                    <div className="flex items-center justify-between gap-space-xs">
                      <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-text-primary">
                        <Icon name="stars" className="text-[15px] text-badge-discount-text" />
                        Points from this order
                      </span>
                      <span className="font-label-md text-label-md font-bold text-badge-discount-text">
                        +{orderPoints.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                      <span>Previous {previousPoints.toLocaleString()} pts</span>
                      <span>
                        Total{' '}
                        <span className="font-semibold text-text-primary">{projectedTotal.toLocaleString()} pts</span>
                      </span>
                    </div>
                    <div className="flex gap-space-xs pt-space-2xs">
                      <button
                        type="button"
                        onClick={() => setPointsModalOpen(true)}
                        className="flex-1 h-9 rounded-lg bg-surface-canvas hover:bg-surface-container-high border border-border-subtle text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Icon name="add_circle" className="text-[15px] text-primary" />
                        <span>Add points</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRewardsModalOpen(true)}
                        className="flex-1 h-9 rounded-lg bg-surface-canvas hover:bg-surface-container-high border border-border-subtle text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Icon name="workspace_premium" className="text-[15px] text-badge-discount-text" />
                        <span>Rewards{eligibleCount > 0 ? ` (${eligibleCount})` : ''}</span>
                      </button>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={completeSale}
                  disabled={completing || !canComplete}
                  className="w-full h-[54px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary-container"
                >
                  {completing ? (
                    <>
                      <Icon name="refresh" className="text-[20px] animate-spin" />
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="done_all" className="text-[20px]" />
                      <span>
                        {tenderMode === 'cash'
                          ? `Tender ${formatNaira(cashReceived)} & Complete`
                          : tenderMode === 'split'
                            ? `Complete Split (${formatNaira(due)})`
                            : `Complete Sale (${formatNaira(due)})`}
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full h-[44px] rounded-lg bg-transparent hover:bg-surface-container-high text-text-secondary font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="arrow_back" className="text-[18px]" />
                  <span>Back to Register / Edit Ticket [Esc]</span>
                </button>
              </div>
            </div>

            {/* Loyalty — points balance, next reward, and manual award at the till */}
            {customer && loyaltyEnabled && (
              <PosLoyaltyPanel
                customer={customer}
                ticketTotal={due}
                onAward={(points) => {
                  recordAward(points);
                  onCustomerChange({ ...customer, points: customer.points + points });
                  flash(`${points.toLocaleString()} points awarded to ${customer.name}.`);
                }}
              />
            )}

            {/* Walk-in status — blocks payment when walk-in sales are off in POS Settings */}
            {!customer && (
              <div className="rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-sm bg-surface-canvas">
                <div className="flex items-center gap-space-xs">
                  <Icon name="person_off" className="text-text-secondary text-[18px]" />
                  <span className="font-caption text-caption text-text-secondary">
                    {allowWalkIn
                      ? 'Walk-in sale — attach a customer to earn loyalty points.'
                      : 'Walk-in sales are off in POS Settings — attach a customer to take payment.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  className="font-caption text-caption font-semibold text-primary hover:underline shrink-0"
                >
                  Attach
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Customer modal — 2 tabs: Search / Add New */}
      {customerModalOpen && (
        <PosCustomerModal
          onClose={() => setCustomerModalOpen(false)}
          onSelect={(record) => {
            onCustomerChange(record);
            setCustomerModalOpen(false);
            flash(`${record.name} attached to this sale.`);
          }}
        />
      )}

      {/* Manual points + eligible rewards — both reachable before completing payment */}
      {pointsModalOpen && customer && (
        <PosAddPointsModal
          customerName={customer.name}
          currentPoints={customer.points}
          suggested={orderPoints}
          onClose={() => setPointsModalOpen(false)}
          onAward={(points) => {
            recordAward(points);
            onCustomerChange({ ...customer, points: customer.points + points });
            setPointsModalOpen(false);
            flash(`${points.toLocaleString()} points added to ${customer.name}.`);
          }}
        />
      )}

      {rewardsModalOpen && customer && (
        <PosRewardsModal
          customerName={customer.name}
          points={customer.points}
          projectedTotal={projectedTotal}
          onClose={() => setRewardsModalOpen(false)}
        />
      )}

      {note && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span>{note}</span>
        </div>
      )}
    </PosTerminalChrome>
  );
}
