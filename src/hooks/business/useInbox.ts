import { useEffect, useState, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessMessagingService, type InboxChannel, type InboxMessage } from '../../services/businessMessagingService';
import { socketService } from '../../services/socketService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useAuth } from '../../context/AuthContext';

export const inboxKeys = {
  all: ['inbox'] as const,
  threads: (branchId: string | undefined, channel: InboxChannel) => [...inboxKeys.all, 'threads', branchId ?? 'none', channel] as const,
  messages: (threadId: string) => [...inboxKeys.all, 'messages', threadId] as const,
  // Under `threads` so every inbox socket event refreshes it too.
  unreadSummary: (channel: InboxChannel) => [...inboxKeys.all, 'threads', 'unread-summary', channel] as const,
  context: (threadId: string) => [...inboxKeys.all, 'context', threadId] as const,
};

// ---------------------------------------------------------------------------
// Realtime: one `/messaging` subscription for the whole app
// ---------------------------------------------------------------------------

const NS = '/messaging' as const;

/** Socket connection state, readable from any component. */
const connection = {
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    connection.listeners.add(listener);
    return () => connection.listeners.delete(listener);
  },
  notify() {
    connection.listeners.forEach((listener) => listener());
  },
};
const isConnected = () => socketService.isConnected(NS);

type Receipt = { threadId?: string; messageId?: string; messageIds?: string[]; status?: string };

let subscribers = 0;
let unbind: (() => void) | null = null;

/** Wires socket events into the query cache. Ref-counted so it binds once. */
function bindRealtime(queryClient: QueryClient) {
  const socket = socketService.connect(NS);
  if (!socket) return () => undefined;

  const refreshThreads = () => queryClient.invalidateQueries({ queryKey: [...inboxKeys.all, 'threads'] });
  const refreshThread = (threadId?: string) => {
    if (threadId) void queryClient.invalidateQueries({ queryKey: inboxKeys.messages(threadId) });
  };
  const applyReceipt = (receipt: Receipt) => {
    const ids = new Set(receipt.messageIds ?? (receipt.messageId ? [receipt.messageId] : []));
    if (!receipt.threadId || !ids.size || !receipt.status) return;
    queryClient.setQueryData<InboxMessage[]>(inboxKeys.messages(receipt.threadId), (rows) =>
      rows?.map((m) => (ids.has(m.id) ? { ...m, status: String(receipt.status).toUpperCase() } : m)),
    );
  };

  const handlers: [string, (...args: any[]) => void][] = [
    ['inboxUpdate', (event: { threadId?: string }) => {
      void refreshThreads();
      refreshThread(event?.threadId);
    }],
    ['newMessage', (message: { threadId?: string }) => refreshThread(message?.threadId)],
    ['messageUpdate', (event: { threadId?: string }) => refreshThread(event?.threadId)],
    ['threadDeleted', () => void refreshThreads()],
    ['messageRead', applyReceipt],
    ['messageStatus', applyReceipt],
    ['connect', () => {
      // Catch up on anything missed while disconnected.
      void queryClient.invalidateQueries({ queryKey: inboxKeys.all });
      connection.notify();
    }],
    ['disconnect', () => connection.notify()],
  ];
  handlers.forEach(([event, handler]) => socket.on(event, handler));
  connection.notify();
  return () => {
    handlers.forEach(([event, handler]) => socket.off(event, handler));
    connection.notify();
  };
}

/**
 * Keeps the inbox live over the messaging socket while mounted. Returns
 * whether the socket is connected, so callers can fall back to polling.
 */
export function useInboxRealtime(): boolean {
  const queryClient = useQueryClient();
  const { authed } = useAuth();
  const enabled = authed && hasApiConfig() && socketService.hasConfig();

  useEffect(() => {
    if (!enabled) return;
    subscribers += 1;
    if (subscribers === 1) unbind = bindRealtime(queryClient);
    return () => {
      subscribers -= 1;
      if (subscribers === 0) {
        unbind?.();
        unbind = null;
      }
    };
  }, [enabled, queryClient]);

  return useSyncExternalStore(connection.subscribe, () => enabled && isConnected(), () => false);
}

/**
 * Joins one thread's socket room while it is open, and reports whether the
 * customer is typing in it.
 */
export function useThreadRealtime(threadId: string | null) {
  const [customerTyping, setCustomerTyping] = useState(false);
  const { authed } = useAuth();

  useEffect(() => {
    if (!threadId || !authed || !socketService.hasConfig()) return;
    let timer: number | undefined;
    const join = () => socketService.emit(NS, 'joinThread', { threadId });
    join();
    const offConnect = socketService.on(NS, 'connect', join);
    const offTyping = socketService.on(NS, 'userTyping', (event: { threadId?: string; isTyping?: boolean }) => {
      if (event?.threadId !== threadId) return;
      window.clearTimeout(timer);
      setCustomerTyping(Boolean(event.isTyping));
      // Typing indicators expire on their own if the "stopped" event is lost.
      if (event.isTyping) timer = window.setTimeout(() => setCustomerTyping(false), 6000);
    });
    return () => {
      window.clearTimeout(timer);
      offConnect();
      offTyping();
      socketService.emit(NS, 'leaveThread', { threadId });
      setCustomerTyping(false);
    };
  }, [threadId, authed]);

  return {
    customerTyping,
    /** Tell the customer we are (or stopped) typing; cheap to call per keystroke. */
    sendTyping: (isTyping: boolean) => {
      if (threadId && socketService.isConnected(NS)) socketService.emit(NS, 'typing', { threadId, isTyping });
    },
  };
}

// ---------------------------------------------------------------------------
// Queries and mutations
// ---------------------------------------------------------------------------

/** Threads for one channel at the active branch; polls only when the socket is down. */
export function useInboxThreads(channel: InboxChannel = 'IN_HOUSE') {
  const { activeBranchId } = useBusinessBranch();
  const live = useInboxRealtime();
  return useQuery({
    queryKey: inboxKeys.threads(activeBranchId, channel),
    queryFn: () => businessMessagingService.threads(activeBranchId as string, channel),
    enabled: Boolean(activeBranchId) && hasApiConfig(),
    // Socket events drive updates; a slow refresh guards against missed events.
    refetchInterval: live ? 60_000 : 15_000,
  });
}

/** Unread counts per branch, for the branch switcher and the nav badges. */
export function useInboxUnreadSummary(channel: InboxChannel = 'IN_HOUSE') {
  const { authed } = useAuth();
  const live = useInboxRealtime();
  const query = useQuery({
    queryKey: inboxKeys.unreadSummary(channel),
    queryFn: () => businessMessagingService.unreadSummary(channel),
    enabled: authed && hasApiConfig(),
    refetchInterval: live ? 60_000 : 20_000,
  });
  const byBranch = new Map((query.data ?? []).map((row) => [row.branchId, row]));
  return {
    rows: query.data ?? [],
    unreadFor: (branchId?: string | null) => (branchId ? (byBranch.get(branchId)?.unread ?? 0) : 0),
    total: (query.data ?? []).reduce((sum, row) => sum + row.unread, 0),
    loaded: query.data !== undefined,
  };
}

/** The order / booking / deal claim behind a thread. */
export function useThreadContext(threadId: string | null | undefined) {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: inboxKeys.context(threadId ?? 'none'),
    queryFn: () => businessMessagingService.threadContext(threadId as string, activeBranchId as string),
    enabled: hasApiConfig() && Boolean(threadId && activeBranchId),
    staleTime: 60_000,
  });
}

/** Messages in one thread, oldest first. */
export function useThreadMessages(threadId: string | null) {
  const { activeBranchId } = useBusinessBranch();
  const live = useInboxRealtime();
  return useQuery({
    queryKey: inboxKeys.messages(threadId ?? 'none'),
    queryFn: async () => {
      const rows = await businessMessagingService.messages(threadId as string, activeBranchId as string);
      return [...rows].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    },
    enabled: Boolean(threadId && activeBranchId),
    refetchInterval: live ? false : 5_000,
  });
}

export function useInboxMutations() {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const branchId = activeBranchId as string;
  const refresh = () => queryClient.invalidateQueries({ queryKey: inboxKeys.all });
  return {
    reply: useMutation({
      mutationFn: ({ threadId, content }: { threadId: string; content: string }) => businessMessagingService.reply(threadId, branchId, content),
      onSuccess: refresh,
    }),
    markRead: useMutation({ mutationFn: (threadId: string) => businessMessagingService.markRead(threadId, branchId), onSuccess: refresh }),
    startThread: useMutation({ mutationFn: (customerId: string) => businessMessagingService.startThread(customerId, branchId), onSuccess: refresh }),
    removeThread: useMutation({ mutationFn: (threadId: string) => businessMessagingService.removeThread(threadId, branchId), onSuccess: refresh }),
  };
}
