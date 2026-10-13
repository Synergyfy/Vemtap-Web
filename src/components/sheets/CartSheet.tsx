import { useCart } from '../../context/CartContext';
import { naira } from '../../scripts/catalogueData';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  title?: string;
}

export function CartSheet({ open, onClose, onCheckout, title = 'Your Order' }: CartSheetProps) {
  const { lines, count, total, increment, decrement, remove, clear } = useCart();

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-margin pt-space-md pb-space-sm border-b border-border-subtle">
          <div className="flex flex-col">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">{title}</h2>
            <span className="font-caption text-caption text-text-secondary">
              {count} {count === 1 ? 'item' : 'items'} • {naira(total)}
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            {lines.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="font-label-sm text-label-sm text-error hover:opacity-80 transition-opacity"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              aria-label="Close cart"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="px-margin py-space-xl flex flex-col items-center justify-center text-center gap-space-2xs">
            <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
              <Icon name="shopping_cart" className="text-[24px]" />
            </div>
            <p className="font-label-md text-label-md text-text-secondary font-semibold">Your cart is empty</p>
            <p className="font-caption text-caption text-text-tertiary">Add products to start your order</p>
          </div>
        ) : (
          <div className="flex flex-col gap-space-sm px-margin py-space-sm overflow-y-auto">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-space-sm bg-surface-subtle rounded-xl p-space-xs"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-text-primary font-semibold truncate">{line.name}</p>
                  <p className="font-caption text-caption text-text-secondary">
                    {line.options ?? `${naira(line.price)} each`}
                  </p>
                  {line.instructions && (
                    <p className="font-caption text-caption text-text-tertiary truncate">Note: {line.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name} quantity`}
                    onClick={() => decrement(line.id)}
                    className="w-7 h-7 rounded-full bg-surface-canvas border border-border-subtle flex items-center justify-center text-text-primary hover:bg-surface-container transition-colors"
                  >
                    <Icon name="remove" className="text-[16px]" />
                  </button>
                  <span className="font-label-md text-label-md text-text-primary font-semibold min-w-[16px] text-center">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name} quantity`}
                    onClick={() => increment(line.id)}
                    className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors"
                  >
                    <Icon name="add" className="text-[16px]" />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 pl-space-2xs">
                  <span className="font-label-md text-label-md text-text-primary font-bold">
                    {naira(line.price * line.qty)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.id)}
                    className="text-text-tertiary hover:text-error transition-colors"
                  >
                    <Icon name="delete_outline" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-margin py-space-sm border-t border-border-subtle flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Subtotal</span>
            <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{naira(total)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => {
              if (lines.length === 0) return;
              onCheckout?.();
            }}
            className="h-12 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
          >
            <span>{lines.length === 0 ? 'Checkout' : `Checkout • ${naira(total)}`}</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
    </SheetShell>
  );
}
