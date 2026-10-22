import { useMemo } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { BUSINESS_SIDEBAR_SECTIONS, type BusinessSidebarSection } from '../../scripts/desktop/businessSidebarConfig';
import { useInboxThreads } from './useInbox';
import { useBusinessOrders } from './useBusinessOrders';

/** Count badges that only make sense with real data. */
const LIVE_COUNT_KEYS = new Set(['messages', 'messages-inapp', 'pos', 'orders-all']);

const count = (n: number) => (n > 99 ? '99+' : n > 0 ? String(n) : undefined);

/**
 * The business sidebar with live badges: unread in-app chats on Messages and
 * new orders on POS. Demo mode keeps the designed sample badges.
 */
export function useSidebarSections(): BusinessSidebarSection[] {
  const live = hasApiConfig();
  const inbox = useInboxThreads('IN_HOUSE');
  const orders = useBusinessOrders();
  const unread = (inbox.data ?? []).reduce((sum, t) => sum + (t.branchUnreadCount ?? 0), 0);
  const newOrders = (orders.data ?? []).filter((o) => (o.status ?? 'new') === 'new').length;

  return useMemo(() => {
    if (!live) return BUSINESS_SIDEBAR_SECTIONS;
    const badgeFor = (key: string, fallback?: string) =>
      !LIVE_COUNT_KEYS.has(key) ? fallback : key.startsWith('messages') ? count(unread) : count(newOrders);
    return BUSINESS_SIDEBAR_SECTIONS.map((section) => ({
      ...section,
      badge: badgeFor(section.key, section.badge),
      items: section.items?.map((item) => ({ ...item, badge: badgeFor(item.key, item.badge) })),
    }));
  }, [live, unread, newOrders]);
}
