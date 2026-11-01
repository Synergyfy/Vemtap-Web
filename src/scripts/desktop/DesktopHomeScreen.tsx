import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';
import { useHomeDealCategories } from '../../hooks/useHomeDealCategories';
import { useDealLikes } from '../../hooks/useDealLikes';
import { useHomeFeed } from '../../hooks/useHomeFeed';
import type { DiscoverBusiness } from '../../hooks/useDiscoverBusinesses';
import { Skeleton, SkeletonGroup } from '../../components/ui/Skeleton';
import {
  firstString,
  isVerifiedOffer,
  offerCategoryLabel,
  offerDiscountLabel,
  offerEndsLabel,
  offerImage,
  offerLocationLabel,
  realOfferId,
  type OfferRecord,
} from '../../utils/homeOffer';

interface DesktopHomeScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: (deal?: {
    id?: string | number;
    title?: string;
    business?: string;
    location?: string;
    price?: number | string;
    oldPrice?: number | string;
    discountLabel?: string;
    image?: string;
  }) => void;
  onClaim?: (deal?: {
    id?: string | number;
    title?: string;
    business?: string;
    location?: string;
    price?: number | string;
    oldPrice?: number | string;
    discountLabel?: string;
    image?: string;
  } | null, onClaimed?: () => void) => void;
  /** Opens live comments & reviews for a deal (with an optional star rating). */
  onOpenComments?: (deal: { id?: string; title?: string; business?: string; location?: string; price?: number; image?: string }) => void;
  /** Opens the live page of exactly this business. */
  onOpenBusiness?: (business: { code: string; id?: string; name?: string }) => void;
}

const formatCurrency = (value: number | string | undefined): string => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(parsed);
};

/** The deal's own photo first, then an item photo, then the business logo; a neutral block when it has none. */
const getNestedImage = (offer: Record<string, unknown>): string => offerImage(offer);

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const offerDescription = (offer: OfferRecord): string => firstString(offer.description) ?? '';

const claimedLabel = (offer: OfferRecord): string | undefined => {
  const claimed = Number(offer.claimedCount ?? 0);
  return Number.isFinite(claimed) && claimed > 0 ? `${claimed} claimed` : undefined;
};

const remainingLabel = (offer: OfferRecord): string | undefined => {
  const remaining = Number(offer.remainingLimit);
  return offer.remainingLimit != null && Number.isFinite(remaining) && remaining >= 0 ? `${remaining} left` : undefined;
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
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    discount: offerDiscountLabel(offer),
    merchant: `${merchant} • ${offerLocationLabel(offer)}`,
    title,
    copy: offerDescription(offer),
    verified: isVerifiedOffer(offer),
    price: formatCurrency(price),
    oldPrice: original > price ? formatCurrency(original) : '',
    save: original > price ? `Save ${formatCurrency(original - price)}` : '',
    ending: offerEndsLabel(offer),
    // Facts from the offer itself — nothing is shown that the API did not send.
    features: [
      { icon: 'schedule', text: offerEndsLabel(offer) },
      { icon: 'pin_drop', text: offerLocationLabel(offer) },
      { icon: 'category', text: offerCategoryLabel(offer) },
      { icon: 'confirmation_number', text: claimedLabel(offer) },
      { icon: 'inventory_2', text: remainingLabel(offer) },
    ].filter((feature): feature is { icon: string; text: string } => Boolean(feature.text)),
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
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    discount: offerDiscountLabel(offer),
    timer: offerEndsLabel(offer),
    meta: offerLocationLabel(offer),
    title,
    store: business,
    copy: offerDescription(offer),
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
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    claimed: claimedLabel(offer) ?? offerEndsLabel(offer),
    title,
    store: business,
    price: formatCurrency(price),
    oldPrice: original > price ? formatCurrency(original) : '',
    discount: offerDiscountLabel(offer),
  };
};

/** One "Businesses Around You" row from a live business. */
const toBusinessSummary = (business: DiscoverBusiness) => ({
  id: business.code,
  businessId: business.id,
  initials: (business.name.split(' ').slice(0, 2).map((part) => part[0] ?? '').join('') || 'B').slice(0, 2).toUpperCase(),
  name: business.name,
  verified: business.verified,
  category: business.category,
  area: business.location ?? '',
  deals: business.dealCount > 0 ? `${business.dealCount} live offer${business.dealCount === 1 ? '' : 's'}` : 'No live offers',
});

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
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${store}`,
    badge: offerDiscountLabel(offer),
    title,
    store,
    price: formatCurrency(getApiPrice(offer)),
  };
};

function SpotlightSkeleton({ label = 'Loading featured deals' }: { label?: string }) {
  return (
    <SkeletonGroup label={label} className="rounded-2xl bg-surface-container-lowest shadow-md grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <Skeleton className="lg:col-span-7 min-h-[300px] lg:min-h-[420px] rounded-none" />
      <div className="lg:col-span-5 p-space-lg lg:p-space-xl flex flex-col gap-space-sm">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-4 w-28" />)}
        </div>
        <div className="mt-auto pt-space-lg flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-[52px] w-40 rounded-xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

function DealCardSkeletons({ count, className, label = 'Loading deals' }: { count: number; className: string; label?: string }) {
  return (
    <SkeletonGroup label={label} className={className}>
      {Array.from({ length: count }, (_, key) => (
        <div key={key} className="bg-surface-canvas rounded-2xl overflow-hidden shadow-sm">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="p-space-md space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

function RowSkeletons({ count, className, label }: { count: number; className: string; label: string }) {
  return (
    <SkeletonGroup label={label} className={className}>
      {Array.from({ length: count }, (_, key) => (
        <div key={key} className="p-space-md bg-surface-canvas rounded-xl shadow-sm flex items-center gap-space-sm">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
      ))}
    </SkeletonGroup>
  );
}

function TrendingSkeletons({ count, className }: { count: number; className: string }) {
  return (
    <SkeletonGroup label="Loading trending deals" className={className}>
      {Array.from({ length: count }, (_, key) => (
        <div key={key} className="min-w-[280px] sm:min-w-[340px] bg-surface-canvas rounded-xl p-space-md shadow-sm flex gap-3.5 items-center shrink-0">
          <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function DesktopHomeScreen({
  onNav,
  onOpenFilters,
  onOpenFeatured,
  onOpenDeals,
  onOpenDeal,
  onClaim,
  onOpenComments,
  onOpenBusiness,
}: DesktopHomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  // One live category selection drives every section, in both list and grid view.
  const { categories } = useHomeDealCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const activeCategory = categories.find((category) => category.id === categoryId) ?? categories[0];
  const filterLabel = categoryId ? ` in ${activeCategory.label}` : '';
  const noneInCategory = `No live deals${filterLabel} near you yet.`;
  const [toast, setToast] = useState<string | null>(null);
  const trendingRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [spotlight, setSpotlight] = useState(0);
  const [spotlightPaused, setSpotlightPaused] = useState(false);
  // Each section has its own live source; sections show skeletons (never stand-in data) until the API answers.
  const feed = useHomeFeed(categoryId);
  const { offersLoading, businessesLoading } = feed;
  const publicOffers = feed.nearby;

  const createDealPayload = (deal: {
    id?: string | number;
    title: string;
    business?: string;
    store?: string;
    meta?: string;
    price: string | number;
    oldPrice?: string | number;
    discount?: string;
    image: string;
  }) => ({
    id: deal.id,
    title: deal.title,
    business: deal.business ?? deal.store ?? deal.meta?.split('•')[0]?.trim() ?? 'Nearby business',
    location: `${city}, ${district}`,
    price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
    oldPrice: Number.parseFloat(String(deal.oldPrice ?? 0).replace(/[^\d.]/g, '')) || 0,
    discountLabel: deal.discount ?? 'Live Deal',
    image: deal.image,
  });

  const spotlightDeals = useMemo(() => feed.featured.map((offer, index) => toSpotlightSlide(offer, index)), [feed.featured]);
  const listDeals = useMemo(() => publicOffers.slice(0, 4).map((offer, index) => toListDeal(offer, index)), [publicOffers]);
  const trendingDeals = useMemo(() => feed.trending.map((offer, index) => toTrendingDeal(offer, index)), [feed.trending]);
  const businesses = useMemo(() => feed.businesses.slice(0, 3).map(toBusinessSummary), [feed.businesses]);
  const { likes, toggleLike: saveLike } = useDealLikes(feed.offerIds);
  const isLiked = (offerId: string | undefined) => Boolean(offerId && likes[offerId]?.liked);
  const products = useMemo(() => feed.popular.map((offer, index) => toProductSummary(offer, index)), [feed.popular]);
  const liveOfferCount = feed.nearbyTotal;
  const liveOfferLabel = liveOfferCount === 0
    ? `No live offers${filterLabel} yet`
    : liveOfferCount === 1
      ? `1 live offer${filterLabel} near you`
      : `${liveOfferCount} live offers${filterLabel} near you`;
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

  const toggleLike = (offerId: string | undefined) => {
    if (!offerId) return;
    saveLike(offerId).then(
      (saved) => showToast(saved.liked ? 'You liked this deal' : 'Like removed'),
      () => showToast('Could not save your like. Please try again.'),
    );
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
                    <span>{greeting()}</span>
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
                {categories.map((item) => {
                  const active = item.id === categoryId;
                  return (
                    <button
                      key={item.id ?? 'all'}
                      className={`px-4 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm hover:scale-[1.02]'
                          : 'bg-surface-subtle text-text-secondary font-medium hover:bg-surface-container-low hover:text-text-primary shadow-sm'
                      }`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoryId(item.id)}
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
              {offersLoading ? <SpotlightSkeleton /> : (
              <div
                className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md grid grid-cols-1 lg:grid-cols-12 group transition-all duration-300 cursor-pointer"
                onClick={onOpenFeatured}
                onMouseEnter={() => setSpotlightPaused(true)}
                onMouseLeave={() => setSpotlightPaused(false)}
              >
                <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] overflow-hidden">
                  {spotlightData.length === 0 ? (
                    <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-text-secondary p-space-xl">
                      {categoryId ? noneInCategory : 'No live offers are available right now.'}
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
                          FEATURED
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
                          {spotlightData[spotlightIndex].verified ? (
                            <div className="flex items-center gap-1.5 text-primary">
                              <Icon name="verified" className="text-[18px]" />
                              <span className="font-caption text-caption font-semibold uppercase tracking-wider">
                                Partner Verified
                              </span>
                            </div>
                          ) : <span />}
                          <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                            {spotlightData[spotlightIndex].discount}
                          </span>
                        </div>

                        <div>
                          <p className="text-text-secondary font-label-sm text-label-sm uppercase tracking-wide">
                            {spotlightData[spotlightIndex].merchant}
                          </p>
                          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mt-1">
                            {spotlightData[spotlightIndex].title}
                          </h2>
                          {spotlightData[spotlightIndex].copy ? (
                            <p className="font-body-md text-body-md text-text-secondary mt-2 line-clamp-3">
                              {spotlightData[spotlightIndex].copy}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                          {spotlightData[spotlightIndex].features.map((feature) => (
                            <div
                              className="flex items-center gap-2 text-text-secondary font-label-sm text-label-sm"
                              key={feature.text}
                            >
                              <Icon name={feature.icon} className="text-primary text-[18px]" />
                              <span>{feature.text}</span>
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
                              id: offer?.id,
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
              )}
            </section>

            <section className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mb-space-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deals Near You</h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-caption text-caption font-bold">
                      Within {radius}km
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                    Live vouchers from businesses near you
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

              {offersLoading ? (
                <DealCardSkeletons count={4} label="Loading deals near you" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md" />
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {listDeals.length === 0 ? (
                  <div className="col-span-full rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                    {categoryId ? noneInCategory : 'No live deals are available right now.'}
                  </div>
                ) : listDeals.map((deal, index) => (
                  <div
                    key={deal.id ?? `${deal.title}-${deal.store ?? 'store'}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDeal({
                      id: deal.id,
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
                          id: deal.id,
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
                          <button
                            type="button"
                            aria-pressed={isLiked(deal.offerId)}
                            aria-label={isLiked(deal.offerId) ? `Unlike ${deal.title}` : `Like ${deal.title}`}
                            disabled={!deal.offerId}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleLike(deal.offerId);
                            }}
                            className={`flex items-center gap-0.5 font-semibold transition-colors ${isLiked(deal.offerId) ? 'text-error' : 'text-text-secondary hover:text-error'}`}
                          >
                            <Icon name="favorite" filled={isLiked(deal.offerId)} className="text-[16px]" />
                            {deal.offerId ? likes[deal.offerId]?.count ?? 0 : 0}
                          </button>
                          <button
                            type="button"
                            aria-label={`Comments and reviews for ${deal.title}`}
                            disabled={!deal.offerId || !onOpenComments}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenComments?.({
                                id: deal.offerId,
                                title: deal.title,
                                business: deal.store,
                                location: `${city}, ${district}`,
                                price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                                image: deal.image,
                              });
                            }}
                            className="flex items-center gap-0.5 font-semibold text-text-secondary hover:text-primary transition-colors"
                          >
                            <Icon name="chat_bubble_outline" className="text-[16px]" />
                          </button>
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
              )}
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
                      Live deals from businesses near you
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
                {offersLoading ? (
                  <TrendingSkeletons count={3} className="flex gap-space-md" />
                ) : trendingDeals.length === 0 ? (
                  <div className="w-full rounded-xl border border-dashed border-primary/20 bg-surface-canvas p-space-lg text-text-secondary">
                    {categoryId ? noneInCategory : 'Live trending deals will appear here soon.'}
                  </div>
                ) : trendingDeals.map((deal, index) => (
                  <div
                    key={deal.id ?? `${deal.title}-${deal.store ?? 'store'}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDeal({
                      id: deal.id,
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
                          id: deal.id,
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
                      Businesses with live deals near you
                    </p>
                  </div>
                  <button className="font-label-sm text-label-sm text-primary font-semibold hover:underline" type="button" onClick={() => onNav('discover')}>
                    Explore All
                  </button>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {businessesLoading ? (
                    <RowSkeletons count={3} label="Loading businesses" className="flex flex-col gap-space-xs" />
                  ) : businesses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                      {categoryId ? noneInCategory : 'Nearby businesses will appear here when live offers are available.'}
                    </div>
                  ) : businesses.map((business, index) => (
                    <div
                      key={business.id ?? `${business.name}-${index}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenBusiness?.({ code: business.id, id: business.businessId, name: business.name })}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenBusiness?.({ code: business.id, id: business.businessId, name: business.name });
                        }
                      }}
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
                            {business.verified && <Icon name="verified" className="text-primary text-[16px]" />}
                          </div>
                          <div className="flex items-center gap-2 text-text-tertiary font-caption text-caption mt-0.5">
                            {business.category && (
                              <>
                                <span className="text-text-primary font-medium">{business.category}</span>
                                <span>•</span>
                              </>
                            )}
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
                      Single-item vouchers you can claim now
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {offersLoading ? (
                    [0, 1].map((key) => (
                      <div key={key} role="status" aria-busy="true" className="bg-surface-canvas rounded-xl p-space-sm shadow-sm">
                        <span className="sr-only">Loading popular deals</span>
                        <Skeleton className="h-36 w-full" />
                        <div className="mt-2.5 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    ))
                  ) : products.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                      {categoryId ? noneInCategory : 'Popular nearby products will load from the public catalogue feed.'}
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
                          <button
                            type="button"
                            onClick={() =>
                              onClaim?.({
                                id: product.id,
                                title: product.title,
                                business: product.store,
                                location: `${city}, ${district}`,
                                price: Number.parseFloat(String(product.price).replace(/[^\d.]/g, '')) || 0,
                                discountLabel: product.badge,
                                image: product.image,
                              })
                            }
                            className="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-caption text-caption font-semibold shadow-sm hover:bg-primary-container transition-all"
                          >
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
                {greeting()}
                <Icon name="waving_hand" className="text-[26px] text-tertiary-container" />
              </h1>
              <p className="font-body-md text-body-md text-text-secondary">
                Here is what is hot and redeemable in your immediate perimeter today.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-canvas p-space-sm rounded-2xl shadow-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {categories.map((item) => {
                const active = item.id === categoryId;
                return (
                  <button
                    key={item.id ?? 'all'}
                    className={`px-space-md py-space-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
                      active
                        ? 'bg-surface-tint-blue text-primary font-semibold shadow-sm'
                        : 'bg-surface-subtle text-text-secondary font-medium hover:text-text-primary'
                    }`}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategoryId(item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {offersLoading ? (
            <SpotlightSkeleton />
          ) : spotlightData.length === 0 ? (
            <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-xl text-text-secondary">
              {categoryId ? noneInCategory : 'No live offers are available right now.'}
            </div>
          ) : (
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-md bg-inverse-surface text-on-primary cursor-pointer"
            onClick={onOpenFeatured}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
              <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-full overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${spotlightData[spotlightIndex].image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-inverse-surface/40 to-inverse-surface" />
                <div className="absolute top-space-md left-space-md flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-space-2xs rounded-full shadow-sm text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                  <span className="font-caption text-caption font-semibold uppercase tracking-wider text-badge-discount-text">
                    Featured
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-space-xl flex flex-col justify-between z-10">
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between gap-space-sm">
                    <span className="font-label-sm text-label-sm font-semibold text-secondary-fixed uppercase tracking-wider truncate">
                      {spotlightData[spotlightIndex].merchant}
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shrink-0">
                      {spotlightData[spotlightIndex].discount}
                    </span>
                  </div>
                  <h2 className="font-heading-lg text-heading-lg font-bold text-on-primary tracking-tight leading-snug">
                    {spotlightData[spotlightIndex].title}
                  </h2>
                  {spotlightData[spotlightIndex].copy ? (
                    <p className="font-body-md text-body-md text-text-tertiary line-clamp-3">
                      {spotlightData[spotlightIndex].copy}
                    </p>
                  ) : null}
                  <div className="flex items-baseline gap-space-sm pt-space-xs">
                    <span className="font-heading-lg text-heading-lg font-bold text-on-primary">
                      {spotlightData[spotlightIndex].price}
                    </span>
                    {spotlightData[spotlightIndex].oldPrice ? (
                      <span className="font-body-md text-body-md text-text-tertiary line-through">
                        {spotlightData[spotlightIndex].oldPrice}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="pt-space-md flex flex-col sm:flex-row items-center gap-space-md">
                  <button
                    className="w-full sm:w-auto flex-1 h-[52px] bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-space-xs transition-all shadow-md active:scale-95"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      const offer = spotlightData[spotlightIndex];
                      onClaim?.({
                        id: offer.id,
                        title: offer.title,
                        business: offer.merchant.split('•')[0]?.trim(),
                        location: `${city}, ${district}`,
                        price: Number.parseFloat(String(offer.price).replace(/[^\d.]/g, '')) || 0,
                        oldPrice: Number.parseFloat(String(offer.oldPrice).replace(/[^\d.]/g, '')) || 0,
                        discountLabel: offer.discount,
                        image: offer.image,
                      }, () => showToast('Featured voucher is ready to claim.'));
                    }}
                  >
                    <span>Claim Voucher</span>
                    <Icon name="bolt" className="text-[18px]" />
                  </button>
                  <div className="flex items-center gap-space-2xs text-text-tertiary">
                    <Icon name="timer" className="text-tertiary-fixed text-[18px]" />
                    <span className="font-caption text-caption font-medium">
                      {spotlightData[spotlightIndex].ending}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Deals Near You</h2>
              <span className="hidden sm:inline-flex px-space-xs py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-caption font-semibold">
                Within {radius}km
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

          {offersLoading ? (
            <DealCardSkeletons count={4} label="Loading deals near you" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md" />
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {listDeals.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                {categoryId ? noneInCategory : 'No live offers are available for this grid view yet.'}
              </div>
            ) : listDeals.map((deal, index) => (
              <div
                key={deal.id ?? `${deal.title}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDeal({
                  id: deal.id,
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
                      id: deal.id,
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
                      aria-label={isLiked(deal.offerId) ? `Unlike ${deal.title}` : `Like ${deal.title}`}
                      aria-pressed={isLiked(deal.offerId)}
                      disabled={!deal.offerId}
                      className={`absolute top-space-sm right-space-sm w-8 h-8 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
                        isLiked(deal.offerId) ? 'text-error' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleLike(deal.offerId);
                      }}
                    >
                      <Icon name="favorite" filled={isLiked(deal.offerId)} className="text-[18px]" />
                    </button>
                    <div className="absolute bottom-space-2xs left-space-sm px-space-xs py-0.5 rounded-md bg-inverse-surface/80 backdrop-blur-sm text-on-primary font-caption text-caption flex items-center gap-1">
                      <Icon name="near_me" className="text-[14px]" />
                      <span>{deal.meta}</span>
                    </div>
                  </div>
                  <div className="p-space-md space-y-space-2xs">
                    <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                      <span className="truncate">{deal.store}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-0.5 text-text-secondary font-medium">
                          <Icon name="favorite" className="text-[14px]" />
                          {deal.offerId ? likes[deal.offerId]?.count ?? 0 : 0}
                        </span>
                          <button
                            type="button"
                            aria-label={`Comments and reviews for ${deal.title}`}
                            disabled={!deal.offerId || !onOpenComments}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenComments?.({
                                id: deal.offerId,
                                title: deal.title,
                                business: deal.store,
                                location: `${city}, ${district}`,
                                price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                                image: deal.image,
                              });
                            }}
                            className="flex items-center gap-0.5 font-semibold text-text-secondary hover:text-primary transition-colors"
                          >
                            <Icon name="chat_bubble_outline" className="text-[16px]" />
                          </button>
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
                        id: deal.id,
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
          )}

          <div className="space-y-space-md pt-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="local_fire_department" className="text-tertiary-container text-[24px]" />
                <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Trending Deals</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {offersLoading ? (
                <TrendingSkeletons count={2} className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-space-md" />
              ) : trendingDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  {categoryId ? noneInCategory : 'Live trending deals will appear here when the catalog refreshes.'}
                </div>
              ) : trendingDeals.map((deal, index) => (
                <div
                  key={deal.id ?? `${deal.title}-${deal.store ?? 'store'}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal(createDealPayload({
                    id: deal.id,
                    title: deal.title,
                    price: deal.price,
                    oldPrice: deal.oldPrice,
                    discount: deal.discount,
                    image: deal.image,
                    business: deal.store,
                  }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenDeal(createDealPayload({
                        id: deal.id,
                        title: deal.title,
                        price: deal.price,
                        oldPrice: deal.oldPrice,
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
                    <div className="flex items-center justify-between pt-space-xs">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{deal.price}</span>
                        {deal.oldPrice ? (
                          <span className="font-caption text-caption text-text-tertiary line-through">
                            {deal.oldPrice}
                          </span>
                        ) : null}
                      </div>
                      <button
                        className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const selected = {
                            id: deal.id,
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
                    Businesses with live deals near you
                  </p>
                </div>
                <button className="font-label-sm text-label-sm font-semibold text-primary" type="button" onClick={() => onNav('discover')}>
                  Explore All
                </button>
              </div>
              <div className="space-y-space-sm">
                {businessesLoading ? (
                  <RowSkeletons count={3} label="Loading businesses" className="space-y-space-sm" />
                ) : businesses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                    {categoryId ? noneInCategory : 'Nearby business cards will load from the live catalogue feed.'}
                  </div>
                ) : businesses.map((business, index) => (
                  <div
                    key={business.id ?? `${business.name}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenBusiness?.({ code: business.id, id: business.businessId, name: business.name })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenBusiness?.({ code: business.id, id: business.businessId, name: business.name });
                      }
                    }}
                    className="bg-surface-canvas rounded-2xl p-space-md flex items-center justify-between gap-space-md shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                          {business.verified && <Icon name="verified" filled className="text-[16px] text-primary" />}
                        </div>
                        <p className="font-caption text-caption text-text-secondary">{business.area}</p>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-text-tertiary mt-0.5">
                          {business.category && (
                            <>
                              <span className="text-text-primary font-medium">{business.category}</span>
                              <span>•</span>
                            </>
                          )}
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
              <div className="space-y-space-2xs">
                <h2 className="font-heading-md text-heading-md font-bold text-text-primary">Popular Near You</h2>
                <p className="font-caption text-caption text-text-secondary">Single-item vouchers you can claim now</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {offersLoading ? (
                  [0, 1].map((key) => (
                    <div key={key} role="status" aria-busy="true" className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm">
                      <span className="sr-only">Loading popular deals</span>
                      <Skeleton className="h-36 w-full" />
                      <div className="mt-2.5 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-md text-text-secondary">
                    {categoryId ? noneInCategory : 'Popular nearby products will load from the public catalogue feed.'}
                  </div>
                ) : products.map((product, index) => (
                  <div
                    key={product.id ?? `${product.title}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDeal({ id: product.id, title: product.title, business: product.store, image: product.image })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenDeal({ id: product.id, title: product.title, business: product.store, image: product.image });
                      }
                    }}
                    className="bg-surface-canvas rounded-2xl p-space-sm shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                  >
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-surface-container-low">
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }} />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold">
                        {product.badge}
                      </span>
                    </div>
                    <h5 className="font-heading-sm text-heading-sm text-text-primary truncate mt-2.5">{product.title}</h5>
                    <p className="font-caption text-caption text-text-secondary truncate">{product.store}</p>
                    <span className="font-label-md text-label-md font-bold text-text-primary mt-2">{product.price}</span>
                  </div>
                ))}
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
