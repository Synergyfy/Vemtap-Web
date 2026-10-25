import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { BoostGoalOption } from './types';

export const boostsService = {
  list: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Array<Record<string, unknown>>>(API_ENDPOINTS.boosts.root, { params }),

  create: async (payload: Record<string, unknown>) => api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.root, payload),

  getById: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.boosts.byId(id)),

  update: async (id: string, payload: Record<string, unknown>) =>
    api.patch<Record<string, unknown>>(API_ENDPOINTS.boosts.byId(id), payload),

  launch: async (id: string, payload?: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.launch(id), payload ?? {}),

  pause: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.pause(id), {}),

  resume: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.resume(id), {}),

  end: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.end(id), {}),

  stats: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.boosts.stats(id)),

  getOptions: async () => api.get<Array<BoostGoalOption>>(API_ENDPOINTS.boosts.options),

  forecast: async (body: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.boosts.forecast, body),
};
