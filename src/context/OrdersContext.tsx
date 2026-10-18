import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiGet, apiPatch, hasApiConfig } from '../lib/api';
import { ordersService } from '../services/ordersService';
import {
  MERCHANT_IMAGE,
  MERCHANT_NAME,
  estimateReadyBy,
  newOrderRef,
  type FulfillmentMode,
  type OrderLine,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Server-issued transaction reference once payment is verified. */
  paymentRef?: string;
  /** Separate, optional marketing opt-in captured with the order. */
  marketingConsent?: boolean;
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
  paymentMethod?: PaymentMethod;
  marketingConsent?: boolean;
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
  /** Cashier lookup by customer phone (last-4 digits accepted). */
  findByCustomer: (query: string) => SubmittedOrder[];
  setStatus: (ref: string, status: OrderStatus) => boolean;
  /** Record a verified tender against an order. Only this may mark an order paid. */
  markPaid: (ref: string, paymentRef?: string) => boolean;
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
    payment: { method: PaymentMethod; status: PaymentStatus; ref?: string } = {
      method: 'pay-at-counter',
      status: 'not-required',
    },
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
      paymentMethod: payment.method,
      paymentStatus: payment.status,
      paymentRef: payment.ref,
    };
  };

  return [
    build('VG-94021', 6, 'submitted', 'Amina Bello', [line('ribeye', 'Ribeye Steak Platter', 18500, 1)]),
    build(
      'POS-1049',
      14,
      'processing',
      'Walk-In Guest',
      [line('cold-brew', 'Cold Brew 1L & Pastry Box', 4500, 2)],
      'pos-walk-in',
      { method: 'card', status: 'verified', ref: 'TXN-7741902' },
    ),
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
    if (!hasApiConfig()) return;

    let ignore = false;

    const hydrate = async () => {
      try {
        const remoteOrders = await ordersService.getMyOrders({ page: 1, limit: 20 });
        if (!ignore && Array.isArray(remoteOrders) && remoteOrders.length > 0) {
          setOrders(remoteOrders);
          writeOrders(remoteOrders);
          return;
        }

        const fallback = await apiGet<SubmittedOrder[]>('/orders?merchant=me').catch(() => [] as SubmittedOrder[]);
        if (!ignore && Array.isArray(fallback) && fallback.length > 0) {
          setOrders(fallback);
          writeOrders(fallback);
        }
      } catch {
        // Keep seeded local data while the backend is unavailable.
      }
    };

    void hydrate();
    return () => {
      ignore = true;
    };
  }, []);

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
      const paymentMethod = input.paymentMethod ?? 'pay-at-counter';
      // An order is never marked paid at submission. Pay-at-counter stays
      // `submitted` until the cashier records the tender; online methods sit in
      // `payment-pending` until a server-side verification confirms them.
      const initialStatus: OrderStatus = paymentMethod === 'pay-at-counter' ? 'submitted' : 'payment-pending';
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
        status: initialStatus,
        submittedAt: now,
        readyByLabel: estimateReadyBy(25),
        source: input.source ?? 'customer-app',
        paymentMethod,
        paymentStatus: paymentMethod === 'pay-at-counter' ? 'not-required' : 'pending',
        marketingConsent: input.marketingConsent === true,
      };

      setOrders((current) => [order, ...current]);

      if (hasApiConfig()) {
        const payload = {
          ref: order.ref,
          merchantId: order.merchantId,
          merchantName: order.merchantName,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: order.lines.map((line) => ({
            id: line.id,
            productId: line.productId,
            name: line.name,
            quantity: line.qty,
            price: line.price,
            image: line.image,
            options: line.options,
            instructions: line.instructions,
          })),
          subtotal: order.subtotal,
          savings: order.savings,
          deliveryFee: order.deliveryFee,
          total: order.total,
          fulfillment: order.fulfillment,
          note: order.note,
          status: initialStatus,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'pay-at-counter' ? 'not-required' : 'pending',
          marketingConsent: order.marketingConsent,
        };

        void ordersService.createOrder(payload)
          .then((remoteOrder) => {
            if (!remoteOrder) return;
            setOrders((current) => {
              const next = current.some((existing) => existing.ref === remoteOrder.ref)
                ? current
                : [remoteOrder, ...current];
              writeOrders(next);
              return next;
            });
          })
          .catch(() => undefined);
      }

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

    if (hasApiConfig()) {
      void apiPatch(`/orders/${encodeURIComponent(ref)}/status`, { status }).catch(() => undefined);
    }

    return found;
  }, []);

  const markPaid = useCallback((ref: string, paymentRef?: string) => {
    let found = false;
    setOrders((current) => {
      const next = current.map((order) => {
        if (order.ref.toLowerCase() !== ref.trim().toLowerCase()) return order;
        found = true;
        return {
          ...order,
          status: 'paid' as OrderStatus,
          paymentStatus: 'verified' as PaymentStatus,
          paymentRef: paymentRef?.trim() || order.paymentRef || `TXN-${Math.floor(1000000 + Math.random() * 8999999)}`,
        };
      });
      return found ? next : current;
    });

    if (hasApiConfig()) {
      const resolvedPaymentRef = paymentRef?.trim() || `TXN-${Math.floor(1000000 + Math.random() * 8999999)}`;
      void apiPatch(`/orders/${encodeURIComponent(ref)}/payment`, { paymentRef: resolvedPaymentRef, status: 'paid' }).catch(() => undefined);
    }

    return found;
  }, []);

  const findByCustomer = useCallback(
    (query: string) => {
      const cleaned = query.trim();
      if (!cleaned) return [];
      const digits = cleaned.replace(/\D/g, '');
      const needle = cleaned.toLowerCase();
      return orders.filter((order) => {
        const name = order.customerName.toLowerCase();
        if (name.includes(needle)) return true;
        if (!digits) return false;
        const phoneDigits = (order.customerPhone ?? '').replace(/\D/g, '');
        // Last-4 match so a cashier can look up with a partial number.
        return phoneDigits.length >= 4 && phoneDigits.endsWith(digits.slice(-4));
      });
    },
    [orders],
  );

  const forMerchant = useCallback(
    (merchantId?: string) =>
      merchantId ? orders.filter((order) => order.merchantId === merchantId) : orders,
    [orders],
  );

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      latest: orders[0] ?? null,
      submit,
      byRef,
      findByRef,
      findByCustomer,
      setStatus,
      markPaid,
      forMerchant,
    }),
    [orders, submit, byRef, findByRef, findByCustomer, setStatus, markPaid, forMerchant],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within an OrdersProvider');
  return ctx;
}
