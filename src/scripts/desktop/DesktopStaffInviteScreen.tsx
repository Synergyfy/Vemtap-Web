import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';
import { useBranches, useTeamMutations } from '../../hooks/business/useBranchesAndTeam';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { useProgressiveAccordion } from '../../hooks/useProgressiveAccordion';
import { hasApiConfig } from '../../services/api/client';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import {
  ALL_STAFF_PAGE_IDS,
  STAFF_PAGE_DEFAULTS,
  STAFF_PAGE_TREE,
  inviteRole,
  toApiPermissions,
  toPermissionMap,
} from '../teamLive';

interface DesktopStaffInviteScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack?: () => void;
}

type Channel = 'email' | 'whatsapp';
type RolePreset = 'manager' | 'cashier' | 'service' | 'custom';
type SubmitState = 'idle' | 'sending' | 'sent';

/** Single-use invite link the staff member taps to join this business. */
const INVITE_LINK = 'https://vemtap.com/join/urban-grill-bistro-104?invite=VT48Q2K';

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

const INVITE_SECTIONS = [
  {
    title: '1. Contact Identity & Channel',
    subtitle: 'Basic credentials to issue credentials and passkeys',
    icon: 'badge',
  },
  {
    title: '2. Role Preset & Authority Tier',
    subtitle: 'Determines till permissions, scanner scope, and access levels',
    icon: 'admin_panel_settings',
  },
  {
    title: '3. Page Access Permissions',
    subtitle: 'Choose the dashboard pages this staff member can open',
    icon: 'admin_panel_settings',
  },
  {
    title: '4. Operating Branch Assignment',
    subtitle: 'Ties till sessions and audit logs to a physical location',
    icon: 'store',
  },
  {
    title: '5. Staff Security',
    subtitle: 'Create the 6-digit PIN they will sign in with',
    icon: 'lock',
  },
  {
    title: '6. Send Invitation',
    subtitle: 'Review the pre-filled invite message and deliver it',
    icon: 'send',
  },
] as const;

export function DesktopStaffInviteScreen({ onNav, onBack }: DesktopStaffInviteScreenProps) {
  // Live: a blank form, the real branches, and the invite emailed with the PIN set here.
  const live = hasApiConfig();
  const [channel, setChannel] = useState<Channel>('email');
  const [rolePreset, setRolePreset] = useState<RolePreset>('cashier');
  const [fullName, setFullName] = useState(live ? '' : 'Babatunde Adeleke');
  const [workEmail, setWorkEmail] = useState(live ? '' : 'babatunde.a@example.com');
  const [phone, setPhone] = useState(live ? '' : '+234 809 123 4567');
  const [branchIndex, setBranchIndex] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  // Page permissions the owner grants to this staff member.
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    toPermissionMap(STAFF_PAGE_DEFAULTS.cashier),
  );
  // Preset 6-digit PIN created on the staff member's behalf — emailed to them.
  const [pin, setPin] = useState(live ? '' : '482913');
  const [confirmPin, setConfirmPin] = useState(live ? '' : '482913');
  const [showPin, setShowPin] = useState(false);
  // Preset invite message — editable before sending.
  const [message, setMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);
  // Custom Staff Role — the owner types the role name in a modal before the preset applies.
  const [customRoleOpen, setCustomRoleOpen] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleDraft, setCustomRoleDraft] = useState('');

  const branchList = useBranches();
  const { activeBranchId } = useBusinessBranch();
  const { invite } = useTeamMutations();
  const businessName = useMyBusiness().data?.name;
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };
  const liveBranches = (branchList.data ?? []).filter((branch) => branch.isActive !== false);
  const branchOptions = live
    ? liveBranches.map((branch) => [branch.name, branch.address].filter(Boolean).join(' - '))
    : BRANCH_OPTIONS;
  const quickPresets = live ? liveBranches.slice(0, 4).map((branch) => branch.name) : QUICK_PRESETS;
  const inviteLink = live ? window.location.origin : INVITE_LINK;

  // Live: start on the active branch.
  useEffect(() => {
    if (!live || !liveBranches.length) return;
    const index = liveBranches.findIndex((branch) => branch.id === activeBranchId);
    setBranchIndex(index >= 0 ? index : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, branchList.data, activeBranchId]);

  const enabledCount = ALL_STAFF_PAGE_IDS.filter((id) => permissions[id]).length;
  const firstName = fullName.trim().split(/\s+/)[0] ?? '';
  const roleLabel =
    rolePreset === 'custom' && customRoleName.trim() ? customRoleName.trim() : PRESET_BADGES[rolePreset];
  const pinOk = pin.length === 6 && pin === confirmPin;

  const buildMessage = () =>
    [
      `Hi ${firstName || 'there'}, click the link below to join ${live ? businessName ?? 'our team' : 'Urban Grill & Bistro'} as ${roleLabel}.`,
      inviteLink,
      `Your 6-digit PIN has been sent to your registered email ${workEmail.trim() || 'your email on file'}. Check your email for the PIN, then open the link to log in.`,
    ].join('\n\n');

  // Keep the preset message in sync with the staff details until the owner edits it.
  useEffect(() => {
    if (!messageEdited) setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, workEmail, roleLabel, messageEdited]);

  const emailOk = /^\S+@\S+\.\S+$/.test(workEmail.trim());
  const lastName = fullName.trim().split(/\s+/).slice(1).join(' ');
  const contactComplete = Boolean(firstName && lastName && emailOk);
  const roleComplete = rolePreset !== 'custom' || Boolean(customRoleName.trim());
  const permissionsComplete = enabledCount > 0;
  const branchComplete = Boolean(branchOptions[branchIndex]);
  const securityComplete = pinOk;
  const inviteComplete = message.trim().length > 10;
  const completedSections = [
    contactComplete,
    roleComplete,
    permissionsComplete,
    branchComplete,
    securityComplete,
    inviteComplete,
  ];
  const { activeIndex, highestAvailable, reveal } = useProgressiveAccordion(completedSections);

  const continueTo = (index: number) => reveal(index);

  const togglePermission = (id: string) => {
    setPermissions((current) => ({ ...current, [id]: !current[id] }));
    reveal(3);
  };

  const toggleSection = (ids: string[], allGranted: boolean) => {
    setPermissions((current) => {
      const next = { ...current };
      ids.forEach((id) => {
        next[id] = !allGranted;
      });
      return next;
    });
    reveal(3);
  };

  const selectRolePreset = (key: RolePreset) => {
    if (key === 'custom') {
      // Custom Staff Role needs a name first — open the modal, then apply.
      setCustomRoleDraft(customRoleName);
      setCustomRoleOpen(true);
      return;
    }
    setRolePreset(key);
    setPermissions(toPermissionMap(STAFF_PAGE_DEFAULTS[key]));
    reveal(2);
  };

  const confirmCustomRole = () => {
    const name = customRoleDraft.trim();
    if (name.length < 2) return;
    setCustomRoleName(name);
    setRolePreset('custom');
    setPermissions(toPermissionMap(STAFF_PAGE_DEFAULTS.custom));
    setCustomRoleOpen(false);
    reveal(2);
  };

  const triggerInvite = () => {
    if (submitState !== 'idle' || !completedSections.every(Boolean)) return;
    if (live) {
      const [first, ...rest] = fullName.trim().split(/\s+/);
      const branch = liveBranches[branchIndex];
      if (!first || !rest.length) return showToast('Enter their first and last name.');
      if (!/^\S+@\S+\.\S+$/.test(workEmail.trim())) return showToast('Enter a valid work email.');
      if (!pinOk) return showToast(pin.length < 6 ? 'Set a 6-digit PIN for them.' : 'PINs do not match.');
      if (!enabledCount) return showToast('Give them access to at least one page.');
      if (!branch) return showToast('Choose the branch they will work at.');
      setSubmitState('sending');
      invite.mutate(
        {
          firstName: first,
          lastName: rest.join(' '),
          email: workEmail.trim(),
          phone: phone.trim() || undefined,
          role: inviteRole(rolePreset, roleLabel),
          jobTitle: rolePreset === 'custom' ? roleLabel : undefined,
          permissions: toApiPermissions(ALL_STAFF_PAGE_IDS.filter((id) => permissions[id])),
          branchId: branch.id,
          pin,
        },
        {
          onSuccess: () => {
            setSubmitState('sent');
            window.setTimeout(() => onBack?.(), 1500);
          },
          onError: (error) => {
            setSubmitState('idle');
            showToast(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not send the invite.'));
          },
        },
      );
      return;
    }
    setSubmitState('sending');
    window.setTimeout(() => {
      setSubmitState('sent');
      window.setTimeout(() => setSubmitState('idle'), 3000);
    }, 1200);
  };

  const submitLabel =
    submitState === 'idle' ? 'Send Invitation' : submitState === 'sending' ? 'Transmitting Token...' : 'Invitation Dispatched!';
  const submitIcon = submitState === 'idle' ? 'send' : submitState === 'sending' ? 'sync' : 'check_circle';

  const renderSectionHeader = (index: number, trailing?: ReactNode) => {
    const section = INVITE_SECTIONS[index];
    const open = activeIndex === index;
    const locked = index > highestAvailable;
    const done = completedSections[index];
    return (
      <button
        aria-controls={`invite-section-${index}`}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-space-sm rounded-xl p-space-sm text-left transition-all ${
          open
            ? 'bg-surface-tint-blue'
            : done
              ? 'bg-surface-container-low hover:bg-surface-container'
              : 'bg-surface-subtle hover:bg-surface-container-low'
        } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        disabled={locked}
        onClick={() => reveal(index)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-space-sm">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              open || done ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-secondary'
            }`}
          >
            <Icon name={section.icon} className="text-[20px]" />
          </span>
          <span className="min-w-0">
            <span className="block font-heading-sm text-heading-sm text-text-primary">{section.title}</span>
            <span className="block font-caption text-caption text-text-secondary">{section.subtitle}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-space-xs">
          {trailing}
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              done ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
            }`}
            aria-label={done ? 'Section complete' : locked ? 'Section locked' : 'Section in progress'}
          >
            <Icon name={done ? 'check_circle' : locked ? 'lock' : 'expand_more'} className="text-[16px]" />
          </span>
        </span>
      </button>
    );
  };

  const renderContinue = (index: number, label: string) => (
    <button
      className="self-start inline-flex h-10 items-center justify-center gap-space-2xs rounded-xl bg-primary-container px-space-md text-on-primary font-label-md text-label-md font-semibold transition-all enabled:hover:bg-primary enabled:hover:text-on-primary disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-text-tertiary"
      disabled={!completedSections[index]}
      onClick={() => continueTo(index + 1)}
      type="button"
    >
      <span>{label}</span>
      <Icon name="arrow_forward" className="text-[16px]" />
    </button>
  );

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
              {activeIndex === 5 && (
                <button
                  type="button"
                  onClick={triggerInvite}
                  disabled={!completedSections.every(Boolean) || submitState !== 'idle'}
                  className={`h-[48px] px-space-xl rounded-xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-space-xs disabled:cursor-not-allowed disabled:opacity-60 ${
                    submitState === 'sent'
                      ? 'bg-badge-discount-text text-on-primary'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  } ${submitState === 'sending' ? 'opacity-90 pointer-events-none' : ''}`}
                >
                  <span>{submitLabel}</span>
                  <Icon name={submitIcon} className={`text-[18px] ${submitState === 'sending' ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col gap-space-xl">
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                {renderSectionHeader(
                  0,
                  !live ? (
                    <span className="px-space-xs py-1 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                      Tier-1 Enrolled
                    </span>
                  ) : undefined,
                )}

                {activeIndex === 0 && (
                  <div className="flex flex-col gap-space-lg" id="invite-section-0">
                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-md text-label-md text-text-primary font-semibold flex items-center justify-between">
                    <span>Full Legal Name</span>
                    {!live && (
                      <span className="text-primary font-caption text-caption font-medium flex items-center gap-1">
                        <Icon name="verified" className="text-[14px]" />
                        Verified ID check
                      </span>
                    )}
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
                    {!live && <Icon name="check_circle" className="absolute right-3.5 text-badge-discount-text text-[20px]" />}
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
                      disabled={live}
                      onClick={() => setChannel('whatsapp')}
                      className={
                        channel === 'whatsapp'
                          ? 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                          : 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-all'
                      }
                    >
                      <Icon name="whatsapp" className="text-[18px]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                  <p className="font-caption text-caption text-text-tertiary">
                    {live
                      ? `Invite emailed to ${workEmail.trim() || 'the work email above'} with their PIN. WhatsApp invites aren't available yet.`
                      : channel === 'email'
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

                  {renderContinue(0, 'Continue to role')}
                  </div>
                )}
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                {renderSectionHeader(
                  1,
                  <span className="font-caption text-caption text-text-tertiary">4 Presets Available</span>,
                )}

                {activeIndex === 1 && (
                  <div className="flex flex-col gap-space-lg" id="invite-section-1">
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

                  {renderContinue(1, 'Continue to permissions')}
                  </div>
                )}
              </div>

              {/* 3. Page permissions — the owner picks which dashboard pages this staff can open */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                {renderSectionHeader(
                  2,
                  <span className="px-space-xs py-1 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold">
                    {enabledCount} of {ALL_STAFF_PAGE_IDS.length} pages
                  </span>,
                )}

                {activeIndex === 2 && (
                  <div className="flex flex-col gap-space-lg" id="invite-section-2">
                <div className="flex flex-col gap-space-md">
                  {STAFF_PAGE_TREE.map((section) => {
                    const childIds = section.children.map((child) => child.id);
                    const allGranted = section.children.length
                      ? childIds.every((id) => permissions[id])
                      : Boolean(permissions[section.id]);
                    const someGranted = section.children.length
                      ? childIds.some((id) => permissions[id])
                      : allGranted;
                    const toggleIds = childIds.length ? childIds : [section.id];
                    return (
                      <div key={section.id} className="flex flex-col gap-space-xs">
                        <button
                          type="button"
                          onClick={() => toggleSection(toggleIds, allGranted)}
                          className={`flex items-center gap-space-sm p-space-sm rounded-xl text-left transition-all ${
                            allGranted
                              ? 'bg-surface-tint-blue shadow-sm'
                              : someGranted
                                ? 'bg-surface-tint-blue/50'
                                : 'bg-surface-subtle opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              allGranted ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-tertiary'
                            }`}
                          >
                            <Icon name={section.icon ?? 'folder'} className="text-[16px]" />
                          </span>
                          <span className="min-w-0 flex-1 font-label-md text-label-md text-text-primary font-semibold">
                            {section.label}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              allGranted ? 'border-primary bg-primary' : 'border-outline-variant'
                            }`}
                          >
                            {allGranted && <Icon name="check" className="text-[12px] text-on-primary" />}
                            {!allGranted && someGranted && <span className="w-2 h-0.5 rounded bg-primary" />}
                          </span>
                        </button>
                        {section.children.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xs pl-space-md">
                            {section.children.map((item) => {
                              const granted = Boolean(permissions[item.id]);
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
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      granted ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-tertiary'
                                    }`}
                                  >
                                    <Icon name={item.icon ?? 'chevron_right'} className="text-[14px]" />
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
                        )}
                      </div>
                    );
                  })}
                </div>

                  {renderContinue(2, 'Continue to branch')}
                  </div>
                )}
              </div>

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                {renderSectionHeader(3, <Icon name="my_location" className="text-text-tertiary" />)}

                {activeIndex === 3 && (
                  <div className="flex flex-col gap-space-lg" id="invite-section-3">
                <div className="flex flex-col gap-space-2xs">
                  <label className="font-label-md text-label-md text-text-primary font-semibold">
                    Operating branch
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="location_on" className="absolute left-3.5 text-primary text-[20px]" />
                    <select
                      className="w-full h-[52px] pl-11 pr-10 rounded-xl bg-surface-subtle text-text-primary font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                      value={branchIndex}
                      onChange={(event) => {
                        setBranchIndex(Number(event.target.value));
                        reveal(4);
                      }}
                    >
                      {branchOptions.map((option, index) => (
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
                    {quickPresets.map((preset, index) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setBranchIndex(index);
                          reveal(4);
                        }}
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

                  {renderContinue(3, 'Continue to security')}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-space-xl">
              {/* 5. Preset 6-digit PIN — created on the staff member's behalf, emailed to them */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_24px_-2px_rgba(13,37,76,0.06)] p-space-xl flex flex-col gap-space-lg">
                {renderSectionHeader(
                  4,
                  <span className="px-space-xs py-1 rounded-lg bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                    {pinOk ? 'PINs match' : 'Both fields required'}
                  </span>,
                )}

                {activeIndex === 4 && (
                  <div className="flex flex-col gap-space-lg" id="invite-section-4">
                <p className="font-caption text-caption text-text-secondary leading-relaxed">
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

                  {renderContinue(4, 'Review invitation')}
                  </div>
                )}
              </div>

              {/* 6. Preset invite message — link + PIN instructions, editable before sending */}
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-md">
                {renderSectionHeader(
                  5,
                  <span className="font-caption text-caption text-text-tertiary">Pre-filled</span>,
                )}

                {activeIndex === 5 && (
                  <div className="flex flex-col gap-space-md" id="invite-section-5">
                <div className="flex justify-end">
                  <button
                    className="font-label-sm text-label-sm text-primary font-semibold hover:underline active:scale-95 transition-transform"
                    type="button"
                    onClick={() => {
                      setMessage(buildMessage());
                      setMessageEdited(false);
                    }}
                  >
                    Reset message
                  </button>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-subtle">
                  <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="link" className="text-[16px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-label-sm text-label-sm text-text-primary block truncate">{inviteLink}</span>
                    <span className="font-caption text-caption text-text-tertiary block">
                      {live ? 'Sign in with email + PIN' : 'Single use · expires in 48 hours'}
                    </span>
                  </span>
                  <button
                    className="h-9 px-space-md rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform shrink-0"
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(inviteLink).catch(() => undefined);
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
                )}
              </div>

              {!live && (
                <>
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
                </>
              )}

              {activeIndex === 5 && (
              <div className="bg-surface-canvas rounded-2xl shadow-[0_8px_24px_-4px_rgba(13,37,76,0.06)] p-space-lg flex flex-col gap-space-sm">
                <button
                  type="button"
                  onClick={triggerInvite}
                  disabled={!completedSections.every(Boolean) || submitState !== 'idle'}
                  className={`w-full h-[54px] rounded-2xl font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:cursor-not-allowed disabled:opacity-60 ${
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
                {!live && (
                  <p className="font-caption text-caption text-center text-text-tertiary pt-1">
                    Protected by NDPR and Enterprise Merchant Operating Security standards.
                  </p>
                )}
              </div>
              )}
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
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {toast}
        </div>
      )}
    </EnterpriseShell>
  );
}
