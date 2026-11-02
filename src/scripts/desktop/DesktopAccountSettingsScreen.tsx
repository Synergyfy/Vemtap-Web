import { useCanSwitchToBusiness } from '../../hooks/useCanSwitchToBusiness';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { deviceIcon, deviceLabel, relativeTime, useAccountSecurity, type NotificationPrefKey } from '../../hooks/useAccountSecurity';
import { useSavedAddresses } from '../../hooks/useSavedAddresses';
import { useSessionUser } from '../../hooks/useSessionUser';
import { hasApiConfig } from '../../lib/api';
import { accountService, authService } from '../../services';
import { apiErrorMessage } from '../../services/errorMessages';

const naira = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

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
    } catch (passwordError) {
      console.error('Password change failed:', passwordError);
      setError(apiErrorMessage(passwordError, 'Unable to update your PIN right now. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (label: string, value: string, setter: (value: string) => void, key: 'current' | 'next' | 'confirm') => (
    <label className="flex flex-col gap-space-2xs">
      <span className="font-label-sm text-label-sm text-text-secondary font-semibold">{label}</span>
      <div className="relative">
        <input
          type={revealed[key] ? 'text' : 'password'}
          value={value}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setter(event.target.value.replace(/\D/g, '').slice(0, 6))}
          className="h-11 w-full pr-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          aria-label={revealed[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setRevealed((currentState) => ({ ...currentState, [key]: !currentState[key] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name={revealed[key] ? 'visibility_off' : 'visibility'} className="text-[18px]" />
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

interface DesktopAccountSettingsScreenProps {
  onNav: (key: DesktopNavKey) => void;
  /** Opens the saved addresses screen, where the default place is chosen. */
  onOpenAddresses?: () => void;
}

const SETTINGS_TABS = [
  { id: 'personal-profile', label: 'Personal Profile', icon: 'account_circle', trail: 'dot' as const },
  { id: 'security-login', label: 'Security & Login', icon: 'lock', trail: 'badge' as const },
  { id: 'notification-channels', label: 'Notification Preferences', icon: 'notifications_active', trail: 'chevron' as const },
  { id: 'payment-methods', label: 'Saved Payment & Settlement', icon: 'account_balance_wallet', trail: 'chevron' as const },
  { id: 'privacy-ndpr', label: 'Privacy & NDPR Data Rights', icon: 'policy', trail: 'chevron' as const },
  { id: 'support-desk', label: 'Help & Support Desk', icon: 'support_agent', trail: 'chevron' as const },
];

/** Notification channels, each backed by a `/notifications/preferences` key. */
const TOGGLES: Array<{
  id: NotificationPrefKey;
  icon: string;
  iconClass: string;
  title: string;
  tag: string;
  desc: string;
}> = [
  {
    id: 'marketing',
    icon: 'local_offer',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'Deal Alerts & Promotions',
    tag: 'Most Popular',
    desc: 'New deals, flash discounts and vouchers from businesses you follow and near you.',
  },
  {
    id: 'email',
    icon: 'mark_email_read',
    iconClass: 'bg-surface-container-lowest text-primary shadow-sm',
    title: 'Email Notifications',
    tag: '',
    desc: 'Receipts, account notices and updates sent to your email address.',
  },
  {
    id: 'push',
    icon: 'notifications',
    iconClass: 'bg-surface-container-lowest text-secondary shadow-sm',
    title: 'Push Notifications',
    tag: '',
    desc: 'Order, booking and message updates on this browser and your other devices.',
  },
  {
    id: 'sms',
    icon: 'sms',
    iconClass: 'bg-surface-container-lowest text-outline shadow-sm',
    title: 'SMS Notifications',
    tag: '',
    desc: 'Text message alerts to your phone number when you are offline.',
  },
];

const splitName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
};

export function DesktopAccountSettingsScreen({ onNav, onOpenAddresses }: DesktopAccountSettingsScreenProps) {
  const canSwitch = useCanSwitchToBusiness();
  const [activeTab, setActiveTab] = useState('personal-profile');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { signOut } = useAuth();
  const profile = useProfile();
  const security = useAccountSecurity();
  const sessionUser = useSessionUser();
  const { addresses } = useSavedAddresses();
  const savings = useQuery({
    queryKey: ['me', 'savings', 'settings-30d'],
    queryFn: () => accountService.getSavings({ days: 30, limit: 1 }),
    enabled: hasApiConfig(),
  });
  const [form, setForm] = useState({ fullName: '', phone: '' });

  const fullName = profile.fullName || 'User';
  const resetForm = () => setForm({ fullName: profile.fullName, phone: profile.phone });
  // Follow the live profile until the customer starts editing.
  useEffect(() => {
    if (saveState === 'idle') setForm({ fullName: profile.fullName, phone: profile.phone });
  }, [profile.fullName, profile.phone]);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const timer = window.setTimeout(() => setSaveState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2600);
  };

  const handlePasswordReset = () => {
    if (!security.hasPin) {
      showToast('You sign in with Google, so there is no PIN to change');
      return;
    }
    setShowPasswordChangeModal(true);
  };

  const toggleChannel = (key: NotificationPrefKey, title: string, value: boolean) => {
    security.updatePref.mutate(
      { key, value },
      {
        onSuccess: () => showToast(`${title} turned ${value ? 'on' : 'off'}`),
        onError: (error) => showToast(apiErrorMessage(error, `Couldn't update ${title.toLowerCase()}`)),
      },
    );
  };

  const revokeOne = (id: string, name: string) => {
    security.revokeDevice.mutate(id, {
      onSuccess: () => showToast(`${name} signed out`),
      onError: (error) => showToast(apiErrorMessage(error, `Couldn't sign out ${name}`)),
    });
  };

  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const signOutOthers = async () => {
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

  const goToSection = (id: string) => {
    setActiveTab(id);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const emailAddress = profile.email || 'No email';
  const memberTenureLabel = (() => {
    if (!profile.createdAt) return 'New member';
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return 'New member';
    return `Joined ${new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)}`;
  })();
  const securityLabel = security.twoFactorEnabled ? 'Strong' : security.emailVerified ? 'Protected' : 'Verify Email';
  const activeCount = security.activeDevices.length;
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const savedLast30 = (() => {
    const data = savings.data as { totalSavedAmount?: unknown } | undefined;
    const value = Number(data?.totalSavedAmount);
    return Number.isFinite(value) ? value : 0;
  })();
  const avatarUrl = security.avatar ?? sessionUser.data?.avatar ?? null;
  const dirty = form.fullName.trim() !== profile.fullName.trim() || form.phone.trim() !== profile.phone.trim();

  const saveProfile = async () => {
    if (saveState !== 'idle') return;
    const { firstName, lastName } = splitName(form.fullName);
    if (!firstName) {
      showToast('Enter your full name');
      return;
    }
    if (!dirty) {
      showToast('No changes to save');
      return;
    }
    setSaveState('saving');
    try {
      const phone = form.phone.trim();
      await accountService.updateProfile({ firstName, lastName, ...(phone ? { phone } : {}) });
      profile.update({ firstName, lastName, phone });
      security.refreshSession();
      setSaveState('saved');
    } catch (error) {
      setSaveState('idle');
      showToast(apiErrorMessage(error, "Couldn't save your profile. Please try again."));
    }
  };

  return (
    <>
      <DesktopPage withHeader withFooter onNav={onNav} activeNav="account-settings" withCustomerRail>
      <div className="w-full bg-surface min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
              <button className="hover:text-primary transition-colors" onClick={() => onNav('discover')} type="button">
                Home
              </button>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <button className="hover:text-primary transition-colors" onClick={() => onNav('dashboard')} type="button">
                Customer Dashboard
              </button>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <span className="text-on-surface font-semibold">Account &amp; Settings</span>
            </nav>
            <div className="flex items-center gap-2 bg-badge-discount-bg text-badge-discount-text px-3 py-1 rounded-full">
              <Icon name="verified" className="text-[16px]" />
              <span className="font-caption text-caption font-semibold">
                {securityLabel} • {security.emailVerified ? 'Email verified' : 'Email not verified'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm tracking-widest uppercase font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Consumer Preferences &amp; Safety</span>
              </div>
              <h1 className="font-display-hero text-display-hero text-on-surface">Account Settings &amp; Preferences</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Manage your personal profile, security credentials, notification channels, and privacy preferences.
              </p>
            </div>
            <div className="hidden xl:flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-caption text-caption text-outline">Signed-in Devices</p>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  {security.devicesLoading ? 'Loading…' : `${activeCount} active session${activeCount === 1 ? '' : 's'}`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <Icon name="cloud_done" className="text-[20px]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
            <aside className="w-full flex flex-col gap-6 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-md bg-primary flex items-center justify-center">
                    {avatarUrl ? (
                      <img alt={fullName} className="w-full h-full object-cover" src={avatarUrl} />
                    ) : (
                      <span className="font-heading-sm text-heading-sm text-on-primary font-semibold">
                        {profile.initials || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                        {fullName}
                      </h3>
                      {security.emailVerified && (
                        <span title="Email verified">
                          <Icon name="verified" className="text-primary text-[16px]" />
                        </span>
                      )}
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant truncate">
                      {security.emailVerified ? 'Account verified' : profile.isComplete ? 'Email not verified' : 'Profile pending completion'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption font-medium">
                      Consumer Tier
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-on-surface-variant font-caption text-caption pt-2 border-t-0 bg-surface-container-low p-2 rounded-lg">
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="mail" className="text-[14px] text-outline" />
                    <span className="truncate text-on-surface">{emailAddress}</span>
                  </div>
                  <div className="flex items-center justify-between text-outline pt-0.5">
                    <span>Member Tenure</span>
                    <span className="text-on-surface font-medium">{memberTenureLabel}</span>
                  </div>
                </div>
                <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-outline">Saved in the last 30 days</span>
                    <span className="font-label-md text-label-md text-badge-discount-text font-bold">
                      {savings.isLoading ? '…' : naira(savedLast30)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav('my-deals')}
                    className="inline-flex items-center gap-1 font-caption text-caption text-primary font-semibold hover:underline"
                  >
                    <span>My Deals</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                  </button>
                </div>
              </div>

              <nav className="flex flex-col gap-1 bg-surface-container-lowest rounded-xl p-1 shadow-sm" id="settings-nav">
                {SETTINGS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => goToSection(tab.id)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg font-label-md text-label-md transition-all ${
                      activeTab === tab.id
                        ? 'text-primary bg-surface-tint-blue'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={tab.icon} className="text-[20px]" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.trail === 'dot' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    {tab.trail === 'badge' && (
                      <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-1.5 py-0.5 rounded">
                        {securityLabel}
                      </span>
                    )}
                    {tab.trail === 'chevron' && <Icon name="chevron_right" className="text-[16px] text-outline" />}
                  </button>
                ))}
                <div className="my-1 border-0 h-px bg-surface-container" />
                <button
                  onClick={() => {
                    signOut();
                    onNav('home');
                  }}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-error hover:bg-error-container/20 font-label-md text-label-md transition-all"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="logout" className="text-[20px]" />
                    <span>Sign Out</span>
                  </div>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </nav>

              <div className="bg-surface-container-high rounded-xl p-4 text-left flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold">
                  <Icon name="storefront" className="text-[18px]" />
                  <span>Merchant Ecosystem</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  {canSwitch ? 'Your business is on VEMTAP' : 'Operate a store or service business?'}
                </p>
                <button
                  onClick={() => onNav('for-merchants')}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold mt-0.5 group self-start"
                  type="button"
                >
                  <span>{canSwitch ? 'Switch to Business' : 'Set up your business on VEMTAP'}</span>
                  <Icon
                    name="arrow_forward"
                    className="text-[16px] group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </aside>

            <div className="w-full flex flex-col gap-8">
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden" id="personal-profile">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                        Section 01
                      </span>
                    </div>
                    <h2 className="font-heading-lg text-heading-lg text-on-surface">
                      Personal Profile &amp; Residency
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg text-on-surface-variant font-caption text-caption">
                    <Icon name="pin_drop" className="text-[16px] text-badge-discount-text" />
                    <span>
                      Primary Hub: <strong>{defaultAddress ? defaultAddress.area || defaultAddress.label : 'Not set'}</strong>
                    </span>
                  </div>
                </div>
                <form className="space-y-6" id="profile-form" onSubmit={(event) => event.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"
                        htmlFor="full-name"
                      >
                        <span>Full Legal Name</span>
                        <span className="font-caption text-caption text-outline">As per NIN / ID</span>
                      </label>
                      <input
                        className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        id="full-name"
                        type="text"
                        value={form.fullName}
                        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"
                        htmlFor="display-name"
                      >
                        <span>Community Display Name</span>
                        <span className="font-caption text-caption text-outline">Your first name, shown to businesses</span>
                      </label>
                      <input
                        className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl text-on-surface-variant font-body-md text-body-md focus:outline-none cursor-default"
                        id="display-name"
                        type="text"
                        readOnly
                        value={splitName(form.fullName).firstName || profile.firstName}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                          Email Address
                        </label>
                        {profile.email && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
                              security.emailVerified
                                ? 'bg-badge-discount-bg text-badge-discount-text'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            <Icon name={security.emailVerified ? 'check_circle' : 'schedule'} className="text-[14px]" />
                            <span>{security.emailVerified ? 'Verified' : 'Not verified'}</span>
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Icon
                          name="alternate_email"
                          className="absolute left-4 text-outline text-[20px]"
                        />
                        <input
                          className="w-full h-[52px] pl-12 pr-4 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          id="email"
                          type="email"
                          readOnly
                          title="Your sign-in email can't be changed here"
                          value={emailAddress}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="phone">
                          Primary Phone Number
                        </label>
                        {profile.hasPhone && (
                          <span className="inline-flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full font-caption text-caption font-semibold">
                            <Icon name="call" className="text-[14px]" />
                            <span>On file</span>
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Icon name="call" className="absolute left-4 text-outline text-[20px]" />
                        <input
                          className="w-full h-[52px] pl-12 pr-4 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          id="phone"
                          type="tel"
                          placeholder="No phone number"
                          value={form.phone}
                          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-subtle rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                        <Icon name="location_home" className="text-[24px]" />
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                          Default Delivery &amp; Pickup Neighborhood
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {defaultAddress
                            ? [defaultAddress.label, defaultAddress.line, defaultAddress.area].filter(Boolean).join(', ')
                            : 'No default address saved yet'}
                        </p>
                        <p className="font-caption text-caption text-outline mt-0.5">
                          Used for nearby deals, delivery and pickup.
                        </p>
                      </div>
                    </div>
                    {onOpenAddresses && (
                      <button
                        className="shrink-0 inline-flex items-center gap-1.5 font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant transition-colors"
                        onClick={onOpenAddresses}
                        type="button"
                      >
                        <span>{defaultAddress ? 'Change Default Neighborhood' : 'Add an Address'}</span>
                        <Icon name="edit_location_alt" className="text-[16px]" />
                      </button>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-4">
                    <button
                      className="px-4 py-2 font-button-secondary text-button-secondary text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                      disabled={!dirty || saveState !== 'idle'}
                      onClick={resetForm}
                      type="button"
                    >
                      Discard
                    </button>
                    <button
                      className={`h-[52px] px-6 font-button-primary text-button-primary rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 ${
                        saveState === 'saved' ? 'bg-badge-discount-text text-on-primary' : 'bg-primary-container hover:bg-primary text-on-primary'
                      }`}
                      disabled={saveState !== 'idle'}
                      id="save-profile-btn"
                      onClick={() => void saveProfile()}
                      type="button"
                    >
                      {saveState === 'idle' && (
                        <>
                          <span>Save Profile Changes</span>
                          <Icon name="done" className="text-[18px]" />
                        </>
                      )}
                      {saveState === 'saving' && (
                        <>
                          <Icon name="sync" className="text-[18px] animate-spin" />
                          <span>Saving...</span>
                        </>
                      )}
                      {saveState === 'saved' && (
                        <>
                          <Icon name="check" className="text-[18px]" />
                          <span>Saved Successfully</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden" id="security-login">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                        Section 02
                      </span>
                    </div>
                    <h2 className="font-heading-lg text-heading-lg text-on-surface">Security &amp; Authentication</h2>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-badge-discount-text bg-badge-discount-bg px-3 py-1 rounded-full font-label-sm text-label-sm font-medium">
                    <Icon name="shield_lock" className="text-[16px]" />
                    <span>{security.twoFactorEnabled ? 'Two-Step Verification On' : security.hasPin ? 'PIN Protected' : 'Google Sign-in'}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Icon name="dialpad" className="text-[24px]" />
                      </div>
                      <div>
                        <h4 className="font-heading-sm text-heading-sm text-on-surface">6-Digit PIN</h4>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {security.hasPin
                            ? 'Used to sign in and to confirm voucher redemptions.'
                            : 'You sign in with Google, so your account has no PIN.'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {security.hasPin && (
                            <span className="tracking-[0.4em] font-bold text-on-surface text-[18px] leading-none">
                              ••••••
                            </span>
                          )}
                          <span className="font-caption text-caption text-badge-discount-text font-medium ml-2">
                            • {security.hasPin ? 'Active' : 'Not used'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {security.hasPin && (
                      <button
                        className="h-[44px] px-6 bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md rounded-lg shadow-sm transition-all shrink-0"
                        type="button"
                        onClick={handlePasswordReset}
                      >
                        Change PIN
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                      Account security controls
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm shrink-0">
                            <Icon name="mail" className="text-[20px] text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Email verification</p>
                            <p className="font-caption text-caption text-on-surface-variant truncate">
                              {profile.email || 'No email on file'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 font-caption text-caption font-semibold shrink-0 ${
                            security.emailVerified ? 'text-badge-discount-text' : 'text-on-surface-variant'
                          }`}
                        >
                          <Icon name={security.emailVerified ? 'check_circle' : 'schedule'} className="text-[14px]" />
                          <span>{security.emailVerified ? 'Verified' : 'Pending'}</span>
                        </span>
                      </div>

                      <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm shrink-0">
                            <Icon name="lock" className="text-[20px] text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Two-step verification</p>
                            <p className="font-caption text-caption text-on-surface-variant">
                              {security.twoFactorEnabled ? 'On — a code is required at sign-in' : 'Off for this account'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-caption text-caption font-semibold shrink-0 ${
                            security.twoFactorEnabled ? 'text-badge-discount-text' : 'text-on-surface-variant'
                          }`}
                        >
                          {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                          Signed-in devices
                        </h3>
                        <p className="font-caption text-caption text-on-surface-variant mt-1">
                          Every browser and phone currently signed in to your account. Sign out any you don&apos;t recognise.
                        </p>
                      </div>
                      {security.otherDevices.length > 0 && (
                        <button
                          className="text-error hover:text-on-error-container font-label-sm text-label-sm font-semibold shrink-0 disabled:opacity-60"
                          disabled={signingOutOthers}
                          onClick={() => void signOutOthers()}
                          type="button"
                        >
                          {signingOutOthers ? 'Signing out…' : `Sign out ${security.otherDevices.length} other${security.otherDevices.length === 1 ? '' : 's'}`}
                        </button>
                      )}
                    </div>

                    {security.devicesLoading && (
                      <p className="font-caption text-caption text-on-surface-variant">Loading signed-in devices…</p>
                    )}
                    {!security.devicesLoading && security.devicesError != null && (
                      <p className="font-caption text-caption text-error">Couldn&apos;t load your signed-in devices.</p>
                    )}
                    {!security.devicesLoading && security.devicesError == null && activeCount === 0 && (
                      <p className="font-caption text-caption text-on-surface-variant">No signed-in devices to show.</p>
                    )}

                    {security.activeDevices.map((device) => {
                      const name = deviceLabel(device);
                      return (
                        <div className="p-4 bg-surface-container-low rounded-xl" key={device.id}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm shrink-0">
                                <Icon name={deviceIcon(device)} className="text-[20px]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{name}</p>
                                <p className="font-caption text-caption text-on-surface-variant truncate">
                                  {device.ipAddress ? `${device.ipAddress} • ` : ''}
                                  {device.isCurrent ? 'Active now' : `Last active ${relativeTime(device.lastActiveAt)}`}
                                  {device.createdAt ? ` • Signed in ${relativeTime(device.createdAt)}` : ''}
                                </p>
                              </div>
                            </div>
                            {device.isCurrent ? (
                              <span className="font-caption text-caption text-badge-discount-text font-semibold shrink-0">This device</span>
                            ) : (
                              <button
                                className="text-error hover:text-on-error-container font-caption text-caption font-semibold px-2 py-1 rounded hover:bg-error-container/20 transition-colors shrink-0 disabled:opacity-60"
                                disabled={security.revokeDevice.isPending || signingOutOthers}
                                onClick={() => revokeOne(device.id, name)}
                                type="button"
                              >
                                Sign out
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden"
                id="notification-channels"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                        Section 03
                      </span>
                    </div>
                    <h2 className="font-heading-lg text-heading-lg text-on-surface">
                      Notification &amp; Alert Channels
                    </h2>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
                    Saved to your account
                  </span>
                </div>
                <div className="space-y-4">
                  {TOGGLES.map((toggle) => (
                    <div
                      className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-4"
                      key={toggle.id}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toggle.iconClass}`}
                        >
                          <Icon name={toggle.icon} className="text-[22px]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{toggle.title}</h4>
                            {toggle.tag && (
                              <span className="px-1.5 py-0.5 bg-surface-tint-blue text-primary font-caption text-caption rounded font-semibold">
                                {toggle.tag}
                              </span>
                            )}
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant">{toggle.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          aria-label={toggle.title}
                          checked={security.prefs[toggle.id]}
                          className="sr-only peer"
                          disabled={!security.prefsLoaded || security.updatePref.isPending}
                          onChange={(event) => toggleChannel(toggle.id, toggle.title, event.target.checked)}
                          type="checkbox"
                        />
                        <div className="w-12 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden"
                id="privacy-ndpr"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                        Section 04
                      </span>
                    </div>
                    <h2 className="font-heading-lg text-heading-lg text-on-surface">Privacy &amp; NDPR Data Rights</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-full">
                    <Icon name="gavel" className="text-[18px] text-badge-discount-text" />
                    <span className="font-caption text-caption text-on-surface-variant font-medium">
                      NDPR 2019 / NDPA 2023 Compliant
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl mb-6 flex items-start gap-4">
                  <Icon name="info" className="text-primary text-[28px] shrink-0" />
                  <div className="space-y-1.5">
                    <p className="font-heading-sm text-heading-sm text-on-surface font-semibold">
                      Privacy controls are coming soon
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      This area is intentionally limited until the backend exposes the privacy, export, and consent APIs.
                      The app currently supports identity, auth, and secure PIN flows, but not a live NDPR data-rights service.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-1">
                  <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-3 opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm shrink-0">
                        <Icon name="download" className="text-[20px]" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Portability Archive</p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          Backend endpoint pending
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-4 py-1 bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-not-allowed opacity-60"
                      type="button"
                      disabled
                    >
                      Unavailable
                    </button>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-3 opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-error flex items-center justify-center shadow-sm shrink-0">
                        <Icon name="delete_forever" className="text-[20px]" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-error font-semibold">Account Erasure</p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          Permanently remove your profile &amp; redemption ledger
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteAccount(true)}
                      className="text-error hover:text-on-error-container text-xs font-semibold px-2 py-1 rounded hover:bg-error-container/20 transition-colors shrink-0"
                      type="button"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
                <div className="mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-outline font-caption text-caption">
                  <span>
                    Privacy APIs are not yet wired to the app. This section will be enabled once the backend exposes them.
                  </span>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm" id="payment-methods">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                    Section 05
                  </span>
                </div>
                <h2 className="font-heading-lg text-heading-lg text-on-surface">Saved Payment &amp; Settlement</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Payment methods and settlement preferences are not yet exposed by the current backend contract.
                  This section is intentionally disabled until the payment API is available.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 p-4 bg-surface-container-low rounded-xl opacity-80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                      <Icon name="credit_card" className="text-[20px]" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        Preferred Settlement Method
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Not available yet — backend contract pending
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0 cursor-not-allowed opacity-60"
                    type="button"
                    disabled
                  >
                    Coming soon
                  </button>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm" id="support-desk">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                    Section 06
                  </span>
                </div>
                <h2 className="font-heading-lg text-heading-lg text-on-surface">Help &amp; Support Desk</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Reach VEMTAP Support for voucher disputes, booking changes, or help with a business.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={() => onNav('messages')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary rounded-xl shadow-sm transition-colors"
                    type="button"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Chat with Support</span>
                  </button>
                  <button
                    onClick={() => onNav('orders')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-low hover:bg-surface text-on-surface font-button-secondary text-button-secondary rounded-xl transition-colors"
                    type="button"
                  >
                    <Icon name="receipt_long" className="text-[18px]" />
                    <span>Track a Recent Order</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      </DesktopPage>
      {showPasswordChangeModal && (
        <PasswordChangeModal
          open={showPasswordChangeModal}
          onClose={() => setShowPasswordChangeModal(false)}
          onSaved={() => {
            setShowPasswordChangeModal(false);
            showToast('PIN updated successfully');
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] pointer-events-none px-margin">
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-2.5 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-space-2xs max-w-[90vw]">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" filled />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
      <DeleteAccountSheet
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onCompleted={() => {
          setShowDeleteAccount(false);
          signOut();
          onNav('home');
        }}
      />
    </>
  );
}
