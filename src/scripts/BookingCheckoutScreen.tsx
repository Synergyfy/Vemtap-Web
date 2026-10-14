import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';
import {
  SPA_CLIENT,
  SPA_MERCHANT,
  SPA_VOUCHER_CODE,
  formatSpaDuration,
} from './spaBookingData';

interface BookingCheckoutScreenProps {
  onBack: () => void;
  /** Called only after the appointment record is successfully created. */
  onConfirmed: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function BookingCheckoutScreen({ onBack, onConfirmed }: BookingCheckoutScreenProps) {
  const booking = useBooking();
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const serviceDuration = booking.services.reduce((total, service) => total + service.time, 0);
  const sessionDuration = booking.durationMinutes;

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  /** BUG-025: confirm revalidates the slot and persists a real appointment record. */
  const handleConfirm = () => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmError(null);
    const timer = window.setTimeout(() => {
      const result = booking.confirm();
      setSubmitting(false);
      if (!result.ok) {
        setConfirmError(result.error);
        return;
      }
      onConfirmed();
    }, 500);
    toastTimers.current.push(timer);
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle px-4 py-3 flex items-center justify-between">
        <button
          aria-label="Go back"
          type="button"
          onClick={onBack}
          className="size-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all"
        >
          <Icon name="arrow_back" className="text-[24px]" />
        </button>
        <div className="text-center">
          <h1 className="text-heading-sm text-heading-sm font-heading-sm text-text-primary">Booking Checkout</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Help and support"
            type="button"
            className="size-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all"
          >
            <Icon name="help_outline" className="text-[24px]" />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-1.5 w-6 rounded-full bg-primary-container" />
          <div className="h-1.5 w-6 rounded-full bg-primary-container" />
        </div>
        <p className="text-caption text-caption text-text-secondary font-label-md text-center">
          Step 2 of 2: Review &amp; Confirm Reservation
        </p>
      </div>

      <main className="p-4 space-y-4 pb-44">
        <section className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex gap-3 items-center">
          <div
            className="size-16 rounded-lg bg-cover bg-center shrink-0 border border-border-subtle shadow-sm"
            style={{ backgroundImage: `url('${SPA_MERCHANT.image}')` }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h2 className="text-label-md text-label-md font-heading-sm text-text-primary truncate">
                {SPA_MERCHANT.name}
              </h2>
              <Icon name="verified" className="text-primary text-[18px] shrink-0" filled />
            </div>
            <p className="text-caption text-caption text-text-secondary mt-0.5 line-clamp-2">
              {SPA_MERCHANT.address} • {SPA_MERCHANT.distance}
            </p>
          </div>
        </section>

        <section className="p-4 rounded-xl border border-border-subtle bg-surface-canvas shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 pb-1 border-b border-border-subtle">
            <Icon name="calendar_month" className="text-primary text-[20px]" />
            <h3 className="text-label-md text-label-md font-heading-sm text-text-primary">Appointment Schedule</h3>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Icon name="schedule" className="text-[18px]" />
            </div>
            <div>
              <span className="text-caption text-caption text-text-secondary block">Date &amp; Time</span>
              <p className="text-label-md text-label-md font-heading-sm text-text-primary">
                {booking.day.dateLong} at {booking.time}
              </p>
              <span className="text-caption text-caption text-text-secondary">
                (~{formatSpaDuration(sessionDuration)} duration)
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Icon name="person" className="text-[18px]" />
            </div>
            <div>
              <span className="text-caption text-caption text-text-secondary block">Specialist Assigned</span>
              <p className="text-label-md text-label-md font-heading-sm text-text-primary">
                Any Available <span className="text-text-secondary font-normal">(matched at check-in — coming soon)</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text shrink-0 mt-0.5">
              <Icon name="storefront" className="text-[18px]" />
            </div>
            <div>
              <span className="text-caption text-caption text-text-secondary block">Booking Type</span>
              <p className="text-label-md text-label-md font-label-md text-text-primary">
                In-Salon Appointment <span className="text-badge-discount-text font-medium">(Pay Upon Completion)</span>
              </p>
            </div>
          </div>
        </section>

        <section className="p-4 rounded-xl border border-border-subtle bg-surface-canvas shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Icon name="contacts" className="text-primary text-[20px]" />
              <h3 className="text-label-md text-label-md font-heading-sm text-text-primary">Client Information</h3>
            </div>
            <button
              className="text-caption text-caption font-label-md text-primary hover:underline"
              type="button"
              onClick={() => showToast('Client details update coming soon')}
            >
              Edit
            </button>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-text-secondary text-caption text-caption">Full Name</span>
            <span className="text-label-md text-label-md font-label-md text-text-primary">{SPA_CLIENT.name}</span>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-text-secondary text-caption text-caption">Phone Number</span>
            <div className="flex items-center gap-1.5">
              <span className="text-label-md text-label-md font-label-md text-text-primary">{SPA_CLIENT.phone}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-badge-discount-bg text-badge-discount-text border border-emerald-200">
                Verified
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-text-secondary text-caption text-caption">Email</span>
            <span className="text-label-md text-label-md text-text-primary">{SPA_CLIENT.email}</span>
          </div>
          <label className="pt-2 border-t border-border-subtle flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <Icon name="notifications_active" className="text-text-secondary text-[20px]" />
              <span className="text-caption text-caption font-label-md text-text-primary group-hover:text-primary transition-colors">
                Send SMS &amp; WhatsApp Reminder
              </span>
            </div>
            <input
              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
              type="checkbox"
              checked={booking.reminder}
              onChange={(event) => booking.setReminder(event.target.checked)}
            />
          </label>
        </section>

        <section className="p-4 rounded-xl border border-border-subtle bg-surface-canvas shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Icon name="spa" className="text-primary text-[20px]" />
              <h3 className="text-label-md text-label-md font-heading-sm text-text-primary">Selected Services</h3>
            </div>
            <span className="text-caption text-caption font-label-md text-text-secondary bg-surface-container px-2 py-0.5 rounded-full">
              Total: {formatSpaDuration(sessionDuration)}
            </span>
          </div>
          {booking.services.map((service, index) => (
            <div
              key={service.id}
              className={`flex justify-between items-start ${index === 0 ? 'pt-1' : 'pt-2 border-t border-dashed border-border-subtle'}`}
            >
              <div className="pr-2">
                <h4 className="text-label-md text-label-md font-heading-sm text-text-primary">{service.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-caption text-caption text-text-secondary">{service.time} mins</span>
                  <span className="text-[11px] font-medium text-primary bg-surface-tint-blue px-1.5 py-0.5 rounded">
                    Voucher Eligible
                  </span>
                </div>
              </div>
              <span className="text-label-md text-label-md font-heading-sm text-text-primary shrink-0">
                {naira(service.price)}
              </span>
            </div>
          ))}
          {booking.addons.map((addon) => (
            <div
              key={addon.id}
              className="flex justify-between items-start pt-2 border-t border-dashed border-border-subtle bg-surface-subtle -mx-4 px-4 py-2"
            >
              <div className="pr-2">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-bold text-xs">+</span>
                  <h4 className="text-caption text-caption font-heading-sm text-text-primary">{addon.name}</h4>
                </div>
                <span className="text-caption text-caption text-text-secondary pl-2.5">
                  {addon.minutes} mins • Skin Renewal Add-on
                </span>
              </div>
              <span className="text-label-md text-label-md font-label-md text-text-primary shrink-0">
                {naira(addon.price)}
              </span>
            </div>
          ))}
        </section>

        <section className="p-3.5 rounded-xl bg-badge-discount-bg border border-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white flex items-center justify-center text-badge-discount-text shadow-sm shrink-0">
              <Icon name="loyalty" className="text-[20px]" filled />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-label-md text-label-md font-heading-sm text-badge-discount-text">
                  20% OFF Deal Applied
                </h4>
              </div>
              <p className="text-caption text-caption text-text-secondary">
                Code: <span className="font-mono font-bold text-badge-discount-text">{SPA_VOUCHER_CODE}</span> •
                Lifetime VEMTAP Tap
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-heading-sm text-heading-sm font-heading-sm text-badge-discount-text">
              -{naira(booking.discount)}
            </span>
          </div>
        </section>

        <section className="p-4 rounded-xl bg-surface-tint-blue border border-border-active space-y-3">
          <div className="flex items-start gap-2.5">
            <Icon name="shield_with_heart" className="text-primary text-[22px] shrink-0 mt-0.5" filled />
            <div>
              <h3 className="text-label-md text-label-md font-heading-sm text-text-primary">
                Pay Directly at the Spa Reception
              </h3>
              <p className="text-caption text-caption text-text-secondary mt-1 leading-relaxed">
                VEMTAP secures your reservation slot and guarantees your 20% deal discount for free. No advance card
                payment is required on VEMTAP. You will pay <strong className="text-text-primary">{naira(booking.payable)}</strong>{' '}
                directly to Glow &amp; Serenity upon completion of your service.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface-canvas text-text-primary px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
              <Icon name="credit_card" className="text-[14px] text-primary" /> POS Terminal Ready
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface-canvas text-text-primary px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
              <Icon name="payments" className="text-[14px] text-badge-discount-text" /> Cash Accepted
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface-canvas text-text-primary px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
              <Icon name="account_balance" className="text-[14px] text-secondary" /> Direct Bank Transfer
            </span>
          </div>
        </section>

        <section className="p-4 rounded-xl border border-border-subtle bg-surface-canvas shadow-sm space-y-2.5">
          <h3 className="text-label-md text-label-md font-heading-sm text-text-primary pb-1 border-b border-border-subtle">
            Payment Breakdown
          </h3>
          <div className="flex justify-between text-body-md">
            <span className="text-text-secondary text-caption text-caption">Services Subtotal</span>
            <span className="text-caption text-caption font-label-md text-text-primary">{naira(booking.subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-md text-badge-discount-text">
            <span className="text-caption text-caption">VEMTAP Deal Discount (20%)</span>
            <span className="text-caption text-caption font-label-md">-{naira(booking.discount)}</span>
          </div>
          <div className="flex justify-between text-body-md">
            <div className="flex items-center gap-1">
              <span className="text-text-secondary text-caption text-caption">Booking &amp; Service Fee</span>
              <span className="text-[10px] text-primary font-semibold bg-surface-tint-blue px-1 py-0.5 rounded">
                0% FEE
              </span>
            </div>
            <span className="text-caption text-caption font-label-md text-badge-discount-text">₦0</span>
          </div>
          <div className="pt-2 border-t border-border-subtle flex justify-between items-baseline">
            <div>
              <span className="text-label-md text-label-md font-heading-sm text-text-primary block">
                Total Payable at Salon
              </span>
              <span className="text-[11px] text-text-secondary">Due after your treatments</span>
            </div>
            <span className="text-heading-sm text-heading-sm font-heading-sm text-primary-container">
              {naira(booking.payable)}
            </span>
          </div>
        </section>

        <section className="p-3 bg-surface-subtle rounded-lg border border-border-subtle flex items-start gap-2.5">
          <Icon name="info" className="text-text-secondary text-[18px] shrink-0 mt-0.5" />
          <p className="text-caption text-caption text-text-secondary leading-snug">
            <strong>Cancellation Policy:</strong> Free cancellation or reschedule up to 2 hours before {booking.time}.
            Please arrive 10 minutes prior for quick check-in.
          </p>
        </section>

        <p className="text-[11px] text-text-tertiary text-center">
          Service duration {formatSpaDuration(serviceDuration)}
          {booking.addons.length > 0 ? ` + ${formatSpaDuration(sessionDuration - serviceDuration)} add-ons` : ''} •
          Reservation held for 15 minutes past start time.
        </p>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-canvas border-t border-border-subtle px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 pb-safe">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div>
            <span className="text-caption text-caption text-text-secondary">Pay at Spa Reception</span>
            <div className="text-heading-sm text-heading-sm font-heading-sm text-primary-container">
              {naira(booking.payable)}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full border border-emerald-200">
              <Icon name="savings" className="text-[14px]" /> You Save {naira(booking.discount)}
            </span>
          </div>
        </div>
        {confirmError && (
          <div className="p-3 rounded-xl bg-error-container/40 border border-error/40 flex items-start gap-2" role="alert">
            <Icon name="error" className="text-error text-[18px] shrink-0 mt-0.5" />
            <div>
              <p className="text-label-md text-label-md font-semibold text-error">Could not confirm booking</p>
              <p className="text-caption text-caption text-text-secondary mt-0.5">{confirmError}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={submitting || !booking.timeAvailable}
          onClick={handleConfirm}
          className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary font-button-primary rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
        >
          {submitting ? (
            <>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
              <span>Confirming Appointment…</span>
            </>
          ) : (
            <>
              <span>Confirm Booking with Glow &amp; Serenity</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </>
          )}
        </button>
        <p className="text-[11px] text-text-tertiary text-center mt-2">
          By booking you agree to salon reservation rules &amp; VEMTAP terms.
        </p>
      </footer>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
