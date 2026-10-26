import { useIsDesktop } from '../hooks/useIsDesktop';
import { DesktopModal, ModalCloseButton } from './desktop/DesktopModal';
import { SheetShell } from './sheets/SheetShell';
import { Icon } from './ui/Icon';

export interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  acknowledgeLabel?: string;
  /** Optional icon glyph for the header chip (Material Symbols name). */
  icon?: string;
}

function InfoBody({ onClose, title, message, acknowledgeLabel = 'Got it', icon = 'info' }: InfoDialogProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-space-md pt-space-md pb-space-sm border-b border-border-subtle">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-surface-tint-blue text-primary">
            <Icon name={icon} className="text-[22px]" />
          </span>
          <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{title}</h3>
        </div>
        <ModalCloseButton onClose={onClose} label="Close dialog" />
      </div>

      <div className="p-space-md flex flex-col gap-space-xs">
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{message}</p>

        <div className="flex items-center justify-end pt-space-sm mt-space-xs border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-space-xs rounded-xl font-button-secondary text-button-secondary font-semibold bg-primary-container text-on-primary hover:bg-primary shadow-sm transition-colors"
          >
            {acknowledgeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Single-acknowledgement information dialog. Desktop renders a centred modal,
 * mobile a bottom sheet — both driven by the same body so the copy stays
 * identical across breakpoints.
 */
export function InfoDialog(props: InfoDialogProps) {
  const isDesktop = useIsDesktop();
  if (!props.open) return null;

  if (isDesktop) {
    return (
      <DesktopModal open={props.open} onClose={props.onClose} maxWidth="max-w-[440px]">
        <InfoBody {...props} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={props.open} onClose={props.onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>
      <InfoBody {...props} />
    </SheetShell>
  );
}
