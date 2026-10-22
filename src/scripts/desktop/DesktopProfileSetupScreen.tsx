import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ReferralField } from '../../components/referral/ReferralField';
import { ReferralConfirmSheet } from '../../components/referral/ReferralConfirmSheet';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { useReferralStep } from '../../hooks/useReferralStep';

interface DesktopProfileSetupScreenProps {
  onBack: () => void;
  onComplete: (details: { firstName: string; lastName: string; phone: string; pin: string }) => Promise<void> | void;
  onBusinessSetup: () => void;
  email?: string;
  code?: string;
}

const PIN_LENGTH = 6;
const TESTIMONIAL_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBU05PRs_ebkPrcKg4HLZ5sijP3NLcGFP9kFilGUZMAqnEKtT_3mjpD3Fsdz6CDnRLsjWfQRsaFCsK6gB0xQadUVMsg0XZtun01TgOtXlzZtF7BZafUzYHH-Co8qvF_KxRnR2i9sykhnV-JQuFdNjZ9Am9kWc15GcFIxCL-mKM5Nu86WzZzv8XOGZIYvto4DlLgLW6pw35FlTvBpcgHnvGdLdX3mm5OyGUVRXpWCGJx';

const VALUE_POINTS = [
  {
    icon: 'verified',
    title: 'Zero SMS Delays',
    copy: 'Redeem even in poor network reception zones right at counter checkout.',
  },
  {
    icon: 'lock_clock',
    title: 'Self-Sovereign Protection',
    copy: 'Your 6-digit PIN never leaves your encrypted hardware enclave key storage.',
  },
];

interface PinGroupProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  revealed: boolean;
}

function PinGroup({ label, hint, value, onChange, revealed }: PinGroupProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: PIN_LENGTH }, (_, index) => value[index] ?? '');

  const setAt = (index: number, char: string) => {
    const next = [...digits];
    next[index] = char;
    onChange(next.join(''));
    return next;
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    setAt(index, char);
    if (char && index < PIN_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setAt(index - 1, '');
    }
    if (event.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < PIN_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-2 pt-space-xs">
      <div className="flex items-center justify-between">
        <label className="font-label-md text-label-md text-text-primary font-medium">{label}</label>
        {hint && <span className="font-caption text-caption text-text-tertiary">{hint}</span>}
      </div>
      <div className="grid grid-cols-6 gap-2 sm:gap-space-sm max-w-xl">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            aria-label={`${label} digit ${index + 1}`}
            className={`w-full h-14 sm:h-16 text-center font-display-hero text-display-hero text-text-primary bg-surface-canvas border-2 rounded-xl shadow-sm select-all caret-primary transition-all focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 focus:shadow-md ${
              digit ? 'border-primary-container shadow-sm' : 'border-outline-variant'
            }`}
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9]*"
            type={revealed ? 'text' : 'password'}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.currentTarget.select()}
          />
        ))}
      </div>
    </div>
  );
}

export function DesktopProfileSetupScreen({ onBack, onComplete, onBusinessSetup }: DesktopProfileSetupScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinRevealed, setPinRevealed] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'verified'>('idle');
  const referral = useReferralStep();
  /** Which button opened the referral sheet, so it completes the same way. */
  const [pendingAction, setPendingAction] = useState<'submit' | 'next' | null>(null);

  const ownIdentity = useReferralIdentity();

  const passName = [firstName, lastName].filter(Boolean).join(' ') || 'First Last';
  const passPhone = `+234 ${phone.trim() || '800 000 0000'}`;

  const finishSetup = async () => {
    setStatus('saving');
    setError('');
    try {
      await Promise.resolve(onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), phone, pin }));
      setStatus('verified');
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'We could not finish your profile setup. Please try again.');
      setStatus('idle');
    }
  };

  /** Runs whatever the user asked for once the referral step is resolved. */
  const completePendingAction = async () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'next') {
      await Promise.resolve(onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), phone, pin }));
      return;
    }
    await finishSetup();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== 'idle') return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('Enter your first and last name to continue.');
      return;
    }
    if (pin.length !== PIN_LENGTH || pinConfirm.length !== PIN_LENGTH) {
      setError('Create a 6-digit PIN and confirm it.');
      return;
    }
    if (pin !== pinConfirm) {
      setError('The PINs do not match. Try again.');
      return;
    }
    setError('');
    // The referral code is checked on submit, not while it is being typed.
    if (referral.needsConfirmation) {
      setPendingAction('submit');
      referral.requestConfirmation();
      return;
    }
    await finishSetup();
  };

  /** The "skip ahead" link obeys the same referral check as the main button. */
  const handleNext = async () => {
    if (referral.needsConfirmation) {
      setPendingAction('next');
      referral.requestConfirmation();
      return;
    }
    await Promise.resolve(onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), phone, pin }));
  };

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl bg-surface-subtle selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="w-full flex items-center justify-center">
        <div className="w-full max-w-6xl py-space-xl">
          <header className="w-full flex flex-col md:flex-row md:items-center justify-between pb-space-lg mb-space-xl gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Back to verification"
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                type="button"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-xl" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm shadow-md">
                <Icon name="verified_user" filled className="text-xl" />
              </div>
              <div>
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary block">
                  Registration Flow
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">
                  Step 3 of 3 • Profile &amp; Security PIN
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2 rounded-full self-start md:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                <span className="font-label-sm text-label-sm text-text-secondary">Basic Info</span>
              </div>
              <span className="text-text-tertiary px-1">›</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                <span className="font-label-sm text-label-sm text-text-secondary">Preferences</span>
              </div>
              <span className="text-text-tertiary px-1">›</span>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-2.5 rounded-full bg-primary-container" />
                <span className="font-label-sm text-label-sm text-primary font-semibold">Security PIN</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <aside className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-space-lg text-on-primary shadow-xl">
                <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between pb-space-md relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center font-bold text-sm tracking-tight shadow">
                      V
                    </span>
                    <span className="font-heading-sm text-heading-sm font-bold tracking-tight">VEMTAP</span>
                  </div>
                  <span className="bg-white/20 backdrop-blur text-surface-container-lowest font-caption text-caption px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                    Instant Pass
                  </span>
                </div>

                <div className="my-space-md relative z-10">
                  <span className="font-caption text-caption text-primary-fixed-dim uppercase tracking-wider block mb-1">
                    Authenticated Holder
                  </span>
                  <div className="font-heading-md text-heading-md font-semibold text-surface-container-lowest truncate">
                    {passName}
                  </div>
                  <p className="font-caption text-caption text-primary-fixed-dim mt-0.5">{passPhone}</p>
                </div>

                <div className="pt-space-md flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest/15 flex items-center justify-center text-surface-container-lowest">
                      <Icon name="contactless" className="text-2xl" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-surface-container-lowest font-medium">
                        One-Tap Claim Ready
                      </span>
                      <span className="font-caption text-caption text-primary-fixed-dim">PIN Security Active</span>
                    </div>
                  </div>
                  <Icon name="qr_code_2" className="text-3xl opacity-80" />
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-primary">
                  <Icon name="bolt" className="text-2xl" />
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Instant Claim Verification</h3>
                </div>
                <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                  Never wait for SMS codes at merchant checkouts. One tap with your PIN redeems offers instantly in
                  dining, salon, and retail spots across your city.
                </p>
                <div className="flex flex-col gap-space-sm pt-space-xs">
                  {VALUE_POINTS.map((point) => (
                    <div key={point.title} className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle">
                      <Icon name={point.icon} filled className="text-badge-discount-text text-xl shrink-0 mt-0.5" />
                      <div>
                        <span className="font-label-md text-label-md text-text-primary block font-semibold">
                          {point.title}
                        </span>
                        <span className="font-caption text-caption text-text-secondary">{point.copy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-surface-tint-blue p-space-md flex items-center gap-space-sm shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-inner bg-primary-container">
                  <img
                    alt="Portrait of Amara K., a VEMTAP member, smiling in a modern cafe"
                    className="w-full h-full object-cover"
                    src={TESTIMONIAL_AVATAR}
                  />
                </div>
                <div>
                  <p className="font-caption text-caption text-text-secondary italic">
                    “Redeemed my 30% artisan coffee discount in 2 seconds flat with my PIN. Super slick!”
                  </p>
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold block mt-0.5">
                    — Amara K., Victoria Island
                  </span>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-md">
              <div className="mb-space-lg">
                <h1 className="font-display-hero-mobile sm:font-display-hero text-display-hero-mobile sm:text-display-hero text-text-primary mb-2">
                  Tell us about yourself
                </h1>
                <p className="font-body-md text-body-md text-text-secondary">
                  Complete your profile and set your security PIN to access your account and claimed deals.
                </p>
              </div>

              <form className="flex flex-col gap-space-xl" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-1">
                    <h2 className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-2">
                      <Icon name="person" className="text-primary text-xl" />
                      Personal Information
                    </h2>
                    <span className="font-caption text-caption text-text-tertiary">Step 1 of 2</span>
                  </div>

                  <div className="flex flex-col gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-text-primary" htmlFor="profile-first-name">
                        First name
                      </label>
                      <input
                        className="w-full h-[52px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-tertiary"
                        autoComplete="given-name"
                        id="profile-first-name"
                        placeholder="Enter first name"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-text-primary" htmlFor="profile-last-name">
                        Last name
                      </label>
                      <input
                        className="w-full h-[52px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-tertiary"
                        autoComplete="family-name"
                        id="profile-last-name"
                        placeholder="Enter last name"
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-text-primary" htmlFor="profile-phone">
                      Phone number
                    </label>
                    <div className="flex items-center w-full h-[52px] rounded-xl bg-surface-subtle overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-canvas transition-all">
                      <div className="flex items-center gap-2 px-space-md bg-surface-container-low h-full shrink-0 cursor-pointer select-none">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-3.5 rounded-sm object-cover shadow-sm"
                          viewBox="0 0 640 480"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M0 0h640v480H0z" fill="#008751" />
                          <path d="M213.3 0h213.4v480H213.3z" fill="#fff" />
                        </svg>
                        <span className="font-label-md text-label-md font-semibold text-text-primary">+234</span>
                        <Icon name="arrow_drop_down" className="text-base text-text-tertiary" />
                      </div>
                      <input
                        className="w-full h-full px-space-md bg-transparent text-text-primary font-body-md text-body-md focus:outline-none"
                        autoComplete="tel"
                        id="profile-phone"
                        inputMode="tel"
                        placeholder="800 000 0000"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/[^\d ]/g, ''))}
                      />
                    </div>
                    <span className="font-caption text-caption text-text-tertiary">
                      We will use this to sync your reservations &amp; merchant rewards.
                    </span>
                  </div>
                </div>

                {/* Referral code — optional, checked on submit rather than on Apply */}
                <ReferralField
                  fromUrl={referral.fromUrl}
                  onChange={referral.changeCode}
                  value={referral.code}
                />

                <div className="flex flex-col gap-space-md bg-surface-subtle p-space-md sm:p-space-lg rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon name="shield_lock" className="text-primary text-xl" />
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">Create your 6-digit PIN</h2>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                        <Icon name="lock" className="text-xs" />
                        Encrypted
                      </span>
                      <button
                        aria-label={pinRevealed ? 'Hide PIN' : 'Show PIN'}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary active:scale-90 transition-all"
                        type="button"
                        onClick={() => setPinRevealed((current) => !current)}
                      >
                        <Icon name={pinRevealed ? 'visibility_off' : 'visibility'} className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary -mt-1">
                    This 6-digit PIN will be your primary access credential to sign in and confirm deal claims.
                  </p>

                  <PinGroup hint="Numeric only" label="Create 6-digit PIN" value={pin} onChange={setPin} revealed={pinRevealed} />
                  <PinGroup label="Confirm your 6-digit PIN" value={pinConfirm} onChange={setPinConfirm} revealed={pinRevealed} />

                  <div className="flex items-center gap-2 pt-2 text-text-secondary">
                    <Icon name="security" className="text-lg text-primary" />
                    <span className="font-caption text-caption">Your PIN is encrypted and securely stored.</span>
                  </div>

                  {error && (
                    <p className="font-label-sm text-label-sm text-error flex items-center gap-space-2xs" role="alert">
                      <Icon name="error" className="text-label-sm" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-space-md pt-space-xs">
                  <button
                    className={`w-full h-14 font-button-primary text-button-primary rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                      status === 'verified'
                        ? 'bg-badge-discount-text text-white'
                        : 'bg-primary-container hover:bg-primary text-on-primary disabled:cursor-progress disabled:opacity-90'
                    }`}
                    id="submit-btn"
                    type="submit"
                    disabled={status !== 'idle'}
                  >
                    {status === 'idle' && (
                      <>
                        <span>Complete Setup</span>
                        <Icon name="arrow_forward" className="text-xl" />
                      </>
                    )}
                    {status === 'saving' && (
                      <>
                        <Icon name="progress_activity" className="text-xl animate-spin" />
                        <span>Encrypting Credentials...</span>
                      </>
                    )}
                    {status === 'verified' && (
                      <>
                        <Icon name="check_circle" className="text-xl" />
                        <span>Profile Verified!</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center">
                    <button
                      className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-primary-container font-medium group transition-colors"
                      type="button"
                      onClick={handleNext}
                    >
                      <span>Next: Set up your location to discover deals near you</span>
                      <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="pt-space-xs text-center">
                    <p className="font-caption text-caption text-text-secondary">
                      Own a business?{' '}
                      <button
                        className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                        type="button"
                        onClick={onBusinessSetup}
                      >
                        Set up your business on VEMTAP →
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>

      {/* Submit-time referral check — bottom sheet on mobile, modal on desktop */}
      <ReferralConfirmSheet
        open={referral.promptOpen}
        initialCode={referral.code}
        ownCode={ownIdentity.code}
        onCancel={() => {
          referral.cancel();
          setPendingAction(null);
        }}
        onConfirm={() => {
          referral.confirm();
          completePendingAction();
        }}
        onSkip={() => {
          referral.skip();
          completePendingAction();
        }}
      />
    </div>
  );
}
