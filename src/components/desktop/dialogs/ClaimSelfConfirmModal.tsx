import { useState } from 'react';
import { useProfile } from '../../../context/ProfileContext';
import { Icon } from '../../ui/Icon';
import { DesktopModal, ModalCloseButton } from '../DesktopModal';

export interface ClaimSelfConfirmModalProps {
  open: boolean;
  onClose: () => void;
  /** Fires only after the customer ticks the confirmation checkbox. */
  onConfirm: () => void;
  /** Opens the profile editor when required details are missing. */
  onCompleteProfile: () => void;
}

export function ClaimSelfConfirmModal({ open, onClose, onConfirm, onCompleteProfile }: ClaimSelfConfirmModalProps) {
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
    <DesktopModal
      open={open}
      onClose={handleClose}
      maxWidth="max-w-[520px]"
      backdropClassName="bg-on-surface/50 backdrop-blur-sm"
      cardClassName="bg-surface-canvas rounded-xl"
    >
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-bold tracking-wider uppercase">
          <Icon name="verified_user" className="text-[14px]" />
          <span>Confirm your identity</span>
        </div>
        <ModalCloseButton onClose={handleClose} label="Close modal" />
      </div>

      <div className="px-6 pt-2 pb-4 flex flex-col gap-1">
        <h2 className="font-heading-lg text-heading-lg text-on-surface font-bold tracking-tight">
          Claim this deal for myself
        </h2>
        <p className="font-body-md text-body-md text-text-secondary">
          Confirm these details are correct. The voucher will be issued in your name and saved to My Deals.
        </p>
      </div>

      <div className="px-6 flex flex-col gap-4 overflow-y-auto">
        <div className="p-4 rounded-xl bg-surface-container-low shadow-sm">
          <div className="flex items-center gap-3.5 pb-3 border-b border-outline-variant/40">
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-semibold shrink-0">
              {initials || 'VT'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                {fullName || 'Add your name'}
              </span>
              <span className="font-caption text-caption text-text-secondary">Customer name</span>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1.5 text-text-tertiary">
                <Icon name="mail" className="text-[15px]" />
                <span className="font-caption text-caption">Email</span>
              </dt>
              <dd className="font-label-md text-label-md text-on-surface truncate">{email || 'Not provided'}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1.5 text-text-tertiary">
                <Icon name="call" className="text-[15px]" />
                <span className="font-caption text-caption">Phone</span>
              </dt>
              <dd className="font-label-md text-label-md text-on-surface">{hasPhone ? maskedPhone : 'Not provided'}</dd>
            </div>
          </dl>
        </div>

        {!isComplete || !hasPhone ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-badge-discount-bg">
            <Icon name="info" filled className="text-badge-discount-text text-[18px] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 flex-1">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">
                {!isComplete ? 'Your profile needs a few details' : 'Add a phone number to continue'}
              </span>
              <button
                type="button"
                onClick={onCompleteProfile}
                className="self-start font-button-secondary text-button-secondary text-primary underline hover:opacity-80 transition-opacity"
              >
                Complete my profile
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-container-low cursor-pointer transition-colors select-none">
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
          <p role="alert" className="font-caption text-caption text-error">
            {error}
          </p>
        ) : null}
      </div>

      <div className="p-6 pt-5 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isComplete || !hasPhone || !confirmed}
          className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-md hover:bg-primary transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary-container disabled:active:scale-100"
        >
          <Icon name="check_circle" className="text-[18px]" filled />
          <span>Confirm &amp; Claim Deal</span>
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="font-button-secondary text-button-secondary text-text-secondary hover:text-on-surface transition-colors py-1"
        >
          Cancel and return to deal
        </button>
      </div>
    </DesktopModal>
  );
}
