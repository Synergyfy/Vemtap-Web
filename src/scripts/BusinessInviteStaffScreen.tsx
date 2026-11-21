import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';
import { URBAN_BUSINESS } from './businessData';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { useProgressiveAccordion } from '../hooks/useProgressiveAccordion';
import { useBranches, useTeamMutations } from '../hooks/business/useBranchesAndTeam';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import { hasApiConfig } from '../services/api/client';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import {
  ALL_STAFF_PAGE_IDS,
  STAFF_PAGE_DEFAULTS,
  STAFF_PAGE_TREE,
  inviteRole,
  toApiPermissions,
  toPermissionMap,
} from './teamLive';

interface BusinessInviteStaffScreenProps {
  onBack: () => void;
}

type Channel = 'email' | 'whatsapp' | 'sms';
type RoleKey = 'owner' | 'manager' | 'staff' | 'cashier';
type RoleMode = 'preset' | 'custom';

const SECTIONS = [
  { title: '1. Contact Identity & Channel', sub: 'Who you are inviting', icon: 'badge' },
  { title: '2. Role Preset & Authority Tier', sub: 'Preset role or your own title', icon: 'admin_panel_settings' },
  { title: '3. Page Access Permissions', sub: 'Pages they can open', icon: 'admin_panel_settings' },
  { title: '4. Operating Branch Assignment', sub: 'Where they work', icon: 'store' },
  { title: '5. Staff Security', sub: 'Set their 6-digit sign-in PIN', icon: 'lock' },
  { title: '6. Send Invitation', sub: 'Review the pre-filled message', icon: 'send' },
];

const CHANNELS: { key: Channel; label: string; icon: string }[] = [
  { key: 'email', label: 'Email', icon: 'mail' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { key: 'sms', label: 'SMS', icon: 'sms' },
];

const ROLES: { key: RoleKey; label: string; desc: string; icon: string }[] = [
  { key: 'owner', label: 'Owner', desc: 'Full control including billing and team access', icon: 'workspace_premium' },
  { key: 'manager', label: 'Manager', desc: 'Runs daily operations across assigned branches', icon: 'badge' },
  { key: 'staff', label: 'Staff', desc: 'Floor service, orders and guest updates', icon: 'person' },
  { key: 'cashier', label: 'Cashier', desc: 'POS checkout, refunds and daily reports', icon: 'point_of_sale' },
];

const BRANCHES = ['Wuse 2', 'Maitama', 'Lekki Phase 1'];

const INVITE_LINK = `https://vemtap.com/join/${URBAN_BUSINESS.slug}?invite=VT48Q2K`;

const fieldClass =
  'w-full h-10 px-space-sm rounded-xl bg-surface-container-low text-text-primary font-label-sm text-label-sm placeholder:text-text-tertiary outline-none focus:bg-surface-canvas border border-border-subtle';

const pinFieldClass =
  'w-full h-10 px-space-sm rounded-xl bg-surface-canvas text-text-primary font-label-md text-label-md tracking-[0.3em] placeholder:tracking-normal placeholder:text-text-tertiary outline-none border-2 border-outline-variant focus:border-primary-container focus:ring-4 focus:ring-primary-container/15 transition-all shadow-sm';

const cardClass = 'bg-surface-canvas rounded-2xl p-space-sm shadow-sm';

const stepTitleClass = 'font-label-md text-label-md text-text-primary font-semibold';

export function BusinessInviteStaffScreen({ onBack }: BusinessInviteStaffScreenProps) {
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

  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    toPermissionMap(STAFF_PAGE_DEFAULTS.staff),
  );
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const [channel, setChannel] = useState<Channel>('email');
  const [message, setMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Live: real branches (one per member: the backend keeps a single branch),
  // and the invite is emailed with the PIN set here.
  const live = hasApiConfig();
  const branchList = useBranches();
  const { activeBranchId } = useBusinessBranch();
  const { invite } = useTeamMutations();
  const businessName = useMyBusiness().data?.name;
  const apiBranches = (branchList.data ?? []).filter((branch) => branch.isActive !== false);
  const branchOptions = live ? apiBranches.map((branch) => branch.name) : BRANCHES;
  const branchIdFor = (branchName: string) => apiBranches.find((branch) => branch.name === branchName)?.id;
  const inviteLink = live ? window.location.origin : INVITE_LINK;
  const lastName = name.trim().split(/\s+/).slice(1).join(' ');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').length >= 7;
  const roleLabel =
    roleMode === 'preset' ? ROLES.find((option) => option.key === role)?.label ?? '' : customRole.trim();
  const enabledCount = ALL_STAFF_PAGE_IDS.filter((id) => permissions[id]).length;
  const firstName = name.trim().split(/\s+/)[0] ?? '';

  const contactComplete = name.trim().length > 1 && (!live || lastName.length > 0) && emailOk;
  const roleComplete = roleMode === 'preset' || customRole.trim().length > 1;
  const permissionsComplete = enabledCount > 0;
  const branchComplete = (!live && selectedBranches.length > 0) || (live && Boolean(branchIdFor(selectedBranches[0])));
  const securityComplete = pin.length === 6 && pin === confirmPin;
  const inviteComplete = message.trim().length > 10 && (channel === 'email' ? emailOk : phoneOk);
  const completedSections = [
    contactComplete,
    roleComplete,
    permissionsComplete,
    branchComplete,
    securityComplete,
    inviteComplete,
  ];
  const { activeIndex, highestAvailable, reveal } = useProgressiveAccordion(completedSections);

  const buildMessage = () => {
    const greeting = firstName || 'there';
    return [
      `Hi ${greeting}, click the link below to join ${live ? businessName ?? 'our team' : URBAN_BUSINESS.name} as ${roleLabel || 'a team member'}.`,
      inviteLink,
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
    if (activeIndex === SECTIONS.length - 1 && !messageEdited) setMessage(buildMessage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

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

  // Live: start on the active branch once branches have loaded.
  useEffect(() => {
    if (!live || !apiBranches.length) return;
    setSelectedBranches((current) => {
      if (current.length === 1 && branchIdFor(current[0])) return current;
      const active = apiBranches.find((branch) => branch.id === activeBranchId) ?? apiBranches[0];
      return [active.name];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, branchList.data, activeBranchId]);

  const showToast = (text: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const sectionHint = (index: number) => {
    switch (index) {
      case 0:
        if (name.trim().length <= 1 || (live && !lastName)) return 'Enter the full name of your teammate.';
        if (!emailOk) return 'Enter a valid email address.';
        return 'Contact details are ready.';
      case 1:
        return roleMode === 'preset'
          ? 'Preset roles arrive with pre-selected permissions.'
          : 'Type the role you want to give this staff member.';
      case 2:
        return `${enabledCount} of ${ALL_STAFF_PAGE_IDS.length} pages enabled.`;
      case 3:
        if (live) return selectedBranches.length ? `Works at ${selectedBranches[0]}.` : 'Select their branch.';
        return selectedBranches.length
          ? `${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''} selected.`
          : 'Select at least one branch.';
      case 4:
        if (pin.length < 6) return 'Set a 6-digit PIN — you are creating it on their behalf.';
        if (pin !== confirmPin) return 'PINs do not match.';
        return 'You set the PIN, they receive it on their registered email.';
      default:
        if (channel !== 'email' && !phoneOk) return 'Add a phone number in step 1 to use WhatsApp or SMS.';
        return channel === 'email'
          ? `Delivered to ${email.trim()} — PIN goes to the same inbox.`
          : `Sent to ${phone.trim()} — PIN goes to ${email.trim()}.`;
    }
  };

  const sendInvite = () => {
    if (sending || sent) return;
    if (!completedSections.every(Boolean)) return;
    if (live) {
      const branchId = branchIdFor(selectedBranches[0]);
      if (!branchId) return showToast('Choose the branch they will work at.');
      setSending(true);
      invite.mutate(
        {
          firstName: name.trim().split(/\s+/)[0],
          lastName,
          email: email.trim(),
          phone: phone.trim() || undefined,
          role: inviteRole(roleMode === 'preset' ? role : 'custom', roleLabel),
          jobTitle: roleMode === 'custom' ? customRole.trim() : undefined,
          permissions: toApiPermissions(ALL_STAFF_PAGE_IDS.filter((id) => permissions[id])),
          branchId,
          pin,
        },
        {
          onSuccess: () => {
            setSending(false);
            setSent(true);
            showToast(`Invitation sent to ${name.trim().split(' ')[0]} by email`);
            window.setTimeout(onBack, 1800);
          },
          onError: (error) => {
            setSending(false);
            showToast(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not send the invite.'));
          },
        },
      );
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      showToast(`Invitation sent to ${name.trim().split(' ')[0]} via ${CHANNELS.find((item) => item.key === channel)?.label}`);
      window.setTimeout(onBack, 1800);
    }, 900);
  };

  const selectRole = (key: RoleKey) => {
    setRole(key);
    setPermissions(toPermissionMap(STAFF_PAGE_DEFAULTS[key]));
    reveal(2);
  };

  const togglePermission = (id: string) => {
    setPermissions((current) => ({ ...current, [id]: !current[id] }));
    reveal(3);
  };

  const toggleAllPermissions = () => {
    setPermissions(toPermissionMap(enabledCount === ALL_STAFF_PAGE_IDS.length ? [] : ALL_STAFF_PAGE_IDS));
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

  const toggleBranch = (branch: string) => {
    if (live) setSelectedBranches([branch]);
    else
      setSelectedBranches((current) =>
        current.includes(branch) ? current.filter((item) => item !== branch) : [...current, branch],
      );
    reveal(4);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast('Invite link copied');
    } catch {
      showToast('Copy failed — select the link instead');
    }
  };

  const renderContinue = (index: number, label: string) => (
    <button
      className={`h-10 w-full rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-all ${
        completedSections[index]
          ? 'bg-primary-container text-on-primary shadow-sm active:scale-95'
          : 'bg-surface-container-highest text-text-tertiary'
      }`}
      disabled={!completedSections[index]}
      onClick={() => reveal(index + 1)}
      type="button"
    >
      <span>{label}</span>
      <Icon name="arrow_forward" className="text-[15px]" />
    </button>
  );

  const renderAccordion = (index: number, body: ReactNode, trailing?: ReactNode) => {
    const open = activeIndex === index;
    const locked = index > highestAvailable;
    const done = completedSections[index];
    const section = SECTIONS[index];
    return (
      <section key={`invite-section-${index}`} className={cardClass}>
        <button
          aria-controls={`mobile-invite-section-${index}`}
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-space-xs rounded-xl p-space-xs text-left transition-colors ${
            open
              ? 'bg-surface-tint-blue'
              : done
                ? 'bg-surface-container-low'
                : 'bg-surface-container-lowest'
          } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          disabled={locked}
          onClick={() => reveal(index)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-space-xs">
            <span
              className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                open || done ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-text-secondary'
              }`}
            >
              <Icon name={section.icon} className="text-[16px]" />
            </span>
            <span className="min-w-0">
              <span className="block font-label-sm text-label-sm font-semibold text-text-primary truncate">
                {section.title}
              </span>
              <span className="block font-caption text-caption text-text-secondary truncate">{section.sub}</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {trailing}
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center ${
                done ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
              }`}
            >
              <Icon name={done ? 'check_circle' : locked ? 'lock' : 'expand_more'} className="text-[14px]" />
            </span>
          </span>
        </button>
        {open && (
          <div className="pt-space-xs" id={`mobile-invite-section-${index}`}>
            {body}
          </div>
        )}
      </section>
    );
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
      {renderContinue(0, 'Continue to role')}
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
                      {STAFF_PAGE_DEFAULTS[option.key].length} pages
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
            permissions next.
          </p>
        </section>
      )}
      {renderContinue(1, 'Continue to permissions')}
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-tertiary">
          {enabledCount} of {ALL_STAFF_PAGE_IDS.length} pages allowed
        </span>
        <button
          className="font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
          type="button"
          onClick={toggleAllPermissions}
        >
          {enabledCount === ALL_STAFF_PAGE_IDS.length ? 'Clear all' : 'Select all'}
        </button>
      </div>

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
          <section key={section.id}>
            <button
              className="w-full flex items-center justify-between gap-space-xs py-2 px-1.5 text-left"
              type="button"
              onClick={() => toggleSection(toggleIds, allGranted)}
            >
              <span className="min-w-0 flex-1 flex items-center gap-space-xs">
                <Icon name={section.icon ?? 'folder'} className="text-[15px] text-primary shrink-0" />
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                  {section.label}
                </span>
              </span>
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  allGranted ? 'bg-primary border-primary' : 'bg-surface-canvas border-outline-variant'
                }`}
              >
                {allGranted ? (
                  <Icon name="check" className="text-on-primary text-[13px]" />
                ) : someGranted ? (
                  <span className="w-2 h-0.5 rounded bg-primary" />
                ) : null}
              </span>
            </button>
            {section.children.length > 0 && (
              <div className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm divide-y divide-border-subtle pl-space-md">
                {section.children.map((item) => {
                  const checked = Boolean(permissions[item.id]);
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
                            <Icon name={item.icon ?? 'chevron_right'} className="text-[15px] text-text-secondary shrink-0" />
                            <span className="font-label-sm text-label-sm text-text-primary truncate">{item.label}</span>
                          </span>
                          {item.description && (
                            <span className="font-caption text-caption text-text-tertiary block truncate mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      {renderContinue(2, 'Continue to branch')}
    </div>
  );

  const renderBranches = () => (
    <div className="space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption text-text-tertiary">
          {selectedBranches.length} of {branchOptions.length} selected
        </span>
        {!live && (
          <button
            className="font-label-sm text-label-sm text-primary active:scale-95 transition-transform"
            type="button"
            onClick={() => setSelectedBranches(selectedBranches.length === BRANCHES.length ? [] : [...BRANCHES])}
          >
            {selectedBranches.length === BRANCHES.length ? 'Clear all' : 'Select all'}
          </button>
        )}
      </div>
      <section className={cardClass}>
        <div className="flex flex-wrap gap-1.5">
          {branchOptions.map((branch) => {
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
      {renderContinue(3, 'Continue to security')}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-space-sm">
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
              className={pinFieldClass}
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit PIN"
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary">Confirm PIN</span>
            <input
              autoComplete="new-password"
              className={pinFieldClass}
              inputMode="numeric"
              maxLength={6}
              placeholder="Repeat PIN"
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
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
      {renderContinue(4, 'Review invitation')}
    </div>
  );

  const renderSend = () => (
    <div className="space-y-space-sm">
      <section>
        <h3 className={stepTitleClass}>Send via</h3>
        <div className="grid grid-cols-3 gap-space-xs mt-space-xs">
          {CHANNELS.map((option) => {
            const active = channel === option.key;
            // Live: invites go out by email only.
            const locked = option.key !== 'email' && (live || !phoneOk);
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
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className={stepTitleClass}>Invite link</h3>
          <span className="font-caption text-caption text-text-tertiary">
            {live ? 'Sign in with email + PIN' : 'Expires in 48 hours'}
          </span>
        </div>
        <div className={`${cardClass} mt-space-xs flex items-center gap-space-xs`}>
          <span className="w-9 h-9 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name="link" className="text-[16px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-label-sm text-label-sm text-text-primary block truncate">{inviteLink}</span>
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
          <h3 className={stepTitleClass}>Invite message</h3>
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
          pre-filled with the invite link and PIN instructions. Tap to edit before sending.
        </p>
      </section>

      {!live && (
        <section className="rounded-xl bg-badge-discount-bg p-space-xs flex items-start gap-space-xs">
          <Icon name="verified_user" className="text-badge-discount-text text-[16px] shrink-0 mt-0.5" />
          <p className="font-caption text-caption text-on-surface leading-relaxed">
            Invitations expire after 48 hours. You can revoke access any time from Staff &amp; Team Access, and every
            permission change is logged.
          </p>
        </section>
      )}

      <button
        className={`h-11 w-full rounded-xl font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all ${
          inviteComplete && !sending && !sent
            ? 'bg-primary-container text-on-primary shadow-md active:scale-95'
            : 'bg-surface-container-highest text-text-tertiary'
        }`}
        disabled={!inviteComplete || sending || sent}
        onClick={sendInvite}
        type="button"
      >
        <Icon name={sending ? 'hourglass_top' : sent ? 'check_circle' : 'send'} className="text-[16px]" />
        <span>{sending ? 'Sending…' : sent ? 'Sent' : 'Send invitation'}</span>
      </button>
    </div>
  );

  const renderSections = () =>
    SECTIONS.map((_, index) => {
      switch (index) {
        case 0:
          return renderAccordion(0, renderContact());
        case 1:
          return renderAccordion(1, renderRole());
        case 2:
          return renderAccordion(2, renderPermissions(), (
            <span className="font-caption text-caption text-text-tertiary">{enabledCount} pages</span>
          ));
        case 3:
          return renderAccordion(3, renderBranches());
        case 4:
          return renderAccordion(4, renderSecurity());
        default:
          return renderAccordion(5, renderSend(), (
            <span className="font-caption text-caption text-text-tertiary">Pre-filled</span>
          ));
      }
    });

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
                  Step {activeIndex + 1} of {SECTIONS.length} · {SECTIONS[activeIndex].title}
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
              {SECTIONS.map((section, index) => (
                <span
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    completedSections[index]
                      ? 'bg-primary'
                      : index === activeIndex
                        ? 'bg-primary/50'
                        : 'bg-surface-container-highest'
                  }`}
                  key={section.title}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-margin py-space-sm">
            <p className="font-caption text-caption text-text-secondary mb-space-xs">{sectionHint(activeIndex)}</p>
            <div className="space-y-space-sm">{renderSections()}</div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-[70] pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
