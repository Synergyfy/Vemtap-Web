import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { storeOrderingService } from '../services/storeOrderingService';
import { teamService } from '../services/teamService';
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
  /** Live mode: the last server refusal (the screen's optimistic message may have said otherwise). */
  lastError: string | null;
  clearLastError: () => void;
}

const StoreOrderingContext = createContext<StoreOrderingContextValue | null>(null);

const STORAGE_ORDERS_KEY = 'vemtap_store_orders_v1';

const VALID_TRANSITIONS: Record<StoreOrderStatus, StoreOrderStatus[]> = {
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

const PAID_STATUSES = ['paid-in-store', 'paid-pos'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const liveKeys = {
  orders: ['store-ordering', 'orders'] as const,
  summary: ['store-ordering', 'summary'] as const,
  qr: ['store-ordering', 'qr'] as const,
  settings: ['store-ordering', 'settings'] as const,
};
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

      const allowed = VALID_TRANSITIONS[order.status] ?? [];
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

  // ------------------------------------------------------------------ live
  // With an API configured the same surface runs against /store-ordering/*:
  // each action checks what it can locally (so its return value is honest),
  // fires the request, then refetches; a server refusal lands in lastError.
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const [lastError, setLastError] = useState<string | null>(null);
  const clearLastError = useCallback(() => setLastError(null), []);
  const liveOrders = useQuery({ queryKey: liveKeys.orders, queryFn: storeOrderingService.orders, enabled: live, refetchInterval: 30_000 });
  const liveSummary = useQuery({ queryKey: liveKeys.summary, queryFn: storeOrderingService.summary, enabled: live, refetchInterval: 30_000 });
  const liveQr = useQuery({ queryKey: liveKeys.qr, queryFn: storeOrderingService.qrCodes, enabled: live });
  const liveSettings = useQuery({ queryKey: liveKeys.settings, queryFn: storeOrderingService.settings, enabled: live });
  const team = useQuery({ queryKey: ['store-ordering', 'team'], queryFn: () => teamService.list({ allBranches: true }), enabled: live, staleTime: 5 * 60_000 });

  const run = useCallback(
    (request: () => Promise<unknown>, keys: ReadonlyArray<readonly string[]> = [liveKeys.orders, liveKeys.summary]) => {
      setLastError(null);
      void request()
        .catch((error: unknown) => setLastError(apiErrorMessage(error, 'The store-ordering update failed.')))
        .finally(() => keys.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey })));
    },
    [queryClient],
  );

  const liveValue = useMemo((): StoreOrderingContextValue | null => {
    if (!live) return null;
    const list = liveOrders.data ?? [];
    const find = (id: string) => list.find((o) => o.id === id || o.orderRef === id);
    return {
      orders: list,
      qrCodes: liveQr.data ?? [],
      settings: liveSettings.data ?? INITIAL_ORDERING_SETTINGS,
      summaryMetrics: liveSummary.data ?? {
        newOrders: 0,
        preparing: 0,
        readyForPickup: 0,
        awaitingCollection: 0,
        completedToday: 0,
        totalRevenueToday: 0,
      },
      getOrderById: (id) => find(id),
      updateOrderStatus: (orderId, newStatus, note) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (newStatus === order.status) return { ok: true, message: `Order is already ${newStatus}` };
        if (newStatus === 'paid') return { ok: false, message: 'Record the payment to mark the order paid.' };
        if (!(VALID_TRANSITIONS[order.status] ?? []).includes(newStatus))
          return { ok: false, message: `Cannot transition order directly from "${order.status}" to "${newStatus}".` };
        if (newStatus === 'completed' && !PAID_STATUSES.includes(order.payment.status))
          return { ok: false, message: 'Record the payment before completing the order.' };
        run(() => storeOrderingService.setStatus(order.id, newStatus, note));
        return { ok: true, message: `Order status updated to ${newStatus}` };
      },
      toggleItemAvailability: (orderId, itemId, isAvailable) => {
        const order = find(orderId);
        if (order) run(() => storeOrderingService.updateItem(order.id, itemId, { available: isAvailable }));
      },
      substituteItem: (orderId, itemId, replacementName, priceDiff) => {
        const order = find(orderId);
        if (order) run(() => storeOrderingService.updateItem(order.id, itemId, { substitution: { replacementName, priceDiff } }));
      },
      removeItem: (orderId, itemId) => {
        const order = find(orderId);
        if (order) run(() => storeOrderingService.updateItem(order.id, itemId, { removed: true }));
      },
      assignStaff: (orderId, staffName) => {
        const order = find(orderId);
        const needle = staffName.toLowerCase();
        const member = (team.data ?? []).find((m) => {
          const name = `${m.firstName} ${m.lastName}`.trim().toLowerCase();
          return name && (needle.startsWith(name) || name.startsWith(needle));
        });
        if (!order) return;
        if (!member) {
          setLastError(`${staffName} is not on your team yet — invite them first.`);
          return;
        }
        run(() => storeOrderingService.assign(order.id, member.id));
      },
      recordStorePayment: (orderId, methodOrParams, reference, notes) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (PAID_STATUSES.includes(order.payment.status)) return { ok: false, message: 'This order is already paid.' };
        const params: RecordPaymentParams =
          typeof methodOrParams === 'object' && methodOrParams !== null
            ? methodOrParams
            : { method: methodOrParams, reference, notes, markCompleted: true };
        run(() =>
          storeOrderingService.recordPayment(order.id, {
            method: params.method,
            ...(params.amountReceived !== undefined ? { amountReceived: params.amountReceived } : {}),
            ...(params.reference ? { reference: params.reference } : {}),
            ...(params.notes ? { notes: params.notes } : {}),
            ...(params.markCompleted ? { markCompleted: true } : {}),
          }),
        );
        return { ok: true, message: `Payment recorded for ${order.orderRef}.` };
      },
      completeCollection: (orderId) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (!PAID_STATUSES.includes(order.payment.status))
          return { ok: false, message: 'Record the payment before handing the order over.' };
        run(() => storeOrderingService.collect(order.id));
        return { ok: true, message: `Order ${order.orderRef} handed over and marked as Completed.` };
      },
      // Customer-side checkout is not wired here; demo storefronts keep the local order.
      submitCustomerStoreOrder,
      addQrCode: (newQr) => {
        const placeholder: StoreQrRecord = {
          ...newQr,
          id: `pending-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          scansCount: 0,
          ordersCount: 0,
          revenueGenerated: 0,
        };
        run(
          () =>
            storeOrderingService.createQr({
              branchId: newQr.branchId,
              name: newQr.name,
              type: newQr.type,
              ...(newQr.targetLabel ? { targetLabel: newQr.targetLabel } : {}),
            }),
          [liveKeys.qr],
        );
        return placeholder;
      },
      toggleQrActive: (qrId) => {
        const qr = (liveQr.data ?? []).find((q) => q.id === qrId);
        if (qr) run(() => storeOrderingService.updateQr(qr.id, { isActive: !qr.active }), [liveKeys.qr]);
      },
      updateSettings: (patch) => run(() => storeOrderingService.updateSettings(patch), [liveKeys.settings]),
      activePosHandoffOrderId,
      setActivePosHandoffOrderId,
      completeOrderFromPos: (orderId, tender, posTransactionId, notes) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (!UUID.test(posTransactionId)) return { ok: false, message: 'Complete the sale on VEMTAP POS first.' };
        run(() => storeOrderingService.completeFromPos(order.id, { tender, posSaleId: posTransactionId, notes }));
        setActivePosHandoffOrderId(null);
        return { ok: true, message: `Order ${order.orderRef} completed via VEMTAP POS.` };
      },
      lastError,
      clearLastError,
    };
  }, [
    live,
    liveOrders.data,
    liveQr.data,
    liveSettings.data,
    liveSummary.data,
    team.data,
    run,
    submitCustomerStoreOrder,
    activePosHandoffOrderId,
    lastError,
    clearLastError,
  ]);

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
      lastError: null,
      clearLastError: () => undefined,
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

  return <StoreOrderingContext.Provider value={liveValue ?? value}>{children}</StoreOrderingContext.Provider>;
}

export function useStoreOrdering() {
  const ctx = useContext(StoreOrderingContext);
  if (!ctx) {
    throw new Error('useStoreOrdering must be used within a StoreOrderingProvider');
  }
  return ctx;
}
