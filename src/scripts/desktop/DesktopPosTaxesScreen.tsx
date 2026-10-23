import { Icon } from '../../components/ui/Icon';
import { TaxesPanel } from '../../components/business/TaxesPanel';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

export function DesktopPosTaxesScreen({ onNav }: { onNav: (key: PosTerminalNavKey) => void }) {
  return (
    <PosTerminalChrome activeNav="settings" railActive="pos-taxes" onNav={onNav}>
      <div className="w-full py-space-lg flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <button
            type="button"
            onClick={() => onNav('settings')}
            className="inline-flex items-center gap-1 w-fit font-label-sm text-label-sm text-text-secondary hover:text-primary"
          >
            <Icon name="arrow_back" className="text-[16px]" /> POS Settings
          </button>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Taxes &amp; Surcharges</h1>
          <p className="font-body-md text-body-md text-text-secondary">
            VAT, dining fees and QR ordering rules used on every ticket.
          </p>
        </div>
        <TaxesPanel />
      </div>
    </PosTerminalChrome>
  );
}
