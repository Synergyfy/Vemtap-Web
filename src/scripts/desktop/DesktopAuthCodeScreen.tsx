import { useState, type FormEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';

interface DesktopAuthCodeScreenProps {
  onContinue: () => void;
  /** Requests the email code; omitted by the business sign-up modal. */
  onSubmitEmail?: (email: string) => Promise<void> | void;
  onGoogle: () => void;
  onSignIn: () => void;
  /** Customer sign-up only — swaps into the business registration flow. */
  onBusinessRegister?: () => void;
  /** Business sign-up only (`mode="business"`) — swaps into customer registration. */
  onCustomerRegister?: () => void;
  /** Back affordance — only rendered in business mode (this layout has no chrome). */
  onBack?: () => void;
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

const TESTIMONIAL_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdndq2ekzdhxQQlxJqpAvKft-cRkLx5Bj_5YzsQrhlckqaZ5Yb-khu5I8PV5ZiWZae9-aiycwpmHJntyQLLs2OQqcEsLehtr67jnD-rMLRoBi_Zws7HUWJYkni--1mfTGRyAO3QACjL-SjOT4LQy6NEUu-g0-DSJ7CddBnDQIfZLaQ5OpSlopgvpNBt3lBdm6lGxDr86ZzotMmX-i3E3CQha1-zNa8gAcVzmejYf4O';

const MERCHANT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBUKLcImE3zkvZVmfA4gE7EoNs8DsciE3r_keiOmF3HrFREYpnwRgwJLe4pooa2cc2t0Vyrqi392Ei2K32LK3zs9ACz_ozCPMayBpXrsfEvZYUJOoGvKSt6W3fSfMt8tkkEiQS688P-vrLbzDlG1vENxZWPPLrYfC-Twqi0beCh34ZPnyd1iKdnDGZMuoDgBvETT6hYh7_hAUCfsa22iniqQRiIVM4gNv1B3Y3mDbWy';

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

const BUSINESS_FEATURES = [
  {
    icon: 'storefront',
    title: 'Get discovered by nearby shoppers',
    copy: 'Reach verified customers within walking distance browsing district deals.',
  },
  {
    icon: 'flash_on',
    title: 'Deals & flash drops',
    copy: 'Publish time-boxed vouchers that fill slow hours with walk-ins.',
  },
  {
    icon: 'payments',
    title: 'Zero commission sales',
    copy: 'Keep 100% of every in-store sale — VEMTAP never takes a cut.',
  },
];

/**
 * One sign-up modal, two audiences: the account-type swap card at the bottom
 * mirrors whichever audience is *not* registering.
 */
const AUDIENCE_COPY = {
  customer: {
    stepLabel: 'Account Creation',
    panelEyebrow: 'HYPERLOCAL ACCESS',
    panelTitle: 'Unlock trusted local experiences & daily savings.',
    panelBody:
      'Connect directly with verified local dining, wellness, and retail spaces in your city with seamless instantaneous perks.',
    title: 'Welcome to VEMTAP',
    subtitle: 'Create your account or sign in to save deals and claim exclusive offers near you.',
    features: FEATURES,
    quote:
      '“Saved over ₦45,000 on dining and wellness in my first month. The instant QR pass makes visits completely seamless.”',
    quoteName: 'Chidinma Okafor',
    quoteMeta: 'Victoria Island, Lagos',
    quoteAvatar: TESTIMONIAL_AVATAR,
    quoteAlt: 'Portrait of a young Nigerian professional woman',
    swap: { icon: 'storefront', title: 'Own a Business?', body: 'Register your store & publish offers', cta: 'Register Here' },
  },
  business: {
    stepLabel: 'Business Account Creation',
    panelEyebrow: 'VEMTAP FOR BUSINESS',
    panelTitle: 'Turn nearby foot traffic into lifetime customers.',
    panelBody:
      'List your store, publish time-boxed offers, and settle sales directly with customers — no commissions, no setup fees.',
    title: 'Welcome to VEMTAP for Business',
    subtitle:
      'Create your business account to list your store, publish offers, and turn nearby foot traffic into lifetime customers.',
    features: BUSINESS_FEATURES,
    quote:
      '“Within three weeks of placing the VEMTAP Tap Pass at our front desk, walk-ins from surrounding offices doubled — and we keep every naira of it.”',
    quoteName: 'Amara K.',
    quoteMeta: 'Founder, Bloom Wellness & Cafe, Abuja',
    quoteAvatar: MERCHANT_AVATAR,
    quoteAlt:
      'Portrait of Amara K, an energetic West African female founder and hospitality business owner, smiling warmly in her cafe',
    swap: { icon: 'person', title: 'Register as a Customer', body: 'Save deals & claim offers near you', cta: 'Click Here' },
  },
} as const;

export function DesktopAuthCodeScreen({
  onContinue,
  onSubmitEmail,
  onGoogle,
  onSignIn,
  onBusinessRegister,
  onCustomerRegister,
  onBack,
  mode = 'customer',
}: DesktopAuthCodeScreenProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const business = mode === 'business';
  const copy = AUDIENCE_COPY[mode];

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
                    {copy.panelEyebrow}
                  </span>
                </div>

                <div className="space-y-space-md">
                  <h2 className="font-heading-lg text-heading-lg text-on-primary leading-tight font-bold">
                    {copy.panelTitle}
                  </h2>
                  <p className="font-body-md text-body-md text-primary-fixed opacity-90 leading-relaxed">
                    {copy.panelBody}
                  </p>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  {copy.features.map((feature) => (
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
                  <p className="font-body-md text-body-md text-on-primary italic font-normal">{copy.quote}</p>
                  <div className="flex items-center space-x-space-sm pt-space-2xs">
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      alt={copy.quoteAlt}
                      src={copy.quoteAvatar}
                    />
                    <div>
                      <p className="font-label-md text-label-md text-on-primary font-semibold leading-tight">
                        {copy.quoteName}
                      </p>
                      <p className="font-caption text-caption text-primary-fixed opacity-80">{copy.quoteMeta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-space-xl lg:p-space-2xl flex flex-col justify-between bg-surface-canvas">
              <div className="max-w-md mx-auto w-full space-y-space-lg">
                {/* Back is rendered whenever the caller wires one up (both the
                    customer and business variants of the shared modal). */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-space-2xs text-text-secondary hover:text-primary transition-colors -ml-1 w-fit font-label-md text-label-md font-medium"
                  >
                    <Icon name="arrow_back_ios_new" className="text-base" />
                    <span>Back</span>
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium tracking-wide">
                    Step 1 of 3 •{' '}
                    <span className="text-primary-container font-semibold">{copy.stepLabel}</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-6 h-1.5 rounded-full bg-primary-container" />
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest" />
                  </div>
                </div>

                <div className="space-y-space-2xs">
                  <h1 className="font-heading-lg text-heading-lg text-text-primary font-bold tracking-tight">
                    {copy.title}
                  </h1>
                  <p className="font-body-md text-body-md text-text-secondary">{copy.subtitle}</p>
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
                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-space-sm py-space-xs text-red-700 font-body-md text-body-md">
                      {error}
                    </div>
                  ) : null}
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
                  onClick={business ? onCustomerRegister : onBusinessRegister}
                  className="w-full p-space-md rounded-xl bg-surface-tint-blue flex items-center justify-between transition-colors hover:bg-surface-container-high/60 group cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-canvas flex items-center justify-center text-primary-container shadow-sm shrink-0">
                      <Icon name={copy.swap.icon} className="text-heading-sm" />
                    </div>
                    <div className="min-w-0 pr-space-xs">
                      <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {copy.swap.title}
                      </p>
                      <p className="font-caption text-caption text-text-secondary truncate">{copy.swap.body}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-primary-container font-label-md text-label-md font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    {copy.swap.cta} <Icon name="arrow_forward" className="text-label-md ml-0.5" />
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
