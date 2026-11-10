import type { AdminApiBusiness, AdminApiCluster, AdminApiUser } from '../../services/adminService';
import type { AdminBusiness, AdminCustomer, ClusterNode, VerificationItem } from './adminData';

/**
 * Maps API records onto the shapes the admin screens already render.
 * Anything the backend does not send stays empty ("—", 0 or []), never a sample value.
 */

export const NONE = '—';

export const formatCount = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : NONE;

export const formatNaira = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? `₦${value.toLocaleString()}` : NONE;

export const formatDate = (value: string | null | undefined) => {
  if (!value) return NONE;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? NONE
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

/** "3h ago", "2d ago" — for queue ages. */
export const timeAgo = (value: string | null | undefined) => {
  if (!value) return NONE;
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms) || ms < 0) return NONE;
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const personName = (user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null) =>
  (user && ([user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email)) || NONE;

const initialsOf = (name: string) =>
  name === NONE
    ? '?'
    : name
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

const place = (...parts: Array<string | null | undefined>) => parts.filter(Boolean).join(', ') || NONE;

export function complianceStatusOf(business: Pick<AdminApiBusiness, 'status' | 'isVerified' | 'verificationStatus'>): AdminBusiness['complianceStatus'] {
  const status = String(business.status).toUpperCase();
  if (status === 'SUSPENDED') return 'Suspended';
  if (business.isVerified) return 'Verified';
  if (business.verificationStatus === 'needs_review' || business.verificationStatus === 'in_progress') return 'Under Review';
  return 'Pending Validation';
}

export function toAdminBusiness(business: AdminApiBusiness): AdminBusiness {
  const mainBranch = business.branches?.find((b) => b.isMainBranch) ?? business.branches?.[0];
  const ownerName = business.ownerName || personName(business.owner);
  return {
    id: business.id,
    name: business.name,
    slug: business.uniqueCode ?? business.id,
    category: business.category?.name ?? NONE,
    tier: business.plan ?? 'No active plan',
    cacRc: business.registrationNumber || NONE,
    tin: NONE,
    cluster: NONE,
    state: place(business.city ?? mainBranch?.city, business.state ?? mainBranch?.state),
    branchCount: business.totalBranches ?? business.branches?.length ?? 0,
    staffCount: 0,
    complianceStatus: complianceStatusOf(business),
    billingPlan: business.plan ? `${business.plan}${business.mrr ? ` (${formatNaira(business.mrr)}/mo)` : ''}` : 'No active plan',
    monthlyGmv: NONE,
    uptime: NONE,
    retention: NONE,
    posCount: 0,
    dailyOrders: 0,
    activeDeals: 0,
    owner: {
      name: ownerName,
      role: 'Owner',
      email: business.owner?.email ?? NONE,
      phone: business.owner?.phone || business.phone || NONE,
      supportEmail: business.officialEmail || NONE,
      escrowAccount: NONE,
      avatarUrl: business.owner?.avatar ?? '',
    },
    hqAddress: business.address || mainBranch?.address || NONE,
    operatingHours: { weekdays: NONE, saturdays: NONE, sundays: NONE },
    branches: (business.branches ?? []).map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: branch.address || NONE,
      manager: NONE,
      geofence: NONE,
      terminals: 0,
      staff: 0,
      type: branch.isMainBranch ? 'Main Hub / HQ' : 'Regional Store',
    })),
    staff: [],
    catalogue: [],
    qrTokens: [],
    raw: business,
  };
}

export function toVerificationItem(business: AdminApiBusiness): VerificationItem {
  const status = complianceStatusOf(business);
  return {
    id: business.id,
    batchId: business.uniqueCode ?? business.id.slice(0, 8).toUpperCase(),
    type: 'kyb',
    title: business.name,
    tag: status === 'Under Review' ? 'Needs review' : 'KYB pending',
    tagColor: status === 'Under Review' ? 'amber' : 'blue',
    description: [business.category?.name, place(business.city, business.state), `submitted ${timeAgo(business.createdAt)}`]
      .filter((part) => part && part !== NONE)
      .join(' • '),
    remainingTime: timeAgo(business.createdAt),
    entityName: business.name,
    docs: business.documents ?? [],
  };
}

export function toClusterNode(cluster: AdminApiCluster): ClusterNode {
  return {
    id: cluster.id,
    name: cluster.name,
    state: place(cluster.city, cluster.state),
    // Search impressions are not tracked per cluster; scans are the cluster QR scan count.
    impressions: 0,
    taps: cluster.scanCount ?? 0,
    conversion: NONE,
    activeMerchants: cluster.branchCount ?? 0,
    posCount: 0,
    status: cluster.isActive ? 'Healthy' : 'Warning',
  };
}

export function toAdminCustomer(user: AdminApiUser): AdminCustomer {
  const name = personName(user);
  const status: AdminCustomer['status'] =
    user.status === 'Suspended' ? 'Suspended' : user.status === 'Active' ? 'Active' : 'Dormant';
  return {
    id: user.id,
    code: user.id.slice(0, 8).toUpperCase(),
    name,
    initials: initialsOf(name),
    email: user.email ?? NONE,
    phone: user.phone || NONE,
    cluster: NONE,
    status,
    tier: user.role,
    memberSince: formatDate(user.createdAt),
    activeDays: 0,
    devicePlatform: NONE,
    restrictionStatus: status === 'Suspended' ? 'Suspended' : 'None',
    authRail: user.authProvider === 'GOOGLE' ? 'Google sign-in' : 'Email + PIN',
    tapsRecorded: 0,
    lifetimeValue: NONE,
    purchasesCount: 0,
    savedPlaces: [],
    claimedDeals: [],
    activityHistory: [],
    savedPlacesCount: 0,
    savedDealsCount: 0,
    lastActive: user.lastLoginAt ? timeAgo(user.lastLoginAt) : NONE,
  };
}
