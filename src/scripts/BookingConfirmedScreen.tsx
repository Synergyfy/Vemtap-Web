import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';
import { MAP_IMAGE } from './orderData';
import {
  SPA_MERCHANT,
  SPA_SPECIALIST_IMAGE,
  SPA_VOUCHER_CODE,
  formatSpaDuration,
} from './spaBookingData';

interface BookingConfirmedScreenProps {
  refCode: string;
  onBack: () => void;
  onHome: () => void;
  onChat: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function BookingConfirmedScreen({ refCode, onBack, onHome, onChat }: BookingConfirmedScreenProps) {
  const booking = useBooking();
  const [guideOpen, setGuideOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyVoucher = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(SPA_VOUCHER_CODE).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <button
            aria-label="Go Back"
            type="button"
            onClick={onBack}
            className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface hover:text-primary transition-colors"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <h1 className="font-heading-sm text-heading-sm text-on-surface truncate text-center flex-1 px-space-xs">
            Booking Confirmed
          </h1>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Close"
              type="button"
              onClick={onHome}
              className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="close" className="text-[24px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full bg-surface pt-14 pb-safe flex flex-col">
        <div className="flex flex-col w-full px-margin pb-space-2xl space-y-space-lg">
          <div className="relative flex flex-col items-center text-center pt-space-xs">
            <div className="relative flex items-center justify-center w-20 h-20 mb-space-sm">
              <span className="absolute inline-flex h-full w-full rounded-full bg-badge-discount-bg animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-badge-discount-bg shadow-sm">
                <Icon name="check_circle" className="text-[36px] text-badge-discount-text" filled />
              </div>
              <div className="absolute -top-1 -right-1 bg-primary-container text-on-primary text-[10px] font-bold px-space-2xs py-0.5 rounded-full flex items-center shadow-sm">
                <Icon name="verified" className="text-[12px] mr-0.5" /> VIP
              </div>
            </div>
            <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Appointment Confirmed!</h2>
            <div className="flex items-center gap-space-2xs mt-space-2xs">
              <span className="font-heading-sm text-heading-sm text-text-secondary">{SPA_MERCHANT.name}</span>
              <Icon name="verified" className="text-primary text-[18px]" filled />
            </div>
            <div className="flex items-center justify-center gap-space-xs mt-space-xs flex-wrap">
              <span className="font-label-sm text-label-sm text-text-secondary bg-surface-container px-space-sm py-1 rounded-full">
                Booking Ref: <strong className="text-text-primary">#{refCode}</strong>
              </span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-badge-discount-text bg-badge-discount-bg px-space-xs py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
                Booked Just Now
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                <Icon name="calendar_month" className="text-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                  Reserved Time Slot
                </div>
                <div className="font-heading-sm text-heading-sm text-text-primary leading-snug">
                  {booking.day.dateLong}
                </div>
                <div className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1 mt-0.5">
                  <span>{booking.time}</span>
                  <span className="text-text-tertiary">•</span>
                  <span className="font-caption text-caption text-text-secondary">
                    ~{formatSpaDuration(booking.durationMinutes)} duration
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <img
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  alt={booking.therapist.name}
                  src={booking.therapist.image ?? SPA_SPECIALIST_IMAGE}
                />
                <div className="min-w-0">
                  <div className="font-label-sm text-label-sm text-text-secondary">Assigned Specialist</div>
                  <div className="font-label-md text-label-md text-text-primary font-semibold truncate">
                    {booking.therapist.id === 'any' ? 'Amara K. (or next match)' : booking.therapist.name}
                  </div>
                  <div className="font-caption text-caption text-text-tertiary truncate">
                    {booking.therapist.id === 'any' ? 'First available lead specialist' : booking.therapist.role}
                  </div>
                </div>
              </div>
              <Icon name="spa" className="text-primary text-[20px]" />
            </div>
          </div>

          <div className="space-y-space-2xs">
            <div className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider px-space-2xs">
              Appointment Mode
            </div>
            <div className="grid grid-cols-2 gap-space-2xs p-1 bg-surface-container rounded-xl">
              <div className="flex items-center justify-center gap-space-2xs py-space-xs px-space-sm rounded-lg bg-surface-container-lowest shadow-sm text-primary font-label-md text-label-md">
                <Icon name="storefront" className="text-[18px]" />
                <span>In-Salon Visit</span>
              </div>
              <div className="flex items-center justify-center gap-space-2xs py-space-xs px-space-sm rounded-lg text-text-tertiary opacity-70 font-label-sm text-label-sm text-center">
                <Icon name="home_pin" className="text-[16px]" />
                <span className="truncate">Mobile Aesthetic (N/A)</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <span className="font-heading-sm text-heading-sm text-text-primary">Service Breakdown</span>
              <span className="font-caption text-caption text-primary font-medium">
                {booking.services.length + booking.addons.length} Treatments
              </span>
            </div>
            <div className="space-y-space-sm">
              {booking.services.map((service) => (
                <div key={service.id} className="flex items-start justify-between">
                  <div className="min-w-0 pr-space-xs">
                    <div className="font-label-md text-label-md text-text-primary font-medium">{service.name}</div>
                    <div className="font-caption text-caption text-text-secondary">
                      {service.time} mins • {service.desc}
                    </div>
                  </div>
                  <div className="font-label-md text-label-md text-text-primary font-semibold shrink-0">
                    {naira(service.price)}
                  </div>
                </div>
              ))}
              {booking.addons.map((addon) => (
                <div key={addon.id} className="flex items-start justify-between">
                  <div className="min-w-0 pr-space-xs">
                    <div className="font-label-md text-label-md text-text-primary font-medium">{addon.name}</div>
                    <div className="font-caption text-caption text-text-secondary">
                      {addon.minutes} mins add-on • {addon.desc}
                    </div>
                  </div>
                  <div className="font-label-md text-label-md text-text-primary font-semibold shrink-0">
                    {naira(addon.price)}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-badge-discount-bg p-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs min-w-0">
                  <Icon name="local_activity" className="text-badge-discount-text text-[20px]" />
                  <div className="min-w-0">
                    <div className="font-label-sm text-label-sm text-badge-discount-text font-semibold">
                      VEMTAP 20% Voucher Applied
                    </div>
                    <div className="font-caption text-caption text-badge-discount-text">Code: {SPA_VOUCHER_CODE}</div>
                  </div>
                </div>
                <div className="font-label-md text-label-md text-badge-discount-text font-bold shrink-0">
                  -{naira(booking.discount)}
                </div>
              </div>
            </div>
            <div className="bg-surface-tint-blue rounded-xl p-space-md space-y-space-2xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-heading-sm text-heading-sm text-text-primary">Total Payable at Salon</span>
                <span className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold">
                  {naira(booking.payable)}
                </span>
              </div>
              <div className="flex items-center gap-1 font-caption text-caption text-secondary">
                <Icon name="check" className="text-[16px] text-badge-discount-text" />
                <span>₦0 upfront platform charge. Settle at the spa reception after your session.</span>
              </div>
            </div>
          </div>

          <div className="space-y-space-sm">
            <button
              type="button"
              onClick={() => setGuideOpen((open) => !open)}
              className="w-full flex items-center justify-between px-space-2xs select-none"
            >
              <div className="min-w-0 pr-space-xs text-left">
                <div className="flex items-center gap-space-xs">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Arrival &amp; Payment Guide</h3>
                  <span className="font-caption text-caption text-primary bg-surface-container px-2 py-0.5 rounded-full font-medium">
                    4 steps
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Everything you need for a stress-free check-in experience
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary shrink-0">
                <Icon
                  name="expand_more"
                  className={`text-[20px] transition-transform duration-200 ${guideOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {guideOpen && (
              <div className="space-y-space-sm pt-space-2xs">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shrink-0">
                    1
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-heading-sm text-heading-sm text-text-primary">Arrive 10 Mins Early</div>
                    <div className="font-body-md text-body-md text-text-secondary">
                      {SPA_MERCHANT.address}. Valet attendants will greet you at the main entrance for complimentary
                      guest parking.
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shrink-0">
                    2
                  </div>
                  <div className="min-w-0 flex-1 space-y-space-xs">
                    <div className="font-heading-sm text-heading-sm text-text-primary">Show Booking Voucher</div>
                    <div className="font-body-md text-body-md text-text-secondary">
                      Present this confirmation screen or quote your member voucher code at check-in:
                    </div>
                    <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-2 rounded-lg">
                      <span className="font-label-md text-label-md text-text-primary font-mono font-bold tracking-wider">
                        {SPA_VOUCHER_CODE}
                      </span>
                      <button
                        type="button"
                        onClick={copyVoucher}
                        className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:opacity-80 active:scale-95 transition-transform"
                      >
                        <Icon name={copied ? 'check' : 'content_copy'} className="text-[18px]" />
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shrink-0">
                    3
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-heading-sm text-heading-sm text-text-primary">Enjoy Your Pampering</div>
                    <div className="font-body-md text-body-md text-text-secondary">
                      Sip complimentary organic botanical tea in the Serenity Lounge while your specialist prepares
                      your sanitized private suite.
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shrink-0">
                    4
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-heading-sm text-heading-sm text-text-primary">
                      Pay Directly at Reception ({naira(booking.payable)})
                    </div>
                    <div className="font-body-md text-body-md text-text-secondary">
                      Zero online charge on VEMTAP. Settle the discounted {naira(booking.payable)} directly after your
                      session via POS Card Terminal, Cash, or Instant Bank Transfer.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-heading-sm text-heading-sm text-text-primary truncate">{SPA_MERCHANT.name}</div>
                <div className="flex items-center gap-space-xs mt-0.5">
                  <div className="flex items-center text-tertiary font-label-sm text-label-sm font-bold">
                    <Icon name="star" className="text-[16px] text-tertiary-container mr-0.5" filled />
                    <span>{SPA_MERCHANT.rating}</span>
                  </div>
                  <span className="text-text-tertiary">•</span>
                  <span className="font-caption text-caption text-text-secondary">{SPA_MERCHANT.reviews}</span>
                  <span className="text-text-tertiary">•</span>
                  <span className="font-caption text-caption text-text-secondary">
                    {SPA_MERCHANT.distance} (5m drive)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  alt={SPA_MERCHANT.facadeAlt}
                  src={SPA_MERCHANT.facadeImage}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              <button
                type="button"
                className="flex flex-col items-center justify-center py-space-sm px-space-xs bg-surface-container-low rounded-xl active:scale-95 transition-transform hover:bg-surface-container"
              >
                <Icon name="call" className="text-primary text-[22px] mb-1" />
                <span className="font-label-sm text-label-sm text-text-primary font-medium">Direct Call</span>
              </button>
              <button
                type="button"
                onClick={onChat}
                className="relative flex flex-col items-center justify-center py-space-sm px-space-xs bg-surface-container-low rounded-xl active:scale-95 transition-transform hover:bg-surface-container"
              >
                <span className="absolute top-1 right-2 bg-badge-discount-text text-on-error font-caption text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Fast
                </span>
                <Icon name="chat_bubble" className="text-primary text-[22px] mb-1" />
                <span className="font-label-sm text-label-sm text-text-primary font-medium">In-App Chat</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center py-space-sm px-space-xs bg-badge-discount-bg rounded-xl active:scale-95 transition-transform hover:opacity-90"
              >
                <Icon name="forum" className="text-badge-discount-text text-[22px] mb-1" />
                <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold">WhatsApp</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-sm">
              <div
                className="w-full h-36 bg-cover bg-center"
                style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent flex items-end p-space-sm justify-between">
                <div className="text-on-primary min-w-0 pr-space-xs">
                  <div className="font-label-md text-label-md font-semibold truncate">
                    Plot 14 Amazon Street, Maitama Heights
                  </div>
                  <div className="font-caption text-caption text-surface-container-high opacity-90 truncate">
                    Abuja, FCT, Nigeria
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-primary text-on-primary px-space-sm py-1.5 rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-md active:scale-95 transition-transform shrink-0"
                >
                  <Icon name="directions" className="text-[16px]" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <button
              type="button"
              className="flex items-center justify-center gap-space-xs py-space-sm px-space-sm bg-surface-container-lowest rounded-xl shadow-sm text-text-primary font-label-md text-label-md font-semibold active:scale-[0.98] transition-transform"
            >
              <Icon name="event_available" className="text-primary text-[20px]" />
              <span className="truncate">Add to Calendar</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-space-xs py-space-sm px-space-sm bg-surface-container-lowest rounded-xl shadow-sm text-text-primary font-label-md text-label-md font-semibold active:scale-[0.98] transition-transform"
            >
              <Icon name="share" className="text-secondary text-[20px]" />
              <span className="truncate">Share Details</span>
            </button>
          </div>

          <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md pt-space-xs pb-space-xs space-y-space-xs">
            <button
              type="button"
              onClick={onChat}
              className="w-full h-[52px] bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary shadow-md flex items-center justify-center gap-space-xs active:scale-[0.98] transition-transform"
            >
              <Icon name="chat" className="text-[20px]" />
              <span>Track &amp; Chat with Salon</span>
            </button>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={onHome}
                className="font-button-secondary text-button-secondary text-text-secondary hover:text-primary py-space-2xs px-space-md transition-colors flex items-center gap-1"
              >
                <span>Back to Home Discovery</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppScreen>
  );
}
