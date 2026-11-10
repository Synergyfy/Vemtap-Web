import { api } from './api/client';

/** Platform admin endpoints (role `Admin` or `SUPER_ADMIN`). Shapes follow the Nest handlers. */

export interface AdminPageMeta {
  total: number;
  page: number;
  lastPage?: number;
  limit?: number;
}

export interface AdminPage<T> {
  data: T[];
  meta: AdminPageMeta;
}

export interface AdminApiUserRef {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface AdminApiBranch {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  isMainBranch?: boolean;
  clusterId?: string | null;
}

export interface AdminApiBusiness {
  id: string;
  name: string;
  uniqueCode?: string | null;
  /** Upper-cased by the list endpoints: `ACTIVE` | `PENDING` | `SUSPENDED`. */
  status: string;
  isVerified: boolean;
  verificationStatus?: string | null;
  registrationNumber?: string | null;
  officialEmail?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  openingHours?: Record<string, unknown> | null;
  documents?: string[] | null;
  suspensionReason?: string | null;
  createdAt: string;
  joinDate?: string | null;
  owner?: AdminApiUserRef | null;
  ownerName?: string | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  branches?: AdminApiBranch[];
  totalBranches?: number;
  plan?: string | null;
  mrr?: number;
  renewalDate?: string | null;
}

export interface AdminBusinessListStats {
  total?: number;
  active: number;
  pending: number;
  suspended: number;
  approvedToday: number;
  avgWaitTime: string;
}

export interface AdminPendingStats {
  totalPending: number;
  verifiedToday: number;
  avgWaitTime: string;
}

export interface AdminApiUser {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  authProvider?: string | null;
}

export interface AdminApiCluster {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  uniqueCode: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number | null;
  isActive: boolean;
  qrIsActive: boolean;
  branchCount: number;
  activeOfferCount: number;
  scanCount: number;
  createdAt: string;
}

export interface AdminClusterDetail extends Omit<AdminApiCluster, 'branchCount' | 'activeOfferCount'> {
  qrUrl?: string | null;
  parent?: { id: string; name: string; type: string } | null;
  branches: Array<{
    id: string;
    name: string;
    uniqueCode: string | null;
    username: string | null;
    logoUrl: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    isActive: boolean;
  }>;
}

export interface AdminClusterInput {
  name?: string;
  type?: string;
  parentId?: string;
  state?: string;
  city?: string;
  area?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  isActive?: boolean;
  qrIsActive?: boolean;
}

export interface AdminApiDeal {
  id: string;
  name: string;
  description: string | null;
  mainImage: string | null;
  status: 'active' | 'inactive' | 'expired';
  pricing: {
    pricingType: string;
    originalPrice: number;
    dealPrice: number;
    discount: number;
    discountValue: number | null;
    fixedPrice: number | null;
  };
  dates: { startDate: string | null; endDate: string | null; createdAt: string };
  claimsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  business: { id: string; name: string };
  branch: { id: string; name: string };
  subscriptionPlan: { id: string; name: string; isFree: boolean };
}

export interface AdminDealStats {
  totalDeals: number;
  activeDeals: number;
  featuredDeals: number;
  expiredDeals: number;
}

export interface AdminApiSubscription {
  id: string;
  business: string;
  businessId: string;
  owner: string;
  plan: string;
  status: 'active' | 'canceled' | 'expired' | 'trial' | string;
  /** `YYYY-MM-DD` or `N/A`. */
  renewal: string;
  /** Pre-formatted by the API: `₦45,000`, `Free` or `N/A`. */
  amount: string;
}

/** A subscription plan as `GET /plans` returns it (decimals may arrive as strings). */
export interface AdminApiPlan {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number | string;
  quarterlyPrice?: number | string;
  yearlyPrice: number | string;
  currency?: string;
  isFree?: boolean;
  isActive?: boolean;
  isPopular?: boolean;
  trialDurationDays?: number | null;
  features?: unknown[] | null;
  branchLimit?: number | null;
  teamMembersLimit?: number | null;
  maxCatalogueItems?: number | null;
  posTerminalLimit?: number | null;
  smsCredits?: number | null;
  emailCredits?: number | null;
  whatsappCredits?: number | null;
}

export interface AdminTicketUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}

export interface AdminSupportTicket {
  id: string;
  userId: string | null;
  user: AdminTicketUser | null;
  guestName: string | null;
  guestEmail: string | null;
  subject: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled' | string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent' | string;
  type: 'Chat' | 'Ticket' | string;
  channel: string | null;
  assignedToId: string | null;
  assignedTo: AdminTicketUser | null;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{ id: string; senderId: string | null; sender: AdminTicketUser | null; message: string; createdAt: string }>;
}

export interface AdminAuditLog {
  id: string;
  actorId: string | null;
  actor: AdminTicketUser | null;
  businessId: string | null;
  business: { id: string; name: string } | null;
  branchId: string | null;
  branch: { id: string; name: string } | null;
  module: string;
  method: string;
  endpoint: string;
  payload: Record<string, unknown> | null;
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  impersonationTokenId: string | null;
  createdAt: string;
}

export interface AdminBroadcast {
  id: string;
  senderId: string | null;
  sender: AdminTicketUser | null;
  title: string;
  message: string;
  targetAudience: 'ALL' | 'BUSINESSES' | 'CUSTOMERS' | 'AGENTS' | string;
  type: string;
  actionUrl: string | null;
  channels: string[];
  totalRecipients: number;
  pushRecipients: number;
  status: 'SENT' | 'FAILED' | 'PROCESSING' | string;
  createdAt: string;
}

export interface AdminBroadcastInput {
  title: string;
  message: string;
  targetAudience: 'ALL' | 'BUSINESSES' | 'CUSTOMERS' | 'AGENTS';
  actionUrl?: string;
  sendPush?: boolean;
  sendInApp?: boolean;
}

/** `/discovery/admin/sponsored` row (money may arrive as decimal strings). */
export interface AdminSponsoredCampaign {
  id: string;
  business: string;
  name: string;
  radius: string | null;
  budget: number | string;
  spent: number | string;
  duration: string | null;
  status: 'Draft' | 'Active' | 'Ended' | 'Pending' | 'Paused' | string;
  impressions: number;
  clicks: number;
  conversions: number;
}

/** The platform parameters the admin Platform Settings page edits (part of `/admin/settings`). */
export interface AdminPlatformParameters {
  platformCurrencySymbol: string;
  platformVatRate: number;
  withholdingTaxRate: number;
  defaultPosTakeRate: number;
  escrowHoldingHours: number;
  defaultGeofenceRadiusMeters: number;
  maxClustersPerMerchant: number;
  nfcHeartbeatIntervalSec: number;
  maintenanceMode: boolean;
  strictKybGate: boolean;
  dualAuthorizerEscrow: boolean;
  autoDunningActive: boolean;
  smsGatewayFallback: boolean;
  realtimeTelemetryRateLimit: boolean;
}

export interface AdminSummary {
  stats: Array<{ label: string; value: number }>;
}

export interface AdminBusinessSummary {
  totalActiveBusiness: number;
  totalPendingBusiness: number;
  totalSuspendedBusiness: number;
  totalPlatformUsers: number;
}

export interface AdminSystemHealth {
  status: string;
  metrics?: { cpu: number; memory: number; disk: number; uptime: number };
  services?: Array<{ name: string; status: string; latency?: string }>;
  timestamp?: string;
}

export interface AdminBusinessStats {
  businessName: string;
  totalVisitors: number;
  totalTaps: number;
  totalBranches: number;
  recentActivity: Array<{ id: string; visitorName: string; branchName: string; status: string; timestamp: string }>;
}

export interface AdminVerificationCheck {
  id: string;
  kind: 'identity' | 'business' | string;
  idType: string | null;
  status: 'pending' | 'verified' | 'needs_review' | 'failed' | string;
  maskedId: string | null;
  recordName: string | null;
  reasons: string[];
  faceMatch: unknown;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  documentUrls: string[];
  note: string | null;
}

export interface AdminVerificationDetail {
  businessId: string;
  businessName: string;
  status: string;
  isVerified: boolean;
  verifiedAt: string | null;
  checks: AdminVerificationCheck[];
}

/** `/discovery/admin/customers/:id` — only `stats.totalVisits` and `activityTimeline` are real data. */
export interface AdminCustomerActivity {
  stats?: { totalVisits: number };
  activityTimeline: Array<{ action: string; via: string; time: string; val: number | null }>;
}

export interface AdminPlatformSubcategory {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string;
}

export interface AdminPlatformCategory {
  id: string;
  name: string;
  description?: string | null;
  subcategories?: AdminPlatformSubcategory[];
  createdAt?: string;
}

export interface AdminSubscriptionStats {
  activeSubscriptions: number;
  activeTrials: number;
  expiringSoon: number;
  pastDue: number;
}

export interface AdminDeviceStats {
  totalDevices: number;
  activeNow: number;
  totalScans: number;
  offline: number;
}

type Query = Record<string, string | number | boolean | undefined>;

export const adminService = {
  summary: () => api.get<AdminSummary>('/analytics/admin/summary'),
  businessSummary: () => api.get<AdminBusinessSummary>('/analytics/admin/business-summary'),
  systemHealth: () => api.get<AdminSystemHealth>('/admin/system/health'),

  /** Every plan, active or not. */
  plans: () => api.get<AdminApiPlan[]>('/plans'),
  subscriptions: () => api.get<AdminApiSubscription[]>('/subscriptions/admin'),
  subscriptionStats: () => api.get<AdminSubscriptionStats>('/subscriptions/admin/stats'),
  deviceStats: () => api.get<AdminDeviceStats>('/devices/admin/stats'),

  businesses: (params: Query = {}) =>
    api.get<AdminPage<AdminApiBusiness> & { stats: AdminBusinessListStats }>('/businesses/admin', { params }),
  pendingVerification: (params: Query = {}) =>
    api.get<AdminPage<AdminApiBusiness> & { stats: AdminPendingStats }>('/businesses/admin/pending-verification', { params }),
  businessStats: (id: string) => api.get<AdminBusinessStats>(`/businesses/admin/${id}/stats`),
  approveBusiness: (id: string) => api.patch<AdminApiBusiness>(`/businesses/admin/${id}/approve`),
  rejectBusiness: (id: string) => api.patch<AdminApiBusiness>(`/businesses/admin/${id}/reject`),
  suspendBusiness: (id: string, reason: string) => api.patch<AdminApiBusiness>(`/businesses/admin/${id}/suspend`, { reason }),
  reactivateBusiness: (id: string) => api.patch<AdminApiBusiness>(`/businesses/admin/${id}/reactivate`),
  verifyBusiness: (id: string) => api.patch<AdminApiBusiness>(`/businesses/admin/${id}/verify`),

  verificationDetail: (businessId: string) => api.get<AdminVerificationDetail>(`/verification/admin/${businessId}`),
  approveVerification: (businessId: string, note?: string) =>
    api.post<unknown>(`/verification/admin/${businessId}/approve`, note ? { note } : {}),
  rejectVerification: (businessId: string, note?: string) =>
    api.post<unknown>(`/verification/admin/${businessId}/reject`, note ? { note } : {}),

  /** Business categories (public list, admin-only writes). */
  categories: (params: Query = {}) =>
    api.get<{ items: AdminPlatformCategory[]; meta: AdminPageMeta & { totalPages?: number } }>('/categories', { params }),
  createCategory: (input: { name: string; description: string }) => api.post<AdminPlatformCategory>('/admin/categories', input),
  updateCategory: (id: string, input: { name?: string; description?: string }) =>
    api.patch<AdminPlatformCategory>(`/admin/categories/${id}`, input),
  deleteCategory: (id: string) => api.del<unknown>(`/admin/categories/${id}`),
  createSubcategory: (input: { name: string; description?: string; categoryId: string }) =>
    api.post<AdminPlatformSubcategory>('/admin/categories/subcategories', input),
  updateSubcategory: (id: string, input: { name?: string; description?: string }) =>
    api.patch<AdminPlatformSubcategory>(`/admin/categories/subcategories/${id}`, input),
  deleteSubcategory: (id: string) => api.del<unknown>(`/admin/categories/subcategories/${id}`),

  deals: (params: Query = {}) =>
    api.get<{ data: AdminApiDeal[]; meta: AdminPageMeta & { totalPages?: number } }>('/admin/deals', { params }),
  dealStats: () => api.get<AdminDealStats>('/admin/deals/stats'),
  toggleDealFeatured: (id: string) => api.patch<unknown>(`/admin/deals/${id}/featured`),

  tickets: (params: Query = {}) => api.get<AdminPage<AdminSupportTicket>>('/support/admin/tickets', { params }),
  ticket: (id: string) => api.get<AdminSupportTicket>(`/support/admin/tickets/${id}`),
  setTicketStatus: (id: string, status: string) => api.post<AdminSupportTicket>(`/support/admin/tickets/${id}/status`, { status }),
  replyToTicket: (id: string, message: string) => api.post<unknown>(`/support/admin/tickets/${id}/message`, { message }),

  auditLogs: (params: Query = {}) => api.get<AdminPage<AdminAuditLog>>('/administration/audit-logs', { params }),

  broadcasts: (params: Query = {}) =>
    api.get<{ items: AdminBroadcast[]; meta: AdminPageMeta & { totalPages?: number } }>('/notifications/admin/broadcasts', { params }),
  sendBroadcast: (input: AdminBroadcastInput) => api.post<unknown>('/notifications/admin/broadcast', input),

  sponsoredCampaigns: (params: Query = {}) =>
    api.get<{ data: AdminSponsoredCampaign[]; meta: AdminPageMeta }>('/discovery/admin/sponsored', { params }),

  platformSettings: () => api.get<AdminPlatformParameters & { updatedAt?: string }>('/admin/settings'),
  updatePlatformSettings: (input: Partial<AdminPlatformParameters>) =>
    api.patch<AdminPlatformParameters & { updatedAt?: string }>('/admin/settings', input),

  users: (params: Query = {}) => api.get<AdminPage<AdminApiUser>>('/users/admin', { params }),
  customerActivity: (id: string) => api.get<AdminCustomerActivity>(`/discovery/admin/customers/${id}`),
  suspendUser: (id: string) => api.post<AdminApiUser>(`/users/admin/${id}/suspend`),
  activateUser: (id: string) => api.post<AdminApiUser>(`/users/admin/${id}/activate`),

  clusters: (params: Query = {}) => api.get<AdminPage<AdminApiCluster>>('/admin/clusters', { params }),
  clusterDetail: (id: string) => api.get<AdminClusterDetail>(`/admin/clusters/${id}`),
  createCluster: (input: AdminClusterInput & { name: string; latitude: number; longitude: number }) =>
    api.post<AdminApiCluster>('/admin/clusters', input),
  updateCluster: (id: string, input: AdminClusterInput) => api.patch<AdminApiCluster>(`/admin/clusters/${id}`, input),
  /** Assigns branches without a cluster to the nearest covering cluster. */
  autoAssignClusters: () =>
    api.post<{ assigned?: number; reassigned?: number; enqueued?: boolean }>('/admin/clusters/auto-assign', { scope: 'unassigned' }),
};
