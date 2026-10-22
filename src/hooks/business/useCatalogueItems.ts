import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../../services/api/client';
import { catalogueItemsService, type CatalogueItemInput, type CatalogueItemUpdate } from '../../services/catalogueItemsService';
import { useBusinessBranch } from '../../context/BusinessBranchContext';

export const catalogueItemKeys = {
  all: ['catalogue-items'] as const,
  list: (branchId: string | undefined, itemType?: string) => ['catalogue-items', branchId ?? 'all', itemType ?? 'any'] as const,
};

/** Items at the active branch; disabled in demo mode. */
export function useCatalogueItems(itemType?: 'product' | 'service') {
  const { activeBranchId } = useBusinessBranch();
  return useQuery({
    queryKey: catalogueItemKeys.list(activeBranchId, itemType),
    queryFn: () => catalogueItemsService.list({ branchId: activeBranchId, itemType, limit: 100 }),
    enabled: hasApiConfig() && Boolean(activeBranchId),
  });
}

export function useCatalogueItemMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all });
  return {
    create: useMutation({ mutationFn: (input: CatalogueItemInput) => catalogueItemsService.create(input), onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: CatalogueItemUpdate }) => catalogueItemsService.update(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: (id: string) => catalogueItemsService.remove(id), onSuccess: refresh }),
  };
}
