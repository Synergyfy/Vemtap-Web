import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

interface DesktopAuthCodeScreenProps {
  onContinue: () => void;
  onGoogle: () => void;
  onSignIn: () => void;
  onBusinessRegister: () => void;
}

type Status = 'idle' | 'sending' | 'sent';

const TESTIMONIAL_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdndq2ekzdhxQQlxJqpAvKft-cRkLx5Bj_5YzsQrhlckqaZ5Yb-khu5I8PV5ZiWZae9-aiycwpmHJntyQLLs2OQqcEsLehtr67jnD-rMLRoBi_Zws7HUWJYkni--1mfTGRyAO3QACjL-SjOT4LQy6NEUu-g0-DSJ7CddBnDQIfZLaQ5OpSlopgvpNBt3lBdm6lGxDr86ZzotMmX-i3E3CQha1-zNa8gAcVzmejYf4O';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: 'check',
    title: 'Zero upfront booking fees',
    copy: 'Claim exclusive merchant vouchers without hidden surcharges.',
  },
  {
    icon: 'forum',
    title: 'Real-time direct merchant chat',
    copy: 'Ask questions, reserve seats, and verify inventory in one tap.',
  },
  {
    icon: 'bookmark_heart',
    title: 'Curate spots & track redemptions',
    copy: 'Save top neighborhood spots and monitor accrued rewards.',
  },
];

export function DesktopAuthCodeScreen({ onContinue, onGoogle, onSignIn, onBusinessRegister }: DesktopAuthCodeScreenProps) {
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    if (!input || !input.value.trim() || !input.checkValidity()) {
      input?.focus();
      return;
    }
    if (status !== 'idle') return;
    setStatus('sending');
    window.setTimeout(() => setStatus('sent'), 1200);
    window.setTimeout(onContinue, 2100);
  };

  return (
    <div className="w-full min-h-screen bg-surface-canvas font-body-md text-text-primary flex items-center justify-center antialiased">
      <main className="w-full flex items-center justify-center p-margin">
        <div className="flex flex-col w-full max-w-6xl mx-auto py-space-xl">
          <div className="bg-surface-canvas rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
            <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-secondary p-space-xl lg:p-space-2xl text-on-primary flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-surface-canvas/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-primary-fixed/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col space-y-space-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-space-xs">
                    <Logo variant="full-white" className="h-8 w-auto" />
                  </div>
                  <span className="bg-surface-canvas/15 backdrop-blur-md px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm text-on-primary tracking-wide">
                    HYPERLOCAL ACCESS
                  </span>
                </div>

                <div className="space-y-space-md">
                  <h2 className="font-heading-lg text-heading-lg text-on-primary leading-tight font-bold">
                    Unlock trusted local experiences &amp; daily savings.
                  </h2>
                  <p className="font-body-md text-body-md text-primary-fixed opacity-90 leading-relaxed">
                    Connect directly with verified local dining, wellness, and retail spaces in your city with seamless
                    instantaneous perks.
                  </p>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="flex items-start space-x-space-sm">
                      <div className="w-7 h-7 rounded-full bg-surface-canvas/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name={feature.icon} filled className="text-label-sm text-on-primary" />
                      </div>
                      <div>
                        <p className="font-body-md text-body-md text-on-primary font-medium">{feature.title}</p>
                        <p className="font-caption text-caption text-primary-fixed opacity-80">{feature.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-space-lg">
                <div className="bg-surface-canvas/15 backdrop-blur-md rounded-xl p-space-md space-y-space-sm">
                  <div className="flex items-center space-x-space-xs text-tertiary-fixed">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Icon key={index} name="star" filled className="text-label-sm" />
                    ))}
                  </div>
                  <p className="font-body-md text-body-md text-on-primary italic font-normal">
                    “Saved over ₦45,000 on dining and wellness in my first month. The instant QR pass makes visits
                    completely seamless.”
                  </p>
                  <div className="flex items-center space-x-space-sm pt-space-2xs">
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      alt="Portrait of a young Nigerian professional woman"
                      src={TESTIMONIAL_AVATAR}
                    />
                    <div>
                      <p className="font-label-md text-label-md text-on-primary font-semibold leading-tight">
                        Chidinma Okafor
                      </p>
                      <p className="font-caption text-caption text-primary-fixed opacity-80">Victoria Island, Lagos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-space-xl lg:p-space-2xl flex flex-col justify-between bg-surface-canvas">
              <div className="max-w-md mx-auto w-full space-y-space-lg">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium tracking-wide">
                    Step 1 of 3 •{' '}
                    <span className="text-primary-container font-semibold">Account Creation</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
                  </div>
                </div>

                <div className="space-y-space-2xs">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                    Welcome to VEMTAP
                  </h1>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Create your account or sign in to save deals and claim exclusive offers near you.
                  </p>
                </div>

                <div>
                  <button
                    className="w-full h-12 px-space-md rounded-xl bg-surface-subtle hover:bg-surface-container transition-all flex items-center justify-center space-x-space-sm text-text-primary shadow-sm active:scale-[0.99]"
                    type="button"
                    onClick={onGoogle}
                  >
                    <GoogleIcon />
                    <span className="font-button-secondary text-button-secondary font-medium">Continue with Google</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="w-full h-px bg-surface-container-highest" />
                  <span className="absolute bg-surface-canvas px-space-sm font-caption text-caption text-text-tertiary tracking-wider font-semibold uppercase">
                    OR
                  </span>
                </div>

                <form className="space-y-space-md" onSubmit={handleSubmit}>
                  <div className="space-y-space-2xs">
                    <label className="block font-label-md text-label-md text-text-primary font-medium" htmlFor="email-input">
                      Email Address
                    </label>
                    <div className="relative rounded-xl bg-surface-subtle focus-within:bg-surface-canvas focus-within:shadow-md transition-all">
                      <Icon
                        name="mail"
                        className="absolute left-4 top-3.5 text-text-tertiary text-heading-sm pointer-events-none"
                      />
                      <input
                        className="w-full h-12 pl-12 pr-4 bg-transparent rounded-xl font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-0"
                        id="email-input"
                        name="email"
                        placeholder="name@example.com"
                        required
                        type="email"
                      />
                    </div>
                    <p className="font-caption text-caption text-text-secondary flex items-center space-x-1 pt-1">
                      <Icon name="info" className="text-caption text-primary-container" />
                      <span>We'll send you a 6-digit verification code to confirm your email.</span>
                    </p>
                  </div>

                  <button
                    className="w-full h-[52px] py-space-sm px-space-md rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-lg hover:bg-primary transition-all flex items-center justify-center space-x-space-xs active:scale-[0.98] cursor-pointer disabled:cursor-progress disabled:opacity-80"
                    type="submit"
                    disabled={status !== 'idle'}
                  >
                    {status === 'idle' && (
                      <>
                        <span>Continue</span>
                        <Icon name="arrow_forward" className="text-button-primary" />
                      </>
                    )}
                    {status === 'sending' && (
                      <>
                        <Icon name="progress_activity" className="text-button-primary animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    )}
                    {status === 'sent' && (
                      <>
                        <Icon name="check_circle" className="text-button-primary" />
                        <span>Code Sent! Check Inbox</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-space-xs">
                  <p className="font-body-md text-body-md text-text-secondary">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="text-primary-container font-semibold hover:underline ml-1 inline-flex items-center"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-space-xs text-text-tertiary font-caption text-caption pt-space-xs">
                  <Icon name="verified_user" filled className="text-label-sm" />
                  <span>256-bit encrypted authentication • NDPR Compliant</span>
                </div>
              </div>

              <div className="max-w-md mx-auto w-full mt-space-lg pt-space-md">
                <button
                  type="button"
                  onClick={onBusinessRegister}
                  className="w-full p-space-md rounded-xl bg-surface-tint-blue flex items-center justify-between transition-colors hover:bg-surface-container-high/60 group cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center text-primary-container shadow-sm shrink-0">
                      <Icon name="storefront" className="text-heading-sm" />
                    </div>
                    <div className="min-w-0 pr-space-xs">
                      <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        Own a Business?
                      </p>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Register your store &amp; publish offers
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-primary-container font-label-md text-label-md font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Register Here <Icon name="arrow_forward" className="text-label-md ml-0.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
