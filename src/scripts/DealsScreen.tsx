import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { hasApiConfig } from '../services/api/client';
import { useProfile } from '../context/ProfileContext';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { catalogueService } from '../services/catalogueService';
import { useDealLikes, type DealLikeState } from '../hooks/useDealLikes';
import { useHomeDealCategories } from '../hooks/useHomeDealCategories';
import { useDealFeedControls, type DealSortBy } from '../hooks/useDealFeedControls';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import type { ClaimDealSummary } from '../components/desktop/dialogs/ClaimIdentityModal';
import {
  isVerifiedOffer,
  offerEndsLabel,
  offerImage,
  offerLocationLabel,
  realOfferId,
} from '../utils/homeOffer';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

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

const getOfferBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
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

const toDealCardModel = (offer: Record<string, unknown>, index?: number) => {
  const title = getOfferTitle(offer);
  const business = getOfferBusinessName(offer);
  const price = getOfferPrice(offer);
  const compare = getOfferComparePrice(offer);
  const saveAmount = Math.max(compare - price, 0);
  // The offer's own percentage first, then one worked out from real prices; never an invented figure.
  const apiPercent = Number(offer.percentageOff ?? offer.discountPercent ?? 0);
  const percent = Number.isFinite(apiPercent) && apiPercent > 0
    ? Math.round(apiPercent)
    : compare > price && compare > 0 ? Math.round((saveAmount / compare) * 100) : 0;
  const offerId = String(
    offer.id ??
      offer.offerId ??
      offer._id ??
      offer.businessId ??
      offer.branchId ??
      `${business}-${title}-${index ?? 0}`,
  );

  return {
    id: offerId,
    offerId: realOfferId(offer),
    verified: isVerifiedOffer(offer),
    ends: offerEndsLabel(offer),
    image: getOfferImage(offer),
    business,
    title,
    description: getOfferDescription(offer),
    price,
    compare,
    discount: percent > 0 ? `${percent}% OFF` : 'Live Deal',
    save: saveAmount > 0 ? `Save ${formatCurrency(saveAmount)}` : '',
    distance: offerLocationLabel(offer),
  };
};

export interface DealsScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void;
  onOpenNotifications: () => void;
  onClaim?: (deal?: ClaimDealSummary | null, onClaimed?: () => void) => void;
  onAccount: () => void;
  onHowToClaim?: () => void;
  /** Opens comments & reviews for this deal (live, with an optional star rating). */
  onOpenComments?: (deal: ClaimDealSummary) => void;
  /** Pre-fills the search (e.g. "See all deals for …" from the home search). */
  initialSearch?: string;
}

type DealCardModel = ReturnType<typeof toDealCardModel>;

/** What the claim popup and deal page need about a card: always its real id. */
const toClaimDeal = (deal: DealCardModel): ClaimDealSummary => ({
  id: deal.id,
  title: deal.title,
  business: deal.business,
  location: deal.distance,
  price: deal.price,
  oldPrice: deal.compare > deal.price ? deal.compare : undefined,
  discountLabel: deal.discount,
  image: deal.image,
});

function DealCardSkeletons() {
  return (
    <SkeletonGroup label="Loading deals" className="grid grid-cols-2 gap-3 px-margin pb-space-lg">
      {Array.from({ length: 4 }, (_, key) => (
        <div key={key} className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden">
          <Skeleton className="w-full aspect-[4/3] rounded-none" />
          <div className="p-2.5 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

function FeaturedSkeleton() {
  return (
    <SkeletonGroup label="Loading featured deal" className="w-full bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-space-md space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

function dealCardProps(
  onOpen: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void,
  deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string },
) {
  return {
    onClick: () => onOpen(deal),
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(deal);
      }
    },
  };
}

function GreetingHeader({
  onLocation,
  onNotifications,
  onAccount,
}: {
  onLocation: () => void;
  onNotifications: () => void;
  onAccount: () => void;
}) {
  const { district, city, radius } = useLocation();
  const { initials } = useProfile();
  // Live: the real unread count and the user's initials; demo keeps its sample dot and photo.
  const { live, count: unreadCount } = useUnreadNotifications();
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin py-3 flex items-center justify-between gap-space-2xs min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-space-2xs">
            <span className="font-caption text-caption text-text-secondary">Good evening</span>
            <Icon name="waving_hand" className="text-sm" />
          </div>
          <button
            type="button"
            onClick={onLocation}
            className="flex flex-nowrap items-center gap-1.5 text-left group transition-transform active:scale-95 min-w-0 whitespace-nowrap"
          >
            <Icon name="location_on" className="text-primary text-[20px] filled shrink-0" />
            <span className="font-button-primary text-button-primary text-text-primary truncate min-w-0">
              {district}, {city}
            </span>
            <Icon
              name="keyboard_arrow_down"
              className="text-text-secondary text-[18px] group-hover:translate-y-0.5 transition-transform shrink-0"
            />
            <span className="ml-1 shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-medium">
              Within {radius} km
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            aria-label="Notifications"
            type="button"
            onClick={onNotifications}
            className="relative w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-text-primary shadow-sm active:scale-95 transition-transform"
          >
            <Icon name="notifications" className="text-[22px]" />
            {(!live || unreadCount > 0) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            )}
          </button>
          <button
            type="button"
            aria-label="Account"
            onClick={onAccount}
            className="relative w-10 h-10 rounded-full p-0.5 bg-primary-fixed flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="w-full h-full rounded-full overflow-hidden bg-secondary-fixed block">
              {live ? (
                <span className="w-full h-full flex items-center justify-center text-on-secondary-fixed text-[13px] font-bold">
                  {initials || 'U'}
                </span>
              ) : (
                <img className="w-full h-full object-cover" alt="" src={AVATAR} />
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function DealGridCards({ deals, onOpen, onClaim, likes, onToggleLike, claimedIds, onClaimed, emptyMessage, onOpenComments }: { deals: Record<string, unknown>[]; onOpenComments?: (deal: ClaimDealSummary) => void; likes: Record<string, DealLikeState>; onToggleLike: (offerId: string | undefined) => void; claimedIds: Record<string, boolean>; onClaimed: (dealId: string) => void; emptyMessage: string; onOpen: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void; onClaim?: (deal?: ClaimDealSummary | null, onClaimed?: () => void) => void }) {
  const cards = useMemo(() => deals.map((deal, index) => toDealCardModel(deal, index)), [deals]);

  if (!cards.length) {
    return (
      <div className="px-margin pb-space-lg">
        <div className="bg-surface-container-low rounded-xl border border-dashed border-outline-variant p-space-lg text-center">
          <p className="font-label-md text-label-md text-text-primary font-semibold">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-margin pb-space-lg">
      {cards.map((deal, index) => (
        <article
          {...dealCardProps(onOpen, {
            id: String((deal as Record<string, unknown>).id ?? (deal as Record<string, unknown>).offerId ?? (deal as Record<string, unknown>)._id ?? (deal as Record<string, unknown>).businessId ?? (deal as Record<string, unknown>).branchId ?? `${(deal as Record<string, unknown>).business}-${(deal as Record<string, unknown>).title}-${index}`),
            title: String((deal as Record<string, unknown>).title ?? ''),
            business: String((deal as Record<string, unknown>).business ?? ''),
            location: typeof (deal as Record<string, unknown>).location === 'string' ? String((deal as Record<string, unknown>).location) : undefined,
            price: Number((deal as Record<string, unknown>).price ?? 0),
            oldPrice: Number((deal as Record<string, unknown>).compare ?? 0),
            discountLabel: String((deal as Record<string, unknown>).discount ?? ''),
            image: String((deal as Record<string, unknown>).image ?? ''),
          })}
          className="bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
          key={`${deal.id}-${index}`}
        >
          <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
            <img alt={deal.title} className="w-full h-full object-cover" src={deal.image} />
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-xs">
              {deal.discount}
            </div>
            <button
              type="button"
              aria-pressed={Boolean(deal.offerId && likes[deal.offerId]?.liked)}
              aria-label={deal.offerId && likes[deal.offerId]?.liked ? `Unlike ${deal.title}` : `Like ${deal.title}`}
              disabled={!deal.offerId}
              onClick={(event) => {
                event.stopPropagation();
                onToggleLike(deal.offerId);
              }}
              className={`absolute top-2 right-2 h-7 px-2 rounded-full backdrop-blur-sm flex items-center gap-0.5 shadow-sm transition-colors font-caption text-[11px] font-semibold ${
                deal.offerId && likes[deal.offerId]?.liked ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'
              }`}
            >
              <Icon name="favorite" className="text-[14px]" filled={Boolean(deal.offerId && likes[deal.offerId]?.liked)} />
              {deal.offerId ? likes[deal.offerId]?.count ?? 0 : 0}
            </button>
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-0.5">
              <Icon name="hourglass_top" className="text-[12px] text-tertiary-fixed" />{deal.ends}
            </div>
          </div>
          <div className="p-2.5 flex flex-col flex-1 justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-caption text-[12px] text-text-secondary truncate">{deal.business}</span>
                {deal.verified && <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />}
              </div>
              <h2 className="font-label-md text-label-md text-text-primary font-semibold leading-snug line-clamp-2 mb-1.5">
                {deal.title}
              </h2>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-label-md text-[16px] text-text-primary font-bold">{formatCurrency(deal.price)}</span>
                {deal.compare > deal.price && (
                  <span className="font-caption text-[12px] text-text-tertiary line-through">{formatCurrency(deal.compare)}</span>
                )}
              </div>
              {deal.save ? (
                <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
                  {deal.save}
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1 gap-1">
              <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px] min-w-0">
                <Icon name="location_on" className="text-[13px] shrink-0" />
                <span className="truncate">{deal.distance}</span>
              </div>
              {onOpenComments && deal.offerId ? (
                <button
                  type="button"
                  aria-label={`Comments and reviews for ${deal.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenComments(toClaimDeal(deal));
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-container transition-colors shrink-0"
                >
                  <Icon name="chat_bubble_outline" className="text-[16px]" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClaim?.(toClaimDeal(deal), () => onClaimed(deal.id));
                }}
                className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                  claimedIds[deal.id]
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-primary text-on-primary hover:bg-surface-tint'
                }`}
              >
                {claimedIds[deal.id] ? 'Claimed' : 'Claim'}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DealsScreen({
  onTab,
  onOpenFilters,
  onOpenDeal,
  onOpenNotifications,
  onClaim,
  onAccount,
  onHowToClaim,
  onOpenComments,
  initialSearch,
}: DealsScreenProps) {
  const { live, count: unreadCount } = useUnreadNotifications();
  // Claimed only after the claim flow reports success for that deal.
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});
  const markClaimed = (dealId: string) => setClaimedIds((prev) => ({ ...prev, [dealId]: true }));
  // Live business categories; the chosen one filters the feed (`categoryId`).
  const { categories } = useHomeDealCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const activeCategory = categories.find((item) => item.id === categoryId) ?? categories[0];
  // Search, sort and "load more" — all real feed params (see useDealFeedControls).
  const feed = useDealFeedControls(categoryId, initialSearch);
  const { feedParams, isLoadingMorePage, limit } = feed;
  // Live mode starts loading, so the page shows skeletons (never stand-in data) until the API answers.
  const [offersLoading, setOffersLoading] = useState(() => hasApiConfig());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const chooseCategory = (id: string | null) => setCategoryId(id);
  const emptyMessage = feed.search
    ? `No live deals match "${feed.search}"${categoryId ? ` in ${activeCategory.label}` : ''}.`
    : categoryId
      ? `No live deals in ${activeCategory.label} near you yet.`
      : 'No live deals near you yet.';
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const { district, city, radius, setLocation } = useLocation();
  const apiReady = hasApiConfig();

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
        // Nearest first within the radius once the customer has a location (unless another sort is chosen).
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
        }
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, [feedParams, isLoadingMorePage, limit]);

  const displayDeals = useMemo(() => publicOffers.filter(isUsableOffer), [publicOffers]);
  const featuredDeal = displayDeals[0] ? toDealCardModel(displayDeals[0]) : null;

  // Live likes: GET /deals/:id/reaction-status to load, POST /deals/:id/reactions { type: 'like' } to toggle.
  const offerIds = useMemo(
    () => displayDeals.map(realOfferId).filter((id): id is string => Boolean(id)),
    [displayDeals],
  );
  const { likes, toggleLike: saveLike } = useDealLikes(offerIds);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };
  const toggleLike = (offerId: string | undefined) => {
    if (!offerId) return;
    saveLike(offerId).then(
      (saved) => showToast(saved.liked ? 'You liked this deal' : 'Like removed'),
      () => showToast('Could not save your like. Please try again.'),
    );
  };
  const featuredLiked = Boolean(featuredDeal?.offerId && likes[featuredDeal.offerId]?.liked);

  const categoryChips = (
    <div className="px-margin mb-space-md -mt-1 overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
      {categories.map((item) => {
        const active = item.id === categoryId;
        return (
          <button
            key={item.id ?? 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => chooseCategory(item.id)}
            className={`shrink-0 h-9 rounded-full font-label-md text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
              active ? 'px-4 bg-primary-container text-on-primary' : 'px-3.5 bg-surface-container-lowest text-text-primary hover:bg-surface-container-low'
            }`}
          >
            {item.icon && <Icon name={item.icon} className="text-[17px]" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  const sortSelect = (
    <label className="flex items-center gap-0.5 text-primary font-caption text-caption shrink-0">
      <Icon name="sort" className="text-[16px]" />
      <span className="sr-only">Sort deals</span>
      <select
        className="bg-transparent font-semibold text-primary outline-none max-w-[130px]"
        value={feed.sortBy}
        onChange={(event) => feed.setSortBy(event.target.value as DealSortBy)}
      >
        {feed.sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  const dealCards = offersLoading ? (
    <DealCardSkeletons />
  ) : (
    <>
      <DealGridCards
        deals={displayDeals}
        onOpen={onOpenDeal}
        onClaim={onClaim}
        likes={likes}
        onToggleLike={toggleLike}
        claimedIds={claimedIds}
        onClaimed={markClaimed}
        emptyMessage={emptyMessage}
        onOpenComments={onOpenComments}
      />
      {hasMore ? (
        <div className="px-margin pb-space-lg flex justify-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={feed.loadMore}
            className="px-space-lg py-2.5 rounded-full bg-surface-container-low text-primary font-label-md text-label-md font-semibold shadow-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {loadingMore ? 'Loading more deals…' : 'Load more deals'}
          </button>
        </div>
      ) : null}
      {onHowToClaim ? (
        <div className="px-margin pb-space-lg">
          <button
            type="button"
            onClick={onHowToClaim}
            className="w-full flex items-center justify-between gap-3 p-space-md rounded-xl bg-surface-tint-blue text-left active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Icon name="verified" className="text-[20px]" />
              </span>
              <span className="flex flex-col">
                <span className="font-label-md text-label-md text-text-primary font-semibold">How claiming works</span>
                <span className="font-caption text-caption text-text-secondary">Claim free, show your code in store</span>
              </span>
            </span>
            <Icon name="arrow_forward" className="text-primary text-[18px]" />
          </button>
        </div>
      ) : null}
    </>
  );

  if (!offersLoading && !categoryId && !feed.search && !displayDeals.length) {
    return (
      <AppScreen>
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="px-margin py-2 flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-caption text-caption text-text-secondary font-medium">Deals</span>
              <div className="flex flex-nowrap items-center gap-1 mt-0.5 text-left min-w-0 whitespace-nowrap">
                <Icon name="location_on" className="text-primary text-[18px] shrink-0" filled />
                <span className="font-label-md text-label-md font-bold text-text-primary truncate min-w-0">
                  {district}, {city}
                </span>
                <span className="ml-1 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-medium">
                  Within {radius} km
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Notifications"
                type="button"
                onClick={onOpenNotifications}
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="notifications" className="text-[24px]" />
                {(!live || unreadCount > 0) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-canvas" />
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-sm shadow-xs cursor-pointer">
                <Icon name="person" className="text-[20px]" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-col relative w-full pt-[92px] pb-24 bg-surface px-margin">
          <div className="w-full rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-space-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <Icon name="info" className="text-[22px]" />
            </div>
            <p className="mt-space-md font-label-md text-label-md text-text-primary font-semibold">No live deals near you yet</p>
            <p className="mt-1 font-body-md text-body-md text-text-secondary">
              New offers from businesses near you will show up here.
            </p>
          </div>
        </main>

        <MobileTabBar active="deals" onTab={onTab} />
        <LocationRadiusModal
          open={locationOpen}
          onClose={() => setLocationOpen(false)}
          onApply={setLocation}
          district={district}
          radius={radius}
        />
      </AppScreen>
    );
  }

  if (!apiReady) {
    return (
      <AppScreen>
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="px-margin py-2 flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-caption text-caption text-text-secondary font-medium">Deals</span>
              <div className="flex flex-nowrap items-center gap-1 mt-0.5 text-left min-w-0 whitespace-nowrap">
                <Icon name="location_on" className="text-primary text-[18px] shrink-0" filled />
                <span className="font-label-md text-label-md font-bold text-text-primary truncate min-w-0">
                  {district}, {city}
                </span>
                <span className="ml-1 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-medium">
                  Within {radius} km
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Notifications"
                type="button"
                onClick={onOpenNotifications}
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="notifications" className="text-[24px]" />
                {(!live || unreadCount > 0) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-canvas" />
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-sm shadow-xs cursor-pointer">
                <Icon name="person" className="text-[20px]" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-col relative w-full pt-[92px] pb-24 bg-surface px-margin">
          <div className="w-full rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-space-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <Icon name="info" className="text-[22px]" />
            </div>
            <p className="mt-space-md font-label-md text-label-md text-text-primary font-semibold">No live deals available</p>
            <p className="mt-1 font-body-md text-body-md text-text-secondary">
              Connect the API and publish public offers to populate this feed.
            </p>
          </div>
        </main>

        <MobileTabBar active="deals" onTab={onTab} />
        <LocationRadiusModal
          open={locationOpen}
          onClose={() => setLocationOpen(false)}
          onApply={setLocation}
          district={district}
          radius={radius}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      {view === 'grid' ? (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="px-margin py-2 flex items-center justify-between">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-caption text-caption text-text-secondary font-medium">Deals</span>
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex flex-nowrap items-center gap-1 mt-0.5 group text-left min-w-0 whitespace-nowrap"
              >
                <Icon name="location_on" className="text-primary text-[18px] shrink-0" filled />
                <span className="font-label-md text-label-md font-bold text-text-primary group-hover:text-primary transition-colors truncate min-w-0">
                  {district}, {city}
                </span>
                <Icon name="keyboard_arrow_down" className="text-text-secondary text-[18px] shrink-0" />
                <span className="ml-1 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-medium">
                  Within {radius} km
                </span>
              </button>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                aria-label="Notifications"
                type="button"
                onClick={onOpenNotifications}
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="notifications" className="text-[24px]" />
                {(!live || unreadCount > 0) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-canvas" />
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-label-sm shadow-xs cursor-pointer">
                <Icon name="person" className="text-[20px]" />
              </div>
            </div>
          </div>
        </header>
      ) : (
        <GreetingHeader
          onLocation={() => setLocationOpen(true)}
          onNotifications={onOpenNotifications}
          onAccount={onAccount}
        />
      )}

      {view === 'grid' ? (
        <div className="flex flex-col relative w-full pt-[84px] pb-24 bg-surface">
          <div className="flex flex-col w-full">
            <div className="px-margin mb-space-md">
              <div className="flex items-center h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm focus-within:bg-surface-canvas focus-within:shadow-[0_0_0_2px_#066cf4] transition-all">
                <Icon name="search" className="text-text-secondary text-[22px] mr-space-xs shrink-0" />
                <input
                  aria-label="Search deals"
                  className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals or businesses..."
                  type="search"
                  value={feed.searchInput}
                  onChange={(event) => feed.setSearchInput(event.target.value)}
                />
                <button
                  aria-label="Filters"
                  type="button"
                  onClick={onOpenFilters}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-container transition-colors ml-1 shrink-0"
                >
                  <Icon name="tune" className="text-[20px]" />
                </button>
              </div>
            </div>

            {categoryChips}

            <div className="px-margin mb-space-md">
              {offersLoading ? (
                <FeaturedSkeleton />
              ) : featuredDeal ? (
                <div
                  {...dealCardProps(onOpenDeal, {
                    id: featuredDeal.id,
                    title: featuredDeal.title,
                    business: featuredDeal.business,
                    location: featuredDeal.distance,
                    price: typeof featuredDeal.price === 'number' ? featuredDeal.price : Number(String(featuredDeal.price ?? '').replace(/[^\d.]/g, '')) || undefined,
                    oldPrice: typeof featuredDeal.compare === 'number'
                      ? featuredDeal.compare
                      : Number(String(featuredDeal.compare ?? '').replace(/[^\d.]/g, '')) || undefined,
                    discountLabel: featuredDeal.discount,
                    image: featuredDeal.image,
                  })}
                  className="w-full text-left bg-surface-canvas rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon name="local_fire_department" className="text-primary text-[18px]" filled />
                      <span className="font-label-sm text-[12px] font-bold uppercase tracking-wider text-text-secondary">
                        FEATURED
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                      {featuredDeal.discount}
                    </span>
                  </div>
                  <div className="relative w-full aspect-[16/9] bg-surface-container overflow-hidden">
                    <img alt={featuredDeal.title} className="w-full h-full object-cover" src={featuredDeal.image} />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <Icon name="star" className="text-[13px]" filled />{featuredDeal.discount}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-1">
                      <Icon name="hourglass_top" className="text-[13px] text-tertiary-fixed" />
                      {featuredDeal.ends}
                    </div>
                  </div>
                  <div className="p-space-md flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-caption text-[12px] text-text-secondary font-medium truncate">
                          {featuredDeal.business}
                        </span>
                        {featuredDeal.verified && <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />}
                      </div>
                      <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px] shrink-0">
                        <Icon name="location_on" className="text-[13px]" />
                        <span>{featuredDeal.distance}</span>
                      </div>
                    </div>
                    <h2 className="font-heading-sm text-[17px] text-text-primary font-bold leading-snug mb-2">
                      {featuredDeal.title}
                    </h2>
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading-md text-[22px] text-text-primary font-bold">{formatCurrency(featuredDeal.price)}</span>
                        {featuredDeal.compare > featuredDeal.price && (
                          <span className="font-body-md text-body-md text-text-tertiary line-through">{formatCurrency(featuredDeal.compare)}</span>
                        )}
                        {featuredDeal.save ? (
                          <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                            {featuredDeal.save}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
                      <div className="flex items-center gap-4">
                      <button
                        type="button"
                        aria-pressed={featuredLiked}
                        aria-label={featuredLiked ? 'Unlike deal' : 'Like deal'}
                        disabled={!featuredDeal.offerId}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleLike(featuredDeal.offerId);
                        }}
                        className={`flex items-center gap-1 font-caption text-[12px] font-semibold transition-colors ${featuredLiked ? 'text-error' : 'text-text-secondary hover:text-error'}`}
                      >
                        <Icon name="favorite" className="text-[16px]" filled={featuredLiked} />
                        {featuredDeal.offerId ? likes[featuredDeal.offerId]?.count ?? 0 : 0}
                      </button>
                      {onOpenComments && featuredDeal.offerId ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenComments(toClaimDeal(featuredDeal));
                          }}
                          className="flex items-center gap-1 font-caption text-[12px] font-semibold text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon name="chat_bubble_outline" className="text-[16px]" />
                          Comments
                        </button>
                      ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(toClaimDeal(featuredDeal), () => markClaimed(featuredDeal.id));
                        }}
                        className={`h-9 px-4 rounded-xl font-label-md text-label-md font-semibold active:scale-95 transition-all shadow-xs flex items-center gap-1.5 ${
                          claimedIds[featuredDeal.id]
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-primary text-on-primary hover:bg-surface-tint'
                        }`}
                      >
                        {claimedIds[featuredDeal.id] ? 'Claimed' : 'Claim Deal'}
                        <Icon name="arrow_forward" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-space-lg text-center">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">{emptyMessage}</p>
                </div>
              )}
            </div>

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Deals in {district}, {city}
                </span>
                {!offersLoading ? <span className="font-caption text-caption text-text-tertiary">({displayDeals.length})</span> : null}
              </div>
              <div className="flex items-center gap-2">
              {sortSelect}
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-border-subtle">
                <button
                  aria-label="List view"
                  type="button"
                  onClick={() => setView('list')}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Icon name="view_agenda" className="text-[18px]" />
                </button>
                <button
                  aria-label="Grid view"
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-canvas text-primary shadow-xs font-semibold"
                >
                  <Icon name="grid_view" className="text-[18px]" />
                </button>
              </div>
              </div>
            </div>

            {dealCards}
          </div>
        </div>
      ) : (
        <div className="flex flex-col relative w-full pt-[88px] pb-24 bg-surface">
          <div className="flex flex-col w-full">
            <div className="px-margin mb-space-sm">
              <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
                <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
                <input
                  aria-label="Search deals"
                  className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals or businesses"
                  type="search"
                  value={feed.searchInput}
                  onChange={(event) => feed.setSearchInput(event.target.value)}
                />
                <button
                  aria-label="Filter options"
                  type="button"
                  onClick={onOpenFilters}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center"
                >
                  <Icon name="tune" className="text-[22px]" />
                </button>
              </div>
            </div>

            {categoryChips}

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">{offersLoading ? 'Loading deals…' : `Showing ${displayDeals.length} deal${displayDeals.length === 1 ? '' : 's'}`}</span>
              <div className="flex items-center gap-2">
              {sortSelect}
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-border-subtle">
                <button
                  aria-label="List view"
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-canvas text-primary shadow-xs font-semibold"
                >
                  <Icon name="view_agenda" className="text-[18px]" />
                </button>
                <button
                  aria-label="Grid view"
                  type="button"
                  onClick={() => setView('grid')}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <Icon name="grid_view" className="text-[18px]" />
                </button>
              </div>
              </div>
            </div>

            {dealCards}
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}

      <MobileTabBar active="deals" onTab={onTab} />
      <LocationRadiusModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onApply={setLocation}
        district={district}
        radius={radius}
      />
    </AppScreen>
  );
}
