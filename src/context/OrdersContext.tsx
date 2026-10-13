import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  MERCHANT_IMAGE,
  MERCHANT_NAME,
  estimateReadyBy,
  newOrderRef,
  type FulfillmentMode,
  type OrderLine,
  type OrderStatus,
} from '../scripts/orderData';

/**
 * Shared order store for both sides of the marketplace.
 *
 * WHY THIS EXISTS
 * ---------------
 * Previously the customer side wrote to a single `useState` slot in App.tsx
 * that died on reload, while every merchant/cashier screen rendered its own
 * frozen constants. A customer's `UG-12345` could never meet the cashier.
 * This module is the one store both read and write.
 *
 * BACKEND GAP — still required before this is production-real:
 *   POST /orders                        -> server-assigned ref + authoritative ETA
 *   GET  /orders/{ref}                  -> cashier lookup (must be server-verified)
 *   GET  /orders?merchant=me            -> merchant queue
 *   PATCH /orders/{ref}/status          -> status transitions with audit trail
 * Until those exist this store is client-side only: refs are generated locally
 * (not collision-safe across devices) and any reload on another device will not
 * see these orders.
 */

export interface SubmittedOrder {
  ref: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone?: string;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  fulfillment: FulfillmentMode;
  note?: string;
  status: OrderStatus;
  submittedAt: number;
  readyByLabel?: string;
  source: 'customer-app' | 'pos-walk-in';
}

export interface SubmitOrderInput {
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone?: string;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  fulfillment: FulfillmentMode;
  note?: string;
  source?: SubmittedOrder['source'];
}

export type SubmitOrderResult = { ok: true; order: SubmittedOrder } | { ok: false; error: string };

export interface OrdersContextValue {
  /** Newest first. */
  orders: SubmittedOrder[];
  latest: SubmittedOrder | null;
  submit: (input: SubmitOrderInput) => SubmitOrderResult;
  byRef: (ref: string) => SubmittedOrder | undefined;
  /** Tolerant cashier lookup: ignores case, leading `#`, spaces; allows a numeric-tail match. */
  findByRef: (query: string) => SubmittedOrder | undefined;
  setStatus: (ref: string, status: OrderStatus) => boolean;
  forMerchant: (merchantId?: string) => SubmittedOrder[];
}

const ORDERS_KEY = 'vemtap_orders';

/** Window in which an identical re-submit is treated as an accidental double tap. */
const DUPLICATE_WINDOW_MS = 15_000;

const STORAGE_OK = typeof window !== 'undefined';

const readOrders = (): SubmittedOrder[] => {
  if (!STORAGE_OK) return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SubmittedOrder[]) : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders: SubmittedOrder[]) => {
  if (!STORAGE_OK) return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // storage unavailable; state stays in memory only
  }
};

const seedOrders = (): SubmittedOrder[] => {
  const now = Date.now();
  const line = (id: string, name: string, price: number, qty: number): OrderLine => ({
    id,
    name,
    price,
    qty,
    image: MERCHANT_IMAGE,
  });
  const build = (
    ref: string,
    minutesAgo: number,
    status: OrderStatus,
    customerName: string,
    lines: OrderLine[],
    source: SubmittedOrder['source'] = 'customer-app',
  ): SubmittedOrder => {
    const subtotal = lines.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      ref,
      merchantId: 'urban',
      merchantName: MERCHANT_NAME,
      customerName,
      lines,
      subtotal,
      savings: 0,
      deliveryFee: 0,
      total: subtotal,
      fulfillment: 'pickup',
      status,
      submittedAt: now - minutesAgo * 60_000,
      readyByLabel: estimateReadyBy(Math.max(5, 25 - minutesAgo)),
      source,
    };
  };

  return [
    build('VG-94021', 6, 'submitted', 'Amina Bello', [line('ribeye', 'Ribeye Steak Platter', 18500, 1)]),
    build('POS-1049', 14, 'processing', 'Walk-In Guest', [line('cold-brew', 'Cold Brew 1L & Pastry Box', 4500, 2)], 'pos-walk-in'),
    build('VG-93988', 38, 'ready-for-collection', 'Tunde Balogun', [line('lunch-combo', 'Prime 3-Course Lunch Combo', 9600, 1)]),
  ];
};

const lineSignature = (lines: OrderLine[]): string =>
  lines
    .map((line) => `${line.id}:${line.qty}`)
    .sort()
    .join('|');

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<SubmittedOrder[]>(() => {
    const stored = readOrders();
    if (stored.length > 0) return stored;
    const seeded = seedOrders();
    writeOrders(seeded);
    return seeded;
  });

  useEffect(() => {
    writeOrders(orders);
  }, [orders]);

  const submit = useCallback(
    (input: SubmitOrderInput): SubmitOrderResult => {
      if (input.lines.length === 0) {
        return { ok: false, error: 'Your cart is empty. Add an item before submitting an order.' };
      }

      // Duplicate-submission protection: an identical cart re-submitted within
      // the window is a double tap, not a second order.
      const signature = lineSignature(input.lines);
      const now = Date.now();
      const duplicate = orders.find(
        (existing) =>
          existing.merchantId === input.merchantId &&
          existing.fulfillment === input.fulfillment &&
          Math.abs(existing.total - input.total) < 0.5 &&
          now - existing.submittedAt < DUPLICATE_WINDOW_MS &&
          lineSignature(existing.lines) === signature,
      );
      if (duplicate) {
        return {
          ok: false,
          error: `This order was already submitted as #${duplicate.ref}. Show that reference to the cashier.`,
        };
      }

      const ref = newOrderRef(orders.map((order) => order.ref));
      const order: SubmittedOrder = {
        ref,
        merchantId: input.merchantId,
        merchantName: input.merchantName,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        lines: input.lines,
        subtotal: input.subtotal,
        savings: input.savings,
        deliveryFee: input.deliveryFee,
        total: input.total,
        fulfillment: input.fulfillment,
        note: input.note?.trim() || undefined,
        status: 'submitted',
        submittedAt: now,
        readyByLabel: estimateReadyBy(25),
        source: input.source ?? 'customer-app',
      };

      setOrders((current) => [order, ...current]);
      return { ok: true, order };
    },
    [orders],
  );

  const byRef = useCallback(
    (ref: string) => orders.find((order) => order.ref.toLowerCase() === ref.trim().toLowerCase()),
    [orders],
  );

  const findByRef = useCallback(
    (query: string) => {
      const cleaned = query.trim().replace(/^#/, '').replace(/\s+/g, '');
      if (!cleaned) return undefined;
      const needle = cleaned.toLowerCase();

      // Prefer an exact match on the full reference.
      const exact = orders.find((order) => order.ref.toLowerCase() === needle);
      if (exact) return exact;

      // Then a prefix match, so `UG-248` still finds `UG-24817`.
      const prefix = orders.find((order) => order.ref.toLowerCase().startsWith(needle));
      if (prefix) return prefix;

      // Finally a match on the numeric tail, so a cashier can type just `24817`.
      return orders.find((order) => order.ref.toLowerCase().endsWith(needle));
    },
    [orders],
  );

  const setStatus = useCallback((ref: string, status: OrderStatus) => {
    let found = false;
    setOrders((current) => {
      const next = current.map((order) => {
        if (order.ref.toLowerCase() !== ref.trim().toLowerCase()) return order;
        found = true;
        return { ...order, status };
      });
      return found ? next : current;
    });
    return found;
  }, []);

  const forMerchant = useCallback(
    (merchantId?: string) =>
      merchantId ? orders.filter((order) => order.merchantId === merchantId) : orders,
    [orders],
  );

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, latest: orders[0] ?? null, submit, byRef, findByRef, setStatus, forMerchant }),
    [orders, submit, byRef, findByRef, setStatus, forMerchant],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within an OrdersProvider');
  return ctx;
}
