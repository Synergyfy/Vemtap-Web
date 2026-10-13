import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopConfirmLocationScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onChangeLocation: () => void;
  onContinue: () => void;
  onBusinessSetup: () => void;
}

interface RadiusMetrics {
  deals: number;
  stores: number;
  cafes: number;
  scale: number;
}

const PRESET_METRICS: Record<number, Omit<RadiusMetrics, 'scale'>> = {
  1: { deals: 12, stores: 5, cafes: 3 },
  2: { deals: 24, stores: 9, cafes: 6 },
  5: { deals: 48, stores: 18, cafes: 12 },
  10: { deals: 94, stores: 34, cafes: 22 },
  15: { deals: 142, stores: 52, cafes: 38 },
  25: { deals: 260, stores: 88, cafes: 64 },
};

const CHIPS = [2, 5, 10, 15, 25];

const DENSITY_CARDS = [
  {
    icon: 'local_offer',
    tint: 'bg-badge-discount-bg text-badge-discount-text',
    title: '35% Avg Off',
    copy: 'Active local vouchers',
  },
  {
    icon: 'near_me',
    tint: 'bg-surface-tint-blue text-primary',
    title: '0.4 - 4.2 km',
    copy: 'Walkable merchants',
  },
  {
    icon: 'verified',
    tint: 'bg-surface-container text-on-surface-variant',
    title: '100% NDPR',
    copy: 'Strict privacy bounds',
  },
];

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDBsyiV_2vuccEvX_p3nIq6KJZzqPptuJ_bGZlOwndglbep-5mdJXmxeQD5yJqmOZ6yFPexmr5QQF4BtvB00IEvpFwW_Ig2gUC0SabEUkPAb0epwbgbmW5Q6QFEIJzNyYNEN6kdQVVMo3pLRHqOwRwU4Lih9NhpMnPIONh2zrOK6BwK4JY2TqzOpLZqj_p1OpLUVyAUciWJhJNU4aLO0B1TpVGIIBNqeYuf8Vs7LsfF';

function metricsFor(radius: number): RadiusMetrics {
  const preset = PRESET_METRICS[radius];
  if (preset) {
    const presetScale = { 1: 0.75, 2: 0.9, 5: 1, 10: 1.25, 15: 1.5, 25: 1.75 }[radius] ?? 1;
    return { ...preset, scale: presetScale };
  }
  const ratio = radius / 5;
  return {
    deals: Math.round(48 * ratio),
    stores: Math.round(18 * ratio),
    cafes: Math.round(12 * ratio),
    scale: 0.75 + Math.min(100, Math.round(radius * 4)) / 400,
  };
}

export function DesktopConfirmLocationScreen({
  onNav,
  onBack,
  onChangeLocation,
  onContinue,
  onBusinessSetup,
}: DesktopConfirmLocationScreenProps) {
  const [radius, setRadius] = useState(5);
  const [slide, setSlide] = useState(0);

  const metrics = metricsFor(radius);
  const radarScale = 0.6 + (radius / 25) * 0.7;

  return (
    <DesktopPage activeNav="discover" onNav={onNav} withFooter withHeader>
      <section className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-2xl">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Back"
              className="w-6 h-6 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-lg" />
            </button>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">
              3
            </span>
            <span className="font-label-md text-label-md text-primary font-semibold tracking-wide uppercase">
              Step 3 of 4
            </span>
            <span className="text-text-tertiary">•</span>
            <span className="font-body-md text-body-md text-text-secondary">Location Confirmed</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
            <span className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
            <span className="w-8 h-2 rounded-full bg-primary-container" />
            <span className="w-2 h-2 rounded-full bg-surface-container-highest" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
          <div className="lg:col-span-5 flex flex-col gap-space-xl">
            <div className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold tracking-wider uppercase w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Location Confirmed
              </div>
              <h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight mt-space-2xs">
                You&apos;re exploring around Apo, Abuja
              </h1>
              <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                We&apos;ve calibrated your local discovery feed. You can adjust your discovery radius anytime.
              </p>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                    <Icon name="location_on" filled className="text-[28px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-heading-sm text-heading-sm text-on-surface font-semibold">Apo, Abuja</span>
                      <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        Active Area
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-secondary">
                      Federal Capital Territory, Nigeria
                    </span>
                  </div>
                </div>
                <button
                  className="text-primary hover:text-on-primary-fixed-variant font-label-md text-label-md font-semibold transition-colors flex items-center gap-space-2xs"
                  type="button"
                  onClick={onChangeLocation}
                >
                  <Icon name="edit_location_alt" className="text-[16px]" />
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between pt-space-sm bg-surface-subtle p-space-sm rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <Icon name="radar" className="text-primary text-[18px]" />
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    {radius} km discovery radius
                  </span>
                </div>
                <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-space-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" /> Live Range
                </span>
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-canvas shadow-sm flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <label className="font-heading-sm text-heading-sm text-on-surface font-semibold" htmlFor="radius-range">
                  Discovery Radius
                </label>
                <span className="font-label-md text-label-md text-primary font-bold px-space-sm py-space-2xs rounded-full bg-surface-tint-blue">
                  {radius} km
                </span>
              </div>

              <div className="relative w-full flex flex-col gap-space-xs">
                <input
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
                  id="radius-range"
                  max="25"
                  min="1"
                  step="1"
                  type="range"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                />
                <div className="flex justify-between font-caption text-caption text-text-tertiary px-1">
                  <span>1 km</span>
                  <span>5 km</span>
                  <span>10 km</span>
                  <span>15 km</span>
                  <span>25 km</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-xs">
                {CHIPS.map((value) => {
                  const active = value === radius;
                  return (
                    <button
                      key={value}
                      className={`px-space-md py-space-xs rounded-full font-label-sm text-label-sm transition-all ${
                        active
                          ? 'bg-surface-tint-blue text-primary-container font-semibold shadow-sm'
                          : 'bg-surface-subtle text-text-secondary font-medium hover:text-on-surface'
                      }`}
                      type="button"
                      onClick={() => setRadius(value)}
                    >
                      {active ? `${value} km (Active)` : `${value} km`}
                    </button>
                  );
                })}
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary-container shadow-sm shrink-0">
                  <Icon name="storefront" className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary font-medium">
                    Verified Active Opportunities
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    Found <strong className="text-primary font-bold">{metrics.deals} Deals</strong>,{' '}
                    <strong className="text-primary font-bold">{metrics.stores} Stores</strong>, and{' '}
                    <strong className="text-primary font-bold">{metrics.cafes} Cafes</strong> within {radius}km
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-md">
              <button
                className="w-full h-[52px] rounded-xl bg-primary-container hover:bg-on-primary-fixed-variant text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-md active:scale-[0.99] transition-all"
                type="button"
                onClick={onContinue}
              >
                <span>Continue to Deals &amp; Stores</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <div className="flex items-center justify-center gap-space-xs pt-space-2xs text-center">
                <span className="font-caption text-caption text-text-secondary">Own a business?</span>
                <button
                  className="font-caption text-caption text-primary-container font-semibold hover:underline flex items-center gap-space-2xs"
                  type="button"
                  onClick={onBusinessSetup}
                >
                  <span>Set up on VEMTAP</span>
                  <Icon name="trending_flat" className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="relative w-full h-[580px] rounded-2xl overflow-hidden shadow-xl bg-surface-canvas flex flex-col justify-between p-space-lg">
              <div
                aria-hidden="true"
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className="w-96 h-96 rounded-full bg-primary-container/10 backdrop-blur-[1px] flex items-center justify-center transition-all duration-500"
                  style={{ transform: `scale(${radarScale})` }}
                >
                  <div className="w-64 h-64 rounded-full bg-primary-container/15 animate-ping opacity-25" />
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-md py-space-xs rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-md text-on-surface font-label-md text-label-md font-semibold flex items-center gap-space-2xs">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    <span>{metrics.deals} Deals</span>
                  </span>
                  <span className="px-space-md py-space-xs rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-md text-on-surface font-label-md text-label-md font-semibold flex items-center gap-space-2xs">
                    <Icon name="store" className="text-[16px] text-tertiary-container" />
                    <span>{metrics.stores} Stores</span>
                  </span>
                  <span className="px-space-md py-space-xs rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-md text-on-surface font-label-md text-label-md font-semibold flex items-center gap-space-2xs">
                    <Icon name="local_cafe" className="text-[16px] text-primary" />
                    <span>{metrics.cafes} Cafes</span>
                  </span>
                </div>
                <div className="flex items-center bg-surface-canvas/90 backdrop-blur-md rounded-lg shadow-sm p-1">
                  <button
                    aria-label="Zoom in"
                    className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
                    type="button"
                    onClick={() => setRadius((value) => Math.min(25, value + 1))}
                  >
                    <Icon name="add" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Zoom out"
                    className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
                    type="button"
                    onClick={() => setRadius((value) => Math.max(1, value - 1))}
                  >
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Recenter"
                    className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center text-on-surface"
                    type="button"
                    onClick={() => setRadius(5)}
                  >
                    <Icon name="my_location" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="relative z-10 self-center my-auto flex flex-col items-center -translate-y-4">
                <div className="relative cursor-pointer">
                  <span className="absolute -inset-2 rounded-full bg-primary-container/30 animate-pulse" />
                  <div className="relative px-space-md py-space-xs rounded-full bg-primary text-on-primary shadow-xl flex items-center gap-space-xs">
                    <Icon name="storefront" filled className="text-[20px]" />
                    <span className="font-label-md text-label-md font-bold tracking-tight">Apo Hub</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-on-primary" />
                    <span className="font-caption text-caption text-primary-fixed">Active Center</span>
                  </div>
                  <div className="w-3 h-3 bg-primary rotate-45 mx-auto -mt-1.5 shadow-md" />
                </div>
                <span className="mt-space-xs font-caption text-caption text-on-surface font-semibold bg-surface-canvas/90 px-space-sm py-space-2xs rounded-full shadow-sm backdrop-blur-sm">
                  9.0125° N, 7.5029° E
                </span>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-canvas/95 backdrop-blur-md p-space-md rounded-xl shadow-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container">
                    <Icon name="explore" className="text-[20px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Deals &amp; Stores within {radius}km
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Updates dynamically when radius expands or contracts
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <span className="font-caption text-caption text-badge-discount-text font-bold flex items-center gap-1">
                    <Icon name="bolt" className="text-[16px]" /> High Deal Activity
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-space-xs mt-space-2xs">
              <span className="font-caption text-caption text-text-tertiary">
                Map Canvas Mode: Real-time Discovery Deck
              </span>
              <div className="flex items-center gap-space-xs">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    aria-label={`Slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      slide === index ? 'w-6 bg-primary-container' : 'w-2 bg-surface-container-highest hover:bg-text-tertiary'
                    }`}
                    type="button"
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-xs">
              {DENSITY_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="p-space-md rounded-xl bg-surface-canvas shadow-sm flex items-center gap-space-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${card.tint} flex items-center justify-center shrink-0`}
                  >
                    <Icon name={card.icon} className="text-[20px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">
                      {card.title}
                    </span>
                    <span className="font-caption text-caption text-text-secondary truncate">{card.copy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DesktopPage>
  );
}
