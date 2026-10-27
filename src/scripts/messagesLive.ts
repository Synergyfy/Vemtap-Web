import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import {
  personName,
  type InboxChannel,
  type InboxMessage,
  type InboxThread,
} from '../services/businessMessagingService';
import {
  inboxKeys,
  useInboxMutations,
  useInboxThreads,
  useThreadContext,
  useThreadMessages,
} from '../hooks/business/useInbox';
import { useBusinessCustomers, useCustomerDossier } from '../hooks/business/useBusinessCustomers';
import { CUSTOMER_AVATAR } from './customersLive';
import type { CustomerCard, CustomerDossier } from '../services/businessCustomersService';

/**
 * Live inbox helpers shared by the messaging screens: mapping
 * `GET /messaging/inbox/:channel` threads onto the rows the inbox lists
 * render, plus a live chat thread (messages + reply) for the conversation
 * screens. Demo screens keep their static arrays; every live path is gated
 * on `hasApiConfig()` so demo mode is unchanged.
 */

/** Which conversation screen a thread opens, and the chip its row shows. */
export type InboxKind = 'general' | 'deal' | 'order' | 'booking';

interface SubjectChip {
  kind: InboxKind;
  icon: string;
  label: string;
  chipClass: string;
}

const SUBJECT_CHIPS: Record<string, SubjectChip> = {
  DEAL: {
    kind: 'deal',
    icon: 'local_offer',
    label: 'Deal',
    chipClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
  CLAIM: {
    kind: 'deal',
    icon: 'local_offer',
    label: 'Deal Claim',
    chipClass: 'bg-badge-discount-bg text-badge-discount-text',
  },
  ORDER: {
    kind: 'order',
    icon: 'receipt',
    label: 'Order',
    chipClass: 'bg-surface-container text-secondary',
  },
  BOOKING: {
    kind: 'booking',
    icon: 'event_seat',
    label: 'Booking',
    chipClass: 'bg-surface-container-high text-on-surface-variant',
  },
};

const GENERAL_CHIP: SubjectChip = {
  kind: 'general',
  icon: 'help_outline',
  label: 'General Inquiry',
  chipClass: 'bg-surface-container-low text-text-secondary',
};

/** Maps a thread's `subjectType` to the chat screen it opens and its row chip. */
export function inboxChip(subjectType?: string | null): SubjectChip {
  return (subjectType ? SUBJECT_CHIPS[subjectType] : undefined) ?? GENERAL_CHIP;
}

/** One conversation, shaped the way the mobile and desktop inbox lists render rows. */
export interface InboxRow {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  unreadCount: number;
  kind: InboxKind;
  chipIcon: string;
  chipLabel: string;
  chipClass: string;
  customerId?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function inboxRow(thread: InboxThread): InboxRow {
  const chip = inboxChip(thread.subjectType);
  const unreadCount = thread.branchUnreadCount ?? 0;
  return {
    id: thread.id,
    name: personName(thread.customer),
    avatar: thread.customer?.avatar || CUSTOMER_AVATAR,
    preview: thread.lastMessageContent?.trim() || 'No messages yet',
    time: formatChatRelativeTime(thread.lastActivityAt),
    unread: unreadCount > 0,
    unreadCount,
    kind: chip.kind,
    chipIcon: chip.icon,
    chipLabel: chip.label,
    chipClass: chip.chipClass,
    customerId: thread.customerId,
    phone: thread.customer?.phone ?? null,
    email: thread.customer?.email ?? null,
  };
}

function formatChatRelativeTime(iso?: string | null): string {
  if (!iso) return '';
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  const minutes = Math.round((Date.now() - time) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Live inbox threads for a channel at the active branch, shaped as rows. */
export function useInboxRows(channel: InboxChannel = 'IN_HOUSE'): { rows: InboxRow[]; loading: boolean } {
  const query = useInboxThreads(channel);
  return { rows: (query.data ?? []).map(inboxRow), loading: query.isLoading };
}

/** One chat bubble, shaped the way every conversation screen renders messages. */
export interface LiveChatMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  /** Clock time, e.g. "10:42 AM". */
  time: string;
  /** Outgoing only: the customer has read it. */
  read: boolean;
}

/** "10:42 AM" for chat bubbles; empty string when the timestamp is missing. */
export function chatClock(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
}

export function toChatMessages(rows: InboxMessage[]): LiveChatMessage[] {
  return rows.map((message) => ({
    id: message.id,
    direction: message.direction === 'OUTBOUND' ? 'out' : 'in',
    text: message.content,
    time: chatClock(message.createdAt),
    read: message.status === 'READ',
  }));
}

/**
 * Live messages + reply for one inbox thread. `live` is false in demo mode
 * or when a screen was opened with a demo contact (no thread id) — callers
 * keep their static conversation in that case.
 */
export function useLiveChat(threadId?: string | null): {
  live: boolean;
  messages: LiveChatMessage[];
  send: (content: string) => void;
  sending: boolean;
} {
  const live = hasApiConfig() && Boolean(threadId);
  const queryClient = useQueryClient();
  const query = useThreadMessages(live && threadId ? threadId : null);
  const { reply } = useInboxMutations();

  // Viewing a thread marks it read server-side; refresh the list badges once
  // the messages (and the mark-read) have landed.
  useEffect(() => {
    if (!live || !query.data) return;
    void queryClient.invalidateQueries({ queryKey: [...inboxKeys.all, 'threads'] });
  }, [live, query.data, queryClient]);

  return {
    live,
    messages: toChatMessages(query.data ?? []),
    send: (content: string) => {
      const value = content.trim();
      if (!live || !threadId || !value) return;
      reply.mutate({ threadId, content: value });
    },
    sending: reply.isPending,
  };
}

// ---------------------------------------------------------------------------
// Customer context for a conversation (desktop side panel, order chat metrics)
// ---------------------------------------------------------------------------

const nairaLabel = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0) || 0;
  return `₦${n.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
};

const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Most-bought item names from purchase lines like "Burger (x2), Fries (x1)". */
export function preferredItems(purchases: CustomerDossier['recentPurchases'], limit = 3): string[] {
  const counts = new Map<string, number>();
  (purchases ?? []).forEach((purchase) =>
    (purchase.items ?? '')
      .split(', ')
      .filter(Boolean)
      .forEach((line) => {
        const match = /^(.*) \(x(\d+)\)$/.exec(line);
        const name = (match ? match[1] : line).trim();
        if (name) counts.set(name, (counts.get(name) ?? 0) + (match ? Number(match[2]) : 1));
      }),
  );
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name]) => name);
}

/** The customer panel's figures from `GET /business-customers/:userId`; "—" until it loads. */
export function customerPanel(dossier: CustomerDossier | null | undefined) {
  const metrics = dossier?.metrics;
  const value = (n: number | null | undefined) => (dossier ? (n ?? 0).toLocaleString('en-NG') : '—');
  return {
    engagement: [
      { label: 'Visits', value: value(dossier?.visits) },
      { label: 'Orders', value: value(dossier?.orders) },
      { label: 'Deals', value: value(dossier?.claims) },
      { label: 'Tap Points', value: value(dossier?.pointsBalance) },
    ],
    telemetry: [
      { label: 'Avg order value', value: metrics ? nairaLabel(metrics.averageOrder) : '—' },
      { label: 'Visit frequency', value: metrics ? `${metrics.visitsPerMonth}× / month` : '—' },
      { label: 'Deal redemption rate', value: metrics ? `${Math.round(metrics.redemptionRate * 100)}%` : '—' },
      // No reply-time data is recorded yet.
      { label: 'Response rate', value: '—' },
    ],
    tier: dossier?.tier ?? null,
    preferred: preferredItems(dossier?.recentPurchases),
    notes: [
      { label: 'Last visit', value: shortDate(dossier?.lastSeenAt), icon: 'history' },
      { label: 'Member since', value: shortDate(dossier?.memberSince ?? dossier?.firstSeenAt), icon: 'event' },
      { label: 'Preferred branch', value: dossier?.preferredBranch?.name ?? '—', icon: 'storefront' },
      { label: 'Note', value: dossier?.note?.note?.trim() || 'No notes yet', icon: 'sticky_note_2' },
    ],
    spend: dossier ? nairaLabel(dossier.spend) : '—',
  };
}

/** Readable order / booking status: "processing" → "Processing". */
export const statusLabel = (status?: string | null) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/[_-]/g, ' ') : '—';

/**
 * Everything a live conversation screen shows besides the messages: the
 * customer's CRM record and the order, booking or deal claim the chat is
 * about. `live` is false in demo mode or for a demo contact (no thread id).
 */
export function useChatCustomer(threadId?: string | null, customerId?: string | null) {
  const live = hasApiConfig() && Boolean(threadId);
  const dossier = useCustomerDossier(live ? (customerId ?? null) : null);
  const context = useThreadContext(live ? threadId : null);
  const order = context.data?.order ?? null;
  const claim = context.data?.claim ?? null;
  const person = dossier.data ?? null;
  const subtitle = order
    ? `${order.kind === 'booking' ? 'Booking' : 'Order'} ${order.reference}`
    : claim
      ? `Deal · ${claim.offer?.name ?? claim.claimCode}`
      : 'Conversation';
  return {
    live,
    person,
    order,
    claim,
    panel: customerPanel(person),
    subtitle,
    phone: person?.phone ?? null,
    email: person?.email ?? null,
    error: dossier.error ?? context.error ?? null,
    /** The customer drawer's figures (spend, visit frequency, favourites, tier). */
    drawer: live
      ? {
          spend: person ? nairaLabel(person.spend) : '—',
          frequency: person?.metrics ? `${person.metrics.visitsPerMonth}× / month` : '—',
          favorites: preferredItems(person?.recentPurchases),
          tier: person?.tier ?? 'Customer',
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// New chat: pick a customer, open (or reuse) their thread, send the first message
// ---------------------------------------------------------------------------

/** A business customer as a "new message" recipient row. */
export interface LiveRecipient {
  customerId: string;
  name: string;
  avatar?: string;
  initials: string;
  phone: string;
  email: string;
  tagIcon: string;
  tagLabel: string;
  status: string;
  category: 'orders' | 'bookings' | 'deals' | 'loyalty' | 'inquiry';
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || 'C';

export function toRecipient(card: CustomerCard): LiveRecipient {
  const name = card.name?.trim() || card.phone || card.email || 'Customer';
  const category = card.orders > 0 ? 'orders' : card.bookings > 0 ? 'bookings' : card.claims > 0 ? 'deals' : card.visits > 1 ? 'loyalty' : 'inquiry';
  const tag =
    category === 'orders'
      ? { icon: 'receipt_long', label: `${card.orders} order${card.orders === 1 ? '' : 's'}` }
      : category === 'bookings'
        ? { icon: 'calendar_month', label: `${card.bookings} booking${card.bookings === 1 ? '' : 's'}` }
        : category === 'deals'
          ? { icon: 'local_offer', label: `${card.claims} deal claim${card.claims === 1 ? '' : 's'}` }
          : { icon: 'person', label: `${card.visits} visit${card.visits === 1 ? '' : 's'}` };
  return {
    customerId: card.userId,
    name,
    avatar: card.avatarUrl ?? undefined,
    initials: initialsOf(name),
    phone: card.phone ?? '—',
    email: card.email ?? '—',
    tagIcon: tag.icon,
    tagLabel: tag.label,
    status: card.lastSeenAt ? `Last seen ${formatChatRelativeTime(card.lastSeenAt)}` : 'New customer',
    category,
  };
}

/** Business customers to start a chat with (server-side search, most recent first). */
export function useLiveRecipients(search: string) {
  const live = hasApiConfig();
  const query = useBusinessCustomers({ search: search.trim() || undefined, sort: 'recent', limit: 30 });
  return {
    live,
    recipients: live ? (query.data?.data ?? []).map(toRecipient) : [],
    loading: query.isLoading,
    error: query.error,
  };
}

/**
 * Opens (or reuses) the in-app thread with a customer and, when given, posts
 * the first message. Resolves to the thread id.
 */
export function useStartChat() {
  const { startThread, reply } = useInboxMutations();
  return {
    start: async (customerId: string, firstMessage?: string) => {
      const thread = await startThread.mutateAsync(customerId);
      const text = firstMessage?.trim();
      if (text) await reply.mutateAsync({ threadId: thread.id, content: text });
      return thread.id;
    },
    pending: startThread.isPending || reply.isPending,
  };
}
