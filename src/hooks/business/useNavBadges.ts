import { hasApiConfig } from '../../services/api/client';
import { useInboxUnreadSummary } from './useInbox';
import { useBusinessOrders } from './useBusinessOrders';

/** Nav keys whose badge carries a live count. */
const MESSAGES_KEYS = new Set(['messages', 'messages-inapp']);
const ORDERS_KEYS = new Set(['pos', 'orders', 'orders-all']);

const label = (count: number) => (count > 99 ? '99+' : count > 0 ? String(count) : undefined);

/**
 * Live badge counts for the sidebar and the mobile tab bar: unread customer
 * messages across the branches the user can read, and new store orders at the
 * active branch. In demo mode it returns each nav item's own sample badge.
 */
export function useNavBadges() {
  const live = hasApiConfig();
  const unread = useInboxUnreadSummary('IN_HOUSE');
  const orders = useBusinessOrders();
  const newOrders = (orders.data ?? []).filter((order) => order.status === 'new').length;

  /** The badge to show for a nav item; `fallback` is its demo badge. */
  return (key: string, fallback?: string) => {
    if (!live) return fallback;
    if (MESSAGES_KEYS.has(key)) return label(unread.total);
    if (ORDERS_KEYS.has(key)) return label(newOrders);
    return fallback;
  };
}
