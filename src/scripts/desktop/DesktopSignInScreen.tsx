import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

interface DesktopSignInScreenProps {
  onSignIn: (credentials: { identifier: string; password: string }) => Promise<void> | void;
  onGoogleSignIn: () => void;
  onCreateAccount: () => void;
  onBusinessRegister: () => void;
  onCustomerSignIn: () => void;
  onBusinessSignIn: () => void;
}

type Status = 'idle' | 'submitting';

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'We could not sign you in. Please check your email or password and try again.';
};

const PILLARS = [
  {
    icon: 'confirmation_number',
    title: 'Instant Voucher Passes',
    copy: 'Offline-ready digital passes valid across partner spots instantly.',
  },
  {
    icon: 'forum',
    title: 'Real-time Merchant Chat',
    copy: 'Connect directly with store managers before claiming your deal.',
  },
  {
    icon: 'near_me',
    title: 'Local Deals in Lagos & Abuja',
    copy: 'Over 2,400 vetted artisans and venues curated at walking distance.',
  },
];

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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

export function DesktopSignInScreen({
  onSignIn,
  onGoogleSignIn,
  onCreateAccount,
  onBusinessRegister,
  onCustomerSignIn,
  onBusinessSignIn,
}: DesktopSignInScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [googleStatus, setGoogleStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const busy = status !== 'idle' || googleStatus !== 'idle';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const identifier = form.elements.namedItem('identifier') as HTMLInputElement | null;
    const credential = form.elements.namedItem('password') as HTMLInputElement | null;
    if (!identifier?.value.trim()) {
      identifier?.focus();
      return;
    }
    if (!credential?.value) {
      credential?.focus();
      return;
    }
    const nextIdentifier = identifier.value.trim();
    const nextPassword = credential.value;
    setError(null);
    setStatus('submitting');
    window.setTimeout(() => {
      Promise.resolve(onSignIn({ identifier: nextIdentifier, password: nextPassword }))
        .catch((signInError) => {
          setError(getAuthErrorMessage(signInError));
        })
        .finally(() => {
          setStatus('idle');
        });
    }, 900);
  };

  const handleGoogle = () => {
    if (busy) return;
    setGoogleStatus('submitting');
    window.setTimeout(onGoogleSignIn, 900);
  };

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl">
      <main className="w-full flex items-center justify-center">
        <div className="w-full max-w-5xl rounded-xl bg-surface-canvas shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-surface-tint-blue p-space-xl lg:p-space-2xl text-on-primary flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-space-lg">
              <Logo variant="full-white" className="h-8 w-auto self-start" />

              <div className="flex flex-col gap-space-xs">
                <span className="inline-flex items-center gap-space-2xs px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-on-primary font-label-sm text-label-sm w-fit">
                  <Icon name="bolt" filled className="text-sm" />
                  Hyper-Local Commerce
                </span>
                <h1 className="font-display-hero text-heading-lg lg:text-display-hero text-on-primary leading-tight font-heading-lg">
                  Welcome Back to Your Local Savings Hub.
                </h1>
                <p className="font-body-md text-body-md text-primary-fixed leading-relaxed">
                  One tap to your favorite neighbourhood cafes, top-rated salons, and local retail deals.
                </p>
              </div>

              <div className="flex flex-col gap-space-md mt-space-xs">
                {PILLARS.map((pillar) => (
                  <div key={pillar.title} className="flex items-start gap-space-sm">
                    <div className="p-2 rounded-lg bg-white/15 backdrop-blur-sm text-on-primary mt-0.5">
                      <Icon name={pillar.icon} className="text-heading-sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading-sm text-button-secondary text-on-primary">{pillar.title}</span>
                      <span className="font-caption text-caption text-primary-fixed-dim">{pillar.copy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-space-xl p-space-md rounded-xl bg-white/10 backdrop-blur-md flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-2xs text-amber-300">
                {Array.from({ length: 5 }, (_, index) => (
                  <Icon key={index} name="star" filled className="text-sm" />
                ))}
                <span className="font-caption text-caption text-primary-fixed font-semibold ml-1.5">4.9 / 5</span>
              </div>
              <p className="font-body-md text-caption text-on-primary italic leading-snug">
                “I redeemed my weekend dining deal in Lekki Phase 1 with a simple tap. Zero back-and-forth.”
              </p>
              <div className="flex items-center justify-between mt-1 text-primary-fixed-dim font-label-sm text-caption">
                <span>— Damilola O., Victoria Island</span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <Icon name="verified" className="text-xs" /> Verified Citizen
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-space-xl lg:p-space-2xl bg-surface-canvas flex flex-col justify-between">
            <div className="flex flex-col gap-space-lg max-w-lg mx-auto w-full">
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading-lg text-heading-lg text-text-primary">Sign In</h2>
                  <span className="inline-flex items-center gap-1 font-label-sm text-caption text-badge-discount-text bg-badge-discount-bg px-2.5 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text animate-pulse" /> Network Active
                  </span>
                </div>
                <p className="font-body-md text-body-md text-text-secondary">
                  Sign in to access your claimed deals, saved favorites, and local offers.
                </p>
              </div>

              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider">
                  Continue as
                </span>
                <div className="grid grid-cols-2 gap-space-xs">
                  <button
                    className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-high border border-border-subtle transition-all duration-200 text-left active:scale-[0.99] disabled:opacity-75"
                    type="button"
                    onClick={onCustomerSignIn}
                    disabled={busy}
                  >
                    <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name="person" className="text-[20px]" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-sm text-text-primary font-semibold">Customer</span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        Open customer dashboard
                      </span>
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle hover:bg-surface-container-high border border-border-subtle transition-all duration-200 text-left active:scale-[0.99] disabled:opacity-75"
                    type="button"
                    onClick={onBusinessSignIn}
                    disabled={busy}
                  >
                    <span className="w-9 h-9 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
                      <Icon name="storefront" className="text-[20px]" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-sm text-text-primary font-semibold">Business</span>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        Open business dashboard
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <button
                className="w-full h-12 px-4 rounded-xl bg-surface-subtle hover:bg-surface-container-high transition-all duration-200 flex items-center justify-center gap-3 font-button-secondary text-button-secondary text-text-primary shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-75"
                type="button"
                onClick={handleGoogle}
                disabled={busy}
              >
                {googleStatus === 'idle' ? (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                ) : (
                  <>
                    <Icon name="progress_activity" className="text-button-primary animate-spin" />
                    <span>Signing you in...</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-space-2xs">
                <div className="w-full h-px bg-surface-container-highest" />
                <span className="absolute px-3 bg-surface-canvas font-caption text-caption text-text-tertiary uppercase tracking-wider">
                  or sign in with
                </span>
              </div>

              <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-space-sm py-space-xs text-red-700 font-body-md text-body-md">
                    {error}
                  </div>
                ) : null}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary flex items-center justify-between" htmlFor="identifier">
                    <span>Email or Phone Number</span>
                    <span className="font-caption text-caption text-text-tertiary">NG (+234)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Icon
                      name="mail"
                      className="absolute left-3.5 text-text-tertiary text-heading-sm pointer-events-none"
                    />
                    <input
                      className="w-full h-[52px] pl-11 pr-4 rounded-xl bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all duration-200"
                      autoComplete="username"
                      id="identifier"
                      name="identifier"
                      placeholder="name@example.com or +234..."
                      required
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-text-primary" htmlFor="password">
                      PIN or Password
                    </label>
                    <a
                      className="font-label-sm text-label-sm text-primary-container hover:underline font-medium"
                      href="#forgot-password"
                      onClick={(event) => event.preventDefault()}
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <Icon
                      name="lock"
                      className="absolute left-3.5 text-text-tertiary text-heading-sm pointer-events-none"
                    />
                    <input
                      className={`w-full h-[52px] pl-11 pr-11 rounded-xl bg-surface-subtle font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all duration-200 ${
                        showPassword ? '' : 'tracking-widest'
                      }`}
                      autoComplete="current-password"
                      id="password"
                      name="password"
                      maxLength={32}
                      placeholder="Enter 6-digit PIN or password"
                      required
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-3.5 text-text-tertiary hover:text-text-primary flex items-center p-1"
                      id="togglePassBtn"
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-heading-sm" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-2xs">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      checked={remember}
                      className="w-4 h-4 rounded text-primary-container accent-primary-container cursor-pointer"
                      id="keep-signed-in"
                      type="checkbox"
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    <span className="font-body-md text-label-sm text-text-secondary">
                      Keep me signed in on this device
                    </span>
                  </label>
                </div>

                <button
                  className="w-full h-[52px] mt-space-xs rounded-xl bg-primary-container hover:bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-progress disabled:opacity-80"
                  type="submit"
                  disabled={busy}
                >
                  {status === 'idle' ? (
                    <>
                      <span>Sign In</span>
                      <Icon name="arrow_forward" className="text-heading-sm" />
                    </>
                  ) : (
                    <>
                      <Icon name="progress_activity" className="text-heading-sm animate-spin" />
                      <span>Signing in...</span>
                    </>
                  )}
                </button>

                <div className="text-center mt-space-2xs">
                  <span className="font-body-md text-body-md text-text-secondary">Don’t have an account? </span>
                  <button
                    className="font-button-primary text-body-md text-primary-container hover:underline font-semibold"
                    type="button"
                    onClick={onCreateAccount}
                  >
                    Create an account
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-space-xl pt-space-md flex flex-col gap-space-sm max-w-lg mx-auto w-full">
              <button
                className="w-full p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between group transition-colors duration-150 text-left"
                type="button"
                onClick={onBusinessRegister}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                    <Icon name="storefront" className="text-heading-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-sm text-text-primary font-semibold">
                      Own a Business in Nigeria?
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Grow footfall and tap lifetime customers
                    </span>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-primary-container font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Merchant Portal <Icon name="chevron_right" className="text-sm" />
                </span>
              </button>

              <div className="flex items-center justify-between text-text-tertiary px-1 font-caption text-caption">
                <div className="flex items-center gap-1.5">
                  <Icon name="lock" filled className="text-xs text-badge-discount-text" />
                  <span>256-bit Bank Grade SSL</span>
                </div>
                <span className="inline-block w-1 h-1 rounded-full bg-surface-container-highest" />
                <div className="flex items-center gap-1.5">
                  <Icon name="verified_user" filled className="text-xs text-primary-container" />
                  <span>NDPR Data Privacy Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
