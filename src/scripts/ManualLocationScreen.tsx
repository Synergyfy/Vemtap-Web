import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface ManualLocationScreenProps {
  onBack: () => void;
  onContinue: (area: string) => void;
  onBusinessSetup: () => void;
}

interface Area {
  name: string;
  region: string;
  distance: string;
}

const AREAS: Area[] = [
  { name: 'Apo', region: 'Abuja, Federal Capital Territory', distance: '0.0 mi' },
  { name: 'Wuse 2', region: 'Abuja, Federal Capital Territory', distance: '3.4 mi' },
  { name: 'Maitama', region: 'Abuja, Federal Capital Territory', distance: '5.1 mi' },
  { name: 'Garki', region: 'Abuja, Federal Capital Territory', distance: '2.8 mi' },
  { name: 'Jabi', region: 'Abuja, Federal Capital Territory', distance: '4.9 mi' },
];

const MAP_PREVIEW =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3Eip6-YwMGMr2STXR6NjlkIqAII-LD6sDRlFtXw1cLegLNfxlrmjWW3_R4ir5If1ILMCOKRblbw-mPNO5b4ZqiYtRZTW4fx3DfV3OJP1xkSpbZi-3n4nhrNamAFwmWpn6j-iMdtSwNtst62BEsQIhY-iFIHUFeoVlc1WMw6MXAFuRMlfE5nRb9_W9qU-SugFifXcvYXdLR_4slYxxsMxl-XAzfoS4_q9U0gzdusyvc5fnBJBGBHcTMQ';

export function ManualLocationScreen({ onBack, onContinue, onBusinessSetup }: ManualLocationScreenProps) {
  const [query, setQuery] = useState('Apo');
  const [selected, setSelected] = useState('Apo');

  const filtered = AREAS.filter((area) => area.name.toLowerCase().includes(query.trim().toLowerCase()));

  const handleUseCurrentLocation = () => {
    setQuery('Apo');
    setSelected('Apo');
  };

  return (
    <AppScreen>
      <ScreenHeader title="Select Neighborhood" onBack={onBack} />

      <div className="flex flex-col w-full flex-1">
        <div className="px-margin flex flex-col pt-space-xs pb-space-lg">
          <div className="flex flex-col gap-space-2xs mb-space-lg">
            <div className="inline-flex items-center gap-space-2xs self-start px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary mb-space-2xs">
              <Icon name="near_me" className="text-[16px]" />
              <span className="font-label-sm text-label-sm font-medium">Hyper-local Discovery</span>
            </div>
            <h2 className="font-heading-lg text-heading-lg text-on-surface">Where are you?</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              Enter a city, area or location to discover what's nearby.
            </p>
          </div>

          <div className="relative w-full mb-space-md">
            <div
              className="w-full h-[54px] rounded-xl bg-surface-container-lowest shadow-sm flex items-center px-space-md gap-space-xs transition-all duration-200 shadow-[0_4px_20px_-2px_rgba(6,108,244,0.18)]"
              style={{ outline: '2px solid #066cf4', outlineOffset: '-1px' }}
            >
              <Icon name="search" className="text-primary-container text-[22px]" />
              <input
                aria-label="Search city, area or location"
                className="flex-1 bg-transparent border-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-text-tertiary"
                id="location-search-input"
                placeholder="Search city, area or location"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                aria-label="Clear search input"
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-on-surface active:scale-95 transition-all"
                id="clear-search-btn"
                type="button"
                onClick={() => setQuery('')}
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
          </div>

          <div className="w-full h-24 rounded-xl overflow-hidden mb-space-lg relative shadow-sm">
            <div
              className="w-full h-full bg-cover bg-center"
              data-location="Apo, Abuja, Nigeria"
              style={{ backgroundImage: `url('${MAP_PREVIEW}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-on-surface/20 to-transparent flex items-end p-space-sm justify-between">
              <div className="flex items-center gap-space-xs text-on-primary">
                <Icon name="explore" className="text-[18px] text-tertiary-fixed" />
                <span className="font-label-sm text-label-sm font-semibold tracking-wide text-on-primary">
                  FCT Zone • Apo Sector Active
                </span>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                142 Offers Nearby
              </span>
            </div>
          </div>

          <div className="w-full mb-space-lg">
            <button
              className="w-full p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.99] transition-all flex items-center gap-space-sm text-left"
              id="use-current-location-btn"
              type="button"
              onClick={handleUseCurrentLocation}
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
                <Icon name="my_location" filled className="text-[20px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-button-secondary text-button-secondary text-on-surface">Use Current Location</div>
                <div className="font-caption text-caption text-text-secondary truncate">
                  GPS accurate • Instant local calibration
                </div>
              </div>
              <Icon name="chevron_right" className="text-outline text-[20px]" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider font-semibold">
              Suggested Areas
            </span>
            <span className="font-caption text-caption text-primary font-medium">Abuja Urban Core</span>
          </div>

          <div aria-label="Suggested areas" className="flex flex-col gap-space-xs" id="locations-list" role="radiogroup">
            {filtered.map((area) => {
              const isSelected = selected === area.name;
              return (
                <div
                  key={area.name}
                  aria-checked={isSelected}
                  className={`location-option w-full p-space-sm rounded-xl shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    isSelected ? 'bg-surface-tint-blue' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                  data-area={area.name}
                  role="radio"
                  tabIndex={0}
                  style={isSelected ? { boxShadow: 'inset 0 0 0 1.5px #066cf4' } : undefined}
                  onClick={() => setSelected(area.name)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelected(area.name);
                    }
                  }}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-secondary'
                      }`}
                    >
                      <Icon name="location_on" filled={isSelected} className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs">
                        <span
                          className={`truncate ${isSelected ? 'font-heading-sm text-heading-sm text-primary font-semibold' : 'font-button-secondary text-button-secondary text-on-surface'}`}
                        >
                          {area.name}
                        </span>
                        {isSelected && (
                          <span className="font-caption text-caption px-space-2xs py-0.5 rounded bg-primary text-on-primary font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate">{area.region}</p>                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
                      <Icon name="check" className="text-[16px]" />
                    </div>
                  ) : (
                    <span className="font-caption text-caption text-text-tertiary">{area.distance}</span>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="w-full p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-sm">
                <Icon name="search_off" className="text-secondary text-[20px]" />
                <span className="font-body-md text-body-md text-text-secondary">
                  No areas match "{query}". Try another neighborhood.
                </span>
              </div>
            )}
          </div>

          <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <Icon name="bolt" className="text-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface font-semibold">Active Flash Drops</p>
              <p className="font-caption text-caption text-text-secondary truncate">
                Local merchant vouchers refreshing in Apo every 20 mins.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 w-full px-margin pt-space-xs pb-space-lg bg-gradient-to-t from-surface via-surface/95 to-transparent backdrop-blur-md mt-auto">
          <div className="flex flex-col gap-space-xs">
            <button
              className="w-full h-[54px] rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary font-semibold flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              id="continue-cta-btn"
              type="button"
              disabled={!selected}
              onClick={() => selected && onContinue(selected)}
            >
              <span>Continue with {selected || 'an area'}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <div className="flex items-center justify-center pt-space-2xs">
              <span className="font-caption text-caption text-text-secondary">Own a local venue?</span>
              <button
                className="ml-1 font-caption text-caption text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                type="button"
                onClick={onBusinessSetup}
              >
                <span>Set up on VEMTAP</span>
                <Icon name="arrow_forward" className="text-[12px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
