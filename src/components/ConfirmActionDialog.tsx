import { useIsDesktop } from '../hooks/useIsDesktop';
import { DesktopModal, ModalCloseButton } from './desktop/DesktopModal';
import { SheetShell } from './sheets/SheetShell';
import { Icon } from './ui/Icon';

export interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** One or two sentences explaining exactly what will change. */
  message: string;
  /** Optional bullet list of consequences shown above the buttons. */
  bullets?: string[];
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button in the error tone. */
  tone?: 'default' | 'danger';
  busy?: boolean;
}

function ConfirmBody({
  onClose,
  onConfirm,
  title,
  message,
  bullets,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
}: ConfirmActionDialogProps) {
  const danger = tone === 'danger';
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-space-md pt-space-md pb-space-sm border-b border-border-subtle">
        <div className="flex items-center gap-space-sm min-w-0">
          <span
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              danger ? 'bg-error-container text-on-error-container' : 'bg-surface-tint-blue text-primary'
            }`}
          >
            <Icon name={danger ? 'warning' : 'help'} className="text-[22px]" />
          </span>
          <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{title}</h3>
        </div>
        <ModalCloseButton onClose={onClose} label="Close confirmation" />
      </div>

      <div className="p-space-md flex flex-col gap-space-xs">
        <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{message}</p>

        {bullets && bullets.length > 0 && (
          <ul className="flex flex-col gap-space-2xs mt-space-2xs">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-space-2xs font-caption text-caption text-text-secondary">
                <Icon name="chevron_right" className="text-[14px] text-text-tertiary shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-end gap-space-xs pt-space-sm mt-space-xs border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-space-md py-space-xs rounded-xl border border-border text-text-secondary hover:bg-surface-subtle font-button-secondary text-button-secondary disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-space-md py-space-xs rounded-xl font-button-secondary text-button-secondary font-semibold shadow-sm disabled:opacity-60 transition-colors ${
              danger
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary-container text-on-primary hover:bg-primary'
            }`}
          >
            {busy ? <Icon name="progress_activity" className="text-[16px] animate-spin" /> : <span>{confirmLabel}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared confirmation dialog for bulk destructive actions. Desktop renders a
 * centred modal, mobile a bottom sheet — both driven by the same body so the
 * copy and behaviour stay identical across breakpoints.
 */
export function ConfirmActionDialog(props: ConfirmActionDialogProps) {
  const isDesktop = useIsDesktop();
  if (!props.open) return null;

  if (isDesktop) {
    return (
      <DesktopModal open={props.open} onClose={props.onClose} maxWidth="max-w-md">
        <ConfirmBody {...props} onClose={props.onClose} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={props.open} onClose={props.onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>
      <ConfirmBody {...props} onClose={props.onClose} />
    </SheetShell>
  );
}
