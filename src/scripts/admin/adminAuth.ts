/**
 * Admin Authentication State & Session Management
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Super Admin' | 'Compliance Officer' | 'Operations Manager' | 'Support Lead';
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

