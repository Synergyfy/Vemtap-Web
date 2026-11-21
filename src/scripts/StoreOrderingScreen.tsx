import { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessMobileDrawer } from '../components/BusinessMobileDrawer';
import { OrderQrArt } from '../components/ui/OrderQrArt';
import { useStoreOrdering } from '../context/StoreOrderingContext';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useTeam } from '../hooks/business/useBranchesAndTeam';
import { hasApiConfig } from '../services/api/client';
import { usePrimaryStoreQrLinks } from '../hooks/business/usePrimaryStoreQrLinks';
import {
  STORE_ORDER_STATUS_CONFIG,
  completedByLabel,
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
    assignStaff,
    staffOptionsFor,
    staffValueFor,
    qrCodes,
    settings,
    settingsLoading,
    settingsSaving,
    updateSettings,
    toggleQrActive,
    lastError,
    clearLastError,
  } = useStoreOrdering();

  const primaryQr = usePrimaryStoreQrLinks();
  const [primaryQrTab, setPrimaryQrTab] = useState<'store' | 'category' | 'product'>('store');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  useEffect(() => {
    if (primaryQr.categories.length && !primaryQr.categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(primaryQr.categories[0].id);
    }
    if (primaryQr.products.length && !primaryQr.products.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(primaryQr.products[0].id);
    }
  }, [primaryQr.categories, primaryQr.products, selectedCategoryId, selectedProductId]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subTab, setSubTab] = useState<'dashboard' | 'qr' | 'settings'>(initialSubTab);
  const [originFilter, setOriginFilter] = useState<'all' | 'storefront' | 'deals' | 'pos'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  // Keyed (not object) state so the sheet keeps reflecting live assignment/status changes.
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId || o.orderRef === selectedOrderId) ?? null;
  const enabledPaymentMethods = settings.paymentMethods.filter((method) => method.enabled);

  // Settings use the same live data as desktop: branches and staff come from the
  // real business queries, and the draft is seeded from GET /store-ordering/settings.
  const live = hasApiConfig();
  const { branches, isLive: branchesLoaded } = useBusinessBranch();
  const team = useTeam();
  const [settingsDraft, setSettingsDraft] = useState(settings);
  useEffect(() => setSettingsDraft(settings), [settings]);

  const branchCards = live
    ? (branchesLoaded ? branches : []).map((b) => ({ key: b.id ?? b.key, name: b.name, address: b.area }))
    : [
        { key: 'wuse-2', name: 'Wuse II Flagship', address: 'Plot 1428 Adetokunbo Ademola Cres, Abuja' },
        { key: 'maitama', name: 'Maitama Heights', address: 'Plot 14 Amazon Street, Maitama, Abuja' },
        { key: 'garki', name: 'Garki Branch', address: 'Area 11 Commercial District, Abuja' },
      ];
  const staffOptions = live
    ? (team.data ?? []).map((member) => {
        const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || 'Team member';
        const role = member.roleTag || member.jobTitle || member.role;
        return { key: member.id, label: role ? `${name} (${role})` : name };
      })
    : ['Chef Adebayo (Head Chef)', 'Musa Danladi (Store Manager)', 'Grace Udoh (Front Desk)', 'Ibrahim Bello (Kitchen Lead)'].map(
        (label) => ({ key: label, label }),
      );
  const isBranchActive = (key: string) => (live ? settingsDraft.activeBranches[key] !== false : Boolean(settingsDraft.activeBranches[key]));

  const patchSettingsDraft = (patch: Partial<typeof settingsDraft>) =>
    setSettingsDraft((prev) => ({ ...prev, ...patch }));

  const handleBranchToggle = (branchKey: string) =>
    patchSettingsDraft({
      activeBranches: {
        ...settingsDraft.activeBranches,
        [branchKey]: !isBranchActive(branchKey),
      },
    });

  const handlePaymentMethodToggle = (methodId: string) =>
    patchSettingsDraft({
      paymentMethods: settingsDraft.paymentMethods.map((method) =>
        method.id === methodId ? { ...method, enabled: !method.enabled } : method,
      ),
    });

  const handleSettingsSave = async () => {
    if (settingsLoading || settingsSaving) return;
    const result = await updateSettings(settingsDraft);
    showToast(result.message);
  };

  // Quick Action confirmation
  const [paymentModalOrder, setPaymentModalOrder] = useState<StoreOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 2500);
  };
  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!lastError) return;
    showToast(lastError);
    clearLastError();
  }, [lastError, clearLastError]);

  const originCounts = {
    all: orders.length,
    storefront: orders.filter((o) =>
      ['Storefront', 'Public Store Page', 'Store QR', 'Category QR', 'Product QR'].includes(o.origin)
    ).length,
    deals: orders.filter((o) => ['Deal', 'Cluster'].includes(o.origin)).length,
    pos: orders.filter((o) => ['POS', 'POS Walk-in'].includes(o.origin)).length,
  };

  const filteredOrders = orders.filter((o) => {
    if (originFilter === 'storefront') {
      if (!['Storefront', 'Public Store Page', 'Store QR', 'Category QR', 'Product QR'].includes(o.origin)) return false;
    } else if (originFilter === 'deals') {
      if (!['Deal', 'Cluster'].includes(o.origin)) return false;
    } else if (originFilter === 'pos') {
      if (!['POS', 'POS Walk-in'].includes(o.origin)) return false;
    }

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

  /**
   * Mobile parity with the desktop dashboard: payment, handover and POS
   * completion all need a named person, so an unassigned order opens the
   * detail sheet (where the picker lives) instead of being completed.
   */
  const requireCompleter = (order: StoreOrder) => {
    if (order.assignedStaff || order.assignedStaffId) return true;
    setSelectedOrderId(order.id);
    showToast(
      `Order ${order.orderRef}: assign the person completing this order under "Assigned Staff Member" first.`,
    );
    return false;
  };

  const completedBy = (order: StoreOrder) => completedByLabel(order);

  const handleAction = (order: StoreOrder, action: 'accept' | 'prep' | 'ready' | 'pay' | 'collect') => {
    if (action === 'accept') {
      const res = updateOrderStatus(order.id, 'accepted', 'Order accepted via Mobile');
      showToast(res.ok ? `Order ${order.id} accepted.` : res.message);
    } else if (action === 'prep') {
      const res = updateOrderStatus(order.id, 'preparing', 'Preparation started');
      showToast(res.ok ? `Order ${order.id} is preparing.` : res.message);
    } else if (action === 'ready') {
      const res = updateOrderStatus(order.id, 'ready', 'Marked ready for customer pickup');
      showToast(res.ok ? `Order ${order.id} is ready for pickup.` : res.message);
    } else if (action === 'pay') {
      if (!requireCompleter(order)) return;
      setPaymentMethod(enabledPaymentMethods[0]?.id ?? '');
      setPaymentRef('');
      setPaymentModalOrder(order);
    } else if (action === 'collect') {
      if (!requireCompleter(order)) return;
      const res = completeCollection(order.id);
      showToast(res.message);
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentModalOrder || !paymentMethod) return;
    const res = recordStorePayment(paymentModalOrder.id, paymentMethod, paymentRef);
    showToast(res.message);
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
            STORE FRONT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" />
            <span>Store Front</span>
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
          <div className="space-y-3.5">
            {/* Origin Channel Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { key: 'all' as const, label: 'All Channels', count: originCounts.all },
                { key: 'storefront' as const, label: 'Store Front', count: originCounts.storefront },
                { key: 'deals' as const, label: 'Deals', count: originCounts.deals },
                { key: 'pos' as const, label: 'POS', count: originCounts.pos },
              ].map((ot) => (
                <button
                  key={ot.key}
                  type="button"
                  onClick={() => setOriginFilter(ot.key)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    originFilter === ot.key
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-canvas border border-border-subtle text-text-secondary hover:text-on-surface'
                  }`}
                >
                  <span>{ot.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      originFilter === ot.key
                        ? 'bg-on-primary/20 text-on-primary'
                        : 'bg-surface-container text-text-tertiary'
                    }`}
                  >
                    {ot.count}
                  </span>
                </button>
              ))}
            </div>

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
                    ? 'bg-on-surface text-inverse-on-surface border-on-surface font-bold shadow-xs'
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
                      onClick={() => setSelectedOrderId(order.id)}
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
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[11px] text-text-tertiary">
                              {order.customerPhone}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                              <Icon
                                name={order.origin.includes('Deal') ? 'local_offer' : order.origin.includes('POS') ? 'point_of_sale' : 'storefront'}
                                className="text-[11px]"
                              />
                              <span>
                                {['Storefront', 'Public Store Page', 'Store QR', 'Category QR', 'Product QR'].includes(order.origin)
                                  ? 'Store Front'
                                  : ['Deal', 'Cluster'].includes(order.origin)
                                    ? 'Deal'
                                    : order.origin}
                              </span>
                            </span>
                          </div>
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

                      {/* Assigned staff (same column as the desktop table) */}
                      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <Icon name="badge" className="text-[13px] text-text-tertiary" />
                        <span className="text-text-tertiary">Assigned:</span>
                        <span className={`font-semibold ${order.assignedStaff ? 'text-text-primary' : 'text-amber-600'}`}>
                          {order.assignedStaff || 'Unassigned'}
                        </span>
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
            <div className="rounded-2xl bg-surface-canvas border border-border-subtle shadow-xs overflow-hidden">
              <div className="px-3.5 pt-3.5 pb-2.5 flex items-start gap-2">
                <Icon name="qr_code_2" className="text-primary text-[20px] shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-text-primary text-[14px]">Primary QR Destinations</h4>
                  <p className="text-caption text-text-secondary">Stable links that open the live storefront, a category or a product.</p>
                </div>
              </div>
              <div className="flex border-b border-border-subtle px-3.5 gap-1">
                {(['store', 'category', 'product'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPrimaryQrTab(tab)}
                    className={`px-3 py-2 font-semibold capitalize border-b-2 -mb-px text-[13px] transition-colors ${
                      primaryQrTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {(() => {
                const url =
                  primaryQrTab === 'store'
                    ? primaryQr.storeUrl
                    : primaryQrTab === 'category'
                      ? primaryQr.categoryUrl(selectedCategoryId)
                      : primaryQr.productUrl(selectedProductId);
                return (
                  <div className="p-3.5 flex flex-col gap-3">
                    {primaryQrTab === 'category' ? (
                      <select
                        aria-label="Select category"
                        value={selectedCategoryId}
                        onChange={(event) => setSelectedCategoryId(event.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-on-surface"
                      >
                        {primaryQr.categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    ) : null}
                    {primaryQrTab === 'product' ? (
                      <select
                        aria-label="Select product"
                        value={selectedProductId}
                        onChange={(event) => setSelectedProductId(event.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-body-md text-on-surface"
                      >
                        {primaryQr.products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    ) : null}
                    <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-3">
                      {url ? (
                        <OrderQrArt value={url} alt={`${primaryQrTab} QR code`} size={128} />
                      ) : (
                        <p role="status" className="font-caption text-caption text-text-secondary">Loading QR link…</p>
                      )}
                      {url ? <p className="w-full break-all text-center font-caption text-caption text-text-secondary">{url}</p> : null}
                    </div>
                    <button
                      type="button"
                      disabled={!url}
                      onClick={() => {
                        navigator.clipboard?.writeText(url);
                        showToast(`${primaryQrTab} QR link copied!`);
                      }}
                      className="h-10 w-full rounded-xl border border-border-subtle text-primary font-label-md text-label-md font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Icon name="content_copy" className="text-[16px]" />
                      Copy Link
                    </button>
                  </div>
                );
              })()}
            </div>

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

                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-3">
                    {qr.destinationUrl ? (
                      <OrderQrArt value={qr.destinationUrl} alt={`${qr.name} QR code`} size={128} />
                    ) : (
                      <p role="alert" className="font-caption text-caption text-error">QR destination is unavailable.</p>
                    )}
                    {qr.destinationUrl && (
                      <p className="w-full break-all text-center font-caption text-caption text-text-secondary">{qr.destinationUrl}</p>
                    )}
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
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-bold text-text-primary text-[15px]">Store Front Rules</h4>
              <button
                type="button"
                onClick={handleSettingsSave}
                disabled={settingsLoading || settingsSaving}
                className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-semibold text-caption disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {settingsSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <div className="flex flex-col">
                <span className="text-body-sm font-medium">Accept Store Orders</span>
                <span className="text-[11px] text-text-tertiary">
                  {settingsDraft.enabled ? 'Store and QR ordering is active' : 'Store and QR ordering is disabled'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settingsDraft.enabled}
                onChange={(e) => patchSettingsDraft({ enabled: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <div className="flex flex-col max-w-[72%]">
                <span className="text-body-sm font-medium">VEMTAP POS Completion Mode</span>
                <span className="text-[11px] text-text-tertiary">
                  {settingsDraft.usePosForCompletion
                    ? 'Ready orders continue in POS register'
                    : 'Complete and take payment inside Store Front'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settingsDraft.usePosForCompletion}
                onChange={(e) => patchSettingsDraft({ usePosForCompletion: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </div>

            <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle space-y-2">
              <span className="text-caption font-semibold text-text-primary">Accepted Counter Payment Methods</span>
              {settingsDraft.paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="text-body-sm text-text-secondary">{method.label}</span>
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={() => handlePaymentMethodToggle(method.id)}
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>
              ))}
              {settingsDraft.paymentMethods.length === 0 && (
                <p className="text-[11px] text-text-secondary">No payment methods are configured for this business yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-caption font-semibold text-text-primary">Participating Branches</span>
              {branchCards.map((branch) => {
                const isChecked = isBranchActive(branch.key);
                return (
                  <label
                    key={branch.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-subtle bg-surface-subtle cursor-pointer"
                  >
                    <span className="flex flex-col">
                      <span className="text-body-sm font-medium text-text-primary">{branch.name}</span>
                      <span className="text-[11px] text-text-tertiary">{branch.address}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBranchToggle(branch.key)}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </label>
                );
              })}
              {live && branchesLoaded && branchCards.length === 0 && (
                <p className="text-[11px] text-text-secondary">Add a branch under Locations to accept store orders.</p>
              )}
            </div>

            <div className="space-y-1 border-t border-border-subtle pt-2">
              {[
                { key: 'immediatePickup' as const, label: 'Allow Immediate Pickup' },
                { key: 'scheduledPreOrder' as const, label: 'Allow Pre-orders / Scheduled Pickup' },
                { key: 'guestOrderingAllowed' as const, label: 'Allow Guest Checkout' },
                { key: 'acceptOrdersOutsideHours' as const, label: 'Accept Orders After Closing Hours' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between py-1.5 cursor-pointer">
                  <span className="text-body-sm text-text-primary">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={settingsDraft[item.key]}
                    onChange={(e) => patchSettingsDraft({ [item.key]: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-caption font-semibold text-text-primary">Pickup Directions</label>
              <textarea
                rows={3}
                value={settingsDraft.pickupInstructions}
                onChange={(e) => patchSettingsDraft({ pickupInstructions: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-border text-caption"
              />
              <div className="p-3 rounded-xl bg-surface-subtle text-[11px] text-text-secondary">
                {settingsDraft.usePosForCompletion
                  ? 'Customers are told payment is processed in VEMTAP POS when the order is ready.'
                  : 'Customers are told payment is collected at the store counter upon handover.'}
              </div>
            </div>

            <div className="space-y-2 border-t border-border-subtle pt-3">
              <label htmlFor="mobile-staff-alert-recipient" className="text-caption font-semibold text-text-primary block">
                Staff Order Alert Recipient
              </label>
              <select
                id="mobile-staff-alert-recipient"
                value={settingsDraft.notifiedStaff[0] || 'all'}
                onChange={(e) =>
                  patchSettingsDraft({
                    notifiedStaff: e.target.value === 'all' ? ['all'] : [e.target.value],
                  })
                }
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-border text-body-sm text-text-primary font-medium"
              >
                <option value="all">All Staff Members (Storewide Alert)</option>
                {staffOptions.map((staff) => (
                  <option key={staff.key} value={staff.key}>
                    {staff.label}
                  </option>
                ))}
              </select>
              {live && team.isSuccess && staffOptions.length === 0 && (
                <p className="text-[11px] text-text-secondary">Invite staff from Team &amp; Access to choose alert recipients.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSettingsSave}
              disabled={settingsLoading || settingsSaving}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-caption disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingsSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </main>

      {/* Mobile Order Detail Full Sheet */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrderId(null)} />
          <div className="relative w-full max-w-[430px] mx-auto bg-surface-canvas rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden z-10 shadow-2xl animate-in slide-in-from-bottom">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-subtle">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary text-[16px]">{selectedOrder.id}</span>
                <span className="text-caption text-text-tertiary">({selectedOrder.time})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
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

              {/* Assigned Staff Member (same control as the desktop drawer) */}
              <div className="space-y-1">
                <span className="font-bold text-text-primary text-caption uppercase block">
                  Assigned Staff Member
                </span>
                <select
                  value={staffValueFor(selectedOrder)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;
                    assignStaff(selectedOrder.id, value);
                    const label =
                      staffOptionsFor(selectedOrder).find((option) => option.value === value)?.label ?? value;
                    showToast(`Order ${selectedOrder.orderRef} assigned to ${label}.`);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-border text-body-sm text-on-surface focus:outline-hidden focus:border-primary"
                >
                  <option value="" disabled>
                    Select a staff member…
                  </option>
                  {staffOptionsFor(selectedOrder).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-tertiary">
                  {selectedOrder.assignedStaff
                    ? 'Recorded on every status change and in the history below.'
                    : 'Required — this order cannot be marked complete until someone is assigned.'}
                </p>
              </div>

              {/* Who completed the order (once it is closed) */}
              {selectedOrder.status === 'completed' && completedBy(selectedOrder) && (
                <div className="p-3 rounded-xl bg-badge-discount-bg border border-badge-discount-text/40 flex items-center justify-between gap-2">
                  <span className="text-caption font-semibold text-badge-discount-text">Completed by</span>
                  <span className="text-body-sm font-semibold text-text-primary">{completedBy(selectedOrder)}</span>
                </div>
              )}

              {/* Audit status history (parity with the desktop drawer) */}
              <div className="space-y-1.5">
                <span className="font-bold text-text-primary text-caption uppercase block">
                  Status History
                </span>
                {selectedOrder.statusHistory.length === 0 ? (
                  <p className="text-caption text-text-tertiary">No status changes recorded yet.</p>
                ) : (
                  <div className="space-y-2 border-l-2 border-border-subtle pl-3 ml-2">
                    {selectedOrder.statusHistory.map((hist, idx) => (
                      <div key={idx} className="relative text-[11px]">
                        <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-surface-canvas" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-text-primary capitalize">{hist.status}</span>
                          <span className="text-text-tertiary font-mono">{hist.timestamp}</span>
                        </div>
                        {hist.note && <span className="text-text-secondary block">{hist.note}</span>}
                        {hist.staffName && (
                          <span className="text-text-tertiary block">
                            By {hist.staffName}
                            {hist.staffRole ? ` (${hist.staffRole})` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border-subtle flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-caption"
              >
                Close
              </button>
              {selectedOrder.status === 'ready' && selectedOrder.payment.status !== 'paid-in-store' && (
                <button
                  type="button"
                  onClick={() => {
                    const o = selectedOrder;
                    setSelectedOrderId(null);
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

            <div className="p-2.5 rounded-lg bg-surface-subtle text-[11px] text-text-secondary">
              <span className="font-semibold text-text-primary">Completed by: </span>
              {completedBy(paymentModalOrder) || 'Unassigned'}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-text-primary">Tender</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 rounded-xl bg-surface-subtle border border-border text-body-sm"
              >
                {enabledPaymentMethods.length > 0 ? (
                  enabledPaymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No payment methods configured
                  </option>
                )}
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
                disabled={!paymentMethod}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-caption disabled:opacity-50"
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
        <div className="fixed bottom-24 z-50 bg-on-surface text-inverse-on-surface px-4 py-2.5 rounded-xl font-label-md text-caption shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
