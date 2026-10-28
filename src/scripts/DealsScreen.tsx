import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { useLocation, useLocationQuery } from '../context/LocationContext';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useAuth } from '../context/AuthContext';
import { hasApiConfig } from '../services/api/client';
import { useProfile } from '../context/ProfileContext';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { catalogueService } from '../services/catalogueService';

const AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg_httfgNB7CfMJOzfjKekJGnxgvueamRqqNg-Qyw7QV2HTVvlh6rZ845BYSp5dsQClaPlSKNd4B0_3aYGUcjlu-OUBeq56PilIeD6B9e1a0GFgvTtnkB0d8i16nw-kagt5rZUqAHNUNQUsH0WcGsyf8zaqNe1yx2Go9tQcdI6QPEzXRp2aZLqYGswotDnV391PXTZI3oVx9jzWC_ZogeqCUxsw3wWsr-xRkh4q33Ljntdo0P9MsadSA';

const IMAGES = {
  tasting:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSilNVnoDb6EsvCA8tDf9s2JVAMcwijfDvwIOxGwZFEZNl621JtdrCLPlTxDeFkK-OKJdEJht7f8EgVROVov1Iw-a31YLKpyuYtTtP5cK21rnD3xPO4y27QL0ooRgJrKlAIur-ESX8ksRp66Bl841XwyKBOHb1_VoH-uvctf4YZcO59iO4cxCLK2a28AIVitYxub-nbIHNCu2TBV_s9rRPqbKIQLPz9DNZz_IocLCw-1wzbltbJfKPDA',
  sneakers:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAT5ZLc4NQJ-D07mpP7t9FMmq21vRbxTpCD4Di6UGFmFQaNz9tRu7oOh3TVcK7MAwjHWDOUavP6xW4e3sta-gWWW6UD1xmaXxZdjfTMavfQoruqrVBsuNwiP0axSzHF7z9GehUnlsVa-XBHkab2NwJKdpiTmbNr6V9yLoxioYF2teXDGTTIZ5Tit_nAL7XoYPSxVK389Fv0KpXKjWPElTwUUDUVWQ42i0YJHDwpj8ZXuasY0PUFxi2ABw',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATUYmH0_JpeZ5WqU44O8loq1vbBmgeVE5fXPLQBlTocMAtnZiWyingiBCqwd4pB2HrFjilQz2Hn9D5qXoa6v09jGYJoW4Eq96c47wCpUV4bmHR16UhGP0gxmaU5bi2HO7v9_eecjqBfOdRwQW8CC3JCTu2qRyIC4T9OenOCS6bnJ-XcHWj5ok8s0MFN8YNtTQ5us4dRtpYiNDbIq2TFyP6FLzgolFEKJUiF6NwYNdCnppPKaZYg2Utdg',
  coldBrew:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5aT4hxBnu4KdypiAsxFiLD6LnzxeRBhcXL5_UMJ_zqs5sUBZSj26pQBvXBwDRRQtkFEBaBN3blfsWvkLFZD6GgYk8fCqG4QsBTviyYH4BpEK8q09MYZleAghjI-XeMlqsGu4thjW6tX5oi_wvW0v0yWc4V2yycme1CNV96kD1Q76xJyCvNsg9O4un70AjK_moWc0nNFoLKSty4WgfxCtW1nVmqjSU8TuaOmneSH6dTclvBP2DZuf8yA',
};

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
    IMAGES.tasting;
  return typeof imageValue === 'string' && imageValue.trim() ? imageValue : IMAGES.tasting;
};

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
  const percent = compare > 0 ? Math.max(Math.round((saveAmount / compare) * 100), 5) : 15;
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
    image: getOfferImage(offer),
    business,
    title,
    description: getOfferDescription(offer),
    price,
    compare,
    discount: `${percent}% OFF`,
    save: `Save ${formatCurrency(saveAmount)}`,
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
  };
};

export interface DealsScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenFilters: () => void;
  onOpenDeal: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void;
  onOpenNotifications: () => void;
  onClaim?: (onClaimed?: () => void) => void;
  onAccount: () => void;
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

function DealGridCards({ deals, onOpen, onClaim }: { deals: Record<string, unknown>[]; onOpen: (deal?: { id?: string | number; title?: string; business?: string; location?: string; price?: number | string; oldPrice?: number | string; discountLabel?: string; image?: string }) => void; onClaim?: (onClaimed?: () => void) => void }) {
  const { claimed } = useAuth();
  const cards = useMemo(() => deals.map((deal, index) => toDealCardModel(deal, index)), [deals]);

  if (!cards.length) {
    return (
      <div className="px-margin pb-space-lg">
        <div className="bg-surface-container-low rounded-xl border border-dashed border-outline-variant p-space-lg text-center">
          <p className="font-label-md text-label-md text-text-primary font-semibold">No live deals available</p>
          <p className="mt-1 font-body-md text-body-md text-text-secondary">Check back soon for nearby offers.</p>
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
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-caption text-[11px] font-medium flex items-center gap-0.5">
              <Icon name="hourglass_top" className="text-[12px] text-tertiary-fixed" />Live
            </div>
          </div>
          <div className="p-2.5 flex flex-col flex-1 justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-caption text-[12px] text-text-secondary truncate">{deal.business}</span>
                <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
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
              <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold w-fit mb-2">
                {deal.save}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle mt-1">
              <div className="flex items-center gap-0.5 text-text-secondary font-caption text-[11px]">
                <Icon name="location_on" className="text-[13px]" />
                <span>{deal.distance}</span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClaim?.(() => {});
                }}
                className={`h-7 px-2 rounded-lg font-caption text-caption font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs ${
                  claimed
                    ? 'bg-badge-discount-bg text-badge-discount-text'
                    : 'bg-primary text-on-primary hover:bg-surface-tint'
                }`}
              >
                {claimed ? 'Claimed' : 'Claim'}
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
}: DealsScreenProps) {
  const { claimed } = useAuth();
  const { live, count: unreadCount } = useUnreadNotifications();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [locationOpen, setLocationOpen] = useState(false);
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const { district, city, radius, setLocation } = useLocation();
  const apiReady = hasApiConfig();

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
        const response = await catalogueService.getPublicOffers({ ...locationQuery, page: 1, limit: 6 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch {
        if (!ignore) setPublicOffers([]);
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, [locationQuery]);

  const displayDeals = useMemo(() => publicOffers.filter(isUsableOffer).slice(0, 6), [publicOffers]);
  const featuredDeal = displayDeals[0] ? toDealCardModel(displayDeals[0]) : null;

  if (!displayDeals.length) {
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
              Publish live public offers to populate this feed.
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
                  className="w-full bg-transparent font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals, businesses or products..."
                  type="text"
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

            <div className="px-margin mb-space-md">
              {featuredDeal ? (
                <div
                  {...dealCardProps(onOpenDeal, {
                    id: String(featuredDeal.id ?? featuredDeal.title),
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
                        DEAL OF THE DAY
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
                      {featuredDeal.distance}
                    </div>
                  </div>
                  <div className="p-space-md flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-caption text-[12px] text-text-secondary font-medium truncate">
                          {featuredDeal.business}
                        </span>
                        <Icon name="verified" className="text-primary text-[14px] shrink-0" filled />
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
                        <span className="px-1.5 py-0.5 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                          {featuredDeal.save}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
                      <div className="flex items-center gap-3 text-text-secondary font-caption text-[12px]">
                        <span className="flex items-center gap-1">
                          <Icon name="favorite" className="text-[15px] text-error" filled />{featuredDeal.discount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="chat_bubble" className="text-[15px]" />Live
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClaim?.(() => {});
                        }}
                        className={`h-9 px-4 rounded-xl font-label-md text-label-md font-semibold active:scale-95 transition-all shadow-xs flex items-center gap-1.5 ${
                          claimed
                            ? 'bg-badge-discount-bg text-badge-discount-text'
                            : 'bg-primary text-on-primary hover:bg-surface-tint'
                        }`}
                      >
                        {claimed ? 'Claimed' : 'Claim Deal'}
                        <Icon name="arrow_forward" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-space-lg text-center">
                  <p className="font-label-md text-label-md text-text-primary font-semibold">No live feature available</p>
                  <p className="mt-1 font-body-md text-body-md text-text-secondary">Local offers will appear here once the catalogue is active.</p>
                </div>
              )}
            </div>

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-text-primary font-bold">
                  Deals in {district}, {city}
                </span>
                <span className="font-caption text-caption text-text-tertiary">({displayDeals.length})</span>
              </div>
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

            <DealGridCards deals={displayDeals} onOpen={onOpenDeal} onClaim={onClaim} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col relative w-full pt-[88px] pb-24 bg-surface">
          <div className="flex flex-col w-full">
            <div className="px-margin mb-space-sm">
              <div className="flex items-center h-[50px] px-4 rounded-2xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-canvas focus-within:shadow-md">
                <Icon name="search" className="text-text-tertiary text-[22px] mr-3" />
                <input
                  className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                  placeholder="Search deals, businesses or products"
                  type="text"
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

            <div className="px-margin mb-space-sm flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary font-medium">Showing {displayDeals.length} deal{displayDeals.length === 1 ? '' : 's'}</span>
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

            <DealGridCards deals={displayDeals} onOpen={onOpenDeal} onClaim={onClaim} />
          </div>
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
