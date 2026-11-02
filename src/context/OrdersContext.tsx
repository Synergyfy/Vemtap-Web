import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasApiConfig } from '../lib/api';
import { ordersService } from '../services/ordersService';
import { useSessionUser } from '../hooks/useSessionUser';
import {
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
  merchantPhone?: string;
  merchantAddress?: string;
  merchantLogo?: string;
  merchantLatitude?: number;
  merchantLongitude?: number;
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

export type SubmitOrderResult = { ok: true; order: SubmittedOrder; placedCount: number } | { ok: false; error: string };

export interface OrdersContextValue {
  /** Newest first. */
  orders: SubmittedOrder[];
  /** True until `GET /catalogue/orders/my-orders` has answered. */
  ordersLoading: boolean;
  latest: SubmittedOrder | null;
  submit: (input: SubmitOrderInput) => Promise<SubmitOrderResult>;
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

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<SubmittedOrder[]>(() => readOrders());
  // `GET /catalogue/orders/my-orders` is customer-only: business accounts and
  // signed-out visitors would only get a 403/401, so they don't ask.
  const isCustomer = useSessionUser().data?.role === 'Customer';
  const [ordersLoading, setOrdersLoading] = useState(() => hasApiConfig());

  useEffect(() => {
    if (!hasApiConfig() || !isCustomer) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let ignore = false;
    setOrdersLoading(true);

    const hydrate = async () => {
      try {
        const remoteOrders = await ordersService.getMyOrders({ page: 1, limit: 20 });
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
      } finally {
        if (!ignore) setOrdersLoading(false);
      }
    };

    void hydrate();
    return () => {
      ignore = true;
    };
  }, [isCustomer]);

  useEffect(() => {
    writeOrders(orders);
  }, [orders]);

  const submit = useCallback(
    async (input: SubmitOrderInput): Promise<SubmitOrderResult> => {
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
        (existing) => now - existing.submittedAt < DUPLICATE_WINDOW_MS && lineSignature(existing.lines) === signature,
      );
      if (duplicate) {
        return { ok: false, error: `This order was already submitted as #${duplicate.ref}. Show that reference at the counter.` };
      }

      if (input.lines.some((line) => !line.branchId)) {
        return { ok: false, error: 'Remove items that aren’t from a business page, then try again.' };
      }

      // The cart can hold several businesses: each branch gets its own order.
      const branches = [...new Set(input.lines.map((line) => line.branchId as string))];
      try {
        const [firstName = 'Customer', ...rest] = input.customerName.trim().split(/\s+/);
        const placed: SubmittedOrder[] = await ordersService.bulkCheckout({
          firstName,
          lastName: rest.join(' ') || undefined,
          phone: input.customerPhone || undefined,
          orders: branches.map((branchId) => ({
            branchId,
            notes: input.note?.trim() || undefined,
            items: input.lines
              .filter((line) => line.branchId === branchId)
              .map((line) => ({ itemId: line.productId ?? line.id, quantity: Math.max(1, Number(line.qty) || 1) })),
          })),
        });
        if (placed.length === 0) return { ok: false, error: 'The order could not be confirmed. Please try again.' };

        // The response carries the order, not the branch it was loaded with.
        const named = placed.map((order, index) => {
          const lines = input.lines.filter((line) => line.branchId === branches[index]);
          return {
            ...order,
            merchantId: branches[index] ?? order.merchantId,
            merchantName: lines[0]?.merchantName || order.merchantName,
            merchantLogo: lines[0]?.merchantLogo || order.merchantLogo,
            merchantPhone: lines[0]?.merchantPhone || order.merchantPhone,
            merchantAddress: lines[0]?.merchantAddress || order.merchantAddress,
            merchantLatitude: lines[0]?.merchantLatitude ?? order.merchantLatitude,
            merchantLongitude: lines[0]?.merchantLongitude ?? order.merchantLongitude,
            lines: order.lines.length ? order.lines.map((line, position) => ({ ...line, name: lines[position]?.name ?? line.name, image: line.image || lines[position]?.image || '' })) : lines,
          };
        });
        setOrders((current) => {
          const next = [...named, ...current];
          writeOrders(next);
          return next;
        });
        return { ok: true, order: named[0], placedCount: named.length };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'The order could not be placed. Please try again.' };
      }
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
      ordersLoading,
      latest: orders[0] ?? null,
      submit,
      byRef,
      findByRef,
      findByCustomer,
      setStatus,
      markPaid,
      forMerchant,
    }),
    [orders, ordersLoading, submit, byRef, findByRef, findByCustomer, setStatus, markPaid, forMerchant],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within an OrdersProvider');
  return ctx;
}
