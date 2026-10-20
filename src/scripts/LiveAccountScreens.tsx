import type { ReactNode } from 'react';
import { BusinessSubScreen } from '../components/business/BusinessSubScreen';
import { AddOnsPanel, BusinessNotificationsPanel, SubscriptionPanel, SupportPanel } from '../components/business/AccountPanels';
import { DesktopBusinessPage } from './desktop/DesktopBusinessPage';

export type AccountPage = 'subscription' | 'addons' | 'notifications' | 'support';

const PAGES: Record<AccountPage, { nav: string; title: string; subtitle: string }> = {
  subscription: { nav: 'more-subscription', title: 'Subscription & billing', subtitle: 'Your plan, payment card and receipts.' },
  addons: { nav: 'more-addons', title: 'Add-ons & credits', subtitle: 'Messaging credits and extras for your plan.' },
  notifications: { nav: 'more-notifications', title: 'Notifications', subtitle: 'What happened at your business, and how we tell you.' },
  support: { nav: 'more-support', title: 'Help & support', subtitle: 'Search answers or ask the Vemtap team.' },
};

function Body({ page, onOpenLink }: { page: AccountPage; onOpenLink?: (actionUrl: string) => void }): ReactNode {
  switch (page) {
    case 'subscription':
      return <SubscriptionPanel />;
    case 'addons':
      return <AddOnsPanel />;
    case 'notifications':
      return <BusinessNotificationsPanel onOpenLink={onOpenLink} />;
    case 'support':
      return <SupportPanel />;
  }
}

/** Live account page (subscription, add-ons, notifications or support) — mobile. */
export function LiveAccountScreen({ page, onBack, onOpenLink }: { page: AccountPage; onBack: () => void; onOpenLink?: (actionUrl: string) => void }) {
  return (
    <BusinessSubScreen title={PAGES[page].title} onBack={onBack}>
      <Body page={page} onOpenLink={onOpenLink} />
    </BusinessSubScreen>
  );
}

/** Live account page — desktop. */
export function DesktopLiveAccountScreen({ page, onNav, onOpenLink }: { page: AccountPage; onNav: (key: string) => void; onOpenLink?: (actionUrl: string) => void }) {
  const meta = PAGES[page];
  return (
    <DesktopBusinessPage activeNav={meta.nav} onNav={onNav} crumbs={[{ label: meta.title }]} title={meta.title} subtitle={meta.subtitle}>
      <Body page={page} onOpenLink={onOpenLink} />
    </DesktopBusinessPage>
  );
}
