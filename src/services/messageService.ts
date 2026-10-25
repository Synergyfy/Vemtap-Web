import { api, ApiError } from './api/client';

export type MessageDirection = 'merchant' | 'you';
export type MessageThreadFilter = 'deals' | 'bookings';
export type MessageSecondaryRoute = 'deal-detail' | 'booking-detail' | 'order-detail' | 'deals' | 'dashboard';

export interface MessageItem {
  id: string | number;
  sender: MessageDirection;
  author: string;
  time: string;
  body: string;
  badge?: string;
  avatar?: string;
  avatarAlt?: string;
  delivered?: boolean;
}

export interface MessageThread {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  time: string;
  tag: string;
  tagClass: string;
  tagIcon: string;
  preview: string;
  avatar?: string;
  alt?: string;
  unread: boolean;
  filters: MessageThreadFilter[];
  location?: string;
  status?: string;
  phone?: string;
  deal?: { title: string; code: string };
  secondaryLabel?: string;
  secondaryRoute?: MessageSecondaryRoute;
  messages: MessageItem[];
  quickReplies: string[];
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

const pickArray = (source: unknown, keys: string[]): unknown[] => {
  if (!source || typeof source !== 'object') return [];
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['threads', 'items', 'results', 'messages', 'data', 'rows', 'list']) {
      const value = record[key];
      if (Array.isArray(value)) return value;
    }

    if ('data' in record && record.data && typeof record.data === 'object') {
      return extractArray(record.data);
    }
  }

  return [];
};

const normalizeFilters = (input: unknown): MessageThreadFilter[] => {
  const values = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  const normalized = values
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean)
    .map((value) => {
      if (value.includes('deal')) return 'deals';
      if (value.includes('book') || value.includes('order')) return 'bookings';
      return undefined;
    })
    .filter((value): value is MessageThreadFilter => Boolean(value));

  return normalized.length > 0 ? [...new Set(normalized)] : ['bookings'];
};

const formatDisplayTime = (value: string | undefined): string => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const now = new Date();
  const sameDay = parsed.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsed);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

const buildInitials = (value: string): string => {
  const words = value.split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return 'V';
  return words.map((word) => word[0]?.toUpperCase() ?? '').join('').slice(0, 2) || 'V';
};

const normalizeMessage = (entry: unknown, index: number): MessageItem => {
  const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};

  const author =
    pickString(item, ['author', 'senderName', 'fromName', 'name']) ||
    pickString(item, ['participantName', 'merchantName', 'businessName']) ||
    'Vemtap user';

  const body =
    pickString(item, ['body', 'message', 'content', 'text', 'summary']) ||
    pickString(item, ['preview']) ||
    'No message content';

  const createdAt = pickString(item, ['createdAt', 'created_at', 'sentAt', 'sent_at', 'timestamp', 'time']);
  const role = pickString(item, ['role', 'senderRole', 'direction']);
  const userOwned =
    pickBoolean(item, ['isMine', 'isCurrentUser', 'mine']) ||
    role.toLowerCase() === 'customer' ||
    role.toLowerCase() === 'user';

  const sender: MessageDirection = userOwned ? 'you' : 'merchant';

  return {
    id: pickString(item, ['id', '_id']) || `msg-${index}`,
    sender,
    author: sender === 'you' ? 'You' : author,
    time: formatDisplayTime(createdAt),
    body,
    badge: pickString(item, ['badge', 'title']) || undefined,
    avatar: pickString(item, ['avatar', 'avatarUrl', 'imageUrl']) || undefined,
    avatarAlt: pickString(item, ['avatarAlt', 'alt']) || undefined,
    delivered: sender === 'you' ? true : undefined,
  };
};

const normalizeMessages = (payload: unknown): MessageItem[] => {
  const records = extractArray(payload);
  if (records.length === 0 && payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nested = record.messages ?? record.items ?? record.data;
    if (nested && typeof nested === 'object') {
      return normalizeMessages(nested);
    }
  }

  return records.map((entry, index) => normalizeMessage(entry, index));
};

const resolveThreadRecord = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if ('thread' in record && record.thread && typeof record.thread === 'object') {
    return record.thread as Record<string, unknown>;
  }

  if ('data' in record && record.data && typeof record.data === 'object') {
    const data = record.data as Record<string, unknown>;
    if ('thread' in data && data.thread && typeof data.thread === 'object') {
      return data.thread as Record<string, unknown>;
    }
    if ('threads' in data && Array.isArray(data.threads)) {
      return data.threads[0] as Record<string, unknown>;
    }
    if (Object.keys(data).length > 0) {
      return data;
    }
  }

  return record;
};

const normalizeThread = (payload: unknown, fallbackIndex = 0): MessageThread => {
  const record = resolveThreadRecord(payload) ?? {};
  const participantName =
    pickString(record, ['participantName', 'merchantName', 'businessName', 'name', 'title']) ||
    pickString(record, ['customerName']) ||
    `Business ${fallbackIndex + 1}`;

  const previewSource =
    pickString(record, ['lastMessage', 'preview', 'snippet', 'latestMessage', 'message', 'body', 'text']) ||
    'No messages yet';

  const threadId = pickString(record, ['id', '_id', 'threadId']) || `thread-${fallbackIndex}`;
  const updatedAt = pickString(record, ['updatedAt', 'updated_at', 'lastMessageAt', 'lastMessageAt', 'createdAt', 'created_at']);
  const unread = pickBoolean(record, ['unread', 'hasUnread', 'isUnread']) || Number(pickString(record, ['unreadCount', 'unread_count'])) > 0;

  const dealValue = record.deal && typeof record.deal === 'object' ? (record.deal as Record<string, unknown>) : undefined;
  const deal = dealValue
    ? {
        title: pickString(dealValue, ['title', 'name']) || 'Deal offer',
        code: pickString(dealValue, ['code', 'voucherCode', 'dealCode']) || 'N/A',
      }
    : undefined;

  const tags = pickArray(record, ['tags', 'categories', 'filters'])
    .map((value) => String(value).trim())
    .filter(Boolean);

  const quickReplies = pickArray(record, ['quickReplies', 'suggestedReplies']).map((value) => String(value).trim()).filter(Boolean);

  const messages = normalizeMessages(record.messages ?? record.threadMessages ?? record.items ?? payload);

  return {
    id: threadId,
    name: participantName,
    initials: buildInitials(participantName),
    verified: pickBoolean(record, ['verified', 'isVerified', 'isTrusted']) || participantName.toLowerCase().includes('verified'),
    time: formatDisplayTime(updatedAt),
    tag:
      pickString(record, ['tag', 'threadTag', 'label', 'category']) ||
      (deal ? 'Deal Pass' : 'Direct Message'),
    tagClass: pickString(record, ['tagClass', 'statusClass']) || 'bg-surface-container-high text-text-secondary',
    tagIcon: pickString(record, ['tagIcon', 'icon']) || (deal ? 'local_offer' : 'chat_bubble_outline'),
    preview: previewSource,
    avatar: pickString(record, ['avatar', 'avatarUrl', 'imageUrl', 'logo', 'photo']) || undefined,
    alt: pickString(record, ['alt', 'avatarAlt']) || undefined,
    unread,
    filters: normalizeFilters(tags.length > 0 ? tags : record.filter ?? record.category ?? record.type),
    location: pickString(record, ['location', 'address']) || undefined,
    status: pickString(record, ['status', 'state']) || 'Active',
    phone: pickString(record, ['phone', 'phoneNumber']) || undefined,
    deal,
    secondaryLabel: pickString(record, ['secondaryLabel', 'callToAction']) || (deal ? 'Deal Details' : 'Conversation'),
    secondaryRoute: (pickString(record, ['secondaryRoute', 'route']) as MessageSecondaryRoute) || (deal ? 'deal-detail' : 'dashboard'),
    messages,
    quickReplies: quickReplies.length > 0 ? quickReplies : ['Thanks', 'Please confirm', 'I will get back shortly'],
  };
};

const normalizeThreadList = (payload: unknown): MessageThread[] => {
  const entries = extractArray(payload);
  if (entries.length === 0 && payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if ('data' in record && record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
      const nested = (record.data as Record<string, unknown>).threads ?? (record.data as Record<string, unknown>).items;
      if (Array.isArray(nested)) return nested.map((entry, index) => normalizeThread(entry, index));
    }
  }

  return entries.map((entry, index) => normalizeThread(entry, index));
};

const buildRequestBody = (message: string) => ({
  message,
  content: message,
  text: message,
});

const handleApiFallback = <TResponse>(fallback: TResponse, error: unknown): TResponse => {
  if (error instanceof ApiError && [404, 405].includes(error.status)) {
    return fallback;
  }
  if (error instanceof Error && 'status' in error && typeof (error as { status?: number }).status === 'number') {
    return fallback;
  }
  return fallback;
};

export const messageService = {
  listThreads: async (): Promise<MessageThread[]> => {
    try {
      const response = await api.get<unknown>('/customer/messaging/threads');
      return normalizeThreadList(response);
    } catch (error) {
      return handleApiFallback([], error);
    }
  },

  getThread: async (threadId: string): Promise<MessageThread | null> => {
    if (!threadId) return null;

    try {
      const response = await api.get<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}`);
      return normalizeThread(response);
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },

  startConversation: async (payload: { businessName?: string; businessId?: string; message?: string; customerId?: string }) => {
    try {
      return await api.post<unknown>('/customer/messaging/threads/start', {
        businessName: payload.businessName,
        businessId: payload.businessId,
        message: payload.message,
        customerId: payload.customerId,
      });
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },

  sendReply: async (threadId: string, message: string) => {
    if (!threadId || !message.trim()) {
      return null;
    }

    try {
      return await api.post<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}/reply`, buildRequestBody(message));
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },

  markAsRead: async (threadId: string) => {
    if (!threadId) {
      return null;
    }

    try {
      return await api.post<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}/read`);
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },

  deleteThread: async (threadId: string) => {
    if (!threadId) {
      return null;
    }

    try {
      return await api.del<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}`);
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },
};
