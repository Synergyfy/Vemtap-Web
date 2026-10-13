import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { CheckoutHubShell } from './CheckoutHubShell';

interface DesktopSplitBillScreenProps {
  onPay?: () => void;
}

const BASE_SHARE = 20962;

const SPLIT_TIPS: Array<{ id: string; label: string; sub: string; subClass: string; value: number; percent?: string }> = [
  { id: 'none', label: 'No Tip', sub: '₦0', subClass: 'text-text-tertiary', value: 0, percent: '0%' },
  { id: 'p10', label: '10%', sub: '+₦2,000', subClass: 'text-text-tertiary', value: 2000, percent: '10%' },
  { id: 'p15', label: '15% Great!', sub: '+₦3,140', subClass: 'text-primary font-medium', value: 3140, percent: '15%' },
];

const PROGRESS_SEGMENTS: Array<{ className: string; width: string; title: string }> = [
  { className: 'bg-badge-discount-text', width: '27.4%', title: 'Sarah: ₦8,707 Paid' },
  { className: 'bg-primary-container', width: '66%', title: 'You: ₦20,962 Pending' },
  { className: 'bg-secondary', width: '5.4%', title: 'Tunde: ₦1,720 Pending' },
  { className: 'bg-surface-container-high', width: '1.2%', title: 'Remaining Tip Buffer' },
];

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function DesktopSplitBillScreen({ onPay }: DesktopSplitBillScreenProps) {
  const [diners, setDiners] = useState(3);
  const [selectedTip, setSelectedTip] = useState('p15');
  const [payState, setPayState] = useState<'idle' | 'contacting' | 'approved'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const tipValue = SPLIT_TIPS.find((tip) => tip.id === selectedTip)?.value ?? 3140;
  const tipPercentLabel = SPLIT_TIPS.find((tip) => tip.id === selectedTip)?.percent ?? '0%';
  const total = BASE_SHARE + tipValue;

  useEffect(() => {
    if (payState !== 'contacting') return;
    const timeout = setTimeout(() => setPayState('approved'), 1200);
    return () => clearTimeout(timeout);
  }, [payState]);

  useEffect(() => {
    if (payState !== 'approved') return;
    const timeout = setTimeout(() => onPay?.(), 900);
    return () => clearTimeout(timeout);
  }, [payState, onPay]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const shareBillLink = () => {
    navigator.clipboard?.writeText('https://pay.vemtap.com/s/TK-108');
    setToast('Bill link copied to clipboard.');
  };

  return (
    <CheckoutHubShell>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl flex flex-col gap-space-xl">
        {/* Top Summary & POS Terminal Header Strip */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full pointer-events-none blur-2xl" />
          <div className="flex flex-col gap-space-xs z-10">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary">
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                Live POS Session
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-text-secondary">Order #TK-108</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-text-secondary">Table 04</span>
              <span className="text-text-tertiary">•</span>
              <span className="font-label-sm text-label-sm text-text-secondary">
                Urban Grill &amp; Bistro, Wuse II
              </span>
            </div>
            <div className="flex items-baseline gap-space-md mt-1">
              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">Split The Bill</h1>
              <span className="font-caption text-caption text-text-tertiary hidden md:inline">
                3 Items + 7.5% State VAT included
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xl z-10 bg-surface-subtle p-space-md rounded-xl">
            <div className="flex flex-col text-right">
              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Total Table Bill
              </span>
              <span className="font-display-hero text-display-hero text-primary font-bold">₦27,628</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
              <Icon name="receipt_long" className="text-[28px]" />
            </div>
          </div>
        </div>

        {/* Strategy Tabs & Global Progress Meter */}
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md">
            {/* Strategy Selector */}
            <div className="inline-flex p-1 bg-surface-container rounded-xl">
              <button
                type="button"
                className="px-space-md py-2 rounded-lg font-button-secondary text-button-secondary text-text-secondary hover:text-on-surface transition-colors"
              >
                Split Equally
              </button>
              <button
                type="button"
                className="px-space-md py-2 rounded-lg font-button-primary text-button-primary bg-surface-container-lowest text-primary shadow-sm flex items-center gap-1.5"
              >
                <Icon name="checklist_rtl" className="text-[18px]" />
                By Items (Active)
              </button>
              <button
                type="button"
                className="px-space-md py-2 rounded-lg font-button-secondary text-button-secondary text-text-secondary hover:text-on-surface transition-colors"
              >
                Custom Amount
              </button>
            </div>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-text-secondary">
              <Icon name="sync_alt" className="text-primary text-[20px]" />
              <span>
                Settlement Allocation:{' '}
                <strong className="text-on-surface">
                  ₦29,669 / ₦31,768
                </strong>{' '}
                <span className="font-caption text-caption text-text-tertiary">(w/ 15% Table Tip)</span>
              </span>
            </div>
          </div>

          {/* Multi-segmented Progress Bar */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
            <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
              {PROGRESS_SEGMENTS.map((segment) => (
                <div
                  key={segment.title}
                  className={`h-full transition-all duration-500 ${segment.className}`}
                  style={{ width: segment.width }}
                  title={segment.title}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1">
              <div className="flex items-center gap-space-md flex-wrap font-label-sm text-label-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                  <span className="text-text-secondary">
                    Sarah (Settled): <strong className="text-badge-discount-text">₦8,707</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                  <span className="text-text-secondary">
                    You (Allocated): <strong className="text-primary font-semibold">₦20,962</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="text-text-secondary">
                    Tunde (Pending): <strong className="text-on-surface">₦1,720</strong>
                  </span>
                </div>
              </div>
              <span className="font-caption text-caption text-text-tertiary">93.4% Accounted</span>
            </div>
          </div>
        </div>

        {/* 2 Column Layout: 7 Cols Left, 5 Cols Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT COLUMN: Table Diners & Item Assignment (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Diners Count & Auto-distribute Tool */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <span className="font-heading-sm text-heading-sm text-on-surface">Table Diners</span>
                <div className="inline-flex items-center bg-surface-container-low rounded-xl px-2 py-1 gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setDiners((count) => Math.max(1, count - 1))}
                    className="w-7 h-7 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-on-surface shadow-2xs font-bold transition"
                  >
                    <Icon name="remove" className="text-[16px]" />
                  </button>
                  <span className="font-heading-sm text-heading-sm text-on-surface font-semibold px-1">{diners}</span>
                  <button
                    type="button"
                    onClick={() => setDiners((count) => count + 1)}
                    className="w-7 h-7 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-on-surface shadow-2xs font-bold transition"
                  >
                    <Icon name="add" className="text-[16px]" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToast('Shared items distributed evenly across diners.')}
                className="px-space-md py-2 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary/10 transition-colors"
              >
                <Icon name="alt_route" className="text-[18px]" />
                Split shared items evenly
              </button>
            </div>

            {/* Diner Cards List */}
            <div className="flex flex-col gap-space-md">
              {/* Diner 1: Michael James (You) */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-lg flex flex-col gap-space-md relative">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container" />
                <div className="flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-11 h-11 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold font-heading-sm text-heading-sm">
                      MJ
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading-sm text-heading-sm text-on-surface">Michael James</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold">
                          You
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-tertiary">
                        2 individual items claimed • Shared VAT applied
                      </span>
                    </div>
                  </div>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-semibold text-primary flex items-center gap-1">
                    <Icon name="pending_actions" className="text-[16px]" />
                    Ready to Pay
                  </span>
                </div>
                {/* Claimed Items Table */}
                <div className="bg-surface-subtle rounded-xl p-space-md flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between font-body-md text-body-md text-on-surface py-1">
                    <div className="flex items-center gap-2">
                      <Icon name="restaurant" className="text-text-tertiary text-[18px]" />
                      <span>Woodfire Ribeye 250g (Medium Rare)</span>
                    </div>
                    <span className="font-semibold">₦16,000</span>
                  </div>
                  <div className="flex items-center justify-between font-body-md text-body-md text-on-surface py-1">
                    <div className="flex items-center gap-2">
                      <Icon name="local_bar" className="text-text-tertiary text-[18px]" />
                      <span>Passionfruit Mojito</span>
                    </div>
                    <span className="font-semibold">₦3,500</span>
                  </div>
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-text-secondary pt-2 bg-surface-container/30 px-2 py-1.5 rounded-lg mt-1">
                    <span className="flex items-center gap-1">
                      <Icon name="account_balance" className="text-text-tertiary text-[16px]" />
                      Share of VAT (7.5%)
                    </span>
                    <span className="font-medium text-text-primary">+₦1,462</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-md text-label-md text-text-secondary">Base Share Subtotal</span>
                  <span className="font-heading-md text-heading-md font-bold text-primary">₦20,962</span>
                </div>
              </div>

              {/* Diner 2: Sarah Jenkins (Settled) */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md opacity-90">
                <div className="flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-11 h-11 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center font-bold font-heading-sm text-heading-sm">
                      SJ
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm text-on-surface">Sarah Jenkins</span>
                      <span className="font-caption text-caption text-text-tertiary">
                        Paid via NFC Contactless (VEMTAP Tap)
                      </span>
                    </div>
                  </div>
                  <span className="px-space-sm py-1 rounded-full bg-badge-discount-bg font-label-sm text-label-sm font-semibold text-badge-discount-text flex items-center gap-1">
                    <Icon name="check_circle" className="text-[16px]" />
                    ✓ Paid via Tap
                  </span>
                </div>
                <div className="bg-surface-subtle rounded-xl p-space-md flex flex-col gap-space-2xs text-text-secondary font-body-md text-body-md">
                  <div className="flex items-center justify-between py-0.5">
                    <span>Smash Burger • 1/2 Truffle Fries (Shared)</span>
                    <span className="font-medium text-on-surface">₦8,707 Settled</span>
                  </div>
                  <div className="font-caption text-caption text-badge-discount-text flex items-center gap-1 mt-1">
                    <Icon name="lock" className="text-[14px]" />
                    Transaction Auth Code #TAP-9921-OK
                  </div>
                </div>
              </div>

              {/* Diner 3: Tunde Oladipo */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-11 h-11 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold font-heading-sm text-heading-sm">
                      TO
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading-sm text-heading-sm text-on-surface">Tunde Oladipo</span>
                      <span className="font-caption text-caption text-text-tertiary">1 shared side claimed</span>
                    </div>
                  </div>
                  <span className="px-space-sm py-1 rounded-full bg-surface-container-high font-label-sm text-label-sm font-semibold text-text-secondary flex items-center gap-1">
                    <Icon name="schedule" className="text-[16px]" />
                    Waiting for Pay
                  </span>
                </div>
                <div className="bg-surface-subtle rounded-xl p-space-md flex items-center justify-between text-body-md text-body-md">
                  <span className="text-text-secondary">1/2 Truffle Fries</span>
                  <span className="font-semibold text-on-surface">₦1,720</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Your Share Payment & Tip Summary (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-24">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-xl flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="font-heading-md text-heading-md text-on-surface">Your Payment Share</h2>
                  <span className="font-caption text-caption text-text-tertiary">
                    Review split and add server gratitude
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="credit_card" className="text-[20px]" />
                </div>
              </div>

              {/* Tip Selector */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Service Tip (Urban Bistro Staff)
                  </span>
                  <span className="font-caption text-caption text-badge-discount-text font-medium">
                    100% goes to staff
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs pt-1">
                  {SPLIT_TIPS.map((tip) => {
                    const active = selectedTip === tip.id;
                    return (
                      <button
                        key={tip.id}
                        type="button"
                        onClick={() => setSelectedTip(tip.id)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition text-center ${
                          active
                            ? 'bg-surface-tint-blue text-primary ring-2 ring-primary shadow-xs'
                            : 'bg-surface-subtle hover:bg-surface-container'
                        }`}
                      >
                        <span
                          className={`font-label-sm text-label-sm ${
                            active ? 'text-primary font-semibold' : 'text-text-secondary font-medium'
                          }`}
                        >
                          {tip.label}
                        </span>
                        <span
                          className={`font-caption text-caption ${
                            active ? tip.subClass : 'text-text-tertiary'
                          }`}
                        >
                          {tip.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown Calculation */}
              <div className="flex flex-col gap-space-xs bg-surface-subtle p-space-md rounded-xl">
                <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                  <span>Base Share (Michael)</span>
                  <span className="font-medium text-on-surface">₦20,962</span>
                </div>
                <div className="flex items-center justify-between font-body-md text-body-md text-text-secondary">
                  <span>Selected Tip ({tipPercentLabel})</span>
                  <span className="font-medium text-badge-discount-text">
                    {tipValue > 0 ? `+${naira(tipValue)}` : '₦0'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                  <span>Processing Fee</span>
                  <span className="text-badge-discount-text font-medium">₦0 Free (VEMTAP Pay)</span>
                </div>
                <div className="h-px bg-surface-container my-1" />
                <div className="flex items-end justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                      Total to Pay
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">Instant NFC / Card Debit</span>
                  </div>
                  <span className="font-display-hero text-display-hero font-bold text-on-surface">
                    {naira(total)}
                  </span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                onClick={() => payState === 'idle' && setPayState('contacting')}
                className={`w-full h-14 rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-lg transition duration-200 active:scale-[0.99] ${
                  payState === 'approved'
                    ? 'bg-badge-discount-text text-on-primary'
                    : 'bg-primary-container hover:bg-primary text-on-primary-container opacity-100'
                } ${payState === 'contacting' ? 'opacity-80 scale-[0.98]' : ''}`}
              >
                {payState === 'idle' && (
                  <>
                    <Icon name="bolt" className="text-[20px]" />
                    <span>Pay Your Share ({naira(total)}) →</span>
                  </>
                )}
                {payState === 'contacting' && (
                  <>
                    <Icon name="sync" className="animate-spin text-[20px]" />
                    <span>Contacting Terminal...</span>
                  </>
                )}
                {payState === 'approved' && (
                  <>
                    <Icon name="check_circle" className="text-[20px]" />
                    <span>Payment Approved!</span>
                  </>
                )}
              </button>

              {/* Split Secondary Actions */}
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={shareBillLink}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 transition"
                >
                  <Icon name="link" className="text-[18px]" />
                  Share Bill Link
                </button>
                <button
                  type="button"
                  onClick={() => setToast('Split slips sent to terminal printer.')}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 transition"
                >
                  <Icon name="print" className="text-[18px]" />
                  Print Split Slips
                </button>
              </div>

              {/* Security Badge / Terminal Info */}
              <div className="flex items-center justify-center gap-2 pt-2 text-center text-text-tertiary">
                <Icon name="verified_user" className="text-[16px] text-badge-discount-text" />
                <span className="font-caption text-caption">
                  Encrypted via VEMTAP Instant POS Gateway • Session #TK-108
                </span>
              </div>
            </div>
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
