import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { hasApiConfig } from '../services/api/client';
import { notificationService } from '../services/notificationService';

/**
 * Unread notifications for the customer bell. `live` is false in demo mode,
 * where screens keep their sample badge; live, badges follow `count`.
 */
export function useUnreadNotifications() {
  const { authed } = useAuth();
  const live = hasApiConfig();
  const unread = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    enabled: live && authed,
    staleTime: 30_000,
  });
  return { live, count: live && authed ? unread.data ?? 0 : 0 };
}
