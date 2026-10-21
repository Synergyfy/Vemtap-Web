import { api } from './api/client';
import type {
  StoreOrder,
  StoreOrderOrigin,
  StoreOrderStatus,
  StoreOrderingSettings,
  StoreQrRecord,
} from '../scripts/storeOrderingData';

/**
 * Store ordering (`/store-ordering/*`): store orders are catalogue orders with
 * a `source`; the API adds stages, line adjustments, staff assignment, counter
 * payments, store QR codes and settings. Responses are mapped onto the web's
 * `StoreOrder` / `StoreQrRecord` shapes so the screens stay unchanged.
 */

interface ApiStoreOrder {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  branchId: string;
  branchName: string;
  origin: string | null;
  sourceRef?: string;
  placementDetails?: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    image: string | null;
    type: string;
    available: boolean;
    removed: boolean;
    substituted?: { originalName: string; replacementName: string; priceDiff: number };
  }>;
  estimatedTotal: number;
  confirmedTotal: number;
  isTotalConfirmed: boolean;
  status: StoreOrderStatus;
  assignedStaff?: string;
  customerNotes?: string;
  statusHistory: Array<{ status: StoreOrderStatus; timestamp: string; note?: string; staffName?: string }>;
  payment: StoreOrder['payment'];
}

interface ApiStoreQr {
  id: string;
  code: string;
  name: string;
  type: StoreQrRecord['type'];
  branchId: string;
  branchName: string;
  destinationUrl: string;
  targetLabel: string;
  active: boolean;
  createdAt: string;
  scansCount: number;
  ordersCount: number;
  revenueGenerated: number;
}

const ORIGIN: Record<string, StoreOrderOrigin> = {
  storefront: 'Storefront',
  store_qr: 'Store QR',
  category_qr: 'Category QR',
  product_qr: 'Product QR',
  section_qr: 'Section QR',
  placement_qr: 'Custom Placement QR',
  deal: 'Deal',
  pos: 'POS',
};

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

export function storeOrderFromApi(row: ApiStoreOrder): StoreOrder {
  return {
    id: row.id,
    orderRef: row.orderRef,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    createdAt: row.createdAt,
    time: clock(row.createdAt),
    date: dayLabel(row.createdAt),
    branchId: row.branchId,
    branchName: row.branchName,
    origin: ORIGIN[row.origin ?? ''] ?? 'Storefront',
    sourceRef: row.sourceRef,
    placementDetails: row.placementDetails,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      image: item.image ?? '',
      available: item.available,
      removed: item.removed,
      type: item.type === 'service' || item.type === 'deal' ? item.type : 'product',
      substituted: item.substituted,
    })),
    estimatedTotal: row.estimatedTotal,
    confirmedTotal: row.confirmedTotal,
    isTotalConfirmed: row.isTotalConfirmed,
    status: row.status,
    assignedStaff: row.assignedStaff,
    customerNotes: row.customerNotes,
    pickupInstructions: '',
    estimatedPrepMins: 0,
    statusHistory: row.statusHistory.map((entry) => ({ ...entry, timestamp: clock(entry.timestamp) })),
    payment: row.payment,
  };
}

const qrFromApi = (row: ApiStoreQr): StoreQrRecord => ({
  id: row.id,
  name: row.name,
  type: row.type,
  branchId: row.branchId,
  branchName: row.branchName,
  destinationUrl: row.destinationUrl,
  targetLabel: row.targetLabel,
  active: row.active,
  createdAt: row.createdAt.slice(0, 10),
  scansCount: row.scansCount,
  ordersCount: row.ordersCount,
  revenueGenerated: row.revenueGenerated,
});

export interface StoreOrderingSummary {
  newOrders: number;
  preparing: number;
  readyForPickup: number;
  awaitingCollection: number;
  completedToday: number;
  totalRevenueToday: number;
}

export const storeOrderingService = {
  orders: () =>
    api
      .get<{ data: ApiStoreOrder[] }>('/store-ordering/orders', { params: { limit: 100 } })
      .then((res) => res.data.map(storeOrderFromApi)),
  summary: () => api.get<StoreOrderingSummary>('/store-ordering/summary'),
  setStatus: (id: string, status: StoreOrderStatus, note?: string) =>
    api.patch<ApiStoreOrder>(`/store-ordering/orders/${id}/status`, { status, ...(note ? { note: note.slice(0, 300) } : {}) }),
  updateItem: (
    id: string,
    itemId: string,
    body: { available?: boolean; removed?: boolean; substitution?: { replacementName: string; priceDiff: number } },
  ) => api.patch<ApiStoreOrder>(`/store-ordering/orders/${id}/items/${itemId}`, body),
  assign: (id: string, staffUserId: string) => api.post<ApiStoreOrder>(`/store-ordering/orders/${id}/assign`, { staffUserId }),
  recordPayment: (
    id: string,
    body: { method: string; amountReceived?: number; reference?: string; notes?: string; markCompleted?: boolean },
  ) => api.post<ApiStoreOrder>(`/store-ordering/orders/${id}/payment`, body),
  collect: (id: string) => api.post<ApiStoreOrder>(`/store-ordering/orders/${id}/collect`),
  completeFromPos: (id: string, body: { tender: string; posSaleId: string; notes?: string }) =>
    api.post<ApiStoreOrder>(`/store-ordering/orders/${id}/complete-from-pos`, body),
  qrCodes: () => api.get<ApiStoreQr[]>('/store-ordering/qr-codes').then((rows) => rows.map(qrFromApi)),
  createQr: (body: { branchId: string; name: string; type: StoreQrRecord['type']; targetLabel?: string }) =>
    api.post<ApiStoreQr>('/store-ordering/qr-codes', body).then(qrFromApi),
  updateQr: (id: string, body: { name?: string; targetLabel?: string; isActive?: boolean }) =>
    api.patch<ApiStoreQr>(`/store-ordering/qr-codes/${id}`, body).then(qrFromApi),
  settings: () => api.get<StoreOrderingSettings>('/store-ordering/settings'),
  updateSettings: (patch: Partial<StoreOrderingSettings>) => api.patch<StoreOrderingSettings>('/store-ordering/settings', patch),
};
