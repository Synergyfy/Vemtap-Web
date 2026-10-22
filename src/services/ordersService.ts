import { api } from './api/client';
import type { OrderLine, OrderStatus, PaymentMethod, PaymentStatus } from '../scripts/orderData';

export interface OrderApiItem {
  id?: string;
  itemId?: string;
  productId?: string;
  name?: string;
  title?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  image?: string;
  options?: string;
  instructions?: string;
}

export interface OrderApiRecord {
  id?: string;
  ref?: string;
  reference?: string;
  orderNumber?: string;
  merchantId?: string;
  merchantName?: string;
  customerName?: string;
  customerPhone?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  items?: OrderApiItem[];
  lines?: OrderApiItem[];
  subtotal?: number;
  savings?: number;
  deliveryFee?: number;
  total?: number;
  amount?: number;
  fulfillment?: 'pickup' | 'delivery';
  status?: string;
  createdAt?: string;
  submittedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentRef?: string;
  note?: string;
  marketingConsent?: boolean;
  merchant?: { id?: string; name?: string };
  customer?: { firstName?: string; lastName?: string; phone?: string; name?: string };
  payment?: { method?: string; status?: string; ref?: string };
}

const asNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (value?: string): OrderStatus => {
  const normalized = String(value ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'payment_pending':
    case 'awaiting_payment':
    case 'pending_payment':
      return 'payment-pending';
    case 'paid':
      return 'paid';
    case 'confirmed':
      return 'confirmed';
    case 'processing':
      return 'processing';
    case 'ready':
    case 'ready_for_collection':
    case 'ready-for-collection':
      return 'ready-for-collection';
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    case 'submitted':
    default:
      return 'submitted';
  }
};

const normalizePaymentStatus = (value?: string): PaymentStatus => {
  const normalized = String(value ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'verified':
    case 'paid':
      return 'verified';
    case 'failed':
      return 'failed';
    case 'refunded':
      return 'refunded';
    case 'pending':
    case 'payment_pending':
      return 'pending';
    case 'not_required':
    case 'not-required':
    case 'pay_at_counter':
      return 'not-required';
    default:
      return 'pending';
  }
};

const normalizePaymentMethod = (value?: string): PaymentMethod => {
  const normalized = String(value ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'card':
      return 'card';
    case 'transfer':
      return 'transfer';
    case 'wallet':
      return 'wallet';
    case 'cash':
    case 'pay_at_counter':
    case 'pay-at-counter':
    case 'counter':
    default:
      return 'pay-at-counter';
  }
};

const normalizeFulfillment = (value?: string): 'pickup' | 'delivery' => {
  return String(value ?? '').trim().toLowerCase() === 'delivery' ? 'delivery' : 'pickup';
};

const normalizeLines = (source?: OrderApiItem[]): OrderLine[] => {
  const items = Array.isArray(source) ? source : [];
  return items.map((item, index) => ({
    id: item.id ?? item.itemId ?? item.productId ?? `line-${index}`,
    productId: item.productId ?? item.itemId,
    name: item.name ?? item.title ?? 'Order item',
    price: asNumber(item.price ?? item.unitPrice ?? 0),
    qty: Math.max(1, Number(item.quantity ?? item.qty ?? 1)),
    image: item.image ?? '',
    options: item.options,
    instructions: item.instructions,
  }));
};

export const normalizeOrderRecord = (record: OrderApiRecord | undefined | null): any | null => {
  if (!record || typeof record !== 'object') return null;

  const inferredCustomerName = [record.customer?.firstName, record.customer?.lastName].filter(Boolean).join(' ');
  const customerName =
    record.customerName ??
    (inferredCustomerName || [record.firstName, record.lastName].filter(Boolean).join(' ') || 'Customer');
  const customerPhone = record.customerPhone ?? record.phone ?? record.customer?.phone ?? '';
  const merchantName = record.merchantName ?? record.merchant?.name ?? 'Merchant';
  const merchantId = record.merchantId ?? record.merchant?.id ?? 'merchant';
  const lines = normalizeLines(record.items ?? record.lines);
  const subtotal = asNumber(record.subtotal ?? lines.reduce((sum, line) => sum + line.price * line.qty, 0));

  return {
    ref: record.ref ?? record.reference ?? record.orderNumber ?? record.id ?? `UG-${Date.now()}`,
    merchantId,
    merchantName,
    customerName,
    customerPhone,
    lines,
    subtotal,
    savings: asNumber(record.savings ?? 0),
    deliveryFee: asNumber(record.deliveryFee ?? 0),
    total: asNumber(record.total ?? record.amount ?? subtotal),
    fulfillment: normalizeFulfillment(record.fulfillment),
    note: record.note ?? undefined,
    status: normalizeStatus(record.status),
    submittedAt: record.submittedAt ? new Date(record.submittedAt).getTime() : Date.now(),
    readyByLabel: undefined,
    source: 'customer-app',
    paymentMethod: normalizePaymentMethod(record.paymentMethod ?? record.payment?.method),
    paymentStatus: normalizePaymentStatus(record.paymentStatus ?? record.payment?.status),
    paymentRef: record.paymentRef ?? record.payment?.ref,
    marketingConsent: Boolean(record.marketingConsent),
  };
};

const extractArray = (payload: unknown): OrderApiRecord[] => {
  if (Array.isArray(payload)) return payload as OrderApiRecord[];
  if (payload && typeof payload === 'object') {
    const container = payload as { data?: unknown; items?: unknown; results?: unknown };
    if (Array.isArray(container.data)) return container.data as OrderApiRecord[];
    if (Array.isArray(container.items)) return container.items as OrderApiRecord[];
    if (Array.isArray(container.results)) return container.results as OrderApiRecord[];
  }
  return [];
};

export const ordersService = {
  getMyOrders: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      const response = await api.get<unknown>('/catalogue/orders/my-orders', { params });
      return extractArray(response).map((item) => normalizeOrderRecord(item)).filter(Boolean);
    } catch (error) {
      const fallback = await api.get<unknown>('/orders/my', { params }).catch(() => null);
      if (!fallback) throw error;
      return extractArray(fallback).map((item) => normalizeOrderRecord(item)).filter(Boolean);
    }
  },

  getQrThrivePublic: async (shortId: string) =>
    api.get<Record<string, unknown>>(`/qr-thrive/public/${encodeURIComponent(shortId)}`),

  scanQrThrivePublic: async (shortId: string, payload?: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(`/qr-thrive/public/scan/${encodeURIComponent(shortId)}`, payload ?? {}),

  getTapContextByUsername: async (username: string) =>
    api.get<Record<string, unknown>>(`/tap/context-by-username/${encodeURIComponent(username)}`),

  getPublicBranchOrdering: async (branchId: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Record<string, unknown>>(`/public/pos/branches/${encodeURIComponent(branchId)}/ordering`, { params }),

  getPublicOrderTracking: async (token: string) =>
    api.get<Record<string, unknown>>(`/public/pos/orders/track/${encodeURIComponent(token)}`),

  createOrder: async (payload: Record<string, unknown>) => {
    try {
      const response = await api.post<OrderApiRecord>('/catalogue/orders', payload);
      return normalizeOrderRecord(response);
    } catch (error) {
      try {
        const bulkCheckout = await api.post<OrderApiRecord>('/bulk-checkout', payload);
        return normalizeOrderRecord(bulkCheckout);
      } catch {
        const fallback = await api.post<OrderApiRecord>('/orders', payload).catch(() => null);
        if (!fallback) throw error;
        return normalizeOrderRecord(fallback);
      }
    }
  },

  createTableOrder: async (payload: Record<string, unknown>) => {
    const tableOrder = {
      ...payload,
      ...(payload.tableNumber !== undefined ? { tableNumber: payload.tableNumber } : {}),
    };
    return ordersService.createOrder(tableOrder);
  },

  updateStatus: async (id: string, payload: { status: string; reason?: string; refundItems?: unknown[] }) =>
    api.patch<OrderApiRecord>(`/catalogue/orders/${encodeURIComponent(id)}/status`, payload),
};
