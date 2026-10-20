import { api } from './api/client';

export interface SegmentCriteria {
  recency?: { visitedWithinDays?: number; notVisitedForDays?: number; minVisits?: number; interactedWithinDays?: number };
  spend?: { minTotal?: number; minAverageTicket?: number };
  loyalty?: { minPoints: number };
  location?: { branchIds?: string[] };
}

export interface LiveSegment {
  id: string;
  name: string;
  description?: string | null;
  type: 'static' | 'dynamic';
  size?: number | null;
  criteria?: SegmentCriteria | null;
  branchId?: string | null;
  lastComputedAt?: string | null;
}

export interface SegmentReach {
  size: number;
  reachableByPush: number;
  reachableBySms: number;
  reachableByEmail: number;
}

/** `/segments` — the caller's branch scope (pass `branchId` to narrow it). */
export const liveSegmentsService = {
  list: (branchId?: string) => api.get<LiveSegment[]>('/segments', { params: { branchId } }),
  create: (input: { name: string; description?: string; branchId?: string; type?: 'static' | 'dynamic'; criteria?: SegmentCriteria }) =>
    api.post<LiveSegment>('/segments', input),
  remove: (id: string, branchId?: string) => api.del<unknown>(`/segments/${id}`, { params: { branchId } }),
  preview: (criteria: SegmentCriteria) => api.post<SegmentReach>('/segments/preview', { criteria }),
};
