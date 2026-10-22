import { useEffect, useState } from 'react';
import { InviteStaffForm } from '../../components/business/TeamPanels';
import { hasApiConfig } from '../../services/api/client';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';

interface DesktopStaffInviteScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack?: () => void;
}

type Channel = 'email' | 'whatsapp';
type RolePreset = 'manager' | 'cashier' | 'service' | 'custom';
type SubmitState = 'idle' | 'sending' | 'sent';

/** Single-use invite link the staff member taps to join this business. */
const INVITE_LINK = 'https://vemtap.com/join/urban-grill-bistro-104?invite=VT48Q2K';

/** Dashboard pages the owner can grant — mirrors the mobile invite flow. */
const PERMISSION_GROUPS: { group: string; items: { id: string; label: string; icon: string }[] }[] = [
  {
    group: 'Operations',
    items: [
      { id: 'overview', label: 'Overview & Dashboard', icon: 'dashboard' },
      { id: 'orders', label: 'Orders', icon: 'receipt_long' },
      { id: 'pos', label: 'POS & Customer Display', icon: 'point_of_sale' },
      { id: 'messages', label: 'Messages', icon: 'chat_bubble' },
    ],
  },
  {
    group: 'Sales & catalogue',
    items: [
      { id: 'catalog', label: 'Products & Services', icon: 'inventory_2' },
      { id: 'deals', label: 'Deals & Promotions', icon: 'local_offer' },
      { id: 'loyalty', label: 'Loyalty & Rewards', icon: 'card_membership' },
      { id: 'boost', label: 'Boost Campaigns', icon: 'campaign' },
    ],
  },
  {
    group: 'Customers & team',
    items: [
      { id: 'customers', label: 'Customers CRM', icon: 'groups' },
      { id: 'staff', label: 'Staff & Team Access', icon: 'badge' },
      { id: 'locations', label: 'Locations & Branches', icon: 'location_on' },
      { id: 'profile', label: 'Business Profile', icon: 'storefront' },
    ],
  },
  {
    group: 'Insights & account',
    items: [
      { id: 'analytics', label: 'Analytics & Reports', icon: 'insights' },
      { id: 'subscription', label: 'Subscription & Add-ons', icon: 'receipt' },
      { id: 'verification', label: 'Verification & Compliance', icon: 'verified_user' },
      { id: 'more', label: 'More & Settings', icon: 'tune' },
    ],
  },
];

const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.id));

/** Pages granted by default for each role preset. */
const ROLE_PERMISSIONS: Record<RolePreset, string[]> = {
  manager: [
    'overview', 'orders', 'pos', 'messages', 'catalog', 'deals', 'loyalty',
    'customers', 'locations', 'profile', 'analytics',
  ],
  cashier: ['overview', 'orders', 'pos', 'messages'],
  service: ['overview', 'orders', 'messages', 'customers', 'locations'],
  custom: ['overview'],
};

const toPermissionMap = (ids: string[]) =>
  Object.fromEntries(ALL_PERMISSION_IDS.map((id) => [id, ids.includes(id)])) as Record<string, boolean>;

const ROLE_OPTIONS: Array<{
  key: RolePreset;
  title: string;
  badge: string;
  badgeClass: string;
  note?: { label: string; labelClass: string };
  body: string;
  bodyClass: string;
}> = [
  {
    key: 'manager',
    title: 'Store Manager',
    badge: 'High Authority',
    badgeClass: 'bg-surface-container text-on-surface-variant font-medium',
    body: 'Manage branch operations, edit catalogue, validate deals, and view customer orders.',
    bodyClass: 'font-caption text-caption text-text-secondary mt-1 leading-normal',
  },
  {
    key: 'cashier',
    title: 'Cashier & POS Operator',
    badge: 'Daily Till Ops',
    badgeClass: 'bg-surface-container-high text-primary font-semibold',
    note: { label: 'Most Common', labelClass: 'bg-primary-container text-on-primary-container font-semibold' },
    body: 'Process orders at POS terminals, accept customer payments, and scan/redeem VEMTAP vouchers.',
    bodyClass: 'font-body-md text-body-md text-text-secondary mt-1 text-sm leading-normal',
  },
  {
    key: 'service',
    title: 'Service Staff',
    badge: 'Front Desk',
    badgeClass: 'bg-surface-container text-on-surface-variant font-medium',
    body: 'Manage appointment schedules, client services, customer intake queues, and check-ins.',
    bodyClass: 'font-caption text-caption text-text-secondary mt-1 leading-normal',
  },
  {
    key: 'custom',
    title: 'Custom Staff Role',
    badge: 'Granular Setup',
    badgeClass: 'bg-surface-container-high text-text-secondary font-medium',
    body: 'Tailored granular permissions configured manually for specialized departmental duties.',
    bodyClass: 'font-caption text-caption text-text-secondary mt-1 leading-normal',
  },
];

const BRANCH_OPTIONS = [
  'Wuse Branch (Abuja Flagship) - Plot 104 Aminu Kano Cres',
  'Lagos VI Store - 14B Karimu Kotun, Victoria Island',
  'Garki Hub - Area 11 Commercial Arcade',
  'Universal Access (All Operational Outlets)',
];

const QUICK_PRESETS = ['Abuja Flagship (Active)', 'Lagos VI', 'Garki Hub', 'Universal (All Outlets)'];

const ROADMAP_STEPS = [
  {
    title: 'Step 1: Invite dispatched via secure link',
    body: 'Sent to the staff email or WhatsApp with a single-use join link.',
    active: true,
  },
  {
    title: 'Step 2: Employee opens the link & signs in',
    body: 'The link grants access to this business account on their phone.',
    active: false,
  },
  {
    title: 'Step 3: Employee enters their 6-digit PIN',
    body: 'Your preset 6-digit PIN was emailed to them — they enter it to finish signing in.',
    active: false,
  },
];

const PRESET_BADGES: Record<RolePreset, string> = {
  manager: 'Manager',
  cashier: 'Cashier',
  service: 'Service',
  custom: 'Custom',
};

export function DesktopStaffInviteScreen({ onNav, onBack }: DesktopStaffInviteScreenProps) {
  const [channel, setChannel] = useState<Channel>('email');
  const [rolePreset, setRolePreset] = useState<RolePreset>('cashier');
  const [fullName, setFullName] = useState('Babatunde Adeleke');
  const [workEmail, setWorkEmail] = useState('babatunde.a@example.com');
  const [phone, setPhone] = useState('+234 809 123 4567');
  const [branchIndex, setBranchIndex] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  // Page permissions the owner grants to this staff member.
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    toPermissionMap(ROLE_PERMISSIONS.cashier),
  );
  // Preset 6-digit PIN created on the staff member's behalf — emailed to them.
  const [pin, setPin] = useState('482913');
  const [confirmPin, setConfirmPin] = useState('482913');
  const [showPin, setShowPin] = useState(false);
  // Preset invite message — editable before sending.
  const [message, setMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);
  // Custom Staff Role — the owner types the role name in a modal before the preset applies.
  const [customRoleOpen, setCustomRoleOpen] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDraft, setCustomRoleDraft] = useState('');

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const firstName = fullName.trim().split(/\s+/)[0] ?? '';
  const roleLabel =
    rolePreset === 'custom' && customRoleName.trim() ? customRoleName.trim() : PRESET_BADGES[rolePreset];
  const pinOk = pin.length === 6 && pin === confirmPin;

  const buildMessage = () =>
    [
      `Hi ${firstName || 'there'}, click the link below to join Urban Grill & Bistro as ${roleLabel}.`,
      INVITE_LINK,
      `Your 6-digit PIN has been sent to your registered email ${workEmail.trim() || 'your email on file'}. Check your email for the PIN, then open the link to log in.`,
    ].join('\n\n');

  // Keep the preset message in sync with the staff details until the owner edits it.
  useEffect(() => {
    if (!messageEdited) setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, workEmail, roleLabel, messageEdited]);

  const togglePermission = (id: string) => {
    setPermissions((current) => ({ ...current, [id]: !current[id] }));
  };

  const selectRolePreset = (key: RolePreset) => {
    if (key === 'custom') {
      // Custom Staff Role needs a name first — open the modal, then apply.
      setCustomRoleDraft(customRoleName);
      setCustomRoleOpen(true);
      return;
    }
    setRolePreset(key);
    setPermissions(toPermissionMap(ROLE_PERMISSIONS[key]));
  };

  const confirmCustomRole = () => {
    const name = customRoleDraft.trim();
    if (name.length < 2) return;
    setCustomRoleName(name);
    setRolePreset('custom');
    setPermissions(toPermissionMap(ROLE_PERMISSIONS.custom));
    setCustomRoleOpen(false);
  };

  const triggerInvite = () => {
    if (submitState !== 'idle') return;
    setSubmitState('sending');
    window.setTimeout(() => {
      setSubmitState('sent');
      window.setTimeout(() => setSubmitState('idle'), 3000);
    }, 1200);
  };

  const submitLabel =
    submitState === 'idle' ? 'Send Invitation' : submitState === 'sending' ? 'Transmitting Token...' : 'Invitation Dispatched!';
  const submitIcon = submitState === 'idle' ? 'send' : submitState === 'sending' ? 'sync' : 'check_circle';

  // Live: sends a real invite; the designed form below is the demo.
  if (hasApiConfig()) {
    return (
      <EnterpriseShell activeNav="business-staff" onNav={onNav}>
        <div className="w-full py-space-xl flex flex-col gap-space-lg">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">Invite a team member</h1>
            <p className="font-body-md text-body-md text-text-secondary">They get an email to set up their sign-in.</p>
          </div>
          <InviteStaffForm onDone={() => onBack?.()} onCancel={() => onBack?.()} />
        </div>
      </EnterpriseShell>
    );
  }

  return (
    <EnterpriseShell activeNav="business-staff" onNav={onNav}>
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 right-0 w-[30rem] h-[30rem] bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative py-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pb-space-xl">
            <div className="flex flex-col gap-space-xs max-w-3xl">
              <div className="flex items-center gap-space-xs text-text-tertiary font-label-sm text-label-sm">
                <button
                  type="button"
                  className="hover:text-primary transition-colors cursor-pointer"
                  onClick={() => onNav('overview')}
                >
                  Business Hub
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
                <button
                  type="button"
                  className="hover:text-primary transition-colors cursor-pointer"
                  onClick={onBack}
                >
                  Staff &amp; Access
                </button>
                <Icon name="chevron_right" className="text-[14px]" />
                <span className="text-primary font-medium">Invite Team Member</span>
              </div>
              <h1 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
                Invite New Team Member
              </h1>
              <p className="font-body-md text-body-md text-text-secondary leading-relaxed">
                Add an employee to your business. They receive an invite link by email or WhatsApp to access this
                business account, plus a preset 6-digit PIN sent to their email.
              </p>
            </div>
            <div className="flex items-center gap-space-sm shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={onBack}
                className="h-[48px] px-space-lg rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-button-secondary text-button-secondary transition-all flex items-center gap-space-2xs"
              >
                <Icon name="arrow_back" className="text-[18px] text-text-secondary" />
                <span>Cancel &amp; Return to Directory</span>
              </button>
              <button
                type="button"
                onClick={triggerInvite}
                className={`h-[48px] px-space-xl rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-space-xs ${
                  submitState === 'sent'
                    ? 'bg-badge-discount-text text-on-primary'
                    : 'bg-primary hover:bg-primary-container text-on-primary'
                } ${submitState === 'sending' ? 'opacity-90 pointer-events-none' : ''}`}
              >
                <span>{submitLabel}</span>
                <Icon name={submitIcon} className={`text-[18px] ${submitState === 'sending' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-xl">
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue flex items-center justify-center text-primary">
                      <Icon name="badge" className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        1. Contact Identity &amp; Channel
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Basic credentials to issue credentials and passkeys
                      </p>
                    </div>
                  </div>
                  <span className="px-space-xs py-1 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Tier-1 Enrolled
                  </span>
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-md text-label-md text-text-primary font-semibold flex items-center justify-between">
                    <span>Full Legal Name</span>
                    <span className="text-primary font-caption text-caption font-medium flex items-center gap-1">
                      <Icon name="verified" className="text-[14px]" />
                      Verified ID check
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      className="w-full h-[52px] px-space-md pl-11 rounded-xl bg-surface-subtle focus:bg-surface-canvas text-text-primary font-body-md text-body-md shadow-inner transition-all outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. Babatunde Adeleke"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                    <Icon name="person" className="absolute left-3.5 text-text-tertiary text-[20px]" />
                    <Icon name="check_circle" className="absolute right-3.5 text-badge-discount-text text-[20px]" />
                  </div>
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Preferred Invitation Dispatch Channel
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={
                        channel === 'email'
                          ? 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                          : 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-all'
                      }
                    >
                      <Icon name="mail" className="text-[18px]" />
                      <span>Work Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={
                        channel === 'whatsapp'
                          ? 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                          : 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-all'
                      }
                    >
                      <Icon name="chat" className="text-[18px]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary">
                    {channel === 'email'
                      ? `Invite link emailed to ${workEmail.trim() || 'the work email above'} — PIN goes to the same inbox.`
                      : `Invite link sent to ${phone.trim() || 'the phone above'} on WhatsApp — PIN still goes to their email.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-sm text-label-sm text-text-secondary font-medium">
                      Work Email Address
                    </label>
                    <div className="relative flex items-center">
                      <input
                        className="w-full h-[52px] px-space-md pl-11 rounded-xl bg-surface-subtle focus:bg-surface-canvas text-text-primary font-body-md text-body-md transition-all outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="name@company.com"
                        type="email"
                        value={workEmail}
                        onChange={(event) => setWorkEmail(event.target.value)}
                      />
                      <Icon name="alternate_email" className="absolute left-3.5 text-text-tertiary text-[20px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-sm text-label-sm text-text-secondary font-medium">
                      Mobile Phone (Nigeria)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none">
                        <svg className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0" viewBox="0 0 640 480">
                          <g fillRule="evenodd" strokeWidth="1pt">
                            <path d="M0 0h213.3v480H0z" fill="#008751" />
                            <path d="M213.3 0h213.4v480H213.3z" fill="#ffffff" />
                            <path d="M426.7 0H640v480H426.7z" fill="#008751" />
                          </g>
                        </svg>
                      </div>
                      <input
                        className="w-full h-[52px] px-space-md pl-12 rounded-xl bg-surface-subtle focus:bg-surface-canvas text-text-primary font-body-md text-body-md transition-all outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="+234 800 000 0000"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <Icon name="admin_panel_settings" className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        2. Role Preset &amp; Authority Tier
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Determines till permissions, scanner scope, and access levels
                      </p>
                    </div>
                  </div>
                  <span className="font-caption text-caption text-text-tertiary">4 Presets Available</span>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {ROLE_OPTIONS.map((option) => {
                    const selected = rolePreset === option.key;
                    const displayTitle =
                      option.key === 'custom' && selected && customRoleName.trim()
                        ? customRoleName.trim()
                        : option.title;
                    return (
                      <label
                        key={option.key}
                        className={
                          selected
                            ? 'group relative flex items-start gap-space-md p-space-md rounded-xl bg-surface-tint-blue/80 hover:bg-surface-tint-blue cursor-pointer transition-all shadow-sm'
                            : 'group relative flex items-start gap-space-md p-space-md rounded-xl bg-surface-subtle hover:bg-surface-container-low cursor-pointer transition-all'
                        }
                      >
                        <input
                          className="mt-1 text-primary focus:ring-0 cursor-pointer h-4 w-4"
                          name="role_preset"
                          type="radio"
                          value={option.key}
                          checked={selected}
                          onChange={() => selectRolePreset(option.key)}
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            {option.note ? (
                              <div className="flex items-center gap-space-xs">
                                <span
                                  className={
                                    selected
                                      ? 'font-label-md text-label-md text-primary font-bold'
                                      : 'font-label-md text-label-md text-text-primary font-semibold'
                                  }
                                >
                                  {displayTitle}
                                </span>
                                <span
                                  className={`px-space-xs py-0.5 rounded-full font-caption text-caption font-semibold ${option.note.labelClass}`}
                                >
                                  {option.note.label}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={
                                  selected
                                    ? 'font-label-md text-label-md text-primary font-bold'
                                    : 'font-label-md text-label-md text-text-primary font-semibold'
                                }
                              >
                                {displayTitle}
                              </span>
                            )}
                            <span
                              className={`font-caption text-caption px-2 py-0.5 rounded ${option.badgeClass}`}
                            >
                              {option.badge}
                            </span>
                          </div>
                          <p className={option.bodyClass}>{option.body}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Page permissions — the owner picks which dashboard pages this staff can open */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                      <Icon name="admin_panel_settings" className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        3. Page Access Permissions
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Choose the dashboard pages this staff member can open
                      </p>
                    </div>
                  </div>
                  <span className="px-space-xs py-1 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold">
                    {enabledCount} of {ALL_PERMISSION_IDS.length} pages
                  </span>
                </div>

                <div className="flex flex-col gap-space-md">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm text-text-tertiary font-semibold uppercase tracking-wider">
                        {group.group}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xs">
                        {group.items.map((item) => {
                          const granted = permissions[item.id];
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => togglePermission(item.id)}
                              className={`flex items-center gap-space-sm p-space-sm rounded-xl text-left transition-all ${
                                granted
                                  ? 'bg-surface-tint-blue shadow-sm'
                                  : 'bg-surface-subtle opacity-70 hover:opacity-100'
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  granted ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-tertiary'
                                }`}
                              >
                                <Icon name={item.icon} className="text-[16px]" />
                              </span>
                              <span className="min-w-0 flex-1 truncate font-label-sm text-label-sm text-text-primary font-medium">
                                {item.label}
                              </span>
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  granted ? 'border-primary bg-primary' : 'border-outline-variant'
                                }`}
                              >
                                {granted && <Icon name="check" className="text-[12px] text-on-primary" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                      <Icon name="store" className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        4. Operating Branch Assignment
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Ties till sessions and audit logs to a physical location
                      </p>
                    </div>
                  </div>
                  <Icon name="my_location" className="text-text-tertiary" />
                </div>

                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Primary Retail Station
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="location_on" className="absolute left-3.5 text-primary text-[20px]" />
                    <select
                      className="w-full h-[52px] pl-11 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                      value={branchIndex}
                      onChange={(event) => setBranchIndex(Number(event.target.value))}
                    >
                      {BRANCH_OPTIONS.map((option, index) => (
                        <option key={option} value={index}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-3.5 text-text-tertiary pointer-events-none text-[20px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                    Quick Branch Presets
                  </span>
                  <div className="flex flex-wrap items-center gap-space-xs">
                    {QUICK_PRESETS.map((preset, index) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBranchIndex(index)}
                        className={
                          branchIndex === index
                            ? 'h-9 px-space-md rounded-full bg-surface-tint-blue text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm'
                            : 'h-9 px-space-md rounded-full bg-surface-subtle hover:bg-surface-container text-text-secondary font-label-sm text-label-sm transition-colors'
                        }
                      >
                        {branchIndex === index && <Icon name="check" className="text-[16px]" />}
                        <span>{preset}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-xl">
              {/* 5. Preset 6-digit PIN — created on the staff member's behalf, emailed to them */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_24px_-2px_rgba(13,37,76,0.06)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between pb-space-xs">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                      Staff Security
                    </span>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Set 6-Digit PIN</h3>
                  </div>
                  <div className="px-space-xs py-1 rounded-lg bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                    {pinOk ? 'PINs match' : 'Both fields required'}
                  </div>
                </div>

                <p className="font-caption text-caption text-text-secondary leading-relaxed -mt-space-sm">
                  As the owner, you create the 6-digit PIN on their behalf. It is delivered to{' '}
                  <span className="text-text-primary font-semibold">
                    {workEmail.trim() || 'their registered email'}
                  </span>{' '}
                  and never shown to anyone else — the staff member checks their email for the PIN.
                </p>

                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="staff-pin">
                      Create PIN
                    </label>
                    <input
                      autoComplete="new-password"
                      className="w-full h-[52px] px-space-md rounded-xl bg-surface-canvas border-2 border-outline-variant text-text-primary font-body-md text-body-md tracking-[0.4em] transition-all outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 shadow-sm"
                      id="staff-pin"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit PIN"
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                  <div className="flex flex-col gap-space-2xs">
                    <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="staff-pin-confirm">
                      Confirm PIN
                    </label>
                    <input
                      autoComplete="new-password"
                      className={`w-full h-[52px] px-space-md rounded-xl bg-surface-canvas border-2 text-text-primary font-body-md text-body-md tracking-[0.4em] transition-all outline-none shadow-sm ${
                        confirmPin.length === 6 && !pinOk
                          ? 'border-error focus:border-error focus:ring-4 focus:ring-error/15'
                          : 'border-outline-variant focus:border-primary-container focus:ring-4 focus:ring-primary-container/15'
                      }`}
                      id="staff-pin-confirm"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Repeat PIN"
                      type={showPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                </div>
                {confirmPin.length === 6 && !pinOk && (
                  <p className="font-caption text-caption text-error">PINs do not match.</p>
                )}

                <button
                  className="self-start inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
                  type="button"
                  onClick={() => setShowPin((current) => !current)}
                >
                  <Icon name={showPin ? 'visibility_off' : 'visibility'} className="text-[15px]" />
                  <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
                </button>
              </div>

              {/* 6. Preset invite message — link + PIN instructions, editable before sending */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                      Invite Message
                    </span>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Preset message &amp; link</h3>
                  </div>
                  <button
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline active:scale-95 transition-transform"
                    type="button"
                    onClick={() => {
                      setMessage(buildMessage());
                      setMessageEdited(false);
                    }}
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
                  <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="link" className="text-[16px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-label-sm text-label-sm text-text-primary block truncate">{INVITE_LINK}</span>
                    <span className="font-caption text-caption text-text-tertiary block">
                      Single use · expires in 48 hours
                    </span>
                  </span>
                  <button
                    className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform shrink-0"
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(INVITE_LINK).catch(() => undefined);
                    }}
                  >
                    <Icon name="content_copy" className="text-[14px]" />
                    <span>Copy</span>
                  </button>
                </div>

                <textarea
                  className="w-full rounded-xl bg-surface-subtle p-space-sm text-text-primary font-body-md text-body-md leading-relaxed outline-none focus:bg-surface-canvas focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={8}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setMessageEdited(true);
                  }}
                />
                <p className="font-caption text-caption text-text-tertiary">
                  Addressed to <span className="text-text-primary font-semibold">{firstName || 'your teammate'}</span> —
                  pre-filled with the join link and PIN instructions, tap to edit before sending via{' '}
                  <span className="text-text-primary font-semibold">{channel === 'email' ? 'Email' : 'WhatsApp'}</span>.
                </p>
              </div>

              <div className="rounded-2xl p-space-lg bg-surface-tint-blue flex items-start gap-space-md shadow-[0_4px_16px_-2px_rgba(6,108,244,0.08)]">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                  <Icon name="verified_user" className="text-[24px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-label-md text-label-md text-primary font-bold">
                    Institutional Safeguard Guaranteed
                  </h4>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Employees open the invite link to access this business account and sign in with their private
                    6-digit PIN (sent to their email). Staff cannot access your personal banking, settlement
                    schedules, or payout settings.
                  </p>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-md">
                <h4 className="font-heading-sm text-heading-sm text-text-primary">Activation Lifecycle</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                  {ROADMAP_STEPS.map((step) => (
                    <div key={step.title} className="relative flex items-start gap-space-sm">
                      <div
                        className={
                          step.active
                            ? 'absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface-canvas'
                            : 'absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center ring-4 ring-surface-canvas'
                        }
                      >
                        <span
                          className={
                            step.active ? 'w-1.5 h-1.5 rounded-full bg-on-primary' : 'w-1.5 h-1.5 rounded-full bg-text-tertiary'
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-text-primary font-semibold">{step.title}</span>
                        <p className="font-caption text-caption text-text-secondary">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_8px_24px_-4px_rgba(13,37,76,0.06)] p-space-lg flex flex-col gap-space-sm">
                <button
                  type="button"
                  onClick={triggerInvite}
                  className={`w-full h-[54px] rounded-2xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs ${
                    submitState === 'sent'
                      ? 'bg-badge-discount-text text-on-primary'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  } ${submitState === 'sending' ? 'opacity-90 pointer-events-none' : ''}`}
                >
                  <span>{submitLabel}</span>
                  <Icon
                    name={submitIcon}
                    className={`text-[20px] ${submitState === 'sending' ? 'animate-spin' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  className="w-full h-[48px] rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-all flex items-center justify-center gap-space-2xs"
                >
                  <Icon name="bookmark_border" className="text-[18px]" />
                  <span>Save Draft</span>
                </button>
                <p className="font-caption text-caption text-center text-text-tertiary pt-1">
                  Protected by NDPR and Enterprise Merchant Operating Security standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Staff Role — the owner names the role before the preset is applied */}
      {customRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirmCustomRole();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Name the custom staff role"
            className="w-full max-w-md bg-surface-canvas rounded-2xl shadow-2xl p-space-xl flex flex-col gap-space-md"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-sm min-w-0">
                <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <Icon name="tune" className="text-[20px]" />
                </span>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Custom Staff Role</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Name this role — e.g. &quot;Shift Supervisor&quot;. You can tune its permissions next.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCustomRoleOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle shrink-0"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <label className="flex flex-col gap-space-2xs">
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">Role name</span>
              <input
                autoFocus
                value={customRoleDraft}
                onChange={(event) => setCustomRoleDraft(event.target.value)}
                placeholder="e.g. Shift Supervisor"
                maxLength={40}
                className="w-full h-11 px-4 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md placeholder:text-text-tertiary outline-none focus:bg-surface-canvas focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </label>

            <div className="flex items-center gap-space-sm pt-space-2xs">
              <button
                type="button"
                onClick={() => setCustomRoleOpen(false)}
                className="flex-1 h-11 rounded-xl bg-surface-subtle hover:bg-surface-container text-text-secondary font-button-secondary text-button-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={customRoleDraft.trim().length < 2}
                className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-button-primary text-button-primary transition-all disabled:opacity-40"
              >
                Save Role
              </button>
            </div>
          </form>
        </div>
      )}
    </EnterpriseShell>
  );
}
