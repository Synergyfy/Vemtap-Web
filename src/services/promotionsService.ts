import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { PromotionBody } from './types';

export const promotionsService = {
  list: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Array<Record<string, unknown>>>(API_ENDPOINTS.promotions.root, { params }),

  summary: async () => api.get<Record<string, unknown>>(API_ENDPOINTS.promotions.summary),

  create: async (payload: PromotionBody) => api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.root, payload),

  getById: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.promotions.byId(id)),

  update: async (id: string, payload: Partial<PromotionBody>) =>
    api.patch<Record<string, unknown>>(API_ENDPOINTS.promotions.byId(id), payload),

  launch: async (id: string, payload?: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.launch(id), payload ?? {}),

  pause: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.pause(id), {}),

  resume: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.resume(id), {}),

  end: async (id: string) => api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.end(id), {}),

  stats: async (id: string) => api.get<Record<string, unknown>>(API_ENDPOINTS.promotions.stats(id)),

  forecast: async (body: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(API_ENDPOINTS.promotions.forecast, body),

  eligibleAssets: async () => api.get<Array<Record<string, unknown>>>(API_ENDPOINTS.promotions.eligibleAssets),
};
