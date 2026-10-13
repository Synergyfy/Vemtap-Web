import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { URBAN_BUSINESS } from './businessData';

interface BusinessInviteStaffScreenProps {
  onBack: () => void;
}

type Channel = 'email' | 'whatsapp' | 'sms';
type RoleKey = 'owner' | 'manager' | 'staff' | 'cashier';
type RoleMode = 'preset' | 'custom';

interface PermissionItem {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

const STEPS = [
  { title: 'Contact details', sub: 'Who you are inviting' },
  { title: 'Assign a role', sub: 'Preset role or your own title' },
  { title: 'Permissions', sub: 'Pages they can open' },
  { title: 'Branch access', sub: 'Where they work' },
  { title: 'Send invitation', sub: 'Delivery, link and message' },
];

const CHANNELS: { key: Channel; label: string; icon: string }[] = [
  { key: 'email', label: 'Email', icon: 'mail' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { key: 'sms', label: 'SMS', icon: 'sms' },
];

const ROLES: { key: RoleKey; label: string; desc: string; icon: string }[] = [
  { key: 'owner', label: 'Owner', desc: 'Full control including billing and team access', icon: 'workspace_premium' },
  { key: 'manager', label: 'Manager', desc: 'Runs daily operations across assigned branches', icon: 'badge' },
  { key: 'staff', label: 'Staff', desc: 'Floor service, orders and guest updates', icon: 'person' },
  { key: 'cashier', label: 'Cashier', desc: 'POS checkout, refunds and daily reports', icon: 'point_of_sale' },
];

const PERMISSION_GROUPS: { group: string; items: PermissionItem[] }[] = [
  {
    group: 'Operations',
    items: [
      { id: 'overview', label: 'Overview & Dashboard', desc: 'Daily KPIs, alerts and activity', icon: 'dashboard' },
      { id: 'orders', label: 'Orders', desc: 'Order list, details and fulfilment', icon: 'receipt_long' },
      { id: 'pos', label: 'POS & Customer Display', desc: 'Terminal, tips, split bill and receipt', icon: 'point_of_sale' },
      { id: 'messages', label: 'Messages', desc: 'Customer and deal conversations', icon: 'chat_bubble' },
    ],
  },
  {
    group: 'Sales & catalogue',
    items: [
      { id: 'catalog', label: 'Products & Services', desc: 'Menu, inventory and pricing', icon: 'inventory_2' },
      { id: 'deals', label: 'Deals & Promotions', desc: 'Create, publish and track deals', icon: 'local_offer' },
      { id: 'loyalty', label: 'Loyalty & Rewards', desc: 'Points, tiers and reward rules', icon: 'card_membership' },
      { id: 'boost', label: 'Boost Campaigns', desc: 'Paid promotion and daily spend', icon: 'campaign' },
    ],
  },
  {
    group: 'Customers & team',
    items: [
      { id: 'customers', label: 'Customers CRM', desc: 'Profiles, segments and notes', icon: 'groups' },
      { id: 'staff', label: 'Staff & Team Access', desc: 'Invites, roles and permissions', icon: 'badge' },
      { id: 'locations', label: 'Locations & Branches', desc: 'Branch details, hours and QR', icon: 'location_on' },
      { id: 'profile', label: 'Business Profile', desc: 'Public profile, storefront and links', icon: 'storefront' },
    ],
  },
  {
    group: 'Insights & account',
    items: [
      { id: 'analytics', label: 'Analytics & Reports', desc: 'Traffic, audience and branch data', icon: 'insights' },
      { id: 'subscription', label: 'Subscription & Add-ons', desc: 'Plan, invoices and add-ons', icon: 'receipt' },
      { id: 'verification', label: 'Verification & Compliance', desc: 'KYC status and documents', icon: 'verified_user' },
      { id: 'more', label: 'More & Settings', desc: 'App settings and preferences', icon: 'tune' },
    ],
  },
];

const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.id));

const ROLE_DEFAULTS: Record<RoleKey, string[]> = {
  owner: ALL_PERMISSION_IDS,
  manager: [
    'overview',
    'orders',
    'pos',
    'messages',
    'catalog',
    'deals',
    'loyalty',
    'customers',
    'locations',
    'profile',
    'analytics',
  ],
  staff: ['overview', 'orders', 'messages', 'customers'],
  cashier: ['overview', 'orders', 'pos', 'messages'],
};

const BRANCHES = ['Wuse 2', 'Maitama', 'Lekki Phase 1'];

const INVITE_LINK = `https://vemtap.com/join/${URBAN_BUSINESS.slug}?invite=VT48Q2K`;

const toPermissionMap = (ids: string[]) =>
  Object.fromEntries(ALL_PERMISSION_IDS.map((id) => [id, ids.includes(id)])) as Record<string, boolean>;

const fieldClass =
  'w-full h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle';

const cardClass = 'bg-surface-canvas rounded-2xl p-space-sm shadow-sm';

const stepTitleClass = 'font-label-md text-label-md text-text-primary font-semibold';

export function BusinessInviteStaffScreen({ onBack }: BusinessInviteStaffScreenProps) {
  const [step, setStep] = useState(0);
  const [sheetUp, setSheetUp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [roleMode, setRoleMode] = useState<RoleMode>('preset');
  const [role, setRole] = useState<RoleKey>('staff');
  const [customRole, setCustomRole] = useState('');

  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => toPermissionMap(ROLE_DEFAULTS.staff));
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['Wuse 2']);

  const [channel, setChannel] = useState<Channel>('email');
  const [message, setMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').length >= 7;
  const roleLabel =
    roleMode === 'preset' ? ROLES.find((option) => option.key === role)?.label ?? '' : customRole.trim();
  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const firstName = name.trim().split(/\s+/)[0] ?? '';

  const buildMessage = () => {
    const greeting = firstName || 'there';
    return [
      `Hi ${greeting}, click the link below to join ${URBAN_BUSINESS.name} as ${roleLabel || 'a team member'}.`,
      INVITE_LINK,
      `Your PIN has been sent to your registered email ${
        email.trim() || 'your email on file'
      }. Open the link on your phone to log in.`,
    ].join('\n\n');
  };

  useEffect(() => {
    if (!messageEdited) setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, roleLabel, messageEdited]);

  useEffect(() => {
    if (step === STEPS.length - 1 && !messageEdited) setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setSheetUp(true), 10);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(openTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (text: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const stepValid = (index: number) => {
    switch (index) {
      case 0:
        return name.trim().length > 1 && emailOk && pin.length === 4 && pin === confirmPin;
      case 1:
        return roleMode === 'preset' || customRole.trim().length > 1;
      case 2:
        return enabledCount > 0;
      case 3:
        return selectedBranches.length > 0;
      default:
        return (
          message.trim().length > 10 && (channel === 'email' ? emailOk : phoneOk) && !sending && !sent
        );
    }
  };

  const stepHint = (index: number) => {
    switch (index) {
      case 0:
        if (name.trim().length <= 1) return 'Enter the full name of your teammate.';
        if (!emailOk) return 'Enter a valid email address.';
        if (pin.length < 4) return 'Set a 4-digit PIN — you are creating it on their behalf.';
        if (pin !== confirmPin) return 'PINs do not match.';
        return 'You set the PIN, they receive it on their registered email.';
      case 1:
        return roleMode === 'preset'
          ? 'Preset roles arrive with pre-selected permissions.'
          : 'Type the role you want to give this staff member.';
      case 2:
        return `${enabledCount} of ${ALL_PERMISSION_IDS.length} pages enabled.`;
      case 3:
        return selectedBranches.length
          ? `${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''} selected.`
          : 'Select at least one branch.';
      default:
        if (!stepValid(index)) {
          if (channel !== 'email' && !phoneOk) return 'Add a phone number in step 1 to use WhatsApp or SMS.';
          if (message.trim().length <= 10) return 'Add a short note before sending.';
        }
        return channel === 'email'
          ? `Delivered to ${email.trim()} — PIN goes to the same inbox.`
          : `Sent to ${phone.trim()} — PIN goes to ${email.trim()}.`;
    }
  };

  const goNext = () => {
    if (!stepValid(step)) return;
    if (step === STEPS.length - 1) {
      if (sending || sent) return;
      setSending(true);
      window.setTimeout(() => {
        setSending(false);
        setSent(true);
        showToast(`Invitation sent to ${name.trim().split(' ')[0]} via ${CHANNELS.find((item) => item.key === channel)?.label}`);
        window.setTimeout(onBack, 1800);
      }, 900);
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (step === 0) onBack();
    else setStep((current) => current - 1);
  };

  const selectRole = (key: RoleKey) => {
    setRole(key);
    setPermissions(toPermissionMap(ROLE_DEFAULTS[key]));
  };

  const togglePermission = (id: string) => {
    setPermissions((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleAllPermissions = () => {
    setPermissions(toPermissionMap(enabledCount === ALL_PERMISSION_IDS.length ? [] : ALL_PERMISSION_IDS));
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches((current) =>
      current.includes(branch) ? current.filter((item) => item !== branch) : [...current, branch],
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      showToast('Invite link copied');
    } catch {
      showToast('Copy failed — select the link instead');
    }
  };

  const renderContact = () => (
    <div className="space-y-space-sm">
      <section className={cardClass}>
        <div className="flex flex-col gap-space-xs">
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Full name</span>
            <input
              autoComplete="off"
              className={fieldClass}
              placeholder="e.g. Ada Obi"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Email address</span>
            <input
              autoComplete="off"
              className={fieldClass}
              placeholder="ada.obi@urbanugrill.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">
              Phone number <span className="text-text-tertiary">(optional — for WhatsApp or SMS)</span>
            </span>
            <input
              autoComplete="off"
              className={fieldClass}
              placeholder="+234 800 000 0000"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-space-xs">
          <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name="pin" className="text-[16px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={stepTitleClass}>Set PIN for this staff</span>
            <span className="font-caption text-caption text-text-secondary block leading-relaxed">
              As the owner, you create the PIN yourself — it is delivered to{' '}
              <span className="text-text-primary">{email.trim() || 'their registered email'}</span> and never shown to
              anyone else.
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-xs mt-space-xs">
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Create PIN</span>
            <input
              autoComplete="new-password"
              className={fieldClass}
              inputMode="numeric"
              maxLength={4}
              placeholder="4-digit PIN"
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Confirm PIN</span>
            <input
              autoComplete="new-password"
              className={fieldClass}
              inputMode="numeric"
              maxLength={4}
              placeholder="Repeat PIN"
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </label>
        </div>
        <button
          className="mt-space-xs inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
          type="button"
          onClick={() => setShowPin((current) => !current)}
        >
          <Icon name={showPin ? 'visibility_off' : 'visibility'} className="text-[15px]" />
          <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
        </button>
      </section>
    </div>
  );

  const renderRole = () => (
    <div className="space-y-space-sm">
      <div className="grid grid-cols-2 gap-space-xs">
        {(['preset', 'custom'] as RoleMode[]).map((mode) => (
          <button
            className={`h-10 rounded-xl flex items-center justify-center gap-1.5 font-label-sm text-label-sm transition-all ${
              roleMode === mode
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-text-secondary'
            }`}
            key={mode}
            type="button"
            onClick={() => setRoleMode(mode)}
          >
            <Icon name={mode === 'preset' ? 'list_alt' : 'edit'} className="text-[15px]" />
            <span>{mode === 'preset' ? 'Preset roles' : 'Type my own'}</span>
          </button>
        ))}
      </div>

      {roleMode === 'preset' ? (
        <div className="flex flex-col gap-space-xs">
          {ROLES.map((option) => {
            const active = role === option.key;
            return (
              <button
                className={`w-full text-left rounded-xl p-space-xs border transition-all flex items-start gap-space-xs ${
                  active
                    ? 'border-primary bg-surface-tint-blue'
                    : 'border-border-subtle bg-surface-canvas hover:bg-surface-container-low'
                }`}
                key={option.key}
                type="button"
                onClick={() => selectRole(option.key)}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-text-secondary'
                  }`}
                >
                  <Icon name={option.icon} className="text-[16px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm font-semibold text-text-primary">{option.label}</span>
                    <span className="font-caption text-caption text-text-tertiary">
                      {ROLE_DEFAULTS[option.key].length} pages
                    </span>
                    <span
                      className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active ? 'border-primary' : 'border-outline-variant'
                      }`}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                  </span>
                  <span className="font-caption text-caption text-text-secondary block mt-0.5">{option.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <section className={cardClass}>
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Your custom role</span>
            <input
              className={fieldClass}
              placeholder="e.g. Shift Supervisor"
              type="text"
              value={customRole}
              onChange={(event) => setCustomRole(event.target.value)}
            />
          </label>
          <p className="font-caption text-caption text-text-tertiary leading-relaxed mt-1.5">
            Use any title your team recognises — Head Chef, Front Desk Lead, Store Supervisor. You choose their
            permissions on the next step.
          </p>
        </section>
      )}
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-tertiary">
          {enabledCount} of {ALL_PERMISSION_IDS.length} pages allowed
        </span>
        <button
          className="font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
          type="button"
          onClick={toggleAllPermissions}
        >
          {enabledCount === ALL_PERMISSION_IDS.length ? 'Clear all' : 'Select all'}
        </button>
      </div>

      {PERMISSION_GROUPS.map((group) => (
        <section key={group.group}>
          <p className="font-label-sm text-label-sm text-text-tertiary font-semibold uppercase tracking-wide mb-1.5">
            {group.group}
          </p>
          <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm divide-y divide-border-subtle">
            {group.items.map((item) => {
              const checked = permissions[item.id];
              return (
                <button
                  className="w-full flex items-start justify-between gap-space-xs py-2 px-1.5 text-left"
                  key={item.id}
                  type="button"
                  onClick={() => togglePermission(item.id)}
                >
                  <span className="min-w-0 flex-1 flex items-start gap-space-xs">
                    <span
                      className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked ? 'bg-primary border-primary' : 'bg-surface-canvas border-outline-variant'
                      }`}
                    >
                      {checked && <Icon name="check" className="text-on-primary text-[13px]" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <Icon name={item.icon} className="text-[15px] text-text-secondary shrink-0" />
                        <span className="font-label-sm text-label-sm text-text-primary truncate">{item.label}</span>
                      </span>
                      <span className="font-caption text-caption text-text-tertiary block truncate mt-0.5">
                        {item.desc}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );

  const renderBranches = () => (
    <div className="space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-tertiary">
          {selectedBranches.length} of {BRANCHES.length} selected
        </span>
        <button
          className="font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
          type="button"
          onClick={() => setSelectedBranches(selectedBranches.length === BRANCHES.length ? [] : [...BRANCHES])}
        >
          {selectedBranches.length === BRANCHES.length ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <section className={cardClass}>
        <div className="flex flex-wrap gap-1.5">
          {BRANCHES.map((branch) => {
            const active = selectedBranches.includes(branch);
            return (
              <button
                className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-full font-label-sm text-label-sm transition-all ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
                }`}
                key={branch}
                type="button"
                onClick={() => toggleBranch(branch)}
              >
                <Icon name={active ? 'check' : 'location_on'} className="text-[14px]" />
                <span>{branch}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="rounded-xl bg-surface-tint-blue p-space-xs flex items-start gap-space-xs">
        <Icon name="info" className="text-primary text-[16px] shrink-0 mt-0.5" />
        <p className="font-caption text-caption text-on-surface leading-relaxed">
          They only see data, orders and customers from the branches selected here. You can change access later from
          Staff &amp; Team Access.
        </p>
      </section>
    </div>
  );

  const renderSend = () => (
    <div className="space-y-space-sm">
      <section>
        <h3 className={stepTitleClass}>Send via</h3>
        <div className="grid grid-cols-3 gap-space-xs mt-space-xs">
          {CHANNELS.map((option) => {
            const active = channel === option.key;
            const locked = option.key !== 'email' && !phoneOk;
            return (
              <button
                className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 font-label-sm text-label-sm transition-all ${
                  locked
                    ? 'bg-surface-container-low text-text-tertiary opacity-60'
                    : active
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
                }`}
                disabled={locked}
                key={option.key}
                type="button"
                onClick={() => setChannel(option.key)}
              >
                <Icon name={option.icon} className="text-[16px]" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <p className="font-caption text-caption text-text-tertiary mt-1.5">
          {channel === 'email'
            ? `Default — emailed to ${email.trim()}`
            : channel === 'whatsapp'
              ? `Sent to ${phone.trim()} on WhatsApp with a tap-to-login link`
              : `Texted to ${phone.trim()} with a tap-to-login link`}
        </p>
        {!phoneOk && (
          <p className="font-caption text-caption text-badge-discount-text mt-1">
            Add a phone number in step 1 to unlock WhatsApp and SMS.
          </p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className={stepTitleClass}>Invite link</h3>
          <span className="font-caption text-caption text-text-tertiary">Expires in 48 hours</span>
        </div>
        <div className={`${cardClass} mt-space-xs flex items-center gap-space-xs`}>
          <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name="link" className="text-[16px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-label-sm text-label-sm text-text-primary block truncate">{INVITE_LINK}</span>
            <span className="font-caption text-caption text-text-tertiary block">Single use · secure sign-in</span>
          </span>
          <button
            className="h-9 px-3 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform shrink-0"
            type="button"
            onClick={copyLink}
          >
            <Icon name="content_copy" className="text-[14px]" />
            <span>Copy</span>
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className={stepTitleClass}>Message</h3>
          <button
            className="font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
            type="button"
            onClick={() => {
              setMessage(buildMessage());
              setMessageEdited(false);
            }}
          >
            Reset
          </button>
        </div>
        <textarea
          className="w-full mt-space-xs rounded-2xl bg-surface-canvas p-space-sm shadow-sm border border-border-subtle text-text-primary font-label-sm text-label-sm leading-relaxed outline-none focus:border-primary resize-none"
          rows={7}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setMessageEdited(true);
          }}
        />
        <p className="font-caption text-caption text-text-tertiary mt-1">
          Addressed to <span className="text-text-primary font-semibold">{firstName || 'your teammate'}</span> —
          pre-filled with instructions, tap to edit before sending.
        </p>
      </section>

      <section className="rounded-xl bg-badge-discount-bg p-space-xs flex items-start gap-space-xs">
        <Icon name="verified_user" className="text-badge-discount-text text-[16px] shrink-0 mt-0.5" />
        <p className="font-caption text-caption text-on-surface leading-relaxed">
          Invitations expire after 48 hours. You can revoke access any time from Staff &amp; Team Access, and every
          permission change is logged.
        </p>
      </section>
    </div>
  );

  const renderStepBody = () => {
    switch (step) {
      case 0:
        return renderContact();
      case 1:
        return renderRole();
      case 2:
        return renderPermissions();
      case 3:
        return renderBranches();
      default:
        return renderSend();
    }
  };

  const isLast = step === STEPS.length - 1;
  const valid = stepValid(step);

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-on-surface/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          sheetUp ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onBack}
      />

      <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center">
        <div
          className={`w-full max-w-[430px] bg-surface rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] transition-transform duration-300 ease-out ${
            sheetUp ? 'translate-y-0' : 'translate-y-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Invite team member"
        >
          <div className="w-full flex items-center justify-center pt-3 pb-1 shrink-0">
            <span className="w-12 h-1.5 rounded-full bg-outline-variant/60" />
          </div>

          <div className="px-margin shrink-0">
            <div className="flex items-start justify-between gap-space-xs">
              <div className="min-w-0">
                <h2 className="font-heading-sm text-heading-sm text-text-primary tracking-tight">Invite team member</h2>
                <p className="font-caption text-caption text-text-secondary">
                  Step {step + 1} of {STEPS.length} · {STEPS[step].title}
                </p>
              </div>
              <button
                aria-label="Close invite"
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary active:scale-95 transition-transform shrink-0"
                type="button"
                onClick={onBack}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="flex gap-1.5 mt-space-xs">
              {STEPS.map((item, index) => (
                <span
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= step ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                  key={item.title}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-margin py-space-sm">{renderStepBody()}</div>

          <div className="shrink-0 border-t border-border-subtle bg-surface px-margin pt-space-xs pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
            <p className="font-caption text-caption text-text-tertiary mb-space-xs">{stepHint(step)}</p>
            <div className="flex items-center gap-space-xs">
              <button
                className="h-11 px-space-md rounded-xl bg-surface-container-low text-text-primary font-label-md text-label-md font-semibold active:scale-95 transition-transform"
                type="button"
                onClick={goBack}
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </button>
              <button
                className={`h-11 flex-1 rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all ${
                  valid
                    ? 'bg-primary-container text-on-primary shadow-md active:scale-95'
                    : 'bg-surface-container-highest text-text-tertiary'
                }`}
                type="button"
                onClick={goNext}
              >
                <Icon
                  name={sending ? 'hourglass_top' : sent ? 'check_circle' : isLast ? 'send' : 'arrow_forward'}
                  className="text-[16px]"
                />
                <span>{sending ? 'Sending…' : sent ? 'Sent' : isLast ? 'Send invitation' : 'Next'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-[70] pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
