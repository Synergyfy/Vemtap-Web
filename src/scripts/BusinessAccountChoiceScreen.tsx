import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useProfile } from '../context/ProfileContext';

interface BusinessAccountChoiceScreenProps {
  onBack: () => void;
  onContinueWithAccount: () => void;
  onUseNewAccount: () => void;
}

export function BusinessAccountChoiceScreen({
  onBack,
  onContinueWithAccount,
  onUseNewAccount,
}: BusinessAccountChoiceScreenProps) {
  const profile = useProfile();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const maskEmail = (email: string) => {
    if (!email) return '—';
    const at = email.indexOf('@');
    if (at <= 2) return email;
    const user = email.slice(0, at);
    const domain = email.slice(at);
    return `${user.slice(0, 2)}***${user.slice(-2)}${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return 'Not provided';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    return `•••••••${digits.slice(-4)}`;
  };

  if (showConfirmation) {
    return (
      <AppScreen>
        <ScreenHeader title="Confirm Account" onBack={() => setShowConfirmation(false)} />
        <div className="px-margin py-space-xl flex flex-col items-center text-center gap-space-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="person" className="text-[40px]" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading-md text-heading-md text-on-surface font-bold">
              Confirm Business Owner Account
            </h2>
            <p className="font-body-md text-body-md text-text-secondary">
              You are using your existing consumer profile to set up your business.
            </p>
          </div>

          <div className="w-full max-w-sm p-space-md rounded-3xl bg-surface-container border border-surface-variant flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Full Name</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">{profile.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Email</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {maskEmail(profile.email)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-secondary">Phone</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {maskPhone(profile.phone || 'Not provided')}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
            <button
              className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
              type="button"
              onClick={onContinueWithAccount}
            >
              <span>Confirm & Continue</span>
              <Icon name="check_circle" className="text-[20px]" />
            </button>
            <button
              className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
              type="button"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Business Setup" onBack={onBack} />
      <div className="px-margin py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col gap-2">
          <h1 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight">
            Set up your business on VEMTAP
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Choose which account you want to use for your business.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            className="w-full p-space-md rounded-3xl bg-surface-canvas border-2 border-transparent hover:border-primary shadow-sm transition-all text-left group active:scale-[0.99]"
            type="button"
            onClick={() => setShowConfirmation(true)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon name="account_circle" className="text-[28px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                  Continue with this account
                </span>
                <span className="font-body-md text-body-md text-text-secondary leading-tight">
                  Use your existing consumer account and its verified contact information.
                </span>
              </div>
            </div>
          </button>

          <button
            className="w-full p-space-md rounded-3xl bg-surface-canvas border-2 border-transparent hover:border-primary shadow-sm transition-all text-left group active:scale-[0.99]"
            type="button"
            onClick={onUseNewAccount}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon name="person_add" className="text-[28px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading-sm text-heading-sm text-on-surface font-bold">
                  Use a new account
                </span>
                <span className="font-body-md text-body-md text-text-secondary leading-tight">
                  Register using Google or another email address.
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
