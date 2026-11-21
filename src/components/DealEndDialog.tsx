import { ConfirmActionDialog } from './ConfirmActionDialog';
import { useDealLifecycle, useOfferMutations } from '../hooks/business/useOffers';
import { apiErrorMessage } from '../services/errorMessages';

export interface DealEndRequest {
  kind: 'close' | 'delete' | 'pause' | 'resume';
  dealGroupId: string;
  name: string;
  offerId?: string;
  onDemoConfirm?: () => void;
}

interface DealEndDialogProps {
  request: DealEndRequest | null;
  onClose: () => void;
  /** Called after the deal was closed, deleted, or paused/resumed, with a message to show. */
  onDone: (message: string, kind: DealEndRequest['kind']) => void;
  onError: (message: string) => void;
}

/** Confirms, then closes, deletes, or pauses a deal with full explanation. Same on desktop and mobile. */
export function DealEndDialog({ request, onClose, onDone, onError }: DealEndDialogProps) {
  const lifecycle = useDealLifecycle();
  const offerMutations = useOfferMutations();
  const busy = lifecycle.close.isPending || lifecycle.remove.isPending || offerMutations.setStatus.isPending;
  const closing = request?.kind === 'close';
  const pausing = request?.kind === 'pause';
  const resuming = request?.kind === 'resume';

  const confirm = () => {
    if (!request || busy) return;

    if (request.onDemoConfirm) {
      request.onDemoConfirm();
      onClose();
      onDone(
        pausing
          ? `“${request.name}” is now paused.`
          : resuming
            ? `“${request.name}” is now resumed.`
            : `“${request.name}” was updated.`,
        request.kind,
      );
      return;
    }

    if (pausing || resuming) {
      offerMutations.setStatus.mutate(
        { id: request.offerId ?? request.dealGroupId, status: pausing ? 'inactive' : 'active' },
        {
          onSuccess: () => {
            onClose();
            onDone(
              pausing
                ? `“${request.name}” is now paused and hidden from feeds.`
                : `“${request.name}” is resumed and live on feeds.`,
              request.kind,
            );
          },
          onError: (error) => {
            onClose();
            onError(apiErrorMessage(error, `Could not ${request.kind} this deal.`));
          },
        },
      );
      return;
    }

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

  const getTitle = () => {
    if (pausing) return 'Pause this deal?';
    if (resuming) return 'Resume this deal?';
    if (closing) return 'Close this deal?';
    return 'Delete this deal?';
  };

  const getMessage = () => {
    if (pausing) {
      return `“${request?.name ?? ''}” will be temporarily hidden from customer feeds and discovery while paused.`;
    }
    if (resuming) {
      return `“${request?.name ?? ''}” will become visible to customers again on feeds and search.`;
    }
    if (closing) {
      return `“${request?.name ?? ''}” stops now at every branch. It can't be claimed again and moves to Expired.`;
    }
    return `“${request?.name ?? ''}” is removed from every branch for good. This can't be undone.`;
  };

  const getBullets = () => {
    if (pausing) {
      return [
        'Customers who already claimed vouchers can still redeem them before expiration.',
        'New customers cannot view or claim this deal while it is paused.',
        'You can resume this deal anytime from this dashboard.',
      ];
    }
    if (resuming) {
      return [
        'Customers can immediately discover and claim vouchers for this deal.',
        'Active promotion tags and badges will appear on your store catalog.',
      ];
    }
    if (closing) {
      return [
        'Customers who already claimed it can still redeem their vouchers.',
        'Its claims and stats stay in your records.',
      ];
    }
    return ['Only deals nobody has claimed can be deleted — otherwise close it instead.'];
  };

  const getConfirmLabel = () => {
    if (busy) {
      if (pausing) return 'Pausing…';
      if (resuming) return 'Resuming…';
      if (closing) return 'Closing…';
      return 'Deleting…';
    }
    if (pausing) return 'Pause Deal';
    if (resuming) return 'Resume Deal';
    if (closing) return 'Close Deal';
    return 'Delete Deal';
  };

  return (
    <ConfirmActionDialog
      open={Boolean(request)}
      onClose={() => (busy ? undefined : onClose())}
      onConfirm={confirm}
      busy={busy}
      tone={pausing ? 'default' : 'danger'}
      title={getTitle()}
      message={getMessage()}
      bullets={getBullets()}
      confirmLabel={getConfirmLabel()}
    />
  );
}
