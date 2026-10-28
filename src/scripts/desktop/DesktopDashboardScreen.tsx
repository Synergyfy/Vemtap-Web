import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { AnnouncementBanner } from '../../components/AnnouncementBanner';
import { useBooking } from '../../context/BookingContext';
import { useLocation, useLocationQuery } from '../../context/LocationContext';
import { useOrders } from '../../context/OrdersContext';
import { useProfile } from '../../context/ProfileContext';
import { hasApiConfig } from '../../services/api/client';
import { catalogueService } from '../../services/catalogueService';
import type { AnnouncementDestination } from '../../scripts/announcementsData';

interface DesktopDashboardScreenProps {
  onNav: (key: DesktopNavKey) => void;
  /** Opens the business account-choice flow ("Continue with this account" / "Use a new account"). */
  onStartBusinessSignup: () => void;
}

const SHORTCUTS = [
  { icon: 'confirmation_number', label: 'My Deals & Vouchers', iconBg: 'bg-surface-tint-blue text-primary', trail: 'dot' as const, target: 'my-deals' as DesktopNavKey },
  { icon: 'receipt_long', label: 'Orders & Bookings', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'text' as const, trailText: '1 Active', target: 'orders' as DesktopNavKey },
  { icon: 'bookmark', label: 'Saved Items & Stores', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'text' as const, trailText: '14', target: 'cart' as DesktopNavKey },
  { icon: 'chat', label: 'Merchant In-App Chats', iconBg: 'bg-badge-discount-bg text-badge-discount-text', trail: 'badge' as const, trailText: '2 new', target: 'messages' as DesktopNavKey },
  { icon: 'manage_accounts', label: 'Account & Security', iconBg: 'bg-surface-subtle text-text-secondary', trail: 'chevron' as const, target: 'account-settings' as DesktopNavKey },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80';

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
  const image = offer.image ?? offer.coverImage ?? offer.heroImage ?? offer.mediaUrl ?? item?.image ?? item?.mainImage ?? item?.coverImage ?? FALLBACK_IMAGE;
  return typeof image === 'string' && image.trim() ? image : FALLBACK_IMAGE;
};

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

const toCuratedDeal = (offer: Record<string, unknown>) => {
  const title = getOfferTitle(offer);
  const business = getOfferBusinessName(offer);
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);
  return {
    name: business,
    desc: title,
    price: formatCurrency(price),
    discount: comparePrice > price ? `${Math.round(((comparePrice - price) / comparePrice) * 100)}%` : 'Live',
    image: getOfferImage(offer),
    alt: `${title} by ${business}`,
  };
};

const toActiveDeal = (offer: Record<string, unknown>) => {
  const title = getOfferTitle(offer);
  const business = getOfferBusinessName(offer);
  const price = getOfferPrice(offer);
  const comparePrice = getOfferComparePrice(offer);
  const discountValue = Math.max(comparePrice - price, 0);
  return {
    badge: price > 0 ? `${Math.round(((comparePrice - price) / comparePrice) * 100) || 1}% OFF` : 'Live Deal',
    distance: typeof offer.distance === 'string' && offer.distance.trim() ? offer.distance : 'Nearby',
    category: business,
    title,
    validity: 'Valid today',
    validityClass: 'bg-surface-tint-blue text-primary',
    validityIcon: 'timer',
    desc: getOfferDescription(offer),
    price: formatCurrency(price),
    oldPrice: comparePrice > price ? formatCurrency(comparePrice) : '',
    save: discountValue > 0 ? `Save ${formatCurrency(discountValue)}` : 'Limited-time offer',
    id: `ID: ${String(offer.id ?? title)}`,
    secondAction: 'Contact Business',
    secondIcon: 'chat',
    image: getOfferImage(offer),
    alt: `${title} by ${business}`,
  };
};

export function DesktopDashboardScreen({ onNav, onStartBusinessSignup }: DesktopDashboardScreenProps) {
  const { fullName } = useProfile();
  const { district, city } = useLocation();
  const { orders } = useOrders();
  const { appointments } = useBooking();
  const [publicOffers, setPublicOffers] = useState<Record<string, unknown>[]>([]);
  const firstName = fullName.trim().split(/\s+/)[0] || 'there';

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

  const curatedDeals = useMemo(() => publicOffers.slice(0, 2).map(toCuratedDeal), [publicOffers]);
  const activeDeals = useMemo(() => publicOffers.slice(0, 2).map(toActiveDeal), [publicOffers]);
  const activeDealCount = publicOffers.length;
  const savingsEstimate = publicOffers.reduce((sum, offer) => {
    const price = getOfferPrice(offer);
    const compare = getOfferComparePrice(offer);
    return sum + Math.max(compare - price, 0);
  }, 0);
  const stats = useMemo(
    () => [
      {
        label: 'Live Deals',
        value: String(activeDealCount),
        suffix: activeDealCount === 1 ? 'Nearby offer' : 'Ready to redeem',
        suffixClass: 'text-badge-discount-text',
        note: 'with current partner catalogue',
        noteStrong: formatCurrency(savingsEstimate),
        noteIcon: 'savings',
        noteIconClass: 'text-badge-discount-text',
        icon: 'local_offer',
        iconBg: 'bg-surface-tint-blue text-primary',
        bubble: 'bg-surface-tint-blue opacity-60',
      },
      {
        label: 'Saved Potential',
        value: formatCurrency(savingsEstimate),
        suffix: '',
        suffixClass: '',
        note: 'based on active nearby offers',
        noteStrong: '',
        noteIcon: 'storefront',
        noteIconClass: 'text-primary',
        icon: 'account_balance_wallet',
        iconBg: 'bg-badge-discount-bg text-badge-discount-text',
        bubble: 'bg-badge-discount-bg opacity-70',
      },
      {
        label: 'Bookings',
        value: String(appointments.length),
        suffix: appointments.length === 1 ? 'Scheduled' : 'Active',
        suffixClass: 'text-primary',
        note: appointments.length > 0 ? 'Latest appointment in your account' : 'No bookings yet',
        noteStrong: '',
        noteIcon: '',
        noteIconClass: '',
        icon: 'calendar_today',
        iconBg: 'bg-surface-container text-primary',
        bubble: 'bg-surface-container-high opacity-60',
      },
      {
        label: 'Orders',
        value: String(orders.length),
        suffix: orders.length === 1 ? 'Order' : 'Orders',
        suffixClass: 'text-text-secondary',
        note: orders.length > 0 ? 'Across your purchase history' : 'No recent order activity',
        noteStrong: '',
        noteIcon: '',
        noteIconClass: '',
        icon: 'receipt_long',
        iconBg: 'bg-surface-subtle text-text-secondary',
        bubble: 'bg-surface-container-high opacity-60',
      },
    ],
    [activeDealCount, savingsEstimate, appointments.length, orders.length],
  );

  const handleAnnouncementNavigate = (destination: AnnouncementDestination) => {
    switch (destination) {
      case 'deals':
        onNav('deals');
        break;
      case 'featured':
        onNav('exclusive-deals');
        break;
      case 'my-deals':
        onNav('my-deals');
        break;
      case 'orders':
        onNav('orders');
        break;
      case 'saved':
        onNav('cart');
        break;
      case 'subscription':
        onNav('for-business');
        break;
      case 'dashboard':
      case 'notifications':
      default:
        onNav('dashboard');
        break;
    }
  };

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="dashboard" withCustomerRail>
      <div className="w-full bg-surface-canvas pb-14">
        <div className="w-full bg-surface-subtle pb-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="pt-6 pb-2 flex items-center justify-between">
              <nav className="flex items-center gap-2 text-text-tertiary font-caption text-caption">
                <button
                  className="hover:text-primary transition-colors"
                  onClick={() => onNav('discover')}
                  type="button"
                >
                  VEMTAP
                </button>
                <span>/</span>
                <span className="text-text-primary font-medium">Customer Dashboard</span>
              </nav>
              <div className="hidden sm:flex items-center gap-2 bg-surface-canvas px-3 py-1.5 rounded-full shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
                <span className="font-caption text-caption text-text-secondary">
                  Connected to Apo NFC Grid Node • 0.3ms latency
                </span>
              </div>
            </div>

            <section className="mt-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-surface-tint-blue text-primary font-label-sm text-label-sm px-3 py-1 rounded-full font-semibold">
                  <Icon name="verified" className="text-[16px]" />
                  <span>VEMTAP Elite Consumer Tier</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                  Hello, {firstName} 👋
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  Here is your neighborhood activity, active deals, and saved spots in {district}, {city}.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-canvas hover:bg-surface text-text-primary font-label-md text-label-md shadow-sm transition-all"
                  type="button"
                >
                  <Icon name="qr_code_scanner" className="text-[18px] text-text-secondary" />
                  <span>Tap to Scan POS</span>
                </button>
                <button
                  onClick={() => onNav('deals')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary shadow-md hover:shadow-lg transition-all"
                  type="button"
                >
                  <Icon name="explore" className="text-[18px]" />
                  <span>Explore Apo Deals</span>
                </button>
              </div>
            </section>

            <AnnouncementBanner className="mb-10" onNavigate={handleAnnouncementNavigate} />

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-surface-canvas rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div
                    className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full group-hover:scale-110 transition-transform ${stat.bubble}`}
                  />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                        {stat.label}
                      </span>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                        <Icon name={stat.icon} className="text-[20px]" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display-hero text-display-hero text-text-primary">{stat.value}</span>
                        {stat.suffix && (
                          <span className={`font-label-md text-label-md font-semibold ${stat.suffixClass}`}>
                            {stat.suffix}
                          </span>
                        )}
                      </div>
                      <p className="font-caption text-caption text-text-secondary mt-1 flex items-center gap-1.5">
                        {stat.noteIcon && (
                          <Icon name={stat.noteIcon} className={`text-[14px] ${stat.noteIconClass}`} />
                        )}
                        <span>
                          {stat.noteStrong && <strong>{stat.noteStrong}</strong>}
                          {stat.noteStrong ? ' ' : ''}
                          {stat.note}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 flex flex-col gap-10 min-w-0">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="verified_user" className="text-primary text-[24px]" />
                      <h2 className="font-heading-lg text-heading-lg text-text-primary">Active Deals &amp; Passes</h2>
                      <span className="px-2.5 py-0.5 bg-primary-container text-on-primary font-caption text-caption rounded-full font-bold ml-2">
                        2 ACTIVE
                      </span>
                    </div>
                    <button
                      onClick={() => onNav('my-deals')}
                      className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>Browse All Vouchers</span>
                      <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                  {activeDeals.length > 0 ? activeDeals.map((deal) => (
                    <div
                      key={deal.title}
                      className="bg-surface-canvas rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                    >
                      <div className="md:w-52 h-44 rounded-lg overflow-hidden shrink-0 relative">
                        <img alt={deal.alt} className="w-full h-full object-cover" src={deal.image} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded-md shadow-sm">
                          {deal.badge}
                        </span>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-inverse-surface/80 backdrop-blur-sm text-surface-canvas font-caption text-caption rounded">
                          {deal.distance}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <span className="font-caption text-caption text-text-tertiary uppercase tracking-wider font-semibold">
                                {deal.category}
                              </span>
                              <h3 className="font-heading-md text-heading-md text-text-primary">{deal.title}</h3>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-caption text-caption font-semibold rounded ${deal.validityClass}`}
                            >
                              <Icon name={deal.validityIcon} className="text-[14px]" />
                              <span>{deal.validity}</span>
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-text-secondary mb-3">{deal.desc}</p>
                          <div className="flex items-center gap-4 font-label-md text-label-md mb-4">
                            <span className="text-text-primary font-bold text-heading-sm">{deal.price}</span>
                            <span className="text-text-tertiary line-through font-caption text-caption">
                              {deal.oldPrice}
                            </span>
                            <span className="text-badge-discount-text font-caption text-caption font-semibold bg-badge-discount-bg px-2 py-0.5 rounded">
                              {deal.save}
                            </span>
                            <span className="text-text-tertiary text-caption font-mono">{deal.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 pt-3 border-t border-surface-subtle">
                          <button
                            onClick={() => onNav('my-deals')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                            type="button"
                          >
                            <Icon name="qr_code_2" className="text-[18px]" />
                            <span>View Voucher QR Pass</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors"
                            type="button"
                          >
                            <Icon name={deal.secondIcon} className="text-[18px] text-text-secondary" />
                            <span>{deal.secondAction}</span>
                          </button>
                          <button
                            aria-label="Share Deal"
                            className="ml-auto p-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-secondary"
                            type="button"
                          >
                            <Icon name="share" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl bg-surface-canvas p-6 text-text-secondary shadow-sm">
                      Active vouchers will appear here when the partner catalogue is live.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="history" className="text-primary text-[24px]" />
                      <h2 className="font-heading-lg text-heading-lg text-text-primary">
                        Recent Orders &amp; Bookings
                      </h2>
                    </div>
                    <button
                      onClick={() => onNav('orders')}
                      className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <span>Full Ledger History</span>
                      <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>

                  {appointments.length === 0 && orders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border-subtle bg-surface-canvas p-6 text-center shadow-sm">
                      <p className="font-heading-sm text-heading-sm text-text-primary mb-1">No recent activity</p>
                      <p className="font-body-md text-body-md text-text-secondary">
                        Your live orders and bookings will appear here once the backend starts returning your account activity.
                      </p>
                    </div>
                  ) : (
                    <>
                      {appointments.slice(0, 1).map((appointment) => (
                        <div key={appointment.ref} className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container" />
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-12 h-12 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary shrink-0">
                              <Icon name="spa" className="text-[26px]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-tint-blue text-primary font-caption text-caption font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span>UPCOMING APPOINTMENT</span>
                                </span>
                                <span className="font-caption text-caption text-text-tertiary">• Booking #{appointment.ref}</span>
                              </div>
                              <h3 className="font-heading-sm text-heading-sm text-text-primary">{appointment.merchantName || 'Booked service'}</h3>
                              <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                                {appointment.serviceNames.join(' & ') || 'Service booking'}
                              </p>
                              <p className="font-caption text-caption text-text-tertiary mt-0.5 flex items-center gap-1.5">
                                <Icon name="schedule" className="text-[14px]" />
                                <span>{appointment.dateShort || appointment.dateLong || 'Schedule pending'} • {appointment.time || 'Time pending'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-semibold rounded-full">
                              <Icon name="check_circle" className="text-[14px]" />
                              <span>{appointment.status === 'confirmed' ? 'Confirmed by Host' : appointment.status}</span>
                            </span>
                            <button
                              onClick={() => onNav('spa-storefront')}
                              className="w-full md:w-auto px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors text-center"
                              type="button"
                            >
                              View Booking Details
                            </button>
                          </div>
                        </div>
                      ))}

                      {orders.slice(0, 1).map((order) => (
                        <div key={order.ref} className="bg-surface-canvas rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-badge-discount-text" />
                          <div className="flex items-start gap-4 pl-1">
                            <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center text-text-secondary shrink-0">
                              <Icon name="restaurant" className="text-[26px]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-text-secondary font-caption text-caption font-bold">
                                  {order.fulfillment === 'delivery' ? 'DELIVERY ORDER' : 'IN-STORE NFC TAP'}
                                </span>
                                <span className="font-caption text-caption text-text-tertiary">• {new Date(order.submittedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                              <h3 className="font-heading-sm text-heading-sm text-text-primary">{order.merchantName}</h3>
                              <p className="font-body-md text-body-md text-text-secondary mt-0.5">
                                {order.lines.slice(0, 2).map((line) => line.name).join(', ') || 'Order items pending'}
                              </p>
                              <p className="font-caption text-caption text-badge-discount-text mt-0.5 flex items-center gap-1.5 font-medium">
                                <Icon name="loyalty" className="text-[14px]" />
                                <span>{order.paymentStatus === 'verified' ? 'Payment verified' : order.paymentStatus}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                            <span className="font-heading-sm text-heading-sm text-text-primary font-bold">{formatCurrency(order.total)}</span>
                            <button
                              onClick={() => onNav('orders')}
                              className="w-full md:w-auto px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface text-text-primary font-label-md text-label-md transition-colors text-center"
                              type="button"
                            >
                              Reorder / View Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon name="near_me" className="text-primary text-[22px]" />
                      <h3 className="font-heading-md text-heading-md text-text-primary">Apo Active Partner Radar</h3>
                    </div>
                    <span className="font-caption text-caption text-text-secondary">Radius: 5.0 km</span>
                  </div>
                  <div className="w-full h-56 rounded-xl bg-surface-subtle relative overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center p-6 bg-surface-canvas/90 backdrop-blur-md rounded-xl shadow-lg max-w-sm">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-1 shadow-md">
                        <Icon name="explore" className="text-[20px]" />
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">
                        18 Local Merchants Active Near You
                      </h4>
                      <p className="font-caption text-caption text-text-secondary mt-1">
                        Instant Tap savings enabled across Apo Resettlement, Legislative Zone &amp; Durumi Axis.
                      </p>
                      <button
                        onClick={() => onNav('discover')}
                        className="mt-3 px-4 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-sm text-label-sm font-semibold transition-colors"
                        type="button"
                      >
                        Open Interactive Map View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary mb-4">Quick Shortcuts</h3>
                  <div className="flex flex-col gap-1.5">
                    {SHORTCUTS.map((shortcut) => (
                      <button
                        key={shortcut.label}
                        onClick={() => onNav(shortcut.target)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle transition-colors group text-left w-full"
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${shortcut.iconBg}`}
                          >
                            <Icon name={shortcut.icon} className="text-[20px]" />
                          </div>
                          <span className="font-label-md text-label-md text-text-primary font-medium">
                            {shortcut.label}
                          </span>
                        </div>
                        {shortcut.trail === 'dot' && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        {shortcut.trail === 'text' && (
                          <span className="font-caption text-caption text-text-tertiary">{shortcut.trailText}</span>
                        )}
                        {shortcut.trail === 'badge' && (
                          <span className="px-2 py-0.5 bg-primary text-on-primary font-caption text-caption font-bold rounded-full">
                            {shortcut.trailText}
                          </span>
                        )}
                        {shortcut.trail === 'chevron' && (
                          <Icon name="chevron_right" className="text-text-tertiary text-[18px]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name="auto_awesome" className="text-tertiary-container text-[20px]" />
                      <h3 className="font-heading-sm text-heading-sm text-text-primary">Curated For You</h3>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">Based on your taste</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {curatedDeals.length > 0 ? curatedDeals.map((item) => (
                      <div
                        key={item.name}
                        className="flex gap-3 group cursor-pointer hover:bg-surface-subtle p-2 rounded-xl transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                          <img alt={item.alt} className="w-full h-full object-cover" src={item.image} />
                          <span className="absolute top-1 left-1 px-1 bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold rounded">
                            {item.discount}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="font-label-md text-label-md text-text-primary font-semibold truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <p className="font-caption text-caption text-text-secondary truncate mt-0.5">{item.desc}</p>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-label-md text-label-md text-text-primary font-bold">{item.price}</span>
                            <button
                              onClick={() => onNav('deal-detail')}
                              className="text-primary font-label-sm text-label-sm font-semibold hover:underline"
                              type="button"
                            >
                              View Deal →
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl bg-surface-subtle p-3 text-text-secondary text-caption">
                        Curated recommendations will sync here when the live catalog is ready.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-surface-tint-blue rounded-xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                        <Icon name="verified_user" className="text-[18px]" />
                      </div>
                      <h4 className="font-heading-sm text-heading-sm text-text-primary">VEMTAP Buyer Guarantee</h4>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary">
                      All vouchers redeemed via VEMTAP are covered by our 100% merchant fulfillment promise. Instant
                      dispute resolution available 24/7.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1.5"
                        type="button"
                      >
                        <span>Learn how you are protected</span>
                        <Icon name="arrow_forward" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 text-center">
                  <p className="font-caption text-caption text-text-tertiary">
                    Own a Business in {district}, {city}?
                  </p>
                  <p className="mt-1.5 font-label-md text-label-md text-text-secondary">
                    Switch to a business account.
                  </p>
                  <button
                    onClick={onStartBusinessSignup}
                    className="mt-1 font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1.5"
                    type="button"
                  >
                    <span>Get Started</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
