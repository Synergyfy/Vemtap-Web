import { useEffect, useState } from 'react';
import { Icon } from './ui/Icon';
import { SheetShell } from './sheets/SheetShell';
import { DELETION_REASONS, useAccountDeletion } from '../context/AccountDeletionContext';

interface DeleteAccountSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called when the user acknowledges completion — sign out and go home. */
  onCompleted: () => void;
}

type Step = 'reason' | 'confirm' | 'submitting' | 'result';

/**
 * BUG-018 / BUG-019: Delete Account & Purge Vouchers.
 * Reachable only from Settings → Privacy & Data (never from Sign Out).
 * Flow: optional reason → consequences + reauth → submit → outcome.
 * A success message is shown only when the backend confirms the purge.
 */
export function DeleteAccountSheet({ open, onClose, onCompleted }: DeleteAccountSheetProps) {
  const { submitRequest, request, clearRequest } = useAccountDeletion();
  const [step, setStep] = useState<Step>('reason');
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (open) {
      setStep('reason');
      setReasonId(null);
      setFeedback('');
      setPin('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setStep('submitting');
    const result = await submitRequest({ reasonId: reasonId ?? undefined, feedback: feedback.trim() || undefined });
    // Distinguish outcomes: only `ok` (backend-confirmed) may show success copy.
    if (result.ok) setStep('result');
    else setStep('result');
  };

  if (!open) return null;

  const canSubmit = pin.trim().length >= 4;

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="flex flex-col gap-space-md pb-space-lg">
        {step === 'reason' && (
          <>
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                <Icon name="delete_forever" className="text-[22px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-on-surface">Delete account &amp; purge vouchers</h3>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              Before you go — why are you leaving? This is optional and won&apos;t affect your request.
            </p>
            <div className="flex flex-col gap-space-2xs" role="radiogroup" aria-label="Reason for leaving">
              {DELETION_REASONS.map((reason) => {
                const selected = reasonId === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setReasonId(selected ? null : reason.id)}
                    className={`w-full text-left p-space-sm rounded-xl border flex items-center gap-space-sm transition-colors ${
                      selected
                        ? 'border-primary bg-surface-tint-blue'
                        : 'border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        selected ? 'border-primary' : 'border-outline-variant'
                      }`}
                    >
                      {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="font-body-md text-body-md text-text-primary">{reason.label}</span>
                  </button>
                );
              })}
            </div>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Anything we could have done better? (optional)"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-space-sm font-body-md text-body-md text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary"
            />
            <div className="flex gap-space-xs pt-space-2xs">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
              >
                Keep my account
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                <Icon name="delete_forever" className="text-[22px]" />
              </div>
              <h3 className="font-heading-sm text-heading-sm text-on-surface">What happens when you delete</h3>
            </div>
            <ul className="flex flex-col gap-space-2xs">
              {[
                'Your profile, saved vouchers, wallet balance and deals ledger are permanently removed.',
                'Merchants you purchased from lose access to your name and phone number.',
                'Receipts and transaction records are retained for 24 months where legally required, then anonymised.',
                'This cannot be undone. You would need to create a new account to return.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-space-2xs">
                  <Icon name="warning_amber" className="text-error text-[18px] shrink-0 mt-0.5" />
                  <span className="font-caption text-caption text-text-secondary leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-text-secondary">
                Confirm it&apos;s you — enter your account PIN
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••"
                className="w-full h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm font-body-md text-body-md text-text-primary tracking-[0.3em] placeholder:tracking-normal placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
              <span className="font-caption text-caption text-text-tertiary">Demo: any 4–6 digits.</span>
            </label>
            <div className="flex gap-space-xs pt-space-2xs">
              <button
                type="button"
                onClick={() => setStep('reason')}
                className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={`flex-1 h-11 rounded-xl font-button-secondary text-button-secondary font-semibold transition-transform ${
                  canSubmit ? 'bg-error text-on-error active:scale-[0.98]' : 'bg-surface-container text-text-tertiary'
                }`}
              >
                Delete my account
              </button>
            </div>
          </>
        )}

        {step === 'submitting' && (
          <div className="flex flex-col items-center gap-space-md py-space-lg">
            <Icon name="progress_activity" className="text-primary text-[36px] animate-spin" />
            <p className="font-body-md text-body-md text-text-secondary text-center">
              {request?.status === 'submitted' || !request
                ? 'Your deletion request has been submitted…'
                : 'Processing your deletion request…'}
            </p>
          </div>
        )}

        {step === 'result' && request && (
          <>
            {request.status === 'completed' ? (
              <>
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                    <Icon name="sentiment_dissatisfied" className="text-[22px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">We&apos;re sorry to see you go</h3>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Your account and personal data have been deleted. Reference:{' '}
                  <span className="font-semibold text-text-primary">{request.id}</span>
                </p>
                {request.retainedNote && (
                  <p className="font-caption text-caption text-text-tertiary leading-relaxed">{request.retainedNote}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    clearRequest();
                    onCompleted();
                  }}
                  className="w-full h-12 rounded-xl bg-error text-on-error font-button text-button font-semibold active:scale-[0.98] transition-transform mt-space-2xs"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                    <Icon name="error_outline" className="text-[22px]" />
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface">Deletion could not be completed</h3>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  {request.error ??
                    'Something went wrong and your account has not been deleted. Please try again or contact support.'}
                </p>
                <p className="font-caption text-caption text-text-tertiary">
                  Your account is still active and your data is intact.
                </p>
                <div className="flex gap-space-xs pt-space-2xs">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('reason')}
                    className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </SheetShell>
  );
}
