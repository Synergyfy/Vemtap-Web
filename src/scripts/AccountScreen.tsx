import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { MobileTabBar, type MobileTabKey } from '../components/MobileTabBar';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../components/AccountRows';

export type { AccountTarget };

interface AccountScreenProps {
  onTab: (tab: MobileTabKey) => void;
  onNavigate: (target: AccountTarget) => void;
  onSignOut: () => void;
}

const ACTIVITY_ROWS: AccountRow[] = [
  {
    icon: 'dashboard',
    iconClass: 'bg-surface-container-high text-primary-container',
    label: 'Customer Dashboard',
    target: 'dashboard',
  },
  {
    icon: 'local_offer',
    iconClass: 'bg-surface-tint-blue text-primary-container',
    label: 'My Deals',
    badge: { text: '3 Active', className: 'bg-badge-discount-bg text-badge-discount-text' },
    target: 'my-deals',
  },
  {
    icon: 'chat',
    iconClass: 'bg-surface-container-high text-primary-container',
    label: 'Messages',
    badge: { text: '2 New', className: 'bg-primary text-on-primary' },
    target: 'messages',
  },
  {
    icon: 'receipt_long',
    iconClass: 'bg-surface-container-high text-secondary',
    label: 'Orders & Bookings',
    badge: { text: '1 Pending', className: 'bg-secondary-fixed text-on-secondary-fixed' },
    target: 'orders',
  },
  {
    icon: 'savings',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    label: 'Savings & Rewards',
    trail: '₦18,500',
    target: 'savings',
  },
  {
    icon: 'bookmark',
    iconClass: 'bg-surface-container-high text-primary',
    label: 'Saved Items & Wishlist',
    trail: '12 items',
    target: 'saved',
  },
];

const UTILITY_ROWS: AccountRow[] = [
  {
    icon: 'settings',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Settings',
    sub: 'Notifications, privacy & app preferences',
    target: 'settings',
  },
  {
    icon: 'contact_support',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Support & Legal',
    sub: 'Help centre, contact & policies',
    target: 'support-legal',
  },
];

export function AccountScreen({ onTab, onNavigate, onSignOut }: AccountScreenProps) {
  return (
    <AppScreen>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="text-primary-container font-heading-md text-heading-md font-bold tracking-tight">
              VEMTAP
            </span>
            <span className="text-outline-variant font-body-md text-body-md">/</span>
            <h1 className="font-heading-md text-heading-md text-on-surface truncate">Account</h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button
              aria-label="Notifications"
              type="button"
              onClick={() => onNavigate('notifications')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="notifications" className="text-[24px]" />
            </button>
            <button
              aria-label="Help"
              type="button"
              onClick={() => onNavigate('support-legal')}
              className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name="help_outline" className="text-[24px]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-2xs">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin space-y-space-md pb-space-2xl">
          <section className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-heading-sm text-heading-sm font-bold shadow-inner">
                    ZA
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-4 h-4 bg-badge-discount-text rounded-full flex items-center justify-center text-surface shadow"
                    title="Verified Customer"
                  >
                    <Icon name="check" className="text-[11px]" filled />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-2xs">
                    <h2 className="font-heading-md text-heading-md text-on-surface truncate">Zainab Ahmed</h2>
                    <Icon name="verified" className="text-primary-container text-[18px]" filled />
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary truncate">+234 803 555 0192</p>
                  <p className="font-caption text-caption text-text-tertiary truncate">zainab.ahmed@example.com</p>
                </div>
              </div>
              <button
                aria-label="Edit Profile"
                type="button"
                onClick={() => onNavigate('edit-profile')}
                className="flex items-center gap-1 px-space-xs py-1 rounded-full bg-surface-container-low text-primary hover:bg-surface-container transition-colors active:scale-95 shrink-0"
              >
                <span className="font-label-sm text-label-sm font-semibold">Edit</span>
                <Icon name="edit" className="text-[15px]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-space-xs mt-space-md pt-space-xs">
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <Icon name="wallet" className="text-[16px]" />
                </div>
                <div className="min-w-0">
                  <span className="font-caption text-caption text-text-secondary block">Total Saved</span>
                  <span className="font-label-md text-label-md font-bold text-badge-discount-text">₦18,500</span>
                </div>
              </div>
              <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                <div className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="confirmation_number" className="text-[16px]" />
                </div>
                <div className="min-w-0">
                  <span className="font-caption text-caption text-text-secondary block">Active Deals</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">3 Live</span>
                </div>
              </div>
            </div>
          </section>

          <RowGroup title="Activity & Deals">
            {ACTIVITY_ROWS.map((row) => (
              <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
            ))}
          </RowGroup>

          <RowGroup title="Settings & Support">
            {UTILITY_ROWS.map((row) => (
              <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
            ))}
          </RowGroup>

          <section className="pt-space-xs">
            <div className="p-space-md rounded-xl bg-surface-subtle flex flex-col items-center text-center">
              <div className="flex items-center gap-space-2xs text-text-secondary">
                <Icon name="storefront" className="text-[18px]" />
                <span className="font-label-md text-label-md">Own a business in Nigeria?</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('business-onboarding')}
                className="mt-space-2xs text-primary-container font-label-md text-label-md font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Set up your business on VEMTAP
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </div>
          </section>

          <section className="flex flex-col items-center pt-space-xs space-y-space-md">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full h-[52px] rounded-xl bg-surface-container-low hover:bg-error-container/20 text-error font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-colors active:scale-[0.98]"
            >
              <Icon name="logout" className="text-[20px]" />
              Sign Out
            </button>
            <p className="font-caption text-caption text-text-tertiary text-center">
              VEMTAP Consumer v2.4.0 • Made with pride in Abuja
            </p>
          </section>
        </div>
      </main>

      <MobileTabBar active="account" onTab={onTab} />
    </AppScreen>
  );
}
