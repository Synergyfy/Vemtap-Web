import type { TeamMember } from '../services/teamService';

/**
 * Shared mapping between the staff screens' page permissions and the
 * backend's `StaffPermission` values, plus display values for live members.
 */

/** Each page toggle on the invite/permission screens → backend permissions. */
export const PAGE_PERMISSIONS: Record<string, string[]> = {
  overview: ['dashboard'],
  orders: ['pos:orders'],
  pos: ['pos'],
  messages: ['messages'],
  catalog: ['inventory'],
  deals: ['marketing'],
  loyalty: ['visitors:loyalty'],
  boost: ['discovery'],
  customers: ['visitors'],
  staff: ['staff'],
  locations: ['settings'],
  profile: ['settings:profile'],
  analytics: ['analytics'],
  subscription: ['settings:subscription'],
  verification: ['settings:compliance'],
  more: ['settings'],
};

export const toApiPermissions = (pageIds: string[]) => [
  ...new Set(pageIds.flatMap((id) => PAGE_PERMISSIONS[id] ?? [])),
];

/** Page toggles a member's stored permissions switch on. */
export const toPageIds = (permissions: string[] | null | undefined) => {
  const granted = new Set(permissions ?? []);
  return Object.entries(PAGE_PERMISSIONS)
    .filter(([, needed]) => needed.every((permission) => granted.has(permission)))
    .map(([id]) => id);
};

/**
 * The backend keeps Manager vs Staff; the chosen preset or custom title is
 * stored as the role tag. Owners can't be invited, so the Owner preset makes a
 * manager with full access.
 */
export const inviteRole = (preset: string, label: string) =>
  preset === 'owner' || preset === 'manager' ? 'manager' : label || 'staff';

export const memberName = (member: TeamMember) =>
  [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || 'Team member';

export const memberInitials = (member: TeamMember) =>
  memberName(member)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const isOwnerMember = (member: TeamMember) => member.role === 'Owner';

export const isPendingMember = (member: TeamMember) => member.status === 'Invited' || member.status === 'Pending';

export const memberRoleLabel = (member: TeamMember) =>
  member.jobTitle || member.roleTag || member.role || 'Staff';

/** Which directory filter a member belongs under. */
export const memberRoleGroup = (member: TeamMember): 'owners' | 'managers' | 'cashiers' | 'staff' => {
  if (isOwnerMember(member)) return 'owners';
  if (member.role === 'Manager') return 'managers';
  if (/cashier/i.test(`${member.roleTag ?? ''} ${member.jobTitle ?? ''}`)) return 'cashiers';
  return 'staff';
};
