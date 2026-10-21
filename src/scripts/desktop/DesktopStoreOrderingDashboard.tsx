import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MerchantShell } from './MerchantShell';
import { useStoreOrdering } from '../../context/StoreOrderingContext';
import {
  STORE_ORDER_STATUS_CONFIG,
  type StoreOrder,
} from '../storeOrderingData';

interface DesktopStoreOrderingDashboardProps {
  onNav: (key: string) => void;
}

export function DesktopStoreOrderingDashboard({ onNav }: DesktopStoreOrderingDashboardProps) {
  const {
    orders,
    summaryMetrics,
    updateOrderStatus,
    toggleItemAvailability,
    substituteItem,
    removeItem,
    assignStaff,
    recordStorePayment,
    completeCollection,
    settings,
    setActivePosHandoffOrderId,
    lastError,
    clearLastError,
  } = useStoreOrdering();

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total'>('newest');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Order retrieval modal by reference / QR
  const [orderRetrievalOpen, setOrderRetrievalOpen] = useState(false);
  const [retrievalInput, setRetrievalInput] = useState('');

  // Dialog states for consequential actions
  const [confirmAction, setConfirmAction] = useState<{
    type: 'accept' | 'reject' | 'cancel' | 'payment' | 'collection';
    order: StoreOrder;
  } | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pos-terminal' | 'cash' | 'bank-transfer' | 'store-credit'>('pos-terminal');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [substitutionModal, setSubstitutionModal] = useState<{
    orderId: string;
    itemId: string;
    originalName: string;
  } | null>(null);
  const [substituteName, setSubstituteName] = useState('');
  const [substitutePriceDiff, setSubstitutePriceDiff] = useState('0');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!lastError) return;
    showToast(lastError);
    clearLastError();
  }, [lastError, clearLastError]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (activeStatusFilter === 'all') return true;
        if (activeStatusFilter === 'new') return o.status === 'new';
        if (activeStatusFilter === 'preparing') return o.status === 'preparing' || o.status === 'accepted';
        if (activeStatusFilter === 'ready') return o.status === 'ready';
        if (activeStatusFilter === 'awaiting-collection') {
          return o.status === 'ready' || o.status === 'awaiting-payment' || (o.status === 'paid' && o.payment.status === 'paid-in-store');
        }
        if (activeStatusFilter === 'completed') return o.status === 'completed';
        return o.status === activeStatusFilter;
      })
      .filter((o) => {
        // Branch filter
        if (selectedBranch === 'all') return true;
        return o.branchId === selectedBranch;
      })
      .filter((o) => {
        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.orderRef.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'total') return b.confirmedTotal - a.confirmedTotal;
        return 0;
      });
  }, [orders, activeStatusFilter, selectedBranch, searchQuery, sortBy]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const handleAction = (order: StoreOrder, action: 'accept' | 'start-prep' | 'mark-ready' | 'payment' | 'collect' | 'reject' | 'cancel') => {
    if (action === 'accept') {
      const res = updateOrderStatus(order.id, 'accepted', 'Order accepted by store staff');
      if (res.ok) showToast(`Order ${order.id} accepted.`);
    } else if (action === 'start-prep') {
      const res = updateOrderStatus(order.id, 'preparing', 'Preparation started in kitchen');
      if (res.ok) showToast(`Order ${order.id} is now preparing.`);
    } else if (action === 'mark-ready') {
      const res = updateOrderStatus(order.id, 'ready', 'Order ready for customer pickup');
      if (res.ok) showToast(`Order ${order.id} marked ready for pickup.`);
    } else if (action === 'payment') {
      if (settings?.usePosForCompletion) {
        setActivePosHandoffOrderId(order.id);
        showToast(`Proceeding to VEMTAP POS Register for Order ${order.orderRef}...`);
        onNav('pos-register');
      } else {
        setPaymentRef(`STORE-${Math.floor(10000 + Math.random() * 89999)}`);
        setConfirmAction({ type: 'payment', order });
      }
    } else if (action === 'collect') {
      setConfirmAction({ type: 'collection', order });
    } else if (action === 'reject') {
      setConfirmAction({ type: 'reject', order });
    } else if (action === 'cancel') {
      setConfirmAction({ type: 'cancel', order });
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, order } = confirmAction;

    if (type === 'payment') {
      const res = recordStorePayment(order.id, paymentMethod, paymentRef, paymentNotes);
      if (res.ok) showToast(res.message);
    } else if (type === 'collection') {
      const res = completeCollection(order.id);
      if (res.ok) showToast(res.message);
    } else if (type === 'reject') {
      const res = updateOrderStatus(order.id, 'rejected', rejectReason || 'Declined by merchant');
      if (res.ok) showToast(`Order ${order.id} rejected.`);
    } else if (type === 'cancel') {
      const res = updateOrderStatus(order.id, 'cancelled', 'Cancelled by store staff');
      if (res.ok) showToast(`Order ${order.id} cancelled.`);
    }

    setConfirmAction(null);
    setRejectReason('');
    setPaymentNotes('');
  };

  const handleApplySubstitution = () => {
    if (!substitutionModal || !substituteName.trim()) return;
    const diff = parseFloat(substitutePriceDiff) || 0;
    substituteItem(substitutionModal.orderId, substitutionModal.itemId, substituteName.trim(), diff);
    showToast(`Item substituted with ${substituteName}.`);
    setSubstitutionModal(null);
    setSubstituteName('');
    setSubstitutePriceDiff('0');
  };

  return (
    <MerchantShell activeNav="store-ordering-dashboard" onNav={onNav}>
      <div className="w-full pb-space-3xl flex flex-col gap-space-xl">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-caption text-text-tertiary">
              <span>Store Front</span>
              <span>/</span>
              <span className="text-text-primary font-semibold">Live Ordering Dashboard</span>
            </div>
            <h1 className="text-heading-xl font-heading-xl text-text-primary tracking-tight">
              Store Front Dashboard
            </h1>
            <p className="text-body-sm text-text-secondary">
              Real-time customer orders placed via Store QR, Section QR, Product QR, and Public Storefront.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              type="button"
              onClick={() => {
                setRetrievalInput('');
                setOrderRetrievalOpen(true);
              }}
              className="px-space-md py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-colors"
            >
              <Icon name="qr_code_scanner" className="text-primary text-[18px]" />
              <span>Retrieve Order (Ref / QR)</span>
            </button>
            <button
              type="button"
              onClick={() => onNav('store-ordering-qr')}
              className="px-space-md py-2.5 rounded-xl border border-border bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-colors"
            >
              <Icon name="qr_code_2" className="text-primary text-[18px]" />
              <span>QR Placement &amp; Codes</span>
            </button>
            <button
              type="button"
              onClick={() => onNav('store-ordering-settings')}
              className="px-space-md py-2.5 rounded-xl border border-border bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center gap-2 shadow-xs transition-colors"
            >
              <Icon name="tune" className="text-text-secondary text-[18px]" />
              <span>Ordering Settings</span>
            </button>
          </div>
        </div>

        {/* Phase 5.A: Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: New Orders */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'new' ? 'all' : 'new')}
            className={`p-space-lg rounded-2xl border text-left transition-all ${
              activeStatusFilter === 'new'
                ? 'bg-surface-tint-blue/80 border-primary ring-2 ring-primary/20 shadow-md'
                : 'bg-surface-canvas border-border-subtle hover:border-primary/40 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-text-secondary">New Orders</span>
              <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                <Icon name="notifications_active" className="text-[20px]" />
              </div>
            </div>
            <div className="text-heading-xl font-heading-xl text-primary font-bold">
              {summaryMetrics.newOrders}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-caption text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Awaiting acceptance</span>
            </div>
          </button>

          {/* Card 2: Preparing */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'preparing' ? 'all' : 'preparing')}
            className={`p-space-lg rounded-2xl border text-left transition-all ${
              activeStatusFilter === 'preparing'
                ? 'bg-surface-tint-blue/80 border-secondary ring-2 ring-secondary/20 shadow-md'
                : 'bg-surface-canvas border-border-subtle hover:border-secondary/40 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-text-secondary">Preparing</span>
              <div className="w-9 h-9 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                <Icon name="soup_kitchen" className="text-[20px]" />
              </div>
            </div>
            <div className="text-heading-xl font-heading-xl text-on-surface font-bold">
              {summaryMetrics.preparing}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-caption text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>In kitchen / Assembly</span>
            </div>
          </button>

          {/* Card 3: Ready for Pickup */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'ready' ? 'all' : 'ready')}
            className={`p-space-lg rounded-2xl border text-left transition-all ${
              activeStatusFilter === 'ready'
                ? 'bg-badge-discount-bg/80 border-badge-discount-text ring-2 ring-badge-discount-text/20 shadow-md'
                : 'bg-surface-canvas border-border-subtle hover:border-badge-discount-text/40 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-text-secondary">Ready for Pickup</span>
              <div className="w-9 h-9 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="shopping_bag" className="text-[20px]" />
              </div>
            </div>
            <div className="text-heading-xl font-heading-xl text-badge-discount-text font-bold">
              {summaryMetrics.readyForPickup}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-caption text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span>Packaged &amp; waiting</span>
            </div>
          </button>

          {/* Card 4: Awaiting Collection / Payment */}
          <button
            type="button"
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'awaiting-collection' ? 'all' : 'awaiting-collection')}
            className={`p-space-lg rounded-2xl border text-left transition-all ${
              activeStatusFilter === 'awaiting-collection'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                : 'bg-surface-canvas border-border-subtle hover:border-amber-500/40 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md text-text-secondary">Awaiting Collection</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Icon name="payments" className="text-[20px]" />
              </div>
            </div>
            <div className="text-heading-xl font-heading-xl text-amber-700 dark:text-amber-400 font-bold">
              {summaryMetrics.awaitingCollection}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-caption text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pending customer pickup</span>
            </div>
          </button>
        </div>

        {/* Phase 5.B: Search, Filters & Controls Bar */}
        <div className="bg-surface-canvas border border-border-subtle rounded-2xl p-space-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-on-surface"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-space-sm flex-wrap">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5">
              <span className="text-caption text-text-tertiary font-medium">Status:</span>
              <select
                value={activeStatusFilter}
                onChange={(e) => setActiveStatusFilter(e.target.value)}
                className="bg-transparent text-label-md font-semibold text-on-surface focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="new">New ({summaryMetrics.newOrders})</option>
                <option value="preparing">Preparing ({summaryMetrics.preparing})</option>
                <option value="ready">Ready for Pickup ({summaryMetrics.readyForPickup})</option>
                <option value="awaiting-collection">Awaiting Collection</option>
                <option value="completed">Completed ({summaryMetrics.completedToday})</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5">
              <span className="text-caption text-text-tertiary font-medium">Branch:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-label-md font-semibold text-on-surface focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Branches</option>
                <option value="wuse-2">Wuse II Flagship</option>
                <option value="maitama">Maitama Heights</option>
                <option value="garki">Garki Branch</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5">
              <span className="text-caption text-text-tertiary font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-label-md font-semibold text-on-surface focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total">Highest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phase 5.B: Orders Table / Responsive List */}
        <div className="bg-surface-canvas border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-space-3xl text-center flex flex-col items-center justify-center gap-space-sm">
              <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-text-tertiary">
                <Icon name="inbox" className="text-[28px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">No Store Orders Found</h3>
              <p className="text-body-sm text-text-secondary max-w-sm">
                No orders match your selected filters. Try choosing a different status, clearing search query, or checking another branch.
              </p>
              {(searchQuery || activeStatusFilter !== 'all' || selectedBranch !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveStatusFilter('all');
                    setSelectedBranch('all');
                  }}
                  className="mt-2 text-primary text-label-md font-semibold hover:underline"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-subtle text-caption font-semibold text-text-secondary uppercase tracking-wider">
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Origin / Placement</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-body-sm text-on-surface">
                  {filteredOrders.map((order) => {
                    const statusMeta = STORE_ORDER_STATUS_CONFIG[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="hover:bg-surface-subtle/70 transition-colors cursor-pointer group"
                      >
                        {/* Order Ref & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary group-hover:underline">
                              {order.id}
                            </span>
                            <span className="text-[11px] text-text-tertiary font-mono">
                              {order.time}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-text-tertiary">
                              {order.customerPhone}
                            </span>
                          </div>
                        </td>

                        {/* Origin / Placement */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="font-medium text-text-primary text-[13px]">
                                {order.origin}
                              </span>
                            </div>
                            {order.placementDetails && (
                              <span className="text-[11px] text-text-tertiary truncate max-w-[170px]">
                                {order.placementDetails}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col max-w-[220px]">
                            <span className="font-medium text-text-primary truncate">
                              {order.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                            </span>
                            <span className="text-[11px] text-text-tertiary">
                              {order.items.reduce((sum, it) => sum + it.qty, 0)} items • {order.branchName}
                            </span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">
                              ₦{order.confirmedTotal.toLocaleString()}
                            </span>
                            <span className={`text-[10px] font-semibold uppercase ${
                              order.isTotalConfirmed ? 'text-badge-discount-text' : 'text-amber-600'
                            }`}>
                              {order.isTotalConfirmed ? 'Store Confirmed' : 'Estimated Total'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-semibold ${statusMeta.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Assigned Staff */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-text-secondary text-[13px]">
                            {order.assignedStaff || 'Unassigned'}
                          </span>
                        </td>

                        {/* Next Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {order.status === 'new' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAction(order, 'accept')}
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-caption shadow-xs transition-colors"
                              >
                                Accept Order
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(order, 'reject')}
                                className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-error-container/20 text-error font-semibold text-caption transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {order.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => handleAction(order, 'start-prep')}
                              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-caption shadow-xs transition-colors"
                            >
                              Start Preparation
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => handleAction(order, 'mark-ready')}
                              className="px-3 py-1.5 rounded-lg bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-caption shadow-xs transition-colors"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === 'ready' && order.payment.status !== 'paid-in-store' && (
                            <button
                              type="button"
                              onClick={() => handleAction(order, 'payment')}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-caption shadow-xs transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Icon name={settings?.usePosForCompletion ? 'point_of_sale' : 'payments'} className="text-[16px]" />
                              <span>{settings?.usePosForCompletion ? 'Continue to POS →' : 'Record Payment'}</span>
                            </button>
                          )}

                          {order.status === 'ready' && order.payment.status === 'paid-in-store' && (
                            <button
                              type="button"
                              onClick={() => handleAction(order, 'collect')}
                              className="px-3 py-1.5 rounded-lg bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-caption shadow-xs transition-colors"
                            >
                              Complete Handover
                            </button>
                          )}

                          {order.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleAction(order, 'collect')}
                              className="px-3 py-1.5 rounded-lg bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-caption shadow-xs transition-colors"
                            >
                              Complete Handover
                            </button>
                          )}

                          {(order.status === 'completed' || order.status === 'rejected' || order.status === 'cancelled') && (
                            <span className="text-caption text-text-tertiary">Archived</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Phase 5.C & 5.D: Order Details Side Panel / Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedOrderId(null)}
            />

            <div className="relative w-full max-w-xl bg-surface-canvas shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-space-lg border-b border-border-subtle flex items-center justify-between bg-surface-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center font-bold">
                    <Icon name="receipt_long" className="text-[22px]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        {selectedOrder.id}
                      </span>
                      <span className="text-caption font-mono text-text-tertiary">
                        ({selectedOrder.orderRef})
                      </span>
                    </div>
                    <span className="text-caption text-text-secondary">
                      Placed at {selectedOrder.time} • {selectedOrder.branchName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-space-lg space-y-space-lg">
                {/* Status & Origin Banner */}
                <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-text-tertiary">Order Origin:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <Icon name="qr_code_2" className="text-primary text-[18px]" />
                      <span>{selectedOrder.origin}</span>
                    </div>
                    {selectedOrder.placementDetails && (
                      <span className="text-[12px] text-text-secondary">
                        {selectedOrder.placementDetails}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-caption text-text-tertiary">Current Status:</span>
                    <span className={`px-2.5 py-1 rounded-full text-caption font-semibold ${STORE_ORDER_STATUS_CONFIG[selectedOrder.status].badgeClass}`}>
                      {STORE_ORDER_STATUS_CONFIG[selectedOrder.status].label}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2">
                  <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                    Customer Information
                  </h4>
                  <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-canvas flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {selectedOrder.customerName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">
                          {selectedOrder.customerName}
                        </span>
                        <span className="text-caption text-text-secondary">
                          {selectedOrder.customerPhone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${selectedOrder.customerPhone}`}
                        className="p-2 rounded-lg text-primary hover:bg-surface-tint-blue transition-colors"
                        title="Call Customer"
                      >
                        <Icon name="call" className="text-[18px]" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onNav('messages')}
                        className="p-2 rounded-lg text-primary hover:bg-surface-tint-blue transition-colors"
                        title="Open Chat"
                      >
                        <Icon name="chat" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  {selectedOrder.customerNotes && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Icon name="info" className="text-[16px] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Customer Note: </span>
                        {selectedOrder.customerNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ordered Items with Availability Toggle & Substitution (Phase 5.D) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                      Order Items ({selectedOrder.items.length})
                    </h4>
                    <span className="text-caption text-text-tertiary">
                      Toggle item availability if sold out
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          item.removed
                            ? 'bg-surface-subtle/50 border-dashed border-border opacity-50 line-through'
                            : item.available
                              ? 'bg-surface-canvas border-border-subtle'
                              : 'bg-error-container/10 border-error/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border-subtle"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary text-[14px]">
                                {item.name}
                              </span>
                              <span className="font-bold text-primary">×{item.qty}</span>
                            </div>
                            {item.variant && (
                              <span className="text-caption text-text-secondary block">
                                {item.variant}
                              </span>
                            )}
                            {item.options && item.options.length > 0 && (
                              <span className="text-[11px] text-text-tertiary block">
                                {item.options.join(', ')}
                              </span>
                            )}
                            {item.substituted && (
                              <span className="text-[11px] text-secondary font-semibold block mt-0.5">
                                Substituted for {item.substituted.originalName}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-text-primary text-[14px] block">
                              ₦{item.totalPrice.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-text-tertiary">
                              ₦{item.unitPrice.toLocaleString()} ea
                            </span>
                          </div>
                        </div>

                        {/* Item Control Row */}
                        {!item.removed && (
                          <div className="mt-2 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-caption">
                            <button
                              type="button"
                              onClick={() =>
                                toggleItemAvailability(selectedOrder.id, item.id, !item.available)
                              }
                              className={`flex items-center gap-1 font-semibold ${
                                item.available
                                  ? 'text-badge-discount-text hover:text-amber-600'
                                  : 'text-error hover:text-badge-discount-text'
                              }`}
                            >
                              <Icon
                                name={item.available ? 'check_circle' : 'cancel'}
                                className="text-[16px]"
                              />
                              <span>{item.available ? 'Available' : 'Mark Sold Out'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSubstitutionModal({
                                    orderId: selectedOrder.id,
                                    itemId: item.id,
                                    originalName: item.name,
                                  })
                                }
                                className="text-primary hover:underline font-semibold"
                              >
                                Substitute
                              </button>
                              <span className="text-border-subtle">•</span>
                              <button
                                type="button"
                                onClick={() => removeItem(selectedOrder.id, item.id)}
                                className="text-error hover:underline font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary: Estimated vs Confirmed Total */}
                <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between text-body-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>₦{selectedOrder.confirmedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-text-secondary">
                    <span>Tax &amp; Service Fee</span>
                    <span>Included in items</span>
                  </div>
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="font-heading-sm text-heading-sm font-bold text-text-primary block">
                        ₦{selectedOrder.confirmedTotal.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-badge-discount-text font-semibold uppercase">
                        {selectedOrder.isTotalConfirmed ? 'Store-Confirmed Total' : 'Estimated Total (Subject to Kitchen Audit)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-caption text-text-tertiary block">Payment Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-caption font-semibold ${
                        selectedOrder.payment.status === 'paid-in-store'
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : 'bg-amber-500/10 text-amber-700'
                      }`}>
                        {selectedOrder.payment.status === 'paid-in-store' ? 'Paid in Store' : 'Unpaid (Collect at Counter)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Assignment */}
                <div className="space-y-1.5">
                  <label className="font-label-md text-label-md font-semibold text-text-primary block">
                    Assigned Staff Member
                  </label>
                  <select
                    value={selectedOrder.assignedStaff || ''}
                    onChange={(e) => assignStaff(selectedOrder.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-border text-body-md text-on-surface focus:outline-hidden focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    <option value="Chef Adebayo (Head Chef)">Chef Adebayo (Head Chef)</option>
                    <option value="Ibrahim Bello (Kitchen Lead)">Ibrahim Bello (Kitchen Lead)</option>
                    <option value="Musa Danladi (Store Manager)">Musa Danladi (Store Manager)</option>
                    <option value="Grace Udoh (Front Desk)">Grace Udoh (Front Desk)</option>
                  </select>
                </div>

                {/* Status Timeline History */}
                <div className="space-y-2">
                  <h4 className="font-label-md text-label-md font-semibold text-text-primary">
                    Audit Status History
                  </h4>
                  <div className="space-y-2 border-l-2 border-border-subtle pl-3 ml-2">
                    {selectedOrder.statusHistory.map((hist, idx) => (
                      <div key={idx} className="relative text-caption">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-canvas" />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary capitalize">
                            {hist.status}
                          </span>
                          <span className="text-[11px] text-text-tertiary font-mono">
                            {hist.timestamp}
                          </span>
                        </div>
                        {hist.note && (
                          <span className="text-text-secondary text-[12px] block">
                            {hist.note}
                          </span>
                        )}
                        {hist.staffName && (
                          <span className="text-text-tertiary text-[11px] block">
                            By {hist.staffName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer Actions */}
              <div className="p-space-lg border-t border-border-subtle bg-surface-canvas flex items-center justify-between gap-space-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(selectedOrder, 'cancel')}
                    className="px-3 py-2 rounded-xl border border-border text-error hover:bg-error-container/20 text-caption font-semibold transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.status === 'new' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedOrder, 'accept')}
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-body-sm shadow-sm transition-all"
                    >
                      Accept Order
                    </button>
                  )}

                  {selectedOrder.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedOrder, 'start-prep')}
                      className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-body-sm shadow-sm transition-all"
                    >
                      Start Preparation
                    </button>
                  )}

                  {selectedOrder.status === 'preparing' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedOrder, 'mark-ready')}
                      className="px-4 py-2.5 rounded-xl bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-body-sm shadow-sm transition-all"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}

                  {selectedOrder.payment.status !== 'paid-in-store' && (
                    settings?.usePosForCompletion ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentRef(`STORE-${Math.floor(10000 + Math.random() * 89999)}`);
                            setConfirmAction({ type: 'payment', order: selectedOrder });
                          }}
                          className="px-3 py-2.5 rounded-xl border border-border hover:bg-surface-subtle text-text-secondary text-caption font-semibold transition-colors"
                        >
                          Record Inline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(selectedOrder, 'payment')}
                          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-body-sm shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Icon name="point_of_sale" className="text-[18px]" />
                          <span>Continue to POS for Checkout →</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(selectedOrder, 'payment')}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-body-sm shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Icon name="payments" className="text-[18px]" />
                        <span>Record Store Payment</span>
                      </button>
                    )
                  )}

                  {selectedOrder.payment.status === 'paid-in-store' && selectedOrder.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleAction(selectedOrder, 'collect')}
                      className="px-4 py-2.5 rounded-xl bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-body-sm shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Icon name="done_all" className="text-[18px]" />
                      <span>Complete Handover</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consequential Action Confirmation Dialogs */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setConfirmAction(null)}
            />

            <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 animate-in zoom-in-95 duration-150">
              {confirmAction.type === 'payment' && (
                <div className="space-y-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Icon name="point_of_sale" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        Record Store-Confirmed Payment
                      </h3>
                      <p className="text-caption text-text-secondary">
                        Order {confirmAction.order.id} • Confirmed: ₦{confirmAction.order.confirmedTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-subtle text-caption text-text-secondary">
                    VEMTAP does not charge customer cards online. The cashier records payment collected directly in the store.
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-text-primary">Payment Tender</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                    >
                      {settings?.paymentMethods && settings.paymentMethods.length > 0 ? (
                        settings.paymentMethods
                          .filter((m) => m.enabled)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))
                      ) : (
                        <>
                          <option value="pos-terminal">POS Card Terminal</option>
                          <option value="cash">Cash Tender</option>
                          <option value="bank-transfer">Direct Bank Transfer</option>
                          <option value="store-credit">Store Credit / Voucher</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-text-primary">Transaction Reference</label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. POS-89218"
                      className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAction}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-label-md shadow-sm"
                    >
                      Confirm Payment Recorded
                    </button>
                  </div>
                </div>
              )}

              {confirmAction.type === 'collection' && (
                <div className="space-y-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                      <Icon name="check_circle" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        Complete Order Collection
                      </h3>
                      <p className="text-caption text-text-secondary">
                        Hand over items to {confirmAction.order.customerName}
                      </p>
                    </div>
                  </div>

                  <p className="text-body-sm text-text-secondary">
                    Verify that the customer has received all packaged items for {confirmAction.order.id}. This will mark the order as Completed.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAction}
                      className="px-4 py-2 rounded-xl bg-badge-discount-text text-white font-semibold text-label-md shadow-sm"
                    >
                      Handover Complete
                    </button>
                  </div>
                </div>
              )}

              {confirmAction.type === 'reject' && (
                <div className="space-y-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
                      <Icon name="cancel" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        Reject Order {confirmAction.order.id}
                      </h3>
                      <p className="text-caption text-text-secondary">
                        Please specify a reason for the customer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-semibold text-text-primary">Reason</label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Kitchen overloaded / items sold out"
                      className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAction}
                      className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white font-semibold text-label-md shadow-sm"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {confirmAction.type === 'cancel' && (
                <div className="space-y-space-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
                      <Icon name="block" className="text-[22px]" />
                    </div>
                    <div>
                      <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                        Cancel Order {confirmAction.order.id}
                      </h3>
                      <p className="text-caption text-text-secondary">
                        Are you sure you want to cancel this order?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                    >
                      Keep Order
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAction}
                      className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white font-semibold text-label-md shadow-sm"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Item Substitution Modal */}
        {substitutionModal && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSubstitutionModal(null)}
            />

            <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 space-y-space-md animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="swap_horiz" className="text-[22px]" />
                </div>
                <div>
                  <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                    Substitute Item
                  </h3>
                  <p className="text-caption text-text-secondary">
                    Replacing: {substitutionModal.originalName}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">Replacement Item Name</label>
                <input
                  type="text"
                  value={substituteName}
                  onChange={(e) => setSubstituteName(e.target.value)}
                  placeholder="e.g. Garlic Herb Fries (Upgrade)"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">Price Difference (₦)</label>
                <input
                  type="number"
                  value={substitutePriceDiff}
                  onChange={(e) => setSubstitutePriceDiff(e.target.value)}
                  placeholder="0 or +500 or -500"
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border text-body-md"
                />
                <span className="text-[11px] text-text-tertiary">
                  Enter 0 for equal substitution, positive for upcharge, negative for discount.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubstitutionModal(null)}
                  className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySubstitution}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm"
                >
                  Apply Substitution
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Retrieval by Order Reference & QR Code Modal */}
        {orderRetrievalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setOrderRetrievalOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="qr_code_scanner" className="text-[20px]" />
                  </div>
                  <div>
                    <h3 className="font-heading-sm text-heading-sm font-bold text-text-primary">
                      Retrieve Customer Order
                    </h3>
                    <p className="text-[12px] text-text-secondary">
                      Lookup by customer Order Reference or scan order receipt QR
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderRetrievalOpen(false)}
                  className="p-1.5 rounded-lg text-text-tertiary hover:bg-surface-subtle"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>

              <div className="mt-space-md space-y-space-md">
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-text-primary">
                    Order Reference Code
                  </label>
                  <div className="relative">
                    <Icon
                      name="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]"
                    />
                    <input
                      type="text"
                      value={retrievalInput}
                      onChange={(e) => setRetrievalInput(e.target.value)}
                      placeholder="e.g. UG-8421 or customer phone / name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-border text-body-md text-text-primary focus:outline-hidden focus:border-primary font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick Sample Lookups */}
                <div className="space-y-1">
                  <span className="text-[11px] text-text-tertiary font-semibold uppercase tracking-wider block">
                    Quick Sample Lookups:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {orders.slice(0, 4).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setRetrievalInput(o.orderRef)}
                        className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-tint-blue hover:text-primary text-[12px] font-mono border border-border transition-colors"
                      >
                        {o.orderRef} ({o.customerName.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Retrieval Search Result Preview */}
                {(() => {
                  if (!retrievalInput.trim()) return null;
                  const q = retrievalInput.trim().toLowerCase();
                  const matched = orders.filter(
                    (o) =>
                      o.orderRef.toLowerCase().includes(q) ||
                      o.id.toLowerCase().includes(q) ||
                      o.customerName.toLowerCase().includes(q) ||
                      o.customerPhone.toLowerCase().includes(q)
                  );

                  if (matched.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-surface-subtle text-center text-text-secondary text-caption">
                        No orders match "{retrievalInput}". Verify reference code.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {matched.map((found) => (
                        <div
                          key={found.id}
                          className="p-3 rounded-xl border border-border bg-surface-canvas hover:border-primary/50 transition-all flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-primary text-[14px]">
                                #{found.orderRef}
                              </span>
                              <span className="text-caption font-semibold text-text-primary">
                                {found.customerName}
                              </span>
                              <span className="text-[11px] text-text-tertiary">{found.origin}</span>
                            </div>
                            <div className="text-[12px] text-text-secondary mt-0.5">
                              {found.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} • ₦{found.confirmedTotal.toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {settings?.usePosForCompletion && found.payment.status !== 'paid-in-store' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePosHandoffOrderId(found.id);
                                  setOrderRetrievalOpen(false);
                                  showToast(`Transferring Order ${found.orderRef} to POS register...`);
                                  onNav('pos-register');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-caption font-semibold shadow-xs flex items-center gap-1"
                              >
                                <Icon name="point_of_sale" className="text-[14px]" />
                                <span>POS Checkout</span>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderId(found.id);
                                setOrderRetrievalOpen(false);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-subtle text-caption font-semibold text-text-primary"
                            >
                              Open Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-caption text-text-secondary">
                  <span>Supported by VEMTAP Order Reference &amp; Store QR scan</span>
                  <button
                    type="button"
                    onClick={() => setOrderRetrievalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-surface-subtle text-label-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
            <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </MerchantShell>
  );
}
