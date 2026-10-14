import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useProfile } from '../../context/ProfileContext';
import { BusinessSetupChrome } from './BusinessSetupChrome';

interface DesktopBusinessAccountChoiceScreenProps {
  onBack: () => void;
  onContinueWithAccount: () => void;
  onUseNewAccount: () => void;
}

const maskEmail = (email: string) => {
  const at = email.indexOf('@');
  if (at <= 2) return email; // too short to mask meaningfully
  const user = email.slice(0, at);
  const domain = email.slice(at);
  return `${user.slice(0, 2)}***${user.slice(-2)}${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `•••••••${digits.slice(-4)}`;
};

/**
 * First step of business setup when the visitor is already a signed-in
 * consumer: choose whether to reuse the existing consumer account or register
 * a fresh, separate business identity. Reusing the account keeps it intact —
 * it only adds a business-owner capability.
 */
export function DesktopBusinessAccountChoiceScreen({
  onBack,
  onContinueWithAccount,
  onUseNewAccount,
}: DesktopBusinessAccountChoiceScreenProps) {
  const profile = useProfile();
  const [confirming, setConfirming] = useState(false);

  return (
    <BusinessSetupChrome activeNav="profile" onBrand={onBack}>
      <section className="w-full bg-surface py-space-xl lg:py-space-3xl min-h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-xl bg-surface-canvas shadow-sm flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <span className="font-label-md text-label-md text-text-secondary">Business Setup</span>
          </div>

          {!confirming ? (
            <>
              <div className="flex flex-col gap-3 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold w-fit">
                  <Icon name="storefront" className="text-[16px]" />
                  <span>VEMTAP FOR BUSINESS</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface font-bold tracking-tight">
                  Set up your business on VEMTAP
                </h1>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  Choose which account you want to use for your business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="group w-full p-6 rounded-2xl bg-surface-canvas border-2 border-surface-subtle hover:border-primary shadow-sm transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon name="account_circle" className="text-[28px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">Continue with this account</h2>
                  <p className="font-body-md text-body-md text-text-secondary mt-1 leading-tight">
                    Use your existing consumer account and its verified contact information.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onUseNewAccount}
                  className="group w-full p-6 rounded-2xl bg-surface-canvas border-2 border-surface-subtle hover:border-primary shadow-sm transition-all text-left active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-secondary group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center mb-4">
                    <Icon name="person_add" className="text-[28px]" />
                  </div>
                  <h2 className="font-heading-sm text-heading-sm text-on-surface font-bold">Use a new account</h2>
                  <p className="font-body-md text-body-md text-text-secondary mt-1 leading-tight">
                    Register using Google or another email address.
                  </p>
                </button>
              </div>
            </>
          ) : (
<div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="person" className="text-[48px]" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading-lg text-heading-lg text-on-surface font-bold">
                  Confirm Business Owner Account
                </h1>
                <p className="font-body-md text-body-md text-text-secondary max-w-md">
                  You are using your existing consumer profile to set up your business. Your consumer account stays
                  intact — this only adds a business-owner capability.
                </p>
              </div>

              <div className="w-full max-w-md p-6 rounded-2xl bg-surface-canvas border border-surface-subtle shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Full Name</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.fullName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Email</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.email ? maskEmail(profile.email) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label-sm text-label-sm text-text-secondary">Phone</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface text-right">
                    {profile.phone ? maskPhone(profile.phone) : '—'}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onContinueWithAccount}
                  className="w-full h-14 rounded-2xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                >
                  <span>Confirm &amp; Continue</span>
                  <Icon name="check_circle" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="w-full h-14 rounded-2xl bg-surface-subtle text-text-secondary font-button-secondary text-button-secondary flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </BusinessSetupChrome>
  );
}