import { useEffect, useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { useClaims } from '../context/ClaimsContext';

interface GiftRejectScreenProps {
  token: string;
  onDone: () => void;
}

/** The "decline" link in a gift email (desktop and mobile): live from `GET /catalogue/offers/gift/:token`. */
export function GiftRejectScreen({ token, onDone }: GiftRejectScreenProps) {
  const { getGift, rejectGift } = useClaims();
  const [gift, setGift] = useState<{ senderName?: string; status?: string; offer?: { name?: string } } | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : 'This gift link is not valid.');

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    getGift(token)
      .then((result) => {
        if (!ignore) setGift(result as typeof gift);
      })
      .catch((reason) => {
        if (!ignore) setError(reason instanceof Error ? reason.message : 'This gift could not be found.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [token, getGift]);

  const decline = async () => {
    setBusy(true);
    setError(null);
    try {
      await rejectGift(token);
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This gift could not be declined. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col items-center justify-center text-center gap-space-md px-margin antialiased">
      <div className="w-16 h-16 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center">
        <Icon name="card_giftcard" className="text-[32px]" />
      </div>
      {loading ? (
        <SkeletonGroup label="Loading this gift" className="w-full max-w-sm space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </SkeletonGroup>
      ) : (
        <div className="space-y-space-xs max-w-sm">
          <h1 className="font-heading-sm text-heading-sm text-text-primary">{done ? 'Gift declined' : 'Decline this gift?'}</h1>
          {gift && !done ? (
            <p className="font-body-md text-body-md text-text-secondary">
              {[gift.senderName, gift.offer?.name].filter(Boolean).join(' sent you ')}
            </p>
          ) : null}
          {done ? <p className="font-body-md text-body-md text-text-secondary">The sender’s gift has been declined.</p> : null}
          {error ? (
            <p role="alert" className="font-label-sm text-label-sm text-error">
              {error}
            </p>
          ) : null}
        </div>
      )}
      <div className="flex flex-col gap-space-xs w-full max-w-sm">
        {!done && gift ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void decline()}
            className="h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary disabled:opacity-50"
          >
            {busy ? 'Declining…' : 'Decline Gift'}
          </button>
        ) : null}
        <button type="button" onClick={onDone} className="h-11 rounded-xl text-text-secondary font-button-secondary text-button-secondary">
          Back to VEMTAP
        </button>
      </div>
    </div>
  );
}
