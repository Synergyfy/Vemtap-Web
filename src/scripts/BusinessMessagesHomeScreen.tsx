import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { MessagesSubNav, type MessagesChannelKey } from '../components/campaigns/MessagesSubNav';
import { MobileLocationMenu } from '../components/BusinessHeaderMenus';
import type { BusinessChatContact } from './messagesContact';

interface BusinessMessagesHomeScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenSearch: () => void;
  onNewMessage: () => void;
  onOpenConversation: (thread: 'deal' | 'order' | 'general' | 'booking', contact: BusinessChatContact) => void;
  /** Sub-navigation between In-App Chat and the campaign channels. */
  onSelectChannel?: (key: MessagesChannelKey) => void;
}

type InboxChipKey = 'all' | 'unread' | 'orders' | 'deals' | 'bookings';

const INBOX_CHIPS: { key: InboxChipKey; label: string; count: string; icon?: string; pulse?: boolean }[] = [
  { key: 'all', label: 'All', count: '(0)' },
  { key: 'unread', label: 'Unread', count: '(0)', pulse: true },
  { key: 'orders', label: 'Orders', count: '(0)', icon: 'receipt_long' },
  { key: 'deals', label: 'Deals', count: '(0)', icon: 'local_offer' },
  { key: 'bookings', label: 'Bookings', count: '(0)', icon: 'calendar_today' },
];

interface ConversationRow {
  id: string;
  img?: string;
  alt?: string;
  name: string;
  time: string;
  timePrimary?: boolean;
  online?: boolean;
  unread?: boolean;
  chipIcon: string;
  chipLabel: string;
  chipClass: string;
  message: string;
  messagePrimary?: boolean;
  showYouPrefix?: boolean;
  readIcon?: 'done_all' | null;
  thread: 'deal' | 'order' | 'general' | 'booking';
  isBusiness?: boolean;
  tags: ('unread' | 'orders' | 'deals' | 'bookings')[];
}

const EMPTY_CONVERSATIONS: ConversationRow[] = [];

export function BusinessMessagesHomeScreen({
  onTab,
  onOpenSearch,
  onNewMessage,
  onOpenConversation,
  onSelectChannel,
}: BusinessMessagesHomeScreenProps) {
  const [chip, setChip] = useState<InboxChipKey>('all');

  const visibleConversations = EMPTY_CONVERSATIONS.filter((row) => {
    if (chip === 'all') return true;
    if (chip === 'unread') return row.unread;
    return row.tags.includes(chip);
  });

  return (
    <AppScreen>
      {/* Messages Header */}
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
            {/* Branch switching lives in the header, like the other business screens. */}
            <MobileLocationMenu />
            <button
              aria-label="Search conversations"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={onOpenSearch}
            >
              <Icon name="search" className="text-[22px]" />
            </button>
            <button
              aria-label="More options"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
        {onSelectChannel && <MessagesSubNav active="chat" onSelect={onSelectChannel} />}
      </header>

      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Search Surface */}
        <div className="px-space-md pt-space-xs pb-space-xs">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2.5 rounded-xl shadow-sm transition-all">
            <Icon name="search" className="text-text-secondary text-[20px]" />
            <input
              className="bg-transparent flex-1 font-body-md text-body-md text-on-surface placeholder:text-text-tertiary focus:outline-none"
              placeholder="Search customer, deal, order #, or message..."
              type="text"
              readOnly
              onClick={onOpenSearch}
            />
            <button
              aria-label="Voice search or filters"
              className="w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-high transition-colors"
              type="button"
              onClick={onOpenSearch}
            >
              <Icon name="tune" className="text-[18px]" />
            </button>
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
                <span>{inboxChip.label}</span>
                <span className={`font-caption text-caption ${active ? 'opacity-80' : 'text-text-tertiary'}`}>
                  {inboxChip.count}
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
              <span className="font-caption text-caption opacity-75">â€¢ Instant customer sync active</span>
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex flex-col px-space-xs mt-space-2xs space-y-1">
          {visibleConversations.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-xl px-space-md">
              <Icon name="forum" className="text-[36px] text-outline-variant" />
              <p className="font-heading-sm text-heading-sm text-on-surface">No conversations yet</p>
              <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">
                Customer messages, order questions, and bookings will appear here once they are live.
              </p>
              <button
                type="button"
                onClick={onNewMessage}
                className="bg-primary text-on-primary px-space-md py-2.5 rounded-full font-label-sm text-label-sm font-semibold shadow-sm"
              >
                Start new message
              </button>
            </div>
          ) : (
            visibleConversations.map((row) => (
              <button
                className={`flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-canvas transition-transform cursor-pointer text-left w-full ${
                  row.unread ? 'shadow-sm active:scale-[0.99]' : 'hover:bg-surface-subtle'
                }`}
                key={row.id}
                type="button"
                onClick={() =>
                  onOpenConversation(row.thread, { name: row.name, avatar: row.img ?? '', isBusiness: row.isBusiness })
                }
              >
                <div className="relative shrink-0">
                  {row.img ? (
                    <img alt={row.alt ?? row.name} className="w-[50px] h-[50px] rounded-full object-cover shadow-inner" src={row.img} />
                  ) : (
                    <div className="w-[50px] h-[50px] rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-label-md font-semibold">
                      {row.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {row.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-badge-discount-text rounded-full ring-2 ring-surface-canvas" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-space-xs mb-1">
                    <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{row.name}</h2>
                    <span
                      className={`font-caption text-caption shrink-0 ${row.timePrimary ? 'text-primary font-semibold' : 'text-text-tertiary'}`}
                    >
                      {row.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption font-medium ${row.chipClass}`}
                    >
                      <Icon name={row.chipIcon} className="text-[12px]" />
                      {row.chipLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-space-xs">
                    <p
                      className={`font-body-md text-body-md truncate flex items-center gap-1 ${
                        row.messagePrimary ? 'text-text-primary font-medium' : 'text-text-secondary'
                      }`}
                    >
                      {row.showYouPrefix && <span className="text-text-secondary">You:</span>}
                      <span className="truncate">{row.message}</span>
                    </p>
                    {row.unread && (
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

      {/* New Message FAB */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex justify-end pointer-events-none">
        <button
          aria-label="New broadcast or customer chat"
          className="flex items-center gap-2 px-space-md py-3 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform pointer-events-auto"
          type="button"
          onClick={onNewMessage}
        >
          <Icon name="add_comment" className="text-[20px]" />
          <span className="font-button-primary text-button-primary">New Message</span>
        </button>
      </div>

      <BusinessTabBar active="messages" onTab={onTab} />
    </AppScreen>
  );
}
