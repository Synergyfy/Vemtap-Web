import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

interface DesktopPosTransactionDetailScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  onBack: () => void;
}

const META_ROWS = [
  { label: 'UUID', value: 'VT-TXN-8840291', mono: true },
  { label: 'Timestamp', value: 'Today, Oct 17, 2024 • 02:45 PM' },
  { label: 'Cashier', value: 'Emeka Okafor (Till #01)' },
  { label: 'Outlet Branch', value: 'Wuse Flagship (Aminu Kano)' },
  { label: 'Hardware POS', value: 'iPad Counter 01 (192.168.1.104)' },
];

const RECEIPT_LINES = [
  { qty: 1, name: 'Woodfire Ribeye Steak', meta: '250g, Medium Rare, Truffle Jus', price: '₦16,000', was: null, chip: null },
  { qty: 1, name: 'Double Smash Burger & Fries', meta: 'Brioche bun, extra pickles', price: '₦5,850', was: '₦6,500', chip: '-10% VIP' },
  { qty: 1, name: 'Passionfruit Mojito', meta: 'Mocktail, standard ice', price: '₦3,500', was: null, chip: null },
];

const CALC_ROWS = [
  { label: 'Subtotal', value: '₦26,000', accent: false },
  { label: 'Member Discount (10% Burger)', value: '-₦650', accent: true },
  { label: 'Tax (VAT 7.5%)', value: '₦1,901', accent: false },
];

export function DesktopPosTransactionDetailScreen({ onNav, onBack }: DesktopPosTransactionDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [pin, setPin] = useState('');
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const confirmVoid = () => {
    if (pin.length < 4) {
      showToast('Enter the full 4-digit Manager PIN');
      return;
    }
    setVoidOpen(false);
    setPin('');
    showToast('Manager PIN validated. Reversal initialized.');
  };

  return (
    <PosTerminalChrome onNav={onNav} activeNav="ledger">
      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={onBack}
              className="self-start mb-space-xs inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              <span>Shift Ledger</span>
            </button>
            <div className="flex items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Receipt #RC-94021</span>
              <span>•</span>
              <span>Shift #402 (Active)</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Transaction Details</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                <Icon name="check_circle" filled className="text-[14px]" />
                Completed &amp; Paid
              </span>
            </div>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              Dine-In • Table 04 • Today, Oct 17, 2024 • 02:45 PM • Wuse Flagship (Aminu Kano)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              type="button"
              onClick={() => showToast('Dispatch sent via SMS/WhatsApp')}
              className="h-11 px-space-md rounded-lg bg-surface-tint-blue text-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="share" className="text-[18px]" />
              <span>WhatsApp / SMS</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Opening digital customer slip')}
              className="h-11 px-space-md rounded-lg bg-surface hover:bg-surface-container-high text-text-secondary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="receipt_long" className="text-[18px] text-primary" />
              <span>View E-Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Sent to 80mm Counter Printer 01')}
              className="h-11 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Icon name="print" className="text-[18px]" />
              <span>Print Receipt (80mm Thermal)</span>
            </button>
          </div>
        </div>

        {/* Body: receipt + tender left, receipt summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left column: itemized receipt + tender */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Itemized receipt */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-2">
                  <Icon name="receipt_long" className="text-primary text-[22px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Order Items (3)</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Dine-In • Table 04</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                {RECEIPT_LINES.map((line) => (
                  <div
                    key={line.name}
                    className="flex items-start justify-between gap-space-sm border-b border-surface-container pb-space-sm last:border-b-0 last:pb-0"
                  >
                    <span className="w-8 h-8 rounded bg-surface-subtle flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-label-sm text-label-sm font-semibold text-text-secondary">{line.qty}×</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-label-md text-label-md font-medium text-text-primary">{line.name}</p>
                        {line.chip && (
                          <span className="font-caption text-caption px-1.5 py-0.2 bg-badge-discount-bg text-badge-discount-text rounded font-medium">
                            {line.chip}
                          </span>
                        )}
                      </div>
                      <p className="font-caption text-caption text-text-tertiary">{line.meta}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-label-md text-label-md font-semibold text-text-primary">{line.price}</p>
                      {line.was && <p className="font-caption text-caption line-through text-text-tertiary">{line.was}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Calculation slate */}
              <div className="bg-surface-subtle rounded-lg p-space-sm flex flex-col gap-space-2xs">
                {CALC_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center gap-space-xs ${row.accent ? 'text-badge-discount-text' : ''}`}
                  >
                    <span className={`font-body-md text-body-md ${row.accent ? '' : 'text-text-secondary'}`}>{row.label}</span>
                    <span className={`font-body-md text-body-md ${row.accent ? 'font-medium' : 'text-text-primary'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="my-1 bg-outline-variant/30 h-[1px] w-full" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary">Total Paid</span>
                  <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦27,251</span>
                </div>
              </div>
            </div>

            {/* Tender & cash management */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-2">
                  <Icon name="payments" className="text-[22px] text-primary" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Payment Tender</h2>
                </div>
                <span className="font-caption text-caption text-text-tertiary">Cash drawer reconciliation</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
                <div className="bg-surface-subtle rounded-lg p-space-sm">
                  <span className="font-caption text-caption text-text-tertiary">Payment Method</span>
                  <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5 flex items-center gap-1">
                    <Icon name="point_of_sale" className="text-[15px] text-badge-discount-text" />
                    <span>Cash Tender</span>
                  </p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-space-sm">
                  <span className="font-caption text-caption text-text-tertiary">Shift Status</span>
                  <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                    Shift #402 (Active)
                  </p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-space-sm">
                  <span className="font-caption text-caption text-text-tertiary">Cash Received</span>
                  <p className="font-heading-sm text-heading-sm font-bold text-text-primary mt-0.5">₦30,000</p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-space-sm">
                  <span className="font-caption text-caption text-text-tertiary">Change Dispensed</span>
                  <p className="font-heading-sm text-heading-sm font-bold text-badge-discount-text mt-0.5">₦2,749</p>
                </div>
              </div>
            </div>

            {/* Manager void / danger zone */}
            <div className="bg-error-container/40 rounded-xl p-space-lg flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-error">
                <Icon name="admin_panel_settings" className="text-[19px]" />
                <span className="font-label-md text-label-md font-semibold">Manager Clearance Required</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Issuing a refund or voiding sale #RC-94021 prompts for a Supervisor PIN, reconciles the till change
                register, and reverses 276 awarded loyalty points.
              </p>
              <button
                type="button"
                onClick={() => setVoidOpen(true)}
                className="mt-space-2xs self-start h-10 px-space-md bg-error-container text-on-error-container rounded-xl flex items-center justify-center gap-space-xs transition-colors font-label-sm text-label-sm font-semibold shadow-sm hover:opacity-90"
              >
                <Icon name="cancel" className="text-[17px]" />
                <span>Issue Refund / Void Sale</span>
              </button>
            </div>
          </div>

          {/* Right column: settled total, metadata, attached patron */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Settled total hero */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <span className="absolute -right-8 -top-8 w-28 h-28 bg-badge-discount-bg rounded-full opacity-60 pointer-events-none" />
              <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm mb-space-2xs">
                <Icon name="check_circle" filled className="text-[15px]" />
                <span>Completed &amp; Paid</span>
              </span>
              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="font-heading-sm text-heading-sm text-text-secondary font-medium">₦</span>
                <span className="font-display-hero text-display-hero text-text-primary tracking-tight">27,251</span>
              </div>
              <p className="font-label-sm text-label-sm text-text-tertiary">Gross Total Settled via Cash</p>
              <div className="mt-space-sm w-full pt-space-2xs bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between text-left gap-space-xs">
                <span className="flex items-center gap-space-xs min-w-0">
                  <Icon name="cloud_done" className="text-[17px] text-badge-discount-text shrink-0" />
                  <span className="font-caption text-caption text-text-secondary truncate">
                    Cloud Sync Active • 02:45:18 PM
                  </span>
                </span>
                <span className="font-caption text-caption font-medium text-badge-discount-text whitespace-nowrap">
                  Node 01
                </span>
              </div>
            </div>

            {/* Metadata tile */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-label-sm text-label-sm text-text-tertiary">Transaction Record</span>
                <button
                  type="button"
                  onClick={() => showToast('Copied VT-TXN-8840291')}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
                >
                  <span className="font-medium">#RC-94021</span>
                  <Icon name="content_copy" className="text-[15px]" />
                </button>
              </div>
              <div className="bg-surface-subtle rounded-lg p-space-sm flex flex-col gap-space-2xs">
                {META_ROWS.map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-left gap-space-xs">
                    <span className="font-caption text-caption text-text-tertiary shrink-0">{row.label}</span>
                    <span
                      className={`font-caption text-caption text-text-primary truncate ${row.mono ? 'select-all' : 'text-right'}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached patron */}
            <div className="bg-surface-canvas rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="flex items-center gap-space-xs">
                  <Icon name="person_pin" className="text-[19px] text-primary" />
                  <span className="font-heading-sm text-heading-sm text-text-primary">Attached Patron</span>
                </span>
                <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary">
                  VIP Tier
                </span>
              </div>
              <div className="flex items-center gap-space-sm pt-1">
                <span className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
                  <span className="font-heading-sm text-heading-sm font-bold text-primary">MJ</span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h2 className="font-label-md text-label-md font-semibold text-text-primary truncate">Michael James</h2>
                    <Icon name="verified" filled className="text-[15px] text-primary" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary">+234 803 219 8831</p>
                  <span className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                    <span className="font-caption text-caption text-badge-discount-text font-medium">
                      VEMTAP Connected
                    </span>
                  </span>
                </div>
              </div>
              <div className="bg-surface-tint-blue rounded-lg p-space-sm flex items-center justify-between gap-space-xs mt-1">
                <span className="flex items-center gap-space-xs min-w-0">
                  <Icon name="stars" filled className="text-[19px] text-primary shrink-0" />
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      +276 Points Awarded
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Balance: 1,842 pts</span>
                  </span>
                </span>
                <span className="font-caption text-caption text-primary font-medium shrink-0">Auto-credited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void confirmation modal */}
      {voidOpen && (
        <div className="fixed inset-0 z-50 bg-surface/70 backdrop-blur-sm flex items-center justify-center p-space-md">
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              setVoidOpen(false);
              setPin('');
            }}
            className="absolute inset-0"
          />
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl p-space-lg flex flex-col gap-space-sm shadow-[0_-8px_32px_rgba(0,0,0,0.18)]">
            <div className="flex justify-between items-center gap-space-xs">
              <span className="flex items-center gap-space-xs text-error min-w-0">
                <Icon name="warning" className="text-[22px] shrink-0" />
                <h3 className="font-heading-sm text-heading-sm font-bold truncate">Authorize Void Transaction</h3>
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setVoidOpen(false);
                  setPin('');
                }}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0"
              >
                <Icon name="close" className="text-text-secondary text-[17px]" />
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              Enter 4-digit Manager PIN to confirm reversal of <strong className="text-text-primary">₦27,251</strong>.
            </p>
            <button
              type="button"
              onClick={() => setPin((prev) => (prev.length < 4 ? `${prev}•` : prev))}
              className="flex justify-center gap-space-sm py-space-2xs"
            >
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="w-12 h-14 bg-surface-subtle rounded-lg flex items-center justify-center text-heading-md font-bold text-text-primary"
                >
                  {pin.length > index ? '•' : ''}
                </span>
              ))}
            </button>
            <span className="font-caption text-caption text-text-tertiary text-center -mt-1">
              Tap the boxes to enter the PIN
            </span>
            <div className="flex gap-space-xs mt-space-2xs">
              <button
                type="button"
                onClick={() => {
                  setVoidOpen(false);
                  setPin('');
                }}
                className="flex-1 h-11 bg-surface-subtle rounded-xl text-text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmVoid}
                className="flex-1 h-11 bg-error-container text-on-error-container rounded-xl font-label-md text-label-md font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2.5 rounded-xl font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
