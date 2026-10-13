import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon } from '../ui/Icon';
import { SheetShell } from './SheetShell';

export interface RecipientVerificationSheetProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  onBack: () => void;
}

export function RecipientVerificationSheet({ open, onClose, onVerify, onBack }: RecipientVerificationSheetProps) {
  const [digits, setDigits] = useState(['5', '8', '2', '9', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(4);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    setFocusedIndex(index);
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const digit = cleaned.slice(-1);
    setDigits((prev) => prev.map((item, i) => (i === index ? digit : item)));
    if (digit && index < 5) focusInput(index + 1);
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
            <span>Recipient Verification</span>
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
          <h1 className="text-[26px] leading-tight font-bold text-text-primary tracking-tight mb-2">
            Verify recipient's email
          </h1>
          <p className="text-[14px] leading-relaxed text-text-secondary font-normal">
            We sent a 6-digit verification code to{' '}
            <span className="font-semibold text-text-primary">recipient@example.com</span> to confirm their identity for
            this claim voucher.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-primary-container hover:text-primary active:opacity-80 transition-opacity"
          >
            <Icon name="edit" className="text-[14px]" />
            <span>Change email address</span>
          </button>
        </div>

        <section className="mb-6">
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Enter 6-digit authorization code
          </label>
          <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                aria-label={`Digit ${index + 1}`}
                className={
                  focusedIndex === index
                    ? 'otp-input w-full aspect-square text-center text-xl font-bold text-text-primary bg-surface-canvas border-2 border-primary-container rounded-xl focus:outline-none ring-2 ring-primary-container/10 transition-all caret-primary-container'
                    : 'otp-input w-full aspect-square text-center text-xl font-bold text-text-primary bg-surface-subtle/70 border border-border-subtle rounded-xl focus:bg-surface-canvas focus:border-primary-container focus:outline-none transition-all'
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
            <button type="button" className="font-semibold text-text-tertiary cursor-not-allowed flex items-center gap-1">
              <span>Resend code</span>
              <span className="text-primary-container font-medium">(0:45)</span>
            </button>
          </div>
        </section>

        <aside className="bg-surface-tint-blue/70 border border-border-active rounded-xl p-3.5 flex items-start gap-3 mb-6">
          <div className="mt-0.5 text-primary-container shrink-0">
            <Icon name="info" className="text-[16px]" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-normal">
            The recipient must verify this code to authorize claiming the deal and registering the redemption voucher
            directly under their name.
          </p>
        </aside>

        <div className="flex flex-col items-center gap-3 w-full">
          <button
            type="button"
            onClick={onVerify}
            className="w-full h-[52px] bg-primary-container hover:bg-primary active:bg-primary text-on-primary font-semibold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 transition-all"
          >
            <span>Verify &amp; Continue</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors text-center"
          >
            Back to recipient details
          </button>
        </div>

        <div className="w-full h-2" />
      </div>
    </SheetShell>
  );
}
