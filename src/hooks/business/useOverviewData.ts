import { useQuery } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { dashboardService, toNumber } from '../../services/dashboardService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useMyBusiness } from './useMyBusiness';
import { formatNaira } from '../../utils/format';
import { URBAN_BUSINESS } from '../../scripts/businessData';
import { useBusinessOrders } from './useBusinessOrders';
import { toPrice } from '../../services/catalogueItemsService';
import { useInboxThreads } from './useInbox';
import { personName } from '../../services/businessMessagingService';

export interface OverviewView {
  businessName: string;
  verified: boolean;
  /** e.g. "Growth Trial · 23 days left"; null when there is nothing to say. */
  planBadge: string | null;
  /** True on a paid plan (not a trial), so upgrade prompts can be skipped. */
  onPaidPlan: boolean;
  stats: { orders: string; revenue: string; revenueDelta: string; bookings: string; unread: string };
  insights: { id: string; title: string; message: string }[];
  /** First failed load (live only), for a toast. */
  error: unknown;
  /** Latest orders (live only), in the overview card's row shape. */
  recentOrders: { id: string; customer: string; amount: string; status: string; statusClass: string }[];
  /** Latest in-app conversations (live only), in the overview card's row shape. */
  recentMessages: { id: string; name: string; preview: string; time: string; unread: boolean }[];
  isLive: boolean;
  isLoading: boolean;
}

const dash = (value: number | undefined, format: (n: number) => string = (n) => n.toLocaleString('en-NG')) =>
  value === undefined ? '—' : format(value);

function planBadge(sub: { isTrial?: boolean | null; trialEndsAt?: string | null; plan?: { name?: string | null } | null } | null | undefined) {
  if (!sub?.plan?.name) return null;
  if (sub.isTrial && sub.trialEndsAt) {
    const days = Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86_400_000));
    return `${sub.plan.name} Trial · ${days} ${days === 1 ? 'day' : 'days'} left`;
  }
  return `${sub.plan.name} plan`;
}

const isToday = (iso?: string | null) => Boolean(iso) && new Date(iso as string).toDateString() === new Date().toDateString();

/** "9:24 AM" today, "Yesterday", or "12 Oct" for older chats. */
const messageTime = (iso?: string | null) => {
  if (!iso) return '';
  const at = new Date(iso);
  if (isToday(iso)) return at.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (at.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return at.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

/**
 * The Overview page's numbers. Live: dashboard + today's POS figures for the
 * active branch, the active plan and the business record. Demo: the branch's
 * sample stats, unchanged.
 */
export function useOverviewData(): OverviewView {
  const { branch, activeBranchId } = useBusinessBranch();
  // API mode is always live; with no branch yet the branch queries stay off and show "—".
  const live = hasApiConfig();
  const hasBranch = Boolean(activeBranchId);
  const myBusiness = useMyBusiness();
  const orders = useBusinessOrders();
  const inbox = useInboxThreads('IN_HOUSE');

  const dashboard = useQuery({
    queryKey: ['business-dashboard', activeBranchId],
    queryFn: () => dashboardService.dashboard(activeBranchId as string),
    enabled: live && hasBranch,
    refetchInterval: 60_000,
  });
  const pos = useQuery({
    queryKey: ['pos-dashboard', activeBranchId],
    queryFn: () => dashboardService.posDashboard(activeBranchId as string),
    enabled: live && hasBranch,
    refetchInterval: 60_000,
  });
  const subscription = useQuery({
    queryKey: ['subscription', 'active'],
    queryFn: dashboardService.activeSubscription,
    enabled: live,
    staleTime: 10 * 60_000,
  });

  if (!live) {
    return {
      businessName: URBAN_BUSINESS.name,
      verified: true,
      planBadge: 'Growth Trial · 23 days left',
      onPaidPlan: false,
      error: null,
      stats: branch.stats,
      insights: [],
      recentOrders: [],
      recentMessages: [],
      isLive: false,
      isLoading: false,
    };
  }

  const stats = dashboard.data?.stats;
  const delta = stats?.revenueDelta;
  // Today = register sales + store orders placed today. Orders settled through a till
  // sale (`payment.posSaleId`) are already in the register figures, so skip them here.
  const storeToday = (orders.data ?? []).filter(
    (order) => isToday(order.createdAt) && order.status !== 'cancelled' && order.status !== 'rejected' && !order.payment?.posSaleId,
  );
  const storePaidToday = storeToday
    .filter((order) => order.paymentStatus === 'paid-in-store' || order.paymentStatus === 'paid-pos')
    .reduce((sum, order) => sum + (toPrice(order.totalAmount ?? undefined) ?? 0), 0);
  const posCount = toNumber(pos.data?.transactionCount);
  const posRevenue = toNumber(pos.data?.revenue);
  const ordersReady = posCount !== undefined && orders.data !== undefined;
  return {
    businessName: myBusiness.data?.name ?? dashboard.data?.businessName ?? (myBusiness.isLoading ? '…' : 'your business'),
    verified: myBusiness.data?.verificationStatus === 'verified' || myBusiness.data?.isVerified === true,
    planBadge: planBadge(subscription.data),
    onPaidPlan: Boolean(subscription.data?.plan?.name) && !subscription.data?.isTrial && !subscription.data?.plan?.isFree,
    error: dashboard.error ?? pos.error ?? orders.error ?? myBusiness.error ?? null,
    stats: {
      orders: ordersReady ? (posCount + storeToday.length).toLocaleString('en-NG') : '—',
      revenue: ordersReady && posRevenue !== undefined ? formatNaira(posRevenue + storePaidToday) : '—',
      // The API's delta compares the last 7 days with the 7 before, not today with yesterday.
      revenueDelta: typeof delta === 'number' ? `${delta >= 0 ? '+' : ''}${Math.round(delta)}% 7-day trend` : 'Today',
      bookings: dash(toNumber(stats?.bookingsCount)),
      unread: dash(toNumber(dashboard.data?.unreadMessages ?? undefined)),
    },
    insights: (dashboard.data?.insights ?? [])
      .filter((i) => i.title || i.message)
      .map((i, index) => ({ id: i.id ?? String(index), title: i.title ?? '', message: i.message ?? '' })),
    recentOrders: (orders.data ?? []).slice(0, 3).map((order) => {
      const total = toPrice(order.totalAmount ?? undefined);
      const status = order.status ?? 'new';
      return {
        id: `#${order.id.slice(0, 8).toUpperCase()}`,
        customer: [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || 'Walk-in guest',
        amount: total !== undefined ? formatNaira(total) : '—',
        status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        statusClass: status === 'new' ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-secondary',
      };
    }),
    recentMessages: (inbox.data ?? []).slice(0, 3).map((thread) => ({
      id: thread.id,
      name: personName(thread.customer),
      preview: thread.lastMessageContent || 'New conversation',
      time: messageTime(thread.lastActivityAt),
      unread: (thread.branchUnreadCount ?? 0) > 0,
    })),
    isLive: true,
    isLoading: myBusiness.isLoading || dashboard.isLoading || pos.isLoading,
  };
}
