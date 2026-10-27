import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { naira } from '../catalogueData';
import { publicCartCount, publicCartTotals, type PublicCartLine } from '../publicPosData';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { guestTotals, placeGuestOrder, useGuestMenu } from '../publicPosLive';

interface DesktopPublicPosCartScreenProps {
  cart: PublicCartLine[];
  onCartChange: React.Dispatch<React.SetStateAction<PublicCartLine[]>>;
  onBack: () => void;
  onAddMore: () => void;
  onTrack: () => void;
}

export function DesktopPublicPosCartScreen({
  cart,
  onCartChange,
  onBack,
  onAddMore,
  onTrack,
}: DesktopPublicPosCartScreenProps) {
  const live = hasApiConfig();
  const guest = useGuestMenu();
  const [name, setName] = useState(live ? '' : 'Samuel A.');
  const [phone, setPhone] = useState(live ? '' : '+234 802 345 6789');
  const [notes, setNotes] = useState(live ? '' : 'Extra serviettes and separate dipping bowl please.');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ ref: string; total: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const totals = live ? guestTotals(cart, guest.info?.pricing) : publicCartTotals(cart);
  const serviceCharge = live ? guestTotals(cart, guest.info?.pricing).service : 0;
  const tableLabel = live ? (guest.table ? `Table ${guest.table}` : 'Your table') : 'Table 04';
  const venue = live ? (guest.info?.businessName ?? guest.info?.branchName ?? 'Your table') : 'Urban Grill & Bistro';
  const pricing = guest.info?.pricing;
  const taxChip = live
    ? [pricing?.taxEnabled ? `${pricing.taxRate}%` : null, pricing?.serviceChargeEnabled ? `+${pricing.serviceChargeRate}% service` : null]
        .filter(Boolean)
        .join(' ') || '0%'
    : '7.5%';
  const count = publicCartCount(cart);
  const empty = cart.length === 0;

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

  /** Live: `POST /pos/orders` as a guest, then offer tracking. */
  const submit = () => {
    if (!live) {
      setConfirming(true);
      return;
    }
    if (submitting) return;
    if (!guest.branchId) {
      showToast('Scan the QR code on your table to order');
      return;
    }
    if (guest.info && !guest.info.acceptingOrders) {
      showToast('This venue is not taking table orders right now');
      return;
    }
    if (guest.info?.maxOrderValue && totals.total > guest.info.maxOrderValue) {
      showToast(`Table orders are capped at ${naira(guest.info.maxOrderValue)} — ask a server for help`);
      return;
    }
    const [firstName, ...rest] = name.trim().split(/\s+/);
    if (!firstName || !rest.length) {
      showToast('Add your first and last name so the server can find you');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      showToast('Add your phone number so the venue can reach you');
      return;
    }
    setSubmitting(true);
    placeGuestOrder({ lines: cart, firstName, lastName: rest.join(' '), phone: phone.trim(), notes: notes.trim() })
      .then((order) => {
        setPlaced({ ref: `#${order.id.slice(0, 8).toUpperCase()}`, total: totals.total });
        setConfirming(true);
      })
      .catch((error: unknown) => showToast(apiErrorMessage(error, 'Could not send your order.')))
      .finally(() => setSubmitting(false));
  };

  const adjustQty = (id: string, change: number) => {
    onCartChange(cart.map((line) => (line.id === id ? { ...line, qty: Math.max(1, line.qty + change) } : line)));
  };

  const removeItem = (id: string) => {
    const removed = cart.find((line) => line.id === id);
    onCartChange(cart.filter((line) => line.id !== id));
    if (removed) showToast(`${removed.name} removed from your tray`);
  };

  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-body-md text-text-primary antialiased">
      {/* Slim branded sticky header */}
      <header className="sticky top-0 z-40 bg-surface-canvas/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-7xl mx-auto h-16 px-6 lg:px-12 flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-text-primary hover:bg-surface-tint-blue active:scale-95 transition-transform shrink-0"
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <span className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
              <Icon name="storefront" className="text-[21px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight truncate">
                {venue}
              </h1>
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-text-secondary">{tableLabel} • Dine-in</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="hidden sm:inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
              <Icon name="table_restaurant" className="text-[16px]" />
              <span>{tableLabel}</span>
            </span>
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm font-semibold">
              <Icon name="shopping_bag" className="text-[16px]" />
              <span>
                {count} item{count === 1 ? '' : 's'}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-md pb-16 flex flex-col gap-space-md">
        {/* Page title */}
        <div className="min-w-0">
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Cart Review</h2>
          <p className="font-caption text-caption text-text-tertiary mt-0.5">
            {venue} • {tableLabel} • Dine-in
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-space-md items-start">
          {/* Left column: tray + guest details */}
          <div className="flex flex-col gap-space-md min-w-0">
            {/* Table & dine-in banner */}
            <div className="bg-surface-container-high rounded-xl p-space-sm flex items-center justify-between gap-space-xs shadow-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shrink-0">
                  <Icon name="table_restaurant" filled className="text-[21px]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading-sm text-heading-sm text-text-primary">{tableLabel}</span>
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text inline-block" />
                  </div>
                  <p className="font-caption text-caption text-text-secondary truncate">Dine-In • Scanned via QR</p>
                </div>
              </div>
              <span className="bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <Icon name="verified" className="text-[13px]" />
                <span>Verified Table</span>
              </span>
            </div>

            {/* Cart items */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-space-xs">
                <h3 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider">
                  Your Dishes ({cart.length})
                </h3>
                <button
                  type="button"
                  onClick={onAddMore}
                  className="font-label-sm text-label-sm text-primary flex items-center gap-1 hover:underline shrink-0"
                >
                  <Icon name="add_circle" className="text-[15px]" />
                  <span>Add more food</span>
                </button>
              </div>

              <div className="flex flex-col gap-space-sm">
                {cart.map((line) => (
                  <article
                    key={line.id}
                    className="bg-surface-subtle rounded-xl p-space-sm flex flex-col md:flex-row md:items-center gap-space-sm"
                  >
                    <div className="flex items-start gap-space-sm flex-1 min-w-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
                        <img src={line.image} alt={line.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-space-xs">
                          <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">{line.name}</h4>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => removeItem(line.id)}
                            className="text-text-tertiary hover:text-error active:scale-95 transition-transform p-1 -mr-1 shrink-0"
                          >
                            <Icon name="delete" className="text-[19px]" />
                          </button>
                        </div>
                        <p className="font-label-md text-label-md text-primary font-semibold mt-0.5">
                          {naira(line.price)}
                        </p>
                        {line.note && (
                          <div className="mt-1.5 bg-surface-container-low rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-text-secondary">
                            <Icon name="description" className="text-[15px] text-text-tertiary shrink-0" />
                            <p className="font-caption text-caption truncate">{line.note}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-space-sm shrink-0">
                      <span className="font-label-sm text-label-sm text-text-secondary">Portion</span>
                      <div className="flex items-center gap-3 bg-surface-container-high px-2 py-1 rounded-full">
                        <button
                          type="button"
                          aria-label="Decrease portion"
                          onClick={() => adjustQty(line.id, -1)}
                          className="w-7 h-7 rounded-full bg-surface-canvas text-text-primary flex items-center justify-center active:scale-90 shadow-sm transition-transform"
                        >
                          <Icon name="remove" className="text-[15px]" />
                        </button>
                        <span className="font-label-md text-label-md text-text-primary min-w-[14px] text-center">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase portion"
                          onClick={() => adjustQty(line.id, 1)}
                          className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center active:scale-90 shadow-sm transition-transform"
                        >
                          <Icon name="add" className="text-[15px]" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {empty && (
                  <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
                    <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <Icon name="shopping_basket" className="text-text-secondary text-[21px]" />
                    </span>
                    <span className="font-label-md text-label-md text-text-primary">Your tray is empty</span>
                    <button
                      type="button"
                      onClick={onAddMore}
                      className="font-label-sm text-label-sm text-primary hover:underline"
                    >
                      Browse the menu to add dishes
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Table & guest details */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-xs">
                <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5 min-w-0">
                  <Icon name="person_pin_circle" className="text-primary text-[19px] shrink-0" />
                  <span className="truncate">Table &amp; Guest Details</span>
                </h3>
                <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full font-medium shrink-0">
                  {tableLabel} {live && !guest.table ? '' : 'Verified'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-text-primary flex items-center gap-1" htmlFor="guest-name">
                    Your Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="guest-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name (e.g. Samuel A.)"
                      className="w-full h-11 rounded-lg bg-surface-container-low px-3.5 pr-10 text-text-primary font-body-md text-body-md focus:bg-surface-tint-blue focus:outline-none transition-colors"
                    />
                    {name.trim() && (
                      <Icon
                        name="check_circle"
                        className="absolute right-3 top-3 text-badge-discount-text text-[19px] pointer-events-none"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-space-xs">
                    <label className="font-label-sm text-label-sm text-text-primary" htmlFor="guest-phone">
                      Phone Number
                    </label>
                    <span className="font-caption text-caption text-text-tertiary shrink-0">
                      Optional • SMS / WhatsApp updates
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="guest-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234..."
                      className="w-full h-11 rounded-lg bg-surface-container-low px-3.5 pr-10 text-text-primary font-body-md text-body-md focus:bg-surface-tint-blue focus:outline-none transition-colors"
                    />
                    <Icon
                      name="notifications_active"
                      className="absolute right-3 top-3 text-text-tertiary text-[19px] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-tint-blue rounded-lg p-3 flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="qr_code_2" className="text-primary text-[19px] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm text-text-primary">Seat Location</p>
                    <p className="font-caption text-caption text-text-secondary truncate">
                      Locked to {tableLabel} via digital dine-in session
                    </p>
                  </div>
                </div>
                <Icon name="lock" className="text-text-secondary text-[17px] shrink-0" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-text-primary flex items-center gap-1" htmlFor="kitchen-notes">
                  <Icon name="soup_kitchen" className="text-primary text-[17px]" />
                  <span>Kitchen Instructions</span>
                </label>
                <textarea
                  id="kitchen-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any allergies, special prep notes, or cutlery requests..."
                  className="w-full rounded-lg bg-surface-container-low p-3 text-text-primary font-body-md text-body-md focus:bg-surface-tint-blue focus:outline-none transition-colors resize-none"
                />
              </div>
            </section>
          </div>

          {/* Right column: sticky totals & action panel */}
          <aside className="lg:sticky lg:top-24 flex flex-col gap-space-md">
            {/* Bill breakdown */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1.5">
                <Icon name="receipt_long" className="text-primary text-[19px]" />
                <span>Bill Breakdown</span>
              </h3>
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
                <span className="font-body-md text-body-md text-text-primary font-medium">{naira(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-space-xs">
                <span className="flex items-center gap-1 min-w-0">
                  <span className="font-body-md text-body-md text-text-secondary">Table Service &amp; VAT</span>
                  <span className="font-caption text-caption bg-surface-container-high px-1.5 py-0.5 rounded text-text-secondary">
                    {taxChip}
                  </span>
                </span>
                <span className="font-body-md text-body-md text-text-primary font-medium">{naira(totals.vat + serviceCharge)}</span>
              </div>
              <div className="h-px bg-surface-container-high my-1" />
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-heading-sm text-heading-sm text-text-primary">Total Due</span>
                <span className="font-heading-md text-heading-md text-primary font-bold">{naira(totals.total)}</span>
              </div>
              <div className="bg-surface-subtle rounded-lg p-3 flex items-start gap-2.5 mt-1">
                <Icon name="point_of_sale" className="text-primary text-[19px] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-label-sm text-label-sm text-text-primary font-semibold">
                    Pay Directly at Counter or Table
                  </p>
                  <p className="font-caption text-caption text-text-secondary">
                    Accepted: Cash, POS Card Swipe, or Instant Bank Transfer. Zero customer convenience fees.
                  </p>
                </div>
              </div>
            </section>

            {/* Submit */}
            <section className="bg-surface-canvas rounded-xl border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={submit}
                disabled={empty || submitting}
                className={`w-full h-12 rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  empty
                    ? 'bg-surface-container-high text-text-tertiary shadow-none cursor-not-allowed'
                    : 'bg-primary-container text-on-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:bg-primary'
                }`}
              >
                <Icon name="restaurant" className="text-[19px]" />
                <span>
                  {empty ? 'Your Cart is Empty' : submitting ? 'Sending to the kitchen…' : `Submit Order to Kitchen (${naira(totals.total)})`}
                </span>
              </button>
              <p className="font-caption text-caption text-text-tertiary flex items-center gap-1 text-center justify-center pt-1">
                <Icon name="print" className="text-[14px]" />
                <span>Sends ticket immediately to till &amp; kitchen display</span>
              </p>
            </section>

            <div className="px-space-xs flex items-center justify-center gap-space-2xs text-center">
              <Icon name="verified_user" className="text-badge-discount-text text-[15px] shrink-0" />
              <p className="font-caption text-caption text-text-secondary leading-tight">
                Zero advance payment required online. Pay directly at table/counter upon service.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Order submitted modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-margin">
          <div className="w-full max-w-md bg-surface-canvas rounded-2xl p-space-lg flex flex-col items-center text-center shadow-2xl border border-border-subtle">
            <span className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center mb-3">
              <Icon name="soup_kitchen" filled className="text-[33px]" />
            </span>
            <h3 className="font-heading-md text-heading-md text-text-primary">Order Fired to Kitchen!</h3>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Ticket {live ? (placed?.ref ?? '—') : '#TK-0482'} dispatched to {live ? 'the kitchen' : 'Head Chef'}. Your food is now
              preparing for <strong className="text-text-primary">{tableLabel}</strong>.
            </p>
            <div className="bg-surface-subtle w-full rounded-xl p-3 my-4 flex items-center justify-between text-left gap-space-xs">
              <div>
                <p className="font-caption text-caption text-text-tertiary">Estimated Prep Time</p>
                <p className="font-label-md text-label-md text-text-primary font-semibold">{live ? `About ${guest.info?.prepMinutes ?? 15} Mins` : '18 - 24 Mins'}</p>
              </div>
              <div className="text-right">
                <p className="font-caption text-caption text-text-tertiary">Amount to Settle</p>
                <p className="font-label-md text-label-md text-primary font-bold">{naira(placed?.total ?? totals.total)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                if (live) onCartChange([]);
                onTrack();
              }}
              className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary hover:bg-primary transition-colors"
            >
              Track Live Prep Status
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
