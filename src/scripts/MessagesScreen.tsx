import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { MOBILE_THREADS, type MessageFilter, type MobileThread } from './messagesData';

interface MessagesScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpen: (threadId: string) => void;
}

type InboxChipKey = 'all' | 'unread' | 'deals' | 'bookings';

const INBOX_CHIPS: { key: InboxChipKey; label: string; icon?: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', pulse: true },
  { key: 'deals', label: 'Deals', icon: 'local_offer' },
  { key: 'bookings', label: 'Bookings & Orders', icon: 'receipt_long' },
];

function matchesFilter(thread: MobileThread, filter: InboxChipKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return thread.unread;
  return thread.filters.includes(filter as MessageFilter);
}

export function MessagesScreen({ onTab, onOpen }: MessagesScreenProps) {
  const [chip, setChip] = useState<InboxChipKey>('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((curr) => (curr === message ? null : curr)), 2200);
  };

  const countFor = (key: InboxChipKey) => {
    const total = MOBILE_THREADS.filter((t) => matchesFilter(t, key)).length;
    return `(${total})`;
  };

  const trimmed = query.trim().toLowerCase();
  const visibleConversations = MOBILE_THREADS.filter((thread) => {
    if (!matchesFilter(thread, chip)) return false;
    if (trimmed) {
      const haystack = `${thread.name} ${thread.tag} ${thread.preview}`.toLowerCase();
      return haystack.includes(trimmed);
    }
    return true;
  });

  return (
    <AppScreen>
      {/* Header — matches BusinessMessagesHomeScreen */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface truncate">Messages</h1>
            <div className="flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-badge-discount-bg">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text animate-pulse" />
              <span className="font-caption text-caption text-badge-discount-text font-medium">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Search conversations"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={() => {
                const el = document.getElementById('consumer-msg-search');
                el?.focus();
              }}
            >
              <Icon name="search" className="text-[22px]" />
            </button>
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={() => showToast('Messaging preferences and notifications are up to date.')}
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Search Surface */}
        <div className="px-space-md pt-space-xs pb-space-xs">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2.5 rounded-xl shadow-sm transition-all">
            <Icon name="search" className="text-text-secondary text-[20px]" />
            <input
              id="consumer-msg-search"
              className="bg-transparent flex-1 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
              placeholder="Search merchant, deal, order #, or message..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button
                aria-label="Clear search"
                className="w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high transition-colors"
                type="button"
                onClick={() => setQuery('')}
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            ) : (
              <button
                aria-label="Filters"
                className="w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high transition-colors"
                type="button"
                onClick={() => showToast('Showing all active conversations.')}
              >
                <Icon name="tune" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-space-md py-space-2xs flex items-center gap-space-xs overflow-x-auto no-scrollbar">
          {INBOX_CHIPS.map((inboxChip) => {
            const active = inboxChip.key === chip;
            return (
              <button
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-colors ${
                  active ? 'bg-surface-tint-blue text-primary shadow-sm' : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
                }`}
                key={inboxChip.key}
                type="button"
                onClick={() => setChip(inboxChip.key)}
              >
                {active && inboxChip.pulse && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                {inboxChip.icon && !inboxChip.pulse && <Icon name={inboxChip.icon} className="text-[13px]" />}
                <span>{inboxChip.label}</span>
                <span className={`font-caption text-caption ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                  {countFor(inboxChip.key)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected Banner */}
        <div className="px-space-md py-space-xs">
          <div className="flex items-center justify-between px-space-md py-2 bg-badge-discount-bg text-badge-discount-text rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-badge-discount-text" />
              <span className="font-caption text-caption font-semibold">Connected</span>
              <span className="font-caption text-caption opacity-75">• Instant merchant sync active</span>
            </div>
            <div className="flex items-center gap-1 font-caption text-caption font-semibold">
              <span>Apo Hub</span>
              <Icon name="expand_more" className="text-[14px]" />
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex flex-col px-space-xs mt-space-2xs space-y-1">
          {visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-xl">
              <Icon name="forum" className="text-[36px] text-outline-variant" />
              <p className="font-label-md text-label-md text-text-secondary">No conversations match your filter.</p>
              <button
                type="button"
                onClick={() => {
                  setChip('all');
                  setQuery('');
                }}
                className="text-primary font-label-sm text-label-sm font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            visibleConversations.map((thread) => (
              <button
                className={`flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-canvas transition-transform cursor-pointer text-left w-full ${
                  thread.unread ? 'shadow-sm active:scale-[0.99]' : 'hover:bg-surface-subtle'
                }`}
                key={thread.id}
                type="button"
                onClick={() => onOpen(thread.id)}
              >
                {/* Avatar with Online indicator */}
                <div className="relative shrink-0">
                  {thread.avatar ? (
                    <img
                      alt={thread.alt ?? thread.name}
                      className="w-[50px] h-[50px] rounded-full object-cover shadow-inner"
                      src={thread.avatar}
                    />
                  ) : (
                    <div className="w-[50px] h-[50px] rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-bold shadow-inner">
                      {thread.initials}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-badge-discount-text rounded-full ring-2 ring-surface-canvas" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-space-xs mb-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{thread.name}</h2>
                      {thread.verified && (
                        <Icon name="verified" filled className="text-primary text-[14px] shrink-0" />
                      )}
                    </div>
                    <span
                      className={`font-caption text-caption shrink-0 ${
                        thread.unread ? 'text-primary font-semibold' : 'text-text-tertiary'
                      }`}
                    >
                      {thread.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption font-medium ${thread.tagClass}`}
                    >
                      <Icon name={thread.tagIcon} className="text-[12px]" />
                      {thread.tag}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-space-xs">
                    <p
                      className={`font-body-md text-body-md truncate ${
                        thread.unread ? 'text-text-primary font-medium' : 'text-text-secondary'
                      }`}
                    >
                      {thread.preview}
                    </p>
                    {thread.unread && (
                      <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* New Message FAB — matches BusinessMessagesHomeScreen */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex justify-end pointer-events-none">
        <button
          aria-label="New message"
          className="flex items-center gap-2 px-space-md py-3 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform pointer-events-auto"
          type="button"
          onClick={() => showToast('Select a business to start a new chat.')}
        >
          <Icon name="add_comment" className="text-[20px]" />
          <span className="font-button-primary text-button-primary">New Message</span>
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 max-w-[400px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2 text-label-md font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
