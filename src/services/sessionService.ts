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
  roleTag?: string | null;
  permissions?: string[] | null;
  status?: string;
  businessId?: string | null;
  branchId?: string | null;
  business?: { id: string; name?: string | null; uniqueCode?: string | null } | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

const BUSINESS_ROLES: UserRole[] = ['Owner', 'Manager', 'Staff'];

export const isBusinessRole = (role?: string | null) => Boolean(role && BUSINESS_ROLES.includes(role as UserRole));

/** Owners and admins pass every permission check; others need the permission string. */
export const hasPermission = (user: SessionUser | undefined, permission: string) =>
  Boolean(user && (user.role === 'Owner' || user.role === 'Admin' || user.role === 'SUPER_ADMIN' || user.permissions?.includes(permission)));

export const sessionService = {
  profile: () => api.get<SessionUser>('/auth/profile'),
};
