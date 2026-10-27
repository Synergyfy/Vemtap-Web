import { useQuery } from '@tanstack/react-query';
import { api, hasApiConfig } from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import type { PublicCartLine } from './publicPosData';

/** Neutral tile for items (and venues) without a photo. */
export const GUEST_NO_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23e7e0ec"/%3E%3Cpath d="M11 27l6-7 4 5 3-3 5 5z" fill="%23938f99"/%3E%3Ccircle cx="25" cy="15" r="3" fill="%23938f99"/%3E%3C/svg%3E';

/* ------------------------------------------------------------------ session */

/**
 * Where the guest is ordering: read once from the table QR link
 * (`/public/pos/menu?branch=<id>&table=<n>`), then kept for the session so the
 * cart and tracking pages know it too. The tracking token of the last order
 * placed is kept the same way (or read from `?order=<token>`).
 */
interface GuestSession {
  branchId: string | null;
  table: string | null;
  trackingToken: string | null;
}

const KEY = 'vemtap_guest_pos';

const readStored = (): GuestSession => {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<GuestSession>) : {};
    return { branchId: parsed.branchId ?? null, table: parsed.table ?? null, trackingToken: parsed.trackingToken ?? null };
  } catch {
    return { branchId: null, table: null, trackingToken: null };
  }
};

const store = (next: GuestSession) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode — the session simply won't survive a reload.
  }
};

export function guestSession(): GuestSession {
  const stored = readStored();
  const params = new URLSearchParams(window.location.search);
  const next = {
    branchId: params.get('branch') ?? stored.branchId,
    table: params.get('table') ?? stored.table,
    trackingToken: params.get('order') ?? stored.trackingToken,
  };
  if (next.branchId !== stored.branchId || next.table !== stored.table || next.trackingToken !== stored.trackingToken) store(next);
  return next;
}

const rememberTracking = (trackingToken: string) => store({ ...guestSession(), trackingToken });

/* ------------------------------------------------------------------ API */

export interface GuestOrderingInfo {
  branchId: string;
  branchName: string;
  businessName: string | null;
  logo: string | null;
  currency: string;
  acceptingOrders: boolean;
  rushPause: boolean;
  maxOrderValue: number | null;
  tableCount: number;
  prepMinutes: number;
  pricing: {
    taxEnabled: boolean;
    taxRate: number;
    taxLabel: string;
    pricesIncludeTax: boolean;
    serviceChargeEnabled: boolean;
    serviceChargeRate: number;
  };
}

interface PublicItem {
  id: string;
  name: string;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  shortDescription?: string | null;
  description?: string | null;
  mainImage?: string | null;
  category?: { id: string; name: string } | null;
  itemType?: string | null;
  stockQuantity?: number | null;
}

export interface GuestTracking {
  orderId: string;
  reference: string;
  status: string;
  cancelled: boolean;
  steps: { status: string; at: string | null; reached: boolean }[];
  tableNumber: string | null;
  notes: string | null;
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  totalAmount: number;
  prepMinutes: number;
  estimatedReadyAt: string;
  server: { firstName: string } | null;
  venue: { businessName: string | null; branchName: string | null; logo: string | null };
}

export interface GuestMenuEntry {
  id: string;
  name: string;
  price: number;
  was?: number;
  desc: string;
  image: string;
  cat: string;
}

/** The venue and its live menu for the table QR session. */
export function useGuestMenu() {
  const live = hasApiConfig();
  const { branchId, table } = guestSession();
  const info = useQuery({
    queryKey: ['guest-pos', 'ordering', branchId],
    queryFn: () => api.get<GuestOrderingInfo>(`/public/pos/branches/${branchId}/ordering`),
    enabled: live && Boolean(branchId),
  });
  const items = useQuery({
    queryKey: ['guest-pos', 'menu', branchId],
    queryFn: () =>
      api.get<{ data: PublicItem[] }>(API_ENDPOINTS.catalogue.publicItemsByBranch(branchId as string), { params: { limit: 100 } }),
    enabled: live && Boolean(branchId),
  });
  const menu: GuestMenuEntry[] = (items.data?.data ?? [])
    .filter((item) => item.itemType !== 'service' && !(typeof item.stockQuantity === 'number' && item.stockQuantity <= 0))
    .map((item) => {
      const price = Number(item.price ?? 0) || 0;
      const was = Number(item.compareAtPrice ?? 0) || 0;
      return {
        id: item.id,
        name: item.name,
        price,
        was: was > price ? was : undefined,
        desc: item.shortDescription ?? item.description ?? '',
        image: item.mainImage || GUEST_NO_IMAGE,
        cat: item.category?.id ?? 'other',
      };
    });
  const categories = Array.from(
    new Map((items.data?.data ?? []).filter((item) => item.category).map((item) => [item.category!.id, item.category!.name])).entries(),
  ).map(([key, label]) => ({ key, label }));
  return {
    live,
    branchId,
    table,
    info: info.data ?? null,
    menu,
    categories,
    loading: info.isLoading || items.isLoading,
    error: info.error ?? items.error,
  };
}

/** The bill the way the branch prices it (VAT inclusive/exclusive, service charge). */
export function guestTotals(lines: PublicCartLine[], pricing: GuestOrderingInfo['pricing'] | null | undefined) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const rate = pricing?.taxEnabled ? (pricing.taxRate || 0) / 100 : 0;
  const vat = pricing?.pricesIncludeTax ? Math.round(subtotal - subtotal / (1 + rate)) : Math.round(subtotal * rate);
  const service = pricing?.serviceChargeEnabled ? Math.round(subtotal * ((pricing.serviceChargeRate || 0) / 100)) : 0;
  return { subtotal, vat, service, total: subtotal + (pricing?.pricesIncludeTax ? 0 : vat) + service };
}

/** `POST /pos/orders` as a guest; remembers the tracking token for the tracking page. */
export async function placeGuestOrder(input: {
  lines: PublicCartLine[];
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const { branchId, table } = guestSession();
  if (!branchId) throw new Error('Scan the QR code on your table to order.');
  const order = await api.post<{ id: string; trackingToken?: string | null }>('/pos/orders', {
    branchId,
    items: input.lines.map((line) => ({ itemId: line.id, quantity: line.qty })),
    firstName: input.firstName,
    lastName: input.lastName || undefined,
    phone: input.phone || undefined,
    email: input.email || undefined,
    notes: [input.notes, ...input.lines.filter((line) => line.note).map((line) => `${line.name}: ${line.note}`)].filter(Boolean).join(' · ') || undefined,
    tableNumber: table ? `Table ${table}` : undefined,
  });
  if (order.trackingToken) rememberTracking(order.trackingToken);
  return order;
}

/** The guest's last order, polled until it is collected. */
export function useGuestTracking() {
  const live = hasApiConfig();
  const { trackingToken } = guestSession();
  const query = useQuery({
    queryKey: ['guest-pos', 'track', trackingToken],
    queryFn: () => api.get<GuestTracking>(`/public/pos/orders/track/${trackingToken}`),
    enabled: live && Boolean(trackingToken),
    refetchInterval: (state) => (state.state.data?.status === 'completed' || state.state.data?.cancelled ? false : 15_000),
  });
  return { live, trackingToken, order: query.data ?? null, loading: query.isLoading, error: query.error };
}

/**
 * The tracking stepper from the order's status steps (new → processing →
 * ready → completed), keeping each demo row's title and icon. The last reached
 * step is the active one; a cancelled order shows every step as upcoming.
 */
export function trackingSteps<T extends { title: string; meta: string; time?: string; state: 'done' | 'active' | 'upcoming'; icon: string }>(
  order: GuestTracking,
  rows: T[],
): T[] {
  const lastReached = order.steps.reduce((last, step, index) => (step.reached ? index : last), -1);
  return rows.map((row, index) => {
    const step = order.steps[index];
    const at = step?.at ? new Date(step.at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined;
    const done = order.status === 'completed' ? index <= lastReached : index < lastReached;
    return {
      ...row,
      meta: index === rows.length - 1 && order.tableNumber ? `Food being brought to ${order.tableNumber}` : row.meta.replace(/Cashier Emeka O\./, 'the team'),
      time: at,
      state: order.cancelled ? 'upcoming' : done ? 'done' : index === lastReached ? 'active' : 'upcoming',
    };
  });
}
