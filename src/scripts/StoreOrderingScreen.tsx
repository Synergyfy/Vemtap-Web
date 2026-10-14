import { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessMobileDrawer } from '../components/BusinessMobileDrawer';
import { useStoreOrdering } from '../context/StoreOrderingContext';
import {
  STORE_ORDER_STATUS_CONFIG,
  type StoreOrder,
} from './storeOrderingData';

interface StoreOrderingScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onNavigateRoute?: (route: string) => void;
  initialSubTab?: 'dashboard' | 'qr' | 'settings';
}

export function StoreOrderingScreen({
  onTab,
  onNavigateRoute,
  initialSubTab = 'dashboard',
}: StoreOrderingScreenProps) {
  const {
    orders,
    summaryMetrics,
    updateOrderStatus,
    recordStorePayment,
    completeCollection,
    qrCodes,
    settings,
    updateSettings,
    toggleQrActive,
  } = useStoreOrdering();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subTab, setSubTab] = useState<'dashboard' | 'qr' | 'settings'>(initialSubTab);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  // Quick Action confirmation
  const [paymentModalOrder, setPaymentModalOrder] = useState<StoreOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pos-terminal' | 'cash' | 'bank-transfer'>('pos-terminal');
  const [paymentRef, setPaymentRef] = useState('');

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = (order: StoreOrder, action: 'accept' | 'prep' | 'ready' | 'pay' | 'collect') => {
    if (action === 'accept') {
      updateOrderStatus(order.id, 'accepted', 'Order accepted via Mobile');
      showToast(`Order ${order.id} accepted.`);
    } else if (action === 'prep') {
      updateOrderStatus(order.id, 'preparing', 'Preparation started');
      showToast(`Order ${order.id} is preparing.`);
    } else if (action === 'ready') {
      updateOrderStatus(order.id, 'ready', 'Marked ready for customer pickup');
      showToast(`Order ${order.id} is ready for pickup.`);
    } else if (action === 'pay') {
      setPaymentRef(`POS-${Math.floor(10000 + Math.random() * 89999)}`);
      setPaymentModalOrder(order);
    } else if (action === 'collect') {
      completeCollection(order.id);
      showToast(`Order ${order.id} completed collection.`);
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentModalOrder) return;
    recordStorePayment(paymentModalOrder.id, paymentMethod, paymentRef);
    showToast(`Store payment recorded for ${paymentModalOrder.id}.`);
    setPaymentModalOrder(null);
  };

  return (
    <div className="w-full min-h-screen bg-surface-subtle pb-28 text-on-surface flex flex-col items-center">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 w-full max-w-[430px] bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Drawer"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-surface-subtle"
          >
            <Icon name="menu" className="text-[22px]" />
          </button>
          <Logo variant="full" className="h-7 w-auto" />
          <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary leading-none">
            STORE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span>Store Orders</span>
          </div>
        </div>
      </header>

      {/* Sub-tab Navigation (Orders, QR Codes, Settings) */}
      <div className="w-full max-w-[430px] px-4 pt-3 pb-1">
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded-xl text-caption font-semibold">
          <button
            type="button"
            onClick={() => setSubTab('dashboard')}
            className={`py-2 rounded-lg text-center transition-all ${
              subTab === 'dashboard'
                ? 'bg-surface-canvas text-primary font-bold shadow-xs'
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            Live Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('qr')}
            className={`py-2 rounded-lg text-center transition-all ${
              subTab === 'qr'
                ? 'bg-surface-canvas text-primary font-bold shadow-xs'
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            QR Touchpoints
          </button>
          <button
            type="button"
            onClick={() => setSubTab('settings')}
            className={`py-2 rounded-lg text-center transition-all ${
              subTab === 'settings'
                ? 'bg-surface-canvas text-primary font-bold shadow-xs'
                : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-[430px] px-4 py-3 flex-1">
        {subTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Metric Summary horizontal pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-caption">
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
                className={`px-3 py-2 rounded-xl border shrink-0 flex items-center gap-2 transition-all ${
                  statusFilter === 'new'
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                    : 'bg-surface-canvas text-text-secondary border-border-subtle'
                }`}
              >
                <span>New</span>
                <span className="w-5 h-5 rounded-full bg-primary-container/20 flex items-center justify-center font-bold text-[11px]">
                  {summaryMetrics.newOrders}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'preparing' ? 'all' : 'preparing')}
                className={`px-3 py-2 rounded-xl border shrink-0 flex items-center gap-2 transition-all ${
                  statusFilter === 'preparing'
                    ? 'bg-secondary text-on-secondary border-secondary font-bold shadow-xs'
                    : 'bg-surface-canvas text-text-secondary border-border-subtle'
                }`}
              >
                <span>Preparing</span>
                <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[11px]">
                  {summaryMetrics.preparing}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready')}
                className={`px-3 py-2 rounded-xl border shrink-0 flex items-center gap-2 transition-all ${
                  statusFilter === 'ready'
                    ? 'bg-badge-discount-bg text-badge-discount-text border-badge-discount-text font-bold shadow-xs'
                    : 'bg-surface-canvas text-text-secondary border-border-subtle'
                }`}
              >
                <span>Ready</span>
                <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[11px]">
                  {summaryMetrics.readyForPickup}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                className={`px-3 py-2 rounded-xl border shrink-0 flex items-center gap-2 transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-on-surface text-surface border-on-surface font-bold shadow-xs'
                    : 'bg-surface-canvas text-text-secondary border-border-subtle'
                }`}
              >
                <span>Completed</span>
                <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[11px]">
                  {summaryMetrics.completedToday}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customer, phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-canvas border border-border text-body-sm text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-surface-canvas rounded-2xl border border-border-subtle">
                <Icon name="inbox" className="text-text-tertiary text-[32px] mx-auto mb-2" />
                <h4 className="font-bold text-text-primary text-[15px]">No Orders Found</h4>
                <p className="text-caption text-text-secondary mt-1">
                  No orders match current filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const meta = STORE_ORDER_STATUS_CONFIG[order.status];
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-2.5 active:bg-surface-subtle transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-[14px]">
                            {order.id}
                          </span>
                          <span className="text-[11px] text-text-tertiary">
                            {order.time}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-text-primary text-[14px] block">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-text-tertiary">
                            {order.customerPhone} • {order.origin}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-text-primary text-[14px] block">
                            ₦{order.confirmedTotal.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-semibold text-badge-discount-text uppercase">
                            {order.payment.status === 'paid-in-store' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      <div className="text-caption text-text-secondary line-clamp-1 bg-surface-subtle p-2 rounded-lg">
                        {order.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                      </div>

                      {/* Action buttons row */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle/60" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => handleAction(order, 'accept')}
                            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-caption"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleAction(order, 'prep')}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold text-caption"
                          >
                            Start Prep
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            type="button"
                            onClick={() => handleAction(order, 'ready')}
                            className="px-3 py-1.5 rounded-lg bg-badge-discount-text text-on-primary font-semibold text-caption"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'ready' && order.payment.status !== 'paid-in-store' && (
                          <button
                            type="button"
                            onClick={() => handleAction(order, 'pay')}
                            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-caption flex items-center gap-1"
                          >
                            <Icon name="point_of_sale" className="text-[14px]" />
                            <span>Confirm Pay</span>
                          </button>
                        )}
                        {(order.status === 'paid' || (order.status === 'ready' && order.payment.status === 'paid-in-store')) && (
                          <button
                            type="button"
                            onClick={() => handleAction(order, 'collect')}
                            className="px-3 py-1.5 rounded-lg bg-badge-discount-text text-on-primary font-semibold text-caption"
                          >
                            Handover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sub-tab: QR Touchpoints */}
        {subTab === 'qr' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary text-[14px]">Physical Touchpoints</span>
              <span className="text-caption text-text-secondary">{qrCodes.length} active</span>
            </div>

            <div className="space-y-3">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="p-3.5 rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full font-caption text-[10px] font-bold uppercase bg-surface-tint-blue text-primary">
                      {qr.type} QR
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleQrActive(qr.id)}
                      className={`text-[11px] font-bold ${qr.active ? 'text-badge-discount-text' : 'text-text-tertiary'}`}
                    >
                      {qr.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-text-primary text-[14px]">{qr.name}</h4>
                    <p className="text-caption text-text-secondary">{qr.targetLabel}</p>
                    <span className="text-[11px] text-text-tertiary">{qr.branchName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-surface-subtle p-2 rounded-xl text-center text-caption font-semibold">
                    <div>
                      <span className="text-[10px] text-text-tertiary block font-normal">Scans</span>
                      <span>{qr.scansCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block font-normal">Orders</span>
                      <span className="text-primary">{qr.ordersCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-tertiary block font-normal">Revenue</span>
                      <span className="text-badge-discount-text">₦{(qr.revenueGenerated / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-tab: Settings */}
        {subTab === 'settings' && (
          <div className="space-y-4 bg-surface-canvas p-4 rounded-2xl border border-border-subtle shadow-xs">
            <h4 className="font-bold text-text-primary text-[15px]">Store Ordering Rules</h4>

            <label className="flex items-center justify-between py-2 border-b border-border-subtle cursor-pointer">
              <span className="text-body-sm font-medium">Accept Store Orders</span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </label>

            <label className="flex items-center justify-between py-2 border-b border-border-subtle cursor-pointer">
              <span className="text-body-sm font-medium">Allow Immediate Pickup</span>
              <input
                type="checkbox"
                checked={settings.immediatePickup}
                onChange={(e) => updateSettings({ immediatePickup: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </label>

            <label className="flex items-center justify-between py-2 border-b border-border-subtle cursor-pointer">
              <span className="text-body-sm font-medium">Allow Guest Checkout</span>
              <input
                type="checkbox"
                checked={settings.guestOrderingAllowed}
                onChange={(e) => updateSettings({ guestOrderingAllowed: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </label>

            <label className="flex items-center justify-between py-2 border-b border-border-subtle cursor-pointer">
              <span className="text-body-sm font-medium">Allow Item Substitutions</span>
              <input
                type="checkbox"
                checked={settings.allowSubstitutions}
                onChange={(e) => updateSettings({ allowSubstitutions: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </label>

            <div className="space-y-1 pt-2">
              <label className="text-caption font-semibold text-text-primary">Pickup Directions</label>
              <textarea
                rows={3}
                value={settings.pickupInstructions}
                onChange={(e) => updateSettings({ pickupInstructions: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-border text-caption"
              />
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle text-[11px] text-text-secondary">
              Notice: Payment is collected directly at the store counter upon customer handover.
            </div>
          </div>
        )}
      </main>

      {/* Mobile Order Detail Full Sheet */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-[430px] mx-auto bg-surface-canvas rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden z-10 shadow-2xl animate-in slide-in-from-bottom">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary text-[16px]">{selectedOrder.id}</span>
                <span className="text-caption text-text-tertiary">({selectedOrder.time})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-body-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle">
                <div>
                  <span className="font-bold text-text-primary block">{selectedOrder.customerName}</span>
                  <span className="text-caption text-text-secondary">{selectedOrder.customerPhone}</span>
                </div>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-caption flex items-center gap-1"
                >
                  <Icon name="call" className="text-[14px]" />
                  <span>Call</span>
                </a>
              </div>

              <div>
                <span className="font-bold text-text-primary text-caption uppercase block mb-1.5">
                  Items ({selectedOrder.items.length})
                </span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-2.5 rounded-xl border border-border-subtle flex items-center justify-between text-caption">
                      <div>
                        <span className="font-semibold text-text-primary">{it.name}</span>
                        <span className="font-bold text-primary ml-1">×{it.qty}</span>
                        {it.variant && <span className="text-text-tertiary block text-[11px]">{it.variant}</span>}
                      </div>
                      <span className="font-bold text-text-primary">₦{it.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle flex items-center justify-between font-bold">
                <span>Total Amount:</span>
                <span className="text-primary text-[16px]">₦{selectedOrder.confirmedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 border-t border-border-subtle flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-caption"
              >
                Close
              </button>
              {selectedOrder.status === 'ready' && selectedOrder.payment.status !== 'paid-in-store' && (
                <button
                  type="button"
                  onClick={() => {
                    const o = selectedOrder;
                    setSelectedOrder(null);
                    handleAction(o, 'pay');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-caption"
                >
                  Confirm Pay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setPaymentModalOrder(null)} />
          <div className="relative w-full max-w-sm bg-surface-canvas rounded-2xl p-4 border border-border-subtle z-10 space-y-3">
            <h4 className="font-bold text-text-primary text-[15px]">Record Store Payment</h4>
            <p className="text-caption text-text-secondary">
              Confirm payment for {paymentModalOrder.id}: ₦{paymentModalOrder.confirmedTotal.toLocaleString()}
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-primary">Tender</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-surface-subtle border border-border text-body-sm"
              >
                <option value="pos-terminal">POS Card Terminal</option>
                <option value="cash">Cash</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-caption"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-caption"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Drawer Component */}
      <BusinessMobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active="store-ordering-dashboard"
        onSelect={(key) => {
          if (key === 'overview') onTab('overview');
          else if (key.startsWith('orders')) onTab('orders');
          else if (key.startsWith('messages')) onTab('messages');
          else if (key.startsWith('business')) onTab('business');
          else if (key.startsWith('more')) onTab('more');
          else if (key.startsWith('store-ordering')) {
            if (key === 'store-ordering-qr') setSubTab('qr');
            else if (key === 'store-ordering-settings') setSubTab('settings');
            else setSubTab('dashboard');
          } else if (onNavigateRoute) {
            onNavigateRoute(key);
          }
        }}
      />

      {/* Mobile Bottom Tab Bar */}
      <BusinessTabBar active="more" onTab={onTab} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 z-50 bg-on-surface text-surface px-4 py-2.5 rounded-xl font-label-md text-caption shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
