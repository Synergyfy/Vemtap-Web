import { useState, useMemo } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';

import { BusinessModeHeader } from './BusinessModeHeader';

interface BusinessOrdersHubScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  /** Hidden while the Bookings tool is switched off in Manage Features. */
  onSwitchBookings?: () => void;
  onOpenOrder: () => void;
}

type ChannelFilterKey = 'all' | 'storefront' | 'deals' | 'pos';
type StatusChipKey = 'all' | 'new' | 'processing' | 'ready' | 'completed' | 'cancelled';
type PaymentFilterKey = 'all' | 'cash' | 'card' | 'transfer';

const CHANNEL_OPTIONS: { key: ChannelFilterKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All Channels', icon: 'apps' },
  { key: 'storefront', label: 'Store Front', icon: 'storefront' },
  { key: 'deals', label: 'Deals & Vouchers', icon: 'local_offer' },
  { key: 'pos', label: 'POS Walk-in', icon: 'point_of_sale' },
];

const STATUS_OPTIONS: { key: StatusChipKey; label: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'new', label: 'New', pulse: true },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

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
  phone?: string;
  items: string;
  price: string;
  time: string;
  timeClass: string;
  ping?: boolean;
  paymentType?: 'cash' | 'card' | 'transfer';
  paymentIcon: string;
  paymentText: string;
  paymentChipClass: string;
  paymentIconClass?: string;
  source: {
    channelKey: 'storefront' | 'deals' | 'pos' | 'cluster';
    name: string;
    sub: string;
    icon: string;
    badgeClass: string;
  };
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
    phone: '0803 456 7890',
    items: '3 items (Ribeye Steak + 2)',
    price: '₦34,500',
    time: '4m ago',
    timeClass: 'text-primary font-semibold',
    ping: true,
    paymentType: 'card',
    paymentIcon: 'credit_card',
    paymentIconClass: 'text-primary',
    paymentText: 'POS Terminal • Pay at Counter',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    source: {
      channelKey: 'deals',
      name: 'Deals & Vouchers',
      sub: '20% Lunch Promo Voucher',
      icon: 'local_offer',
      badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    },
    action: { label: 'Accept', icon: 'check', buttonClass: 'bg-primary-container text-on-primary' },
  },
  {
    id: '#POS-1049',
    badgeLabel: 'New',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    typeChip: 'Table 04',
    typeChipClass: 'bg-surface-tint-blue text-primary',
    borderClass: 'border-secondary-container',
    customer: 'Walk-In Guest',
    customerClass: 'text-text-primary font-semibold',
    phone: '0802 111 2233',
    items: '2 items (Lunch Combo + 1)',
    price: '₦11,200',
    time: '7m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentType: 'card',
    paymentIcon: 'point_of_sale',
    paymentText: 'POS / Card • Settle at Table',
    paymentChipClass: 'bg-surface-container-highest text-secondary',
    source: {
      channelKey: 'storefront',
      name: 'Store Front',
      sub: 'Table 04 Digital QR',
      icon: 'storefront',
      badgeClass: 'bg-surface-tint-blue text-primary',
    },
    action: { label: 'Kitchen', icon: 'skillet', buttonClass: 'bg-surface-container text-on-surface' },
  },
  {
    id: '#POS-1050',
    badgeLabel: 'Processing',
    badgeClass: 'bg-surface-tint-blue text-primary',
    typeChip: 'Counter Walk-in',
    typeChipClass: 'bg-surface-container text-secondary',
    borderClass: 'border-surface-tint-blue',
    customer: 'Chidi Eze',
    customerClass: 'text-text-primary font-semibold',
    phone: '0814 333 4455',
    items: '4 items (Family Feast Combo)',
    price: '₦28,000',
    time: '14m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentType: 'cash',
    paymentIcon: 'payments',
    paymentText: 'Cash • Paid at Till',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    source: {
      channelKey: 'pos',
      name: 'POS Walk-in',
      sub: 'Till 02 Cashier Station',
      icon: 'point_of_sale',
      badgeClass: 'bg-surface-container text-on-surface-variant',
    },
    action: { label: 'Pack', icon: 'inventory_2', textClass: 'text-primary' },
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
    phone: '0809 555 6677',
    items: '2 items (Burger Duo + 1)',
    price: '₦18,200',
    time: '28m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentType: 'transfer',
    paymentIcon: 'account_balance',
    paymentText: 'Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
    source: {
      channelKey: 'cluster',
      name: 'Cluster Network',
      sub: 'Amaka Mall Cluster Cross-Promo',
      icon: 'hub',
      badgeClass: 'bg-secondary-fixed text-primary',
    },
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
    phone: '0807 888 9900',
    items: '1 item • Packed at Counter',
    price: '₦9,600',
    time: '40m ago',
    timeClass: 'text-text-secondary font-medium',
    paymentType: 'cash',
    paymentIcon: 'payments',
    paymentIconClass: 'text-badge-discount-text',
    paymentText: 'Cash • Pay on Delivery',
    paymentChipClass: 'bg-surface-container-high text-on-surface-variant',
    source: {
      channelKey: 'pos',
      name: 'POS Walk-in',
      sub: 'Till 01 Cashier Register',
      icon: 'point_of_sale',
      badgeClass: 'bg-surface-container text-on-surface-variant',
    },
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
    phone: '0901 222 3344',
    items: '3 items (Jollof Fiesta Box + 2)',
    price: '₦14,800',
    time: '1:15 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentType: 'card',
    paymentIcon: 'credit_card',
    paymentText: 'POS at Counter • Collected',
    paymentChipClass: 'bg-surface-container-low text-text-secondary',
    source: {
      channelKey: 'storefront',
      name: 'Store Front',
      sub: 'Online Store Direct',
      icon: 'storefront',
      badgeClass: 'bg-surface-tint-blue text-primary',
    },
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
    phone: '0805 777 8899',
    items: '1 item (Spicy Wings Platter)',
    price: '₦6,500',
    time: '12:40 PM',
    timeClass: 'text-text-tertiary font-medium',
    paymentType: 'transfer',
    paymentIcon: 'account_balance',
    paymentText: 'Bank Transfer • Verified',
    paymentChipClass: 'bg-badge-discount-bg text-badge-discount-text',
    source: {
      channelKey: 'deals',
      name: 'Deals & Vouchers',
      sub: 'Flash Deal Promo',
      icon: 'local_offer',
      badgeClass: 'bg-badge-discount-bg text-badge-discount-text',
    },
  },
  {
    id: '#VG-93701',
    badgeLabel: 'Cancelled',
    badgeClass: 'bg-error-container text-on-error-container',
    typeChip: 'Delivery',
    typeChipClass: 'bg-surface-container-low text-secondary',
    borderClass: '',
    customer: 'Folake Davies',
    customerClass: 'text-text-primary font-medium',
    phone: '0802 999 1122',
    items: '2 items (Grilled Fish + Fries)',
    price: '₦12,500',
    time: 'Yesterday',
    timeClass: 'text-text-tertiary font-medium',
    paymentType: 'transfer',
    paymentIcon: 'cancel',
    paymentText: 'Refunded • Bank Transfer',
    paymentChipClass: 'bg-error-container/30 text-error',
    source: {
      channelKey: 'storefront',
      name: 'Store Front',
      sub: 'Cancelled by Customer',
      icon: 'storefront',
      badgeClass: 'bg-surface-tint-blue text-primary',
    },
  },
];

export function BusinessOrdersHubScreen({
  onTab,
  onSwitchBookings,
  onOpenOrder,
}: BusinessOrdersHubScreenProps) {
  const [channelFilter, setChannelFilter] = useState<ChannelFilterKey>('all');
  const [statusChip, setStatusChip] = useState<StatusChipKey>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortNewest, setSortNewest] = useState<boolean>(true);
  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [channelMenuOpen, setChannelMenuOpen] = useState<boolean>(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  // Channel counts computed from ORDER_ROWS
  const originCounts = useMemo(() => {
    return {
      all: ORDER_ROWS.length,
      storefront: ORDER_ROWS.filter((o) => o.source.channelKey === 'storefront').length,
      deals: ORDER_ROWS.filter((o) => o.source.channelKey === 'deals').length,
      pos: ORDER_ROWS.filter((o) => o.source.channelKey === 'pos').length,
    };
  }, []);

  // Status counts computed from ORDER_ROWS
  const statusCounts = useMemo(() => {
    return {
      all: ORDER_ROWS.length,
      new: ORDER_ROWS.filter((o) => o.badgeLabel === 'New').length,
      processing: ORDER_ROWS.filter((o) => o.badgeLabel === 'Processing').length,
      ready: ORDER_ROWS.filter((o) => o.badgeLabel === 'Ready').length,
      completed: ORDER_ROWS.filter((o) => o.badgeLabel === 'Completed').length,
      cancelled: ORDER_ROWS.filter((o) => o.badgeLabel === 'Cancelled').length,
    };
  }, []);

  // Filter & search logic
  const filteredOrders = useMemo(() => {
    let result = ORDER_ROWS.filter((row) => {
      // 1. Channel filter
      if (channelFilter === 'storefront' && row.source.channelKey !== 'storefront') return false;
      if (channelFilter === 'deals' && row.source.channelKey !== 'deals') return false;
      if (channelFilter === 'pos' && row.source.channelKey !== 'pos') return false;

      // 2. Status filter
      if (statusChip !== 'all') {
        const rowStatus = row.badgeLabel.toLowerCase();
        if (statusChip === 'new' && rowStatus !== 'new') return false;
        if (statusChip === 'processing' && rowStatus !== 'processing') return false;
        if (statusChip === 'ready' && rowStatus !== 'ready') return false;
        if (statusChip === 'completed' && rowStatus !== 'completed') return false;
        if (statusChip === 'cancelled' && rowStatus !== 'cancelled') return false;
      }

      // 3. Payment filter
      if (paymentFilter !== 'all' && row.paymentType !== paymentFilter) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = row.id.toLowerCase().includes(q);
        const matchesCust = row.customer.toLowerCase().includes(q);
        const matchesPhone = row.phone ? row.phone.toLowerCase().includes(q) : false;
        const matchesItems = row.items.toLowerCase().includes(q);
        const matchesSource = row.source.name.toLowerCase().includes(q) || row.source.sub.toLowerCase().includes(q);
        if (!matchesId && !matchesCust && !matchesPhone && !matchesItems && !matchesSource) {
          return false;
        }
      }

      return true;
    });

    if (!sortNewest) {
      result = [...result].reverse();
    }

    return result;
  }, [channelFilter, statusChip, paymentFilter, searchQuery, sortNewest]);

  const hasActiveFilters =
    channelFilter !== 'all' ||
    statusChip !== 'all' ||
    paymentFilter !== 'all' ||
    Boolean(searchQuery.trim()) ||
    !sortNewest;

  const currentChannel = CHANNEL_OPTIONS.find((c) => c.key === channelFilter) || CHANNEL_OPTIONS[0];
  const currentStatus = STATUS_OPTIONS.find((s) => s.key === statusChip) || STATUS_OPTIONS[0];

  const resetAllFilters = () => {
    setChannelFilter('all');
    setStatusChip('all');
    setPaymentFilter('all');
    setSearchQuery('');
    setSortNewest(true);
    showToast('Filters cleared');
  };

  return (
    <AppScreen>
      <BusinessModeHeader title="Orders" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Header Controls & Context */}
        <div className="bg-surface/95 backdrop-blur-md px-margin pt-space-xs pb-space-xs flex flex-col gap-2 shadow-[0_4px_12px_-4px_rgba(20,27,43,0.03)]">
          {/* Switcher: Orders vs Bookings — only while the Bookings tool is on */}
          {onSwitchBookings && (
            <div className="p-1 bg-surface-container-high rounded-xl flex items-center gap-1">
              <button
                className="flex-1 py-1.5 rounded-lg bg-surface-container-lowest text-primary font-button-primary text-[12px] font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                type="button"
              >
                <span>Orders</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-tint-blue text-primary font-caption text-[10px] font-semibold">
                  {ORDER_ROWS.length}
                </span>
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-text-secondary hover:text-on-surface font-button-secondary text-[12px] flex items-center justify-center gap-1.5 transition-all"
                type="button"
                onClick={onSwitchBookings}
              >
                <span>Bookings</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-text-secondary font-caption text-[10px] font-medium">
                  3
                </span>
              </button>
            </div>
          )}

          {/* Search, Sort and Filter Control Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer name, phone, item..."
                className="w-full h-8 pl-9 pr-7 rounded-xl border border-border bg-surface-container-lowest text-[12px] text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface p-0.5"
                  aria-label="Clear search"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              )}
            </div>

            {/* Sort Newest/Oldest Button */}
            <button
              type="button"
              onClick={() => setSortNewest((v) => !v)}
              className="h-8 px-2 rounded-xl border border-border bg-surface-container-lowest text-text-secondary hover:text-on-surface text-[11px] font-medium flex items-center gap-1 shrink-0 active:scale-95 transition-all"
              title={sortNewest ? 'Showing Newest first' : 'Showing Oldest first'}
            >
              <Icon name="swap_vert" className="text-[14px]" />
              <span>{sortNewest ? 'Newest' : 'Oldest'}</span>
            </button>

            {/* Filter Tune Icon Button */}
            <button
              aria-label="Filter orders"
              type="button"
              onClick={() => setShowFilterSheet(true)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 relative shrink-0 ${
                hasActiveFilters
                  ? 'bg-surface-tint-blue text-primary border-primary/40 shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border-border hover:bg-surface-container-low'
              }`}
            >
              <Icon name="tune" className="text-[16px]" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
              )}
            </button>
          </div>

          {/* Side by side dropdowns: Channels & Orders */}
          <div className="flex items-center gap-2 relative">
            {/* Left: Channels Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setChannelMenuOpen((v) => !v);
                  setStatusMenuOpen(false);
                }}
                className={`w-full h-8 px-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-between gap-1.5 transition-all shadow-2xs active:scale-[0.98] ${
                  channelFilter !== 'all' || channelMenuOpen
                    ? 'bg-surface-tint-blue text-primary border-primary/40 font-semibold shadow-xs'
                    : 'bg-surface-container-lowest border-border text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon
                    name={currentChannel.icon}
                    className={`text-[15px] shrink-0 ${channelFilter !== 'all' ? 'text-primary' : 'text-text-tertiary'}`}
                  />
                  <span className="truncate">{currentChannel.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      channelFilter !== 'all' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    {originCounts[channelFilter]}
                  </span>
                  <Icon
                    name="expand_more"
                    className={`text-[16px] text-text-tertiary transition-transform duration-200 ${channelMenuOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Channels Dropdown Menu */}
              {channelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setChannelMenuOpen(false)} />
                  <div className="absolute top-full mt-1.5 left-0 w-full min-w-[170px] bg-surface rounded-xl shadow-xl border border-border py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider border-b border-border/50 mb-0.5">
                      Filter Channel
                    </div>
                    {CHANNEL_OPTIONS.map((opt) => {
                      const active = channelFilter === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setChannelFilter(opt.key);
                            setChannelMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 text-left text-[11px] flex items-center justify-between transition-colors ${
                            active
                              ? 'bg-surface-tint-blue text-primary font-semibold'
                              : 'text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon
                              name={opt.icon}
                              className={`text-[15px] ${active ? 'text-primary' : 'text-text-tertiary'}`}
                            />
                            <span className="truncate">{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                active ? 'bg-primary/20 text-primary' : 'bg-surface-container text-text-tertiary'
                              }`}
                            >
                              {originCounts[opt.key]}
                            </span>
                            {active && <Icon name="check" className="text-[14px] text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: Order Status Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setStatusMenuOpen((v) => !v);
                  setChannelMenuOpen(false);
                }}
                className={`w-full h-8 px-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-between gap-1.5 transition-all shadow-2xs active:scale-[0.98] ${
                  statusChip !== 'all' || statusMenuOpen
                    ? 'bg-surface-tint-blue text-primary border-primary/40 font-semibold shadow-xs'
                    : 'bg-surface-container-lowest border-border text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      statusChip === 'new'
                        ? 'bg-primary animate-pulse'
                        : statusChip !== 'all'
                        ? 'bg-primary'
                        : 'bg-surface-container-highest'
                    }`}
                  />
                  <span className="truncate">{currentStatus.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusChip !== 'all' ? 'bg-primary/15 text-primary' : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    {statusCounts[statusChip]}
                  </span>
                  <Icon
                    name="expand_more"
                    className={`text-[16px] text-text-tertiary transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Status Dropdown Menu */}
              {statusMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setStatusMenuOpen(false)} />
                  <div className="absolute top-full mt-1.5 right-0 w-full min-w-[160px] bg-surface rounded-xl shadow-xl border border-border py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider border-b border-border/50 mb-0.5">
                      Order Status
                    </div>
                    {STATUS_OPTIONS.map((opt) => {
                      const active = statusChip === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setStatusChip(opt.key);
                            setStatusMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 text-left text-[11px] flex items-center justify-between transition-colors ${
                            active
                              ? 'bg-surface-tint-blue text-primary font-semibold'
                              : 'text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                opt.pulse
                                  ? 'bg-primary animate-pulse'
                                  : active
                                  ? 'bg-primary'
                                  : 'bg-surface-container-highest'
                              }`}
                            />
                            <span className="truncate">{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                active ? 'bg-primary/20 text-primary' : 'bg-surface-container text-text-tertiary'
                              }`}
                            >
                              {statusCounts[opt.key]}
                            </span>
                            {active && <Icon name="check" className="text-[14px] text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active Filter Tags (if any active non-default filter) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-0.5 text-[11px]">
              <span className="text-text-tertiary text-[10px] font-medium">Filtered by:</span>
              {channelFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary text-[10px] font-semibold">
                  <span>{channelFilter === 'storefront' ? 'Store Front' : channelFilter === 'deals' ? 'Deals & Vouchers' : 'POS Walk-in'}</span>
                  <button type="button" onClick={() => setChannelFilter('all')}>
                    <Icon name="close" className="text-[11px]" />
                  </button>
                </span>
              )}
              {statusChip !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                  <span className="capitalize">{statusChip}</span>
                  <button type="button" onClick={() => setStatusChip('all')}>
                    <Icon name="close" className="text-[11px]" />
                  </button>
                </span>
              )}
              {paymentFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                  <span className="capitalize">Pay: {paymentFilter}</span>
                  <button type="button" onClick={() => setPaymentFilter('all')}>
                    <Icon name="close" className="text-[11px]" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                  <span>"{searchQuery.slice(0, 10)}"</span>
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <Icon name="close" className="text-[11px]" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-primary hover:underline text-[10px] font-semibold ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Scrollable Body Content */}
        <div className="px-margin pt-space-xs pb-space-xl flex flex-col gap-2.5">
          {/* Action Required Alert Strip */}
          <button
            className="bg-surface-tint-blue rounded-xl p-2.5 flex items-center justify-between text-left border border-primary/15"
            type="button"
            onClick={onOpenOrder}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="touch_app" className="text-primary text-[16px] shrink-0" />
              <span className="text-[11px] text-primary font-medium truncate">
                Tap an order to view details, accept or decline
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
              {statusCounts.new} to action
            </span>
          </button>

          {/* Orders Feed */}
          {filteredOrders.length === 0 ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-surface-canvas rounded-xl border border-dashed border-border/80">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center mb-2.5 text-text-tertiary">
                <Icon name="search_off" className="text-[20px]" />
              </div>
              <p className="text-[12px] font-bold text-on-surface">No matching orders found</p>
              <p className="text-[11px] text-text-secondary mt-1 max-w-[240px]">
                No orders match your selected channel, status, or search filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3 py-1 rounded-lg bg-surface-tint-blue text-primary text-[11px] font-semibold hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredOrders.map((row) => (
                <button
                  className={`w-full flex flex-col gap-1.5 p-3 rounded-xl bg-surface-canvas shadow-xs border border-border-subtle/50 active:scale-[0.99] transition-transform text-left ${
                    row.borderClass ? `border-l-4 ${row.borderClass}` : ''
                  } ${row.badgeLabel === 'Completed' || row.badgeLabel === 'Cancelled' ? 'opacity-80' : ''}`}
                  key={row.id}
                  type="button"
                  onClick={onOpenOrder}
                >
                  {/* Top Row: ID + Customer + Status + Price */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${row.ping ? 'bg-primary animate-pulse' : 'bg-surface-container-highest'}`} />
                      <span className="text-[12px] font-bold text-on-surface tracking-tight shrink-0">
                        {row.id}
                      </span>
                      <span className="text-[11px] text-text-secondary truncate">
                        {row.customer}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${row.badgeClass}`}>
                        {row.badgeLabel}
                      </span>
                      <span className="text-[12px] font-bold text-on-surface">
                        {row.price}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Source Attributed Tag + Items Summary + Time */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${row.source.badgeClass}`}>
                        <Icon name={row.source.icon} className="text-[12px]" />
                        <span>{row.source.name}</span>
                      </span>
                      <span className="text-[10px] text-text-tertiary truncate">
                        {row.source.sub} • {row.items}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-text-tertiary text-[10px]">
                      <span>{row.time}</span>
                      <Icon name="chevron_right" className="text-[14px]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>

      {/* Filter Bottom Sheet Modal */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowFilterSheet(false)}
          />

          {/* Sheet Body */}
          <div className="relative w-full max-w-[430px] mx-auto bg-surface rounded-t-2xl shadow-2xl border-t border-border p-4 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="tune" className="text-[18px] text-primary" />
                <h3 className="text-[14px] font-bold text-on-surface">Filter Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-container"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            {/* Filter by Channel */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Order Placement Channel
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'all' as const, label: 'All Channels', icon: 'apps' },
                  { key: 'storefront' as const, label: 'Store Front', icon: 'storefront' },
                  { key: 'deals' as const, label: 'Deals & Vouchers', icon: 'local_offer' },
                  { key: 'pos' as const, label: 'POS Walk-in', icon: 'point_of_sale' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setChannelFilter(item.key)}
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
                      channelFilter === item.key
                        ? 'bg-surface-tint-blue text-primary border-primary font-semibold'
                        : 'bg-surface-container-low text-text-secondary border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[14px]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Status */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Order Status
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'new' as const, label: 'New' },
                  { key: 'processing' as const, label: 'Processing' },
                  { key: 'ready' as const, label: 'Ready' },
                  { key: 'completed' as const, label: 'Completed' },
                  { key: 'cancelled' as const, label: 'Cancelled' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusChip(item.key)}
                    className={`h-8 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center border transition-all ${
                      statusChip === item.key
                        ? 'bg-primary text-white border-primary font-semibold'
                        : 'bg-surface-container-low text-text-secondary border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Payment Method */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Payment Method
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'all' as const, label: 'All Payments', icon: 'payments' },
                  { key: 'cash' as const, label: 'Cash Only', icon: 'payments' },
                  { key: 'card' as const, label: 'POS / Card', icon: 'credit_card' },
                  { key: 'transfer' as const, label: 'Bank Transfer', icon: 'account_balance' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPaymentFilter(item.key)}
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
                      paymentFilter === item.key
                        ? 'bg-surface-tint-blue text-primary border-primary font-semibold'
                        : 'bg-surface-container-low text-text-secondary border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[14px]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Sort Order
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSortNewest(true)}
                  className={`h-8 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 border transition-all ${
                    sortNewest
                      ? 'bg-surface-tint-blue text-primary border-primary font-semibold'
                      : 'bg-surface-container-low text-text-secondary border-transparent'
                  }`}
                >
                  <Icon name="arrow_upward" className="text-[14px]" />
                  <span>Newest First</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortNewest(false)}
                  className={`h-8 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 border transition-all ${
                    !sortNewest
                      ? 'bg-surface-tint-blue text-primary border-primary font-semibold'
                      : 'bg-surface-container-low text-text-secondary border-transparent'
                  }`}
                >
                  <Icon name="arrow_downward" className="text-[14px]" />
                  <span>Oldest First</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2 border-t border-border mt-1">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 h-9 rounded-xl border border-border text-[12px] font-semibold text-text-secondary hover:text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 h-9 rounded-xl bg-primary text-white text-[12px] font-semibold shadow-xs hover:bg-primary/95 active:scale-95 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <BusinessTabBar onTab={onTab} />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-[12px] font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
