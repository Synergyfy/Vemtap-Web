import { useMemo } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { useLocation } from '../../context/LocationContext';
import { useHomeDealCategories } from '../../hooks/useHomeDealCategories';
import { useFilterDraft } from '../../hooks/useFilterDraft';
import { offerDiscountLabel, offerImage, offerLocationLabel } from '../../utils/homeOffer';
import { naira } from '../catalogueData';

interface DesktopFiltersScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onClose: () => void;
}

const RADIUS_PILLS: Array<{ label: string; value: number | null }> = [
  { label: 'Near Me', value: null },
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

const PRICE_CHIPS: Array<{ label: string; min?: number; max?: number }> = [
  { label: 'Any Price' },
  { label: 'Under ₦5,000', max: 5000 },
  { label: '₦5,000 – ₦20,000', min: 5000, max: 20000 },
  { label: 'Above ₦20,000', min: 20000 },
];
const DISCOUNT_CHIPS: Array<{ label: string; value?: number }> = [
  { label: 'Any Discount' },
  { label: '10%+', value: 10 },
  { label: '20%+', value: 20 },
  { label: '30%+', value: 30 },
];

/** Timing is checked against each offer's own start and end dates. */
const TIMING_OPTIONS: Array<{ key: 'availableNow' | 'endingSoon'; label: string; copy: string }> = [
  { key: 'availableNow', label: 'Available Now', copy: 'Already started and ready to claim' },
  { key: 'endingSoon', label: 'Ending Soon', copy: 'Expiring within 24 hours' },
];

export function DesktopFiltersScreen({ onNav, onClose }: DesktopFiltersScreenProps) {
  const { city, district } = useLocation();
  const { categories: liveCategories } = useHomeDealCategories();
  const categories = liveCategories.filter((category) => category.id !== null);
  const filter = useFilterDraft(onClose);
  const { draft, radius, preview } = filter;
  const radiusPill = !draft.strictDistance ? 'Near Me' : RADIUS_PILLS.find((pill) => pill.value === radius)?.label ?? 'Custom';
  const priceIndex = PRICE_CHIPS.findIndex((chip) => chip.min === draft.minPrice && chip.max === draft.maxPrice);
  const discountIndex = DISCOUNT_CHIPS.findIndex((chip) => chip.value === draft.minDiscount);
  const previewDeals = useMemo(
    () =>
      preview.deals.map((offer) => {
        const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
        const price = Number(offer.calculatedPrice ?? 0) || 0;
        const original = Number(offer.originalPrice ?? 0) || 0;
        return {
          id: String(offer.id),
          image: offerImage(offer),
          title: typeof offer.name === 'string' ? offer.name : 'Deal',
          store: typeof business.name === 'string' ? business.name : '',
          discount: offerDiscountLabel(offer),
          meta: [typeof offer.categoryName === 'string' ? offer.categoryName : null, offerLocationLabel(offer)].filter(Boolean).join(' • '),
          price: price > 0 ? naira(price) : '',
          oldPrice: original > price ? naira(original) : '',
        };
      }),
    [preview.deals],
  );

  const chipClass = (active: boolean) =>
    `px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
      active ? 'bg-surface-tint-blue text-primary font-semibold' : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
    }`;

  const locationLabel = [city, district].filter(Boolean).join(', ') || 'Your area';

  return (
    <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
      <div className="w-full max-w-7xl mx-auto px-margin py-space-xl">
        <div className="bg-surface-canvas rounded-2xl shadow-sm p-space-lg mb-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="space-y-space-2xs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container">
                <Icon name="tune" className="text-[20px]" />
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Filters</h1>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold">
                {filter.activeCount} active
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              <span className="font-semibold text-primary-container">{filter.matchText}</span>
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              className="px-space-md py-space-xs rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all font-button-secondary text-button-secondary flex items-center gap-space-2xs"
              type="button"
              onClick={filter.reset}
            >
              <Icon name="restart_alt" className="text-[18px]" />
              <span>Reset all</span>
            </button>
            <button
              className="px-space-lg py-space-xs bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary transition-all shadow-md shadow-primary-container/20 flex items-center gap-space-xs"
              type="button"
              onClick={filter.apply}
            >
              <span>Apply Filters</span>
              <Icon name="done" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          <div className="xl:col-span-8 space-y-space-xl">
            <section className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="space-y-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="near_me" className="text-primary text-[20px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Distance &amp; Radius</h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary">
                    {filter.hasCoordinates ? (
                      <>
                        Show deals within your immediate range • <span className="font-semibold text-primary">Within {radius}km</span>
                      </>
                    ) : (
                      'Set your location on the home page to filter by distance'
                    )}
                  </p>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 w-fit">
                  <Icon name="my_location" className="text-[14px]" />
                  {locationLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                {RADIUS_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    className={chipClass(radiusPill === pill.label)}
                    type="button"
                    disabled={!filter.hasCoordinates}
                    onClick={() => filter.chooseDistance(pill.value)}
                  >
                    {radiusPill === pill.label ? `${pill.label} (Active)` : pill.label}
                  </button>
                ))}
              </div>

              <div className="space-y-space-xs pt-space-xs">
                <div className="relative py-2">
                  <input
                    className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary-container focus:outline-none"
                    max={25}
                    min={1}
                    type="range"
                    value={radius}
                    disabled={!filter.hasCoordinates}
                    onChange={(event) => filter.chooseDistance(Number(event.target.value))}
                  />
                </div>
                <div className="flex justify-between items-center text-text-tertiary font-caption text-caption gap-space-sm">
                  <span className="flex items-center gap-1 font-medium text-text-secondary">
                    <Icon name="trip_origin" className="text-[14px]" />
                    1km ({district || 'local area'})
                  </span>
                  <span className="font-semibold text-primary">Selected: {radius}km</span>
                  <span className="flex items-center gap-1 font-medium text-text-secondary">
                    25km ({city || 'nearby'} / {district || 'local'}) <Icon name="location_on" className="text-[14px]" />
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm space-y-space-md">
              <div className="flex items-center justify-between gap-space-sm flex-wrap">
                <div className="space-y-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="category" className="text-primary text-[20px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Categories</h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Pick a local business sector
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xs">
                {categories.map((category) => {
                  const selected = draft.categoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      aria-pressed={selected}
                      className={`group flex items-center justify-between p-space-sm rounded-xl transition-all text-left ${
                        selected ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => filter.patch({ categoryId: selected ? null : category.id })}
                    >
                      <div className="flex items-center gap-space-xs min-w-0">
                        <Icon
                          name={category.icon ?? 'category'}
                          className={`text-[20px] shrink-0 ${selected ? 'text-primary-container' : 'text-outline'}`}
                        />
                        <span
                          className={`font-label-md truncate ${selected ? 'font-semibold' : 'font-medium'}`}
                        >
                          {category.label}
                        </span>
                      </div>
                      <Icon
                        name={selected ? 'check_circle' : 'add'}
                        className={`text-[18px] ${
                          selected ? 'text-primary-container' : 'text-text-tertiary opacity-30 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm space-y-space-md">
              <div className="space-y-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="payments" className="text-primary text-[20px]" />
                  <h2 className="font-heading-sm text-heading-sm text-text-primary">Price Range</h2>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Filter by estimated deal expenditure per redemption
                </p>
              </div>

              <div className="flex flex-wrap gap-space-xs">
                {PRICE_CHIPS.map((chip, index) => (
                  <button
                    key={chip.label}
                    className={chipClass(priceIndex === index)}
                    type="button"
                    onClick={() => filter.setPrices(chip.min, chip.max)}
                  >
                    {priceIndex === index ? `${chip.label} (Active)` : chip.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-2xs">
                <div className="space-y-space-2xs">
                  <label className="font-label-sm text-label-sm font-medium text-text-secondary">Minimum Price</label>
                  <div className="relative flex items-center bg-surface-subtle rounded-xl overflow-hidden focus-within:bg-surface-canvas focus-within:shadow-md transition-all">
                    <span className="pl-space-md font-heading-sm text-heading-sm font-bold text-text-tertiary select-none">
                      ₦
                    </span>
                    <input
                      className="w-full h-12 pl-space-xs pr-space-md bg-transparent text-text-primary font-heading-sm text-heading-sm font-semibold outline-none"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      aria-label="Minimum price"
                      value={filter.minPrice}
                      onChange={(event) => filter.typeMin(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-space-2xs">
                  <label className="font-label-sm text-label-sm font-medium text-text-secondary">Maximum Price</label>
                  <div className="relative flex items-center bg-surface-subtle rounded-xl overflow-hidden focus-within:bg-surface-canvas focus-within:shadow-md transition-all">
                    <span className="pl-space-md font-heading-sm text-heading-sm font-bold text-text-tertiary select-none">
                      ₦
                    </span>
                    <input
                      className="w-full h-12 pl-space-xs pr-space-md bg-transparent text-text-primary font-heading-sm text-heading-sm font-semibold outline-none"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
              <section className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm space-y-space-md">
                <div className="space-y-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="percent" className="text-primary text-[20px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Discount Minimum</h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary">Filter strictly by markdown depth</p>
                </div>

                <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
                  {DISCOUNT_CHIPS.map((chip, index) => (
                    <button
                      key={chip.label}
                      className={`py-space-sm px-space-md rounded-xl font-label-md text-label-md transition-all text-center ${
                        discountIndex === index
                          ? 'bg-surface-tint-blue text-primary font-semibold'
                          : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => filter.patch({ minDiscount: chip.value })}
                    >
                      {discountIndex === index ? `${chip.label} (Active)` : chip.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm space-y-space-md">
                <div className="space-y-space-2xs">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="schedule" className="text-primary text-[20px]" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Timing &amp; Validity</h2>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary">Redeem parameters &amp; operating hours</p>
                </div>

                <div className="space-y-space-xs pt-space-2xs">
                  {TIMING_OPTIONS.map((option) => {
                    const checked = draft[option.key];
                    return (
                      <label
                        key={option.key}
                        className="flex items-start gap-space-sm p-space-xs rounded-xl hover:bg-surface-subtle cursor-pointer transition-colors"
                      >
                        <input
                          className="mt-1 w-5 h-5 rounded text-primary-container accent-primary-container cursor-pointer"
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => filter.patch({ [option.key]: event.target.checked })}
                        />
                        <div className="min-w-0">
                          <div
                            className={`font-label-md text-label-md text-text-primary flex items-center gap-1.5 ${
                              checked ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            <span>{option.label}</span>
                            {option.key === 'availableNow' ? (
                              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                            ) : null}
                          </div>
                          <p className="font-caption text-caption text-text-secondary">{option.copy}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-space-xl">
            <div className="bg-surface-canvas rounded-2xl p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center justify-between pb-space-2xs">
                <h3 className="font-heading-sm text-heading-sm text-text-primary">Live Match Preview</h3>
                <span className="font-caption text-caption font-semibold text-primary">{preview.loading ? '…' : `${preview.count ?? 0} Deal${preview.count === 1 ? '' : 's'}`}</span>
              </div>

              {preview.loading && previewDeals.length === 0 ? (
                [0, 1, 2].map((key) => <Skeleton key={key} className="h-[96px] w-full rounded-xl" />)
              ) : previewDeals.length === 0 ? (
                <p className="font-body-md text-body-md text-text-secondary text-center py-space-md">No live deals match these filters.</p>
              ) : previewDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex gap-space-sm p-space-xs rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-surface-container">
                    <img className="w-full h-full object-cover" alt={deal.title} src={deal.image} />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold truncate">{deal.meta}</p>
                      <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">{deal.store}</h4>
                      <p className="font-body-md text-body-md text-text-secondary text-sm truncate">{deal.title}</p>
                    </div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
                      <span>{deal.price}</span>
                      {deal.oldPrice ? <span className="text-text-tertiary line-through text-xs font-normal">{deal.oldPrice}</span> : null}
                    </div>
                  </div>
                </div>
              ))}

              {(preview.count ?? 0) > previewDeals.length ? (
                <div className="pt-space-2xs text-center">
                  <span className="font-caption text-caption text-text-tertiary">
                    + {(preview.count ?? 0) - previewDeals.length} more matching your selection
                  </span>
                </div>
              ) : null}
            </div>

            <div className="bg-surface-canvas rounded-2xl p-space-xl shadow-sm relative overflow-hidden space-y-space-md">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-surface-tint-blue pointer-events-none" />
              <div className="relative z-10 flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md shadow-primary-container/30">
                  <Icon name="contactless" className="text-[24px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary leading-tight">Tap-to-Redeem</h3>
                  <p className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                    <Icon name="verified" className="text-[14px]" />
                    100% Guaranteed Verification
                  </p>
                </div>
              </div>
              <p className="relative z-10 font-body-md text-body-md text-text-secondary">
                Never show paper printouts or negotiate discount rates. Every VEMTAP partner merchant possesses our
                direct POS contactless receiver for 1-second on-premise checkout confirmation.
              </p>
              <div className="relative z-10 flex items-center gap-space-md p-space-sm bg-surface-subtle rounded-xl text-text-secondary font-label-sm text-label-sm">
                <Icon name="security_update_good" className="text-primary text-[20px]" />
                <span>Zero pre-payment required • Pay direct in store</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-40 mt-space-2xl bg-surface-canvas/95 backdrop-blur-md rounded-2xl shadow-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
              <Icon name="location_on" className="text-[22px]" />
            </div>
            <div>
              <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                Target Neighborhood
              </p>
              <p className="font-label-md text-label-md font-semibold text-text-primary">
                Showing deals near {locationLabel} • {radius}km Radius
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-md w-full sm:w-auto">
            <button
              className="hidden sm:inline-flex px-space-md py-space-sm rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle font-button-secondary text-button-secondary transition-colors"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex-1 sm:flex-initial px-space-2xl py-3.5 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary transition-all shadow-lg shadow-primary-container/25 flex items-center justify-center gap-space-xs text-center"
              type="button"
              onClick={filter.apply}
            >
              <span>{filter.showLabel}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
