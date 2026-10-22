import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

interface DesktopVerifyEmailScreenProps {
  onBack: () => void;
  onContinue: (code: string) => Promise<void> | void;
  onEditEmail: () => void;
  onBusinessSetup: () => void;
  email?: string;
  onResend?: (email: string) => Promise<void> | void;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

const TRUST_BADGES = [
  { icon: 'verified_user', label: 'Safe & Verified Local Accounts' },
  { icon: 'security', label: 'NDPR & Encrypted Two-Factor Safety' },
  { icon: 'lock_clock', label: 'Exclusive unlocked pass held for 15 minutes' },
];

const OTP_INPUT_CLASS =
  'w-full h-14 sm:h-16 text-center font-display-hero text-display-hero text-text-primary bg-surface-canvas border-2 border-outline-variant rounded-xl shadow-sm select-all caret-primary transition-all focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 focus:shadow-md';

export function DesktopVerifyEmailScreen({
  onBack,
  onContinue,
  onEditEmail,
  onBusinessSetup,
  email = '',
  onResend,
}: DesktopVerifyEmailScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState<'idle' | 'verifying'>('idle');
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');
  const complete = code.length === OTP_LENGTH;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complete || status !== 'idle') return;
    setError(null);
    setStatus('verifying');

    try {
      await Promise.resolve(onContinue(code));
    } catch (continueError) {
      setError(continueError instanceof Error ? continueError.message : 'The verification code is invalid. Please try again.');
      setStatus('idle');
    }
  };

  const resendCode = async () => {
    if (seconds > 0) return;
    setError(null);
    setSeconds(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
    if (onResend && email) {
      try {
        await Promise.resolve(onResend(email));
      } catch (resendError) {
        setError(resendError instanceof Error ? resendError.message : 'We could not resend your code. Please try again.');
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl bg-surface-subtle selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl my-auto py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-xl bg-surface-canvas">
            <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-on-primary-fixed-variant p-space-xl lg:p-space-3xl flex flex-col justify-between relative overflow-hidden text-on-primary">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-space-xl">
                <Logo variant="full-white" className="h-8 w-auto self-start" />

                <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md w-fit">
                  <span className="w-2 h-2 rounded-full bg-badge-discount-bg animate-pulse" />
                  <span className="font-label-sm text-label-sm text-white">Step 2 of 3 • Email Verification</span>
                </div>

                <div className="flex flex-col gap-space-sm pt-space-xs">
                  <h1 className="font-display-hero text-display-hero text-white leading-tight">
                    One Tap.
                    <br />
                    Lifetime Perks.
                  </h1>
                  <p className="font-body-md text-body-md text-secondary-fixed max-w-sm">
                    Protecting your claimed deals, secret local discounts, and instant bookings with real-time
                    verification.
                  </p>
                </div>
              </div>

              <div className="relative z-10 my-space-xl flex flex-col gap-space-md">
                <div className="p-space-md rounded-xl bg-white/10 backdrop-blur-lg shadow-md flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Icon name="local_mall" filled className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-label-md text-label-md text-white font-semibold truncate">
                          Artisan Roast &amp; Bakery
                        </span>
                        <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-bold whitespace-nowrap">
                          -25% OFF
                        </span>
                      </div>
                      <p className="font-caption text-caption text-secondary-fixed flex items-center gap-1">
                        <Icon name="pin_drop" className="text-xs" /> 0.3 miles away • Reserved on verify
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-badge-discount-bg h-full w-2/3 rounded-full transition-all duration-700" />
                  </div>
                  <div className="flex justify-between items-center text-secondary-fixed font-caption text-caption">
                    <span>Account setup</span>
                    <span className="text-white font-medium">66% Complete</span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  {TRUST_BADGES.map((badge) => (
                    <div key={badge.label} className="flex items-center gap-space-sm text-secondary-fixed font-caption text-caption">
                      <Icon name={badge.icon} filled className="text-badge-discount-bg text-base" />
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-space-md flex items-center justify-between font-caption text-caption text-secondary-fixed">
                <span>Trusted by 45,000+ local foodies</span>
                <div className="flex items-center gap-1">
                  <Icon name="star" filled className="text-amber-300 text-sm" />
                  <span className="font-semibold text-white">4.9</span>
                  <span>App rating</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-surface-canvas p-space-xl lg:p-space-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xl">
                  <button
                    className="inline-flex items-center gap-space-2xs font-button-secondary text-button-secondary text-text-secondary hover:text-text-primary transition-colors"
                    type="button"
                    onClick={onBack}
                  >
                    <Icon name="arrow_back" className="text-lg" />
                    <span>Back to Email</span>
                  </button>
                  <div aria-label="Registration Progress" className="flex items-center gap-2">
                    <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                  </div>
                </div>

                <div className="flex flex-col gap-space-md max-w-xl">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-tint-blue text-primary shadow-sm self-start">
                    <Icon name="mark_email_read" filled className="text-3xl" />
                  </div>

                  <div className="flex flex-col gap-space-2xs">
                    <h2 className="font-heading-lg text-heading-lg text-text-primary">Verify your email</h2>
                    <div className="flex items-center flex-wrap gap-2 text-text-secondary font-body-md text-body-md">
                      <span>We sent a 6-digit verification code to</span>
                      <span className="font-semibold text-text-primary bg-surface-subtle px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm">
                        {email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'your email'}
                        <button
                          className="text-primary hover:text-on-primary-fixed-variant transition-colors"
                          title="Change email"
                          type="button"
                          onClick={onEditEmail}
                        >
                          <Icon name="edit" className="text-base" />
                        </button>
                      </span>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-space-sm py-space-xs text-red-700 font-body-md text-body-md">
                      {error}
                    </div>
                  ) : null}
                  <form className="pt-space-md flex flex-col gap-space-lg" onSubmit={handleSubmit}>
                    <div>
                      <label className="block font-label-md text-label-md text-text-primary mb-space-sm">
                        Enter 6-digit confirmation code
                      </label>
                      <div className="grid grid-cols-6 gap-2 sm:gap-space-sm" onPaste={handlePaste}>
                        {digits.map((digit, index) => (
                          <input
                            key={index}
                            autoFocus={index === 0}
                            ref={(element) => {
                              inputsRef.current[index] = element;
                            }}
                            aria-label={`Digit ${index + 1}`}
                            autoComplete="one-time-code"
                            className={`${OTP_INPUT_CLASS} ${
                              digit
                                ? 'border-primary-container shadow-sm'
                                : 'border-outline-variant'
                            }`}
                            inputMode="numeric"
                            maxLength={1}
                            pattern="[0-9]*"
                            type="text"
                            value={digit}
                            onChange={(event) => handleChange(index, event.target.value)}
                            onKeyDown={(event) => handleKeyDown(index, event)}
                            onFocus={(event) => event.currentTarget.select()}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <Icon name="schedule" className="text-base" />
                        Didn&apos;t receive it?
                      </span>
                      <button
                        className={`font-button-secondary text-button-secondary flex items-center gap-1 ${
                          seconds > 0
                            ? 'text-text-tertiary cursor-not-allowed'
                            : 'text-primary hover:underline cursor-pointer'
                        }`}
                        disabled={seconds > 0}
                        type="button"
                        onClick={resendCode}
                      >
                        <span>Resend code</span>
                        <span className="tabular-nums font-semibold text-text-secondary">
                          {seconds > 0 ? `(0:${String(seconds).padStart(2, '0')})` : ''}
                        </span>
                      </button>
                    </div>

                    <div className="p-space-md rounded-xl bg-surface-subtle flex gap-space-sm items-start shadow-sm">
                      <Icon name="info" filled className="text-primary text-xl mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-1 text-text-secondary font-caption text-caption">
                        <span className="font-label-sm text-label-sm text-text-primary block">
                          Instant inbox checklist
                        </span>
                        <p className="leading-relaxed">
                          Check your spam, junk, or promotions folder if you don&apos;t see the code in your main inbox
                          within a few moments. Codes expire after 10 minutes.
                        </p>
                      </div>
                    </div>

                    <div className="pt-space-xs flex flex-col gap-space-md">
                      <button
                        className="w-full h-[54px] rounded-2xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg hover:bg-on-primary-fixed-variant active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-40"
                        type="submit"
                        disabled={!complete || status !== 'idle'}
                      >
                        {status === 'idle' ? (
                          <>
                            <span>Continue</span>
                            <Icon name="arrow_forward" className="text-lg" />
                          </>
                        ) : (
                          <>
                            <Icon name="progress_activity" className="text-lg animate-spin" />
                            <span>Verifying...</span>
                          </>
                        )}
                      </button>
                      <div className="text-center">
                        <button
                          className="font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant transition-colors py-2 inline-block"
                          type="button"
                          onClick={onEditEmail}
                        >
                          Use a different email address
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="pt-space-xl mt-space-xl bg-surface-subtle/50 -mx-space-xl lg:-mx-space-3xl -mb-space-xl lg:-mb-space-3xl p-space-md px-space-xl lg:px-space-3xl flex flex-col sm:flex-row items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-2xs text-text-secondary font-caption text-caption">
                  <Icon name="storefront" className="text-base" />
                  <span>Own a local business or storefront?</span>
                </div>
                <button
                  className="font-label-sm text-label-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors inline-flex items-center gap-1"
                  type="button"
                  onClick={onBusinessSetup}
                >
                  <span>Set up your business on VEMTAP</span>
                  <Icon name="arrow_forward" className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
