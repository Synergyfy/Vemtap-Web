import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import { computeTotals, formatNaira, type PosTerminalLine } from './posTerminalData';
import { usePosSettings } from '../../context/PosSettingsContext';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { useHeldTicket, useLivePos, usePosCartMirror } from '../posLive';

interface DesktopPosCartScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  onCartChange: React.Dispatch<React.SetStateAction<PosTerminalLine[]>>;
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

const ACTION_TOASTS: Record<string, string> = {
  note: 'Kitchen note added to ticket',
  discount: '10% staff discount applied',
  promo: 'No active promos on this ticket',
  course: 'Course timing set to “Serve after mains”',
};

// The tax percentage comes from POS Settings (usePosSettings → taxRate).

export function DesktopPosCartScreen({
  onNav,
  cart,
  onCartChange,
  customer,
  onBack,
  onCharge,
  onOpenCustomer,
}: DesktopPosCartScreenProps) {
  const attached = customer !== null;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const holdTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const { taxMode, taxRate, taxLabel } = usePosSettings();
  const totals = useMemo(() => computeTotals(cart, taxMode, taxRate / 100), [cart, taxMode, taxRate]);
  const count = totals.itemCount;
  const empty = cart.length === 0;

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

  const live = hasApiConfig();
  const pos = useLivePos();
  const heldTicket = useHeldTicket();
  usePosCartMirror(cart, customer);

  const holdTicket = () => {
    if (live) {
      if (!cart.length) {
        showToast('Add an item before holding the ticket');
        return;
      }
      heldTicket
        .hold(cart)
        .then(() => {
          onCartChange([]);
          showToast('Ticket held — resume it with Hold on the register');
          if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
          holdTimer.current = window.setTimeout(onBack, 700);
        })
        .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not hold the ticket.')));
      return;
    }
    showToast('Ticket parked safely to Tab 04');
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(onBack, 700);
  };

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Operational ticket strip */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-2.5 flex flex-wrap items-center gap-space-xs">
          <span className="h-6 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
            <Icon name="receipt_long" className="text-[13px]" />
            <span>{live ? 'New ticket' : 'Ticket #POS-1049'}</span>
          </span>
          <span className="h-6 px-space-xs rounded-full bg-surface-container-high text-text-secondary font-caption text-caption flex items-center shrink-0">
            Walk-in · Dine-in
          </span>
          <span className="h-6 px-space-xs rounded-full bg-surface-container-high text-text-secondary font-caption text-caption flex items-center shrink-0">
            {live ? `${pos.isOpen ? pos.tillName : 'No till open'} · ${pos.cashierName}` : 'Till 01 · Emeka O.'}
          </span>
          <span className="h-6 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center shrink-0">
            Open 06:12
          </span>
        </div>
      </section>

      <div className="py-space-lg flex flex-col gap-space-xl">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-space-xs self-start font-button-secondary text-button-secondary text-text-secondary hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>Back to Register</span>
        </button>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs text-text-tertiary font-caption text-caption uppercase tracking-wider mb-space-2xs">
              <span>Current Sale</span>
              <span>•</span>
              <span>Item Customizer</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-badge-discount-text font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span>Open 06:12</span>
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Current Sale</h1>
            <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
              {live
                ? 'Review every line on the current ticket, apply quick actions and charge it when the order is right.'
                : 'Item customizer for ticket #POS-1049 — review every line, apply quick actions and charge the walk-in dine-in ticket when the order rings true.'}
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              type="button"
              aria-label="More ticket options"
              onClick={() => showToast(live ? 'Ticket options are coming soon.' : 'Ticket options opened')}
              className="w-11 h-11 rounded-xl bg-surface-canvas border border-border-subtle flex items-center justify-center text-on-surface-variant hover:bg-surface-tint-blue hover:text-primary transition-colors shadow-sm"
            >
              <Icon name="more_vert" className="text-[20px]" />
            </button>
            <button
              type="button"
              onClick={onCharge}
              disabled={empty}
              className="inline-flex items-center gap-space-xs px-space-lg h-11 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            >
              <span>Charge {formatNaira(totals.total)}</span>
              <Icon name="arrow_forward" className="text-[19px]" />
            </button>
          </div>
        </div>

        {/* Empty ticket state, or the totals bento row once items are on the ticket */}
        {empty ? (
          <div className="p-space-xl rounded-xl bg-surface-canvas border border-border-subtle shadow-sm flex flex-col items-center text-center gap-space-xs">
            <span className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
              <Icon name="shopping_cart" className="text-text-secondary text-[26px]" />
            </span>
            <span className="font-heading-sm text-heading-sm text-on-surface">Ticket is empty</span>
            <span className="font-body-md text-body-md text-text-secondary max-w-[340px]">
              Head back to the register to ring up items for this sale.
            </span>
            <button
              type="button"
              onClick={onBack}
              className="mt-space-2xs h-10 px-space-md rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-all active:scale-95"
            >
              Back to Register
            </button>
          </div>
        ) : (
          /* Ticket totals bento row */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Metric 1: Subtotal */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                    Ticket Subtotal
                  </span>
                  <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                  <Icon name="shopping_bag" className="text-[20px]" />
                </div>
              </div>
              <span className="mt-space-md font-display-hero text-display-hero text-on-surface leading-none">
                {formatNaira(totals.gross)}
              </span>
            </div>

            {/* Metric 2: Member savings */}
            {totals.discount > 0 && (
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                      Member savings
                    </span>
                    <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">
                      5% member pricing
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-badge-discount-bg flex items-center justify-center text-badge-discount-text">
                    <Icon name="stars" className="text-[20px]" />
                  </div>
                </div>
                <span className="mt-space-md font-display-hero text-display-hero text-badge-discount-text leading-none">
                  -{formatNaira(totals.discount)}
                </span>
              </div>
            )}

            {/* Metric 3: Tax */}
            {taxMode !== 'none' && (
              <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                      {taxLabel} ({taxRate}%)
                      {taxMode === 'inclusive' ? ' · included' : ''}
                    </span>
                    <span className="font-heading-sm text-heading-sm text-on-surface mt-space-2xs">
                      {taxMode === 'inclusive' ? 'Included in prices' : 'Applied at checkout'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                    <Icon name="receipt_long" className="text-[20px]" />
                  </div>
                </div>
                <span className="mt-space-md font-display-hero text-display-hero text-on-surface leading-none">
                  {formatNaira(totals.vat)}
                </span>
              </div>
            )}

            {/* Metric 4: Total due */}
            <div className="p-space-lg rounded-xl bg-surface-tint-blue shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary">
                    Total due
                  </span>
                  <span className="font-heading-sm text-heading-sm text-primary mt-space-2xs font-semibold">
                    Receipt via VEMTAP
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-canvas flex items-center justify-center text-primary">
                  <Icon name="payments" className="text-[20px]" />
                </div>
              </div>
              <span className="mt-space-md font-display-hero text-display-hero text-primary leading-none">
                {formatNaira(totals.total)}
              </span>
            </div>
          </div>
        )}

        {/* Dual-pane body: lines + sale deck */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-xl items-start">
          {/* LEFT: customer banner, lines, quick actions */}
          <div className="flex flex-col gap-space-lg">
            {/* Loyalty banner */}
            <button
              type="button"
              onClick={onOpenCustomer}
              className={`w-full rounded-xl p-space-sm shadow-sm flex items-center justify-between gap-space-md text-left hover:opacity-95 transition-all ${
                attached ? 'bg-badge-discount-bg' : 'bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-space-xs min-w-0">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    attached ? 'bg-surface-canvas' : 'bg-surface-tint-blue'
                  }`}
                >
                  <Icon
                    name={attached ? 'verified' : 'person_add'}
                    filled={attached}
                    className={`text-[19px] ${attached ? 'text-badge-discount-text' : 'text-primary'}`}
                  />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                    {attached ? `${customer} · Gold Member` : 'No customer attached'}
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {attached
                      ? '2,450 points · 5% member pricing active'
                      : 'Tap to attach a customer & unlock member pricing'}
                  </span>
                </div>
              </div>
              <span
                className={`font-label-sm text-label-sm font-semibold shrink-0 ${
                  attached ? 'text-badge-discount-text' : 'text-primary'
                }`}
              >
                {attached ? 'Attached' : 'Change'}
              </span>
            </button>

            {/* Cart lines */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Ticket Lines
                </span>
                <span className="font-caption text-caption px-space-xs py-1 rounded-full bg-surface-container-high text-text-secondary">
                  {count} {count === 1 ? 'item' : 'items'} on ticket
                </span>
              </div>

              {cart.map((line) => {
                const lineTotal = (line.unit - (line.promo ?? 0)) * line.qty;
                return (
                  <div
                    key={line.id}
                    className="bg-surface-canvas rounded-xl p-space-md shadow-sm border border-border-subtle flex items-start justify-between gap-space-md"
                  >
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {line.name}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">{line.mods}</span>
                      <span className="font-caption text-caption text-text-secondary mt-0.5">
                        {formatNaira(line.unit)} each
                        {line.promo ? (
                          <span className="text-badge-discount-text font-semibold">
                            {' '}
                            · member {formatNaira(line.unit - line.promo)}
                          </span>
                        ) : null}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="self-start mt-space-2xs font-caption text-caption text-error flex items-center gap-1 hover:underline transition-colors"
                      >
                        <Icon name="delete_outline" className="text-[14px]" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-space-xs shrink-0">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {formatNaira(lineTotal)}
                      </span>
                      <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-0.5">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name}`}
                          onClick={() => changeQty(line.id, -1)}
                          className="w-7 h-7 rounded-full bg-surface-canvas flex items-center justify-center hover:bg-surface-subtle transition-colors shadow-sm"
                        >
                          <Icon name="remove" className="text-[15px]" />
                        </button>
                        <span className="w-5 text-center font-label-sm text-label-sm font-bold text-on-surface">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name}`}
                          onClick={() => changeQty(line.id, 1)}
                          className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors shadow-sm"
                        >
                          <Icon name="add" className="text-[15px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            {!empty && (
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Quick Actions
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => showToast(live ? `${action.label} is coming soon.` : ACTION_TOASTS[action.key])}
                      className="h-16 rounded-xl bg-surface-canvas border border-border-subtle shadow-sm flex flex-col items-center justify-center gap-0.5 hover:bg-surface-tint-blue hover:text-primary transition-colors"
                    >
                      <Icon name={action.icon} className="text-primary text-[18px]" />
                      <span className="font-caption text-caption text-on-surface text-center leading-none">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: pinned action deck */}
          <aside className="flex flex-col gap-space-md sticky top-20">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
                  Checkout Deck
                </span>
                <span className="font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-semibold">
                  Card Terminal 01
                </span>
              </div>

              <div className="flex flex-col gap-space-xs">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Total due
                </span>
                <span className="font-heading-md text-heading-md text-primary font-bold tracking-tight">
                  {formatNaira(totals.total)}
                </span>
                <span className="font-caption text-caption text-primary font-medium">Receipt via VEMTAP</span>
              </div>

              <button
                type="button"
                onClick={onCharge}
                disabled={empty}
                className="mt-space-xs w-full h-14 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary font-bold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:opacity-40 disabled:active:scale-100"
              >
                <span>Charge {formatNaira(totals.total)}</span>
                <Icon name="arrow_forward" className="text-[19px]" />
              </button>

              <div className="grid grid-cols-2 gap-space-xs">
                <button
                  type="button"
                  onClick={holdTicket}
                  disabled={empty}
                  className="h-11 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-container-high transition-colors disabled:opacity-40"
                >
                  <Icon name="pause_circle" className="text-text-secondary text-[16px]" />
                  <span>Hold Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(live ? 'Split bill is coming soon — use Split on the payment screen.' : 'Split bill opened for this ticket')}
                  disabled={empty}
                  className="h-11 rounded-xl bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs hover:bg-surface-container-high transition-colors disabled:opacity-40"
                >
                  <Icon name="call_split" className="text-text-secondary text-[16px]" />
                  <span>Split Bill</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-space-2xs text-text-tertiary pt-space-2xs">
                <Icon name="verified_user" className="text-primary text-[13px]" />
                <span className="font-caption text-caption">
                  Card terminal 01 connected · End-to-end encrypted
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
