import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useProfile } from '../context/ProfileContext';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { useHomeDealCategories } from '../hooks/useHomeDealCategories';
import { useDealLikes } from '../hooks/useDealLikes';
import { useHomeFeed } from '../hooks/useHomeFeed';
import type { DiscoverBusiness } from '../hooks/useDiscoverBusinesses';
import { usePublicSearch } from '../hooks/usePublicSearch';
import { SearchResults } from '../components/search/SearchResults';
import { pickSearchResult } from '../utils/appEvents';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import {
  asRecord,
  firstString as firstImage,
  isVerifiedOffer as isVerified,
  NO_IMAGE,
  offerDiscountLabel,
  offerEndsLabel as getEndsLabel,
  offerImage as getNestedImage,
  offerLocationLabel as getLocationLabel,
  realOfferId,
} from '../utils/homeOffer';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

interface FeaturedSlide {
  id: string;
  /** Real backend offer id (likes/share only work with one). */
  offerId?: string;
  image: string;
  imageAlt: string;
  badge: string;
  ends: string;
  merchant: string;
  title: string;
  price: string;
  was: string;
  distance: string;
  likes: number;
  comments: number;
  verified: boolean;
}

interface DealSummary {
  id: string;
  /** Real backend offer id (likes/share only work with one). */
  offerId?: string;
  image: string;
  imageAlt: string;
  title: string;
  business: string;
  price: string;
  was: string;
  distance: string;
  likes: number;
  comments: number;
  badge: string;
  meta?: string;
  rating?: string;
  reviews?: string;
  deals?: string;
  ends: string;
  verified: boolean;
  /** Groups a business's offers into one "Businesses Around You" row. */
  businessKey: string;
  businessLogo?: string;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number | string | undefined): string => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return '₦0';
  return CURRENCY_FORMATTER.format(numeric);
};

const getApiTitle = (offer: Record<string, unknown>): string => {
  const value = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
};

const getApiBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business;
  const fromBusinessObject =
    business && typeof business === 'object'
      ? ((business as Record<string, unknown>).name ?? (business as Record<string, unknown>).businessName ?? (business as Record<string, unknown>).merchantName)
      : undefined;

  const value =
    offer.businessName ??
    fromBusinessObject ??
    offer.merchantName ??
    offer.vendorName ??
    offer.companyName ??
    offer.branchName ??
    'Nearby business';

  return typeof value === 'string' && value.trim() ? value : 'Nearby business';
};

const getApiPrice = (offer: Record<string, unknown>): number => {
  const nestedItem = Array.isArray(offer.items) && offer.items.length > 0 && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;

  const candidates = [
    offer.calculatedPrice,
    offer.dealPrice,
    offer.price,
    offer.fixedPrice,
    offer.amount,
    offer.salePrice,
    nestedItem?.price,
    nestedItem?.dealPrice,
    nestedItem?.calculatedPrice,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return 0;
};

const getApiComparePrice = (offer: Record<string, unknown>): number => {
  const nestedItem = Array.isArray(offer.items) && offer.items.length > 0 && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;

  const candidates = [
    offer.compareAtPrice,
    offer.originalPrice,
    offer.listPrice,
    offer.wasPrice,
    offer.previousPrice,
    nestedItem?.compareAtPrice,
    nestedItem?.originalPrice,
    nestedItem?.listPrice,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return getApiPrice(offer);
};

const toFeaturedSlide = (offer: Record<string, unknown>, index: number): FeaturedSlide => {
  const price = getApiPrice(offer);
  const compareAtPrice = getApiComparePrice(offer);
  const likes = Number(offer.likes ?? offer.favorites ?? offer.savedCount ?? 0);
  const comments = Number(offer.comments ?? offer.reviewCount ?? 0);
  const title = getApiTitle(offer);
  const business = getApiBusinessName(offer);

  return {
    id: String(offer.id ?? offer.offerId ?? offer._id ?? offer.businessId ?? offer.branchId ?? `${business}-${title}-${index}`),
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    badge: typeof offer.badge === 'string' && offer.badge.trim() ? offer.badge : offerDiscountLabel(offer),
    ends: getEndsLabel(offer),
    merchant: `${business} • ${getLocationLabel(offer)}`,
    title,
    price: formatCurrency(price),
    was: compareAtPrice > price ? formatCurrency(compareAtPrice) : '',
    distance: getLocationLabel(offer),
    likes: Number.isFinite(likes) ? likes : 0,
    comments: Number.isFinite(comments) ? comments : 0,
    verified: isVerified(offer),
  };
};

const toDealSummary = (offer: Record<string, unknown>, index: number): DealSummary => {
  const basePrice = getApiPrice(offer);
  const comparePrice = getApiComparePrice(offer);
  const title = getApiTitle(offer);
  const business = getApiBusinessName(offer);

  return {
    id: String(offer.id ?? offer.offerId ?? offer._id ?? offer.businessId ?? offer.branchId ?? `${business}-${title}-${index}`),
    offerId: realOfferId(offer),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    title,
    business,
    price: formatCurrency(basePrice),
    was: comparePrice > basePrice ? formatCurrency(comparePrice) : '',
    distance: getLocationLabel(offer),
    likes: Number(offer.likes ?? offer.favorites ?? 0),
    comments: Number(offer.comments ?? 0),
    badge: typeof offer.badge === 'string' && offer.badge.trim() ? offer.badge : offerDiscountLabel(offer),
    meta: typeof offer.meta === 'string' ? offer.meta : undefined,
    rating: typeof offer.rating === 'string' ? offer.rating : undefined,
    reviews: typeof offer.reviews === 'string' ? offer.reviews : undefined,
    deals: typeof offer.deals === 'string' ? offer.deals : undefined,
    ends: getEndsLabel(offer),
    verified: isVerified(offer),
    businessKey: String(asRecord(offer.business).id ?? offer.businessId ?? business),
    businessLogo: firstImage(asRecord(offer.business).logo, asRecord(offer.business).logoUrl),
  };
};

interface BusinessRow {
  id: string;
  code: string;
  businessId: string;
  image: string;
  imageAlt: string;
  business: string;
  meta: string;
  deals: string;
}

/** One "Businesses Around You" row from a live business. */
const toBusinessRow = (business: DiscoverBusiness): BusinessRow => ({
  id: business.code,
  code: business.code,
  businessId: business.id,
  image: business.logo ?? business.image ?? NO_IMAGE,
  imageAlt: business.name,
  business: business.name,
  meta: [business.category, business.location].filter(Boolean).join(' • '),
  deals: business.dealCount > 0 ? `${business.dealCount} Live Offer${business.dealCount === 1 ? '' : 's'}` : 'No live offers',
});

export interface HomeScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void;
  /** Opens the live page of exactly this business. */
  onOpenBusiness: (business: { code: string; id?: string; name?: string }) => void;
  onOpenNotifications: () => void;
  onEnroll: () => void;
  onAccount: () => void;
  /** Opens live comments & reviews for a deal (with an optional star rating). */
  onOpenComments?: (deal: { id?: string; title?: string; business?: string; location?: string; price?: number; image?: string }) => void;
}

function dealCardProps(
  onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void,
  deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string },
) {
  return {
    onClick: () => onOpenDeal(deal),
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenDeal(deal);
      }
    },
  };
}

function LikeButton({ count, liked, onToggle, disabled }: { count: number; liked: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? 'Unlike deal' : 'Like deal'}
      disabled={disabled}
      onClick={onToggle}
      className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-error' : 'text-text-secondary hover:text-error'}`}
    >
      <Icon name="favorite" className="text-[18px]" filled={liked} />
      <span className="font-label-sm text-label-sm">{count}</span>
    </button>
  );
}

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

function GreetingHeader({ onLocation, onNotifications, onAccount }: { onLocation: () => void; onNotifications: () => void; onAccount: () => void }) {
  const { district, city, radius } = useLocation();
  const { initials } = useProfile();
  // Live: the real unread count and the user's initials; demo keeps its sample dot and photo.
  const { live, count: unreadCount } = useUnreadNotifications();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="px-margin py-3 flex items-center justify-between gap-space-2xs min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-space-2xs">
            <span className="font-caption text-caption text-text-secondary">{greeting()}</span>
            <Icon name="waving_hand" className="text-sm" />
          </div>
          <button
            type="button"
            onClick={onLocation}
            className="flex items-center gap-1.5 text-left group transition-transform active:scale-95"
          >
            <Icon name="location_on" className="text-primary text-[20px]" filled />
            <span className="font-button-primary text-button-primary text-text-primary">
              {district}, {city}
            </span>
            <Icon
              name="keyboard_arrow_down"
              className="text-text-secondary text-[18px] group-hover:translate-y-0.5 transition-transform"
            />
            <span className="ml-1 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-medium">
              Within {radius} km
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2.5">
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
          <button type="button" aria-label="Account" onClick={onAccount} className="relative w-10 h-10 rounded-full p-0.5 bg-primary-fixed flex items-center justify-center active:scale-95 transition-transform">
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

/** Live search: deals + businesses from `GET /public/search`, shown under the bar; Enter opens all matching deals. */
function SearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  const [input, setInput] = useState('');
  const search = usePublicSearch(input);
  const clear = () => setInput('');
  return (
    <div className="relative w-full">
      <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
        <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
        <input
          aria-label="Search deals and businesses"
          className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
          placeholder="Search deals and businesses"
          type="search"
          enterKeyHint="search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') clear();
            if (event.key === 'Enter' && input.trim().length >= 2) {
              pickSearchResult({ kind: 'all-deals', query: input.trim() });
              clear();
            }
          }}
        />
        {input ? (
          <button aria-label="Clear search" type="button" onClick={clear} className="p-1 mr-1 text-text-secondary active:scale-95">
            <Icon name="close" className="text-[20px]" />
          </button>
        ) : null}
        <button aria-label="Filter options" type="button" onClick={onOpenFilters} className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-transform">
          <Icon name="tune" className="text-[20px]" />
        </button>
      </div>
      {search.active ? (
        <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface-canvas rounded-2xl shadow-xl border border-border-subtle max-h-[65vh] overflow-y-auto">
          <SearchResults
            query={input.trim()}
            deals={search.deals}
            businesses={search.businesses}
            loading={search.loading}
            error={search.error}
            onPicked={clear}
          />
        </div>
      ) : null}
    </div>
  );
}

function TrendingSection({ items, onSeeAll, onOpenDeal, emptyText, loading }: { items: DealSummary[]; onSeeAll: () => void; emptyText?: string; loading?: boolean; onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void }) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Trending Deals</h2>
          <Icon name="local_fire_department" className="text-base" />
        </div>
        <button type="button" onClick={onSeeAll} className="font-label-md text-label-md text-primary font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="relative -mx-margin px-margin overflow-x-auto no-scrollbar flex gap-3.5 pb-2">
        {loading ? (
          <SkeletonGroup label="Loading trending deals" className="flex gap-3.5">
            {[0, 1].map((key) => (
              <div key={key} className="w-[260px] shrink-0 rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden">
                <Skeleton className="h-32 w-full rounded-none" />
                <div className="p-3.5 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </SkeletonGroup>
        ) : items.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            {emptyText ?? 'No trending deals right now.'}
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} {...dealCardProps(onOpenDeal, item)} className="w-[260px] shrink-0 flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.98] cursor-pointer">
              <div className="relative h-32 w-full bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover" alt={item.imageAlt} src={item.image} />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold">
                  {item.badge}
                </span>
              </div>
              <div className="p-3.5 flex flex-col space-y-2">
                <span className="font-caption text-caption text-text-secondary truncate">{item.business}</span>
                <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">{item.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-label-md text-label-md text-text-primary font-bold">{item.price}</span>
                  {item.was && <span className="font-caption text-caption text-text-tertiary line-through">{item.was}</span>}
                </div>
                <div className="flex items-center justify-between text-text-secondary pt-1 font-caption text-caption">
                  <span>{item.distance}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Icon name="favorite" className="text-[14px]" /> {item.likes}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function BusinessesSection({
  items,
  onSeeAll,
  onOpenBusiness,
  emptyText,
  loading,
}: {
  items: BusinessRow[];
  onSeeAll: () => void;
  onOpenBusiness?: (business: { code: string; id?: string; name?: string }) => void;
  emptyText?: string;
  loading?: boolean;
}) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Businesses Around You</h2>
        <button type="button" onClick={onSeeAll} className="font-label-md text-label-md text-primary font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="flex flex-col space-y-3">
        {loading ? (
          <SkeletonGroup label="Loading businesses" className="flex flex-col space-y-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>
            ))}
          </SkeletonGroup>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            {emptyText ?? 'Businesses will appear here once they publish live offers.'}
          </div>
        ) : (
          items.map((business) => {
            const cardProps = onOpenBusiness ? dealCardProps(() => onOpenBusiness({ code: business.code, id: business.businessId, name: business.business })) : {};
            return (
              <div
                key={business.id}
                {...cardProps}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                    <img className="w-full h-full object-cover" alt={business.imageAlt} src={business.image} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-label-md text-label-md text-text-primary font-semibold truncate">{business.business}</h3>
                    <span className="font-caption text-caption text-text-secondary">{business.meta}</span>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  {business.deals}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function PopularSection({ items, onSeeAll, onOpenDeal, emptyText, loading }: { items: DealSummary[]; onSeeAll: () => void; emptyText?: string; loading?: boolean; onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void }) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Popular Near You</h2>
        <button type="button" onClick={onSeeAll} className="font-label-md text-label-md text-primary font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {loading ? (
          [0, 1].map((key) => (
            <div key={key} role="status" aria-busy="true" className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
              <span className="sr-only">Loading popular deals</span>
              <Skeleton className="w-full aspect-square rounded-none" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            {emptyText ?? 'Popular offers will load here from the public catalogue feed.'}
          </div>
        ) : (
          items.slice(0, 2).map((item) => (
            <article key={item.id} {...dealCardProps(onOpenDeal, item)} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-transform active:scale-[0.98] cursor-pointer">
              <div className="relative w-full aspect-square bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover" alt={item.imageAlt} src={item.image} />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                  {item.badge}
                </span>
              </div>
              <div className="p-3 flex flex-col space-y-1">
                <span className="font-caption text-caption text-text-secondary truncate">{item.business}</span>
                <h3 className="font-label-sm text-label-sm text-text-primary font-medium line-clamp-1">{item.title}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-label-md text-label-md text-text-primary font-bold">{item.price}</span>
                  {item.was && <span className="font-caption text-caption text-text-tertiary line-through">{item.was}</span>}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EnrollmentPrompt({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-tint-blue shadow-sm flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="font-caption text-caption text-text-secondary">Own a local business in your area?</span>
        <button type="button" onClick={onEnroll} className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1 group text-left">
          <span>Put your deals on VEMTAP</span>
          <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-0.5 transition-transform" />
        </button>
        <span className="font-caption text-[11px] text-text-tertiary pt-0.5">Set up in 3 minutes • Instant discovery</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
        <Icon name="storefront" className="text-[22px]" />
      </div>
    </div>
  );
}

export function HomeScreen({
  onTab,
  onOpenFilters,
  onOpenFeatured,
  onOpenDeals,
  onOpenDeal,
  onOpenBusiness,
  onOpenNotifications,
  onEnroll,
  onAccount,
  onOpenComments,
}: HomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  // Live business categories; the selected one filters every section below.
  const { categories } = useHomeDealCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const activeCategory = categories.find((item) => item.id === categoryId) ?? categories[0];
  const noneInCategory = categoryId ? `No live deals in ${activeCategory.label} near you yet.` : undefined;
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, radius, setLocation } = useLocation();
  const [featured, setFeatured] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  // Each section has its own live source; sections show skeletons (never stand-in data) until the API answers.
  const feed = useHomeFeed(categoryId);
  const offersLoading = feed.offersLoading;
  const toastTimers = useRef<number[]>([]);
  const featuredTouchX = useRef<number | null>(null);

  const { likes, toggleLike: saveLike } = useDealLikes(feed.offerIds);
  const likeCount = (offerId: string | undefined, fallback: number) => (offerId ? likes[offerId]?.count ?? fallback : fallback);
  const featuredSlides = useMemo(() => feed.featured.map(toFeaturedSlide), [feed.featured]);
  const withLikes = useCallback(
    (offers: Record<string, unknown>[]) =>
      offers.map(toDealSummary).map((deal) => ({ ...deal, likes: deal.offerId ? likes[deal.offerId]?.count ?? deal.likes : deal.likes })),
    [likes],
  );
  const liveDeals = useMemo(() => withLikes(feed.nearby.slice(0, 4)), [feed.nearby, withLikes]);
  const trendingDeals = useMemo(() => withLikes(feed.trending), [feed.trending, withLikes]);
  const popularDeals = useMemo(() => withLikes(feed.popular), [feed.popular, withLikes]);
  const businessRows = useMemo(() => feed.businesses.slice(0, 3).map(toBusinessRow), [feed.businesses]);

  useEffect(() => {
    if (featuredSlides.length < 2) return;
    const timer = window.setInterval(() => setFeatured((current) => (current + 1) % featuredSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [featuredSlides.length]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const isLiked = (offerId: string | undefined) => Boolean(offerId && likes[offerId]?.liked);
  const toggleLike = (offerId: string | undefined) => {
    if (!offerId) return;
    saveLike(offerId).then(
      (saved) => showToast(saved.liked ? 'You liked this deal' : 'Like removed'),
      () => showToast('Could not save your like. Please try again.'),
    );
  };

  /** Copies the deal's real link; says so only when the copy worked. */
  const shareDeal = (offerId: string | undefined) => {
    if (!offerId) return;
    const url = `${window.location.origin}/deals/${offerId}`;
    navigator.clipboard?.writeText(url).then(
      () => showToast('Deal link copied to clipboard'),
      () => showToast('Could not copy the deal link'),
    );
  };

  const switcherContainer = view === 'list'
    ? 'flex items-center bg-surface-container-low p-0.5 rounded-lg border-subtle'
    : 'flex items-center p-0.5 rounded-lg bg-surface-container border border-subtle';

  const inactiveSwitcher = 'w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all';
  const activeSwitcher = 'w-7 h-7 rounded-md flex items-center justify-center bg-surface-container-lowest text-primary shadow-sm transition-all';

  return (
    <AppScreen>
      <GreetingHeader onLocation={() => setLocationOpen(true)} onNotifications={onOpenNotifications} onAccount={onAccount} />

      <div className="flex flex-col relative w-full px-margin pt-20 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-6 space-y-6">
          <SearchBar onOpenFilters={onOpenFilters} />

          <div className="relative -mx-margin px-margin overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
            {categories.map((item) => {
              const isActive = categoryId === item.id;
              return (
                <button
                  key={item.id ?? 'all'}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategoryId(item.id)}
                  className={`shrink-0 h-9 rounded-full font-label-md text-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 ${
                    isActive ? 'px-4 bg-primary-container text-on-primary' : 'px-3.5 bg-surface-container-lowest text-text-primary hover:bg-surface-container-low'
                  }`}
                >
                  {item.icon && <Icon name={item.icon} className="text-[17px]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <section className="flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Featured Deals</h2>
                {featuredSlides.length > 0 && !offersLoading && <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-[11px] font-semibold">{featuredSlides.length} live</span>}
              </div>
              <button type="button" onClick={onOpenFeatured} className="font-label-md text-label-md text-primary font-semibold hover:underline">See All</button>
            </div>

            {offersLoading ? (
              <SkeletonGroup label="Loading featured deals" className="rounded-2xl shadow-md overflow-hidden bg-surface-container-lowest">
                <Skeleton className="w-full aspect-[16/9] rounded-none" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </SkeletonGroup>
            ) : featuredSlides.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
                {noneInCategory ?? 'No live deals are available right now. Check back shortly for fresh offers.'}
              </div>
            ) : (
              <div
                className="overflow-hidden rounded-2xl shadow-md border-border-active ring-1 ring-primary/10 transition-transform active:scale-[0.99]"
                onTouchStart={(event) => {
                  featuredTouchX.current = event.touches[0].clientX;
                }}
                onTouchEnd={(event) => {
                  const start = featuredTouchX.current;
                  featuredTouchX.current = null;
                  if (start == null || featuredSlides.length < 2) return;
                  const delta = event.changedTouches[0].clientX - start;
                  if (Math.abs(delta) < 40) return;
                  const direction = delta > 0 ? -1 : 1;
                  setFeatured((current) => (current + direction + featuredSlides.length) % featuredSlides.length);
                }}
              >
                <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${featured * 100}%)` }}>
                  {featuredSlides.map((slide, index) => (
                    <article key={`${slide.title}-${index}`} {...dealCardProps(onOpenDeal, {
                      id: slide.id,
                      title: slide.title,
                      business: slide.merchant,
                      location: slide.distance,
                      price: Number(String(slide.price).replace(/[^\d.]/g, '')) || undefined,
                      oldPrice: Number(String(slide.was ?? '').replace(/[^\d.]/g, '')) || undefined,
                      discountLabel: slide.badge,
                      image: slide.image,
                    })} className="min-w-full flex flex-col bg-surface-container-lowest cursor-pointer">
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" alt={slide.imageAlt} src={slide.image} />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                          {slide.badge}
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 text-tertiary font-label-sm text-label-sm font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                          <Icon name="schedule" className="text-[15px]" />
                          <span>{slide.ends}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col space-y-2.5">
                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="font-label-sm text-label-sm font-medium">{slide.merchant}</span>
                          {slide.verified && (
                            <span className="flex items-center gap-0.5 font-caption text-caption text-primary font-semibold">
                              <Icon name="verified" className="text-[14px]" /> Partner
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug">{slide.title}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{slide.price}</span>
                          {slide.was && <span className="font-body-md text-body-md text-text-tertiary line-through">{slide.was}</span>}
                        </div>
                        <div className="flex items-center gap-1 font-caption text-caption text-text-secondary pt-0.5">
                          <Icon name="near_me" className="text-[16px] text-text-tertiary" />
                          <span>{slide.distance}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 text-text-secondary" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center gap-4">
                            <LikeButton count={likeCount(slide.offerId, slide.likes)} liked={isLiked(slide.offerId)} disabled={!slide.offerId} onToggle={() => toggleLike(slide.offerId)} />
                            <button
                              type="button"
                              disabled={!slide.offerId || !onOpenComments}
                              onClick={() => onOpenComments?.({
                                id: slide.offerId,
                                title: slide.title,
                                business: slide.merchant.split(' • ')[0],
                                location: slide.distance,
                                price: Number(String(slide.price).replace(/[^\d.]/g, '')) || undefined,
                                image: slide.image,
                              })}
                              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                            >
                              <Icon name="chat_bubble_outline" className="text-[18px]" />
                              <span className="font-label-sm text-label-sm">Comment</span>
                            </button>
                          </div>
                          <button type="button" disabled={!slide.offerId} onClick={() => shareDeal(slide.offerId)} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
                            <Icon name="ios_share" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm">Share</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {featuredSlides.length > 1 && !offersLoading && (
              <div className="flex items-center justify-center gap-1.5">
                {featuredSlides.map((slide, index) => (
                  <button
                    key={`${slide.title}-indicator-${index}`}
                    type="button"
                    aria-label={`Show featured deal ${index + 1}`}
                    onClick={() => setFeatured(index)}
                    className={`h-2 rounded-full transition-all ${index === featured ? 'w-6 bg-primary' : 'w-2 bg-primary/30'}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Deals Near You{liveDeals.length && !offersLoading ? ` (${liveDeals.length})` : ''}</h2>
              <div className="flex items-center gap-2.5">
                <div className={switcherContainer} role="group" aria-label="View layout switcher">
                  <button type="button" aria-label="List view" title="List view" onClick={() => setView('list')} className={view === 'list' ? activeSwitcher : inactiveSwitcher}>
                    <Icon name="view_agenda" className="text-[18px]" />
                  </button>
                  <button type="button" aria-label="Grid view" title="Grid view" onClick={() => setView('grid')} className={view === 'grid' ? activeSwitcher : inactiveSwitcher}>
                    <Icon name="grid_view" className="text-[18px]" />
                  </button>
                </div>
                <button type="button" onClick={onOpenDeals} className="font-label-md text-label-md text-primary font-semibold hover:underline">See All</button>
              </div>
            </div>

            {offersLoading ? (
              view === 'list' ? (
                <SkeletonGroup label="Loading deals near you" className="flex flex-col space-y-3.5">
                  {[0, 1].map((key) => (
                    <div key={key} className="rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden">
                      <Skeleton className="w-full aspect-[16/9] rounded-none" />
                      <div className="p-4 space-y-2.5">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-5 w-52" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  ))}
                </SkeletonGroup>
              ) : (
                <SkeletonGroup label="Loading deals near you" className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((key) => (
                    <div key={key} className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
                      <Skeleton className="w-full aspect-square rounded-none" />
                      <div className="p-3 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </SkeletonGroup>
              )
            ) : view === 'list' ? (
              liveDeals.length > 0 ? (
                <>
                  {liveDeals.map((deal) => (
                    <article key={deal.id} {...dealCardProps(onOpenDeal, {
                      id: deal.id,
                      title: deal.title,
                      business: deal.business,
                      location: deal.distance,
                      price: Number(String(deal.price).replace(/[^\d.]/g, '')) || undefined,
                      oldPrice: Number(String(deal.was ?? '').replace(/[^\d.]/g, '')) || undefined,
                      discountLabel: deal.badge,
                      image: deal.image,
                    })} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.99] cursor-pointer">
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                          {deal.badge}
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 text-tertiary font-label-sm text-label-sm font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                          <Icon name="schedule" className="text-[15px]" />
                          <span>{deal.ends}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col space-y-2.5">
                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="font-label-sm text-label-sm font-medium">{deal.business}</span>
                          {deal.verified && <span className="flex items-center gap-0.5 font-caption text-caption text-primary"><Icon name="verified" className="text-[14px]" /> Verified</span>}
                        </div>
                        <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug">{deal.title}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{deal.price}</span>
                          {deal.was && <span className="font-body-md text-body-md text-text-tertiary line-through">{deal.was}</span>}
                        </div>
                        <div className="flex items-center gap-1 font-caption text-caption text-text-secondary pt-0.5">
                          <Icon name="near_me" className="text-[16px] text-text-tertiary" />
                          <span>{deal.distance}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 text-text-secondary" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center gap-4">
                            <LikeButton count={deal.likes} liked={isLiked(deal.offerId)} disabled={!deal.offerId} onToggle={() => toggleLike(deal.offerId)} />
                            <button
                              type="button"
                              disabled={!deal.offerId || !onOpenComments}
                              onClick={() => onOpenComments?.({
                                id: deal.offerId,
                                title: deal.title,
                                business: deal.business,
                                location: deal.distance,
                                price: Number(String(deal.price).replace(/[^\d.]/g, '')) || undefined,
                                image: deal.image,
                              })}
                              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                            >
                              <Icon name="chat_bubble_outline" className="text-[18px]" />
                              <span className="font-label-sm text-label-sm">Comment</span>
                            </button>
                          </div>
                          <button type="button" disabled={!deal.offerId} onClick={() => shareDeal(deal.offerId)} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
                            <Icon name="ios_share" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm">Share</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
                  {noneInCategory ?? 'No deals available in your area yet.'}
                </div>
              )
            ) : (
              liveDeals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {liveDeals.map((deal) => (
                    <article key={`${deal.id}-grid`} {...dealCardProps(onOpenDeal, {
                      id: deal.id,
                      title: deal.title,
                      business: deal.business,
                      location: deal.distance,
                      price: Number(String(deal.price).replace(/[^\d.]/g, '')) || undefined,
                      oldPrice: Number(String(deal.was ?? '').replace(/[^\d.]/g, '')) || undefined,
                      discountLabel: deal.badge,
                      image: deal.image,
                    })} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer">
                      <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                          {deal.badge}
                        </span>
                        <button aria-label={isLiked(deal.offerId) ? `Unlike ${deal.title}` : `Like ${deal.title}`} aria-pressed={isLiked(deal.offerId)} disabled={!deal.offerId} type="button" onClick={(event) => { event.stopPropagation(); toggleLike(deal.offerId); }} className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${isLiked(deal.offerId) ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'}`}>
                          <Icon name="favorite" className="text-[16px]" filled={isLiked(deal.offerId)} />
                        </button>
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                        <div>
                          <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                            <span className="truncate">{deal.business}</span>
                            {deal.verified && <Icon name="verified" className="text-[12px] text-primary shrink-0" />}
                          </div>
                          <h3 className="font-label-md text-label-md text-text-primary font-semibold line-clamp-1">{deal.title}</h3>
                        </div>
                        <div className="pt-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-label-md text-label-md text-text-primary font-bold">{deal.price}</span>
                            {deal.was && <span className="font-caption text-caption text-text-tertiary line-through text-[11px]">{deal.was}</span>}
                          </div>
                          <div className="flex items-center justify-between text-text-secondary font-caption text-[11px] pt-1">
                            <span className="flex items-center gap-0.5"><Icon name="near_me" className="text-[13px] text-text-tertiary" />{deal.distance}</span>
                            <span className="flex items-center gap-0.5"><Icon name="favorite" className="text-[13px]" />{deal.likes}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
                  {noneInCategory ?? 'No deals available in your area yet.'}
                </div>
              )
            )}
          </section>

          <TrendingSection items={trendingDeals} onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} emptyText={noneInCategory} loading={offersLoading} />
          <BusinessesSection items={businessRows} onSeeAll={onOpenDeals} onOpenBusiness={onOpenBusiness} emptyText={noneInCategory} loading={feed.businessesLoading} />
          <PopularSection items={popularDeals} onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} emptyText={noneInCategory} loading={offersLoading} />
          <EnrollmentPrompt onEnroll={onEnroll} />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}

      <MobileTabBar active="home" onTab={onTab} />
      <LocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </AppScreen>
  );
}
