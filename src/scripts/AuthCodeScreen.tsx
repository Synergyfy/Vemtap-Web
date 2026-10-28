import { useEffect, useState, type FormEvent } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { Logo } from '../components/ui/Logo';

interface AuthCodeScreenProps {
  onBack: () => void;
  onContinue: () => void;
  /** Requests the email code; omitted by the business sign-up modal. */
  onSubmitEmail?: (email: string) => Promise<void> | void;
  onGoogle: () => void;
  /** A failed live Google sign-in to show (set again for each failure). */
  googleError?: { message: string } | null;
  /** Customer sign-up only — swaps into the business registration flow. */
  onBusinessRegister?: () => void;
  /** Business sign-up only (`mode="business"`) — swaps into customer registration. */
  onCustomerRegister?: () => void;
  /** "Already have an account? Sign In". Falls back to `onContinue`. */
  onSignIn?: () => void;
  /**
   * `business` re-skins this same sign-up modal for merchants: the copy, the
   * account-type swap card and the destinations all assume a business is
   * registering (verification still finishes on the Business Profile page).
   */
  mode?: 'customer' | 'business';
}

type Status = 'idle' | 'sending' | 'sent';

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'We could not start your account setup. Please try again.';
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function AuthCodeScreen({
  onBack,
  onContinue,
  onSubmitEmail,
  onGoogle,
  googleError,
  onBusinessRegister,
  onCustomerRegister,
  onSignIn,
  mode = 'customer',
}: AuthCodeScreenProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!googleError) return;
    setError(googleError.message);
  }, [googleError]);
  const business = mode === 'business';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    const email = input?.value.trim() ?? '';
    if (!input || !email || !input.checkValidity()) {
      input?.focus();
      return;
    }
    if (status !== 'idle') return;
    setError(null);
    setStatus('sending');

    try {
      if (!onSubmitEmail) {
        // The business modal has no email step of its own; carry on.
        setStatus('idle');
        onContinue();
        return;
      }
      await Promise.resolve(onSubmitEmail(email));
      setStatus('sent');
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
      setStatus('idle');
    }
  };

  return (
    <AppScreen>
      <div className="flex flex-col w-full px-margin pb-space-xl">
        <div className="flex items-center justify-between py-space-sm">
          <button
            aria-label="Go back"
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors duration-200 active:scale-95"
          >
            <Icon name="arrow_back_ios_new" className="text-[24px]" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-caption text-caption text-text-secondary font-medium tracking-tight">
              {business ? 'Business • Step 1 of 3' : 'Step 1 of 3'}
            </span>
          </div>
          <div className="w-10" />
        </div>

        <div className="w-full bg-surface-container-low h-1 rounded-full mt-2 mb-space-lg overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: '33.3%' }} />
        </div>

        <div className="flex flex-col items-center text-center mt-2 mb-space-xl">
          <Logo variant="mark" className="h-11 w-auto mb-space-md" />
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight mb-2">
            {business ? 'Welcome to VEMTAP for Business' : 'Welcome to VEMTAP'}
          </h1>
          <p className="font-body-md text-body-md text-text-secondary max-w-[280px]">
            {business
              ? 'Create your business account to list your store, publish offers, and turn nearby foot traffic into lifetime customers.'
              : 'Create your account or sign in to save deals and claim exclusive offers near you.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onGoogle}
            className="w-full h-[52px] bg-surface-container-lowest text-text-primary rounded-xl flex items-center justify-center gap-3 shadow-sm active:scale-[0.99] transition-all duration-150 relative"
          >
            <GoogleIcon />
            <span className="font-button-secondary text-button-secondary font-medium">Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center my-space-lg">
          <div className="flex-1 h-[1px] bg-surface-dim opacity-40" />
          <span className="px-3 font-caption text-caption text-text-tertiary tracking-wider font-medium uppercase">
            or
          </span>
          <div className="flex-1 h-[1px] bg-surface-dim opacity-40" />
        </div>

        <form className="flex flex-col w-full" onSubmit={handleSubmit} noValidate={false}>
          {error ? (
            <div className="mb-space-sm rounded-xl border border-red-200 bg-red-50 px-space-sm py-space-xs text-red-700 font-body-md text-body-md">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="font-label-md text-label-md font-medium text-text-primary" htmlFor="email-field">
              Enter your email to continue
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-text-tertiary flex items-center justify-center">
                <Icon name="mail" className="text-[20px]" />
              </div>
              <input
                id="email-field"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                className="w-full h-[52px] bg-surface-subtle text-text-primary rounded-xl pl-11 pr-4 font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue/30 transition-all duration-150"
              />
            </div>
          </div>

          <p className="font-caption text-caption text-text-secondary flex items-start gap-1.5 mb-space-xl">
            <Icon name="verified_user" className="text-[15px] text-primary shrink-0 mt-0.5" />
            <span>We'll send you a 6-digit verification code to confirm your email.</span>
          </p>

          <button
            id="submit-btn"
            type="submit"
            disabled={status !== 'idle'}
            className="w-full h-[52px] bg-primary-container text-on-primary font-button-primary text-button-primary rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all duration-150 disabled:opacity-80 disabled:cursor-progress"
          >
            {status === 'idle' && (
              <>
                <span>Continue</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </>
            )}
            {status === 'sending' && (
              <>
                <Spinner />
                <span>Sending code...</span>
              </>
            )}
            {status === 'sent' && (
              <>
                <Icon name="check_circle" className="text-[20px]" />
                <span>Code Sent!</span>
              </>
            )}
          </button>

          <div className="text-center mt-space-md">
            <p className="font-body-md text-body-md text-text-secondary">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSignIn ?? onContinue}
                className="text-primary font-bold hover:underline underline-offset-2 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>

        <div className="mt-space-2xl text-center px-2">
          <p className="font-caption text-caption text-text-secondary leading-relaxed">
            By continuing, you agree to VEMTAP's{' '}
            <a className="text-primary font-medium underline underline-offset-2" href="#terms">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="text-primary font-medium underline underline-offset-2" href="#privacy">
              Privacy Policy
            </a>
            .
          </p>
          <div className="flex items-center justify-center gap-1 mt-space-sm text-text-tertiary font-caption text-caption">
            <Icon name="lock" className="text-[14px]" />
            <span>256-bit encrypted authentication</span>
          </div>
        </div>

        <div className="mt-space-xl pt-space-xs">
          {business ? (
            <button
              type="button"
              onClick={onCustomerRegister}
              className="w-full p-space-md bg-surface-tint-blue rounded-xl flex items-center justify-between gap-3 border border-border-active active:bg-surface-container-low transition-colors duration-150 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-secondary shadow-sm shrink-0">
                  <Icon name="person" className="text-[20px]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-md text-label-md font-bold text-text-primary">Register as a Customer</span>
                  <span className="font-caption text-caption text-text-secondary">Save deals &amp; claim offers near you</span>
                </div>
              </div>
              <div className="flex items-center text-primary font-medium font-label-md text-label-md gap-1 shrink-0">
                <span>Click Here</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBusinessRegister}
              className="w-full p-space-md bg-surface-tint-blue rounded-xl flex items-center justify-between gap-3 border border-border-active active:bg-surface-container-low transition-colors duration-150 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-canvas flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Icon name="storefront" className="text-[20px]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-md text-label-md font-bold text-text-primary">Own a Business?</span>
                  <span className="font-caption text-caption text-text-secondary">Register your store & publish offers</span>
                </div>
              </div>
              <div className="flex items-center text-primary font-medium font-label-md text-label-md gap-1 shrink-0">
                <span>Register Here</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </div>
            </button>
          )}
        </div>
      </div>
    </AppScreen>
  );
}