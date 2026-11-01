import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';
import { useDealLikes } from '../../hooks/useDealLikes';
import { useHomeDealCategories } from '../../hooks/useHomeDealCategories';
import { useDealFeedControls, DEAL_PAGE_SIZE as PAGE_SIZE, type DealSortBy } from '../../hooks/useDealFeedControls';
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
} from '../../utils/homeOffer';

interface DesktopDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
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
  onOpenComments?: (deal?: {
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
  onHowToClaim?: () => void;
  /** Pre-fills the search (e.g. "See all deals for …" from the navbar search). */
  initialSearch?: string;
}

interface DiscoveryDeal {
  id?: string | number;
  image: string;
  imageAlt: string;
  discount: string;
  extra?: { label: string; className: string };
  timer: string;
  store: string;
  distance: string;
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  save: string;
}

interface CatalogDeal {
  id?: string | number;
  image: string;
  imageAlt: string;
  discount: string;
  extra?: { label: string; className: string; icon?: string; iconFilled?: boolean };
  distance: string;
  store: string;
  verified: boolean;
  badge?: { label: string; className: string };
  /** Real claim progress, only when the offer has a claim limit. */
  progress?: { claimed: number; total: number };
  title: string;
  copy: string;
  price: string;
  oldPrice: string;
  save: string;
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

/** Same rule as the home cards and the detail page: the deal's own photo first; a neutral block, never a stock photo. */
const getOfferImage = (offer: Record<string, unknown>): string => offerImage(offer);

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const getOfferBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business && typeof offer.business === 'object' ? offer.business as Record<string, unknown> : {};
  const names = [
    offer.businessName,
    offer.merchantName,
    offer.vendorName,
    offer.branchName,
    business.name,
    business.businessName,
    business.merchantName,
    business.companyName,
  ];
  const found = names.find((value) => typeof value === 'string' && value.trim());
  return typeof found === 'string' && found.trim() ? found : 'Local business';
};

const getOfferTitle = (offer: Record<string, unknown>): string => {
  const title = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof title === 'string' && title.trim() ? title : 'Local offer';
};

const getOfferDescription = (offer: Record<string, unknown>): string =>
  firstString(offer.description, offer.summary, offer.copy) ?? '';

const getOfferPrice = (offer: Record<string, unknown>): number => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.price, offer.dealPrice, offer.calculatedPrice, offer.amount, offer.fixedPrice, item?.price, item?.dealPrice, item?.calculatedPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return 0;
};

const getOfferComparePrice = (offer: Record<string, unknown>): number => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.originalPrice, offer.compareAtPrice, offer.listPrice, offer.wasPrice, offer.previousPrice, item?.originalPrice, item?.compareAtPrice, item?.listPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return getOfferPrice(offer);
};

const isUsableOffer = (offer: Record<string, unknown>): boolean => {
  const business =
    getOfferBusinessName(offer) !== 'Local business'
      ? getOfferBusinessName(offer)
      : '';
  const title = getOfferTitle(offer) !== 'Local offer' ? getOfferTitle(offer) : '';
  const price = getOfferPrice(offer);
  const compare = getOfferComparePrice(offer);

  return Boolean(business && title && (price > 0 || compare > 0));
};

const toDiscoveryDeal = (offer: Record<string, unknown>): DiscoveryDeal => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const compare = getOfferComparePrice(offer);
  const difference = Math.max(compare - price, 0);
  return {
    id: String(
      offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${getOfferBusinessName(offer)}-${title}`,
    ),
    image: getOfferImage(offer),
    imageAlt: `${title} by ${getOfferBusinessName(offer)}`,
    discount: offerDiscountLabel(offer),
    extra: offerCategoryLabel(offer)
      ? { label: offerCategoryLabel(offer) as string, className: 'bg-tertiary-fixed text-on-tertiary-fixed font-bold' }
      : undefined,
    timer: offerEndsLabel(offer),
    store: getOfferBusinessName(offer),
    distance: offerLocationLabel(offer),
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: compare > price ? formatCurrency(compare) : '',
    save: difference > 0 ? `-${formatCurrency(difference)}` : '',
  };
};

const toCatalogDeal = (offer: Record<string, unknown>): CatalogDeal => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const compare = getOfferComparePrice(offer);
  const business = getOfferBusinessName(offer);
  return {
    id: String(
      offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${business}-${title}`,
    ),
    image: getOfferImage(offer),
    imageAlt: `${title} by ${business}`,
    discount: offerDiscountLabel(offer),
    extra: { label: offerEndsLabel(offer), className: 'bg-surface-canvas/90 text-text-primary', icon: 'schedule' },
    distance: offerLocationLabel(offer),
    store: business,
    verified: isVerifiedOffer(offer),
    badge: offerCategoryLabel(offer)
      ? { label: offerCategoryLabel(offer) as string, className: 'bg-surface-tint-blue text-primary' }
      : undefined,
    progress: Number(offer.totalLimit) > 0
      ? { claimed: Math.max(0, Number(offer.claimedCount) || 0), total: Number(offer.totalLimit) }
      : undefined,
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: compare > price ? formatCurrency(compare) : '',
    save: compare > price ? `Save ${formatCurrency(compare - price)}` : '',
  };
};


function DealCardSkeletons({ count, className }: { count: number; className: string }) {
  return (
    <SkeletonGroup label="Loading deals" className={className}>
      {Array.from({ length: count }, (_, key) => (
        <div key={key} className="bg-surface-canvas rounded-2xl shadow-sm overflow-hidden">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-space-md space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

function FeaturedDealSkeleton() {
  return (
    <SkeletonGroup label="Loading featured deal" className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
      <Skeleton className="lg:col-span-7 min-h-[280px] rounded-none" />
      <div className="lg:col-span-5 p-space-xl space-y-space-md">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="flex items-center justify-between pt-space-md">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

export function DesktopDealsScreen({ onNav, onOpenFilters, onOpenFeatured, onOpenDeal, onOpenComments, onClaim, onHowToClaim, initialSearch }: DesktopDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  // Live business categories; the chosen one filters the feed (`categoryId`).
  const { categories } = useHomeDealCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const activeCategory = categories.find((item) => item.id === categoryId) ?? categories[0];
  // Search, sort and "load more" — all real feed params (see useDealFeedControls).
  const feed = useDealFeedControls(categoryId, initialSearch);
  // Live mode starts loading, so the page shows skeletons (never stand-in data) until the API answers.
  const [offersLoading, setOffersLoading] = useState(() => hasApiConfig());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  // The full-page skeleton is only for the very first load; later loads keep the layout (and the search box).
  const [loadedOnce, setLoadedOnce] = useState(false);
  const chooseCategory = (id: string | null) => setCategoryId(id);
  const [heroClaimed, setHeroClaimed] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Deal Claimed Successfully!');
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const toastTimer = useRef<number | undefined>(undefined);
  const claimTimers = useRef<Record<string, number>>({});
  const apiReady = hasApiConfig();

  // Nearest first within the radius once the customer has a location (unless another sort is chosen).
  const { feedParams, isLoadingMorePage, limit } = feed;
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
      if (isLoadingMorePage) setLoadingMore(true);
      else setOffersLoading(true);
      try {
        const response = await catalogueService.getPublicOffers(feedParams);
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) {
          setPublicOffers(rows as Record<string, unknown>[]);
          setHasMore(rows.length >= limit);
        }
      } catch {
        if (!ignore) {
          setPublicOffers([]);
          setHasMore(false);
        }
      } finally {
        if (!ignore) {
          setOffersLoading(false);
          setLoadingMore(false);
          setLoadedOnce(true);
        }
      }
    };

    loadOffers();
    return () => {
      ignore = true;
    };
  }, [feedParams, isLoadingMorePage, limit]);

  const usableOffers = useMemo(() => publicOffers.filter(isUsableOffer), [publicOffers]);
  const discoveryDeals = useMemo(() => usableOffers.map(toDiscoveryDeal), [usableOffers]);
  const catalogDeals = useMemo(() => usableOffers.map(toCatalogDeal), [usableOffers]);
  const featuredDeal = catalogDeals[0] ?? null;
  const emptyMessage = feed.search
    ? `No live deals match "${feed.search}"${categoryId ? ` in ${activeCategory.label}` : ''}.`
    : categoryId
      ? `No live deals in ${activeCategory.label} near you yet.`
      : 'No live deals near you yet.';

  const searchBox = (className: string) => (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Search deals</span>
      <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none" />
      <input
        className="w-full h-11 pl-10 pr-space-md bg-surface-subtle rounded-xl text-on-surface placeholder:text-text-tertiary font-body-md text-body-md outline-none focus:bg-surface-canvas focus:shadow-[0_0_0_2px_#066cf4] shadow-sm transition-all"
        placeholder="Search deals or businesses..."
        type="search"
        value={feed.searchInput}
        onChange={(event) => feed.setSearchInput(event.target.value)}
      />
    </label>
  );

  const sortSelect = (
    <label className="flex items-center gap-1 text-primary font-label-md text-label-md shrink-0">
      <Icon name="sort" className="text-[18px]" />
      <span className="sr-only">Sort deals</span>
      <select
        className="bg-transparent font-semibold text-primary outline-none cursor-pointer hover:underline"
        value={feed.sortBy}
        onChange={(event) => feed.setSortBy(event.target.value as DealSortBy)}
      >
        {feed.sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  useEffect(() => {
    const timers = claimTimers.current;
    return () => {
      window.clearTimeout(toastTimer.current);
      Object.values(timers).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  // Live likes: GET /deals/:id/reaction-status to load, POST /deals/:id/reactions { type: 'like' } to toggle.
  const offerIds = useMemo(
    () => usableOffers.map(realOfferId).filter((id): id is string => Boolean(id)),
    [usableOffers],
  );
  const { likes, toggleLike: saveLike } = useDealLikes(offerIds);
  const likeIdOf = (id: unknown) => realOfferId({ id });
  const isLiked = (id: unknown) => {
    const offerId = likeIdOf(id);
    return Boolean(offerId && likes[offerId]?.liked);
  };
  const likeCountOf = (id: unknown) => {
    const offerId = likeIdOf(id);
    return offerId ? likes[offerId]?.count ?? 0 : 0;
  };

  const claimDeal = (key: string) => {
    if (claimed[key]) {
      return;
    }
    setClaimed((prev) => ({ ...prev, [key]: true }));
    setToastMessage('Deal Claimed Successfully!');
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 3000);
    window.clearTimeout(claimTimers.current[key]);
    claimTimers.current[key] = window.setTimeout(() => {
      setClaimed((prev) => ({ ...prev, [key]: false }));
      delete claimTimers.current[key];
    }, 3500);
  };

  const toggleDealLike = (id: unknown) => {
    const offerId = likeIdOf(id);
    if (!offerId) return;
    saveLike(offerId).then(
      (saved) => showToastMessage(saved.liked ? 'You liked this deal' : 'Like removed'),
      () => showToastMessage('Could not save your like. Please try again.'),
    );
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 2500);
  };

  const claimToast = toast ? (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface p-space-sm px-space-md rounded-2xl shadow-xl">
      <div className="w-8 h-8 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
        <Icon name="check" className="text-[18px]" />
      </div>
      <div>
        <p className="font-label-md text-label-md font-semibold">{toastMessage}</p>
        <p className="font-caption text-caption opacity-80">
          {toastMessage === 'Deal Claimed Successfully!' ? 'Saved to your wallet. Present QR in-store to redeem.' : 'Open the deal page to join the conversation.'}
        </p>
      </div>
    </div>
  ) : null;

  if (!apiReady) {
    return (
      <>
        <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
          <section className="w-full max-w-7xl mx-auto px-margin py-space-3xl">
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-space-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <Icon name="info" className="text-[22px]" />
              </div>
              <p className="mt-space-md font-label-md text-label-md text-text-primary font-semibold">No live deals available</p>
              <p className="mt-1 font-body-md text-body-md text-text-secondary">
                Connect the API and publish public offers to populate this feed.
              </p>
            </div>
          </section>
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  if (!loadedOnce && hasApiConfig()) {
    return (
      <>
        <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
          <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-2xl">
            <section className="w-full rounded-2xl bg-surface-canvas shadow-md overflow-hidden">
              <FeaturedDealSkeleton />
            </section>
            <DealCardSkeletons count={PAGE_SIZE} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg" />
          </div>
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  if (!offersLoading && !categoryId && !feed.search && !usableOffers.length) {
    return (
      <>
        <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
          <section className="w-full max-w-7xl mx-auto px-margin py-space-3xl">
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-space-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <Icon name="info" className="text-[22px]" />
              </div>
              <p className="mt-space-md font-label-md text-label-md text-text-primary font-semibold">No live deals available</p>
              <p className="mt-1 font-body-md text-body-md text-text-secondary">
                New offers from businesses near you will show up here.
              </p>
            </div>
          </section>
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  if (view === 'list') {
    return (
      <>
        <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
          <section className="relative w-full max-w-7xl mx-auto px-margin pb-space-3xl">
            <div className="w-full pt-space-lg pb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="space-y-space-2xs">
                <div className="flex items-center gap-space-xs text-text-tertiary font-label-sm text-label-sm">
                  <span>Explore Exclusive Savings</span>
                  <span>•</span>
                  <span className="flex items-center text-primary font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary-container inline-block animate-pulse mr-1.5" />
                    Live offers near you
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs">
                  <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    {greeting()}
                  </h1>
                  <button
                    className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-container-high text-on-surface text-label-md font-label-md shadow-sm"
                    type="button"
                    onClick={() => setLocationOpen(true)}
                  >
                    <Icon name="location_on" className="text-primary text-[18px]" />
                    <span className="font-semibold text-text-primary">
                      {district}, {city}
                    </span>
                    <span className="text-text-tertiary">Within {radius}km</span>
                    <Icon name="keyboard_arrow_down" className="text-text-secondary text-[16px]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 max-w-full">
                {categories.map((item) => {
                  const active = item.id === categoryId;
                  return (
                    <button
                      key={item.id ?? 'all'}
                      aria-pressed={active}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-medium'
                          : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => chooseCategory(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md mb-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-[0_4px_20px_-4px_rgba(13,37,76,0.03)]">
              <div className="flex items-center gap-space-md w-full sm:w-auto">
                <div className="flex items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">{offersLoading ? 'Loading deals…' : `Showing ${catalogDeals.length} deal${catalogDeals.length === 1 ? '' : 's'}`}</span>
                </div>
                <div className="h-4 w-px bg-surface-container-highest hidden sm:block" />
                <p className="hidden lg:inline font-caption text-caption text-text-tertiary">
                  Tap &apos;Claim&apos; to lock in redeemable vouchers
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-space-sm">
                {searchBox('w-full sm:w-64')}
                {sortSelect}
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
                  <button
                    aria-label="Grid View"
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:text-text-primary transition-all"
                    type="button"
                    onClick={() => setView('grid')}
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="List View"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container-lowest text-primary shadow-sm transition-all"
                    type="button"
                  >
                    <Icon name="view_list" className="text-[20px]" filled />
                  </button>
                </div>

                <button
                  className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-low text-text-primary hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors shadow-sm"
                  type="button"
                  onClick={onOpenFilters}
                >
                  <Icon name="tune" className="text-primary text-[18px]" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {offersLoading ? (
              <DealCardSkeletons count={PAGE_SIZE} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg" />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {catalogDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  {emptyMessage}
                </div>
              ) : catalogDeals.map((deal, index) => (
                <article
                  key={`${deal.title}-${deal.store}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal({
                    id: deal.id,
                    title: deal.title,
                    business: deal.store,
                    location: `${city}, ${district}`,
                    price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                    oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                    discountLabel: deal.save,
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
                        discountLabel: deal.save,
                        image: deal.image,
                      });
                    }
                  }}
                  className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_18px_-2px_rgba(13,37,76,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(6,108,244,0.12)] transition-all duration-300 cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-space-2xs">
                      <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold tracking-tight shadow-sm">
                        {deal.discount}
                      </span>
                      {deal.extra ? (
                        <span
                          className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-1 shadow-sm ${deal.extra.className}`}
                        >
                          {deal.extra.icon ? (
                            <Icon
                              name={deal.extra.icon}
                              className="text-[13px]"
                              filled={deal.extra.iconFilled ?? false}
                            />
                          ) : null}
                          {deal.extra.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-text-primary text-caption font-caption font-semibold">
                      <Icon name="near_me" className="text-primary text-[14px]" />
                      <span>{deal.distance}</span>
                    </div>
                  </div>

                  <div className="p-space-lg flex-1 flex flex-col justify-between">
                    <div className="space-y-space-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-sm text-label-sm font-semibold text-text-secondary">
                            {deal.store}
                          </span>
                          {deal.verified ? (
                            <Icon name="verified" filled className="text-primary text-[16px]" />
                          ) : null}
                          {deal.badge ? (
                            <span
                              className={`px-1.5 py-0.5 rounded font-caption text-caption font-bold ${deal.badge.className}`}
                            >
                              {deal.badge.label}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          aria-pressed={isLiked(deal.id)}
                          aria-label={isLiked(deal.id) ? `Unlike ${deal.title}` : `Like ${deal.title}`}
                          disabled={!likeIdOf(deal.id)}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleDealLike(deal.id);
                          }}
                          className={`flex items-center gap-0.5 text-caption font-caption font-semibold transition-colors ${isLiked(deal.id) ? 'text-error' : 'text-text-secondary hover:text-error'}`}
                        >
                          <Icon name="favorite" filled={isLiked(deal.id)} className="text-[16px]" />
                          {likeCountOf(deal.id)}
                        </button>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      {deal.copy ? <p className="font-caption text-caption text-text-tertiary line-clamp-1">{deal.copy}</p> : null}
                    </div>

                    <div className="pt-space-md mt-space-md flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading-md text-heading-md text-text-primary font-bold">
                            {deal.price}
                          </span>
                          {deal.oldPrice ? (
                            <span className="font-caption text-caption text-text-tertiary line-through">
                              {deal.oldPrice}
                            </span>
                          ) : null}
                        </div>
                        {deal.save ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                            {deal.save}
                          </span>
                        ) : null}
                      </div>
                      <button
                        className={`h-11 px-6 rounded-xl font-button-primary text-button-primary font-semibold transition-all active:scale-95 ${
                          claimed[deal.title]
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-primary-container hover:bg-primary text-on-primary shadow-[0_4px_14px_rgba(6,108,244,0.3)]'
                        }`}
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
                            discountLabel: deal.save,
                            image: deal.image,
                          };
                          onClaim?.(selected, () => claimDeal(deal.title));
                        }}
                      >
                        {claimed[deal.title] ? 'Claimed!' : 'Claim'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}

            {!offersLoading && hasMore ? (
              <div className="mt-space-lg flex justify-center">
                <button
                  className="px-space-xl py-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-full font-label-md text-label-md text-primary font-semibold flex items-center gap-space-2xs shadow-sm transition-all disabled:opacity-60"
                  type="button"
                  disabled={loadingMore}
                  onClick={feed.loadMore}
                >
                  <span>{loadingMore ? 'Loading more deals…' : 'Load more deals'}</span>
                  <Icon name="keyboard_arrow_down" className="text-[18px]" />
                </button>
              </div>
            ) : null}

            <div className="mt-space-2xl bg-surface-tint-blue rounded-2xl p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary shrink-0 shadow-md">
                  <Icon name="verified" className="text-[24px]" />
                </div>
                <div>
                  <h4 className="font-heading-sm text-heading-sm text-text-primary font-semibold">
                    Zero-Risk VEMTAP Guarantee
                  </h4>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Claim online for free. Show your barcode to the cashier and pay the discounted price in {district || city || 'your area'}.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-space-2xs text-primary font-label-md text-label-md font-semibold hover:underline shrink-0"
                type="button"
                onClick={onHowToClaim}
              >
                <span>How claiming works</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </section>

          {claimToast}
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

  return (
    <>
      <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
        {/* Page heading (not a second navbar): the navbar above already has search and location. */}
        <div className="max-w-7xl mx-auto px-margin pt-space-xl w-full flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          <div className="space-y-space-2xs min-w-0">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
              {feed.search ? <>Results for “{feed.search}”</> : 'Deals & Offers'}
            </h1>
            <p className="font-body-md text-body-md text-text-secondary flex flex-wrap items-center gap-x-space-xs">
              <span>
                {offersLoading
                  ? 'Finding deals…'
                  : `${usableOffers.length} deal${usableOffers.length === 1 ? '' : 's'} near ${district || city || 'you'}`}
              </span>
              {feed.search ? (
                <button type="button" onClick={() => feed.setSearchInput('')} className="text-primary font-semibold hover:underline">
                  Clear search
                </button>
              ) : null}
            </p>
          </div>
          <button
            className="h-10 px-space-sm self-start sm:self-auto bg-surface-subtle hover:bg-surface-container-high rounded-xl flex items-center gap-space-2xs text-text-primary font-label-md text-label-md transition-colors shrink-0"
            type="button"
            onClick={onOpenFilters}
          >
            <Icon name="tune" className="text-[18px]" />
            <span>Filters</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-2xl">
          <section className="w-full relative rounded-2xl bg-surface-canvas shadow-md overflow-hidden group">
            {offersLoading ? (
              <FeaturedDealSkeleton />
            ) : featuredDeal ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
                <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden">
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={featuredDeal.imageAlt || featuredDeal.title}
                    src={featuredDeal.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-space-xs z-10">
                    <span className="px-space-sm py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold rounded-full shadow-sm">
                      {featuredDeal.discount}
                    </span>
                    {featuredDeal.badge ? (
                      <span className="px-space-sm py-1 bg-surface-canvas/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold rounded-full shadow-sm">
                        {featuredDeal.badge.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-1.5 rounded-full shadow-sm text-on-surface">
                    <Icon name="timer" className="text-tertiary-container text-[18px]" />
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      {featuredDeal.extra?.label}
                    </span>
                  </div>
                </div>

                <div
                  className="lg:col-span-5 p-space-xl flex flex-col justify-between bg-surface-canvas relative z-10 cursor-pointer"
                  onClick={onOpenFeatured}
                >
                  <div className="space-y-space-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
                          Featured
                        </span>
                      </div>
                      <div className="flex items-center gap-space-2xs text-text-tertiary font-caption text-caption">
                        <Icon name="distance" className="text-[15px] text-primary" />
                        <span>{featuredDeal.distance}</span>
                      </div>
                    </div>

                    <div className="space-y-space-2xs">
                      <span className="font-label-md text-label-md text-primary font-semibold">
                        {featuredDeal.store}
                      </span>
                      <h2 className="font-heading-lg text-heading-lg font-bold text-text-primary leading-tight">
                        {featuredDeal.title}
                      </h2>
                      {featuredDeal.copy ? (
                        <p className="font-body-md text-body-md text-text-secondary line-clamp-3">
                          {featuredDeal.copy}
                        </p>
                      ) : null}
                    </div>

                    <div className="p-space-sm bg-surface-subtle rounded-xl space-y-space-2xs">
                      <div className="flex items-baseline gap-space-sm">
                        <span className="font-display-hero text-display-hero text-primary font-bold">
                          {featuredDeal.price}
                        </span>
                        {featuredDeal.oldPrice ? (
                          <span className="font-body-lg text-body-lg text-text-tertiary line-through">
                            {featuredDeal.oldPrice}
                          </span>
                        ) : null}
                        {featuredDeal.save ? (
                          <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                            {featuredDeal.save}
                          </span>
                        ) : null}
                      </div>
                      {featuredDeal.progress ? (
                        <>
                          <div className="flex items-center justify-between text-text-secondary font-caption text-caption pt-1">
                            <span>{featuredDeal.progress.claimed} of {featuredDeal.progress.total} claimed</span>
                            <span className="text-tertiary font-semibold">
                              {Math.max(featuredDeal.progress.total - featuredDeal.progress.claimed, 0)} left
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-container rounded-full"
                              style={{ width: `${Math.min(100, Math.round((featuredDeal.progress.claimed / featuredDeal.progress.total) * 100))}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-text-secondary font-caption text-caption pt-1">{featuredDeal.extra?.label}</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-space-md flex items-center justify-between gap-space-md border-t border-transparent">
                    <div className="flex items-center gap-space-md text-text-secondary">
                      <button
                        className={`flex items-center gap-1 transition-colors ${isLiked(featuredDeal?.id) ? 'text-error' : 'text-text-secondary hover:text-error'} cursor-pointer`}
                        type="button"
                        aria-pressed={isLiked(featuredDeal?.id)}
                        aria-label={isLiked(featuredDeal?.id) ? 'Unlike deal' : 'Like deal'}
                        disabled={!likeIdOf(featuredDeal?.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleDealLike(featuredDeal?.id);
                        }}
                      >
                        <Icon
                          name="favorite"
                          className="text-[20px]"
                          filled={isLiked(featuredDeal?.id)}
                        />
                        <span className="font-label-sm text-label-sm">{likeCountOf(featuredDeal?.id)}</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-primary transition-colors text-text-secondary cursor-pointer"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const selected = {
                            id: featuredDeal?.id,
                            title: featuredDeal?.title ?? 'Featured deal',
                            business: featuredDeal?.store ?? 'Nearby business',
                            location: `${city}, ${district}`,
                            price: Number.parseFloat(String(featuredDeal?.price ?? '0').replace(/[^\d.]/g, '')) || 0,
                            oldPrice: Number.parseFloat(String(featuredDeal?.oldPrice ?? '0').replace(/[^\d.]/g, '')) || 0,
                            discountLabel: featuredDeal?.save ?? 'Live Deal',
                            image: featuredDeal?.image ?? '',
                          };
                          onOpenComments?.(selected);
                        }}
                      >
                        <Icon name="chat_bubble_outline" className="text-[20px]" />
                        <span className="font-label-sm text-label-sm">Comment</span>
                      </button>
                    </div>
                    <button
                      className={`px-space-lg h-12 font-button-primary text-button-primary rounded-xl flex items-center gap-space-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        heroClaimed
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : 'bg-primary-container hover:bg-primary text-on-primary shadow-md shadow-primary-container/20'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        const selected = {
                          id: featuredDeal?.id,
                          title: featuredDeal?.title ?? 'Featured deal',
                          business: featuredDeal?.store ?? 'Nearby business',
                          location: `${city}, ${district}`,
                          price: Number.parseFloat(String(featuredDeal?.price ?? '0').replace(/[^\d.]/g, '')) || 0,
                          oldPrice: Number.parseFloat(String(featuredDeal?.oldPrice ?? '0').replace(/[^\d.]/g, '')) || 0,
                          discountLabel: featuredDeal?.save ?? 'Live Deal',
                          image: featuredDeal?.image ?? '',
                        };
                        onClaim?.(selected, () => setHeroClaimed(true));
                      }}
                    >
                      <span>{heroClaimed ? 'Claimed!' : 'Claim Deal'}</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-xl text-center">
                <p className="font-label-md text-label-md text-text-primary font-semibold">{emptyMessage}</p>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h3 className="font-heading-md text-heading-md text-text-primary font-bold">
                  Deals in {district}, {city}{' '}
                  {!offersLoading ? <span className="text-text-tertiary font-normal text-heading-sm">({discoveryDeals.length})</span> : null}
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Live vouchers from businesses near you.
                </p>
              </div>

              <div className="flex items-center gap-space-sm self-start sm:self-auto">
                <div className="bg-surface-subtle p-1 rounded-xl flex items-center shadow-sm">
                  <button
                    aria-label="List View"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-canvas transition-colors"
                    type="button"
                    onClick={() => setView('list')}
                  >
                    <Icon name="format_list_bulleted" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="Grid View"
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-canvas text-primary shadow-sm font-semibold"
                    type="button"
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                </div>
                <div className="h-6 w-px bg-surface-container-high" />
                {sortSelect}
              </div>
            </div>

            {offersLoading ? (
              <DealCardSkeletons count={PAGE_SIZE} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg" />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {discoveryDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  {emptyMessage}
                </div>
              ) : discoveryDeals.map((deal, index) => (
                <article
                  key={`${deal.title}-${deal.store}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal({
                    id: deal.id,
                    title: deal.title,
                    business: deal.store,
                    location: `${city}, ${district}`,
                    price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                    oldPrice: Number.parseFloat(String(deal.oldPrice).replace(/[^\d.]/g, '')) || 0,
                    discountLabel: deal.save,
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
                        discountLabel: deal.save,
                        image: deal.image,
                      });
                    }
                  }}
                  className="bg-surface-canvas rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                        {deal.discount}
                      </span>
                      {deal.extra ? (
                        <span
                          className={`px-space-xs py-0.5 rounded-full font-caption text-caption shadow-sm ${deal.extra.className}`}
                        >
                          {deal.extra.label}
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-surface-canvas/90 backdrop-blur-md px-2 py-0.5 rounded-md font-caption text-caption text-text-primary font-semibold shadow-sm flex items-center gap-1">
                      <Icon name="timer" className="text-[13px] text-tertiary" />
                      <span>{deal.timer}</span>
                    </div>
                  </div>

                  <div className="p-space-md flex-1 flex flex-col justify-between gap-space-md">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-text-tertiary font-caption text-caption">
                        <span className="font-medium text-text-secondary">{deal.store}</span>
                        <span className="flex items-center gap-0.5">
                          <Icon name="near_me" className="text-[13px] text-primary" />
                          {deal.distance}
                        </span>
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h4>
                      {deal.copy ? <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p> : null}
                    </div>

                    <div className="pt-space-xs flex items-center justify-between gap-space-sm border-t border-surface-subtle">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <button
                          type="button"
                          className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${isLiked(deal.id) ? 'text-error bg-error/10' : 'text-text-secondary hover:text-error hover:bg-error/5'}`}
                          aria-pressed={isLiked(deal.id)}
                          aria-label={isLiked(deal.id) ? `Unlike ${deal.title}` : `Like ${deal.title}`}
                          disabled={!likeIdOf(deal.id)}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleDealLike(deal.id);
                          }}
                        >
                          <Icon name="favorite" className="text-[16px]" filled={isLiked(deal.id)} />
                          <span className="font-label-sm text-label-sm">{likeCountOf(deal.id)}</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full px-2 py-1 text-text-secondary transition-colors hover:text-primary hover:bg-primary/5"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenComments?.({
                              id: deal.id,
                              title: deal.title,
                              business: deal.store,
                              location: `${city}, ${district}`,
                              price: Number.parseFloat(String(deal.price).replace(/[^\d.]/g, '')) || 0,
                              oldPrice: Number.parseFloat(String(deal.oldPrice ?? 0).replace(/[^\d.]/g, '')) || 0,
                              discountLabel: deal.save,
                              image: deal.image,
                            });
                          }}
                        >
                          <Icon name="chat_bubble_outline" className="text-[16px]" />
                          <span className="font-label-sm text-label-sm">Comment</span>
                        </button>
                      </div>

                      <button
                        className={`h-10 px-space-md rounded-xl font-button-secondary text-button-secondary flex items-center justify-center transition-colors ${
                          claimed[deal.title]
                            ? 'bg-badge-discount-bg text-badge-discount-text font-semibold'
                            : 'bg-primary-container hover:bg-primary text-on-primary'
                        }`}
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
                            discountLabel: deal.save,
                            image: deal.image,
                          };
                          onClaim?.(selected, () => claimDeal(deal.title));
                        }}
                      >
                        {claimed[deal.title] ? 'Claimed!' : 'Claim'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            )}

            {!offersLoading && hasMore ? (
              <div className="mt-space-lg flex justify-center">
                <button
                  className="px-space-xl py-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-full font-label-md text-label-md text-primary font-semibold flex items-center gap-space-2xs shadow-sm transition-all disabled:opacity-60"
                  type="button"
                  disabled={loadingMore}
                  onClick={feed.loadMore}
                >
                  <span>{loadingMore ? 'Loading more deals…' : `Load more ${district || city || 'local'} deals`}</span>
                  <Icon name="keyboard_arrow_down" className="text-[18px]" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </>
  );
}
