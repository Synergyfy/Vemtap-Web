import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { CalendarPicker } from '../../components/ui/CalendarPicker';
import { FormDropdown, type DropdownOption } from '../../components/ui/FormDropdown';
import { useBooking } from '../../context/BookingContext';
import { SPA_MERCHANT, SPA_VOUCHER_CODE, spaIsDayOpen } from '../spaBookingData';

interface DesktopSpaBookingScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  /** BUG-026: open the business conversation with the receptionist. */
  onChat?: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function DesktopSpaBookingScreen({ onNav, onBack, onChat }: DesktopSpaBookingScreenProps) {
  const booking = useBooking();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const onClickAway = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setCalendarOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onEscape);
    };
  }, [calendarOpen]);

  const periodOptions: DropdownOption[] = booking.periods.map((period) => {
    const openCount = period.slots.filter((slot) => slot.status === 'available').length;
    return {
      value: period.id,
      label: period.label,
      description: openCount === 0 ? 'No open times' : `${openCount} time${openCount === 1 ? '' : 's'} available`,
    };
  });

  const timeOptions: DropdownOption[] = booking.activePeriod.slots.map((slot) => ({
    value: slot.time,
    label: slot.time,
    description: slot.status === 'booked' ? 'Booked — not selectable' : 'Available',
    disabled: slot.status === 'booked',
  }));

  const confirmed = Boolean(booking.confirmedRef);

  const handleConfirm = () => {
    if (submitting || confirmed) return;
    setSubmitting(true);
    setConfirmError(null);
    window.setTimeout(() => {
      const result = booking.confirm();
      setSubmitting(false);
      if (!result.ok) setConfirmError(result.error);
    }, 600);
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface">
        <div className="w-full bg-surface-subtle py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to Glow & Serenity Spa catalog"
                className="p-2 rounded-xl bg-surface-canvas text-on-surface-variant hover:text-primary hover:bg-surface-tint-blue shadow-sm transition-all flex items-center justify-center"
              >
                <Icon name="arrow_back" className="text-[20px]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                    {confirmed ? 'Appointment Confirmed' : 'Schedule Appointment'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Special 20% Off
                  </span>
                </div>
                <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight">
                  {SPA_MERCHANT.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-text-secondary font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="verified" className="text-primary text-[18px]" />
                <span>VEMTAP Guaranteed Slot</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Icon name="lock" className="text-[18px]" />
                <span>No Upfront Charge</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-8">
              {confirmed && (
                <div className="bg-surface-canvas rounded-xl p-8 shadow-sm border border-badge-discount-bg">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                      <Icon name="check_circle" className="text-badge-discount-text text-[32px]" filled />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">Appointment Confirmed!</h2>
                      <p className="font-caption text-caption text-text-secondary mt-1">
                        Your slot is held. Present booking ref{' '}
                        <strong className="text-text-primary">#{booking.confirmedRef}</strong> at reception.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setRouteMessages(onNav)}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <Icon name="chat" className="text-[18px]" />
                          <span>Chat with Reception</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            booking.reset();
                            setConfirmError(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors"
                        >
                          Book another appointment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shadow-md">
                      1
                    </span>
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-on-surface">
                        Step 1: Schedule &amp; Preferences
                      </p>
                      <p className="font-caption text-caption text-text-secondary">
                        Pick an available date and start time for your session
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-7 rounded-full bg-primary" />
                    <span className="h-2 w-7 rounded-full bg-primary/40" />
                    <span className="h-2 w-2 rounded-full bg-surface-container-high" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="calendar_month" className="text-primary text-[26px]" />
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Select Date &amp; Time</h2>
                  </div>
                </div>

                {/* BUG-020: single-line date control; full calendar opens on click. */}
                <div className="relative" ref={calendarRef}>
                  <span className="font-label-md text-label-md font-semibold text-on-surface block mb-2">
                    Preferred Date
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((open) => !open)}
                    aria-expanded={calendarOpen}
                    className="w-full max-w-md px-4 py-3 rounded-xl bg-surface-subtle hover:bg-surface-container flex items-center justify-between gap-3 text-left border border-surface-container-low transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon name="event" className="text-primary text-[22px]" />
                      <span className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md font-bold text-on-surface truncate">
                          {booking.day.dateLong}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">
                          Click to open the calendar • closed Sundays
                        </span>
                      </span>
                    </span>
                    <Icon
                      name="expand_more"
                      className={`text-[22px] text-text-tertiary transition-transform ${calendarOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {calendarOpen && (
                    <div className="absolute z-30 mt-2 w-[340px] bg-surface-canvas rounded-xl shadow-xl border border-surface-container-low p-4">
                      <CalendarPicker
                        valueISO={booking.dateISO}
                        isDateDisabled={(date) => !spaIsDayOpen(date)}
                        onSelect={(iso) => {
                          booking.setDateISO(iso);
                          setCalendarOpen(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* BUG-022 + BUG-021: period and start-time dropdowns. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block mb-2">
                      Time of Day
                    </span>
                    <FormDropdown
                      ariaLabel="Time of day"
                      value={booking.periodId}
                      options={periodOptions}
                      onChange={booking.setPeriod}
                      placeholder="Select time of day"
                    />
                  </div>
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block mb-2">
                      Available Start Time
                    </span>
                    <FormDropdown
                      ariaLabel="Appointment start time"
                      value={booking.timeAvailable ? booking.time : ''}
                      options={timeOptions}
                      onChange={booking.setTime}
                      placeholder={booking.availableTimes.length ? 'Select a start time' : 'No times available'}
                    />
                  </div>
                </div>
                {!booking.timeAvailable && booking.availableTimes.length > 0 && (
                  <p className="text-caption text-caption text-badge-discount-text flex items-center gap-1.5">
                    <Icon name="info" className="text-[16px]" />
                    Pick an available start time to continue. Unavailable slots cannot be selected.
                  </p>
                )}
                {booking.availableTimes.length === 0 && (
                  <p className="text-caption text-caption text-text-secondary flex items-center gap-1.5">
                    <Icon name="event_busy" className="text-[16px]" />
                    Fully booked for this date — try another day or time of day.
                  </p>
                )}
              </div>

              {/* BUG-024: Specialist & Service Mode — Coming Soon. */}
              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="badge" className="text-primary text-[26px]" />
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">
                        Specialist &amp; Service Mode
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Choosing your aesthetician and service arrangement
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-text-tertiary font-caption text-[11px] font-bold uppercase tracking-wide">
                    Coming Soon
                  </span>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-subtle">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-text-tertiary shrink-0">
                    <Icon name="hourglass_empty" className="text-[24px]" />
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-on-surface">
                      Specialist &amp; service mode selection is coming soon
                    </p>
                    <p className="font-caption text-caption text-text-secondary mt-1">
                      Booking works today without these options — you&apos;ll be matched with the next available
                      specialist at check-in, in-salon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="spa" className="text-primary text-[26px]" />
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">Selected Treatments</h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Sessions included in this appointment
                      </p>
                    </div>
                  </div>
                  <span className="font-caption text-caption text-text-secondary">
                    ~{booking.durationLabel} total
                  </span>
                </div>
                <div className="space-y-4">
                  {booking.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          alt={service.imageAlt}
                          className="w-16 h-16 rounded-xl object-cover"
                          src={service.image}
                        />
                        <div className="min-w-0">
                          <h3 className="font-label-md text-label-md font-bold text-on-surface truncate">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2 text-text-secondary font-caption text-caption mt-0.5">
                            <Icon name="schedule" className="text-[15px]" />
                            <span>{service.time} mins</span>
                            <span>•</span>
                            <span className="truncate max-w-[220px]">{service.categoryLabel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          {naira(service.price)}
                        </span>
                        <span className="block font-caption text-caption text-badge-discount-text">VEMTAP Deal</span>
                      </div>
                    </div>
                  ))}

                  {/* BUG-023: Add-ons Coming Soon — data kept for a future release. */}
                  <div className="p-4 rounded-xl border border-dashed border-surface-container-high flex items-center justify-between bg-surface-subtle/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-text-tertiary">
                        <Icon name="add_circle" className="text-[22px]" />
                      </div>
                      <div>
                        <span className="font-label-md text-label-md font-semibold text-on-surface-variant">
                          Session Add-ons
                        </span>
                        <span className="block font-caption text-caption text-text-tertiary">
                          LED therapy, eye contour &amp; scalp massage
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-text-tertiary font-caption text-[11px] font-bold uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-md text-label-md font-semibold text-on-surface"
                      htmlFor="skin-notes"
                    >
                      Skin Sensitivities &amp; Consultation Notes
                    </label>
                    <span className="font-caption text-caption text-text-tertiary">Shared with your specialist</span>
                  </div>
                  <textarea
                    className="w-full p-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-text-tertiary resize-none"
                    id="skin-notes"
                    placeholder="Provide notes regarding skin reactions, allergies, retinoids, or pressure preferences..."
                    rows={3}
                    value={booking.notes}
                    onChange={(event) => booking.setNotes(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-surface-canvas rounded-xl p-6 shadow-md space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                      Booking Summary
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      {booking.confirmedRef ? `Ref #${booking.confirmedRef}` : 'Review before confirming'}
                    </span>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface pt-1">
                    {confirmed ? 'Appointment Confirmed' : 'Booking Confirmation'}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    {confirmed
                      ? 'Keep your reference for check-in at reception'
                      : 'Review reservation terms prior to confirming'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Icon name="schedule" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">
                        Date &amp; Estimated Duration
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {booking.day.dateShort} • {booking.timeAvailable ? booking.time : '—'}
                      </span>
                      <span className="font-caption text-caption text-text-tertiary block">
                        Total session: ~{booking.durationLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="person" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Specialist</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">Any Available</span>
                      <span className="font-caption text-caption text-text-tertiary block">
                        Matched at check-in (specialist picker coming soon)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="pin_drop" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Salon Location</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {SPA_MERCHANT.address}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="badge" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Client</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">Zainab Ahmed</span>
                      <span className="font-caption text-caption text-text-secondary block">+234 803 555 0192</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Payment Breakdown</span>
                  <div className="space-y-2 text-text-secondary font-body-md text-body-md">
                    <div className="flex justify-between items-center">
                      <span>Services Subtotal ({booking.services.length} item{booking.services.length === 1 ? '' : 's'})</span>
                      <span className="text-on-surface font-semibold">{naira(booking.servicesSubtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-badge-discount-text">
                      <div className="flex items-center gap-1.5">
                        <Icon name="local_offer" className="text-[16px]" />
                        <span>VEMTAP Deal ({SPA_VOUCHER_CODE})</span>
                      </div>
                      <span className="font-bold">-{naira(booking.discount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span>VEMTAP Booking Fee</span>
                        <span className="px-1.5 py-0.2 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                          100% Free
                        </span>
                      </div>
                      <span className="text-badge-discount-text font-bold">₦0.00</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-surface-container-low flex justify-between items-end">
                    <div>
                      <span className="font-caption text-caption text-text-secondary uppercase font-bold tracking-wider">
                        Total Payable at Salon
                      </span>
                      <p className="font-caption text-caption text-text-tertiary">Pay upon completed service</p>
                    </div>
                    <span className="font-heading-lg text-heading-lg font-bold text-primary">
                      {naira(booking.payable)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-subtle space-y-2">
                  <div className="flex items-center gap-2 text-on-surface font-label-sm text-label-sm font-bold">
                    <Icon name="payments" className="text-primary text-[18px]" />
                    <span>Zero Prepayment Required</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    VEMTAP holds your slot without charging your card today. Present your booking ref at reception.
                    Accepted on-site: <strong className="text-text-primary">POS Card, Bank Transfer, or Cash</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-badge-discount-text bg-badge-discount-bg p-3 rounded-xl">
                  <Icon name="check_circle" className="text-[20px] shrink-0" />
                  <span className="font-caption text-caption font-semibold">
                    Free cancellation up to 2 hours before appointment time.
                  </span>
                </div>

                {confirmError && (
                  <div
                    className="p-3 rounded-xl bg-error-container/40 border border-error/40 flex items-start gap-2"
                    role="alert"
                  >
                    <Icon name="error" className="text-error text-[18px] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-label-sm text-label-sm font-bold text-error">Could not confirm booking</p>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">{confirmError}</p>
                    </div>
                  </div>
                )}

                {!confirmed && (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      disabled={submitting || !booking.timeAvailable}
                      onClick={handleConfirm}
                      className="w-full h-14 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-lg hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Icon name="progress_activity" className="text-[20px] animate-spin" />
                          <span>Confirming Appointment…</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Appointment ({naira(booking.payable)})</span>
                          <Icon name="arrow_forward" className="text-[20px]" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={onChat}
                    className="w-full py-3 rounded-xl bg-surface-subtle hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Direct Chat with Reception</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="block w-full text-center font-caption text-caption text-text-secondary hover:text-primary transition-colors py-1"
                  >
                    Cancel &amp; Return to Glow &amp; Serenity catalog
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-tint-blue flex items-center gap-3 shadow-sm">
                <Icon name="support_agent" className="text-primary text-[28px] shrink-0" />
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Need immediate help?</h4>
                  <p className="font-caption text-caption text-text-secondary">
                    Call VEMTAP Concierge at +234 (0) 9 460 2200 for priority booking support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}

function setRouteMessages(onNav: (key: DesktopNavKey) => void) {
  onNav('messages');
}
