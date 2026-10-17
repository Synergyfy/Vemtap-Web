export interface NotificationFeedItem {
  id: string;
  icon: string;
  iconClass: string;
  title: string;
  time: string;
  body: string;
}

/**
 * Recent merchant alerts surfaced in the header bell pop-up on desktop and in
 * the mobile/tablet dashboard bell. The first `notificationCount` entries start
 * unread so the badge matches the header.
 */
export const NOTIFICATION_FEED: NotificationFeedItem[] = [
  {
    id: 'n1',
    icon: 'receipt_long',
    iconClass: 'bg-primary-container text-on-primary',
    title: 'New order #4821 · ₦7,350',
    time: '2m ago',
    body: 'Pickup at Wuse II · 2 items paid in full',
  },
  {
    id: 'n2',
    icon: 'calendar_month',
    iconClass: 'bg-tertiary-container text-on-tertiary',
    title: 'Booking confirmed for 7:00 PM',
    time: '18m ago',
    body: 'Chidinma O. reserved a table for 4 guests',
  },
  {
    id: 'n3',
    icon: 'account_balance',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Payout settled · ₦182,400',
    time: '1h ago',
    body: 'GTB ••4471 · yesterday’s takings cleared',
  },
  {
    id: 'n4',
    icon: 'forum',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    title: 'New customer message',
    time: '3h ago',
    body: 'Is the Jollof + chicken lunch deal still on?',
  },
];
