import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { naira } from './catalogueData';
import { cartCount, cartTotals, formatReceiptText, type PosCartLine } from './posCartData';
import { usePosSettings } from '../context/PosSettingsContext';
import { useBusinessBranch } from '../context/BusinessBranchContext';

interface BusinessPosSaleCompleteScreenProps {
  cart: PosCartLine[];
  customer: string | null;
  /** Loyalty points awarded during the sale — only shown when customer details were added. */
  awardedPoints: number;
  onBack: () => void;
  onNewSale: () => void;
}

const RECEIPT_ACTIONS = [
  { key: 'print', icon: 'print', label: 'Print' },
  { key: 'sms', icon: 'sms', label: 'SMS' },
  { key: 'email', icon: 'mail', label: 'Email' },
  { key: 'wallet', icon: 'account_balance_wallet', label: 'Wallet' },
];

export function BusinessPosSaleCompleteScreen({
  cart,
  customer,
  awardedPoints,
  onBack,
  onNewSale,
}: BusinessPosSaleCompleteScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
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

  useEffect(() => {
    // Auto-print receipt — controlled from POS Settings.
    if (autoPrintReceipt) showToast('Receipt printed on counter printer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = cartCount(cart);
  const {
    taxMode,
    taxRate,
    taxLabel,
    loyaltyEnabled,
    autoPrintReceipt,
    businessName,
    businessAddress,
    businessPhone,
    receiptHeader,
    receiptFooter,
    showBusinessLogo,
  } = usePosSettings();
  const { branch } = useBusinessBranch();
  const { subtotal, discount, vat, total } = cartTotals(cart, taxMode, taxRate / 100);
  const receiptLines = cart.length > 0 ? cart : [];
  const paidTotal = cart.length > 0 ? total : 27251;

  const actionLabel: Record<string, string> = {
    print: 'Receipt sent to counter printer',
    sms: 'Receipt sent by SMS to +234 803 411 9082',
    email: 'Receipt emailed to adaeze.n@email.com',
    wallet: 'Saved to customer VEMTAP wallet',
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
            <span className="font-heading-sm text-heading-sm text-on-surface leading-tight truncate">
              Sale Completed
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">Ticket #POS-1049</span>
          </div>
          <span className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
            <Icon name="task_alt" filled className="text-badge-discount-text text-[16px]" />
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-36">
        {/* Hero */}
        <div className="px-margin pt-space-md pb-space-xs flex flex-col items-center text-center gap-space-2xs">
          <span className="relative w-14 h-14 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-badge-discount-bg animate-pulse" />
            <span className="relative w-14 h-14 rounded-full bg-badge-discount-text flex items-center justify-center shadow-lg">
              <Icon name="check" filled className="text-white text-[28px]" />
            </span>
          </span>
          <span className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight mt-1">
            Payment Received
          </span>
          <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">
            {naira(paidTotal)}
          </span>
          <span className="font-caption text-caption text-text-secondary">
            Card ····4821 approved · 12:42 PM · Ref VEM-90482
          </span>
          <div className="flex items-center gap-space-2xs mt-1">
            <span className="h-6 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1">
              <Icon name="loyalty" className="text-[13px]" />
              <span>
                {!loyaltyEnabled
                  ? 'Loyalty earning off'
                  : customer
                    ? `${customer} earned ${awardedPoints.toLocaleString()} pts`
                    : 'Walk-in · no loyalty attached'}
              </span>
            </span>
            <span className="h-6 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center">
              Synced
            </span>
          </div>
        </div>

        {/* Receipt slip */}
        <div className="px-margin pt-space-sm">
          <div className="bg-surface-canvas rounded-t-2xl shadow-md px-space-sm pt-space-sm pb-space-xs flex flex-col gap-space-2xs relative">
            {receiptHeader && (
              <span className="font-caption text-caption text-text-secondary text-center pt-0.5">
                {formatReceiptText(receiptHeader, businessName)}
              </span>
            )}
            <div className="flex flex-col items-center gap-0.5 text-center">
              {showBusinessLogo && <Logo variant="mark" alt={businessName} className="h-6 w-auto" />}
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">{businessName}</span>
              <span className="font-caption text-caption text-text-secondary">{branch.name}</span>
              <span className="font-caption text-caption text-text-secondary">{businessAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary">Cashier: Emeka O.</span>
              <span className="font-caption text-caption text-text-secondary">10 Oct 2026 · 12:42</span>
            </div>

            <div className="h-px border-t border-dashed border-border-subtle my-0.5" />

            {receiptLines.map((line) => (
              <div key={line.id} className="flex items-start justify-between gap-space-xs">
                <span className="font-caption text-caption text-on-surface truncate">
                  {line.qty} × {line.name}
                </span>
                <span className="font-caption text-caption text-on-surface shrink-0">
                  {naira(line.member * line.qty)}
                </span>
              </div>
            ))}
            {receiptLines.length === 0 && (
              <span className="font-caption text-caption text-text-secondary text-center py-1">
                4 items · walk-in ticket
              </span>
            )}

            <div className="h-px border-t border-dashed border-border-subtle my-0.5" />

            <div className="flex justify-between">
              <span className="font-caption text-caption text-text-secondary">
                Subtotal {receiptLines.length > 0 ? `(${count} items)` : '(4 items)'}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                {naira(receiptLines.length > 0 ? subtotal : 29700)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="font-caption text-caption text-badge-discount-text">Member savings</span>
                <span className="font-caption text-caption text-badge-discount-text">-{naira(discount)}</span>
              </div>
            )}
            {taxMode !== 'none' && (
              <div className="flex justify-between">
                <span className="font-caption text-caption text-text-secondary">
                  {taxLabel} ({taxRate}%){taxMode === 'inclusive' && ' · included'}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {naira(receiptLines.length > 0 ? vat : 2073)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-end pt-0.5">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Total paid</span>
              <span className="font-label-md text-label-md text-primary font-bold">{naira(paidTotal)}</span>
            </div>

            {(receiptFooter || businessPhone) && (
              <div className="flex flex-col items-center gap-0.5 pt-space-xs text-center">
                {receiptFooter && (
                  <span className="font-caption text-caption text-text-secondary">
                    {formatReceiptText(receiptFooter, businessName)}
                  </span>
                )}
                {businessPhone && (
                  <span className="font-caption text-caption text-text-tertiary">{businessPhone}</span>
                )}
              </div>
            )}

            {/* Scalloped edge */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 -bottom-2 h-4 bg-surface-canvas"
              style={{
                maskImage: 'radial-gradient(circle 8px at 8px 0, transparent 98%, black 100%)',
                WebkitMaskImage: 'radial-gradient(circle 8px at 8px 0, transparent 98%, black 100%)',
                maskSize: '16px 16px',
                WebkitMaskSize: '16px 16px',
                maskRepeat: 'repeat-x',
                WebkitMaskRepeat: 'repeat-x',
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-space-2xs pt-space-sm">
            <Icon name="verified_user" className="text-primary text-[14px]" />
            <span className="font-caption text-caption text-text-secondary">
              Encrypted receipt · retained 90 days for reconciliation
            </span>
          </div>
        </div>

        {/* Receipt delivery */}
        <div className="px-margin pt-space-sm pb-space-2xs">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            Send Receipt
          </span>
        </div>
        <div className="px-margin grid grid-cols-4 gap-space-2xs">
          {RECEIPT_ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => showToast(actionLabel[action.key])}
              className="h-16 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
            >
              <Icon name={action.icon} className="text-primary text-[18px]" />
              <span className="font-caption text-caption text-on-surface leading-none">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Pinned deck */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex flex-col gap-space-2xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
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
              onClick={onBack}
              className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
            >
              <Icon name="point_of_sale" className="text-text-secondary text-[16px]" />
              <span>POS Home</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Order #POS-1049 opened in history')}
              className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs"
            >
              <Icon name="receipt_long" className="text-text-secondary text-[16px]" />
              <span>View Sale</span>
            </button>
          </div>
        </div>
      </div>

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
