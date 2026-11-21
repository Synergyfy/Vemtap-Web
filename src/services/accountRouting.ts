import { isBusinessDesignated, isBusinessRole, type SessionUser } from './sessionService';

export type AccountDestination = 'admin' | 'business' | 'customer';

/**
 * Normalizes the role values returned by the API. The database uses both
 * `ADMIN` and `Admin`, while older tokens used `SUPER_ADMIN`.
 */
export function normalizeRole(role?: string | null): string {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'superadmin';
}

/**
 * The only authoritative source is the authenticated account returned by the
 * backend. A missing/unknown role or a suspended/inactive account is NOT a
 * customer: callers must fail closed to sign-in instead of guessing.
 */
export function resolveAccountDestination(
  user?: SessionUser | null,
): AccountDestination | null {
  if (!user) return null;

  const status = String(user.status ?? '')
    .trim()
    .toLowerCase();
  if (status === 'suspended' || status === 'inactive') return null;

  if (isAdminRole(user.role)) return 'admin';

  if (isBusinessRole(user.role) || isBusinessDesignated(user)) return 'business';

  const role = normalizeRole(user.role);
  if (role === 'customer' || role === 'user') return 'customer';

  return null;
}
