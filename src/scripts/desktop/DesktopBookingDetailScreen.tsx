import { useRef, useState } from 'react';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import { useBooking } from '../../context/BookingContext';
import { mapEmbedUrl } from '../../hooks/usePublicBusiness';
import { NO_IMAGE } from '../../utils/homeOffer';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopBookingDetailScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  /** Opens the chat with this branch. */
  onChat?: (branchId: string) => void;
  /** The booking to open; otherwise the next upcoming one. */
  bookingRef?: string;
}

export function DesktopBookingDetailScreen({ onNav, onBack, bookingRef, onChat }: DesktopBookingDetailScreenProps) {
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
  const cancelled = appointment?.status === 'cancelled';
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
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
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="orders">
        <div className="w-full bg-surface-canvas min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-space-sm px-6">
          {booking.appointmentsLoading ? (
            <SkeletonGroup label="Loading your booking" className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </SkeletonGroup>
          ) : (
            <>
              <p className="font-label-md text-label-md text-text-primary font-semibold">We couldn’t find this booking.</p>
              <button className="h-11 px-6 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary" onClick={onBack} type="button">
                Back to Activity
              </button>
            </>
          )}
        </div>
      </DesktopPage>
    );
  }

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="orders">
      <div className="w-full bg-surface-canvas min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1 text-text-tertiary font-caption text-caption">
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
                  Home
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li className="flex items-center gap-1">
                <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
                  Orders &amp; Bookings
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
              </li>
              <li aria-current="page" className="font-label-sm text-label-sm text-text-primary">
                Booking #{bookingId}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-caption text-caption font-semibold ${
                  cancelled ? 'bg-error-container text-error' : 'bg-badge-discount-bg text-badge-discount-text'
                }`}
              >
                <Icon name={cancelled ? 'event_busy' : 'verified'} className="text-[15px]" filled />
                <span>{cancelled ? 'Booking Cancelled' : appointment?.status === 'completed' ? 'Completed' : 'Confirmed & Slot Reserved'}</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Booking Details
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                {[merchantName, slotLabel].filter(Boolean).join(' • ')}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface transition-all"
              onClick={onBack}
              type="button"
            >
              <Icon name="arrow_back" className="text-[20px] text-text-secondary" />
              <span>Back to Activity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                        cancelled ? 'bg-error-container text-error' : 'bg-surface-tint-blue text-primary'
                      }`}
                    >
                      <Icon name="calendar_clock" className="text-[22px]" />
                    </div>
                    <div>
                      <span className="font-heading-sm text-heading-sm text-text-primary font-bold block">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="hourglass_top" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Duration</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">{durationLabel || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="pin_drop" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Location</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        {appointment?.merchantAddress ?? ''}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
                  <img alt={merchantName} className="w-14 h-14 rounded-xl object-cover shadow-sm" src={appointment?.merchantImage || NO_IMAGE} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                        {merchantName}
                      </h2>
                    </div>
                    <span className="font-caption text-caption text-text-secondary block">
                      {appointment?.merchantAddress}
                    </span>
                  </div>
                </div>

                <h3 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-3">
                  Reserved Services
                </h3>
                <ul className="divide-y divide-border-subtle">
                  {(appointment?.serviceNames ?? []).map((name) => (
                    <li key={name} className="flex items-start justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <span className="font-body-lg text-body-lg text-text-primary block">{name}</span>
                        <span className="font-caption text-caption text-text-tertiary">{durationLabel}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {payable > 0 ? (
                  <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-text-primary">Pay at the business</span>
                    <span className="font-heading-lg text-heading-lg font-bold text-text-primary">₦{payable.toLocaleString('en-US')}</span>
                  </div>
                ) : null}
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-surface-tint-blue">
                  <Icon name="info" className="text-[17px] text-primary shrink-0 mt-0.5" />
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Settled directly with the business on arrival.
                  </p>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                    Verification Pass
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue transition-colors text-left"
                    onClick={() => copyValue(bookingId, 'Booking reference')}
                    type="button"
                  >
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Booking Reference</span>
                      <span className="font-mono text-heading-sm text-heading-sm font-bold text-text-primary">
                        #{bookingId}
                      </span>
                    </div>
                    <Icon
                      name={copied === bookingId ? 'check' : 'content_copy'}
                      className="text-[20px] text-primary"
                    />
                  </button>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-3 leading-relaxed">
                  Show this reference at the business to confirm your slot.
                </p>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="policy" className="text-[20px] text-text-secondary" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Change of Plans</h2>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed mb-4">
                  Cancel here if you can’t make it. The business’s own terms apply to late changes.
                </p>
                {cancelled ? (
                  <button
                    className="px-5 h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2"
                    onClick={() => onNav('discover')}
                    type="button"
                  >
                    <Icon name="event" className="text-[18px]" />
                    <span>Book a New Slot</span>
                  </button>
                ) : appointment?.status === 'confirmed' ? (
                  <button
                    className="px-5 h-11 rounded-xl bg-error-container text-error font-button-secondary text-button-secondary hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    onClick={() => setConfirmOpen(true)}
                    type="button"
                  >
                    <Icon name="event_busy" className="text-[18px]" />
                    <span>Cancel Booking</span>
                  </button>
                ) : null}
              </section>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-surface-canvas rounded-2xl shadow-md overflow-hidden">
                <div className="relative h-48 bg-surface-container">
                  {mapUrl ? <iframe title={`Map of ${merchantName}`} className="w-full h-full" src={mapUrl} loading="lazy" /> : null}
                  {directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface-canvas text-primary font-label-sm text-label-sm font-bold shadow-sm"
                    >
                      <Icon name="near_me" className="text-[15px]" />
                      <span>Open in Maps</span>
                    </a>
                  ) : null}
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Icon name="location_on" className="text-[18px] text-primary" />
                    <span className="font-label-sm text-label-sm text-text-primary">
                      {appointment?.merchantAddress}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                      onClick={() => (onChat && appointment.branchId ? onChat(appointment.branchId) : onNav('messages'))}
                      type="button"
                    >
                      <Icon name="chat" className="text-[18px]" />
                      <span>Message Business</span>
                    </button>
                    <a
                      href={`tel:${appointment?.merchantPhone ?? ''}`}
                      className="h-11 rounded-xl bg-surface-subtle text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface-tint-blue transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Icon name="call" className="text-[18px]" />
                      <span>Call Business</span>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-surface-canvas rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error mb-3 mx-auto">
              <Icon name="event_busy" className="text-[26px]" />
            </div>
            <h3 className="font-heading-md text-heading-md text-text-primary text-center">Cancel this booking?</h3>
            <p className="font-body-md text-body-md text-text-secondary text-center mt-2 leading-relaxed">
              Your slot on {slotLabel} will be released. You can rebook anytime, subject to availability.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                className="h-12 rounded-xl bg-error text-on-error font-button-primary text-button-primary flex items-center justify-center gap-2"
                onClick={() => void confirmCancel()}
                type="button"
              >
                <Icon name="event_busy" className="text-[19px]" />
                <span>Yes, Cancel Booking</span>
              </button>
              <button
                className="h-12 rounded-xl bg-surface-subtle text-text-primary font-button-secondary text-button-secondary flex items-center justify-center hover:bg-surface-container-high transition-colors"
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                Keep My Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span className="font-label-md text-label-md">{toast}</span>
        </div>
      )}
    </DesktopPage>
  );
}
