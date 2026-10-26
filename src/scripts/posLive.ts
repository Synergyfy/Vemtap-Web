import { useSyncExternalStore } from 'react';
import { ApiError, hasApiConfig } from '../services/api/client';
import { money, personName, posService, type KitchenOrder, type KitchenStatus, type NewSaleInput, type PosSale, type PosTill } from '../services/posService';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { usePosOffline } from '../context/PosOfflineContext';
import { useProfile } from '../context/ProfileContext';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import {
  useHeldSales,
  useKitchenStream,
  usePosBranchSummary,
  usePosMutations,
  usePosSales,
  usePosTills,
  useRegisterStatus,
  useZReport,
} from '../hooks/business/usePos';
import { formatNaira } from '../utils/format';
import type { CatalogueItem } from '../services/catalogueItemsService';
import { useCatalogueItems } from '../hooks/business/useCatalogueItems';
import { isItemActive, isLowStock } from './catalogueLive';
import type { CatalogueProduct } from './catalogueData';
import type { PosCatalogItem } from './desktop/posTerminalData';

/**
 * Live POS state shared by the POS screens: the open register session and its
 * till, today's takings, the kitchen stream, held tickets and the offline
 * queue, plus the labels the screens repeat.
 */

export const naira = (value?: number | null) => (value == null ? '—' : formatNaira(value));

export const METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Bank Transfer',
  bank_transfer: 'Bank Transfer',
  one_tap: 'One-Tap',
  wallet: 'Wallet',
  split: 'Split',
  voucher: 'Voucher',
  points: 'Loyalty Points',
};

export const methodLabel = (method?: string | null) =>
  method ? (METHOD_LABEL[method] ?? method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' ')) : '—';

/** "09:42 AM" */
export const timeLabel = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

/** "Today, 09:42 AM" / "Oct 14, 09:42 AM" */
export const whenLabel = (iso?: string | null) => {
  if (!iso) return '—';
  const at = new Date(iso);
  const day =
    at.toDateString() === new Date().toDateString()
      ? 'Today'
      : at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${day}, ${timeLabel(iso)}`;
};

export const TILL_STATUS_LABEL: Record<PosTill['status'], string> = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
  disabled: 'Disabled',
};

/** "Counter · ₦12,000 today · Ada O. signed in" */
export const tillMeta = (till: PosTill) =>
  [
    till.deviceLabel || till.code,
    `${naira(money(till.todaySales))} today`,
    till.occupant ? `${till.occupant.cashierName ?? 'Cashier'} signed in` : 'No one signed in',
  ]
    .filter(Boolean)
    .join(' · ');

export const saleCustomer = (sale: PosSale) => sale.customerName || personName(sale.customer);

export const saleItemsLine = (sale: PosSale) =>
  (sale.items ?? [])
    .map((item) => `${item.productName ?? 'Item'} ×${item.quantity}`)
    .join(' • ') || `${sale.itemCount ?? 0} items`;

export const SALE_STATUS_LABEL: Record<string, string> = {
  completed: 'Paid',
  refunded: 'Refunded',
  partial_refund: 'Part refunded',
  voided: 'Voided',
};

export const saleStatusLabel = (sale: PosSale) => SALE_STATUS_LABEL[sale.status] ?? sale.status;

/** The till, register session and today's figures for the POS home and drawer. */
export function useLivePos() {
  const live = hasApiConfig();
  const { branch, activeBranchId } = useBusinessBranch();
  const profile = useProfile();
  const business = useMyBusiness();
  const register = useRegisterStatus();
  const tills = usePosTills();
  const summary = usePosBranchSummary();
  const session = register.data?.isOpen ? (register.data.session ?? null) : null;
  const zReport = useZReport(Boolean(session));
  const kitchen = useKitchenStream();
  const held = useHeldSales();
  const offline = usePosOffline();
  const mutations = usePosMutations();

  const branchSummary =
    (summary.data ?? []).find((row) => row.branchId === activeBranchId) ?? (summary.data ?? []).find((row) => row.current);
  const till = session?.till ?? (session?.tillId ? (tills.data ?? []).find((row) => row.id === session.tillId) : null) ?? null;
  const todaySales = money(branchSummary?.todaySales);
  const todayCount = branchSummary?.todayTransactions ?? 0;
  const breakdown = Object.entries(zReport.data?.paymentBreakdown ?? {}).map(([method, amount]) => ({
    method,
    label: methodLabel(method),
    amount: money(amount),
  }));
  const breakdownTotal = breakdown.reduce((sum, row) => sum + row.amount, 0);

  /** Opens the register on a till — the given one, the first usable one, or a new "Till 01". */
  const openOnTill = async (tillId?: string) => {
    let id = tillId ?? (tills.data ?? []).find((row) => row.status !== 'disabled' && !row.occupant)?.id;
    if (!id) {
      if (!activeBranchId) throw new Error('Pick a branch first.');
      id = (await mutations.createTill.mutateAsync({ branchId: activeBranchId, name: 'Till 01' })).id;
    }
    return mutations.openRegister.mutateAsync({ openingCash: 0, tillId: id });
  };

  return {
    live,
    openOnTill,
    branchName: branch.name,
    branchArea: branch.area,
    businessName: business.data?.name ?? '—',
    cashierName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—',
    register,
    session,
    isOpen: Boolean(session),
    tillName: till?.name ?? '—',
    tills: tills.data ?? [],
    tillsLoaded: tills.isSuccess,
    zReport: zReport.data,
    todaySales,
    todayCount,
    averageTicket: todayCount ? todaySales / todayCount : 0,
    breakdown: breakdown
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({ ...row, share: breakdownTotal ? Math.round((row.amount / breakdownTotal) * 1000) / 10 : 0 })),
    kitchen: kitchen.data,
    heldCount: held.data?.length ?? 0,
    offline,
    mutations,
    error: register.error ?? tills.error ?? summary.error,
  };
}

export type LivePos = ReturnType<typeof useLivePos>;

/** Neutral tile for items without a photo. */
export const NO_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Cpath d="M11 27l6-7 4 5 3-3 5 5z" fill="%23938f99"/%3E%3Ccircle cx="25" cy="15" r="3" fill="%23938f99"/%3E%3C/svg%3E';

const itemPrice = (item: CatalogueItem) => Number(item.price ?? 0) || 0;
const itemWas = (item: CatalogueItem) => {
  const was = Number(item.compareAtPrice ?? 0) || 0;
  return was > itemPrice(item) ? was : undefined;
};
const tracksStock = (item: CatalogueItem) => item.itemType !== 'service' && typeof item.stockQuantity === 'number';

/**
 * The branch's sellable catalogue for the register, in the mobile register's
 * product shape and the desktop terminal's catalog shape, with its categories.
 */
export function usePosProducts() {
  const catalogue = useCatalogueItems();
  const items = (catalogue.data ?? []).filter(isItemActive);
  const categories = [
    { key: 'all', label: 'All' },
    ...Array.from(new Map(items.filter((item) => item.category).map((item) => [item.category!.id, item.category!.name])).entries()).map(
      ([key, label]) => ({ key, label }),
    ),
  ];
  const mobile: CatalogueProduct[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku ?? undefined,
    desc: item.shortDescription ?? '',
    category: item.category?.id ?? 'other',
    price: itemPrice(item),
    was: itemWas(item),
    stock: tracksStock(item) ? (item.stockQuantity as number) : undefined,
    image: item.mainImage || NO_IMAGE,
    imageAlt: item.name,
  }));
  const desktop: PosCatalogItem[] = items.map((item) => {
    const low = tracksStock(item) && isLowStock(item);
    const out = tracksStock(item) && (item.stockQuantity as number) <= 0;
    return {
      id: item.id,
      name: item.name,
      desc: item.shortDescription ?? '',
      unit: itemPrice(item),
      was: itemWas(item),
      mods: '',
      img: item.mainImage || NO_IMAGE,
      alt: item.name,
      badge: out ? 'Out of stock' : low ? 'Low stock' : itemWas(item) ? 'Deal' : '',
      badgeTone: out || low ? 'low' : itemWas(item) ? 'promo' : 'neutral',
      stock: tracksStock(item) ? `${item.stockQuantity} left` : 'Not tracked',
      stockTone: low || out ? 'low' : 'default',
    };
  });
  return { items, mobile, desktop, categories, loading: catalogue.isLoading, error: catalogue.error };
}

/** A register line in its simplest form; both cart shapes carry these fields. */
export interface BasicLine {
  id: string;
  name: string;
  unit: number;
  qty: number;
}

/** Custom keypad charges have no catalogue item, so the API cannot sell them. */
export const isCustomLine = (line: { id: string }) => line.id.startsWith('custom-');

/**
 * Park the current ticket as a held sale, or resume the oldest held ticket
 * (deleting it from the hold list) — the register's "Held" button.
 */
export function useHeldTicket() {
  const { activeBranchId } = useBusinessBranch();
  const held = useHeldSales();
  const mutations = usePosMutations();
  return {
    count: held.data?.length ?? 0,
    hold: (lines: BasicLine[]) => {
      if (!activeBranchId) return Promise.reject(new Error('Pick a branch first.'));
      return mutations.holdSale.mutateAsync({
        branchId: activeBranchId,
        items: lines.map((line) => ({
          productId: line.id,
          productName: line.name,
          unitPrice: line.unit,
          quantity: line.qty,
          totalPrice: line.unit * line.qty,
        })),
      });
    },
    resume: async (): Promise<BasicLine[] | null> => {
      const ticket = (held.data ?? [])[0];
      if (!ticket) return null;
      await mutations.deleteHeldSale.mutateAsync(ticket.id);
      return (ticket.items ?? []).map((item) => ({
        id: item.productId,
        name: item.productName ?? 'Item',
        unit: money(item.unitPrice),
        qty: item.quantity,
      }));
    },
  };
}

export type CheckoutMethod = 'cash' | 'card' | 'transfer' | 'split';

export interface CheckoutInput {
  lines: BasicLine[];
  method: CheckoutMethod;
  /** What the customer handed over (cash); defaults to the total. */
  amountPaid?: number;
  /** For split payments: the share each method covers. */
  split?: { method: Exclude<CheckoutMethod, 'split'>; amount: number }[];
  customerId?: string | null;
  note?: string;
}

export type CheckoutResult = { sale: PosSale; queued: false } | { sale: null; queued: true; ref: string };

/**
 * Takes payment for a ticket: `POST /pos/sales` when online, otherwise the
 * sale (with its full payload) joins the offline queue and syncs later.
 */
export function usePosCheckout() {
  const { activeBranchId } = useBusinessBranch();
  const offline = usePosOffline();
  const { completeSale } = usePosMutations();

  const checkout = async (input: CheckoutInput): Promise<CheckoutResult> => {
    if (!activeBranchId) throw new Error('Pick a branch first.');
    const lines = input.lines.filter((line) => !isCustomLine(line));
    if (!lines.length) throw new Error('Add at least one catalogue item to the ticket.');
    const total = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
    const amountPaid = input.amountPaid ?? total;
    const clientRef = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `pos-${Date.now()}`;
    const payload: NewSaleInput = {
      branchId: activeBranchId,
      items: lines.map((line) => ({ productId: line.id, quantity: line.qty })),
      payment: {
        method: input.method,
        amountPaid,
        change: input.method === 'cash' ? Math.max(0, amountPaid - total) : undefined,
        splitDetails: input.method === 'split' ? input.split : undefined,
      },
      customerId: input.customerId ?? undefined,
      notes: input.note || undefined,
      clientRef,
      orderedAt: new Date().toISOString(),
    };
    if (!offline.isOnline) {
      const ref = `POS-${clientRef.slice(0, 6).toUpperCase()}`;
      offline.enqueue({
        ref,
        total,
        tender: methodLabel(input.method),
        items: lines.map((line) => `${line.qty}× ${line.name}`).join(', '),
        payload,
      });
      return { sale: null, queued: true, ref };
    }
    const sale = await completeSale.mutateAsync(payload);
    return { sale, queued: false };
  };

  return { checkout, pending: completeSale.isPending };
}

/** A `/pos/customers` row in the register's customer-record shape. */
export const toCustomerRecord = (customer: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  pointsBalance?: number | null;
  tier?: string | null;
  totalSpent?: number | string | null;
  totalVisits?: number | null;
}) => ({
  id: customer.id,
  name: personName(customer, 'Customer'),
  phone: customer.phone ?? '—',
  email: customer.email ?? undefined,
  onVemtap: true,
  tier: customer.tier ?? 'Member',
  tierClass: 'bg-surface-tint-blue text-primary',
  points: customer.pointsBalance ?? 0,
  spend: money(customer.totalSpent),
  visits: customer.totalVisits ?? 0,
});

/* The sale just taken, so the receipt / sale-complete screens can show it. */
let lastSale: CheckoutResult | null = null;
const lastSaleListeners = new Set<() => void>();
export const setLastSale = (result: CheckoutResult | null) => {
  lastSale = result;
  lastSaleListeners.forEach((listener) => listener());
};
export const useLastSale = () =>
  useSyncExternalStore(
    (listener) => {
      lastSaleListeners.add(listener);
      return () => lastSaleListeners.delete(listener);
    },
    () => lastSale,
  );

/** Only API customers (uuid ids) can be linked to a sale. */
export const apiCustomerId = (id?: string | null) =>
  id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;

/* The sale a ledger / lookup row opened, for the transaction detail screen. */
let selectedSaleId: string | null = null;
const selectedSaleListeners = new Set<() => void>();
export const setSelectedSaleId = (id: string | null) => {
  selectedSaleId = id;
  selectedSaleListeners.forEach((listener) => listener());
};
export const useSelectedSaleId = () =>
  useSyncExternalStore(
    (listener) => {
      selectedSaleListeners.add(listener);
      return () => selectedSaleListeners.delete(listener);
    },
    () => selectedSaleId,
  );

/** One ledger row — a synced sale or a sale still queued on this device. */
export interface LedgerRow {
  /** API sale id; null for offline-queued sales. */
  saleId: string | null;
  ref: string;
  at: string;
  customer: string;
  method: string;
  /** Raw tender key: cash, card, transfer, split. */
  methodKey: string;
  orderType: string;
  itemCount: number;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  items: string;
  sync: string;
  synced: boolean;
}

export const saleToLedgerRow = (sale: PosSale): LedgerRow => ({
  saleId: sale.id,
  ref: sale.receiptNumber,
  at: sale.createdAt ?? '',
  customer: saleCustomer(sale) || 'Walk-in guest',
  method: methodLabel(sale.paymentMethod),
  methodKey: sale.paymentMethod,
  orderType: sale.orderType === 'takeaway' ? 'Takeaway' : 'Dine-In',
  itemCount: sale.itemCount ?? (sale.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
  amount: money(sale.total),
  status: sale.status === 'completed' ? 'completed' : 'refunded',
  items: `${sale.itemCount ?? (sale.items ?? []).reduce((sum, item) => sum + item.quantity, 0)} items · ${saleItemsLine(sale)}`,
  sync: sale.status === 'partial_refund' ? 'Part refunded' : sale.status === 'refunded' ? 'Refunded' : 'Synced',
  synced: true,
});

/**
 * The shift ledger: this register session's sales (or the branch's latest when
 * no register is open), with offline-queued sales on top as "pending".
 */
export function usePosLedger(limit = 50, wholeBranch = false) {
  const { session } = useLivePos();
  const offline = usePosOffline();
  const sales = usePosSales({ limit, sessionId: wholeBranch ? undefined : session?.id });
  const queued: LedgerRow[] = offline.queue.map((order) => ({
    saleId: null,
    ref: order.ref,
    at: new Date(order.takenAt).toISOString(),
    customer: 'Walk-in guest',
    method: order.tender,
    methodKey: order.tender.toLowerCase(),
    orderType: 'Dine-In',
    itemCount: 0,
    amount: order.total,
    status: 'pending',
    items: order.items,
    sync: 'Queued offline',
    synced: false,
  }));
  const rows = [...queued, ...(sales.data?.data ?? []).map(saleToLedgerRow)];
  const completed = rows.filter((row) => row.status === 'completed');
  return {
    rows,
    gross: completed.reduce((sum, row) => sum + row.amount, 0),
    tickets: rows.length,
    refunds: rows.filter((row) => row.status === 'refunded').length,
    loading: sales.isLoading,
    error: sales.error,
    refetch: sales.refetch,
  };
}

/**
 * Refunds a sale (whole, or chosen lines). When the business requires a
 * supervisor PIN for non-owners, the server answers 403: ask for the PIN,
 * trade it for an override token and retry once.
 */
export function usePosRefund() {
  const { refundSale } = usePosMutations();
  const refund = async (
    sale: PosSale,
    options: { reason?: string; items?: { saleItemId: string; quantity: number }[]; pin?: string } = {},
  ) => {
    const body = {
      id: sale.id,
      status: options.items?.length ? ('partial_refund' as const) : ('refunded' as const),
      reason: options.reason || undefined,
      refundItems: options.items?.length ? options.items : undefined,
    };
    const withPin = async (pin: string) => {
      const { overrideToken } = await posService.verifyOverride({ pin, action: 'refund', referenceId: sale.id, reason: options.reason });
      return refundSale.mutateAsync({ ...body, overrideToken });
    };
    if (options.pin) return withPin(options.pin);
    try {
      return await refundSale.mutateAsync(body);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
      const pin = window.prompt('A supervisor PIN is required for refunds. Enter it to continue:');
      if (!pin) throw new Error('Refund cancelled — no supervisor PIN entered.');
      return withPin(pin.trim());
    }
  };
  return { refund, pending: refundSale.isPending };
}

/** Kitchen lanes as the screens name them; the API calls "preparing" `processing`. */
export type KitchenLane = 'new' | 'preparing' | 'ready' | 'completed';
const LANE_STATUS: Record<KitchenLane, KitchenStatus> = { new: 'new', preparing: 'processing', ready: 'ready', completed: 'completed' };

/** Initials for a guest avatar: "Samuel Adeleke" → "SA". */
export const initials = (name?: string | null) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || 'G';

/** The branch's kitchen stream (polled), grouped by lane, with a status mover. */
export function useLiveKitchen() {
  const stream = useKitchenStream();
  const { setKitchenStatus } = usePosMutations();
  const orders = stream.data?.data ?? [];
  const lane = (key: KitchenLane) => orders.filter((order) => order.status === LANE_STATUS[key]);
  const count = (key: KitchenLane) => stream.data?.counts?.[LANE_STATUS[key]] ?? lane(key).length;
  return {
    orders,
    lane,
    count,
    active: count('new') + count('preparing') + count('ready'),
    averagePrep: stream.data?.averagePrepMinutes ?? null,
    error: stream.error,
    move: (order: KitchenOrder, to: KitchenLane) => setKitchenStatus.mutateAsync({ id: order.id, status: LANE_STATUS[to] }),
    moving: setKitchenStatus.isPending,
    refetch: stream.refetch,
  };
}
