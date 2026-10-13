import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { computeTotals, formatNaira, type PosTerminalLine } from './posTerminalData';

interface DesktopPosPaymentScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  customer: string | null;
  onBack: () => void;
  onComplete: () => void;
}

type TenderMode = 'cash' | 'pos' | 'transfer' | 'qr' | 'split';

const TENDER_MODES: Array<{
  id: TenderMode;
  key: string;
  icon: string;
  title: string;
  sub: string;
  span?: boolean;
}> = [
  { id: 'cash', key: '1', icon: 'payments', title: 'Cash Tender', sub: 'Change Calculator Active' },
  { id: 'pos', key: '2', icon: 'contactless', title: 'NFC / Chip POS', sub: 'Sunmi / Moniepoint Link' },
  { id: 'transfer', key: '3', icon: 'account_balance', title: 'Direct Transfer', sub: 'Instant Dynamic Polling' },
  { id: 'qr', key: '4', icon: 'qr_code_scanner', title: 'VEMTAP One-Tap', sub: 'Dual Customer Display QR' },
  {
    id: 'split',
    key: '5',
    icon: 'call_split',
    title: 'Split Multi-Tender',
    sub: 'Combine Card + Cash + Instant Transfer',
    span: true,
  },
];

const PRESET_VALUES = [27251, 30000, 35000, 40000, 50000];

function presetLabel(value: number, due: number, index: number): { top: string; tone: string } {
  if (index === 0) return { top: 'Exact', tone: 'text-text-tertiary' };
  if (index === 1) return { top: 'Nearest 10k', tone: 'text-text-tertiary' };
  const diff = value - due;
  return { top: `+${formatNaira(diff)}`, tone: 'text-badge-discount-text' };
}

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
  onBack,
  onComplete,
}: DesktopPosPaymentScreenProps) {
  const totals = useMemo(() => computeTotals(cart), [cart]);
  const due = totals.total;

  const [tenderMode, setTenderMode] = useState<TenderMode>('cash');
  const [cashReceived, setCashReceived] = useState(30000);
  const [activePreset, setActivePreset] = useState(1);
  const [pulseState, setPulseState] = useState<'idle' | 'pulsing' | 'done'>('idle');
  const [popDrawer, setPopDrawer] = useState(true);
  const [completing, setCompleting] = useState(false);

  const change = cashReceived - due;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(event.key)) {
        const mode = TENDER_MODES.find((m) => m.key === event.key);
        if (mode) setTenderMode(mode.id);
      } else if (event.key === 'Enter') {
        onComplete();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack, onComplete]);

  const applyPreset = (value: number, index: number) => {
    setActivePreset(index);
    setCashReceived(value);
  };

  const onCashInput = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const value = digits ? parseInt(digits, 10) : 0;
    setActivePreset(-1);
    setCashReceived(value);
  };

  const triggerPulse = () => {
    if (pulseState === 'pulsing') return;
    setPulseState('pulsing');
    window.setTimeout(() => setPulseState('done'), 900);
    window.setTimeout(() => setPulseState('idle'), 2600);
  };

  const completeSale = () => {
    if (completing) return;
    setCompleting(true);
    window.setTimeout(() => {
      setCompleting(false);
      onComplete();
    }, 900);
  };

  const acceptedNotes =
    cashReceived >= 10000
      ? `${Math.floor(cashReceived / 10000)} × ₦10,000 Notes`
      : `${Math.floor(cashReceived / 1000)} × ₦1,000 Notes`;

  const itemCount = cart.length;

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
              <span className="font-label-md text-label-md text-secondary font-medium flex items-center gap-1">
                <Icon name="table_bar" className="text-[18px]" />
                Table 04
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-md text-label-md text-text-secondary">{itemCount} Line Items</span>
            </div>
            <div className="h-5 w-px bg-surface-container-highest hidden sm:block" />
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-tint-blue">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {customer ?? 'Michael James'}
                </span>
                <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-primary text-on-primary">
                  VIP Gold
                </span>
                <span className="font-caption text-caption text-primary font-medium tracking-tight">
                  2,450 pts available
                </span>
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
            {/* 1. Select Tender Mode */}
            <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-2">
                  <Icon name="payments" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary uppercase tracking-wide">
                    Select Tender Mode
                  </h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary uppercase font-medium">
                  Quick Hotkeys [1-5]
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-xs">
                {TENDER_MODES.map((mode) => {
                  const active = tenderMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTenderMode(mode.id)}
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

            {/* 2. Cash Calculator & Dispenser */}
            <div className="rounded-xl p-space-md bg-surface-canvas shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="calculate" className="text-badge-discount-text text-[22px]" />
                  <div>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Cash Calculator & Dispenser</h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Till Drawer Ready • Solenoid Relay Armed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-space-xs py-1 rounded bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check_circle" className="text-[16px]" />
                  <span className="font-caption text-caption font-semibold">Till Solenoid Synced</span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">
                    Quick Tender Presets
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">Tap to fill received cash</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs">
                  {PRESET_VALUES.map((value, index) => {
                    const active = activePreset === index;
                    const { top, tone } = presetLabel(value, due, index);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => applyPreset(value, index)}
                        className={`p-2.5 rounded-lg shadow-sm text-left transition-all ${
                          active ? 'bg-surface-tint-blue' : 'bg-surface-subtle hover:bg-surface-container-low'
                        } ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                      >
                        <span
                          className={`block font-caption text-caption leading-none ${
                            active ? 'text-primary font-medium' : tone
                          }`}
                        >
                          {top}
                        </span>
                        <span
                          className={`block font-label-md text-label-md mt-1 ${
                            active ? 'font-bold text-primary' : 'font-semibold text-text-primary'
                          }`}
                        >
                          {formatNaira(value)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Tender Received Input */}
              <div className="bg-surface-subtle p-space-sm rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex-1">
                  <label
                    className="block font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary mb-1"
                    htmlFor="cash-received-input"
                  >
                    Cash Tender Received
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-text-secondary font-heading-md text-heading-md pointer-events-none">
                      ₦
                    </span>
                    <input
                      id="cash-received-input"
                      type="text"
                      inputMode="numeric"
                      value={cashReceived ? cashReceived.toLocaleString('en-NG') : ''}
                      onChange={(e) => onCashInput(e.target.value)}
                      className="w-full h-[52px] pl-10 pr-4 rounded-xl bg-surface-canvas text-text-primary font-heading-md text-heading-md font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-1 flex items-center gap-1">
                    <Icon name="touch_app" className="text-[14px]" />
                    Use numpad or click presets above
                  </p>
                </div>
                <div className="px-space-md py-space-xs rounded-lg bg-surface-canvas shadow-sm flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                    <Icon name="local_atm" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="block font-caption text-caption text-text-tertiary leading-none">Accepted Notes</span>
                    <span className="block font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                      {acceptedNotes}
                    </span>
                  </div>
                </div>
              </div>

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
                    <Icon name="price_check" className="text-[16px]" />
                    <span className="font-caption text-caption font-semibold">Sufficient Till Float</span>
                  </div>
                </div>
                <div className="pt-space-xs border-t border-badge-discount-text/20 flex items-start gap-2">
                  <Icon name="paid" className="text-badge-discount-text text-[18px] shrink-0 mt-0.5" />
                  <p className="font-body-md text-body-md text-text-primary">
                    <strong className="font-semibold text-badge-discount-text">Dispense Recommendation:</strong>{' '}
                    {change > 0 ? dispenseBreakdown(change) : 'No change required'}{' '}
                    <span className="font-caption text-caption text-text-tertiary block sm:inline sm:ml-2">
                      (Rounded to nearest cash denominations)
                    </span>
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
                <button
                  type="button"
                  onClick={triggerPulse}
                  className="px-space-md py-2 rounded-lg bg-surface-subtle hover:bg-surface-container-high text-secondary font-button-secondary text-button-secondary inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {pulseState === 'idle' && (
                    <>
                      <Icon name="electrical_services" className="text-[18px]" />
                      <span>Test Drawer Pulse</span>
                    </>
                  )}
                  {pulseState === 'pulsing' && (
                    <>
                      <Icon name="sync" className="text-[18px] animate-spin" />
                      <span>Pulsing Relay…</span>
                    </>
                  )}
                  {pulseState === 'done' && (
                    <>
                      <Icon name="check" className="text-[18px] text-badge-discount-text" />
                      <span>Triggered Pulse (24V)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Drawer Status Hardware Strip */}
              <div className="px-space-sm py-2 rounded-lg bg-surface-subtle flex flex-wrap items-center justify-between gap-2 text-text-tertiary font-caption text-caption">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span className="text-text-secondary font-medium">PAX A920 Pro Standby</span>
                  <span>•</span>
                  <span>Port 9100 Connected</span>
                  <span>•</span>
                  <span>Latency: 12ms</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Icon name="lock" className="text-[14px]" />
                  <span>Tender Lock Active</span>
                </div>
              </div>
            </div>
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

              <div className="flex flex-col gap-space-sm">
                {cart.map((line) => {
                  const lineTotal = (line.unit - (line.promo ?? 0)) * line.qty;
                  return (
                    <div key={line.id} className="p-space-xs rounded-lg bg-surface-subtle flex items-start justify-between gap-space-xs">
                      <div className="flex gap-space-xs">
                        <span className="w-6 h-6 rounded bg-surface-container-high text-primary font-caption text-caption font-bold flex items-center justify-center shrink-0">
                          {line.qty}x
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-label-md text-label-md font-semibold text-text-primary leading-tight">
                              {line.name}
                            </h4>
                            {line.promo ? (
                              <span className="font-caption text-caption px-1.5 py-0.2 rounded bg-badge-discount-bg text-badge-discount-text font-bold">
                                PROMO
                              </span>
                            ) : null}
                          </div>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">{line.mods}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary">
                          {formatNaira(lineTotal)}
                        </span>
                        {line.promo ? (
                          <span className="block font-caption text-caption text-text-tertiary line-through leading-none">
                            {formatNaira(line.unit * line.qty)}
                          </span>
                        ) : null}
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
                    <span>VIP Gold Deal Rebate (10%)</span>
                  </div>
                  <span className="font-semibold">-{formatNaira(totals.discount)}</span>
                </div>
                <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                  <div className="flex items-center gap-1">
                    <span>VAT (7.5% Standard FIRS)</span>
                    <Icon name="info" className="text-[14px] text-text-tertiary" />
                  </div>
                  <span className="font-semibold text-text-primary">{formatNaira(totals.vat)}</span>
                </div>
                <div className="pt-2 mt-1 border-t border-surface-container-highest flex items-baseline justify-between">
                  <div>
                    <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                      Total Amount Due
                    </span>
                    <span className="block font-caption text-caption text-text-tertiary">
                      Inclusive of consumption levy
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading-lg text-heading-lg font-bold text-primary leading-none">
                      {formatNaira(due)}
                    </span>
                    <span className="font-caption text-caption text-text-secondary ml-1 font-semibold">NGN</span>
                  </div>
                </div>
              </div>

              {/* Receipt Dispatch Preferences */}
              <div className="pt-space-xs flex flex-col gap-space-xs">
                <h4 className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary flex items-center gap-1">
                  <Icon name="local_printshop" className="text-[16px]" />
                  Receipt Dispatch Preferences
                </h4>
                <div className="flex flex-col gap-2">
                  <label className="p-space-xs rounded-lg bg-surface-subtle flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-left">
                      <span className="block font-label-md text-label-md font-semibold text-text-primary">
                        Print Thermal Receipt
                      </span>
                      <span className="block font-caption text-caption text-text-secondary">
                        Sunmi 80mm Counter Slip • Auto-Cut enabled
                      </span>
                    </div>
                  </label>
                  <label className="p-space-xs rounded-lg bg-surface-subtle flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="text-left">
                      <span className="block font-label-md text-label-md font-semibold text-text-primary">
                        WhatsApp / SMS Digital Slip
                      </span>
                      <span className="block font-caption text-caption text-text-secondary">
                        +234 803 219 8831 (Michael James)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions CTA Block */}
              <div className="pt-space-xs flex flex-col gap-2">
                <button
                  type="button"
                  onClick={completeSale}
                  disabled={completing}
                  className="w-full h-[54px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <>
                      <Icon name="refresh" className="text-[20px] animate-spin" />
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="done_all" className="text-[20px]" />
                      <span>Complete Sale & Open Drawer ({formatNaira(due)}) [Enter]</span>
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

            {/* Terminal System Health Mini-Card */}
            <div className="rounded-xl p-space-sm bg-surface-canvas shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                  <Icon name="sync" className="text-[18px]" />
                </div>
                <div>
                  <p className="font-label-sm text-label-sm font-semibold text-text-primary">Mesh Node #WUSE2-01</p>
                  <p className="font-caption text-caption text-text-tertiary">
                    Realtime Transaction Ledger Hash: #9A24C
                  </p>
                </div>
              </div>
              <span className="font-caption text-caption font-semibold px-2 py-1 rounded bg-surface-tint-blue text-primary">
                Online 99.98%
              </span>
            </div>
          </section>
        </div>
      </main>
    </PosTerminalChrome>
  );
}
