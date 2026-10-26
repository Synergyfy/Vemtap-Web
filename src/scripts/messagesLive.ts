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
  useThreadMessages,
} from '../hooks/business/useInbox';
import { CUSTOMER_AVATAR } from './customersLive';

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
