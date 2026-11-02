import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import { useProfile } from '../context/ProfileContext';
import { deviceIcon, deviceLabel, relativeTime, useAccountSecurity, type NotificationPrefKey } from '../hooks/useAccountSecurity';
import { authService } from '../services';
import { apiErrorMessage } from '../services/errorMessages';

function PasswordChangeModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!/^\d{6}$/.test(currentPassword)) {
      setError('Enter your current 6-digit PIN.');
      return;
    }
    if (!/^\d{6}$/.test(newPassword)) {
      setError('Your new PIN must be exactly 6 digits.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Choose a new PIN that is different from your current one.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New PIN confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.changePassword({ currentPassword, newPassword });
      onSaved();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (changePasswordError) {
      console.error('Password change failed:', changePasswordError);
      setError(apiErrorMessage(changePasswordError, 'Unable to update your PIN right now. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (
    label: string,
    value: string,
    setter: (value: string) => void,
    fieldKey: 'current' | 'next' | 'confirm',
  ) => (
    <label className="flex flex-col gap-space-2xs">
      <span className="font-label-sm text-label-sm text-text-secondary font-semibold">{label}</span>
      <div className="relative">
        <input
          type={revealed[fieldKey] ? 'text' : 'password'}
          value={value}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setter(event.target.value.replace(/\D/g, '').slice(0, 6))}
          className="h-11 w-full pr-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          aria-label={revealed[fieldKey] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setRevealed((currentState) => ({ ...currentState, [fieldKey]: !currentState[fieldKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name={revealed[fieldKey] ? 'visibility_off' : 'visibility'} className="text-[18px]" />
        </button>
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Change PIN" className="w-full max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-2xl p-space-xl flex flex-col gap-space-md">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="lock" className="text-[20px]" />
            </span>
            <div className="flex flex-col">
              <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Change PIN</h2>
              <p className="font-caption text-caption text-text-secondary">Update your sign-in credentials securely</p>
            </div>
          </div>
          <button type="button" onClick={onClose} title="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-on-surface hover:bg-surface-subtle transition-colors">
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-space-sm">
          {field('Current PIN', currentPassword, setCurrentPassword, 'current')}
          {field('New PIN', newPassword, setNewPassword, 'next')}
          {field('Confirm new PIN', confirmPassword, setConfirmPassword, 'confirm')}
        </div>

        {error && (
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-error-container text-error font-label-sm text-label-sm">
            <Icon name="error" className="text-[16px]" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-space-sm pt-space-2xs">
          <button type="button" onClick={onClose} className="h-11 px-space-md rounded-xl bg-surface-container text-on-surface font-button-secondary text-button-secondary hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} disabled={isSubmitting} className="h-11 px-space-md rounded-xl bg-primary text-on-primary font-button-primary text-button-primary flex items-center gap-space-2xs shadow-sm active:scale-[0.98] transition-transform disabled:opacity-70">
            <span>{isSubmitting ? 'Updating...' : 'Update PIN'}</span>
            <Icon name="check" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface AccountSettingsScreenProps {
  onBack: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onSignOut: () => void;
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

type LocationPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

const LOCATION_LABEL: Record<LocationPermission, string> = {
  granted: 'Allowed',
  prompt: 'Ask Each Time',
  denied: 'Blocked',
  unknown: 'Not Set',
};

function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
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
  const profile = useProfile();
  const security = useAccountSecurity();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>('unknown');

  useEffect(() => {
    let status: PermissionStatus | null = null;
    const sync = () => status && setLocationPermission(status.state as LocationPermission);
    navigator.permissions
      ?.query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        status = result;
        sync();
        result.addEventListener('change', sync);
      })
      .catch(() => setLocationPermission('unknown'));
    return () => status?.removeEventListener('change', sync);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
  };

  const flip = (key: NotificationPrefKey, label: string) => {
    const next = !security.prefs[key];
    security.updatePref.mutate(
      { key, value: next },
      {
        onSuccess: () => showToast(`${label} turned ${next ? 'on' : 'off'}`),
        onError: (error) => showToast(apiErrorMessage(error, `Couldn't update ${label.toLowerCase()}`)),
      },
    );
  };

  const handlePasswordReset = () => {
    if (!security.hasPin) {
      showToast('You sign in with Google, so there is no PIN to change');
      return;
    }
    setShowPasswordChangeModal(true);
  };

  const signOutOthers = async () => {
    setConfirmSignOut(false);
    if (!security.otherDevices.length) {
      showToast('No other devices are signed in');
      return;
    }
    setSigningOutOthers(true);
    try {
      const count = await security.revokeOthers();
      showToast(`Signed out of ${count} other device${count === 1 ? '' : 's'}`);
    } catch (error) {
      showToast(apiErrorMessage(error, "Couldn't sign out every device. Please try again."));
    } finally {
      setSigningOutOthers(false);
    }
  };

  const revokeOne = (id: string, name: string) => {
    security.revokeDevice.mutate(id, {
      onSuccess: () => showToast(`${name} signed out`),
      onError: (error) => showToast(apiErrorMessage(error, `Couldn't sign out ${name}`)),
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
  const displayName = profile.fullName || 'User';
  const emailAddress = profile.email || 'No email';
  const phoneNumber = profile.phone || 'No phone number';
  const securityLabel = security.twoFactorEnabled ? 'Strong' : security.emailVerified ? 'Protected' : 'Verify Email';
  const activeCount = security.activeDevices.length;
  const signInMethod = security.hasPin ? '6-digit PIN sign-in' : 'Google sign-in';
  const securitySummary = `${signInMethod}${security.twoFactorEnabled ? ' with two-step verification' : ''} active${
    activeCount ? ` on ${activeCount} device${activeCount === 1 ? '' : 's'}` : ''
  }. Your VEMTAP wallet credentials and deals ledger are secured.`;
  const visibleDevices = showAllDevices ? security.activeDevices : security.activeDevices.slice(0, 2);
  const auditSessions = security.allDevices.slice(0, 10);

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
                  Security Status: {securityLabel}
                </span>
              </div>
            </div>
            <Icon name="check_circle" className="text-badge-discount-text text-[18px]" />
          </div>
          <p className="font-body-md text-body-md text-text-secondary leading-snug">{securitySummary}</p>
          <div className="pt-space-2xs flex items-center gap-space-xs text-text-tertiary">
            <Icon name="account_circle" className="text-[16px] text-primary" />
            <span className="font-caption text-caption text-text-secondary truncate">
              {displayName} • {phoneNumber}
              {security.emailVerified && (
                <>
                  {' '}• <span className="text-badge-discount-text font-medium">Verified</span>
                </>
              )}
            </span>
          </div>
        </section>

        <section className="space-y-space-xs">
          <h2 className={sectionTitle}>Login &amp; Credentials</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={handlePasswordReset}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="pin" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className={rowTitle}>Security PIN</span>
                    {security.hasPin && <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />}
                  </div>
                  <p className={rowHint}>
                    {security.hasPin ? '6-digit PIN used for sign-in & redemption' : 'You sign in with Google — no PIN needed'}
                  </p>
                  <p className="font-caption text-caption text-primary font-medium mt-0.5">
                    {security.hasPin ? 'Active' : 'Not used'}
                    {security.twoFactorEnabled ? ' • Two-step verification on' : ''}
                  </p>
                </div>
              </div>
              {chevron}
            </button>

            {security.hasPin && (
              <button
                type="button"
                onClick={handlePasswordReset}
                className={`${rowButton} hover:bg-surface-subtle bg-surface-subtle`}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className={iconTile}>
                    <Icon name="password" className="text-primary text-[22px]" />
                  </div>
                  <div className="min-w-0">
                    <span className={`${rowTitle} block`}>Change PIN</span>
                    <p className={rowHint}>Confirm your current PIN, then choose a new one</p>
                  </div>
                </div>
                {chevron}
              </button>
            )}
          </div>
        </section>

        <section className="space-y-space-xs" id="account-devices">
          <h2 className={sectionTitle}>Devices &amp; Sessions</h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-md">
            {security.devicesLoading && (
              <p className="font-caption text-caption text-text-secondary">Loading signed-in devices…</p>
            )}
            {!security.devicesLoading && security.devicesError != null && (
              <p className="font-caption text-caption text-error">Couldn&apos;t load your signed-in devices.</p>
            )}
            {!security.devicesLoading && security.devicesError == null && activeCount === 0 && (
              <p className="font-caption text-caption text-text-secondary">No signed-in devices to show.</p>
            )}

            {visibleDevices.map((device, index) => {
              const name = deviceLabel(device);
              return (
                <div key={device.id} className="space-y-space-md">
                  {index > 0 && <div className="h-[1px] bg-surface-container w-full" />}
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-start gap-space-sm min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          device.isCurrent ? 'bg-surface-tint-blue' : 'bg-surface-subtle'
                        }`}
                      >
                        <Icon
                          name={deviceIcon(device)}
                          className={`${device.isCurrent ? 'text-primary' : 'text-secondary'} text-[22px]`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-space-2xs flex-wrap">
                          <span className={rowTitle}>{name}</span>
                          {device.isCurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-badge-discount-bg font-caption text-[11px] text-badge-discount-text font-semibold">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className={rowHint}>
                          {device.ipAddress ? `${device.ipAddress} • ` : ''}
                          {device.isCurrent ? 'Active now' : `Last active ${relativeTime(device.lastActiveAt)}`}
                        </p>
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <button
                        type="button"
                        onClick={() => revokeOne(device.id, name)}
                        disabled={security.revokeDevice.isPending}
                        className="shrink-0 font-label-sm text-label-sm text-error font-semibold px-space-2xs py-1 rounded-lg active:bg-error-container transition-colors disabled:opacity-60"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (activeCount > 2 && !showAllDevices) setShowAllDevices(true);
                  else setConfirmSignOut(true);
                }}
                disabled={signingOutOthers}
                className="w-full text-left pt-space-2xs flex items-center justify-between text-primary font-label-md text-label-md font-semibold active:opacity-75 transition-opacity disabled:opacity-60"
              >
                <span>
                  {signingOutOthers
                    ? 'Signing out other devices…'
                    : activeCount > 2 && !showAllDevices
                      ? `Manage All Devices (${activeCount})`
                      : `Manage All Devices (${activeCount}) & Log Out Others`}
                </span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            )}
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
                    {profile.phone ? `Security alerts sent to ${profile.phone}` : 'Add a phone number to receive SMS alerts'}
                  </p>
                </div>
              </div>
              <Toggle
                checked={security.prefs.smsSecurity}
                label="SMS alerts"
                disabled={!security.prefsLoaded || security.updatePref.isPending}
                onChange={() => flip('smsSecurity', 'SMS alerts')}
              />
            </div>

            <div className="p-space-md flex items-center justify-between gap-space-sm bg-surface-subtle">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="mail" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Email Notices</span>
                  <p className="font-caption text-caption text-text-secondary line-clamp-1">
                    Sent to {emailAddress}
                  </p>
                </div>
              </div>
              <Toggle
                checked={security.prefs.email}
                label="Email notices"
                disabled={!security.prefsLoaded || security.updatePref.isPending}
                onChange={() => flip('email', 'Email notices')}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAuditLog((open) => !open)}
              aria-expanded={showAuditLog}
              className={`${rowButton} hover:bg-surface-subtle`}
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className={iconTile}>
                  <Icon name="manage_history" className="text-primary text-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className={`${rowTitle} block`}>Security Audit Log</span>
                  <p className={rowHint}>Review recent sign-ins, IP addresses &amp; sessions</p>
                </div>
              </div>
              <Icon
                name={showAuditLog ? 'expand_less' : 'chevron_right'}
                className="text-outline-variant text-[20px] shrink-0"
              />
            </button>

            {showAuditLog && (
              <ul className="px-space-md pb-space-md space-y-space-xs">
                {auditSessions.length === 0 && (
                  <li className="font-caption text-caption text-text-secondary">No sign-in history yet.</li>
                )}
                {auditSessions.map((session) => (
                  <li key={session.id} className="flex items-start justify-between gap-space-xs rounded-lg bg-surface-subtle px-space-sm py-space-xs">
                    <div className="min-w-0">
                      <p className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{deviceLabel(session)}</p>
                      <p className="font-caption text-caption text-text-secondary truncate">
                        Signed in {relativeTime(session.createdAt)}
                        {session.ipAddress ? ` • ${session.ipAddress}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-caption text-caption font-semibold ${
                        session.revokedAt ? 'text-text-tertiary' : 'text-badge-discount-text'
                      }`}
                    >
                      {session.revokedAt ? 'Signed out' : session.isCurrent ? 'This device' : 'Active'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
                  <p className={rowHint}>
                    {locationPermission === 'granted'
                      ? 'Used to show deals near you'
                      : locationPermission === 'denied'
                        ? 'Allow location in your browser to see nearby deals'
                        : 'Share your location to see nearby deals'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-2xs shrink-0">
                <span className="font-caption text-caption text-primary font-medium">{LOCATION_LABEL[locationPermission]}</span>
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
                    Deal &amp; promotion alerts from VEMTAP
                  </p>
                </div>
              </div>
              <Toggle
                checked={security.prefs.marketing}
                label="Personalized deals"
                disabled={!security.prefsLoaded || security.updatePref.isPending}
                onChange={() => flip('marketing', 'Personalized deals')}
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
              disabled={signingOutOthers}
              className="w-full h-[52px] rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center gap-space-xs font-button-secondary text-button-secondary active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <Icon name="logout" className="text-[20px] text-error" />
              <span className="font-semibold">{signingOutOthers ? 'Signing out…' : 'Sign Out of All Devices'}</span>
            </button>
            <p className="font-caption text-caption text-text-tertiary text-center">
              You can sign back in anytime with your PIN.
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
              {security.otherDevices.length
                ? `You'll be signed out of ${security.otherDevices.length} other device${security.otherDevices.length === 1 ? '' : 's'}. This device stays signed in.`
                : 'No other devices are signed in to your account right now.'}
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
                onClick={() => void signOutOthers()}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-button-secondary text-button-secondary font-semibold active:scale-[0.98] transition-transform"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <PasswordChangeModal
        open={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onSaved={() => {
          setShowPasswordChangeModal(false);
          showToast('PIN updated successfully');
        }}
      />
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
