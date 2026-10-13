import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useBooking } from '../context/BookingContext';
import {
  SPA_ADDONS,
  SPA_MERCHANT,
  SPA_THERAPISTS,
  formatSpaDuration,
  serviceSteps,
  type SpaCatalogueService,
} from './spaBookingData';

interface ServiceDetailScreenProps {
  service: SpaCatalogueService;
  onBack: () => void;
  onBook: () => void;
}

const naira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export function ServiceDetailScreen({ service, onBack, onBook }: ServiceDetailScreenProps) {
  const booking = useBooking();
  const [toast, setToast] = useState<string | null>(null);
  const steps = serviceSteps(service);
  const addonTotal = booking.addons.reduce((total, addon) => total + addon.price, 0);
  const total = service.price + addonTotal;
  const listPrice = service.was ?? Math.round((service.price / (1 - 0.2)) / 500) * 500;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              aria-label="Navigate back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-1 flex items-center justify-center text-on-surface hover:text-primary transition-colors active:scale-95"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface tracking-tight truncate max-w-[220px]">
              Service Detail
            </h1>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label="Share service"
              type="button"
              onClick={() => showToast('Service link copied to clipboard')}
              className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon name="share" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface">
        <div className="flex flex-col w-full pb-32">
          <div className="relative w-full aspect-[4/3] bg-surface-container-high overflow-hidden">
            <img className="w-full h-full object-cover" alt={service.imageAlt} src={service.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/25" />
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm shadow-sm">
                <Icon name="spa" className="text-[16px]" />
                {service.categoryLabel}
              </span>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
              <span className="w-6 h-1.5 rounded-full bg-surface-container-lowest" />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest/50" />
            </div>
          </div>

          <div className="px-margin flex flex-col gap-space-lg -mt-3 relative z-20">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="inline-flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                <Icon name="storefront" className="text-primary text-[18px]" />
                <span className="truncate font-button-secondary text-button-secondary text-text-primary">
                  {SPA_MERCHANT.name}
                </span>
                <span className="text-text-tertiary">•</span>
                <span className="text-text-secondary whitespace-nowrap">
                  {SPA_MERCHANT.shortLocation} ({SPA_MERCHANT.distance})
                </span>
              </div>
              <h2 className="font-heading-sm text-heading-sm text-on-surface tracking-tight leading-tight">
                {service.name}
              </h2>
              <div className="flex items-center flex-wrap gap-space-xs pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
                  <Icon name="schedule" className="text-[16px] text-text-secondary" />
                  {service.time} Mins
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-subtle text-on-surface font-label-sm text-label-sm">
                  <Icon name="star" className="text-[16px] text-amber-500" filled />
                  <span className="font-button-secondary text-button-secondary">4.9</span>
                  <span className="text-text-tertiary">(96 reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary font-label-sm text-label-sm">
                  <Icon name="group" className="text-[16px] text-text-secondary" />
                  Unisex
                </span>
              </div>
              <div className="pt-2 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading-sm text-heading-sm text-primary tracking-tight font-bold">
                    {naira(service.price)}
                  </span>
                  <span className="font-body-md text-body-md text-text-tertiary line-through">
                    {naira(listPrice)}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                  Save 20% with VEMTAP
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-on-surface">What's Included</h3>
                <span className="text-primary font-label-sm text-label-sm">{steps.length} Steps Protocol</span>
              </div>
              <div className="relative flex flex-col gap-space-md pl-2">
                <div className="absolute left-[19px] top-3 bottom-5 w-0.5 bg-surface-container-high" />
                {steps.map((step, index) => (
                  <div key={step.title} className="relative flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm shrink-0 z-10 shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-button-secondary text-button-secondary text-on-surface">{step.title}</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Enhance Your Session</h3>
                <span className="font-caption text-caption text-text-tertiary">Optional</span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant -mt-1">
                Tailor your appointment with customized aesthetic boosters.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                {SPA_ADDONS.map((addon) => {
                  const checked = booking.addons.some((item) => item.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      className="flex items-start justify-between p-3 rounded-xl bg-surface-container-low cursor-pointer transition-all duration-150 active:scale-[0.99] select-none"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          className="addon-toggle mt-1 w-5 h-5 rounded accent-primary cursor-pointer"
                          type="checkbox"
                          checked={checked}
                          onChange={() => booking.toggleAddon(addon.id)}
                        />
                        <div className="flex flex-col">
                          <span className="font-button-secondary text-button-secondary text-on-surface">{addon.name}</span>
                          <span className="font-caption text-caption text-on-surface-variant">{addon.desc}</span>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md text-primary font-semibold whitespace-nowrap pl-2">
                        +{naira(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Therapist Selection</h3>
                <span className="font-caption text-caption text-text-secondary">Instant match</span>
              </div>
              <div className="flex gap-space-sm overflow-x-auto pb-1 pt-1 -mx-2 px-2 no-scrollbar">
                {SPA_THERAPISTS.map((therapist) => {
                  const selected = booking.therapist.id === therapist.id;
                  return (
                    <button
                      key={therapist.id}
                      type="button"
                      onClick={() => booking.setTherapist(therapist.id)}
                      className={`therapist-btn flex flex-col items-center p-3 rounded-xl text-center min-w-[130px] shrink-0 transition-transform active:scale-95 text-left ${
                        selected ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                      }`}
                    >
                      {therapist.image ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden mb-2 bg-surface-container-high">
                          <img className="w-full h-full object-cover" alt={therapist.name} src={therapist.image} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-sm">
                          <Icon name="bolt" className="text-[24px]" />
                        </div>
                      )}
                      <span className="font-button-secondary text-button-secondary text-on-surface font-semibold truncate w-full">
                        {therapist.name}
                      </span>
                      <span
                        className={`font-caption text-caption truncate w-full ${
                          selected ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {therapist.hint ?? therapist.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm mb-4">
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Important Information</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <Icon name="timelapse" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Please arrive <strong>10 minutes prior</strong> to your scheduled session to complete brief skin
                    intake.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="verified_user" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Cancellation policy:</strong> Free reschedule up to 2 hours before your appointment.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="qr_code_2" className="text-primary text-[20px] shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    <strong>Redemption:</strong> Present your VEMTAP voucher confirmation code at the reception desk.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-safe">
        <div className="max-w-[430px] mx-auto px-margin py-3 flex items-center justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
              Total Price
            </span>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="font-heading-sm text-heading-sm text-primary tracking-tight font-bold">
                {naira(total)}
              </span>
              <span className="font-caption text-caption text-text-tertiary">
                • {formatSpaDuration(service.time)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onBook}
            className="flex-1 max-w-[240px] h-11 bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-1.5 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:bg-primary-container active:scale-[0.98] transition-all"
          >
            <span>Book Appointment</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
