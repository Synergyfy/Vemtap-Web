import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../components/AccountRows';

interface SupportLegalScreenProps {
  onBack: () => void;
  onNavigate: (target: AccountTarget) => void;
}

const HELP_ROWS: AccountRow[] = [
  {
    icon: 'contact_support',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Help Centre & FAQs',
    sub: 'Guides, FAQs & troubleshooting',
    target: 'help',
  },
  {
    icon: 'headset_mic',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Contact Support / Feedback',
    sub: 'Chat with the VEMTAP team',
    target: 'support',
  },
];

const LEGAL_ROWS: AccountRow[] = [
  {
    icon: 'policy',
    iconClass: 'bg-surface-container-high text-on-surface-variant',
    label: 'Terms & Privacy Policy',
    sub: 'Service terms & data policy',
    target: 'terms',
  },
];

export function SupportLegalScreen({ onBack, onNavigate }: SupportLegalScreenProps) {
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
            <h1 className="font-heading-sm text-heading-sm text-text-primary truncate">Support &amp; Legal</h1>
            <span className="font-caption text-caption text-text-tertiary truncate">
              Help centre, contact &amp; policies
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin py-space-sm pb-space-xl gap-space-md">
        <RowGroup title="Support">
          {HELP_ROWS.map((row) => (
            <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
          ))}
        </RowGroup>

        <RowGroup title="Legal">
          {LEGAL_ROWS.map((row) => (
            <AccountRowButton key={row.label} row={row} onSelect={onNavigate} />
          ))}
        </RowGroup>

        <p className="font-caption text-caption text-text-tertiary text-center pt-space-xs">
          VEMTAP Consumer v2.4.0 • Made with pride in Abuja
        </p>
      </main>
    </AppScreen>
  );
}
