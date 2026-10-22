import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { SegmentCriteria, SegmentSummary } from './types';

export const segmentsService = {
  list: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Array<SegmentSummary>>(API_ENDPOINTS.segments.root, { params }),

  create: async (payload: { name: string; type?: 'static' | 'dynamic'; criteria?: SegmentCriteria }) =>
    api.post<SegmentSummary>(API_ENDPOINTS.segments.root, payload),

  update: async (id: string, payload: Partial<{ name: string; type?: 'static' | 'dynamic'; criteria?: SegmentCriteria }>) =>
    api.patch<SegmentSummary>(API_ENDPOINTS.segments.byId(id), payload),

  preview: async (body: { criteria: SegmentCriteria; branchId?: string }) =>
    api.post<{ size: number; reachableByPush?: number; reachableBySms?: number }>(API_ENDPOINTS.segments.preview, body),

  getCriteriaOptions: async () =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.segments.criteriaOptions),

  getInsights: async (id: string) =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.segments.insights(id)),
};
