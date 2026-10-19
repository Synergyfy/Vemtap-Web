import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { useOrders, type SubmittedOrder } from '../context/OrdersContext';
import { useBooking, type SpaAppointment } from '../context/BookingContext';
import {
  MERCHANT_IMAGE,
  PAYMENT_STATUS_LABELS,
  formatOrderTime,
  isActiveOrderStatus,
  isPaymentCleared,
  orderStatusLabel,
  orderTimeline,
} from './orderData';

export type OrdersTarget = 'support' | 'discover' | 'spa-booking';

interface OrdersScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpenConversation: (threadId: string) => void;
  onOpenOrder: (ref: string) => void;
  onOpenBooking: () => void;
  onNavigate: (target: OrdersTarget) => void;
}

type Hub = 'orders' | 'bookings';

const DIRECTIONS_URL = 'https://www.google.com/maps/search/?api=1&query=Maitama%20Heights%2C%20Abuja';

const ORDER_STEPS = [
  { label: 'Received', icon: 'check' },
  { label: 'In the Kitchen', icon: 'restaurant' },
  { label: 'Ready', icon: 'shopping_bag' },
  { label: 'Picked Up', icon: 'done_all' },
];

const BOOKING_FILTERS = [
  { key: 'all', label: 'All', count: 2 },
  { key: 'upcoming', label: 'Upcoming', count: 1 },
  { key: 'past', label: 'Past', count: 1 },
] as const;

type OrderFilterKey = 'all' | 'active' | 'completed';
type BookingFilterKey = (typeof BOOKING_FILTERS)[number]['key'];

export function OrdersScreen({ onTab, onOpenConversation, onOpenOrder, onOpenBooking, onNavigate }: OrdersScreenProps) {
  const [hub, setHub] = useState<Hub>('orders');
  const [orderFilter, setOrderFilter] = useState<OrderFilterKey>('all');
  const [bookingFilter, setBookingFilter] = useState<BookingFilterKey>('all');
  const orders = useOrders();
  const spaBooking = useBooking();

  const myOrders = orders.orders;
  const activeOrders = myOrders.filter((order) => isActiveOrderStatus(order.status));
  const completedOrders = myOrders.filter((order) => !isActiveOrderStatus(order.status));

  /** Real appointment records (BUG-025) — confirmed = upcoming. */
  const upcomingAppointments = spaBooking.appointments.filter((item) => item.status === 'confirmed');
  const pastAppointments = spaBooking.appointments.filter((item) => item.status !== 'confirmed');

  const bookingFilters: ReadonlyArray<{ key: BookingFilterKey; label: string; count: number }> = [
    { key: 'all', label: 'All', count: spaBooking.appointments.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingAppointments.length },
    { key: 'past', label: 'Past', count: pastAppointments.length },
  ];

  const orderFilters: ReadonlyArray<{ key: OrderFilterKey; label: string; count: number }> = [
    { key: 'all', label: 'All', count: myOrders.length },
    { key: 'active', label: 'Active', count: activeOrders.length },
    { key: 'completed', label: 'Completed', count: completedOrders.length },
  ];

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
      ? orderFilters.map((item) => ({
          ...item,
          selected: orderFilter === item.key,
          onSelect: () => setOrderFilter(item.key),
        }))
      : bookingFilters.map((item) => ({
          ...item,
          selected: bookingFilter === item.key,
          onSelect: () => setBookingFilter(item.key),
        }));

  const showActiveOrder = hub === 'orders' && orderFilter !== 'completed';
  const showCompletedOrders = hub === 'orders' && orderFilter !== 'active';
  const showUpcomingBooking = hub === 'bookings' && bookingFilter !== 'past';
  const showPastBooking = hub === 'bookings' && bookingFilter !== 'upcoming';

  const lineSummary = (order: SubmittedOrder) =>
    order.lines.map((line) => `${line.qty}x ${line.name}`).join(', ');

  const renderOrderCard = (order: SubmittedOrder) => {
    const active = isActiveOrderStatus(order.status);
    const timeline = orderTimeline(order.status);
    const stepIndex = timeline.findIndex((state) => state === 'current');
    const doneThrough = stepIndex === -1 ? timeline.length : stepIndex;
    const paymentCleared = isPaymentCleared(order.paymentStatus);

    return (
      <article
        key={order.ref}
        className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm"
      >
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                active ? 'bg-tertiary animate-pulse' : 'bg-surface-variant'
              }`}
            />
            <span
              className={`font-label-sm text-label-sm font-bold uppercase tracking-wide truncate ${
                active ? 'text-tertiary' : 'text-text-secondary'
              }`}
            >
              {orderStatusLabel(order.status)}
            </span>
            {active && order.paymentStatus === 'pending' && (
              <span className="font-caption text-caption text-error font-semibold shrink-0">â€¢ Awaiting payment</span>
            )}
          </div>
          <span className="font-mono font-caption text-caption text-text-tertiary shrink-0">#{order.ref}</span>
        </div>

        {active ? (
          <div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(25, (doneThrough / timeline.length) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-space-xs">
              {ORDER_STEPS.map((step, index) => (
                <div
                  key={step.label}
                  className={`flex flex-col items-center gap-1 flex-1 ${
                    index < doneThrough
                      ? 'text-primary'
                      : index === doneThrough
                        ? 'text-tertiary'
                        : 'text-text-tertiary'
                  }`}
                >
                  <Icon
                    name={step.icon}
                    filled={index < doneThrough || index === doneThrough}
                    className={`text-[16px] ${index <= doneThrough ? '' : 'opacity-50'}`}
                  />
                  <span className="font-caption text-[10px] leading-tight text-center">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-space-xs">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${
                order.status === 'completed'
                  ? 'bg-badge-discount-bg text-badge-discount-text'
                  : 'bg-surface-container-high text-text-secondary'
              }`}
            >
              <Icon
                name={order.status === 'completed' ? 'check_circle' : 'cancel'}
                className="text-[13px]"
                filled
              />
              {orderStatusLabel(order.status).toUpperCase()}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpenOrder(order.ref)}
          className="flex gap-space-sm items-start text-left w-full rounded-lg hover:bg-surface-subtle transition-colors p-space-2xs -m-space-2xs"
        >
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt={order.merchantName}
              src={order.lines[0]?.image || MERCHANT_IMAGE}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">{order.merchantName}</h2>
            <p className="font-caption text-caption text-text-secondary truncate">{lineSummary(order)}</p>
            <div className="flex items-baseline gap-1.5 mt-auto">
              <span className="font-heading-sm text-heading-sm text-text-primary font-bold">
                â‚¦{order.total.toLocaleString('en-US')}
              </span>
              <span className="font-caption text-caption text-text-tertiary truncate">
                {formatOrderTime(order.submittedAt)} â€¢ {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
            </div>
          </div>
        </button>

        {active ? (
          <div className="grid grid-cols-2 gap-space-xs pt-space-2xs">
            <button
              type="button"
              onClick={() => onOpenConversation(order.merchantId)}
              className="h-11 rounded-xl bg-surface-container text-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors active:scale-[0.98]"
            >
              <Icon name="chat" className="text-[18px]" />
              <span>Contact Merchant</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenOrder(order.ref)}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:bg-primary"
            >
              <Icon name="local_shipping" className="text-[18px]" />
              <span>Track Order</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-space-xs pt-space-2xs">
            <button
              type="button"
              onClick={() => onOpenOrder(order.ref)}
              className="flex-1 h-10 rounded-xl bg-surface-container text-text-secondary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors"
            >
              <Icon name="receipt" className="text-[16px]" />
              <span>{order.status === 'refunded' ? 'Refund Details' : 'Receipt'}</span>
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
        )}
        {!paymentCleared && (
          <p className="font-caption text-caption text-error">
            This order is not marked paid â€” {order.merchantName} has not verified the payment yet.
          </p>
        )}
      </article>
    );
  };

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
            {hubChip('orders', 'Orders', myOrders.length)}
            {hubChip('bookings', 'Bookings', spaBooking.appointments.length || 2)}
          </div>
        </div>

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
              {showActiveOrder &&
                (activeOrders.length > 0 ? (
                  activeOrders.map(renderOrderCard)
                ) : (
                  <div className="bg-surface-tint-blue rounded-xl p-space-md flex items-start gap-space-sm">
                    <Icon name="receipt_long" className="text-primary text-[22px] flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                        No active orders right now
                      </h4>
                      <p className="font-caption text-caption text-text-secondary leading-relaxed">
                        Orders you place will show their live status here.{' '}
                        <button
                          type="button"
                          onClick={() => onNavigate('discover')}
                          className="text-primary font-semibold hover:underline"
                        >
                          Browse businesses
                        </button>
                      </p>
                    </div>
                  </div>
                ))}

              {showCompletedOrders &&
                (completedOrders.length > 0 ? (
                  completedOrders.map(renderOrderCard)
                ) : (
                  <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
                    <Icon name="history" className="text-text-secondary text-[22px] flex-shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">
                      Your completed, cancelled and refunded orders will appear here.
                    </p>
                  </div>
                ))}
            </>
          )}

          {hub === 'bookings' && (
            <>
              {showUpcomingBooking &&
                (upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <article
                      key={appointment.ref}
                      className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm"
                    >
                      <div className="flex items-center justify-between gap-space-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-[11px] font-semibold">
                          <Icon name="verified" className="text-[13px]" filled />
                          CONFIRMED • {appointment.ref}
                        </span>
                        <span className="font-label-sm text-label-sm font-bold text-text-primary">
                          ₦{appointment.payable.toLocaleString('en-US')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenBooking}
                        className="flex gap-space-sm items-start text-left w-full rounded-lg hover:bg-surface-subtle transition-colors p-space-2xs -m-space-2xs"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                          <img className="w-full h-full object-cover" alt="Serene luxury spa treatment room" src={DIRECTIONS_URL} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                            {appointment.merchantName}
                          </h2>
                          <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                            <Icon name="calendar_today" className="text-[13px] text-primary" />
                            <span>
                              {appointment.dateShort} • {appointment.time}
                            </span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary truncate">
                            {appointment.serviceNames.join(' & ')}
                          </p>
                          <span className="font-caption text-caption text-text-tertiary">
                            Specialist: {appointment.therapistLabel}
                          </span>
                        </div>
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
                    <Icon name="event_available" className="text-text-secondary text-[22px] flex-shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">
                      No upcoming appointments. Book a service to see it here.
                    </p>
                  </div>
                ))}

              {showPastBooking &&
                (pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment: SpaAppointment) => (
                    <article
                      key={appointment.ref}
                      className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-[11px] font-semibold">
                          {appointment.status.toUpperCase()} • {appointment.ref}
                        </span>
                        <span className="font-label-sm text-label-sm font-bold text-text-primary">
                          ₦{appointment.payable.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="flex gap-space-sm items-start">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                          <img className="w-full h-full object-cover" alt="Serene luxury spa treatment room" src={DIRECTIONS_URL} />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                            {appointment.merchantName}
                          </h2>
                          <div className="flex items-center gap-1 text-text-secondary font-caption text-caption">
                            <Icon name="calendar_today" className="text-[13px] text-primary" />
                            <span>
                              {appointment.dateShort} • {appointment.time}
                            </span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary truncate">
                            {appointment.serviceNames.join(' & ')}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="bg-surface-container-low rounded-xl p-space-md flex items-start gap-space-sm">
                    <Icon name="history" className="text-text-secondary text-[22px] flex-shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">
                      Your completed appointments will appear here.
                    </p>
                  </div>
                ))}
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

      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
