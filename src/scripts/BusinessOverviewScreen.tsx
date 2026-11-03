import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessModeHeader } from './BusinessModeHeader';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';
import { useBusinessFeatures } from '../context/BusinessFeaturesContext';
import { getEnabledQuickActions, type FeatureId } from './businessFeatures';

interface BusinessOverviewScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onSubscribe: () => void;
  onBoost: () => void;
  onAddOns: () => void;
  onOpenOrders: () => void;
  onOpenBookings: () => void;
  onOpenMessages: () => void;
  /** Opens the POS menu page (Point of Sale + Store Front pages). */
  onOpenPosMenu: () => void;
  /** Opens a dashboard tool by feature id — powers the generated quick actions. */
  onOpenFeature: (feature: FeatureId) => void;
}

const RECENT_ORDERS = [
  { id: '#VG-94021', customer: 'Amina Bello', amount: '₦34,500', status: 'New', statusClass: 'bg-primary-container text-on-primary' },
  { id: '#POS-1049', customer: 'Walk-In Guest', amount: '₦11,200', status: 'Kitchen', statusClass: 'bg-surface-container text-secondary' },
];

const RECENT_MESSAGES = [
  { name: 'Sarah Adams', preview: 'Is the 20% lunch combo still available today?', time: '10:42 AM', unread: true },
  { name: 'Michael James', preview: 'You: Your order is packed and ready!', time: '9:24 AM', unread: false },
];

export function BusinessOverviewScreen({
  onTab,
  onSubscribe,
  onBoost,
  onAddOns: _onAddOns,
  onOpenOrders,
  onOpenBookings,
  onOpenMessages,
  onOpenPosMenu: _onOpenPosMenu,
  onOpenFeature,
}: BusinessOverviewScreenProps) {
  const { branch } = useBusinessBranch();
  const { mode } = useBusinessOfferings();
  const { features } = useBusinessFeatures();
  const [bannerIndex, setBannerIndex] = useState(0);

  // Quick actions come straight from the saved feature configuration.
  const quickActions = getEnabledQuickActions((id) => Boolean(features[id]));
  const hasMessaging = Boolean(features.chat || features.sms || features.email);

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
            onClick: onOpenBookings,
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
    <div className="biz-flow">
      <AppScreen>
        <BusinessModeHeader title="Overview" />
        <div className="flex flex-col w-full flex-1 pb-24">
          {/* Greeting & Branch */}
          <div className="px-margin pt-space-sm flex items-center justify-between gap-space-sm">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                Friday, Oct 18 • {branch.area}
              </span>
              <h2 className="font-heading-md text-heading-md text-text-primary truncate">Good afternoon, Urban Grill</h2>
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
          </div>

          {/* Banner Carousel */}
          <div className="px-margin pt-space-sm">
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.gradient} p-4 shadow-md`}
            >
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
                  className="h-9 px-space-md rounded-full bg-surface-canvas text-primary font-label-sm text-label-sm font-bold shadow-sm active:scale-95 transition-transform shrink-0"
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
          </div>

          {/* Branch Stats — single line display */}
          {todayStats.length > 0 && (
            <div className="px-margin mt-space-md">
              <div
                className={`grid gap-2 ${
                  todayStats.length === 1
                    ? 'grid-cols-1'
                    : todayStats.length === 2
                    ? 'grid-cols-2'
                    : todayStats.length === 3
                    ? 'grid-cols-3'
                    : 'grid-flow-col auto-cols-[minmax(105px,1fr)] overflow-x-auto no-scrollbar'
                }`}
              >
                {todayStats.map((stat) => (
                  <button
                    className="bg-surface-canvas rounded-xl p-2.5 shadow-sm flex flex-col gap-1 text-left active:scale-[0.98] transition-transform min-w-0"
                    key={stat.label}
                    type="button"
                    onClick={stat.onClick}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBox}`}>
                      <Icon name={stat.icon} className="text-[17px]" />
                    </div>
                    <span className="font-caption text-[11px] leading-tight text-text-secondary truncate w-full">
                      {stat.label}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading-sm text-[15px] leading-tight font-bold text-text-primary truncate">
                        {stat.value}
                      </span>
                      <span className="font-caption text-[10px] text-text-tertiary truncate">{stat.note}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions — horizontal sliding row (max 4 actions, 3-4 visible on row) */}
          {quickActions.length > 0 && (
            <div className="px-margin mt-space-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-label-md text-label-md font-bold text-text-primary">Quick Actions</h3>
                {quickActions.length > 3 && (
                  <span className="font-caption text-[11px] text-text-tertiary">Swipe</span>
                )}
              </div>
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 no-scrollbar snap-x">
                {quickActions.slice(0, 4).map((action) => (
                  <button
                    key={action.feature}
                    type="button"
                    onClick={() => onOpenFeature(action.feature)}
                    className="snap-start shrink-0 w-[86px] sm:w-[94px] bg-surface-canvas rounded-xl p-2.5 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition-transform hover:shadow-md border border-border-subtle/40"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={action.icon} className="text-[20px]" />
                    </div>
                    <span className="font-label-sm text-[11px] font-semibold text-text-primary line-clamp-1 w-full text-center">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {features.pos && (
          <div className="px-margin mt-space-sm">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="receipt_long" className="text-primary text-[18px]" />
                  <h3 className="font-label-md text-label-md font-semibold text-text-primary">Recent Orders</h3>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold flex items-center"
                  type="button"
                  onClick={onOpenOrders}
                >
                  View all <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {RECENT_ORDERS.map((order) => (
                  <button
                    className="flex items-center justify-between gap-2 bg-surface-subtle rounded-lg px-3 py-2 text-left active:scale-[0.99] transition-transform"
                    key={order.id}
                    type="button"
                    onClick={onOpenOrders}
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
                      <span className="font-label-sm text-label-sm font-semibold text-text-primary">
                        {order.amount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Recent Messages */}
          {hasMessaging && (
          <div className="px-margin mt-space-xs">
            <div className="bg-surface-canvas rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="chat_bubble" className="text-primary text-[18px]" />
                  <h3 className="font-label-md text-label-md font-semibold text-text-primary">Recent Messages</h3>
                </div>
                <button
                  className="font-label-sm text-label-sm text-primary font-semibold flex items-center"
                  type="button"
                  onClick={onOpenMessages}
                >
                  View all <Icon name="chevron_right" className="text-[16px]" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {RECENT_MESSAGES.map((message) => (
                  <button
                    className="flex items-center justify-between gap-2 bg-surface-subtle rounded-lg px-3 py-2 text-left active:scale-[0.99] transition-transform"
                    key={message.name}
                    type="button"
                    onClick={onOpenMessages}
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
          </div>
          )}
        </div>
        <BusinessTabBar active="overview" onTab={onTab} />
      </AppScreen>
    </div>
  );
}
