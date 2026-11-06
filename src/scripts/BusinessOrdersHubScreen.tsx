import { useEffect, useMemo, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { useBusinessBookings, useBusinessOrders } from '../hooks/business/useBusinessOrders';
import { hasApiConfig } from '../services/api/client';
import type { BusinessOrder } from '../services/businessOrdersService';
import { formatRelativeTime } from '../utils/format';
import {
  bookingStatus,
  isOpenOrder,
  orderChannel,
  orderChip,
  orderItemsSummary,
  orderPaymentMethod,
  orderRef,
  orderStatus,
  orderStatusLabel,
  orderTotalLabel,
  personName,
  type OrderChannel,
  type OrderPaymentMethod,
} from './ordersLive';

import { BusinessModeHeader } from './BusinessModeHeader';

interface BusinessOrdersHubScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onSwitchBookings: () => void;
  /** Live: the tapped order's id. */
  onOpenOrder: (orderId?: string) => void;
}

type StatusChipKey = 'all' | 'new' | 'processing' | 'ready' | 'completed' | 'cancelled';

const STATUS_CHIPS: { key: StatusChipKey; label: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All (24)' },
  { key: 'new', label: 'New (3)', pulse: true },
  { key: 'processing', label: 'Processing (2)' },
  { key: 'ready', label: 'Ready (1)' },
  { key: 'completed', label: 'Completed (18)' },
  { key: 'cancelled', label: 'Cancelled (1)' },
];

type ChannelKey = 'all' | OrderChannel;
type PaymentKey = 'all' | OrderPaymentMethod;

const CHANNEL_OPTIONS: { key: ChannelKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All Channels', icon: 'apps' },
  { key: 'storefront', label: 'Store Front', icon: 'storefront' },
  { key: 'deals', label: 'Deals & Vouchers', icon: 'local_offer' },
  { key: 'pos', label: 'POS Walk-in', icon: 'point_of_sale' },
];

const PAYMENT_OPTIONS: { key: PaymentKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All Payments', icon: 'payments' },
  { key: 'cash', label: 'Cash', icon: 'payments' },
  { key: 'card', label: 'POS / Card', icon: 'credit_card' },
  { key: 'transfer', label: 'Bank Transfer', icon: 'account_balance' },
];

interface MenuOption<K> {
  key: K;
  label: string;
  count?: number;
}

/** One of the two side-by-side dropdowns above the feed. */
function FilterMenu<K extends string>({ title, icon, value, options, open, onToggle, onPick }: { title: string; icon: string; value: K; options: MenuOption<K>[]; open: boolean; onToggle: () => void; onPick: (key: K) => void }) {
  const current = options.find((option) => option.key === value) ?? options[0];
  return (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`w-full h-10 px-space-xs rounded-xl flex items-center gap-1.5 font-label-md text-label-md transition-all active:scale-[0.98] ${
          value !== 'all' || open ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-low text-text-secondary'
        }`}
      >
        <Icon name={icon} className="text-[18px] shrink-0" />
        <span className="truncate flex-1 text-left">{current.label}</span>
        <Icon name="expand_more" className={`text-[18px] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <button type="button" aria-label={`Close ${title}`} className="fixed inset-0 z-30 cursor-default" onClick={onToggle} />
          <div className="absolute z-40 top-full left-0 mt-1 min-w-full w-max max-w-[220px] rounded-xl bg-surface-canvas shadow-lg p-1">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => onPick(option.key)}
                className={`w-full px-space-xs py-2 rounded-lg flex items-center justify-between gap-space-sm font-label-md text-label-md text-left ${
                  option.key === value ? 'bg-surface-tint-blue text-primary' : 'text-on-surface'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {option.count !== undefined && <span className="font-caption text-caption shrink-0">{option.count}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface OrderRow {
  id: string;
  badgeLabel: string;
  badgeClass: string;
  badgeIcon?: string;
  badgeSpin?: boolean;
  badgeFill?: boolean;
  typeChip: string;
  typeChipClass: string;
  borderClass: string;
  customer: string;
  customerClass: string;
  items: string;
  price: string;
  time: string;
  timeClass: string;
  ping?: boolean;
  paymentIcon: string;
  paymentText: string;
  paymentChipClass: string;
  paymentIconClass?: string;
  action?: { label: string; icon: string; buttonClass?: string; textClass?: string };
}

const ORDER_ROWS: OrderRow[] = [
  {
    id: '#VG-94021',
    badgeLabel: 'New',
    badgeClass: 'bg-primary-container text-on-primary',
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-primary',
    customer: 'Amina Bello',
    customerClass: 'text-text-primary font-semibold',
    items: '3 items (Ribeye Steak + 2)',
    price: '₦34,500',
    time: '4m ago',
    timeClass: 'text-primary font-semibold',
    ping: true,
    paymentIcon: 'credit_card',
    paymentIconClass: 'text-primary',
    paymentText: 'POS Terminal • Pay at Counter',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    action: { label: 'Accept', icon: 'check', buttonClass: 'bg-primary-container text-on-primary' },
  },
  {
    id: '#POS-1049',
    badgeLabel: 'POS',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    typeChip: 'Table 04',
    typeChipClass: 'bg-surface-tint-blue text-primary',
    borderClass: 'border-secondary-container',
    customer: 'Walk-In Guest',
    customerClass: 'text-text-primary font-semibold',
    items: '2 items (Lunch Combo + 1)',
    price: '₦11,200',
    time: '7m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'point_of_sale',
    paymentText: 'POS / Card • Settle at Table',
    paymentChipClass: 'bg-surface-container-highest text-secondary',
    action: { label: 'Kitchen', icon: 'skillet', buttonClass: 'bg-surface-container text-on-surface' },
  },
  {
    id: '#VG-93988',
    badgeLabel: 'Processing',
    badgeClass: 'bg-surface-tint-blue text-primary',
    badgeIcon: 'progress_activity',
    badgeSpin: true,
    typeChip: 'Delivery',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-surface-tint-blue',
    customer: 'Tunde Bakare',
    customerClass: 'text-text-primary font-semibold',
    items: '2 items (Burger Duo + 1)',
    price: '₦18,200',
    time: '28m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'account_balance',
    paymentText: 'Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
    action: { label: 'Ready', icon: 'chevron_right', textClass: 'text-primary' },
  },
  {
    id: '#VG-93910',
    badgeLabel: 'Ready',
    badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    badgeIcon: 'check_circle',
    badgeFill: true,
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-badge-discount-text',
    customer: 'Zainab Ahmed',
    customerClass: 'text-text-primary font-semibold',
    items: '1 item • Packed at Counter',
    price: '₦9,600',
    time: '40m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentIcon: 'payments',
    paymentIconClass: 'text-badge-discount-text',
    paymentText: 'Cash • Pay on Delivery',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    action: { label: 'Handover', icon: 'chevron_right', textClass: 'text-badge-discount-text' },
  },
  {
    id: '#POS-1048',
    badgeLabel: 'Completed',
    badgeClass: 'bg-surface-container text-text-secondary',
    typeChip: 'Takeaway',
    typeChipClass: 'bg-surface-container-low text-secondary',
    borderClass: '',
    customer: 'David O.',
    customerClass: 'text-text-primary font-medium',
    items: '3 items (Jollof Fiesta Box + 2)',
    price: '₦14,800',
    time: '1:15 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentIcon: 'credit_card',
    paymentText: 'POS at Counter • Collected',
    paymentChipClass: 'bg-surface-container-low text-text-secondary',
  },
  {
    id: '#VG-93870',
    badgeLabel: 'Completed',
    badgeClass: 'bg-surface-container text-text-secondary',
    typeChip: 'Pickup',
    typeChipClass: 'bg-surface-container-low text-secondary',
    borderClass: '',
    customer: 'Samuel A.',
    customerClass: 'text-text-primary font-medium',
    items: '1 item (Spicy Wings Platter)',
    price: '₦6,500',
    time: '12:40 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentIcon: 'account_balance',
    paymentText: 'Direct Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
];

const LIVE_BADGE_CLASS: Record<string, string> = {
  new: 'bg-primary-container text-on-primary',
  processing: 'bg-surface-tint-blue text-primary',
  ready: 'bg-badge-discount-bg text-badge-discount-text',
  completed: 'bg-surface-container text-text-secondary',
};
const LIVE_BORDER_CLASS: Record<string, string> = {
  new: 'border-primary',
  processing: 'border-surface-tint-blue',
  ready: 'border-badge-discount-text',
};

type FeedRow = OrderRow & {
  orderId?: string;
  channel?: OrderChannel;
  paymentMethod?: OrderPaymentMethod | null;
  placedAt?: number;
  phone?: string;
};

/** A live order in the feed's row shape. */
const liveRow = (order: BusinessOrder): FeedRow & { orderId: string } => {
  const status = orderStatus(order);
  return {
    orderId: order.id,
    channel: orderChannel(order),
    paymentMethod: orderPaymentMethod(order),
    placedAt: order.createdAt ? new Date(order.createdAt).getTime() : 0,
    phone: order.customer?.phone ?? undefined,
    id: orderRef(order),
    badgeLabel: orderStatusLabel(order),
    badgeClass: LIVE_BADGE_CLASS[status] ?? 'bg-error-container text-on-error-container',
    typeChip: '',
    typeChipClass: '',
    borderClass: LIVE_BORDER_CLASS[status] ?? '',
    customer: personName(order.customer),
    customerClass: '',
    items: orderItemsSummary(order),
    price: orderTotalLabel(order),
    time: formatRelativeTime(order.createdAt),
    timeClass: '',
    ping: status === 'new',
    paymentIcon: '',
    paymentText: '',
    paymentChipClass: '',
  };
};

export function BusinessOrdersHubScreen({
  onTab,
  onSwitchBookings,
  onOpenOrder,
}: BusinessOrdersHubScreenProps) {
  const [statusChip, setStatusChip] = useState<StatusChipKey>('all');
  const [channel, setChannel] = useState<ChannelKey>('all');
  const [payment, setPayment] = useState<PaymentKey>('all');
  const [search, setSearch] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'channel' | 'status' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Live: real orders at the active branch, filtered by the status chips.
  const live = hasApiConfig();
  const ordersQuery = useBusinessOrders();
  const bookingsQuery = useBusinessBookings();
  const orders = ordersQuery.data ?? [];
  const countFor = (key: StatusChipKey) => (key === 'all' ? orders.length : orders.filter((o) => orderChip(o) === key).length);
  const chips = live
    ? STATUS_CHIPS.map((chip) => ({ ...chip, label: `${chip.label.replace(/ \(\d+\)$/, '')} (${countFor(chip.key)})` }))
    : STATUS_CHIPS;
  const channelCount = (key: ChannelKey) => (key === 'all' ? orders.length : orders.filter((o) => orderChannel(o) === key).length);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matching = (live ? orders.map(liveRow) : (ORDER_ROWS as FeedRow[])).filter((row, index) => {
      if (live) {
        if (statusChip !== 'all' && orderChip(orders[index]) !== statusChip) return false;
        if (channel !== 'all' && row.channel !== channel) return false;
        if (payment !== 'all' && row.paymentMethod !== payment) return false;
      }
      return !term || [row.id, row.customer, row.items, row.phone].some((field) => field?.toLowerCase().includes(term));
    });
    if (!live) return newestFirst ? matching : [...matching].reverse();
    return [...matching].sort((a, b) => ((a.placedAt ?? 0) - (b.placedAt ?? 0)) * (newestFirst ? -1 : 1));
  }, [live, orders, statusChip, channel, payment, search, newestFirst]);
  const filtered = statusChip !== 'all' || channel !== 'all' || payment !== 'all' || Boolean(search.trim());
  const clearFilters = () => {
    setStatusChip('all');
    setChannel('all');
    setPayment('all');
    setSearch('');
  };
  const openOrders = live ? String(orders.filter(isOpenOrder).length) : '8';
  const openBookings = live
    ? String((bookingsQuery.data ?? []).filter((b) => ['booked', 'confirmed'].includes(bookingStatus(b))).length)
    : '3';
  const toAction = live ? countFor('new') : 3;

  useEffect(() => {
    if (live && ordersQuery.isError) showToast("Couldn't load orders. Try again shortly.");
  }, [live, ordersQuery.isError]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <BusinessModeHeader title="Orders" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Header Controls & Context */}
        <div className="bg-surface/95 backdrop-blur-md px-margin pt-space-xs pb-space-sm flex flex-col gap-space-sm shadow-[0_4px_12px_-4px_rgba(20,27,43,0.03)]">
          {/* Search, sort and filters */}
          <div className="flex items-center gap-space-2xs">
            <div className="relative flex-1 min-w-0">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer, item"
                aria-label="Search orders"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setNewestFirst((value) => !value)}
              className="h-10 px-space-xs rounded-xl flex items-center gap-1 bg-surface-container-low text-text-secondary font-label-md text-label-md shrink-0 active:scale-95 transition-transform"
            >
              <Icon name="swap_vert" className="text-[18px]" />
              <span>{newestFirst ? 'Newest' : 'Oldest'}</span>
            </button>
            <button
              aria-label="Filter orders"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-low text-on-surface transition-transform active:scale-95 relative shrink-0"
              type="button"
              onClick={() => setFilterSheetOpen(true)}
            >
              <Icon name="tune" className="text-[20px]" />
              {payment !== 'all' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container" />}
            </button>
          </div>
          {/* Switcher: Orders vs Bookings */}
          <div className="p-1 bg-surface-container-high rounded-xl flex items-center gap-1">
            <button
              className="flex-1 py-2 rounded-lg bg-surface-container-lowest text-primary-container font-button-primary text-button-primary shadow-sm flex items-center justify-center gap-space-xs transition-all"
              type="button"
            >
              <span>Orders</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                {openOrders}
              </span>
            </button>
            <button
              className="flex-1 py-2 rounded-lg text-text-secondary hover:text-on-surface font-button-secondary text-button-secondary flex items-center justify-center gap-space-xs transition-all"
              type="button"
              onClick={onSwitchBookings}
            >
              <span>Bookings</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium">
                {openBookings}
              </span>
            </button>
          </div>
          {/* Channel and status */}
          <div className="flex items-center gap-space-xs">
            <FilterMenu
              title="channels"
              icon={(CHANNEL_OPTIONS.find((option) => option.key === channel) ?? CHANNEL_OPTIONS[0]).icon}
              value={channel}
              options={CHANNEL_OPTIONS.map((option) => ({ ...option, count: live ? channelCount(option.key) : undefined }))}
              open={openMenu === 'channel'}
              onToggle={() => setOpenMenu((menu) => (menu === 'channel' ? null : 'channel'))}
              onPick={(key) => {
                setChannel(key);
                setOpenMenu(null);
              }}
            />
            <FilterMenu
              title="statuses"
              icon="receipt_long"
              value={statusChip}
              options={chips.map((chip) => ({ key: chip.key, label: chip.label.replace(/ \(\d+\)$/, '') === 'All' ? 'All Orders' : chip.label.replace(/ \(\d+\)$/, ''), count: live ? countFor(chip.key) : undefined }))}
              open={openMenu === 'status'}
              onToggle={() => setOpenMenu((menu) => (menu === 'status' ? null : 'status'))}
              onPick={(key) => {
                setStatusChip(key);
                setOpenMenu(null);
              }}
            />
          </div>
          {filtered && (
            <button type="button" onClick={clearFilters} className="self-end font-label-md text-label-md text-primary">
              Clear filters
            </button>
          )}
        </div>

        {/* Main Scrollable Body Content */}
        <div className="px-margin pt-space-md pb-space-xl flex flex-col gap-space-md">
          {/* Action Required Alert Strip */}
          <button
            className="bg-surface-tint-blue rounded-xl p-space-xs flex items-center justify-between text-left"
            type="button"
            onClick={() => (live ? rows[0] && onOpenOrder(rows[0].orderId) : onOpenOrder())}
          >
            <div className="flex items-center gap-space-xs min-w-0">
              <Icon name="touch_app" className="text-primary text-[18px] shrink-0" />
              <span className="font-caption text-caption text-primary font-medium truncate">
                Tap an order to view details, accept or decline
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold shrink-0">
              {toAction} to action
            </span>
          </button>

          {/* Compact Orders Feed */}
          <div className="flex flex-col gap-space-2xs">
            {live && !ordersQuery.isLoading && !ordersQuery.isError && !rows.length && (
              <p className="font-caption text-caption text-text-secondary text-center py-space-md">
                {filtered ? 'No orders match your filters.' : 'No orders here yet.'}
              </p>
            )}
            {rows.map((row) => (
              <button
                className={`w-full flex items-center gap-space-xs px-3 py-3 rounded-xl bg-surface-container-lowest shadow-sm active:scale-[0.99] transition-transform text-left ${
                  row.borderClass ? `border-l-4 ${row.borderClass}` : ''
                } ${row.badgeLabel === 'Completed' ? 'opacity-75' : ''}`}
                key={row.orderId ?? row.id}
                type="button"
                onClick={() => onOpenOrder(row.orderId)}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${row.ping ? 'bg-primary-container animate-pulse' : 'bg-surface-container-highest'}`} />
                <span className="font-label-md text-label-md font-bold text-on-surface tracking-tight shrink-0">
                  {row.id}
                </span>
                <span className="font-caption text-caption text-text-secondary truncate flex-1 min-w-0">
                  {row.customer} • {row.items}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full font-caption text-caption font-semibold shrink-0 ${row.badgeClass}`}
                >
                  {row.badgeLabel}
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface shrink-0">
                  {row.price}
                </span>
                <Icon name="chevron_right" className="text-text-tertiary text-[18px] shrink-0" />
              </button>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
      {filterSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/60"
          onClick={(event) => {
            if (event.target === event.currentTarget) setFilterSheetOpen(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-label="Filter orders" className="w-full max-w-[430px] bg-surface-canvas rounded-t-2xl p-margin pb-safe flex flex-col gap-space-sm">
            <h2 className="font-heading-sm text-heading-sm text-on-surface">Filter Orders</h2>
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-text-secondary">Payment method</span>
              <div className="grid grid-cols-2 gap-space-2xs">
                {PAYMENT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPayment(option.key)}
                    className={`h-10 px-space-xs rounded-lg flex items-center gap-1.5 font-label-md text-label-md ${
                      payment === option.key ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-low text-text-secondary'
                    }`}
                  >
                    <Icon name={option.icon} className="text-[18px] shrink-0" />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="font-caption text-caption text-text-secondary">Orders with no recorded payment only show under All Payments.</p>
            </div>
            <div className="flex items-center gap-space-xs pb-space-xs">
              <button type="button" onClick={clearFilters} className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-label-md text-label-md">
                Reset All
              </button>
              <button type="button" onClick={() => setFilterSheetOpen(false)} className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <BusinessTabBar onTab={onTab} />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-inverse-on-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
