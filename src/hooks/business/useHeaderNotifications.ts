import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { notificationService, type BusinessNotification } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { NOTIFICATION_FEED, type NotificationFeedItem } from '../../utils/notificationFeed';

export const headerNotificationKeys = { all: ['notifications', 'header'] as const };

/** Icon + tint for a business notification, from its event or type. */
function iconFor(notification: BusinessNotification & { eventType?: string | null }): Pick<NotificationFeedItem, 'icon' | 'iconClass'> {
  const key = `${notification.eventType ?? ''} ${notification.type ?? ''} ${notification.title}`.toLowerCase();
  if (/order|sale|shift|pos|payment|refund/.test(key)) return { icon: 'receipt_long', iconClass: 'bg-primary-container text-on-primary' };
  if (/book|reserv|appointment/.test(key)) return { icon: 'calendar_month', iconClass: 'bg-tertiary-container text-on-tertiary' };
  if (/deal|claim|offer|loyal|reward|point/.test(key)) return { icon: 'local_offer', iconClass: 'bg-badge-discount-bg text-badge-discount-text' };
  if (/message|chat|review/.test(key)) return { icon: 'chat_bubble', iconClass: 'bg-secondary-container text-on-secondary-container' };
  return { icon: 'notifications', iconClass: 'bg-surface-container-high text-on-surface-variant' };
}

/** "Just now", "12m ago", "3h ago", "2d ago", or a date. */
function ago(iso?: string | null) {
  if (!iso) return '';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/**
 * The header bell's feed. Live: the business's latest notifications from
 * `GET /notifications/business`, with read state saved on the server. Demo:
 * the sample feed, the first `demoUnread` items starting unread.
 */
export function useHeaderNotifications(demoUnread = 3) {
  const live = hasApiConfig();
  const { authed } = useAuth();
  const queryClient = useQueryClient();
  const [demoRead, setDemoRead] = useState<Set<string>>(
    () => new Set(NOTIFICATION_FEED.slice(demoUnread).map((item) => item.id)),
  );

  const feed = useQuery({
    queryKey: [...headerNotificationKeys.all, 'feed'],
    queryFn: () => notificationService.businessFeed({ page: 1, limit: 8 }),
    enabled: live && authed,
    refetchInterval: 60_000,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const markRead = useMutation({ mutationFn: (id: string) => notificationService.markAsRead(id), onSuccess: refresh });
  const markAll = useMutation({ mutationFn: () => notificationService.markAllRead(), onSuccess: refresh });

  if (!live) {
    return {
      items: NOTIFICATION_FEED,
      isRead: (id: string) => demoRead.has(id),
      unreadCount: NOTIFICATION_FEED.filter((item) => !demoRead.has(item.id)).length,
      markAllRead: () => setDemoRead(new Set(NOTIFICATION_FEED.map((item) => item.id))),
      markRead: (id: string) => setDemoRead((prev) => new Set(prev).add(id)),
    };
  }

  const rows = feed.data?.data ?? [];
  const items: NotificationFeedItem[] = rows.map((row) => ({
    id: row.id,
    ...iconFor(row),
    title: row.title,
    time: ago(row.createdAt),
    body: row.message,
  }));
  const readIds = new Set(rows.filter((row) => row.isRead).map((row) => row.id));
  return {
    items,
    isRead: (id: string) => readIds.has(id),
    unreadCount: feed.data?.unreadCount ?? rows.filter((row) => !row.isRead).length,
    markAllRead: () => markAll.mutate(),
    markRead: (id: string) => {
      if (!readIds.has(id)) markRead.mutate(id);
    },
  };
}
