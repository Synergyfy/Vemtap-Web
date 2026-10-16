import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessNotificationsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
}

type NotificationCategory = 'orders' | 'bookings' | 'payouts' | 'system';
type FilterKey = NotificationCategory | 'all';

interface BusinessFeedItem {
  id: string;
  category: NotificationCategory;
  section: 'today' | 'earlier';
  icon: string;
  iconClass: string;
  title: string;
  time: string;
  body: string;
  unread: boolean;
}

const FEED: BusinessFeedItem[] = [
  {
    id: 'bn1',
    category: 'orders',
    section: 'today',
    icon: 'receipt_long',
    iconClass: 'bg-primary-container text-on-primary',
    title: 'New order #4821 · ₦7,350',
    time: '2m ago',
    body: 'Pickup at Wuse II · 2 items paid in full. Ready in 12 minutes.',
    unread: true,
  },
  {
    id: 'bn2',
    category: 'bookings',
    section: 'today',
    icon: 'calendar_month',
    iconClass: 'bg-tertiary-container text-on-tertiary',
    title: 'Booking confirmed for 7:00 PM',
    time: '18m ago',
    body: 'Chidinma O. reserved a table for 4 guests. Confirmation SMS sent.',
    unread: true,
  },
  {
    id: 'bn3',
    category: 'payouts',
    section: 'today',
    icon: 'account_balance',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Payout settled · ₦182,400',
    time: '1h ago',
    body: 'GTB ••4471 · yesterday’s takings cleared to your settlement account.',
    unread: true,
  },
  {
    id: 'bn4',
    category: 'system',
    section: 'today',
    icon: 'verified_user',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    title: 'NDPR data export is ready',
    time: '4h ago',
    body: 'Your requested merchant data archive can be downloaded for 7 days.',
    unread: false,
  },
  {
    id: 'bn5',
    category: 'orders',
    section: 'earlier',
    icon: 'receipt_long',
    iconClass: 'bg-error-container text-error',
    title: 'Order #4798 refunded',
    time: 'Yesterday',
    body: '₦4,200 refunded to customer · item unavailable at the till.',
    unread: false,
  },
  {
    id: 'bn6',
    category: 'system',
    section: 'earlier',
    icon: 'devices',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    title: 'New sign-in from Chrome · Abuja',
    time: 'Yesterday',
    body: 'Your business account was accessed on a Windows device at 09:12 WAT.',
    unread: false,
  },
  {
    id: 'bn7',
    category: 'payouts',
    section: 'earlier',
    icon: 'payments',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Settlement schedule updated',
    time: '2 days ago',
    body: 'Payouts now land T+1 by 10:00 WAT on business days.',
    unread: false,
  },
  {
    id: 'bn8',
    category: 'bookings',
    section: 'earlier',
    icon: 'group',
    iconClass: 'bg-tertiary-container text-on-tertiary',
    title: 'Booking cancelled by customer',
    time: '3 days ago',
    body: 'Reservation #B-118 for Friday 6:30 PM was cancelled — no charge applied.',
    unread: false,
  },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'system', label: 'Account & System' },
];

/**
 * Dashboard Notifications — reached from More → Notifications (and the header
 * bell pop-up). Account-holder merchant feed rendered inside the business
 * portal chrome; the consumer route 'notifications' keeps its own chrome.
 */
export function DesktopBusinessNotificationsScreen({ onNav }: DesktopBusinessNotificationsScreenProps) {
  const [items, setItems] = useState<BusinessFeedItem[]>(FEED);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [toast, setToast] = useState<string | null>(null);

  const visible = items.filter((item) => filter === 'all' || item.category === filter);
  const unreadCount = items.filter((item) => item.unread).length;
  const today = visible.filter((item) => item.section === 'today');
  const earlier = visible.filter((item) => item.section === 'earlier');

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const markRead = (id: string) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    showToast('All notifications marked as read');
  };

  const renderItem = (item: BusinessFeedItem) => (
    <button
      key={item.id}
      type="button"
      onClick={() => markRead(item.id)}
      className={`w-full flex items-start gap-space-sm p-space-md text-left rounded-xl transition-colors ${
        item.unread ? 'bg-surface-tint-blue/60 hover:bg-surface-tint-blue' : 'hover:bg-surface-subtle'
      }`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconClass}`}>
        <Icon name={item.icon} className="text-[20px]" />
      </span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="flex items-center justify-between gap-space-sm">
          <span className="flex items-center gap-space-2xs min-w-0">
            {item.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{item.title}</span>
          </span>
          <span className="font-caption text-caption text-text-tertiary whitespace-nowrap">{item.time}</span>
        </span>
        <span className="font-body-md text-body-md text-text-secondary leading-relaxed mt-0.5">{item.body}</span>
      </span>
    </button>
  );

  return (
    <BusinessPortalChrome activeNav="more-notifications" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-space-2xs max-w-3xl">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              More · Account
            </span>
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Notifications</h1>
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              Orders, bookings, payouts and account alerts for your business — everything that needs your attention in
              one feed.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            {unreadCount > 0 && (
              <span className="px-space-sm py-2 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
                {unreadCount} unread
              </span>
            )}
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="h-11 px-space-md rounded-xl bg-surface-canvas border border-border-subtle text-on-surface font-button-secondary text-button-secondary flex items-center gap-space-2xs shadow-sm hover:bg-surface-subtle disabled:opacity-50 transition-colors"
            >
              <Icon name="done_all" className="text-[18px]" />
              <span>Mark all read</span>
            </button>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-space-sm">
          {FILTERS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setFilter(entry.key)}
              className={`px-space-md py-2 rounded-full font-label-sm text-label-sm font-semibold transition-colors ${
                filter === entry.key
                  ? 'bg-primary text-on-primary shadow-sm'

                  : 'bg-surface-canvas text-text-secondary border border-border-subtle hover:text-on-surface'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-start">
          <div className="lg:col-span-2 flex flex-col gap-space-lg">
            {visible.length === 0 ? (
              <div className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle p-space-xl flex flex-col items-center gap-space-sm text-center">
                <span className="w-12 h-12 rounded-full bg-surface-subtle text-text-tertiary flex items-center justify-center">
                  <Icon name="notifications_off" className="text-[24px]" />
                </span>
                <p className="font-label-md text-label-md text-on-surface font-semibold">Nothing here yet</p>
                <p className="font-body-md text-body-md text-text-secondary">
                  No notifications in this category. New alerts will appear here as they happen.
                </p>
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-sm">
                    <h2 className="font-label-md text-label-md text-text-secondary font-semibold px-space-sm py-space-2xs">
                      Today
                    </h2>
                    <div className="flex flex-col gap-space-2xs">{today.map(renderItem)}</div>
                  </section>
                )}
                {earlier.length > 0 && (
                  <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-sm">
                    <h2 className="font-label-md text-label-md text-text-secondary font-semibold px-space-sm py-space-2xs">
                      Earlier
                    </h2>
                    <div className="flex flex-col gap-space-2xs">{earlier.map(renderItem)}</div>
                  </section>
                )}
              </>
            )}
          </div>

          <aside className="w-full flex flex-col gap-space-lg lg:sticky lg:top-24">
            <button
              type="button"
              onClick={() => onNav('more-settings')}
              className="w-full py-3.5 px-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-tint-blue text-on-surface-variant hover:text-on-surface flex items-center justify-between shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-space-sm">
                <Icon name="tune" className="text-[20px] text-text-secondary" />
                <span className="font-label-md text-label-md">Notification preferences</span>
              </div>
              <Icon name="chevron_right" className="text-[18px] text-text-tertiary" />
            </button>

            <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
              <Icon name="notifications_active" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Alerts are scoped to the branch selected in your header. Switch branch to see notifications for another
                location.
              </p>
            </div>

            <div className="p-space-md rounded-xl bg-surface-tint-blue flex items-start gap-space-sm">
              <Icon name="verified_user" className="text-primary text-[20px] shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-text-secondary leading-relaxed">
                Security alerts (new sign-ins, PIN changes, data exports) are always sent and cannot be muted.
              </p>
            </div>
          </aside>
        </div>
      </div>



      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-margin">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-space-2xs">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" filled />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
