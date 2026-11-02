import { api, ApiError, uploadFile } from './api/client';

export type MessageDirection = 'merchant' | 'you';
export type MessageThreadFilter = 'deals' | 'bookings';
export type MessageSecondaryRoute = 'deal-detail' | 'booking-detail' | 'order-detail' | 'deals' | 'dashboard';

/** Ticks: pending (clock), sent (one), delivered (two), read (two blue). */
export type MessageTick = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageItem {
  id: string | number;
  sender: MessageDirection;
  author: string;
  time: string;
  body: string;
  badge?: string;
  avatar?: string;
  avatarAlt?: string;
  /** Your messages only. */
  tick?: MessageTick;
  /** "Today", "Yesterday" or a date, for the day dividers. */
  day: string;
  /** Hosted image or PDF sent with the message. */
  media?: string;
  mediaType?: string;
  edited?: boolean;
  deleted?: boolean;
}

export interface MessageThread {
  id: string;
  /** For presence: `presence:subscribe` follows a business. */
  businessId?: string;
  branchId?: string;
  /** Public code, for the business's profile. */
  businessCode?: string;
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

const tickOf = (status: string): MessageTick => {
  switch (status.toUpperCase()) {
    case 'READ':
      return 'read';
    case 'DELIVERED':
      return 'delivered';
    case 'FAILED':
    case 'REJECTED':
      return 'failed';
    case 'PENDING':
    case 'QUEUED':
      return 'pending';
    default:
      return 'sent';
  }
};

export const chatDayLabel = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (parsed.toDateString() === today.toDateString()) return 'Today';
  if (parsed.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
};

const normalizeMessage = (entry: unknown, index: number, merchantName?: string): MessageItem => {
  const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};

  const author =
    pickString(item, ['author', 'senderName', 'fromName', 'name']) ||
    pickString(item, ['participantName', 'merchantName', 'businessName']) ||
    merchantName ||
    '';

  const body =
    pickString(item, ['body', 'message', 'content', 'text', 'summary']) ||
    pickString(item, ['preview']) ||
    '';

  const createdAt = pickString(item, ['timestamp', 'createdAt', 'created_at', 'sentAt', 'sent_at', 'time']);
  const role = pickString(item, ['role', 'senderRole', 'direction']).toLowerCase();
  // INBOUND means inbound to the business, so it is the customer's own message.
  const userOwned =
    pickBoolean(item, ['isMine', 'isCurrentUser', 'mine']) || role === 'customer' || role === 'user' || role === 'inbound';

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
    tick: sender === 'you' ? tickOf(pickString(item, ['status'])) : undefined,
    day: chatDayLabel(createdAt),
    media: pickString(item, ['mediaUrl']) || undefined,
    mediaType: pickString(item, ['mediaMimeType']) || undefined,
    edited: pickBoolean(item, ['isEdited']) || undefined,
    deleted: pickBoolean(item, ['isDeleted']) || undefined,
  };
};

const normalizeMessages = (payload: unknown, merchantName?: string): MessageItem[] => {
  const records = extractArray(payload);
  if (records.length === 0 && payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nested = record.messages ?? record.items ?? record.data;
    if (nested && typeof nested === 'object') {
      return normalizeMessages(nested, merchantName);
    }
  }

  return records.map((entry, index) => normalizeMessage(entry, index, merchantName));
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
  // A customer's thread names its business through `branch.business`.
  const branch = record.branch && typeof record.branch === 'object' ? (record.branch as Record<string, unknown>) : {};
  const business = branch.business && typeof branch.business === 'object' ? (branch.business as Record<string, unknown>) : {};
  const participantName =
    pickString(record, ['participantName', 'merchantName', 'businessName', 'name', 'title']) ||
    pickString(business, ['name']) ||
    pickString(branch, ['name']) ||
    '';

  const previewSource =
    pickString(record, ['lastMessageContent', 'lastMessage', 'preview', 'snippet', 'latestMessage', 'message', 'body', 'text']) ||
    'No messages yet';

  const threadId = pickString(record, ['id', '_id', 'threadId']) || `thread-${fallbackIndex}`;
  const updatedAt = pickString(record, ['lastActivityAt', 'updatedAt', 'updated_at', 'lastMessageAt', 'lastMessageAt', 'createdAt', 'created_at']);
  const unread = pickBoolean(record, ['unread', 'hasUnread', 'isUnread']) || Number(pickString(record, ['unreadCount', 'unread_count'])) > 0 || Number(record.customerUnreadCount) > 0;

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
    businessId: pickString(business, ['id']) || pickString(branch, ['businessId']) || undefined,
    branchId: pickString(record, ['branchId']) || undefined,
    businessCode: pickString(business, ['uniqueCode']) || undefined,
    name: participantName,
    initials: buildInitials(participantName),
    verified: pickBoolean(record, ['verified', 'isVerified', 'isTrusted']) || pickBoolean(business, ['isVerified']),
    time: formatDisplayTime(updatedAt),
    tag:
      pickString(record, ['tag', 'threadTag', 'label', 'category']) ||
      (deal ? 'Deal Pass' : 'Direct Message'),
    tagClass: pickString(record, ['tagClass', 'statusClass']) || 'bg-surface-container-high text-text-secondary',
    tagIcon: pickString(record, ['tagIcon', 'icon']) || (deal ? 'local_offer' : 'chat_bubble_outline'),
    preview: previewSource,
    avatar: pickString(record, ['avatar', 'avatarUrl', 'imageUrl', 'logo', 'photo']) || pickString(business, ['logoUrl']) || undefined,
    alt: pickString(record, ['alt', 'avatarAlt']) || undefined,
    unread,
    filters: normalizeFilters(tags.length > 0 ? tags : record.filter ?? record.category ?? record.type),
    location: pickString(record, ['location', 'address']) || pickString(branch, ['address']) || undefined,
    status: pickString(record, ['status', 'state']) || 'Active',
    phone: pickString(record, ['phone', 'phoneNumber']) || pickString(branch, ['phone']) || undefined,
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

  /**
   * The customer's chat with a branch, created empty if they have none yet:
   * `GET /customer/messaging/threads?branchId=` finds or creates it (CUSTOMER).
   * Resolves to its id; errors are thrown so the caller can show them.
   */
  openBranchThread: async (branchId: string): Promise<string> => {
    const response = await api.get<unknown>('/customer/messaging/threads', { params: { branchId } });
    const record = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
    const rows = Array.isArray(response) ? response : Array.isArray(record.data) ? record.data : [];
    const thread = rows.find((row) => (row as Record<string, unknown> | null)?.branchId === branchId) as { id?: unknown } | undefined;
    if (typeof thread?.id !== 'string') throw new Error('Chat is not available right now');
    return thread.id;
  },

  getThread: async (threadId: string): Promise<MessageThread | null> => {
    if (!threadId) return null;

    try {
      const [response, threads] = await Promise.all([
        api.get<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}`),
        api.get<unknown>('/customer/messaging/threads').then(normalizeThreadList).catch(() => []),
      ]);
      // This endpoint returns only the messages (none yet in a new chat); who the chat is with comes from the thread list.
      const summary = threads.find((thread) => thread.id === threadId) ?? normalizeThread({ id: threadId });
      return { ...summary, messages: normalizeMessages(response, summary.name) };
    } catch (error) {
      return handleApiFallback(null, error);
    }
  },

  /**
   * Starts a chat with a business branch and sends the first message —
   * `POST /customer/messaging/threads/start` with `{ branchId, content }` (CUSTOMER).
   * Errors are thrown so the caller can show them.
   */
  startConversation: async (payload: { branchId: string; content: string }) =>
    api.post<unknown>('/customer/messaging/threads/start', { branchId: payload.branchId, content: payload.content }),

  /** `POST .../reply` takes `content`. Errors are thrown so the bubble can show it failed. */
  sendReply: async (threadId: string, message: string) =>
    api.post<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}/reply`, { content: message }),

  /** `POST /customer/messaging/media`: an image or PDF, then its message. */
  sendFile: async (threadId: string, file: File) => {
    const { url } = await uploadFile<{ url: string }>('/customer/messaging/media', file);
    return api.post<unknown>(`/customer/messaging/threads/${encodeURIComponent(threadId)}/reply`, {
      mediaUrl: url,
      mediaMimeType: file.type,
    });
  },

  editMessage: async (id: string, content: string) =>
    api.patch<unknown>(`/customer/messaging/messages/${encodeURIComponent(id)}`, { content }),

  deleteMessage: async (id: string) => api.del<unknown>(`/customer/messaging/messages/${encodeURIComponent(id)}`),

  /** One message from the API or the socket, as the chat renders it. */
  toMessage: (entry: unknown, merchantName?: string) => normalizeMessage(entry, 0, merchantName),

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
