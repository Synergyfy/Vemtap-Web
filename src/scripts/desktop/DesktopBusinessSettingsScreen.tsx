import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
import { useAuth } from '../../context/AuthContext';
import { hasApiConfig } from '../../services/api/client';
import { authService } from '../../services/authService';
import { posService } from '../../services/posService';
import { apiErrorMessage } from '../../services/errorMessages';
import { useSessionUser } from '../../hooks/useSessionUser';
import { useBusinessSettings } from '../../hooks/business/useBusinessSettings';
import { DevicesDialog, RectificationDialog, TwoFactorDialog } from '../../components/business/SecurityPrivacyDialogs';
import { downloadBase64 } from '../../utils/exportCsv';
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
  const [revealed, setRevealed] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const userId = useSessionUser().data?.id;

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
    if (!hasApiConfig()) {
      onSaved();
      return;
    }
    if (isPin && !userId) return setError('Your account is still loading — try again in a moment');
    setSaving(true);
    // Live: the password goes to /auth/change-password (which checks the current
    // one); the PIN is the owner's own POS PIN, set via /pos/staff-pins/:userId.
    void (isPin ? posService.setStaffPin(userId!, { pin: next }) : authService.changePassword({ currentPassword: current, newPassword: next }))
      .then(() => onSaved())
      .catch((err: unknown) =>
        setError(apiErrorMessage(err, isPin ? 'Could not update your PIN.' : 'Could not update your password.')),
      )
      .finally(() => setSaving(false));
  };


  const field = (
    label: string,
    value: string,
    setter: (value: string) => void,
    key: keyof typeof revealed,
    hint?: string,
  ) => (
    <label className="flex flex-col gap-space-2xs">
      <span className="font-label-sm text-label-sm text-text-secondary font-semibold">{label}</span>
      <div className="relative">
        <input
          type={revealed[key] ? 'text' : 'password'}
          inputMode={isPin ? 'numeric' : undefined}
          maxLength={isPin ? 4 : 64}
          value={value}
          onChange={(event) => setter(event.target.value)}
          placeholder={isPin ? '••••' : '••••••••'}
          className="h-11 w-full pr-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface tracking-widest outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          aria-label={revealed[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setRevealed((current) => ({ ...current, [key]: !current[key] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name={revealed[key] ? 'visibility_off' : 'visibility'} className="text-[18px]" />
        </button>
      </div>
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
          {field(`Current ${isPin ? 'PIN' : 'password'}`, current, setCurrent, 'current')}
          {field(`New ${isPin ? 'PIN' : 'password'}`, next, setNext, 'next', isPin ? 'Exactly 4 digits' : 'At least 8 characters')}
          {field(`Confirm new ${isPin ? 'PIN' : 'password'}`, confirm, setConfirm, 'confirm')}
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
            disabled={saving}
            className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <span>{saving ? 'Saving…' : isPin ? 'Update PIN' : 'Update password'}</span>
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
  // Live: every switch and action below reads and writes the API.
  const live = useBusinessSettings();
  const isLive = live.live;
  const [dialog, setDialog] = useState<'two-factor' | 'rectify' | 'devices' | null>(null);
  const run = (promise: Promise<unknown>, message: string) =>
    void promise.then(() => showToast(message)).catch((err: unknown) => showToast(apiErrorMessage(err, 'That did not save.')));
  const setPrivacyLive = (key: 'restrictProcessing' | 'analytics' | 'marketing' | 'deviceAlerts', label: string) => {
    const next = !live.privacy?.[key];
    run(live.updatePrivacy.mutateAsync({ [key]: next }), `${label} turned ${next ? 'on' : 'off'}`);
  };
  const setChannelLive = (key: 'push' | 'email' | 'sms', label: string) => {
    const next = !live.channels[key];
    run(live.updatePrefs.mutateAsync({ [key]: next }), `${label} turned ${next ? 'on' : 'off'}`);
  };
  const exportArchive = () =>
    void live.exportArchive
      .mutateAsync()
      .then((file) => {
        downloadBase64(file.fileName, file.mimeType, file.content);
        showToast(`Archive downloaded · reference ${file.reference}`);
      })
      .catch((err: unknown) => showToast(apiErrorMessage(err, 'Could not export your data.')));
  const businessName = isLive ? live.business?.name ?? 'Your business' : 'Urban Grill & Bistro';
  const businessLine = isLive
    ? [live.business?.uniqueCode ? `#${live.business.uniqueCode}` : null, live.business?.officialEmail, live.business?.phone]
        .filter(Boolean)
        .join(' · ')
    : '#VG-80492 · hello@urbangrill.ng · +234 803 555 0192';
  const canManage = !isLive || live.privacy?.canManageBusiness === true;

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
                {businessName}
              </span>
              <span className="font-caption text-caption text-text-secondary truncate">
                {businessLine}
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
              desc={isLive ? 'Use a unique passphrase you do not use elsewhere' : 'Last changed 3 months ago · use a unique passphrase'}
              trailing={<ActionButton label="Change password" onClick={() => setCredential('password')} />}
            />
            <SettingRow
              icon="sms"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Two-factor authentication"
              desc={isLive ? 'A code from your authenticator app at every sign-in' : 'Email OTP required for sign-in and profile changes'}
              trailing={
                <Toggle
                  checked={isLive ? live.twoFactorOn : security.twoFactor}
                  label="Two-factor authentication"
                  onChange={() => (isLive ? setDialog('two-factor') : flip(setSecurity, 'twoFactor', 'Two-factor authentication'))}
                />
              }
            />
            <SettingRow
              icon="point_of_sale"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title={isLive ? 'Require supervisor PIN on the POS' : 'Require PIN to open POS sales'}
              desc={
                isLive
                  ? 'Voids, refunds, reprints, cash-drawer opens and discount overrides need a supervisor PIN'
                  : 'Locks the register until a staff PIN is entered'
              }
              trailing={
                <Toggle
                  checked={isLive ? live.posPinOn : security.posPin}
                  label="Require supervisor PIN on the POS"
                  onChange={() =>
                    isLive
                      ? run(live.updatePosPin.mutateAsync(!live.posPinOn), `POS supervisor PIN ${live.posPinOn ? 'off' : 'on'}`)
                      : flip(setSecurity, 'posPin', 'POS PIN lock')
                  }
                />
              }
            />
            <SettingRow
              icon="devices"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="New device sign-in alerts"
              desc={isLive ? 'Email you when a browser or app signs in for the first time' : 'Notify you whenever a new browser or terminal signs in'}
              trailing={
                <Toggle
                  checked={isLive ? live.privacy?.deviceAlerts === true : security.deviceAlerts}
                  label="New device sign-in alerts"
                  onChange={() =>
                    isLive ? setPrivacyLive('deviceAlerts', 'Device sign-in alerts') : flip(setSecurity, 'deviceAlerts', 'Device sign-in alerts')
                  }
                />
              }
            />
            <SettingRow
              icon="manage_accounts"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Active sessions"
              desc={
                isLive
                  ? `${live.activeDevices} ${live.activeDevices === 1 ? 'device' : 'devices'} signed in`
                  : '3 devices signed in · last activity just now'
              }
              trailing={
                <ActionButton
                  label="Review"
                  onClick={() => (isLive ? setDialog('devices') : showToast('3 active sessions — review coming from the security desk'))}
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
              <span>{isLive ? 'DPO: dpo@vemtap.com' : 'Compliant · DPO: dpo@vemtap.com'}</span>
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
              desc={
                isLive
                  ? canManage
                    ? 'Download your business, team, catalogue, deals, customers, orders, POS sales & campaigns as .JSON'
                    : 'Only the business owner can export the business’s data'
                  : 'Download products, orders, customers & payouts as .JSON'
              }
              trailing={
                <ActionButton
                  label={live.exportArchive.isPending ? 'Preparing…' : isLive ? 'Download archive' : 'Request archive'}
                  onClick={() => (isLive ? exportArchive() : showToast('Preparing your data archive — you will be notified when ready'))}
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
                  onClick={() => (isLive ? setDialog('rectify') : showToast('Rectification request opened with our DPO'))}
                />
              }
            />
            <SettingRow
              icon="visibility_off"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Restrict processing"
              desc={
                isLive
                  ? 'Stop AI features (dashboard analysis, AI-written deal terms) from processing your business data'
                  : 'Pause analytics & personalisation while keeping your account'
              }
              trailing={
                <Toggle
                  checked={isLive ? live.privacy?.restrictProcessing === true : privacy.restrictProcessing}
                  label="Restrict processing"
                  onChange={() =>
                    isLive
                      ? canManage
                        ? setPrivacyLive('restrictProcessing', 'Restrict processing')
                        : showToast('Only the owner or a manager can change this')
                      : flip(setPrivacy, 'restrictProcessing', 'Restrict processing')
                  }
                />
              }
            />
            <SettingRow
              icon="insights"
              iconClass="bg-surface-container-high text-on-surface-variant"
              title="Personalised analytics"
              desc={isLive ? 'Let AI analyse your dashboards to suggest insights' : 'Use your activity to tailor dashboard insights'}
              trailing={
                <Toggle
                  checked={isLive ? live.privacy?.analytics !== false && !live.privacy?.restrictProcessing : privacy.analytics}
                  label="Personalised analytics"
                  onChange={() =>
                    isLive
                      ? canManage
                        ? setPrivacyLive('analytics', 'Personalised analytics')
                        : showToast('Only the owner or a manager can change this')
                      : flip(setPrivacy, 'analytics', 'Personalised analytics')
                  }
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
                  checked={isLive ? live.privacy?.marketing !== false : privacy.marketing}
                  label="Marketing communications"
                  onChange={() =>
                    isLive ? setPrivacyLive('marketing', 'Marketing communications') : flip(setPrivacy, 'marketing', 'Marketing communications')
                  }
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
              trailing={
                <ActionButton
                  label="Read"
                  onClick={() => (isLive ? window.open('/privacy', '_blank', 'noopener') : showToast('Opening the VEMTAP Privacy Policy…'))}
                />
              }
            />
          </div>
          {isLive && live.requests.length ? (
            <div className="px-space-lg py-space-md border-t border-border-subtle flex flex-col gap-space-2xs">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Your data requests</span>
              {live.requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between gap-space-sm font-caption text-caption text-text-secondary">
                  <span className="truncate">
                    <span className="font-semibold text-text-primary">{request.reference}</span> ·{' '}
                    {request.type === 'export' ? 'Data export' : 'Rectification'} · {new Date(request.createdAt).toLocaleDateString('en-NG')}
                  </span>
                  <span className={request.status === 'open' ? 'text-primary font-semibold' : 'text-badge-discount-text font-semibold'}>
                    {request.status === 'open' ? `Open · due ${new Date(request.dueAt).toLocaleDateString('en-NG')}` : 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
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
                    checked={isLive ? live.channels.push : channels.push}
                    label="Push notifications"
                    onChange={() => (isLive ? setChannelLive('push', 'Push notifications') : flip(setChannels, 'push', 'Push notifications'))}
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
                    checked={isLive ? live.channels.email : channels.email}
                    label="Email digests"
                    onChange={() => (isLive ? setChannelLive('email', 'Email digests') : flip(setChannels, 'email', 'Email digests'))}
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
                    checked={isLive ? live.channels.sms : channels.sms}
                    label="SMS fallback"
                    onChange={() => (isLive ? setChannelLive('sms', 'SMS fallback') : flip(setChannels, 'sms', 'SMS fallback'))}
                  />
                }
              />
              {!isLive && (
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
              )}
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

      {dialog === 'two-factor' && (
        <TwoFactorDialog
          enabled={live.twoFactorOn}
          onClose={() => setDialog(null)}
          onDone={(on) => {
            setDialog(null);
            void live.refreshSession();
            showToast(`Two-factor sign-in ${on ? 'on' : 'off'}`);
          }}
        />
      )}
      {dialog === 'rectify' && (
        <RectificationDialog onClose={() => setDialog(null)} onSubmit={(details) => live.rectify.mutateAsync(details)} />
      )}
      {dialog === 'devices' && <DevicesDialog onClose={() => setDialog(null)} />}

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
