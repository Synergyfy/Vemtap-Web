import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { authService } from '../../services/authService';
import { hasApiConfig } from '../../services/api/client';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ForgotPinPhase = 'email' | 'code' | 'done';

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, CODE_LENGTH);

/**
 * PIN reset for customers and owners, shared by the mobile-web and desktop
 * screens. Two API calls: POST /auth/customer/pin/forgot sends a 6-digit code,
 * then POST /auth/customer/pin/reset verifies it and stores the new PIN.
 * Demo mode (no API) walks the same steps without sending anything.
 */
export function useForgotPin(initialEmail = '') {
  const [phase, setPhase] = useState<ForgotPinPhase>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(id);
  }, [error]);

  useEffect(() => {
    if (phase !== 'code' || timeLeft <= 0) return;
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, timeLeft]);

  const sendCode = async () => {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Enter the email address on your Vemtap account.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (hasApiConfig()) await authService.requestPinReset({ email: trimmed });
      setPhase('code');
      setTimeLeft(RESEND_SECONDS);
    } catch (e) {
      setError(errorMessage(e, 'We could not send a reset code. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (hasApiConfig()) await authService.resetPin({ email: email.trim(), otp: code, newPin });
      setPhase('done');
    } catch (e) {
      setError(errorMessage(e, 'That code did not work. Check it and try again.'));
    } finally {
      setBusy(false);
    }
  };

  const pinsComplete = newPin.length === CODE_LENGTH && confirmPin.length === CODE_LENGTH;
  const pinMismatch = pinsComplete && newPin !== confirmPin;
  const canSubmit = code.length === CODE_LENGTH && pinsComplete && !pinMismatch && !busy;

  return {
    phase,
    setPhase,
    email,
    setEmail,
    code,
    setCode: (v: string) => setCode(digitsOnly(v)),
    newPin,
    setNewPin: (v: string) => setNewPin(digitsOnly(v)),
    confirmPin,
    setConfirmPin: (v: string) => setConfirmPin(digitsOnly(v)),
    busy,
    error,
    timeLeft,
    pinMismatch,
    canSubmit,
    sendCode,
    submit,
  };
}

export type ForgotPinState = ReturnType<typeof useForgotPin>;

const inputClass =
  'w-full h-[52px] px-space-md bg-surface-container-lowest text-text-primary rounded-xl font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue shadow-sm transition-colors';

const submitClass =
  'w-full h-[54px] bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-transform duration-150 disabled:opacity-60 disabled:cursor-not-allowed';

function PinField({
  id,
  label,
  value,
  onChange,
  visible,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <label className="font-label-md text-label-md text-text-primary" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${inputClass} tracking-[0.5em]`}
        inputMode="numeric"
        autoComplete={autoComplete}
        maxLength={CODE_LENGTH}
        placeholder="••••••"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function ForgotPinForm({ state, onBackToSignIn }: { state: ForgotPinState; onBackToSignIn: () => void }) {
  const [pinVisible, setPinVisible] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.busy) return;
    if (state.phase === 'email') void state.sendCode();
    else if (state.canSubmit) void state.submit();
  };

  if (state.phase === 'done') {
    return (
      <div className="flex flex-col items-center text-center gap-space-md py-space-lg">
        <span className="w-16 h-16 rounded-full bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
          <Icon name="check_circle" filled className="text-[36px]" />
        </span>
        <div className="flex flex-col gap-space-2xs">
          <h2 className="font-heading-md text-heading-md text-text-primary">PIN updated</h2>
          <p className="font-body-md text-body-md text-text-secondary">
            Your new PIN is ready. Sign in with {state.email.trim()} to continue.
          </p>
        </div>
        <button type="button" className={submitClass} onClick={onBackToSignIn}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-space-md" onSubmit={handleSubmit} noValidate>
      {state.error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {state.error}
        </div>
      )}

      {state.phase === 'email' ? (
        <div className="flex flex-col gap-space-2xs">
          <label className="font-label-md text-label-md text-text-primary" htmlFor="forgot-pin-email">
            Email address
          </label>
          <input
            id="forgot-pin-email"
            className={inputClass}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={state.email}
            onChange={(event) => state.setEmail(event.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-space-2xs">
            <label className="font-label-md text-label-md text-text-primary" htmlFor="forgot-pin-code">
              6-digit code
            </label>
            <input
              id="forgot-pin-code"
              className={`${inputClass} tracking-[0.5em] text-center`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              placeholder="000000"
              value={state.code}
              onChange={(event) => state.setCode(event.target.value)}
              autoFocus
            />
            <div className="flex items-center justify-center gap-space-2xs font-body-md text-body-md text-text-secondary">
              <span>Didn't get it?</span>
              <button
                type="button"
                className="text-primary font-label-md text-label-md disabled:text-text-tertiary"
                disabled={state.timeLeft > 0 || state.busy}
                onClick={() => void state.sendCode()}
              >
                {state.timeLeft > 0 ? `Resend in ${state.timeLeft}s` : 'Resend code'}
              </button>
            </div>
          </div>

          <PinField
            id="forgot-pin-new"
            label="New 6-digit PIN"
            value={state.newPin}
            onChange={state.setNewPin}
            visible={pinVisible}
            autoComplete="new-password"
          />
          <PinField
            id="forgot-pin-confirm"
            label="Confirm new PIN"
            value={state.confirmPin}
            onChange={state.setConfirmPin}
            visible={pinVisible}
            autoComplete="new-password"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-space-2xs font-label-sm text-label-sm text-text-secondary"
              onClick={() => setPinVisible((v) => !v)}
            >
              <Icon name={pinVisible ? 'visibility_off' : 'visibility'} className="text-[18px]" />
              {pinVisible ? 'Hide PIN' : 'Show PIN'}
            </button>
            {state.pinMismatch ? (
              <span className="font-label-sm text-label-sm text-red-600">PINs don't match</span>
            ) : null}
          </div>
        </>
      )}

      <button
        type="submit"
        className={submitClass}
        disabled={state.busy || (state.phase === 'code' && !state.canSubmit)}
      >
        {state.busy ? 'Please wait…' : state.phase === 'email' ? 'Send reset code' : 'Reset PIN'}
      </button>

      <button
        type="button"
        className="font-label-md text-label-md text-primary hover:underline self-center"
        onClick={onBackToSignIn}
      >
        Back to sign in
      </button>
    </form>
  );
}

export function forgotPinSubtitle(state: ForgotPinState) {
  return state.phase === 'email'
    ? "Enter your account email and we'll send a 6-digit code to reset your PIN."
    : `We sent a 6-digit code to ${state.email.trim()}. Enter it below with your new PIN.`;
}
