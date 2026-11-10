/**
 * Admin Authentication State & Session Management
 *
 * Live API: the admin is the signed-in Vemtap account (`/auth/profile`) whose role is
 * `Admin` or `SUPER_ADMIN`. The localStorage session below is only for mock mode.
 */
import type { SessionUser } from '../../services/sessionService';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Super Admin' | 'Admin' | 'Compliance Officer' | 'Operations Manager' | 'Support Lead';
  permissions: string[];
  avatarUrl?: string;
}

export const SUPER_ADMIN_USER: AdminUser = {
  id: 'adm_001',
  name: 'Michael O.',
  email: 'michael.o@vemtap.com',
  initials: 'MO',
  role: 'Super Admin',
  permissions: ['all', 'manage_businesses', 'manage_customers', 'manage_finances', 'system_config'],
};

const ADMIN_SESSION_KEY = 'vemtap_admin_session';

export function getAdminSession(): AdminUser | null {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminSession(user: AdminUser): void {
  try {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch {
    // storage fallback
  }
}

export function clearAdminSession(): void {
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // storage fallback
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}


/** Roles the backend lets through its admin endpoints. */
export const isPlatformAdminRole = (role?: string | null) => role === 'Admin' || role === 'SUPER_ADMIN';

/** The signed-in admin account, shaped for the admin shell header. */
export function adminUserFromSession(user: SessionUser): AdminUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';
  return {
    id: user.id,
    name,
    email: user.email,
    initials,
    role: user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin',
    permissions: user.permissions ?? [],
    avatarUrl: user.avatar ?? undefined,
  };
}
