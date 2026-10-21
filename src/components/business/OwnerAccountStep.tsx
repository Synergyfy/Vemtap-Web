import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { TextField } from './FormPrimitives';
import { useAuth } from '../../context/AuthContext';
import { ownerAuthService, OTP_GATE_MESSAGE } from '../../services/ownerAuthService';
import { getProvisionalReferralCode } from '../../scripts/referralData';

type Phase = 'email' | 'code' | 'details';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

interface OwnerAccountStepProps {
  /** `register` creates a new owner; `upgrade` turns the signed-in customer into an owner. */
  mode: 'register' | 'upgrade';
  onDone: () => void;
  onBack: () => void;
}

/**
 * Creates the business owner account before setup continues, so every later
 * setup step can save to the API. Registration: email → 4-character code →
 * password + business name. Upgrade: business name (+ password confirmation).
 */
export function OwnerAccountStep({ mode, onDone, onBack }: OwnerAccountStepProps) {
  const { adoptSession } = useAuth();
  const [phase, setPhase] = useState<Phase>(mode === 'upgrade' ? 'details' : 'email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(message(e, 'Something went wrong. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (phase === 'email') {
      if (!EMAIL_RULE.test(email.trim())) return setError('Enter a valid email address.');
      if (!firstName.trim() || !lastName.trim()) return setError('Enter your first and last name.');
      void run(async () => {
        await ownerAuthService.requestOtp(email.trim(), { firstName: firstName.trim(), lastName: lastName.trim() });
        setPhase('code');
      });
      return;
    }

    if (phase === 'code') {
      if (code.trim().length !== 4) return setError('Enter the 4-character code from your email.');
      void run(async () => {
        await ownerAuthService.verifyOtp(email.trim(), code.trim());
        setPhase('details');
      });
      return;
    }

    if (!businessName.trim()) return setError('Enter your business name.');
    if (mode === 'register' && !PASSWORD_RULE.test(password))
      return setError('Use at least 8 characters with upper and lower case letters, a number and a symbol.');
    // A `?ref=` code from the invite link credits the referring business.
    const referralCode = getProvisionalReferralCode() || undefined;
    void run(async () => {
      try {
        const session =
          mode === 'register'
            ? await ownerAuthService.register({
                email: email.trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                businessName: businessName.trim(),
                referralCode,
              })
            : await ownerAuthService.upgrade({ businessName: businessName.trim(), password: password || undefined, referralCode });
        adoptSession(session);
        onDone();
      } catch (e) {
        // The code expired or was never verified: go back and ask for a new one.
        if (message(e, '').includes(OTP_GATE_MESSAGE)) {
          setPhase('code');
          throw new Error('Your code has expired. Request a new one and try again.');
        }
        throw e;
      }
    });
  };

  const title =
    mode === 'upgrade'
      ? 'Turn your account into a business account'
      : phase === 'email'
        ? 'Create your business account'
        : phase === 'code'
          ? 'Check your email'
          : 'Set up your sign-in';
  const subtitle =
    mode === 'upgrade'
      ? 'Your customer account stays as it is. You can switch between both any time.'
      : phase === 'email'
        ? 'You will use this account to run your business on VemTap.'
        : phase === 'code'
          ? `We sent a 4-character code to ${email.trim()}.`
          : 'Choose a password and tell us your business name.';

  return (
    <div className="w-full min-h-screen bg-surface flex items-center justify-center p-space-md sm:p-space-xl">
      <form onSubmit={submit} noValidate className="w-full max-w-md rounded-xl bg-surface-canvas shadow-xl p-space-lg sm:p-space-xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <Logo className="h-7 w-auto" />
          <button
            type="button"
            onClick={() => (phase === 'code' ? setPhase('email') : phase === 'details' && mode === 'register' ? setPhase('code') : onBack())}
            className="inline-flex items-center gap-1 font-label-md text-label-md text-text-secondary hover:text-text-primary"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading-lg text-heading-lg text-text-primary">{title}</h1>
          <p className="font-body-md text-body-md text-text-secondary">{subtitle}</p>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
            {error}
          </p>
        ) : null}

        {phase === 'email' ? (
          <>
            <div className="grid grid-cols-2 gap-space-sm">
              <TextField id="owner-first" label="First name" value={firstName} onChange={setFirstName} />
              <TextField id="owner-last" label="Last name" value={lastName} onChange={setLastName} />
            </div>
            <TextField id="owner-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@business.com" />
          </>
        ) : null}

        {phase === 'code' ? (
          <>
            <TextField id="owner-code" label="Code" value={code} onChange={(v) => setCode(v.trim().slice(0, 4))} placeholder="1234" />
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(async () => void (await ownerAuthService.requestOtp(email.trim(), { firstName, lastName })))}
              className="self-start font-label-md text-label-md text-primary hover:underline disabled:opacity-50"
            >
              Send a new code
            </button>
          </>
        ) : null}

        {phase === 'details' ? (
          <>
            <TextField id="owner-business" label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Green Terrace Cafe" />
            <TextField
              id="owner-password"
              label={mode === 'upgrade' ? 'Confirm your password (email sign-in only)' : 'Password'}
              type="password"
              value={password}
              onChange={setPassword}
              hint={mode === 'register' ? 'At least 8 characters with upper and lower case, a number and a symbol.' : undefined}
            />
          </>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary inline-flex items-center justify-center gap-space-xs disabled:opacity-60"
        >
          {busy ? 'Please wait…' : phase === 'email' ? 'Send code' : phase === 'code' ? 'Verify code' : mode === 'upgrade' ? 'Create business account' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
