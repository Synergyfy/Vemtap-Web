import { ConfirmActionDialog } from './ConfirmActionDialog';
import { useDealLifecycle } from '../hooks/business/useOffers';
import { apiErrorMessage } from '../services/errorMessages';

export interface DealEndRequest {
  kind: 'close' | 'delete';
  dealGroupId: string;
  name: string;
}

interface DealEndDialogProps {
  request: DealEndRequest | null;
  onClose: () => void;
  /** Called after the deal was closed or deleted, with a message to show. */
  onDone: (message: string, kind: DealEndRequest['kind']) => void;
  onError: (message: string) => void;
}

/** Confirms, then closes or deletes a whole deal (every branch). Same on desktop and mobile. */
export function DealEndDialog({ request, onClose, onDone, onError }: DealEndDialogProps) {
  const lifecycle = useDealLifecycle();
  const busy = lifecycle.close.isPending || lifecycle.remove.isPending;
  const closing = request?.kind === 'close';

  const confirm = () => {
    if (!request || busy) return;
    const mutation = closing ? lifecycle.close : lifecycle.remove;
    mutation.mutate(request.dealGroupId, {
      onSuccess: () => {
        onClose();
        onDone(
          closing ? `“${request.name}” is closed. Existing claims can still be redeemed.` : `“${request.name}” was deleted.`,
          request.kind,
        );
      },
      onError: (error) => {
        onClose();
        onError(apiErrorMessage(error, closing ? 'Could not close this deal.' : 'Could not delete this deal.'));
      },
    });
  };

  return (
    <ConfirmActionDialog
      open={Boolean(request)}
      onClose={() => (busy ? undefined : onClose())}
      onConfirm={confirm}
      busy={busy}
      tone="danger"
      title={closing ? 'Close this deal?' : 'Delete this deal?'}
      message={
        closing
          ? `“${request?.name ?? ''}” stops now at every branch. It can't be claimed again and moves to Expired.`
          : `“${request?.name ?? ''}” is removed from every branch for good. This can't be undone.`
      }
      bullets={
        closing
          ? ['Customers who already claimed it can still redeem their vouchers.', 'Its claims and stats stay in your records.']
          : ['Only deals nobody has claimed can be deleted — otherwise close it instead.']
      }
      confirmLabel={busy ? (closing ? 'Closing…' : 'Deleting…') : closing ? 'Close Deal' : 'Delete Deal'}
    />
  );
}
