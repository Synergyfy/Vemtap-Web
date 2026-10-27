import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';
import { dealEngagementService } from '../../services/dealEngagementService';

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
  rating: string;
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

const getOfferImage = (offer: Record<string, unknown>): string => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const imageValue =
    offer.image ??
    offer.coverImage ??
    offer.heroImage ??
    offer.mediaUrl ??
    item?.image ??
    item?.mainImage ??
    (offer.business && typeof offer.business === 'object'
      ? ((offer.business as Record<string, unknown>).logo ?? (offer.business as Record<string, unknown>).image)
      : undefined) ??
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';
  return typeof imageValue === 'string' && imageValue.trim() ? imageValue : 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';
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

const getOfferDescription = (offer: Record<string, unknown>): string => {
  const description = offer.description ?? offer.summary ?? offer.copy ?? 'Special local promotion available now.';
  return typeof description === 'string' && description.trim() ? description : 'Special local promotion available now.';
};

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
    discount: price > 0 ? 'Live Deal' : 'Offer',
    extra: { label: 'Local', className: 'bg-tertiary-fixed text-on-tertiary-fixed font-bold' },
    timer: 'Now live',
    store: getOfferBusinessName(offer),
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: compare > price ? formatCurrency(compare) : '',
    save: price > 0 ? `-${formatCurrency(difference)}` : 'Limited-time',
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
    discount: price > 0 ? 'Live Offer' : 'Offer',
    extra: { label: 'Live', className: 'bg-error-container text-on-error-container', icon: 'local_fire_department', iconFilled: true },
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    store: business,
    verified: true,
    badge: { label: 'LIVE', className: 'bg-surface-tint-blue text-primary' },
    rating: '4.9',
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: compare > price ? formatCurrency(compare) : '',
    save: price > 0 ? `Save ${formatCurrency(Math.max(compare - price, 0))}` : 'Limited-time',
  };
};

const CONTEXT_CATEGORIES = ['All Deals', 'Food & Dining', 'Fashion & Wear', 'Wellness & Spa', 'Fitness'];

export function DesktopDealsScreen({ onNav, onOpenFilters, onOpenFeatured, onOpenDeal, onOpenComments, onClaim }: DesktopDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [category, setCategory] = useState(CONTEXT_CATEGORIES[0]);
  const [heroLiked, setHeroLiked] = useState(false);
  const [heroClaimed, setHeroClaimed] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [likedDeals, setLikedDeals] = useState<Record<string, boolean>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Deal Claimed Successfully!');
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const toastTimer = useRef<number | undefined>(undefined);
  const claimTimers = useRef<Record<string, number>>({});
  const apiReady = hasApiConfig();

  useEffect(() => {
    let ignore = false;
    const loadOffers = async () => {
      if (!hasApiConfig()) {
        console.log('[DesktopDealsScreen] No API config detected; skipping public offers request.');
        if (!ignore) setPublicOffers([]);
        return;
      }
      try {
        console.log('[DesktopDealsScreen] Requesting public offers...');
        const response = await catalogueService.getPublicOffers({ page: 1, limit: 6 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        console.log('[DesktopDealsScreen] Raw public offers payload:', rows);
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch (error) {
        console.error('[DesktopDealsScreen] Public offers request failed:', error);
        if (!ignore) setPublicOffers([]);
      }
    };

    loadOffers();
    return () => {
      ignore = true;
    };
  }, []);

  const discoveryDeals = useMemo(() => {
    const filtered = publicOffers.filter(isUsableOffer);
    console.log('[DesktopDealsScreen] Filtered discovery deals:', filtered);
    return filtered.slice(0, 6).map(toDiscoveryDeal);
  }, [publicOffers]);
  const catalogDeals = useMemo(() => {
    const filtered = publicOffers.filter(isUsableOffer);
    console.log('[DesktopDealsScreen] Filtered catalog deals:', filtered);
    return filtered.slice(0, 6).map(toCatalogDeal);
  }, [publicOffers]);
  const featuredDeal = catalogDeals[0] ?? null;

  useEffect(() => {
    const timers = claimTimers.current;
    return () => {
      window.clearTimeout(toastTimer.current);
      Object.values(timers).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncDealReactions = async () => {
      if (!publicOffers.length) return;

      const offers = publicOffers.filter(isUsableOffer).slice(0, 6);

      for (const offer of offers) {
        const dealId = String(
          offer.id ?? offer.offerId ?? offer._id ?? offer.businessId ?? offer.branchId ?? `${getOfferBusinessName(offer)}-${getOfferTitle(offer)}`,
        );

        try {
          const status = await dealEngagementService.getReactionStatus(dealId);
          const payload = status as Record<string, unknown> | null;
          const nextCount = getReactionCount(payload, 0);
          const nextLiked = Boolean(payload?.liked ?? payload?.isLiked ?? false);

          if (!ignore) {
            setReactionCounts((prev) => ({ ...prev, [dealId]: nextCount }));
            setLikedDeals((prev) => ({ ...prev, [dealId]: nextLiked }));
          }
        } catch (error) {
          console.warn('[DesktopDealsScreen] Reaction status request failed for deal:', dealId, error);
        }
      }
    };

    syncDealReactions();

    return () => {
      ignore = true;
    };
  }, [publicOffers]);

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

  const getReactionKey = (deal: { id?: string | number; store?: string; title?: string }) => String(
    deal.id ?? `${deal.store ?? 'deal'}-${deal.title ?? 'offer'}`,
  );

  const toggleDealLike = async (key: string, offerId?: string, shouldLike?: boolean) => {
    const previousLiked = Boolean(likedDeals[key]);
    const previousCount = Number(reactionCounts[key] ?? 0);
    const desiredLiked = typeof shouldLike === 'boolean' ? shouldLike : !previousLiked;
    const reactionType = desiredLiked ? 'like' : 'dislike';
    const targetOfferId = String(offerId ?? key);

    try {
      const { status } = await dealEngagementService.reactAndRefresh(targetOfferId, reactionType);
      const payload = status as Record<string, unknown> | null;
      const nextLiked = Boolean(payload?.liked ?? payload?.isLiked ?? desiredLiked);
      const nextCount = getReactionCount(payload, previousCount);

      setLikedDeals((prev) => ({ ...prev, [key]: nextLiked }));
      setReactionCounts((prev) => ({ ...prev, [key]: nextCount }));
    } catch (error) {
      console.warn('[DesktopDealsScreen] Deal reaction update failed; keeping prior server state:', error);
    }
  };

  const toggleHeroLike = async (shouldLike?: boolean) => {
    const offerId = featuredDeal?.id ? String(featuredDeal.id) : null;
    const previousLiked = heroLiked;
    const previousCount = Number(reactionCounts[String(featuredDeal?.id ?? 'featured')] ?? 0);
    const desiredLiked = typeof shouldLike === 'boolean' ? shouldLike : !previousLiked;
    const reactionType = desiredLiked ? 'like' : 'dislike';

    if (!offerId) {
      return;
    }

    try {
      const { status } = await dealEngagementService.reactAndRefresh(offerId, reactionType);
      const payload = status as Record<string, unknown> | null;
      const nextLiked = Boolean(payload?.liked ?? payload?.isLiked ?? desiredLiked);
      const nextCount = getReactionCount(payload, previousCount);

      setHeroLiked(nextLiked);
      setReactionCounts((prev) => ({ ...prev, [offerId]: nextCount }));
    } catch (error) {
      console.warn('[DesktopDealsScreen] Featured deal reaction update failed; keeping prior server state:', error);
    }
  };

  const getReactionCount = (payload: Record<string, unknown> | null | undefined, fallback = 0) => {
    const record = (payload ?? {}) as Record<string, unknown>;
    const counts = (record.counts ?? {}) as Record<string, unknown>;
    const metrics = (record.metrics ?? {}) as Record<string, unknown>;

    const candidate =
      record.likes ??
      record.count ??
      record.totalLikes ??
      record.reactionCount ??
      record.likesCount ??
      record.likeCount ??
      record.likes_count ??
      record.total_likes ??
      record.reaction_count ??
      counts.likes ??
      metrics.likes ??
      fallback;

    const numeric = Number(candidate);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
  };

  const getLikedCount = (baseCount: number) => Math.max(0, baseCount);

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

  if (!publicOffers.length) {
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
                Publish live public offers to populate this feed.
              </p>
            </div>
          </section>
        </DesktopPage>
        <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
      </>
    );
  }

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
                    Real-time neighborhood inventory
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs">
                  <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    Good evening
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
                {CONTEXT_CATEGORIES.map((item) => {
                  const active = item === category;
                  return (
                    <button
                      key={item}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary font-medium'
                          : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md mb-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-[0_4px_20px_-4px_rgba(13,37,76,0.03)]">
              <div className="flex items-center gap-space-md w-full sm:w-auto">
                <div className="flex items-center gap-space-xs">
                  <span className="font-heading-sm text-heading-sm text-text-primary font-semibold">Showing {catalogDeals.length} deal{catalogDeals.length === 1 ? '' : 's'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-caption font-caption font-bold">
                    VERIFIED LOCAL
                  </span>
                </div>
                <div className="h-4 w-px bg-surface-container-highest hidden sm:block" />
                <p className="hidden sm:inline font-caption text-caption text-text-tertiary">
                  Tap &apos;Claim&apos; to lock in redeemable vouchers
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-space-sm">
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
                  <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-caption font-bold flex items-center justify-center">
                    2
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {catalogDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  Live catalog deals will appear here as soon as the public offers feed is available.
                </div>
              ) : catalogDeals.map((deal, index) => (
                <article
                  key={`${deal.title}-${deal.store}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal({
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
                        <span className="flex items-center text-amber-500 text-caption font-caption font-semibold gap-0.5">
                          <Icon name="star" filled className="text-[14px]" />
                          {deal.rating}
                        </span>
                      </div>
                      <h3 className="font-heading-sm text-heading-sm text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      <p className="font-caption text-caption text-text-tertiary line-clamp-1">{deal.copy}</p>
                    </div>

                    <div className="pt-space-md mt-space-md flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading-md text-heading-md text-text-primary font-bold">
                            {deal.price}
                          </span>
                          <span className="font-caption text-caption text-text-tertiary line-through">
                            {deal.oldPrice}
                          </span>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-medium">
                          {deal.save}
                        </span>
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
        <section className="w-full bg-surface-canvas shadow-sm">
          <div className="max-w-7xl mx-auto px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md w-full md:w-auto">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Deals &amp; Offers</h1>
              </div>
              <button
                className="group/location relative bg-surface-tint-blue px-space-sm py-1.5 rounded-full flex items-center gap-space-xs shadow-sm hover:bg-secondary-fixed transition-colors"
                type="button"
                onClick={() => setLocationOpen(true)}
              >
                <Icon name="location_on" className="text-primary text-[18px]" />
                <span className="font-label-md text-label-md text-primary font-semibold">
                  {district}, {city} • Within {radius}km
                </span>
                <Icon name="keyboard_arrow_down" className="text-primary text-[16px]" />
              </button>
            </div>

            <div className="flex items-center gap-space-sm w-full md:w-auto flex-1 max-w-xl justify-end">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
                />
                <input
                  className="w-full h-11 pl-10 pr-space-md bg-surface-subtle rounded-xl text-on-surface placeholder:text-text-tertiary font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-sm transition-all"
                  placeholder="Search deals, businesses or products..."
                  type="search"
                />
              </div>
              <button
                className="h-11 px-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-xl flex items-center gap-space-2xs text-text-primary font-label-md text-label-md shadow-sm transition-colors"
                type="button"
                onClick={onOpenFilters}
              >
                <Icon name="tune" className="text-[18px]" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                aria-label="Notifications"
                className="relative w-11 h-11 bg-surface-subtle hover:bg-surface-container-high rounded-xl flex items-center justify-center text-text-primary shadow-sm transition-colors"
                type="button"
              >
                <Icon name="notifications" className="text-[20px]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-container" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary font-heading-sm text-heading-sm shadow-sm">
                JD
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col gap-space-2xl">
          <section className="w-full relative rounded-2xl bg-surface-canvas shadow-md overflow-hidden group">
            {featuredDeal ? (
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
                    <span className="px-space-sm py-1 bg-surface-canvas/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold rounded-full shadow-sm flex items-center gap-1">
                      <Icon name="star" className="text-[14px]" />
                      {featuredDeal.badge?.label ?? 'Live'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-space-xs bg-surface-canvas/90 backdrop-blur-md px-space-sm py-1.5 rounded-full shadow-sm text-on-surface">
                    <Icon name="timer" className="text-tertiary-container text-[18px]" />
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                      {featuredDeal.extra?.label ?? 'Active now'}
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
                          {featuredDeal.badge?.label ?? 'Deal of the Day'}
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
                      <p className="font-body-md text-body-md text-text-secondary">
                        {featuredDeal.copy}
                      </p>
                    </div>

                    <div className="p-space-sm bg-surface-subtle rounded-xl space-y-space-2xs">
                      <div className="flex items-baseline gap-space-sm">
                        <span className="font-display-hero text-display-hero text-primary font-bold">
                          {featuredDeal.price}
                        </span>
                        <span className="font-body-lg text-body-lg text-text-tertiary line-through">
                          {featuredDeal.oldPrice}
                        </span>
                        <span className="px-space-xs py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold">
                          {featuredDeal.save}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary font-caption text-caption pt-1">
                        <span>
                          {featuredDeal.extra?.label ?? 'Live offer'}
                        </span>
                        <span className="text-tertiary font-semibold">{featuredDeal.save}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-space-md flex items-center justify-between gap-space-md border-t border-transparent">
                    <div className="flex items-center gap-space-md text-text-secondary">
                      <button
                        className={`flex items-center gap-1 transition-colors ${heroLiked ? 'text-error' : 'text-text-secondary hover:text-error'} cursor-pointer`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const nextValue = !heroLiked;
                          void toggleHeroLike(nextValue);
                          showToastMessage(nextValue ? 'Saved to liked deals' : 'Removed from liked deals');
                        }}
                      >
                        <Icon
                          name="favorite"
                          className="text-[20px]"
                          filled={heroLiked}
                        />
                        <span className="font-label-sm text-label-sm">{getLikedCount(reactionCounts[String(featuredDeal?.id ?? 'featured')] ?? 0)}</span>
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-primary transition-colors text-text-secondary cursor-pointer"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const selected = {
                            title: featuredDeal?.title ?? 'Featured deal',
                            business: featuredDeal?.store ?? 'Nearby business',
                            location: `${city}, ${district}`,
                            price: Number.parseFloat(String(featuredDeal?.price ?? '0').replace(/[^\d.]/g, '')) || 0,
                            oldPrice: Number.parseFloat(String(featuredDeal?.oldPrice ?? '0').replace(/[^\d.]/g, '')) || 0,
                            discountLabel: featuredDeal?.save ?? 'Live Deal',
                            image: featuredDeal?.image ?? '',
                            commentCount: (featuredDeal as unknown as Record<string, unknown> | undefined)?.commentCount ?? (featuredDeal as unknown as Record<string, unknown> | undefined)?.commentsCount ?? 0,
                          };
                          onOpenComments?.(selected);
                        }}
                      >
                        <Icon name="chat_bubble_outline" className="text-[20px]" />
                        <span className="font-label-sm text-label-sm">{Number((featuredDeal as unknown as Record<string, unknown> | undefined)?.commentCount ?? (featuredDeal as unknown as Record<string, unknown> | undefined)?.commentsCount ?? 0)}</span>
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
                <p className="font-label-md text-label-md text-text-primary font-semibold">No live deals available</p>
                <p className="mt-1 font-body-md text-body-md text-text-secondary">
                  Nearby local offers will appear here when the public catalogue is active.
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <h3 className="font-heading-md text-heading-md text-text-primary font-bold">
                  Deals in {district}, {city}{' '}
                  <span className="text-text-tertiary font-normal text-heading-sm">(6)</span>
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Hand-picked exclusive vouchers from verified neighborhood spots.
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
                <button
                  className="flex items-center gap-1 text-primary font-label-md text-label-md hover:underline"
                  type="button"
                >
                  <span>Nearest first</span>
                  <Icon name="sort" className="text-[16px]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {discoveryDeals.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                  Nearby discovery deals will appear here when live offers are returned.
                </div>
              ) : discoveryDeals.map((deal, index) => (
                <article
                  key={`${deal.title}-${deal.store}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDeal({
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
                      <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p>
                    </div>

                    <div className="pt-space-xs flex items-center justify-between gap-space-sm border-t border-surface-subtle">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <button
                          type="button"
                          className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${likedDeals[`${deal.store}-${deal.title}`] ? 'text-error bg-error/10' : 'text-text-secondary hover:text-error hover:bg-error/5'}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            const key = getReactionKey({ id: deal.id, store: deal.store, title: deal.title });
                            const nextValue = !Boolean(likedDeals[key]);
                            void toggleDealLike(key, String(deal.id ?? key), nextValue);
                            showToastMessage(nextValue ? 'Saved to liked deals' : 'Removed from liked deals');
                          }}
                        >
                          <Icon name="favorite" className="text-[16px]" filled={Boolean(likedDeals[getReactionKey({ id: deal.id, store: deal.store, title: deal.title })])} />
                          <span className="font-label-sm text-label-sm">{getLikedCount(reactionCounts[getReactionKey({ id: deal.id, store: deal.store, title: deal.title })] ?? 0)}</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full px-2 py-1 text-text-secondary transition-colors hover:text-primary hover:bg-primary/5"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenComments?.({
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

            {discoveryDeals.length > 0 && (
              <div className="mt-space-lg flex justify-center">
                <button
                  className="px-space-xl py-space-sm bg-surface-subtle hover:bg-surface-container-high rounded-full font-label-md text-label-md text-primary font-semibold flex items-center gap-space-2xs shadow-sm transition-all hover:gap-space-xs"
                  type="button"
                >
                  <span>Load More {district || city || 'Local'} Neighborhood Offers</span>
                  <Icon name="keyboard_arrow_down" className="text-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </>
  );
}
