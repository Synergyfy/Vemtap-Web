import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useBusinessOfferings } from '../../context/BusinessOfferingsContext';
import { useBusinessFeatures } from '../../context/BusinessFeaturesContext';
import { getEnabledQuickActions, type FeatureId, type QuickActionKey } from '../businessFeatures';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { BusinessQrScannerModal } from '../../components/BusinessQrScannerModal';

interface DesktopBusinessOverviewScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onSubscribe?: () => void;
  onBoost?: () => void;
  onAddOns?: () => void;
  onOpenOrders?: () => void;
  onOpenBookings?: () => void;
  onOpenMessages?: () => void;
  /** Opens a dashboard tool by feature id — powers the generated quick actions. */
  onOpenFeature: (feature: FeatureId | 'qr-scanner') => void;
}

const RECENT_ORDERS = [
  { id: '#VG-94021', customer: 'Amina Bello', amount: '₦34,500', status: 'New', statusClass: 'bg-primary-container text-on-primary' },
  { id: '#POS-1049', customer: 'Walk-In Guest', amount: '₦11,200', status: 'Kitchen', statusClass: 'bg-surface-container text-secondary' },
];

const RECENT_MESSAGES = [
  { name: 'Sarah Adams', preview: 'Is the 20% lunch combo still available today?', time: '10:42 AM', unread: true },
  { name: 'Michael James', preview: 'You: Your order is packed and ready!', time: '9:24 AM', unread: false },
];

export function DesktopBusinessOverviewScreen({
  onNav,
  onSubscribe,
  onBoost,
  onAddOns: _onAddOns,
  onOpenOrders,
  onOpenBookings,
  onOpenMessages,
  onOpenFeature,
}: DesktopBusinessOverviewScreenProps) {
  const { branch } = useBusinessBranch();
  const { mode } = useBusinessOfferings();
  const { features } = useBusinessFeatures();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Quick actions come straight from the saved feature configuration.
  const quickActions = getEnabledQuickActions((id) => Boolean(features[id]));
  const hasMessaging = Boolean(features.chat || features.sms || features.email);

  const handleQuickAction = (feature: QuickActionKey) => {
    if (feature === 'qr-scanner') {
      setQrScannerOpen(true);
      return;
    }
    onOpenFeature(feature as FeatureId);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % 2), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = branch.stats;

  const todayStats = [
    ...(features.pos
      ? [
          {
            icon: 'receipt_long',
            iconBox: 'bg-surface-tint-blue text-primary',
            label: 'Orders Today',
            value: stats.orders,
            note: 'Live count',
            onClick: onOpenOrders,
          },
          {
            icon: 'payments',
            iconBox: 'bg-badge-discount-bg text-badge-discount-text',
            label: 'Revenue Today',
            value: stats.revenue,
            note: stats.revenueDelta,
            onClick: onOpenOrders,
          },
        ]
      : []),
    ...(features.bookings
      ? [
          {
            icon: 'calendar_month',
            iconBox: 'bg-tertiary-fixed text-tertiary',
            label: 'Bookings',
            value: stats.bookings,
            note: 'Next in 35 mins',
            onClick: onOpenBookings ?? onOpenOrders,
          },
        ]
      : []),
    ...(hasMessaging
      ? [
          {
            icon: 'chat_bubble',
            iconBox: 'bg-secondary-container text-on-secondary-container',
            label: 'Unread Messages',
            value: stats.unread,
            note: 'Open inquiries',
            onClick: onOpenMessages,
          },
        ]
      : []),
  ];

  const banners = [
    {
      key: 'growth',
      gradient: 'from-primary to-primary-container',
      icon: 'trending_up',
      title: 'Reach 3.4x more shoppers with Growth',
      sub: 'Priority pins, verified badge & hyperlocal broadcast.',
      cta: 'Subscribe',
      onCta: onSubscribe,
    },
    {
      key: 'boost',
      gradient: 'from-tertiary-container to-tertiary-fixed',
      icon: 'rocket_launch',
      title: 'Boost any deal from ₦500/day',
      sub: 'Pin a deal to the top of neighborhood discovery.',
      cta: 'Boost Now',
      onCta: onBoost,
    },
  ];

  const banner = banners[bannerIndex];

  return (
    <BusinessPortalChrome activeNav="overview" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-xl">
          {/* Greeting & Branch */}
          <section className="flex items-center justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                Friday, Oct 18 • {branch.area}
              </span>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight truncate">
                Good afternoon, Urban Grill
              </h1>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="verified" filled className="text-[13px]" />
                  Verified
                </span>
                {mode === 'products' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold tracking-wider">
                    <Icon name="inventory_2" className="text-[13px]" />
                    PRODUCT BUSINESS
                  </span>
                ) : mode === 'services' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-caption text-caption font-bold tracking-wider">
                    <Icon name="content_cut" className="text-[13px]" />
                    SERVICE BUSINESS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-bold tracking-wider">
                    <Icon name="hub" className="text-[13px]" />
                    HYBRID BUSINESS
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-medium">
                  Growth Trial • 23 days left
                </span>
              </div>
            </div>
          </section>

          {/* Banner Carousel */}
          <section>
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.gradient} p-4 shadow-md`}>
              <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                    <Icon name={banner.icon} filled className="text-[22px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-bold text-white truncate">{banner.title}</p>
                    <p className="font-caption text-caption text-white/80 truncate">{banner.sub}</p>
                  </div>
                </div>
                <button
                  className="h-9 px-space-md rounded-full bg-surface-canvas text-primary font-label-sm text-label-sm font-bold shadow-sm hover:scale-[1.03] active:scale-95 transition-transform shrink-0"
                  type="button"
                  onClick={banner.onCta}
                >
                  {banner.cta}
                </button>
              </div>
              <div className="relative z-10 flex items-center gap-1.5 mt-3">
                {banners.map((slide, index) => (
                  <button
                    aria-label={`Banner ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === bannerIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                    key={slide.key}
                    type="button"
                    onClick={() => setBannerIndex(index)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Main desktop grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            {/* Wide column: stats + quick actions */}
            <div className="xl:col-span-8 space-y-space-md">
              {/* Today's Stats */}
              {todayStats.length > 0 && (
              <section className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
                {todayStats.map((stat) => (
                  <button
                    className={`bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left hover:scale-[1.01] active:scale-[0.98] transition-transform ${
                      todayStats.length === 1 ? 'col-span-2 md:col-span-1' : ''
                    }`}
                    key={stat.label}
                    type="button"
                    onClick={stat.onClick}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBox}`}>
                      <Icon name={stat.icon} className="text-[20px]" />
                    </div>
                    <span className="font-caption text-caption text-text-secondary">{stat.label}</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">{stat.value}</span>
                      <span className="font-caption text-caption text-text-tertiary">{stat.note}</span>
                    </div>
                  </button>
                ))}
              </section>
              )}

              {/* Quick Actions — clean grid limited to max 4 actions */}
              {quickActions.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-md text-label-md font-bold text-text-primary">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs">
                  {quickActions.slice(0, 5).map((action) => (
                    <button
                      className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1.5 text-left hover:scale-[1.01] active:scale-[0.98] transition-transform cursor-pointer border border-border-subtle/40"
                      type="button"
                      key={action.feature}
                      onClick={() => handleQuickAction(action.feature)}
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                        <Icon name={action.icon} className="text-[20px]" />
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-text-primary truncate">
                        {action.label}
                      </span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        {action.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              )}
            </div>

            {/* Narrow column: recent activity */}
            <div className="xl:col-span-4 space-y-space-md">
              {/* Recent Orders */}
              {features.pos && (
              <section>
                <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="receipt_long" className="text-primary text-[18px]" />
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">Recent Orders</h3>
                    </div>
                    <button
                      className="font-label-sm text-label-sm text-primary font-semibold flex items-center hover:opacity-80 transition-opacity"
                      type="button"
                      onClick={onOpenOrders ?? (() => onNav('orders'))}
                    >
                      View all <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {RECENT_ORDERS.map((order) => (
                      <button
                        className="flex items-center justify-between gap-2 bg-surface-subtle rounded-lg px-3 py-2 text-left hover:scale-[0.99] active:scale-[0.99] transition-transform"
                        key={order.id}
                        type="button"
                        onClick={onOpenOrders ?? (() => onNav('orders'))}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary shrink-0">
                            {order.id}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate">{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${order.statusClass}`}>
                            {order.status}
                          </span>
                          <span className="font-label-sm text-label-sm font-semibold text-text-primary">{order.amount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              )}

              {/* Recent Messages */}
              {hasMessaging && (
              <section>
                <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="chat_bubble" className="text-primary text-[18px]" />
                      <h3 className="font-label-md text-label-md font-semibold text-text-primary">Recent Messages</h3>
                    </div>
                    <button
                      className="font-label-sm text-label-sm text-primary font-semibold flex items-center hover:opacity-80 transition-opacity"
                      type="button"
                      onClick={onOpenMessages ?? (() => onNav('messages'))}
                    >
                      View all <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {RECENT_MESSAGES.map((message) => (
                      <button
                        className="flex items-center justify-between gap-2 bg-surface-subtle rounded-lg px-3 py-2 text-left hover:scale-[0.99] active:scale-[0.99] transition-transform"
                        key={message.name}
                        type="button"
                        onClick={onOpenMessages ?? (() => onNav('messages'))}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-label-sm text-label-sm truncate ${
                                message.unread ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'
                              }`}
                            >
                              {message.name}
                            </span>
                            {message.unread && <span className="w-2 h-2 rounded-full bg-primary-container" />}
                          </div>
                          <span className="font-caption text-caption text-text-secondary truncate">{message.preview}</span>
                        </div>
                        <span className="font-caption text-caption text-text-tertiary shrink-0">{message.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              )}
            </div>
          </div>
        </div>
      </div>
      <BusinessQrScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onOpenOrder={onOpenOrders}
        onOpenDeals={() => onOpenFeature('deals')}
        onOpenLoyalty={() => onOpenFeature('loyalty')}
      />
    </BusinessPortalChrome>
  );
}
