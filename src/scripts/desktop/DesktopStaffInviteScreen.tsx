import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { BusinessPortalNavKey } from './BusinessPortalChrome';
import { EnterpriseShell } from './EnterpriseShell';

interface DesktopStaffInviteScreenProps {
  onNav: (key: BusinessPortalNavKey) => void;
  onBack?: () => void;
}

type Channel = 'email' | 'sms';
type RolePreset = 'manager' | 'cashier' | 'service' | 'custom';
type SubmitState = 'idle' | 'sending' | 'sent';

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

const ENTITLEMENTS: Array<{
  state: 'granted' | 'disabled' | 'locked';
  title: string;
  tag?: { label: string; labelClass: string };
  body: string;
  bodyClass?: string;
  itemClass?: string;
  iconBoxClass: string;
  icon: string;
  titleClass?: string;
}> = [
  {
    state: 'granted',
    title: 'Scan & Redeem Customer Deal Passes',
    body: 'Validate live QR codes, tap NFC passes & consumer badges.',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'check',
  },
  {
    state: 'granted',
    title: 'Access Tap-to-Pay & POS Terminal',
    body: 'Collect debit cards, instant bank transfers, and VEMTAP wallet payments.',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'check',
  },
  {
    state: 'disabled',
    title: 'Edit Product Prices & Discounts',
    tag: { label: 'Disabled', labelClass: 'text-error font-semibold text-[11px] bg-error-container/40 px-1.5 py-0.2 rounded' },
    body: 'Requires Manager or Administrator privilege tier.',
    bodyClass: 'font-caption text-caption text-text-tertiary',
    itemClass: 'bg-surface-subtle/60 opacity-80',
    iconBoxClass: 'bg-surface-container text-text-tertiary',
    icon: 'block',
    titleClass: 'font-label-md text-label-md text-text-secondary font-medium',
  },
  {
    state: 'locked',
    title: 'View Business Bank & Payouts',
    tag: { label: 'Locked', labelClass: 'text-on-surface-variant font-semibold text-[11px] bg-surface-container px-1.5 py-0.2 rounded' },
    body: 'Strictly restricted to Business Owner and Director roles.',
    bodyClass: 'font-caption text-caption text-text-tertiary',
    itemClass: 'bg-surface-subtle/60 opacity-75',
    iconBoxClass: 'bg-error-container text-error',
    icon: 'lock',
    titleClass: 'font-label-md text-label-md text-text-secondary font-medium',
  },
  {
    state: 'granted',
    title: 'Issue Digital E-Receipts & Lookup Patrons',
    body: 'Retrieve customer membership points and SMS proof of sale.',
    iconBoxClass: 'bg-badge-discount-bg text-badge-discount-text',
    icon: 'check',
  },
];

const ROADMAP_STEPS = [
  {
    title: 'Step 1: Invite dispatched via secure link',
    body: 'Dispatches activation token via encrypted SMS and Work Email.',
    active: true,
  },
  {
    title: 'Step 2: Employee verifies phone & sets 4-digit till PIN',
    body: 'Two-factor passkey creation without accessing master financials.',
    active: false,
  },
  {
    title: 'Step 3: Terminal badge assigned instantly',
    body: 'Ready for fast login on Wuse Branch terminals.',
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

  return (
    <EnterpriseShell onNav={onNav}>
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
                Add an employee to your business. They will receive an invitation email or SMS with activation
                credentials and temporary 4-digit PIN.
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
                      onClick={() => setChannel('sms')}
                      className={
                        channel === 'sms'
                          ? 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg bg-surface-canvas text-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                          : 'flex items-center justify-center gap-space-2xs py-2.5 rounded-lg text-text-secondary hover:text-text-primary font-label-md text-label-md font-medium transition-all'
                      }
                    >
                      <Icon name="sms" className="text-[18px]" />
                      <span>Direct SMS</span>
                    </button>
                  </div>
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
                          onChange={() => setRolePreset(option.key)}
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
                                  {option.title}
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
                                {option.title}
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

              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_20px_-2px_rgba(13,37,76,0.05)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                      <Icon name="store" className="text-[22px]" />
                    </div>
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">
                        3. Operating Branch Assignment
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
              <div className="bg-surface-canvas rounded-2xl shadow-[0_4px_24px_-2px_rgba(13,37,76,0.06)] p-space-xl flex flex-col gap-space-lg">
                <div className="flex items-center justify-between pb-space-xs">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                      Audit Matrix
                    </span>
                    <h3 className="font-heading-sm text-heading-sm text-text-primary">Enforced Entitlements</h3>
                  </div>
                  <div className="px-space-xs py-1 rounded-lg bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                    {PRESET_BADGES[rolePreset]} Preset
                  </div>
                </div>

                <div className="flex flex-col gap-space-md">
                  {ENTITLEMENTS.map((item) => (
                    <div
                      key={item.title}
                      className={`flex items-start gap-space-sm p-space-sm rounded-xl ${item.itemClass ?? 'bg-surface-subtle'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.iconBoxClass}`}
                      >
                        <Icon name={item.icon} className="text-[18px]" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <span className={item.titleClass ?? 'font-label-md text-label-md text-text-primary font-semibold'}>
                            {item.title}
                          </span>
                          {item.tag && <span className={item.tag.labelClass}>{item.tag.label}</span>}
                        </div>
                        <p className={item.bodyClass ?? 'font-caption text-caption text-text-secondary'}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                    Employees authenticate with their verified phone/email and a private 4-digit PIN. Staff cannot
                    access your personal banking, settlement schedules, or payout settings.
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
    </EnterpriseShell>
  );
}
