import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { money } from '../services/posService';
import { usePosSale } from '../hooks/business/usePos';
import { methodLabel, naira, saleCustomer, saleStatusLabel, useLivePos, usePosRefund, useSelectedSaleId, whenLabel } from './posLive';

interface BusinessPosTransactionDetailScreenProps {
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

export function BusinessPosTransactionDetailScreen({ onBack }: BusinessPosTransactionDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [pin, setPin] = useState('');
  const toastTimer = useRef<number | null>(null);
  const live = hasApiConfig();
  const pos = useLivePos();
  const saleId = useSelectedSaleId();
  const saleQuery = usePosSale(live ? saleId : null);
  const sale = saleQuery.data ?? null;
  const { refund, pending: refunding } = usePosRefund();
  const v = <T,>(liveValue: T, demoValue: T) => (live ? liveValue : demoValue);
  const total = sale ? money(sale.total) : 0;
  const refundable = sale ? sale.status === 'completed' || sale.status === 'partial_refund' : false;
  const metaRows = live
    ? [
        { label: 'UUID', value: sale?.id ?? '—', mono: true },
        { label: 'Timestamp', value: whenLabel(sale?.createdAt) },
        { label: 'Cashier', value: sale?.cashierName ?? '—' },
        { label: 'Outlet Branch', value: sale?.branch?.name ?? pos.branchName },
        { label: 'Hardware POS', value: '—' },
      ]
    : META_ROWS;
  const receiptLines = live
    ? (sale?.items ?? []).map((item) => ({
        qty: item.quantity,
        name: item.productName ?? 'Item',
        meta: item.refundedQuantity ? `${item.refundedQuantity} refunded` : item.sku ?? '',
        price: naira(money(item.totalPrice)),
        was: null as string | null,
        chip: money(item.discount) ? `-${naira(money(item.discount))}` : null,
      }))
    : RECEIPT_LINES;
  const calcRows = live
    ? [
        { label: 'Subtotal', value: naira(money(sale?.subtotal)), accent: false },
        ...(money(sale?.discountAmount) ? [{ label: 'Discount', value: `-${naira(money(sale?.discountAmount))}`, accent: true }] : []),
        { label: 'Tax', value: naira(money(sale?.tax)), accent: false },
      ]
    : CALC_ROWS;

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
    if (live && saleQuery.error) showToast(apiErrorMessage(saleQuery.error, 'Could not load this sale.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleQuery.error]);

  const openVoid = () => {
    if (live && !refundable) {
      showToast(sale ? `This sale is ${saleStatusLabel(sale).toLowerCase()} — nothing left to refund` : 'Open a sale from the ledger first');
      return;
    }
    setVoidOpen(true);
  };

  const confirmVoid = () => {
    if (live) {
      if (!sale || refunding) return;
      refund(sale, { reason: 'Refunded at the till' })
        .then(() => {
          setVoidOpen(false);
          setPin('');
          showToast(`Sale #${sale.receiptNumber} refunded`);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not refund this sale.')));
      return;
    }
    if (pin.length < 4) {
      showToast('Enter the full 4-digit Manager PIN');
      return;
    }
    setVoidOpen(false);
    setPin('');
    showToast('Manager PIN validated. Reversal initialized.');
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors shrink-0"
            >
              <Icon name="arrow_back_ios_new" className="text-[22px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">Transaction Details</h1>
          </div>
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </span>
        </div>
      </header>

      <div className="px-space-md pt-space-xs pb-10 flex flex-col gap-space-md">
        {/* Reassurance & high impact header */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <span className="absolute -right-8 -top-8 w-28 h-28 bg-badge-discount-bg rounded-full opacity-60 pointer-events-none" />
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm mb-space-2xs">
            <Icon name="check_circle" filled className="text-[15px]" />
            <span>{live ? (sale ? saleStatusLabel(sale) : '—') : 'Completed & Paid'}</span>
          </span>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="font-heading-sm text-heading-sm text-text-secondary font-medium">₦</span>
            <span className="font-heading-md text-heading-md text-text-primary tracking-tight font-bold">{v(total.toLocaleString('en-NG'), '27,251')}</span>
          </div>
          <p className="font-label-sm text-label-sm text-text-tertiary">{live ? `Gross Total Settled via ${methodLabel(sale?.paymentMethod)}` : 'Gross Total Settled via Cash'}</p>
          <div className="mt-space-sm w-full pt-space-2xs bg-surface-subtle rounded-lg px-space-sm py-space-2xs flex items-center justify-between text-left gap-space-xs">
            <span className="flex items-center gap-space-xs min-w-0">
              <Icon name="cloud_done" className="text-[17px] text-badge-discount-text shrink-0" />
              <span className="font-caption text-caption text-text-secondary truncate">
                {live ? `Synced • ${whenLabel(sale?.createdAt)}` : 'Cloud Sync Active • 02:45:18 PM'}
              </span>
            </span>
            <span className="font-caption text-caption font-medium text-badge-discount-text whitespace-nowrap">
              {v('Cloud', 'Node 01')}
            </span>
          </div>
        </div>

        {/* Metadata bento tile */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm text-text-tertiary">Transaction Record</span>
            <button
              type="button"
              onClick={() => {
                if (!live) {
                  showToast('Copied VT-TXN-8840291');
                  return;
                }
                if (!sale) return;
                void navigator.clipboard?.writeText(sale.receiptNumber);
                showToast(`Copied ${sale.receiptNumber}`);
              }}
              className="flex items-center gap-1 font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
            >
              <span className="font-medium">#{v(sale?.receiptNumber ?? '—', 'RC-94021')}</span>
              <Icon name="content_copy" className="text-[15px]" />
            </button>
          </div>
          <div className="bg-surface-subtle rounded-lg p-space-sm flex flex-col gap-space-2xs">
            {metaRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center text-left gap-space-xs">
                <span className="font-caption text-caption text-text-tertiary shrink-0">{row.label}</span>
                <span
                  className={`font-caption text-caption text-text-primary truncate ${
                    row.mono ? 'select-all' : 'text-right'
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer information card */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-xs">
              <Icon name="person_pin" className="text-[19px] text-primary" />
              <span className="font-heading-sm text-heading-sm text-text-primary">Attached Patron</span>
            </span>
            <span className="font-caption text-caption font-semibold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
              VIP Tier
            </span>
          </div>
          <div className="flex items-center gap-space-sm pt-1">
            <span className="w-12 h-12 rounded-full bg-surface-tint-blue flex items-center justify-center shrink-0">
              <span className="font-heading-sm text-heading-sm font-bold text-primary">MJ</span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-label-md text-label-md font-semibold text-text-primary truncate">{v(sale ? saleCustomer(sale) || 'Walk-in guest' : '—', 'Michael James')}</h2>
                <Icon name="verified" filled className="text-[15px] text-primary" />
              </div>
              <p className="font-caption text-caption text-text-secondary">{v(sale?.customer?.phone ?? '—', '+234 803 219 8831')}</p>
              <span className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-badge-discount-text font-medium">{v(sale?.customerId ? 'VEMTAP Connected' : 'No customer attached', 'VEMTAP Connected')}</span>
              </span>
            </div>
          </div>
          <div className="bg-surface-tint-blue rounded-lg p-space-sm flex items-center justify-between gap-space-xs mt-1">
            <span className="flex items-center gap-space-xs min-w-0">
              <Icon name="stars" filled className="text-[19px] text-primary shrink-0" />
              <span className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                  {v(`+${(sale?.pointsEarned ?? 0).toLocaleString()} Points Awarded`, '+276 Points Awarded')}
                </span>
                <span className="font-caption text-caption text-text-secondary">{v('Balance: —', 'Balance: 1,842 pts')}</span>
              </span>
            </span>
            <span className="font-caption text-caption text-primary font-medium shrink-0">Auto-credited</span>
          </div>
        </div>

        {/* Itemized receipt */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between gap-space-xs">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Order Items ({v(receiptLines.length, 3)})</h2>
            <span className="font-caption text-caption text-text-tertiary">
              {v(sale?.orderType === 'takeaway' ? 'Takeaway' : 'Dine-In', 'Dine-In • Table 04')}
            </span>
          </div>
          <div className="flex flex-col gap-space-sm">
            {receiptLines.map((line, index) => (
              <div key={`${line.name}-${index}`} className="flex items-start justify-between gap-space-xs">
                <span className="w-7 h-7 rounded bg-surface-subtle flex items-center justify-center shrink-0 mt-0.5">
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
            {calcRows.map((row) => (
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
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{v(naira(total), '₦27,251')}</span>
            </div>
          </div>
        </div>

        {/* Tender & cash management */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs mb-1">
            <Icon name="payments" className="text-[19px] text-secondary" />
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Payment Tender</h2>
          </div>
          <div className="grid grid-cols-2 gap-space-2xs">
            <div className="bg-surface-subtle rounded-lg p-space-sm">
              <span className="font-caption text-caption text-text-tertiary">Payment Method</span>
              <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5 flex items-center gap-1">
                <Icon name="point_of_sale" className="text-[15px] text-badge-discount-text" />
                <span>{v(methodLabel(sale?.paymentMethod), 'Cash Tender')}</span>
              </p>
            </div>
            <div className="bg-surface-subtle rounded-lg p-space-sm">
              <span className="font-caption text-caption text-text-tertiary">Shift Status</span>
              <p className="font-label-md text-label-md font-semibold text-text-primary mt-0.5">
                {v(sale && pos.session && sale.createdAt && sale.createdAt >= pos.session.openedAt ? 'This shift (Active)' : 'Closed shift', 'Shift #402 (Active)')}
              </p>
            </div>
            <div className="bg-surface-subtle rounded-lg p-space-sm">
              <span className="font-caption text-caption text-text-tertiary">Cash Received</span>
              <p className="font-heading-sm text-heading-sm font-bold text-text-primary mt-0.5">{v(naira(money(sale?.amountPaid)), '₦30,000')}</p>
            </div>
            <div className="bg-surface-subtle rounded-lg p-space-sm">
              <span className="font-caption text-caption text-text-tertiary">Change Dispensed</span>
              <p className="font-heading-sm text-heading-sm font-bold text-badge-discount-text mt-0.5">{v(naira(money(sale?.change)), '₦2,749')}</p>
            </div>
          </div>
        </div>

        {/* Actions deck */}
        <div className="flex flex-col gap-space-2xs">
          <button
            type="button"
            onClick={() => (live ? window.print() : showToast('Sent to 80mm Counter Printer 01'))}
            className="w-full h-11 bg-primary-container active:scale-[0.98] transition-transform rounded-xl flex items-center justify-center gap-space-xs text-on-primary font-label-md text-label-md font-semibold shadow-md"
          >
            <Icon name="print" className="text-[21px]" />
            <span>Print Receipt (80mm Thermal)</span>
          </button>
          <div className="grid grid-cols-2 gap-space-2xs">
            <button
              type="button"
              onClick={() => showToast(live ? 'WhatsApp / SMS receipts are coming soon' : 'Dispatch sent via SMS/WhatsApp')}
              className="h-10 bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-xl flex items-center justify-center gap-space-2xs text-text-primary font-label-sm text-label-sm font-semibold"
            >
              <Icon name="share" className="text-[17px] text-badge-discount-text" />
              <span>WhatsApp / SMS</span>
            </button>
            <button
              type="button"
              onClick={() => showToast(live ? 'E-receipts are coming soon' : 'Opening digital customer slip')}
              className="h-10 bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-xl flex items-center justify-center gap-space-2xs text-text-primary font-label-sm text-label-sm font-semibold"
            >
              <Icon name="receipt_long" className="text-[17px] text-primary" />
              <span>View E-Receipt</span>
            </button>
          </div>
        </div>

        {/* Management void / danger zone */}
        <div className="bg-error-container/40 rounded-xl p-space-md flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs text-error">
            <Icon name="admin_panel_settings" className="text-[19px]" />
            <span className="font-label-md text-label-md font-semibold">Manager Clearance Required</span>
          </div>
          <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
            {live
              ? `Issuing a refund on sale #${sale?.receiptNumber ?? '—'} may ask for a Supervisor PIN, reconciles the till and reverses ${sale?.pointsEarned ?? 0} awarded loyalty points.`
              : 'Issuing a refund or voiding sale #RC-94021 prompts for a Supervisor PIN, reconciles the till change register, and reverses 276 awarded loyalty points.'}
          </p>
          <button
            type="button"
            onClick={openVoid}
            className="mt-space-2xs w-full h-10 bg-on-error rounded-xl flex items-center justify-center gap-space-xs text-error active:bg-error-container/60 transition-colors font-label-sm text-label-sm font-semibold shadow-sm"
          >
            <Icon name="cancel" className="text-[17px]" />
            <span>Issue Refund / Void Sale</span>
          </button>
        </div>
      </div>

      {/* Void confirmation sheet */}
      {voidOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end justify-center">
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              setVoidOpen(false);
              setPin('');
            }}
            className="absolute inset-0"
          />
          <div className="relative w-full max-w-[430px] bg-surface-container-lowest rounded-t-2xl p-space-lg flex flex-col gap-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)]">
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
              Enter 4-digit Manager PIN to confirm reversal of <strong className="text-text-primary">{v(naira(total), '₦27,251')}</strong>.
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
            <div className="flex gap-space-2xs mt-space-2xs">
              <button
                type="button"
                onClick={() => {
                  setVoidOpen(false);
                  setPin('');
                }}
                className="flex-1 h-11 bg-surface-subtle rounded-xl text-text-primary font-label-sm text-label-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmVoid}
                className="flex-1 h-11 bg-error text-on-error rounded-xl font-label-md text-label-md font-semibold shadow-md"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-space-md py-space-2xs rounded-full bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center gap-space-xs pointer-events-none max-w-[90%]">
          <Icon name="check_circle" className="text-[17px] text-badge-discount-text" />
          <span className="font-label-sm text-label-sm truncate">{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
