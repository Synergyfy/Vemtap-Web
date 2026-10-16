import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { cartCount, cartTotals, type PosCartLine } from './posCartData';

interface BusinessPosCartScreenProps {
  cart: PosCartLine[];
  onCartChange: Dispatch<SetStateAction<PosCartLine[]>>;
  customer: string | null;
  onBack: () => void;
  onCharge: () => void;
  onOpenCustomer: () => void;
}

const QUICK_ACTIONS = [
  { key: 'note', icon: 'sticky_note_2', label: 'Add Note' },
  { key: 'discount', icon: 'percent', label: 'Discount' },
  { key: 'promo', icon: 'local_offer', label: 'Apply Promo' },
  { key: 'course', icon: 'restaurant_menu', label: 'Course' },
];

export function BusinessPosCartScreen({
  cart,
  onCartChange,
  customer,
  onBack,
  onCharge,
  onOpenCustomer,
}: BusinessPosCartScreenProps) {
  const attached = customer !== null;
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

  const count = cartCount(cart);
  const { subtotal, discount, vat, total } = cartTotals(cart);

  const changeQty = (id: string, delta: number) => {
    onCartChange((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0),
    );
  };

  const removeLine = (id: string) => {
    const line = cart.find((item) => item.id === id);
    onCartChange((prev) => prev.filter((item) => item.id !== id));
    showToast(`${line?.name ?? 'Item'} removed from ticket`);
  };

  const holdTicket = () => {
    showToast('Ticket parked safely to Tab 04');
    window.setTimeout(onBack, 700);
  };

  const actionToast: Record<string, string> = {
    note: 'Kitchen note added to ticket',
    discount: '10% staff discount applied',
    promo: 'No active promos on this ticket',
    course: 'Course timing set to “Serve after mains”',
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
              Current Sale
            </span>
            <span className="font-caption text-caption text-text-secondary leading-none">Item customizer</span>
          </div>
          <button
            type="button"
            aria-label="More ticket options"
            onClick={() => showToast('Ticket options opened')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="more_vert" className="text-on-surface-variant text-[17px]" />
          </button>
        </div>

        {/* Ticket status strip */}
        <div className="px-margin pb-space-xs flex items-center gap-space-2xs overflow-x-auto no-scrollbar">
          <span className="h-6 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
            <Icon name="receipt_long" className="text-[13px]" />
            <span>Ticket #POS-1049</span>
          </span>
          <span className="h-6 px-space-xs rounded-full bg-surface-container text-text-secondary font-caption text-caption flex items-center shrink-0">
            Walk-in · Dine-in
          </span>
          <span className="h-6 px-space-xs rounded-full bg-surface-container text-text-secondary font-caption text-caption flex items-center shrink-0">
            Till 01 · Emeka O.
          </span>
          <span className="h-6 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center shrink-0">
            Open 06:12
          </span>
        </div>
      </header>

      <div className="flex flex-col pb-36">
        {/* Loyalty banner */}
        <div className="px-margin py-space-2xs">
          <button
            type="button"
            onClick={onOpenCustomer}
            className={`w-full rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-xs text-left active:scale-[0.99] transition-transform ${
              attached ? 'bg-badge-discount-bg' : 'bg-surface-container-high'
            }`}
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  attached ? 'bg-badge-discount-text/15' : 'bg-primary-fixed'
                }`}
              >
                <Icon
                  name={attached ? 'verified' : 'person_add'}
                  filled={attached}
                  className={`text-[18px] ${attached ? 'text-badge-discount-text' : 'text-on-primary-fixed'}`}
                />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">
                  {attached ? `${customer} · Gold Member` : 'No customer attached'}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {attached ? '2,450 points · 5% member pricing active' : 'Tap to attach a customer & unlock member pricing'}
                </span>
              </div>
            </div>
            <span
              className={`font-caption text-caption font-semibold shrink-0 ${
                attached ? 'text-badge-discount-text' : 'text-primary'
              }`}
            >
              {attached ? 'Attached' : 'Change'}
            </span>
          </button>
        </div>

        {/* Cart lines */}
        <div className="px-margin flex flex-col gap-space-xs py-space-2xs">
          {cart.map((line) => (
            <div key={line.id} className="bg-surface-canvas rounded-xl p-space-xs shadow-sm flex gap-space-xs">
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface truncate">{line.name}</span>
                {line.note && (
                  <span className="font-caption text-caption text-text-secondary truncate">{line.note}</span>
                )}
                <span className="font-caption text-caption text-text-secondary mt-0.5">
                  {naira(line.unit)} each
                  {line.member < line.unit && (
                    <span className="text-badge-discount-text font-semibold"> · member {naira(line.member)}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="self-start mt-1 font-caption text-caption text-error flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Icon name="delete_outline" className="text-[14px]" />
                  <span>Remove</span>
                </button>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    {naira(line.member * line.qty)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => removeLine(line.id)}
                    className="w-7 h-7 rounded-lg text-error hover:bg-error-container/30 flex items-center justify-center active:scale-90 transition-colors"
                    title="Remove item"
                  >
                    <Icon name="delete_outline" className="text-[17px]" />
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-surface-container rounded-full p-0.5">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => changeQty(line.id, -1)}
                    className="w-7 h-7 rounded-full bg-surface-canvas flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                  >
                    <Icon name="remove" className="text-[15px]" />
                  </button>
                  <span className="w-5 text-center font-label-sm text-label-sm font-bold text-on-surface">{line.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name}`}
                    onClick={() => changeQty(line.id, 1)}
                    className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                  >
                    <Icon name="add" className="text-[15px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-space-lg flex flex-col items-center text-center gap-space-xs">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="shopping_cart" className="text-text-secondary text-[22px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">Ticket is empty</span>
              <span className="font-caption text-caption text-text-secondary max-w-[240px]">
                Head back to the register to ring up items for this sale.
              </span>
              <button
                type="button"
                onClick={onBack}
                className="h-9 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold active:scale-95 transition-transform"
              >
                Back to Register
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {cart.length > 0 && (
          <>
            <div className="px-margin pt-space-xs pb-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                Quick Actions
              </span>
            </div>
            <div className="px-margin grid grid-cols-4 gap-space-2xs pb-space-xs">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => showToast(actionToast[action.key])}
                  className="h-16 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
                >
                  <Icon name={action.icon} className="text-primary text-[18px]" />
                  <span className="font-caption text-caption text-on-surface text-center leading-none">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div className="px-margin pt-space-xs">
            <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-space-2xs">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-text-secondary">Subtotal ({count} items)</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{naira(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-badge-discount-text">Member savings</span>
                  <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                    -{naira(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-text-secondary">VAT (7.5%)</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{naira(vat)}</span>
              </div>
              <div className="h-px bg-surface-container-high w-full my-0.5" />
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Total due
                  </span>
                  <span className="font-caption text-caption text-primary font-medium">Receipt via VEMTAP</span>
                </div>
                <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">
                  {naira(total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pinned action deck */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface/95 backdrop-blur-xl border-t border-border-subtle px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)] flex flex-col gap-space-2xs shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={onCharge}
          disabled={cart.length === 0}
          className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          <span>Charge {naira(total)}</span>
          <Icon name="arrow_forward" className="text-[17px]" />
        </button>
        <div className="flex gap-space-xs">
          <button
            type="button"
            onClick={holdTicket}
            disabled={cart.length === 0}
            className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs disabled:opacity-40"
          >
            <Icon name="pause_circle" className="text-text-secondary text-[16px]" />
            <span>Hold Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Split bill opened for this ticket')}
            disabled={cart.length === 0}
            className="flex-1 h-10 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs disabled:opacity-40"
          >
            <Icon name="call_split" className="text-text-secondary text-[16px]" />
            <span>Split Bill</span>
          </button>
        </div>
        <div className="flex items-center justify-center gap-space-2xs text-text-tertiary pt-0.5">
          <Icon name="verified_user" className="text-primary text-[13px]" />
          <span className="font-caption text-caption">Card terminal 01 connected · End-to-end encrypted</span>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
