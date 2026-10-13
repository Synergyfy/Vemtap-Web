import { useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { MOBILE_THREADS, type MessageFilter, type MobileThread } from './messagesData';

interface MessagesScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onOpen: (threadId: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'deals', label: 'Deals & Inquiries' },
  { key: 'bookings', label: 'Bookings & Orders' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function matchesFilter(thread: MobileThread, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return thread.unread;
  return thread.filters.includes(filter as MessageFilter);
}

export function MessagesScreen({ onTab, onOpen }: MessagesScreenProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  const trimmed = query.trim().toLowerCase();
  const visible = MOBILE_THREADS.filter((thread) => {
    if (!matchesFilter(thread, filter)) return false;
    if (trimmed) {
      const haystack = `${thread.name} ${thread.tag} ${thread.preview}`.toLowerCase();
      if (!haystack.includes(trimmed)) return false;
    }
    return true;
  });

  const unreadCount = MOBILE_THREADS.filter((thread) => thread.unread).length;
  const countFor = (key: FilterKey) => MOBILE_THREADS.filter((thread) => matchesFilter(thread, key)).length;

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
    searchRef.current?.focus();
  };

  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight">Messages</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold">
              {unreadCount} new
            </span>
          </div>
          <button
            aria-label="New message"
            type="button"
            onClick={() => showToast('Start a chat from any business profile.')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container transition-colors active:scale-95"
          >
            <Icon name="edit_square" className="text-[22px]" />
          </button>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface min-h-screen">
        <div className="px-margin pt-space-xs mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="relative flex-1 flex items-center">
              <Icon
                name="search"
                className="absolute left-space-md text-text-tertiary text-[20px] pointer-events-none"
              />
              <input
                ref={searchRef}
                className="w-full h-12 pl-11 pr-11 bg-surface-container-lowest text-text-primary placeholder:text-text-tertiary font-body-md text-body-md rounded-xl shadow-sm focus:outline-none focus:bg-surface-canvas transition-all"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations, orders, vouchers..."
                type="text"
                value={query}
              />
              {query && (
                <button
                  aria-label="Clear search"
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full text-text-tertiary hover:text-text-primary"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              )}
            </div>
            <button
              aria-label="Reset filters"
              type="button"
              onClick={resetFilters}
              className="w-12 h-12 rounded-xl bg-surface-container-lowest text-text-secondary hover:text-text-primary shadow-sm flex items-center justify-center transition-colors active:scale-95"
            >
              <Icon name="tune" className="text-[22px]" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar mb-space-md pl-margin">
          <div className="flex items-center gap-space-xs pr-margin">
            {FILTERS.map((item) => {
              const selected = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-md text-label-md transition-transform active:scale-95 whitespace-nowrap ${
                    selected
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container-high text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none ${
                      selected
                        ? 'bg-on-primary-container/20 text-on-primary-container font-bold'
                        : 'bg-surface-variant text-text-secondary font-semibold'
                    }`}
                  >
                    {countFor(item.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-margin flex flex-col gap-space-xs">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-xl">
              <Icon name="forum" className="text-[36px] text-outline-variant" />
              <p className="font-label-md text-label-md text-text-secondary">No conversations match your filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="text-primary font-label-sm text-label-sm font-semibold hover:underline"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            visible.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onOpen(thread.id)}
                className="w-full text-left bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex gap-space-sm items-start hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                <div className="relative shrink-0">
                  {thread.avatar ? (
                    <img
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                      alt={thread.alt ?? thread.name}
                      src={thread.avatar}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-bold shadow-sm">
                      {thread.initials}
                    </div>
                  )}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-badge-discount-text rounded-full ring-2 ring-surface-container-lowest"
                    title={thread.status}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {thread.name}
                      </span>
                      {thread.verified && <Icon name="verified" filled className="text-primary text-[15px] shrink-0" />}
                    </div>
                    <span className={`font-caption text-caption shrink-0 ${thread.unread ? 'text-primary font-semibold' : 'text-text-tertiary'}`}>
                      {thread.time}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded font-caption text-caption tracking-tight ${thread.tagClass}`}
                  >
                    <Icon name={thread.tagIcon} className="text-[12px]" />
                    <span className="truncate">{thread.tag}</span>
                  </span>
                  <p className="font-body-md text-body-md text-text-secondary truncate leading-snug mt-0.5">
                    {thread.preview}
                  </p>
                </div>
                {thread.unread && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />}
              </button>
            ))
          )}
        </div>

        <div className="px-margin mt-space-md mb-space-md">
          <div className="flex items-start gap-space-xs bg-surface-subtle rounded-xl p-space-sm">
            <Icon name="verified_user" filled className="text-primary text-[18px] flex-shrink-0 mt-0.5" />
            <p className="font-caption text-caption text-text-secondary leading-relaxed">
              VEMTAP In-App Chat is encrypted and protected under NDPR standards. Conversations stay directly between
              you and the merchant.
            </p>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-md text-label-md shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
