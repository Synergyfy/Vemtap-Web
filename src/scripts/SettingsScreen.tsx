import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../components/AccountRows';

interface SettingsScreenProps {
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

export function SettingsScreen({ onBack, onNavigate }: SettingsScreenProps) {
  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-space-sm px-margin py-space-xs">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="p-space-2xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center -ml-space-2xs"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Settings</h1>
            <span className="font-caption text-caption text-text-tertiary truncate">
              Manage how VEMTAP works for you
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <RowGroup title="Preferences">
          {PREFERENCE_ROWS.map((row) => (
            <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
          ))}
        </RowGroup>

        <section className="p-space-md rounded-xl bg-surface-subtle flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary-container flex items-center justify-center shrink-0">
            <Icon name="shield_lock" className="text-[20px]" />
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-label-md text-on-surface">Your data stays yours</p>
            <p className="font-caption text-caption text-text-tertiary leading-snug">
              VEMTAP stores only what is needed to deliver your deals and bookings, under NDPR guidelines.
            </p>
          </div>
        </section>
      </main>
    </AppScreen>
  );
}
