import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessOverviewScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onSubscribe?: () => void;
  onBoost?: () => void;
  onAddOns?: () => void;
  onOpenOrders?: () => void;
  onOpenBookings?: () => void;
  onOpenMessages?: () => void;
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
  onAddOns,
  onOpenOrders,
  onOpenBookings,
  onOpenMessages,
}: DesktopBusinessOverviewScreenProps) {
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
      onClick: onOpenBookings ?? onOpenOrders,
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
              <section className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
                {todayStats.map((stat) => (
                  <button
                    className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left hover:scale-[1.01] active:scale-[0.98] transition-transform"
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

              {/* Quick Actions */}
              <section className="grid grid-cols-2 gap-space-xs">
                <button
                  className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left hover:scale-[1.01] active:scale-[0.98] transition-transform"
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
                  className="bg-surface-canvas rounded-xl p-3 shadow-sm flex flex-col gap-1 text-left hover:scale-[1.01] active:scale-[0.98] transition-transform"
                  type="button"
                  onClick={onAddOns}
                >
                  <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                    <Icon name="add_circle" className="text-[20px]" />
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-text-primary">Paid Add-ons</span>
                  <span className="font-caption text-caption text-text-secondary">SMS credits & promotion</span>
                </button>
              </section>
            </div>

            {/* Narrow column: recent activity */}
            <div className="xl:col-span-4 space-y-space-md">
              {/* Recent Orders */}
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

              {/* Recent Messages */}
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
            </div>
          </div>
        </div>
      </div>
    </BusinessPortalChrome>
  );
}
