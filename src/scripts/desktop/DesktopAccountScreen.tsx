import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../../components/AccountRows';
import { useProfile } from '../../context/ProfileContext';
import { hasApiConfig } from '../../services/api/client';

interface DesktopAccountScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
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
  {
    icon: 'group_add',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    label: 'Referrals & Rewards',
    sub: 'Invite businesses & friends to VEMTAP',
    target: 'referrals',
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

export function DesktopAccountScreen({ onNav, onBack, onNavigate, onSignOut }: DesktopAccountScreenProps) {
  const { fullName, email, initials, phone } = useProfile();
  // Live: no sample counts or totals until real figures are wired; demo keeps them.
  const live = hasApiConfig();
  const activityRows = live ? ACTIVITY_ROWS.map(({ badge: _badge, trail: _trail, ...row }) => row) : ACTIVITY_ROWS;

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
            <span className="text-text-primary font-semibold">Account Overview</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-3xl">
              <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                Account Overview
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary mt-2">
                Manage your profile, deals, messages, orders, savings, and support in one place across the Apo
                hyper-local grid.
              </p>
            </div>
            <div className="flex items-center gap-space-xs self-start md:self-auto shrink-0">
              <button
                aria-label="Notifications"
                type="button"
                onClick={() => onNavigate('notifications')}
                className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-lowest text-text-secondary hover:text-primary hover:bg-surface-tint-blue font-label-sm text-label-sm shadow-sm transition-colors"
              >
                <Icon name="notifications" className="text-[18px]" />
                <span>Notifications</span>
              </button>
              <button
                aria-label="Help"
                type="button"
                onClick={() => onNavigate('support-legal')}
                className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-lowest text-text-secondary hover:text-primary hover:bg-surface-tint-blue font-label-sm text-label-sm shadow-sm transition-colors"
              >
                <Icon name="help_outline" className="text-[18px]" />
                <span>Help</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <section className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />

                <div className="flex items-start justify-between gap-2 relative">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-heading-sm text-heading-sm font-bold shadow-inner">
                        {initials || 'U'}
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
                        <h2 className="font-heading-md text-heading-md text-text-primary truncate">{fullName || 'User'}</h2>
                        <Icon name="verified" className="text-primary-container text-[18px]" filled />
                      </div>
                      <p className="font-body-md text-body-md text-text-secondary truncate">{phone || 'No phone number'}</p>
                      <p className="font-caption text-caption text-text-tertiary truncate">{email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <button
                  aria-label="Edit Profile"
                  type="button"
                  onClick={() => onNavigate('edit-profile')}
                  className="mt-space-sm inline-flex items-center gap-1 px-space-sm py-space-2xs rounded-full bg-surface-container-low text-primary hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-colors active:scale-95"
                >
                  <span>Edit Profile</span>
                  <Icon name="edit" className="text-[15px]" />
                </button>

                <div className="grid grid-cols-2 gap-space-xs mt-space-md pt-space-xs border-t border-border-subtle">
                  <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                    <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                      <Icon name="wallet" className="text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-caption text-caption text-text-secondary block">Total Saved</span>
                      <span className="font-label-md text-label-md font-bold text-badge-discount-text">{live ? '—' : '₦18,500'}</span>
                    </div>
                  </div>
                  <div className="bg-surface-subtle p-space-xs rounded-lg flex items-center gap-space-xs">
                    <div className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary-container shrink-0">
                      <Icon name="confirmation_number" className="text-[16px]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-caption text-caption text-text-secondary block">Active Deals</span>
                      <span className="font-label-md text-label-md font-bold text-text-primary">{live ? '—' : '3 Live'}</span>
                    </div>
                  </div>
                </div>
              </section>
            </aside>

            <div className="w-full flex flex-col gap-6">
              <RowGroup title="Activity & Deals">
                {activityRows.map((row) => (
                  <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
                ))}
              </RowGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <RowGroup title="Settings & Support">
                  {UTILITY_ROWS.map((row) => (
                    <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
                  ))}
                </RowGroup>

                <section className="p-space-md rounded-xl bg-surface-subtle flex flex-col items-center text-center shadow-xs">
                  <div className="flex items-center gap-space-2xs text-text-secondary">
                    <Icon name="storefront" className="text-[18px]" />
                    <span className="font-label-md text-label-md">Own a business in Nigeria?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('business-onboarding')}
                    className="mt-space-2xs text-primary font-label-md text-label-md font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    Set up your business on VEMTAP
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                </section>
              </div>

              <section className="flex flex-col items-center gap-space-md pt-space-xs pb-space-md">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full max-w-md h-[52px] rounded-xl bg-surface-container-low hover:bg-error-container/20 text-error font-button-primary text-button-primary flex items-center justify-center gap-space-xs transition-colors active:scale-[0.98]"
                >
                  <Icon name="logout" className="text-[20px]" />
                  Sign Out
                </button>
                <p className="font-caption text-caption text-text-tertiary text-center">
                  VEMTAP Consumer v2.4.0 • Made with pride in Abuja
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
