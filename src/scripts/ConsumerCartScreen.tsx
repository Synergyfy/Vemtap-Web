import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useCart } from '../context/CartContext';

interface ConsumerCartScreenProps {
  onBack: () => void;
  onCheckout: () => void;
  onBrowseDeals: () => void;
  onOpenStorefront: () => void;
}

const VAT_RATE = 0.075;

const fmt = (value: number) => '₦' + Math.round(value).toLocaleString('en-US');

export function ConsumerCartScreen({ onBack, onCheckout, onBrowseDeals, onOpenStorefront }: ConsumerCartScreenProps) {
  const cart = useCart();
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(timer);
  };

  const subtotal = cart.total;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  return (
    <AppScreen surface="bg-surface">
      <header className="sticky top-0 z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Go back"
              className="w-11 h-11 -ml-space-xs flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-heading-sm font-heading-sm text-text-primary tracking-tight truncate">Your Cart</h1>
              <span className="text-caption font-caption text-text-secondary truncate">
                {cart.count === 0
                  ? 'No items yet'
                  : cart.count + ' item' + (cart.count === 1 ? '' : 's') + ' \u00b7 Urban Grill & Bistro'}
              </span>
            </div>
          </div>
          {cart.count > 0 && (
            <button
              className="h-9 px-space-sm flex items-center gap-1 rounded-full text-label-sm font-label-sm text-error font-medium hover:bg-error-container/40 transition-colors shrink-0"
              type="button"
              onClick={() => {
                cart.clear();
                setNote('');
                showToast('Cart cleared');
              }}
            >
              <Icon name="delete_outline" className="text-[18px]" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </header>

      {cart.count === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-space-sm px-margin py-16 flex-1">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-tertiary mb-space-xs">
            <Icon name="shopping_cart" className="text-[32px]" />
          </div>
          <h2 className="text-heading-sm font-heading-sm text-text-primary">Your cart is empty</h2>
          <p className="text-body-md font-body-md text-text-secondary max-w-[280px]">
            Browse deals and add items from your favorite spots to get started.
          </p>
          <button
            className="mt-space-sm h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-xs active:scale-[0.98] transition-transform shadow-[0_6px_18px_-4px_rgba(6,108,244,0.3)]"
            type="button"
            onClick={onBrowseDeals}
          >
            <Icon name="local_offer" className="text-[18px]" />
            <span>Browse Deals</span>
          </button>
          <button
            className="h-11 px-space-md flex items-center gap-space-2xs text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-colors"
            type="button"
            onClick={onOpenStorefront}
          >
            <Icon name="storefront" className="text-[18px]" />
            <span>View Urban Grill Menu</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full pb-32">
          <div className="px-margin pt-space-sm pb-space-xs flex flex-col gap-space-sm">
            {cart.lines.map((line) => (
              <div
                className="rounded-xl bg-surface-canvas p-space-sm shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex gap-space-sm"
                key={line.id}
              >
                <img
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  src={line.image}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="min-w-0">
                      <h3 className="text-label-md font-label-md text-text-primary font-semibold truncate">{line.name}</h3>
                      {line.options && (
                        <span className="text-caption font-caption text-text-secondary block truncate">{line.options}</span>
                      )}
                      {line.instructions && (
                        <span className="text-caption font-caption text-text-tertiary block truncate">
                          Note: {line.instructions}
                        </span>
                      )}
                    </div>
                    <button
                      aria-label={'Remove ' + line.name}
                      className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error-container/30 transition-colors shrink-0"
                      type="button"
                      onClick={() => {
                        cart.remove(line.id);
                        showToast(line.name + ' removed');
                      }}
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-space-xs">
                    <span className="text-label-md font-label-md text-text-primary font-bold">{fmt(line.price * line.qty)}</span>
                    <div className="flex items-center gap-space-xs bg-surface-subtle rounded-full p-0.5">
                      <button
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-text-primary shadow-sm active:scale-95 transition-transform"
                        type="button"
                        onClick={() => cart.decrement(line.id)}
                      >
                        <Icon name="remove" className="text-[18px]" />
                      </button>
                      <span className="w-6 text-center text-label-md font-label-md font-bold text-text-primary">{line.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        className="w-8 h-8 rounded-full bg-surface-canvas flex items-center justify-center text-text-primary shadow-sm active:scale-95 transition-transform"
                        type="button"
                        onClick={() => cart.increment(line.id)}
                      >
                        <Icon name="add" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              className="h-11 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary font-medium flex items-center justify-center gap-space-xs active:scale-[0.98] transition-transform"
              type="button"
              onClick={onOpenStorefront}
            >
              <Icon name="add" className="text-[18px]" />
              <span>Add more items</span>
            </button>
          </div>

          <div className="px-margin mb-space-md">
            <div className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-sm">
              <span className="text-label-md font-label-md font-semibold text-text-primary">Order note</span>
              <textarea
                className="w-full p-space-sm bg-surface-subtle text-text-primary font-body-md text-body-md rounded-lg outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] transition-all resize-none"
                placeholder="Any allergies or special requests?"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>

          <div className="px-margin mb-space-md">
            <div className="rounded-xl bg-surface-canvas p-space-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] flex flex-col gap-space-xs">
              <div className="flex items-center justify-between text-body-md font-body-md">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-body-md font-body-md">
                <span className="text-text-secondary">VAT (7.5%)</span>
                <span className="text-text-primary font-medium">{fmt(vat)}</span>
              </div>
              <div className="h-px bg-surface-container my-space-2xs" />
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md font-semibold text-text-primary">Total</span>
                <span className="text-heading-sm font-heading-sm font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div className="px-margin">
            <div className="rounded-xl bg-surface-tint-blue p-space-sm flex items-start gap-space-xs">
              <Icon name="verified_user" className="text-[18px] text-primary shrink-0 mt-0.5" />
              <span className="text-caption font-caption text-text-secondary leading-snug">
                Secure checkout via VEMTAP Pay. Your card details are encrypted and never stored on merchant devices.
              </span>
            </div>
          </div>
        </div>
      )}

      {cart.count > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-surface-canvas/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-margin py-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+12px)] z-40">
          <button
            className="w-full h-11 bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-all"
            type="button"
            onClick={onCheckout}
          >
            <span>Checkout ({fmt(total)})</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
