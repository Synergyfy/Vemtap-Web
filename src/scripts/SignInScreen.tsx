import { useState, type FormEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';

interface SignInScreenProps {
  onBack: () => void;
  onSignIn: (credentials: { identifier: string; password: string }) => void;
  onGoogleSignIn: () => void;
  onCreateAccount: () => void;
  onBusinessRegister: () => void;
  onCustomerSignIn: () => void;
  onBusinessSignIn: () => void;
}

type Status = 'idle' | 'submitting';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function SignInScreen({
  onBack,
  onSignIn,
  onGoogleSignIn,
  onCreateAccount,
  onBusinessRegister,
  onCustomerSignIn,
  onBusinessSignIn,
}: SignInScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [googleStatus, setGoogleStatus] = useState<Status>('idle');

  const busy = status !== 'idle' || googleStatus !== 'idle';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const identifier = form.elements.namedItem('identifier') as HTMLInputElement | null;
    const credential = form.elements.namedItem('security-credential') as HTMLInputElement | null;
    if (!identifier?.value.trim()) {
      identifier?.focus();
      return;
    }
    if (!credential?.value) {
      credential?.focus();
      return;
    }
    setStatus('submitting');
    window.setTimeout(() => {
      onSignIn({
        identifier: identifier.value.trim(),
        password: credential.value,
      });
    }, 900);
  };

  const handleGoogle = () => {
    if (busy) return;
    setGoogleStatus('submitting');
    window.setTimeout(onGoogleSignIn, 900);
  };

  return (
    <AppScreen>
      <ScreenHeader title="Sign In" onBack={onBack} />

      <div className="flex flex-col w-full px-margin pb-space-2xl pt-space-xs flex-1">
        <div className="flex flex-col mb-space-lg">
          <div className="inline-flex items-center gap-space-2xs bg-secondary-container text-on-secondary-container px-space-xs py-space-2xs rounded-full w-fit mb-space-xs shadow-sm">
            <Icon name="verified_user" filled className="text-[14px]" />
            <span className="font-label-sm text-label-sm font-medium">Secure Member Login</span>
          </div>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-space-2xs">
            Welcome Back
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Sign in to access your claimed deals, saved favorites, and local offers.
          </p>
        </div>

        <div className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
              Continue as
            </span>
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={onCustomerSignIn}
                disabled={busy}
                className="flex flex-col items-start gap-space-2xs p-space-sm rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm text-left active:scale-[0.98] transition-all duration-150 hover:border-primary/40 hover:shadow-md disabled:opacity-70"
              >
                <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="person" className="text-[20px]" />
                </span>
                <span className="font-label-md text-label-md font-semibold text-text-primary">Customer</span>
                <span className="font-caption text-caption text-text-secondary leading-4">
                  Open customer dashboard
                </span>
              </button>
              <button
                type="button"
                onClick={onBusinessSignIn}
                disabled={busy}
                className="flex flex-col items-start gap-space-2xs p-space-sm rounded-xl bg-surface-container-lowest border border-border-subtle shadow-sm text-left active:scale-[0.98] transition-all duration-150 hover:border-primary/40 hover:shadow-md disabled:opacity-70"
              >
                <span className="w-9 h-9 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
                  <Icon name="storefront" className="text-[20px]" />
                </span>
                <span className="font-label-md text-label-md font-semibold text-text-primary">Business</span>
                <span className="font-caption text-caption text-text-secondary leading-4">
                  Open business dashboard
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full h-[52px] bg-surface-container-lowest text-text-primary rounded-xl font-button-secondary text-button-secondary flex items-center justify-center gap-space-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform duration-150 disabled:opacity-70"
          >
            {googleStatus === 'idle' ? (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            ) : (
              <>
                <Spinner />
                <span>Signing you in...</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center my-space-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-surface-container-highest" />
            </div>
            <div className="relative bg-surface px-space-md text-text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
              or sign in with
            </div>
          </div>

          <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-md text-label-md text-text-primary" htmlFor="identifier">
                Email or Phone Number
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-outline text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  className="w-full h-[52px] pl-[44px] pr-space-md bg-surface-container-lowest text-text-primary rounded-xl font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue shadow-sm transition-colors"
                  id="identifier"
                  name="identifier"
                  placeholder="name@example.com or +234..."
                  type="text"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-text-primary" htmlFor="security-credential">
                  PIN or Password
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:underline" href="#forgot-password">
                  Forgot?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-outline text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  className="w-full h-[52px] pl-[44px] pr-[48px] bg-surface-container-lowest text-text-primary rounded-xl font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue shadow-sm transition-colors"
                  id="security-credential"
                  name="security-credential"
                  maxLength={32}
                  placeholder="••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <button
                  aria-label={showPassword ? 'Hide PIN or password' : 'Show PIN or password'}
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 bottom-0 px-space-md flex items-center justify-center text-outline hover:text-text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-space-xs mt-space-2xs">
              <div className="flex items-center h-5">
                <input
                  checked={remember}
                  className="w-4 h-4 rounded bg-surface-container-highest text-primary accent-primary cursor-pointer"
                  id="remember-me"
                  type="checkbox"
                  onChange={(event) => setRemember(event.target.checked)}
                />
              </div>
              <label className="font-body-md text-body-md text-text-secondary select-none" htmlFor="remember-me">
                Keep me signed in on this device
              </label>
            </div>

            <button
              className="w-full h-[54px] bg-primary-container text-on-primary rounded-xl font-button-primary text-button-primary flex items-center justify-center gap-space-xs mt-space-xs shadow-[0_8px_24px_-4px_rgba(6,108,244,0.28)] active:scale-[0.98] transition-transform duration-150 disabled:cursor-progress"
              type="submit"
              disabled={busy}
            >
              {status === 'idle' ? (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              ) : (
                <>
                  <Spinner />
                  <span>Signing in...</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center py-space-xs">
            <p className="font-body-md text-body-md text-text-secondary">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onCreateAccount}
                className="text-primary font-heading-sm text-heading-sm hover:underline ml-space-2xs"
              >
                Create an account
              </button>
            </p>
          </div>

          <button
            type="button"
            onClick={onBusinessRegister}
            className="mt-space-lg p-space-md bg-surface-container-low rounded-xl flex items-center justify-between gap-space-sm shadow-sm active:bg-surface-container transition-colors duration-150 text-left w-full"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading-sm text-heading-sm text-text-primary truncate">Own a Business?</span>
                <span className="font-caption text-caption text-text-secondary truncate">Click here to Register.</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-text-primary">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
