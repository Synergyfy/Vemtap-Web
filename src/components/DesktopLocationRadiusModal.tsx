import { useState } from 'react';
import { Icon } from './ui/Icon';

interface DesktopLocationRadiusModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Reports the chosen district and radius. Previously the modal only exposed
   * `onClose`, so the selection was discarded and every header label stayed
   * permanently hardcoded to "Apo, Abuja • Within 5 km".
   */
  onApply?: (district: string, radius: number) => void;
  district?: string;
  radius?: number;
}

const DISTANCE_CHIPS = [2, 5, 10, 15, 25];
const DISTRICTS = ['Apo', 'Maitama', 'Wuse II', 'Garki', 'Jabi', 'Central Area'];

function metricsFor(km: number) {
  return {
    deals: Math.max(8, Math.round(km * 6.8)),
    stores: Math.max(4, Math.round(km * 3.6)),
  };
}

export function DesktopLocationRadiusModal({
  open,
  onClose,
  onApply,
  district: districtProp,
  radius: radiusProp,
}: DesktopLocationRadiusModalProps) {
  const [radius, setRadius] = useState(radiusProp ?? 5);
  const [district, setDistrict] = useState(districtProp ?? 'Apo');
  const [query, setQuery] = useState(`${districtProp ?? 'Apo'}, Abuja`);

  if (!open) {
    return null;
  }

  const metrics = metricsFor(radius);

  const selectDistrict = (name: string) => {
    setDistrict(name);
    setQuery(`${name}, Abuja`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-on-surface/40 backdrop-blur-md">
      <div className="relative w-full max-w-[580px] bg-surface-canvas rounded-[20px] shadow-[0_20px_50px_rgba(17,24,39,0.14)] overflow-hidden flex flex-col transition-all duration-300">
        <div className="h-1.5 w-full bg-primary-container" />

        <div className="px-space-xl pt-space-xl pb-space-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-space-xs">
              <Icon name="explore" className="text-primary text-[22px]" />
              <h2 className="font-heading-lg text-heading-lg font-bold text-text-primary">Location &amp; Radius</h2>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Set your area to discover local Abuja deals and verified stores
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container flex items-center justify-center transition-colors"
            type="button"
            onClick={onClose}
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="px-space-xl py-space-md space-y-space-lg max-h-[calc(88vh-160px)] overflow-y-auto">
          <button
            className="w-full bg-surface-tint-blue rounded-xl p-space-md flex items-center justify-between cursor-pointer hover:bg-secondary-fixed/50 transition-colors text-left"
            type="button"
            onClick={() => selectDistrict('Apo')}
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <Icon name="my_location" className="text-[24px]" />
              </div>
              <div>
                <div className="flex items-center gap-space-2xs">
                  <span className="font-heading-sm text-heading-sm font-semibold text-text-primary">Auto-Detect Location</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" /> GPS Active
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary mt-0.5">Apo District, Abuja • High Precision</p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
              <Icon name="check" className="text-[18px]" />
            </div>
          </button>

          <div className="space-y-space-2xs">
            <label className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1" htmlFor="district-search-field">
              <span>Or Select / Search District</span>
              <span className="font-caption text-caption font-normal text-text-tertiary">(Abuja Municipal)</span>
            </label>
            <div className="relative flex items-center w-full">
              <Icon name="location_city" className="absolute left-space-md text-outline text-[20px] pointer-events-none" />
              <input
                className="w-full h-[52px] pl-12 pr-11 bg-surface-subtle rounded-xl text-text-primary font-body-md text-body-md outline-none focus:bg-surface-canvas focus:ring-2 focus:ring-primary-container/20 transition-all"
                id="district-search-field"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                aria-label="Clear district input"
                className="absolute right-3 w-8 h-8 rounded-full text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors"
                type="button"
                onClick={() => setQuery('')}
              >
                <Icon name="cancel" className="text-[18px]" />
              </button>
            </div>
          </div>

          <div className="space-y-space-xs">
            <span className="font-caption text-caption uppercase tracking-wider text-text-tertiary font-semibold">
              Popular Abuja Hubs
            </span>
            <div className="flex flex-wrap gap-space-xs">
              {DISTRICTS.map((name) => {
                const active = name === district;
                return (
                  <button
                    key={name}
                    className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-semibold flex items-center gap-1 shadow-sm'
                        : 'bg-surface-subtle hover:bg-surface-container text-text-secondary'
                    }`}
                    type="button"
                    onClick={() => selectDistrict(name)}
                  >
                    {active ? (
                      <>
                        <Icon name="check_circle" className="text-[15px]" />
                        {name} (Selected)
                      </>
                    ) : (
                      name
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-space-sm pt-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="radar" className="text-text-secondary text-[20px]" />
                <label className="font-label-md text-label-md font-semibold text-text-primary" htmlFor="radius-slider">
                  Discovery Radius
                </label>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-bold">
                Within {radius} km
              </span>
            </div>

            <div className="space-y-space-2xs py-space-xs">
              <div className="relative w-full flex items-center">
                <input
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container focus:outline-none"
                  id="radius-slider"
                  max="25"
                  min="1"
                  step="1"
                  type="range"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                />
              </div>
              <div className="flex justify-between items-center text-text-tertiary font-caption text-caption px-1">
                <span>1 km (Walking)</span>
                <span>10 km (Quick Ride)</span>
                <span>25 km (Greater Abuja)</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-space-xs">
              {DISTANCE_CHIPS.map((value) => {
                const active = value === radius;
                return (
                  <button
                    key={value}
                    className={`py-space-xs text-center rounded-xl font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-bold shadow-sm'
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => setRadius(value)}
                  >
                    {value} km
                  </button>
                );
              })}
            </div>

            <div className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm mt-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="storefront" className="text-[20px]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-body-md text-body-md text-text-primary font-medium">
                  Found <span className="text-primary font-bold">{metrics.deals} active deals</span> and{' '}
                  <span className="text-primary font-bold">{metrics.stores} local businesses</span> within {radius} km of{' '}
                  {district} District.
                </p>
                <p className="font-caption text-caption text-text-secondary">
                  Deals automatically refresh as you navigate around Abuja.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-space-xl pt-space-sm pb-space-lg space-y-space-xs bg-surface-canvas">
          <button
            className="w-full h-[52px] rounded-2xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs"
            type="button"
            onClick={() => {
              // Prefer whatever the customer actually typed; fall back to the
              // district chip they last tapped.
              const typed = query.trim().replace(/,.*$/, '').trim();
              onApply?.(typed || district, radius);
              onClose();
            }}
          >
            <Icon name="near_me" className="text-[20px]" />
            <span>Apply Location &amp; Radius ({metrics.deals} Deals)</span>
          </button>
          <div className="text-center pt-1">
            <button
              className="text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors"
              type="button"
              onClick={onClose}
            >
              Cancel &amp; Keep {district} ({radius} km)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
