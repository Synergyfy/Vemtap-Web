import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { storeOrderingService } from '../services/storeOrderingService';
import { ordersService } from '../services/ordersService';
import { claimsService } from '../services/claimsService';
import {
  type StoreOrder,
  type StoreOrderStatus,
  type StoreOrderStaffOption,
  type StoreQrRecord,
  type StoreOrderingSettings,
  SEED_STORE_ORDERS,
  SEED_STORE_QRS,
  INITIAL_ORDERING_SETTINGS,
  DEMO_STORE_STAFF_OPTIONS,
} from '../scripts/storeOrderingData';
import { useTeam } from '../hooks/business/useBranchesAndTeam';
import { useSessionUser } from '../hooks/useSessionUser';
import type { TeamMember } from '../services/teamService';

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
  settingsLoading: boolean;
  settingsSaving: boolean;
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
  /**
   * Everyone who can be assigned to an order: the Staff page's team (the
   * owner included) in live mode, the demo crew otherwise. The order's current
   * assignee is always kept in the list so the picker can hold its value.
   */
  staffOptionsFor: (order: StoreOrder) => StoreOrderStaffOption[];
  /** The picker value for an order's current assignee (account id live, name in the demo). */
  staffValueFor: (order: StoreOrder) => string;
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
  updateSettings: (patch: Partial<StoreOrderingSettings>) => Promise<{ ok: boolean; message: string }>;
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
/**
 * Mounted screens that need the live orders/QR/settings data register here, so
 * the provider (which wraps the whole app) only fetches and polls while one is open.
 */
const StoreOrderingDemandContext = createContext<() => () => void>(() => () => undefined);

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

/** Display name of a team row from the Staff page. */
const memberName = (m: TeamMember) =>
  `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email || m.phone || 'Team member';

const memberRole = (m: TeamMember) =>
  m.roleTag ||
  m.jobTitle ||
  (m.role === 'Owner' || m.role === 'Manager' ? m.role : null);

const memberLabel = (m: TeamMember) => {
  const role = memberRole(m);
  return role ? `${memberName(m)} (${role})` : memberName(m);
};

/** Display name of the signed-in account (`GET /auth/profile`). */
const sessionLabel = (user?: { firstName?: string | null; lastName?: string | null; email?: string | null; role?: string | null; businessRole?: string | null; roleTag?: string | null; jobTitle?: string | null } | null) => {
  if (!user) return '';
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '';
  if (!name) return '';
  const role = user.roleTag || user.jobTitle || user.businessRole || user.role;
  return role ? `${name} (${role})` : name;
};

/**
 * Keeps the person who completed an order inside the history note, so every
 * completion carries a name alongside the entry's own `staffName`.
 */
const withCompleter = (note: string | undefined, completer: string, fallback: string) =>
  note && note.toLowerCase().includes(completer.toLowerCase())
    ? note
    : `${note || fallback} — completed by ${completer}.`;

/** Demo picker: the demo crew, with the order's current assignee kept in the list. */
const demoStaffValueFor = (order: StoreOrder) => order.assignedStaffId || order.assignedStaff || '';

const demoStaffOptionsFor = (order: StoreOrder): StoreOrderStaffOption[] => {
  const current = demoStaffValueFor(order);
  return current && !DEMO_STORE_STAFF_OPTIONS.some((o) => o.value === current)
    ? [{ value: current, label: order.assignedStaff || current }, ...DEMO_STORE_STAFF_OPTIONS]
    : DEMO_STORE_STAFF_OPTIONS;
};

const liveKeys = {
  orders: ['store-ordering', 'orders'] as const,
  summary: ['store-ordering', 'summary'] as const,
  qr: ['store-ordering', 'qr'] as const,
  settings: ['store-ordering', 'settings'] as const,
};

/** Neutral values while GET /store-ordering/settings loads — never demo data. */
const LIVE_SETTINGS_PLACEHOLDER: StoreOrderingSettings = {
  enabled: false,
  usePosForCompletion: false,
  paymentMethods: [],
  activeBranches: {},
  immediatePickup: false,
  scheduledPreOrder: false,
  defaultPrepMinutes: 0,
  pickupInstructions: '',
  guestOrderingAllowed: false,
  acceptOrdersOutsideHours: false,
  allowSubstitutions: false,
  autoNotifyCustomerSms: false,
  autoNotifyCustomerWhatsApp: false,
  notifiedStaff: [],
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

      // A completed order always carries the person who completed it.
      const completer = newStatus === 'completed' ? order.assignedStaff || staffName || 'Store Staff' : '';

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
                note: completer
                  ? withCompleter(note, completer, `Status updated to ${newStatus}`)
                  : note || `Status updated to ${newStatus}`,
                staffName: completer || staffName || o.assignedStaff || 'Staff',
              },
              ...o.statusHistory,
            ],
          };
        })
      );

      return {
        ok: true,
        message: completer
          ? `Order status updated to ${newStatus} — completed by ${completer}`
          : `Order status updated to ${newStatus}`,
      };
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
          assignedStaffId: staffName || undefined,
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
      // A payment that closes the order records who completed it.
      const completer = finalStatus === 'completed' ? order.assignedStaff || 'Store Staff' : '';

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
              recordedBy: completer || 'Store Staff (Verified)',
              recordedAt: timestamp,
              completionType: params.completionType || 'external-pos',
              staffVerified: params.staffVerified ?? true,
              notes: params.notes,
            },
            statusHistory: [
              {
                status: finalStatus,
                timestamp,
                note: withCompleter(
                  `Payment of ₦${received.toLocaleString()} recorded via ${params.method}${params.notes ? ` (${params.notes})` : ''}`,
                  completer,
                  `Payment of ₦${received.toLocaleString()} recorded via ${params.method}`
                ),
                staffName: completer || 'Store Staff',
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
    const completer = order.assignedStaff || 'Store Staff';

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
              note: withCompleter(
                'Customer verified order and completed collection.',
                completer,
                'Customer verified order and completed collection.'
              ),
              staffName: completer,
            },
            ...o.statusHistory,
          ],
        };
      })
    );

    return { ok: true, message: `Order ${order.id} handed over and marked as Completed by ${completer}.` };
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

  const updateSettings = useCallback(async (patch: Partial<StoreOrderingSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    return { ok: true, message: 'Store Ordering settings saved successfully.' };
  }, []);

  const [activePosHandoffOrderId, setActivePosHandoffOrderId] = useState<string | null>(null);

  const completeOrderFromPos = useCallback(
    (orderId: string, tender: string, posTransactionId: string, notes?: string) => {
      const order = orders.find((o) => o.id === orderId || o.orderRef === orderId);
      if (!order) return { ok: false, message: 'Order not found' };
      if (order.origin === 'Deal' && order.sourceRef) {
        void claimsService.redeemVoucher(order.sourceRef).catch(() => {});
      }
      const completer = order.assignedStaff || 'Store Staff';

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
              recordedBy: completer,
              recordedAt: timestamp,
              notes,
            },
            statusHistory: [
              {
                status: 'completed',
                timestamp,
                note: withCompleter(
                  `Payment completed via VEMTAP POS (${tender}). Txn: ${posTransactionId}`,
                  completer,
                  `Payment completed via VEMTAP POS (${tender}). Txn: ${posTransactionId}`
                ),
                staffName: completer,
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
  const [consumers, setConsumers] = useState(0);
  const subscribe = useCallback(() => {
    setConsumers((count) => count + 1);
    return () => setConsumers((count) => count - 1);
  }, []);
  const fetchLive = live && consumers > 0;
  const [lastError, setLastError] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const clearLastError = useCallback(() => setLastError(null), []);
  const liveOrders = useQuery({ queryKey: liveKeys.orders, queryFn: storeOrderingService.orders, enabled: fetchLive, refetchInterval: 30_000 });
  const liveSummary = useQuery({ queryKey: liveKeys.summary, queryFn: storeOrderingService.summary, enabled: fetchLive, refetchInterval: 30_000 });
  const liveQr = useQuery({ queryKey: liveKeys.qr, queryFn: storeOrderingService.qrCodes, enabled: fetchLive });
  const liveSettings = useQuery({ queryKey: liveKeys.settings, queryFn: storeOrderingService.settings, enabled: fetchLive });
  // Same query the Staff page uses (`['team']`, every branch, owner included),
  // so the assignment picker always offers exactly the people on the staff page.
  const team = useTeam();
  const sessionUser = useSessionUser();

  const teamRows = useMemo(() => team.data ?? [], [team.data]);
  const signedIn = sessionUser.data ?? null;

  const staffValueFor = useCallback(
    (order: StoreOrder) => {
      if (order.assignedStaffId) return order.assignedStaffId;
      if (!order.assignedStaff) return '';
      const match = teamRows.find((m) => memberName(m) === order.assignedStaff);
      return match?.id ?? order.assignedStaff;
    },
    [teamRows]
  );

  const staffOptionsFor = useCallback(
    (order: StoreOrder): StoreOrderStaffOption[] => {
      const base: StoreOrderStaffOption[] = !live
        ? DEMO_STORE_STAFF_OPTIONS
        : [
            ...teamRows.map((m) => ({ value: m.id, label: memberLabel(m) })),
            // The signed-in account (usually the owner) is assignable even when
            // it is not part of the team directory yet.
            ...(signedIn?.id && !teamRows.some((m) => m.id === signedIn.id)
              ? [{ value: signedIn.id, label: sessionLabel(signedIn) || 'Signed-in account' }]
              : []),
          ];
      const current = staffValueFor(order);
      return current && !base.some((o) => o.value === current)
        ? [{ value: current, label: order.assignedStaff || current }, ...base]
        : base;
    },
    [live, teamRows, signedIn, staffValueFor]
  );

  /**
   * Live: the assigned person is the only recorded completer (owner included
   * when selected in the dropdown). Nothing is auto-assigned here — an
   * unassigned order must be rejected, and the backend enforces the same rule.
   */
  const resolveCompleter = useCallback(
    (order: StoreOrder): string | null => {
      const assignedId = order.assignedStaffId;
      const member = teamRows.find(
        (candidate) =>
          (assignedId && candidate.id === assignedId) ||
          (!assignedId && order.assignedStaff && memberName(candidate) === order.assignedStaff),
      );
      if (member) return memberLabel(member);
      if (order.assignedStaff) return order.assignedStaff;
      return null;
    },
    [teamRows]
  );

  const run = useCallback(
    (request: () => Promise<unknown>, keys: ReadonlyArray<readonly string[]> = [liveKeys.orders, liveKeys.summary]) => {
      setLastError(null);
      void request()
        .catch((error: unknown) => setLastError(apiErrorMessage(error, 'The store-ordering update failed.')))
        .finally(() => keys.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey })));
    },
    [queryClient],
  );

  // Settings need an honest result so the Save button can report the real
  // server outcome instead of showing success before the PATCH has finished.
  const runSettings = useCallback(
    async (patch: Partial<StoreOrderingSettings>) => {
      setLastError(null);
      setSettingsSaving(true);
      try {
        await storeOrderingService.updateSettings(patch);
        return { ok: true, message: 'Store Ordering settings saved successfully.' };
      } catch (error: unknown) {
        const message = apiErrorMessage(error, 'The store-ordering update failed.');
        setLastError(message);
        return { ok: false, message };
      } finally {
        setSettingsSaving(false);
        void queryClient.invalidateQueries({ queryKey: liveKeys.settings });
      }
    },
    [queryClient],
  );

  const liveValue = useMemo((): StoreOrderingContextValue | null => {
    if (!live) return null;
    // Only the API's orders are shown in live mode; the seeded/localStorage
    // orders belong to demo mode and must never leak into the live table.
    const list = liveOrders.data ?? [];
    const find = (id: string) => list.find((o) => o.id === id || o.orderRef === id);
    return {
      orders: list,
      qrCodes: liveQr.data ?? [],
      settings: liveSettings.data ?? LIVE_SETTINGS_PLACEHOLDER,
      settingsLoading: liveSettings.isLoading,
      settingsSaving,
      summaryMetrics: liveSummary.data ?? {
        newOrders: 0,
        preparing: 0,
        readyForPickup: 0,
        awaitingCollection: 0,
        completedToday: 0,
        totalRevenueToday: 0,
      },
      getOrderById: (id) => find(id),
      staffOptionsFor,
      staffValueFor,
      updateOrderStatus: (orderId, newStatus, note) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (newStatus === order.status) return { ok: true, message: `Order is already ${newStatus}` };
        if (newStatus === 'paid') return { ok: false, message: 'Record the payment to mark the order paid.' };
        if (!(VALID_TRANSITIONS[order.status] ?? []).includes(newStatus))
          return { ok: false, message: `Cannot transition order directly from "${order.status}" to "${newStatus}".` };
        if (newStatus === 'completed' && !PAID_STATUSES.includes(order.payment.status))
          return { ok: false, message: 'Record the payment before completing the order.' };
        if (newStatus === 'completed') {
          // The completion entry always names the assigned person (owner included).
          const completer = resolveCompleter(order);
          if (!completer) return { ok: false, message: 'Assign the person completing this order first.' };
          run(() =>
            storeOrderingService.setStatus(order.id, newStatus, withCompleter(note, completer, `Status updated to ${newStatus}`)),
          );
          return { ok: true, message: `Order status updated to ${newStatus} — completed by ${completer}` };
        }
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
      assignStaff: (orderId, staffValue) => {
        const order = find(orderId);
        if (!order || !staffValue) return;
        // The picker sends the account id (falling back to a display name).
        const member = teamRows.find((m) => m.id === staffValue) ?? teamRows.find((m) => memberName(m) === staffValue);
        const applyAssignment = (id: string, label: string) => {
          // Show the assignment immediately so completion can be guarded in the
          // same session; the API response replaces it on the next refetch.
          queryClient.setQueryData<StoreOrder[]>(liveKeys.orders, (current = []) =>
            current.map((candidate) =>
              candidate.id === order.id
                ? { ...candidate, assignedStaff: label, assignedStaffId: id }
                : candidate,
            ),
          );
          run(() => storeOrderingService.assign(order.id, id));
        };
        if (!member) {
          if (signedIn?.id === staffValue) {
            applyAssignment(staffValue, sessionLabel(signedIn) || 'Signed-in account');
            return;
          }
          setLastError('That person is not on your team yet — invite them from the Staff page first.');
          return;
        }
        applyAssignment(member.id, memberLabel(member));
      },
      recordStorePayment: (orderId, methodOrParams, reference, notes) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (PAID_STATUSES.includes(order.payment.status)) return { ok: false, message: 'This order is already paid.' };
        const params: RecordPaymentParams =
          typeof methodOrParams === 'object' && methodOrParams !== null
            ? methodOrParams
            : { method: methodOrParams, reference, notes, markCompleted: true };
        // A payment that closes the order carries the person completing it.
        const completer = params.markCompleted ? resolveCompleter(order) : null;
        if (params.markCompleted && !completer) {
          return { ok: false, message: 'Assign the person completing this order first.' };
        }
        const paymentNotes = [params.notes, completer ? `Completed by ${completer}` : '']
          .filter(Boolean)
          .join(' — ');
        run(() =>
          storeOrderingService.recordPayment(order.id, {
            method: params.method,
            ...(params.amountReceived !== undefined ? { amountReceived: params.amountReceived } : {}),
            ...(params.reference ? { reference: params.reference } : {}),
            ...(paymentNotes ? { notes: paymentNotes } : {}),
            ...(params.markCompleted ? { markCompleted: true } : {}),
          }),
        );
        return { ok: true, message: `Payment recorded for ${order.orderRef}.${completer ? ` Completed by ${completer}.` : ''}` };
      },
      completeCollection: (orderId) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (!PAID_STATUSES.includes(order.payment.status))
          return { ok: false, message: 'Record the payment before handing the order over.' };
        // The handover entry names who handed it over, not just who is signed in.
        const completer = resolveCompleter(order);
        if (!completer) return { ok: false, message: 'Assign the person completing this order first.' };
        run(() =>
          storeOrderingService.setStatus(
            order.id,
            'completed',
            `Order handed over to the customer — completed by ${completer}.`,
          ),
        );
        return { ok: true, message: `Order ${order.orderRef} handed over and marked as Completed by ${completer}.` };
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
      updateSettings: (patch) => runSettings(patch),
      activePosHandoffOrderId,
      setActivePosHandoffOrderId,
      completeOrderFromPos: (orderId, tender, posTransactionId, notes) => {
        const order = find(orderId);
        if (!order) return { ok: false, message: 'Order not found' };
        if (order.origin === 'Deal' && order.sourceRef) {
          void claimsService.redeemVoucher(order.sourceRef).catch(() => {});
        }
        if (!UUID.test(posTransactionId)) {
          const result = updateOrderStatus(orderId, 'completed', notes);
          if (result.ok) setActivePosHandoffOrderId(null);
          return result;
        }
        const completer = resolveCompleter(order);
        if (!completer) return { ok: false, message: 'Assign the person completing this order first.' };
        const handoffNotes = [notes, `Completed by ${completer}`].filter(Boolean).join(' — ');
        run(() =>
          storeOrderingService.completeFromPos(order.id, { tender, posSaleId: posTransactionId, notes: handoffNotes }),
        );
        setActivePosHandoffOrderId(null);
        return { ok: true, message: `Order ${order.orderRef} completed via VEMTAP POS by ${completer}.` };
      },
      lastError,
      clearLastError,
    };
  }, [
    live,
    liveOrders.data,
    liveQr.data,
    liveSettings.data,
    liveSettings.isLoading,
    settingsSaving,
    liveSummary.data,
    teamRows,
    signedIn,
    staffOptionsFor,
    staffValueFor,
    resolveCompleter,
    run,
    runSettings,
    queryClient,
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
      settingsLoading: false,
      settingsSaving: false,
      summaryMetrics,
      getOrderById,
      updateOrderStatus,
      toggleItemAvailability,
      substituteItem,
      removeItem,
      assignStaff,
      staffOptionsFor: demoStaffOptionsFor,
      staffValueFor: demoStaffValueFor,
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

  return (
    <StoreOrderingDemandContext.Provider value={subscribe}>
      <StoreOrderingContext.Provider value={liveValue ?? value}>{children}</StoreOrderingContext.Provider>
    </StoreOrderingDemandContext.Provider>
  );
}

/**
 * Store-ordering state and actions. Pass `{ withData: false }` from screens that
 * only submit orders (the customer storefront), so they don't load the owner's data.
 */
export function useStoreOrdering({ withData = true }: { withData?: boolean } = {}) {
  const subscribe = useContext(StoreOrderingDemandContext);
  useEffect(() => (withData ? subscribe() : undefined), [withData, subscribe]);
  const ctx = useContext(StoreOrderingContext);
  if (!ctx) {
    throw new Error('useStoreOrdering must be used within a StoreOrderingProvider');
  }
  return ctx;
}
