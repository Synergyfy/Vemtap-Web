import { useEffect, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useProfile } from '../context/ProfileContext';

interface BusinessAccountChoiceScreenProps {
  onBack: () => void;
  /** Receives the confirmed PIN when `confirmation` is `pin`. */
  onContinueWithAccount: (pin?: string) => Promise<void> | void;
  onUseNewAccount: () => void;
  /** `demo-code`: sample email code (demo); `pin`: confirm the sign-in PIN; `none`: no extra step. */
  confirmation?: 'demo-code' | 'pin' | 'none';
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;
/** Simulated delivery latency for the frontend-only OTP step. */
const SEND_DELAY_MS = 900;

export function BusinessAccountChoiceScreen({
  onBack,
  onContinueWithAccount,
  onUseNewAccount,
  confirmation = 'demo-code',
}: BusinessAccountChoiceScreenProps) {
  const profile = useProfile();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [otpActiveIndex, setOtpActiveIndex] = useState(0);
  const [otpSending, setOtpSending] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);
  // Live: a PIN account confirms its PIN to add a business (`POST /auth/upgrade-to-owner`);
  // Google accounts have no PIN and continue straight away. Demo keeps the sample email code.
  const pinMode = confirmation === 'pin';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!error) return undefined;
    const timeout = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [error]);
  const continueWithAccount = (pin?: string) => {
    if (submitting) return;
    setSubmitting(true);
    Promise.resolve(onContinueWithAccount(pin))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not add a business to this account.'))
      .finally(() => setSubmitting(false));
  };

  // Frontend stub: "send" the OTP when the step opens, then run the resend
  // window. The real dispatch/verification hooks up to the backend later.
  useEffect(() => {
    if (!showOtp) return undefined;
    if (pinMode) {
      setOtpSending(false);
      return undefined;
    }
    setOtpSending(true);
    setSecondsLeft(RESEND_SECONDS);
    const sendTimer = window.setTimeout(() => setOtpSending(false), SEND_DELAY_MS);
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => {
      window.clearTimeout(sendTimer);
      window.clearInterval(interval);
    };
  }, [showOtp, pinMode]);

  const handleResend = () => {
    if (secondsLeft > 0 || otpSending) return;
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpSending(true);
    setSecondsLeft(RESEND_SECONDS);
    window.setTimeout(() => setOtpSending(false), SEND_DELAY_MS);
    otpInputs.current[0]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const chars = value.replace(/\D/g, '');
    const next = [...otpDigits];
    if (!chars) {
      next[index] = '';
      setOtpDigits(next);
      return;
    }
    chars.split('').forEach((char, offset) => {
      if (index + offset < OTP_LENGTH) next[index + offset] = char;
    });
    setOtpDigits(next);
    otpInputs.current[Math.min(index + chars.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      event.preventDefault();
      const next = [...otpDigits];
      next[index - 1] = '';
      setOtpDigits(next);
      otpInputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      otpInputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputs.current[index + 1]?.focus();
    }
  };

  const otpComplete = otpDigits.every((digit) => digit !== '');

  const maskEmail = (email: string) => {
    if (!email) return '—';
    const at = email.indexOf('@');
    if (at <= 2) return email;
    const user = email.slice(0, at);
    const domain = email.slice(at);
    return `${user.slice(0, 2)}***${user.slice(-2)}${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return 'Not provided';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    return `•••••••${digits.slice(-4)}`;
  };

  if (showOtp) {
    return (
      <AppScreen>
        <ScreenHeader title={pinMode ? 'Confirm PIN' : 'Email Verification'} onBack={() => setShowOtp(false)} />
        <div className="px-margin py-space-xl flex flex-col items-center text-center gap-space-lg">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-low shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-sm">
              <Icon name={pinMode ? 'lock' : 'mark_email_read'} className="text-[30px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
              <Icon name="verified_user" className="text-[16px]" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-heading-md text-heading-md text-on-surface font-bold">{pinMode ? 'Confirm your PIN' : 'Verify your email'}</h2>
            <p className="font-body-md text-body-md text-text-secondary max-w-[300px]">
              {pinMode
                ? 'Enter the 6-digit PIN you sign in with to add a business to this account.'
                : 'To protect your business account, we sent a 6-digit code to'}
            </p>
            {!pinMode && (
              <span className="font-label-md text-label-md text-text-primary font-semibold">
                {maskEmail(profile.email)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 w-full max-w-[345px]">
            {otpDigits.map((digit, index) => {
              const isActive = otpActiveIndex === index && digit === '';
              return (
                <input
                  key={index}
                  ref={(element) => {
                    otpInputs.current[index] = element;
                  }}
                  aria-label={`${pinMode ? 'PIN' : 'Verification'} digit ${index + 1}`}
                  type={pinMode ? 'password' : 'text'}
                  inputMode="numeric"
                  autoComplete={pinMode ? 'off' : 'one-time-code'}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onFocus={() => setOtpActiveIndex(index)}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  className={`w-[48px] h-[56px] rounded-xl border-2 text-center font-heading-md text-heading-md font-semibold select-none shadow-sm outline-none transition-all duration-150 caret-primary-container ${
                    digit
                      ? 'bg-surface-canvas text-text-primary border-primary-container shadow-sm'
                      : isActive
                        ? 'bg-surface-canvas text-text-primary border-primary-container ring-4 ring-primary-container/15 shadow-md'
                        : 'bg-surface-canvas text-text-tertiary border-outline-variant'
                  }`}
                />
              );
            })}
          </div>

          {!pinMode && (
          <p className="font-caption text-caption text-text-secondary -mt-space-sm">
            {otpSending ? (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="pending" className="text-[14px]" />
                Sending code…
              </span>
            ) : (
              <>
                Didn’t get it?{' '}
                <button
                  className={`font-semibold ${
                    secondsLeft > 0 ? 'text-text-tertiary' : 'text-primary hover:underline'
                  }`}
                  disabled={secondsLeft > 0}
                  type="button"
                  onClick={handleResend}
                >
                  Resend code{secondsLeft > 0 && ` (0:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft})`}
                </button>
              </>
            )}
          </p>
          )}

          <div className="w-full max-w-sm flex flex-col gap-3">
            <button
              className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
              disabled={!otpComplete || otpSending || submitting}
              type="button"
              onClick={() => continueWithAccount(pinMode ? otpDigits.join('') : undefined)}
            >
              <span>{submitting ? 'Confirming…' : pinMode ? 'Confirm & Continue' : 'Verify & Continue'}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <button
              className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
              type="button"
              onClick={() => setShowOtp(false)}
            >
              Back
            </button>
          </div>

          {!pinMode && (
            <p className="font-caption text-caption text-text-tertiary max-w-[300px]">
              Demo mode: any 6-digit code is accepted until the OTP service is connected.
            </p>
          )}
        </div>
      </AppScreen>
    );
  }

  if (showConfirmation) {
    return (
      <AppScreen>
        <ScreenHeader title="Confirm Account" onBack={() => setShowConfirmation(false)} />
        <div className="px-margin py-space-xl flex flex-col items-center text-center gap-space-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="person" className="text-[40px]" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading-md text-heading-md text-on-surface font-bold">
              Confirm Business Owner Account
            </h2>
            <p className="font-body-md text-body-md text-text-secondary">
              You are using your existing consumer profile to set up your business.
            </p>
          </div>

          <div className="w-full max-w-sm p-space-md rounded-3xl bg-surface-container border border-surface-variant flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Full Name</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">{profile.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Email</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {maskEmail(profile.email)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Phone</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {maskPhone(profile.phone || 'Not provided')}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
            <button
              className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
              type="button"
              onClick={() => (confirmation === 'none' ? continueWithAccount() : setShowOtp(true))}
            >
              <span>Confirm &amp; Continue</span>
              <Icon name="check_circle" className="text-[20px]" />
            </button>
            <button
              className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
              type="button"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Business Setup" onBack={onBack} />
      <div className="px-margin py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-2">
          <h1 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
            Set up your business on VEMTAP
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Choose which account you want to use for your business.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            className="w-full p-space-md rounded-3xl bg-surface-canvas border-2 border-transparent hover:border-primary shadow-sm transition-all text-left group active:scale-[0.99]"
            type="button"
            onClick={() => setShowConfirmation(true)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon name="account_circle" className="text-[28px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                  Continue with this account
                </span>
                <span className="font-body-md text-body-md text-text-secondary leading-tight">
                  Use your existing consumer account and its verified contact information.
                </span>
              </div>
            </div>
          </button>

          <button
            className="w-full p-space-md rounded-3xl bg-surface-canvas border-2 border-transparent hover:border-primary shadow-sm transition-all text-left group active:scale-[0.99]"
            type="button"
            onClick={onUseNewAccount}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon name="person_add" className="text-[28px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                  Use a new account
                </span>
                <span className="font-body-md text-body-md text-text-secondary leading-tight">
                  Register using Google or another email address.
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </AppScreen>
  );
}
