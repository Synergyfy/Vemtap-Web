import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
import { useAuth } from '../../context/AuthContext';
import { BusinessPortalChrome, type BusinessPortalNavKey } from './BusinessPortalChrome';

interface DesktopBusinessSettingsScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  /** Called after account deletion completes — sign out and leave the portal. */
  onSignOut?: () => void;
}

type CredentialMode = 'pin' | 'password';

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

/**
 * Shared modal for the two credential changes on Business Settings: the
 * 4-digit transaction PIN and the account password.
 */
function CredentialModal({
  mode,
  onClose,
  onSaved,
}: {
  mode: CredentialMode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isPin = mode === 'pin';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const submit = () => {
    if (isPin) {
      if (!/^\d{4}$/.test(current)) return setError('Your current PIN is 4 digits');
      if (!/^\d{4}$/.test(next)) return setError('The new PIN must be 4 digits');
      if (next === current) return setError('The new PIN must differ from the current one');
    } else {
      if (current.length < 8) return setError('Current password must be at least 8 characters');
      if (next.length < 8) return setError('New password must be at least 8 characters');
    }
    if (next !== confirm) return setError('Confirmation does not match');
    setError(null);
    onSaved();
  };


  const field = (label: string, value: string, setter: (value: string) => void, hint?: string) => (
    <label className="flex flex-col gap-space-2xs">
      <span className="font-label-sm text-label-sm text-text-secondary font-semibold">{label}</span>
      <input
        type="password"
        inputMode={isPin ? 'numeric' : undefined}
        maxLength={isPin ? 4 : 64}
        value={value}
        onChange={(event) => setter(event.target.value)}
        placeholder={isPin ? '••••' : '••••••••'}
        className={`h-11 px-space-sm rounded-xl bg-surface-canvas border-2 ${
          isPin ? 'border-outline-variant focus:border-primary-container focus:ring-4 focus:ring-primary-container/15' : 'border-border-subtle focus:border-primary'
        } font-body-md text-body-md text-on-surface tracking-widest outline-none transition-all shadow-sm`}
      />
      {hint && <span className="font-caption text-caption text-text-tertiary">{hint}</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isPin ? 'Change transaction PIN' : 'Change password'}
        className="w-full max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-2xl p-space-xl flex flex-col gap-space-md"
      >
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name={isPin ? 'dialpad' : 'lock'} className="text-[20px]" />
            </span>
            <div className="flex flex-col">
              <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                {isPin ? 'Change transaction PIN' : 'Change password'}
              </h2>
              <p className="font-caption text-caption text-text-secondary">
                {isPin ? 'Used to authorise refunds, payouts & voids' : 'Used to sign in to your business account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-subtle transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-space-sm">
          {field(`Current ${isPin ? 'PIN' : 'password'}`, current, setCurrent)}
          {field(`New ${isPin ? 'PIN' : 'password'}`, next, setNext, isPin ? 'Exactly 4 digits' : 'At least 8 characters')}
          {field(`Confirm new ${isPin ? 'PIN' : 'password'}`, confirm, setConfirm)}
        </div>

        {error && (
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-error-container text-error font-label-sm text-label-sm">
            <Icon name="error" className="text-[16px]" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-space-sm pt-space-2xs">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-space-md rounded-xl bg-surface-container text-on-surface font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-transform"
          >
            <span>{isPin ? 'Update PIN' : 'Update password'}</span>
            <Icon name="check" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * Business Settings — reached from More → Business Settings and the account
 * menu. Existing-account controls: security (transaction PIN / password /
 * 2FA), NDPR data rights, notification preferences and account deletion.
 */
export function DesktopBusinessSettingsScreen({ onNav, onSignOut }: DesktopBusinessSettingsScreenProps) {
  const { signOut } = useAuth();
  const [credential, setCredential] = useState<CredentialMode | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [security, setSecurity] = useState({ twoFactor: true, posPin: true, deviceAlerts: true });
  const [privacy, setPrivacy] = useState({ restrictProcessing: false, analytics: true, marketing: true });
  const [channels, setChannels] = useState({ push: true, email: true, sms: true, whatsapp: false });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2600);
  };

  const flip = <T extends Record<string, boolean>>(
    setter: Dispatch<SetStateAction<T>>,
    key: keyof T & string,
    label: string,
  ) =>
    setter((current) => {
      const next = !current[key];
      showToast(`${label} turned ${next ? 'on' : 'off'}`);
      return { ...current, [key]: next };
    });

  const SettingRow = ({
    icon,
    iconClass,
    title,
    desc,
    trailing,
  }: {
    icon: string;
    iconClass: string;
    title: string;
    desc: string;
    trailing: ReactNode;
  }) => (
    <div className="flex items-center gap-space-sm px-space-lg py-space-md">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon name={icon} className="text-[20px]" />
      </span>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-label-md text-label-md text-on-surface font-semibold">{title}</span>
        <span className="font-caption text-caption text-text-secondary mt-0.5">{desc}</span>
      </div>
      {trailing}
    </div>
  );

  const ActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-space-sm rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors shrink-0"
    >
      {label}
    </button>
  );

  return (
    <BusinessPortalChrome activeNav="more-settings" onNav={onNav}>
      <div className="w-full py-space-xl space-y-space-lg">
        <section className="flex flex-col gap-space-2xs max-w-3xl">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
            More · Account
          </span>
          <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Business Settings</h1>
          <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
            Security, privacy and account controls for your business — transaction PIN, NDPR data rights, notification
            channels and account deletion.
          </p>
        </section>

        <section className="rounded-2xl bg-surface-canvas shadow-sm p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <Icon name="storefront" className="text-[24px]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                Urban Grill &amp; Bistro
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                #VG-80492 · hello@urbangrill.ng · +234 803 555 0192
              </span>
            </div>
          </div>
          <ActionButton label="Edit business profile" onClick={() => onNav('business-profile')} />
        </section>


        <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-space-sm px-space-lg py-space-md border-b border-border-subtle">
            <div className="flex items-center gap-space-sm">
              <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                <Icon name="shield" className="text-[20px]" />
              </span>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Security &amp; Login</h2>
                <span className="font-caption text-caption text-text-secondary">
                  Credentials, POS authorisation &amp; sign-in alerts
                </span>
              </div>
            </div>
            <span className="px-space-xs py-space-2xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-bold uppercase tracking-wider">
              High
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            <SettingRow
              icon="dialpad"
              iconClass="bg-primary-container text-on-primary"
              title="Transaction PIN"
              desc="4-digit PIN for refunds, voids and payout releases"
              trailing={<ActionButton label="Change PIN" onClick={() => setCredential('pin')} />}
            />
            <SettingRow
              icon="lock"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Account password"
              desc="Last changed 3 months ago · use a unique passphrase"
              trailing={<ActionButton label="Change password" onClick={() => setCredential('password')} />}
            />
            <SettingRow
              icon="sms"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Two-factor authentication"
              desc="Email OTP required for sign-in and profile changes"
              trailing={
                <Toggle
                  checked={security.twoFactor}
                  label="Two-factor authentication"
                  onChange={() => flip(setSecurity, 'twoFactor', 'Two-factor authentication')}
                />
              }
            />
            <SettingRow
              icon="point_of_sale"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Require PIN to open POS sales"
              desc="Locks the register until a staff PIN is entered"
              trailing={
                <Toggle
                  checked={security.posPin}
                  label="Require PIN to open POS sales"
                  onChange={() => flip(setSecurity, 'posPin', 'POS PIN lock')}
                />
              }
            />
            <SettingRow
              icon="devices"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="New device sign-in alerts"
              desc="Notify you whenever a new browser or terminal signs in"
              trailing={
                <Toggle
                  checked={security.deviceAlerts}
                  label="New device sign-in alerts"
                  onChange={() => flip(setSecurity, 'deviceAlerts', 'Device sign-in alerts')}
                />
              }
            />
            <SettingRow
              icon="manage_accounts"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Active sessions"
              desc="3 devices signed in · last activity just now"
              trailing={
                <ActionButton
                  label="Review"
                  onClick={() => showToast('3 active sessions — review coming from the security desk')}
                />
              }
            />
          </div>
        </section>


        <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm px-space-lg py-space-md border-b border-border-subtle">
            <div className="flex items-center gap-space-sm">
              <span className="w-10 h-10 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center">
                <Icon name="policy" className="text-[20px]" />
              </span>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                  Privacy &amp; NDPR Data Rights
                </h2>
                <span className="font-caption text-caption text-text-secondary">
                  Nigeria Data Protection Regulation (NDPR 2019) &amp; NDPA 2023
                </span>
              </div>
            </div>
            <span className="flex items-center gap-space-2xs px-space-sm py-2 rounded-xl bg-surface-subtle text-text-secondary font-label-sm text-label-sm font-semibold shrink-0">
              <Icon name="verified_user" className="text-badge-discount-text text-[16px]" />
              <span>Compliant · DPO: dpo@vemtap.com</span>
            </span>
          </div>

          <div className="p-space-lg bg-surface-tint-blue flex items-start gap-space-sm">
            <Icon name="info" className="text-primary text-[20px] shrink-0 mt-0.5" />
            <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
              You decide how your business data is used. Every request below is logged, and VEMTAP acknowledges data
              subject requests within <strong className="text-text-primary">72 hours</strong> as required by the NDPR.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            <SettingRow
              icon="download"
              iconClass="bg-surface-container-high text-primary"
              title="Export data archive"
              desc="Download products, orders, customers & payouts as .JSON"
              trailing={
                <ActionButton
                  label="Request archive"
                  onClick={() => showToast('Preparing your data archive — you will be notified when ready')}
                />
              }
            />
            <SettingRow
              icon="edit_note"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Rectify my records"
              desc="Correct inaccurate business or customer data we hold"
              trailing={
                <ActionButton
                  label="Raise request"
                  onClick={() => showToast('Rectification request opened with our DPO')}
                />
              }
            />
            <SettingRow
              icon="visibility_off"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Restrict processing"
              desc="Pause analytics & personalisation while keeping your account"
              trailing={
                <Toggle
                  checked={privacy.restrictProcessing}
                  label="Restrict processing"
                  onChange={() => flip(setPrivacy, 'restrictProcessing', 'Restrict processing')}
                />
              }
            />
            <SettingRow
              icon="insights"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Personalised analytics"
              desc="Use your activity to tailor dashboard insights"
              trailing={
                <Toggle
                  checked={privacy.analytics}
                  label="Personalised analytics"
                  onChange={() => flip(setPrivacy, 'analytics', 'Personalised analytics')}
                />
              }
            />
            <SettingRow
              icon="campaign"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Marketing communications"
              desc="Growth tips, product news and merchant offers"
              trailing={
                <Toggle
                  checked={privacy.marketing}
                  label="Marketing communications"
                  onChange={() => flip(setPrivacy, 'marketing', 'Marketing communications')}
                />
              }
            />
            <SettingRow
              icon="handshake"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Share data with partners"
              desc="Always off — VEMTAP never sells merchant data"
              trailing={
                <span className="px-space-xs py-space-2xs rounded-full bg-surface-subtle text-text-tertiary font-caption text-caption font-bold uppercase tracking-wider shrink-0">
                  Locked off
                </span>
              }
            />
            <SettingRow
              icon="description"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Privacy Policy &amp; data terms"
              desc="Full notice on collection, retention and your rights"
              trailing={<ActionButton label="Read" onClick={() => showToast('Opening the VEMTAP Privacy Policy…')} />}
            />
          </div>
        </section>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
          <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden">
            <div className="flex items-center gap-space-sm px-space-lg py-space-md border-b border-border-subtle">
              <span className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                <Icon name="notifications_active" className="text-[20px]" />
              </span>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                  Notification Channels
                </h2>
                <span className="font-caption text-caption text-text-secondary">How the dashboard reaches you</span>
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              <SettingRow
                icon="notifications"
                iconClass="bg-surface-tint-blue text-primary"
                title="Push notifications"
                desc="Orders, bookings and till alerts in the browser"
                trailing={
                  <Toggle
                    checked={channels.push}
                    label="Push notifications"
                    onChange={() => flip(setChannels, 'push', 'Push notifications')}
                  />
                }
              />
              <SettingRow
                icon="mail"
                iconClass="bg-surface-container-high text-on-surface-variant"
                title="Email digests"
                desc="Daily summary and settlement confirmations"
                trailing={
                  <Toggle
                    checked={channels.email}
                    label="Email digests"
                    onChange={() => flip(setChannels, 'email', 'Email digests')}
                  />
                }
              />
              <SettingRow
                icon="sms"
                iconClass="bg-surface-container-high text-on-surface-variant"
                title="SMS fallback"
                desc="Critical alerts when you are offline"
                trailing={
                  <Toggle
                    checked={channels.sms}
                    label="SMS fallback"
                    onChange={() => flip(setChannels, 'sms', 'SMS fallback')}
                  />
                }
              />
              <SettingRow
                icon="forum"
                iconClass="bg-badge-discount-bg text-badge-discount-text"
                title="WhatsApp Business"
                desc="Order and booking pings to your business WhatsApp"
                trailing={
                  <Toggle
                    checked={channels.whatsapp}
                    label="WhatsApp Business alerts"
                    onChange={() => flip(setChannels, 'whatsapp', 'WhatsApp alerts')}
                  />
                }
              />
            </div>
          </section>

          <section className="rounded-2xl bg-surface-canvas shadow-sm overflow-hidden border border-error/40">
            <div className="flex items-center gap-space-sm px-space-lg py-space-md border-b border-border-subtle bg-error-container/40">
              <span className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
                <Icon name="warning" className="text-[20px]" />
              </span>
              <div className="flex flex-col">
                <h2 className="font-heading-sm text-heading-sm text-error font-semibold">Danger zone</h2>
                <span className="font-caption text-caption text-text-secondary">Irreversible account actions</span>
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              <SettingRow
                icon="delete_forever"
                iconClass="bg-error-container text-error"
                title="Delete business account"
                desc="Purges deals, vouchers, customer records & payout history"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccount(true)}
                    className="h-10 px-space-sm rounded-xl bg-error text-on-error font-label-sm text-label-sm font-bold hover:opacity-90 transition-opacity shrink-0"
                  >
                    Delete account
                  </button>
                }
              />
              {onSignOut && (
                <SettingRow
                  icon="logout"
                  iconClass="bg-surface-container-high text-on-surface-variant"
                  title="Sign out of this device"
                  desc="Ends the merchant session on the current browser"
                  trailing={<ActionButton label="Sign out" onClick={onSignOut} />}
                />
              )}
            </div>
          </section>
        </div>
      </div>


      {credential && (
        <CredentialModal
          mode={credential}
          onClose={() => setCredential(null)}
          onSaved={() => {
            const savedMode = credential;
            setCredential(null);
            showToast(savedMode === 'pin' ? 'Transaction PIN updated successfully' : 'Password updated successfully');
          }}
        />
      )}

      <DeleteAccountSheet
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onCompleted={() => {
          setShowDeleteAccount(false);
          if (onSignOut) onSignOut();
          else signOut();
        }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] pointer-events-none px-margin">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-space-2xs max-w-[90vw]">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" filled />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </BusinessPortalChrome>
  );
}
