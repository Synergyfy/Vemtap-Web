import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';
import {
  addLine,
  computeTotals,
  formatNaira,
  POS_CATALOG,
  type PosCatalogItem,
  type PosTerminalLine,
} from './posTerminalData';
import { useStoreOrdering } from '../../context/StoreOrderingContext';

interface DesktopPosRegisterScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  onCartChange: (lines: PosTerminalLine[]) => void;
  customer: string | null;
  onCharge: () => void;
  onSplit: () => void;
  onOpenCustomer: () => void;
  onOpenOrders: () => void;
}

const CATEGORIES = [
  'All Items (38)',
  'Grills & Steaks (12)',
  'Burgers & Sandwiches (8)',
  'Starters & Sides (6)',
  'Cocktails & Drinks (12)',
];

const FUNCTION_KEYS = [
  { key: 'F1', label: 'Help' },
  { key: 'F3', label: 'Find SKU' },
  { key: 'F5', label: 'Park Ticket' },
  { key: 'F6', label: 'Split Bill' },
];

const BADGE_TONES: Record<PosCatalogItem['badgeTone'], string> = {
  neutral: 'bg-surface-canvas/90 backdrop-blur-sm text-text-primary font-semibold',
  promo: 'bg-badge-discount-bg text-badge-discount-text font-bold',
  low: 'bg-error-container text-error font-semibold',
  ready: 'bg-surface-canvas/90 backdrop-blur-sm text-text-secondary font-semibold',
  express: 'bg-surface-tint-blue text-primary font-semibold',
  chef: 'bg-surface-container-high text-primary font-bold',
  keg: 'bg-surface-canvas/90 backdrop-blur-sm text-text-secondary font-semibold',
};

const QUICK_TENDER = [
  { icon: 'credit_card', label: 'POS Card', tone: 'text-primary' },
  { icon: 'point_of_sale', label: 'Cash Till', tone: 'text-badge-discount-text' },
  { icon: 'qr_code_scanner', label: 'VEMTAP QR', tone: 'text-tertiary-container' },
  { icon: 'account_balance', label: 'Transfer', tone: 'text-secondary' },
];

export function DesktopPosRegisterScreen({
  onNav,
  cart,
  onCartChange,
  customer,
  onCharge,
  onSplit,
  onOpenCustomer,
  onOpenOrders,
}: DesktopPosRegisterScreenProps) {
  const [category, setCategory] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [holdPulse, setHoldPulse] = useState(false);
  const [handoffToast, setHandoffToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    orders,
    activePosHandoffOrderId,
    setActivePosHandoffOrderId,
    completeOrderFromPos,
  } = useStoreOrdering();

  const handedOffOrder = useMemo(() => {
    if (!activePosHandoffOrderId) return null;
    return orders.find((o) => o.id === activePosHandoffOrderId) || null;
  }, [activePosHandoffOrderId, orders]);

  const [completedHandoff, setCompletedHandoff] = useState<{
    orderRef: string;
    tender: string;
    txnId: string;
    total: number;
    items: string;
    customer: string;
  } | null>(null);

  const handleCompleteHandoffPayment = (tender: string) => {
    if (!handedOffOrder) return;
    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    completeOrderFromPos(handedOffOrder.id, tender, txnId);
    setCompletedHandoff({
      orderRef: handedOffOrder.orderRef,
      tender,
      txnId,
      total: handedOffOrder.confirmedTotal,
      items: handedOffOrder.items.map((i) => `${i.name} ×${i.qty}`).join(', '),
      customer: handedOffOrder.customerName,
    });
    setHandoffToast(`Order #${handedOffOrder.orderRef} payment recorded in POS (${tender}).`);
    window.setTimeout(() => setHandoffToast(null), 3500);
  };

  const totals = useMemo(() => computeTotals(cart), [cart]);
  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  const addItem = (item: PosCatalogItem) => {
    onCartChange(addLine(cart, item));
  };

  const changeQty = (id: string, delta: number) => {
    onCartChange(
      cart
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0),
    );
  };

  const removeLine = (id: string) => {
    onCartChange(cart.filter((line) => line.id !== id));
  };

  const createNewTicket = () => {
    onCartChange([]);
    onOpenOrders();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        onCharge();
      } else if (event.key === 'F5') {
        event.preventDefault();
        setHoldPulse(true);
        window.setTimeout(() => setHoldPulse(false), 900);
      } else if (event.key === 'F6') {
        event.preventDefault();
        onSplit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCharge, onSplit]);

  return (
    <PosTerminalChrome activeNav="register" onNav={onNav}>
      {/* Operational Sub-Header Bar */}
      <section className="w-full bg-surface-canvas shadow-sm">
        <div className="w-full py-2.5 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container text-text-primary">
              <Icon name="table_restaurant" className="text-primary text-[18px]" />
              <span className="font-label-md text-label-md font-semibold">Floor: Main Dining Room • Zone B</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-badge-discount-bg text-badge-discount-text">
              <Icon name="barcode_scanner" className="text-[17px]" />
              <span className="font-label-sm text-label-sm font-semibold tracking-tight">
                FAST-SCAN LIVE: Ready (Opticon OPN-2006 BT)
              </span>
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-ping ml-1" />
            </div>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto py-0.5">
            {FUNCTION_KEYS.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-text-secondary shrink-0"
              >
                <kbd className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-surface-canvas shadow-sm text-primary">
                  {item.key}
                </kbd>
                <span className="font-caption text-caption font-medium">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-primary shrink-0">
              <kbd className="px-2 py-0.5 text-[11px] font-bold rounded bg-primary text-on-primary shadow-sm">SPACE</kbd>
              <span className="font-caption text-caption font-bold">Charge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Handed-off Store Order Banner */}
      {handedOffOrder && (
        <section className="w-full bg-surface-tint-blue/90 border-b border-primary/20 px-space-md py-3 shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                <Icon name="point_of_sale" className="text-[22px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary text-[14px]">
                    STORE ORDER #{handedOffOrder.orderRef}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary text-on-primary">
                    Active POS Handoff
                  </span>
                  <span className="text-caption text-text-secondary">• {handedOffOrder.origin}</span>
                </div>
                <p className="text-body-sm text-text-primary mt-0.5">
                  Customer: <strong>{handedOffOrder.customerName}</strong> ({handedOffOrder.customerPhone}) •{' '}
                  {handedOffOrder.items.map((i) => `${i.name} ×${i.qty}`).join(', ')} • Total Due:{' '}
                  <strong className="text-primary font-bold">₦{handedOffOrder.confirmedTotal.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => handleCompleteHandoffPayment('POS Card Terminal')}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="credit_card" className="text-[17px]" />
                <span>Pay by Card (₦{handedOffOrder.confirmedTotal.toLocaleString()})</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompleteHandoffPayment('Cash Till')}
                className="px-3.5 py-2 rounded-xl bg-badge-discount-text hover:opacity-90 text-on-primary font-semibold text-label-md shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="point_of_sale" className="text-[17px]" />
                <span>Cash Tender</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompleteHandoffPayment('Bank Transfer')}
                className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-label-md shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="account_balance" className="text-[17px]" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePosHandoffOrderId(null)}
                className="px-3 py-2 rounded-xl border border-border bg-surface-canvas hover:bg-surface-subtle text-text-secondary text-caption font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      )}

      {/* POS Dual-Pane Workspace Grid */}
      <div className="w-full py-space-md">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT CATALOG */}
          <section className="xl:col-span-8 flex flex-col gap-space-md">
            {/* Search and Action Controls Bar */}
            <div className="bg-surface-canvas p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
              <div className="relative flex-1">
                <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]" />
                <input
                  ref={searchRef}
                  id="sku-search"
                  type="text"
                  placeholder="Scan barcode or search by item name, SKU, modifier tag... [F3]"
                  className="w-full h-12 pl-11 pr-14 rounded-xl bg-surface text-text-primary placeholder:text-text-tertiary text-body-md font-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-caption text-caption font-bold">
                  F3
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                <button
                  type="button"
                  className="h-12 px-space-md rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center gap-1.5 hover:bg-surface-container-high transition-colors shadow-sm"
                >
                  <Icon name="tune" className="text-[19px]" />
                  <span>+ Modifiers</span>
                </button>
                <div className="h-12 p-1 rounded-xl bg-surface-container flex items-center">
                  <button
                    type="button"
                    onClick={() => setView('grid')}
                    className={`h-10 px-3 rounded-lg flex items-center justify-center ${
                      view === 'grid' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="grid_view" className="text-[20px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className={`h-10 px-3 rounded-lg flex items-center justify-center transition-colors ${
                      view === 'list' ? 'bg-surface-canvas text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="view_list" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
              {CATEGORIES.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCategory(index)}
                  className={`px-space-md py-2 rounded-full font-label-md text-label-md shrink-0 shadow-sm transition-colors ${
                    category === index
                      ? 'bg-surface-tint-blue text-primary font-semibold'
                      : 'bg-surface-canvas text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Catalog Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {POS_CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="group bg-surface-canvas rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container">
                    <img
                      alt={item.alt}
                      src={item.img}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-caption text-caption shadow-sm ${BADGE_TONES[item.badgeTone]}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-col flex-1">
                    <h4 className="font-heading-sm text-heading-sm text-text-primary truncate">{item.name}</h4>
                    <p className="font-caption text-caption text-text-tertiary truncate">{item.desc}</p>
                    <div className="mt-3 flex items-center justify-between pt-1">
                      {item.was ? (
                        <div className="flex flex-col">
                          <span className="font-heading-sm text-heading-sm font-bold text-badge-discount-text">
                            {formatNaira(item.unit)}
                          </span>
                          <span className="font-caption text-caption text-text-tertiary line-through">
                            {formatNaira(item.was)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading-sm text-heading-sm font-bold text-text-primary">
                          {formatNaira(item.unit)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center shadow-sm"
                      >
                        <Icon name="add" className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Catalog Bottom Actions Strip */}
            <div className="bg-surface-canvas p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-xs flex-wrap">
                <button
                  type="button"
                  className="px-space-md py-2.5 rounded-lg bg-surface hover:bg-surface-container-high text-text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Icon name="percent" className="text-[18px] text-badge-discount-text" />
                  <span>Apply Custom Discount</span>
                </button>
                <button
                  type="button"
                  className="px-space-md py-2.5 rounded-lg bg-surface hover:bg-surface-container-high text-text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Icon name="room_service" className="text-[18px] text-primary" />
                  <span>Send Kitchen Ticket (KDS)</span>
                </button>
                <button
                  type="button"
                  className="px-space-md py-2.5 rounded-lg bg-surface hover:bg-surface-container-high text-text-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Icon name="edit_note" className="text-[18px] text-text-secondary" />
                  <span>Order Notes</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
                <span className="inline-block w-2 h-2 rounded-full bg-badge-discount-text" />
                <span>
                  Cloud Sync Latency: <strong className="text-text-primary font-semibold">14ms</strong> (Abuja Edge Node)
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT ACTIVE TICKET PANE */}
          <aside className="xl:col-span-4 flex flex-col gap-space-md sticky top-20">
            <div className="bg-surface-canvas rounded-xl shadow-md p-space-lg flex flex-col">
              {/* Ticket Header */}
              <div className="flex items-start justify-between pb-space-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      Dine-In
                    </span>
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">Ticket #TK-108</h3>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-1">
                    Table 04 • Emeka O. • 13:42:09 WAT
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Print Pre-Bill"
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary flex items-center justify-center transition-colors"
                  >
                    <Icon name="print" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    title="Void Ticket"
                    onClick={() => onCartChange([])}
                    className="w-9 h-9 rounded-lg bg-error-container text-error hover:opacity-90 flex items-center justify-center transition-opacity"
                  >
                    <Icon name="delete_sweep" className="text-[18px]" />
                  </button>
                </div>
              </div>

              {/* VIP Customer Tag */}
              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between mb-space-md shadow-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-label-sm flex items-center justify-center shadow-sm">
                    MJ
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-text-primary font-semibold">
                      {customer ?? 'Michael James (VIP Gold)'}
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium">
                      2,450 pts • 10% Member Perk applied
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  title="Change Customer"
                  onClick={onOpenCustomer}
                  className="p-1 text-text-tertiary hover:text-primary transition-colors"
                >
                  <Icon name="cached" className="text-[18px]" />
                </button>
              </div>

              {/* Itemized Order Lines */}
              <div className="flex flex-col gap-space-sm max-h-[310px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="p-3 rounded-lg bg-surface flex flex-col items-center justify-center text-center gap-2 py-8">
                    <Icon name="shopping_cart" className="text-[28px] text-text-tertiary" />
                    <span className="font-label-md text-label-md text-text-secondary">Ticket is empty</span>
                    <button
                      type="button"
                      onClick={createNewTicket}
                      className="font-caption text-caption text-primary hover:underline"
                    >
                      Browse the catalogue to add items
                    </button>
                  </div>
                ) : (
                  cart.map((line) => {
                    const lineTotal = (line.unit - (line.promo ?? 0)) * line.qty;
                    return (
                      <div key={line.id} className="p-3 rounded-lg bg-surface flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-label-md text-label-md font-semibold text-text-primary">{line.name}</h5>
                            {line.promo ? (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold mt-0.5">
                                Deal Applied -{formatNaira(line.promo)} (Promo)
                              </span>
                            ) : null}
                            <p className="font-caption text-caption text-text-secondary mt-0.5">{line.mods}</p>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="font-label-md text-label-md font-bold text-text-primary">
                              {formatNaira(lineTotal)}
                            </span>
                            {line.promo ? (
                              <span className="font-caption text-caption text-text-tertiary line-through">
                                {formatNaira(line.unit * line.qty)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 bg-surface-canvas rounded-lg px-2 py-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => changeQty(line.id, -1)}
                              className="text-text-secondary hover:text-text-primary text-[15px] font-bold"
                            >
                              −
                            </button>
                            <span className="font-label-md text-label-md font-semibold text-text-primary px-1">{line.qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(line.id, 1)}
                              className="text-text-secondary hover:text-text-primary text-[15px] font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="text-text-tertiary hover:text-error transition-colors"
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="mt-space-md pt-space-md bg-surface-subtle p-3.5 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                  <span>Items Subtotal ({itemCount} items)</span>
                  <span className="text-text-primary font-medium">{formatNaira(totals.gross)}</span>
                </div>
                <div className="flex items-center justify-between font-label-md text-label-md text-badge-discount-text">
                  <span className="flex items-center gap-1">
                    <Icon name="stars" className="text-[16px]" />
                    VIP Promo Rebate (10%)
                  </span>
                  <span className="font-medium">-{formatNaira(totals.discount)}</span>
                </div>
                <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                  <span>VAT / State Consumption (7.5%)</span>
                  <span className="text-text-primary font-medium">{formatNaira(totals.vat)}</span>
                </div>
                <div className="h-px bg-surface-container my-1" />
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-caption text-caption text-text-tertiary uppercase font-bold tracking-wider block">
                      Total Payable
                    </span>
                    <span className="font-label-sm text-label-sm text-text-secondary">Nigerian Naira (NGN)</span>
                  </div>
                  <span className="font-display-hero text-display-hero text-text-primary leading-none tracking-tight">
                    {formatNaira(totals.total)}
                  </span>
                </div>
              </div>

              {/* Checkout Controls */}
              <div className="mt-space-md flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHoldPulse(true);
                      window.setTimeout(() => setHoldPulse(false), 900);
                    }}
                    className={`h-11 rounded-xl font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      holdPulse ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container hover:bg-surface-container-high text-text-primary'
                    }`}
                  >
                    <Icon name="pause_circle" className="text-[18px]" />
                    <span>{holdPulse ? 'Parked…' : 'Hold [F5]'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSplit}
                    className="h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Icon name="call_split" className="text-[18px]" />
                    <span>Split Bill [F6]</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onCharge}
                  className="w-full h-14 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary font-bold shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:scale-[0.98] transition-all flex items-center justify-between px-space-lg"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="payments" className="text-[24px]" />
                    <span>Proceed to Payment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>{formatNaira(totals.total)} →</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-on-primary ml-1 font-mono">
                      SPACE
                    </kbd>
                  </div>
                </button>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {QUICK_TENDER.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={onCharge}
                      className="py-2 px-1 rounded-lg bg-surface hover:bg-surface-container text-text-primary font-caption text-caption font-semibold transition-colors flex flex-col items-center justify-center gap-1 shadow-sm"
                    >
                      <Icon name={chip.icon} className={`text-[18px] ${chip.tone}`} />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {handoffToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-on-surface text-surface px-4 py-3 rounded-xl shadow-xl font-label-md animate-in slide-in-from-bottom duration-200">
          <Icon name="check_circle" className="text-badge-discount-text text-[20px]" />
          <span>{handoffToast}</span>
        </div>
      )}

      {/* POS Order Completed Receipt Dialog */}
      {completedHandoff && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setCompletedHandoff(null)}
          />
          <div className="relative w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl border border-border-subtle z-10 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center mx-auto">
              <Icon name="point_of_sale" className="text-[36px]" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-bold text-[11px] uppercase tracking-wider">
                VEMTAP POS Checkout Complete
              </span>
              <h3 className="font-heading-md text-heading-md font-bold text-text-primary mt-1">
                Order #{completedHandoff.orderRef}
              </h3>
              <p className="text-body-sm text-text-secondary">
                {completedHandoff.customer} • {completedHandoff.items}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-left space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Tender Method:</span>
                <strong className="text-text-primary">{completedHandoff.tender}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Settled:</span>
                <strong className="text-primary font-mono text-[16px]">
                  ₦{completedHandoff.total.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">POS Txn ID:</span>
                <span className="font-mono text-caption text-text-primary font-bold">
                  {completedHandoff.txnId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Audit Trail:</span>
                <span className="text-caption text-text-tertiary">Central Order Updated Automatically</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-subtle font-semibold text-label-md text-text-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                <Icon name="print" className="text-[17px]" />
                <span>Print POS Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompletedHandoff(null);
                  onNav('orders');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm transition-all"
              >
                Return to Orders →
              </button>
            </div>
          </div>
        </div>
      )}
    </PosTerminalChrome>
  );
}
