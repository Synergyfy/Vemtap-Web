import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Toast } from '../../components/ui/Toast';
import { hasApiConfig } from '../../services/api/client';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopManualLocationScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  /** Live: resolves once the typed area is found and saved; rejects with a customer-facing message. */
  onContinue: (area: string) => Promise<void> | void;
  /** Live: detect and save the browser's position (same as the permission step). */
  onUseCurrentLocation?: () => Promise<void> | void;
}

interface Area {
  name: string;
  meta: string;
  distance?: string;
  pill?: string;
  deckTitle: string;
}

const AREAS: Area[] = [
  {
    name: 'Apo',
    meta: 'Abuja, Federal Capital Territory',
    pill: 'Active Sector',
    deckTitle: 'Apo Resettlement & Legislative Quarters',
  },
  { name: 'Wuse 2', meta: 'Abuja Municipal District', distance: '3.4 km', deckTitle: 'Wuse 2 Commercial District' },
  { name: 'Maitama', meta: 'Abuja Phase 1 Zone', distance: '5.1 km', deckTitle: 'Maitama Diplomatic Zone' },
  { name: 'Garki', meta: 'Area 1 • Area 11 Corridor', distance: '2.8 km', deckTitle: 'Garki Area 1 & Area 11 Corridor' },
  { name: 'Jabi', meta: 'Lake District • Phase 2', distance: '4.9 km', deckTitle: 'Jabi Lake District' },
];

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDBsyiV_2vuccEvX_p3nIq6KJZzqPptuJ_bGZlOwndglbep-5mdJXmxeQD5yJqmOZ6yFPexmr5QQF4BtvB00IEvpFwW_Ig2gUC0SabEUkPAb0epwbgbmW5Q6QFEIJzNyYNEN6kdQVVMo3pLRHqOwRwU4Lih9NhpMnPIONh2zrOK6BwK4JY2TqzOpLZqj_p1OpLUVyAUciWJhJNU4aLO0B1TpVGIIBNqeYuf8Vs7LsfF';

const TESTIMONIAL_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDsmSEbgslhNQG6b0ocDaUn1hZ9sonbknSpfRr6vB0BjAv8pbvhRm0FY_HZ_6LYbEHGm28hsnqj9xGaOFO0B43b6gseQx8OTDxYkB9DY-PnBlgrTpu_eVSPM7Vhcw8Yog-f-rrXT99MAIm81qd-jhH2Fx_T7oKKIrCcatx2Uz_qxAPwI3-IoZiWMDtdZRFCtbE-SIpJgrDdX4VPIAftvEt_gwGzKddvPrhedodL1ncP';

const STATS = [
  { icon: 'local_offer', tint: 'text-primary', value: '34', label: 'Active Deals' },
  { icon: 'verified_user', tint: 'text-badge-discount-text', value: '18', label: 'Verified Stores' },
  { icon: 'restaurant', tint: 'text-tertiary-container', value: '12', label: 'Cafes & Bistros' },
];

export function DesktopManualLocationScreen({ onNav, onBack, onContinue, onUseCurrentLocation }: DesktopManualLocationScreenProps) {
  // Live: the customer types their own area; demo keeps the sample Abuja picker.
  const live = hasApiConfig();
  const [query, setQuery] = useState(live ? '' : 'Apo');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const selected = AREAS[selectedIndex];
  const areaName = live ? query.trim() : selected.name;

  const runLive = (action: () => Promise<void> | void) => {
    if (busy) return;
    setBusy(true);
    Promise.resolve(action())
      .catch((error: unknown) => {
        setToast(error instanceof Error && error.message ? error.message : "We couldn't find that area.");
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3200);
      })
      .finally(() => setBusy(false));
  };

  const continueWithArea = () => {
    if (!live) {
      onContinue(selected.name);
      return;
    }
    if (areaName) runLive(() => onContinue(areaName));
  };

  const useCurrentLocation = () => {
    if (live && onUseCurrentLocation) runLive(onUseCurrentLocation);
    else onContinue(selected.name);
  };

  const selectArea = (index: number) => {
    setSelectedIndex(index);
    setQuery(AREAS[index].name);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') continueWithArea();
  };

  return (
    <DesktopPage activeNav="discover" onNav={onNav} withFooter withHeader>
      <div className="w-full bg-surface-subtle border-b border-border-subtle/50 py-space-sm">
        <div className="max-w-7xl mx-auto px-margin flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Back to location permission"
              className="w-6 h-6 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              type="button"
              onClick={onBack}
            >
              <Icon name="arrow_back" className="text-lg" />
            </button>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold">
              2
            </span>
            <span className="font-heading-sm text-heading-sm text-text-primary">Step 2 of 4 • Select Neighborhood</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-border-subtle" />
            <span className="w-6 h-2 rounded-full bg-primary-container" />
            <span className="w-2 h-2 rounded-full bg-border-subtle" />
            <span className="w-2 h-2 rounded-full bg-border-subtle" />
            <span className="font-caption text-caption text-text-tertiary ml-space-xs">50% completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin py-space-2xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-start">
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm w-fit font-medium">
                <Icon name="bolt" className="text-[16px]" />
                <span>Hyper-local Discovery</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Where are you?</h1>
              <p className="font-body-lg text-body-lg text-text-secondary">
                Enter a city, area, or neighborhood to discover what&apos;s nearby.
              </p>
            </div>

            <div className="relative w-full">
              <div className="relative flex items-center">
                <Icon
                  name="search"
                  className="absolute left-space-md text-primary text-[22px] pointer-events-none"
                />
                <input
                  className="w-full h-[52px] pl-[48px] pr-[44px] rounded-xl bg-surface-canvas text-text-primary font-body-md text-body-md shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] focus:outline-none focus:ring-2 focus:ring-primary-container"
                  id="district-search"
                  placeholder="Search area, landmark or street..."
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <button
                  aria-label="Clear search"
                  className="absolute right-space-md text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center p-1"
                  type="button"
                  onClick={() => {
                    setQuery('');
                    document.getElementById('district-search')?.focus();
                  }}
                >
                  <Icon name="cancel" className="text-[18px]" />
                </button>
              </div>
            </div>

            <button
              className="group flex items-center justify-between p-space-md rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04),0_2px_6px_-1px_rgba(13,37,76,0.02)] hover:bg-surface-tint-blue/30 transition-all text-left"
              type="button"
              onClick={useCurrentLocation}
              disabled={busy}
            >
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Icon name="my_location" filled className="text-[20px]" />
                </div>
                <div>
                  <div className="font-label-md text-label-md text-text-primary font-semibold flex items-center gap-space-2xs">
                    <span>Use Current Location</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-badge-discount-bg text-badge-discount-text uppercase tracking-wider">
                      Fastest
                    </span>
                  </div>
                  <div className="font-caption text-caption text-text-secondary">
                    GPS accurate • Instant local calibration
                  </div>
                </div>
              </div>
              <Icon
                name="chevron_right"
                className="text-text-tertiary group-hover:text-primary group-hover:translate-x-0.5 transition-all text-[20px]"
              />
            </button>

            {!live && (
            <>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
                  Suggested Areas in Abuja
                </span>
                <button className="font-caption text-caption text-primary hover:underline cursor-pointer" type="button">
                  Change State
                </button>
              </div>
              <div className="flex flex-col gap-space-xs">
                {AREAS.map((area, index) => {
                  const active = index === selectedIndex;
                  return (
                    <button
                      key={area.name}
                      className={`flex items-center justify-between p-space-md rounded-xl bg-surface-canvas text-left transition-colors cursor-pointer ${
                        active
                          ? 'shadow-[0_4px_16px_-2px_rgba(6,108,244,0.12)]'
                          : 'shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-surface-subtle'
                      }`}
                      type="button"
                      onClick={() => selectArea(index)}
                    >
                      <div className="flex items-center gap-space-md">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            active ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <Icon name={active ? 'location_on' : 'near_me'} className="text-[18px]" />
                        </div>
                        <div>
                          <div
                            className={`font-label-md text-label-md text-text-primary flex items-center gap-space-xs ${
                              active ? 'font-bold' : 'font-semibold'
                            }`}
                          >
                            <span>{area.name}</span>
                            {area.pill && (
                              <span className="inline-flex items-center px-space-2xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                                {area.pill}
                              </span>
                            )}
                          </div>
                          <div className="font-caption text-caption text-text-secondary">{area.meta}</div>
                        </div>
                      </div>
                      {active ? (
                        <div className="flex items-center gap-space-sm">
                          <span className="font-caption text-caption font-semibold text-primary">Direct Target</span>
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary">
                            <Icon name="check" className="text-[16px]" />
                          </span>
                        </div>
                      ) : (
                        <span className="font-caption text-caption text-text-tertiary bg-surface-container px-space-xs py-space-2xs rounded-md">
                          {area.distance}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-tint-blue text-on-surface">
              <Icon name="timer" filled className="text-primary text-[20px] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md font-semibold text-primary">Active Flash Drops</span>
                <p className="font-caption text-caption text-text-secondary">
                  Local merchant vouchers refreshing in {selected.name} every 15 mins. Tap below to reserve your local
                  redemption queue.
                </p>
              </div>
            </div>
            </>
            )}

            <div className="flex flex-col gap-space-sm pt-space-xs">
              <button
                className="h-[52px] w-full rounded-2xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] transition-all transform active:scale-[0.98]"
                type="button"
                onClick={continueWithArea}
                disabled={busy || (live && !areaName)}
              >
                <span>{busy ? 'Finding your area…' : `Continue with ${areaName || 'an area'}`}</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </button>
              <div className="text-center font-caption text-caption text-text-tertiary">
                <span>Prefer another city? </span>
                <button
                  className="text-primary font-medium hover:underline"
                  type="button"
                  onClick={() => {
                    setQuery('');
                    document.getElementById('district-search')?.focus();
                  }}
                >
                  Explore Lagos, Port Harcourt or Kano
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container shadow-[0_8px_32px_-8px_rgba(13,37,76,0.08)]">
              <div
                className="w-full h-[440px] bg-cover bg-center relative"
                style={{ backgroundImage: `url('${MAP_IMAGE}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent" />

                <div className="absolute top-space-md left-space-md right-space-md flex items-center justify-between">
                  <div className="flex items-center gap-space-xs bg-surface-canvas/95 backdrop-blur-md px-space-sm py-space-2xs rounded-full shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text animate-pulse" />
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      {live ? `${areaName || 'Your area'} • Live` : `FCT Zone • ${selected.name} Sector Active`}
                    </span>
                  </div>
                  {!live && (
                    <div className="flex items-center gap-space-2xs bg-primary-container text-on-primary px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm shadow-md font-semibold">
                      <Icon name="local_offer" className="text-[16px]" />
                      <span>142 Offers Nearby</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full bg-primary-container/15 animate-ping absolute" />
                    <div className="w-32 h-32 rounded-full bg-primary-container/25 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg border-2 border-surface-canvas">
                        <Icon name="storefront" filled className="text-[28px]" />
                      </div>
                    </div>
                  </div>
                </div>

                {!live && (
                <>
                <div className="absolute top-28 left-16 flex items-center gap-space-2xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded-lg shadow-md animate-bounce">
                  <Icon name="local_cafe" filled className="text-tertiary-container text-[16px]" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Cafe Neo • -25%</span>
                </div>
                <div className="absolute bottom-28 right-16 flex items-center gap-space-2xs bg-surface-canvas/90 backdrop-blur-md px-space-xs py-1 rounded-lg shadow-md">
                  <Icon name="shopping_bag" filled className="text-badge-discount-text text-[16px]" />
                  <span className="font-caption text-caption font-semibold text-text-primary">Grand Square • BOGO</span>
                </div>
                </>
                )}

                <div className="absolute bottom-space-md left-space-md right-space-md bg-surface-canvas/95 backdrop-blur-xl p-space-md rounded-xl shadow-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-bold text-text-primary">
                      {live ? areaName || 'Your area' : selected.deckTitle}
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      {live ? 'Deals nearest to this area show first' : 'Estimated coverage radius: 4.8 km around center point'}
                    </span>
                  </div>
                  <Icon name="verified" className="text-primary text-[24px]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-md">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-canvas shadow-[0_4px_16px_-2px_rgba(13,37,76,0.04)] text-center"
                >
                  <Icon name={stat.icon} className={`${stat.tint} text-[24px] mb-1`} />
                  <span className="font-heading-lg text-heading-lg font-bold text-text-primary">{stat.value}</span>
                  <span className="font-caption text-caption text-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-subtle">
              <img
                alt="Portrait of Tunde B., a neighborhood business manager in Abuja"
                className="w-12 h-12 rounded-full object-cover shrink-0 bg-surface-container"
                src={TESTIMONIAL_AVATAR}
              />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-text-primary">
                  “VEMTAP helped us serve 400+ neighborhood regulars in Apo.”
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Tunde B. • Manager at Apo Green Market
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} icon="location_off" />
    </DesktopPage>
  );
}
