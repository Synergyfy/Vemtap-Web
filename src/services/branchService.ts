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
  /** Manager contact and district from the add-branch form. */
  managerName?: string | null;
  managerEmail?: string | null;
  managerPhone?: string | null;
  district?: string | null;
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
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  district?: string;
}

/** Mirrors `UpdateBranchDto`; `isActive: true` reactivates a paused location. */
export interface UpdateBranchInput extends Partial<CreateBranchInput> {
  logoUrl?: string;
  about?: string;
  latitude?: number;
  longitude?: number;
  isMainBranch?: boolean;
  isActive?: boolean;
  /** Per-day `{ open: 'HH:mm', close: 'HH:mm' }` or `{ closed: true }`, keyed by weekday. */
  businessHours?: Record<string, { open?: string; close?: string; closed?: boolean }>;
}

export const branchService = {
  list: () => api.get<Branch[]>('/branches'),
  get: (id: string) => api.get<Branch>(`/branches/${id}`),
  create: (input: CreateBranchInput) => api.post<Branch>('/branches', input),
  update: (id: string, input: UpdateBranchInput) => api.patch<Branch>(`/branches/${id}`, input),
};
