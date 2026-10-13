import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

interface BusinessDealAssignmentScreenProps {
  onBack: () => void;
}

const fmt = (value: number) => value.toLocaleString('en-US');

export function BusinessDealAssignmentScreen({ onBack }: BusinessDealAssignmentScreenProps) {
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  const [locationPricing, setLocationPricing] = useState(true);
  const [wusePrice, setWusePrice] = useState('9,600');
  const [maitamaPrice, setMaitamaPrice] = useState('10,200');
  const [wuseChecked, setWuseChecked] = useState(true);
  const [maitamaChecked, setMaitamaChecked] = useState(true);
  const [saving, setSaving] = useState<'idle' | 'syncing' | 'saved'>('idle');

  const parsePrice = (value: string) => {
    const parsed = Number(value.replace(/[^\d.]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const discount = (price: string, original: number) => {
    const current = parsePrice(price);
    if (current <= 0 || current >= original) return { pct: '0', diff: 0 };
    const diff = original - current;
    const pct = ((diff / original) * 100).toFixed(1);
    return { pct, diff };
  };

  const handlePriceChange = (setter: (value: string) => void) => (value: string) => {
    const digits = value.replace(/[^\d]/g, '');
    setter(digits.replace(/(\d)(?=(\d{3})+$)/g, '$1,'));
  };

  const handleSave = () => {
    if (saving !== 'idle') return;
    setSaving('syncing');
    window.setTimeout(() => setSaving('saved'), 900);
    window.setTimeout(() => setSaving('idle'), 2400);
  };

  const wuseDiscount = discount(wusePrice, 12000);
  const maitamaDiscount = discount(maitamaPrice, 13000);

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-xs flex items-center justify-between gap-space-2xs">
          <button
            aria-label="Go back"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <h1 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate flex-1 text-center">
            Location Assignment & Pricing
          </h1>
          <div className="flex items-center gap-space-2xs shrink-0">
            <button
              aria-label="More actions"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-8">
        {/* Deal Context Banner */}
        <div className="px-margin pt-space-md pb-space-sm bg-surface-container-low">
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-fixed text-primary shrink-0 shadow-sm">
                <Icon name="restaurant_menu" className="text-[18px]" />
              </span>
              <div className="min-w-0">
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider block font-medium">
                  Deal Context
                </span>
                <h2 className="font-heading-sm text-heading-sm text-on-surface truncate font-semibold">
                  Weekend Prime Lunch Combo
                </h2>
              </div>
            </div>
            <span className="inline-flex items-center px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold shrink-0">
              Draft Deal
            </span>
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-lg pt-space-lg">
          {/* Scope */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                Where is this deal available?
              </h3>
              <span className="font-caption text-caption text-primary font-medium">Step 2 of 3</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <button
                className={`flex items-start gap-space-sm p-space-md rounded-xl shadow-sm cursor-pointer transition-all text-left w-full ${
                  scope === 'selected' ? 'bg-surface-tint-blue' : 'bg-surface-container-low opacity-90'
                }`}
                type="button"
                onClick={() => setScope('selected')}
              >
                <div className="pt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${scope === 'selected' ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    {scope === 'selected' && <div className="w-2 h-2 rounded-full bg-surface-container-lowest" />}
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span
                      className={`font-button-secondary text-button-secondary font-semibold ${
                        scope === 'selected' ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      Selected locations
                    </span>
                    <span className="inline-flex items-center px-space-2xs py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-caption font-semibold shrink-0">
                      Custom Matrix
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                    Choose specific branches and adjust pricing per location
                  </p>
                </div>
              </button>
              <button
                className={`flex items-start gap-space-sm p-space-md rounded-xl shadow-sm cursor-pointer transition-all text-left w-full ${
                  scope === 'all' ? 'bg-surface-tint-blue' : 'bg-surface-container-low opacity-90'
                }`}
                type="button"
                onClick={() => setScope('all')}
              >
                <div className="pt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${scope === 'all' ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    {scope === 'all' && <div className="w-2 h-2 rounded-full bg-surface-container-lowest" />}
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span
                      className={`font-button-secondary text-button-secondary font-semibold ${
                        scope === 'all' ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      All locations (3 Branches)
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">Uniform</span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-space-2xs">
                    Apply uniform deal terms across all active business branches
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Location-specific pricing toggle */}
          <section className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between gap-space-md">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-space-xs">
                <Icon name="tune" className="text-primary text-[20px]" />
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Use different price for selected locations
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-space-2xs leading-relaxed">
                Allow each branch to set custom deal pricing or discounts based on operating costs or prime district
                rent.
              </p>
            </div>
            <button
              aria-checked={locationPricing}
              className={`w-12 h-7 rounded-full relative p-0.5 shrink-0 transition-colors ${locationPricing ? 'bg-primary' : 'bg-surface-variant'}`}
              role="switch"
              type="button"
              onClick={() => setLocationPricing((on) => !on)}
            >
              <span
                className={`w-6 h-6 rounded-full bg-surface-container-lowest block shadow-md transition-transform ${locationPricing ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </section>

          {/* Branch Pricing Matrix */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Branch Pricing Matrix</h3>
                <p className="font-caption text-caption text-text-secondary">2 of 3 branches participating</p>
              </div>
              <div className="flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                <span>Sync Active</span>
              </div>
            </div>

            <div className="flex flex-col gap-space-md">
              {/* Wuse II */}
              <article className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-start gap-space-xs min-w-0">
                    <button
                      className={`relative flex items-center justify-center w-6 h-6 rounded-lg shrink-0 mt-0.5 cursor-pointer shadow-xs transition-colors ${
                        wuseChecked ? 'bg-primary text-on-primary' : 'bg-surface-variant text-text-tertiary'
                      }`}
                      type="button"
                      onClick={() => setWuseChecked((checked) => !checked)}
                    >
                      <Icon name={wuseChecked ? 'check' : 'block'} className="text-[18px]" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <h4 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          Wuse II Flagship Branch
                        </h4>
                        <span className="px-space-2xs py-0.5 rounded bg-surface-container text-on-secondary-container font-caption text-caption font-medium">
                          Headquarters
                        </span>
                      </div>
                      <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption mt-1 truncate">
                        <Icon name="location_on" className="text-[14px] shrink-0 text-text-tertiary" />
                        <span className="truncate">Plot 12 Ademola Adetokunbo Crescent, Wuse II</span>
                      </div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 mt-2" title="Operational" />
                </div>
                {wuseChecked && (
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-sm">
                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-caption text-caption text-text-secondary font-medium">Deal Price</span>
                        <div className="relative flex items-center rounded-lg bg-surface-container-lowest shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                          <span className="pl-space-xs font-label-md text-label-md text-text-secondary font-semibold">₦</span>
                          <input
                            className="w-full py-2 px-space-2xs bg-transparent font-button-primary text-button-primary text-on-surface font-semibold outline-none"
                            inputMode="numeric"
                            type="text"
                            value={wusePrice}
                            onChange={(event) => handlePriceChange(setWusePrice)(event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-caption text-caption text-text-secondary font-medium">Original Price</span>
                        <div className="py-2 px-space-xs rounded-lg bg-surface-variant flex items-center justify-between">
                          <span className="font-button-secondary text-button-secondary text-text-secondary line-through font-medium">
                            ₦12,000
                          </span>
                          <span className="font-caption text-caption text-text-tertiary">MSRP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 gap-space-xs">
                      <div className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        <Icon name="local_offer" className="text-[14px]" />
                        <span>
                          {wuseDiscount.pct}% OFF (-₦{fmt(wuseDiscount.diff)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                        <Icon name="confirmation_number" className="text-[15px] text-text-tertiary" />
                        <span className="font-medium text-on-surface">30</span>
                        <span>vouchers / day</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              {/* Maitama */}
              <article className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-start gap-space-xs min-w-0">
                    <button
                      className={`relative flex items-center justify-center w-6 h-6 rounded-lg shrink-0 mt-0.5 cursor-pointer shadow-xs transition-colors ${
                        maitamaChecked ? 'bg-primary text-on-primary' : 'bg-surface-variant text-text-tertiary'
                      }`}
                      type="button"
                      onClick={() => setMaitamaChecked((checked) => !checked)}
                    >
                      <Icon name={maitamaChecked ? 'check' : 'block'} className="text-[18px]" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <h4 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          Maitama Heights Branch
                        </h4>
                        <span className="inline-flex items-center gap-1 px-space-2xs py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-caption text-caption font-semibold">
                          <Icon name="star" className="text-[12px]" />
                          Custom Branch Price
                        </span>
                      </div>
                      <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption mt-1 truncate">
                        <Icon name="location_on" className="text-[14px] shrink-0 text-text-tertiary" />
                        <span className="truncate">Plot 14 Amazon Street, Maitama, Abuja</span>
                      </div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text shrink-0 mt-2" title="Operational" />
                </div>
                {maitamaChecked && (
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-sm">
                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-caption text-caption text-text-secondary font-medium">
                          Deal Price (Premium Tier)
                        </span>
                        <div className="relative flex items-center rounded-lg bg-surface-container-lowest shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                          <span className="pl-space-xs font-label-md text-label-md text-text-secondary font-semibold">₦</span>
                          <input
                            className="w-full py-2 px-space-2xs bg-transparent font-button-primary text-button-primary text-on-surface font-semibold outline-none"
                            inputMode="numeric"
                            type="text"
                            value={maitamaPrice}
                            onChange={(event) => handlePriceChange(setMaitamaPrice)(event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-caption text-caption text-text-secondary font-medium">Original Price</span>
                        <div className="py-2 px-space-xs rounded-lg bg-surface-variant flex items-center justify-between">
                          <span className="font-button-secondary text-button-secondary text-text-secondary line-through font-medium">
                            ₦13,000
                          </span>
                          <span className="font-caption text-caption text-text-tertiary">Local</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 gap-space-xs">
                      <div className="inline-flex items-center gap-1 px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                        <Icon name="local_offer" className="text-[14px]" />
                        <span>
                          {maitamaDiscount.pct}% OFF (-₦{fmt(maitamaDiscount.diff)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                        <Icon name="confirmation_number" className="text-[15px] text-text-tertiary" />
                        <span className="font-medium text-on-surface">20</span>
                        <span>vouchers / day</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              {/* Garki (disabled) */}
              <article className="p-space-md rounded-xl bg-surface-container-low opacity-75 shadow-xs flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex items-start gap-space-xs min-w-0">
                    <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-surface-variant text-text-tertiary shrink-0 mt-0.5 cursor-not-allowed">
                      <Icon name="block" className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <h4 className="font-label-md text-label-md text-text-secondary font-medium truncate">
                          Garki Area 11 Branch
                        </h4>
                        <span className="px-space-2xs py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption font-semibold">
                          Unavailable
                        </span>
                      </div>
                      <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption mt-1 truncate">
                        <Icon name="location_on" className="text-[14px] shrink-0" />
                        <span className="truncate">Suite 4 Commercial Arcade, Garki Area 11</span>
                      </div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-error shrink-0 mt-2" title="Temporarily Offline" />
                </div>
                <div className="mt-space-2xs p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="handyman" className="text-tertiary text-[18px] shrink-0" />
                    <span className="font-caption text-caption text-text-secondary truncate">
                      Kitchen maintenance until next month
                    </span>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary shrink-0">Deal Paused</span>
                </div>
              </article>
            </div>
          </section>

          {/* Continuity Callout */}
          <section className="p-space-md rounded-xl bg-surface-container-high flex items-start gap-space-sm shadow-xs">
            <Icon name="sync_alt" className="text-primary text-[22px] shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                Catalog Continuity & POS Real-time Sync
              </h4>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                Uses same location-assignment logic as Products & Services catalog. Location availability automatically
                syncs with POS terminals in real time.
              </p>
            </div>
          </section>

          {/* Actions */}
          <section className="pt-space-xs pb-space-xl flex flex-col gap-space-xs">
            <button
              className={`w-full h-[54px] rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-lg transition-all active:scale-[0.99] ${
                saving === 'saved' ? 'bg-badge-discount-text text-on-primary' : 'bg-primary-container text-on-primary'
              }`}
              type="button"
              onClick={handleSave}
            >
              {saving === 'syncing' && (
                <>
                  <Icon name="sync" className="animate-spin text-[20px]" />
                  <span>Syncing with Branches...</span>
                </>
              )}
              {saving === 'saved' && (
                <>
                  <Icon name="check_circle" className="text-[20px]" />
                  <span>Assignment Saved & Synced!</span>
                </>
              )}
              {saving === 'idle' && (
                <>
                  <span>Save Location Assignment & Pricing</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
            </button>
            <button
              className="w-full h-[44px] rounded-xl bg-transparent text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary flex items-center justify-center transition-colors"
              type="button"
              onClick={onBack}
            >
              Cancel changes
            </button>
          </section>
        </div>
      </div>
    </AppScreen>
  );
}
