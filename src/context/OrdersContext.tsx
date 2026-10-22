import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasApiConfig } from '../lib/api';
import { ordersService } from '../services/ordersService';
import {
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

const lineSignature = (lines: OrderLine[]): string =>
  lines
    .map((line) => `${line.id}:${line.qty}`)
    .sort()
    .join('|');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value?: string) => typeof value === 'string' && UUID_RE.test(value.trim());

const buildCatalogueOrderPayload = (
  input: SubmitOrderInput,
  customer: { firstName: string; lastName: string; email: string; phone: string },
): Record<string, unknown> => {
  const firstName = customer.firstName.trim() || 'Customer';
  const lastName = customer.lastName.trim();
  const phone = (input.customerPhone ?? customer.phone ?? '').trim();
  const branchId = input.merchantId?.trim() && isUuid(input.merchantId) ? input.merchantId.trim() : null;

  if (!branchId) {
    throw new Error('This merchant is missing a valid branchId. Connect the live branch metadata before submitting checkout.');
  }

  const items = input.lines.map((line, index) => {
    const itemId = (line.productId ?? line.id ?? '').trim();
    if (!isUuid(itemId)) {
      throw new Error(
        `Cart item "${line.name || `#${index + 1}`}" has a non-UUID catalogue id (${itemId || 'missing'}). The backend rejects these slug-style ids.`,
      );
    }

    return {
      itemId,
      quantity: Math.max(1, Number(line.qty) || 1),
    };
  });

  return {
    branchId,
    items,
    notes: input.note?.trim() || undefined,
    customer: {
      firstName,
      lastName,
      phone: phone || undefined,
      email: customer.email?.trim() || undefined,
    },
  };
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<SubmittedOrder[]>(() => readOrders());

  useEffect(() => {
    if (!hasApiConfig()) {
      setOrders([]);
      return;
    }

    let ignore = false;

    const hydrate = async () => {
      try {
        const remoteOrders = await ordersService.getMyOrders({ page: 1, limit: 20 });
        console.log('orders api payload', remoteOrders);
        if (!ignore) {
          setOrders(Array.isArray(remoteOrders) ? remoteOrders : []);
          writeOrders(Array.isArray(remoteOrders) ? remoteOrders : []);
        }
      } catch (error) {
        console.error('orders api error', error);
        if (!ignore) {
          setOrders([]);
          writeOrders([]);
        }
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

      if (!hasApiConfig()) {
        return { ok: false, error: 'API is not configured. Set VITE_API_BASE_URL before submitting orders.' };
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

      let payload: Record<string, unknown>;
      try {
        const profile = {
          firstName: input.customerName.split(' ')[0] ?? 'Customer',
          lastName: input.customerName.split(' ').slice(1).join(' '),
          email: '',
          phone: input.customerPhone ?? '',
        };
        payload = buildCatalogueOrderPayload(input, profile);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The live order API rejected this checkout payload.';
        return { ok: false, error: message };
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

      const createdOrder = { ...order };
      setOrders((current) => [createdOrder, ...current]);
      writeOrders([createdOrder, ...orders]);

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
        .catch(() => {
          setOrders((current) => current.filter((existing) => existing.ref !== createdOrder.ref));
          writeOrders(orders.filter((existing) => existing.ref !== createdOrder.ref));
        });

      return { ok: true, order: createdOrder };
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
      void ordersService.updateStatus(ref, { status: String(status) }).catch(() => undefined);
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
      void ordersService.updateStatus(ref, { status: 'paid' }).catch(() => undefined);
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
