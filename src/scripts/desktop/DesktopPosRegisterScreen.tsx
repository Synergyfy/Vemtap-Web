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
import { PosModifiersModal } from './PosModifiersModal';
import { PosCustomerModal } from './PosCustomerModal';
import { PosLoyaltyPanel } from './PosLoyaltyPanel';
import { usePosSettings } from '../../context/PosSettingsContext';
import { describeModifiers, modifierSurcharge, type PosCustomerRecord } from './posRegisterExtras';
import { PosOfflineBar } from '../../components/ui/PosOfflineBar';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { useHeldTicket, useLivePos, usePosProducts } from '../posLive';

interface DesktopPosRegisterScreenProps {
  onNav: (key: PosTerminalNavKey) => void;
  cart: PosTerminalLine[];
  onCartChange: (lines: PosTerminalLine[]) => void;
  customer: PosCustomerRecord | null;
  onCustomerChange: (customer: PosCustomerRecord | null) => void;
  onCharge: () => void;
  onSplit: () => void;
  onOpenCustomer: () => void;
  onOpenOrders: () => void;
  /** Opens the Help & Support page (F1). */
  onHelp: () => void;
  /** Loyalty points awarded for the current ticket, committed on payment. */
  onAwardPoints: (points: number) => void;
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

/**
 * Tender shortcuts. VEMTAP QR is removed — the business handles cash, card and
 * transfer externally. Split Payment routes to the split-bill workspace.
 */
const QUICK_TENDER = [
  { icon: 'credit_card', label: 'Card / POS', tone: 'text-primary' },
  { icon: 'payments', label: 'Cash', tone: 'text-badge-discount-text' },
  { icon: 'account_balance', label: 'Transfer', tone: 'text-secondary' },
  { icon: 'call_split', label: 'Split Payment', tone: 'text-tertiary' },
];

/** Statuses that count as "waiting on the cashier" for the orders badge. */
const PENDING_STATUSES = new Set(['new', 'accepted', 'preparing', 'ready', 'awaiting-payment']);

export function DesktopPosRegisterScreen({
  onNav,
  cart,
  onCartChange,
  customer,
  onCustomerChange,
  onCharge,
  onSplit,
  onOpenOrders,
  onHelp,
  onAwardPoints,
}: DesktopPosRegisterScreenProps) {
  const [category, setCategory] = useState(0);
  const [holdPulse, setHoldPulse] = useState(false);
  const [handoffToast, setHandoffToast] = useState<string | null>(null);
  const [spaceCharges, setSpaceCharges] = useState(true);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [modifiersFor, setModifiersFor] = useState<PosTerminalLine | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [ordersPanelOpen, setOrdersPanelOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const live = hasApiConfig();
  const pos = useLivePos();
  const catalogue = usePosProducts();
  const heldTicket = useHeldTicket();
  const [search, setSearch] = useState('');
  const categoryList = live
    ? catalogue.categories.map((entry) => {
        const n = entry.key === 'all' ? catalogue.items.length : catalogue.items.filter((item) => item.category?.id === entry.key).length;
        return `${entry.key === 'all' ? 'All Items' : entry.label} (${n})`;
      })
    : CATEGORIES;
  const products = useMemo(() => {
    if (!live) return POS_CATALOG;
    const key = catalogue.categories[category]?.key ?? 'all';
    const q = search.trim().toLowerCase();
    return catalogue.desktop.filter((item, index) => {
      const source = catalogue.items[index];
      const inCategory = key === 'all' || source?.category?.id === key;
      const matches = !q || item.name.toLowerCase().includes(q) || (source?.sku ?? '').toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [live, catalogue.desktop, catalogue.items, catalogue.categories, category, search]);

  const flash = (message: string) => {
    setHandoffToast(message);
    window.setTimeout(() => setHandoffToast(null), 3000);
  };

  useEffect(() => {
    if (live && catalogue.error) flash(apiErrorMessage(catalogue.error, 'Could not load your catalogue.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue.error]);

  /** Hold / F5 — live: park the ticket as a held sale, or resume the oldest one. */
  const holdTicket = () => {
    setHoldPulse(true);
    window.setTimeout(() => setHoldPulse(false), 900);
    if (!live) return;
    if (cart.length) {
      heldTicket
        .hold(cart)
        .then(() => {
          onCartChange([]);
          flash('Ticket held — press Hold again to bring it back.');
        })
        .catch((error: unknown) => flash(apiErrorMessage(error, 'Could not hold the ticket.')));
      return;
    }
    heldTicket
      .resume()
      .then((lines) => {
        if (!lines) {
          flash('No held tickets.');
          return;
        }
        onCartChange(lines.map((line) => ({ ...line, mods: '' })));
        flash('Held ticket loaded.');
      })
      .catch((error: unknown) => flash(apiErrorMessage(error, 'Could not load the held ticket.')));
  };

  /** Live: the server prices by product, so modifiers can't change the price yet. */
  const openModifiers = (line: PosTerminalLine | null) => {
    if (live) {
      flash('Modifiers are coming soon.');
      return;
    }
    setModifiersFor(line);
  };

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

  // Orders waiting on the till: store/QR orders plus any handed to POS.
  const pendingOrders = useMemo(() => orders.filter((o) => PENDING_STATUSES.has(o.status)), [orders]);
  const pendingCount = pendingOrders.length;

  const [completedHandoff, setCompletedHandoff] = useState<{
    orderRef: string;
    tender: string;
    txnId: string;
    total: number;
    items: string;
    customer: string;
  } | null>(null);

  const { taxMode, taxRate, taxLabel, loyaltyEnabled } = usePosSettings();
  const totals = useMemo(() => computeTotals(cart, taxMode, taxRate / 100), [cart, taxMode, taxRate]);
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

  const applyModifiers = (lineId: string, ids: string[]) => {
    const surcharge = modifierSurcharge(ids);
    onCartChange(
      cart.map((line) => {
        if (line.id !== lineId) return line;
        const baseUnit = line.modifierIds ? line.unit - modifierSurcharge(line.modifierIds) : line.unit;
        return {
          ...line,
          modifierIds: ids,
          unit: baseUnit + surcharge,
          mods: describeModifiers(ids) || line.mods,
        };
      }),
    );
    setModifiersFor(null);
  };

  /** Load a pending store order onto the ticket so it can be paid at the till. */
  const pickOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setActivePosHandoffOrderId(orderId);
    onCartChange(
      order.items
        .filter((item) => item.available && !item.removed)
        .map((item) => ({
          id: `${order.id}-${item.id}`,
          name: item.name,
          mods: [item.variant, ...(item.options ?? [])].filter(Boolean).join(' • ') || item.meta || 'Store order',
          unit: item.unitPrice,
          qty: item.qty,
          sourceOrderRef: order.orderRef,
        })),
    );
    if (customer === null && order.customerName) {
      onCustomerChange({
        id: `order-${order.id}`,
        name: order.customerName,
        phone: order.customerPhone ?? '',
        onVemtap: false,
        tier: 'Member',
        tierClass: 'bg-surface-container text-text-secondary',
        points: 0,
        spend: 0,
        visits: 1,
      });
    }
    setOrdersPanelOpen(false);
    setHandoffToast(`Order #${order.orderRef} loaded onto the ticket.`);
    window.setTimeout(() => setHandoffToast(null), 3000);
  };

  /** Scan simulation: match a barcode/QR to a catalogue item or a store order. */
  const simulateScan = () => {
    if (live) {
      searchRef.current?.focus();
      flash('Camera scanning is coming soon — type the SKU or name in search.');
      return;
    }
    const order = pendingOrders[0];
    const item = POS_CATALOG[Math.floor(Math.random() * POS_CATALOG.length)];
    // Alternate between a product scan and an order scan so both paths are testable.
    if (order && Math.random() > 0.5) {
      pickOrder(order.id);
      setHandoffToast(`Scanned order #${order.orderRef} — loaded to ticket.`);
    } else {
      onCartChange(addLine(cart, item));
      setHandoffToast(`Scanned ${item.name} — added to ticket.`);
    }
    window.setTimeout(() => setHandoffToast(null), 3000);
  };

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

  const createNewTicket = () => {
    onCartChange([]);
    onOpenOrders();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        onHelp();
      } else if (event.key === 'F3') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        // SPACE charges only when the switch is on.
        if (spaceCharges) {
          event.preventDefault();
          onCharge();
        }
      } else if (event.key === 'F5') {
        event.preventDefault();
        holdTicket();
      } else if (event.key === 'F6') {
        event.preventDefault();
        onSplit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCharge, onSplit, onHelp, spaceCharges, cart, live]);

  const selectedLine = cart.find((line) => line.id === selectedLineId) ?? null;

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

            {/* Orders with live pending count — opens the pending-orders picker. */}
            <button
              type="button"
              onClick={() => setOrdersPanelOpen(true)}
              title="Pending orders"
              className="relative flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-tint-blue text-primary hover:bg-primary hover:text-on-primary transition-colors shrink-0"
            >
              <Icon name="receipt_long" className="text-[17px]" />
              <span className="font-label-sm text-label-sm font-semibold tracking-tight">Orders</span>
              {pendingCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-error text-white font-caption text-caption font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-space-xs overflow-x-auto py-0.5">
            {FUNCTION_KEYS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (item.key === 'F1') onHelp();
                  else if (item.key === 'F3') searchRef.current?.focus();
                  else if (item.key === 'F5') holdTicket();
                  else if (item.key === 'F6') onSplit();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-text-secondary hover:bg-surface-container-high transition-colors shrink-0"
              >
                <kbd className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-surface-canvas shadow-sm text-primary">
                  {item.key}
                </kbd>
                <span className="font-caption text-caption font-medium">{item.label}</span>
              </button>
            ))}

            {/* SPACE ↔ Charge switch */}
            <button
              type="button"
              role="switch"
              aria-checked={spaceCharges}
              onClick={() => setSpaceCharges((value) => !value)}
              title={spaceCharges ? 'SPACE charges — click to disable' : 'SPACE is disabled — click to enable charging'}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                spaceCharges ? 'bg-surface-container-high text-primary' : 'bg-surface-container text-text-tertiary'
              }`}
            >
              <kbd className="px-2 py-0.5 text-[11px] font-bold rounded shadow-sm bg-primary text-on-primary">SPACE</kbd>
              <span className="font-caption text-caption font-bold">Charge</span>
              <span
                className={`relative w-8 h-4 rounded-full transition-colors ${spaceCharges ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${spaceCharges ? 'left-[18px]' : 'left-0.5'}`}
                />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Offline state + "Sync Online" — the only place sync lives now that /pos/sync is gone. */}
      <section className="w-full px-space-md pt-space-xs">
        <PosOfflineBar />
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
                <div className="flex items-center gap-2 flex-wrap">
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
                onClick={onCharge}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-md shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="payments" className="text-[17px]" />
                <span>Proceed to Payment (₦{handedOffOrder.confirmedTotal.toLocaleString()})</span>
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
                onClick={() => {
                  setActivePosHandoffOrderId(null);
                  onCartChange([]);
                }}
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
                  value={live ? search : undefined}
                  onChange={live ? (event) => setSearch(event.target.value) : undefined}
                  className="w-full h-12 pl-11 pr-14 rounded-xl bg-surface text-text-primary placeholder:text-text-tertiary text-body-md font-body-md focus:bg-surface-canvas focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,108,244,0.18)] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-caption text-caption font-bold">
                  F3
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0">
                {/* QR & barcode scanner */}
                <button
                  type="button"
                  onClick={simulateScan}
                  title="Scan QR or barcode"
                  className="h-12 w-12 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm"
                >
                  <Icon name="qr_code_scanner" className="text-[22px]" />
                </button>
                <button
                  type="button"
                  onClick={() => openModifiers(selectedLine ?? cart[cart.length - 1] ?? null)}
                  className="h-12 px-space-md rounded-xl bg-surface-tint-blue text-primary font-button-secondary text-button-secondary flex items-center gap-1.5 hover:bg-surface-container-high transition-colors shadow-sm"
                >
                  <Icon name="tune" className="text-[19px]" />
                  <span>+ Modifiers</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
              {categoryList.map((label, index) => (
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
              {products.map((item) => (
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
                    {item.badge && (
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-caption text-caption shadow-sm ${BADGE_TONES[item.badgeTone]}`}
                    >
                      {item.badge}
                    </span>
                    )}
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
                    <h3 className="font-heading-md text-heading-md text-text-primary tracking-tight">{live ? 'New Ticket' : 'Ticket #TK-108'}</h3>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary mt-1">
                    {live
                      ? `${pos.isOpen ? pos.tillName : 'No till open'} • ${customer?.name ?? 'Walk-in Guest'}`
                      : `Table 04 • ${customer?.name ?? 'Walk-in Guest'} • 13:42:09 WAT`}
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

              {/* Customer tag — walk-in friendly; attach is optional */}
              <div className="p-space-sm rounded-lg bg-surface-subtle flex items-center justify-between mb-space-md shadow-sm">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-label-sm flex items-center justify-center shadow-sm shrink-0">
                    {customer
                      ? customer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
                      : 'WI'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                      {customer ? customer.name : 'Walk-in Guest'}
                    </span>
                    <span className="font-caption text-caption text-badge-discount-text font-medium truncate">
                      {customer
                        ? `${customer.points.toLocaleString()} pts • ${customer.tier}`
                        : 'No customer attached — payment still allowed'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {customer && (
                    <button
                      type="button"
                      title="Remove Customer"
                      aria-label="Remove customer from ticket"
                      onClick={() => {
                        const name = customer.name;
                        onCustomerChange(null);
                        setHandoffToast(`${name} removed from this ticket.`);
                        window.setTimeout(() => setHandoffToast(null), 2500);
                      }}
                      className="w-7 h-7 rounded-full bg-surface-container-high text-text-secondary hover:text-error hover:bg-error-container flex items-center justify-center transition-colors"
                    >
                      <Icon name="person_remove" className="text-[17px]" />
                    </button>
                  )}
                  <button
                    type="button"
                    title={customer ? 'Change Customer' : 'Attach Customer'}
                    onClick={() => setCustomerModalOpen(true)}
                    className="p-1 text-text-tertiary hover:text-primary transition-colors"
                  >
                    <Icon name={customer ? 'cached' : 'person_add'} className="text-[18px]" />
                  </button>
                </div>
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
                    const isSelected = selectedLineId === line.id;
                    return (
                      <div
                        key={line.id}
                        onClick={() => setSelectedLineId(isSelected ? null : line.id)}
                        className={`p-3 rounded-lg bg-surface flex flex-col gap-2 cursor-pointer transition-shadow ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                      >
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
                              onClick={(e) => { e.stopPropagation(); changeQty(line.id, -1); }}
                              className="text-text-secondary hover:text-text-primary text-[15px] font-bold"
                            >
                              −
                            </button>
                            <span className="font-label-md text-label-md font-semibold text-text-primary px-1">{line.qty}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); changeQty(line.id, 1); }}
                              className="text-text-secondary hover:text-text-primary text-[15px] font-bold"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="Edit modifiers"
                              onClick={(e) => { e.stopPropagation(); openModifiers(line); }}
                              className="text-text-tertiary hover:text-primary transition-colors"
                            >
                              <Icon name="tune" className="text-[17px]" />
                            </button>
                            <button
                              type="button"
                              title="Remove line"
                              onClick={(e) => { e.stopPropagation(); removeLine(line.id); }}
                              className="text-text-tertiary hover:text-error transition-colors"
                            >
                              <Icon name="delete" className="text-[18px]" />
                            </button>
                          </div>
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
                {taxMode !== 'none' && (
                  <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary">
                    <span>
                      {taxLabel} ({taxRate}%){taxMode === 'inclusive' && ' · included'}
                    </span>
                    <span className="text-text-primary font-medium">{formatNaira(totals.vat)}</span>
                  </div>
                )}
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
                    onClick={holdTicket}
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
                      onClick={() => (chip.label === 'Split Payment' ? onSplit() : onCharge())}
                      className="py-2 px-1 rounded-lg bg-surface hover:bg-surface-container text-text-primary font-caption text-caption font-semibold transition-colors flex flex-col items-center justify-center gap-1 shadow-sm"
                    >
                      <Icon name={chip.icon} className={`text-[18px] ${chip.tone}`} />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loyalty panel — points balance, next reward, and manual award */}
            {customer && totals.total > 0 && loyaltyEnabled && (
              <PosLoyaltyPanel
                customer={customer}
                ticketTotal={totals.total}
                onAward={(points) => {
                  onAwardPoints(points);
                  setHandoffToast(`${points.toLocaleString()} points awarded to ${customer.name}.`);
                  window.setTimeout(() => setHandoffToast(null), 3000);
                }}
              />
            )}
          </aside>
        </div>
      </div>

      {/* Pending orders picker */}
      {ordersPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Pending orders">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setOrdersPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-surface-canvas rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[86vh]">
            <div className="px-space-lg pt-space-lg pb-space-sm border-b border-border-subtle flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading-md text-heading-md text-text-primary tracking-tight">Pending Orders</h2>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  Pick an order to load it onto the ticket and take payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrdersPanelOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-space-lg py-space-md">
              {pendingOrders.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-center gap-2">
                  <Icon name="checklist" className="text-[32px] text-text-tertiary" />
                  <p className="font-body-md text-body-md text-text-secondary">No pending orders — the queue is clear.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pendingOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => pickOrder(order.id)}
                      className="w-full p-space-sm rounded-xl bg-surface hover:bg-surface-tint-blue text-left transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon name="receipt_long" className="text-primary text-[20px] shrink-0" />
                        <div className="min-w-0">
                          <span className="font-mono font-label-md text-label-md text-text-primary font-semibold block truncate">
                            #{order.orderRef}
                          </span>
                          <span className="font-caption text-caption text-text-secondary truncate block">
                            {order.customerName} • {order.origin} • {order.items.length} items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold capitalize">
                          {order.status}
                        </span>
                        <span className="font-label-md text-label-md font-bold text-text-primary">
                          {formatNaira(order.confirmedTotal)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modifiers modal */}
      {modifiersFor && (
        <PosModifiersModal
          lineName={modifiersFor.name}
          initial={modifiersFor.modifierIds ?? []}
          onCancel={() => setModifiersFor(null)}
          onApply={(ids) => applyModifiers(modifiersFor.id, ids)}
        />
      )}

      {/* Customer modal (walk-in optional) */}
      {customerModalOpen && (
        <PosCustomerModal
          onClose={() => setCustomerModalOpen(false)}
          onSelect={(record) => {
            onCustomerChange(record);
            setCustomerModalOpen(false);
            setHandoffToast(`${record.name} attached to this ticket.`);
            window.setTimeout(() => setHandoffToast(null), 2500);
          }}
        />
      )}

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
                <span className="font-caption text-text-tertiary">Central Order Updated Automatically</span>
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
