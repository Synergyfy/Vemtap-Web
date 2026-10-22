import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { hasApiConfig } from '../services/api/client';
import { ordersService } from '../services/ordersService';
import {
  type StoreOrder,
  type StoreOrderStatus,
  type StoreQrRecord,
  type StoreOrderingSettings,
  SEED_STORE_ORDERS,
  SEED_STORE_QRS,
  INITIAL_ORDERING_SETTINGS,
} from '../scripts/storeOrderingData';

export interface RecordPaymentParams {
  method: 'cash' | 'pos-terminal' | 'bank-transfer' | 'store-credit' | string;
  amountDue?: number;
  amountReceived?: number;
  change?: number;
  balance?: number;
  reference?: string;
  notes?: string;
  staffVerified?: boolean;
  completionType?: 'external-pos' | 'vemtap-pos' | string;
  markCompleted?: boolean;
}

interface StoreOrderingContextValue {
  orders: StoreOrder[];
  qrCodes: StoreQrRecord[];
  settings: StoreOrderingSettings;
  summaryMetrics: {
    newOrders: number;
    preparing: number;
    readyForPickup: number;
    awaitingCollection: number;
    completedToday: number;
    totalRevenueToday: number;
  };
  getOrderById: (id: string) => StoreOrder | undefined;
  updateOrderStatus: (
    orderId: string,
    newStatus: StoreOrderStatus,
    note?: string,
    staffName?: string
  ) => { ok: boolean; message: string };
  toggleItemAvailability: (orderId: string, itemId: string, isAvailable: boolean) => void;
  substituteItem: (
    orderId: string,
    itemId: string,
    replacementName: string,
    priceDiff: number
  ) => void;
  removeItem: (orderId: string, itemId: string) => void;
  assignStaff: (orderId: string, staffName: string) => void;
  recordStorePayment: (
    orderId: string,
    methodOrParams: 'cash' | 'pos-terminal' | 'bank-transfer' | 'store-credit' | string | RecordPaymentParams,
    reference?: string,
    notes?: string
  ) => { ok: boolean; message: string };
  completeCollection: (orderId: string) => { ok: boolean; message: string };
  submitCustomerStoreOrder: (order: Omit<StoreOrder, 'id' | 'orderRef' | 'createdAt' | 'statusHistory' | 'payment'>) => StoreOrder;
  addQrCode: (newQr: Omit<StoreQrRecord, 'id' | 'createdAt' | 'scansCount' | 'ordersCount' | 'revenueGenerated'>) => StoreQrRecord;
  toggleQrActive: (qrId: string) => void;
  updateSettings: (patch: Partial<StoreOrderingSettings>) => void;
  activePosHandoffOrderId: string | null;
  setActivePosHandoffOrderId: (id: string | null) => void;
  completeOrderFromPos: (
    orderId: string,
    tender: string,
    posTransactionId: string,
    notes?: string
  ) => { ok: boolean; message: string };
}

const StoreOrderingContext = createContext<StoreOrderingContextValue | null>(null);

const STORAGE_ORDERS_KEY = 'vemtap_store_orders_v1';
const STORAGE_QRS_KEY = 'vemtap_store_qrs_v1';
const STORAGE_SETTINGS_KEY = 'vemtap_store_settings_v1';

export function StoreOrderingProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SEED_STORE_ORDERS;
  });

  const [qrCodes, setQrCodes] = useState<StoreQrRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_QRS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SEED_STORE_QRS;
  });

  const [settings, setSettings] = useState<StoreOrderingSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ORDERING_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore quota
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QRS_KEY, JSON.stringify(qrCodes));
    } catch {
      // ignore quota
    }
  }, [qrCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota
    }
  }, [settings]);

  const summaryMetrics = useMemo(() => {
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const preparing = orders.filter((o) => o.status === 'preparing' || o.status === 'accepted').length;
    const readyForPickup = orders.filter((o) => o.status === 'ready').length;
    const awaitingCollection = orders.filter(
      (o) => o.status === 'ready' || o.status === 'awaiting-payment' || (o.status === 'paid' && o.payment.status === 'paid-in-store')
    ).length;
    const completedToday = orders.filter((o) => o.status === 'completed').length;
    const totalRevenueToday = orders
      .filter((o) => o.payment.status === 'paid-in-store')
      .reduce((sum, o) => sum + o.confirmedTotal, 0);

    return {
      newOrders,
      preparing,
      readyForPickup,
      awaitingCollection,
      completedToday,
      totalRevenueToday,
    };
  }, [orders]);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id || o.orderRef === id),
    [orders]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: StoreOrderStatus, note?: string, staffName?: string) => {
      const order = orders.find((o) => o.id === orderId || o.orderRef === orderId);
      if (!order) return { ok: false, message: 'Order not found' };

      // Validate transitions
      const validTransitions: Record<StoreOrderStatus, StoreOrderStatus[]> = {
        new: ['accepted', 'rejected', 'cancelled'],
        accepted: ['preparing', 'cancelled', 'partially-fulfilled'],
        preparing: ['ready', 'partially-fulfilled', 'cancelled'],
        ready: ['awaiting-payment', 'paid', 'completed', 'cancelled'],
        'awaiting-payment': ['paid', 'cancelled'],
        paid: ['completed', 'cancelled'],
        completed: [],
        'partially-fulfilled': ['ready', 'cancelled'],
        rejected: [],
        cancelled: [],
      };

      const allowed = validTransitions[order.status] ?? [];
      if (!allowed.includes(newStatus) && newStatus !== order.status) {
        return {
          ok: false,
          message: `Cannot transition order directly from "${order.status}" to "${newStatus}".`,
        };
      }

      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          return {
            ...o,
            status: newStatus,
            statusHistory: [
              {
                status: newStatus,
                timestamp,
                note: note || `Status updated to ${newStatus}`,
                staffName: staffName || o.assignedStaff || 'Staff',
              },
              ...o.statusHistory,
            ],
          };
        })
      );

      return { ok: true, message: `Order status updated to ${newStatus}` };
    },
    [orders]
  );

  const toggleItemAvailability = useCallback((orderId: string, itemId: string, isAvailable: boolean) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId && o.orderRef !== orderId) return o;
        const updatedItems = o.items.map((item) => {
          if (item.id !== itemId) return item;
          return { ...item, available: isAvailable };
        });
        const activeItems = updatedItems.filter((item) => item.available && !item.removed);
        const newTotal = activeItems.reduce((acc, it) => acc + it.totalPrice, 0);

        return {
          ...o,
          items: updatedItems,
          confirmedTotal: newTotal,
          isTotalConfirmed: true,
        };
      })
    );
  }, []);

  const substituteItem = useCallback(
    (orderId: string, itemId: string, replacementName: string, priceDiff: number) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId && o.orderRef !== orderId) return o;
          const updatedItems = o.items.map((item) => {
            if (item.id !== itemId) return item;
            const newUnitPrice = Math.max(0, item.unitPrice + priceDiff);
            return {
              ...item,
              name: replacementName,
              unitPrice: newUnitPrice,
              totalPrice: newUnitPrice * item.qty,
              substituted: {
                originalName: item.name,
                replacementName,
                priceDiff,
              },
            };
          });
          const newTotal = updatedItems
            .filter((it) => it.available && !it.removed)
            .reduce((acc, it) => acc + it.totalPrice, 0);

          return {
            ...o,
            items: updatedItems,
            confirmedTotal: newTotal,
            isTotalConfirmed: true,
          };
        })
      );
    },
    []
  );

  const removeItem = useCallback((orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId && o.orderRef !== orderId) return o;
        const updatedItems = o.items.map((item) => {
          if (item.id !== itemId) return item;
          return { ...item, removed: true };
        });
        const activeItems = updatedItems.filter((item) => item.available && !item.removed);
        const newTotal = activeItems.reduce((acc, it) => acc + it.totalPrice, 0);

        return {
          ...o,
          items: updatedItems,
          confirmedTotal: newTotal,
          isTotalConfirmed: true,
          status: o.status === 'new' ? 'new' : 'partially-fulfilled',
        };
      })
    );
  }, []);

  const assignStaff = useCallback((orderId: string, staffName: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId && o.orderRef !== orderId) return o;
        return {
          ...o,
          assignedStaff: staffName,
        };
      })
    );
  }, []);

  const recordStorePayment = useCallback(
    (
      orderId: string,
      methodOrParams: 'cash' | 'pos-terminal' | 'bank-transfer' | 'store-credit' | string | RecordPaymentParams,
      reference?: string,
      notes?: string
    ) => {
      const order = orders.find((o) => o.id === orderId || o.orderRef === orderId);
      if (!order) return { ok: false, message: 'Order not found' };

      const isParamsObj = typeof methodOrParams === 'object' && methodOrParams !== null;
      const params: RecordPaymentParams = isParamsObj
        ? (methodOrParams as RecordPaymentParams)
        : {
            method: methodOrParams as string,
            reference,
            notes,
            amountDue: order.confirmedTotal,
            amountReceived: order.confirmedTotal,
            change: 0,
            balance: 0,
            staffVerified: true,
            completionType: 'external-pos',
            markCompleted: true,
          };

      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const due = params.amountDue ?? order.confirmedTotal;
      const received = params.amountReceived ?? due;
      const isFull = received >= due;
      const finalStatus: StoreOrderStatus = params.markCompleted && isFull ? 'completed' : isFull ? 'paid' : 'awaiting-payment';
      const paymentStatus = isFull ? 'paid-in-store' : 'partially-paid';
      const refCode = params.reference || `REC-STORE-${Math.floor(10000 + Math.random() * 89999)}`;

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          return {
            ...o,
            status: finalStatus,
            isTotalConfirmed: true,
            payment: {
              status: paymentStatus,
              method: params.method,
              amountDue: due,
              amountReceived: received,
              change: params.change ?? (params.method === 'cash' ? Math.max(0, received - due) : 0),
              balance: params.balance ?? Math.max(0, due - received),
              reference: refCode,
              recordedBy: 'Store Staff (Verified)',
              recordedAt: timestamp,
              completionType: params.completionType || 'external-pos',
              staffVerified: params.staffVerified ?? true,
              notes: params.notes,
            },
            statusHistory: [
              {
                status: finalStatus,
                timestamp,
                note: `Payment of ₦${received.toLocaleString()} recorded via ${params.method}${params.notes ? ` (${params.notes})` : ''}`,
                staffName: 'Store Staff',
              },
              ...o.statusHistory,
            ],
          };
        })
      );

      return {
        ok: true,
        message: `Payment recorded for ${order.id}. Status updated to ${finalStatus}.`,
      };
    },
    [orders]
  );

  const completeCollection = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId || o.orderRef === orderId);
    if (!order) return { ok: false, message: 'Order not found' };

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        return {
          ...o,
          status: 'completed',
          statusHistory: [
            {
              status: 'completed',
              timestamp,
              note: 'Customer verified order and completed collection.',
              staffName: o.assignedStaff || 'Store Staff',
            },
            ...o.statusHistory,
          ],
        };
      })
    );

    return { ok: true, message: `Order ${order.id} handed over and marked as Completed.` };
  }, [orders]);

  const submitCustomerStoreOrder = useCallback(
    (input: Omit<StoreOrder, 'id' | 'orderRef' | 'createdAt' | 'statusHistory' | 'payment'>) => {
      const randomNum = Math.floor(10000 + Math.random() * 89999);
      const newId = `#SO-${randomNum}`;
      const newRef = `VT-SO-${randomNum}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      const newOrder: StoreOrder = {
        ...input,
        id: newId,
        orderRef: newRef,
        createdAt: now.toISOString(),
        time: timeStr,
        date: 'Today',
        status: 'new',
        isTotalConfirmed: false,
        statusHistory: [
          {
            status: 'new',
            timestamp: timeStr,
            note: `Order submitted by customer via ${input.origin}${input.placementDetails ? ` (${input.placementDetails})` : ''}`,
          },
        ],
        payment: {
          status: 'unpaid',
          method: 'pos-terminal',
        },
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (hasApiConfig()) {
        const tableMatch = /table\s*(\d+)/i.exec(input.placementDetails ?? '');
        const payload = {
          branchId: input.branchId ?? undefined,
          tableNumber: tableMatch ? Number(tableMatch[1]) : undefined,
          customer: {
            name: input.customerName,
            phone: input.customerPhone,
          },
          note: input.customerNotes,
          items: input.items.map((item) => ({
            itemId: item.productId ?? item.id,
            quantity: item.qty,
            unitPrice: item.unitPrice ?? item.totalPrice ?? 0,
            totalPrice: item.totalPrice ?? item.unitPrice * item.qty,
          })),
        };

        ordersService.createTableOrder(payload).then((serverOrder) => {
          if (!serverOrder) return;
          const nextRef = serverOrder.ref ?? serverOrder.reference ?? serverOrder.orderNumber ?? newRef;
          setOrders((prev) => prev.map((order) => order.id === newId ? { ...order, orderRef: nextRef } : order));
        }).catch(() => {
          // swallow backend errors and keep the local in-app order flow working
        });
      }

      return newOrder;
    },
    []
  );

  const addQrCode = useCallback(
    (newQr: Omit<StoreQrRecord, 'id' | 'createdAt' | 'scansCount' | 'ordersCount' | 'revenueGenerated'>) => {
      const record: StoreQrRecord = {
        ...newQr,
        id: `qr-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        scansCount: 0,
        ordersCount: 0,
        revenueGenerated: 0,
      };
      setQrCodes((prev) => [record, ...prev]);
      return record;
    },
    []
  );

  const toggleQrActive = useCallback((qrId: string) => {
    setQrCodes((prev) =>
      prev.map((q) => (q.id === qrId ? { ...q, active: !q.active } : q))
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<StoreOrderingSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const [activePosHandoffOrderId, setActivePosHandoffOrderId] = useState<string | null>(null);

  const completeOrderFromPos = useCallback(
    (orderId: string, tender: string, posTransactionId: string, notes?: string) => {
      const order = orders.find((o) => o.id === orderId || o.orderRef === orderId);
      if (!order) return { ok: false, message: 'Order not found' };

      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          return {
            ...o,
            status: 'completed',
            isTotalConfirmed: true,
            payment: {
              status: 'paid-in-store',
              method: 'pos-integrated',
              reference: `POS-${posTransactionId}`,
              posTransactionId,
              recordedBy: 'VEMTAP POS',
              recordedAt: timestamp,
              notes,
            },
            statusHistory: [
              {
                status: 'completed',
                timestamp,
                note: `Payment completed via VEMTAP POS (${tender}). Txn: ${posTransactionId}`,
                staffName: 'VEMTAP POS',
              },
              ...o.statusHistory,
            ],
          };
        })
      );

      setActivePosHandoffOrderId(null);
      return { ok: true, message: `Order ${order.id} completed via VEMTAP POS.` };
    },
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      qrCodes,
      settings,
      summaryMetrics,
      getOrderById,
      updateOrderStatus,
      toggleItemAvailability,
      substituteItem,
      removeItem,
      assignStaff,
      recordStorePayment,
      completeCollection,
      submitCustomerStoreOrder,
      addQrCode,
      toggleQrActive,
      updateSettings,
      activePosHandoffOrderId,
      setActivePosHandoffOrderId,
      completeOrderFromPos,
    }),
    [
      orders,
      qrCodes,
      settings,
      summaryMetrics,
      getOrderById,
      updateOrderStatus,
      toggleItemAvailability,
      substituteItem,
      removeItem,
      assignStaff,
      recordStorePayment,
      completeCollection,
      submitCustomerStoreOrder,
      addQrCode,
      toggleQrActive,
      updateSettings,
      activePosHandoffOrderId,
      completeOrderFromPos,
    ]
  );

  return <StoreOrderingContext.Provider value={value}>{children}</StoreOrderingContext.Provider>;
}

export function useStoreOrdering() {
  const ctx = useContext(StoreOrderingContext);
  if (!ctx) {
    throw new Error('useStoreOrdering must be used within a StoreOrderingProvider');
  }
  return ctx;
}
