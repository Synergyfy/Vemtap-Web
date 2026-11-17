import { useEffect, useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Skeleton, SkeletonGroup } from '../components/ui/Skeleton';
import { claimsService, type ScannedVoucher } from '../services/claimsService';
import { NO_IMAGE } from '../utils/homeOffer';

interface VoucherRedeemScreenProps {
  claimId: string;
  onDone: () => void;
}

const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
const reason = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

/** What a signed-in merchant sees after scanning a voucher QR (desktop and mobile). */
export function VoucherRedeemScreen({ claimId, onDone }: VoucherRedeemScreenProps) {
  const [voucher, setVoucher] = useState<ScannedVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    claimsService
      .lookupVoucher(claimId)
      .then((result) => {
        if (!ignore) setVoucher(result);
      })
      .catch((failure) => {
        if (!ignore) setError(reason(failure, 'This voucher isn’t for your business.'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [claimId]);

  const redeem = async () => {
    if (!voucher) return;
    setBusy(true);
    setError(null);
    try {
      await claimsService.redeemVoucher(voucher.claimCode);
      setRedeemed(true);
    } catch (failure) {
      setError(reason(failure, 'This voucher couldn’t be redeemed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const status = redeemed ? 'REDEEMED' : voucher?.status;

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-text-primary flex flex-col items-center justify-center gap-space-md px-margin py-space-lg antialiased">
      <div className="w-full max-w-md bg-surface-canvas rounded-2xl shadow-md p-space-md flex flex-col gap-space-sm">
        <h1 className="font-heading-sm text-heading-sm text-text-primary">Redeem Voucher</h1>

        {loading ? (
          <SkeletonGroup label="Loading voucher" className="space-y-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </SkeletonGroup>
        ) : voucher ? (
          <>
            <img className="w-full h-40 object-cover rounded-xl" alt={voucher.offerName} src={voucher.offerImage ?? NO_IMAGE} />
            <div>
              <p className="font-label-md text-label-md font-semibold text-text-primary">{voucher.offerName}</p>
              <p className="font-body-md text-body-md text-text-secondary">{voucher.customerName}</p>
            </div>
            <dl className="grid grid-cols-2 gap-space-xs font-caption text-caption">
              <div>
                <dt className="text-text-tertiary">Voucher Code</dt>
                <dd className="text-text-primary font-semibold break-all">{voucher.claimCode}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Customer Pays</dt>
                <dd className="text-text-primary font-semibold">{formatNaira(voucher.calculatedPrice)}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Status</dt>
                <dd className="text-text-primary font-semibold">{status}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Expires</dt>
                <dd className="text-text-primary font-semibold">{new Date(voucher.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              </div>
            </dl>
          </>
        ) : null}

        {redeemed ? (
          <p role="status" className="flex items-center gap-1.5 font-label-sm text-label-sm text-badge-discount-text bg-badge-discount-bg rounded-lg p-space-xs">
            <Icon name="check_circle" filled className="text-[18px]" />
            Voucher redeemed.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="font-label-sm text-label-sm text-error">
            {error}
          </p>
        ) : null}

        {voucher && status === 'ACTIVE' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void redeem()}
            className="h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary disabled:opacity-50"
          >
            {busy ? 'Redeeming…' : 'Redeem Voucher'}
          </button>
        ) : null}
        <button type="button" onClick={onDone} className="h-11 rounded-xl bg-surface-container-low text-primary font-button-secondary text-button-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
