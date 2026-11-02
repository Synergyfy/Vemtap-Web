import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { mapEmbedUrl } from '../hooks/usePublicBusiness';
import { NO_IMAGE } from '../utils/homeOffer';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';

interface BookingDetailScreenProps {
  onBack: () => void;
  onBookAgain: () => void;
  /** The booking to open; otherwise the next upcoming one. */
  bookingRef?: string;
  /** Opens the chat with this branch. */
  onChat: (branchId?: string) => void;
}

export function BookingDetailScreen({ onBack, onBookAgain, onChat, bookingRef }: BookingDetailScreenProps) {
  const booking = useBooking();
  const appointment = (bookingRef ? booking.appointmentByRef(bookingRef) : undefined) ?? booking.appointments.find((item) => item.status === 'confirmed') ?? booking.appointments[0];
  const bookingId = appointment?.ref ?? '';
  const slotLabel = appointment ? [appointment.dateShort, appointment.time].filter(Boolean).join(' • ') : '';
  const durationLabel = appointment?.durationLabel ?? '';
  const merchantName = appointment?.merchantName ?? '';
  const payable = appointment?.payable ?? 0;
  const hasPoint = appointment?.merchantLatitude != null && appointment.merchantLongitude != null;
  const directionsUrl = hasPoint
    ? `https://www.google.com/maps/search/?api=1&query=${appointment.merchantLatitude},${appointment.merchantLongitude}`
    : appointment?.merchantAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.merchantAddress)}`
      : null;
  const mapUrl = mapEmbedUrl(appointment?.merchantLatitude ?? null, appointment?.merchantLongitude ?? null);
  const day = appointment?.dateISO.slice(0, 10).replace(/-/g, '') ?? '';
  const calendarUrl = appointment
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${appointment.serviceNames.join(' & ')} at ${merchantName}`)}&dates=${day}/${day}&details=${encodeURIComponent(`Booking ${bookingId} at ${appointment.time}`)}`
    : '';
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelled = appointment?.status === 'cancelled';

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const copyValue = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(value);
    showToast(`${label} copied: ${value}`);
    window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 2000);
  };

  const confirmCancel = async () => {
    setConfirmOpen(false);
    if (!appointment) return;
    try {
      await booking.cancelAppointment(appointment.ref);
      showToast('Booking cancelled — your slot was released');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'This booking couldn’t be cancelled. Please try again.');
    }
  };

  if (!appointment) {
    return (
      <AppScreen>
        <div className="px-margin pt-10 flex flex-col gap-space-sm items-center text-center">
          {booking.appointmentsLoading ? (
            <SkeletonGroup label="Loading your booking" className="w-full space-y-3">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-52 w-full rounded-xl" />
            </SkeletonGroup>
          ) : (
            <>
              <p className="font-label-md text-label-md text-text-primary font-semibold">We couldn’t find this booking.</p>
              <button type="button" onClick={onBack} className="h-11 px-6 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary">
                Back
              </button>
            </>
          )}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-space-sm px-margin py-space-xs">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="p-space-2xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center -ml-space-2xs"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Booking Details</h1>
            <span className="font-mono font-caption text-caption text-text-tertiary">#{bookingId}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <section
          className={`rounded-xl p-space-md flex items-start gap-space-sm ${
            cancelled ? 'bg-error-container/40' : 'bg-surface-tint-blue'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              cancelled ? 'bg-error text-on-error' : 'bg-badge-discount-bg text-badge-discount-text'
            }`}
          >
            <Icon name={cancelled ? 'event_busy' : 'verified'} className="text-[22px]" filled />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={`font-label-md text-label-md font-bold block ${cancelled ? 'text-error' : 'text-badge-discount-text'}`}
            >
              {cancelled ? 'Booking Cancelled' : 'Confirmed & Slot Reserved'}
            </span>
            <p className="font-body-md text-body-md text-text-secondary mt-0.5">
              {cancelled ? (
                'Your slot was released. Contact the business anytime to rebook.'
              ) : (
                <>
                  Happening <span className="font-semibold text-text-primary">{slotLabel}</span> • {merchantName}
                </>
              )}
            </p>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon name="calendar_clock" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <span className="font-label-md text-label-md font-semibold text-text-primary block">
                  {slotLabel}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {durationLabel}
                </span>
              </div>
            </div>
            {calendarUrl ? (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-label-sm text-label-sm font-semibold bg-surface-subtle text-primary hover:bg-surface-tint-blue transition-colors"
                  >
                    <Icon name="event" className="text-[17px]" />
                    <span>Add to Calendar</span>
                  </a>
                ) : null}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img className="w-12 h-12 rounded-full object-cover shadow-sm" alt={merchantName} src={appointment?.merchantImage || NO_IMAGE} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                  {merchantName}
                </h2>
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
                {appointment?.merchantAddress}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
            Reserved Services
          </h2>
          <ul className="flex flex-col gap-space-sm">
            {(appointment?.serviceNames ?? []).map((name) => (
              <li key={name} className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-text-primary block truncate">{name}</span>
                  <span className="font-caption text-caption text-text-tertiary">{durationLabel}</span>
                </div>
              </li>
            ))}
          </ul>
          {payable > 0 ? (
            <div className="border-t border-outline-variant/40 pt-space-xs flex items-center justify-between">
              <span className="font-label-md text-label-md font-bold text-text-primary">Pay at the business</span>
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">₦{payable.toLocaleString('en-US')}</span>
            </div>
          ) : null}
          <div className="flex items-start gap-1.5 bg-surface-tint-blue rounded-lg px-space-sm py-space-xs">
            <Icon name="info" className="text-[15px] text-primary flex-shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Settled directly with the business on arrival.
            </p>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Verification Pass
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-space-xs">
            <button
              type="button"
              onClick={() => copyValue(bookingId, 'Booking reference')}
              className="bg-surface-container-low rounded-lg px-space-sm py-space-xs flex flex-col items-start gap-0.5 hover:bg-surface-container transition-colors"
            >
              <span className="font-caption text-caption text-text-tertiary">Booking Reference</span>
              <span className="flex items-center gap-1 font-mono font-label-md text-label-md font-bold text-text-primary">
                #{bookingId}
                <Icon name={copied === bookingId ? 'check' : 'content_copy'} className="text-[14px] text-primary" />
              </span>
            </button>
          </div>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Show this reference at the business to confirm your slot.
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="relative h-36 bg-surface-container">
            {mapUrl ? <iframe title={`Map of ${merchantName}`} className="w-full h-full" src={mapUrl} loading="lazy" /> : null}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2 right-2 inline-flex items-center gap-1 px-space-sm h-8 rounded-full bg-surface-canvas text-primary font-label-sm text-label-sm font-bold shadow-sm"
              >
                <Icon name="near_me" className="text-[15px]" />
                <span>Open in Maps</span>
              </a>
            ) : null}
          </div>
          <div className="p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="location_on" className="text-[18px] text-primary shrink-0" />
              <span className="font-label-sm text-label-sm text-text-primary truncate">
                {appointment?.merchantAddress}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={() => onChat(appointment.branchId)}
                className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
              >
                <Icon name="chat" className="text-[18px]" />
                <span>Message Business</span>
              </button>
              <a
                href={`tel:${appointment?.merchantPhone ?? ''}`}
                className="h-11 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
              >
                <Icon name="call" className="text-[18px]" />
                <span>Call Business</span>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name="policy" className="text-[18px] text-text-secondary" />
            <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Change of Plans
            </h2>
          </div>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Cancel here if you can’t make it. The business’s own terms apply to late changes.
          </p>
          {cancelled ? (
            <button
              type="button"
              onClick={onBookAgain}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
            >
              <Icon name="event" className="text-[18px]" />
              <span>Book a New Slot</span>
            </button>
          ) : appointment?.status === 'confirmed' ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="h-11 rounded-xl bg-error-container text-error font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              <Icon name="event_busy" className="text-[18px]" />
              <span>Cancel Booking</span>
            </button>
          ) : null}
        </section>
      </main>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-surface-canvas rounded-t-3xl sm:rounded-3xl p-space-lg shadow-2xl flex flex-col">
            <div className="w-10 h-1 rounded-full bg-outline-variant/60 mb-space-md sm:mx-auto" />
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error mb-space-xs sm:mx-auto">
              <Icon name="event_busy" className="text-[26px]" />
            </div>
            <h3 className="font-heading-md text-heading-md text-text-primary text-center">Cancel this booking?</h3>
            <p className="font-body-md text-body-md text-text-secondary text-center mt-space-xs leading-relaxed">
              Your appointment on {slotLabel} will be released. You can rebook anytime, subject to availability.
            </p>
            <div className="flex flex-col gap-space-xs mt-space-md">
              <button
                type="button"
                onClick={() => void confirmCancel()}
                className="h-12 rounded-xl bg-error text-on-error font-button-primary text-button-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Icon name="event_busy" className="text-[19px]" />
                <span>Yes, Cancel Booking</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="h-12 rounded-xl bg-surface-container text-text-primary font-button-secondary text-button-secondary flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                Keep My Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
