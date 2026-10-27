import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { segmentsService } from '../../services/segmentsService';
import type { SegmentCriteria, SegmentSummary } from '../../services/types';
import type { CustomerSegment } from '../../services/businessCustomersService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const segmentKeys = { all: ['segments'] as const };

/** A segment to show insights for: a saved one by id, or a built-in directory segment. */
export type SegmentTarget = { id?: string; systemKey?: CustomerSegment };

export interface SegmentCriteriaOptions {
  deals: { id: string; name: string }[];
  menuItems: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  districts: { id: string; name: string }[];
}

/** The business's saved segments at the active branch. */
export function useSegments() {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...segmentKeys.all, 'list', activeBranchId ?? 'all'],
    queryFn: () => segmentsService.list({ branchId: activeBranchId }),
    enabled: hasApiConfig(),
  });
}

/** Deals, menu items, branches and districts the rule builder can pick from. */
export function useSegmentCriteriaOptions() {
  return useQuery({
    queryKey: [...segmentKeys.all, 'criteria-options'],
    queryFn: () => segmentsService.getCriteriaOptions() as Promise<unknown> as Promise<SegmentCriteriaOptions>,
    enabled: hasApiConfig(),
    staleTime: 60_000,
  });
}

/** Live size and channel reach for a rule set, re-checked shortly after it stops changing. */
export function useSegmentPreview(criteria: SegmentCriteria, enabled = true) {
  const key = JSON.stringify(criteria);
  const [settled, setSettled] = useState(key);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(key), 400);
    return () => window.clearTimeout(timer);
  }, [key]);
  return useQuery({
    queryKey: [...segmentKeys.all, 'preview', settled],
    queryFn: () => segmentsService.preview({ criteria: JSON.parse(settled) as SegmentCriteria }),
    enabled: hasApiConfig() && enabled,
    placeholderData: (previous) => previous,
  });
}

/** Spend, branch mix, favourites and sample patrons of a saved or built-in segment. */
export function useSegmentInsights(target: SegmentTarget | null | undefined) {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: [...segmentKeys.all, 'insights', target?.id ?? target?.systemKey ?? null, activeBranchId ?? 'all'],
    queryFn: () =>
      target?.id
        ? segmentsService.getInsights(target.id, activeBranchId)
        : segmentsService.getSystemInsights(target?.systemKey as CustomerSegment),
    enabled: hasApiConfig() && Boolean(target?.id || target?.systemKey),
  });
}

export function useSegmentMutations() {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: segmentKeys.all });
  return {
    create: useMutation({
      mutationFn: (input: { name: string; description?: string; criteria: SegmentCriteria }) =>
        segmentsService.create({ ...input, branchId: activeBranchId, type: 'dynamic' }),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, ...input }: { id: string; name: string; description?: string; criteria: SegmentCriteria }) =>
        segmentsService.update(id, input, activeBranchId),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (segment: Pick<SegmentSummary, 'id'>) => segmentsService.remove(segment.id, activeBranchId),
      onSuccess: refresh,
    }),
  };
}
