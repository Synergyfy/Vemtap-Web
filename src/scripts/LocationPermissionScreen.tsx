import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface LocationPermissionScreenProps {
  onBack: () => void;
  onUseLocation: () => void;
  onManualLocation: () => void;
}

type Status = 'idle' | 'locating' | 'located';

export function LocationPermissionScreen({
  onBack,
  onUseLocation,
  onManualLocation,
}: LocationPermissionScreenProps) {
  const [status, setStatus] = useState<Status>('idle');

  const handleUseLocation = () => {
    if (status !== 'idle') return;
    setStatus('locating');
    window.setTimeout(() => setStatus('located'), 1200);
    window.setTimeout(onUseLocation, 2100);
  };

  return (
    <AppScreen>
      <div className="flex flex-col w-full max-w-[393px] mx-auto px-margin select-none justify-between pb-space-lg flex-1">
        <header className="w-full flex items-center justify-between pt-space-md">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            <Icon name="arrow_back_ios_new" className="text-button-primary" />
          </button>
          <div className="flex items-center gap-space-2xs">
            <div className="w-6 h-1.5 rounded-full bg-primary-container" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
            <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
          </div>
          <div aria-hidden="true" className="w-11 h-11" />
        </header>

        <div className="relative w-full h-[320px] my-space-md flex items-center justify-center overflow-visible">
          <div className="absolute w-72 h-72 rounded-full bg-surface-container-high/40 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute w-60 h-60 rounded-full bg-surface-tint-blue/70" />
          <div className="absolute w-44 h-44 rounded-full bg-surface-container" />
          <div className="absolute w-28 h-28 rounded-full bg-surface-container-high" />

          <aside className="absolute -top-1 right-2 z-10 bg-surface-canvas rounded-xl p-space-xs shadow-md flex items-center gap-space-xs max-w-[170px] animate-bounce" style={{ animationDuration: '4.5s' }}>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container flex-shrink-0">
              <Icon name="local_cafe" className="text-heading-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-sm text-label-sm text-text-primary truncate">Cafe Aroma</p>
              <div className="inline-block bg-badge-discount-bg text-badge-discount-text font-caption text-caption px-space-2xs py-0.5 rounded">
                20% OFF
              </div>
            </div>
          </aside>

          <aside className="absolute left-0 top-20 z-10 bg-surface-canvas rounded-full px-space-sm py-1.5 shadow-md flex items-center gap-space-xs animate-bounce" style={{ animationDuration: '3.8s' }}>
            <Icon name="apparel" className="text-label-md text-tertiary-container" />
            <span className="font-label-sm text-label-sm text-text-secondary whitespace-nowrap">Sneakers &amp; Apparel</span>
          </aside>

          <aside className="absolute bottom-2 left-2 z-10 bg-surface-canvas rounded-xl p-space-xs shadow-md flex items-center gap-space-xs max-w-[160px] animate-bounce" style={{ animationDuration: '5s' }}>
            <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary flex-shrink-0">
              <Icon name="restaurant" className="text-label-md" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-label-sm text-label-sm text-text-primary truncate">Bistro Grill</p>
              <p className="font-caption text-caption text-text-tertiary flex items-center gap-0.5">
                <Icon name="near_me" className="text-[12px] text-primary-container" />
                0.3 km
              </p>
            </div>
          </aside>

          <aside className="absolute bottom-6 right-3 z-10 bg-surface-canvas rounded-full px-space-sm py-1.5 shadow-md flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '4.2s' }}>
            <Icon name="star" filled className="text-label-md text-tertiary-container" />
            <span className="font-label-sm text-label-sm text-text-primary font-semibold">4.9</span>
            <span className="font-caption text-caption text-text-tertiary">(1.2k)</span>
          </aside>

          <div className="relative z-20 flex flex-col items-center">
            <div className="relative w-16 h-16 rounded-full bg-primary-container shadow-xl flex items-center justify-center text-on-primary">
              <div className="absolute inset-0 rounded-full bg-primary-container animate-ping opacity-30" style={{ animationDuration: '2.5s' }} />
              <Icon name="location_on" filled className="text-[32px]" />
            </div>
            <div className="w-6 h-2 mt-1 rounded-full bg-on-surface/10 blur-[2px]" />
          </div>
        </div>

        <section className="flex flex-col items-center text-center px-space-xs">
          <h1 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
            What's near you?
          </h1>
          <p className="mt-space-sm font-body-md text-body-md text-text-secondary max-w-[310px]">
            Allow VEMTAP to use your location so we can show you relevant deals, businesses and products around you.
          </p>
        </section>

        <div className="w-full flex flex-col gap-space-sm mt-space-xl">
          <button
            className={`w-full h-[54px] rounded-xl text-on-primary font-button-primary text-button-primary shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs ${
              status === 'located' ? 'bg-badge-discount-text' : 'bg-primary-container'
            }`}
            id="btn-use-location"
            type="button"
            disabled={status !== 'idle'}
            onClick={handleUseLocation}
          >
            {status === 'idle' && (
              <>
                <Icon name="my_location" className="text-button-primary" />
                <span>Use My Location</span>
              </>
            )}
            {status === 'locating' && (
              <>
                <Icon name="progress_activity" className="text-button-primary animate-spin" />
                <span>Finding nearby gems...</span>
              </>
            )}
            {status === 'located' && (
              <>
                <Icon name="check_circle" className="text-button-primary" />
                <span>Location Set!</span>
              </>
            )}
          </button>

          <button
            className="w-full h-12 rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary active:bg-surface-container transition-colors flex items-center justify-center"
            id="btn-manual-location"
            type="button"
            onClick={onManualLocation}
          >
            Enter Location Manually
          </button>

          <footer className="flex items-center justify-center gap-1.5 pt-space-xs text-text-tertiary">
            <Icon name="lock" className="text-label-sm" />
            <p className="font-caption text-caption text-center">
              Your location helps us personalize what you discover.
            </p>
          </footer>
        </div>
      </div>
    </AppScreen>
  );
}
