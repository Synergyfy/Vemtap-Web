import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface VerifyEmailScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onEditEmail: () => void;
}

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

type Status = 'idle' | 'verifying';

export function VerifyEmailScreen({ onBack, onContinue, onEditEmail }: VerifyEmailScreenProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const email = 'jo****@gmail.com';

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const focusInput = (index: number) => {
    const next = Math.max(0, Math.min(index, CODE_LENGTH - 1));
    inputsRef.current[next]?.focus();
    setActiveIndex(next);
  };

  const handleChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, '');
    const next = [...digits];

    if (!value) {
      next[index] = '';
      setDigits(next);
      setActiveIndex(index);
      return;
    }

    next[index] = value.slice(-1);
    setDigits(next);
    const landing = index < CODE_LENGTH - 1 ? index + 1 : index;
    window.setTimeout(() => focusInput(landing), 0);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    window.setTimeout(() => focusInput(Math.min(pasted.length, CODE_LENGTH - 1)), 0);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setDigits(Array(CODE_LENGTH).fill(''));
    setSecondsLeft(RESEND_SECONDS);
    window.setTimeout(() => focusInput(0), 0);
  };

  const handleContinue = () => {
    if (!isComplete || status !== 'idle') return;
    setStatus('verifying');
    window.setTimeout(onContinue, 900);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Otp Code Verification" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-xl flex-1">
        <div className="flex items-center justify-between pt-space-sm pb-space-md">
          <div className="flex items-center gap-space-2xs">
            <span className="w-6 h-1.5 rounded-full bg-primary-container" />
            <span className="w-6 h-1.5 rounded-full bg-primary-container" />
            <span className="w-2 h-1.5 rounded-full bg-surface-variant" />
          </div>
          <span className="font-label-sm text-label-sm text-text-secondary">Step 2 of 3</span>
        </div>

        <div className="flex flex-col items-center text-center mt-space-sm mb-space-lg">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-low shadow-sm mb-space-md">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-container/10 to-transparent" />
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                mark_email_read
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
            </div>
          </div>
          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-space-2xs">
            Verify your email
          </h2>
          <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">
            We sent a 6-digit verification code to
          </p>

          <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-subtle shadow-sm">
            <span className="font-label-md text-label-md text-text-primary font-semibold">{email}</span>
            <button
              aria-label="Edit email address"
              type="button"
              onClick={onEditEmail}
              className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-surface-tint-blue active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
        </div>

        <div className="w-full my-space-xs">
          <div className="flex items-center justify-between gap-2 max-w-[345px] mx-auto">
            {digits.map((digit, index) => {
              const isActive = activeIndex === index && digit === '';
              return (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  aria-label={`Verification digit ${index + 1}`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={CODE_LENGTH}
                  value={digit}
                  onFocus={() => setActiveIndex(index)}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className={`w-[48px] h-[56px] rounded-xl text-center font-heading-md text-heading-md font-semibold select-none shadow-sm outline-none transition-all duration-150 ${
                    digit
                      ? 'bg-surface-subtle text-text-primary'
                      : isActive
                        ? 'bg-surface-canvas text-primary-container shadow-md'
                        : 'bg-surface-container-low text-text-tertiary'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-space-md text-center">
            <span className="font-body-md text-body-md text-text-secondary">Didn't receive it?</span>
            <button
              className={`font-label-md text-label-md text-primary-container font-semibold flex items-center gap-1 active:scale-95 transition-transform ${
                secondsLeft === 0 ? 'underline' : 'cursor-default'
              }`}
              id="resend-btn"
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0}
            >
              <span>Resend code</span>
              {secondsLeft > 0 && (
                <span className="font-caption text-caption text-text-tertiary font-normal">
                  (0:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft})
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-space-lg w-full bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-xs shadow-sm">
          <span
            className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            info
          </span>
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            Check your spam, junk, or promotions folder if you don't see the code in your main inbox within a few
            moments.
          </p>
        </div>

        <div className="w-full mt-space-xl flex flex-col gap-space-md">
          <button
            className="w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(6,108,244,0.35)] active:bg-primary active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            type="button"
            onClick={handleContinue}
            disabled={!isComplete || status !== 'idle'}
          >
            {status === 'idle' ? (
              <>
                <span>Continue</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Verifying...</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-center">
            <button
              className="font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary active:scale-95 transition-colors py-space-xs px-space-sm"
              type="button"
              onClick={onEditEmail}
            >
              Use a different email address
            </button>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
