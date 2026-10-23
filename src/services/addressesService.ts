import { api } from './api/client';

/** A customer's saved place (`/me/addresses`, CUSTOMER only). */
export interface SavedAddress {
  id: string;
  label: string;
  line: string;
  area: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  line: string;
  area?: string;
  notes?: string;
  isDefault?: boolean;
}

export const addressesService = {
  list: () => api.get<{ data: SavedAddress[]; total: number }>('/me/addresses').then((res) => res.data ?? []),
  create: (input: AddressInput) => api.post<SavedAddress>('/me/addresses', input),
  update: (id: string, input: Partial<AddressInput>) => api.patch<SavedAddress>(`/me/addresses/${id}`, input),
  setDefault: (id: string) => api.post<SavedAddress>(`/me/addresses/${id}/default`),
  remove: (id: string) => api.del<void>(`/me/addresses/${id}`),
};
