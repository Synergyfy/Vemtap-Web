import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { useLocation } from '../context/LocationContext';
import { useHomeDealCategories } from '../hooks/useHomeDealCategories';
import { useFilterDraft } from '../hooks/useFilterDraft';
import { UserAvatar } from '../components/ui/UserAvatar';

const DISTANCES: { label: string; km: number | null }[] = [
  { label: 'Near Me', km: null },
  { label: '1 km', km: 1 },
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
];

const PRICE_TIERS: { label: string; min?: number; max?: number }[] = [
  { label: 'Any Price' },
  { label: 'Under ₦5,000', max: 5000 },
  { label: '₦5,000 – ₦20,000', min: 5000, max: 20000 },
  { label: '₦20,000 – ₦50,000', min: 20000, max: 50000 },
  { label: '₦50,000+', min: 50000 },
];

const DISCOUNTS: { label: string; value?: number }[] = [
  { label: 'Any Discount' },
  { label: '10%+', value: 10 },
  { label: '20%+', value: 20 },
  { label: '30%+', value: 30 },
  { label: '50%+ Hot Deals', value: 50 },
];

/** Timing is checked against each offer's own start and end dates. */
const AVAILABILITY: { key: 'availableNow' | 'endingSoon'; label: string; detail: string; icon: string }[] = [
  { key: 'availableNow', label: 'Available Now', detail: 'Already started and ready to claim', icon: 'bolt' },
  { key: 'endingSoon', label: 'Ending Soon', detail: 'Expiring within 24 hours', icon: 'hourglass_top' },
];

export interface FiltersScreenProps {
  onClose: () => void;
}

export function FiltersScreen({ onClose }: FiltersScreenProps) {
  const { city, district } = useLocation();
  const { categories: liveCategories } = useHomeDealCategories();
  const categories = liveCategories.filter((category) => category.id !== null);
  const filter = useFilterDraft(onClose);
  const { draft, radius } = filter;
  const distanceIndex = !draft.strictDistance ? 0 : DISTANCES.findIndex((item) => item.km === radius);
  const priceIndex = PRICE_TIERS.findIndex((tier) => tier.min === draft.minPrice && tier.max === draft.maxPrice);
  const discountIndex = DISCOUNTS.findIndex((item) => item.value === draft.minDiscount);
  const locationLabel = [city, district].filter(Boolean).join(', ') || 'Your area';

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-14 px-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Close filters"
              type="button"
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <Icon name="close" className="text-[24px]" />
            </button>
            <span className="font-heading-sm text-heading-sm text-on-surface tracking-tight font-semibold">Filters</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={filter.reset}
              className="h-11 px-space-sm flex items-center justify-center text-primary font-button-secondary text-button-secondary hover:opacity-80 transition-opacity"
            >
              Reset
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar textClassName="text-on-primary text-[13px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-14 pb-safe bg-surface">
        <div className="flex flex-col w-full pb-32">
          <div className="px-margin flex flex-col gap-space-xl pt-space-md">
            <div className="bg-surface-tint-blue rounded-xl p-space-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-primary-container/15 flex items-center justify-center text-primary-container">
                  <Icon name="tune" className="text-[18px]" />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-text-primary font-semibold">{filter.activeCount} active filter{filter.activeCount === 1 ? '' : 's'}</p>
                  <p className="font-caption text-caption text-text-secondary">{filter.matchText}</p>
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Distance</h2>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Within {radius} km</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  {filter.hasCoordinates ? 'Show deals within your immediate range' : 'Set your location on the home page to filter by distance'}
                </p>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 -mx-margin px-margin no-scrollbar">
                {DISTANCES.map(({ label, km }, index) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!filter.hasCoordinates}
                    onClick={() => filter.chooseDistance(km)}
                    className={
                      index === distanceIndex
                        ? 'h-9 px-space-sm rounded-full bg-surface-tint-blue text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm whitespace-nowrap active:scale-95 transition-all'
                        : 'h-9 px-space-sm rounded-full bg-surface-container text-text-secondary font-label-md text-label-md font-medium whitespace-nowrap active:scale-95 transition-all'
                    }
                  >
                    {index === distanceIndex ? <Icon name="check" className="text-[16px]" /> : null}
                    {label}
                  </button>
                ))}
              </div>
              <div className="bg-surface-canvas rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm mt-1">
                <div className="flex items-center justify-between text-text-secondary font-caption text-caption">
                  <span>Min: 1 km</span>
                  <div className="bg-primary-container text-on-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1">
                    <Icon name="near_me" className="text-[14px]" />
                    <span>{radius} km</span>
                  </div>
                  <span>Max: 25 km</span>
                </div>
                <div className="relative flex items-center py-2">
                  <input
                    className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary-container focus:outline-none"
                    max="25"
                    min="1"
                    type="range"
                    value={radius}
                    disabled={!filter.hasCoordinates}
                    onChange={(event) => filter.chooseDistance(Number(event.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                  <span>{city || 'Nearby'}</span>
                  <span>{district || 'Local area'}</span>
                  <span>Within range</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Category</h2>
                  <p className="font-caption text-caption text-text-secondary">Select a category</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-space-xs">
                {categories.map((category) => {
                  const selected = draft.categoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => filter.patch({ categoryId: selected ? null : category.id })}
                      className={
                        selected
                          ? 'h-10 px-space-sm rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all'
                          : 'h-10 px-space-sm rounded-full bg-surface-canvas text-text-secondary font-label-md text-label-md font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all'
                      }
                    >
                      <Icon
                        name={category.icon ?? 'category'}
                        className={`text-[16px] ${selected ? '' : 'text-text-tertiary'}`}
                      />
                      <span>{category.label}</span>
                      {selected ? <Icon name="check" className="text-[16px] ml-0.5" /> : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-space-sm">
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Price Range</h2>
                <p className="font-caption text-caption text-text-secondary">Nigerian Naira (₦) budget limits</p>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 -mx-margin px-margin no-scrollbar">
                {PRICE_TIERS.map(({ label, min, max }, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => filter.setPrices(min, max)}
                    className={
                      index === priceIndex
                        ? 'h-9 px-space-sm rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-all'
                        : 'h-9 px-space-sm rounded-full bg-surface-container text-text-secondary font-label-md text-label-md font-medium whitespace-nowrap active:scale-95 transition-all'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-space-sm items-center mt-1">
                <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-tertiary font-medium">Minimum</label>
                  <div className="flex items-center gap-1 font-label-md text-label-md text-text-primary font-semibold">
                    <span className="text-text-tertiary">₦</span>
                    <input
                      className="w-full bg-transparent font-semibold focus:outline-none text-text-primary"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      aria-label="Minimum price"
                      value={filter.minPrice}
                      onChange={(event) => filter.typeMin(event.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-tertiary font-medium">Maximum</label>
                  <div className="flex items-center gap-1 font-label-md text-label-md text-text-primary font-semibold">
                    <span className="text-text-tertiary">₦</span>
                    <input
                      className="w-full bg-transparent font-semibold focus:outline-none text-text-primary"
                      type="text"
                      inputMode="numeric"
                      placeholder="No limit"
                      aria-label="Maximum price"
                      value={filter.maxPrice}
                      onChange={(event) => filter.typeMax(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-space-sm">
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Discount Percentage</h2>
                <p className="font-caption text-caption text-text-secondary">Minimum guaranteed reduction</p>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 -mx-margin px-margin no-scrollbar">
                {DISCOUNTS.map(({ label, value }, index) => {
                  const hot = index === 4;
                  if (index === discountIndex) {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => filter.patch({ minDiscount: value })}
                        className="h-9 px-space-sm rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Icon name="check" className="text-[16px]" />
                        {label}
                      </button>
                    );
                  }
                  if (hot) {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => filter.patch({ minDiscount: value })}
                        className="h-9 px-space-sm rounded-full bg-surface-container text-tertiary-container font-label-md text-label-md font-semibold whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Icon name="local_fire_department" className="text-[16px] text-tertiary-container" />
                        {label}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => filter.patch({ minDiscount: value })}
                      className="h-9 px-space-sm rounded-full bg-surface-container text-text-secondary font-label-md text-label-md font-medium whitespace-nowrap active:scale-95 transition-all"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-space-sm">
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Availability &amp; Timing</h2>
                <p className="font-caption text-caption text-text-secondary">Filter by redemption windows and convenience</p>
              </div>
              <div className="flex flex-col gap-space-xs">
                {AVAILABILITY.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={draft[item.key]}
                    onClick={() => filter.patch({ [item.key]: !draft[item.key] })}
                    className="bg-surface-canvas p-space-sm rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div
                        className={
                          draft[item.key]
                            ? 'w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container'
                            : 'w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary'
                        }
                      >
                        <Icon name={item.icon} className="text-[20px]" />
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="font-label-md text-label-md text-text-primary font-semibold">{item.label}</p>
                        <p className="font-caption text-caption text-text-secondary">{item.detail}</p>
                      </div>
                    </div>
                    <div
                      className={
                        draft[item.key]
                          ? 'w-6 h-6 rounded-md bg-primary-container flex items-center justify-center text-on-primary'
                          : 'w-6 h-6 rounded-md bg-surface-container flex items-center justify-center text-transparent'
                      }
                    >
                      <Icon name="check" className="text-[18px]" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="text-[20px]" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-text-primary font-semibold">VEMTAP Tap-to-Redeem</p>
                <p className="font-caption text-caption text-text-secondary">
                  All filtered results support instant contactless discount verification at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface-canvas/95 backdrop-blur-xl p-space-md pb-safe shadow-[0_-8px_24px_rgba(17,24,39,0.08)] flex flex-col items-center gap-space-2xs z-40">
          <button
            type="button"
            onClick={filter.apply}
            className="w-full h-[54px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
          >
            <span>{filter.showLabel}</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <div className="flex items-center gap-1 pt-1 text-text-tertiary font-caption text-caption">
            <Icon name="location_on" className="text-[14px]" />
            <span>Showing deals near {locationLabel}</span>
          </div>
        </div>
      </main>
    </AppScreen>
  );
}
