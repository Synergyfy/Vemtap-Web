import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';

interface DesktopHomeScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: (deal?: {
    title?: string;
    business?: string;
    location?: string;
    price?: number;
    oldPrice?: number;
    discountLabel?: string;
    image?: string;
  }) => void;
  onClaim?: (deal?: {
    title?: string;
    business?: string;
    location?: string;
    price?: number;
    oldPrice?: number;
    discountLabel?: string;
    image?: string;
  } | null, onClaimed?: () => void) => void;
}

const HERO_LIST_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCS157lqo7xVeIPrY-YwXz-qLPSxMYuZ6MVVZm7i6pXIYJp3jj2O6fz76xwBEEFEMPweLJRa8Tm49n6Rwul-eJYZWMBzYvy5DuYGwjSpFhemSRM2WvxQzm2fwvc8JZ6Mu-YfStqotM5Nsjvaun00tM1rZWIK52y9Mj0qAQjQ02_Odn3b5TSpdPYSmPjMOe0EK7rFyxDrAGSL0MFXKVXa7veRCdKVR52Oz-6BM8HD8W0';

const HERO_GRID_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIxQKPJ2CK4jYecgDvXxVKgoXnaiLRhf9nh8zig7wgyoml_WMe7fsiYtmztk9rKiUHi55eLCiwNh04f_72TTRCZNBW0KOtMZNQdQohVyPqT-NoZZFRIbzHeYhmEcHwiIlbhsqW1ynppf7c48y6EQc2bEUGsH4sezPHA7V4Fc7u0vkaUE1Y96MvuETpz-Zm7o5Pgu-vZfjTxdtSThrDeODsHDgluf_1fDho6B-juDh';

const formatCurrency = (value: number | string | undefined): string => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(parsed);
};

const getApiImage = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value;
  return HERO_LIST_IMAGE;
};

const getNestedImage = (offer: Record<string, unknown>): string => {
  const itemList = Array.isArray(offer.items) ? offer.items : [];
  for (const item of itemList) {
    if (item && typeof item === 'object') {
      const current = item as Record<string, unknown>;
      const image = getApiImage(current.mainImage ?? current.image ?? current.mediaUrl);
      if (image !== HERO_LIST_IMAGE || current.mainImage || current.image) return image;
    }
  }

  const business = offer.business;
  if (business && typeof business === 'object') {
    const current = business as Record<string, unknown>;
    const image = getApiImage(current.logo ?? current.image ?? current.coverImage);
    if (image !== HERO_LIST_IMAGE || current.logo || current.image) return image;
  }

  return getApiImage(offer.image ?? offer.coverImage ?? offer.mediaUrl ?? offer.photo);
};

const getApiBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business;
  const fromBusiness = business && typeof business === 'object' ? ((business as Record<string, unknown>).name ?? (business as Record<string, unknown>).businessName ?? (business as Record<string, unknown>).merchantName) : undefined;
  const value = offer.businessName ?? offer.merchantName ?? offer.branchName ?? offer.vendorName ?? offer.companyName ?? fromBusiness ?? 'Nearby business';
  return typeof value === 'string' && value.trim() ? value : 'Nearby business';
};

const getApiTitle = (offer: Record<string, unknown>): string => {
  const value = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
};

const getApiPrice = (offer: Record<string, unknown>): number => {
  const nestedItem = Array.isArray(offer.items) && offer.items.length > 0 && typeof offer.items[0] === 'object' ? (offer.items[0] as Record<string, unknown>) : null;
  const candidates = [offer.calculatedPrice, offer.dealPrice, offer.price, offer.fixedPrice, offer.amount, offer.salePrice, nestedItem?.price, nestedItem?.dealPrice, nestedItem?.calculatedPrice];
  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return 0;
};

const getApiComparePrice = (offer: Record<string, unknown>): number => {
  const nestedItem = Array.isArray(offer.items) && offer.items.length > 0 && typeof offer.items[0] === 'object' ? (offer.items[0] as Record<string, unknown>) : null;
  const candidates = [offer.compareAtPrice, offer.originalPrice, offer.listPrice, offer.wasPrice, offer.previousPrice, nestedItem?.compareAtPrice, nestedItem?.originalPrice, nestedItem?.listPrice];
  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return getApiPrice(offer);
};

const toSpotlightSlide = (offer: Record<string, unknown>, index: number) => {
  const price = getApiPrice(offer);
  const original = getApiComparePrice(offer);
  const title = getApiTitle(offer);
  const merchant = getApiBusinessName(offer);
  const offerId = String(
    offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${merchant}-${title}-${index}`,
  );

  return {
    id: offerId,
    image: getNestedImage(offer),
    discount: 'Live Deal',
    merchant: `${merchant} • ${typeof offer.location === 'string' ? offer.location : 'Nearby'}`,
    title,
    copy: typeof offer.description === 'string' && offer.description.trim() ? offer.description : 'Fresh local offer from nearby vendors.',
    rating: '4.9',
    reviews: '(live)',
    price: formatCurrency(price),
    oldPrice: original > price ? formatCurrency(original) : '',
    save: price > 0 ? `Save ${formatCurrency(Math.max(original - price, 0))} instantly` : 'Limited-time offer',
    ending: 'Ends soon',
    features: [
      { icon: 'check_circle', text: 'Includes local perk' },
      { icon: 'check_circle', text: 'Instant checkout' },
      { icon: 'schedule', text: 'Limited time', error: true },
      { icon: 'pin_drop', text: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby' },
    ],
  };
};

const toListDeal = (offer: Record<string, unknown>, index: number) => {
  const price = getApiPrice(offer);
  const original = getApiComparePrice(offer);
  const title = getApiTitle(offer);
  const business = getApiBusinessName(offer);
  const offerId = String(
    offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${business}-${title}-${index}`,
  );

  return {
    id: offerId,
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    discount: price > 0 ? 'Live Deal' : 'OFFER',
    timer: 'Limited time',
    meta: typeof offer.distance === 'string' && offer.distance.trim() ? `${offer.distance} • Nearby` : 'Nearby',
    rating: '4.9',
    title,
    store: business,
    copy: typeof offer.description === 'string' && offer.description.trim() ? offer.description : 'Fresh local offer from nearby vendors.',
    price: formatCurrency(price),
    oldPrice: original > price ? formatCurrency(original) : '',
  };
};

const toTrendingDeal = (offer: Record<string, unknown>, index: number) => {
  const price = getApiPrice(offer);
  const original = getApiComparePrice(offer);
  const title = getApiTitle(offer);
  const business = getApiBusinessName(offer);
  const offerId = String(
    offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${business}-${title}-${index}`,
  );

  return {
    id: offerId,
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    claimed: 'Live deal',
    title,
    store: business,
    price: formatCurrency(price),
    oldPrice: original > price ? formatCurrency(original) : '',
    discount: 'Live Deal',
  };
};

const toBusinessSummary = (offer: Record<string, unknown>, index: number) => {
  const businessName = getApiBusinessName(offer);
  const distance = typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby';
  const idCandidate =
    offer.id ??
    offer.businessId ??
    offer.branchId ??
    offer.slug ??
    offer._id ??
    (offer.business && typeof offer.business === 'object' ? ((offer.business as Record<string, unknown>).id ?? (offer.business as Record<string, unknown>).businessId ?? (offer.business as Record<string, unknown>).branchId) : undefined) ??
    `${businessName}-${distance}-${index}`;

  return {
    id: String(idCandidate),
    initials: (businessName.split(' ').slice(0, 2).map((part) => part[0] ?? '').join('') || 'LB').slice(0, 2).toUpperCase(),
    name: businessName,
    rating: '4.9 (live)',
    area: distance,
    deals: 'Live Offer',
  };
};

const toProductSummary = (offer: Record<string, unknown>, index: number) => {
  const title = getApiTitle(offer);
  const store = getApiBusinessName(offer);
  const offerId = String(
    offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${store}-${title}-${index}`,
  );

  return {
    id: offerId,
    image: getNestedImage(offer),
    imageAlt: `${title} by ${store}`,
    badge: 'Live Offer',
    title,
    store,
    price: formatCurrency(getApiPrice(offer)),
  };
};

const GRID_MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDPi8Hp2LqrNbrRjrTe4iJGQ82H5nsV1-JvhlyPbRVhxONkWJt6Hc2S_lIZk9qo9btotKPC72KuIRzlcqxkOEekBorlzOmDPiLFdngxWpwgjtTT1izq8k3mCxSxrpZYEjh5MWVcQ3PbDF_AB-uT28yp-J3pqOSTDWKLCrFnYOfqHy1aTcjOivKcO-UI_9bCybcQXu2yrMzbnFa1OR2ZwxZ22PxWZOr0qA1L94Oic9em';

const LIST_CATEGORIES = [
  { label: 'All' },
  { label: 'Food & Dining', icon: 'restaurant' },
  { label: 'Fashion', icon: 'checkroom' },
  { label: 'Beauty & Spa', icon: 'spa' },
  { label: 'Fitness', icon: 'fitness_center' },
  { label: 'Tech & Gadgets', icon: 'devices' },
];

const GRID_CATEGORIES = ['All Deals', 'Food & Dining', 'Fashion & Drops', 'Beauty & Wellness', 'Fitness'];

export function DesktopHomeScreen({
  onNav,
  onOpenFilters,
  onOpenFeatured,
  onOpenDeals,
  onOpenDeal,
  onClaim,
}: DesktopHomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [listCategory, setListCategory] = useState('All');
  const [gridCategory, setGridCategory] = useState('All Deals');
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const trendingRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [spotlight, setSpotlight] = useState(0);
  const [spotlightPaused, setSpotlightPaused] = useState(false);
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const createDealPayload = (deal: {
    title: string;
    business?: string;
    store?: string;
    meta?: string;
    price: string | number;
    oldPrice?: string | number;
    discount?: string;
    image: string;
  }) => ({
    title: deal.title,
    business: deal.business ?? deal.store ?? deal.meta?.split('•')[0]?.trim() ?? 'Nearby business',
    location: `${city}, ${district}`,
    price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
    oldPrice: Number.parseFloat(String(deal.oldPrice ?? 0).replace(/[^\d.]/g, '')) || 0,
    discountLabel: deal.discount ?? 'Live Deal',
    image: deal.image,
  });

  useEffect(() => {
    let ignore = false;
    const loadOffers = async () => {
      if (!hasApiConfig()) {
        if (!ignore) {
          setPublicOffers([]);
          setOffersLoading(false);
        }
        return;
      }

      setOffersLoading(true);
      try {
        const response = await catalogueService.getPublicOffers({ page: 1, limit: 8 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch {
        if (!ignore) setPublicOffers([]);
      } finally {
        if (!ignore) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => {
      ignore = true;
    };
  }, []);

  const spotlightDeals = useMemo(() => publicOffers.slice(0, 3).map((offer, index) => toSpotlightSlide(offer, index)), [publicOffers]);
  const listDeals = useMemo(() => publicOffers.slice(0, 4).map((offer, index) => toListDeal(offer, index)), [publicOffers]);
  const trendingDeals = useMemo(() => publicOffers.slice(0, 3).map((offer, index) => toTrendingDeal(offer, index)), [publicOffers]);
  const businesses = useMemo(() => publicOffers.slice(0, 3).map((offer, index) => toBusinessSummary(offer, index)), [publicOffers]);
  const products = useMemo(() => publicOffers.slice(0, 2).map((offer, index) => toProductSummary(offer, index)), [publicOffers]);
  const liveOfferCount = publicOffers.length;
  const liveOfferLabel = liveOfferCount === 0
    ? 'No live offers yet'
    : liveOfferCount === 1
      ? '1 live offer near you'
      : `${liveOfferCount} live offers near you`;
  const spotlightIndex = spotlightDeals.length ? spotlight % spotlightDeals.length : 0;
  const spotlightData = spotlightDeals.length ? spotlightDeals : [];

  useEffect(() => {
    if (spotlightPaused || spotlightDeals.length <= 1) return;
    const timer = window.setInterval(() => {
      setSpotlight((current) => (current + 1) % spotlightDeals.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [spotlightPaused, spotlightDeals.length]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  const toggleLike = (index: number) => {
    setLiked((prev) => {
      const nextValue = !prev[index];
      showToast(nextValue ? 'Saved to your VEMTAP favorites' : 'Removed from saved deals');
      return { ...prev, [index]: nextValue };
    });
  };

  const scrollTrending = (delta: number) => {
    trendingRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const toastElement = toast ? (
    <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-xs transition-all duration-300">
      <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
      <span className="font-label-md text-label-md">{toast}</span>
    </div>
  ) : null;

  if (view === 'list') {
    return (
      <>
        <DesktopPage activeNav="home" onNav={onNav} withFooter withHeader onOpenLocation={() => setLocationOpen(true)}>
          <section className="w-full px-margin py-space-md bg-surface-canvas shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-2xs text-text-secondary font-label-sm text-label-sm">
                    <span>Good evening</span>
                    <span className="text-primary font-bold">•</span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Icon name="location_on" className="text-primary text-[18px]" />
                      {district}, {city} (Within {radius}km)
                    </span>
                  </div>
                  <p className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-0.5">
                    Explore active deals around you
                  </p>
                </div>

                <div className="flex items-center gap-space-xs lg:justify-end">
                  <button
                    className="h-[46px] px-space-md bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary rounded-xl flex items-center gap-1.5 font-label-md text-label-md font-semibold transition-all shadow-sm shrink-0"
                    type="button"
                    onClick={onOpenFilters}
                  >
                    <Icon name="tune" className="text-[18px]" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {LIST_CATEGORIES.map((item) => {
                  const active = item.label === listCategory;
                  return (
                    <button
                      key={item.label}
                      className={`px-4 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm hover:scale-[1.02]'
                          : 'bg-surface-subtle text-text-secondary font-medium hover:bg-surface-container-low hover:text-text-primary shadow-sm'
                      }`}
                      type="button"
                      onClick={() => setListCategory(item.label)}
                    >
                      {item.icon ? <Icon name={item.icon} className="text-[16px]" /> : null}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto w-full px-margin py-space-xl flex flex-col gap-space-2xl">
            <section className="w-full">
              <div
                className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md grid grid-cols-1 lg:grid-cols-12 group transition-all duration-300 cursor-pointer"
                onClick={onOpenFeatured}
                onMouseEnter={() => setSpotlightPaused(true)}
                onMouseLeave={() => setSpotlightPaused(false)}
              >
                <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] overflow-hidden">
                  {spotlightData.length === 0 ? (
                    <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-text-secondary p-space-xl">
                      No live offers are available right now.
                    </div>
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${spotlightData[spotlightIndex].image}')` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                    {spotlightData.length > 0 && (
                      <>
                        <span className="px-3 py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold rounded-full shadow-sm flex items-center gap-1">
                          <Icon name="local_fire_department" className="text-[14px]" />
                          {spotlightData[spotlightIndex].discount}
                        </span>
                        <span className="px-3 py-1 bg-surface-canvas/90 backdrop-blur text-primary font-caption text-caption font-semibold rounded-full shadow-sm">
                          PROMOTED SPOTLIGHT
                        </span>
                      </>
                    )}
                  </div>
                  {spotlightData.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-surface-canvas lg:hidden">
                      <span className="text-caption font-semibold bg-black/60 px-2.5 py-1 rounded-md backdrop-blur">
                        {spotlightData[spotlightIndex].ending}
                      </span>
                      <span className="font-heading-sm text-heading-sm font-bold text-surface-canvas">
                        {spotlightData[spotlightIndex].price}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-2">
                    <button
                      aria-label="Previous spotlight deal"
                      className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-surface-canvas backdrop-blur flex items-center justify-center transition-colors"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (spotlightData.length === 0) return;
                        setSpotlight((current) => (current - 1 + spotlightData.length) % spotlightData.length);
                      }}
                    >
                      <Icon name="chevron_left" className="text-[20px]" />
                    </button>
                    <button
                      aria-label="Next spotlight deal"
                      className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-surface-canvas backdrop-blur flex items-center justify-center transition-colors"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (spotlightData.length === 0) return;
                        setSpotlight((current) => (current + 1) % spotlightData.length);
                      }}
                    >
                      <Icon name="chevron_right" className="text-[20px]" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                    {spotlightData.map((slide, index) => (
                      <button
                        aria-label={`Show spotlight deal ${index + 1}: ${slide.title}`}
                        key={slide.id ?? `${slide.title}-${slide.merchant ?? 'merchant'}-${index}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSpotlight(index);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          index === spotlightIndex
                            ? 'w-6 bg-surface-canvas'
                            : 'w-2 bg-surface-canvas/50 hover:bg-surface-canvas/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 p-space-lg lg:p-space-xl flex flex-col justify-between bg-surface-canvas">
                  {spotlightData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary border border-dashed border-primary/20 rounded-xl p-space-lg">
                      Live spotlight deals will appear here.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Icon name="verified" className="text-[18px]" />
                            <span className="font-caption text-caption font-semibold uppercase tracking-wider">
                              Partner Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm font-bold">
                            <Icon name="star" filled className="text-[16px] text-tertiary-container" />
                            {spotlightData[spotlightIndex].rating}{' '}
                            <span className="text-text-tertiary font-normal">{spotlightData[spotlightIndex].reviews}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wide">
                            {spotlightData[spotlightIndex].merchant}
                          </p>
                          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-1">
                            {spotlightData[spotlightIndex].title}
                          </h2>
                          <p className="font-body-md text-body-md text-text-secondary mt-2">
                            {spotlightData[spotlightIndex].copy}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                          {spotlightData[spotlightIndex].features.map((feature) => (
                            <div
                              className="flex items-center gap-2 text-text-secondary font-label-sm text-label-sm"
                              key={feature.text}
                            >
                              <Icon name={feature.icon} className="text-primary text-[18px]" />
                              <span className={feature.error ? 'text-error font-medium' : undefined}>{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-space-lg mt-space-md flex items-center justify-between gap-space-md">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading-lg text-heading-lg font-bold text-text-primary">
                              {spotlightData[spotlightIndex].price}
                            </span>
                            <span className="font-body-md text-body-md text-text-tertiary line-through">
                              {spotlightData[spotlightIndex].oldPrice}
                            </span>
                          </div>
                          <span className="text-caption text-badge-discount-text font-medium">
                            {spotlightData[spotlightIndex].save}
                          </span>
                        </div>
                        <button
                          className="h-[52px] px-8 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const offer = spotlightData[spotlightIndex];
                            const selected = {
                              title: offer?.title ?? 'Featured deal',
                              business: offer?.merchant?.split('•')[0]?.trim() ?? 'Nearby business',
                              location: `${city}, ${district}`,
                              price: Number.parseFloat(String((offer?.price ?? '0').replace(/[^\d.]/g, '')) || '0') || 0,
                              oldPrice: Number.parseFloat(String((offer?.oldPrice ?? '0').replace(/[^\d.]/g, '')) || '0') || 0,
                              discountLabel: offer?.discount ?? 'Live Deal',
                              image: offer?.image ?? '',
                            };
                            onClaim?.(selected);
                          }}
                        >
                          <span>Claim Voucher</span>
                          <Icon name="arrow_forward" className="text-[18px]" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mb-space-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deals Near You</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption font-bold">
                      4.2km Radius
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                    Top-rated neighborhood vouchers ready for instant pickup or table reservation
                  </p>
                </div>
                <div className="flex items-center gap-space-md shrink-0">
                  <div className="hidden md:flex items-center bg-surface-subtle p-1 rounded-lg">
                    <button
                      className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                      title="Grid View"
                      type="button"
                      onClick={() => setView('grid')}
                    >
                      <Icon name="grid_view" className="text-[18px]" />
                    </button>
                    <button
                      className="p-1.5 rounded-md bg-surface-canvas text-primary shadow-sm transition-colors"
                      title="List View"
                      type="button"
                      onClick={() => setView('list')}
                    >
                      <Icon name="view_agenda" className="text-[18px]" />
                    </button>
                  </div>
                  <button
                    className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold flex items-center gap-1 group"
                    type="button"
                    onClick={onOpenDeals}
                  >
                    See All Deals
                    <Icon name="chevron_right" className="text-[18px] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {listDeals.length === 0 ? (
                  <div className="col-span-full rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                    {offersLoading ? 'Loading live deals...' : 'No live deals are available right now.'}
                  </div>
                ) : listDeals.map((deal, index) => (
                  <div
                    key={deal.id ?? `${deal.title}-${deal.store ?? 'store'}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDeal({
                      title: deal.title,
                      business: deal.meta?.split('•')[0]?.trim() || 'Nearby business',
                      location: `${city}, ${district}`,
                      price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                      oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                      discountLabel: deal.discount,
                      image: deal.image,
                    })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal({
                          title: deal.title,
                          business: deal.meta?.split('•')[0]?.trim() || 'Nearby business',
                          location: `${city}, ${district}`,
                          price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                          oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                          discountLabel: deal.discount,
                          image: deal.image,
                        });
                      }
                    }}
                    className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${deal.image}')` }}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded-full">
                        {deal.discount}
                      </span>
                      {deal.timer ? (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-surface-canvas font-caption text-caption flex items-center gap-1">
                          <Icon name="timer" className="text-[12px] text-tertiary-fixed" />
                          <span>{deal.timer}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-space-md flex-1 flex flex-col justify-between gap-space-sm">
                      <div>
                        <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                          <span className="flex items-center gap-0.5">
                            <Icon name="pin_drop" className="text-[14px]" />
                            {deal.meta}
                          </span>
                          <span className="flex items-center text-text-primary font-semibold">
                            <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                            {deal.rating}
                          </span>
                        </div>
                        <h4 className="font-heading-sm text-heading-sm text-text-primary mt-1 line-clamp-1">
                          {deal.title}
                        </h4>
                        <p className="font-body-md text-body-md text-text-secondary mt-0.5 line-clamp-2">
                          {deal.copy}
                        </p>
                      </div>
                      <div className="pt-space-xs flex items-center justify-between mt-auto">
                        <div>
                          <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                            {deal.price}
                          </span>
                          <span className="font-caption text-caption text-text-tertiary line-through block">
                            {deal.oldPrice}
                          </span>
                        </div>
                        <button
                          className="h-9 px-3 bg-surface-tint-blue hover:bg-primary-container text-primary hover:text-on-primary font-label-sm text-label-sm font-semibold rounded-lg transition-all flex items-center gap-1"
                          type="button"
                        >
                          <span>View Deal</span>
                          <Icon name="add" className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="w-full bg-surface-subtle p-space-lg lg:p-space-xl rounded-2xl">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-sm">
                    <Icon name="local_fire_department" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Trending Deals Right Now
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Claimed by shoppers near you today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Previous trending deals"
                    className="w-8 h-8 rounded-full bg-surface-canvas hover:bg-surface-container-high flex items-center justify-center text-text-secondary transition-colors shadow-sm"
                    type="button"
                    onClick={() => scrollTrending(-320)}
                  >
                    <Icon name="chevron_left" className="text-[18px]" />
                  </button>
                  <button
                    aria-label="Next trending deals"
                    className="w-8 h-8 rounded-full bg-surface-canvas hover:bg-surface-container-high flex items-center justify-center text-text-secondary transition-colors shadow-sm"
                    type="button"
                    onClick={() => scrollTrending(320)}
                  >
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <div
                ref={trendingRef}
                className="flex gap-space-md overflow-x-auto no-scrollbar scroll-smooth pb-2"
              >
                {trendingDeals.length === 0 ? (
                  <div className="w-full rounded-xl border border-dashed border-primary/20 bg-surface-canvas p-space-lg text-text-secondary">
                    Live trending deals will appear here soon.
                  </div>
                ) : trendingDeals.map((deal, index) => (
                  <div
                    key={deal.id ?? `${deal.title}-${deal.store ?? 'store'}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDeal({
                      title: deal.title,
                      business: deal.store,
                      location: `${city}, ${district}`,
                      price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                      oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                      discountLabel: deal.discount,
                      image: deal.image,
                    })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal({
                          title: deal.title,
                          business: deal.store,
                          location: `${city}, ${district}`,
                          price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                          oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                          discountLabel: deal.discount,
                          image: deal.image,
                        });
                      }
                    }}
                    className="min-w-[280px] sm:min-w-[340px] bg-surface-canvas rounded-xl p-space-md shadow-sm hover:shadow-md transition-all flex gap-3.5 items-center shrink-0 cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${deal.image}')` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-error-container text-on-error-container inline-flex items-center gap-1">
                        <Icon name="local_fire_department" className="text-[13px]" />
                        {deal.claimed}
                      </span>
                      <h5 className="font-heading-sm text-heading-sm text-text-primary truncate mt-1">{deal.title}</h5>
                      <p className="font-caption text-caption text-text-secondary truncate">{deal.store}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-label-md text-label-md font-bold text-text-primary">{deal.price}</span>
                        <span className="text-caption text-badge-discount-text font-semibold">{deal.discount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
              <section className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Businesses Around You
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Explore neighborhood spots with active member perks
                    </p>
                  </div>
                  <button className="font-label-sm text-label-sm text-primary font-semibold hover:underline" type="button">
                    Explore Map
                  </button>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {businesses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                      Nearby businesses will appear here when live offers are available.
                    </div>
                  ) : businesses.map((business, index) => (
                    <div
                      key={business.id ?? `${business.name}-${index}`}
                      className="p-space-md bg-surface-canvas rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-space-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary font-bold font-heading-sm shrink-0">
                          {business.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-heading-sm text-heading-sm text-text-primary truncate">
                              {business.name}
                            </h5>
                            <Icon name="verified" className="text-primary text-[16px]" />
                          </div>
                          <div className="flex items-center gap-2 text-text-tertiary font-caption text-caption mt-0.5">
                            <span className="flex items-center text-text-primary font-medium">
                              <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                              {business.rating}
                            </span>
                            <span>•</span>
                            <span>{business.area}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs shrink-0">
                        <span className="px-2.5 py-1 bg-surface-subtle text-primary font-label-sm text-label-sm font-semibold rounded-lg">
                          {business.deals}
                        </span>
                        <Icon name="chevron_right" className="text-text-tertiary group-hover:text-primary transition-colors text-[20px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                      Popular Near You
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Curated single-item vouchers to claim immediately
                    </p>
                  </div>
                  <span className="font-caption text-caption text-badge-discount-text font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                    Updated hourly
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {products.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                      Popular nearby products will load from the public catalogue feed.
                    </div>
                  ) : products.map((product, index) => (
                    <div
                      key={product.id ?? `${product.title}-${product.store ?? 'store'}-${index}`}
                      className="bg-surface-canvas rounded-xl p-space-sm shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-36 w-full rounded-lg overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${product.image}')` }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                          {product.badge}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-col">
                        <h5 className="font-heading-sm text-heading-sm text-text-primary truncate">{product.title}</h5>
                        <p className="font-caption text-caption text-text-secondary">{product.store}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-label-md text-label-md font-bold text-text-primary">
                            {product.price}
                          </span>
                          <button className="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-caption text-caption font-semibold shadow-sm hover:bg-primary-container transition-all">
                            Instant Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="w-full bg-surface-container-high rounded-2xl p-space-lg lg:p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                  <Icon name="storefront" className="text-[28px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                    Merchant Growth Network
                  </span>
                  <h4 className="font-heading-md text-heading-md text-text-primary tracking-tight">
                    Own a local business in your area?
                  </h4>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                    Put your neighborhood deals on VEMTAP and welcome high-value repeat walk-ins.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-md w-full md:w-auto shrink-0 justify-end">
                <button
                  className="w-full md:w-auto h-[48px] px-6 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  type="button"
                  onClick={() => onNav('for-business')}
                >
                  <span>Set up in 3 minutes</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
            </section>
          </div>

          {toastElement}
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  return (
    <>
      <DesktopPage activeNav="home" onNav={onNav} withFooter withHeader onOpenLocation={() => setLocationOpen(true)}>
        <div className="w-full px-margin py-space-xl max-w-7xl mx-auto flex flex-col gap-space-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="space-y-space-2xs">
              <div className="flex items-center gap-space-xs text-text-tertiary">
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-primary">
                  Neighborhood Pulse
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                <span className="font-caption text-caption text-text-secondary">{liveOfferLabel}</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight flex items-center gap-space-xs">
                Good evening
                <Icon name="waving_hand" className="text-[26px] text-tertiary-container" />
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Here is what is hot and redeemable in your immediate perimeter today.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-canvas p-space-sm rounded-2xl shadow-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {GRID_CATEGORIES.map((label) => {
                const active = label === gridCategory;
                return (
                  <button
                    key={label}
                    className={`px-space-md py-space-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                        : 'bg-surface-subtle text-text-secondary font-medium hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => {
                      setGridCategory(label);
                      showToast(`Filtered: ${label}`);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-md bg-inverse-surface text-on-primary cursor-pointer"
            onClick={onOpenFeatured}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
              <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-full overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${HERO_GRID_IMAGE}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-inverse-surface/40 to-inverse-surface" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-space-2xs rounded-full shadow-sm text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping" />
                  <span className="font-caption text-caption font-semibold uppercase tracking-wider text-badge-discount-text">
                    Editor&apos;s Spotlight
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-space-xl flex flex-col justify-between z-10">
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-secondary-fixed uppercase tracking-wider">
                      {city || 'Your area'} • {district || 'Local picks'}
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      Live Deal
                    </span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg font-bold text-on-primary tracking-tight leading-snug">
                    Featured local offer from nearby merchants
                  </h2>
                  <p className="font-body-md text-body-md text-text-tertiary">
                    Fresh savings, quick redemption, and walk-in perks from the best-rated businesses around your current
                    location.
                  </p>
                  <div className="flex items-baseline gap-space-sm pt-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-on-primary">
                      {publicOffers.length > 0 ? formatCurrency(publicOffers[0] ? getApiPrice(publicOffers[0] as Record<string, unknown>) : 0) : '₦0'}
                    </span>
                    <span className="font-body-md text-body-md text-text-tertiary line-through">
                      {publicOffers.length > 0 ? formatCurrency(publicOffers[0] ? getApiComparePrice(publicOffers[0] as Record<string, unknown>) : 0) : ''}
                    </span>
                    <span className="font-caption text-caption text-secondary-fixed font-medium">
                      {publicOffers.length > 0 ? 'Live now' : 'Loading live offers'}
                    </span>
                  </div>
                </div>

                <div className="pt-space-md flex flex-col sm:flex-row items-center gap-space-md">
                  <button
                    className="w-full sm:w-auto flex-1 h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-md active:scale-95"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      const selected = {
                        title: publicOffers[0] ? getApiTitle(publicOffers[0] as Record<string, unknown>) : 'Local featured offer',
                        business: publicOffers[0] ? getApiBusinessName(publicOffers[0] as Record<string, unknown>) : 'Nearby merchant',
                        location: `${city}, ${district}`,
                        price: publicOffers[0] ? getApiPrice(publicOffers[0] as Record<string, unknown>) : 0,
                        oldPrice: publicOffers[0] ? getApiComparePrice(publicOffers[0] as Record<string, unknown>) : 0,
                        discountLabel: 'Live Deal',
                        image: publicOffers[0] ? getNestedImage(publicOffers[0] as Record<string, unknown>) : HERO_GRID_IMAGE,
                      };
                      onClaim?.(selected, () => showToast('Featured voucher is ready to claim.'));
                    }}
                  >
                    <span>Claim Voucher</span>
                    <Icon name="bolt" className="text-[18px]" />
                  </button>
                  <div className="flex items-center gap-space-2xs text-text-tertiary">
                    <Icon name="timer" className="text-tertiary-fixed text-[18px]" />
                    <span className="font-caption text-caption font-medium">
                      {Math.max(1, publicOffers.length || 1)} live vouchers available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Deals Near You</h2>
              <span className="hidden sm:inline-flex px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                1.2km avg
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center bg-surface-subtle p-1 rounded-xl">
                <button
                  className="p-space-2xs rounded-lg bg-surface-canvas text-primary shadow-sm transition-all"
                  title="Grid Layout"
                  type="button"
                  onClick={() => setView('grid')}
                >
                  <Icon name="grid_view" className="text-[20px]" />
                </button>
                <button
                  className="p-space-2xs rounded-lg text-text-tertiary hover:text-text-primary transition-all"
                  title="List Layout"
                  type="button"
                  onClick={() => setView('list')}
                >
                  <Icon name="view_list" className="text-[20px]" />
                </button>
              </div>
              <button
                className="font-label-md text-label-md font-semibold text-primary hover:text-primary-container flex items-center gap-0.5 transition-colors"
                type="button"
                onClick={onOpenDeals}
              >
                <span>See All</span>
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {listDeals.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                {offersLoading ? 'Loading live deals...' : 'No live offers are available for this grid view yet.'}
              </div>
            ) : listDeals.map((deal, index) => (
              <div
                key={`${deal.title}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDeal({
                  title: deal.title,
                  business: deal.store,
                  location: `${city}, ${district}`,
                  price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                  oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                  discountLabel: deal.discount,
                  image: deal.image,
                })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenDeal({
                      title: deal.title,
                      business: deal.store,
                      location: `${city}, ${district}`,
                      price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                      oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                      discountLabel: deal.discount,
                      image: deal.image,
                    });
                  }
                }}
                className="group relative bg-surface-canvas rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container-low">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url('${deal.image}')` }}
                    />
                    <span className="absolute top-space-sm left-space-sm px-space-xs py-0.5 rounded-full font-caption text-caption font-bold shadow-sm bg-badge-discount-bg text-badge-discount-text">
                      {deal.discount}
                    </span>
                    <button
                      aria-label="Save Deal"
                      className={`absolute top-space-sm right-space-sm w-8 h-8 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        liked[index] ? 'text-error' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike(index);
                      }}
                    >
                      <Icon name="favorite" filled={Boolean(liked[index])} className="text-[18px]" />
                    </button>
                    <div className="absolute bottom-space-2xs left-space-sm px-space-xs py-0.5 rounded-md bg-inverse-surface/80 backdrop-blur-sm text-on-primary font-caption text-caption flex items-center gap-1">
                      <Icon name="near_me" className="text-[14px]" />
                      <span>{deal.meta}</span>
                    </div>
                  </div>
                  <div className="p-space-md space-y-space-2xs">
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                      <span>{deal.title}</span>
                      <span className="flex items-center gap-0.5 text-text-primary font-medium">
                        <Icon name="star" filled className="text-tertiary-container text-[14px]" />
                        {deal.rating}
                      </span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary truncate">
                      {deal.title}
                    </h3>
                    <p className="font-caption text-caption text-text-secondary line-clamp-1">{deal.copy}</p>
                  </div>
                </div>
                <div className="p-space-md pt-0 flex items-center justify-between gap-space-sm">
                  <div>
                    <div className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</div>
                    <div className="font-caption text-caption text-text-tertiary line-through">{deal.oldPrice}</div>
                  </div>
                  <button
                    className="h-10 px-space-md rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm active:scale-95 flex items-center justify-center"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      const selected = {
                        title: deal.title,
                        business: deal.store,
                        location: `${city}, ${district}`,
                        price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                        oldPrice: Number.parseFloat(String(deal.oldPrice ?? 0).replace(/[^\d.]/g, '')) || 0,
                        discountLabel: deal.discount,
                        image: deal.image,
                      };
                      onClaim?.(selected, () => showToast(`${deal.title} voucher is ready to claim.`));
                    }}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-space-md pt-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="local_fire_department" className="text-tertiary-container text-[24px]" />
                <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Trending Deals</h2>
                <span className="text-text-tertiary font-caption text-caption ml-2">High demand right now</span>
              </div>
              <span className="font-label-sm text-label-sm text-text-secondary hidden sm:inline">
                Updated 12 mins ago
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {trendingDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  Live trending deals will appear here when the catalog refreshes.
                </div>
              ) : trendingDeals.map((deal, index) => (
                <div
                  key={`${deal.title}-${deal.store ?? 'store'}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal(createDealPayload({
                    title: deal.title,
                    price: deal.price,
                    oldPrice: 0,
                    discount: deal.discount,
                    image: deal.image,
                    business: deal.store,
                  }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal(createDealPayload({
                        title: deal.title,
                        price: deal.price,
                        oldPrice: 0,
                        discount: deal.discount,
                        image: deal.image,
                        business: deal.store,
                      }));
                    }
                  }}
                  className="bg-surface-canvas rounded-2xl p-space-md flex flex-col sm:flex-row items-center gap-space-md shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative w-full sm:w-44 h-36 shrink-0 rounded-xl overflow-hidden bg-surface-container-low">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${deal.image}')` }}
                    />
                    <span className="absolute top-2 left-2 px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <div className="flex-1 w-full space-y-space-2xs">
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                      <span>{deal.store}</span>
                      <span className="text-tertiary-container font-semibold">{deal.claimed}</span>
                    </div>
                    <h3 className="font-heading-sm text-heading-sm font-semibold text-text-primary">{deal.title}</h3>
                    <p className="font-body-md text-body-md text-text-secondary line-clamp-1">{deal.store}</p>
                    <div className="flex items-center justify-between pt-space-xs">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</span>
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          {deal.discount}
                        </span>
                      </div>
                      <button
                        className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const selected = {
                            title: deal.title,
                            business: deal.store,
                            location: `${city}, ${district}`,
                            price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                            oldPrice: Number.parseFloat(String(deal.oldPrice ?? 0).replace(/[^\d.]/g, '')) || 0,
                            discountLabel: deal.discount,
                            image: deal.image,
                          };
                          onClaim?.(selected, () => showToast(`${deal.title} voucher is live.`));
                        }}
                      >
                        Claim Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl pt-space-lg">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="space-y-space-2xs">
                  <h2 className="font-heading-md text-heading-md font-bold text-text-primary">
                    Businesses Around You
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Directly verified neighborhood storefronts with tap redemption
                  </p>
                </div>
                <button className="font-label-sm text-label-sm font-semibold text-primary" type="button">
                  Explore All
                </button>
              </div>
              <div className="space-y-space-sm">
                {businesses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                    Nearby business cards will load from the live catalogue feed.
                  </div>
                ) : businesses.map((business, index) => (
                  <div
                    key={business.id ?? `${business.name}-${index}`}
                    className="bg-surface-canvas rounded-2xl p-space-md flex items-center justify-between gap-space-md shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-heading-sm font-bold">
                        {business.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-space-2xs">
                          <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                            {business.name}
                          </h4>
                          <Icon name="verified" filled className="text-[16px] text-primary" />
                        </div>
                        <p className="font-caption text-caption text-text-secondary">{business.area}</p>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-text-tertiary mt-0.5">
                          <span className="text-badge-discount-text font-medium">{business.rating}</span>
                          <span>•</span>
                          <span>{business.deals}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-space-sm py-space-xs rounded-xl bg-surface-subtle hover:bg-surface-tint-blue text-text-primary hover:text-primary font-label-md text-label-md font-semibold transition-colors shrink-0"
                      type="button"
                    >
                      View Store
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="space-y-space-2xs">
                  <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Popular Near You</h2>
                  <p className="font-caption text-caption text-text-secondary">Neighborhood activity cluster map</p>
                </div>
                <span className="font-caption text-caption bg-surface-tint-blue text-primary px-space-xs py-0.5 rounded-full font-semibold">
                  Live GPS
                </span>
              </div>
              <div className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm p-space-sm space-y-space-sm">
                <div
                  className="w-full h-56 rounded-xl bg-cover bg-center relative overflow-hidden"
                  style={{ backgroundImage: `url('${GRID_MAP_IMAGE}')` }}
                >
                  <div className="absolute inset-0 bg-primary/10" />
                  <div className="absolute top-1/3 left-1/4 bg-primary text-on-primary px-2 py-1 rounded-full text-caption font-semibold shadow-md flex items-center gap-1 scale-90">
                    <Icon name="restaurant" className="text-[14px]" />
                    <span>{publicOffers[0] ? getApiBusinessName(publicOffers[0] as Record<string, unknown>) : 'Nearby merchant'}</span>
                  </div>
                  <div className="absolute bottom-1/3 right-1/4 bg-tertiary-container text-on-tertiary px-2 py-1 rounded-full text-caption font-semibold shadow-md flex items-center gap-1 scale-90">
                    <Icon name="shopping_bag" className="text-[14px]" />
                    <span>{district || 'Local area'}</span>
                  </div>
                </div>
                <div className="p-space-xs flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-text-primary">
                      {city || 'Your area'} • {district || 'Nearby'}
                    </p>
                    <p className="font-caption text-caption text-text-tertiary">
                      {Math.max(1, publicOffers.length || 1)} partner merchants actively redeeming today
                    </p>
                  </div>
                  <button
                    className="h-9 px-space-sm bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold rounded-xl hover:bg-secondary-fixed transition-colors"
                    type="button"
                  >
                    Expand Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full rounded-2xl bg-surface-tint-blue p-space-xl overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="space-y-space-xs max-w-xl">
                <span className="font-caption text-caption font-bold uppercase tracking-wider text-primary">
                  VEMTAP for Business
                </span>
                <h3 className="font-heading-md text-heading-md font-bold text-text-primary">
                  Own a business in {city || 'your area'}?
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Publish flash offers, convert nearby walk-in foot traffic, and build lifetime repeat customers with
                  zero setup fee.
                </p>
              </div>
              <div className="flex items-center gap-space-md shrink-0">
                <button
                  className="h-[52px] px-space-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs transition-all shadow-md active:scale-95"
                  type="button"
                  onClick={() => onNav('for-business')}
                >
                  <span>Set Up Your Store</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-primary-fixed opacity-40 pointer-events-none" />
          </div>
        </div>

        {toastElement}
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </>
  );
}
