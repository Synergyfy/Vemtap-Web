import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../../components/AccountRows';

interface DesktopSettingsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
  onNavigate: (target: AccountTarget) => void;
}

const PREFERENCE_ROWS: AccountRow[] = [
  {
    icon: 'notifications_active',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Notifications & Alerts',
    sub: 'Push, WhatsApp, Email',
    target: 'notifications',
  },
  {
    icon: 'lock_person',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Privacy & NDPR Data',
    sub: 'Consents, tracking & security',
    target: 'privacy',
  },
  {
    icon: 'location_on',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Delivery & Neighborhood Addresses',
    trail: 'Apo, Abuja',
    target: 'addresses',
  },
  {
    icon: 'tune',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'App Preferences & Language',
    trail: 'English',
    target: 'preferences',
  },
  {
    icon: 'shield_person',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Account Settings & Security',
    sub: 'Login, payments & data',
    target: 'account-settings',
  },
];

export function DesktopSettingsScreen({ onNav, onBack, onNavigate }: DesktopSettingsScreenProps) {
  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings">
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-text-secondary mb-6">
            <button className="hover:text-primary transition-colors" onClick={() => onNav('home')} type="button">
              Home
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <button className="hover:text-primary transition-colors" onClick={onBack} type="button">
              Account
            </button>
            <Icon name="chevron_right" className="text-[14px] text-text-tertiary" />
            <span className="text-text-primary font-semibold">Settings</span>
          </nav>

          <div className="mb-10 max-w-2xl">
            <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">Settings</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Manage how VEMTAP works for you — notifications, privacy &amp; NDPR data, delivery addresses, app
              language, and account security in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            <RowGroup title="Preferences">
              {PREFERENCE_ROWS.map((row) => (
                <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
              ))}
            </RowGroup>

            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <section className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="shield_lock" className="text-[20px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-text-primary">Your data stays yours</p>
                  <p className="font-caption text-caption text-text-tertiary leading-snug">
                    VEMTAP stores only what is needed to deliver your deals and bookings, under NDPR guidelines.
                  </p>
                </div>
              </section>

              <section className="p-space-md rounded-xl bg-surface-container-lowest border border-border-subtle flex items-start gap-space-sm shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="support_agent" className="text-[20px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-text-primary">Need a hand?</p>
                  <p className="font-caption text-caption text-text-secondary leading-snug">
                    Open Support &amp; Legal for help centre guides, contact options, and VEMTAP policies.
                  </p>
                  <button
                    onClick={() => onNavigate('support-legal')}
                    className="mt-2 inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:underline"
                    type="button"
                  >
                    <span>Open Support &amp; Legal</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
