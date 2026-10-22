import { Icon } from '../../components/ui/Icon';
import { ReceiptPanel } from '../../components/business/ReceiptPanel';
import { PosTerminalChrome, type PosTerminalNavKey } from './PosTerminalChrome';

export function DesktopPosReceiptScreen({ onNav }: { onNav: (key: PosTerminalNavKey) => void }) {
  return (
    <PosTerminalChrome activeNav="settings" railActive="pos-receipt" onNav={onNav}>
      <div className="w-full py-space-lg flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <button
            type="button"
            onClick={() => onNav('settings')}
            className="inline-flex items-center gap-1 w-fit font-label-sm text-label-sm text-text-secondary hover:text-primary"
          >
            <Icon name="arrow_back" className="text-[16px]" /> POS Settings
          </button>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Receipt &amp; Order Customization</h1>
          <p className="font-body-md text-body-md text-text-secondary">
            What prints on every receipt, paper width and when the printer fires.
          </p>
        </div>
        <ReceiptPanel />
      </div>
    </PosTerminalChrome>
  );
}
