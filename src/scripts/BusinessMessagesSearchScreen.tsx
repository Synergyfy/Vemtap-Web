import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import type { BusinessChatContact } from './messagesContact';

interface BusinessMessagesSearchScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onCancel: () => void;
  onOpenConversation: (thread: 'order' | 'general', contact: BusinessChatContact) => void;
}

type ResultChipKey = 'all' | 'orders' | 'customers' | 'deals';

const RESULT_CHIPS: { key: ResultChipKey; label: string; icon: string }[] = [
  { key: 'all', label: 'All results (0)', icon: 'all_inbox' },
  { key: 'orders', label: 'Orders (0)', icon: 'receipt_long' },
  { key: 'customers', label: 'Customers (0)', icon: 'person' },
  { key: 'deals', label: 'Deals (0)', icon: 'local_offer' },
];

interface SearchResultRow {
  id: string;
  img: string;
  alt: string;
  name: string;
  time: string;
  timePrimary?: boolean;
  online?: boolean;
  avatarBadge?: string;
  chipIcon: string;
  chipClass: string;
  orderRef: string;
  orderSuffix: string;
  messagePrefix: string;
  message: string;
  messageHighlight?: string;
  messageSuffix?: string;
  metaIcon: string;
  metaIconClass: string;
  metaLabel: string;
  metaItem: string;
  thread: 'order' | 'general';
}

const RESULTS: SearchResultRow[] = [];

export function BusinessMessagesSearchScreen({
  onTab,
  onCancel,
  onOpenConversation,
}: BusinessMessagesSearchScreenProps) {
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<ResultChipKey>('all');
  const hasResults = RESULTS.length > 0;

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
            <button
              aria-label="Search conversations"
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
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
      </header>

      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Search Surface */}
        <div className="px-margin pt-space-xs pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="relative flex-1 flex items-center">
              <Icon name="search" className="absolute left-space-sm text-text-secondary text-[20px] pointer-events-none" />
              <input
                aria-label="Search conversations"
                className="w-full h-[46px] pl-10 pr-9 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-canvas shadow-sm transition-all"
                placeholder="Search customers, orders, deals..."
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                aria-label="Clear search input"
                className="absolute right-space-xs w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                type="button"
                onClick={() => setQuery('')}
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
            <button
              className="h-[46px] px-space-xs flex items-center justify-center text-primary font-button-secondary text-button-secondary hover:opacity-80 active:scale-95 transition-all"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-space-2xs mt-space-sm overflow-x-auto no-scrollbar py-0.5">
            {RESULT_CHIPS.map((resultChip) => {
              const active = resultChip.key === chip;
              return (
                <button
                  className={`flex items-center gap-1.5 h-8 px-space-sm rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    active ? 'bg-surface-tint-blue text-primary shadow-sm' : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
                  }`}
                  key={resultChip.key}
                  type="button"
                  onClick={() => setChip(resultChip.key)}
                >
                  <Icon name={resultChip.icon} className="text-[16px]" />
                  <span>{resultChip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Meta Row */}
        <div className="px-margin pt-space-xs pb-space-2xs flex items-center justify-between">
          <p className="font-label-sm text-label-sm text-text-secondary">
            {query.trim() ? (
              <>
                Found <span className="font-semibold text-on-surface">0 conversations</span> matching{' '}
                <span className="text-primary font-semibold">"{query.trim()}"</span>
              </>
            ) : (
              <>
                No live conversations yet
              </>
            )}
          </p>
          <button
            className="text-text-tertiary hover:text-on-surface transition-colors flex items-center gap-1 font-caption text-caption"
            type="button"
            onClick={() => setQuery('')}
          >
            <Icon name="refresh" className="text-[14px]" />
            Reset
          </button>
        </div>

        {/* Results or Empty State */}
        {!hasResults ? (
          <div className="px-margin mt-space-xs">
            <div className="w-full bg-surface-container-low rounded-xl p-space-lg text-center relative overflow-hidden shadow-sm">
              <div className="w-16 h-16 mx-auto mb-space-sm rounded-full bg-surface-tint-blue flex items-center justify-center relative">
                <Icon name="manage_search" className="text-primary text-[32px]" />
              </div>
              <h4 className="font-heading-sm text-heading-sm text-on-surface mb-1">
                {query.trim() ? `No conversations found for “${query.trim()}”` : 'No live conversations yet'}
              </h4>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs mx-auto mb-space-md">
                {query.trim()
                  ? 'Try searching by customer name, order code, or deal reference that has actually been created.'
                  : 'Customer threads, booking questions, and deal chats will appear here once the backend syncs live customer activity.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-margin flex flex-col gap-space-sm mt-space-xs">
            {RESULTS.map((row) => (
              <button
                className="w-full bg-surface-canvas rounded-xl p-space-md shadow-sm active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden text-left"
                key={row.id}
                type="button"
                onClick={() => onOpenConversation(row.thread, { name: row.name, avatar: row.img })}
              >
                <div className="flex items-start gap-space-sm pl-1">
                  <div className="relative shrink-0">
                    <img alt={row.alt} className="w-12 h-12 rounded-full object-cover shadow-sm" src={row.img} />
                    {row.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-badge-discount-text ring-2 ring-surface-canvas" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs mb-1">
                      <h3 className="font-heading-sm text-heading-sm text-on-surface truncate">{row.name}</h3>
                      <span
                        className={`font-caption text-caption shrink-0 ${row.timePrimary ? 'text-primary font-medium' : 'text-text-tertiary'}`}
                      >
                        {row.time}
                      </span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md mb-1 ${row.chipClass}`}>
                      <Icon name={row.chipIcon} className="text-[14px]" />
                      <span className="font-caption text-caption font-semibold">
                        {row.orderRef}
                        {row.orderSuffix}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-text-secondary truncate mt-0.5">
                      <span className="font-medium text-on-surface">{row.messagePrefix}</span>{' '}
                      {row.message}
                      <mark className="bg-primary-fixed text-on-primary-fixed-variant font-medium px-1 rounded">
                        {row.messageHighlight}
                      </mark>
                      {row.messageSuffix}
                    </p>
                    <div className="flex items-center gap-space-xs mt-2 text-text-tertiary font-caption text-caption">
                      <span className="inline-flex items-center gap-1">
                        <Icon name={row.metaIcon} className={`text-[13px] ${row.metaIconClass}`} />
                        {row.metaLabel}
                      </span>
                      <span>•</span>
                      <span>{row.metaItem}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BusinessTabBar active="messages" onTab={onTab} />
    </AppScreen>
  );
}
