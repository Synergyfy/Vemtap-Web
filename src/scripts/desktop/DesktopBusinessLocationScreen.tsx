import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessSetupChrome } from './BusinessSetupChrome';
import type { BusinessProfileDraft } from './DesktopBusinessOnboardingScreen';

interface DesktopBusinessLocationScreenProps {
  draft: BusinessProfileDraft;
  onBack: () => void;
  onComplete: () => void;
  onSaveDraft: () => void;
}

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAO7N11kfeORzMvdvlk-JtPiub6lsy2wEAo_bAW0YIsIEZcMzaZs0gSxqU74TzoK5WRJIDeykDTVd2Qsg0GAW_xljf2oT4xzrGp9_s5q6XfhXx1Dvj0OP6B4p1CFpkiZtqI_oH85bgGj65hjUhTqGycgo5jdkolzPml57ZjbYCiy2DOnnGh3W2But9C0EYUHRgAwQ3U74chMlPfBjmQdBuMWiro9wehsjUkv3UvNIGh';

const EXTERIOR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA77Z8_-gh3XABNqy35LVrlkdFdrkLwbR9bcuWnj9pm_ELmIpaNlfYQynP8XjetIzTS4v9XdvEgBw_SvrhTy9puswdy64xne87j0zOw1LOqtkIzrML60U-7z1WAMxTQ_xjQAOyJqC9KrIEn1ysIDnTT7gn2rPTFYQU3scz9DbOjKlJSod-4CpVTTurmYY_iT0e6x_uLByRqmlcXRHY31OnDfDBOfvpkZy_CTS4eS_l8';

export function DesktopBusinessLocationScreen({ draft, onBack, onComplete, onSaveDraft }: DesktopBusinessLocationScreenProps) {
  const [address, setAddress] = useState('Plot 1428, Adetokunbo Ademola Crescent');
  const [street, setStreet] = useState('Plot 1428, Adetokunbo Ademola Crescent');
  const [landmark, setLandmark] = useState('Opposite Cubana Suites, Ground Floor (Suite 4)');
  const [gpsLabel, setGpsLabel] = useState('Use current device location');
  const [fullscreen, setFullscreen] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [zoom, setZoom] = useState(1);
  const timers = useRef<number[]>([]);
  const addressRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const displayName = draft.name.trim().length > 0 ? draft.name.trim() : 'Urban Grill & Bistro';
  const nameWords = displayName.split(/\s+/).filter((word) => word !== '&');
  const initials =
    nameWords
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || 'UG';

  const clearSearch = () => {
    setAddress('');
    addressRef.current?.focus();
  };

  const handleGps = () => {
    if (gpsLabel !== 'Use current device location') return;
    setGpsLabel('Acquiring GPS Fix...');
    timers.current.push(
      window.setTimeout(() => {
        setGpsLabel('Current Location Locked');
        timers.current.push(window.setTimeout(() => setGpsLabel('Use current device location'), 2000));
      }, 700),
    );
  };

  const zoomIn = () => setZoom((value) => Math.min(1.8, Number((value + 0.2).toFixed(1))));
  const zoomOut = () => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))));

  return (
    <BusinessSetupChrome activeNav="locations">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-2xl pb-space-lg">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-2xs">
                <span className="w-7 h-1.5 rounded-full bg-primary-container" />
                <span className="w-7 h-1.5 rounded-full bg-primary-container" />
                <span className="w-2 h-1.5 rounded-full bg-surface-variant" />
                <span className="w-2 h-1.5 rounded-full bg-surface-variant" />
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wide uppercase">
                Step 2 of 4 • Business Location
              </span>
              <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                50% Complete
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero text-text-primary font-bold tracking-tight">
              Where is your business located?
            </h1>
            <p className="font-body-lg text-body-lg text-text-secondary">
              Customers will use this information to discover your business and redeem local offers near them.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-space-sm bg-surface-subtle p-space-xs rounded-xl shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="verified" className="text-[20px]" />
            </div>
            <div className="pr-space-xs text-left">
              <div className="font-label-sm text-label-sm text-text-primary font-semibold">Geo-Fenced Onboarding</div>
              <div className="font-caption text-caption text-text-tertiary">Realtime discovery radius ready</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <label className="font-label-md text-label-md text-text-primary font-semibold" htmlFor="address-search">
                  Search Business Address
                </label>
                <div className="relative flex items-center">
                  <Icon name="search" className="absolute left-space-md text-text-tertiary text-[20px]" />
                  <input
                    id="address-search"
                    ref={addressRef}
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="w-full h-[52px] pl-11 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas transition-all outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <button
                    type="button"
                    aria-label="Clear address input"
                    onClick={clearSearch}
                    className="absolute right-space-md text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center p-1"
                  >
                    <Icon name="cancel" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGps}
                className="h-11 px-space-md w-full rounded-xl bg-surface-tint-blue text-primary font-label-md text-label-md flex items-center justify-between hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-space-xs">
                  <Icon name="my_location" className="text-[18px]" />
                  <span>{gpsLabel}</span>
                </div>
                <div className="flex items-center gap-space-2xs bg-surface-canvas px-space-xs py-0.5 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                  <span className="font-caption text-caption text-text-secondary font-medium">GPS Ready</span>
                </div>
              </button>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="security" filled className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Territory Resolution
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="check_circle" className="text-[14px]" />
                  Auto-Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm bg-surface-subtle p-space-md rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">Country</span>
                  <div className="flex items-center gap-space-2xs">
                    <span className="text-[14px]">🇳🇬</span>
                    <span className="font-label-md text-label-md text-text-primary font-medium">Nigeria</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    State / Region
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-medium">FCT (Abuja)</span>
                </div>
                <div className="flex flex-col gap-1 pt-space-xs">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    City / Metro
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-medium">Abuja Municipal</span>
                </div>
                <div className="flex flex-col gap-1 pt-space-xs">
                  <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider">
                    District / Area
                  </span>
                  <span className="font-label-md text-label-md text-text-primary font-medium">Wuse 2</span>
                </div>
              </div>
              <div className="rounded-xl p-space-md bg-surface-tint-blue flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-2xs">
                    <Icon name="hub" className="text-primary text-[18px]" />
                    <span className="font-label-md text-label-md text-primary font-semibold">
                      District Cluster Assignment
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="More cluster information"
                      className="text-text-tertiary hover:text-primary transition-colors flex items-center"
                    >
                      <Icon name="info" className="text-[18px]" />
                    </button>
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-space-sm bg-inverse-surface text-inverse-on-surface font-caption text-caption rounded-lg shadow-xl z-20">
                      Customers browsing within this 3km retail radius will see your flash offers and tap-to-pay deals
                      instantly.
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-sm text-label-sm text-text-primary">Wuse Commercial Hub Cluster</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-canvas text-primary font-caption text-caption font-semibold shadow-sm">
                    Assigned
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary mt-1">
                  Customers browsing within this 3km retail radius will see your flash offers and tap-to-pay deals
                  instantly.
                </p>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Storefront Details</h2>
                <span className="font-caption text-caption text-text-tertiary font-medium">Physical Entrance Info</span>
              </div>
              <div className="flex flex-col gap-space-sm">
                <div className="flex flex-col gap-space-2xs">
                  <label
                    className="font-label-md text-label-md text-text-primary font-medium"
                    htmlFor="street-address"
                  >
                    Street / Building Address
                  </label>
                  <input
                    id="street-address"
                    type="text"
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    className="w-full h-[52px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas transition-all outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label
                    className="font-label-md text-label-md text-text-primary font-medium"
                    htmlFor="landmark-suite"
                  >
                    Landmark / Suite / Floor
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="landmark-suite"
                      type="text"
                      value={landmark}
                      onChange={(event) => setLandmark(event.target.value)}
                      className="w-full h-[52px] pl-space-md pr-11 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas transition-all outline-none focus:ring-2 focus:ring-primary-container"
                    />
                    <Icon name="storefront" className="absolute right-space-md text-text-tertiary text-[20px]" />
                  </div>
                  <p className="font-caption text-caption text-text-tertiary">
                    Helps in-person shoppers locate the glass door entrance quickly.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-7 flex flex-col gap-space-md lg:sticky lg:top-24">
            <div
              className={`relative w-full rounded-2xl overflow-hidden shadow-lg bg-surface-container ${
                fullscreen ? 'fixed inset-0 z-[60] h-full' : 'h-[620px]'
              }`}
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${MAP_IMAGE}')` }} />
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
                data-location="Plot 1428, Adetokunbo Ademola Crescent, Wuse 2, Abuja, Nigeria"
                style={{
                  backgroundImage: `url('${MAP_IMAGE}')`,
                  transform: `scale(${zoom})`,
                  filter: satellite ? 'saturate(1.6) contrast(1.1)' : undefined,
                }}
              />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-inverse-surface/60 to-transparent pointer-events-none" />
              <div className="absolute top-space-md left-space-md right-16 flex items-center">
                <div className="bg-surface-canvas/95 backdrop-blur-md px-space-md py-space-xs rounded-full shadow-md flex items-center gap-space-xs">
                  <Icon name="touch_app" className="text-primary text-[18px]" />
                  <span className="font-label-sm text-label-sm text-text-primary font-medium truncate">
                    Drag pin to adjust exact storefront entrance for walking customers
                  </span>
                </div>
              </div>
              <div className="absolute top-space-md right-space-md flex flex-col gap-space-xs">
                <button
                  type="button"
                  aria-label="Toggle Fullscreen Map"
                  onClick={() => setFullscreen((value) => !value)}
                  className="w-10 h-10 rounded-xl bg-surface-canvas/95 backdrop-blur-md text-text-primary hover:text-primary flex items-center justify-center shadow-md transition-transform hover:scale-105"
                >
                  <Icon name={fullscreen ? 'fullscreen_exit' : 'fullscreen'} className="text-[20px]" />
                </button>
                <button
                  type="button"
                  aria-label="Toggle Satellite Layers"
                  onClick={() => setSatellite((value) => !value)}
                  className={`w-10 h-10 rounded-xl bg-surface-canvas/95 backdrop-blur-md flex items-center justify-center shadow-md transition-transform hover:scale-105 ${
                    satellite ? 'text-primary' : 'text-text-primary hover:text-primary'
                  }`}
                >
                  <Icon name="layers" className="text-[20px]" />
                </button>
              </div>
              <div className="absolute bottom-space-lg right-space-md flex flex-col gap-1 bg-surface-canvas/95 backdrop-blur-md rounded-xl shadow-md p-1">
                <button
                  type="button"
                  aria-label="Zoom In"
                  onClick={zoomIn}
                  className="w-9 h-9 rounded-lg hover:bg-surface-subtle text-text-primary flex items-center justify-center transition-colors"
                >
                  <Icon name="add" className="text-[20px]" />
                </button>
                <div className="h-px w-full bg-surface-variant" />
                <button
                  type="button"
                  aria-label="Zoom Out"
                  onClick={zoomOut}
                  className="w-9 h-9 rounded-lg hover:bg-surface-subtle text-text-primary flex items-center justify-center transition-colors"
                >
                  <Icon name="remove" className="text-[20px]" />
                </button>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing group">
                <div className="mb-2 bg-surface-canvas rounded-xl shadow-xl p-space-sm flex items-center gap-space-sm border-none transition-transform group-hover:-translate-y-1">
                  <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-2xs">
                      <span className="font-label-sm text-label-sm text-text-primary font-bold">
                        {displayName} (Main)
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                    </div>
                    <div className="flex items-center gap-1 font-caption text-caption text-text-tertiary">
                      <Icon name="meeting_room" className="text-[13px] text-primary" />
                      <span>Store Entrance Set</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-12 h-12 rounded-full bg-primary-container/20 animate-ping" />
                  <span className="absolute w-8 h-8 rounded-full bg-primary-container/30" />
                  <div className="relative w-10 h-10 rounded-full bg-primary-container text-on-primary shadow-xl flex items-center justify-center transition-transform hover:scale-110">
                    <Icon name="location_on" className="text-[22px]" />
                  </div>
                </div>
                <div className="w-4 h-1.5 bg-on-surface/20 rounded-full blur-[1px] mt-0.5" />
              </div>

              <div className="absolute bottom-space-lg left-space-md flex items-center gap-space-xs bg-surface-canvas/95 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-md">
                <Icon name="gps_fixed" className="text-badge-discount-text text-[18px]" />
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary font-medium">9.0820° N, 7.4913° E</span>
                  <span className="font-caption text-[11px] text-text-tertiary">± 1.2m Entrance Precision</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <img
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  alt="Modern upscale restaurant storefront on Adetokunbo Ademola Crescent in Abuja, contemporary architecture, clean glass entry with subtle brand signage, sunny afternoon ambient light, elegant urban street scene."
                  src={EXTERIOR_IMAGE}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-2xs">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Exterior Entrance Reference
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] bg-surface-subtle text-text-secondary">
                      Street View
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary">
                    Used by delivery couriers and nearby VEMTAP shoppers.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="h-9 px-space-md rounded-lg bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Icon name="photo_camera" className="text-[16px]" />
                <span>Update Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-surface-canvas/95 backdrop-blur-md px-6 lg:px-12 py-space-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-border-subtle/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center justify-center gap-space-2xs px-space-md py-space-xs rounded-lg text-secondary hover:text-on-surface hover:bg-surface-subtle font-label-md text-label-md transition-colors"
            >
              <Icon name="save" className="text-[16px]" />
              <span>Save as Draft</span>
            </button>
          </div>
          <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-space-xs bg-primary hover:bg-surface-tint text-on-primary px-space-xl py-space-sm rounded-xl font-button-primary text-button-primary shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <span>Continue to Branch Details</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </BusinessSetupChrome>
  );
}
