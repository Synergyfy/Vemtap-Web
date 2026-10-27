import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { hasApiConfig } from '../../lib/api';
import { accountService, authService } from '../../services';
import { apiErrorMessage } from '../../services/errorMessages';

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
}

const SETTINGS_TABS = [
  { id: 'personal-profile', label: 'Personal Profile', icon: 'account_circle', trail: 'dot' as const },
  { id: 'security-login', label: 'Security & Login', icon: 'lock', trail: 'badge' as const, badge: 'High' },
  { id: 'notification-channels', label: 'Notification Preferences', icon: 'notifications_active', trail: 'chevron' as const },
  { id: 'payment-methods', label: 'Saved Payment & Settlement', icon: 'account_balance_wallet', trail: 'chevron' as const },
  { id: 'privacy-ndpr', label: 'Privacy & NDPR Data Rights', icon: 'policy', trail: 'chevron' as const },
  { id: 'support-desk', label: 'Help & Support Desk', icon: 'support_agent', trail: 'chevron' as const },
];

const TOGGLES = [
  {
    id: 'whatsapp',
    icon: 'chat',
    iconClass: 'bg-badge-discount-bg text-badge-discount-text',
    title: 'WhatsApp Deal Alerts & Vouchers',
    tag: 'Most Popular',
    desc: 'Instant voucher redemption codes, table bookings, and digital merchant receipts straight to your WhatsApp.',
    defaultChecked: true,
  },
  {
    id: 'email',
    icon: 'mark_email_read',
    iconClass: 'bg-surface-container-lowest text-primary shadow-sm',
    title: 'Email Weekly Neighborhood Digest',
    tag: '',
    desc: 'Curated flash discounts and weekend dining recommendations in Apo, Gudu, and Maitama.',
    defaultChecked: true,
  },
  {
    id: 'push',
    icon: 'notifications',
    iconClass: 'bg-surface-container-lowest text-secondary shadow-sm',
    title: 'Push Notifications for Order Updates',
    tag: '',
    desc: 'Kitchen dispatch, delivery courier proximity tracking, and pickup counters.',
    defaultChecked: true,
  },
  {
    id: 'sms',
    icon: 'sms',
    iconClass: 'bg-surface-container-lowest text-outline shadow-sm',
    title: 'SMS Backup for Offline Verification',
    tag: '',
    desc: 'Guaranteed offline fallback when cellular data connectivity drops across market clusters.',
    defaultChecked: true,
  },
];

type CredentialMode = 'pin';

function CredentialModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const submit = () => {
    if (!/^\d{4}$/.test(current)) return setError('Your current PIN is 4 digits');
    if (!/^\d{4}$/.test(next)) return setError('The new PIN must be 4 digits');
    if (next === current) return setError('The new PIN must differ from the current one');
    if (next !== confirm) return setError('Confirmation does not match');
    setError(null);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Change transaction PIN"
        className="w-full max-w-md rounded-2xl bg-surface-canvas border border-border-subtle shadow-2xl p-space-xl flex flex-col gap-space-md"
      >
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
              <Icon name="dialpad" className="text-[20px]" />
            </span>
            <div className="flex flex-col">
              <h2 className="font-heading-sm text-heading-sm text-on-surface font-semibold">Change transaction PIN</h2>
              <p className="font-caption text-caption text-text-secondary">Used for voucher redemption and secure checkout</p>
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
          {(['current', 'next', 'confirm'] as const).map((fieldName) => {
            const label =
              fieldName === 'current' ? 'Current PIN' : fieldName === 'next' ? 'New PIN' : 'Confirm new PIN';
            const value = fieldName === 'current' ? current : fieldName === 'next' ? next : confirm;
            const setter = fieldName === 'current' ? setCurrent : fieldName === 'next' ? setNext : setConfirm;
            const placeholder = '••••';
            const inputType = revealed[fieldName] ? 'text' : 'password';
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 4);

            return (
              <label key={fieldName} className="flex flex-col gap-space-2xs">
                <span className="font-label-sm text-label-sm text-text-secondary font-semibold">{label}</span>
                <div className="relative">
                  <input
                    type={inputType}
                    inputMode="numeric"
                    maxLength={4}
                    value={value}
                    onChange={(event) => setter(sanitizedValue !== event.target.value ? event.target.value.replace(/\D/g, '').slice(0, 4) : sanitizedValue)}
                    placeholder={placeholder}
                    className="h-11 w-full pr-11 px-space-sm rounded-xl bg-surface-subtle border border-border-subtle font-body-md text-body-md text-on-surface tracking-widest outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    aria-label={revealed[fieldName] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    onClick={() => setRevealed((currentState) => ({ ...currentState, [fieldName]: !currentState[fieldName] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-container hover:text-on-surface transition-colors"
                  >
                    <Icon name={revealed[fieldName] ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                  </button>
                </div>
              </label>
            );
          })}
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
            <span>Update PIN</span>
            <Icon name="check" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DesktopAccountSettingsScreen({ onNav }: DesktopAccountSettingsScreenProps) {
  const [activeTab, setActiveTab] = useState('personal-profile');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [credential, setCredential] = useState<CredentialMode | null>(null);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { signOut } = useAuth();
  const profile = useProfile();
  const [securityState, setSecurityState] = useState<Record<string, unknown>>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((toggle) => [toggle.id, toggle.defaultChecked])),
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!hasApiConfig()) return;

    let cancelled = false;
    const loadSecurity = async () => {
      try {
        const response = await accountService.getSecurity();
        if (!cancelled) {
          const nextSecurityState =
            response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object'
              ? (response.data as Record<string, unknown>)
              : (response && typeof response === 'object' ? (response as Record<string, unknown>) : {});

          setSecurityState(nextSecurityState);
        }
      } catch (error) {
        console.warn('Unable to load security settings:', error);
      }
    };

    loadSecurity();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2600);
  };

  const handlePasswordReset = () => {
    setShowPasswordChangeModal(true);
  };

  const goToSection = (id: string) => {
    setActiveTab(id);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fullName = profile.fullName || 'User';
  const emailAddress = profile.email || 'No email';
  const phoneNumber = profile.phone || 'No phone number';
  const memberTenureLabel = (() => {
    if (!profile.createdAt) return 'New member';
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return 'New member';
    return `Joined ${new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)}`;
  })();
  const securityLabel = typeof securityState?.status === 'string' && securityState.status.trim() ? securityState.status : 'Protected';

  const saveProfile = () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    const first = window.setTimeout(() => {
      setSaveState('saved');
      const second = window.setTimeout(() => setSaveState('idle'), 2500);
      timers.current.push(second);
    }, 800);
    timers.current.push(first);
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
              <span className="font-caption text-caption font-semibold">{securityLabel} • NDPR Consumer Data Vault Level 1 Verified</span>
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
                Manage your personal profile, security credentials, notification channels, and privacy preferences
                across the Apo hyper-local grid.
              </p>
            </div>
            <div className="hidden xl:flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="font-caption text-caption text-outline">Active Security Sync</p>
                <p className="font-label-md text-label-md text-on-surface font-semibold">Abuja Grid • TLS 1.3</p>
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
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-md">
                    <img
                      alt="Portrait of a young stylish Nigerian woman named Zainab Ahmed wearing modern warm cream attire in natural sunlit urban Abuja interior soft shallow depth of field authentic editorial style"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjNZatag_QoLkDjmoCYPJpUDckcokkYIWMIZajf_FMN0Sw_ejBsAcYbai1052NlTNHPM-UQUAFKDcwGnfLnIW3DGRYBW6e6KUUqQAs_mQOFtbdhEgrcbmlzO-8MLYwy0sgdbVXhZ8vsQpYDNfm_qPeMI2Ibc3Ka43baOpMMbUM_8oHB-tWVg4Cruk6fgVmVgImC_Rjlibh7Nckzo47BZjUQakbQPZFfMvZp0t3JY1N"
                    />
                    <button
                      aria-label="Update avatar"
                      className="absolute inset-0 bg-on-background/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary"
                      type="button"
                    >
                      <Icon name="photo_camera" className="text-[18px]" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading-sm text-heading-sm text-on-surface font-semibold truncate">
                        {fullName}
                      </h3>
                      <span title="Identity Verified">
                        <Icon name="verified" className="text-primary text-[16px]" />
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant truncate">{profile.email ? 'Account verified' : 'Profile pending completion'}</p>
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
                    <span className="font-caption text-caption text-outline">Saved this month</span>
                    <span className="font-label-md text-label-md text-badge-discount-text font-bold">₦18,450</span>
                  </div>
                  <svg className="w-20 h-6 overflow-visible text-badge-discount-text" fill="none" viewBox="0 0 80 24">
                    <path
                      d="M0 20 L 15 16 L 30 18 L 45 10 L 60 12 L 75 4 L 80 3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <circle cx="80" cy="3" fill="currentColor" r="2.5" />
                  </svg>
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
                        {tab.badge}
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
                  Operate a store or artisanal service in Apo?
                </p>
                <button
                  onClick={() => onNav('for-merchants')}
                  className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold mt-0.5 group self-start"
                  type="button"
                >
                  <span>Set up your business on VEMTAP</span>
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
                      Primary Hub: <strong>Apo FCT</strong>
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
                        defaultValue={fullName}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"
                        htmlFor="display-name"
                      >
                        <span>Community Display Name</span>
                        <span className="font-caption text-caption text-outline">Visible to Apo vendors</span>
                      </label>
                      <input
                        className="w-full h-[52px] px-4 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        id="display-name"
                        type="text"
                        defaultValue={fullName.split(' ')[0] || 'User'}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                          Email Address
                        </label>
                        <span className="inline-flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full font-caption text-caption font-semibold">
                          <Icon name="check_circle" className="text-[14px]" />
                          <span>Verified</span>
                        </span>
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
                          defaultValue={emailAddress}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="phone">
                          Primary Phone Number
                        </label>
                        <span className="inline-flex items-center gap-1.5 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full font-caption text-caption font-semibold">
                          <Icon name="chat" className="text-[14px]" />
                          <span>WhatsApp Verified</span>
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <Icon name="call" className="absolute left-4 text-outline text-[20px]" />
                        <input
                          className="w-full h-[52px] pl-12 pr-4 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          id="phone"
                          type="tel"
                          defaultValue={phoneNumber}
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
                          Apo Legislative Quarters, Apo District, Abuja FCT
                        </p>
                        <p className="font-caption text-caption text-outline mt-0.5">
                          Calculates 5km radius merchant flash promotions and free courier zones.
                        </p>
                      </div>
                    </div>
                    <button className="shrink-0 inline-flex items-center gap-1.5 font-button-secondary text-button-secondary text-primary hover:text-on-primary-fixed-variant transition-colors" type="button">
                      <span>Change Default Neighborhood</span>
                      <Icon name="edit_location_alt" className="text-[16px]" />
                    </button>
                  </div>

                  <div
                    aria-hidden="true"
                    className="w-full h-32 rounded-xl bg-cover bg-center relative overflow-hidden flex items-end p-4 shadow-inner"
                    title="Apo Legislative Quarters Abuja Nigeria"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAS5UKOp-gkKNf8sbfubOVTVaU1H7nTKS67RocUDJQcJb6pb5q-lOJZHOBUDgggNIlsEN45K4t4Q69SHVnPgHz_R2S0nUXNDjISfxWbCYNAM2UMW2uqbnxYBFVjkqbUWm6nVHeiYiSc-p-Vn7B29G-u9G85XhvF8y1z5WlGs1SxMOrdKarkdezoh5-MC1mFUzWcOpbZ07loI5E7kbGZJBUOLGSp0lxUVpiw1awBXrXz')",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-on-background/30 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between w-full text-on-primary">
                      <div className="flex items-center gap-2 font-caption text-caption">
                        <span className="w-2.5 h-2.5 rounded-full bg-badge-discount-text" />
                        <span>Grid Coverage: Apo Zone B, Guzape West, Gudu Link (4.8km Active Radius)</span>
                      </div>
                      <span className="font-caption text-caption opacity-80">Refreshed 2 mins ago</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-4">
                    <button
                      className="px-4 py-2 font-button-secondary text-button-secondary text-on-surface-variant hover:text-on-surface transition-colors"
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
                      onClick={saveProfile}
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
                          <span>Saving to Apo Grid...</span>
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
                    <span>Multi-Factor Enforced</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Icon name="dialpad" className="text-[24px]" />
                      </div>
                      <div>
                        <h4 className="font-heading-sm text-heading-sm text-on-surface">6-Digit Transaction PIN</h4>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Required for in-store voucher redemption and merchant QR taps.
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="tracking-[0.4em] font-bold text-on-surface text-[18px] leading-none">
                            ••••••
                          </span>
                          <span className="font-caption text-caption text-badge-discount-text font-medium ml-2">
                            • Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="h-[44px] px-6 bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md rounded-lg shadow-sm transition-all shrink-0"
                      type="button"
                      onClick={() => setCredential('pin')}
                    >
                      Change PIN
                    </button>
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
                        <span className="inline-flex items-center gap-1.5 text-badge-discount-text font-caption text-caption font-semibold shrink-0">
                          <Icon name="check_circle" className="text-[14px]" />
                          <span>{profile.email ? 'Verified' : 'Pending'}</span>
                        </span>
                      </div>

                      <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm shrink-0">
                            <Icon name="lock" className="text-[20px] text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Sign-in PIN</p>
                            <p className="font-caption text-caption text-on-surface-variant">Managed through the auth flow</p>
                          </div>
                        </div>
                        <button
                          className="text-primary hover:text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold shrink-0"
                          type="button"
                          onClick={() => void handlePasswordReset()}
                        >
                          Change PIN
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface font-semibold">
                        Trusted device policy
                      </h3>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">
                        Active sessions are controlled by JWT auth and token expiry. New devices can sign in normally,
                        while older sessions are invalidated when a token expires or the user signs out.
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container-low rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                            <Icon name="devices" className="text-[20px]" />
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Current session</p>
                            <p className="font-caption text-caption text-on-surface-variant">
                              Standard secure browser session with JWT authentication
                            </p>
                          </div>
                        </div>
                        <span className="font-caption text-caption text-badge-discount-text font-semibold">Active</span>
                      </div>
                    </div>
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
                    Real-time Abuja Push Network
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
                          checked={toggles[toggle.id]}
                          className="sr-only peer"
                          onChange={(event) =>
                            setToggles((current) => ({ ...current, [toggle.id]: event.target.checked }))
                          }
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
                          Requires legal/data-retention API support
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
                  Reach the Apo Local Concierge daily 8:00 AM – 10:00 PM for voucher disputes, booking changes, or
                  merchant redirection.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={() => onNav('messages')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-button-secondary text-button-secondary rounded-xl shadow-sm transition-colors"
                    type="button"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Chat with Apo Desk</span>
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
      {credential && (
        <CredentialModal
          onClose={() => setCredential(null)}
          onSaved={() => {
            setCredential(null);
            showToast('Transaction PIN updated successfully');
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
