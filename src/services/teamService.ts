import { api } from './api/client';

/** `GET /users/team` row (a `User` entity; only rendered fields typed). */
export interface TeamMember {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  avatar?: string | null;
  /** Free-text display tag, e.g. "Cashier". */
  roleTag?: string | null;
  role?: string | null;
  status?: string | null;
  permissions?: string[] | null;
  branchId?: string | null;
  isOnline?: boolean | null;
  lastActive?: string | null;
  createdAt?: string | null;
}

/**
 * Mirrors `InviteStaffDto` (forbidNonWhitelisted). `role` is free text: the
 * backend maps `manager` → MANAGER and anything else → STAFF. `branchId` is
 * required in practice — an owner's own record usually has no branch.
 */
export interface InviteStaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  jobTitle?: string;
  permissions?: string[];
  branchId: string;
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  role?: string;
  jobTitle?: string;
  permissions?: string[];
}

/** Write routes look rows up by `{ id, branchId }`, so pass the member's own branch. */
export const teamService = {
  list: (query: { branchId?: string; allBranches?: boolean } = {}) =>
    api
      .get<TeamMember[] | { data: TeamMember[] }>('/users/team', { params: { ...query } })
      .then((res) => (Array.isArray(res) ? res : res.data)),
  invite: (input: InviteStaffInput) => api.post<TeamMember>('/users/team/invite', input),
  update: (id: string, branchId: string | undefined, input: UpdateStaffInput) =>
    api.patch<TeamMember>(`/users/team/${id}`, input, { params: { branchId } }),
  remove: (id: string, branchId: string | undefined) => api.del<void>(`/users/team/${id}`, { params: { branchId } }),
  resendInvite: (id: string, branchId: string | undefined) =>
    api.post<{ message?: string }>(`/users/team/${id}/resend-invite`, undefined, { params: { branchId } }),
};
