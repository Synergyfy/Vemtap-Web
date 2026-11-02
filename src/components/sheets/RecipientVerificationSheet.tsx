import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface RecipientVerificationSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called with the code the holder typed. */
  onVerify: (code: string) => void;
  /** Sends a new code. */
  onResend: () => void;
  /** Why the last step failed. */
  error?: string | null;
  busy?: boolean;
  onBack: () => void;
  /** Recipient being verified; none means the customer is claiming for themselves. */
  recipient?: { name: string; email: string; phone?: string } | null;
  /** The email the code went to. */
  target?: string;
}

export function RecipientVerificationSheet({
  open,
  onClose,
  onVerify,
  onBack,
  recipient,
  target,
  onResend,
  error,
  busy,
}: RecipientVerificationSheetProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const maskedTarget = target ?? recipient?.email ?? '';
  const code = digits.join('');

  const focusInput = (index: number) => {
    setFocusedIndex(index);
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const digit = cleaned.slice(-1);
    setDigits((prev) => prev.map((item, i) => (i === index ? digit : item)));
    if (digit && index < 3) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="w-full flex justify-center pt-3 pb-3">
        <div className="w-12 h-1.5 bg-outline-variant rounded-full" />
      </div>

      <div className="px-6 pt-1 pb-8">
        <div className="flex items-center justify-between mt-1 mb-5">
          <div className="inline-flex items-center gap-1.5 bg-surface-tint-blue/80 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider text-primary-container uppercase">
            <Icon name="verified_user" className="text-[14px]" />
            <span>{recipient ? 'Recipient Verification' : 'Claim Verification'}</span>
          </div>
          <button
            aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>

        <div className="mb-5">
          <h1 className="text-heading-lg font-bold text-text-primary tracking-tight mb-2">
            {recipient ? "Verify recipient's email" : 'Enter your claim code'}
          </h1>
          <p className="text-body-md leading-relaxed text-text-secondary font-normal">
            We sent a 4-digit code to <span className="font-semibold text-text-primary">{maskedTarget}</span>
            {recipient ? ' to confirm their identity for this voucher.' : ' to confirm this voucher.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-primary-container hover:text-primary active:opacity-80 transition-opacity"
          >
            <Icon name="edit" className="text-[14px]" />
            <span>{recipient ? 'Change contact details' : 'Cancel'}</span>
          </button>
        </div>

        <section className="mb-6">
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Enter 4-digit code
          </label>
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                aria-label={`Digit ${index + 1}`}
                className={
                  focusedIndex === index
                    ? 'otp-input w-full aspect-square text-center text-xl font-bold text-text-primary bg-surface-canvas border-2 border-primary-container rounded-xl focus:outline-none ring-4 ring-primary-container/15 transition-all caret-primary-container'
                    : `otp-input w-full aspect-square text-center text-xl font-bold rounded-xl border-2 focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 transition-all ${
                        digit
                          ? 'text-text-primary bg-surface-canvas border-primary-container shadow-sm'
                          : 'text-text-tertiary bg-surface-canvas border-outline-variant'
                      }`
                }
                inputMode="numeric"
                maxLength={1}
                type="text"
                value={digit}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                onChange={(event) => handleChange(index, event.target.value)}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(event) => handleKeyDown(index, event)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3.5 px-0.5 text-xs">
            <span className="text-text-tertiary">Didn't receive the email?</span>
            <button type="button" disabled={busy} onClick={onResend} className="font-semibold text-primary-container flex items-center gap-1 disabled:opacity-50">
              <span>Resend code</span>
            </button>
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-xs font-medium text-error">
              {error}
            </p>
          ) : null}
        </section>

        <aside className="bg-surface-tint-blue/70 border border-border-active rounded-xl p-3.5 flex items-start gap-3 mb-6">
          <div className="mt-0.5 text-primary-container shrink-0">
            <Icon name="info" className="text-[16px]" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-normal">
            {recipient
              ? 'The recipient must share this code with you. The voucher is issued under their name.'
              : 'The voucher is issued to your account once this code is confirmed.'}
          </p>
        </aside>

        <div className="flex flex-col items-center gap-3 w-full">
          <button
            type="button"
            disabled={code.length !== 4 || busy}
            onClick={() => onVerify(code)}
            className="w-full h-[52px] bg-primary-container hover:bg-primary active:bg-primary text-on-primary font-semibold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all disabled:opacity-50"
          >
            <span>{busy ? 'Confirming…' : 'Verify & Continue'}</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors text-center"
          >
            {recipient ? 'Back to recipient details' : 'Back to deal'}
          </button>
        </div>

        <div className="w-full h-2" />
      </div>
    </SheetShell>
  );
}
