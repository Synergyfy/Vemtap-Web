import { api } from './api/client';

export type NotificationCategory = 'deals' | 'bookings' | 'rewards' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  body?: string;
  createdAt?: string;
  unread?: boolean;
  isRead?: boolean;
  read?: boolean;
  category?: NotificationCategory | string;
  type?: string;
  kind?: string;
  actionUrl?: string;
}

export interface NotificationPreferencePayload {
  push?: boolean;
  email?: boolean;
  sms?: boolean;
  marketing?: boolean;
  orderUpdates?: boolean;
  loyalty?: boolean;
  support?: boolean;
  rewardAlerts?: boolean;
  activityDigest?: boolean;
  smsSecurity?: boolean;
  [key: string]: unknown;
}

const pickString = (source: unknown, keys: string[]): string => {
  if (!source || typeof source !== 'object') return '';
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
};

const pickBoolean = (source: unknown, keys: string[]): boolean => {
  if (!source || typeof source !== 'object') return false;
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'y'].includes(normalized)) return true;
      if (['0', 'false', 'no', 'n'].includes(normalized)) return false;
    }
    if (typeof value === 'number') return value !== 0;
  }

  return false;
};

const normalizeCategory = (value?: string): NotificationCategory => {
  const normalized = (value ?? '').trim().toLowerCase();
  if (['deal', 'claims', 'claim', 'promotion', 'offer'].includes(normalized)) return 'deals';
  if (['booking', 'order', 'orders', 'reservation', 'pickup'].includes(normalized)) return 'bookings';
  if (['reward', 'rewards', 'loyalty', 'points'].includes(normalized)) return 'rewards';
  return 'system';
};

const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const container = payload as Record<string, unknown>;
    for (const key of ['data', 'items', 'results', 'notifications', 'rows', 'list']) {
      const value = container[key];
      if (Array.isArray(value)) return value;
    }
  }

  return [];
};

export const normalizeNotificationList = (payload: unknown): NotificationItem[] => {
  return extractArray(payload).map((entry, index) => {
    const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
    const id = pickString(item, ['id', '_id', 'notificationId']) || `notification-${index}`;
    const title = pickString(item, ['title', 'headline', 'subject', 'name']) || 'Vemtap update';
    const message =
      pickString(item, ['message', 'body', 'description', 'text']) ||
      pickString(item, ['content', 'summary']) ||
      'You have a new update.';
    const createdAt = pickString(item, ['createdAt', 'created_at', 'timestamp', 'sentAt', 'sent_at']);
    const unread = pickBoolean(item, ['unread', 'isUnread', 'read'])
      ? !pickBoolean(item, ['read', 'isRead'])
      : !pickBoolean(item, ['isRead', 'read']);
    const categoryValue = pickString(item, ['category', 'type', 'kind', 'group']);

    return {
      id,
      title,
      message,
      body: typeof item.body === 'string' ? item.body : message,
      createdAt,
      unread,
      isRead: !unread,
      read: !unread,
      category: normalizeCategory(categoryValue || item.type ? String(item.type ?? item.kind ?? categoryValue) : undefined),
      type: String(item.type ?? item.kind ?? categoryValue ?? 'system'),
      kind: String(item.kind ?? item.type ?? categoryValue ?? 'system'),
    };
  });
};

const readNumericCount = (payload: unknown): number => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['count', 'unreadCount', 'totalUnread', 'unread', 'value']) {
      const value = record[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }

    if ('data' in record && record.data && typeof record.data === 'object') {
      return readNumericCount(record.data);
    }
  }

  return 0;
};

/** One row of the venue-wide feed (`GET /notifications/business`). */
export interface BusinessNotification {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
  actionUrl?: string | null;
}

export interface BusinessNotificationPage {
  data: BusinessNotification[];
  total?: number | null;
  unreadCount?: number | null;
}

export const notificationService = {
  /** Everything that happened at the business, whoever it was addressed to. */
  businessFeed: async (params?: { page?: number; limit?: number }) =>
    api.get<BusinessNotificationPage>('/notifications/business', { params }),

  list: async (params?: Record<string, string | number | boolean | undefined>) => {
    const response = await api.get<unknown>('/notifications', { params });
    return normalizeNotificationList(response);
  },

  getUnreadCount: async () => {
    const response = await api.get<unknown>('/notifications/unread-count');
    return readNumericCount(response);
  },

  getPreferences: async () => {
    try {
      return await api.get<NotificationPreferencePayload>('/notifications/preferences');
    } catch (error) {
      if (error instanceof Error && 'status' in error && typeof (error as { status?: number }).status === 'number') {
        return {} as NotificationPreferencePayload;
      }
      throw error;
    }
  },

  updatePreferences: async (payload: NotificationPreferencePayload) => {
    return api.patch<NotificationPreferencePayload>('/notifications/preferences', payload);
  },

  registerPushToken: async (token: string, payload?: { transport?: string; platform?: string }) => {
    return api.post('/notifications/push-token', {
      token,
      transport: payload?.transport ?? 'WEB',
      platform: payload?.platform ?? 'web',
    });
  },

  clearPushToken: async () => {
    return api.del('/notifications/push-token');
  },

  markAsRead: async (id: string) => {
    return api.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },

  markAllRead: async () => {
    // `PATCH mark-all-read` is not routed (the handler's stacked @Post wins); `read-all` is.
    return api.patch('/notifications/read-all');
  },
};
