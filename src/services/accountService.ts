import { ApiError, api } from './api/client';

const ignoreMissingAccountEndpoint = <TResponse>(error: unknown, fallback: TResponse): TResponse => {
  if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
    return fallback;
  }

  throw error;
};

const unwrapEnvelope = <TValue>(payload: TValue): TValue => {
  if (!payload || typeof payload !== 'object') return payload;

  const record = payload as Record<string, unknown>;
  if ('data' in record && record.data !== undefined) return record.data as TValue;
  if ('result' in record && record.result !== undefined) return record.result as TValue;
  if ('payload' in record && record.payload !== undefined) return record.payload as TValue;
  return payload;
};

const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  for (const key of ['data', 'items', 'results', 'rows', 'list']) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
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

export interface SavedItemRecord {
  id?: string;
  itemId?: string;
  offerId?: string;
  businessId?: string;
  serviceId?: string;
  title?: string;
  name?: string;
  type?: string;
  category?: string;
  savedAt?: string;
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
      return await api.patch<Record<string, unknown>>('/notifications/preferences', payload);
    } catch (error) {
      try {
        return await api.patch<Record<string, unknown>>('/users/profile', payload);
      } catch (fallbackError) {
        return ignoreMissingAccountEndpoint(fallbackError, {} as Record<string, unknown>);
      }
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
      try {
        const securityState = await api.get<Record<string, unknown>>('/users/security');
        return securityState;
      } catch {
        return ignoreMissingAccountEndpoint(error, { status: 'Protected' } as Record<string, unknown>);
      }
    }
  },

  updateSecurity: async (payload: Record<string, unknown>) => {
    try {
      return await api.patch<Record<string, unknown>>('/users/security', payload);
    } catch (error) {
      try {
        return await api.patch<Record<string, unknown>>('/users/profile', payload);
      } catch (fallbackError) {
        return ignoreMissingAccountEndpoint(fallbackError, {} as Record<string, unknown>);
      }
    }
  },

  deleteAccount: async () => {
    try {
      return await api.del<Record<string, unknown>>('/users/profile');
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, {} as Record<string, unknown>);
    }
  },

  getSaved: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/saved', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { items: [] } as Record<string, unknown>);
    }
  },

  getSavedDeals: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return extractArray(unwrapEnvelope(await api.get<unknown>('/me/saved/deals', { params })));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, [] as unknown[]);
    }
  },

  getSavedBusinesses: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return extractArray(unwrapEnvelope(await api.get<unknown>('/me/saved/businesses', { params })));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, [] as unknown[]);
    }
  },

  getSavedServices: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return extractArray(unwrapEnvelope(await api.get<unknown>('/me/saved/services', { params })));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, [] as unknown[]);
    }
  },

  toggleBusinessSave: async (id: string) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`/businesses/${encodeURIComponent(id)}/save`));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { saved: false } as Record<string, unknown>);
    }
  },

  getBusinessSaveStatus: async (id: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/businesses/${encodeURIComponent(id)}/save-status`));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { saved: false } as Record<string, unknown>);
    }
  },

  toggleServiceSave: async (id: string) => {
    try {
      return unwrapEnvelope(await api.post<unknown>(`/services/${encodeURIComponent(id)}/save`));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { saved: false } as Record<string, unknown>);
    }
  },

  getServiceSaveStatus: async (id: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/services/${encodeURIComponent(id)}/save-status`));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { saved: false } as Record<string, unknown>);
    }
  },

  getSavings: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/savings', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { total: 0, items: [] } as Record<string, unknown>);
    }
  },

  getSavingsCategories: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/savings/categories', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { categories: [] } as Record<string, unknown>);
    }
  },

  exportSavings: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return await api.get<unknown>('/me/savings/export', { params });
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, null as unknown);
    }
  },

  getLoyaltyWallet: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/loyalty/me/wallet', { params }));
    } catch (error) {
      try {
        return unwrapEnvelope(await api.get<unknown>('/loyalty/points/balance', { params }));
      } catch (fallbackError) {
        return ignoreMissingAccountEndpoint(fallbackError, { balance: 0 } as Record<string, unknown>);
      }
    }
  },

  getLoyaltyRedemptions: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/loyalty/me/redemptions', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { items: [] } as Record<string, unknown>);
    }
  },

  getLoyaltyBalance: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/loyalty/points/balance', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { balance: 0 } as Record<string, unknown>);
    }
  },

  getLoyaltyTier: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/loyalty/points/tier', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { tier: 'Bronze' } as Record<string, unknown>);
    }
  },

  getLoyaltyLogs: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/loyalty/points/logs', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { items: [] } as Record<string, unknown>);
    }
  },

  getPublicLoyaltyRewards: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/public/loyalty/rewards', { params }));
    } catch (error) {
      try {
        return unwrapEnvelope(await api.get<unknown>('/loyalty/rewards', { params }));
      } catch (fallbackError) {
        return ignoreMissingAccountEndpoint(fallbackError, { rewards: [] } as Record<string, unknown>);
      }
    }
  },

  getActivity: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/activity', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { items: [] } as Record<string, unknown>);
    }
  },

  getActivitySummary: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/activity/summary', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { total: 0 } as Record<string, unknown>);
    }
  },

  getMyOrders: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/catalogue/orders/my-orders', { params }));
    } catch (error) {
      try {
        return unwrapEnvelope(await api.get<unknown>('/orders/my', { params }));
      } catch (fallbackError) {
        return ignoreMissingAccountEndpoint(fallbackError, { items: [] } as Record<string, unknown>);
      }
    }
  },

  getMyBookings: async (params?: Record<string, string | number | boolean | undefined>) => {
    try {
      return unwrapEnvelope(await api.get<unknown>('/me/bookings', { params }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { items: [] } as Record<string, unknown>);
    }
  },

  getOrderReceipt: async (id: string) => {
    try {
      return unwrapEnvelope(await api.get<unknown>(`/catalogue/orders/my-orders/${encodeURIComponent(id)}/receipt`));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { receipt: null } as Record<string, unknown>);
    }
  },

  cancelOrder: async (id: string, payload?: Record<string, unknown>) => {
    try {
      return unwrapEnvelope(await api.patch<unknown>(`/catalogue/orders/${encodeURIComponent(id)}/status`, payload ?? { status: 'cancelled' }));
    } catch (error) {
      return ignoreMissingAccountEndpoint(error, { id, status: 'cancelled' } as Record<string, unknown>);
    }
  },
};
