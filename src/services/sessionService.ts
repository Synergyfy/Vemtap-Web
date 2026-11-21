import { api } from './api/client';

export type UserRole = 'USER' | 'SUPER_ADMIN' | 'Owner' | 'Manager' | 'Staff' | 'Admin' | 'Customer' | 'Agent';

/** `GET /auth/profile` — only the fields the web uses are typed. */
export interface SessionUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  /** Owner in the DB, even while the token is scoped to the customer shell. */
  isOwnerAccount?: boolean;
  /** The account's business-side role, whatever shell the token is scoped to. */
  businessRole?: 'Owner' | 'Manager' | 'Staff' | null;
  /** A business exists for this account, even on a customer token. */
  hasBusiness?: boolean;
  /** The shell a dual-role account last used. */
  lastActiveShell?: 'customer' | 'business' | null;
  roleTag?: string | null;
  /** Owner-assigned staff label, when the account is a team member. */
  jobTitle?: string | null;
  permissions?: string[] | null;
  status?: string;
  businessId?: string | null;
  branchId?: string | null;
  business?: { id: string; name?: string | null; uniqueCode?: string | null } | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  /** `GOOGLE` accounts have no PIN or password. */
  authProvider?: 'LOCAL' | 'GOOGLE';
}

const BUSINESS_ROLES: UserRole[] = ['Owner', 'Manager', 'Staff'];

export const isBusinessRole = (role?: string | null) => Boolean(role && BUSINESS_ROLES.includes(role as UserRole));

/**
 * The account's business designation makes the business its only operating
 * shell: these accounts never act as consumers.
 */
export const isBusinessDesignated = (user?: SessionUser | null): boolean =>
  Boolean(user && (user.businessRole || user.hasBusiness || (isBusinessRole(user.role) && user.businessId)));

/** Owners and admins pass every permission check; others need the permission string. */
export const hasPermission = (user: SessionUser | undefined, permission: string) =>
  Boolean(user && (user.role === 'Owner' || user.role === 'Admin' || user.role === 'SUPER_ADMIN' || user.permissions?.includes(permission)));

export const sessionService = {
  profile: () => api.get<SessionUser>('/auth/profile'),
};
