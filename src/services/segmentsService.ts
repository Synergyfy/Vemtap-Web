import { api } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import type { SegmentCriteria, SegmentInsights, SegmentReach, SegmentSummary } from './types';
import type { CustomerSegment } from './businessCustomersService';

export const segmentsService = {
  list: async (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<Array<SegmentSummary>>(API_ENDPOINTS.segments.root, { params }),

  create: async (payload: { name: string; description?: string; branchId?: string; type?: 'static' | 'dynamic'; criteria?: SegmentCriteria }) =>
    api.post<SegmentSummary>(API_ENDPOINTS.segments.root, payload),

  update: async (
    id: string,
    payload: Partial<{ name: string; description?: string; type?: 'static' | 'dynamic'; criteria?: SegmentCriteria }>,
    branchId?: string,
  ) =>
    api.patch<SegmentSummary>(API_ENDPOINTS.segments.byId(id), payload, { params: { branchId } }),

  remove: async (id: string, branchId?: string) => api.del<unknown>(API_ENDPOINTS.segments.byId(id), { params: { branchId } }),

  preview: async (body: { criteria: SegmentCriteria; branchId?: string }) =>
    api.post<SegmentReach>(API_ENDPOINTS.segments.preview, body),

  getCriteriaOptions: async () =>
    api.get<Record<string, unknown>>(API_ENDPOINTS.segments.criteriaOptions),

  getInsights: async (id: string, branchId?: string) =>
    api.get<SegmentInsights>(API_ENDPOINTS.segments.insights(id), { params: { branchId } }),

  /** Insights for a built-in directory segment (frequent, returning, …). */
  getSystemInsights: async (segment: CustomerSegment) =>
    api.get<SegmentInsights>(`/business-customers/segments/${segment}/insights`),
};
