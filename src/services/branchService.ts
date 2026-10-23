import { api } from './api/client';

/** `GET /branches` row — only the fields the web uses are typed. */
export interface Branch {
  id: string;
  name: string;
  uniqueCode?: string | null;
  username?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  phone?: string | null;
  officialEmail?: string | null;
  whatsappNumber?: string | null;
  isActive?: boolean | null;
  isMainBranch?: boolean | null;
  logoUrl?: string | null;
  about?: string | null;
  businessHours?: Record<string, unknown> | null;
  createdAt?: string;
}

/** Mirrors `CreateBranchDto` (the backend rejects unknown keys). */
export interface CreateBranchInput {
  name: string;
  username?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  officialEmail?: string;
}

/** Mirrors `UpdateBranchDto`; `isActive: true` reactivates a paused location. */
export interface UpdateBranchInput extends Partial<CreateBranchInput> {
  logoUrl?: string;
  about?: string;
  latitude?: number;
  longitude?: number;
  isMainBranch?: boolean;
  isActive?: boolean;
}

export const branchService = {
  list: () => api.get<Branch[]>('/branches'),
  get: (id: string) => api.get<Branch>(`/branches/${id}`),
  create: (input: CreateBranchInput) => api.post<Branch>('/branches', input),
  update: (id: string, input: UpdateBranchInput) => api.patch<Branch>(`/branches/${id}`, input),
};
