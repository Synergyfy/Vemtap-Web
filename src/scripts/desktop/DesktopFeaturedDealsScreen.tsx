import { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation } from '../../context/LocationContext';
import { useDealFilters } from '../../context/DealFiltersContext';
import { useFeaturedDeals, useSavedDeals, type FeaturedSort } from '../../hooks/useFeaturedDeals';
import { sponsoredService } from '../../services/sponsoredService';
import { isVerifiedOffer, offerDiscountLabel, offerEndsLabel, offerImage, offerLocationLabel, realOfferId } from '../../utils/homeOffer';

interface DesktopFeaturedDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  /** Receives the clicked deal so the detail page loads that deal (and its photos). */
  onOpenDeal: (deal: { id: string; title: string; business: string; price: number; oldPrice: number; discountLabel: string; image: string }) => void;
}

interface FeaturedDeal {
  id: string;
  offerId?: string;
  campaignId?: string;
  verified: boolean;
  priceValue: number;
  oldPriceValue: number;
  image: string;
  imageAlt: string;
  discount: string;
  extra: { label: string; className: string; icon: string };
  window: { icon: string; label: string };
  distance: string;
  store: string;
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

const toDealSummary = (deal: FeaturedDeal) => ({
  id: deal.id,
  title: deal.title,
  business: deal.store,
  price: deal.priceValue,
  oldPrice: deal.oldPriceValue,
  discountLabel: deal.discount,
  image: deal.image,
});

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
    priceValue: price,
    oldPriceValue: comparePrice,
    image: getOfferImage(offer),
    imageAlt: `${title} by ${business}`,
    discount: offerDiscountLabel(offer),
    extra: {
      label: campaignId ? 'Promoted' : 'Featured',
      className: 'bg-error-container text-on-error-container font-semibold',
      icon: 'local_fire_department',
    },
    window: { icon: 'schedule', label: offerEndsLabel(offer) },
    distance: location,
    store: business,
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: comparePrice > price ? formatCurrency(comparePrice) : '',
    save: discountValue > 0 ? `Save ${formatCurrency(discountValue)}` : '',
  };
};

const SORT_OPTIONS: { key: FeaturedSort; label: string; icon: string }[] = [
  { key: 'closest', label: 'Closest to You', icon: 'near_me' },
  { key: 'discount', label: 'Highest Discount', icon: 'percent' },
  { key: 'ending', label: 'Ending Soonest', icon: 'timer' },
  { key: 'popular', label: 'Popular', icon: 'local_fire_department' },
];

export function DesktopFeaturedDealsScreen({ onNav, onOpenFilters, onOpenDeal }: DesktopFeaturedDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<FeaturedSort>('closest');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const { activeCount } = useDealFilters();
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const feed = useFeaturedDeals(sort);
  const { saved, toggleSaved } = useSavedDeals();
  const featuredDeals = useMemo(() => feed.offers.map(toFeaturedDeal), [feed.offers]);
  const moreDeals = Math.max(0, feed.total - featuredDeals.length);
  const sortLabel = SORT_OPTIONS.find((option) => option.key === sort)?.label.toLowerCase() ?? '';
  const areaLabel = [district, city].filter(Boolean).join(', ');

  // Category pills — live categories extracted from the current deals feed.
  const categories = useMemo(() => {
    const storeNames = featuredDeals
      .map((deal) => deal.store)
      .filter((name) => name && name !== 'Nearby business');
    const unique = [...new Set(storeNames)].sort();
    return [{ value: '', label: 'All' }, ...unique.map((name) => ({ value: name, label: name }))];
  }, [featuredDeals]);

  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredDeals = useMemo(() => {
    if (selectedCategory === '') return featuredDeals;
    return featuredDeals.filter((deal) => deal.store === selectedCategory);
  }, [featuredDeals, selectedCategory]);

  const saveDeal = async (offerId: string | undefined) => {
    if (!offerId) return;
    const result = await toggleSaved(offerId);
    setSaveNote('error' in result ? result.error : result.saved ? 'Saved to your deals' : 'Removed from saved deals');
    window.setTimeout(() => setSaveNote(null), 2400);
  };

  /** A tap on a promoted deal is counted for its campaign. */
  const openDeal = (deal: FeaturedDeal) => {
    if (deal.campaignId && deal.offerId) sponsoredService.track(deal.campaignId, deal.offerId, 'tap');
    onOpenDeal(toDealSummary(deal));
  };

  return (
    <>
      <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
        <section className="w-full px-margin pt-space-lg pb-space-md">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Featured Deals</h1>
                {feed.hasPromoted ? (
                  <span className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed-variant font-caption text-caption font-semibold tracking-wider uppercase">
                    <Icon name="auto_awesome" className="text-[14px]" />
                    PROMOTED / SPONSORED
                  </span>
                ) : null}
                <span className="text-text-tertiary font-body-md text-body-md hidden sm:inline">•</span>
                <span className="font-label-md text-label-md text-text-secondary">{feed.loading ? 'Loading deals…' : `${filteredDeals.length} Local Offer${filteredDeals.length === 1 ? '' : 's'}`}</span>
              </div>

              <div className="flex items-center gap-space-xs self-start md:self-auto">
                <button
                  className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                  type="button"
                  onClick={onOpenFilters}
                >
                  <Icon name="tune" className="text-[18px] text-primary" />
                  <span>Filters{activeCount ? ` (${activeCount})` : ''}</span>
                </button>
                <div className="hidden sm:flex items-center bg-surface-subtle p-1 rounded-xl shadow-sm">
                  <button
                    aria-label="Grid View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      view === 'grid' ? 'bg-surface-canvas shadow-sm text-primary' : 'text-text-tertiary hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => setView('grid')}
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                  <button
                    aria-label="List View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      view === 'list' ? 'bg-surface-canvas shadow-sm text-primary' : 'text-text-tertiary hover:text-text-primary'
                    }`}
                    type="button"
                    onClick={() => setView('list')}
                  >
                    <Icon name="view_agenda" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm py-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <button
                  className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm"
                  type="button"
                  onClick={() => setLocationOpen(true)}
                >
                  <Icon name="location_on" className="text-[16px]" />
                  <span className="font-semibold">
                    {district}, {city}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span>Within {radius}km</span>
                </button>
                {!feed.loading ? (
                  <span className="text-badge-discount-text font-label-sm text-label-sm bg-badge-discount-bg px-2.5 py-1 rounded-full font-medium">
                    {filteredDeals.length} Live Deal{filteredDeals.length === 1 ? '' : 's'} Active Now
                  </span>
                ) : null}
                {saveNote ? (
                  <span role="status" className="font-label-sm text-label-sm bg-inverse-surface text-inverse-on-surface px-2.5 py-1 rounded-full">{saveNote}</span>
                ) : null}
              </div>

              <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                {SORT_OPTIONS.map((option) => {
                  const active = option.key === sort;
                  return (
                    <button
                      key={option.key}
                      aria-pressed={active}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-surface-tint-blue text-primary shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container text-text-secondary'
                      }`}
                      type="button"
                      onClick={() => setSort(option.key)}
                    >
                      <Icon name={option.icon} className="text-[15px]" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category pills — live categories from the deals feed */}
            {categories.length > 1 && (
              <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1">
                {categories.map((choice) => {
                  const isSelected = selectedCategory === choice.value;
                  return (
                    <button
                      key={choice.value}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm font-semibold'
                          : 'bg-surface-container-low hover:bg-surface-container text-text-secondary'
                      }`}
                      type="button"
                      onClick={() => setSelectedCategory(choice.value)}
                    >
                      <span>{choice.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="w-full flex items-start sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant text-caption font-caption">
              <div className="flex items-center gap-space-xs">
                <Icon name="qr_code_2" className="text-primary text-[20px] shrink-0" />
                <span>
                  {feed.hasPromoted ? 'Promoted offers come first. ' : ''}Live deals{areaLabel ? ` near ${areaLabel}` : ''}, sorted by {sortLabel}.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-margin py-space-sm">
          <div
            className={`max-w-7xl mx-auto grid gap-space-lg ${
              view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {feed.loading ? (
              [0, 1, 2].map((key) => (
                <div key={key} role="status" aria-busy="true" className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] overflow-hidden">
                  <span className="sr-only">Loading featured deals</span>
                  <Skeleton className="w-full h-56 rounded-none" />
                  <div className="p-space-md space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-11 w-32 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredDeals.length === 0 ? (
              <article className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                {selectedCategory !== '' ? `No live deals from ${selectedCategory} right now.` : activeCount ? 'No live deals match your filters.' : 'No featured deals near you yet.'}
              </article>
            ) : filteredDeals.map((deal) => (
              <article
                key={deal.id}
                role="button"
                tabIndex={0}
                onClick={() => openDeal(deal)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDeal(deal);
                  }
                }}
                className="group flex flex-col rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(6,108,244,0.12)] transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative w-full h-56 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={deal.imageAlt}
                    src={deal.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-bold shadow-sm">
                      {deal.discount}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-caption text-caption flex items-center gap-1 shadow-sm ${deal.extra.className}`}
                    >
                      <Icon name={deal.extra.icon} className="text-[14px]" />
                      {deal.extra.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      aria-label={deal.offerId && saved[deal.offerId] ? 'Remove from saved deals' : 'Save Deal'}
                      aria-pressed={Boolean(deal.offerId && saved[deal.offerId])}
                      disabled={!deal.offerId}
                      className={`w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
                        deal.offerId && saved[deal.offerId] ? 'text-primary' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void saveDeal(deal.offerId);
                      }}
                    >
                      <Icon
                        name={deal.offerId && saved[deal.offerId] ? 'bookmark_added' : 'bookmark'}
                        className="text-[18px]"
                        filled={Boolean(deal.offerId && saved[deal.offerId])}
                      />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-caption font-caption">
                    <span className="inline-flex items-center gap-1 bg-on-surface/60 backdrop-blur-md px-2 py-0.5 rounded-md text-on-primary">
                      <Icon name={deal.window.icon} className="text-[14px] text-badge-discount-text" />
                      {deal.window.label}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-on-surface/60 backdrop-blur-md px-2 py-0.5 rounded-md text-on-primary">
                      <Icon name="near_me" className="text-[14px]" />
                      {deal.distance}
                    </span>
                  </div>
                </div>

                <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                          {deal.store}
                        </span>
                        {deal.verified ? <Icon name="verified" filled className="text-primary text-[16px] shrink-0" /> : null}
                      </div>
                    </div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {deal.title}
                    </h2>
                    {deal.copy ? <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p> : null}
                  </div>

                  <div className="pt-space-xs flex items-center justify-between gap-space-sm bg-surface-subtle -mx-space-md -mb-space-md p-space-md mt-auto">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading-md text-heading-md font-bold text-text-primary">{deal.price}</span>
                        <span className="font-caption text-caption text-text-tertiary line-through">{deal.oldPrice}</span>
                      </div>
                      <span className="font-caption text-caption text-badge-discount-text font-medium">{deal.save}</span>
                    </div>
                    <button
                      className="h-11 px-space-md bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      type="button"
                    >
                      <span>View Deal</span>
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <article className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] overflow-hidden p-space-md justify-between">
              <div className="space-y-space-sm">
                <span className="font-caption text-caption font-semibold tracking-wider uppercase text-primary">
                  More Near You
                </span>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  {moreDeals > 0 ? `Explore ${moreDeals} more deal${moreDeals === 1 ? '' : 's'}` : 'Explore all deals'}
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  See every live deal{areaLabel ? ` near ${areaLabel}` : ''}, with search, sorting and filters.
                </p>
              </div>

              <div className="pt-space-md mt-auto">
                <button
                  className="w-full h-11 bg-surface-tint-blue hover:bg-secondary-fixed text-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                  onClick={() => onNav('deals')}
                >
                  <Icon name="local_offer" className="text-[18px]" />
                  <span>See All Deals</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="w-full px-margin pt-space-xl pb-space-2xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-8 p-space-lg rounded-2xl bg-surface-container-low flex flex-col sm:flex-row gap-space-md items-start">
              <div className="w-12 h-12 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="verified" className="text-[24px]" />
              </div>
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <h4 className="font-heading-sm text-heading-sm text-text-primary">
                    About Featured Listings on VEMTAP
                  </h4>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Promoted deals are paid placements by local businesses, shown near your location and always labelled
                  as Promoted. Every other deal is ranked by the sort you choose.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 p-space-lg rounded-2xl bg-surface-canvas shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] flex flex-col justify-between gap-space-md">
              <div className="space-y-space-2xs">
                <span className="text-caption font-caption font-semibold uppercase tracking-wider text-primary">
                  For Business Owners
                </span>
                <h4 className="font-heading-sm text-heading-sm text-text-primary">Own a business{city && city !== 'Your city' ? ` in ${city}` : ''}?</h4>
                <p className="font-body-md text-body-md text-text-secondary">
                  Drive local foot traffic right to your counter during quiet hours by promoting your deals on VEMTAP.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:gap-2 transition-all self-start"
                type="button"
                onClick={() => onNav('for-business')}
              >
                <span>Boost your deals on VEMTAP</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </section>
      </DesktopPage>
      <DesktopLocationRadiusModal open={locationOpen} onClose={() => setLocationOpen(false)} onApply={setLocation} district={district} radius={radius} />
    </>
  );
}
