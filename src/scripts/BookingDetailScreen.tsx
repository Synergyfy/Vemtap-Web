import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';

interface BookingDetailScreenProps {
  onBack: () => void;
  onReschedule: () => void;
  onChat: () => void;
}

const SPA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBO8mzoeLehe5p8uSLXesvatMxVjYR42ABeOPmuFYI827KTEwRO_SPbscYV7f85BXGejWcdoe2uaUHATPe7YX9Rznp1ckMjgg-u7m-vBxw0Z67DFpm0ufm4rg1v1fGgqvCCskKZshUlIKCtKB50TjOwwucnjYkGAVmSwO0YgV_OxiLRsYEJ5-ds90djDhdE4ldxF1jZdkv2QhqFByRPUAEcfTeF26LVqRB4KKWSUseg';
const SPA_ALT = 'Serene luxury day spa treatment room with botanical accents and soft diffuse daylight in Abuja';

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRzuuVi9eFa4IfiKY-0CLXnUqZT2sbZNosW0fYczr-35iaT8YS48jMPhxX5FhnlpIT0M6U61-52cj6dPjBQzinsAIKVmlZpDUKfvnY7-G3LByd50m-xoQvFZg9A_dkudzO9jz0LRWmtKBN1qsOyrPwhv2R0EFtDw9bUTJM-yJ2xFm00pWt8sgDfxXVcbelWtpObOkpjajIiqRQK8pSgKgT2aPd465gP81ZRfUsDx5-0GtlsxHiafGQhg';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Maitama%20Heights%2C%20Abuja';
const BOOKING_REF = 'VT-BK-44218';
const BOOKING_CODE = 'VT-SPA8821';

const SERVICES = [
  { name: 'Deep Hydration Radiance Facial', meta: '60 mins • Amara K.', price: '₦17,000' },
  { name: 'Gel Manicure', meta: '45 mins • Studio 3', price: '₦12,000' },
];

export function BookingDetailScreen({ onBack, onReschedule, onChat }: BookingDetailScreenProps) {
  const booking = useBooking();
  /** Latest real appointment record (BUG-025); falls back to the demo booking. */
  const appointment = booking.appointments.find((item) => item.status === 'confirmed') ?? booking.appointments[0];
  const bookingRef = appointment?.ref ?? BOOKING_REF;
  const slotLabel = appointment ? `${appointment.dateShort} • ${appointment.time}` : 'Thu, Oct 17 • 1:15 PM';
  const durationLabel = appointment ? `~${appointment.durationLabel}` : '~1h 45m';
  const servicesList = appointment
    ? appointment.serviceNames.map((name) => ({ name, meta: appointment.durationLabel, price: '' }))
    : SERVICES;
  const subtotal = appointment?.servicesSubtotal ?? 29000;
  const discount = appointment?.discount ?? 5000;
  const payable = appointment?.payable ?? 24000;
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [inCalendar, setInCalendar] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelledLocal, setCancelledLocal] = useState(false);
  const cancelled = cancelledLocal || appointment?.status === 'cancelled';

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

  const toggleCalendar = () => {
    setInCalendar((current) => {
      showToast(current ? 'Removed from your calendar' : 'Added to your calendar');
      return !current;
    });
  };

  const confirmCancel = () => {
    setConfirmOpen(false);
    setCancelledLocal(true);
    if (appointment) booking.cancelAppointment(appointment.ref);
    showToast('Booking cancelled — your slot was released');
  };

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
            <span className="font-mono font-caption text-caption text-text-tertiary">#{bookingRef}</span>
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
                'Your slot was released. Contact the spa anytime to rebook.'
              ) : (
                <>
                  Happening <span className="font-semibold text-text-primary">{slotLabel}</span> • Glow &amp; Serenity Spa
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
                  Duration {durationLabel} • Arrive 15 minutes early
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleCalendar}
              aria-pressed={inCalendar}
              className={`shrink-0 flex items-center gap-1 px-space-sm h-9 rounded-full font-label-sm text-label-sm font-semibold transition-colors ${
                inCalendar
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-surface-container text-primary hover:bg-surface-tint-blue'
              }`}
            >
              <Icon name={inCalendar ? 'check' : 'event'} className="text-[16px]" />
              <span>{inCalendar ? 'Added' : 'Add to Calendar'}</span>
            </button>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="relative shrink-0">
              <img className="w-12 h-12 rounded-full object-cover shadow-sm" alt={SPA_ALT} src={SPA_IMG} />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                  Glow &amp; Serenity Spa &amp; Salon
                </h2>
                <Icon name="verified" filled className="text-primary text-[16px] shrink-0" />
              </div>
              <span className="font-caption text-caption text-text-secondary truncate">
                12 Aminu Kano Crescent, Maitama • 1.4 km
              </span>
              <span className="font-caption text-caption text-badge-discount-text">Spa desk open until 8:00 PM</span>
            </div>
          </div>
          <div className="bg-surface-subtle rounded-lg p-space-xs flex items-center gap-space-xs">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
              AK
            </div>
            <div className="min-w-0">
              <span className="font-label-sm text-label-sm font-semibold text-text-primary block">
                Amara K. — Lead Aesthetician
              </span>
              <span className="font-caption text-caption text-text-secondary">
                Your assigned specialist for both services
              </span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
            Reserved Services
          </h2>
          <ul className="flex flex-col gap-space-sm">
            {servicesList.map((service) => (
              <li key={service.name} className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <span className="font-body-md text-body-md text-text-primary block truncate">{service.name}</span>
                  <span className="font-caption text-caption text-text-tertiary">{service.meta}</span>
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                  {service.price}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-outline-variant/40 pt-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
              <span className="font-body-md text-body-md text-text-primary">₦{subtotal.toLocaleString('en-US')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary flex items-center gap-1">
                <Icon name="confirmation_number" className="text-[15px] text-badge-discount-text" />
                VEMTAP Deal Applied
              </span>
              <span className="font-body-md text-body-md text-badge-discount-text font-semibold">
                −₦{discount.toLocaleString('en-US')}
              </span>
            </div>
            <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/40">
              <span className="font-label-md text-label-md font-bold text-text-primary">Pay at the spa</span>
              <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                ₦{payable.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-surface-tint-blue rounded-lg px-space-sm py-space-xs">
            <Icon name="info" className="text-[15px] text-primary flex-shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              Settled directly with the spa on arrival — no platform middleman fees. VEMTAP protects the discounted
              rate.
            </p>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Verification Pass
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
              <Icon name="shield" className="text-[13px]" filled />
              NDPR Protected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            <button
              type="button"
              onClick={() => copyValue(bookingRef, 'Booking reference')}
              className="bg-surface-container-low rounded-lg px-space-sm py-space-xs flex flex-col items-start gap-0.5 hover:bg-surface-container transition-colors"
            >
              <span className="font-caption text-caption text-text-tertiary">Booking Reference</span>
              <span className="flex items-center gap-1 font-mono font-label-md text-label-md font-bold text-text-primary">
                #{bookingRef}
                <Icon name={copied === bookingRef ? 'check' : 'content_copy'} className="text-[14px] text-primary" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => copyValue(BOOKING_CODE, 'Check-in code')}
              className="bg-surface-container-low rounded-lg px-space-sm py-space-xs flex flex-col items-start gap-0.5 hover:bg-surface-container transition-colors"
            >
              <span className="font-caption text-caption text-text-tertiary">Check-in Code</span>
              <span className="flex items-center gap-1 font-mono font-label-md text-label-md font-bold text-text-primary">
                {BOOKING_CODE}
                <Icon name={copied === BOOKING_CODE ? 'check' : 'content_copy'} className="text-[14px] text-primary" />
              </span>
            </button>
          </div>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Present either code at the spa reception to confirm your slot and locked-in deal price.
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <div className="relative h-36">
            <img className="w-full h-full object-cover" alt="Map of Maitama Heights, Abuja" src={MAP_IMG} />
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-space-sm h-8 rounded-full bg-surface-canvas/95 text-primary font-label-sm text-label-sm font-bold shadow-sm hover:bg-surface-canvas"
            >
              <Icon name="near_me" className="text-[15px]" />
              <span>Open in Maps</span>
            </a>
          </div>
          <div className="p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="location_on" className="text-[18px] text-primary shrink-0" />
              <span className="font-label-sm text-label-sm text-text-primary truncate">
                Maitama Heights, 3rd Floor, Abuja
              </span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={onChat}
                className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
              >
                <Icon name="chat" className="text-[18px]" />
                <span>Concierge Chat</span>
              </button>
              <a
                href="tel:+2348035550192"
                className="h-11 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
              >
                <Icon name="call" className="text-[18px]" />
                <span>Call Spa</span>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name="policy" className="text-[18px] text-text-secondary" />
            <h2 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Cancellation Policy
            </h2>
          </div>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Free cancellation or reschedule up to <span className="font-semibold text-text-primary">6 hours</span>{' '}
            before your appointment. Later changes may incur a 20% booking fee charged by the spa.
          </p>
          {cancelled ? (
            <button
              type="button"
              onClick={onReschedule}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
            >
              <Icon name="event" className="text-[18px]" />
              <span>Book a New Slot</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={onReschedule}
                className="h-11 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
              >
                <Icon name="event" className="text-[18px]" />
                <span>Reschedule</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="h-11 rounded-xl bg-error-container text-error font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <Icon name="event_busy" className="text-[18px]" />
                <span>Cancel Booking</span>
              </button>
            </div>
          )}
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
                onClick={confirmCancel}
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
