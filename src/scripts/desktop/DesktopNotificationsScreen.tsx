import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { notificationService, type NotificationItem } from '../../services/notificationService';

interface DesktopNotificationsScreenProps {
  onNav: (key: DesktopNavKey) => void;
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

export function DesktopNotificationsScreen({
  onNav,
  onBack,
  onOpenPass,
  onOpenBooking,
  onOpenGift,
  onOpenRewards,
  onBrowseDeals,
  onOpenPreferences,
}: DesktopNotificationsScreenProps) {
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

        const mapped: FeedItem[] = response.map((item: NotificationItem) => ({
          id: String(item.id),
          category: (item.category ?? 'system') as NotificationCategory,
          section: item.unread ? 'today' : 'earlier',
          icon: item.type === 'reward' ? 'stars' : item.type === 'booking' ? 'calendar_month' : 'campaign',
          iconClass:
            item.type === 'reward'
              ? 'bg-badge-discount-bg text-badge-discount-text'
              : item.type === 'booking'
                ? 'bg-primary-fixed text-primary'
                : 'bg-surface-container-highest text-secondary',
          title: item.title,
          time: item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
          body: item.message || item.body || 'You have a new update.',
          unread: Boolean(item.unread),
          action: item.type === 'reward' ? 'rewards' : item.type === 'booking' ? 'booking' : 'deals',
        }));

        setItems(mapped);
      } catch (error) {
        console.warn('Unable to load notifications inbox:', error);
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadNotifications();
    return () => { ignore = true; };
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
    `flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 active:scale-95 ${
      active
        ? 'bg-primary text-on-primary shadow-sm'
        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
    }`;

  const countClass = (active: boolean) =>
    `px-1.5 py-0.2 rounded-full font-caption text-caption ${
      active ? 'bg-surface-canvas/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
    }`;

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex flex-wrap items-center gap-2 mb-6 font-label-sm text-label-sm text-text-tertiary">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text-primary font-semibold">Notification Preferences</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Notification Preferences
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary mt-2">
                Your inbox for deal claims, bookings, gifts, and reward drops — tailored to the nearby saved areas and
                claims on your Apo hyper-local grid.
              </p>
            </div>
            <button
              aria-label="More options"
              type="button"
              onClick={onOpenPreferences}
              className="self-start md:self-auto shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-text-secondary hover:text-primary hover:bg-surface-tint-blue shadow-sm transition-colors"
            >
              <Icon name="more_vert" className="text-[22px]" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-4">
            <div className="flex items-center gap-space-2xs">
              <span className="font-heading-md text-heading-md text-text-primary">Inbox</span>
              <span
                className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm shadow-sm transition-all duration-300 ${
                  unreadCount > 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-text-secondary'
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

          <div className="flex items-center gap-2 flex-wrap py-1 mb-6">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              const count = unreadFor(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={pillClass(active)}
                >
                  {item.icon && <Icon name={item.icon} className={`text-[16px] ${item.iconClass}`} />}
                  <span>{item.label}</span>
                  {count > 0 && <span className={countClass(active)}>{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-lowest rounded-xl shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-3">
                    <Icon name="notifications_active" className="text-[32px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary mb-1">Loading your inbox…</h3>
                  <p className="font-body-md text-body-md text-text-secondary max-w-xs">
                    Fetching the latest deals, bookings, and account updates.
                  </p>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-lowest rounded-xl shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary mb-3">
                    <Icon name="notifications_paused" className="text-[32px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-text-primary mb-1">All caught up here!</h3>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionItems.map((item) => (
                            <div
                              key={item.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => openItem(item)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') openItem(item);
                              }}
                              className={`relative flex flex-col gap-3 p-4 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                                item.unread ? 'bg-surface-container-lowest' : 'bg-surface-subtle opacity-90'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm relative ${item.iconClass}`}
                                >
                                  <Icon name={item.icon} className="text-[24px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {item.unread && (
                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                      )}
                                      <h2 className="font-heading-sm text-heading-sm text-text-primary truncate">
                                        {item.title}
                                      </h2>
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
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="w-full flex flex-col gap-4 lg:sticky lg:top-24">
              <button
                type="button"
                onClick={onOpenPreferences}
                className="w-full py-3.5 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-tint-blue text-on-surface-variant hover:text-text-primary flex items-center justify-between shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="tune" className="text-[20px] text-text-secondary" />
                  <span className="font-label-md text-label-md">Manage notification preferences</span>
                </div>
                <Icon name="chevron_right" className="text-[18px] text-text-tertiary" />
              </button>

              <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
                <Icon name="notifications_active" className="text-primary text-[20px] shrink-0 mt-0.5" />
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  VEMTAP alerts are tailored to your nearby saved areas and claims.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
            <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </DesktopPage>
  );
}
