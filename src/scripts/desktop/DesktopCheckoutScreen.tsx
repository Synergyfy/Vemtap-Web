import { useEffect, useRef, useState } from 'react';
import { NO_IMAGE } from '../../utils/homeOffer';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { useOrders, type SubmittedOrder } from '../../context/OrdersContext';
import { useProfile } from '../../context/ProfileContext';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type FulfillmentMode,
  type PaymentMethod,
} from '../orderData';

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

const PAYMENT_CHOICES: { method: PaymentMethod; blurb: string; icon: string }[] = [
  { method: 'pay-at-counter', blurb: 'Cash or POS when you collect', icon: 'point_of_sale' },
];

interface DesktopCheckoutScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onPlaced: (order: SubmittedOrder) => void;
}

export function DesktopCheckoutScreen({ onNav, onBack, onPlaced }: DesktopCheckoutScreenProps) {
  const cart = useCart();
  const orders = useOrders();
  const profile = useProfile();
  const [mode, setMode] = useState<FulfillmentMode>('pickup');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay-at-counter');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<SubmittedOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const placeTimer = useRef<number | null>(null);

  useEffect(() => {
    const timers = toastTimers.current;
    const place = placeTimer.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (place !== null) window.clearTimeout(place);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const subtotal = cart.total;
  // Prices come from the business; orders are collected and paid at the counter.
  const savings = 0;
  const deliveryFee = 0;
  const total = subtotal;
  const businesses = [...new Set(cart.lines.map((line) => line.merchantName).filter(Boolean))];
  const merchantLabel = businesses.length > 1 ? `${businesses.length} businesses` : businesses[0] ?? 'This business';
  const merchantLogo = cart.lines.find((line) => line.merchantLogo)?.merchantLogo ?? NO_IMAGE;

  const placeOrder = () => {
    if (placing || cart.lines.length === 0) return;
    setSubmitError(null);
    setPlacing(true);
    void orders
      .submit({
        merchantId: cart.lines[0]?.branchId ?? '',
        merchantName: merchantLabel,
        customerName: profile.fullName,
        customerPhone: profile.phone || undefined,
        lines: cart.lines.map((line) => ({
          id: line.id,
          productId: line.productId,
          name: line.name,
          price: line.price,
          qty: line.qty,
          image: line.image,
          options: line.options,
          instructions: line.instructions || note.trim() || undefined,
          branchId: line.branchId,
          merchantName: line.merchantName,
          merchantLogo: line.merchantLogo,
        })),
        subtotal,
        savings,
        deliveryFee,
        total,
        fulfillment: mode,
        note: note.trim() || undefined,
        paymentMethod,
        marketingConsent,
      })
      .then((result) => {
        setPlacing(false);
      if (!result.ok) {
        setSubmitError(result.error);
        showToast(result.error);
        return;
      }
      setPendingOrder(result.order);
        setDialogOpen(true);
      });
  };

  const confirmOrder = () => {
    if (pendingOrder) onPlaced(pendingOrder);
    setDialogOpen(false);
  };

  const setFulfillment = (next: FulfillmentMode) => setMode(next);

  const fulfilmentButtonClass = (active: boolean) =>
    `flex-1 py-3 px-space-sm rounded-lg transition-all duration-200 flex flex-col items-center text-center ${
      active ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="deals">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                  Home
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
                  Menu
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li aria-current="page" className="font-label-sm text-label-sm text-text-primary">
                Order Checkout
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                    3
                  </span>
                  <span className="font-label-md text-label-md text-text-secondary tracking-tight">
                    Step 3 of 3: Review &amp; Confirm
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
                  <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                </div>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Order Checkout
              </h1>
              <p className="font-body-md text-body-md text-text-secondary max-w-2xl">
                Review your ticket, confirm your pickup details and settle directly with {merchantLabel}. VEMTAP
                never collects your card funds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="flex flex-col gap-6 min-w-0">
              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-4 shadow-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-14 h-14 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" alt={merchantLabel} src={merchantLogo} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{merchantLabel}</h2>
                    </div>
                    <p className="font-caption text-caption text-text-secondary flex items-center gap-1 truncate">
                      <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                      {businesses.length > 1 ? 'One order per business' : 'Collect at the business'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-1.5 shadow-sm">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={fulfilmentButtonClass(mode === 'pickup')}
                  >
                    <span
                      className={`font-button-secondary text-button-secondary flex items-center gap-1.5 ${
                        mode === 'pickup' ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      <Icon name="restaurant" className="text-[18px]" />
                      Dine-in / Pickup
                    </span>
                    <span
                      className={`font-caption text-caption mt-0.5 ${
                        mode === 'pickup' ? 'text-text-secondary' : 'text-text-tertiary'
                      }`}
                    >
                      Pay at cashier
                    </span>
                  </button>
                                  </div>
              </section>

              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-space-sm bg-surface-tint-blue/60 p-space-sm rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Icon name="storefront" className="text-[20px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md text-label-md font-semibold text-text-primary">
                      Collect at the business
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      The business confirms when it’s ready
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-text-secondary flex items-center justify-between">
                    <span>Customer Contact Number</span>
                    <span className="text-primary font-medium flex items-center gap-0.5">
                      <Icon name="lock" className="text-[14px]" />
                      On your VEMTAP profile
                    </span>
                  </label>
                  <div className="flex items-center gap-space-xs bg-surface-subtle px-space-md py-3 rounded-lg">
                    <Icon name="call" className="text-text-tertiary text-[20px]" />
                    <input
                      className="bg-transparent font-body-md text-body-md text-text-primary focus:outline-none w-full"
                      readOnly
                      type="tel"
                      value={profile.phone || profile.maskedPhone}
                    />
                    <button
                      type="button"
                      onClick={() => showToast('Update your number in Account Settings')}
                      className="font-label-sm text-label-sm text-primary font-medium px-2 py-0.5 rounded hover:bg-surface-tint-blue transition-colors shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="order-notes">
                    Order Note
                  </label>
                  <div className="flex items-start gap-space-xs bg-surface-subtle px-space-md py-2.5 rounded-lg">
                    <Icon name="edit_note" className="text-text-tertiary text-[20px] mt-0.5" />
                    <textarea
                      className="bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none w-full resize-none"
                      id="order-notes"
                      placeholder="e.g. Table #12 if already seated, extra spicy sauce, no onions..."
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-6 shadow-sm">
                <div className="flex items-center justify-between mb-space-sm">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Ordered Items ({cart.count})</h3>
                  <span className="font-label-sm text-label-sm text-text-secondary">Live prices</span>
                </div>
                {cart.lines.length === 0 ? (
                  <div className="py-space-md text-center flex flex-col items-center gap-2">
                    <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <Icon name="shopping_bag" className="text-[24px] text-text-tertiary" />
                    </span>
                    <p className="font-body-md text-body-md text-text-secondary">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-space-md">
                    {cart.lines.map((line, index) => (
                      <div key={line.id}>
                        {index > 0 && <div className="h-px bg-surface-container-high mb-space-sm" />}
                        <article className="flex gap-space-sm pb-space-sm bg-surface-canvas">
                          <div className="w-20 h-20 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" alt={line.name} src={line.image} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-button-secondary text-button-secondary text-text-primary font-semibold truncate">
                                {line.name}
                              </h4>
                              <span className="font-button-secondary text-button-secondary font-bold text-text-primary shrink-0">
                                {naira(line.price * line.qty)}
                              </span>
                            </div>
                            <p className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                              {line.options ?? line.merchantName ?? ''}
                            </p>
                            {line.instructions && (
                              <p className="font-caption text-caption text-text-tertiary truncate">
                                Note: {line.instructions}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="font-label-sm text-label-sm text-text-tertiary">Qty: {line.qty}</span>
                              <div className="flex items-center gap-2 bg-surface-subtle rounded-lg px-1.5 py-1">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${line.name}`}
                                  onClick={() => cart.decrement(line.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-surface-canvas text-text-secondary hover:text-text-primary shadow-sm transition-colors"
                                >
                                  <Icon name="remove" className="text-[16px]" />
                                </button>
                                <span className="font-label-md text-label-md font-semibold text-text-primary min-w-[16px] text-center">
                                  {line.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${line.name}`}
                                  onClick={() => cart.increment(line.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-primary-container text-on-primary shadow-sm transition-colors hover:bg-primary"
                                >
                                  <Icon name="add" className="text-[16px]" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => cart.remove(line.id)}
                                className="ml-auto font-label-sm text-label-sm text-error hover:underline flex items-center gap-1"
                              >
                                <Icon name="delete" className="text-[15px]" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-space-sm">
                <h3 className="font-label-md text-label-md font-semibold text-text-primary">Payment Method</h3>
                <p className="font-caption text-caption text-text-secondary">
                  Choose how you&apos;ll settle {merchantLabel}. Your order is never marked paid until payment is
                  verified.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                  {PAYMENT_CHOICES.map((choice) => {
                    const active = paymentMethod === choice.method;
                    return (
                      <button
                        key={choice.method}
                        type="button"
                        onClick={() => setPaymentMethod(choice.method)}
                        className={`flex items-center gap-space-sm p-space-sm rounded-lg border text-left transition-colors ${
                          active
                            ? 'border-primary bg-surface-tint-blue'
                            : 'border-subtle bg-surface-canvas hover:border-outline-variant'
                        }`}
                      >
                        <Icon
                          name={choice.icon}
                          className={`text-[20px] shrink-0 ${active ? 'text-primary' : 'text-text-tertiary'}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-label-md text-label-md font-semibold text-text-primary">
                            {PAYMENT_METHOD_LABELS[choice.method]}
                          </span>
                          <span className="block font-caption text-caption text-text-secondary truncate">
                            {choice.blurb}
                          </span>
                        </span>
                        {active && <Icon name="check_circle" filled className="text-primary text-[20px] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {paymentMethod !== 'pay-at-counter' && (
                  <div className="flex items-start gap-space-xs bg-surface-tint-blue/60 p-space-sm rounded-lg">
                    <Icon name="shield_lock" className="text-primary text-[18px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary">
                      This order will be created as{' '}
                      <strong className="text-text-primary">Payment Pending</strong>. The merchant confirms the
                      payment before your order is prepared — VEMTAP never marks an order paid without that
                      verification.
                    </p>
                  </div>
                )}

                <div className="h-px bg-surface-container my-space-xs" />

                <label className="flex items-start gap-space-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    className="mt-0.5 accent-primary w-4 h-4 rounded"
                  />
                  <span className="font-caption text-caption text-text-secondary">
                    Also send me occasional offers from {merchantLabel} (optional). Your order works either way —
                    transactional messages about this order are always allowed.
                  </span>
                </label>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 flex flex-col gap-6 min-w-0">
              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-6 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Bill &amp; Settlement Breakdown</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption font-semibold shrink-0">
                    {cart.count} items
                  </span>
                </div>

                <div className="flex justify-between font-body-md text-body-md text-text-secondary">
                  <span>Items Subtotal ({cart.count} items)</span>
                  <span className="text-text-primary font-medium">{naira(subtotal)}</span>
                </div>
                <div className="h-px bg-surface-container-high my-space-xs" />
                <div className="flex justify-between items-baseline pt-1 gap-3">
                  <div className="min-w-0">
                    <p className="font-heading-sm text-heading-sm text-text-primary">Total Payable to Merchant</p>
                    <p className="font-caption text-caption text-text-secondary">
                      Pay at the cashier when you collect
                    </p>
                  </div>
                  <span className="font-heading-sm text-heading-sm text-primary font-bold tracking-tight shrink-0">
                    {naira(total)}
                  </span>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-xl border border-border-subtle p-6 shadow-md flex flex-col gap-4">
                {submitError && (
                  <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/40 flex items-start gap-2" role="alert">
                    <Icon name="error" className="text-error text-[18px] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-label-sm text-label-sm font-bold text-error">Could not place order</p>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">{submitError}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                      Total to Pay Business
                    </p>
                    <p className="font-heading-md text-heading-md font-bold text-text-primary">{naira(total)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-tint-blue px-2.5 py-1 rounded-full text-primary font-label-sm text-label-sm font-medium shrink-0">
                    <Icon name="local_offer" className="text-[16px]" />
                    Saved {naira(savings)}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={cart.lines.length === 0 || placing}
                  onClick={placeOrder}
                  className="w-full h-12 bg-primary-container hover:bg-primary transition-all rounded-xl text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {placing ? (
                    <>
                      <Icon name="autorenew" className="text-[20px] animate-spin" />
                      <span>Placing Order…</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <Icon name="arrow_forward" className="text-[20px]" />
                    </>
                  )}
                </button>
                <p className="font-caption text-caption text-center text-text-tertiary">
                  By placing order you confirm your reservation with the business.
                </p>
              </section>
            </aside>
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md">
            <div className="bg-surface-canvas w-full max-w-sm rounded-2xl p-space-lg shadow-2xl border border-border-subtle text-center space-y-space-sm">
              <div className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text mx-auto flex items-center justify-center">
                <Icon name="check_circle" filled className="text-[36px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Sent!</h3>
              <p className="font-body-md text-body-md text-text-secondary">
                {merchantLabel} has received your ticket. Present order reference{' '}
                <span className="font-mono font-semibold text-text-primary">#{pendingOrder?.ref ?? '—'}</span> to the
                cashier when you collect.
              </p>
              <div className="bg-surface-subtle p-space-sm rounded-lg text-left text-text-secondary font-caption text-caption space-y-1">
                <div className="flex justify-between">
                  <span>Order Ref:</span>
                  <span className="font-mono font-medium text-text-primary">#{pendingOrder?.ref ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-medium text-text-primary">
                    {pendingOrder ? PAYMENT_STATUS_LABELS[pendingOrder.paymentStatus] : '—'}
                  </span>
                </div>
                                <div className="flex justify-between">
                  <span>Settlement:</span>
                  <span className="font-medium text-primary">{naira(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmOrder}
                className="w-full h-11 bg-primary-container text-on-primary font-button-secondary text-button-secondary rounded-lg font-semibold hover:bg-primary transition-colors"
              >
                View Active Order Status
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 font-label-md text-label-md font-medium shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </DesktopPage>
  );
}
