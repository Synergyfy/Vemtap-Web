import { ApiError, api } from './api/client';

const ignoreMissingAccountEndpoint = <TResponse>(error: unknown, fallback: TResponse): TResponse => {
  if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
    return fallback;
  }

  throw error;
};

export interface AccountProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface AccountPreferencePayload {
  [key: string]: unknown;
}

export const accountService = {
  getMe: async () => {
    try {
      return await api.get<Record<string, unknown>>('/users/profile');
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, {} as Record<string, unknown>);
    }
  },

  updateProfile: async (payload: AccountProfilePayload) => {
    try {
      return await api.patch<Record<string, unknown>>('/users/profile', payload);
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, {} as Record<string, unknown>);
    }
  },

  updatePreferences: async (payload: AccountPreferencePayload) => {
    try {
      return await api.patch<Record<string, unknown>>('/users/profile', payload);
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, {} as Record<string, unknown>);
    }
  },

  getSecurity: async () => {
    try {
      const linkedDevices = await api.get<Record<string, unknown> | unknown[]>('/users/linked-devices');
      if (linkedDevices && typeof linkedDevices === 'object' && !Array.isArray(linkedDevices)) {
        return linkedDevices;
      }
      return { status: 'Protected', devices: linkedDevices };
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { status: 'Protected' } as Record<string, unknown>);
    }
  },

  updateSecurity: async (payload: Record<string, unknown>) => {
    try {
      return await api.patch<Record<string, unknown>>('/users/profile', payload);
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, {} as Record<string, unknown>);
    }
  },

  /** `POST /users/me/deletion-request` — anonymises and closes the account; every token stops working. */
  deleteAccount: (payload: { reasonId?: string; feedback?: string }) =>
    api.post<AccountDeletionResponse>('/users/me/deletion-request', payload),
};

export interface AccountDeletionResponse {
  id: string;
  status: 'completed';
  submittedAt: string;
  completedAt: string;
  retainedNote: string;
}
