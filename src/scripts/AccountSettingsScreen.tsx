import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';

interface AccountSettingsScreenProps {
  onBack: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  /** Business Settings › Manage Features — the dashboard tool switchboard. Omitted in consumer mode. */
  onOpenFeatures?: () => void;
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

/** PalmPay / OPay compact toggle switch */
function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function AccountSettingsScreen({
  onBack,
  onOpenPrivacy,
  onOpenTerms,
  onOpenFeatures,
  onSignOut,
}: AccountSettingsScreenProps) {
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
    'text-[11px] text-text-tertiary uppercase tracking-wider font-semibold px-1';
  const rowButton =
    'w-full text-left px-3 py-2 flex items-center justify-between gap-2.5 active:bg-surface-subtle transition-colors min-h-[46px]';
  const iconTile = 'w-7 h-7 rounded-lg bg-surface-tint-blue flex items-center justify-center shrink-0';
  const rowTitle = 'font-semibold text-text-primary text-[13px] leading-tight';
  const rowHint = 'text-[11px] text-text-secondary truncate leading-tight';
  const chevron = <Icon name="chevron_right" className="text-outline-variant text-[18px] shrink-0" />;

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-xs border-b border-border-subtle/40">
        <div className="h-14 px-margin flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              aria-label="Go back"
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full text-on-surface active:bg-surface-container transition-colors"
            >
              <Icon name="arrow_back_ios_new" className="text-[18px]" />
            </button>
            <h1 className="font-bold text-[15px] text-on-surface truncate tracking-tight">
              Settings &amp; Security
            </h1>
          </div>
          <div className="flex items-center shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Icon name="person" className="text-on-primary text-[16px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full px-margin pt-3 pb-8 gap-3.5">
        {/* Security Overview Banner */}
        <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 p-3 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-badge-discount-bg opacity-50 pointer-events-none" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-badge-discount-bg flex items-center justify-center shrink-0">
                <Icon name="verified_user" className="text-badge-discount-text text-[15px]" filled />
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-discount-bg text-[10px] text-badge-discount-text font-bold uppercase tracking-wider">
                Protected
              </span>
            </div>
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
          </div>
          <p className="text-[12px] text-text-secondary leading-snug">
            Two-step PIN &amp; Biometric login active. Your wallet credentials and ledger are secured.
          </p>
          <div className="pt-0.5 flex items-center gap-1.5 text-text-tertiary">
            <Icon name="account_circle" className="text-[14px] text-primary" />
            <span className="text-[11px] text-text-secondary truncate">
              Zainab Ahmed • +234 803 555 0192 •{' '}
              <span className="text-badge-discount-text font-medium">Verified</span>
            </span>
          </div>
        </section>

        {/* Login & Credentials */}
        <section className="space-y-1">
          <h2 className={sectionTitle}>Login &amp; Credentials</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 divide-y divide-border-subtle/40 overflow-hidden">
            <button
              type="button"
              onClick={() => showToast('Opening PIN manager…')}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="pin" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={rowTitle}>Security PIN</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
                  </div>
                  <p className={rowHint}>4-digit PIN used for redemption &amp; access</p>
                </div>
              </div>
              {chevron}
            </button>

            <div className="px-3 py-2 flex items-center justify-between gap-2.5 bg-surface-subtle/30 min-h-[46px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="fingerprint" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Biometric Login</span>
                  <p className="text-[11px] text-text-secondary truncate">
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="password" className="text-primary text-[17px]" />
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

        {/* Dashboard Tools */}
        {onOpenFeatures && (
          <section className="space-y-1">
            <h2 className={sectionTitle}>Dashboard Tools</h2>
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 overflow-hidden">
              <button type="button" onClick={onOpenFeatures} className={`${rowButton} hover:bg-surface-subtle`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={iconTile}>
                    <Icon name="dashboard_customize" className="text-primary text-[17px]" />
                  </div>
                  <div className="min-w-0">
                    <span className={`${rowTitle} block`}>Manage Features</span>
                    <p className={rowHint}>Switch dashboard tools like POS, Deals &amp; Analytics on or off</p>
                  </div>
                </div>
                {chevron}
              </button>
            </div>
          </section>
        )}

        {/* Devices & Sessions */}
        <section className="space-y-1">
          <h2 className={sectionTitle}>Devices &amp; Sessions</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="smartphone" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={rowTitle}>iPhone 15 Pro</span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-badge-discount-bg text-[10px] text-badge-discount-text font-semibold">
                      Active
                    </span>
                  </div>
                  <p className={rowHint}>Abuja, Nigeria • VEMTAP v2.14.0</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-border-subtle/50 w-full" />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                  <Icon name="tablet_mac" className="text-secondary text-[17px]" />
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
              className="w-full text-left pt-1 flex items-center justify-between text-primary text-xs font-semibold active:opacity-75 transition-opacity"
            >
              <span>Manage All Devices (2) &amp; Log Out Others</span>
              <Icon name="arrow_forward" className="text-[15px]" />
            </button>
          </div>
        </section>

        {/* Verification & Alerts */}
        <section className="space-y-1">
          <h2 className={sectionTitle}>Verification &amp; Alerts</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 divide-y divide-border-subtle/40 overflow-hidden">
            <div className="px-3 py-2 flex items-center justify-between gap-2.5 min-h-[46px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="sms" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>SMS Alerts</span>
                  <p className={rowHint}>Codes for sign-ins to +234 803 555 0192</p>
                </div>
              </div>
              <Toggle checked={toggles.sms} label="SMS alerts" onChange={() => flip('sms', 'SMS alerts')} />
            </div>

            <div className="px-3 py-2 flex items-center justify-between gap-2.5 bg-surface-subtle/30 min-h-[46px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="mail" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Email Notices</span>
                  <p className={rowHint}>Sent to zainab.ahmed@example.com</p>
                </div>
              </div>
              <Toggle checked={toggles.email} label="Email notices" onChange={() => flip('email', 'Email notices')} />
            </div>

            <button
              type="button"
              onClick={() => showToast('Showing recent sign-ins, IPs & tokens')}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="manage_history" className="text-primary text-[17px]" />
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

        {/* Privacy & Data */}
        <section className="space-y-1">
          <h2 className={sectionTitle}>Privacy &amp; Data</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border-subtle/50 divide-y divide-border-subtle/40 overflow-hidden">
            <button type="button" onClick={onOpenPrivacy} className={`${rowButton} hover:bg-surface-subtle`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="near_me" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Location Precision</span>
                  <p className={rowHint}>Deals within 5km in Apo &amp; Maitama</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-primary font-semibold">While Using</span>
                {chevron}
              </div>
            </button>

            <div className="px-3 py-2 flex items-center justify-between gap-2.5 bg-surface-subtle/30 min-h-[46px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="auto_awesome" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Personalized Deals</span>
                  <p className={rowHint}>Tailor claims to your frequent categories</p>
                </div>
              </div>
              <Toggle
                checked={toggles.personalized}
                label="Personalized deals"
                onChange={() => flip('personalized', 'Personalized deals')}
              />
            </div>

            <button type="button" onClick={onOpenTerms} className={`${rowButton} hover:bg-surface-subtle`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={iconTile}>
                  <Icon name="description" className="text-primary text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Download Data &amp; Policy</span>
                  <p className={rowHint}>Export profile copy &amp; view privacy terms</p>
                </div>
              </div>
              {chevron}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteAccount(true)}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-error-container flex items-center justify-center shrink-0">
                  <Icon name="delete_forever" className="text-error text-[17px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block text-error`}>Delete Account &amp; Purge Data</span>
                  <p className={rowHint}>Permanently remove profile &amp; records</p>
                </div>
              </div>
              {chevron}
            </button>
          </div>
        </section>

        {/* Sign Out Action */}
        <section className="pt-1">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform shadow-xs"
          >
            <Icon name="logout" className="text-[18px] text-error" />
            <span>Sign Out of All Devices</span>
          </button>
          <p className="text-[11px] text-text-tertiary text-center mt-1.5">
            You can sign back in anytime with your credentials.
          </p>
        </section>
      </main>

      {confirmSignOut && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmSignOut(false);
          }}
        >
          <div className="w-full max-w-lg bg-surface rounded-t-2xl p-4 shadow-2xl flex flex-col space-y-3 pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-error-container text-error flex items-center justify-center">
                  <Icon name="logout" className="text-[16px]" />
                </div>
                <h3 className="font-bold text-sm text-on-surface">Sign out everywhere?</h3>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              You&apos;ll be signed out of all devices except this one. You can sign back in anytime with your password.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="flex-1 h-10 rounded-xl bg-surface-container-low text-text-secondary text-xs font-semibold active:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSignOut(false);
                  showToast('Signed out of 1 other device');
                }}
                className="flex-1 h-10 rounded-xl bg-error text-on-error text-xs font-semibold active:scale-[0.98] transition-transform"
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2 transition-all duration-300">
          <Icon name="check_circle" className="text-[16px] text-badge-discount-text" filled />
          <span>{toast}</span>
        </div>
      )}
    </AppScreen>
  );
}
