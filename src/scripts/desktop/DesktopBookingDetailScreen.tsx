import { useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopBookingDetailScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const SPA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBO8mzoeLehe5p8uSLXesvatMxVjYR42ABeOPmuFYI827KTEwRO_SPbscYV7f85BXGejWcdoe2uaUHATPe7YX9Rznp1ckMjgg-u7m-vBxw0Z67DFpm0ufm4rg1v1fGgqvCCskKZshUlIKCtKB50TjOwwucnjYkGAVmSwO0YgV_OxiLRsYEJ5-ds90djDhdE4ldxF1jZdkv2QhqFByRPUAEcfTeF26LVqRB4KKWSUseg';
const SPA_ALT = 'Serene luxury day spa treatment room with botanical accents and soft diffuse daylight in Abuja';

const MAP_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRzuuVi9eFa4IfiKY-0CLXnUqZT2sbZNosW0fYczr-35iaT8YS48jMPhxX5FhnlpIT0M6U61-52cj6dPjBQzinsAIKVmlZpDUKfvnY7-G3LByd50m-xoQvFZg9A_dkudzO9jz0LRWmtKBN1qsOyrPwhv2R0EFtDw9bUTJM-yJ2xFm00pWt8sgDfxXVcbelWtpObOkpjajIiqRQK8pSgKgT2aPd465gP81ZRfUsDx5-0GtlsxHiafGQhg';
const MAP_ALT = 'Map showing Maitama Heights location in Abuja';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Maitama%20Heights%2C%20Abuja';
const BOOKING_REF = 'VT-BK-44218';
const BOOKING_CODE = 'VT-SPA8821';

const SERVICES = [
  { name: 'Deep Hydration Radiance Facial', meta: '60 mins • Amara K. (Lead Aesthetician)', price: '₦17,000' },
  { name: 'Gel Manicure', meta: '45 mins • Studio 3', price: '₦12,000' },
];

export function DesktopBookingDetailScreen({ onNav, onBack }: DesktopBookingDetailScreenProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [inCalendar, setInCalendar] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
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

  const toggleCalendar = () => {
    setInCalendar((current) => {
      showToast(current ? 'Removed from your calendar' : 'Added to your calendar');
      return !current;
    });
  };

  const confirmCancel = () => {
    setConfirmOpen(false);
    setCancelled(true);
    showToast('Booking cancelled — your slot was released');
  };

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
                Booking #{BOOKING_REF}
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
                <span>{cancelled ? 'Booking Cancelled' : 'Confirmed & Slot Reserved • Happening Tomorrow'}</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Booking Details
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Glow &amp; Serenity Spa &amp; Salon • Thu, Oct 17 • 1:15 PM WAT
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
                        Thu, Oct 17 • 1:15 PM
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Duration ~1h 45m • Arrive by 1:00 PM for consultation
                      </span>
                    </div>
                  </div>
                  <button
                    aria-pressed={inCalendar}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-label-sm text-label-sm font-semibold transition-colors ${
                      inCalendar
                        ? 'bg-badge-discount-bg text-badge-discount-text'
                        : 'bg-surface-subtle text-primary hover:bg-surface-tint-blue'
                    }`}
                    onClick={toggleCalendar}
                    type="button"
                  >
                    <Icon name={inCalendar ? 'check' : 'event'} className="text-[17px]" />
                    <span>{inCalendar ? 'Added to Calendar' : 'Add to Calendar'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="badge" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Assigned Specialist</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">Amara K.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="hourglass_top" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Duration</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">~1h 45m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-primary">
                      <Icon name="pin_drop" className="text-[20px]" />
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Location</span>
                      <span className="font-label-md text-label-md text-text-primary font-semibold">
                        Maitama Heights, 3rd Floor
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
                  <img alt={SPA_ALT} className="w-14 h-14 rounded-xl object-cover shadow-sm" src={SPA_IMG} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold truncate">
                        Glow &amp; Serenity Spa &amp; Salon
                      </h2>
                      <Icon name="verified" filled className="text-primary text-[16px]" />
                    </div>
                    <span className="font-caption text-caption text-text-secondary block">
                      12 Aminu Kano Crescent, Maitama • 1.4 km
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-semibold">
                      Spa desk open until 8:00 PM
                    </span>
                  </div>
                </div>

                <h3 className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider mb-3">
                  Reserved Services
                </h3>
                <ul className="divide-y divide-border-subtle">
                  {SERVICES.map((service) => (
                    <li key={service.name} className="flex items-start justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <span className="font-body-lg text-body-lg text-text-primary block">{service.name}</span>
                        <span className="font-caption text-caption text-text-tertiary">{service.meta}</span>
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-text-primary shrink-0">
                        {service.price}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-text-secondary">Subtotal</span>
                    <span className="font-body-md text-body-md text-text-primary">₦29,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-text-secondary flex items-center gap-1.5">
                      <Icon name="confirmation_number" className="text-[16px] text-badge-discount-text" />
                      VEMTAP Deal Applied
                    </span>
                    <span className="font-body-md text-body-md text-badge-discount-text font-semibold">−₦5,000</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="font-label-md text-label-md font-bold text-text-primary">Pay at the spa</span>
                    <span className="font-heading-lg text-heading-lg font-bold text-text-primary">₦24,000</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-surface-tint-blue">
                  <Icon name="info" className="text-[17px] text-primary shrink-0 mt-0.5" />
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Settled directly with the spa on arrival — no platform middleman fees. VEMTAP protects the
                    discounted rate and encrypts this appointment under NDPR standards.
                  </p>
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                    Verification Pass
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <Icon name="shield" className="text-[15px]" filled />
                    <span>NDPR Protected</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue transition-colors text-left"
                    onClick={() => copyValue(BOOKING_REF, 'Booking reference')}
                    type="button"
                  >
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Booking Reference</span>
                      <span className="font-mono text-heading-sm text-heading-sm font-bold text-text-primary">
                        #{BOOKING_REF}
                      </span>
                    </div>
                    <Icon
                      name={copied === BOOKING_REF ? 'check' : 'content_copy'}
                      className="text-[20px] text-primary"
                    />
                  </button>
                  <button
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-subtle hover:bg-surface-tint-blue transition-colors text-left"
                    onClick={() => copyValue(BOOKING_CODE, 'Check-in code')}
                    type="button"
                  >
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Check-in Code</span>
                      <span className="font-mono text-heading-sm text-heading-sm font-bold text-text-primary">
                        {BOOKING_CODE}
                      </span>
                    </div>
                    <Icon
                      name={copied === BOOKING_CODE ? 'check' : 'content_copy'}
                      className="text-[20px] text-primary"
                    />
                  </button>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-3 leading-relaxed">
                  Present either code at the spa reception to confirm your slot and locked-in deal price.
                </p>
              </section>

              <section className="bg-surface-canvas rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="policy" className="text-[20px] text-text-secondary" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-bold">Cancellation Policy</h2>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed mb-4">
                  Free cancellation or reschedule up to <span className="font-semibold text-text-primary">6 hours</span>{' '}
                  before your appointment. Later changes may incur a 20% booking fee charged by the spa.
                </p>
                {cancelled ? (
                  <button
                    className="px-5 h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2"
                    onClick={() => onNav('spa-booking')}
                    type="button"
                  >
                    <Icon name="event" className="text-[18px]" />
                    <span>Book a New Slot</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-5 h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2"
                      onClick={() => onNav('spa-booking')}
                      type="button"
                    >
                      <Icon name="event" className="text-[18px]" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      className="px-5 h-11 rounded-xl bg-error-container text-error font-button-secondary text-button-secondary hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                      onClick={() => setConfirmOpen(true)}
                      type="button"
                    >
                      <Icon name="event_busy" className="text-[18px]" />
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-surface-canvas rounded-2xl shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img alt={MAP_ALT} className="w-full h-full object-cover" src={MAP_IMG} />
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-surface-canvas/95 text-primary font-label-sm text-label-sm font-bold shadow-sm hover:bg-surface-canvas"
                  >
                    <Icon name="near_me" className="text-[15px]" />
                    <span>Open in Maps</span>
                  </a>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Icon name="location_on" className="text-[18px] text-primary" />
                    <span className="font-label-sm text-label-sm text-text-primary">
                      Maitama Heights, 3rd Floor, Abuja
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                      onClick={() => onNav('messages')}
                      type="button"
                    >
                      <Icon name="chat" className="text-[18px]" />
                      <span>Concierge Chat</span>
                    </button>
                    <a
                      href="tel:+2348035550192"
                      className="h-11 rounded-xl bg-surface-subtle text-primary font-button-secondary text-button-secondary shadow-sm hover:bg-surface-tint-blue transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Icon name="call" className="text-[18px]" />
                      <span>Call Spa</span>
                    </a>
                  </div>
                </div>
              </section>

              <section className="bg-surface-tint-blue rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm font-semibold text-primary uppercase tracking-wider">
                    Booking at a Glance
                  </span>
                  <Icon name="event_available" className="text-primary text-[20px]" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary">Confirmation</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">GS-4829</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary">Specialist</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">Amara K.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary">Arrival window</span>
                    <span className="font-label-sm text-label-sm text-text-primary font-semibold">12:45 – 1:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-text-secondary">Deal saving</span>
                    <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">−₦5,000</span>
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
              Your slot with Amara K. on Thu, Oct 17 at 1:15 PM will be released. You can rebook anytime, subject to
              availability.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                className="h-12 rounded-xl bg-error text-on-error font-button-primary text-button-primary flex items-center justify-center gap-2"
                onClick={confirmCancel}
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
