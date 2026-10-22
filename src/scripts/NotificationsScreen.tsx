import { useEffect, useState, type ReactNode } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { notificationService, type NotificationItem } from '../services/notificationService';

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenPass: () => void;
  onOpenBooking: () => void;
  onOpenGift: () => void;
  onOpenRewards: () => void;
  onBrowseDeals: () => void;
  onOpenPreferences: () => void;
}

type NotificationCategory = 'deals' | 'bookings' | 'rewards' | 'system';
type SectionKey = 'today' | 'earlier';
type ItemAction = 'pass' | 'booking' | 'gift' | 'rewards' | 'deals' | 'preferences';

interface FeedItem {
  id: string;
  category: NotificationCategory;
  section: SectionKey;
  icon: string;
  iconClass: string;
  badge?: { icon: string; className: string; ping?: boolean };
  title: string;
  time: string;
  body: ReactNode;
  note?: ReactNode;
  unread: boolean;
  action: ItemAction;
}

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'earlier', label: 'Earlier This Week' },
];

const FILTERS: Array<{ key: NotificationCategory | 'all'; label: string; icon: string; iconClass: string }> = [
  { key: 'all', label: 'All', icon: '', iconClass: '' },
  { key: 'deals', label: 'Deals & Claims', icon: 'local_fire_department', iconClass: 'text-tertiary' },
  { key: 'bookings', label: 'Orders & Bookings', icon: 'calendar_month', iconClass: 'text-primary' },
  { key: 'rewards', label: 'Rewards', icon: 'military_tech', iconClass: 'text-badge-discount-text' },
  { key: 'system', label: 'System', icon: 'campaign', iconClass: 'text-secondary' },
];

export function NotificationsScreen({
  onBack,
  onOpenPass,
  onOpenBooking,
  onOpenGift,
  onOpenRewards,
  onBrowseDeals,
  onOpenPreferences,
}: NotificationsScreenProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadNotifications = async () => {
      try {
        const response = await notificationService.list();
        if (ignore) return;

        const nextItems: FeedItem[] = response.map((item: NotificationItem) => ({
          id: String(item.id),
          category: (item.category ?? 'system') as NotificationCategory,
          section: item.unread ? 'today' : 'earlier',
          icon: item.type === 'reward' ? 'stars' : item.type === 'booking' ? 'calendar_month' : 'campaign',
          iconClass:
            item.type === 'reward' ? 'bg-badge-discount-bg text-badge-discount-text'
            : item.type === 'booking' ? 'bg-primary-fixed text-primary'
            : 'bg-surface-container-highest text-secondary',
          title: item.title,
          time: item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
          body: item.message,
          unread: Boolean(item.unread),
          action: item.type === 'reward' ? 'rewards' : item.type === 'booking' ? 'booking' : 'deals',
        }));

        setItems(nextItems);
      } catch (error) {
        console.warn('Unable to load notifications:', error);
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadNotifications();
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const visible = items.filter((item) => filter === 'all' || item.category === filter);
  const unreadCount = items.filter((item) => item.unread).length;
  const unreadFor = (key: NotificationCategory | 'all') =>
    key === 'all'
      ? unreadCount
      : items.filter((item) => item.category === key && item.unread).length;

  const openItem = (item: FeedItem) => {
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, unread: false } : entry)));
    void notificationService.markAsRead(item.id).catch(() => undefined);
    if (item.action === 'pass') onOpenPass();
    else if (item.action === 'booking') onOpenBooking();
    else if (item.action === 'gift') onOpenGift();
    else if (item.action === 'rewards') onOpenRewards();
    else if (item.action === 'deals') onBrowseDeals();
    else if (item.action === 'preferences') onOpenPreferences();
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    void notificationService.markAllRead().catch(() => undefined);
    showToast('All notifications marked as read');
  };

  const pillClass = (active: boolean) =>
    active
      ? 'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm transition-all duration-200 active:scale-95'
      : 'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-all duration-200 active:scale-95';

  const countClass = (active: boolean) =>
    `px-1.5 py-0.2 rounded-full font-caption text-caption ${
      active ? 'bg-white/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
    }`;

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs flex-1 min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate pr-space-xs">
              Notification Preferences
            </h1>
          </div>
          <div className="flex items-center gap-space-xs pr-space-xs">
            <button
              aria-label="More options"
              type="button"
              onClick={onOpenPreferences}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pb-10 pt-space-md gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span className="font-heading-md text-heading-md text-on-surface">Inbox</span>
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm shadow-sm transition-all duration-300 ${
                unreadCount > 0
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-highest text-text-secondary'
              }`}
            >
              {unreadCount} new
            </span>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="active:scale-95 transition-all font-button-secondary text-button-secondary py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-primary disabled:text-text-tertiary disabled:cursor-default"
          >
            {unreadCount > 0 ? (
              <>
                <Icon name="done_all" className="text-[17px]" />
                <span>Mark all as read</span>
              </>
            ) : (
              <>
                <Icon name="check" className="text-[17px] text-badge-discount-text" filled />
                <span>All caught up</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 -mx-margin px-margin no-scrollbar">
          {FILTERS.map((item) => {
            const active = filter === item.key;
            const count = unreadFor(item.key);
            return (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={pillClass(active)}>
                {item.icon && <Icon name={item.icon} className={`text-[16px] ${item.iconClass}`} />}
                <span>{item.label}</span>
                {count > 0 && <span className={countClass(active)}>{count}</span>}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-3">
              <Icon name="notifications_active" className="text-[32px]" />
            </div>
            <h3 className="font-heading-sm text-heading-sm text-on-surface mb-1">Loading your inbox…</h3>
            <p className="font-body-md text-body-md text-text-secondary max-w-xs">
              Fetching the latest deals, bookings, and account updates.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-3">
              <Icon name="notifications_paused" className="text-[32px]" />
            </div>
            <h3 className="font-heading-sm text-heading-sm text-on-surface mb-1">All caught up here!</h3>
            <p className="font-body-md text-body-md text-text-secondary max-w-xs">
              No notifications found in this category. We will alert you whenever new deals or updates drop.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {SECTIONS.map((section) => {
              const sectionItems = visible.filter((item) => item.section === section.key);
              if (sectionItems.length === 0) return null;
              return (
                <div key={section.key} className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary">
                      {section.label}
                    </span>
                    <span className="font-caption text-caption text-text-tertiary">
                      {sectionItems.length} update{sectionItems.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') openItem(item);
                      }}
                      className={`relative flex flex-col gap-3 p-3.5 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                        item.unread ? 'bg-surface-canvas' : 'bg-surface-subtle opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm relative ${item.iconClass}`}
                        >
                          <Icon name={item.icon} className="text-[24px]" />
                          {item.badge &&
                            (item.badge.ping ? (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                              </span>
                            ) : (
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${item.badge.className}`}
                              >
                                <Icon name={item.badge.icon} className="text-[10px] text-on-tertiary" />
                              </span>
                            ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {item.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                              <h2 className="font-heading-sm text-heading-sm text-on-surface truncate">{item.title}</h2>
                            </div>
                            <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">
                              {item.time}
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-text-secondary leading-relaxed mt-1">
                            {item.body}
                          </p>
                        </div>
                      </div>
                      {item.note}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onOpenPreferences}
            className="w-full py-3.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Icon name="tune" className="text-[20px] text-secondary" />
              <span className="font-label-md text-label-md">Manage notification preferences</span>
            </div>
            <Icon name="chevron_right" className="text-[18px] text-text-tertiary" />
          </button>
          <p className="font-caption text-caption text-text-tertiary text-center">
            VEMTAP alerts are tailored to your nearby saved areas and claims.
          </p>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
