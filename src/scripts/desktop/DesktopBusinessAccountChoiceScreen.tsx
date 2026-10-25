import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useProfile } from '../../context/ProfileContext';
import { BusinessSetupChrome } from './BusinessSetupChrome';

interface DesktopBusinessAccountChoiceScreenProps {
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

const maskEmail = (email: string) => {
  const at = email.indexOf('@');
  if (at <= 2) return email; // too short to mask meaningfully
  const user = email.slice(0, at);
  const domain = email.slice(at);
  return `${user.slice(0, 2)}***${user.slice(-2)}${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `•••••••${digits.slice(-4)}`;
};

/**
 * First step of business setup when the visitor is already a signed-in
 * consumer: choose whether to reuse the existing consumer account or register
 * a fresh, separate business identity. Reusing the account keeps it intact —
 * it only adds a business-owner capability.
 */
export function DesktopBusinessAccountChoiceScreen({
  onBack,
  onContinueWithAccount,
  onUseNewAccount,
  confirmation = 'demo-code',
}: DesktopBusinessAccountChoiceScreenProps) {
  const profile = useProfile();
  const [confirming, setConfirming] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
    if (!verifying) return undefined;
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
  }, [verifying, pinMode]);

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

  return (
    <BusinessSetupChrome activeNav="profile" onBrand={onBack}>
      <section className="w-full bg-surface py-space-xl lg:py-space-3xl min-h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <span className="font-label-md text-label-md text-text-secondary">Business Setup</span>
          </div>

          {!confirming ? (
            <>
              <div className="flex flex-col gap-3 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold w-fit">
                  <Icon name="storefront" className="text-[16px]" />
                  <span>VEMTAP FOR BUSINESS</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight">
                  Set up your business on VEMTAP
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  Choose which account you want to use for your business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="group w-full p-6 rounded-2xl bg-surface-canvas border-2 border-surface-subtle hover:border-primary shadow-sm transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon name="account_circle" className="text-[28px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">Continue with this account</h2>
                  <p className="font-body-md text-body-md text-text-secondary mt-1 leading-tight">
                    Use your existing consumer account and its verified contact information.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onUseNewAccount}
                  className="group w-full p-6 rounded-2xl bg-surface-canvas border-2 border-surface-subtle hover:border-primary shadow-sm transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-secondary group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center mb-4">
                    <Icon name="person_add" className="text-[28px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">Use a new account</h2>
                  <p className="font-body-md text-body-md text-text-secondary mt-1 leading-tight">
                    Register using Google or another email address.
                  </p>
                </button>
              </div>
            </>
          ) : verifying ? (
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-surface-container-low shadow-sm">
                <div className="w-16 h-16 rounded-full bg-surface-canvas flex items-center justify-center text-primary shadow-sm">
                  <Icon name={pinMode ? 'lock' : 'mark_email_read'} className="text-[34px]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                  <Icon name="verified_user" className="text-[18px]" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold">{pinMode ? 'Confirm your PIN' : 'Verify your email'}</h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-md">
                  {pinMode
                    ? 'Enter the 6-digit PIN you sign in with to add a business to this account.'
                    : 'To protect your business account, we sent a 6-digit verification code to'}
                </p>
                {!pinMode && (
                  <span className="font-label-lg text-label-lg text-text-primary font-semibold">
                    {profile.email ? maskEmail(profile.email) : 'your registered email'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 w-full max-w-md">
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
                      className={`w-[52px] h-[60px] rounded-xl border-2 text-center font-heading-md text-heading-md font-semibold select-none shadow-sm outline-none transition-all duration-150 caret-primary ${
                        digit
                          ? 'bg-surface-canvas text-text-primary border-primary shadow-sm'
                          : isActive
                            ? 'bg-surface-canvas text-text-primary border-primary ring-4 ring-primary/15 shadow-md'
                            : 'bg-surface-canvas text-text-tertiary border-outline-variant'
                      }`}
                    />
                  );
                })}
              </div>

              {!pinMode && (
              <p className="font-caption text-caption text-text-secondary -mt-3">
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

              <div className="w-full max-w-md flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!otpComplete || otpSending || submitting}
                  onClick={() => continueWithAccount(pinMode ? otpDigits.join('') : undefined)}
                  className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
                >
                  <span>{submitting ? 'Confirming…' : pinMode ? 'Confirm & Continue' : 'Verify & Continue'}</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setVerifying(false)}
                  className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
                >
                  Back to account confirmation
                </button>
              </div>

              {!pinMode && (
                <p className="font-caption text-caption text-text-tertiary max-w-sm">
                  Demo mode: any 6-digit code is accepted until the OTP service is connected.
                </p>
              )}
            </div>
          ) : (
<div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="person" className="text-[48px]" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold">
                  Confirm Business Owner Account
                </h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-md">
                  You are using your existing consumer profile to set up your business. Your consumer account stays
                  intact — this only adds a business-owner capability.
                </p>
              </div>

              <div className="w-full max-w-md p-6 rounded-2xl bg-surface-canvas border border-surface-subtle shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Full Name</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.fullName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Email</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.email ? maskEmail(profile.email) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Phone</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.phone ? maskPhone(profile.phone) : '—'}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => (confirmation === 'none' ? continueWithAccount() : setVerifying(true))}
                  className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                >
                  <span>Confirm &amp; Continue</span>
                  <Icon name="check_circle" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {error}
        </div>
      )}
    </BusinessSetupChrome>
  );
}