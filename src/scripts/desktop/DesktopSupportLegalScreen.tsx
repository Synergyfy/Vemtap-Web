import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { AccountRowButton, RowGroup, type AccountRow, type AccountTarget } from '../../components/AccountRows';

interface DesktopSupportLegalScreenProps {
  onNav: (key: DesktopNavKey) => void;
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

export function DesktopSupportLegalScreen({ onNav, onBack, onNavigate }: DesktopSupportLegalScreenProps) {
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
            <span className="text-text-primary font-semibold">Support &amp; Legal</span>
          </nav>

          <div className="mb-10 max-w-2xl">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Support &amp; Legal</h1>
            <p className="font-body-lg text-body-lg text-text-secondary mt-2">
              Help centre, contact &amp; policies — reach the VEMTAP team, browse troubleshooting guides, and review
              the terms that govern your account.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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

            <aside className="w-full p-space-md rounded-xl bg-surface-subtle shadow-xs flex flex-col items-center justify-center gap-space-xs text-center min-h-[140px]">
              <div className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name="info" className="text-[20px]" />
              </div>
              <p className="font-caption text-caption text-text-tertiary pt-space-2xs leading-relaxed">
                VEMTAP Consumer v2.4.0 • Made with pride in Abuja
              </p>
            </aside>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
