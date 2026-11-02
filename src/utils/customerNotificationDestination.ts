import type { NotificationItem } from '../services/notificationService';

export type CustomerNotificationDestination =
  | { kind: 'route'; path: string }
  | { kind: 'deal'; path: string }
  | { kind: 'conversation'; path: string; ref: string }
  | { kind: 'order'; path: string; ref: string }
  | { kind: 'booking'; path: string; ref: string };

const STATIC_CUSTOMER_PATHS = new Set([
  '/account/activity',
  '/account/help',
  '/account/preferences',
  '/account/rewards',
  '/account/savings',
  '/account/settings',
  '/deals',
  '/discover',
  '/messages',
  '/my-deals',
  '/orders',
]);

function safePathSegment(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    return decoded && !decoded.includes('/') ? decoded : null;
  } catch {
    return null;
  }
}

function internalUrl(actionUrl?: string | null): URL | null {
  if (!actionUrl?.trim()) return null;
  const origin = typeof window === 'undefined' ? 'https://vemtap.invalid' : window.location.origin;

  try {
    const url = new URL(actionUrl, origin);
    if (url.origin !== origin || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function fallbackPath(item: NotificationItem): string {
  const event = `${item.eventType ?? ''} ${item.kind ?? ''} ${item.type ?? ''}`.toLowerCase();
  if (/message|chat|conversation|thread/.test(event)) return '/messages';
  if (/claim|gift|voucher/.test(event)) return '/my-deals';

  switch (item.category) {
    case 'deals':
      return '/discover';
    case 'bookings':
      return '/orders';
    case 'rewards':
      return '/account/rewards';
    default:
      return '/account/preferences';
  }
}

export function resolveCustomerNotificationDestination(
  item: NotificationItem,
): CustomerNotificationDestination {
  const url = internalUrl(item.actionUrl);
  const path = url?.pathname.replace(/\/+$/, '') || fallbackPath(item);

  const threadMatch = /^\/messages\/(?:conversation\/)?([^/]+)$/.exec(path);
  const threadRef = threadMatch && threadMatch[1] !== 'conversation'
    ? threadMatch[1]
    : path === '/messages' || path === '/messages/conversation'
      ? url?.searchParams.get('threadId') ?? url?.searchParams.get('conversationId') ?? url?.searchParams.get('id')
      : null;
  const safeThreadRef = threadRef ? safePathSegment(encodeURIComponent(threadRef)) : null;
  if (safeThreadRef) {
    return {
      kind: 'conversation',
      path: `/messages/conversation/${encodeURIComponent(safeThreadRef)}`,
      ref: safeThreadRef,
    };
  }

  const bookingMatch = /^\/orders\/booking\/([^/]+)$/.exec(path);
  if (bookingMatch) {
    const ref = safePathSegment(bookingMatch[1]);
    if (ref) return { kind: 'booking', path, ref };
  }

  const orderMatch = /^\/orders\/([^/]+)$/.exec(path);
  if (orderMatch && orderMatch[1] !== 'booking' && orderMatch[1] !== 'order') {
    const ref = safePathSegment(orderMatch[1]);
    if (ref) {
      if (/booking|reservation|appointment/.test((item.eventType ?? '').toLowerCase())) {
        return { kind: 'booking', path, ref };
      }
      return { kind: 'order', path, ref };
    }
  }

  if (/^\/deals\/[^/]+$/.test(path)) return { kind: 'deal', path };

  const passMatch = /^\/my\/claimed-deal\/([^/]+)$/.exec(path);
  if (passMatch && safePathSegment(passMatch[1])) return { kind: 'route', path };

  if (STATIC_CUSTOMER_PATHS.has(path)) return { kind: 'route', path };

  return { kind: 'route', path: fallbackPath(item) };
}