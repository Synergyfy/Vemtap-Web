import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopFooter, DesktopNavHeader, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopStartVemtapScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onGetStarted: () => void;
}

const DISTRICTS = ['Apo, Abuja', 'Wuse II', 'Maitama', 'Lekki Phase 1', 'Victoria Island'];

export function DesktopStartVemtapScreen({ onNav, onGetStarted }: DesktopStartVemtapScreenProps) {
  const [district, setDistrict] = useState('');
  const [gpsStatus, setGpsStatus] = useState('High precision GPS • Recommended');
  const [radius, setRadius] = useState(5);
  const [locating, setLocating] = useState(false);

  const handleGps = () => {
    if (locating) return;
    setLocating(true);
    setGpsStatus('Acquiring high accuracy coordinates...');
    window.setTimeout(() => {
      setGpsStatus('Locked: Maitama / Central Abuja (Within 25m)');
      setDistrict('Maitama, Abuja (Current Location)');
      setLocating(false);
    }, 700);
  };

  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col antialiased">
      <DesktopNavHeader active="discover" onNav={onNav} />

      <main className="w-full pt-20 flex-1 bg-surface-canvas">
        <div className="flex flex-col w-full">
          <div className="w-full relative overflow-hidden py-space-xl lg:py-space-3xl">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-surface-tint-blue via-surface-container/30 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-margin flex flex-col items-center relative z-10">
              <div className="flex flex-col items-center gap-space-xs mb-space-lg">
                <div aria-label="Onboarding Progress Step 2 of 2" className="flex items-center gap-space-xs">
                  <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                  <span className="w-6 h-1.5 rounded-full bg-primary-container shadow-sm" />
                </div>
                <div className="flex items-center gap-space-2xs text-text-tertiary">
                  <span className="font-caption text-caption uppercase tracking-widest font-semibold text-primary">
                    Step 2 of 2
                  </span>
                  <span className="text-text-tertiary text-caption">•</span>
                  <span className="font-caption text-caption text-text-secondary">Neighborhood Calibration</span>
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-space-xs mb-space-2xl">
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Let's find what's near you.
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary max-w-xl">
                  Discover deals, products, and businesses around your location with zero hassle. Instant savings
                  calibrated to your radius.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                <div className="lg:col-span-7 relative flex items-center justify-center p-space-lg min-h-[440px] bg-surface-subtle rounded-3xl shadow-sm overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[420px] h-[420px] rounded-full bg-surface-container/50" />
                    <div className="absolute w-[320px] h-[320px] rounded-full bg-surface-container-high/40" />
                    <div className="absolute w-[210px] h-[210px] rounded-full bg-surface-tint-blue/70" />
                    <div className="absolute w-[100px] h-[100px] rounded-full bg-primary/10 animate-ping opacity-75" />
                  </div>

                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none animate-spin"
                    fill="none"
                    viewBox="0 0 400 400"
                    style={{ animationDuration: '10s', animationTimingFunction: 'linear' }}
                  >
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="sweep-gradient" x1="200" x2="400" y1="200" y2="200">
                        <stop stopColor="#066cf4" stopOpacity="0.3" />
                        <stop offset="1" stopColor="#066cf4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M200 200 L400 200 A200 200 0 0 0 341 58 Z" fill="url(#sweep-gradient)" />
                  </svg>

                  <div className="relative z-20 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(6,108,244,0.4)]">
                      <Icon name="my_location" filled className="text-[28px]" />
                    </div>
                    <div className="mt-space-xs px-space-sm py-0.5 rounded-full bg-surface-canvas shadow-sm text-text-primary font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs">
                      <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                      <span>Within {radius} km</span>
                    </div>
                  </div>

                  <div className="absolute top-12 left-10 z-20 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-surface-canvas shadow-md px-space-md py-space-xs rounded-2xl flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                        <Icon name="local_cafe" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-2xs">
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary">Artisan Roast</span>
                          <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                            -20%
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">450m • Fresh Pastry</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-16 right-8 z-20 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-surface-canvas shadow-md px-space-md py-space-xs rounded-2xl flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-xl bg-surface-tint-blue text-primary-container flex items-center justify-center">
                        <Icon name="devices" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">Core Gadgets</span>
                        <span className="font-caption text-caption text-text-secondary">1.2 km • Same-day pickup</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-14 left-8 z-20 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-surface-canvas shadow-md px-space-md py-space-xs rounded-2xl flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                        <Icon name="checkroom" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-2xs">
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                            Maitama Apparel
                          </span>
                          <span className="px-space-2xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                            Deal
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">800m • New Collection</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-16 right-10 z-20 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-surface-canvas shadow-md px-space-md py-space-xs rounded-2xl flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                        <Icon name="local_grocery_store" className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                          Green Market Hub
                        </span>
                        <span className="font-caption text-caption text-text-secondary">1.8 km • Organics</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-surface-canvas/95 backdrop-blur-md shadow-md px-space-md py-1 rounded-full flex items-center gap-space-xs">
                      <Icon name="spa" className="text-primary text-[16px]" />
                      <span className="font-caption text-caption font-medium text-text-secondary">
                        Aura Studio • 15+ appointments
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-space-lg bg-surface-canvas p-space-xl rounded-3xl shadow-sm">
                  <div className="flex flex-col gap-space-2xs">
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                      Setup Presence
                    </span>
                    <h2 className="font-heading-md text-heading-md text-text-primary">
                      Where should we deliver local value?
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary">
                      Tailor discovery to your everyday commute or residential hub.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGps}
                    className={`group w-full flex items-center justify-between p-space-md rounded-2xl bg-surface-tint-blue hover:bg-surface-container-high/60 transition-all text-left ${
                      locating ? 'opacity-80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_12px_rgba(6,108,244,0.25)] group-hover:scale-105 transition-transform">
                        <Icon name="near_me" className="text-[24px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-button-primary text-button-primary text-text-primary flex items-center gap-space-2xs">
                          Use Current Location
                          <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{gpsStatus}</span>
                      </div>
                    </div>
                    <Icon name="arrow_forward_ios" className="text-primary group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-px bg-surface-container" />
                    <span className="absolute bg-surface-canvas px-space-sm font-caption text-caption font-semibold text-text-tertiary uppercase tracking-wider">
                      or manual search
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm font-semibold text-text-secondary" htmlFor="districtSearchInput">
                      Enter City, District, or Landmark
                    </label>
                    <div className="relative flex items-center">
                      <Icon
                        name="search"
                        className="absolute left-space-md text-text-tertiary text-[20px] pointer-events-none"
                      />
                      <input
                        className="w-full h-[52px] pl-11 pr-space-md rounded-2xl bg-surface-subtle text-text-primary placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas shadow-inner"
                        id="districtSearchInput"
                        placeholder="e.g. Apo, Wuse II, Lekki Phase 1..."
                        type="text"
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                      />
                      {district && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          className="absolute right-space-md text-text-tertiary hover:text-text-primary"
                          onClick={() => setDistrict('')}
                        >
                          <Icon name="cancel" className="text-[18px]" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-caption text-caption font-semibold text-text-tertiary uppercase tracking-wide">
                      Popular Neighborhood Hubs
                    </span>
                    <div className="flex flex-wrap gap-space-xs">
                      {DISTRICTS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setDistrict(item)}
                          className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all flex items-center gap-space-2xs ${
                            district === item
                              ? 'bg-surface-tint-blue text-primary font-semibold'
                              : 'bg-surface-subtle hover:bg-surface-tint-blue text-text-secondary hover:text-primary'
                          }`}
                        >
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-space-md bg-surface-subtle rounded-2xl flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-text-secondary">Scan Distance</span>
                      <span className="font-label-sm text-label-sm font-bold text-primary">{radius} km radius</span>
                    </div>
                    <input
                      className="w-full accent-primary-container cursor-pointer"
                      id="radiusRangeSlider"
                      max="25"
                      min="1"
                      type="range"
                      value={radius}
                      onChange={(event) => setRadius(Number(event.target.value))}
                    />
                    <div className="flex items-center justify-between text-caption font-caption text-text-tertiary">
                      <span>Walking (1km)</span>
                      <span>Neighborhood (5km)</span>
                      <span>Metro (25km)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-space-md mt-space-2xl pb-space-lg text-center">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="w-full h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary font-semibold rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] transition-all transform active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <Icon name="explore" className="text-[20px]" />
                </button>

                <div className="pt-space-xs">
                  <button
                    type="button"
                    onClick={() => onNav('for-business')}
                    className="group inline-flex items-center gap-space-2xs font-label-md text-label-md text-text-secondary hover:text-primary-container transition-colors py-space-xs"
                  >
                    <span>Own a business?</span>
                    <span className="text-primary-container font-semibold group-hover:underline">
                      Set up your business on VEMTAP →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DesktopFooter onNav={onNav} />
    </div>
  );
}
