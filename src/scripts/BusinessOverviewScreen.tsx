import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessModeHeader } from './BusinessModeHeader';
import { useBusinessBranch } from '../context/BusinessBranchContext';

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
  onAddOns,
  onOpenOrders,
  onOpenBookings,
  onOpenMessages,
  onOpenPosMenu,
}: BusinessOverviewScreenProps) {
  const { branch } = useBusinessBranch();
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % 2), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = branch.stats;

  const todayStats = [
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
    {
      icon: 'calendar_month',
      iconBox: 'bg-tertiary-fixed text-tertiary',
      label: 'Bookings',
      value: stats.bookings,
      note: 'Next in 35 mins',
      onClick: onOpenBookings,
    },
    {
      icon: 'chat_bubble',
      iconBox: 'bg-secondary-container text-on-secondary-container',
      label: 'Unread Messages',
      value: stats.unread,
      note: 'Open inquiries',
      onClick: onOpenMessages,
    },
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

          {/* Branch Stats */}
          <div className="px-margin mt-space-md grid grid-cols-2 gap-space-xs">
            {todayStats.map((stat) => (
              <button
                className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left active:scale-[0.98] transition-transform"
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
          </div>

          {/* Quick Actions */}
          <div className="px-margin mt-space-sm flex flex-col gap-space-xs">
            {/* POS — full-width primary quick action opening the POS menu page */}
            <button
              className="bg-gradient-to-r from-primary to-primary-container rounded-xl p-3 shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              type="button"
              onClick={onOpenPosMenu}
            >
              <div className="w-9 h-9 rounded-lg bg-surface-canvas/90 text-primary flex items-center justify-center shrink-0">
                <Icon name="point_of_sale" className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md font-semibold text-on-primary">POS</span>
                <span className="font-caption text-caption text-on-primary/80 truncate">
                  Register, orders &amp; store front
                </span>
              </div>
              <Icon name="chevron_right" className="text-[20px] text-on-primary shrink-0" />
            </button>

            <div className="grid grid-cols-2 gap-space-xs">
              <button
                className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left active:scale-[0.98] transition-transform"
                type="button"
                onClick={onBoost}
              >
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="rocket_launch" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary">Boost a Deal</span>
                <span className="font-caption text-caption text-text-secondary">Your budget, your reach</span>
              </button>
              <button
                className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left active:scale-[0.98] transition-transform"
                type="button"
                onClick={onAddOns}
              >
                <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                  <Icon name="add_circle" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-text-primary">Paid Add-ons</span>
                <span className="font-caption text-caption text-text-secondary">SMS credits &amp; promotion</span>
              </button>
            </div>
          </div>

          {/* Recent Orders */}
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

          {/* Recent Messages */}
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
        </div>
        <BusinessTabBar active="overview" onTab={onTab} />
      </AppScreen>
    </div>
  );
}
