import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { LocationRadiusModal } from '../components/LocationRadiusModal';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useLocation, useLocationQuery } from '../context/LocationContext';
import { useOrders } from '../context/OrdersContext';
import { useProfile } from '../context/ProfileContext';
import { useBooking } from '../context/BookingContext';
import { hasApiConfig } from '../services/api/client';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { catalogueService } from '../services/catalogueService';
import {
  activeAnnouncements,
  type AnnouncementDestination,
  type AnnouncementTone,
} from './announcementsData';
import { dealPrimaryImage } from '../utils/dealImages';

export type DashboardTarget =
  | 'my-deals'
  | 'orders'
  | 'savings'
  | 'notifications'
  | 'cart'
  | 'scan'
  | 'activity'
  | 'saved'
  | 'subscription'
  | 'dashboard'
  | 'featured-deals'
  | 'business-onboarding';

interface DashboardScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onNavigate: (target: DashboardTarget) => void;
  onShowQR: () => void;
  /** Opens the business account-choice flow ("Continue with this account" / "Use a new account"). */
  onStartBusinessSignup: () => void;
}


interface HeroSlide {
  image: string;
  pill: string;
  title: string;
  subtitle: string;
  cta?: string;
  destination?: AnnouncementDestination;
}

const TONE_LABEL: Record<AnnouncementTone, string> = {
  promo: 'Promo',
  info: 'Update',
  upgrade: 'Upgrade',
  alert: 'Alert',
};

const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCgCwLd5w58QXLgV11MHD52EEti1eL21CVWe5XjaydFi7gB0n_HlN0ZRXV3yob4ZVn5VXviRWWZGYsv1AaFBYmLz5MGyZoBIQR2PaZJDI_Hy-6Q8Q2qX_UNm3TBcOS5Clrs17aHV0AbIlu45JooU-HWsPtb3bHzQbC2hp0eLB-F0K_mX7KOrm8At7tLg-OaWWH65X7PtLDGbNibqkIdLveIrO70jZrzaDghvLUUoFza5ZW1bMN8Ce0DQw';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';

interface RecommendedDeal {
  id: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeClass: string;
  distance: string;
  business: string;
  item: string;
  price: string;
  was: string;
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
const getOfferImage = (offer: Record<string, unknown>): string => dealPrimaryImage(offer) ?? FALLBACK_IMAGE;

const getOfferBusinessName = (offer: Record<string, unknown>): string => {
  const business = offer.business && typeof offer.business === 'object' ? (offer.business as Record<string, unknown>) : {};
  const value = offer.businessName ?? offer.merchantName ?? offer.vendorName ?? offer.branchName ?? business.name ?? business.businessName ?? business.merchantName ?? 'Nearby business';
  return typeof value === 'string' && value.trim() ? value : 'Nearby business';
};

const getOfferTitle = (offer: Record<string, unknown>): string => {
  const value = offer.title ?? offer.name ?? offer.itemName ?? offer.offerTitle ?? 'Local offer';
  return typeof value === 'string' && value.trim() ? value : 'Local offer';
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

const toDashboardRecommended = (offer: Record<string, unknown>): RecommendedDeal => {
  const business = getOfferBusinessName(offer);
  const title = getOfferTitle(offer);
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);
  return {
    id: String(offer.id ?? title),
    image: getOfferImage(offer),
    imageAlt: `${title} by ${business}`,
    badge: price > 0 ? 'Live Deal' : 'Offer',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    business,
    item: title,
    price: formatCurrency(price),
    was: comparePrice > price ? formatCurrency(comparePrice) : '',
  };
};

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading-sm text-heading-sm text-on-surface">{title}</h2>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
        >
          {action}
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      )}
    </div>
  );
}

export function DashboardScreen({ onTab, onNavigate, onShowQR, onStartBusinessSignup }: DashboardScreenProps) {
  const [locationOpen, setLocationOpen] = useState(false);
  const { district, city, radius, setLocation } = useLocation();
  const [hero, setHero] = useState(0);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const { fullName } = useProfile();
  const { orders } = useOrders();
  const { appointments } = useBooking();

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
        const response = await catalogueService.getPublicOffers({ ...locationQuery, page: 1, limit: 4 });
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!ignore) setPublicOffers(rows as Record<string, unknown>[]);
      } catch {
        if (!ignore) setPublicOffers([]);
      }
    };

    loadOffers();
    return () => { ignore = true; };
  }, [locationQuery]);

  const firstName = fullName.trim().split(/\s+/)[0] || 'there';
  // Live: the real unread count; demo keeps its sample "3".
  const { live: liveUnread, count: unreadCount } = useUnreadNotifications();
  const bellBadge = liveUnread ? (unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null) : '3';
  const profileInitials = fullName.trim() ? fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase().slice(0, 2) : 'U';
  const recommendedDeals = useMemo(() => publicOffers.slice(0, 2).map(toDashboardRecommended), [publicOffers]);

  const banners = useMemo<HeroSlide[]>(() => {
    const active = activeAnnouncements();
    return active.map((item) => ({
      image: item.image || CAFE_IMG,
      pill: TONE_LABEL[item.tone],
      title: item.title,
      subtitle: item.message,
      cta: item.cta,
      destination: item.destination,
    }));
  }, []);

  const savedPotential = publicOffers.reduce((sum, offer) => {
    const price = getOfferPrice(offer);
    const compare = getOfferComparePrice(offer);
    return sum + Math.max(compare - price, 0);
  }, 0);
  const recentEvents = useMemo(() => {
    const events: Array<{ id: string; label: string; subtitle: string; value: string; icon: string; tone: 'primary' | 'success' | 'neutral'; }> = [];

    orders.slice(0, 2).forEach((order) => {
      events.push({
        id: `order-${order.ref}`,
        label: order.status === 'submitted' ? 'Order placed' : 'Order update',
        subtitle: `${order.merchantName} • ${new Date(order.submittedAt).toLocaleDateString()}`,
        value: `${order.total > 0 ? formatCurrency(order.total) : 'Live order'}`,
        icon: 'receipt_long',
        tone: 'primary',
      });
    });

    appointments.slice(0, 2).forEach((appointment) => {
      events.push({
        id: `booking-${appointment.ref}`,
        label: appointment.status === 'confirmed' ? 'Booking confirmed' : 'Booking updated',
        subtitle: `${appointment.merchantName} • ${appointment.dateShort} ${appointment.time}`,
        value: formatCurrency(appointment.payable),
        icon: 'calendar_today',
        tone: 'success',
      });
    });

    publicOffers.slice(0, 2).forEach((offer) => {
      const title = getOfferTitle(offer);
      const business = getOfferBusinessName(offer);
      const price = getOfferPrice(offer);
      events.push({
        id: `offer-${String(offer.id ?? title)}`,
        label: 'Local deal live',
        subtitle: `${business} • ${title}`,
        value: formatCurrency(price),
        icon: 'local_offer',
        tone: 'neutral',
      });
    });

    return events.slice(0, 3);
  }, [publicOffers, orders, appointments]);

  const goToDestination = (destination?: AnnouncementDestination) => {
    if (!destination) {
      onTab('deals');
      return;
    }
    if (destination === 'deals' || destination === 'featured') onTab('deals');
    else onNavigate(destination === 'dashboard' ? 'dashboard' : destination);
  };

  useEffect(() => {
    if (banners.length === 0) return undefined;
    const id = window.setInterval(() => setHero((current) => (current + 1) % banners.length), 5000);
    return () => window.clearInterval(id);
  }, [banners.length]);

  const slide = banners[hero % banners.length] ?? banners[0];

  const toggleFav = (id: string) => setFavs((current) => ({ ...current, [id]: !current[id] }));

  return (
    <AppScreen>
      <main className="flex flex-col w-full gap-space-lg pb-28">
        <section className="flex items-center justify-between px-margin pt-space-xs">
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">
              Hello, {firstName} 👋
            </h1>
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors text-left mt-0.5"
            >
              <Icon name="location_on" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md text-text-secondary font-medium">
                {district}, {city}
              </span>
              <Icon name="expand_more" className="text-[16px] text-text-tertiary" />
            </button>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Cart"
              type="button"
              onClick={() => onNavigate('cart')}
              className="relative w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm active:scale-95"
            >
              <Icon name="shopping_bag" className="text-[20px]" />
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-primary-container text-on-primary-container font-caption text-[10px] font-bold flex items-center justify-center leading-none">
                2
              </span>
            </button>
            <button
              aria-label="Notifications"
              type="button"
              onClick={() => onNavigate('notifications')}
              className="relative w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shadow-sm active:scale-95"
            >
              <Icon name="notifications" className="text-[20px]" />
              {bellBadge && (
                <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-error text-on-error font-caption text-[10px] font-bold flex items-center justify-center leading-none">
                  {bellBadge}
                </span>
              )}
            </button>
            <button
              aria-label="Account"
              type="button"
              onClick={() => onTab('account')}
              className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm bg-surface-container-highest active:scale-95 transition-transform"
            >
              <div className="flex h-full w-full items-center justify-center bg-primary-container text-on-primary text-lg font-bold">
                {profileInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-badge-discount-text ring-2 ring-surface" />
            </button>
          </div>
        </section>

        <section className="px-margin">
          <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm">
            <div
              className="relative h-48 w-full overflow-hidden bg-cover bg-center flex flex-col justify-between p-space-md"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/70 to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-space-xs py-1 rounded-full bg-surface-canvas/90 backdrop-blur-md text-on-surface font-caption text-caption font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                  <Icon name="local_fire_department" className="text-tertiary-container text-[14px]" filled />
                  FEATURED CAMPAIGN
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-canvas/80 text-text-primary font-caption text-[11px] font-semibold">
                  {slide.pill}
                </span>
              </div>

              <div className="relative z-10 flex flex-col gap-space-2xs">
                <h2 className="font-heading-md text-heading-md text-on-primary font-bold leading-tight">{slide.title}</h2>
                <p className="font-body-md text-caption text-surface-container-highest line-clamp-1">{slide.subtitle}</p>
                <div className="flex items-center justify-between mt-space-2xs">
                  <button
                    type="button"
                    onClick={() => goToDestination(slide.destination)}
                    className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center gap-1 shadow-md hover:bg-primary transition-colors active:scale-95"
                  >
                    <span>{slide.cta ?? 'Explore Deals'}</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                  <div className="flex items-center gap-1.5 pr-1">
                    {banners.map((item, index) => (
                      <button
                        key={`${item.title}-${index}`}
                        type="button"
                        aria-label={`Slide ${index + 1}`}
                        onClick={() => setHero(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === hero ? 'w-5 bg-surface-canvas' : 'w-1.5 bg-surface-canvas/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">My Activity</h2>
            <span className="font-caption text-caption text-text-tertiary">Real-time sync</span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs">
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary-container mb-space-2xs">
                <Icon name="confirmation_number" className="text-[18px]" />
              </div>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">{publicOffers.length}</span>
              <span className="font-caption text-caption text-text-secondary truncate">Live Deals</span>
            </div>
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary mb-space-2xs">
                <Icon name="receipt_long" className="text-[18px]" />
              </div>
              <span className="font-heading-md text-heading-md text-text-primary font-bold">{orders.length}</span>
              <span className="font-caption text-caption text-text-secondary truncate">Orders</span>
            </div>
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-canvas shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-badge-discount-bg flex items-center justify-center text-badge-discount-text mb-space-2xs">
                <Icon name="calendar_today" className="text-[18px]" />
              </div>
              <span className="font-heading-md text-heading-md text-badge-discount-text font-bold">{appointments.length}</span>
              <span className="font-caption text-caption text-text-secondary truncate">Bookings</span>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-xs">
          <h2 className="font-label-md text-label-md text-text-secondary font-semibold uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-space-xs">
            <button
              type="button"
              onClick={() => onTab('deals')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container mb-1">
                <Icon name="explore" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Explore</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('savings')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed-variant mb-1">
                <Icon name="featured_seasonal_and_gifts" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Rewards</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1">
                <Icon name="qr_code_scanner" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Scan QR</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="flex flex-col items-center justify-center py-space-sm px-1 rounded-xl bg-surface-canvas shadow-sm hover:bg-surface-container-low transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-1">
                <Icon name="history" className="text-[22px]" />
              </div>
              <span className="font-label-sm text-[12px] font-medium text-text-primary truncate w-full">Activity</span>
            </button>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Your Active Deals</h2>
              <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-caption text-[11px] font-bold flex items-center justify-center">
                {publicOffers.length > 0 ? Math.min(publicOffers.length, 2) : 0}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-deals')}
              className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
            >
              View All My Deals
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>

          {publicOffers.length > 0 ? publicOffers.slice(0, 2).map((offer) => {
            const title = getOfferTitle(offer);
            const business = getOfferBusinessName(offer);
            const image = getOfferImage(offer);
            const price = getOfferPrice(offer);
            const original = getOfferComparePrice(offer);
            const discount = original > price ? `${Math.round(((original - price) / original) * 100)}% OFF` : 'Live Deal';
            return (
              <div key={String(offer.id ?? title)} className="rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-xs">
                  <div className="flex gap-space-sm min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                      <img className="w-full h-full object-cover" alt={title} src={image} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption font-semibold text-text-secondary flex items-center gap-1 truncate">
                        <Icon name="storefront" className="text-primary text-[14px]" />
                        {business}
                      </span>
                      <h3 className="font-button-primary text-button-primary text-text-primary truncate">
                        {title}
                      </h3>
                      <span className="font-caption text-caption text-tertiary flex items-center gap-1 mt-0.5 font-medium">
                        <Icon name="timer" className="text-[14px]" />
                        {original > price ? `Save ${formatCurrency(original - price)}` : 'Limited-time offer'}
                      </span>
                    </div>
                  </div>
                  <span className="px-space-xs py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold shrink-0">
                    {discount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-subtle">
                  <div className="flex flex-col">
                    <span className="font-caption text-[10px] text-text-tertiary uppercase tracking-wider">Price</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface tracking-wider">
                      {formatCurrency(price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onShowQR}
                    className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary-container font-button-secondary text-button-secondary flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Icon name="qr_code_2" className="text-[18px]" />
                    <span>Show QR</span>
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-xl bg-surface-canvas p-space-md text-text-secondary shadow-sm">
              Live deals from your area will appear here once the catalogue is available.
            </div>
          )}
        </section>

        <section className="px-margin">
          <div className="relative overflow-hidden rounded-xl bg-surface-canvas shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <Icon name="workspace_premium" className="text-tertiary-container text-[20px]" filled />
                <h2 className="font-heading-sm text-heading-sm text-on-surface">Your Rewards</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center"
              >
                View Rewards
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-surface-subtle p-space-sm rounded-xl">
              <div className="flex flex-col">
                <span className="font-caption text-caption text-text-tertiary">Member Status</span>
                <span className="font-button-primary text-button-primary text-text-primary">
                  {publicOffers.length > 0 ? 'Live local member' : 'Member profile ready'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-caption text-caption text-text-tertiary">Potential Savings</span>
                <span className="font-heading-sm text-heading-sm text-tertiary-container font-bold">
                  {formatCurrency(savedPotential)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-caption text-caption text-text-secondary">
                <span>Live catalogue coverage</span>
                <span className="font-semibold text-text-primary">{publicOffers.length} nearby offers</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full"
                  style={{ width: `${Math.min(100, publicOffers.length * 25)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-space-2xs text-text-secondary">
              <span className="font-caption text-caption flex items-center gap-1">
                <Icon name="redeem" className="text-badge-discount-text text-[16px]" />
                <strong>{Math.max(publicOffers.length, 0)}</strong> live offers in your area
              </span>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="text-primary-container font-label-sm text-label-sm font-semibold hover:underline"
              >
                View
              </button>
            </div>
          </div>
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <SectionHeader title="Recent Activity" action="View Activity" onAction={() => onNavigate('activity')} />
          {recentEvents.length > 0 ? (
            <div className="rounded-xl bg-surface-canvas shadow-sm divide-y divide-border-subtle overflow-hidden">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-space-sm hover:bg-surface-subtle transition-colors">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        event.tone === 'success'
                          ? 'bg-badge-discount-bg text-badge-discount-text'
                          : event.tone === 'primary'
                            ? 'bg-surface-tint-blue text-primary-container'
                            : 'bg-secondary-container text-on-secondary-fixed-variant'
                      }`}
                    >
                      <Icon name={event.icon} className="text-[20px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        {event.label}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        {event.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="font-label-sm text-label-sm font-bold text-badge-discount-text shrink-0">{event.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-surface-canvas p-space-md text-text-secondary shadow-sm">
              No recent orders or bookings yet. Your live activity will appear here once the backend syncs.
            </div>
          )}
        </section>

        <section className="px-margin flex flex-col gap-space-sm">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="font-heading-sm text-heading-sm text-on-surface">Deals You May Like</h2>
              <Icon name="auto_awesome" className="text-primary-container text-[20px]" />
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Based on your visits and dining taste in Apo
            </p>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            {recommendedDeals.length > 0 ? recommendedDeals.map((deal) => (
              <div key={deal.id} className="flex flex-col rounded-xl bg-surface-canvas shadow-sm overflow-hidden group">
                <div className="relative h-28 w-full bg-surface-container overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onTab('deals')}
                    className="block w-full h-full"
                    aria-label={`Open ${deal.business}`}
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={deal.imageAlt}
                      src={deal.image}
                    />
                  </button>
                  <span
                    className={`absolute top-2 left-2 px-space-xs py-0.5 rounded-full font-caption text-[11px] font-bold shadow-sm ${deal.badgeClass}`}
                  >
                    {deal.badge}
                  </span>
                  <button
                    aria-label="Favorite"
                    type="button"
                    onClick={() => toggleFav(deal.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-canvas/90 backdrop-blur-sm flex items-center justify-center text-on-surface shadow-sm"
                  >
                    <Icon name={favs[deal.id] ? 'favorite' : 'favorite_border'} className="text-[16px]" filled />
                  </button>
                </div>
                <div className="p-space-xs flex flex-col flex-grow justify-between gap-space-2xs">
                  <div>
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Icon name="location_on" className="text-[12px] text-primary" />
                      <span className="font-caption text-[11px] truncate">{deal.distance}</span>
                    </div>
                    <h3 className="font-button-secondary text-button-secondary text-text-primary font-semibold truncate mt-0.5">
                      {deal.business}
                    </h3>
                    <p className="font-caption text-caption text-text-secondary line-clamp-1">{deal.item}</p>
                  </div>
                  <div className="flex items-center justify-between pt-space-2xs">
                    <div className="flex items-baseline gap-1">
                      <span className="font-button-primary text-button-primary text-text-primary">{deal.price}</span>
                      <span className="font-caption text-[11px] text-text-tertiary line-through">{deal.was}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onTab('deals')}
                      aria-label={`Add ${deal.business} deal`}
                      className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary-container flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 rounded-xl bg-surface-canvas p-space-md text-center text-text-secondary shadow-sm">
                Live deals will appear here once the catalogue is available.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onTab('deals')}
            className="w-full h-12 rounded-xl bg-surface-canvas text-primary-container font-button-primary text-button-primary flex items-center justify-center gap-1.5 shadow-sm hover:bg-surface-container-low transition-colors mt-space-xs active:scale-[0.99]"
          >
            <span>Explore More Deals in Apo</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>

        <section className="px-margin pt-space-xs">
          <div className="p-space-md rounded-2xl bg-surface-subtle flex flex-col items-center text-center">
            <div className="flex items-center gap-space-2xs text-text-secondary">
              <Icon name="storefront" className="text-[18px]" />
              <span className="font-label-md text-label-md">
                Own a Business in {district}, {city}?
              </span>
            </div>
            <p className="mt-1 font-caption text-caption text-text-secondary">Switch to a business account.</p>
            <button
              type="button"
              onClick={onStartBusinessSignup}
              className="mt-space-2xs text-primary-container font-label-md text-label-md font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <span>Get Started</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </section>

        <div className="px-margin flex flex-col items-center justify-center gap-1 text-center mt-2">
          <div className="flex items-center gap-1 text-text-tertiary">
            <Icon name="verified_user" className="text-[14px] text-primary" />
            <span className="font-caption text-caption">VEMTAP Verified Local Guarantee</span>
          </div>
          <span className="font-caption text-[11px] text-text-tertiary">One Tap. Lifetime Customer.</span>
        </div>
      </main>

      <LocationRadiusModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onApply={setLocation}
        district={district}
        radius={radius}
      />
      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
