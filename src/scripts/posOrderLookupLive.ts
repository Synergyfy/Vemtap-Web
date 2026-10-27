import { useCallback, useMemo } from 'react';
import { hasApiConfig } from '../services/api/client';
import { useOrders, type SubmittedOrder } from '../context/OrdersContext';
import { useStoreOrdering } from '../context/StoreOrderingContext';
import type { OrderStatus, PaymentMethod, PaymentStatus } from './orderData';
import type { StoreOrder, StoreOrderStatus } from './storeOrderingData';

const STATUS_FROM_STORE: Record<StoreOrderStatus, OrderStatus> = {
  new: 'submitted',
  accepted: 'confirmed',
  preparing: 'processing',
  ready: 'ready-for-collection',
  'awaiting-payment': 'payment-pending',
  paid: 'paid',
  completed: 'completed',
  'partially-fulfilled': 'processing',
  rejected: 'cancelled',
  cancelled: 'cancelled',
};

const STATUS_TO_STORE: Partial<Record<OrderStatus, StoreOrderStatus>> = {
  confirmed: 'accepted',
  processing: 'preparing',
  'ready-for-collection': 'ready',
  'payment-pending': 'awaiting-payment',
  paid: 'paid',
  cancelled: 'cancelled',
};

const paymentStatus = (order: StoreOrder): PaymentStatus =>
  order.payment.status === 'refunded'
    ? 'refunded'
    : order.payment.status === 'paid-in-store' || order.payment.status === 'paid-pos'
      ? 'verified'
      : 'pending';

const paymentMethod = (order: StoreOrder): PaymentMethod =>
  order.payment.method === 'bank-transfer' ? 'transfer' : order.payment.method === 'pos-terminal' ? 'card' : 'pay-at-counter';

/** A business store order in the cashier lookup's order shape. */
const toSubmitted = (order: StoreOrder): SubmittedOrder => ({
  ref: order.orderRef,
  merchantId: order.branchId,
  merchantName: order.branchName,
  customerName: order.customerName,
  customerPhone: order.customerPhone || undefined,
  lines: order.items
    .filter((item) => !item.removed)
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.unitPrice,
      qty: item.qty,
      image: item.image,
      options: item.options?.join(', ') || undefined,
    })),
  subtotal: order.subtotal ?? order.confirmedTotal,
  savings: order.savings ?? 0,
  deliveryFee: order.deliveryFee ?? 0,
  total: order.confirmedTotal || order.estimatedTotal,
  fulfillment: order.deliveryFee ? 'delivery' : 'pickup',
  note: order.customerNotes,
  status: STATUS_FROM_STORE[order.status],
  submittedAt: Date.parse(order.createdAt) || Date.now(),
  source: order.origin === 'POS' || order.origin === 'POS Walk-in' ? 'pos-walk-in' : 'customer-app',
  paymentMethod: paymentMethod(order),
  paymentStatus: paymentStatus(order),
  paymentRef: order.payment.reference ?? order.payment.posTransactionId,
});

const matchRef = <T extends { ref: string }>(orders: T[], query: string) => {
  const needle = query.trim().replace(/^#/, '').replace(/\s+/g, '').toLowerCase();
  if (!needle) return undefined;
  return (
    orders.find((order) => order.ref.toLowerCase() === needle) ??
    orders.find((order) => order.ref.toLowerCase().startsWith(needle)) ??
    orders.find((order) => order.ref.toLowerCase().endsWith(needle))
  );
};

const matchCustomer = (orders: SubmittedOrder[], query: string) => {
  const cleaned = query.trim();
  if (!cleaned) return [];
  const digits = cleaned.replace(/\D/g, '');
  const needle = cleaned.toLowerCase();
  return orders.filter((order) => {
    if (order.customerName.toLowerCase().includes(needle)) return true;
    if (!digits) return false;
    const phoneDigits = (order.customerPhone ?? '').replace(/\D/g, '');
    return phoneDigits.length >= 4 && phoneDigits.endsWith(digits.slice(-4));
  });
};

/**
 * The cashier order lookup's data. Live, it searches the business's store
 * orders (QR / storefront / POS) and acts through the store-ordering API;
 * the demo keeps the local consumer-order store.
 */
export function useLookupOrders() {
  const demo = useOrders();
  const store = useStoreOrdering();
  const live = hasApiConfig();
  const liveOrders = useMemo(() => store.orders.map(toSubmitted), [store.orders]);
  const byRef = useCallback((ref: string) => store.orders.find((order) => order.orderRef === ref), [store.orders]);

  const setStatus = useCallback(
    (ref: string, status: OrderStatus) => {
      const order = byRef(ref);
      if (!order) return false;
      if (status === 'completed') return store.completeCollection(order.id).ok;
      const next = STATUS_TO_STORE[status];
      return next ? store.updateOrderStatus(order.id, next).ok : false;
    },
    [byRef, store],
  );

  const markPaid = useCallback(
    (ref: string, paymentRef?: string) => {
      const order = byRef(ref);
      return order ? store.recordStorePayment(order.id, 'cash', paymentRef).ok : false;
    },
    [byRef, store],
  );

  if (!live) return demo;
  return {
    ...demo,
    orders: liveOrders,
    findByRef: (query: string) => matchRef(liveOrders, query),
    findByCustomer: (query: string) => matchCustomer(liveOrders, query),
    setStatus,
    markPaid,
  };
}
