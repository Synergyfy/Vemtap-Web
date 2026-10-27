import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { DesktopModal, ModalCloseButton } from '../desktop/DesktopModal';
import { SheetShell } from '../sheets/SheetShell';
import { CustomerInviteQrCode } from '../CustomerInviteQrCode';
import { generateCustomerInvite, type CustomerInvite } from '../../scripts/customerInviteService';

export interface SendInviteDialogProps {
  open: boolean;
  onClose: () => void;
  /** Opens the public join page inside the SPA (preview of the invite URL). */
  onPreviewInvite?: (url: string) => void;
}

type InviteState =
  | { status: 'loading' }
  | { status: 'ready'; invite: CustomerInvite }
  | { status: 'error'; message: string };

function useCustomerInvite(open: boolean) {
  const [state, setState] = useState<InviteState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ status: 'loading' });
    generateCustomerInvite()
      .then((invite) => {
        if (!cancelled) setState({ status: 'ready', invite });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Could not create the invite link.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [open, attempt]);

  return { state, retry: () => setAttempt((current) => current + 1) };
}

const inviteShareMessage = (businessName: string) =>
  `Join ${businessName} on VEMTAP! Create your account through this link to collect rewards, receipts and offers:`;


function InviteBody({ onClose, onPreviewInvite }: Omit<SendInviteDialogProps, 'open'>) {
  const { state, retry } = useCustomerInvite(true);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const copyLink = async (inviteUrl: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setFeedback('Invite link copied to clipboard');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback('Could not copy automatically — select the link and copy it manually');
    }
  };

  const shareInvite = async (invite: CustomerInvite) => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Join ${invite.businessName} on VEMTAP`,
          text: inviteShareMessage(invite.businessName),
          url: invite.url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // any other failure falls through to the copy fallback below
      }
    }
    await copyLink(invite.url);
    setFeedback('Sharing is not available on this device — the link was copied instead');
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-space-md pt-space-md pb-space-sm border-b border-border-subtle">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <Icon name="link" className="text-[22px]" />
          </span>
          <div className="flex flex-col min-w-0">
            <h3 className="font-heading-sm text-heading-sm text-text-primary">Send Invite Link</h3>
            <p className="font-caption text-caption text-text-secondary">
              Invite customers to register &amp; connect on VEMTAP
            </p>
          </div>
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>

      <div className="p-space-md flex flex-col gap-space-sm max-h-[72vh] overflow-y-auto">
        <p className="font-caption text-caption text-text-secondary leading-relaxed">
          Share this link with a customer. When they open it they&apos;ll be able to join{' '}
          <span className="font-semibold text-text-primary">
            {state.status === 'ready' ? state.invite.businessName : 'your business'}
          </span>{' '}
          on VEMTAP by entering their name and phone number.
        </p>

        {state.status === 'loading' && (
          <div className="flex flex-col gap-space-sm" aria-live="polite">
            <div className="h-11 rounded-xl bg-surface-subtle animate-pulse" />
            <div className="mx-auto w-[184px] h-[184px] rounded-2xl bg-surface-subtle animate-pulse" />
            <p className="text-center font-caption text-caption text-text-secondary">Creating your invite link…</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-xl bg-surface-subtle border border-border-subtle p-space-md flex flex-col gap-space-sm items-start">
            <span className="flex items-center gap-space-2xs font-label-md text-label-md text-text-primary font-semibold">
              <Icon name="error" className="text-[18px] text-error" />
              Something went wrong
            </span>
            <p className="font-caption text-caption text-text-secondary">{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="h-9 px-space-sm rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs active:scale-95 transition-transform"
            >
              <Icon name="refresh" className="text-[15px]" />
              <span>Try Again</span>
            </button>
          </div>
        )}


        {state.status === 'ready' && (
          <>
            {/* Invite link + copy */}
            <div className="flex items-center gap-space-xs">
              <div className="flex-1 min-w-0 h-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle flex items-center">
                <span className="font-mono text-[12px] text-text-secondary truncate">{state.invite.url}</span>
              </div>
              <button
                type="button"
                onClick={() => copyLink(state.invite.url)}
                className="h-11 px-space-sm rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-space-2xs shrink-0 active:scale-95 transition-transform"
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            <span className="flex items-center gap-space-2xs font-caption text-caption text-text-tertiary">
              <Icon name="info" className="text-[13px]" />
              Development placeholder link — pending backend invite service.
            </span>

            <div className="flex justify-center pt-space-2xs">
              <CustomerInviteQrCode url={state.invite.url} businessName={state.invite.businessName} />
            </div>

            {/* Share actions */}
            <div className="flex flex-col gap-space-xs pt-space-xs border-t border-border-subtle">
              <button
                type="button"
                onClick={() => shareInvite(state.invite)}
                className="w-full h-11 rounded-xl bg-primary-container text-on-primary-container font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-sm active:scale-[0.98] transition-all"
              >
                <Icon name="share" className="text-[18px]" />
                <span>Share Invite</span>
              </button>
              <div className="flex gap-space-xs">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${inviteShareMessage(state.invite.businessName)} ${state.invite.url}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs transition-colors"
                >
                  <Icon name="chat" className="text-[16px] text-[#128C7E]" />
                  <span>WhatsApp</span>
                </a>
                {onPreviewInvite && (
                  <button
                    type="button"
                    onClick={() => onPreviewInvite(state.invite.url)}
                    className="flex-1 h-10 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-space-2xs transition-colors"
                  >
                    <Icon name="visibility" className="text-[16px] text-primary" />
                    <span>Preview Invite Page</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div aria-live="polite" className="min-h-[18px]">
          {feedback && <p className="font-caption text-caption text-primary text-center">{feedback}</p>}
        </div>
      </div>
    </div>
  );
}

/** Send Invite Link — desktop modal / mobile sheet per app conventions. */
export function SendInviteDialog({ open, onClose, onPreviewInvite }: SendInviteDialogProps) {
  const isDesktop = useIsDesktop();
  if (!open) return null;

  if (isDesktop) {
    return (
      <DesktopModal open={open} onClose={onClose} maxWidth="max-w-lg">
        <InviteBody onClose={onClose} onPreviewInvite={onPreviewInvite} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>
      <InviteBody onClose={onClose} onPreviewInvite={onPreviewInvite} />
    </SheetShell>
  );
}
