import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { naira } from './catalogueData';
import { publicCartTotals, type PublicCartLine } from './publicPosData';

interface PublicPosOrderTrackingScreenProps {
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

export function PublicPosOrderTrackingScreen({ cart, onBack, onReopenMenu }: PublicPosOrderTrackingScreenProps) {
  const [calling, setCalling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const callTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const totals = publicCartTotals(cart);

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
    setToast('Attendant alerted for Table 04!');
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    callTimer.current = window.setTimeout(() => setCalling(false), 3200);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container active:scale-95 transition-transform shrink-0"
            >
              <Icon name="arrow_back" className="text-[23px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Public POS Order Tracking</h1>
          </div>
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon name="person" className="text-on-primary text-[17px]" />
          </span>
        </div>
      </header>

      <div className="px-margin pt-space-xs pb-10 flex flex-col gap-space-md">
        {/* Status hero */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-md text-center flex flex-col items-center shadow-sm">
          <span className="absolute -top-12 -right-12 w-36 h-36 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
          <span className="absolute -bottom-10 -left-10 w-32 h-32 bg-badge-discount-bg/60 rounded-full blur-xl pointer-events-none" />
          <div className="relative flex items-center justify-center mb-space-sm">
            <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-badge-discount-text/20 opacity-75" />
            <span className="relative w-14 h-14 rounded-full bg-badge-discount-bg flex items-center justify-center shadow-md">
              <Icon name="restaurant" filled className="text-badge-discount-text text-[27px]" />
            </span>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary mb-space-2xs">Order Sent to Kitchen!</h2>
          <p className="font-body-md text-body-md text-text-secondary max-w-xs mb-space-sm">
            Urban Grill &amp; Bistro has received your ticket for{' '}
            <span className="font-label-md text-label-md text-text-primary">Table 04</span>.
          </p>
          <span className="inline-flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-surface-canvas shadow-sm">
            <Icon name="timer" className="text-primary text-[17px]" />
            <span className="font-caption text-caption text-text-secondary">Estimated Prep Time:</span>
            <span className="font-label-md text-label-md text-primary font-bold">15 - 20 mins</span>
          </span>
        </div>

        {/* Live preparation stepper */}
        <div className="rounded-xl bg-surface-canvas p-space-md shadow-sm">
          <div className="flex items-center justify-between mb-space-sm gap-space-xs">
            <span className="flex items-center gap-space-2xs min-w-0">
              <Icon name="sync" className="text-primary text-[19px] shrink-0" />
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">Live Preparation</h3>
            </span>
            <span className="font-caption text-caption px-space-xs py-space-2xs rounded-full bg-surface-tint-blue text-primary font-medium shrink-0">
              Real-time sync
            </span>
          </div>

          <div className="relative flex flex-col space-y-space-sm">
            {STEPS.map((step, index) => {
              const isLast = index === STEPS.length - 1;
              return (
                <div key={step.title} className="flex items-start gap-space-sm relative">
                  <div className="flex flex-col items-center">
                    {step.state === 'active' ? (
                      <span className="relative flex items-center justify-center z-10">
                        <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-primary/30" />
                        <span className="relative w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                          <Icon name={step.icon} className="text-[17px]" />
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          step.state === 'done'
                            ? 'bg-badge-discount-bg text-badge-discount-text shadow-sm'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        <Icon
                          name={step.icon}
                          className={step.state === 'done' ? 'text-[17px]' : 'text-[15px]'}
                          filled={step.state === 'done'}
                        />
                      </span>
                    )}
                    {!isLast && (
                      <span
                        className={`w-0.5 h-10 -mb-2 ${
                          step.state === 'done' ? 'bg-badge-discount-text/30' : 'bg-surface-container-highest'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-space-xs">
                      <p
                        className={`font-label-md text-label-md font-semibold truncate ${
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
                      className={`font-caption text-caption ${
                        step.state === 'upcoming' ? 'text-text-tertiary' : 'text-text-secondary'
                      }`}
                    >
                      {step.meta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between gap-space-xs pb-space-2xs">
            <div className="min-w-0">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Order Summary</h3>
              <p className="font-caption text-caption text-text-tertiary">Order #UG-1085 • Table 04</p>
            </div>
            <span className="font-caption text-caption px-space-xs py-space-2xs rounded-lg bg-surface-container text-text-secondary shrink-0">
              Server: Emeka O.
            </span>
          </div>

          <div className="flex flex-col gap-space-2xs">
            {cart.map((line) => (
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
            {cart.length === 0 && (
              <p className="font-caption text-caption text-text-tertiary text-center py-space-sm">
                No items left on this ticket.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-2xs">
            <div className="flex justify-between items-center gap-space-xs">
              <span className="font-body-md text-body-md text-text-secondary">Total Payable</span>
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{naira(totals.total)}</span>
            </div>
            <p className="font-caption text-caption text-text-tertiary">
              Direct settlement at table / counter upon completion
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-space-sm pt-space-2xs">
          <button
            type="button"
            onClick={callWaiter}
            disabled={calling}
            className="w-full h-11 rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs active:scale-95 transition-transform shadow-sm"
          >
            {calling ? (
              <>
                <Icon name="sync" className="text-[19px] animate-spin" />
                <span>Waiter Notified</span>
              </>
            ) : (
              <>
                <Icon name="notifications_active" filled className="text-[19px]" />
                <span>Call Waiter to Table 04</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReopenMenu}
            className="w-full h-11 rounded-xl bg-surface-container text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-xs active:scale-95 transition-transform"
          >
            <Icon name="add_circle" className="text-[19px]" />
            <span>Add More Items / Reopen Menu</span>
          </button>
          <div className="flex items-center justify-center gap-space-2xs pt-space-2xs text-center">
            <Icon name="info" className="text-text-tertiary text-[15px] shrink-0" />
            <p className="font-caption text-caption text-text-secondary max-w-xs">
              Need to modify your order? Please flag your table attendant or cashier directly.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-sm py-space-xs rounded-xl shadow-lg flex items-center justify-between gap-space-xs">
            <span className="flex items-center gap-space-xs min-w-0">
              <Icon name="check_circle" filled className="text-inverse-primary text-[20px] shrink-0" />
              <span className="font-label-sm text-label-sm text-inverse-on-surface truncate">
                Attendant alerted for Table 04!
              </span>
            </span>
            <span className="font-caption text-caption text-inverse-primary shrink-0">On the way</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
