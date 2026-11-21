import { useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { DealPriceChoice } from './dealStudioShared';

interface DealPriceChoiceModalProps {
  open: boolean;
  itemName?: string;
  priceLabel?: string;
  onClose: () => void;
  onChoose: (choice: DealPriceChoice) => void;
}

/**
 * One shared price-choice dialog for every "Make as a Deal" entry point.
 * Mobile shows a bottom sheet; desktop centres the same panel.
 */
export function DealPriceChoiceModal({
  open,
  itemName = 'this item',
  priceLabel,
  onClose,
  onChoose,
}: DealPriceChoiceModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-on-surface/50 p-0 backdrop-blur-sm sm:items-center sm:p-space-md"
      role="dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-t-[28px] bg-surface-container-lowest p-margin pb-safe shadow-2xl sm:rounded-3xl sm:pb-margin">
        <div className="mx-auto mb-space-sm h-1.5 w-12 rounded-full bg-outline-variant sm:hidden" />
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex min-w-0 flex-col">
            <span className="font-caption text-caption font-bold uppercase tracking-wider text-primary">
              Deal pricing
            </span>
            <h2 className="font-heading-md text-heading-md text-on-surface">Set your deal price</h2>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Choose how <span className="font-semibold text-text-primary">{itemName}</span> should be offered.
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-text-secondary transition-colors hover:bg-surface-container-high"
            type="button"
            onClick={onClose}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="mt-space-md flex flex-col gap-space-sm">
          <button
            className="group w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-space-md text-left transition-all hover:border-primary hover:bg-surface-tint-blue focus:outline-none focus:ring-2 focus:ring-primary"
            type="button"
            onClick={() => onChoose('current')}
          >
            <div className="flex items-start gap-space-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tint-blue text-primary">
                <Icon name="payments" className="text-[20px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-on-surface">Use current price</span>
                  <span className="rounded-full bg-badge-discount-bg px-2 py-0.5 font-caption text-caption font-semibold text-badge-discount-text">
                    No discount
                  </span>
                </span>
                <span className="font-body-md text-body-md text-text-secondary mt-1">
                  Customers pay the listed price. Fastest setup — no discount strategy needed, and you keep the full
                  sale price.
                </span>
                {priceLabel && (
                  <span className="font-label-sm text-label-sm font-semibold text-primary mt-space-xs">
                    Deal price: ₦{priceLabel}
                  </span>
                )}
              </span>
              <Icon name="arrow_forward" className="mt-2 text-[18px] text-text-tertiary group-hover:text-primary" />
            </div>
          </button>

          <button
            className="group w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-space-md text-left transition-all hover:border-primary hover:bg-surface-tint-blue focus:outline-none focus:ring-2 focus:ring-primary"
            type="button"
            onClick={() => onChoose('changed')}
          >
            <div className="flex items-start gap-space-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed">
                <Icon name="local_offer" className="text-[20px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-on-surface">Change deal price</span>
                  <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 font-caption text-caption font-semibold text-on-tertiary-fixed">
                    More buyers
                  </span>
                </span>
                <span className="font-body-md text-body-md text-text-secondary mt-1">
                  Set a special promotional price. You’ll choose a discount strategy next — percentage, amount off,
                  combo, or happy hour.
                </span>
              </span>
              <Icon name="arrow_forward" className="mt-2 text-[18px] text-text-tertiary group-hover:text-primary" />
            </div>
          </button>
        </div>

        <p className="font-caption text-caption text-text-tertiary text-center mt-space-md">
          You can change this later from the deal’s Edit Offer action.
        </p>
      </div>
    </div>
  );
}
