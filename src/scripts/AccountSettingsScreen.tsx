import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';

interface AccountSettingsScreenProps {
  onBack: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onSignOut: () => void;
}

interface ToggleState {
  biometrics: boolean;
  sms: boolean;
  email: boolean;
  personalized: boolean;
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface-container-lowest shadow-sm transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function AccountSettingsScreen({ onBack, onOpenPrivacy, onOpenTerms, onSignOut }: AccountSettingsScreenProps) {
  const [toggles, setToggles] = useState<ToggleState>({
    biometrics: true,
    sms: true,
    email: true,
    personalized: true,
  });
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const flip = (key: keyof ToggleState, label: string) => {
    setToggles((current) => {
      const next = !current[key];
      showToast(`${label} turned ${next ? 'on' : 'off'}`);
      return { ...current, [key]: next };
    });
  };

  const sectionTitle =
    'font-label-sm text-label-sm text-text-tertiary uppercase tracking-wider font-semibold px-space-2xs';
  const rowButton =
    'w-full text-left p-space-md flex items-center justify-between gap-space-sm active:bg-surface-subtle transition-colors min-h-[64px]';
  const iconTile = 'w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center shrink-0';
  const rowTitle = 'font-heading-sm text-heading-sm text-text-primary text-[15px]';
  const rowHint = 'font-caption text-caption text-text-secondary truncate';
  const chevron = <Icon name="chevron_right" className="text-outline-variant text-[20px] shrink-0" />;

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-11 h-11 -ml-space-2xs flex items-center justify-center rounded-full text-on-surface active:bg-surface-container transition-colors"
            >
              <Icon name="arrow_back_ios_new" className="text-[24px]" />
            </button>
            <h1 className="font-heading-sm text-heading-sm text-on-surface truncate tracking-tight">
              Account Settings &amp; Security
            </h1>
          </div>
          <div className="flex items-center shrink-0 pl-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pt-space-md pb-space-2xl gap-space-lg">
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-badge-discount-bg opacity-60 pointer-events-none" />
          <div className="flex items-start justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="text-badge-discount-text text-[20px]" filled />
              </div>
              <div>
                <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-badge-discount-bg font-caption text-caption text-badge-discount-text font-semibold">
                  Security Status: Protected
                </span>
              </div>
            </div>
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
          </div>
          <p className="font-body-md text-body-md text-text-secondary leading-snug">
            Two-step PIN &amp; Biometric login active. Your VEMTAP wallet credentials and deals ledger are secured.
          </p>
          <div className="pt-space-2xs flex items-center gap-space-xs text-text-tertiary">
            <Icon name="account_circle" className="text-[16px] text-primary" />
            <span className="font-caption text-caption text-text-secondary truncate">
              Zainab Ahmed • +234 803 555 0192 •{' '}
              <span className="text-badge-discount-text font-medium">Verified</span>
            </span>
          </div>
        </section>

        <section className="space-y-space-xs">
          <h2 className={sectionTitle}>Login &amp; Credentials</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => showToast('Opening PIN manager…')}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="pin" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className={rowTitle}>Security PIN</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  </div>
                  <p className={rowHint}>4-digit PIN used for redemption &amp; access</p>
                  <p className="font-caption text-caption text-primary font-medium mt-0.5">
                    Active • Changed 2 mo ago
                  </p>
                </div>
              </div>
              {chevron}
            </button>

            <div className="p-space-md flex items-center justify-between gap-space-sm bg-surface-subtle min-h-[64px]">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="fingerprint" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Biometric Login</span>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">
                    Face ID / Touch ID voucher redemption
                  </p>
                </div>
              </div>
              <Toggle
                checked={toggles.biometrics}
                label="Biometric login"
                onChange={() => flip('biometrics', 'Biometric login')}
              />
            </div>

            <button
              type="button"
              onClick={() => showToast('Password reset link sent to your email')}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="password" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Change Password</span>
                  <p className={rowHint}>Last updated on Oct 4, 2024</p>
                </div>
              </div>
              {chevron}
            </button>
          </div>
        </section>

        <section className="space-y-space-xs">
          <h2 className={sectionTitle}>Devices &amp; Sessions</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-start gap-space-sm min-w-0">
                <div className={`${iconTile} mt-0.5`}>
                  <Icon name="smartphone" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-2xs flex-wrap">
                    <span className={rowTitle}>iPhone 15 Pro</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-badge-discount-bg font-caption text-[11px] text-badge-discount-text font-semibold">
                      Active Now
                    </span>
                  </div>
                  <p className={rowHint}>Abuja, Nigeria • VEMTAP v2.14.0</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-surface-container w-full" />

            <div className="flex items-start justify-between gap-space-xs">
              <div className="flex items-start gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="tablet_mac" className="text-secondary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>iPad Air</span>
                  <p className={rowHint}>Maitama, Nigeria • Last active 3 days ago</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('2 devices signed in to this account')}
              className="w-full text-left pt-space-2xs flex items-center justify-between text-primary font-label-md text-label-md font-semibold active:opacity-75 transition-opacity"
            >
              <span>Manage All Devices (2) &amp; Log Out Others</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </section>

        <section className="space-y-space-xs">
          <h2 className={sectionTitle}>Verification &amp; Alerts</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="p-space-md flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="sms" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>SMS Alerts</span>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">
                    Codes for sign-ins to +234 803 555 0192
                  </p>
                </div>
              </div>
              <Toggle checked={toggles.sms} label="SMS alerts" onChange={() => flip('sms', 'SMS alerts')} />
            </div>

            <div className="p-space-md flex items-center justify-between gap-space-sm bg-surface-subtle">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="mail" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Email Notices</span>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">
                    Sent to zainab.ahmed@example.com
                  </p>
                </div>
              </div>
              <Toggle checked={toggles.email} label="Email notices" onChange={() => flip('email', 'Email notices')} />
            </div>

            <button
              type="button"
              onClick={() => showToast('Showing recent sign-ins, IPs & tokens')}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="manage_history" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Security Audit Log</span>
                  <p className={rowHint}>Review recent sign-ins, IP addresses &amp; tokens</p>
                </div>
              </div>
              {chevron}
            </button>
          </div>
        </section>

        <section className="space-y-space-xs">
          <h2 className={sectionTitle}>Privacy &amp; Data</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <button type="button" onClick={onOpenPrivacy} className={`${rowButton} hover:bg-surface-subtle`}>
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="near_me" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Location Precision</span>
                  <p className={rowHint}>Deals within 5km in Apo &amp; Maitama</p>
                </div>
              </div>
              <div className="flex items-center gap-space-2xs shrink-0">
                <span className="font-caption text-caption text-primary font-medium">While Using</span>
                {chevron}
              </div>
            </button>

            <div className="p-space-md flex items-center justify-between gap-space-sm bg-surface-subtle">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="auto_awesome" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Personalized Deals</span>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">
                    Tailor claims to your frequent categories
                  </p>
                </div>
              </div>
              <Toggle
                checked={toggles.personalized}
                label="Personalized deals"
                onChange={() => flip('personalized', 'Personalized deals')}
              />
            </div>

            <button type="button" onClick={onOpenTerms} className={`${rowButton} hover:bg-surface-subtle`}>
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="description" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Download Data &amp; Policy</span>
                  <p className={rowHint}>Export profile copy &amp; view privacy terms</p>
                </div>
              </div>
              {chevron}
            </button>

            <div className="h-[1px] bg-surface-container w-full" />

            {/* BUG-018/019: Delete Account lives under Privacy & Data, never beside Sign Out. */}
            <button
              type="button"
              onClick={() => setShowDeleteAccount(true)}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center shrink-0">
                  <Icon name="delete_forever" className="text-error text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block text-error`}>Delete Account &amp; Purge Vouchers</span>
                  <p className={rowHint}>Permanently remove your profile &amp; redemption ledger</p>
                </div>
              </div>
              {chevron}
            </button>
          </div>
        </section>

        <section className="space-y-space-md pt-space-xs">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className="w-full h-[52px] rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary active:scale-[0.98] transition-transform"
            >
              <Icon name="logout" className="text-[20px] text-error" />
              <span className="font-semibold">Sign Out of All Devices</span>
            </button>
            <p className="font-caption text-caption text-text-tertiary text-center">
              You can sign back in anytime with your password.
            </p>
          </div>
        </section>
      </main>

      {confirmSignOut && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmSignOut(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-space-lg shadow-2xl flex flex-col space-y-space-md pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                  <Icon name="logout" className="text-[18px]" />
                </div>
                <h3 className="font-heading-sm text-heading-sm text-on-surface">Sign out everywhere?</h3>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <p className="font-body-md text-body-md text-text-secondary">
              You&apos;ll be signed out of all devices except this one. You can sign back in anytime with your password.
            </p>
            <div className="flex gap-space-xs">
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="flex-1 h-11 rounded-xl bg-surface-container-low text-text-secondary font-button-secondary text-button-secondary active:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSignOut(false);
                  showToast('Signed out of 1 other device');
                }}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteAccountSheet
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onCompleted={() => {
          setShowDeleteAccount(false);
          onSignOut();
        }}
      />

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full shadow-lg font-label-md text-label-md flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[18px] text-badge-discount-text" filled />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
