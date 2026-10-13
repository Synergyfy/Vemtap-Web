import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopFiltersScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onClose: () => void;
}

const RADIUS_PILLS: Array<{ label: string; value: number | null }> = [
  { label: 'Near Me', value: 8 },
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'Custom', value: null },
];

const CATEGORIES: Array<{ label: string; icon: string }> = [
  { label: 'Food & Drinks', icon: 'restaurant' },
  { label: 'Beauty & Spa', icon: 'spa' },
  { label: 'Fashion & Apparel', icon: 'checkroom' },
  { label: 'Electronics & Gadgets', icon: 'devices' },
  { label: 'Health & Fitness', icon: 'fitness_center' },
  { label: 'Groceries & Store', icon: 'shopping_basket' },
  { label: 'Home & Living', icon: 'cottage' },
  { label: 'Automotive & Auto', icon: 'directions_car' },
];

const PRICE_CHIPS = ['Any Price', 'Under ₦5,000', '₦5,000 – ₦20,000', 'Above ₦20,000'];
const DISCOUNT_CHIPS = ['Any Discount', '10%+', '20%+', '30%+'];
const PRICE_BONUS = [0, 4, 6, 3];
const DISCOUNT_BONUS = [0, 1, 2, 4];

const TIMING_OPTIONS: Array<{ key: string; label: string; copy: string }> = [
  {
    key: 'available',
    label: 'Available Now',
    copy: 'Immediate voucher redemption ready today',
  },
  {
    key: 'ending',
    label: 'Ending Soon',
    copy: 'Expiring within 24 hours • High rush',
  },
  {
    key: 'walkins',
    label: 'Walk-ins Accepted',
    copy: 'No prior telephone reservation required',
  },
  {
    key: 'weekend',
    label: 'Weekend Only Deals',
    copy: 'Valid strictly on Saturday & Sunday',
  },
];

interface PreviewDeal {
  image: string;
  imageAlt: string;
  discount: string;
  meta: string;
  store: string;
  copy: string;
  price: string;
  oldPrice: string;
}

const PREVIEW_DEALS: PreviewDeal[] = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDz95_KAnhv6h0ofwLuA1JjatMk_zXTnDmoEctg3TRVxD25g1Fwdo-nDrBUJk3gd0m11QLGXNdEhDYGmxNVCt98DVH6t6f6_Zxj1YoxE0335EyWFeNSNOLtIRHoYMxVCtVBAEEcKq3F2lG1hdRuYx9LrcbLc3SFEaJKPVT1vmeFfe19Wa8ioGIhguF5NDpsGfqMqvuszNmO9LaVpaLDX8W8WhWA6KQfUS3xhsIzFv7q',
    imageAlt:
      'A brightly lit artisanal wood-fired pizza and Italian pasta table spread in a modern Abuja bistro with warm sunlight and fresh basil garnish',
    discount: '25% OFF',
    meta: 'Food • 1.2km',
    store: 'Trattoria Bella Vista',
    copy: '2-Course Lunch Promo',
    price: '₦7,500',
    oldPrice: '₦10,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwu3icHz37W52xCP3CzGtUxNMaOgmOS98KolpJD-ohB5sY3IUUCu5PKaO-qlVqlX-MG-ghbq904YJS3C_xtY8Xa_xvsu_XlpZT80gytVHa4thgW_rEE5IWMoDfx-SV9NuzgzSc5QkN43b7STNWAj-GYch1rbmX7rkb2O38ii-5a7QqiFBbqpDh6L6jYvtFdYB25WK9utK0nDTiizroDYU0kbH3RK9Bf3STW3Qpagig',
    imageAlt:
      'A serene luxury wellness spa interior in Apo Abuja with aromatic stone massage oils, bamboo elements, and relaxing warm ambient lighting',
    discount: '20% OFF',
    meta: 'Beauty & Spa • 3.4km',
    store: 'Aura Botanical Spa',
    copy: 'Aromatherapy Ritual',
    price: '₦14,400',
    oldPrice: '₦18,000',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQz__PoPBH8c3iUhAMpKEgG80qjhsUwa8lWOPlVBBeRlR0hYvCTDFY1hvOQpDqgDYavGFAdSVcR9wy-KRNjodyjci_2V4M2Nfhtulj9U9U5plZMLcTw04lE1-VCZ3dbM4OonVD_-tYv4P49R9CIOIBiOT7sGYHHa12vGmHnibsBfWAxt2p3UdpSYE8g-AnhIu1R1fWryKKoQNmE9WDWQsfGTFm6tJSmto48S-GU8OT',
    imageAlt:
      'Freshly pressed green juices, organic fruit bowls and healthy snacks at an upscale health bar in Abuja Nigeria with minimalist wood and steel interior',
    discount: '30% OFF',
    meta: 'Food • 4.1km',
    store: 'Raw & Pure Wellness Bar',
    copy: 'Detox Juice Trio',
    price: '₦5,250',
    oldPrice: '₦7,500',
  },
];

const DEFAULT_CATEGORIES = ['Food & Drinks', 'Beauty & Spa'];

export function DesktopFiltersScreen({ onNav, onClose }: DesktopFiltersScreenProps) {
  const [radius, setRadius] = useState(8);
  const [radiusPill, setRadiusPill] = useState('Near Me');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [priceIndex, setPriceIndex] = useState(2);
  const [minPrice, setMinPrice] = useState('5,000');
  const [maxPrice, setMaxPrice] = useState('20,000');
  const [discountIndex, setDiscountIndex] = useState(2);
  const [timing, setTiming] = useState<Record<string, boolean>>({
    available: true,
    ending: false,
    walkins: false,
    weekend: false,
  });

  const dealCount = Math.max(
    2,
    Math.round(radius * 1.5) +
      categories.length * 4 +
      (timing.available ? 6 : 0) +
      PRICE_BONUS[priceIndex] +
      DISCOUNT_BONUS[discountIndex] +
      (timing.ending ? 1 : 0) +
      (timing.walkins ? 1 : 0) +
      (timing.weekend ? 1 : 0)
  );

  const toggleCategory = (label: string) => {
    setCategories((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const selectRadius = (pill: { label: string; value: number | null }) => {
    setRadiusPill(pill.label);
    if (pill.value !== null) {
      setRadius(pill.value);
    }
  };

  const resetAll = () => {
    setRadius(8);
    setRadiusPill('Near Me');
    setCategories(DEFAULT_CATEGORIES);
    setPriceIndex(2);
    setMinPrice('5,000');
    setMaxPrice('20,000');
    setDiscountIndex(2);
    setTiming({ available: true, ending: false, walkins: false, weekend: false });
  };

  const chipClass = (active: boolean) =>
    `px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
      active ? 'bg-surface-tint-blue text-primary font-semibold' : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
    }`;

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
                3 Active
              </span>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              3 active filters applied • Matching{' '}
              <span className="font-semibold text-primary-container">{dealCount} local verified promotions</span>{' '}
              (Active)
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              className="px-space-md py-space-xs rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all font-button-secondary text-button-secondary flex items-center gap-space-2xs"
              type="button"
              onClick={resetAll}
            >
              <Icon name="restart_alt" className="text-[18px]" />
              <span>Reset all</span>
            </button>
            <button
              className="px-space-lg py-space-xs bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary transition-all shadow-md shadow-primary-container/20 flex items-center gap-space-xs"
              type="button"
              onClick={onClose}
            >
              <span>Apply to {dealCount} Deals</span>
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
                    Show deals within your immediate range •{' '}
                    <span className="font-semibold text-primary">Within {radius}km</span>
                  </p>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 w-fit">
                  <Icon name="my_location" className="text-[14px]" />
                  Apo, Abuja
                </span>
              </div>

              <div className="flex flex-wrap gap-space-xs pt-space-xs">
                {RADIUS_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    className={chipClass(radiusPill === pill.label)}
                    type="button"
                    onClick={() => selectRadius(pill)}
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
                    onChange={(event) => {
                      setRadius(Number(event.target.value));
                      setRadiusPill('Custom');
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-text-tertiary font-caption text-caption gap-space-sm">
                  <span className="flex items-center gap-1 font-medium text-text-secondary">
                    <Icon name="trip_origin" className="text-[14px]" />
                    1km (Apo District)
                  </span>
                  <span className="font-semibold text-primary">Selected: {radius}km</span>
                  <span className="flex items-center gap-1 font-medium text-text-secondary">
                    25km (Gwarinpa / Airport Rd) <Icon name="location_on" className="text-[14px]" />
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
                    Pick single or multiple local business sectors
                  </p>
                </div>
                <span className="font-label-sm text-label-sm text-text-tertiary">{categories.length} Selected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xs">
                {CATEGORIES.map((category) => {
                  const selected = categories.includes(category.label);
                  return (
                    <button
                      key={category.label}
                      className={`group flex items-center justify-between p-space-sm rounded-xl transition-all text-left ${
                        selected ? 'bg-surface-tint-blue text-primary' : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => toggleCategory(category.label)}
                    >
                      <div className="flex items-center gap-space-xs min-w-0">
                        <Icon
                          name={category.icon}
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
                    key={chip}
                    className={chipClass(priceIndex === index)}
                    type="button"
                    onClick={() => setPriceIndex(index)}
                  >
                    {priceIndex === index ? `${chip} (Active)` : chip}
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
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
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
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
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
                      key={chip}
                      className={`py-space-sm px-space-md rounded-xl font-label-md text-label-md transition-all text-center ${
                        discountIndex === index
                          ? 'bg-surface-tint-blue text-primary font-semibold'
                          : 'bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setDiscountIndex(index)}
                    >
                      {discountIndex === index ? `${chip} (Active)` : chip}
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
                    const checked = Boolean(timing[option.key]);
                    return (
                      <label
                        key={option.key}
                        className="flex items-start gap-space-sm p-space-xs rounded-xl hover:bg-surface-subtle cursor-pointer transition-colors"
                      >
                        <input
                          className="mt-1 w-5 h-5 rounded text-primary-container accent-primary-container cursor-pointer"
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setTiming((prev) => ({ ...prev, [option.key]: event.target.checked }))
                          }
                        />
                        <div className="min-w-0">
                          <div
                            className={`font-label-md text-label-md text-text-primary flex items-center gap-1.5 ${
                              checked ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            <span>{option.label}</span>
                            {option.key === 'available' ? (
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
                <span className="font-caption text-caption font-semibold text-primary">{dealCount} Deals Nearby</span>
              </div>

              {PREVIEW_DEALS.map((deal) => (
                <div
                  key={deal.store}
                  className="flex gap-space-sm p-space-xs rounded-xl bg-surface-subtle hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-surface-container">
                    <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                        {deal.meta}
                      </p>
                      <h4 className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        {deal.store}
                      </h4>
                      <p className="font-body-md text-body-md text-text-secondary text-sm">{deal.copy}</p>
                    </div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
                      <span>{deal.price}</span>
                      <span className="text-text-tertiary line-through text-xs font-normal">{deal.oldPrice}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-space-2xs text-center">
                <span className="font-caption text-caption text-text-tertiary">
                  + {Math.max(0, dealCount - 3)} more deals matching current selection
                </span>
              </div>
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
                Showing deals near Apo, Abuja • {radius}km Radius
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
              onClick={onClose}
            >
              <span>Show {dealCount} Deals</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
