import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useCart } from '../context/CartContext';
import { naira } from './catalogueData';
import {
  DELIVERY_FEE,
  MERCHANT_IMAGE,
  MERCHANT_NAME,
  MERCHANT_PHONE_DISPLAY,
  VOUCHER_CODE,
  VOUCHER_RATE,
  estimateReadyBy,
  newOrderRef,
  type FulfillmentMode,
  type OrderSummary,
} from './orderData';

interface CheckoutScreenProps {
  onBack: () => void;
  onPlaced: (order: OrderSummary) => void;
}

export function CheckoutScreen({ onBack, onPlaced }: CheckoutScreenProps) {
  const cart = useCart();
  const [mode, setMode] = useState<FulfillmentMode>('pickup');
  const [note, setNote] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRef, setPendingRef] = useState('UG-00000');
  const [pendingOrder, setPendingOrder] = useState<OrderSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const subtotal = cart.total;
  const savings = Math.round(subtotal * VOUCHER_RATE);
  const deliveryFee = mode === 'delivery' ? DELIVERY_FEE : 0;
  const total = Math.max(0, subtotal - savings) + deliveryFee;
  const readyBy = estimateReadyBy();

  const placeOrder = () => {
    const ref = newOrderRef();
    const order: OrderSummary = {
      ref,
      lines: cart.lines.map((line) => ({
        id: line.id,
        productId: line.productId,
        name: line.name,
        price: line.price,
        qty: line.qty,
        image: line.image,
        options: line.options,
        instructions: line.instructions || note.trim() || undefined,
      })),
      subtotal,
      savings,
      deliveryFee,
      total,
      fulfillment: mode,
    };
    setPendingRef(ref);
    setDialogOpen(true);
    setPendingOrder(order);
  };

  const confirmOrder = () => {
    if (pendingOrder) onPlaced(pendingOrder);
    setDialogOpen(false);
  };

  const setFulfillment = (next: FulfillmentMode) => setMode(next);

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Navigate back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-1 flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[200px]">
              Order Checkout
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface">
        <div className="flex flex-col w-full pb-32">
          <section className="px-margin pt-space-xs pb-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  3
                </span>
                <span className="font-label-md text-label-md text-text-secondary tracking-tight">
                  Step 3 of 3: Review &amp; Confirm
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                <span className="w-6 h-1.5 rounded-full bg-primary-container" />
              </div>
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover" alt={MERCHANT_NAME} src={MERCHANT_IMAGE} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{MERCHANT_NAME}</h2>
                    <Icon name="verified" filled className="text-primary text-[18px]" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary flex items-center gap-1 truncate">
                    <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                    Apo Boulevard, Abuja • 0.6 km away
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFulfillment('pickup')}
                className={`flex-1 py-2.5 px-space-xs rounded-lg transition-all duration-200 flex flex-col items-center text-center ${
                  mode === 'pickup'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span
                  className={`font-button-secondary text-button-secondary flex items-center gap-1 ${
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
              <button
                type="button"
                onClick={() => setFulfillment('delivery')}
                className={`flex-1 py-2.5 px-space-xs rounded-lg transition-all duration-200 flex flex-col items-center text-center ${
                  mode === 'delivery'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span
                  className={`font-button-secondary text-button-secondary flex items-center gap-1 ${
                    mode === 'delivery' ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  <Icon name="moped" className="text-[18px]" />
                  Business Delivery
                </span>
                <span
                  className={`font-caption text-caption mt-0.5 ${
                    mode === 'delivery' ? 'text-text-secondary' : 'text-text-tertiary'
                  }`}
                >
                  Pay to dispatch
                </span>
              </button>
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
              <div className="flex items-start gap-space-sm bg-surface-tint-blue/60 p-space-sm rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <Icon name={mode === 'pickup' ? 'storefront' : 'two_wheeler'} className="text-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-label-md font-semibold text-text-primary">
                    {mode === 'pickup' ? `Ready in ~25 mins (Est. ${readyBy})` : 'Direct Dispatch by Urban Grill Staff'}
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    {mode === 'pickup'
                      ? 'Plot 104 Apo Boulevard, Ground Floor Food Court'
                      : 'Delivering to Apo District (within 45 mins)'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-text-secondary flex items-center justify-between">
                  <span>Customer Contact Number</span>
                  <span className="text-primary font-medium flex items-center gap-0.5">
                    <Icon name="lock" className="text-[14px]" />
                    Verified
                  </span>
                </label>
                <div className="flex items-center gap-space-xs bg-surface-subtle px-space-md py-3 rounded-lg">
                  <Icon name="call" className="text-text-tertiary text-[20px]" />
                  <input
                    className="bg-transparent font-body-md text-body-md text-text-primary focus:outline-none w-full"
                    readOnly
                    type="tel"
                    value={MERCHANT_PHONE_DISPLAY}
                  />
                  <button
                    type="button"
                    onClick={() => showToast('Verified contact numbers are managed in your account')}
                    className="font-label-sm text-label-sm text-primary font-medium px-2 py-0.5 rounded hover:bg-primary-fixed/30 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-text-secondary" htmlFor="order-notes">
                  Kitchen &amp; Seating Note
                </label>
                <div className="flex items-start gap-space-xs bg-surface-subtle px-space-md py-2.5 rounded-lg">
                  <Icon name="edit_note" className="text-text-tertiary text-[20px] mt-0.5" />
                  <textarea
                    className="bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none w-full resize-none"
                    id="order-notes"
                    placeholder="e.g. Table #12 if already seated, extra spicy sauce, no onions..."
                    rows={2}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Ordered Items ({cart.count})
                </h3>
                <span className="font-label-sm text-label-sm text-text-secondary">Direct from Menu</span>
              </div>
              {cart.lines.length === 0 ? (
                <div className="py-space-md text-center flex flex-col items-center gap-2">
                  <Icon name="shopping_bag" className="text-[32px] text-surface-variant" />
                  <p className="font-body-md text-body-md text-text-secondary">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-space-md">
                  {cart.lines.map((line, index) => (
                    <div key={line.id}>
                      {index > 0 && <div className="h-px bg-surface-container mb-space-sm" />}
                      <article className="flex gap-space-sm pb-space-sm bg-surface-container-lowest">
                        <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden shrink-0">
                          <img className="w-full h-full object-cover" alt={line.name} src={line.image} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-button-secondary text-button-secondary text-text-primary font-semibold truncate">
                              {line.name}
                            </h4>
                            <span className="font-button-secondary text-button-secondary font-semibold text-text-primary shrink-0">
                              {naira(line.price * line.qty)}
                            </span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                            {line.options ?? 'Standard preparation'}
                          </p>
                          {line.instructions && (
                            <p className="font-caption text-caption text-text-tertiary truncate">
                              Note: {line.instructions}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="font-label-sm text-label-sm text-text-tertiary">Qty: {line.qty}</span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant" />
                            <span className="font-caption text-caption text-badge-discount-text font-medium">
                              Eligible for 20% Voucher
                            </span>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-badge-discount-bg rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-7 h-7 rounded-full bg-badge-discount-text/10 flex items-center justify-center text-badge-discount-text">
                    <Icon name="confirmation_number" className="text-[18px]" />
                  </span>
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-badge-discount-text tracking-tight">
                      20% OFF Deal Voucher APPLIED
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      Code: <span className="font-mono font-semibold text-text-primary">{VOUCHER_CODE}</span> • Lifetime
                      VEMTAP Tap
                    </p>
                  </div>
                </div>
                <span className="bg-surface-canvas text-badge-discount-text font-label-sm text-label-sm font-semibold px-2 py-1 rounded-full shadow-sm">
                  -{naira(savings)}
                </span>
              </div>
            </div>
          </section>

          <section className="px-margin mb-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
              <h3 className="font-label-md text-label-md font-semibold text-text-primary mb-space-xs">
                Bill &amp; Settlement Breakdown
              </h3>
              <div className="flex justify-between font-body-md text-body-md text-text-secondary">
                <span>Items Subtotal ({cart.count} items)</span>
                <span className="text-text-primary font-medium">{naira(subtotal)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md text-badge-discount-text font-medium">
                <span className="flex items-center gap-1">
                  <span>VEMTAP Deal Savings (20%)</span>
                  <Icon name="check_circle" className="text-[16px]" />
                </span>
                <span>-{naira(savings)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md text-text-secondary">
                <span className="flex items-center gap-1" title="Zero platform markups on VEMTAP">
                  Restaurant Service Fee
                  <Icon name="info" className="text-text-tertiary text-[15px]" />
                </span>
                <span className="text-badge-discount-text font-medium">₦0 (No Markup)</span>
              </div>
              {mode === 'delivery' && (
                <div className="flex justify-between font-body-md text-body-md text-text-secondary">
                  <span>Direct Dispatch Logistics</span>
                  <span className="text-text-primary font-medium">{naira(deliveryFee)}</span>
                </div>
              )}
              <div className="h-px bg-surface-container my-space-xs" />
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <p className="font-heading-sm text-heading-sm text-text-primary">Total Payable to Merchant</p>
                  <p className="font-caption text-caption text-text-secondary">
                    Direct settlement at cashier / upon drop-off
                  </p>
                </div>
                <span className="font-heading-sm text-heading-sm text-primary font-bold tracking-tight">
                  {naira(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="px-margin mb-space-xl">
            <div className="bg-surface-container-high rounded-xl p-space-md shadow-sm">
              <div className="flex items-start gap-space-sm">
                <Icon name="account_balance_wallet" className="text-primary text-[24px] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">
                    Pay Directly to Urban Grill
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    VEMTAP guarantees your deal discount and reserves your food, but never collects customer card funds.
                    You will pay <strong className="text-on-surface font-semibold">{naira(total)}</strong> directly via{' '}
                    <span className="font-semibold text-on-surface">POS Card Swipe, Cash, or Direct Bank Transfer</span>.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest text-text-secondary font-caption text-caption">
                      <Icon name="point_of_sale" className="text-[14px]" />
                      POS Terminal Ready
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest text-text-secondary font-caption text-caption">
                      <Icon name="payments" className="text-[14px]" />
                      Cash Accepted
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest text-text-secondary font-caption text-caption">
                      <Icon name="account_balance" className="text-[14px]" />
                      Bank App Transfer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-margin py-space-sm shadow-[0_-8px_24px_-4px_rgba(17,24,39,0.08)] pb-safe">
          <div className="max-w-[430px] mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Total to Pay Business
                </p>
                <p className="font-heading-md text-heading-md font-bold text-text-primary">{naira(total)}</p>
              </div>
              <div className="flex items-center gap-1 bg-surface-tint-blue px-2.5 py-1 rounded-full text-primary font-label-sm text-label-sm font-medium">
                <Icon name="local_offer" className="text-[16px]" />
                Saved {naira(savings)}
              </div>
            </div>
            <button
              type="button"
              disabled={cart.lines.length === 0}
              onClick={placeOrder}
              className="w-full h-11 bg-primary-container hover:bg-primary active:scale-[0.99] transition-all rounded-xl text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Place Order with Urban Grill</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <p className="font-caption text-caption text-center text-text-tertiary mt-2">
              By placing order you confirm your reservation with the business.
            </p>
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md">
            <div className="bg-surface-container-lowest w-full max-w-sm rounded-xl p-space-lg shadow-xl text-center space-y-space-sm">
              <div className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text mx-auto flex items-center justify-center">
                <Icon name="check_circle" filled className="text-[36px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Transmitted to Kitchen!</h3>
              <p className="font-body-md text-body-md text-text-secondary">
                {MERCHANT_NAME} has acknowledged your ticket. Please present your VEMTAP voucher reference{' '}
                <span className="font-mono font-semibold text-text-primary">{VOUCHER_CODE}</span> upon payment.
              </p>
              <div className="bg-surface-subtle p-space-sm rounded-lg text-left text-text-secondary font-caption text-caption space-y-1">
                <div className="flex justify-between">
                  <span>Ticket Ref:</span>
                  <span className="font-mono font-medium text-text-primary">#{pendingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected by:</span>
                  <span className="font-medium text-text-primary">{readyBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Settlement:</span>
                  <span className="font-medium text-primary">{naira(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmOrder}
                className="w-full h-11 bg-primary text-on-primary font-button-secondary text-button-secondary rounded-lg font-semibold hover:bg-primary-container transition-colors"
              >
                View Active Order Status
              </button>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
