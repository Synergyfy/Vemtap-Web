import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DesktopLocationRadiusModal } from '../../components/DesktopLocationRadiusModal';
import { useLocation, useLocationQuery } from '../../context/LocationContext';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';
import { dealPrimaryImage } from '../../utils/dealImages';

interface DesktopFeaturedDealsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onOpenFilters: () => void;
  /** Receives the clicked deal so the detail page loads that deal (and its photos). */
  onOpenDeal: (deal: { id: string; title: string; business: string; price: number; oldPrice: number; discountLabel: string; image: string }) => void;
}

interface FeaturedDeal {
  id: string;
  priceValue: number;
  oldPriceValue: number;
  image: string;
  imageAlt: string;
  discount: string;
  extra: { label: string; className: string; icon: string };
  window: { icon: string; label: string };
  distance: string;
  store: string;
  rating: string;
  reviews: string;
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

/** Same rule as the home cards and the detail page: the deal's own photo first. */
const getOfferImage = (offer: Record<string, unknown>): string => dealPrimaryImage(offer) ?? 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';

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
  const value = offer.description ?? offer.summary ?? offer.copy ?? 'Fresh local offer from nearby vendors.';
  return typeof value === 'string' && value.trim() ? value : 'Fresh local offer from nearby vendors.';
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
  discountLabel: deal.save,
  image: deal.image,
});

const toFeaturedDeal = (offer: Record<string, unknown>): FeaturedDeal => {
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);
  const business = getOfferBusinessName(offer);
  const discountValue = Math.max(comparePrice - price, 0);

  return {
    id: String(offer.id ?? `${business}-${title}`),
    priceValue: price,
    oldPriceValue: comparePrice,
    image: getOfferImage(offer),
    imageAlt: `${title} by ${business}`,
    discount: price > 0 ? 'Live Deal' : 'Offer',
    extra: {
      label: 'Live',
      className: 'bg-error-container text-on-error-container font-semibold',
      icon: 'local_fire_department',
    },
    window: { icon: 'schedule', label: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby' },
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    store: business,
    rating: '4.9',
    reviews: '(live)',
    title,
    copy: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: comparePrice > price ? formatCurrency(comparePrice) : '',
    save: price > 0 ? `Save ${formatCurrency(discountValue)}` : 'Limited-time',
  };
};

const SORT_OPTIONS = [
  { key: 'closest', label: 'Closest to You', icon: 'near_me' },
  { key: 'discount', label: 'Highest Discount', icon: 'percent' },
  { key: 'ending', label: 'Ending Soonest', icon: 'timer' },
];

export function DesktopFeaturedDealsScreen({ onNav, onOpenFilters, onOpenDeal }: DesktopFeaturedDealsScreenProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('closest');
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);

  // Nearest first within the radius once the customer has a location.
  const locationQuery = useLocationQuery();
  useEffect(() => {
    let ignore = false;
    const loadOffers = async () => {
      if (!hasApiConfig()) {
        if (!ignore) setPublicOffers([]);
        return;
      }

      try {
        const response = await catalogueService.getPublicOffers({ ...locationQuery, page: 1, limit: 5 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch {
        if (!ignore) setPublicOffers([]);
      }
    };

    loadOffers();
    return () => {
      ignore = true;
    };
  }, [locationQuery]);

  const featuredDeals = useMemo(() => publicOffers.slice(0, 5).map(toFeaturedDeal), [publicOffers]);

  const toggleSave = (store: string) => {
    setSaved((prev) => ({ ...prev, [store]: !prev[store] }));
  };

  return (
    <>
      <DesktopPage activeNav="deals" onNav={onNav} withFooter withHeader>
        <section className="w-full px-margin pt-space-lg pb-space-md">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Featured Deals</h1>
                <span className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed-variant font-caption text-caption font-semibold tracking-wider uppercase">
                  <Icon name="auto_awesome" className="text-[14px]" />
                  PROMOTED / SPONSORED
                </span>
                <span className="text-text-tertiary font-body-md text-body-md hidden sm:inline">•</span>
                <span className="font-label-md text-label-md text-text-secondary">5 Curated Local Offers</span>
              </div>

              <div className="flex items-center gap-space-xs self-start md:self-auto">
                <button
                  className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                  type="button"
                  onClick={onOpenFilters}
                >
                  <Icon name="tune" className="text-[18px] text-primary" />
                  <span>Filters</span>
                  <span className="w-2 h-2 rounded-full bg-primary-container" />
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
                  <span>Within 10km</span>
                </button>
                <span className="text-badge-discount-text font-label-sm text-label-sm bg-badge-discount-bg px-2.5 py-1 rounded-full font-medium">
                  5 Live Deals Active Now
                </span>
              </div>

              <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                {SORT_OPTIONS.map((option) => {
                  const active = option.key === sort;
                  return (
                    <button
                      key={option.key}
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

            <div className="w-full flex items-start sm:items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant text-caption font-caption">
              <div className="flex items-center gap-space-xs">
                <Icon name="qr_code_2" className="text-primary text-[20px] shrink-0" />
                <span>
                  Promoted and sponsored offers from verified local merchants near your GPS pinpoint. Ranked strictly
                  by geographic distance.
                </span>
              </div>
              <button
                className="text-primary hover:underline font-label-sm text-label-sm shrink-0 hidden md:block"
                type="button"
              >
                Audit Criteria
              </button>
            </div>
          </div>
        </section>

        <section className="w-full px-margin py-space-sm">
          <div
            className={`max-w-7xl mx-auto grid gap-space-lg ${
              view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {featuredDeals.length === 0 ? (
              <article className="col-span-full rounded-2xl border border-dashed border-primary/20 bg-surface-subtle p-space-lg text-text-secondary">
                Live featured deals will appear here once the public offers feed is available.
              </article>
            ) : featuredDeals.map((deal) => (
              <article
                key={deal.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDeal(toDealSummary(deal))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenDeal(toDealSummary(deal));
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
                      aria-label="Save Deal"
                      className={`w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
                        saved[deal.store] ? 'text-primary' : 'text-text-secondary hover:text-error'
                      }`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSave(deal.store);
                      }}
                    >
                      <Icon
                        name={saved[deal.store] ? 'bookmark_added' : 'bookmark'}
                        className="text-[18px]"
                        filled={saved[deal.store]}
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
                        <Icon name="verified" filled className="text-primary text-[16px] shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm shrink-0 bg-surface-container-low px-1.5 py-0.5 rounded">
                        <Icon name="star" filled className="text-[14px] text-amber-500" />
                        <span className="font-semibold">{deal.rating}</span>
                        <span className="text-text-tertiary">{deal.reviews}</span>
                      </div>
                    </div>
                    <h2 className="font-heading-sm text-heading-sm text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {deal.title}
                    </h2>
                    <p className="font-body-md text-body-md text-text-secondary line-clamp-2">{deal.copy}</p>
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
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption font-semibold tracking-wider uppercase text-primary">
                    Live Radar
                  </span>
                  <span className="flex items-center gap-1 text-badge-discount-text font-caption text-caption font-medium">
                    <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                    GPS Sync Active
                  </span>
                </div>
                <h3 className="font-heading-sm text-heading-sm text-text-primary">
                  Explore 18+ Unlisted Neighborhood Perks
                </h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Switch to the interactive neighborhood map to see unpromoted walk-in stamps, flash discounts, and
                  instant tap vouchers in Apo District.
                </p>

                <div
                  className="w-full h-36 rounded-xl bg-surface-container relative overflow-hidden flex items-end p-space-xs"
                  data-location="Apo District, Abuja, Nigeria"
                >
                  <div className="relative z-10 bg-surface-canvas/90 backdrop-blur-sm px-space-xs py-1 rounded-lg text-caption font-caption text-text-primary flex items-center gap-1 shadow-sm">
                    <Icon name="navigation" className="text-[16px] text-primary" />
                    <span>Apo Bridge corridor • 0.4 - 3.2km</span>
                  </div>
                </div>
              </div>

              <div className="pt-space-md mt-auto">
                <button
                  className="w-full h-11 bg-surface-tint-blue hover:bg-secondary-fixed text-primary font-button-secondary text-button-secondary rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  type="button"
                >
                  <Icon name="map" className="text-[18px]" />
                  <span>Switch to Map Radar</span>
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
                  <span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-canvas text-text-secondary font-medium">
                    NDPR Verified
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Promoted placements let verified merchants showcase time-sensitive perks to nearby consumers. While
                  placement is sponsored, ranking priority is governed strictly by your real-time GPS distance and
                  historical fulfillment score (min. 4.5★ rating). Merchants cannot buy placement outside their
                  operational radius.
                </p>
                <div className="pt-space-2xs flex items-center gap-space-md text-caption font-caption text-text-tertiary flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="security" className="text-[14px]" />
                    Zero Location Tracking Storage
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="percent" className="text-[14px]" />
                    Guaranteed Price Match
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-space-lg rounded-2xl bg-surface-canvas shadow-[0_4px_20px_-4px_rgba(13,37,76,0.06)] flex flex-col justify-between gap-space-md">
              <div className="space-y-space-2xs">
                <span className="text-caption font-caption font-semibold uppercase tracking-wider text-primary">
                  For Business Owners
                </span>
                <h4 className="font-heading-sm text-heading-sm text-text-primary">Own a business in Abuja?</h4>
                <p className="font-body-md text-body-md text-text-secondary">
                  Drive high-intent local foot traffic right to your counter during quiet hours. Boost your verified
                  deals across Apo, Garki, and Wuse.
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
