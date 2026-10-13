import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopLocationPermissionScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onUseLocation: () => void;
  onManualLocation: () => void;
}

type GeoState = 'idle' | 'locating' | 'calibrated';

const RADAR_BADGES = [
  {
    icon: 'local_cafe',
    name: 'Cafe Aroma',
    meta: '20% OFF Deal',
    position: '-top-1 left-2 sm:left-4',
    iconTint: 'bg-badge-discount-bg text-badge-discount-text',
    metaClass: 'text-[11px] text-badge-discount-text font-bold uppercase tracking-wider',
  },
  {
    icon: 'restaurant',
    name: 'Bistro Grill',
    meta: '0.3 km away',
    position: 'top-10 -right-2 sm:right-0',
    iconTint: 'bg-secondary-fixed text-primary',
    metaClass: 'text-[11px] text-text-secondary',
  },
  {
    icon: 'checkroom',
    name: 'Sneakers & Apparel',
    meta: 'New Arrival Drops',
    position: 'bottom-8 -left-3 sm:left-1',
    iconTint: 'bg-surface-container text-on-surface-variant',
    metaClass: 'text-[11px] text-primary font-medium',
  },
];

const SUGGESTIONS = ['Lekki Phase 1', 'Ikeja GRA', 'Victoria Island', 'Yaba Tech Hub'];

export function DesktopLocationPermissionScreen({
  onNav,
  onUseLocation,
  onManualLocation,
}: DesktopLocationPermissionScreenProps) {
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleUseLocation = () => {
    if (geoState !== 'idle') return;
    setGeoState('locating');
    window.setTimeout(() => {
      setGeoState('calibrated');
      window.setTimeout(onUseLocation, 700);
    }, 1100);
  };

  const saveManualLocation = () => {
    setModalOpen(false);
    onManualLocation();
  };

  return (
    <DesktopPage activeNav="discover" onNav={onNav} withFooter withHeader>
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-surface-tint-blue/60 via-surface to-surface pb-space-3xl pt-space-xl">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 left-1/4 w-[380px] h-[380px] bg-secondary-container/30 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-margin flex flex-col items-center relative">
          <div className="flex flex-col items-center gap-space-xs mb-space-xl">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container text-primary font-caption text-caption shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="font-semibold tracking-wide uppercase">Step 1 of 4</span>
              <span className="text-outline-variant">•</span>
              <span className="text-on-surface-variant font-medium">Location Calibration</span>
            </div>
            <div aria-label="Onboarding progress step 1 of 4" className="flex items-center gap-2 mt-1">
              <span className="w-6 h-1.5 rounded-full bg-primary transition-all duration-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center mb-space-2xl">
            <div className="lg:col-span-7 w-full flex justify-center">
              <div className="relative w-full max-w-[480px] aspect-square rounded-full flex items-center justify-center bg-surface-container-lowest shadow-xl shadow-primary/5 p-4">
                <div className="absolute inset-4 rounded-full border border-primary/10" />
                <div className="absolute inset-14 rounded-full border border-primary/15 animate-pulse" />
                <div className="absolute inset-28 rounded-full border border-dashed border-primary/20" />
                <div className="absolute inset-40 rounded-full bg-surface-tint-blue/70" />

                <div className="absolute inset-6 rounded-full overflow-hidden pointer-events-none">
                  <div className="w-full h-full origin-center animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,108,244,0.18)_360deg)]" />
                </div>

                {RADAR_BADGES.map((badge) => (
                  <div
                    key={badge.name}
                    className={`absolute ${badge.position} z-20 transition-transform duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center gap-2 bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-lg shadow-on-surface/5">
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full ${badge.iconTint}`}
                      >
                        <Icon name={badge.icon} className="text-[14px]" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-text-primary font-semibold">{badge.name}</span>
                        <span className={`font-caption ${badge.metaClass}`}>{badge.meta}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute -bottom-1 right-4 sm:right-8 z-20 transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center gap-1.5 bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-lg shadow-on-surface/5">
                    <Icon name="star" filled className="text-amber-500 text-[16px]" />
                    <span className="font-label-sm text-label-sm text-text-primary font-bold">4.9</span>
                    <span className="font-caption text-[11px] text-text-tertiary">(1.2k nearby reviews)</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center">
                  <span className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ping" />
                  <span className="absolute w-16 h-16 rounded-full bg-primary-fixed" />
                  <div className="relative w-12 h-12 rounded-full bg-primary-container text-on-primary shadow-xl shadow-primary/40 flex items-center justify-center cursor-pointer transform active:scale-95 transition-transform">
                    <Icon name="location_on" className="text-[24px]" />
                  </div>
                </div>

                <svg
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 400 400"
                >
                  <circle
                    cx="200"
                    cy="200"
                    fill="none"
                    r="130"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    className="text-primary/30"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    fill="none"
                    r="85"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/20"
                  />
                </svg>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start gap-space-lg text-left">
              <div className="flex flex-col gap-space-xs">
                <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                  Hyper-Local Marketplace
                </span>
                <h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight">
                  What&apos;s near you?
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed pt-1">
                  Allow VEMTAP to use your browser location so we can show you relevant deals, businesses, and
                  products around you in real time.
                </p>
              </div>

              <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="bolt" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Instant Local Discovery
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Tap once to unlock neighborhood-exclusive flash deals.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
                    <Icon name="shield" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      Strict Data Governance
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Radius data is cached locally and never sold or shared.
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-space-sm pt-2">
                <button
                  className={`w-full h-[54px] rounded-xl font-button-primary text-button-primary shadow-lg transition-all duration-200 flex items-center justify-center gap-space-xs active:scale-[0.99] cursor-pointer ${
                    geoState === 'calibrated'
                      ? 'bg-badge-discount-text text-white shadow-badge-discount-text/25'
                      : 'bg-primary-container hover:bg-on-primary-fixed-variant text-on-primary shadow-primary/25'
                  }`}
                  id="geo-btn"
                  type="button"
                  disabled={geoState !== 'idle'}
                  onClick={handleUseLocation}
                >
                  {geoState === 'idle' && (
                    <>
                      <Icon name="my_location" className="text-[20px]" />
                      <span>Use My Location</span>
                    </>
                  )}
                  {geoState === 'locating' && (
                    <>
                      <Icon name="refresh" className="text-[20px] animate-spin" />
                      <span>Locating nearby hubs...</span>
                    </>
                  )}
                  {geoState === 'calibrated' && (
                    <>
                      <Icon name="check_circle" className="text-[20px]" />
                      <span>Location Calibrated!</span>
                    </>
                  )}
                </button>
                <button
                  className="w-full h-[54px] rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm transition-all duration-200 flex items-center justify-center gap-space-xs cursor-pointer"
                  id="manual-btn"
                  type="button"
                  onClick={() => setModalOpen(true)}
                >
                  <Icon name="search" className="text-[20px] text-text-secondary" />
                  <span>Enter Location Manually</span>
                </button>
              </div>

              <div className="w-full pt-1 flex items-center justify-center lg:justify-start">
                <button
                  className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-text-secondary hover:text-primary transition-colors group"
                  type="button"
                  onClick={() => onNav('for-business')}
                >
                  <span>Own a local business?</span>
                  <span className="text-primary font-semibold group-hover:underline">
                    Set up your business on VEMTAP →
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full max-w-3xl flex items-center justify-center">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-lg py-space-sm rounded-full shadow-sm text-center">
              <Icon name="verified_user" className="text-[16px] text-badge-discount-text" />
              <p className="font-caption text-caption text-text-secondary">
                Your location is never shared with third parties and only helps personalize what you discover.{' '}
                <span className="font-semibold text-text-primary">NDPR Compliant</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
          id="manual-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setModalOpen(false);
          }}
          role="presentation"
        >
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-space-xl shadow-2xl flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="explore" className="text-primary text-[22px]" />
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Enter your city or postal code
                </h3>
              </div>
              <button
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                id="close-modal"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <p className="font-body-md text-body-md text-text-secondary">
              Search for neighborhood hubs, landmarks, or streets to calibrate offers manually.
            </p>

            <div className="flex flex-col gap-space-sm">
              <div className="relative flex items-center">
                <Icon
                  name="search"
                  className="absolute left-4 text-text-tertiary text-[20px] pointer-events-none"
                />
                <input
                  className="w-full h-[52px] pl-12 pr-4 bg-surface-subtle rounded-xl text-text-primary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-tertiary"
                  placeholder="e.g. Victoria Island, Lagos or Lekki Phase 1"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="px-space-md py-1 rounded-full bg-surface-container text-text-primary font-caption text-caption hover:bg-secondary-fixed transition-colors"
                    type="button"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-2">
              <button
                className="px-space-md py-space-xs rounded-xl font-label-md text-label-md text-text-secondary hover:text-text-primary cursor-pointer"
                id="cancel-modal"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-space-lg py-space-xs rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
                type="button"
                onClick={saveManualLocation}
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </DesktopPage>
  );
}
