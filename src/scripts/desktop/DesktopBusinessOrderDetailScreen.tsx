import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { type StoreOrder } from '../../scripts/storeOrderingData';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import { OrderCompletionModal } from '../../components/desktop/dialogs/OrderCompletionModal';

interface DesktopBusinessOrderDetailScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack: () => void;
  order?: StoreOrder;
  orderStatus?: 'new' | 'accepted' | 'preparing' | 'ready';
  onAccept?: () => void;
  onDecline?: () => void;
  onStatusChange?: (status: string) => void;
}

export function DesktopBusinessOrderDetailScreen({
  onNav,
  onBack,
  order: propOrder,
  onAccept,
  onDecline,
}: DesktopBusinessOrderDetailScreenProps) {
  const { orders, updateOrderStatus, setActivePosHandoffOrderId, settings, lastError, clearLastError } = useStoreOrdering();
  const [toast, setToast] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [printKOTOpen, setPrintKOTOpen] = useState(false);
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // Live: a refused status change or payment comes back here.
  useEffect(() => {
    if (!lastError) return;
    showToast(lastError);
    clearLastError();
  }, [lastError, clearLastError]);

  // Resolve active order from store or fallback
  const currentOrder: StoreOrder =
    (propOrder && orders.find((o) => o.id === propOrder.id || o.orderRef === propOrder.orderRef)) ||
    propOrder ||
    orders[0];

  if (!currentOrder) {
    return (
      <BusinessPortalChrome activeNav="orders" onNav={onNav}>
        <div className="w-full py-space-xl text-center space-y-4">
          <p className="text-text-secondary">No order found.</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-label-md"
          >
            Back to Orders
          </button>
        </div>
      </BusinessPortalChrome>
    );
  }

  const isAccepted = currentOrder.status !== 'new';
  const isPaid = currentOrder.payment.status === 'paid-in-store' || currentOrder.status === 'paid' || currentOrder.status === 'completed';
  const totalAmount = currentOrder.confirmedTotal || currentOrder.estimatedTotal;
  const subtotal = currentOrder.subtotal || totalAmount;
  const savings = currentOrder.savings || 0;

  // Build progression timeline
  const timelineSteps = [
    {
      label: 'Order Placed',
      meta: `${currentOrder.date}, ${currentOrder.time} • ${currentOrder.origin}`,
      state: 'done',
    },
    {
      label: 'Accepted & Assigned',
      meta: currentOrder.assignedStaff ? `Assigned to ${currentOrder.assignedStaff}` : 'Pending staff assignment',
      state: isAccepted ? 'done' : 'current',
    },
    {
      label: 'Kitchen Preparation',
      meta: `Est. prep: ~${currentOrder.estimatedPrepMins || 20} mins`,
      state:
        currentOrder.status === 'preparing'
          ? 'current'
          : currentOrder.status === 'ready' || isPaid
            ? 'done'
            : 'todo',
    },
    {
      label: 'Ready for Collection',
      meta: currentOrder.pickupInstructions || 'Pickup counter',
      state:
        currentOrder.status === 'ready'
          ? 'current'
          : isPaid
            ? 'done'
            : 'todo',
    },
    {
      label: 'Payment & Handover',
      meta: isPaid ? `Settled via ${currentOrder.payment.method || 'POS'}` : 'Awaiting payment verification',
      state: currentOrder.status === 'completed' ? 'done' : isPaid ? 'current' : 'todo',
    },
  ];

  const handleAccept = () => {
    updateOrderStatus(currentOrder.id, 'accepted', 'Order accepted by store staff', 'Store Staff');
    onAccept?.();
    showToast(`Order #${currentOrder.orderRef} accepted and sent to kitchen`);
  };

  const handleStartPrep = () => {
    updateOrderStatus(currentOrder.id, 'preparing', 'Preparation started', 'Store Staff');
    showToast(`Order #${currentOrder.orderRef} marked as in preparation`);
  };

  const handleMarkReady = () => {
    updateOrderStatus(currentOrder.id, 'ready', 'Order ready for customer pickup', 'Store Staff');
    showToast(`Order #${currentOrder.orderRef} marked ready for pickup`);
  };

  const handleCompleteHandover = () => {
    updateOrderStatus(currentOrder.id, 'completed', 'Order handed over to customer', 'Store Staff');
    showToast(`Order #${currentOrder.orderRef} completed!`);
  };

  const handlePosHandoff = () => {
    setActivePosHandoffOrderId(currentOrder.id);
    showToast(`Transferring Order #${currentOrder.orderRef} to POS Register...`);
    onNav('pos-sale' as BusinessPortalNavKey);
  };

  return (
    <BusinessPortalChrome activeNav="orders" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-text-tertiary font-label-sm text-label-sm">
            <button type="button" onClick={() => onNav('overview')} className="hover:text-primary transition-colors">
              Business
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button type="button" onClick={onBack} className="hover:text-primary transition-colors">
              Orders &amp; Fulfillment
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-medium">#{currentOrder.orderRef}</span>
          </nav>

          {/* Action Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm flex-wrap">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle transition-colors"
              >
                <Icon name="arrow_back" className="text-[16px]" />
                <span>Back to Orders</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintKOTOpen(true)}
                className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
              >
                <Icon name="print" className="text-[16px]" />
                <span>Print KOT Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintReceiptOpen(true)}
                className="px-space-sm py-space-xs rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle flex items-center gap-space-2xs transition-colors"
              >
                <Icon name="receipt_long" className="text-[16px]" />
                <span>Print Receipt</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-caption text-text-secondary">
                Origin: <strong className="text-primary">{currentOrder.origin}</strong>
              </span>
              {currentOrder.sourceRef && (
                <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-[11px] font-mono text-text-tertiary">
                  {currentOrder.sourceRef}
                </span>
              )}
            </div>
          </div>

          {/* Order Status & Key Actions Banner */}
          <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="space-y-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight font-bold">
                    #{currentOrder.orderRef}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${
                      currentOrder.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : currentOrder.status === 'ready'
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : currentOrder.status === 'preparing'
                            ? 'bg-amber-500/15 text-amber-700'
                            : currentOrder.status === 'accepted'
                              ? 'bg-surface-tint-blue text-primary'
                              : 'bg-surface-tint-blue text-primary'
                    }`}
                  >
                    {currentOrder.status === 'new'
                      ? 'NEW ORDER'
                      : currentOrder.status === 'accepted'
                        ? 'ACCEPTED'
                        : currentOrder.status === 'preparing'
                          ? 'IN KITCHEN'
                          : currentOrder.status === 'ready'
                            ? 'READY FOR PICKUP'
                            : currentOrder.status === 'completed'
                              ? 'COMPLETED'
                              : currentOrder.status}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-subtle text-on-surface-variant font-label-sm text-label-sm">
                    {currentOrder.branchName}
                  </span>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  {currentOrder.customerName} • Placed {currentOrder.time} •{' '}
                  <span className="text-primary font-bold">₦{totalAmount.toLocaleString()}</span> •{' '}
                  <span className={isPaid ? 'text-badge-discount-text font-semibold' : 'text-amber-600 font-semibold'}>
                    {isPaid ? `Paid (${currentOrder.payment.method || 'Recorded'})` : 'Awaiting Payment'}
                  </span>
                </p>
              </div>

              {/* Dynamic Contextual Action Buttons */}
              <div className="flex items-center gap-space-sm flex-wrap">
                {currentOrder.status === 'new' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateOrderStatus(currentOrder.id, 'rejected', 'Order declined by store', 'Store Staff');
                        onDecline?.();
                        showToast(`Order #${currentOrder.orderRef} declined`);
                      }}
                      className="h-11 px-space-md rounded-xl border border-error text-error font-label-md text-label-md hover:bg-error/5 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                    >
                      <Icon name="check" filled className="text-[18px]" />
                      <span>Accept Order</span>
                    </button>
                  </>
                )}

                {currentOrder.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={handleStartPrep}
                    className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                  >
                    <Icon name="restaurant" className="text-[18px]" />
                    <span>Start Kitchen Preparation</span>
                  </button>
                )}

                {currentOrder.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={handleMarkReady}
                    className="h-11 px-space-md rounded-xl bg-badge-discount-text text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                  >
                    <Icon name="check_circle" className="text-[18px]" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                )}

                {!isPaid && (currentOrder.status === 'ready' || currentOrder.status === 'accepted' || currentOrder.status === 'preparing') && (
                  settings?.usePosForCompletion ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentModalOpen(true)}
                        className="h-11 px-space-sm rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-subtle font-label-md text-label-md font-semibold transition-colors"
                      >
                        Record External Payment
                      </button>
                      <button
                        type="button"
                        onClick={handlePosHandoff}
                        className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                      >
                        <Icon name="point_of_sale" className="text-[18px]" />
                        <span>Complete in VEMTAP POS →</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(true)}
                      className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                    >
                      <Icon name="payments" className="text-[18px]" />
                      <span>Record Payment &amp; Complete Order</span>
                    </button>
                  )
                )}

                {isPaid && currentOrder.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={handleCompleteHandover}
                    className="h-11 px-space-md rounded-xl bg-badge-discount-text text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm flex items-center gap-space-xs transition-all font-semibold"
                  >
                    <Icon name="done_all" className="text-[18px]" />
                    <span>Complete Handover</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            {/* LEFT COLUMN: Customer + Items Manifest + Financials */}
            <div className="xl:col-span-7 space-y-space-lg">
              {/* Customer Card */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md font-bold">
                  Customer &amp; Origin Details
                </h2>
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Icon name="person" filled className="text-on-primary text-[22px]" />
                  </div>
                  <div className="flex-1 space-y-space-2xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                        {currentOrder.customerName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                        {currentOrder.origin}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {currentOrder.customerPhone} {currentOrder.customerEmail ? `• ${currentOrder.customerEmail}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-space-sm pt-space-2xs">
                      <a
                        href={`tel:${currentOrder.customerPhone}`}
                        className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors"
                      >
                        <Icon name="call" className="text-[14px]" /> Call
                      </a>
                      <button
                        type="button"
                        onClick={() => onNav('messages')}
                        className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-lg border border-border font-label-sm text-label-sm text-primary hover:bg-surface-tint-blue transition-colors"
                      >
                        <Icon name="chat" className="text-[14px]" /> Chat
                      </button>
                    </div>
                  </div>
                </div>

                {currentOrder.placementDetails && (
                  <div className="mt-space-sm p-space-sm rounded-xl bg-surface-subtle flex items-start gap-space-xs">
                    <Icon name="place" className="text-[16px] text-primary mt-0.5" />
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      <strong>Placement / Table:</strong> {currentOrder.placementDetails}
                    </p>
                  </div>
                )}

                {currentOrder.customerNotes && (
                  <div className="mt-space-sm p-space-sm rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-space-xs">
                    <Icon name="sticky_note_2" className="text-[16px] text-amber-700 mt-0.5" />
                    <p className="font-body-sm text-body-sm text-amber-900">
                      <strong>Customer Special Request:</strong> {currentOrder.customerNotes}
                    </p>
                  </div>
                )}
              </section>

              {/* Order Manifest (Items List) */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center justify-between mb-space-md">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">
                    Order Items ({currentOrder.items.length})
                  </h2>
                  <span className="text-caption text-text-tertiary">Single Central Record</span>
                </div>

                <div className="space-y-space-sm">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-space-md p-space-sm rounded-xl border border-border bg-surface-canvas"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border-subtle"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
                          <Icon name="restaurant" className="text-[20px]" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-md text-label-md text-primary font-bold">
                            ×{item.qty}
                          </span>
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {item.name}
                          </span>
                        </div>
                        {item.variant && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{item.variant}</p>
                        )}
                        {item.options && item.options.length > 0 && (
                          <p className="text-[11px] text-text-tertiary">{item.options.join(', ')}</p>
                        )}
                        {item.dealDiscount && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-badge-discount-bg text-badge-discount-text font-semibold mt-1">
                            {item.dealDiscount}
                          </span>
                        )}
                        {item.serviceAppointmentTime && (
                          <span className="inline-block text-[11px] text-primary font-semibold mt-1">
                            Appt: {item.serviceAppointmentTime}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-label-md text-label-md text-on-surface font-bold block">
                          ₦{item.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          ₦{item.unitPrice.toLocaleString()} ea
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Financials & Settlement */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <h2 className="font-heading-sm text-heading-sm text-on-surface mb-space-md font-bold">
                  Financial Summary &amp; Payment Status
                </h2>
                <div className="space-y-space-xs font-body-md text-body-md">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Gross Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-badge-discount-text font-semibold">
                      <span>Discount / Promotion Applied</span>
                      <span>− ₦{savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-space-xs flex justify-between font-heading-sm text-heading-sm">
                    <span className="text-on-surface font-bold">Total Confirmed</span>
                    <span className="text-primary font-bold">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-space-md p-space-sm rounded-xl bg-surface-subtle border border-border space-y-1.5 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Payment Status:</span>
                    <span className="font-semibold text-text-primary capitalize">{currentOrder.payment.status}</span>
                  </div>
                  {currentOrder.payment.method && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tender Method:</span>
                      <span className="font-semibold text-text-primary">{currentOrder.payment.method}</span>
                    </div>
                  )}
                  {currentOrder.payment.reference && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Payment Reference:</span>
                      <span className="font-mono text-caption text-text-primary">{currentOrder.payment.reference}</span>
                    </div>
                  )}
                  {currentOrder.payment.posTransactionId && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">POS Txn ID:</span>
                      <span className="font-mono text-caption text-primary font-bold">
                        {currentOrder.payment.posTransactionId}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Progression Timeline + Fulfillment */}
            <div className="xl:col-span-5 space-y-space-lg">
              {/* Progression Stepper */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg">
                <div className="flex items-center justify-between mb-space-md">
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">
                    Order Progression
                  </h2>
                  <span className="font-mono text-caption text-primary font-semibold">
                    Ref: {currentOrder.orderRef}
                  </span>
                </div>

                <div className="space-y-0">
                  {timelineSteps.map((step, i) => (
                    <div key={step.label} className="flex gap-space-sm">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.state === 'done'
                              ? 'bg-primary text-on-primary'
                              : step.state === 'current'
                                ? 'bg-surface-tint-blue text-primary border-2 border-primary'
                                : 'bg-surface-subtle text-text-tertiary border border-border'
                          }`}
                        >
                          {step.state === 'done' ? (
                            <Icon name="check" filled className="text-[14px]" />
                          ) : (
                            <span className="font-caption text-caption font-semibold">{i + 1}</span>
                          )}
                        </div>
                        {i < timelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 min-h-6 ${
                              step.state === 'done' ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pb-space-md flex-1">
                        <div
                          className={`font-label-md text-label-md ${
                            step.state === 'todo'
                              ? 'text-on-surface-variant'
                              : 'text-on-surface font-semibold'
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {step.meta}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Fulfillment & Handover Instructions */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg space-y-space-sm">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">
                  Fulfillment &amp; Location
                </h2>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Branch</span>
                  <span className="text-on-surface font-semibold">{currentOrder.branchName}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Pickup Notice</span>
                  <span className="text-on-surface text-right text-caption max-w-[200px]">
                    {currentOrder.pickupInstructions || 'Proceed to Express Pickup counter'}
                  </span>
                </div>
              </section>

              {/* Scannable Order QR Reference */}
              <section className="bg-surface rounded-2xl shadow-sm border border-border p-space-lg text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center mx-auto">
                  <Icon name="qr_code_2" className="text-[26px]" />
                </div>
                <h3 className="font-label-md text-label-md font-bold text-text-primary">
                  Order QR Code &amp; Reference
                </h3>
                <p className="text-caption text-text-secondary">
                  Customers present this reference code for verification at counter.
                </p>
                <div className="p-3 rounded-xl bg-surface-subtle font-mono font-bold text-primary text-[16px] tracking-wider border border-border">
                  {currentOrder.orderRef}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Method A Order Completion Modal */}
      {paymentModalOpen && (
        <OrderCompletionModal
          order={currentOrder}
          onClose={() => setPaymentModalOpen(false)}
          onCompleted={(updated) => {
            setPaymentModalOpen(false);
            showToast(`Order #${updated.orderRef} payment recorded & completed!`);
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {printReceiptOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white text-zinc-900 rounded-2xl shadow-2xl p-6 border border-zinc-200 font-mono text-[12px] space-y-3">
            <div className="text-center pb-2 border-b border-dashed border-zinc-300">
              <h2 className="font-bold text-[16px] tracking-tight">URBAN GRILL &amp; BISTRO</h2>
              <p className="text-[11px] text-zinc-600">{currentOrder.branchName}</p>
              <p className="mt-1 font-bold text-zinc-800 text-[13px]">ORDER #{currentOrder.orderRef}</p>
              <p className="text-[10px] text-zinc-500">{new Date().toLocaleString()}</p>
            </div>

            <div className="space-y-1.5 py-1 border-b border-dashed border-zinc-300">
              {currentOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2">{it.name}</span>
                  <span>×{it.qty}</span>
                  <span>₦{it.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 py-1 border-b border-dashed border-zinc-300 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>STATUS:</span>
                <span>{isPaid ? 'PAID' : 'AWAITING PAYMENT'}</span>
              </div>
              {currentOrder.payment.method && (
                <div className="flex justify-between text-zinc-700">
                  <span>METHOD:</span>
                  <span>{currentOrder.payment.method}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-zinc-500 space-y-1 pt-1">
              <p>Customer: {currentOrder.customerName} ({currentOrder.customerPhone})</p>
              <p>Origin: {currentOrder.origin}</p>
              <p className="font-bold pt-1">THANK YOU FOR YOUR PATRONAGE!</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-zinc-900 text-white rounded-lg font-sans font-semibold text-[13px] hover:bg-zinc-800"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => setPrintReceiptOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-lg font-sans text-zinc-700 text-[13px] hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable KOT Modal */}
      {printKOTOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white text-zinc-900 rounded-2xl shadow-2xl p-6 border border-zinc-200 font-mono text-[12px] space-y-3">
            <div className="text-center pb-2 border-b-2 border-zinc-900">
              <h2 className="font-bold text-[18px] tracking-wider uppercase">** KITCHEN TICKET **</h2>
              <p className="font-bold text-[15px]">TICKET #{currentOrder.orderRef}</p>
              <p className="text-[11px] text-zinc-600">Origin: {currentOrder.origin} {currentOrder.placementDetails ? `(${currentOrder.placementDetails})` : ''}</p>
              <p className="text-[10px] text-zinc-500">{new Date().toLocaleTimeString()}</p>
            </div>

            <div className="space-y-2 py-2 border-b-2 border-zinc-900">
              {currentOrder.items.map((it) => (
                <div key={it.id} className="text-[13px]">
                  <div className="flex justify-between font-bold">
                    <span>{it.name}</span>
                    <span className="text-[16px]">×{it.qty}</span>
                  </div>
                  {it.variant && <p className="text-[11px] text-zinc-600 pl-2">↳ {it.variant}</p>}
                  {it.options && it.options.length > 0 && (
                    <p className="text-[11px] text-zinc-600 pl-2">↳ {it.options.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>

            {currentOrder.customerNotes && (
              <div className="p-2 bg-zinc-100 border border-zinc-300 rounded font-bold text-[11px]">
                SPECIAL NOTE: {currentOrder.customerNotes}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-zinc-900 text-white rounded-lg font-sans font-semibold text-[13px]"
              >
                Print to KDS / Thermal
              </button>
              <button
                type="button"
                onClick={() => setPrintKOTOpen(false)}
                className="px-4 py-2 border border-zinc-300 rounded-lg font-sans text-zinc-700 text-[13px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span>{toast}</span>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
