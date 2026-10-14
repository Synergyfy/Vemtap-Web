import { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface ClaimSelfConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fires only after the customer ticks the confirmation checkbox. */
  onConfirm: () => void;
  /** Opens the profile editor when required details are missing. */
  onCompleteProfile: () => void;
}

export function ClaimSelfConfirmSheet({ open, onClose, onConfirm, onCompleteProfile }: ClaimSelfConfirmSheetProps) {
  const { fullName, email, maskedPhone, initials, hasPhone, isComplete } = useProfile();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setConfirmed(false);
    setError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!isComplete) {
      setError('Your profile is missing required details. Complete it to claim this deal.');
      return;
    }
    if (!hasPhone) {
      setError('Add a phone number to your profile so the business can verify your claim.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm that the details shown are correct.');
      return;
    }
    setConfirmed(false);
    setError(null);
    onConfirm();
  };

  return (
    <SheetShell open={open} onClose={handleClose}>
      <div className="w-full flex justify-center pt-3 pb-space-xs">
        <div className="w-12 h-1.5 rounded-full bg-surface-container/60" />
      </div>

      <div className="flex flex-col w-full px-margin pb-space-lg">
        <div className="flex items-center justify-between pt-space-xs pb-space-sm">
          <div className="inline-flex items-center gap-space-2xs bg-surface-tint-blue text-primary px-space-sm py-1 rounded-full">
            <Icon name="verified_user" className="text-[16px]" filled />
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              Confirm your identity
            </span>
          </div>
          <button
            aria-label="Close sheet"
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex flex-col gap-1 pb-space-md">
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            Claim for myself
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Confirm these details are correct. The voucher will be issued in your name and saved to My Deals.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md shadow-sm">
          <div className="flex items-center gap-space-sm pb-space-sm border-b border-outline-variant/40">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-semibold shrink-0">
              {initials || 'VT'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-button-primary text-button-primary text-text-primary truncate">
                {fullName || 'Add your name'}
              </span>
              <span className="font-caption text-caption text-text-secondary">Customer name</span>
            </div>
          </div>

          <dl className="flex flex-col gap-space-sm pt-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <dt className="flex items-center gap-space-2xs text-text-tertiary">
                <Icon name="mail" className="text-[16px]" />
                <span className="font-caption text-caption">Email</span>
              </dt>
              <dd className="font-label-md text-label-md text-text-primary text-right truncate">
                {email || 'Not provided'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-space-sm">
              <dt className="flex items-center gap-space-2xs text-text-tertiary">
                <Icon name="call" className="text-[16px]" />
                <span className="font-caption text-caption">Phone</span>
              </dt>
              <dd className="font-label-md text-label-md text-text-primary text-right">
                {hasPhone ? maskedPhone : 'Not provided'}
              </dd>
            </div>
          </dl>
        </div>

        {!isComplete || !hasPhone ? (
          <div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-badge-discount-bg mb-space-md">
            <Icon name="info" filled className="text-badge-discount-text text-[18px] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-space-2xs flex-1">
              <span className="font-label-sm text-label-sm text-text-primary">
                {!isComplete ? 'Your profile needs a few details' : 'Add a phone number to continue'}
              </span>
              <button
                type="button"
                onClick={onCompleteProfile}
                className="self-start font-button-secondary text-button-secondary text-primary underline active:opacity-70"
              >
                Complete my profile
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-start gap-space-sm p-space-sm rounded-xl bg-surface-container-low mb-space-md cursor-pointer">
            <input
              className="sr-only"
              type="checkbox"
              checked={confirmed}
              onChange={(event) => {
                setConfirmed(event.target.checked);
                setError(null);
              }}
            />
            <span
              className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                confirmed ? 'bg-primary text-on-primary' : 'bg-surface-canvas border border-outline-variant'
              }`}
            >
              {confirmed ? <Icon name="check" className="text-[14px]" /> : null}
            </span>
            <span className="font-label-md text-label-md text-text-primary leading-snug">
              I confirm my name, email and masked phone number shown above are correct.
            </span>
          </label>
        )}

        {error ? (
          <p role="alert" className="font-caption text-caption text-error pb-space-sm">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-space-sm mt-auto">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isComplete || !hasPhone || !confirmed}
            className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:opacity-50 disabled:active:scale-100"
          >
            <Icon name="check_circle" className="text-[20px]" filled />
            <span>Confirm &amp; Claim Deal</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="h-11 rounded-xl font-button-secondary text-button-secondary text-text-secondary active:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </SheetShell>
  );
}
