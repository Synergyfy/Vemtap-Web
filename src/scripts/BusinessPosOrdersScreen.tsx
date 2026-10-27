import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';

import { BusinessModeHeader } from './BusinessModeHeader';
import { hasApiConfig } from '../services/api/client';
import { money, type PosSale } from '../services/posService';
import { usePosSales } from '../hooks/business/usePos';
import { useBusinessOrders } from '../hooks/business/useBusinessOrders';
import { useOfferSummary } from '../hooks/business/useOffers';
import { methodLabel, naira, saleCustomer, saleItemsLine, saleStatusLabel, setSelectedSaleId, timeLabel, useLivePos } from './posLive';

const METHOD_ICON: Record<string, string> = { cash: 'payments', card: 'contactless', transfer: 'account_balance', split: 'call_split' };

const isToday = (iso?: string | null) => Boolean(iso) && new Date(iso as string).toDateString() === new Date().toDateString();

interface BusinessPosOrdersScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenOrder: () => void;
  onOpenDisplay?: () => void;
  /** Live: opens the POS transaction detail for the sale picked. */
  onOpenSale?: () => void;
}

type PosChipKey = 'all' | 'online' | 'pos' | 'deals';

const POS_CHIPS: { key: PosChipKey; label: string; icon?: string }[] = [
  { key: 'all', label: 'All Orders (28)' },
  { key: 'online', label: 'Online Only (16)' },
  { key: 'pos', label: 'POS In-Store (12)', icon: 'point_of_sale' },
  { key: 'deals', label: 'Deals Redeemed (9)' },
];

export function BusinessPosOrdersScreen({ onTab, onOpenOrder, onOpenDisplay, onOpenSale }: BusinessPosOrdersScreenProps) {
  const [chip, setChip] = useState<PosChipKey>('pos');
  const [search, setSearch] = useState('');
  // Live: today's till sales at the active branch, plus channel counts for the chips.
  const live = hasApiConfig();
  const pos = useLivePos();
  const sales = usePosSales({ limit: 100, search: search.trim() || undefined });
  const storeOrders = useBusinessOrders();
  const offers = useOfferSummary().data;
  const todaySales: PosSale[] = (sales.data?.data ?? []).filter((sale) => isToday(sale.createdAt));
  const onlineToday = (storeOrders.data ?? []).filter((order) => isToday(order.createdAt) && !order.payment?.posSaleId).length;
  const dealSales = todaySales.filter((sale) => money(sale.discountAmount) > 0);
  const visibleSales = chip === 'online' ? [] : chip === 'deals' ? dealSales : todaySales;
  const chips = live
    ? [
        { key: 'all' as const, label: `All Orders (${onlineToday + todaySales.length})` },
        { key: 'online' as const, label: `Online Only (${onlineToday})` },
        { key: 'pos' as const, label: `POS In-Store (${todaySales.length})`, icon: 'point_of_sale' },
        { key: 'deals' as const, label: `Deals Redeemed (${offers?.redeemedToday ?? dealSales.length})` },
      ]
    : POS_CHIPS;
  const openSale = (id: string) => {
    setSelectedSaleId(id);
    (onOpenSale ?? onOpenOrder)();
  };
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <AppScreen>
      <BusinessModeHeader title="Orders" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Sub-Header / Location Bar Context */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button
              className="h-9 px-space-sm rounded-full bg-surface-container-high flex items-center gap-space-2xs text-on-surface-variant hover:bg-surface-variant transition-colors"
              title="Filter date"
              type="button"
            >
              <Icon name="calendar_today" className="text-[18px]" />
              <span className="font-label-sm text-label-sm font-semibold">Today</span>
            </button>
          </div>
        </div>

        {/* Search and Quick Filter Bar */}
        <div className="px-margin mb-space-sm">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[20px]" />
            </span>
            <input
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-tertiary font-body-md text-body-md focus:outline-none focus:bg-surface-canvas shadow-sm transition-all"
              placeholder="Search ticket #, table, customer or deal code..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              className="absolute inset-y-0 right-3 flex items-center text-text-tertiary hover:text-on-surface"
              type="button"
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="w-full overflow-x-auto no-scrollbar pl-margin pr-margin mb-space-md flex items-center gap-space-xs">
          {chips.map((posChip) => {
            const active = posChip.key === chip;
            return (
              <button
                className={`h-9 px-space-md rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-colors ${
                  active
                    ? 'bg-surface-tint-blue text-primary-container font-semibold flex items-center gap-space-2xs'
                    : 'bg-surface-subtle text-text-secondary hover:bg-surface-container'
                }`}
                key={posChip.key}
                type="button"
                onClick={() => setChip(posChip.key)}
              >
                {posChip.icon && <Icon name={posChip.icon} filled={active} className="text-[18px]" />}
                {posChip.label}
              </button>
            );
          })}
        </div>

        {/* POS Terminal Status Banner */}
        <div className="px-margin mb-space-lg">
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-md shadow-md flex flex-col gap-space-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                  <span className="absolute w-4 h-4 rounded-full bg-badge-discount-text/40 animate-ping" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-inverse-on-surface">
                  {live ? (pos.isOpen ? `${pos.tillName} (${pos.cashierName})` : 'No register open') : 'POS Terminal 01 (Cashier Counter)'}
                </span>
              </div>
              <span className="font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-canvas/10 text-badge-discount-bg font-medium">
                {live ? (pos.isOpen ? 'Register open' : 'Register closed') : 'Online • 0s Latency'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-space-2xs">
              <div>
                <span className="font-caption text-caption text-inverse-primary block">Daily In-Store Volume</span>
                <div className="flex items-baseline gap-space-2xs">
                  <span className="font-heading-sm text-heading-sm font-bold text-on-primary">{live ? naira(pos.todaySales) : '₦142,500'}</span>
                  <span className="font-caption text-caption text-inverse-on-surface/80">
                    / {live ? pos.todayCount : 12} transactions
                  </span>
                </div>
              </div>
              <button
                className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-button-secondary text-button-secondary flex items-center gap-space-2xs shadow-md active:scale-95 transition-transform"
                type="button"
                onClick={onOpenDisplay}
              >
                <span>Open POS Mode</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Unified Orders Stream */}
        <div className="px-margin flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-md text-label-md font-semibold text-text-primary">
                Today's In-Store Activity
              </span>
              <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption flex items-center justify-center font-bold">
                {live ? todaySales.length : 12}
              </span>
            </div>
            <button className="font-caption text-caption text-primary font-semibold flex items-center gap-0.5" type="button" onClick={() => {
                if (live) {
                  void sales.refetch();
                  void storeOrders.refetch();
                  showToast('Sales refreshed');
                  return;
                }
                showToast('Orders stream refreshed — all terminals in sync');
              }}>
              <Icon name="sync" className="text-[16px]" />
              Live sync on
            </button>
          </div>

          {live && !visibleSales.length && (
            <div className="rounded-xl bg-surface-canvas p-space-md shadow-sm text-center flex flex-col items-center gap-space-2xs">
              <Icon name={chip === 'online' ? 'storefront' : 'point_of_sale'} className="text-[28px] text-text-tertiary" />
              <span className="font-label-md text-label-md font-semibold text-text-primary">
                {sales.isLoading ? 'Loading sales…' : chip === 'online' ? 'Online orders live on the Orders tab' : 'No in-store sales yet today'}
              </span>
              {!sales.isLoading && chip !== 'online' && (
                <span className="font-caption text-caption text-text-secondary">Sales rung up at the till appear here.</span>
              )}
            </div>
          )}
          {live &&
            visibleSales.map((sale) => {
              const discount = money(sale.discountAmount);
              const cash = sale.paymentMethod === 'cash' && money(sale.amountPaid) > 0;
              return (
                <button
                  className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow text-left"
                  key={sale.id}
                  type="button"
                  onClick={() => openSale(sale.id)}
                >
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex flex-wrap items-center gap-space-2xs">
                      <span className="h-6 px-space-xs rounded bg-primary-container text-on-primary font-caption text-caption font-bold flex items-center gap-1">
                        <Icon name="point_of_sale" className="text-[14px]" />
                        POS
                      </span>
                      <span className="h-6 px-space-xs rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <Icon name={sale.orderType === 'takeaway' ? 'shopping_bag' : 'table_restaurant'} className="text-[15px] text-text-secondary" />
                        {sale.orderType === 'takeaway' ? 'Counter Takeaway' : 'Dine-In'}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">#{sale.receiptNumber}</span>
                    </div>
                    <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">{timeLabel(sale.createdAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1 py-space-2xs">
                    {(sale.items ?? []).map((item) => (
                      <div className="flex justify-between items-baseline" key={item.id}>
                        <span className="font-body-md text-body-md font-medium text-text-primary">
                          {item.quantity}x {item.productName ?? 'Item'}
                        </span>
                        <span className="font-label-md text-label-md font-medium text-text-secondary">
                          {naira(money(item.totalPrice) || money(item.unitPrice) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {!sale.items?.length && (
                      <span className="font-body-md text-body-md font-medium text-text-primary">{saleItemsLine(sale)}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="rounded-lg bg-badge-discount-bg p-space-xs flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-full bg-badge-discount-text/10 text-badge-discount-text flex items-center justify-center shrink-0">
                        <Icon name="local_offer" filled className="text-[20px]" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-label-sm text-label-sm font-bold text-badge-discount-text truncate">Discount applied</span>
                        <span className="font-caption text-caption text-badge-discount-text/90">Saved {naira(discount)}</span>
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg bg-surface-subtle p-space-xs flex flex-col gap-1 font-caption text-caption">
                    <div className="flex items-center gap-1.5 text-text-primary font-medium">
                      <Icon name={METHOD_ICON[sale.paymentMethod] ?? 'payments'} className="text-[16px] text-primary" />
                      <span>
                        Paid with {methodLabel(sale.paymentMethod)}
                        {cash ? ` (${naira(money(sale.amountPaid))} tendered • ${naira(money(sale.change))} change)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>{saleCustomer(sale) || 'Walk-in guest'}</span>
                      <span className="font-medium">Cashier: {sale.cashierName || '—'}</span>
                    </div>
                  </div>
                  <div className="pt-space-2xs flex items-center justify-between">
                    <div>
                      <span className="font-caption text-caption text-text-tertiary block">Total Collected</span>
                      <span className="font-heading-md text-heading-md font-bold text-text-primary">{naira(money(sale.total))}</span>
                    </div>
                    <span
                      className={`h-8 px-space-xs rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${
                        sale.status === 'completed' ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container-high text-text-primary'
                      }`}
                    >
                      <Icon name={sale.status === 'completed' ? 'check_circle' : 'undo'} className="text-[16px]" />
                      {saleStatusLabel(sale)}
                    </span>
                  </div>
                  <span className="w-full h-10 rounded-lg bg-surface-container text-on-secondary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1">
                    <Icon name="receipt_long" className="text-[18px]" />
                    View Receipt Details
                  </span>
                </button>
              );
            })}
          {!live && (
            <>
          {/* Card 1: POS Dine-In with Verified Deal */}
          <button
            className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden text-left"
            type="button"
            onClick={onOpenOrder}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-2xs">
                <span className="h-6 px-space-xs rounded bg-primary-container text-on-primary font-caption text-caption font-bold flex items-center gap-1">
                  <Icon name="point_of_sale" className="text-[14px]" />
                  POS
                </span>
                <span className="h-6 px-space-xs rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <Icon name="table_restaurant" className="text-[15px] text-text-secondary" />
                  Table 04
                </span>
                <span className="font-caption text-caption text-text-secondary">#POS-1049</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">1:42 PM (8m ago)</span>
            </div>
            <div className="flex flex-col gap-1 py-space-2xs">
              <div className="flex justify-between items-baseline">
                <span className="font-body-md text-body-md font-medium text-text-primary">1x Prime Lunch Combo</span>
                <span className="font-label-md text-label-md font-medium text-text-secondary">₦10,000</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-body-md text-body-md font-medium text-text-primary">1x Fresh Lemonade</span>
                <span className="font-label-md text-label-md font-medium text-text-secondary">₦2,000</span>
              </div>
            </div>
            {/* Attached Local Deal Callout */}
            <div className="rounded-lg bg-badge-discount-bg p-space-xs flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-badge-discount-text/10 text-badge-discount-text flex items-center justify-center shrink-0">
                <Icon name="local_offer" filled className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-space-2xs">
                  <span className="font-label-sm text-label-sm font-bold text-badge-discount-text truncate">
                    20% Lunch Combo Counter Tap
                  </span>
                  <Icon name="verified" className="text-badge-discount-text text-[15px]" />
                </div>
                <span className="font-caption text-caption text-badge-discount-text/90">
                  Voucher #VT-48F261 verified • Saved ₦2,400
                </span>
              </div>
            </div>
            {/* Payment & Server Metadata */}
            <div className="flex flex-wrap items-center justify-between pt-space-2xs text-text-secondary font-caption text-caption">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-text-primary font-medium">
                  <Icon name="contactless" className="text-[16px] text-primary" />
                  <span>Paid via Store POS (Mastercard •••• 4128)</span>
                </div>
                <span className="text-text-secondary">Dine-In • Paid at Table/Counter • Cashier: David K.</span>
              </div>
            </div>
            {/* Total & Status */}
            <div className="pt-space-xs flex items-center justify-between">
              <div>
                <span className="font-caption text-caption text-text-tertiary block">Total Collected</span>
                <span className="font-heading-md text-heading-md font-bold text-text-primary">₦9,600</span>
              </div>
              <span className="h-8 px-space-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                Kitchen Preparing
              </span>
            </div>
            {/* Interactive Actions Strip */}
            <div className="pt-space-xs flex items-center gap-space-xs">
              <span className="flex-1 h-10 rounded-lg bg-surface-container text-on-secondary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1">
                <Icon name="receipt" className="text-[18px]" />
                View Ticket
              </span>
              <span className="h-10 px-space-md rounded-lg bg-surface-container-high text-on-surface-variant font-button-secondary text-button-secondary flex items-center justify-center gap-1">
                <Icon name="print" className="text-[18px]" />
                Reprint
              </span>
            </div>
          </button>

          {/* Card 2: POS Takeaway (Counter Cash) */}
          <button
            className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow text-left"
            type="button"
            onClick={onOpenOrder}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-2xs">
                <span className="h-6 px-space-xs rounded bg-primary-container text-on-primary font-caption text-caption font-bold flex items-center gap-1">
                  <Icon name="point_of_sale" className="text-[14px]" />
                  POS
                </span>
                <span className="h-6 px-space-xs rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <Icon name="shopping_bag" className="text-[15px] text-text-secondary" />
                  Counter Takeaway
                </span>
                <span className="font-caption text-caption text-text-secondary">#POS-1048</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">1:15 PM</span>
            </div>
            <div className="flex flex-col gap-1 py-space-2xs">
              <div className="flex justify-between items-baseline">
                <span className="font-body-md text-body-md font-medium text-text-primary">2x Smokey Jollof Feast</span>
                <span className="font-label-md text-label-md font-medium text-text-secondary">₦9,000</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-body-md text-body-md font-medium text-text-primary">
                  2x Grilled Chicken Quarter
                </span>
                <span className="font-label-md text-label-md font-medium text-text-secondary">₦5,800</span>
              </div>
            </div>
            {/* Cash payment details */}
            <div className="rounded-lg bg-surface-subtle p-space-xs flex flex-col gap-1 font-caption text-caption">
              <div className="flex items-center gap-1.5 text-text-primary font-medium">
                <Icon name="payments" className="text-[16px] text-badge-discount-text" />
                <span>Paid with Cash (₦15,000 tendered • ₦200 change)</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Takeaway • Paid at Counter</span>
                <span className="font-medium">Cashier: Sarah M.</span>
              </div>
            </div>
            {/* Bottom metadata */}
            <div className="pt-space-2xs flex items-center justify-between">
              <div>
                <span className="font-caption text-caption text-text-tertiary">Cashier: Sarah M.</span>
                <div className="font-heading-md text-heading-md font-bold text-text-primary">₦14,800</div>
              </div>
              <span className="h-8 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1">
                <Icon name="check_circle" className="text-[16px]" />
                Completed & Collected
              </span>
            </div>
            <span className="w-full h-10 rounded-lg bg-surface-container text-on-secondary-container font-button-secondary text-button-secondary flex items-center justify-center gap-1 hover:bg-surface-container-high transition-colors">
              <Icon name="receipt_long" className="text-[18px]" />
              View Receipt Details
            </span>
          </button>

          {/* Card 3: POS Offline Synced (Bank Transfer) */}
          <button
            className="rounded-xl bg-surface-canvas p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow text-left"
            type="button"
            onClick={onOpenOrder}
          >
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-2xs">
                <span className="h-6 px-space-xs rounded bg-secondary text-on-secondary font-caption text-caption font-bold flex items-center gap-1">
                  <Icon name="cloud_done" className="text-[14px]" />
                  POS (Synced)
                </span>
                <span className="h-6 px-space-xs rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <Icon name="table_restaurant" className="text-[15px] text-text-secondary" />
                  Table 02
                </span>
                <span className="font-caption text-caption text-text-secondary">#POS-1047</span>
              </div>
              <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">12:45 PM</span>
            </div>
            {/* Payment Channel */}
            <div className="flex items-center gap-space-xs py-space-2xs">
              <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="account_balance" className="text-[18px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-body-md text-body-md font-medium text-text-primary">
                  Direct Bank Transfer (Direct to Merchant Moniepoint)
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Dine-In • Settle at Counter • Ref: #MNP-9204
                </span>
              </div>
            </div>
            {/* Total & Action bar */}
            <div className="pt-space-xs flex items-center justify-between">
              <div>
                <span className="font-caption text-caption text-text-tertiary block">Settled Amount</span>
                <span className="font-heading-md text-heading-md font-bold text-text-primary">₦22,000</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="h-8 px-space-xs rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-semibold flex items-center gap-1">
                  <Icon name="check" className="text-[16px] text-badge-discount-text" />
                  Completed
                </span>
                <span className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface">
                  <Icon name="more_vert" className="text-[18px]" />
                </span>
              </div>
            </div>
          </button>
            </>
          )}
        </div>

        {/* Micro Prompt: Unified Channel Assurance */}
        <div className="px-margin mt-space-lg mb-space-sm">
          <div className="rounded-xl bg-surface-tint-blue p-space-md flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="payments" className="text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md font-semibold text-text-primary">
                Direct Merchant Payment Processing
              </span>
              <span className="font-caption text-caption text-text-secondary leading-snug">
                Customers choose how and when to pay (Cash, Transfer, or POS Terminal — at Counter, on Delivery, or
                Dine-In). You process and collect 100% of customer funds directly.
              </span>
            </div>
          </div>
        </div>
      </div>
      <BusinessTabBar onTab={onTab} />
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}
