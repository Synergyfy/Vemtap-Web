import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { ReferralField } from '../../components/referral/ReferralField';
import { ReferralConfirmSheet } from '../../components/referral/ReferralConfirmSheet';
import { useProfile } from '../../context/ProfileContext';
import { useReferralIdentity } from '../../hooks/useReferralIdentity';
import { useReferralStep } from '../../hooks/useReferralStep';
import type { GoogleConfirmDetails } from '../GoogleProfileConfirmScreen';

interface DesktopGoogleProfileConfirmScreenProps {
  onBack: () => void;
  onContinue: (details: GoogleConfirmDetails) => void;
}

/**
 * Desktop twin of `GoogleProfileConfirmScreen` — same steps, wider layout.
 * Google sign-up is not connected to a real API in this build; the profile
 * shown comes from the app's existing profile store.
 */
export function DesktopGoogleProfileConfirmScreen({ onBack, onContinue }: DesktopGoogleProfileConfirmScreenProps) {
  const profile = useProfile();
  const ownIdentity = useReferralIdentity();

  const [phone, setPhone] = useState('');
  const referral = useReferralStep();

  const phoneAvailable = profile.hasPhone;
  const phoneDigits = phone.replace(/\D/g, '');
  const canContinue = phoneAvailable || phoneDigits.length >= 7;

  const submit = () => {
    onContinue({
      phone: phoneAvailable ? profile.phone : `+234 ${phone.trim()}`,
      referralCode: referral.code || null,
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    // The referral code is checked on submit, not while it is being typed.
    if (referral.needsConfirmation) {
      referral.requestConfirmation();
      return;
    }
    submit();
  };

  const inputClass =
    'w-full h-[52px] px-space-md rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md focus:bg-surface-canvas focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-text-tertiary';

  return (
    <div className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md sm:p-space-xl bg-surface-subtle selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="w-full flex items-center justify-center">
        <div className="w-full max-w-6xl py-space-xl">
          <header className="w-full flex flex-col md:flex-row md:items-center justify-between pb-space-lg mb-space-xl gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="Back to sign in"
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                type="button"
                onClick={onBack}
              >
                <Icon name="arrow_back" className="text-xl" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                <Icon name="account_circle" filled className="text-xl" />
              </div>
              <div>
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary block">
                  Google sign-up
                </span>
                <h2 className="font-heading-sm text-heading-sm text-text-primary">Step 2 of 3 • Confirm profile</h2>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <aside className="lg:col-span-5 flex flex-col gap-space-lg">
              <div className="rounded-2xl bg-primary-container text-on-primary p-space-lg shadow-lg">
                <Icon name="g_mobiledata" className="text-5xl mb-space-sm" />
                <h3 className="font-heading-sm text-heading-sm mb-1">You’re signed in with Google</h3>
                <p className="font-body-md text-body-md text-on-primary/90 leading-relaxed">
                  We’re showing the profile details this browser already has for you. Confirm them, add a phone number
                  if Google didn’t share one, and you’re ready to go.
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
                  No referral code is verified by a server in this build — codes you enter are kept as a provisional
                  note until the referral programme launches.
                </p>
              </div>
            </aside>

            <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-md">
              <div className="mb-space-lg">
                <h1 className="font-display-hero-mobile sm:font-display-hero text-display-hero-mobile sm:text-display-hero text-text-primary mb-2">
                  Confirm your profile
                </h1>
                <p className="font-body-md text-body-md text-text-secondary">
                  Check these details before entering your dashboard.
                </p>
              </div>

              <form
                className="flex flex-col gap-space-xl"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleContinue();
                }}
              >
                <div className="rounded-xl bg-surface-subtle p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <Icon name="account_circle" className="text-primary text-xl" />
                    <h2 className="font-heading-sm text-heading-sm text-text-primary">Your Google profile</h2>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <span className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-bold shrink-0">
                      {profile.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-text-primary font-semibold truncate">
                        {profile.fullName}
                      </p>
                      <p className="font-caption text-caption text-text-secondary truncate">{profile.email}</p>
                    </div>
                  </div>

                  {phoneAvailable ? (
                    <div className="flex items-center gap-space-2xs rounded-lg bg-badge-discount-bg px-space-sm py-space-2xs">
                      <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" />
                      <span className="font-caption text-caption text-badge-discount-text">
                        Phone number on file: <span className="font-semibold">{profile.phone}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-text-primary" htmlFor="desktop-google-phone">
                        Phone number <span className="text-error">*</span>
                      </label>
                      <input
                        autoComplete="tel"
                        className={inputClass}
                        id="desktop-google-phone"
                        inputMode="numeric"
                        placeholder="801 234 5678"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/[^\d\s]/g, ''))}
                      />
                      <p className="font-caption text-caption text-text-tertiary">
                        Google didn’t share a phone number — we only use it for claims, orders and account recovery.
                      </p>
                    </div>
                  )}
                </div>

                {/* Referral code — optional, checked on submit rather than on Apply */}
                <ReferralField
                  fromUrl={referral.fromUrl}
                  onChange={referral.changeCode}
                  value={referral.code}
                />

                <button
                  type="submit"
                  disabled={!canContinue}
                  className="w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md hover:bg-primary transition active:scale-[0.98] disabled:opacity-40"
                >
                  <span>Continue</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
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
        onCancel={referral.cancel}
        onConfirm={() => {
          referral.confirm();
          submit();
        }}
        onSkip={() => {
          referral.skip();
          submit();
        }}
      />
    </div>
  );
}
