import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { TextField } from './FormPrimitives';
import { useBranches, useTeam, useTeamMutations } from '../../hooks/business/useBranchesAndTeam';
import type { TeamMember } from '../../services/teamService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatRelativeTime } from '../../utils/format';

/** Top-level areas of `StaffPermission` (backend `invite-staff.dto.ts`). */
const PERMISSIONS: { value: string; label: string; body: string }[] = [
  { value: 'dashboard', label: 'Dashboard', body: 'Overview and daily numbers' },
  { value: 'pos', label: 'Point of sale', body: 'Ring up sales and manage the till' },
  { value: 'inventory', label: 'Catalogue & stock', body: 'Products, services and stock' },
  { value: 'visitors', label: 'Customers', body: 'Customer list, visits and loyalty' },
  { value: 'messages', label: 'Messages', body: 'Reply to customers' },
  { value: 'marketing', label: 'Marketing', body: 'Deals, boosts and campaigns' },
  { value: 'analytics', label: 'Analytics', body: 'Reports and exports' },
  { value: 'staff', label: 'Staff', body: 'Invite and manage team members' },
  { value: 'settings', label: 'Settings', body: 'Business and POS settings' },
];

const DEFAULT_PERMISSIONS = ['dashboard', 'pos'];

const fullName = (m: TeamMember) => [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || 'Team member';

const STATUS_TONE: Record<string, string> = {
  Active: 'bg-badge-discount-bg text-badge-discount-text',
  Invited: 'bg-surface-tint-blue text-primary',
  Pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Suspended: 'bg-error-container text-on-error-container',
  Inactive: 'bg-surface-container text-text-secondary',
};

function MemberRow({ member, branchName }: { member: TeamMember; branchName?: string }) {
  const { resend, remove } = useTeamMutations();
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const isOwner = member.role === 'Owner';
  const status = member.status ?? 'Active';

  return (
    <li className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-canvas border border-border-subtle">
      <div className="flex items-center gap-space-sm">
        <span className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center font-label-md text-label-md font-semibold shrink-0">
          {fullName(member).charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
            {fullName(member)}
            {member.jobTitle || member.roleTag ? <span className="font-normal text-text-secondary"> · {member.jobTitle || member.roleTag}</span> : null}
          </span>
          <span className="font-caption text-caption text-text-secondary truncate">
            {[member.email, branchName].filter(Boolean).join(' · ')}
            {member.lastActive ? ` · active ${formatRelativeTime(member.lastActive)}` : ''}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-label-sm text-[11px] font-semibold shrink-0">{member.role ?? 'Staff'}</span>
        <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_TONE[status] ?? STATUS_TONE.Inactive}`}>{status}</span>
      </div>
      {!isOwner ? (
        <div className="flex flex-wrap items-center gap-space-xs pl-[52px]">
          {status === 'Invited' || status === 'Pending' ? (
            <button
              type="button"
              disabled={resend.isPending}
              onClick={() =>
                resend.mutate(
                  { id: member.id, branchId: member.branchId ?? undefined },
                  { onSuccess: () => setNote('Invite sent again.'), onError: (e) => setNote(apiErrorMessage(e)) },
                )
              }
              className="h-8 px-space-sm rounded-lg text-primary font-label-sm text-label-sm hover:bg-surface-tint-blue disabled:opacity-50"
            >
              Resend invite
            </button>
          ) : null}
          {confirm ? (
            <>
              <span className="font-caption text-caption text-text-secondary">Remove {fullName(member)} from your team?</span>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: member.id, branchId: member.branchId ?? undefined }, { onError: (e) => setNote(apiErrorMessage(e)) })}
                className="h-8 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm"
              >
                Remove
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="h-8 px-space-sm rounded-lg font-label-sm text-label-sm">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="h-8 px-space-sm rounded-lg text-red-600 font-label-sm text-label-sm hover:bg-surface-container">
              Remove
            </button>
          )}
          {note ? <span className="font-caption text-caption text-text-secondary">{note}</span> : null}
        </div>
      ) : null}
    </li>
  );
}

/** Live team directory (`GET /users/team?allBranches=true`). */
export function TeamPanel({ onInvite }: { onInvite: () => void }) {
  const team = useTeam();
  const branches = useBranches();
  if (team.isLoading) return <LoadingRows rows={3} label="Loading team" />;
  if (team.isError) return <ErrorState title="Could not load your team" error={team.error} onRetry={() => team.refetch()} />;

  const members = team.data ?? [];
  const branchName = (id?: string | null) => branches.data?.find((b) => b.id === id)?.name;
  const counts = {
    total: members.length,
    active: members.filter((m) => (m.status ?? 'Active') === 'Active').length,
    invited: members.filter((m) => m.status === 'Invited' || m.status === 'Pending').length,
  };

  return (
    <div className="flex flex-col gap-space-lg max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <div className="grid grid-cols-3 gap-space-sm">
          {[
            { label: 'Team', value: counts.total },
            { label: 'Active', value: counts.active },
            { label: 'Invited', value: counts.invited },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm px-space-md py-space-sm flex flex-col min-w-[96px]">
              <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
              <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onInvite} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
          <Icon name="person_add" className="text-[18px]" /> Invite staff
        </button>
      </div>
      {!members.length ? (
        <EmptyState icon="group" title="No team members yet" body="Invite managers and staff to help run your branches." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} branchName={branchName(member.branchId)} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Invite a manager or staff member to a branch (`POST /users/team/invite`). */
export function InviteStaffForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const branches = useBranches();
  const { invite } = useTeamMutations();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');
  const [jobTitle, setJobTitle] = useState('');
  const [branchId, setBranchId] = useState('');
  const [permissions, setPermissions] = useState<string[]>(DEFAULT_PERMISSIONS);
  const [error, setError] = useState<string | null>(null);
  const branchOptions = branches.data ?? [];
  const chosenBranch = branchId || branchOptions.find((b) => b.isMainBranch)?.id || branchOptions[0]?.id || '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return setError('Enter their first and last name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (!chosenBranch) return setError('Choose the branch they will work at.');
    if (!permissions.length) return setError('Give them access to at least one area.');
    setError(null);
    invite.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        jobTitle: jobTitle.trim() || undefined,
        permissions,
        branchId: chosenBranch,
      },
      { onSuccess: onDone, onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not send the invite.')) },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-space-md max-w-2xl">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <TextField id="inv-first" label="First name" value={firstName} onChange={setFirstName} />
        <TextField id="inv-last" label="Last name" value={lastName} onChange={setLastName} />
        <TextField id="inv-email" label="Email" type="email" value={email} onChange={setEmail} />
        <TextField id="inv-phone" label="Phone (optional)" type="tel" value={phone} onChange={setPhone} />
        <TextField id="inv-title" label="Job title (optional)" value={jobTitle} onChange={setJobTitle} placeholder="e.g. Cashier" />
        <div className="flex flex-col gap-1">
          <label htmlFor="inv-branch" className="font-label-sm text-label-sm text-text-secondary">
            Branch
          </label>
          <select
            id="inv-branch"
            value={chosenBranch}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-11 px-space-sm rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md"
          >
            {branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-space-xs">
        <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Role</span>
        <div className="grid grid-cols-2 gap-space-xs max-w-md" role="radiogroup">
          {(
            [
              { id: 'staff', title: 'Staff', body: 'Works the areas you allow below' },
              { id: 'manager', title: 'Manager', body: 'Runs the branch day to day' },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              onClick={() => setRole(r.id)}
              className={`p-space-sm rounded-lg text-left border ${role === r.id ? 'bg-surface-tint-blue border-primary/50' : 'bg-surface-subtle border-transparent'}`}
            >
              <span className="block font-label-md text-label-md text-text-primary font-semibold">{r.title}</span>
              <span className="block font-caption text-caption text-text-secondary">{r.body}</span>
            </button>
          ))}
        </div>
      </div>
      <fieldset className="flex flex-col gap-space-xs">
        <legend className="font-label-sm text-label-sm text-text-secondary font-semibold mb-space-xs">Access</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
          {PERMISSIONS.map((p) => {
            const checked = permissions.includes(p.value);
            return (
              <label key={p.value} className={`flex items-start gap-space-xs p-space-sm rounded-lg cursor-pointer ${checked ? 'bg-surface-tint-blue' : 'bg-surface-subtle'}`}>
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={checked}
                  onChange={() => setPermissions((current) => (checked ? current.filter((v) => v !== p.value) : [...current, p.value]))}
                />
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary">{p.label}</span>
                  <span className="font-caption text-caption text-text-secondary">{p.body}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="flex gap-space-xs justify-end">
        <button type="button" onClick={onCancel} className="h-11 px-space-md rounded-xl bg-surface-container text-text-primary font-label-md text-label-md">
          Cancel
        </button>
        <button type="submit" disabled={invite.isPending} className="h-11 px-space-lg rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60">
          {invite.isPending ? 'Sending…' : 'Send invite'}
        </button>
      </div>
    </form>
  );
}
