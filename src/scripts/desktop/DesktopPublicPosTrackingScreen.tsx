import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { naira } from '../catalogueData';
import { publicCartTotals, type PublicCartLine } from '../publicPosData';
import { apiErrorMessage } from '../../services/errorMessages';
import { GUEST_NO_IMAGE, trackingSteps, useGuestTracking } from '../publicPosLive';

interface DesktopPublicPosTrackingScreenProps {
  cart: PublicCartLine[];
  onBack: () => void;
  onReopenMenu: () => void;
}

interface PrepStep {
  title: string;
  meta: string;
  time?: string;
  state: 'done' | 'active' | 'upcoming';
  icon: string;
}

const STEPS: PrepStep[] = [
  { title: 'Order Received', meta: 'Ticket sent to POS & Kitchen Stream', time: '14:32', state: 'done', icon: 'check' },
  { title: 'Accepted & In Queue', meta: 'Confirmed by Cashier Emeka O.', time: '14:33', state: 'active', icon: 'soup_kitchen' },
  { title: 'Preparing in Kitchen', meta: 'Line chef is grilling and plating', state: 'upcoming', icon: 'local_dining' },
  { title: 'Ready & Served', meta: 'Food being brought to Table 04', state: 'upcoming', icon: 'room_service' },
];

export function DesktopPublicPosTrackingScreen({ cart, onBack, onReopenMenu }: DesktopPublicPosTrackingScreenProps) {
  const [calling, setCalling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const callTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const tracking = useGuestTracking();
  const live = tracking.live;
  const order = tracking.order;
  const totals = publicCartTotals(cart);
  const steps = live && order ? trackingSteps(order, STEPS) : STEPS;
  const tableLabel = live ? (order?.tableNumber ?? 'your table') : 'Table 04';
  const venue = live ? (order?.venue.businessName ?? order?.venue.branchName ?? 'The venue') : 'Urban Grill & Bistro';
  const orderRef = live ? (order?.reference ?? '—') : '#UG-1085';
  const lines = live
    ? (order?.lines ?? []).map((line, index) => ({
        id: `${line.name}-${index}`,
        name: line.name,
        qty: line.quantity,
        price: line.unitPrice,
        image: GUEST_NO_IMAGE,
        note: undefined as string | undefined,
      }))
    : cart;
  const totalPayable = live ? (order?.totalAmount ?? 0) : totals.total;

  useEffect(() => {
    if (!live) return;
    const message = !tracking.trackingToken
      ? 'Place an order from your table to track it here'
      : tracking.error
        ? apiErrorMessage(tracking.error, 'Could not load your order.')
        : order?.cancelled
          ? 'This order was cancelled — please ask a server'
          : null;
    if (!message) return;
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, [live, tracking.trackingToken, tracking.error, order?.cancelled]);

  useEffect(
    () => () => {
      if (callTimer.current !== null) window.clearTimeout(callTimer.current);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const callWaiter = () => {
    if (calling) return;
    setCalling(true);
    setToast(live ? 'Calling a server is coming soon — please wave to the team' : 'Attendant alerted for Table 04!');
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    callTimer.current = window.setTimeout(() => setCalling(false), 3200);
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
                <span className="font-caption text-caption text-text-secondary">{live ? `${tableLabel} • Dine-in` : 'Table 04 • Dine-in'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="hidden sm:inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
              <Icon name="table_restaurant" className="text-[16px]" />
              <span>{live ? tableLabel : 'Table 04'}</span>
            </span>
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span>Kitchen Live</span>
            </span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-md pb-16 flex flex-col gap-space-md">
        {/* Page title */}
        <div className="min-w-0">
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Public POS Order Tracking
          </h2>
          <p className="font-caption text-caption text-text-tertiary mt-0.5">
            {live
              ? `Order ${orderRef} • ${tableLabel}${order?.server ? ` • Server: ${order.server.firstName}` : ''}`
              : 'Order #UG-1085 • Table 04 • Server: Emeka O.'}
          </p>
        </div>

        {/* Status hero */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <span className="absolute -top-12 -right-12 w-36 h-36 bg-surface-tint-blue rounded-full blur-2xl pointer-events-none" />
          <span className="absolute -bottom-10 -left-10 w-32 h-32 bg-badge-discount-bg rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-start gap-space-sm min-w-0">
            <span className="relative flex items-center justify-center shrink-0">
              <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-badge-discount-text/20 opacity-75" />
              <span className="relative w-14 h-14 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-md">
                <Icon name="restaurant" filled className="text-badge-discount-text text-[27px]" />
              </span>
            </span>
            <div className="min-w-0">
              <h3 className="font-heading-md text-heading-md text-text-primary">
                {live && order?.status === 'ready' ? 'Your Order is Ready!' : live && order?.status === 'completed' ? 'Enjoy Your Meal!' : 'Order Sent to Kitchen!'}
              </h3>
              <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                {venue} has received your ticket for{' '}
                <span className="font-label-md text-label-md text-text-primary">{tableLabel}</span>.
              </p>
            </div>
          </div>

          <span className="relative inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-full bg-surface-canvas shadow-sm self-start md:self-auto shrink-0">
            <Icon name="timer" className="text-primary text-[17px]" />
            <span className="font-caption text-caption text-text-secondary">Estimated Prep Time:</span>
            <span className="font-label-md text-label-md text-primary font-bold">{live ? `${order?.prepMinutes ?? 15} mins` : '15 - 20 mins'}</span>
          </span>
        </section>

        {/* Live preparation — horizontal stage rail */}
        <section className="rounded-xl bg-surface-canvas border border-border-subtle p-space-md shadow-sm">
          <div className="flex items-center justify-between mb-space-md gap-space-xs">
            <span className="flex items-center gap-space-2xs min-w-0">
              <Icon name="sync" className="text-primary text-[19px] shrink-0" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">Live Preparation</h3>
            </span>
            <span className="font-caption text-caption px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-medium shrink-0">
              Real-time sync
            </span>
          </div>

          <ol className="flex flex-col gap-space-md lg:flex-row lg:gap-0 lg:items-start">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <li key={step.title} className="flex-1 flex flex-col items-center gap-space-2xs text-center relative px-space-xs">
                  {!isLast && (
                    <span
                      className={`hidden lg:block absolute top-[21px] left-1/2 w-full h-0.5 z-0 ${
                        step.state === 'done' ? 'bg-badge-discount-text/30' : 'bg-surface-container-highest'
                      }`}
                    />
                  )}

                  <div className="relative z-10">
                    {step.state === 'active' ? (
                      <span className="relative flex items-center justify-center z-10">
                        <span className="absolute inline-flex h-11 w-11 animate-ping rounded-full bg-primary-container/30" />
                        <span className="relative w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                          <Icon name={step.icon} className="text-[19px]" />
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`w-11 h-11 rounded-full flex items-center justify-center z-10 ${
                          step.state === 'done'
                            ? 'bg-badge-discount-bg text-badge-discount-text shadow-sm'
                            : 'bg-surface-container-high text-text-tertiary'
                        }`}
                      >
                        <Icon
                          name={step.icon}
                          className={step.state === 'done' ? 'text-[19px]' : 'text-[17px]'}
                          filled={step.state === 'done'}
                        />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-space-2xs w-full">
                    <div className="flex items-center justify-center flex-wrap gap-space-2xs">
                      <p
                        className={`font-label-md text-label-md font-semibold ${
                          step.state === 'done'
                            ? 'text-text-primary'
                            : step.state === 'active'
                              ? 'text-primary'
                              : 'text-text-secondary'
                        }`}
                      >
                        {step.title}
                      </p>
                      {step.time && (
                        <span
                          className={`font-caption text-caption shrink-0 ${
                            step.state === 'active' ? 'text-primary font-medium' : 'text-text-tertiary'
                          }`}
                        >
                          {step.time}
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-caption text-caption leading-relaxed ${
                        step.state === 'upcoming' ? 'text-text-tertiary' : 'text-text-secondary'
                      }`}
                    >
                      {step.meta}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md items-start">
          {/* Order summary */}
          <section className="md:col-span-2 lg:col-span-2 rounded-xl bg-surface-canvas border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-space-xs pb-space-2xs">
              <div className="min-w-0">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Summary</h3>
                <p className="font-caption text-caption text-text-tertiary">{live ? `Order ${orderRef} • ${tableLabel}` : 'Order #UG-1085 • Table 04'}</p>
              </div>
              <span className="font-caption text-caption px-space-xs py-space-2xs rounded-lg bg-surface-subtle text-text-secondary shrink-0">
                Server: Emeka O.
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-2xs">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-space-sm p-space-2xs rounded-xl bg-surface-subtle">
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <h4 className="font-label-md text-label-md text-text-primary font-medium truncate">
                        {line.qty}× {line.name}
                      </h4>
                      <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">
                        {naira(line.price * line.qty)}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary truncate">
                      {line.note ?? 'Standard kitchen prep'}
                    </p>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <p className="font-caption text-caption text-text-tertiary text-center py-space-sm xl:col-span-2">
                  No items left on this ticket.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-2xs">
              <div className="flex justify-between items-center gap-space-xs">
                <span className="font-body-md text-body-md text-text-secondary">Total Payable</span>
                <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{naira(totalPayable)}</span>
              </div>
              <p className="font-caption text-caption text-text-tertiary">
                Direct settlement at table / counter upon completion
              </p>
            </div>
          </section>

          {/* Quick actions */}
          <section className="md:col-span-2 lg:col-span-1 rounded-xl bg-surface-canvas border border-border-subtle p-space-md shadow-sm flex flex-col gap-space-sm">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Quick Actions</h3>
            <button
              type="button"
              onClick={callWaiter}
              disabled={calling}
              className="w-full h-12 rounded-xl bg-surface-tint-blue text-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
            >
              {calling ? (
                <>
                  <Icon name="sync" className="text-[19px] animate-spin" />
                  <span>Waiter Notified</span>
                </>
              ) : (
                <>
                  <Icon name="notifications_active" filled className="text-[19px]" />
                  <span>Call Waiter to {live ? tableLabel : 'Table 04'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onReopenMenu}
              className="w-full h-12 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
            >
              <Icon name="add_circle" className="text-[19px]" />
              <span>Add More Items / Reopen Menu</span>
            </button>
            <div className="flex items-start justify-center gap-space-2xs pt-space-2xs text-center">
              <Icon name="info" className="text-text-tertiary text-[15px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary max-w-xs">
                Need to modify your order? Please flag your table attendant or cashier directly.
              </p>
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-sm py-space-xs rounded-xl shadow-lg flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-xs min-w-0">
              <Icon name="check_circle" filled className="text-inverse-primary text-[20px] shrink-0" />
              <span className="font-label-sm text-label-sm text-inverse-on-surface truncate">{toast}</span>
            </span>
            {!live && <span className="font-caption text-caption text-inverse-primary shrink-0">On the way</span>}
          </div>
        </div>
      )}
    </div>
  );
}
