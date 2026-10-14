import { useState, useId } from 'react';
import { Icon } from '../../ui/Icon';
import { type StoreOrder } from '../../../scripts/storeOrderingData';
import { useStoreOrdering } from '../../../context/StoreOrderingContext';

interface OrderCompletionModalProps {
  order: StoreOrder;
  onClose: () => void;
  onCompleted?: (order: StoreOrder) => void;
}

export function OrderCompletionModal({
  order,
  onClose,
  onCompleted,
}: OrderCompletionModalProps) {
  const { recordStorePayment, settings } = useStoreOrdering();
  const checkboxId = useId();

  const totalDue = order.confirmedTotal || order.estimatedTotal;
  const availableMethods = settings?.paymentMethods?.filter((m) => m.enabled) || [
    { id: 'cash', label: 'Cash at Counter' },
    { id: 'pos-terminal', label: 'External Card Terminal' },
    { id: 'bank-transfer', label: 'Direct Bank Transfer' },
    { id: 'store-credit', label: 'Store Credit / Voucher' },
  ];

  const [paymentMethod, setPaymentMethod] = useState<string>(
    availableMethods[0]?.id || 'cash'
  );
  const [amountReceived, setAmountReceived] = useState<number>(totalDue);
  const [paymentRef, setPaymentRef] = useState<string>(
    `EXT-${order.orderRef}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [notes, setNotes] = useState<string>('');
  const [staffConfirmed, setStaffConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedSuccess, setCompletedSuccess] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // Financial calculations
  const balanceRemaining = Math.max(0, totalDue - amountReceived);
  const isCash = paymentMethod === 'cash';
  const changeDue = isCash ? Math.max(0, amountReceived - totalDue) : 0;
  const isSufficient = amountReceived >= totalDue;

  const handleConfirmPayment = () => {
    if (!staffConfirmed || !isSufficient || isSubmitting) return;

    setIsSubmitting(true);
    const selectedMethodObj = availableMethods.find((m) => m.id === paymentMethod);
    const methodLabel = selectedMethodObj?.label || paymentMethod;

    const res = recordStorePayment(order.id, {
      method: methodLabel,
      amountDue: totalDue,
      amountReceived: amountReceived,
      change: changeDue,
      balance: balanceRemaining,
      reference: paymentRef.trim() || undefined,
      notes: notes.trim() || undefined,
      staffVerified: true,
      completionType: 'external-pos',
      markCompleted: true,
    });

    setIsSubmitting(false);
    if (res.ok) {
      setCompletedSuccess(true);
      onCompleted?.({
        ...order,
        status: 'completed',
        payment: {
          status: 'paid-in-store',
          method: methodLabel,
          amountDue: totalDue,
          amountReceived,
          change: changeDue,
          balance: 0,
          reference: paymentRef,
          completionType: 'external-pos',
          staffVerified: true,
          recordedBy: 'Store Staff (Verified)',
          recordedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        },
      });
    }
  };

  const copyOrderRef = () => {
    navigator.clipboard?.writeText(order.orderRef);
    setCopiedRef(true);
    window.setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl border border-border-subtle z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {!completedSuccess ? (
          /* Method A Form Panel */
          <div className="p-space-xl space-y-space-md">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center font-bold">
                  <Icon name="payments" className="text-[22px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      Record Payment &amp; Complete
                    </h3>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Order <strong className="font-mono text-primary">#{order.orderRef}</strong> • {order.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Disclaimer & External POS Clarification */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
              <Icon name="info" className="text-amber-600 text-[18px] shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-900 leading-relaxed">
                <strong>Method A — External POS / Cash / Counter Settlement:</strong> VEMTAP records the order and the staff-confirmed payment. It does not independently verify or process payment made through an external POS terminal or direct bank transfer.
              </p>
            </div>

            {/* Order Items Summary */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-caption font-semibold text-text-tertiary uppercase tracking-wider">
                <span>Order Summary</span>
                <span>{order.origin}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-body-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-text-secondary text-[13px]">
                    <span className="truncate pr-2">
                      {item.name} <strong className="text-primary font-semibold">×{item.qty}</strong>
                    </span>
                    <span className="font-mono text-text-primary shrink-0">
                      ₦{item.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-bold text-body-md text-text-primary">
                <span>Total Amount Due</span>
                <span className="text-primary text-[17px]">₦{totalDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-text-primary">
                Select Payment Tender *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary focus:outline-hidden focus:border-primary"
              >
                {availableMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Received Input & Change Calculator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-caption font-semibold text-text-primary">
                  Amount Received *
                </label>
                <button
                  type="button"
                  onClick={() => setAmountReceived(totalDue)}
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Exact Amount (₦{totalDue.toLocaleString()})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-text-tertiary">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={amountReceived || ''}
                  onChange={(e) => setAmountReceived(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary font-mono font-semibold focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Real-time Calculation Display */}
              <div className="flex items-center justify-between text-caption px-1 pt-0.5">
                {isCash ? (
                  changeDue > 0 ? (
                    <span className="font-semibold text-badge-discount-text">
                      Change Due to Customer: ₦{changeDue.toLocaleString()}
                    </span>
                  ) : balanceRemaining > 0 ? (
                    <span className="font-semibold text-error">
                      Insufficient: ₦{balanceRemaining.toLocaleString()} remaining balance
                    </span>
                  ) : (
                    <span className="text-text-secondary">Exact cash received. No change required.</span>
                  )
                ) : (
                  balanceRemaining > 0 ? (
                    <span className="font-semibold text-error">
                      Insufficient: ₦{balanceRemaining.toLocaleString()} remaining balance
                    </span>
                  ) : (
                    <span className="text-text-secondary">
                      Exact electronic tender verified (no cash change applicable).
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Transaction Reference & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Reference / Terminal Slip #
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. POS-89218 or Transfer Ref"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-caption font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">
                  Staff Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified on Zenith POS terminal"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-caption"
                />
              </div>
            </div>

            {/* Mandatory Explicit Staff Confirmation Checkbox */}
            <div className="pt-2">
              <label
                htmlFor={checkboxId}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-subtle border border-border cursor-pointer hover:bg-surface-subtle/80 transition-colors"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={staffConfirmed}
                  onChange={(e) => setStaffConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-caption text-text-primary leading-tight select-none">
                  <strong>I confirm that payment has been received and verified in full.</strong>{' '}
                  <span className="text-text-secondary">
                    Staff authorization acknowledges that goods/services are cleared for collection or delivery.
                  </span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle font-semibold text-label-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!staffConfirmed || !isSufficient || isSubmitting}
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="sync" className="text-[18px] animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check_circle" className="text-[18px]" />
                    <span>Confirm Payment &amp; Complete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success Confirmation & Receipt Panel */
          <div className="p-space-xl space-y-space-md text-center">
            <div className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center mx-auto">
              <Icon name="check_circle" className="text-[40px]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-bold text-[12px] uppercase tracking-wider">
                Order Completed &amp; Paid
              </span>
              <h3 className="font-heading-md text-heading-md font-bold text-text-primary mt-2">
                Order #{order.orderRef}
              </h3>
              <p className="text-body-sm text-text-secondary">
                {order.customerName} ({order.customerPhone}) • {order.branchName}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle text-left space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Payment Method:</span>
                <strong className="text-text-primary">{paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Amount Recorded:</span>
                <strong className="text-primary font-mono">₦{amountReceived.toLocaleString()}</strong>
              </div>
              {changeDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Change Given:</span>
                  <strong className="text-badge-discount-text font-mono">₦{changeDue.toLocaleString()}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">Transaction Ref:</span>
                <span className="font-mono text-caption text-text-tertiary">{paymentRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Completion Type:</span>
                <span className="text-caption text-text-tertiary">External POS / Staff-Verified</span>
              </div>
            </div>

            {/* Scannable Order Reference Code */}
            <div className="p-3 rounded-xl bg-surface-tint-blue/30 border border-primary/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-surface-canvas border border-border flex items-center justify-center shrink-0">
                  <Icon name="qr_code_2" className="text-primary text-[22px]" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-text-tertiary uppercase font-bold tracking-wider block">
                    Scannable Reference
                  </span>
                  <span className="font-mono font-bold text-primary text-[15px]">
                    {order.orderRef}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={copyOrderRef}
                className="px-3 py-1.5 rounded-lg border border-border bg-surface-canvas hover:bg-surface-subtle text-caption font-semibold text-text-primary flex items-center gap-1 transition-colors"
              >
                <Icon name={copiedRef ? 'check' : 'content_copy'} className="text-[14px]" />
                <span>{copiedRef ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Legal Statement */}
            <p className="text-[11px] text-text-tertiary leading-normal px-2">
              VEMTAP records the order and the staff-confirmed payment; it does not process or independently verify payment made through an external POS.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintView(true)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-subtle text-text-primary font-semibold text-label-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <Icon name="print" className="text-[18px]" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm transition-all"
              >
                Done / Back to Orders
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Overlay */}
      {showPrintView && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white text-zinc-900 rounded-2xl shadow-2xl p-6 border border-zinc-200 font-mono text-[12px] space-y-3">
            <div className="text-center pb-2 border-b border-dashed border-zinc-300">
              <h2 className="font-bold text-[16px] tracking-tight">URBAN GRILL &amp; BISTRO</h2>
              <p className="text-[11px] text-zinc-600">{order.branchName}</p>
              <p className="text-[10px] text-zinc-500">Plot 104 Apo Blvd, Abuja • +234 802 345 6789</p>
              <p className="mt-1 font-bold text-zinc-800 text-[13px]">ORDER RECEIPT #{order.orderRef}</p>
              <p className="text-[10px] text-zinc-500">{new Date().toLocaleString()}</p>
            </div>

            <div className="space-y-1.5 py-1 border-b border-dashed border-zinc-300">
              <div className="flex justify-between font-bold text-[11px] uppercase text-zinc-500 pb-1">
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2">{it.name}</span>
                  <span>×{it.qty}</span>
                  <span>₦{it.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 py-1 border-b border-dashed border-zinc-300 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>TOTAL DUE:</span>
                <span>₦{totalDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>TENDER:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>AMOUNT RECEIVED:</span>
                <span>₦{amountReceived.toLocaleString()}</span>
              </div>
              {changeDue > 0 && (
                <div className="flex justify-between font-bold">
                  <span>CHANGE GIVEN:</span>
                  <span>₦{changeDue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500 text-[10px]">
                <span>REF:</span>
                <span>{paymentRef}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500 space-y-1 pt-1">
              <p>Customer: {order.customerName} ({order.customerPhone})</p>
              <p>Channel: {order.origin}</p>
              <p className="italic">Settled via Staff-Verified External Counter Tender</p>
              <p className="font-bold pt-1">THANK YOU FOR YOUR PATRONAGE!</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-zinc-900 text-white rounded-lg font-sans font-semibold text-[13px] hover:bg-zinc-800"
              >
                Print Slip
              </button>
              <button
                type="button"
                onClick={() => setShowPrintView(false)}
                className="px-4 py-2 border border-zinc-300 rounded-lg font-sans text-zinc-700 text-[13px] hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
