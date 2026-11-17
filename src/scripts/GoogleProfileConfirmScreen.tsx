import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ReferralField } from '../components/referral/ReferralField';
import { ReferralConfirmSheet } from '../components/referral/ReferralConfirmSheet';
import { useProfile } from '../context/ProfileContext';
import { useReferralIdentity } from '../hooks/useReferralIdentity';
import { useReferralStep } from '../hooks/useReferralStep';

export interface GoogleConfirmDetails {
  phone: string;
  referralCode: string | null;
}

interface GoogleProfileConfirmScreenProps {
  onBack: () => void;
  onContinue: (details: GoogleConfirmDetails) => void;
}

/**
 * Post-Google-authentication profile confirmation.
 *
 * Shown before the dashboard so the user can confirm the profile the frontend
 * holds, add a phone number when Google didn't provide one, and optionally
 * enter a referral code.
 *
 * NOTE: Google sign-up is not connected to a real Google API in this build —
 * the profile shown comes from the app's existing profile store, and nothing
 * here is verified by a server.
 */
export function GoogleProfileConfirmScreen({ onBack, onContinue }: GoogleProfileConfirmScreenProps) {
  const profile = useProfile();
  const ownIdentity = useReferralIdentity();

  const [phone, setPhone] = useState(profile.hasPhone ? profile.phone.replace(/^\+?\d{3}\s?/, '') : '');
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

  return (
    <AppScreen>
      <ScreenHeader title="Confirm your profile" onBack={onBack} />

      <div className="flex flex-col w-full flex-1">
        <div className="px-margin pt-space-xs pb-space-sm flex flex-col gap-space-xs bg-surface-canvas">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs bg-surface-container-high px-space-xs py-space-2xs rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm text-primary font-semibold">Step 2 of 3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <div className="w-6 h-2 rounded-full bg-primary-container" />
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        <div className="px-margin pt-space-xs pb-space-md">
          <h2 className="font-heading-lg text-heading-lg text-text-primary font-semibold tracking-tight">
            Confirm your profile
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            You signed in with Google. Check these details before entering your dashboard.
          </p>
        </div>

        <div className="flex flex-col px-margin gap-space-lg pb-space-3xl">
          {/* Profile summary */}
          <div className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-7 h-7 rounded-full bg-surface-tint-blue flex items-center justify-center text-primary">
                <Icon name="account_circle" className="text-[16px]" />
              </span>
              <span className="font-label-md text-label-md text-text-primary font-semibold">Your Google profile</span>
            </div>

            <div className="flex items-center gap-space-sm">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-heading-sm text-heading-sm font-bold shrink-0">
                {profile.initials}
              </span>
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-text-primary font-semibold truncate">{profile.fullName}</p>
                <p className="font-caption text-caption text-text-secondary truncate">{profile.email}</p>
              </div>
            </div>

            {phoneAvailable ? (
              <div className="flex items-center gap-space-2xs rounded-lg bg-surface-subtle px-space-sm py-space-2xs">
                <Icon name="check_circle" className="text-[16px] text-badge-discount-text shrink-0" />
                <span className="font-caption text-caption text-text-secondary">
                  Phone number on file: <span className="text-text-primary font-semibold">{profile.phone}</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="google-phone">
                  Phone number <span className="text-error">*</span>
                </label>
                <div className="bg-surface-subtle rounded-xl flex items-center h-[50px] px-3 shadow-sm gap-2">
                  <span className="font-label-sm text-label-sm text-text-primary font-semibold shrink-0">+234</span>
                  <input
                    autoComplete="tel"
                    className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:ring-0"
                    id="google-phone"
                    inputMode="numeric"
                    placeholder="801 234 5678"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/[^\d\s]/g, ''))}
                  />
                </div>
                <p className="font-caption text-caption text-text-tertiary">
                  Google didn’t share a phone number — we only use it for claims, orders and account recovery.
                </p>
              </div>
            )}
          </div>

          {/* Referral code — optional, checked on submit rather than on Apply */}
          <ReferralField
            compact
            fromUrl={referral.fromUrl}
            onChange={referral.changeCode}
            value={referral.code}
          />

          <button
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className="w-full h-[54px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-space-2xs shadow-md active:scale-[0.98] transition disabled:opacity-40"
          >
            <span>Continue</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>

          <p className="font-caption text-caption text-text-tertiary text-center leading-relaxed">
            Google authentication isn’t changed by this screen. A referral code entered here is applied to your new
            account once you continue.
          </p>
        </div>
      </div>

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
    </AppScreen>
  );
}
