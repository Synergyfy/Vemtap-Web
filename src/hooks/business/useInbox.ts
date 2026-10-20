import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { businessMessagingService, type InboxChannel } from '../../services/businessMessagingService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const inboxKeys = {
  all: ['inbox'] as const,
  threads: (branchId: string | undefined, channel: InboxChannel) => [...inboxKeys.all, 'threads', branchId ?? 'none', channel] as const,
  messages: (threadId: string) => [...inboxKeys.all, 'messages', threadId] as const,
};

/** Threads for one channel at the active branch, refreshed while the page is open. */
export function useInboxThreads(channel: InboxChannel = 'IN_HOUSE') {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: inboxKeys.threads(activeBranchId, channel),
    queryFn: () => businessMessagingService.threads(activeBranchId as string, channel),
    enabled: Boolean(activeBranchId) && hasApiConfig(),
    refetchInterval: 15_000,
  });
}

/** Messages in one thread, oldest first, refreshed every few seconds. */
export function useThreadMessages(threadId: string | null) {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: inboxKeys.messages(threadId ?? 'none'),
    queryFn: async () => {
      const rows = await businessMessagingService.messages(threadId as string, activeBranchId as string);
      return [...rows].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    },
    enabled: Boolean(threadId && activeBranchId),
    refetchInterval: 5_000,
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
