import { useEffect, useState } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { normaliseReferralCode, validateReferralCode } from '../../scripts/referralData';
import { referralsService, type ReferrerInfo } from '../../services/referralsService';
import { DesktopModal, ModalCloseButton } from '../desktop/DesktopModal';
import { SheetShell } from '../sheets/SheetShell';
import { Icon } from '../ui/Icon';

export interface ReferralConfirmSheetProps {
  open: boolean;
  /** The code the user already typed — the sheet starts from this value. */
  initialCode: string;
  /** The signed-in user's own preview code, blocked so nobody can refer themselves. */
  ownCode?: string;
  /** Called with the confirmed code when the user presses Confirm. */
  onConfirm: (code: string) => void;
  /** Called when the user skips the referral entirely. */
  onSkip: () => void;
  /** Called when the sheet is dismissed without a decision (backdrop / X). */
  onCancel: () => void;
}

const INVALID_MESSAGE = 'That doesn’t look like a valid VEMTAP referral code.';
const OWN_CODE_MESSAGE = 'That is your own referral code — you can’t refer yourself.';
const EMPTY_MESSAGE = 'Enter a referral code, or choose Skip for now.';

function ReferralConfirmBody({
  initialCode,
  ownCode,
  onConfirm,
  onSkip,
  onCancel,
}: Pick<ReferralConfirmSheetProps, 'initialCode' | 'ownCode' | 'onConfirm' | 'onSkip' | 'onCancel'>) {
  const [draft, setDraft] = useState(initialCode);
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [loadingReferrer, setLoadingReferrer] = useState(false);

  const result = validateReferralCode(draft);
  const isOwn = Boolean(ownCode) && result.ok && result.code === normaliseReferralCode(ownCode ?? '');
  const valid = result.ok && !isOwn;
  const hasInput = draft.trim() !== '';

  const feedback = !hasInput
    ? EMPTY_MESSAGE
    : isOwn
      ? OWN_CODE_MESSAGE
      : valid
        ? 'That referral code looks right.'
        : (result.message ?? INVALID_MESSAGE);
  const showError = hasInput && !valid;
  const preview = hasInput ? normaliseReferralCode(draft) : '';

  useEffect(() => {
    if (!valid || !preview) {
      setReferrer(null);
      setLoadingReferrer(false);
      return;
    }
    let cancelled = false;
    setLoadingReferrer(true);
    referralsService
      .lookup(preview)
      .then((info) => {
        if (!cancelled) {
          setReferrer(info);
          setLoadingReferrer(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingReferrer(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [preview, valid]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-space-md pt-space-md pb-space-sm border-b border-border-subtle">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name="group_add" className="text-[22px]" />
          </span>
          <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">Your referral code</h3>
        </div>
        <ModalCloseButton onClose={onCancel} label="Back to the form" />
      </div>

      <div className="p-space-md flex flex-col gap-space-sm">
        {/* Who referred this account */}
        <div className="flex flex-col gap-space-2xs">
          <span className="font-caption text-caption text-text-secondary">You’re referred by</span>
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle">
            {/* Referral Code */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-space-xs font-heading-md text-heading-md font-bold tracking-[0.08em] uppercase ${
                  preview ? 'text-text-primary' : 'text-text-tertiary'
                }`}
              >
                <Icon name="confirmation_number" className="text-[20px] text-primary" />
                {preview || '—'}
              </span>
              {preview && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                  <Icon name="verified" className="text-[13px]" />
                  <span>Referral Code</span>
                </span>
              )}
            </div>

            {/* Just under the referral code: First Name and Last Name of the referrer */}
            {preview && valid && (
              <div className="flex items-center gap-2.5 pt-2 border-t border-border-subtle">
                <div className="w-9 h-9 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-bold text-[13px] shrink-0 border border-primary/20">
                  {loadingReferrer ? (
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : referrer ? (
                    `${(referrer.firstName?.[0] || 'V').toUpperCase()}${(referrer.lastName?.[0] || 'M').toUpperCase()}`
                  ) : (
                    <Icon name="person" className="text-[18px]" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold text-text-primary truncate">
                      {loadingReferrer
                        ? 'Auto-fetching referrer name…'
                        : referrer
                          ? `${referrer.firstName} ${referrer.lastName}`
                          : 'Vemtap Member'}
                    </span>
                    {!loadingReferrer && referrer && (
                      <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" />
                    )}
                  </div>
                  <span className="font-caption text-[11px] text-text-secondary">
                    {loadingReferrer ? 'Verifying referral code…' : 'Referrer Name'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live validation for whatever is in the box */}
        <div
          aria-live="polite"
          className={`flex items-start gap-space-2xs rounded-xl px-space-xs py-space-2xs ${
            showError
              ? 'bg-error-container/60 text-on-error-container'
              : valid
                ? 'bg-badge-discount-bg text-badge-discount-text'
                : 'bg-surface-subtle text-text-secondary'
          }`}
        >
          <Icon
            name={showError ? 'error' : valid ? 'check_circle' : 'info'}
            className={`text-[16px] shrink-0 mt-0.5 ${
              showError ? 'text-error' : valid ? 'text-badge-discount-text' : 'text-text-secondary'
            }`}
          />
          <span className="font-caption text-caption leading-snug">{feedback}</span>
        </div>

        {/* Quick edit — re-validates as they type */}
        <label className="flex flex-col gap-space-2xs" htmlFor="referral-code-confirm">
          <span className="font-label-sm text-label-sm text-text-secondary font-medium">
            Change referral code
          </span>
          <div
            className={`flex items-center bg-surface-canvas rounded-xl h-[46px] px-3 border transition-colors ${
              showError ? 'border-error' : 'border-border-subtle focus-within:border-primary/40'
            }`}
          >
            <input
              aria-describedby="referral-code-confirm-feedback"
              aria-invalid={showError}
              autoCapitalize="characters"
              autoComplete="off"
              className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0 tracking-[0.08em] uppercase"
              id="referral-code-confirm"
              maxLength={16}
              placeholder="e.g. VEM-8OGUU4"
              spellCheck={false}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            {draft && (
              <button
                aria-label="Clear referral code"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary shrink-0"
                type="button"
                onClick={() => setDraft('')}
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
        </label>
        <span className="sr-only" id="referral-code-confirm-feedback">
          {feedback}
        </span>

        <p className="font-caption text-caption text-text-tertiary leading-relaxed">
          Codes are 4–16 letters, numbers and dashes. VEMTAP checks them on our servers when you finish — an unknown
          code never blocks your sign-up.
        </p>
      </div>

      <div className="flex items-center justify-end gap-space-xs px-space-md py-space-sm border-t border-border-subtle">
        <button
          type="button"
          onClick={onSkip}
          className="h-11 px-space-md rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary transition active:scale-[0.98]"
        >
          Skip
        </button>
        <button
          type="button"
          disabled={!valid}
          title={valid ? undefined : feedback}
          onClick={() => onConfirm(normaliseReferralCode(draft))}
          className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-button-secondary text-button-secondary font-semibold shadow-sm hover:bg-primary transition disabled:opacity-40 disabled:hover:bg-primary-container active:scale-[0.98]"
        >
          Confirm &amp; continue
        </button>
      </div>
    </div>
  );
}

/**
 * Submit-time referral confirmation.
 *
 * Shown after the merchant presses Complete Setup / Continue with a referral
 * code in the field. Mobile renders it as a bottom sheet, desktop as a modal —
 * both from the same body so the copy and validation can never drift.
 *
 * The code is re-validated on every keystroke, so editing it in place gives
 * immediate right/wrong feedback. Dismissing the sheet (backdrop or X) simply
 * returns to the form; only the explicit Skip button completes setup without a
 * referral.
 */
export function ReferralConfirmSheet(props: ReferralConfirmSheetProps) {
  const isDesktop = useIsDesktop();
  if (!props.open) return null;

  if (isDesktop) {
    return (
      <DesktopModal open={props.open} onClose={props.onCancel} maxWidth="max-w-md">
        <ReferralConfirmBody {...props} />
      </DesktopModal>
    );
  }

  return (
    <SheetShell open={props.open} onClose={props.onCancel}>
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-surface-dim" />
      </div>
      <ReferralConfirmBody {...props} />
    </SheetShell>
  );
}
