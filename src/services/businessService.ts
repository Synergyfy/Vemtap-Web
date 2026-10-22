import { api } from './api/client';

export interface ProfileBranch {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  isActive?: boolean | null;
  isMainBranch?: boolean | null;
}

/** `GET /businesses/my-business` — the signed-in owner's business with its branches. */
export interface MyBusiness {
  id: string;
  name: string;
  isVerified?: boolean | null;
  logoUrl?: string | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  socials?: Record<string, string> | null;
  officialEmail?: string | null;
  website?: string | null;
  uniqueCode?: string | null;
  description?: string | null;
  verificationStatus?: string | null;
  isVisible?: boolean | null;
  category?: { id?: string; name?: string | null } | null;
  subcategory?: { id?: string; name?: string | null } | null;
  amenities?: string[] | null;
  branches?: ProfileBranch[] | null;
}

export const businessService = {
  myBusiness: () => api.get<MyBusiness>('/businesses/my-business'),
  updateMyBusiness: (updates: Partial<MyBusiness>) => api.patch<MyBusiness>('/businesses/my-business', updates),
  /** Background job that resolves lat/lng from the saved address. */
  enqueueGeocode: () => api.post<{ queued: boolean }>('/businesses/my-business/enqueue-geocode'),
};
