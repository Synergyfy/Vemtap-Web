import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';

const DISTANCES = ['Near Me', '1 km', '5 km', '10 km', 'Custom'];

const CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Food & Drinks', icon: 'restaurant' },
  { label: 'Beauty & Spa', icon: 'spa' },
  { label: 'Fashion & Apparel', icon: 'apparel' },
  { label: 'Electronics & Gadgets', icon: 'devices' },
  { label: 'Health & Fitness', icon: 'fitness_center' },
  { label: 'Groceries & Supermarket', icon: 'shopping_basket' },
  { label: 'Home & Living', icon: 'chair' },
  { label: 'Automotive & Services', icon: 'car_repair' },
];

const PRICE_TIERS = ['Any Price', 'Under ₦5,000', '₦5,000 – ₦20,000', '₦20,000 – ₦50,000', '₦50,000+', 'Custom'];

const DISCOUNTS = ['Any Discount', '10%+', '20%+', '30%+', '50%+ Hot Deals'];

const AVAILABILITY: { label: string; detail: string; icon: string }[] = [
  { label: 'Available Now', detail: 'Immediate voucher redemption', icon: 'bolt' },
  { label: 'Ending Soon', detail: 'Expiring within 24 hours', icon: 'hourglass_top' },
  { label: 'Walk-ins Accepted', detail: 'No prior reservation required', icon: 'store' },
  { label: 'Weekend Only Deals', detail: 'Valid on Saturday & Sunday', icon: 'event_available' },
];

export interface FiltersScreenProps {
  onClose: () => void;
}

export function FiltersScreen({ onClose }: FiltersScreenProps) {
  const [distanceIndex, setDistanceIndex] = useState(0);
  const [radius, setRadius] = useState(8);
  const [categories, setCategories] = useState<number[]>([0, 1]);
  const [priceIndex, setPriceIndex] = useState(2);
  const [discountIndex, setDiscountIndex] = useState(2);
  const [minPrice, setMinPrice] = useState('5,000');
  const [maxPrice, setMaxPrice] = useState('20,000');
  const [availability, setAvailability] = useState<boolean[]>([true, false, false, false]);

  const toggleCategory = (index: number) => {
    setCategories((prev) => (prev.includes(index) ? prev.filter((value) => value !== index) : [...prev, index]));
  };

  const reset = () => {
    setDistanceIndex(0);
    setRadius(8);
    setCategories([0, 1]);
    setPriceIndex(2);
    setDiscountIndex(2);
    setMinPrice('5,000');
    setMaxPrice('20,000');
    setAvailability([true, false, false, false]);
  };

  const toggleAvailability = (index: number) => {
    setAvailability((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

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
              onClick={reset}
              className="h-11 px-space-sm flex items-center justify-center text-primary font-button-secondary text-button-secondary hover:opacity-80 transition-opacity"
            >
              Reset
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
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
                  <p className="font-label-md text-label-md text-text-primary font-semibold">3 active filters applied</p>
                  <p className="font-caption text-caption text-text-secondary">Matching 34 local verified promotions</p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-badge-discount-text font-semibold bg-badge-discount-bg px-space-2xs py-0.5 rounded-full">
                Active
              </span>
            </div>

            <section className="flex flex-col gap-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Distance</h2>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Within {radius} km</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Show deals within your immediate range</p>
              </div>
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 -mx-margin px-margin no-scrollbar">
                {DISTANCES.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDistanceIndex(index)}
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
                    onChange={(event) => setRadius(Number(event.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
                  <span>Apo District</span>
                  <span>Central Area</span>
                  <span>Gwarinpa</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading-sm text-heading-sm text-text-primary font-semibold">Category</h2>
                  <p className="font-caption text-caption text-text-secondary">Select one or multiple categories</p>
                </div>
                <span className="font-caption text-caption text-text-tertiary">{categories.length} Selected</span>
              </div>
              <div className="flex flex-wrap gap-space-xs">
                {CATEGORIES.map((category, index) => {
                  const selected = categories.includes(index);
                  return (
                    <button
                      key={category.label}
                      type="button"
                      onClick={() => toggleCategory(index)}
                      className={
                        selected
                          ? 'h-10 px-space-sm rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all'
                          : 'h-10 px-space-sm rounded-full bg-surface-canvas text-text-secondary font-label-md text-label-md font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all'
                      }
                    >
                      <Icon
                        name={category.icon}
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
                {PRICE_TIERS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPriceIndex(index)}
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
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
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
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
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
                {DISCOUNTS.map((label, index) => {
                  const hot = index === 4;
                  if (index === discountIndex) {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setDiscountIndex(index)}
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
                        onClick={() => setDiscountIndex(index)}
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
                      onClick={() => setDiscountIndex(index)}
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
                {AVAILABILITY.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleAvailability(index)}
                    className="bg-surface-canvas p-space-sm rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div
                        className={
                          availability[index]
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
                        availability[index]
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
            onClick={onClose}
            className="w-full h-[54px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] active:scale-[0.98] transition-transform"
          >
            <span>Show 34 Deals</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <div className="flex items-center gap-1 pt-1 text-text-tertiary font-caption text-caption">
            <Icon name="location_on" className="text-[14px]" />
            <span>Showing deals near Apo, Abuja</span>
          </div>
        </div>
      </main>
    </AppScreen>
  );
}
