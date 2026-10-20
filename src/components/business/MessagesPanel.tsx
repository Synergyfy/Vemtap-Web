import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useInboxMutations, useInboxThreads, useThreadMessages } from '../../hooks/business/useInbox';
import { personName, type InboxChannel, type InboxThread } from '../../services/businessMessagingService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatRelativeTime } from '../../utils/format';

const CHANNELS: { key: InboxChannel; label: string }[] = [
  { key: 'IN_HOUSE', label: 'In-app' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'SMS', label: 'SMS' },
  { key: 'EMAIL', label: 'Email' },
];

const SUBJECT_LABEL: Record<string, string> = {
  DEAL: 'About a deal',
  CLAIM: 'About a claim',
  ORDER: 'About an order',
  BOOKING: 'About a booking',
};

const clock = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }) : '');
const dayLabel = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
};

function Avatar({ thread, size = 40 }: { thread: InboxThread; size?: number }) {
  const name = personName(thread.customer);
  return thread.customer?.avatar ? (
    <img src={thread.customer.avatar} alt="" style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
  ) : (
    <span style={{ width: size, height: size }} className="rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function ThreadList({ threads, selectedId, onSelect }: { threads: InboxThread[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {threads.map((thread) => {
        const unread = (thread.branchUnreadCount ?? 0) > 0;
        const selected = thread.id === selectedId;
        return (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => onSelect(thread.id)}
              aria-current={selected ? 'true' : undefined}
              className={`w-full text-left rounded-xl p-space-sm flex items-center gap-space-sm transition-colors ${
                selected ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'
              }`}
            >
              <Avatar thread={thread} />
              <span className="flex flex-col flex-1 min-w-0">
                <span className="flex items-center justify-between gap-space-xs">
                  <span className={`font-label-md text-label-md text-text-primary truncate ${unread ? 'font-semibold' : 'font-medium'}`}>{personName(thread.customer)}</span>
                  <span className="font-caption text-[11px] text-text-tertiary shrink-0">{formatRelativeTime(thread.lastActivityAt)}</span>
                </span>
                <span className="flex items-center justify-between gap-space-xs">
                  <span className={`font-caption text-caption truncate ${unread ? 'text-text-primary' : 'text-text-secondary'}`}>{thread.lastMessageContent || 'No messages yet'}</span>
                  {unread ? (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] flex items-center justify-center shrink-0">
                      {thread.branchUnreadCount}
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Conversation({
  thread,
  onBack,
  onOpenCustomer,
  onDeleted,
}: {
  thread: InboxThread;
  onBack?: () => void;
  onOpenCustomer?: (customerId: string) => void;
  onDeleted: () => void;
}) {
  const messages = useThreadMessages(thread.id);
  const { reply, markRead, removeThread } = useInboxMutations();
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const unread = thread.branchUnreadCount ?? 0;
  const count = messages.data?.length ?? 0;

  // Opening a thread with unread messages marks them read.
  useEffect(() => {
    if (unread > 0 && !markRead.isPending) markRead.mutate(thread.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id, unread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.id, count]);

  const send = () => {
    const content = draft.trim();
    if (!content || reply.isPending) return;
    reply.mutate({ threadId: thread.id, content }, { onSuccess: () => setDraft('') });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  let lastDay = '';
  return (
    <div className="flex flex-col h-full min-h-[480px]">
      <header className="flex items-center gap-space-sm pb-space-sm border-b border-border-subtle">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back to conversations" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-subtle">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
        ) : null}
        <Avatar thread={thread} size={36} />
        <span className="flex flex-col flex-1 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{personName(thread.customer)}</span>
          <span className="font-caption text-caption text-text-secondary truncate">
            {[SUBJECT_LABEL[thread.subjectType ?? ''], thread.customer?.email ?? thread.customer?.phone].filter(Boolean).join(' · ') || 'Customer'}
          </span>
        </span>
        {onOpenCustomer && thread.customerId ? (
          <button type="button" onClick={() => onOpenCustomer(thread.customerId as string)} className="h-9 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm hidden sm:inline-flex items-center gap-1">
            <Icon name="person" className="text-[16px]" /> Profile
          </button>
        ) : null}
        {confirmDelete ? (
          <span className="flex items-center gap-1">
            <button
              type="button"
              disabled={removeThread.isPending}
              onClick={() => removeThread.mutate(thread.id, { onSuccess: onDeleted })}
              className="h-9 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm"
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="h-9 px-space-xs font-label-sm text-label-sm">
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete conversation" className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-600">
            <Icon name="delete" className="text-[18px]" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto py-space-sm flex flex-col gap-space-xs" aria-live="polite">
        {messages.isLoading ? (
          <LoadingRows rows={3} label="Loading messages" />
        ) : messages.isError ? (
          <ErrorState title="Could not load messages" error={messages.error} onRetry={() => messages.refetch()} />
        ) : !count ? (
          <p className="font-caption text-caption text-text-secondary text-center py-space-lg">Say hello — this customer hasn't heard from you yet.</p>
        ) : (
          messages.data!.map((message) => {
            const outbound = message.direction === 'OUTBOUND';
            const day = dayLabel(message.createdAt);
            const divider = day !== lastDay ? day : null;
            lastDay = day;
            return (
              <div key={message.id} className="flex flex-col gap-space-xs">
                {divider ? <span className="self-center font-caption text-[11px] text-text-tertiary px-2 py-0.5 rounded-full bg-surface-subtle">{divider}</span> : null}
                <div className={`max-w-[80%] rounded-2xl px-space-sm py-space-xs flex flex-col gap-1 ${outbound ? 'self-end bg-primary-container text-on-primary rounded-br-md' : 'self-start bg-surface-container text-text-primary rounded-bl-md'}`}>
                  {message.mediaUrl && (message.mediaMimeType ?? 'image/').startsWith('image/') ? (
                    <img src={message.mediaUrl} alt="" className="rounded-lg max-h-60 object-cover" />
                  ) : null}
                  {message.content ? <span className="font-body-md text-body-md whitespace-pre-wrap break-words">{message.content}</span> : null}
                  <span className={`font-caption text-[11px] self-end ${outbound ? 'text-on-primary/80' : 'text-text-tertiary'}`}>
                    {clock(message.createdAt)}
                    {outbound && message.status ? ` · ${message.status.toLowerCase()}` : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="pt-space-sm border-t border-border-subtle flex flex-col gap-1">
        {reply.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(reply.error, 'Could not send your message.')}</span> : null}
        <div className="flex items-end gap-space-xs">
          <textarea
            aria-label="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Write a reply…"
            className="flex-1 resize-none max-h-32 rounded-xl border border-border-subtle bg-surface-canvas px-space-sm py-2.5 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || reply.isPending}
            aria-label="Send"
            className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            <Icon name="send" className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Live branch inbox. Desktop shows the list and the open conversation side by
 * side; on narrow screens the conversation replaces the list.
 */
export function MessagesPanel({
  initialThreadId,
  onOpenCustomer,
}: {
  initialThreadId?: string | null;
  onOpenCustomer?: (customerId: string) => void;
}) {
  const [channel, setChannel] = useState<InboxChannel>('IN_HOUSE');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialThreadId ?? null);
  const threads = useInboxThreads(channel);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = threads.data ?? [];
    return q ? rows.filter((t) => `${personName(t.customer)} ${t.lastMessageContent ?? ''}`.toLowerCase().includes(q)) : rows;
  }, [threads.data, search]);
  const selected = threads.data?.find((t) => t.id === selectedId) ?? null;
  const unread = (threads.data ?? []).reduce((sum, t) => sum + (t.branchUnreadCount ?? 0), 0);

  const list = (
    <div className="flex flex-col gap-space-sm min-w-0">
      <FilterChips<InboxChannel>
        value={channel}
        onChange={(next) => {
          setChannel(next);
          setSelectedId(null);
        }}
        options={CHANNELS.map((c) => ({ ...c, count: c.key === channel && unread ? unread : undefined }))}
      />
      <label className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          className="w-full h-10 pl-9 pr-space-sm rounded-lg bg-surface-canvas border border-border-subtle font-body-md text-body-md"
        />
      </label>
      {threads.isLoading ? (
        <LoadingRows rows={4} label="Loading conversations" />
      ) : threads.isError ? (
        <ErrorState title="Could not load conversations" error={threads.error} onRetry={() => threads.refetch()} />
      ) : !visible.length ? (
        <EmptyState
          icon="forum"
          title={search ? 'No matching conversations' : 'No conversations yet'}
          body={channel === 'IN_HOUSE' ? 'When customers message you from Vemtap, they show up here.' : 'Replies to your campaigns on this channel show up here.'}
        />
      ) : (
        <ThreadList threads={visible} selectedId={selectedId} onSelect={setSelectedId} />
      )}
    </div>
  );

  return (
    <>
      {/* Narrow: one pane at a time. */}
      <div className="lg:hidden">
        {selected ? (
          <Conversation key={selected.id} thread={selected} onBack={() => setSelectedId(null)} onOpenCustomer={onOpenCustomer} onDeleted={() => setSelectedId(null)} />
        ) : (
          list
        )}
      </div>
      {/* Wide: list beside the open conversation. */}
      <div className="hidden lg:grid grid-cols-[340px_minmax(0,1fr)] gap-space-md rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md h-[calc(100vh-260px)] min-h-[560px]">
        <div className="overflow-y-auto pr-1">{list}</div>
        <div className="border-l border-border-subtle pl-space-md min-w-0">
          {selected ? (
            <Conversation key={selected.id} thread={selected} onOpenCustomer={onOpenCustomer} onDeleted={() => setSelectedId(null)} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState icon="chat" title="Pick a conversation" body="Choose a customer on the left to read and reply." />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
