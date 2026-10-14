import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useCart } from '../../context/CartContext';
import { naira } from '../catalogueData';
import { DELIVERY_FEE, VOUCHER_RATE, type FulfillmentMode } from '../orderData';

interface DesktopCartScreenProps {
  onNav: (key: DesktopNavKey) => void;
  /** Review is complete — move to checkout / submit. */
  onCheckout: () => void;
}

const FULFILLMENT_LABELS: Record<FulfillmentMode, string> = {
  pickup: 'Pickup',
  delivery: 'Delivery',
};

export function DesktopCartScreen({ onNav, onCheckout }: DesktopCartScreenProps) {
  const cart = useCart();
  const [mode, setMode] = useState<FulfillmentMode>('pickup');

  const subtotal = cart.total;
  const savings = Math.round(subtotal * VOUCHER_RATE);
  const deliveryFee = mode === 'delivery' ? DELIVERY_FEE : 0;
  const total = Math.max(0, subtotal - savings) + deliveryFee;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="cart" withCustomerRail>
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-caption font-caption text-text-tertiary mb-6"
          >
            <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={() => onNav('dashboard')} type="button">
              Customer Dashboard
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-medium">Shopping Cart</span>
          </nav>
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold">Your Order</h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Review items and quantities, then submit to receive your collection code. No online payment is taken —
                settle directly with the cashier.
              </p>
            </div>
            {cart.count > 0 && (
              <button
                type="button"
                onClick={cart.clear}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-text-tertiary hover:text-error hover:bg-surface-subtle font-label-sm text-label-sm transition-colors self-start md:self-auto"
              >
                <Icon name="delete_sweep" className="text-[17px]" />
                <span>Clear cart</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 flex flex-col gap-4 min-w-0">
{cart.lines.length === 0 ? (
                <div className="bg-surface-canvas rounded-2xl p-12 shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                    <Icon name="shopping_cart_outlined" className="text-[32px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Your cart is empty</h2>
                  <p className="font-body-md text-body-md text-text-secondary max-w-sm">
                    Add items from a business storefront, the product catalogue, or scan an in-store product QR code to
                    build your order.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onNav('storefront')}
                      className="h-11 px-5 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold hover:bg-primary-container transition-colors"
                    >
                      Browse Storefront
                    </button>
                    <button
                      type="button"
                      onClick={() => onNav('dashboard')}
                      className="h-11 px-5 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-canvas rounded-2xl shadow-sm p-6 flex flex-col gap-3">
                  {cart.lines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center gap-4 py-3 border-b border-surface-subtle last:border-0"
                    >
{line.image ? (
                        <img
                          src={line.image}
                          alt={line.name}
                          className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-surface-container text-text-tertiary flex items-center justify-center shrink-0">
                          <Icon name="fastfood" className="text-[26px]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                          {line.name}
                        </p>
                        <p className="font-caption text-caption text-text-secondary">{naira(line.price)} each</p>
                        {line.options && (
                          <p className="font-caption text-caption text-text-tertiary truncate mt-0.5">{line.options}</p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            aria-label={`Remove one ${line.name}`}
                            type="button"
                            onClick={() => cart.decrement(line.id)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-primary active:scale-95 transition-all"
                          >
                            <Icon name="remove" className="text-[16px]" />
                          </button>
                          <span className="font-label-md text-label-md font-bold text-text-primary min-w-[20px] text-center">
                            {line.qty}
                          </span>
                          <button
                            aria-label={`Add one ${line.name}`}
                            type="button"
                            onClick={() => cart.increment(line.id)}
                            className="w-7 h-7 rounded-lg bg-surface-subtle hover:bg-surface-container flex items-center justify-center text-text-primary active:scale-95 transition-all"
                          >
                            <Icon name="add" className="text-[16px]" />
                          </button>
                          <button
                            aria-label={`Remove ${line.name} from cart`}
                            type="button"
                            onClick={() => cart.remove(line.id)}
                            className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error-container/40 transition-colors"
                          >
                            <Icon name="close" className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-text-primary shrink-0">
                        {naira(line.price * line.qty)}
                      </span>
</div>
                  ))}
                </div>
              )}
            </section>

            <aside className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="bg-surface-canvas rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Summary</h3>

                <div className="flex flex-col gap-1.5">
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                    Fulfilment
                  </span>
                  <div className="flex items-center gap-2 p-1 bg-surface-subtle rounded-xl">
                    {(Object.keys(FULFILLMENT_LABELS) as FulfillmentMode[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMode(key)}
                        className={`flex-1 py-2 rounded-lg font-label-md text-label-md transition-all ${
                          mode === key
                            ? 'bg-surface-canvas text-primary font-semibold shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {FULFILLMENT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-body-md font-body-md">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'})</span>
                    <span className="text-text-primary font-medium">{naira(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-badge-discount-text">
                      <span>Loyalty Voucher Discount</span>
                      <span>-{naira(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>Delivery Fee{deliveryFee === 0 ? ' (Pickup)' : ''}</span>
                    <span className="text-text-primary font-medium">
                      {deliveryFee === 0 ? 'Free' : naira(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-label-md text-label-md text-text-primary font-bold pt-2 border-t border-surface-subtle">
                    <span>Total Payable to Cashier</span>
                    <span className="text-primary">{naira(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={cart.lines.length === 0}
                  onClick={onCheckout}
                  className="h-12 w-full rounded-xl bg-primary text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <Icon name="arrow_forward" className="text-[19px]" />
                  <span>Proceed to Checkout</span>
                </button>
                <p className="font-caption text-caption text-center text-text-tertiary">
                  No payment is taken now. Pay by cash / POS when you collect.
                </p>
              </div>

              <div className="bg-badge-discount-bg/60 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                  <Icon name="verified_user" className="text-[20px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-badge-discount-text">
                    100% Price Match Guarantee
                  </span>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    No surge fees, no inflated in-app prices. Prices on VEMTAP are identical to in-store counter menus in
                    Abuja.
                  </p>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 font-label-md text-label-md text-text-primary font-semibold">
                  <Icon name="help_outline" className="text-primary text-[20px]" />
                  <span>Need quick assistance?</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Our Abuja Local Concierge is active daily 8:00 AM – 10:00 PM for tray adjustments or location guidance.
                </p>
                <button
                  onClick={() => onNav('messages')}
                  className="font-label-sm text-label-sm text-primary font-medium hover:underline inline-flex items-center gap-1 pt-1 self-start"
                  type="button"
                >
                  <span>Chat with Apo Desk</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}