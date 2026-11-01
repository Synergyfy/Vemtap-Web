import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Skeleton } from '../components/ui/Skeleton';
import { useLocation } from '../context/LocationContext';
import { useDealFilters } from '../context/DealFiltersContext';
import { useFeaturedDeals, useSavedDeals, type FeaturedSort } from '../hooks/useFeaturedDeals';
import { sponsoredService } from '../services/sponsoredService';
import { isVerifiedOffer, offerDiscountLabel, offerEndsLabel, offerImage, offerLocationLabel, realOfferId } from '../utils/homeOffer';

interface FeaturedDeal {
  id: string;
  offerId?: string;
  campaignId?: string;
  verified: boolean;
  img: string;
  alt: string;
  discount: string;
  promo: string;
  distance: string;
  area: string;
  urgencyIcon: string;
  urgencyText: string;
  urgencyClass: string;
  merchant: string;
  title: string;
  desc: string;
  oldPrice: string;
  price: string;
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

/** Same rule as the home cards and the detail page: the deal's own photo first; never a stock photo. */
const getOfferImage = (offer: Record<string, unknown>): string => offerImage(offer);

const getOfferBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
  const value = offer.businessName ?? offer.merchantName ?? offer.vendorName ?? offer.branchName ?? business.name ?? business.businessName ?? business.merchantName ?? 'Nearby business';
  return typeof value === 'string' && value.trim() ? value : 'Nearby business';
};

const getOfferTitle = (offer: Record<string, unknown>): string => {
  const value = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
};

const getOfferDescription = (offer: Record<string, unknown>): string => {
  const value = offer.description ?? offer.summary ?? offer.copy;
  return typeof value === 'string' && value.trim() ? value : '';
};

const getOfferPrice = (offer: Record<string, unknown>): number => {
  const item = Array.isArray(offer.items) && offer.items[0] && typeof offer.items[0] === 'object'
    ? (offer.items[0] as Record<string, unknown>)
    : null;
  const values = [offer.calculatedPrice, offer.dealPrice, offer.price, offer.fixedPrice, offer.amount, offer.salePrice, item?.price, item?.dealPrice, item?.calculatedPrice];
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
  const values = [offer.compareAtPrice, offer.originalPrice, offer.listPrice, offer.wasPrice, offer.previousPrice, item?.compareAtPrice, item?.originalPrice, item?.listPrice];
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return getOfferPrice(offer);
};

const isUsableOffer = (offer: Record<string, unknown>): boolean => {
  const business =
    getOfferBusinessName(offer) !== 'Nearby business'
      ? getOfferBusinessName(offer)
      : '';
  const title = getOfferTitle(offer) !== 'Local offer' ? getOfferTitle(offer) : '';
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);

  return Boolean(business && title && (price > 0 || comparePrice > 0));
};

const toFeaturedDeal = (offer: Record<string, unknown>): FeaturedDeal => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);
  const business = getOfferBusinessName(offer);
  const discountValue = Math.max(comparePrice - price, 0);

  const campaignId = typeof offer.campaignId === 'string' ? offer.campaignId : undefined;
  const location = offerLocationLabel(offer);

  return {
    id: String(offer.id ?? `${business}-${title}`),
    offerId: realOfferId(offer),
    campaignId,
    verified: isVerifiedOffer(offer),
    img: getOfferImage(offer),
    alt: `${title} by ${business}`,
    discount: offerDiscountLabel(offer),
    promo: campaignId ? 'Promoted' : 'Featured',
    distance: location,
    area: '',
    urgencyIcon: 'schedule',
    urgencyText: offerEndsLabel(offer),
    urgencyClass: 'bg-error-container/90 text-on-error-container',
    merchant: business,
    title,
    desc: getOfferDescription(offer),
    oldPrice: comparePrice > price ? formatCurrency(comparePrice) : '',
    price: formatCurrency(price),
    save: discountValue > 0 ? `Save ${formatCurrency(discountValue)}` : '',
  };
};

const SORTS: { key: FeaturedSort; label: string; icon: string; filled?: boolean }[] = [
  { key: 'closest', label: 'Closest to You', icon: 'near_me', filled: true },
  { key: 'discount', label: 'Highest Discount', icon: 'percent' },
  { key: 'ending', label: 'Ending Soon', icon: 'timer' },
  { key: 'popular', label: 'Popular', icon: 'local_fire_department' },
];

const RADII = [3, 5, 10, 25];

export interface FeaturedDealsScreenProps {
  onBack: () => void;
  onOpenFilters: () => void;
  onBoost: () => void;
  onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void;
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

export function FeaturedDealsScreen({ onBack, onOpenFilters, onBoost, onOpenDeal }: FeaturedDealsScreenProps) {
  const { city, district, radius, lat, lng, hasCoordinates, setLocation } = useLocation();
  const { setFilters, activeCount } = useDealFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimers = useRef<number[]>([]);
  const locationLabel = [city, district].filter(Boolean).join(', ') || 'Your area';
  const feed = useFeaturedDeals(SORTS[sortIndex].key);
  const { saved, toggleSaved } = useSavedDeals();
  const deals = useMemo(() => feed.offers.filter(isUsableOffer).map(toFeaturedDeal), [feed.offers]);

  // Category pills — live categories extracted from the current deals feed.
  const categories = useMemo(() => {
    const businessNames = deals
      .map((deal) => deal.merchant)
      .filter((name) => name && name !== 'Nearby business');
    const unique = [...new Set(businessNames)].sort();
    return [{ value: '', label: 'All' }, ...unique.map((name) => ({ value: name, label: name }))];
  }, [deals]);

  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredDeals = useMemo(() => {
    if (selectedCategory === '') return deals;
    return deals.filter((deal) => deal.merchant === selectedCategory);
  }, [deals, selectedCategory]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    const timer = window.setTimeout(() => setToast(null), 2400);
    toastTimers.current.push(timer);
  };

  const saveDeal = async (offerId: string | undefined) => {
    if (!offerId) return;
    const result = await toggleSaved(offerId);
    showToast('error' in result ? result.error : result.saved ? 'Saved to your deals' : 'Removed from saved deals');
  };

  /** What the deal page needs; a tap on a promoted deal is counted for its campaign. */
  const toDealPayload = (deal: FeaturedDeal) => ({
    id: deal.id,
    title: deal.title,
    business: deal.merchant,
    location: deal.distance,
    price: Number(String(deal.price).replace(/[^\d.]/g, '')) || undefined,
    oldPrice: Number(String(deal.oldPrice).replace(/[^\d.]/g, '')) || undefined,
    discountLabel: deal.discount,
    image: deal.img,
  });
  const openDeal = (deal: FeaturedDeal) => {
    if (deal.campaignId && deal.offerId) sponsoredService.track(deal.campaignId, deal.offerId, 'tap');
    onOpenDeal(toDealPayload(deal));
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface-canvas/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 flex items-center justify-center -ml-space-xs text-on-surface rounded-full active:scale-95 transition-transform"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-space-2xs min-w-0">
                <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Featured Deals</h1>
                {feed.hasPromoted ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                    Promoted
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-2xs">
            <button
              aria-label={activeCount ? `Filter deals, ${activeCount} active` : 'Filter deals'}
              type="button"
              onClick={onOpenFilters}
              className="relative w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full active:scale-95 transition-transform"
            >
              <Icon name="tune" className="text-[22px]" />
              {activeCount > 0 ? <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">{activeCount}</span> : null}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          <section className="flex flex-col gap-space-sm px-margin pt-space-md pb-space-xs bg-surface-canvas shadow-sm">
            <div className="flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs min-w-0 bg-surface-container-low px-space-sm py-space-xs rounded-full">
                <Icon name="location_on" className="text-primary text-[18px] flex-shrink-0" filled />
                <span className="font-label-md text-label-md text-on-surface truncate font-semibold">{locationLabel}</span>
                <span className="font-caption text-caption text-text-secondary">Within</span>
                <button
                  aria-label="Adjust radius"
                  type="button"
                  onClick={() => setDrawerOpen((open) => !open)}
                  className="flex items-center gap-0.5 font-label-md text-label-md text-primary font-bold active:scale-95 transition-transform"
                >
                  <span>{radius} km</span>
                  <Icon name="expand_more" className="text-[16px]" />
                </button>
              </div>
              <div className="flex items-center gap-1 px-space-xs py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>{feed.loading ? 'Loading…' : `${filteredDeals.length} live deal${filteredDeals.length === 1 ? '' : 's'}`}</span>
              </div>
            </div>

            {/* Category pills — live categories from the deals feed */}
            {categories.length > 1 && (
              <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
                {categories.map((choice) => {
                  const isSelected = selectedCategory === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => setSelectedCategory(choice.value)}
                      className={`h-9 px-space-md rounded-full font-label-md text-label-md transition-all whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'bg-surface-container-low text-text-secondary'
                      }`}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className={
                drawerOpen
                  ? 'flex items-center justify-between gap-space-xs p-space-xs bg-surface-container rounded-xl transition-all duration-300'
                  : 'hidden'
              }
            >
              <span className="font-caption text-caption text-text-secondary pl-1">{hasCoordinates ? 'Max distance:' : 'Set your location first'}</span>
              <div className="flex items-center gap-1">
                {RADII.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!hasCoordinates}
                    onClick={() => {
                      setLocation(district, value, { city, lat, lng });
                      setFilters({ strictDistance: true });
                      setDrawerOpen(false);
                    }}
                    className={
                      value === radius
                        ? 'px-2.5 py-1 rounded-full text-caption font-label-sm font-semibold bg-primary text-on-primary shadow-sm transition-all'
                        : 'px-2.5 py-1 rounded-full text-caption font-label-sm font-semibold bg-surface-canvas text-text-secondary transition-all'
                    }
                  >
                    {value} km
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
              {SORTS.map((sort, index) => (
                <button
                  key={sort.key}
                  type="button"
                  aria-pressed={index === sortIndex}
                  onClick={() => setSortIndex(index)}
                  className={
                    index === sortIndex
                      ? 'flex items-center gap-1 px-space-sm h-9 rounded-full bg-surface-tint-blue text-primary font-label-md text-label-md font-semibold whitespace-nowrap active:scale-95 transition-transform'
                      : 'flex items-center gap-1 px-space-sm h-9 rounded-full bg-surface-container text-text-secondary font-label-md text-label-md font-medium whitespace-nowrap active:scale-95 transition-transform'
                  }
                >
                  <Icon name={sort.icon} className="text-[16px]" filled={Boolean(sort.filled) && index === sortIndex} />
                  <span>{sort.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded-xl mb-1">
              <Icon name="verified_user" className="text-primary text-[17px] mt-0.5 flex-shrink-0" />
              <p className="font-caption text-caption text-text-secondary leading-snug">
                {feed.hasPromoted ? 'Promoted offers come first. ' : ''}Live deals near {locationLabel}, sorted by {SORTS[sortIndex].label.toLowerCase()}.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-space-md px-margin py-space-md">
            {feed.loading ? (
              [0, 1, 2].map((key) => (
                <div key={key} role="status" aria-busy="true" className="flex flex-col bg-surface-canvas rounded-2xl shadow-sm overflow-hidden">
                  <span className="sr-only">Loading featured deals</span>
                  <Skeleton className="w-full h-44 rounded-none" />
                  <div className="p-space-md space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-11 w-32 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredDeals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                {selectedCategory !== '' ? `No live deals from ${selectedCategory} right now.` : activeCount ? 'No live deals match your filters.' : 'No featured deals near you yet.'}
              </div>
            ) : filteredDeals.map((deal) => (
              <article
                key={deal.id}
                {...dealCardProps(() => openDeal(deal))}
                className="flex flex-col bg-surface-canvas rounded-2xl shadow-sm overflow-hidden active:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-44 overflow-hidden">
                  <img className="w-full h-full object-cover" alt={deal.alt} src={deal.img} />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold shadow-sm">
                      {deal.discount}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-caption text-caption font-medium tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                      {deal.promo}
                    </span>
                  </div>
                  <button
                    aria-label={deal.offerId && saved[deal.offerId] ? 'Remove from saved deals' : 'Save deal'}
                    aria-pressed={Boolean(deal.offerId && saved[deal.offerId])}
                    disabled={!deal.offerId}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void saveDeal(deal.offerId);
                    }}
                    className={
                      deal.offerId && saved[deal.offerId]
                        ? 'absolute top-3 right-3 w-9 h-9 rounded-full bg-error-container backdrop-blur-md flex items-center justify-center text-error shadow-sm active:scale-90 transition-transform'
                        : 'absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-canvas/90 backdrop-blur-md flex items-center justify-center text-text-primary shadow-sm active:scale-90 transition-transform'
                    }
                  >
                    <Icon name={deal.offerId && saved[deal.offerId] ? 'favorite' : 'favorite_border'} className="text-[20px]" filled={Boolean(deal.offerId && saved[deal.offerId])} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-canvas/95 backdrop-blur-md shadow-sm">
                    <Icon name="near_me" className="text-primary text-[14px]" filled />
                    <span className="font-caption text-caption text-text-primary font-bold">{deal.distance}</span>
                  </div>
                  <div
                    className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md font-caption text-caption font-semibold ${deal.urgencyClass}`}
                  >
                    <Icon name={deal.urgencyIcon} className="text-[13px]" />
                    <span>{deal.urgencyText}</span>
                  </div>
                </div>
                <div className="flex flex-col p-space-md gap-space-xs">
                  <div className="flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-label-md text-label-md font-bold text-text-primary truncate">{deal.merchant}</span>
                      {deal.verified ? (
                        <>
                          <Icon name="check_circle" className="text-primary text-[16px] flex-shrink-0" filled />
                          <span className="font-caption text-caption text-text-tertiary">Verified Partner</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary leading-snug font-bold">{deal.title}</h3>
                  {deal.desc ? <p className="font-body-md text-caption text-text-secondary line-clamp-1">{deal.desc}</p> : null}
                  <div className="flex items-center justify-between gap-space-sm pt-space-xs mt-1">
                    <div className="flex flex-col">
                      <span className="font-caption text-caption text-text-tertiary line-through leading-none">{deal.oldPrice}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading-md text-heading-md text-text-primary font-bold">{deal.price}</span>
                        <span className="font-caption text-caption text-badge-discount-text font-semibold">{deal.save}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDeal(deal);
                      }}
                      className="h-11 px-space-lg rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-1"
                    >
                      <span>View Deal</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <footer className="flex flex-col items-center px-margin pt-space-sm pb-space-2xl text-center">
            <div className="w-full p-space-md rounded-2xl bg-surface-container-low flex flex-col items-center gap-space-2xs text-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary mb-1">
                <Icon name="info" className="text-[20px]" />
              </div>
              <h4 className="font-label-md text-label-md font-bold text-text-primary">About Featured Listings</h4>
              <p className="font-caption text-caption text-text-secondary max-w-xs leading-relaxed">
                Promoted deals are paid placements by local businesses and are labelled as Promoted. Everything else is ranked by the sort you choose.
              </p>
              <button
                type="button"
                onClick={onOpenFilters}
                className="mt-space-xs font-caption text-caption text-primary font-semibold flex items-center gap-0.5 active:opacity-75"
              >
                <span>Filter these deals</span>
                <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
            <div className="mt-space-lg flex items-center gap-1.5 text-center justify-center">
              <span className="font-caption text-caption text-text-secondary">Own a business{city && city !== 'Your city' ? ` in ${city}` : ''}?</span>
              <button
                type="button"
                onClick={onBoost}
                className="font-caption text-caption font-semibold text-primary flex items-center gap-0.5 active:opacity-75"
              >
                <span>Boost your deals on VEMTAP</span>
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>
          </footer>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
