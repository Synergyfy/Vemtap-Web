import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';

export type OrdersTarget = 'support' | 'discover' | 'spa-booking';

interface OrdersScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenConversation: (threadId: string) => void;
  onOpenOrder: () => void;
  onOpenBooking: () => void;
  onNavigate: (target: OrdersTarget) => void;
}

type Hub = 'orders' | 'bookings';

const URBAN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCta-AVcjCZDWInIcUOJAuZYV2oAQHyTKLW5eoRshVGRfv8UJJbZ9ZCzBn61chEDIfTHAGW1GJtmX2WtS91OqMMUuKu_rwDf5fhd87TDW44tR2GYusQ1Q0A_EdzsPpIuPe9Ka3jV_pnY_4A-0zbBoXeaXu8h257sUKg1LWCudIZeklCl2b_QS7i_d4Cq3p8rIm-xBCEHufzUuVhTBN4Z6tLGW_WUhyJZBbwR8YVUOYg';

const CAFE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_QV6uRZyyO54NZ_xP-h2bJ8ASlYYKyHrhcifuXhWq8-8e8k7vVjQp92ikYv3cH5MH1U3mE-cqvqgIrgvoTD-_3v0kflAwqqy8Epu7Gxy7JGLPfKzbysfHasIYlfBSpqOZTvvLMf7DdGcoLZHsJdXHYXPoe6YzKvM1VfQBm0hKUBoocqfb1jEx0XIwvHG3Cu3MbVVrfoRPKvM2x6jDPEgCeLL7VDkEoBDmTl5tggWL';

const SPA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBO8mzoeLehe5p8uSLXesvatMxVjYR42ABeOPmuFYI827KTEwRO_SPbscYV7f85BXGejWcdoe2uaUHATPe7YX9Rznp1ckMjgg-u7m-vBxw0Z67DFpm0ufm4rg1v1fGgqvCCskKZshUlIKCtKB50TjOwwucnjYkGAVmSwO0YgV_OxiLRsYEJ5-ds90djDhdE4ldxF1jZdkv2QhqFByRPUAEcfTeF26LVqRB4KKWSUseg';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Maitama%20Heights%2C%20Abuja';

const ORDER_STEPS = [
  { label: 'Received', icon: 'check' },
  { label: 'In the Kitchen', icon: 'restaurant' },
  { label: 'Ready', icon: 'shopping_bag' },
  { label: 'Picked Up', icon: 'done_all' },
];

const ORDER_FILTERS = [
  { key: 'all', label: 'All', count: 3 },
  { key: 'active', label: 'Active', count: 1 },
  { key: 'completed', label: 'Completed', count: 2 },
] as const;

const BOOKING_FILTERS = [
  { key: 'all', label: 'All', count: 2 },
  { key: 'upcoming', label: 'Upcoming', count: 1 },
  { key: 'past', label: 'Past', count: 1 },
] as const;

type OrderFilterKey = (typeof ORDER_FILTERS)[number]['key'];
type BookingFilterKey = (typeof BOOKING_FILTERS)[number]['key'];

export function OrdersScreen({ onTab, onOpenConversation, onOpenOrder, onOpenBooking, onNavigate }: OrdersScreenProps) {
  const [hub, setHub] = useState<Hub>('orders');
  const [orderFilter, setOrderFilter] = useState<OrderFilterKey>('all');
  const [bookingFilter, setBookingFilter] = useState<BookingFilterKey>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const hubChip = (key: Hub, label: string, count: number) => (
    <button
      key={key}
      type="button"
      role="tab"
      aria-selected={hub === key}
      onClick={() => setHub(key)}
      className={`flex-1 h-11 rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] ${
        hub === key ? 'bg-primary-container text-on-primary shadow-md' : 'bg-surface-container-high text-text-secondary'
      }`}
    >
      <span>{label}</span>
      <span
        className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
          hub === key ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-variant text-text-secondary'
        }`}
      >
        {count}
      </span>
    </button>
  );

  const filterChips =
    hub === 'orders'
      ? ORDER_FILTERS.map((item) => ({ ...item, selected: orderFilter === item.key, onSelect: () => setOrderFilter(item.key) }))
      : BOOKING_FILTERS.map((item) => ({ ...item, selected: bookingFilter === item.key, onSelect: () => setBookingFilter(item.key) }));

  const showActiveOrder = hub === 'orders' && orderFilter !== 'completed';
  const showCompletedOrders = hub === 'orders' && orderFilter !== 'active';
  const showUpcomingBooking = hub === 'bookings' && bookingFilter !== 'past';
  const showPastBooking = hub === 'bookings' && bookingFilter !== 'upcoming';

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight truncate">Orders &amp; Bookings</h1>
          <button
            aria-label="Account"
            type="button"
            onClick={() => onTab('account')}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform"
          >
            <Icon name="person" className="text-on-primary text-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface min-h-screen">
        <div className="px-margin pt-space-xs mb-space-sm">
          <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-xl shadow-sm">
            {hubChip('orders', 'Orders', 3)}
            {hubChip('bookings', 'Bookings', 2)}
          </div>
        </div>

        {hub === 'orders' && (
          <div className="px-margin mb-space-sm">
            <button
              type="button"
              onClick={() => setHub('bookings')}
              className="w-full bg-secondary-fixed/50 rounded-xl p-space-sm flex items-center gap-space-sm text-left hover:bg-secondary-fixed/70 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon name="event_available" className="text-[20px]" filled />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-sm text-label-sm font-semibold text-text-primary block truncate">
                  Upcoming: Glow &amp; Serenity Spa
                </span>
                <span className="font-caption text-caption text-text-secondary block truncate">
                  Tomorrow, 1:15 PM • Amara K.
                </span>
              </div>
              <span className="text-primary font-label-sm text-label-sm font-bold flex items-center gap-0.5 shrink-0">
                View
                <Icon name="arrow_forward" className="text-[15px]" />
              </span>
            </button>
          </div>
        )}

        <div className="w-full overflow-x-auto no-scrollbar mb-space-md pl-margin">
          <div className="flex items-center gap-space-xs pr-margin">
            {filterChips.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-selected={item.selected}
                onClick={item.onSelect}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-md text-label-md transition-transform active:scale-95 whitespace-nowrap ${
                  item.selected
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container-high text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none ${
                    item.selected
                      ? 'bg-on-primary-container/20 text-on-primary-container font-bold'
                      : 'bg-surface-variant text-text-secondary font-semibold'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-md">
          {hub === 'orders' && (
            <>
              {showActiveOrder && (
                <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between gap-space-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shrink-0" />
                      <span className="font-label-sm text-label-sm font-bold text-tertiary uppercase tracking-wide">
                        In the Kitchen
                      </span>
                    </div>
                    <span className="font-mono font-caption text-caption text-text-tertiary">#UG-9021</span>
                  </div>

                  <div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full w-1/2 rounded-full bg-primary transition-all" />
                    </div>
                    <div className="flex items-center justify-between mt-space-xs">
                      {ORDER_STEPS.map((step, index) => (
                        <div
                          key={step.label}
                          className={`flex flex-col items-center gap-1 flex-1 ${
                            index <= 1 ? 'text-primary' : 'text-text-tertiary'
                          }`}
                        >
                          <Icon
                            name={step.icon}
                            filled={index <= 1}
                            className={`text-[16px] ${index <= 1 ? '' : 'opacity-50'}`}
                          />
                          <span className="font-caption text-[10px] leading-tight text-center">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenOrder}
                    className="flex gap-space-sm items-start text-left w-full rounded-lg hover:bg-surface-subtle transition-colors p-space-2xs -m-space-2xs"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                      <img className="w-full h-full object-cover" alt="Plated woodfire steak dinner" src={URBAN_IMG} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Urban Grill &amp; Bistro</h2>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        1x Woodfire Aged Ribeye, 1x Truffle Fries, 1x Peach Tea
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-auto">
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦19,000</span>
                        <span className="font-caption text-caption text-text-tertiary">Pay at counter</span>
                      </div>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
                    <button
                      type="button"
                      onClick={() => onOpenConversation('urban')}
                      className="h-11 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
                    >
                      <Icon name="chat" className="text-[18px]" />
                      <span>Contact Kitchen</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenOrder}
                      className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
                    >
                      <Icon name="local_shipping" className="text-[18px]" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </article>
              )}

              {showCompletedOrders && (
                <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                      <Icon name="check_circle" className="text-[13px]" filled />
                      COMPLETED
                    </span>
                    <span className="font-mono font-caption text-caption text-text-tertiary">#CN-1184</span>
                  </div>
                  <div className="flex gap-space-sm items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                      <img className="w-full h-full object-cover" alt="Cafe counter with croissants and cold brew" src={CAFE_IMG} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Cafe Neo Artisanal</h2>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Cold Brew &amp; Almond Pastry Box (2 pcs)
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-auto">
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦4,500</span>
                        <span className="font-caption text-caption text-text-tertiary">Oct 11 • VEMTAP Instant Tap</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs pt-space-2xs">
                    <button
                      type="button"
                      onClick={() => showToast('Receipt saved to your device')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="receipt" className="text-[16px]" />
                      <span>Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('support')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="star" className="text-[16px]" />
                      <span>Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('discover')}
                      className="flex-1 h-10 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm hover:bg-primary transition-colors"
                    >
                      <Icon name="refresh" className="text-[16px]" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </article>
              )}

              {showCompletedOrders && (
                <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-semibold">
                      <Icon name="check_circle" className="text-[13px]" filled />
                      COMPLETED
                    </span>
                    <span className="font-mono font-caption text-caption text-text-tertiary">#DK-3312</span>
                  </div>
                  <div className="flex gap-space-sm items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                      <Icon name="bakery_dining" className="text-[30px]" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">The Daily Knead</h2>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Sourdough Loaf, Sausage Rolls, Cinnamon Buns
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-auto">
                        <span className="font-heading-sm text-heading-sm text-text-primary font-bold">₦6,200</span>
                        <span className="font-caption text-caption text-text-tertiary">Oct 09 • Pickup</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs pt-space-2xs">
                    <button
                      type="button"
                      onClick={() => onNavigate('support')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="contact_support" className="text-[16px]" />
                      <span>Need Help</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Receipt saved to your device')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="description" className="text-[16px]" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </article>
              )}
            </>
          )}

          {hub === 'bookings' && (
            <>
              {showUpcomingBooking && (
                <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-semibold">
                      <Icon name="verified" className="text-[13px]" filled />
                      CONFIRMED • GS-4829
                    </span>
                    <span className="font-label-sm text-label-sm font-bold text-text-primary">₦24,000</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="flex gap-space-sm items-start text-left w-full rounded-lg hover:bg-surface-subtle transition-colors p-space-2xs -m-space-2xs"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                      <img className="w-full h-full object-cover" alt="Serene luxury spa treatment room" src={SPA_IMG} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Glow &amp; Serenity Spa</h2>
                      <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                        <Icon name="calendar_today" className="text-[13px] text-primary" />
                        <span>Thu, Oct 17 • 1:15 PM</span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Deep Hydration Facial &amp; Gel Manicure
                      </p>
                      <span className="font-caption text-caption text-text-tertiary">Specialist: Amara K.</span>
                    </div>
                  </button>
                  <div className="flex items-center gap-space-xs pt-space-2xs">
                    <button
                      type="button"
                      onClick={() => showToast('Added to your calendar')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="event" className="text-[16px]" />
                      <span>Add to Calendar</span>
                    </button>
                    <a
                      href={DIRECTIONS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-10 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm hover:bg-primary transition-colors"
                    >
                      <Icon name="near_me" className="text-[16px]" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </article>
              )}

              {showPastBooking && (
                <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-[11px] font-semibold">
                      COMPLETED • GS-44102
                    </span>
                    <span className="font-label-sm text-label-sm font-bold text-text-primary">₦12,000</span>
                  </div>
                  <div className="flex gap-space-sm items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                      <img className="w-full h-full object-cover" alt="Serene luxury spa treatment room" src={SPA_IMG} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">Glow &amp; Serenity Spa</h2>
                      <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                        <Icon name="calendar_today" className="text-[13px] text-primary" />
                        <span>Sat, Sep 20 • 11:00 AM</span>
                      </div>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Weekend Glow Facial &amp; Sauna Detox
                      </p>
                      <span className="font-caption text-caption text-text-tertiary">Therapist: Ifeoma A.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs pt-space-2xs">
                    <button
                      type="button"
                      onClick={() => onNavigate('support')}
                      className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name="star" className="text-[16px]" />
                      <span>Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('spa-booking')}
                      className="flex-1 h-10 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm hover:bg-primary transition-colors"
                    >
                      <Icon name="refresh" className="text-[16px]" />
                      <span>Book Again</span>
                    </button>
                  </div>
                </article>
              )}
            </>
          )}

          <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
            <Icon name="help_outline" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                Need help with an order or booking?
              </h4>
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Our Abuja support team can chase receipts, reschedule visits, or resolve disputes.{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="text-primary font-semibold hover:underline"
                >
                  Contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
