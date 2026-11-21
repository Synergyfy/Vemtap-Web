import type { TeamMember } from '../services/teamService';
import { toPageIds } from './staffPageAccess';

/**
 * Shared live-team helpers. Page permission mapping now lives in
 * `staffPageAccess`, which derives its tree from the business side menu.
 */
export {
  ALL_STAFF_PAGE_IDS,
  PAGE_PERMISSIONS,
  STAFF_PAGE_DEFAULTS,
  STAFF_PAGE_NODE_BY_ID,
  STAFF_PAGE_TREE,
  canAccessPage,
  grantedPageLabels,
  sessionRoleLabel,
  toApiPermissions,
  toPageIds,
  toPermissionMap,
} from './staffPageAccess';

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

const ROLE_FALLBACKS = new Set(['staff', 'custom']);

/** The owner-assigned label, falling back to `Staff` when no label exists. */
export const memberRoleLabel = (member: TeamMember) => {
  if (isOwnerMember(member)) return 'Owner';
  const label = member.jobTitle || member.roleTag || member.role;
  if (!label || ROLE_FALLBACKS.has(label.trim().toLowerCase())) return 'Staff';
  return label.trim();
};

/** Which directory filter a member belongs under. */
export const memberRoleGroup = (member: TeamMember): 'owners' | 'managers' | 'cashiers' | 'staff' => {
  if (isOwnerMember(member)) return 'owners';
  if (member.role === 'Manager') return 'managers';
  if (/cashier/i.test(`${member.roleTag ?? ''} ${member.jobTitle ?? ''}`)) return 'cashiers';
  return 'staff';
};

/** Count of side-menu pages this member's stored permissions unlock. */
export const memberGrantedPageCount = (member: TeamMember) => toPageIds(member.permissions).length;
