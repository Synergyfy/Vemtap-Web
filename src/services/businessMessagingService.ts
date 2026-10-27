import { api } from './api/client';

export type InboxChannel = 'IN_HOUSE' | 'SMS' | 'EMAIL' | 'WHATSAPP';

interface Person {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

/** `GET /messaging/inbox/:channel` row — one conversation with a customer. */
export interface InboxThread {
  id: string;
  branchId?: string | null;
  customerId?: string | null;
  customer?: Person | null;
  channel?: string | null;
  status?: string | null;
  lastActivityAt?: string | null;
  lastMessageContent?: string | null;
  branchUnreadCount?: number | null;
  subjectType?: string | null;
  claimId?: string | null;
  orderId?: string | null;
}

export interface InboxMessage {
  id: string;
  content: string;
  direction?: 'INBOUND' | 'OUTBOUND' | null;
  status?: string | null;
  channel?: string | null;
  createdAt?: string | null;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
}

/** `GET /messaging/inbox/unread-summary` row — one per branch the user can read. */
export interface BranchUnread {
  branchId: string;
  /** Unread customer messages. */
  unread: number;
  /** Conversations with at least one unread message. */
  threads: number;
}

/** `GET /messaging/inbox/threads/:id/context` — what a chat is about. */
export interface ThreadContext {
  threadId: string;
  subjectType?: string | null;
  order: {
    id: string;
    reference: string;
    kind: 'order' | 'booking';
    status: string;
    totalAmount: number;
    paymentStatus?: string | null;
    bookingDate?: string | null;
    bookingTime?: string | null;
    tableNumber?: string | null;
    createdAt: string;
    items: { name: string; quantity: number; unitPrice: number }[];
  } | null;
  claim: {
    id: string;
    claimCode: string;
    status: string;
    claimedAt: string;
    expiresAt?: string | null;
    redeemedAt?: string | null;
    offer: { id: string; name: string; price: number | null; mainImage?: string | null } | null;
  } | null;
}

const asList = <T>(res: T[] | { data?: T[] | null }) => (Array.isArray(res) ? res : res.data ?? []);

export const personName = (p?: Person | null) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.phone || p?.email || 'Customer';

/** Branch inbox: threads per channel, messages, replies and read receipts. */
export const businessMessagingService = {
  threads: (branchId: string, channel: InboxChannel) =>
    api.get<InboxThread[] | { data: InboxThread[] }>(`/messaging/inbox/${channel}`, { params: { branchId } }).then(asList),
  messages: (threadId: string, branchId: string) =>
    api.get<InboxMessage[] | { data: InboxMessage[] }>(`/messaging/inbox/threads/${threadId}`, { params: { branchId } }).then(asList),
  reply: (threadId: string, branchId: string, content: string) =>
    api.post<InboxMessage | null>(`/messaging/inbox/threads/${threadId}/reply`, { content }, { params: { branchId } }),
  markRead: (threadId: string, branchId: string) => api.post<unknown>(`/messaging/inbox/threads/${threadId}/read`, undefined, { params: { branchId } }),
  /** Opens (or returns the existing) in-app thread with a customer. */
  startThread: (customerId: string, branchId: string) => api.post<InboxThread>('/messaging/inbox/threads/init', { customerId, branchId }),
  removeThread: (threadId: string, branchId: string) => api.del<unknown>(`/messaging/inbox/threads/${threadId}`, { params: { branchId } }),
  /** Unread counts for every branch the user can read (zeros included). */
  unreadSummary: (channel: InboxChannel = 'IN_HOUSE') =>
    api.get<BranchUnread[]>('/messaging/inbox/unread-summary', { params: { channel } }),
  /** The order, booking or deal claim a thread was opened about. */
  threadContext: (threadId: string, branchId: string) =>
    api.get<ThreadContext>(`/messaging/inbox/threads/${threadId}/context`, { params: { branchId } }),
};
