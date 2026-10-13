import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { cartCount, cartTotals, type PosCartLine } from './posCartData';

interface BusinessPosPaymentScreenProps {
  cart: PosCartLine[];
  customer: string | null;
  onBack: () => void;
  onNewSale: () => void;
  onReceipt: () => void;
}

type TenderMode = 'cash' | 'card' | 'transfer' | 'vemtap' | 'split';

const TENDER_MODES: { key: TenderMode; icon: string; label: string; hint: string }[] = [
  { key: 'cash', icon: 'payments', label: 'Cash', hint: 'Count drawer · quick change' },
  { key: 'card', icon: 'credit_card', label: 'Card', hint: 'T21 terminal · tap or insert' },
  { key: 'transfer', icon: 'account_balance', label: 'Bank Transfer', hint: 'Dynamic virtual account' },
  { key: 'vemtap', icon: 'qr_code_2', label: 'VEMTAP QR', hint: 'Customer scans to pay' },
  { key: 'split', icon: 'call_split', label: 'Split Payment', hint: 'Mix cash, card and transfer' },
];

const MODE_LABEL: Record<TenderMode, string> = {
  cash: 'Cash received',
  card: 'Card approved on T21',
  transfer: 'Transfer confirmed',
  vemtap: 'VEMTAP QR settled',
  split: 'Split tender settled',
};

export function BusinessPosPaymentScreen({ cart, customer, onBack, onNewSale, onReceipt }: BusinessPosPaymentScreenProps) {
  const [mode, setMode] = useState<TenderMode>('cash');
  const [received, setReceived] = useState(0);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const count = cartCount(cart);
  const { subtotal, discount, vat, total } = cartTotals(cart);

  useEffect(() => {
    setReceived(total);
  }, [total]);

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

  const cashChips = [total, total + 2749, total + 7749, total + 17749];
  const change = Math.max(0, received - total);

  const complete = () => {
    if (mode === 'cash' && received < total) {
      showToast('Cash received is below the amount due');
      return;
    }
    setDone(true);
  };

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
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">Take Payment</span>
            <span className="font-caption text-caption text-text-secondary leading-none">Ticket #TK-204 · Till 01</span>
          </div>
          <span className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
            <Icon name="lock" className="text-primary text-[15px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-36">
        {/* Amount due */}
        <div className="px-margin pt-space-xs">
          <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Amount Due
              </span>
              <span className="font-caption text-caption text-text-secondary">{count} items</span>
            </div>
            <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">{naira(total)}</span>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary">
                {customer ?? 'Walk-in guest'}
                {customer ? ' · VIP · 540 pts' : ''}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Sub {naira(subtotal)} · VAT {naira(vat)}
                {discount > 0 ? ` · -${naira(discount)}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Tender modes */}
        <div className="px-margin pt-space-md pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Select Tender Mode
          </span>
        </div>
        <div className="px-margin flex flex-col gap-space-2xs">
          {TENDER_MODES.map((item) => {
            const isActive = item.key === mode;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={`w-full rounded-xl px-space-xs py-space-xs flex items-center justify-between gap-space-xs text-left transition-all ${
                  isActive ? 'bg-surface-tint-blue border-2 border-border-active' : 'bg-surface-canvas border-2 border-transparent shadow-sm'
                }`}
              >
                <span className="flex items-center gap-space-xs min-w-0">
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[18px]" filled={isActive} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{item.label}</span>
                    <span className="font-caption text-caption text-text-secondary truncate">{item.hint}</span>
                  </span>
                </span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isActive ? 'border-primary' : 'border-outline-variant'
                  }`}
                >
                  {isActive && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mode panel */}
        <div className="px-margin pt-space-sm">
          {mode === 'cash' && (
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Cash Tendered
              </span>
              <div className="flex gap-space-2xs">
                {cashChips.map((amount, index) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setReceived(amount)}
                    className={`flex-1 h-9 rounded-lg font-label-sm text-label-sm font-semibold transition-colors ${
                      received === amount ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    {index === 0 ? 'Exact' : `+${naira(amount - total)}`}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-space-2xs">
                <div className="bg-surface-container-low rounded-xl px-space-xs py-2 flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Received</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{naira(received)}</span>
                </div>
                <div className="bg-badge-discount-bg rounded-xl px-space-xs py-2 flex flex-col">
                  <span className="font-caption text-caption text-badge-discount-text">Change due</span>
                  <span className="font-label-md text-label-md text-badge-discount-text font-bold">{naira(change)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReceived((value) => value + 1000);
                  showToast('₦1,000 added to tendered cash');
                }}
                className="h-9 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
              >
                <Icon name="add" className="text-primary text-[16px]" />
                <span>Add ₦1,000 note</span>
              </button>
            </div>
          )}

          {mode === 'card' && (
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs items-center text-center">
              <span className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center">
                <Icon name="contactless" className="text-primary text-[24px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Terminal T21 connected</span>
              <span className="font-caption text-caption text-text-secondary max-w-[260px]">
                Ask the guest to tap, insert or swipe on the reader. Approval posts to this ticket automatically.
              </span>
              <span className="h-6 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                <Icon name="wifi" className="text-[13px]" />
                <span>Waiting for card</span>
              </span>
            </div>
          )}

          {mode === 'transfer' && (
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Dynamic Till Account
              </span>
              <div className="bg-surface-container-low rounded-xl px-space-xs py-2 flex items-center justify-between gap-space-xs">
                <div className="flex flex-col min-w-0">
                  <span className="font-caption text-caption text-text-secondary">Wema Bank · VEMTAP Escrow</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold tracking-wide">8814 2207 5541</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Account number copied to clipboard')}
                  className="h-8 px-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shrink-0"
                >
                  Copy
                </button>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Expires in 09:58 · payment of {naira(total)} confirms automatically.
              </span>
            </div>
          )}

          {mode === 'vemtap' && (
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs items-center text-center">
              <div className="w-28 h-28 rounded-xl bg-white border border-border-subtle grid grid-cols-6 gap-0.5 p-2">
                {Array.from({ length: 36 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-[2px] ${index % 3 === 0 || index % 7 === 0 ? 'bg-on-surface' : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Show QR on till screen</span>
              <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                Guest scans with the VEMTAP app · settles {naira(total)} with instant wallet confirmation.
              </span>
            </div>
          )}

          {mode === 'split' && (
            <div className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Split Tender
              </span>
              {[
                { label: 'Cash part', value: 10000, icon: 'payments' },
                { label: 'Card part', value: total - 10000, icon: 'credit_card' },
              ].map((part) => (
                <div key={part.label} className="flex items-center justify-between gap-space-xs bg-surface-container-low rounded-xl px-space-xs py-2">
                  <span className="flex items-center gap-space-2xs min-w-0">
                    <Icon name={part.icon} className="text-primary text-[16px]" />
                    <span className="font-label-sm text-label-sm text-on-surface truncate">{part.label}</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold shrink-0">{naira(part.value)}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => showToast('Split shares edited · totals rebalanced')}
                className="h-9 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
              >
                <Icon name="tune" className="text-primary text-[15px]" />
                <span>Adjust split shares</span>
              </button>
            </div>
          )}
        </div>

        {/* Footnotes */}
        <div className="px-margin pt-space-sm flex flex-col gap-space-2xs">
          {[
            { icon: 'verified_user', text: 'PCI-DSS encrypted · card data never touches this device' },
            { icon: 'sync', text: 'Settles to Shift #2 and syncs when back online' },
            { icon: 'print', text: 'Auto-print receipt after tender' },
          ].map((note) => (
            <div key={note.text} className="flex items-center gap-space-2xs">
              <Icon name={note.icon} className="text-primary text-[14px]" />
              <span className="font-caption text-caption text-text-secondary">{note.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pinned deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex flex-col gap-space-2xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={complete}
          className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
        >
          <Icon name="check_circle" className="text-[17px]" />
          <span>Complete Sale · {naira(total)}</span>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
        >
          <Icon name="arrow_back" className="text-text-secondary text-[16px]" />
          <span>Back to Cart</span>
        </button>
      </div>

      {/* Success sheet */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDone(false)}
          />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-3xl px-margin pt-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)] flex flex-col gap-space-xs">
            <div className="flex flex-col items-center text-center gap-space-2xs pt-space-xs">
              <span className="w-14 h-14 rounded-full bg-badge-discount-bg flex items-center justify-center">
                <Icon name="task_alt" filled className="text-badge-discount-text text-[28px]" />
              </span>
              <span className="font-heading-sm text-heading-sm text-on-surface font-bold">Payment Captured</span>
              <span className="font-heading-md text-heading-md text-primary font-bold">{naira(total)}</span>
              <span className="font-caption text-caption text-text-secondary">
                {MODE_LABEL[mode]} · {customer ?? 'Walk-in guest'} · 12:42 PM
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl px-space-xs py-2 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Tender</span>
                <span className="font-caption text-caption text-on-surface">{TENDER_MODES.find((m) => m.key === mode)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Loyalty</span>
                <span className="font-caption text-caption text-badge-discount-text">+272 points earned</span>
              </div>
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">Change due</span>
                <span className="font-caption text-caption text-on-surface">{mode === 'cash' ? naira(change) : '—'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNewSale}
              className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
            >
              <Icon name="add_shopping_cart" className="text-[17px]" />
              <span>Start New Sale</span>
            </button>
            <div className="flex gap-space-xs">
              <button
                type="button"
                onClick={onReceipt}
                className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
              >
                <Icon name="receipt_long" className="text-text-secondary text-[16px]" />
                <span>View Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Receipt printed on 80mm thermal printer')}
                className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
              >
                <Icon name="print" className="text-text-secondary text-[16px]" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
