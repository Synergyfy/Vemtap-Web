import { useState, useMemo } from 'react';
import { Icon } from '../../components/ui/Icon';
import { OrdersPanel } from '../../components/business/OrdersPanel';
import { hasApiConfig } from '../../services/api/client';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';
import { DesktopBusinessBookingsScreen } from './DesktopBusinessBookingsScreen';
import { DesktopBusinessOrderDetailScreen } from './DesktopBusinessOrderDetailScreen';
import { type StoreOrder, type StoreOrderOrigin } from '../../scripts/storeOrderingData';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import { OrderCompletionModal } from '../../components/desktop/dialogs/OrderCompletionModal';

interface DesktopBusinessOrdersScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  initialView?: 'orders' | 'bookings';
}

type OrderFilterTab =
  | 'all'
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'awaiting-payment'
  | 'completed'
  | 'cancelled';

export function DesktopBusinessOrdersScreen({
  onNav,
  initialView = 'orders',
}: DesktopBusinessOrdersScreenProps) {
  const { orders, updateOrderStatus, setActivePosHandoffOrderId, settings } = useStoreOrdering();

  const [view, setView] = useState<'orders' | 'bookings' | 'detail'>(
    initialView === 'bookings' ? 'bookings' : 'orders'
  );
  const [tab, setTab] = useState<'orders' | 'bookings'>(
    initialView === 'bookings' ? 'bookings' : 'orders'
  );
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [originTab, setOriginTab] = useState<'all' | 'storefront' | 'deals' | 'pos'>('all');
  const [filterTab, setFilterTab] = useState<OrderFilterTab>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortNewest, setSortNewest] = useState<boolean>(true);
  const [branchMenuOpen, setBranchMenuOpen] = useState<boolean>(false);
  const [attentionSilenced, setAttentionSilenced] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<StoreOrder | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // If viewing bookings (demo board; live mode uses OrdersPanel's bookings view below)
  if (view === 'bookings' && !hasApiConfig()) {
    return (
      <DesktopBusinessBookingsScreen
        onNav={onNav}
        onOpenOrders={() => {
          setView('orders');
          setTab('orders');
        }}
      />
    );
  }

  // If viewing single order detail
  if (view === 'detail') {
    return (
      <DesktopBusinessOrderDetailScreen
        onNav={onNav}
        order={selectedOrder || orders[0]}
        onBack={() => setView('orders')}
        onAccept={() => showToast(`Order accepted — sent to kitchen`)}
        onDecline={() => showToast(`Decline flow handled`)}
      />
    );
  }

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status Tab filter
      if (filterTab === 'new' && o.status !== 'new') return false;
      if (filterTab === 'accepted' && o.status !== 'accepted') return false;
      if (filterTab === 'preparing' && o.status !== 'preparing') return false;
      if (filterTab === 'ready' && o.status !== 'ready') return false;
      if (filterTab === 'awaiting-payment') {
        const isUnpaid = o.payment.status === 'unpaid' || o.payment.status === 'partially-paid';
        if (!isUnpaid || o.status === 'completed' || o.status === 'cancelled') return false;
      }
      if (filterTab === 'completed' && o.status !== 'completed') return false;
      if (filterTab === 'cancelled' && o.status !== 'cancelled' && o.status !== 'rejected') return false;

      // Origin Tab Filter (Store Front, Deals, POS)
      if (originTab === 'storefront') {
        if (!['Storefront', 'Public Store Page', 'Store QR', 'Category QR', 'Product QR'].includes(o.origin)) return false;
      } else if (originTab === 'deals') {
        if (!['Deal', 'Cluster'].includes(o.origin)) return false;
      } else if (originTab === 'pos') {
        if (!['POS', 'POS Walk-in'].includes(o.origin)) return false;
      }

      // Source / Channel filter
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'Storefront' && o.origin !== 'Storefront' && o.origin !== 'Public Store Page') return false;
        else if (sourceFilter !== 'Storefront' && o.origin !== sourceFilter) return false;
      }

      // Branch filter
      if (branchFilter !== 'all' && o.branchId !== branchFilter) return false;

      // Search query (Order number, customer name, phone, item names)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = o.orderRef.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q) || o.customerPhone.toLowerCase().includes(q);
        const matchesItems = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesRef && !matchesCustomer && !matchesItems) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!sortNewest) return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [orders, filterTab, originTab, sourceFilter, branchFilter, searchQuery, sortNewest]);

  // Origin counts for tabs
  const originCounts = useMemo(() => {
    return {
      all: orders.length,
      storefront: orders.filter((o) =>
        ['Storefront', 'Public Store Page', 'Store QR', 'Category QR', 'Product QR'].includes(o.origin)
      ).length,
      deals: orders.filter((o) => ['Deal', 'Cluster'].includes(o.origin)).length,
      pos: orders.filter((o) => ['POS', 'POS Walk-in'].includes(o.origin)).length,
    };
  }, [orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === 'new').length,
      accepted: orders.filter((o) => o.status === 'accepted').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      awaitingPayment: orders.filter(
        (o) => (o.payment.status === 'unpaid' || o.payment.status === 'partially-paid') && o.status !== 'completed' && o.status !== 'cancelled'
      ).length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length,
    };
  }, [orders]);

  const attentionOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'new');
  }, [orders]);

  const handleAcceptAll = () => {
    attentionOrders.forEach((o) => {
      updateOrderStatus(o.id, 'accepted', 'Batch accepted by manager', 'Store Manager');
    });
    showToast(`All ${attentionOrders.length} pending orders accepted — kitchen notified`);
  };

  const getOriginBadge = (origin: StoreOrderOrigin) => {
    switch (origin) {
      case 'Storefront':
      case 'Public Store Page':
        return { label: 'Store Front', icon: 'storefront', className: 'bg-primary/10 text-primary' };
      case 'Store QR':
        return { label: 'Store Front QR', icon: 'qr_code_2', className: 'bg-emerald-500/15 text-emerald-700' };
      case 'Category QR':
        return { label: 'Category QR', icon: 'category', className: 'bg-indigo-500/15 text-indigo-700' };
      case 'Product QR':
        return { label: 'Product QR', icon: 'inventory_2', className: 'bg-violet-500/15 text-violet-700' };
      case 'Deal':
        return { label: 'Deals', icon: 'local_offer', className: 'bg-amber-500/15 text-amber-800' };
      case 'Service':
        return { label: 'Service', icon: 'room_service', className: 'bg-cyan-500/15 text-cyan-800' };
      case 'Booking':
        return { label: 'Booking', icon: 'calendar_month', className: 'bg-teal-500/15 text-teal-800' };
      case 'Cluster':
        return { label: 'Cluster Campaign', icon: 'hub', className: 'bg-fuchsia-500/15 text-fuchsia-800' };
      case 'POS':
      case 'POS Walk-in':
        return { label: 'POS Counter', icon: 'point_of_sale', className: 'bg-surface-subtle text-text-secondary' };
      default:
        return { label: origin, icon: 'receipt', className: 'bg-surface-subtle text-text-secondary' };
    }
  };

  // Live: real orders and bookings for the active branch; the designed board below is the demo.
  if (hasApiConfig()) {
    return (
      <BusinessPortalChrome activeNav={initialView === 'bookings' ? 'orders-bookings' : 'orders-all'} onNav={onNav}>
        <div className="w-full py-space-xl flex flex-col gap-space-lg">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Orders &amp; Bookings</h1>
            <p className="font-body-md text-body-md text-text-secondary">Accept, prepare and complete orders; confirm and close bookings.</p>
          </div>
          <OrdersPanel key={initialView} initialView={initialView} />
        </div>
      </BusinessPortalChrome>
    );
  }

  return (
    <BusinessPortalChrome activeNav="orders-all" onNav={onNav}>
      <div className="w-full bg-background">
        <div className="w-full py-space-xl space-y-space-lg">
          {/* Header Operational Bar */}
          <div className="flex flex-wrap items-center gap-space-sm justify-between">
            <div className="flex items-center gap-space-sm flex-wrap">
              {/* Branch Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchMenuOpen((v) => !v)}
                  className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl border border-border bg-surface text-on-surface font-label-sm text-label-sm hover:bg-surface-subtle transition-colors shadow-2xs"
                >
                  <Icon name="store" className="text-[16px] text-primary" />
                  <span>
                    {branchFilter === 'wuse-2'
                      ? 'Wuse II Flagship'
                      : branchFilter === 'maitama'
                        ? 'Maitama Heights'
                        : 'All Branches (Abuja)'}
                  </span>
                  <Icon name="expand_more" className="text-[14px]" />
                </button>

                {branchMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setBranchFilter('all');
                        setBranchMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-surface-subtle text-on-surface font-body-md text-body-md flex items-center justify-between"
                    >
                      <span>All Branches</span>
                      {branchFilter === 'all' && <Icon name="check" className="text-[16px] text-primary" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBranchFilter('wuse-2');
                        setBranchMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-surface-subtle text-on-surface font-body-md text-body-md flex items-center justify-between"
                    >
                      <span>Wuse II Flagship</span>
                      {branchFilter === 'wuse-2' && <Icon name="check" className="text-[16px] text-primary" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBranchFilter('maitama');
                        setBranchMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-surface-subtle text-on-surface font-body-md text-body-md flex items-center justify-between"
                    >
                      <span>Maitama Heights</span>
                      {branchFilter === 'maitama' && <Icon name="check" className="text-[16px] text-primary" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Channel / Source Dropdown */}
              <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1 text-label-sm">
                <span className="text-text-tertiary">Channel:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-transparent text-text-primary font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Sources &amp; Channels</option>
                  <option value="Storefront">Public Storefront</option>
                  <option value="Store QR">Store QR Code</option>
                  <option value="Category QR">Category QR Code</option>
                  <option value="Product QR">Product QR Code</option>
                  <option value="Deal">Deals &amp; Promotions</option>
                  <option value="Service">Services &amp; Appointments</option>
                  <option value="Booking">Bookings &amp; Tables</option>
                  <option value="Cluster">Cluster Discovery</option>
                  <option value="POS Walk-in">POS Walk-in</option>
                </select>
              </div>

              {/* Status Badge */}
              <span className="flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-label-sm text-label-sm font-medium">
                <Icon name="restaurant" className="text-[14px]" />
                <span>Central Orders Hub Live</span>
              </span>
            </div>

            {/* Quick POS Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNav('pos' as BusinessPortalNavKey)}
                className="h-10 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 shadow-sm flex items-center gap-space-xs font-semibold transition-all"
              >
                <Icon name="point_of_sale" className="text-[18px]" />
                <span>Open POS Terminal</span>
              </button>
            </div>
          </div>

          {/* Attention Banner if new orders exist */}
          {!attentionSilenced && attentionOrders.length > 0 && (
            <section className="rounded-2xl p-space-md bg-gradient-to-r from-error/10 to-surface-tint-blue border border-error/20 flex flex-wrap items-center justify-between gap-space-md animate-in slide-in-from-top-1">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center font-bold">
                  <Icon name="notifications_active" className="text-[22px]" />
                </div>
                <div>
                  <div className="font-heading-sm text-heading-sm text-on-surface font-bold">
                    {attentionOrders.length} order{attentionOrders.length > 1 ? 's' : ''} awaiting immediate acceptance
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Incoming orders from Storefront, QR codes &amp; Deal vouchers.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setAttentionSilenced(true)}
                  className="px-space-sm py-2 rounded-lg border border-border font-label-sm text-label-sm text-on-surface-variant hover:bg-surface transition-colors"
                >
                  Silence
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm font-semibold hover:opacity-90 shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Icon name="done_all" className="text-[16px]" />
                  <span>Accept All ({attentionOrders.length})</span>
                </button>
              </div>
            </section>
          )}

          {/* Main View Switcher & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            {/* Orders vs Bookings Main Tab Switcher */}
            <div className="flex items-center bg-surface-subtle rounded-xl p-space-2xs border border-border-subtle w-fit">
              <button
                type="button"
                onClick={() => {
                  setTab('orders');
                  setView('orders');
                }}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                  tab === 'orders'
                    ? 'bg-surface text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name="receipt_long" className="text-[18px]" />
                <span>All Orders</span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('bookings');
                  setView('bookings');
                }}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                  tab === 'bookings'
                    ? 'bg-surface text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name="calendar_month" className="text-[18px]" />
                <span>Bookings &amp; Tables</span>
              </button>
            </div>

            {/* Search and Sort controls */}
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order #, customer name, phone, item..."
                  className="w-full h-11 pl-10 pr-space-sm rounded-xl border border-border bg-surface font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary shadow-2xs transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => setSortNewest((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-surface text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-subtle transition-colors shrink-0 shadow-2xs"
              >
                <Icon name="swap_vert" className="text-[16px]" />
                <span>{sortNewest ? 'Newest' : 'Oldest'}</span>
              </button>
            </div>
          </div>

          {/* Order Origin Channel Tabs (Store Front, Deals, POS Walk-in) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-border/60 pb-2.5">
            {[
              { key: 'all' as const, label: 'All Channels', icon: 'apps', count: originCounts.all },
              { key: 'storefront' as const, label: 'Store Front', icon: 'storefront', count: originCounts.storefront },
              { key: 'deals' as const, label: 'Deals & Vouchers', icon: 'local_offer', count: originCounts.deals },
              { key: 'pos' as const, label: 'POS Walk-in', icon: 'point_of_sale', count: originCounts.pos },
            ].map((ot) => (
              <button
                key={ot.key}
                type="button"
                onClick={() => setOriginTab(ot.key)}
                className={`px-3.5 py-2 rounded-xl font-label-md text-label-md transition-all flex items-center gap-2 shrink-0 ${
                  originTab === ot.key
                    ? 'bg-surface font-bold text-primary shadow-xs border border-border ring-1 ring-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-transparent'
                }`}
              >
                <Icon name={ot.icon} className="text-[18px]" />
                <span>{ot.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    originTab === ot.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-subtle text-text-tertiary'
                  }`}
                >
                  {ot.count}
                </span>
              </button>
            ))}
          </div>

          {/* Unified Status Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-border pb-3">
            {[
              { key: 'all' as const, label: 'All Orders', count: tabCounts.all },
              { key: 'new' as const, label: 'New / Pending', count: tabCounts.new, alert: tabCounts.new > 0 },
              { key: 'accepted' as const, label: 'Accepted', count: tabCounts.accepted },
              { key: 'preparing' as const, label: 'Preparing', count: tabCounts.preparing },
              { key: 'ready' as const, label: 'Ready for Pickup', count: tabCounts.ready, highlight: tabCounts.ready > 0 },
              { key: 'awaiting-payment' as const, label: 'Awaiting Payment', count: tabCounts.awaitingPayment },
              { key: 'completed' as const, label: 'Completed', count: tabCounts.completed },
              { key: 'cancelled' as const, label: 'Cancelled / Rejected', count: tabCounts.cancelled },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterTab(f.key)}
                className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm border transition-all flex items-center gap-1.5 shrink-0 ${
                  filterTab === f.key
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                    : 'bg-surface border-border text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                    filterTab === f.key
                      ? 'bg-on-primary/20 text-on-primary'
                      : f.alert
                        ? 'bg-error text-on-error'
                        : 'bg-surface-subtle text-text-tertiary'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Unified Orders List Grid */}
          <div className="space-y-space-md">
            {filteredOrders.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center mx-auto text-text-tertiary">
                  <Icon name="search_off" className="text-[28px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                  No orders match this filter
                </h3>
                <p className="text-body-sm text-text-secondary max-w-md mx-auto">
                  Try clearing the search query or switching the status / channel filter above.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all');
                    setSourceFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-container font-semibold text-caption text-text-primary transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const originBadge = getOriginBadge(order.origin);
                const isPaid =
                  order.payment.status === 'paid-in-store' ||
                  order.payment.status === 'paid-pos' ||
                  order.status === 'completed';
                const total = order.confirmedTotal || order.estimatedTotal;

                return (
                  <article
                    key={order.id}
                    className="bg-surface rounded-2xl shadow-sm border border-border p-space-md hover:border-primary/50 transition-all space-y-space-sm"
                  >
                    {/* Top Row: Ref, Status, Channel, Time, Amount */}
                    <div className="flex flex-wrap items-start justify-between gap-space-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Order Reference Number */}
                        <span className="font-mono font-bold text-heading-sm text-text-primary">
                          #{order.orderRef}
                        </span>

                        {/* Status Pill */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-caption font-bold uppercase tracking-wider ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : order.status === 'ready'
                                ? 'bg-badge-discount-bg text-badge-discount-text'
                                : order.status === 'preparing'
                                  ? 'bg-amber-500/15 text-amber-800'
                                  : order.status === 'accepted'
                                    ? 'bg-surface-tint-blue text-primary'
                                    : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {order.status === 'new'
                            ? 'NEW'
                            : order.status === 'accepted'
                              ? 'ACCEPTED'
                              : order.status === 'preparing'
                                ? 'IN KITCHEN'
                                : order.status === 'ready'
                                  ? 'READY FOR PICKUP'
                                  : order.status === 'completed'
                                    ? 'COMPLETED'
                                    : order.status}
                        </span>

                        {/* Origin Channel Pill */}
                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-semibold ${originBadge.className}`}
                        >
                          <Icon name={originBadge.icon} className="text-[14px]" />
                          <span>{originBadge.label}</span>
                        </span>

                        {/* Branch & Time */}
                        <span className="text-caption text-text-tertiary">
                          {order.time} • {order.branchName}
                        </span>
                      </div>

                      {/* Financial Amount & Settlement Status */}
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-heading-sm text-text-primary">
                          ₦{total.toLocaleString()}
                        </div>
                        <div
                          className={`font-label-sm text-label-sm ${
                            isPaid ? 'text-badge-discount-text font-semibold' : 'text-amber-600 font-semibold'
                          }`}
                        >
                          {isPaid ? `Paid (${order.payment.method || 'Verified'})` : 'Awaiting Payment'}
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Customer Info & Items Recap */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-1 border-t border-border-subtle">
                      <div>
                        <div className="font-body-md text-body-md text-text-primary font-semibold flex items-center gap-2">
                          <span>{order.customerName}</span>
                          <span className="text-caption text-text-tertiary font-normal">
                            ({order.customerPhone})
                          </span>
                        </div>
                        <div className="text-body-sm text-text-secondary mt-0.5">
                          {order.items.map((i) => `${i.name} ×${i.qty}`).join(' • ')}
                        </div>
                      </div>

                      {order.placementDetails && (
                        <div className="text-caption text-text-tertiary font-medium shrink-0 bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-subtle">
                          {order.placementDetails}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 border-t border-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, 'accepted', 'Order accepted', 'Store Staff');
                              showToast(`Order #${order.orderRef} accepted`);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Icon name="check" className="text-[16px]" />
                            <span>Accept</span>
                          </button>
                        )}

                        {order.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, 'preparing', 'Sent to kitchen', 'Store Staff');
                              showToast(`Order #${order.orderRef} sent to kitchen`);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Icon name="restaurant" className="text-[16px]" />
                            <span>Start Prep</span>
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, 'ready', 'Marked ready', 'Store Staff');
                              showToast(`Order #${order.orderRef} marked ready for pickup`);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-badge-discount-text text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Icon name="check_circle" className="text-[16px]" />
                            <span>Mark Ready</span>
                          </button>
                        )}

                        {/* Order Completion Actions (Method A vs Method B) */}
                        {!isPaid && (order.status === 'ready' || order.status === 'preparing' || order.status === 'accepted') && (
                          settings?.usePosForCompletion ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePosHandoffOrderId(order.id);
                                  showToast(`Transferring Order #${order.orderRef} to POS Register...`);
                                  onNav('pos-sale' as BusinessPortalNavKey);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-2xs"
                              >
                                <Icon name="point_of_sale" className="text-[16px]" />
                                <span>Complete in POS →</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentModalOrder(order)}
                                className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-surface-subtle font-label-sm text-label-sm font-semibold transition-colors"
                              >
                                Record External Payment
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPaymentModalOrder(order)}
                              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <Icon name="payments" className="text-[16px]" />
                              <span>Record Payment &amp; Complete</span>
                            </button>
                          )
                        )}

                        {isPaid && order.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, 'completed', 'Order handed over', 'Store Staff');
                              showToast(`Order #${order.orderRef} completed`);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-badge-discount-text text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Icon name="done_all" className="text-[16px]" />
                            <span>Complete Handover</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setView('detail');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-subtle font-label-sm text-label-sm text-text-primary font-semibold transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onNav('messages')}
                          className="p-1.5 rounded-lg text-primary hover:bg-surface-tint-blue transition-colors"
                          title="Message customer"
                        >
                          <Icon name="chat" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Method A Payment Modal */}
      {paymentModalOrder && (
        <OrderCompletionModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onCompleted={(updated) => {
            setPaymentModalOrder(null);
            showToast(`Order #${updated.orderRef} payment recorded & completed!`);
          }}
        />
      )}

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span>{toast}</span>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
