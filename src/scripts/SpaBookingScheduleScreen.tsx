import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { CalendarPicker } from '../components/ui/CalendarPicker';
import { FormDropdown, type DropdownOption } from '../components/ui/FormDropdown';
import { SheetShell } from '../components/sheets/SheetShell';
import { useBooking } from '../context/BookingContext';
import { SPA_MERCHANT, spaIsDayOpen } from './spaBookingData';

interface SpaBookingScheduleScreenProps {
  onBack: () => void;
  onReview: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function SpaBookingScheduleScreen({ onBack, onReview }: SpaBookingScheduleScreenProps) {
  const booking = useBooking();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2500);
    toastTimers.current.push(timer);
  };

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const periodOptions: DropdownOption[] = booking.periods.map((period) => {
    const openCount = period.slots.filter((slot) => slot.status === 'available').length;
    return {
      value: period.id,
      label: period.label,
      description: openCount === 0 ? 'No open times' : `${openCount} time${openCount === 1 ? '' : 's'} available`,
    };
  });

  const timeOptions: DropdownOption[] = useMemo(
    () =>
      booking.activePeriod.slots.map((slot) => ({
        value: slot.time,
        label: slot.time,
        description: slot.status === 'booked' ? 'Booked — not selectable' : 'Available',
        disabled: slot.status === 'booked',
      })),
    [booking.activePeriod],
  );

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 flex items-center bg-surface-container-lowest/90 backdrop-blur-md px-4 py-3 justify-between border-b border-border-subtle">
        <button
          aria-label="Go Back"
          type="button"
          onClick={onBack}
          className="text-on-surface flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <Icon name="arrow_back" className="text-[24px]" />
        </button>
        <h1 className="text-on-surface text-heading-sm font-heading-sm font-semibold tracking-[-0.015em] flex-1 text-center">
          Schedule Appointment
        </h1>
        <button
          aria-label="Share"
          type="button"
          onClick={() => showToast('Booking link copied to clipboard')}
          className="flex size-10 items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface transition-colors"
        >
          <Icon name="share" className="text-[22px]" />
        </button>
      </header>

      <main className="flex flex-col flex-1 pb-40">
        <section className="flex flex-col gap-2 p-4 bg-surface-subtle border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <p className="text-on-surface text-label-md font-label-md font-semibold">
              Step 1 of 2: Date, Time &amp; Details
            </p>
            <span className="px-2 py-0.5 rounded-full text-caption text-caption font-semibold bg-surface-container text-primary">
              1 / 2
            </span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary-container rounded-full transition-all duration-300 w-1/2" />
          </div>
          <div className="flex items-center justify-between text-caption text-caption text-text-secondary pt-0.5">
            <span>Active selection</span>
            <span className="flex items-center gap-1 font-medium text-text-secondary">
              Next: Review &amp; Confirm <Icon name="arrow_forward" className="text-[14px]" />
            </span>
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low border border-border-subtle shadow-sm">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-badge-discount-text">
                <Icon name="star" className="text-[16px]" filled />
                <span className="text-caption text-caption font-semibold text-text-primary">
                  {SPA_MERCHANT.rating}
                </span>
                <span className="text-caption text-caption text-text-secondary">({SPA_MERCHANT.reviews})</span>
              </div>
              <h2 className="text-on-surface text-body-lg text-body-lg font-bold leading-snug truncate">
                {SPA_MERCHANT.name}
              </h2>
              <p className="text-text-secondary text-caption text-caption flex items-center gap-1 truncate">
                <Icon name="location_on" className="text-[15px] text-text-tertiary" />
                {SPA_MERCHANT.shortLocation} • {SPA_MERCHANT.distance}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => showToast('Policy details coming soon')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-surface-container-lowest border border-border-subtle text-primary text-label-sm text-label-sm font-semibold hover:bg-surface-tint-blue transition-colors"
                >
                  <Icon name="info" className="text-[16px]" />
                  <span>View Info &amp; Policy</span>
                </button>
              </div>
            </div>
            <div className="size-20 shrink-0 rounded-lg overflow-hidden bg-surface-container relative shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt={SPA_MERCHANT.interiorAlt}
                src={SPA_MERCHANT.interiorImage}
              />
            </div>
          </div>
        </section>

        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="spa" className="text-primary text-[20px]" filled />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Selected Services ({booking.services.length})
              </h3>
            </div>
            <span className="text-caption text-caption font-semibold text-primary bg-surface-tint-blue px-2 py-0.5 rounded-full">
              ~{booking.durationLabel} total
            </span>
          </div>
          <div className="space-y-2.5">
            {booking.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                    <Icon name={service.icon} className="text-[20px]" />
                  </div>
                  <div className="truncate">
                    <p className="text-on-surface text-label-md text-label-md font-semibold truncate">{service.name}</p>
                    <p className="text-text-secondary text-caption text-caption">
                      {service.time} mins • {naira(service.price)}
                    </p>
                  </div>
                </div>
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-badge-discount-bg text-badge-discount-text">
                  <Icon name="check" className="text-[16px]" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 text-caption text-caption border-t border-dashed border-border-subtle text-text-secondary">
            <span>Est. Session Subtotal</span>
            <span className="font-bold text-on-surface text-label-md text-label-md">{naira(booking.subtotal)}</span>
          </div>
        </section>

        {/* BUG-024: Specialist selection is Coming Soon — kept for a later release. */}
        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="face" className="text-primary text-[20px]" />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Preferred Specialist
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-border-subtle bg-surface-subtle">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-text-tertiary">
              <Icon name="hourglass_empty" className="text-[20px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-label-md text-label-md font-semibold text-on-surface">Specialist selection</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-surface-container text-text-tertiary">
                  Coming Soon
                </span>
              </div>
              <p className="text-caption text-caption text-text-secondary mt-0.5">
                You&apos;ll be matched with the next available specialist at check-in.
              </p>
            </div>
          </div>
        </section>

        {/* BUG-020: single-line date control opening a full calendar. */}
        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-1.5 mb-3">
            <Icon name="calendar_month" className="text-primary text-[20px]" />
            <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
              Preferred Date
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="w-full min-h-12 px-4 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-2 text-left border border-border-subtle hover:border-primary transition-colors"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Icon name="event" className="text-[20px] text-primary shrink-0" />
              <span className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                  {booking.day.dateLong}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Tap to open calendar • salon closed Sundays
                </span>
              </span>
            </span>
            <Icon name="expand_more" className="text-[20px] text-text-tertiary shrink-0" />
          </button>
        </section>

        {/* BUG-022 + BUG-021: period dropdown and start-time dropdown. */}
        <section className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-primary text-[20px]" />
              <h3 className="text-on-surface text-label-md text-label-md font-bold uppercase tracking-wider">
                Available Start Time
              </h3>
            </div>
            <span className="text-caption text-caption text-text-secondary">WAT (GMT+1)</span>
          </div>

          <label className="block text-caption text-caption text-text-secondary mb-1.5" htmlFor="period-dropdown">
            Time of day
          </label>
          <div id="period-dropdown" className="mb-3">
            <FormDropdown
              ariaLabel="Time of day"
              value={booking.periodId}
              options={periodOptions}
              onChange={booking.setPeriod}
              placeholder="Select time of day"
            />
          </div>

          <label className="block text-caption text-caption text-text-secondary mb-1.5" htmlFor="time-dropdown">
            Start time for {booking.day.dateShort}
          </label>
          <div id="time-dropdown">
            <FormDropdown
              ariaLabel="Appointment start time"
              value={booking.timeAvailable ? booking.time : ''}
              options={timeOptions}
              onChange={booking.setTime}
              placeholder={booking.availableTimes.length ? 'Select a start time' : 'No times available'}
            />
          </div>

          {!booking.timeAvailable && booking.availableTimes.length > 0 && (
            <p className="text-[11px] text-badge-discount-text mt-2 flex items-center gap-1">
              <Icon name="info" className="text-[13px]" />
              Pick an available start time to continue.
            </p>
          )}
          {booking.availableTimes.length === 0 && (
            <p className="text-[11px] text-text-secondary mt-2 flex items-center gap-1">
              <Icon name="event_busy" className="text-[13px]" />
              Fully booked for this date — try another day or time of day.
            </p>
          )}
        </section>

        <section className="p-4">
          <div className="flex items-center justify-between mb-2">
            <label
              className="text-on-surface text-label-md text-label-md font-bold flex items-center gap-1.5"
              htmlFor="special-notes"
            >
              <Icon name="edit_note" className="text-primary text-[18px]" />
              Special Requests &amp; Skin Sensitivities
            </label>
            <span className="text-caption text-caption text-text-secondary">Optional</span>
          </div>
          <textarea
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle text-on-surface placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-body-md p-3"
            id="special-notes"
            placeholder="e.g., Sensitive to retinol or peel products, prefer quiet relaxation session, allergy to certain oils..."
            rows={3}
            value={booking.notes}
            onChange={(event) => booking.setNotes(event.target.value)}
          />
          <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
            <Icon name="check_circle" className="text-[13px] text-badge-discount-text" />
            Staff is notified prior to session setup for tailored preparation.
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 z-40 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-container-lowest border-t border-border-subtle px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-2xl">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-caption text-caption text-text-secondary leading-tight">Total Payable</p>
            <p className="text-heading-md text-heading-md font-bold text-on-surface">{naira(booking.payable)}</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-label-sm text-label-sm font-semibold text-primary bg-surface-tint-blue px-2.5 py-1 rounded-lg">
              <Icon name="event" className="text-[16px]" />
              {booking.day.dateShort} @ {booking.timeAvailable ? booking.time : '—'}
            </span>
            <p className="text-caption text-caption text-text-secondary mt-0.5">
              Specialist: Any Available
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!booking.timeAvailable}
          onClick={onReview}
          className="w-full h-11 rounded-xl bg-primary-container text-white font-semibold text-button-primary flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
        >
          <span>Review Booking Details</span>
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>

      <SheetShell open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-heading-sm text-heading-sm font-heading-sm text-on-surface font-semibold">
                Choose a date
              </h3>
              <p className="text-caption text-caption text-text-secondary mt-0.5">
                Available days only • navigate months with the arrows
              </p>
            </div>
            <button
              aria-label="Close calendar"
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="flex size-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
          <CalendarPicker
            valueISO={booking.dateISO}
            isDateDisabled={(date) => !spaIsDayOpen(date)}
            onSelect={(iso) => {
              booking.setDateISO(iso);
              setCalendarOpen(false);
            }}
          />
          <p className="text-[11px] text-text-tertiary mt-3">
            Available times refresh automatically for the date you choose.
          </p>
        </div>
      </SheetShell>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
