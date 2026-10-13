import { useState } from 'react';
import { Icon } from './ui/Icon';

export interface LocationRadiusModalProps {
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

const POPULAR_DISTRICTS = ['Apo', 'Maitama', 'Wuse II', 'Garki', 'Jabi'];

const RADIUS_PRESETS = [2, 5, 10, 15, 25];

const DEALS_BY_RADIUS: { radius: number; deals: number }[] = [
  { radius: 1, deals: 8 },
  { radius: 2, deals: 14 },
  { radius: 5, deals: 34 },
  { radius: 10, deals: 57 },
  { radius: 15, deals: 74 },
  { radius: 25, deals: 96 },
];

function dealsForRadius(radius: number): number {
  const first = DEALS_BY_RADIUS[0];
  const last = DEALS_BY_RADIUS[DEALS_BY_RADIUS.length - 1];
  if (radius <= first.radius) return first.deals;
  if (radius >= last.radius) return last.deals;
  for (let i = 1; i < DEALS_BY_RADIUS.length; i += 1) {
    const prev = DEALS_BY_RADIUS[i - 1];
    const next = DEALS_BY_RADIUS[i];
    if (radius <= next.radius) {
      const ratio = (radius - prev.radius) / (next.radius - prev.radius);
      return Math.round(prev.deals + ratio * (next.deals - prev.deals));
    }
  }
  return last.deals;
}

export function LocationRadiusModal({
  open,
  onClose,
  onApply,
  district: districtProp,
  radius: radiusProp,
}: LocationRadiusModalProps) {
  const [radius, setRadius] = useState(radiusProp ?? 5);
  const [district, setDistrict] = useState(districtProp ?? 'Apo');
  const [query, setQuery] = useState(`${districtProp ?? 'Apo'}, Abuja`);
  const [gpsActive, setGpsActive] = useState(true);

  if (!open) return null;

  const sliderPercent = (radius / 25) * 100;
  const deals = dealsForRadius(radius);

  const selectDistrict = (name: string) => {
    setDistrict(name);
    setQuery(`${name}, Abuja`);
    setGpsActive(false);
  };

  const useAutoDetect = () => {
    setDistrict('Apo');
    setQuery('Apo, Abuja');
    setGpsActive(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Location and Radius"
    >
      <button
        aria-label="Close location and radius"
        type="button"
        onClick={onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
      />
      <div className="relative w-full max-w-[430px] mx-auto max-h-[88vh] bg-surface-container-lowest rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-t border-subtle">
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/60" />
        </div>
        <div className="flex items-center justify-between px-margin py-2.5 border-b border-subtle">
          <div className="flex flex-col">
            <h2 className="font-heading-sm text-heading-sm text-text-primary">Location &amp; Radius</h2>
            <p className="font-caption text-caption text-text-secondary">
              Set your area to discover local Abuja deals
            </p>
          </div>
          <button
            aria-label="Close"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="overflow-y-auto px-margin py-4 space-y-5">
          <button
            type="button"
            onClick={useAutoDetect}
            className="w-full p-3.5 rounded-2xl bg-surface-tint-blue border border-border-active flex items-center justify-between text-left transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="my_location" className="text-[20px]" filled />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md text-text-primary font-semibold">
                    Auto-Detect Location
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[10px] font-bold uppercase tracking-wider">
                    Active GPS
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary truncate pt-0.5">
                  Apo District, Abuja • High Precision
                </span>
              </div>
            </div>
            {gpsActive && <Icon name="check_circle" className="text-primary text-[20px]" filled />}
          </button>

          <div className="flex flex-col space-y-2.5">
            <label
              className="font-label-sm text-label-sm text-text-primary font-semibold"
              htmlFor="location-radius-search"
            >
              Or Select / Search District
            </label>
            <div className="flex items-center h-11 px-3.5 rounded-xl bg-surface-container-low border border-subtle focus-within:border-primary focus-within:bg-surface-canvas focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Icon name="search" className="text-text-tertiary text-[20px] mr-2" />
              <input
                id="location-radius-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, district, or landmark"
                className="w-full bg-transparent border-none outline-none font-body-md text-[14px] text-text-primary placeholder:text-text-tertiary"
              />
              <button
                aria-label="Clear search"
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-text-tertiary hover:text-text-secondary"
              >
                <Icon name="cancel" className="text-[16px]" />
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              <span className="font-caption text-caption text-text-tertiary shrink-0">Popular:</span>
              {POPULAR_DISTRICTS.map((name) => {
                const isSelected = district === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectDistrict(name)}
                    className={
                      isSelected
                        ? 'shrink-0 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-caption text-[12px] font-medium'
                        : 'shrink-0 px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-[12px] font-medium border border-subtle'
                    }
                  >
                    {isSelected ? `${name} (Selected)` : name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-subtle space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="radar" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Discovery Radius
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-[12px] font-bold shadow-sm">
                <Icon name="near_me" className="text-[14px]" />
                <span>Within {radius} km</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="relative w-full h-3 flex items-center">
                <div className="w-full h-2 rounded-full bg-surface-container-highest" />
                <div
                  className="absolute left-0 h-2 rounded-full bg-primary"
                  style={{ width: `${sliderPercent}%` }}
                />
                <div
                  className="absolute w-6 h-6 rounded-full bg-surface-canvas border-2 border-primary shadow-md flex items-center justify-center"
                  style={{ left: `calc(${sliderPercent}% - 12px)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <input
                  aria-label="Discovery radius in kilometers"
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-center text-text-tertiary font-caption text-[11px] pt-1">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>15 km</span>
                <span>20 km</span>
                <span>25 km</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {RADIUS_PRESETS.map((preset) => {
                const isActive = radius === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRadius(preset)}
                    className={
                      isActive
                        ? 'py-1.5 px-1 rounded-lg bg-primary-container text-on-primary font-caption text-[12px] text-center font-bold shadow-sm ring-1 ring-primary/20'
                        : 'py-1.5 px-1 rounded-lg bg-surface-container-lowest text-text-secondary border border-subtle font-caption text-[12px] text-center font-medium hover:border-primary'
                    }
                  >
                    {preset} km
                  </button>
                );
              })}
            </div>

            <div className="flex items-start gap-2 pt-1 font-caption text-caption text-text-secondary bg-surface-container-lowest/80 p-2.5 rounded-xl border border-subtle">
              <Icon name="info" className="text-primary text-[18px] shrink-0" />
              <span>
                Found <strong>{deals} active deals</strong> and <strong>18 local businesses</strong>{' '}
                within {radius} km of {district} District.
              </span>
            </div>
          </div>
        </div>

        <div className="p-margin pt-2 border-t border-subtle bg-surface-container-lowest space-y-2">
          <button
            type="button"
            onClick={() => {
              // Prefer whatever the customer actually typed; fall back to the
              // district chip they last tapped.
              const typed = query.trim().replace(/,.*$/, '').trim();
              onApply?.(typed || district, radius);
              onClose();
            }}
            className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary font-semibold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Icon name="tune" className="text-[20px]" />
            <span>Apply Location &amp; Radius ({deals} Deals)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center font-label-md text-label-md text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel &amp; Keep {district} ({radius} km)
          </button>
        </div>
      </div>
    </div>
  );
}
