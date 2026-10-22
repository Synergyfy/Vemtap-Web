import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { hasApiConfig } from '../services/api/client';
import { catalogueService } from '../services/catalogueService';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

const IMAGES = {
  dining:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA',
  burger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiY_iENnE0_gULcgR0NDCqk6Kq3rgCPj9DF359T-LyeFJWB7z4VMHdARNHQeTTxaT4MiH_xMPLODviqw6_g4l50CwXnKwBrq6CQIuKBPTJ5PaasBnvsfniUvz2Oy9Vn5eguCjJ_CuTMKeUodWVLfHa5QV5UaTWJOtOFkXuzN4cYIDGKMq-sweeOEBfus9N8WLC_OkWiUkIw3S5qhnVtMq670laaL_UzGfesQ-k5inJfjattlJVEofGA',
  sneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD0uBBlT-uAfF0xrF1R99Fygm4HWKLPrmL3WWpZt71dQGS3NkBlOQ4kU1osW9GuFYORifIsd4FKPUSG5g0t3TLX3YCVkdzeSvXt8QGqexEQ1P-sIUWyEygPSrdpBw8m264KPQ8HPkV4WdVLSEFg85dV-lo5N986QTpH7FkxewwUwqnLessEGS_HR1U8_BQumYABPPSiKY4F_J8kKkA5DPYDJSiPWrecAlMg5bja0jfXHc29cF55C8j7AQ',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApSo_d-6tUpRdyPfedGt9FAOlIdJc5ZDlE8rU2ZXsK3L_Ngq-PkICWqvfgL4jRE5FKwg9eHcpFiQ6YSnP-Umn_itGHcmoD9cZnzcCU1GNk7vtchytPdKH2G5zC-nNqqtPDmUtp7UTnSn_qFQ5nlenJBVonmFpDAwZcJarDcov4sO9lX4TmZJexfLK08XOnsNsho-AhfccOs9h7pJEtq2JaTsp6Z0SEs_DgoMwbM3PQoV6Yqk-9EcDuEQ',
  coffee:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhaveynjDuWtPu2JE7hXGvL4JUNYbbcSzUA_e17tE-fQ2ekG5_Bmpiq2FT5U99sDs4VVEYLgM9SedUAzXAR8xYGa2WmPIAVHHLHm5fWEAbFTRgkq4ECuGkRFZXPaj6susJy4hs1U_ga0O2fsnB6yIbLLXil_gLH47nnCpUvo7xTQfoLwPb2A56609PWjT7OTe4zOBInx0APBPGBDi49B3GWJHlIBCLXKmVZGsOCyGIC5X6_O31zQUZxw',
};

const CATEGORIES: { label: string; icon: string }[] = [
  { label: 'All', icon: '' },
  { label: 'Food', icon: 'restaurant' },
  { label: 'Fashion', icon: 'checkroom' },
  { label: 'Beauty', icon: 'spa' },
  { label: 'Electronics', icon: 'bolt' },
  { label: 'Groceries', icon: 'shopping_cart' },
  { label: 'Services', icon: 'content_cut' },
];

interface FeaturedSlide {
  id: string;
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
}

interface DealSummary {
  id: string;
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

const getApiImage = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value;
  return IMAGES.dining;
};

const getNestedImage = (offer: Record<string, unknown>): string => {
  const itemList = Array.isArray(offer.items) ? offer.items : [];
  for (const item of itemList) {
    if (item && typeof item === 'object') {
      const image = getApiImage((item as Record<string, unknown>).mainImage ?? (item as Record<string, unknown>).image ?? (item as Record<string, unknown>).mediaUrl);
      if (image !== IMAGES.dining || (item as Record<string, unknown>).mainImage || (item as Record<string, unknown>).image) {
        return image;
      }
    }
  }

  const business = offer.business;
  if (business && typeof business === 'object') {
    const businessImage = getApiImage((business as Record<string, unknown>).logo ?? (business as Record<string, unknown>).image ?? (business as Record<string, unknown>).coverImage);
    if (businessImage !== IMAGES.dining || (business as Record<string, unknown>).logo || (business as Record<string, unknown>).image) {
      return businessImage;
    }
  }

  return getApiImage(offer.image ?? offer.coverImage ?? offer.mediaUrl ?? offer.photo);
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
    offer.merchantName ??
    offer.branchName ??
    offer.vendorName ??
    offer.companyName ??
    fromBusinessObject ??
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
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    badge: typeof offer.badge === 'string' && offer.badge.trim() ? offer.badge : 'Live Deal',
    ends: typeof offer.ends === 'string' && offer.ends.trim() ? offer.ends : 'Limited time',
    merchant: `${business} • ${typeof offer.location === 'string' ? offer.location : 'Nearby'}`,
    title,
    price: formatCurrency(price),
    was: compareAtPrice > price ? formatCurrency(compareAtPrice) : '',
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    likes: Number.isFinite(likes) ? likes : 0,
    comments: Number.isFinite(comments) ? comments : 0,
  };
};

const toDealSummary = (offer: Record<string, unknown>, index: number): DealSummary => {
  const basePrice = getApiPrice(offer);
  const comparePrice = getApiComparePrice(offer);
  const title = getApiTitle(offer);
  const business = getApiBusinessName(offer);

  return {
    id: String(offer.id ?? offer.offerId ?? offer._id ?? offer.businessId ?? offer.branchId ?? `${business}-${title}-${index}`),
    image: getNestedImage(offer),
    imageAlt: `${title} by ${business}`,
    title,
    business,
    price: formatCurrency(basePrice),
    was: comparePrice > basePrice ? formatCurrency(comparePrice) : '',
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    likes: Number(offer.likes ?? offer.favorites ?? 0),
    comments: Number(offer.comments ?? 0),
    badge: typeof offer.badge === 'string' && offer.badge.trim() ? offer.badge : 'Live Deal',
    meta: typeof offer.meta === 'string' ? offer.meta : undefined,
    rating: typeof offer.rating === 'string' ? offer.rating : undefined,
    reviews: typeof offer.reviews === 'string' ? offer.reviews : undefined,
    deals: typeof offer.deals === 'string' ? offer.deals : undefined,
  };
};

export interface HomeScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenFeatured: () => void;
  onOpenDeals: () => void;
  onOpenDeal: () => void;
  onOpenBusiness: () => void;
  onOpenNotifications: () => void;
  onEnroll: () => void;
  onAccount: () => void;
}

function dealCardProps(onOpenDeal: () => void) {
  return {
    onClick: onOpenDeal,
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpenDeal();
      }
    },
  };
}

function LikeButton({ count, liked, onToggle }: { count: number; liked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-error' : 'text-text-secondary hover:text-error'}`}
    >
      <Icon name="favorite" className="text-[18px]" filled={liked} />
      <span className="font-label-sm text-label-sm">{count}</span>
    </button>
  );
}

function GreetingHeader({ onLocation, onNotifications, onAccount }: { onLocation: () => void; onNotifications: () => void; onAccount: () => void }) {
  const { district, city, radius } = useLocation();

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
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
          </button>
          <button type="button" aria-label="Account" onClick={onAccount} className="relative w-10 h-10 rounded-full p-0.5 bg-primary-fixed flex items-center justify-center active:scale-95 transition-transform">
            <span className="w-full h-full rounded-full overflow-hidden bg-secondary-fixed block">
              <img className="w-full h-full object-cover" alt="" src={AVATAR} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="relative w-full">
      <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
        <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
        <input className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none" placeholder="Search deals, businesses or products" type="text" />
        <button aria-label="Filter options" type="button" onClick={onOpenFilters} className="p-1 text-text-secondary hover:text-text-primary active:scale-95 transition-transform">
          <Icon name="tune" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}

function TrendingSection({ items, onSeeAll, onOpenDeal }: { items: DealSummary[]; onSeeAll: () => void; onOpenDeal: () => void }) {
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
        {items.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            No trending deals right now.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} {...dealCardProps(onOpenDeal)} className="w-[260px] shrink-0 flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.98] cursor-pointer">
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
                    <span className="flex items-center gap-0.5"><Icon name="chat_bubble_outline" className="text-[14px]" /> {item.comments}</span>
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
}: {
  items: DealSummary[];
  onSeeAll: () => void;
  onOpenBusiness?: () => void;
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
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            Businesses will appear here once they publish live offers.
          </div>
        ) : (
          items.map((business) => {
            const cardProps = onOpenBusiness ? dealCardProps(onOpenBusiness) : {};
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
                    <span className="font-caption text-caption text-text-secondary">{business.meta ?? business.distance}</span>
                    <div className="flex items-center gap-1 pt-0.5">
                      <Icon name="star" className="text-amber-500 text-[14px]" filled />
                      <span className="font-caption text-caption text-text-primary font-semibold">{business.rating ?? '4.8'}</span>
                      <span className="font-caption text-caption text-text-tertiary">{business.reviews ?? '(24)'}</span>
                    </div>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                  {business.deals ?? 'Live Offer'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function PopularSection({ items, onSeeAll, onOpenDeal }: { items: DealSummary[]; onSeeAll: () => void; onOpenDeal: () => void }) {
  return (
    <section className="flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading-sm text-heading-sm text-text-primary">Popular Near You</h2>
        <button type="button" onClick={onSeeAll} className="font-label-md text-label-md text-primary font-semibold hover:underline">
          See All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {items.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
            Popular offers will load here from the public catalogue feed.
          </div>
        ) : (
          items.slice(0, 2).map((item) => (
            <article key={item.id} {...dealCardProps(onOpenDeal)} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden transition-transform active:scale-[0.98] cursor-pointer">
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
}: HomeScreenProps) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [category, setCategory] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, radius, setLocation } = useLocation();
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [featured, setFeatured] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const toastTimers = useRef<number[]>([]);
  const featuredTouchX = useRef<number | null>(null);

  const featuredSlides = useMemo(() => publicOffers.slice(0, 3).map(toFeaturedSlide), [publicOffers]);
  const liveDeals = useMemo(() => publicOffers.slice(0, 4).map(toDealSummary), [publicOffers]);

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
    return () => { ignore = true; };
  }, []);

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

  const toggleLike = (key: string) => setLikes((prev) => ({ ...prev, [key]: !prev[key] }));

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
            {CATEGORIES.map((item) => {
              const isActive = category === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCategory(item.label)}
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
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-[11px] font-semibold">{featuredSlides.length ? `${featuredSlides.length} live` : 'Promoted'}</span>
              </div>
              <button type="button" onClick={onOpenFeatured} className="font-label-md text-label-md text-primary font-semibold hover:underline">See All</button>
            </div>

            {featuredSlides.length === 0 && !offersLoading ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
                No live deals are available right now. Check back shortly for fresh offers.
              </div>
            ) : (
              <div
                className="overflow-hidden rounded-2xl shadow-md border-active ring-1 ring-primary/10 transition-transform active:scale-[0.99]"
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
                    <article key={`${slide.title}-${index}`} {...dealCardProps(onOpenDeal)} className="min-w-full flex flex-col bg-surface-container-lowest cursor-pointer">
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
                          <span className="flex items-center gap-0.5 font-caption text-caption text-primary font-semibold">
                            <Icon name="verified" className="text-[14px]" /> Partner
                          </span>
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
                            <LikeButton count={slide.likes + (likes[`featured-${index}`] ? 1 : 0)} liked={Boolean(likes[`featured-${index}`])} onToggle={() => toggleLike(`featured-${index}`)} />
                            <button type="button" onClick={() => showToast('Comments open on the deal page')} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
                              <Icon name="chat_bubble_outline" className="text-[18px]" />
                              <span className="font-label-sm text-label-sm">{slide.comments}</span>
                            </button>
                          </div>
                          <button type="button" onClick={() => showToast('Deal link copied to clipboard')} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
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

            {featuredSlides.length > 0 && (
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
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Deals Near You{liveDeals.length ? ` (${liveDeals.length})` : ''}</h2>
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

            {view === 'list' ? (
              liveDeals.length > 0 ? (
                <>
                  {liveDeals.map((deal) => (
                    <article key={deal.id} {...dealCardProps(onOpenDeal)} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden transition-transform active:scale-[0.99] cursor-pointer">
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm backdrop-blur-sm">
                          {deal.badge}
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-canvas/90 text-tertiary font-label-sm text-label-sm font-medium shadow-sm backdrop-blur-sm flex items-center gap-1">
                          <Icon name="schedule" className="text-[15px]" />
                          <span>Limited time</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col space-y-2.5">
                        <div className="flex items-center justify-between text-text-secondary">
                          <span className="font-label-sm text-label-sm font-medium">{deal.business}</span>
                          <span className="flex items-center gap-0.5 font-caption text-caption text-primary"><Icon name="verified" className="text-[14px]" /> Verified</span>
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
                            <LikeButton count={deal.likes + (likes[deal.id] ? 1 : 0)} liked={Boolean(likes[deal.id])} onToggle={() => toggleLike(deal.id)} />
                            <button type="button" onClick={() => showToast('Comments open on the deal page')} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
                              <Icon name="chat_bubble_outline" className="text-[18px]" />
                              <span className="font-label-sm text-label-sm">{deal.comments}</span>
                            </button>
                          </div>
                          <button type="button" onClick={() => showToast('Deal link copied to clipboard')} className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors">
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
                  No deals available in your area yet.
                </div>
              )
            ) : (
              liveDeals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {liveDeals.map((deal) => (
                    <article key={`${deal.id}-grid`} {...dealCardProps(onOpenDeal)} className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md overflow-hidden transition-all active:scale-[0.98] cursor-pointer">
                      <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
                        <img className="w-full h-full object-cover" alt={deal.imageAlt} src={deal.image} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-[11px] font-bold shadow-sm backdrop-blur-sm">
                          {deal.badge}
                        </span>
                        <button aria-label={`Save ${deal.title}`} type="button" onClick={(event) => { event.stopPropagation(); toggleLike(`grid-${deal.id}`); }} className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${likes[`grid-${deal.id}`] ? 'bg-error-container text-error' : 'bg-surface-canvas/90 text-text-secondary hover:text-error'}`}>
                          <Icon name="favorite" className="text-[16px]" filled={Boolean(likes[`grid-${deal.id}`])} />
                        </button>
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                        <div>
                          <div className="flex items-center gap-1 text-text-secondary text-[11px] font-caption">
                            <span className="truncate">{deal.business}</span>
                            <Icon name="verified" className="text-[12px] text-primary shrink-0" />
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
                            <span className="flex items-center gap-0.5"><Icon name="thumb_up" className="text-[13px]" />{deal.likes + (likes[`grid-${deal.id}`] ? 1 : 0)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-container-lowest p-5 text-sm text-text-secondary">
                  No deals available in your area yet.
                </div>
              )
            )}
          </section>

          <TrendingSection items={liveDeals.slice(0, 3)} onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} />
          <BusinessesSection items={liveDeals} onSeeAll={onOpenDeals} onOpenBusiness={onOpenBusiness} />
          <PopularSection items={liveDeals.slice(0, 2)} onSeeAll={onOpenDeals} onOpenDeal={onOpenDeal} />
          <EnrollmentPrompt onEnroll={onEnroll} />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}

      <MobileTabBar active="home" onTab={onTab} />
      <LocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </AppScreen>
  );
}
