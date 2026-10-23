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
  stats: { orders: string; revenue: string; revenueDelta: string; bookings: string; unread: string };
  insights: { id: string; title: string; message: string }[];
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

/**
 * The Overview page's numbers. Live: dashboard + today's POS figures for the
 * active branch, the active plan and the business record. Demo: the branch's
 * sample stats, unchanged.
 */
export function useOverviewData(): OverviewView {
  const { branch, activeBranchId } = useBusinessBranch();
  const live = hasApiConfig() && Boolean(activeBranchId);
  const myBusiness = useMyBusiness();
  const orders = useBusinessOrders();
  const inbox = useInboxThreads('IN_HOUSE');

  const dashboard = useQuery({
    queryKey: ['business-dashboard', activeBranchId],
    queryFn: () => dashboardService.dashboard(activeBranchId as string),
    enabled: live,
    refetchInterval: 60_000,
  });
  const pos = useQuery({
    queryKey: ['pos-dashboard', activeBranchId],
    queryFn: () => dashboardService.posDashboard(activeBranchId as string),
    enabled: live,
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
  return {
    businessName: myBusiness.data?.name ?? dashboard.data?.businessName ?? 'your business',
    verified: myBusiness.data?.verificationStatus === 'verified' || myBusiness.data?.isVerified === true,
    planBadge: planBadge(subscription.data),
    stats: {
      orders: dash(toNumber(pos.data?.transactionCount)),
      revenue: dash(toNumber(pos.data?.revenue), formatNaira),
      revenueDelta: typeof delta === 'number' ? `${delta >= 0 ? '+' : ''}${Math.round(delta)}% vs last week` : 'Today',
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
      time: thread.lastActivityAt
        ? new Date(thread.lastActivityAt).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
        : '',
      unread: (thread.branchUnreadCount ?? 0) > 0,
    })),
    isLive: true,
    isLoading: dashboard.isLoading || pos.isLoading,
  };
}
